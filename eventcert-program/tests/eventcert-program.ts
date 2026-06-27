import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { assert } from "chai";

describe("eventcert-program", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const program = anchor.workspace
    .eventcert_program as Program<any>;

  const organizer = provider.wallet.publicKey;

  function eventPda(eventId: bigint) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("event"), organizer.toBuffer(), Buffer.from(eventId.toArrayLike(Buffer, "le", 8))],
      program.programId
    )[0];
  }

  function attendeeRecordPda(eventPk: PublicKey, attendeePk: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("attendee"), eventPk.toBuffer(), attendeePk.toBuffer()],
      program.programId
    )[0];
  }

  function vaultPda(attendeePk: PublicKey) {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), attendeePk.toBuffer()],
      program.programId
    )[0];
  }

  it("initialize_event should succeed", async () => {
    const eventId = new anchor.BN(1);
    const name = "My Event";

    const now = Math.floor(Date.now() / 1000);
    const startTime = new anchor.BN(now - 10);
    const endTime = new anchor.BN(now + 100);

    const [eventAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("event"), organizer.toBuffer(), Buffer.from(eventId.toArrayLike(Buffer, "le", 8))],
      program.programId
    );

    await program.methods
      .initializeEvent(eventId, name, startTime, endTime, 10)
      .accounts({
        organizer: organizer,
        eventAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const acc = await program.account.eventAccount.fetch(eventAccount);
    assert.equal(acc.organizer.toBase58(), organizer.toBase58());
    assert.equal(acc.eventId.toString(), eventId.toString());
    assert.equal(acc.name, name);
  });

  it("check_in_attendee before start should fail with EventNotStarted", async () => {
    const eventId = new anchor.BN(2);
    const name = "Event 2";

    const now = Math.floor(Date.now() / 1000);
    const startTime = new anchor.BN(now + 100);
    const endTime = new anchor.BN(now + 200);

    const [eventAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("event"), organizer.toBuffer(), Buffer.from(eventId.toArrayLike(Buffer, "le", 8))],
      program.programId
    );

    await program.methods
      .initializeEvent(eventId, name, startTime, endTime, 10)
      .accounts({
        organizer,
        eventAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const attendee = Keypair.generate();
    await provider.connection.requestAirdrop(attendee.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL).then(sig => provider.connection.confirmTransaction(sig));
    const [attendeeRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("attendee"), eventAccount.toBuffer(), attendee.publicKey.toBuffer()],
      program.programId
    );
    const [vault] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), attendee.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .checkInAttendee()
        .accounts({
          attendee: attendee.publicKey,
          eventAccount,
          attendeeRecord,
          loyaltyVault: vault,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([attendee])
        .rpc();
      assert.fail("Expected error");
    } catch (e: any) {
      // Anchor error string contains error code name
      const msg = e.toString();
      assert.include(msg, "EventNotStarted");
    }
  });

  it("check_in_attendee after end should fail with EventEnded", async () => {
    const eventId = new anchor.BN(3);
    const name = "Event 3";

    const now = Math.floor(Date.now() / 1000);
    const startTime = new anchor.BN(now - 200);
    const endTime = new anchor.BN(now - 100);

    const [eventAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("event"), organizer.toBuffer(), Buffer.from(eventId.toArrayLike(Buffer, "le", 8))],
      program.programId
    );

    await program.methods
      .initializeEvent(eventId, name, startTime, endTime, 10)
      .accounts({
        organizer,
        eventAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const attendee = Keypair.generate();
    await provider.connection.requestAirdrop(attendee.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL).then(sig => provider.connection.confirmTransaction(sig));
    const [attendeeRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("attendee"), eventAccount.toBuffer(), attendee.publicKey.toBuffer()],
      program.programId
    );
    const [vault] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), attendee.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .checkInAttendee()
        .accounts({
          attendee: attendee.publicKey,
          eventAccount,
          attendeeRecord,
          loyaltyVault: vault,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([attendee])
        .rpc();
      assert.fail("Expected error");
    } catch (e: any) {
      assert.include(e.toString(), "EventEnded");
    }
  });

  it("check_in_attendee when full should fail with EventFull", async () => {
    const eventId = new anchor.BN(4);
    const name = "Event 4";

    const now = Math.floor(Date.now() / 1000);
    const startTime = new anchor.BN(now - 10);
    const endTime = new anchor.BN(now + 100);

    const [eventAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("event"), organizer.toBuffer(), Buffer.from(eventId.toArrayLike(Buffer, "le", 8))],
      program.programId
    );

    await program.methods
      .initializeEvent(eventId, name, startTime, endTime, 1)
      .accounts({
        organizer,
        eventAccount,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const attendee1 = Keypair.generate();
    await provider.connection.requestAirdrop(attendee1.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL).then(sig => provider.connection.confirmTransaction(sig));
    const [attendeeRecord1] = PublicKey.findProgramAddressSync(
      [Buffer.from("attendee"), eventAccount.toBuffer(), attendee1.publicKey.toBuffer()],
      program.programId
    );
    const [vault1] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), attendee1.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .checkInAttendee()
      .accounts({
        attendee: attendee1.publicKey,
        eventAccount,
        attendeeRecord: attendeeRecord1,
        loyaltyVault: vault1,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([attendee1])
      .rpc();

    const attendee2 = Keypair.generate();
    await provider.connection.requestAirdrop(attendee2.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL).then(sig => provider.connection.confirmTransaction(sig));
    const [attendeeRecord2] = PublicKey.findProgramAddressSync(
      [Buffer.from("attendee"), eventAccount.toBuffer(), attendee2.publicKey.toBuffer()],
      program.programId
    );
    const [vault2] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), attendee2.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .checkInAttendee()
        .accounts({
          attendee: attendee2.publicKey,
          eventAccount,
          attendeeRecord: attendeeRecord2,
          loyaltyVault: vault2,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([attendee2])
        .rpc();
      assert.fail("Expected error");
    } catch (e: any) {
      assert.include(e.toString(), "EventFull");
    }
  });

  it("check_in_attendee should create attendee record and increment count", async () => {
    const eventId = new anchor.BN(5);
    const name = "Event 5";

    const now = Math.floor(Date.now() / 1000);
    const startTime = new anchor.BN(now - 10);
    const endTime = new anchor.BN(now + 100);

    const [eventAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("event"), organizer.toBuffer(), Buffer.from(eventId.toArrayLike(Buffer, "le", 8))],
      program.programId
    );

    await program.methods
      .initializeEvent(eventId, name, startTime, endTime, 10)
      .accounts({ organizer, eventAccount, systemProgram: anchor.web3.SystemProgram.programId })
      .rpc();

    const attendee = Keypair.generate();
    await provider.connection.requestAirdrop(attendee.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL).then(sig => provider.connection.confirmTransaction(sig));
    const [attendeeRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("attendee"), eventAccount.toBuffer(), attendee.publicKey.toBuffer()],
      program.programId
    );
    const [vault] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), attendee.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .checkInAttendee()
      .accounts({
        attendee: attendee.publicKey,
        eventAccount,
        attendeeRecord,
        loyaltyVault: vault,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([attendee])
      .rpc();

    const eventAcc = await program.account.eventAccount.fetch(eventAccount);
    assert.equal(eventAcc.checkedInCount.toString(), "1");

    const rec = await program.account.attendeeRecord.fetch(attendeeRecord);
    assert.equal(rec.attendee.toBase58(), attendee.publicKey.toBase58());
  });

  it("award_points should update vault and attendee record", async () => {
    const eventId = new anchor.BN(6);
    const name = "Event 6";

    const now = Math.floor(Date.now() / 1000);
    const startTime = new anchor.BN(now - 10);
    const endTime = new anchor.BN(now + 100);

    const [eventAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("event"), organizer.toBuffer(), Buffer.from(eventId.toArrayLike(Buffer, "le", 8))],
      program.programId
    );

    await program.methods
      .initializeEvent(eventId, name, startTime, endTime, 10)
      .accounts({ organizer, eventAccount, systemProgram: anchor.web3.SystemProgram.programId })
      .rpc();

    const attendee = Keypair.generate();
    await provider.connection.requestAirdrop(attendee.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL).then(sig => provider.connection.confirmTransaction(sig));
    const [attendeeRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("attendee"), eventAccount.toBuffer(), attendee.publicKey.toBuffer()],
      program.programId
    );
    const [vault] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), attendee.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .checkInAttendee()
      .accounts({
        attendee: attendee.publicKey,
        eventAccount,
        attendeeRecord,
        loyaltyVault: vault,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([attendee])
      .rpc();

    await program.methods
      .awardPoints(new anchor.BN(100))
      .accounts({
        organizer,
        eventAccount,
        attendeeRecord,
        loyaltyVault: vault,
        attendee: attendee.publicKey,
      })
      .signers([attendee])
      .rpc();

    const vaultAcc = await program.account.loyaltyVault.fetch(vault);
    assert.equal(vaultAcc.totalPoints.toString(), "100");
  });

  it("redeem_points should fail when insufficient and succeed otherwise", async () => {
    const eventId = new anchor.BN(7);
    const name = "Event 7";

    const now = Math.floor(Date.now() / 1000);
    const startTime = new anchor.BN(now - 10);
    const endTime = new anchor.BN(now + 100);

    const [eventAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("event"), organizer.toBuffer(), Buffer.from(eventId.toArrayLike(Buffer, "le", 8))],
      program.programId
    );

    await program.methods
      .initializeEvent(eventId, name, startTime, endTime, 10)
      .accounts({ organizer, eventAccount, systemProgram: anchor.web3.SystemProgram.programId })
      .rpc();

    const attendee = Keypair.generate();
    await provider.connection.requestAirdrop(attendee.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL).then(sig => provider.connection.confirmTransaction(sig));
    const [attendeeRecord] = PublicKey.findProgramAddressSync(
      [Buffer.from("attendee"), eventAccount.toBuffer(), attendee.publicKey.toBuffer()],
      program.programId
    );
    const [vault] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), attendee.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .checkInAttendee()
      .accounts({
        attendee: attendee.publicKey,
        eventAccount,
        attendeeRecord,
        loyaltyVault: vault,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([attendee])
      .rpc();

    // Redeem without enough points
    try {
      await program.methods
        .redeemPoints(new anchor.BN(50))
        .accounts({
          organizer,
          eventAccount,
          attendeeRecord,
          loyaltyVault: vault,
          attendee: attendee.publicKey,
        })
        .signers([attendee])
        .rpc();
      assert.fail("Expected error");
    } catch (e: any) {
      assert.include(e.toString(), "InsufficientPoints");
    }

    // Add points, then redeem
    await program.methods
      .awardPoints(new anchor.BN(50))
      .accounts({
        organizer,
        eventAccount,
        attendeeRecord,
        loyaltyVault: vault,
        attendee: attendee.publicKey,
      })
      .signers([attendee])
      .rpc();

    await program.methods
      .redeemPoints(new anchor.BN(50))
      .accounts({
        organizer,
        eventAccount,
        attendeeRecord,
        loyaltyVault: vault,
        attendee: attendee.publicKey,
      })
      .signers([attendee])
      .rpc();

    const vaultAcc = await program.account.loyaltyVault.fetch(vault);
    assert.equal(vaultAcc.totalPoints.toString(), "0");
    assert.equal(vaultAcc.redeemedPoints.toString(), "50");
  });
});


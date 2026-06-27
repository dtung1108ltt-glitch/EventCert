# EventCert – Digital Proof of Attendance & Loyalty Platform

> A decentralized event check-in system built on Solana blockchain. Attendees scan a QR code, sign a transaction via Phantom Wallet, and receive an NFT badge + loyalty points — all recorded on-chain transparently.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Open Ubuntu (WSL2)](#1-open-ubuntu-wsl2)
  - [2. Clone the Repository](#2-clone-the-repository)
  - [3. Run the Solana Program (Smart Contract)](#3-run-the-solana-program-smart-contract)
  - [4. Run the Backend API](#4-run-the-backend-api)
  - [5. Run the Frontend](#5-run-the-frontend)
- [Testing the System End-to-End](#testing-the-system-end-to-end)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Smart Contract](#smart-contract)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

EventCert solves a real problem in Vietnam's tech event scene: most events still use paper lists or Google Form QR codes that are easy to fake, leave no lasting record, and create no long-term value for attendees.

EventCert replaces this with:
- **Tamper-proof check-in** via Solana blockchain (PDA prevents duplicate check-ins at the runtime level)
- **NFT badge** automatically minted to attendee's wallet after check-in
- **Loyalty points** accumulated on-chain, redeemable for rewards
- **Gasless experience** for attendees (backend pays the transaction fee)

**Program ID (Devnet):** `EioDsXWiQR9DTxnk9U9jRF78hWYDp9HBBV23tvRXnYtK`

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                 │
│         Next.js 14 (Web) + Phantom Wallet            │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / REST API
┌──────────────────────▼──────────────────────────────┐
│                  BUSINESS LOGIC LAYER                │
│           Node.js + Express Backend API              │
│        Auth Service │ Event Service │ Loyalty        │
└──────────┬───────────────────────────┬──────────────┘
           │ PostgreSQL (off-chain)    │ relay tx
┌──────────▼──────────┐  ┌────────────▼──────────────┐
│   PostgreSQL DB      │  │   Solana Program (Anchor)  │
│  Users, Events,      │  │  EventAccount, Attendee    │
│  CheckIns, Badges,   │  │  Record, LoyaltyVault,     │
│  LoyaltyTx, Rewards  │  │  BadgeMint PDAs            │
└─────────────────────┘  └───────────────────────────┘
                                      │ metadata URI
                          ┌───────────▼───────────────┐
                          │   IPFS / Arweave           │
                          │   NFT Badge Metadata       │
                          └───────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Blockchain | Solana (Devnet/Mainnet) | — |
| Smart Contract | Anchor Framework | 1.0.2 |
| Smart Contract Language | Rust | 1.79+ |
| Backend | Node.js + Express | 20 LTS |
| Backend Language | TypeScript | 5.x |
| Database | PostgreSQL | 15 |
| ORM | Prisma | 5.x |
| Frontend | Next.js | 14 |
| Frontend Language | TypeScript | 5.x |
| Wallet | Phantom + Solana Wallet Adapter | — |
| NFT Standard | Metaplex Token Metadata | — |
| Storage | IPFS (Pinata) | — |

---

## Prerequisites

Before you begin, make sure you have the following installed:

### For Windows users (Required)

1. **Windows 10/11** with WSL2 enabled
2. **VS Code** with the WSL extension
3. **Phantom Wallet** browser extension — https://phantom.com

### Inside WSL2 (Ubuntu)

- Rust 1.79+
- Solana CLI 1.18+
- Anchor CLI 1.0.2
- Node.js 20+
- PostgreSQL 15

---

## Getting Started

### 1. Open Ubuntu (WSL2)

**Option A — From VS Code (Recommended):**

1. Open VS Code
2. Press `Ctrl+Shift+P` → type `WSL: Connect to WSL`
3. Open a new terminal (`Ctrl+` `` ` ``) — it will be a Ubuntu bash terminal

**Option B — From Windows Start Menu:**

1. Click Start → search `Ubuntu`
2. Open the Ubuntu app
3. You are now in a Linux terminal

**Option C — From Windows Terminal:**

1. Open Windows Terminal
2. Click the dropdown arrow → select `Ubuntu`

> All commands in this README must be run inside the Ubuntu terminal, not Windows CMD or PowerShell.

---

### 2. Clone the Repository

```bash
# Navigate to your preferred directory
cd ~

# Clone the project
git clone https://github.com/dtung1108ltt-glitch/EventCert.git

# Enter the project
cd EventCert
```

---

### 3. Run the Solana Program (Smart Contract)

The smart contract is already deployed to Devnet. You only need to run it locally for development/testing.

#### Install dependencies (first time only)

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install Solana CLI
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc

# Install Anchor via AVM
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 1.0.2
avm use 1.0.2

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Run tests on local validator

```bash
cd ~/EventCert/eventcert-program

# Start local Solana validator
pkill -f solana-test-validator 2>/dev/null
solana-test-validator --reset --quiet > /tmp/validator.log 2>&1 &
sleep 8

# Fund your local wallet
solana airdrop 5 --url http://127.0.0.1:8899

# Deploy to local validator
anchor deploy --provider.cluster localnet

# Run all 7 tests
export ANCHOR_PROVIDER_URL=http://127.0.0.1:8899
export ANCHOR_WALLET=~/.config/solana/id.json
npx ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts
```

Expected output:
```
  eventcert-program
    ✔ initialize_event should succeed (156ms)
    ✔ check_in_attendee before start should fail with EventNotStarted (427ms)
    ✔ check_in_attendee after end should fail with EventEnded (414ms)
    ✔ check_in_attendee when full should fail with EventFull (420ms)
    ✔ check_in_attendee should create attendee record and increment count (834ms)
    ✔ award_points should update vault and attendee record (418ms)
    ✔ redeem_points should fail when insufficient and succeed otherwise (418ms)

  7 passing (3s)
```

#### View on Solana Explorer (Devnet)

Open in browser:
```
https://explorer.solana.com/address/EioDsXWiQR9DTxnk9U9jRF78hWYDp9HBBV23tvRXnYtK?cluster=devnet
```

---

### 4. Run the Backend API

#### Install PostgreSQL (first time only)

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo service postgresql start

# Create database and user
sudo -u postgres psql << 'SQL'
CREATE USER eventcert WITH PASSWORD 'password';
CREATE DATABASE eventcert OWNER eventcert;
GRANT ALL PRIVILEGES ON DATABASE eventcert TO eventcert;
SQL
```

#### Setup and run

```bash
cd ~/EventCert/eventcert-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
# Or create manually:
cat > .env << 'EOF'
DATABASE_URL="postgresql://eventcert:password@localhost:5432/eventcert"
PORT=3001
JWT_SECRET=eventcert_jwt_secret_2026
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=EioDsXWiQR9DTxnk9U9jRF78hWYDp9HBBV23tvRXnYtK
ORGANIZER_KEYPAIR_PATH=/home/lenovo/.config/solana/id.json
EOF

# Run database migrations
npx prisma migrate dev --name init
npx prisma generate

# Start the backend
npm run dev
```

Backend will be running at: **http://localhost:3001**

Verify it works:
```bash
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"..."}
```

---

### 5. Run the Frontend

Open a **new Ubuntu terminal** (keep backend running in the previous one).

```bash
cd ~/EventCert/eventcert-frontend

# Install dependencies
npm install

# Copy environment file
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=EioDsXWiQR9DTxnk9U9jRF78hWYDp9HBBV23tvRXnYtK
EOF

# Start the frontend
npm run dev
```

Frontend will be running at: **http://localhost:3000**

Open this URL in your Windows browser (Chrome/Edge).

---

## Testing the System End-to-End

### Setup Phantom Wallet for Devnet

1. Open Chrome/Edge → click the Phantom extension icon
2. Click **Settings** (gear icon) → **Developer Settings**
3. Change network to **Devnet**
4. Get test SOL: go to https://faucet.solana.com → paste your Phantom wallet address → select Devnet → request SOL

### Flow 1: Organizer creates an event

1. Go to **http://localhost:3000**
2. Click **Connect Wallet** → approve in Phantom
3. Navigate to create event page
4. Fill in event name, start/end time, max attendees
5. Submit → transaction signed in Phantom

### Flow 2: Attendee check-in

1. Organizer generates a QR code for the event
2. Attendee goes to **http://localhost:3000/checkin**
3. Click **Quét bằng camera** → scan the QR code
4. Phantom popup appears → click **Approve**
5. On-chain transaction confirmed → badge NFT minted
6. Success screen shows: badge + loyalty points earned

### Flow 3: View badges and points

- **http://localhost:3000/badges** — view all NFT badges in wallet
- **http://localhost:3000/loyalty** — view loyalty point balance
- **http://localhost:3000/rewards** — browse available rewards to redeem
- **http://localhost:3000/history** — view all transaction history

### Flow 4: Redeem points

1. Go to **http://localhost:3000/rewards**
2. Choose a reward
3. Click **Đổi điểm**
4. Points deducted on-chain → reward issued

---

## Project Structure

```
EventCert/
│
├── eventcert-program/              # Solana Smart Contract (Anchor/Rust)
│   ├── programs/
│   │   └── eventcert-program/
│   │       └── src/
│   │           ├── lib.rs          # Program entry point, events, errors
│   │           ├── state.rs        # PDA account structs
│   │           └── instructions/
│   │               ├── mod.rs              # Account contexts
│   │               ├── initialize_event.rs
│   │               ├── create_qr_session.rs
│   │               ├── check_in_attendee.rs
│   │               ├── mint_badge.rs
│   │               ├── award_points.rs
│   │               └── redeem_points.rs
│   ├── tests/
│   │   └── eventcert-program.ts    # 7 TypeScript tests
│   └── Anchor.toml
│
├── eventcert-backend/              # Backend API (Node.js/Express)
│   ├── src/
│   │   ├── index.ts                # Express app entry point
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts  # JWT auth middleware
│   │   ├── modules/
│   │   │   ├── auth/               # Wallet signature auth
│   │   │   ├── events/             # Event CRUD + QR session
│   │   │   ├── checkin/            # Relay tx to Solana
│   │   │   ├── loyalty/            # Points balance + history
│   │   │   └── rewards/            # Reward catalog
│   │   └── solana/
│   │       └── solana.service.ts   # Solana connection + PDA helpers
│   └── prisma/
│       └── schema.prisma           # Database schema (6 tables)
│
└── eventcert-frontend/             # Frontend (Next.js 14)
    └── src/
        ├── app/
        │   ├── page.tsx            # Home / event feed
        │   ├── checkin/            # QR scanner + check-in flow
        │   ├── badges/             # NFT badge collection
        │   ├── loyalty/            # Points wallet
        │   ├── rewards/            # Rewards catalog
        │   └── history/            # Transaction history
        └── lib/
            ├── api.ts              # Axios API client
            └── auth.ts             # Wallet auth + JWT storage
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | No | Verify wallet signature, return JWT |
| GET | `/api/events` | No | List all events |
| GET | `/api/events/:id` | No | Get event details |
| POST | `/api/events` | Yes | Create new event |
| PUT | `/api/events/:id` | Yes | Update event |
| POST | `/api/events/:id/qr-session` | Yes | Generate QR session (TTL 60s) |
| POST | `/api/checkin/:sessionId` | Yes | Relay signed tx, record check-in |
| GET | `/api/loyalty/balance` | Yes | Get points balance |
| GET | `/api/loyalty/history` | Yes | Get points history |
| GET | `/api/rewards` | No | List available rewards |
| POST | `/api/loyalty/redeem/:rewardId` | Yes | Redeem points for reward |
| GET | `/health` | No | Health check |

**Auth header:** `Authorization: Bearer <jwt_token>`

---

## Smart Contract

### Program ID
- **Devnet:** `EioDsXWiQR9DTxnk9U9jRF78hWYDp9HBBV23tvRXnYtK`

### PDA Accounts

| Account | Seeds | Description |
|---|---|---|
| `EventAccount` | `["event", organizer, event_id]` | Event metadata, attendee count |
| `AttendeeRecord` | `["attendee", event, attendee]` | Check-in record per attendee per event |
| `LoyaltyVault` | `["vault", attendee]` | Total and redeemed loyalty points |
| `BadgeMint` | `["badge_mint", attendee_record]` | NFT badge mint address + metadata URI |

### Anti-fraud mechanism

The `AttendeeRecord` PDA uses deterministic seeds `["attendee", event_pubkey, attendee_pubkey]`. If the same wallet attempts to check in twice for the same event, Solana's runtime rejects the transaction at the VM level because the PDA address already exists — no additional application-level checks needed.

### Instructions

| Instruction | Accounts Required | Description |
|---|---|---|
| `initialize_event` | organizer, event_account | Create event on-chain |
| `create_qr_session` | organizer | Emit session event (off-chain TTL handled by backend) |
| `check_in_attendee` | attendee, event_account, attendee_record, loyalty_vault | Check in + init vault |
| `mint_badge` | organizer, event_account, attendee_record, attendee, badge_mint_account | Issue NFT badge |
| `award_points` | organizer, event_account, attendee_record, loyalty_vault, attendee | Add loyalty points |
| `redeem_points` | organizer, event_account, attendee_record, loyalty_vault, attendee | Deduct points |

---

## Environment Variables

### Backend (`eventcert-backend/.env`)

```env
DATABASE_URL="postgresql://eventcert:password@localhost:5432/eventcert"
PORT=3001
JWT_SECRET=your_jwt_secret_here
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=EioDsXWiQR9DTxnk9U9jRF78hWYDp9HBBV23tvRXnYtK
ORGANIZER_KEYPAIR_PATH=/home/lenovo/.config/solana/id.json
```

### Frontend (`eventcert-frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOLANA_RPC=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=EioDsXWiQR9DTxnk9U9jRF78hWYDp9HBBV23tvRXnYtK
```

---

## Troubleshooting

### Ubuntu terminal not found
Open Windows PowerShell as Administrator and run:
```powershell
wsl --install
```
Restart your computer, then search "Ubuntu" in Start Menu.

### `solana: command not found`
```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### `anchor: command not found`
```bash
avm use 1.0.2
```

### Airdrop rate limit on Devnet
Use the web faucet instead:
- Go to https://faucet.solana.com
- Paste your wallet address (`solana address`)
- Select Devnet → request SOL

### PostgreSQL connection refused
```bash
sudo service postgresql start
```

### Phantom shows wrong network
In Phantom: Settings → Developer Settings → change to **Devnet**

### Build error `lock file version 4`
```bash
sed -i 's/^version = 4/version = 3/' Cargo.lock
anchor build
```

---

## License

MIT

---

## Author

**dtung1108ltt-glitch**  
GitHub: https://github.com/dtung1108ltt-glitch/EventCert

---

*Built with ❤️ on Solana — Ho Chi Minh City, June 2026*

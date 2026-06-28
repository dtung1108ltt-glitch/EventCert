export interface Event {
  id: string;
  eventId: number;
  name: string;
  description: string;
  organizerKey: string;
  eventPDA: string;
  startTime: string;
  endTime: string;
  maxAttendees: number;
  checkedInCount?: number;
  qrSessionId?: string;
}

export interface Badge {
  id: string;
  eventId: string;
  eventName: string;
  metadataUri: string;
  mintAddress: string;
  checkedInAt: string;
}

export interface LoyaltyVault {
  walletAddress: string;
  totalPoints: number;
  redeemedPoints: number;
  availablePoints: number;
  lastUpdated: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  stock: number;
}

export interface CheckInResult {
  success: boolean;
  tx?: string;
  badge?: Badge;
  pointsAwarded?: number;
}

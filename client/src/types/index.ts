export type Role = 'USER' | 'ADMIN' | 'STAFF';
export type VerificationStatus = 'NONE' | 'PENDING' | 'VERIFIED' | 'REJECTED';
export type AccountStatus = 'ACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  _id?: string;
  fullName: string;
  email: string;
  phone?: string;
  city: string;
  gender: string;
  role: Role;
  invitationCode?: string;
  creditScore?: number;
  allowWithdraw?: boolean;
  allowTrade?: boolean;
  hasTransactionPin?: boolean;
  isVIP: boolean;
  vipExpiresAt?: string;
  isVerified?: boolean;
  verificationStatus: VerificationStatus;
  status?: AccountStatus | 'BLOCKED' | 'PENDING';
  profileImage?: string;
  bio?: string;
  age?: number;
  dob?: string;
  bankDetails?: {
    bankName?: string;
    accountHolder?: string;
    accountNumber?: string;
    ifscCode?: string;
  };
  upiId?: string;
  phonePe?: string;
  paytm?: string;
  googlePay?: string;
  lastLoginAt?: string;
  createdAt?: string;
  wallet?: Wallet;
}

export interface Wallet {
  availableBalance: number;
  frozenBalance: number;
  totalBalance: number;
  currency: string;
}

export interface Profile {
  _id: string;
  fullName: string;
  city: string;
  gender: string;
  age: number;
  isVIP: boolean;
  profileImage: string;
  bio: string;
  interests: string[];
}

export interface Transaction {
  _id: string;
  transactionId: string;
  userId: string;
  type: 'RECHARGE' | 'WITHDRAWAL' | 'TRADE_HOLD' | 'TRADE_WIN' | 'TRADE_LOSE' | 'ADMIN_ADJUSTMENT';
  amount: number;
  beforeBalance: number;
  afterBalance: number;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED' | 'FAILED';
  referenceId?: string;
  description: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price?: number;
  stock?: number;
  image: string;
  category: string;
  sectionType?: 'LOBBY' | 'HIDDEN';
  status: 'ACTIVE' | 'INACTIVE';
  isMainPage?: boolean;
}

export interface Trade {
  _id: string;
  tradeId: string;
  userId: string | User;
  productId: string | Product;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  totalAmount: number;
  status: 'PENDING' | 'SETTLED' | 'CANCELLED';
  outcome: 'WIN' | 'LOSE' | 'NONE';
  payoutAmount?: number;
  note?: string;
  createdAt: string;
}

export interface RechargeRequest {
  _id: string;
  requestId: string;
  userId: string | User;
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  receiptUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  _id: string;
  requestId: string;
  userId: string | User;
  amount: number;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  rejectionReason?: string;
  createdAt: string;
}

export interface Verification {
  _id: string;
  userId: string | User;
  fullName: string;
  dob: string;
  idType: string;
  idNumber: string;
  idDocumentUrl: string;
  selfieUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
}

export interface DateRequest {
  _id: string;
  requestId: string;
  senderId: string;
  targetProfileId: string;
  targetProfileName: string;
  date: string;
  time: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'VIP' | 'RECHARGE' | 'WITHDRAWAL' | 'TRADE' | 'DATE_REQUEST' | 'SUPPORT' | 'ANNOUNCEMENT';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  shortDescription: string;
  content: string;
  image?: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userEmail: string;
  category: string;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  lastRepliedAt: string;
  createdAt: string;
}

export interface SupportMessage {
  _id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: 'USER' | 'ADMIN';
  message: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  amount?: number;
  reason?: string;
  createdAt: string;
}

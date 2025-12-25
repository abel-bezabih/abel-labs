export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
  DEVELOPER = 'DEVELOPER',
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  CHAPA = 'CHAPA',
  TELEBIRR = 'TELEBIRR',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum ProjectType {
  WEBSITE = 'WEBSITE',
  MOBILE_APP = 'MOBILE_APP',
  ECOMMERCE = 'ECOMMERCE',
  PORTFOLIO = 'PORTFOLIO',
  CUSTOM_SYSTEM = 'CUSTOM_SYSTEM',
}

export enum Currency {
  ETB = 'ETB',
  USD = 'USD',
  CAD = 'CAD',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  clientId: string;
  assignedToId?: string;
  budget: number;
  currency: Currency;
  deadline?: Date;
  briefId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectBrief {
  id: string;
  conversationId: string;
  projectType: ProjectType;
  businessType?: string;
  features: string[];
  designPreferences?: string;
  timeline?: string;
  budgetRange?: string;
  exampleWebsites?: string[];
  summary: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIConversation {
  id: string;
  userId?: string;
  sessionId: string;
  messages: ConversationMessage[];
  intent?: ProjectType;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: Currency;
  provider: PaymentProvider;
  status: PaymentStatus;
  transactionId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  projectId: string;
  invoiceNumber: string;
  amount: number;
  currency: Currency;
  status: InvoiceStatus;
  dueDate: Date;
  paidAt?: Date;
  items: InvoiceItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}





# Abel Labs - Full-Stack Monorepo

A comprehensive software company platform with AI-powered client intake, project management, and multi-currency payment processing.

## 🏗️ Architecture

This is a Turborepo monorepo containing:

- **Apps:**
  - `client-portal` - Next.js 15 client-facing portal with AI chat
  - `admin-dashboard` - Next.js admin panel for project management
  - `mobile` - React Native/Expo SDK 52 mobile app
  - `api` - NestJS backend API

- **Packages:**
  - `@abel-labs/types` - Shared TypeScript types
  - `@abel-labs/utils` - Shared utilities
  - `@abel-labs/database` - Prisma schema and client
  - `@abel-labs/ui` - Shared UI components
  - `@abel-labs/ai-agent` - AI agent (Abel) module

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and Yarn
- Docker and Docker Compose
- PostgreSQL 16+
- Redis 7+

### Setup

1. **Clone and install dependencies:**

```bash
yarn install
```

2. **Start infrastructure (PostgreSQL + Redis):**

```bash
docker-compose up -d
```

3. **Set up environment variables:**

Copy `.env.example` to `.env` in the root and fill in your API keys:

```bash
# Required
DATABASE_URL="postgresql://abellabs:abellabs123@localhost:5432/abellabs?schema=public"
GROQ_API_KEY=your-groq-api-key
JWT_SECRET=your-super-secret-jwt-key

# Payment providers (for production)
STRIPE_SECRET_KEY=sk_test_...
CHAPA_SECRET_KEY=your-chapa-key
TELEBIRR_API_KEY=your-telebirr-key
```

4. **Generate Prisma client and run migrations:**

```bash
yarn db:generate
yarn db:migrate
yarn db:seed
```

5. **Start all apps in development:**

```bash
yarn dev
```

This will start:
- API: http://localhost:3001
- Client Portal: http://localhost:3000
- Admin Dashboard: http://localhost:3002
- API Docs: http://localhost:3001/api/docs

## 📦 Project Structure

```
abel-labs/
├── apps/
│   ├── api/                 # NestJS backend
│   ├── client-portal/       # Next.js client portal
│   ├── admin-dashboard/     # Next.js admin dashboard
│   └── mobile/             # React Native/Expo app
├── packages/
│   ├── types/              # Shared TypeScript types
│   ├── utils/              # Shared utilities
│   ├── database/           # Prisma schema & client
│   ├── ui/                 # Shared UI components
│   └── ai-agent/           # AI agent module
├── docker-compose.yml      # Docker services
└── turbo.json              # Turborepo config
```

## 🤖 AI Agent (Abel)

The AI agent automates client intake:

1. **Conversation Flow:**
   - Client starts chat in client portal
   - Abel detects project intent (Website, Mobile App, etc.)
   - Gathers requirements through natural dialogue
   - Generates structured project brief

2. **Admin Review:**
   - Admin reviews briefs in admin dashboard
   - Approves/rejects with budget and deadline
   - Creates project and invoice automatically

## 💳 Payment Integration

### Supported Providers

- **ETB (Ethiopian Birr):**
  - Chapa
  - Telebirr

- **USD:**
  - Stripe

### Payment Flow

1. Invoice created for approved project
2. Client receives payment link
3. Client pays via chosen provider
4. Webhook confirms payment
5. Invoice status updated automatically

## 🔐 Authentication

- JWT-based authentication
- Role-based access control (ADMIN, CLIENT, DEVELOPER)
- Refresh token rotation (to be implemented)

## 📊 Database Schema

Key models:
- `User` - Users with roles
- `AIConversation` - Chat sessions
- `ProjectBrief` - AI-generated briefs
- `Project` - Active projects
- `Invoice` - Invoices
- `Payment` - Payment records

See `packages/database/prisma/schema.prisma` for full schema.

## 🛠️ Development

### Running Individual Apps

```bash
# API only
cd apps/api && yarn dev

# Client portal only
cd apps/client-portal && yarn dev

# Admin dashboard only
cd apps/admin-dashboard && yarn dev

# Mobile app
cd apps/mobile && yarn dev
```

### Database Commands

```bash
# Generate Prisma client
yarn db:generate

# Create migration
yarn db:migrate

# Seed database
yarn db:seed

# Open Prisma Studio
yarn db:studio
```

### Building

```bash
# Build all apps
yarn build

# Build specific app
cd apps/api && yarn build
```

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch
```

## 📱 Mobile App

The mobile app is built with Expo SDK 52:

```bash
cd apps/mobile
yarn dev        # Start Expo dev server
yarn android    # Run on Android
yarn ios        # Run on iOS
```

## 🚢 Deployment

### API Deployment

1. Set environment variables
2. Run migrations: `yarn db:migrate`
3. Build: `yarn build`
4. Start: `yarn start:prod`

### Frontend Deployment

**Client Portal & Admin Dashboard:**
- Deploy to Vercel/Netlify
- Set `NEXT_PUBLIC_API_URL` environment variable

**Mobile App:**
- Build with EAS: `eas build`
- Submit to app stores

## 🔒 Security

- JWT authentication
- Rate limiting (100 requests/minute)
- Input validation (class-validator)
- CORS configuration
- Secure cookie handling
- Audit logs for sensitive operations

## 📈 Features

### Client Portal
- ✅ AI chat interface (Abel)
- ✅ Project dashboard
- ✅ Invoice management
- ✅ Payment integration
- ✅ Project progress tracking

### Admin Dashboard
- ✅ Project brief review
- ✅ Project management
- ✅ Payment tracking
- ✅ Revenue analytics
- ✅ Client management

### Mobile App
- ✅ Client login
- ✅ Project viewing
- ✅ Invoice management
- ✅ Push notifications (to be implemented)
- ✅ Offline caching (to be implemented)

## 🎨 Design System

- **Typography:** Inter font family
- **Colors:** Blue/Purple gradient theme
- **Components:** Custom components with TailwindCSS
- **Animations:** Framer Motion for smooth transitions

## 📝 API Documentation

Swagger docs available at `/api/docs` when API is running.

## 🌍 Environment Variables

See `.env.example` for all required environment variables.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and type checking
4. Submit a pull request

## 📄 License

Private - Abel Labs Ltd.

## 🆘 Support

For issues or questions, contact the development team.

---

**Built with ❤️ by Abel Labs**


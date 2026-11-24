# DocSpace - Collaborative Document Editor

A modern, AI-native collaborative document editor built for the AI-Native Full Stack Developer assessment. Features include rich-text editing, real-time autosave, document sharing with permissions, and file import functionality.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication with HttpOnly cookies
- **Rich Text Editor**: Tiptap editor with formatting, headings, lists, and more
- **Document Management**: Create, rename, delete, and organize documents
- **Sharing System**: Share documents with VIEWER or EDITOR permissions
- **File Import**: Import TXT and Markdown files with format preservation
- **Auto-save**: Debounced auto-save with pending save detection
- **Responsive Design**: Mobile-friendly interface

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Editor**: Tiptap
- **State Management**: TanStack React Query
- **Forms**: React Hook Form + Zod validation

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt
- **Validation**: class-validator + class-transformer

### Infrastructure
- **Containerization**: Docker Compose (local development)
- **API**: RESTful architecture
- **Security**: Helmet, CORS, secure cookies

## 📁 Project Structure

```
Full-Stack-Developer-Assignment/
├── backend/                    # NestJS API
│   ├── prisma/                # Database schema and migrations
│   ├── src/                   # Source code
│   │   ├── auth/             # Authentication module
│   │   ├── documents/        # Document CRUD operations
│   │   ├── sharing/          # Document sharing functionality
│   │   ├── uploads/          # File import handling
│   │   └── ...
│   └── test/                 # E2E and unit tests
├── frontend/                  # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages and layouts
│   │   ├── features/        # Feature modules
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── documents/  # Document management
│   │   │   ├── editor/     # Tiptap editor components
│   │   │   └── sharing/    # Sharing UI components
│   │   └── lib/            # Utilities and API client
└── docker-compose.yml        # PostgreSQL container
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker & Docker Compose (for local database)
- PostgreSQL 16+ (for production)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Full-Stack-Developer-Assignment
   ```

2. **Set up the database**
   ```bash
   docker-compose up -d
   ```

3. **Configure backend environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Install dependencies and set up database**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev
   npm run seed
   ```

5. **Start the backend server**
   ```bash
   npm run start:dev
   # Backend runs on http://localhost:3001
   ```

6. **Configure frontend environment**
   ```bash
   cd ../frontend
   cp .env.local.example .env.local
   # Edit .env.local if needed
   ```

7. **Install frontend dependencies and start**
   ```bash
   npm install
   npm run dev
   # Frontend runs on http://localhost:3000
   ```

### Demo Accounts
- **Mohamed**: `mohamed@example.com` / `Demo123!`
- **Ahmed**: `ahmed@example.com` / `Demo123!`

## 📦 Deployment

### Vercel (Frontend)
1. Push code to GitHub repository
2. Import project in Vercel dashboard
3. Configure environment variables:
   ```
   BACKEND_URL=https://your-railway-app.railway.app
   ```
4. Deploy

### Railway (Backend)
1. Create new Railway project
2. Connect GitHub repository
3. Add PostgreSQL database service
4. Set environment variables:
   ```
   DATABASE_URL=postgresql://...
   JWT_ACCESS_SECRET=your-secret-key
   JWT_REFRESH_SECRET=your-secret-key
   FRONTEND_URL=https://your-vercel-app.vercel.app
   COOKIE_SECURE=true
   NODE_ENV=production
   ```
5. Deploy

### Supabase (Database Alternative)
1. Create new Supabase project
2. Get connection string
3. Update `DATABASE_URL` in Railway environment
4. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@host:port/database"
PORT=3001
NODE_ENV=production
FRONTEND_URL="https://your-frontend.vercel.app"
JWT_ACCESS_SECRET="your-long-random-secret"
JWT_REFRESH_SECRET="your-long-random-secret"
ACCESS_TOKEN_TTL="15m"
REFRESH_TOKEN_TTL_DAYS=7
COOKIE_SECURE=true
```

### Frontend (.env.local)
```env
BACKEND_URL="https://your-backend.railway.app"
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test              # Unit tests
npm run test:e2e     # E2E tests
npm run test:all     # All tests
```

### Type Checking
```bash
cd backend
npm run typecheck

cd frontend
npm run typecheck
```

### Production Build
```bash
cd backend
npm run build

cd frontend
npm run build
```

## 📄 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Document Endpoints
- `GET /api/documents` - List user's documents
- `POST /api/documents` - Create new document
- `GET /api/documents/:id` - Get document by ID
- `PATCH /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/shared` - List shared documents

### Sharing Endpoints
- `GET /api/documents/:documentId/shares` - List document shares
- `POST /api/documents/:documentId/share` - Share document
- `PATCH /api/documents/:documentId/share/:userId` - Update share permission
- `DELETE /api/documents/:documentId/share/:userId` - Remove share

### File Import
- `POST /api/documents/import` - Import TXT or Markdown file

## 🚦 Project Status

✅ **Completed Features:**
- User authentication (register, login, logout, refresh)
- Document CRUD operations
- Rich-text editor with formatting
- Auto-save functionality
- Document sharing with VIEWER/EDITOR permissions
- File import (TXT, Markdown)
- Responsive design
- Comprehensive error handling
- Unit and E2E tests

⚠️ **Known Limitations:**
- No real-time collaboration (single-user editing)
- No document version history
- No file export functionality
- No image upload support

## 👥 Demo Scenario

1. Log in as Mohamed
2. Create a new document and add content
3. Use formatting tools (bold, italic, headings, lists)
4. Import a Markdown file
5. Share document with Ahmed as VIEWER
6. Log out and log in as Ahmed
7. Verify read-only access to shared document
8. Log back in as Mohamed and upgrade Ahmed to EDITOR
9. Log in as Ahmed again and verify editing capability
10. Revoke Ahmed's access

## 📝 License

Built for educational purposes as part of the AI-Native Full Stack Developer assessment.
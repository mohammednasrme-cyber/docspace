# DocSpace – Collaborative Document Editor

DocSpace is a full-stack document management and editing application developed for the AI-Native Full Stack Developer Assessment.

It provides users with a simple workspace to create, edit, format, import, and share documents with other users through role-based permissions.

The application focuses on secure authentication, document management, rich-text editing, automatic saving, and controlled document sharing.

## 🚀 Live Demo & Repository

- **Live Application:** https://docspace-orpin.vercel.app
- **GitHub Repository:** https://github.com/mohammednasrme-cyber/docspace

## ✨ Features

### Authentication & Authorization
- User registration and login.
- JWT-based authentication using HttpOnly cookies.
- Secure logout functionality.
- Access token refresh mechanism.
- Protected API endpoints.

### Document Management
- Create new documents.
- View owned documents.
- Edit document titles and content.
- Rename and delete documents.
- Access documents shared by other users.

### Rich Text Editor
- Tiptap editor integration.
- Bold, italic, and underline formatting.
- Heading levels (H1–H3).
- Bulleted and numbered lists.
- Text alignment.
- Placeholder support.

### Automatic Saving
- Debounced autosave with a 1.5-second delay.
- Visual save status indicators.
- Pending-save detection.
- Controlled save operations to reduce unnecessary API requests.

### Document Sharing
- Share documents with other registered users.
- VIEWER permission for read-only access.
- EDITOR permission for editing access.
- View active sharing permissions.
- Update existing permissions.
- Revoke document access.
- Backend authorization to enforce document permissions.

### File Import
- Import plain-text (.txt) files.
- Import Markdown (.md) files.
- Preserve paragraphs and supported formatting.
- Server-side file validation.

### User Experience
- Responsive interface.
- Form validation and error handling.
- Clean document dashboard.
- Separate views for owned and shared documents.

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS and shadcn/ui
- **Rich Text Editor:** Tiptap
- **Server State:** TanStack React Query
- **Forms:** React Hook Form
- **Validation:** Zod

### Backend
- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT and bcrypt
- **Validation:** class-validator and class-transformer
- **API Architecture:** RESTful APIs

### Infrastructure & Tools
- **Database Hosting:** Supabase
- **Frontend Hosting:** Vercel
- **Local Development:** Docker Compose
- **Security:** Helmet, CORS, and secure cookies
- **Version Control:** Git and GitHub

## 📁 Project Structure

```text
docspace/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── auth/
│   │   ├── documents/
│   │   ├── sharing/
│   │   ├── uploads/
│   │   └── ...
│   ├── test/
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── documents/
│   │   │   ├── editor/
│   │   │   └── sharing/
│   │   └── lib/
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

## ⚡ Quick Start

### Prerequisites

- Node.js and npm.
- Docker and Docker Compose.
- Git.

### 1. Clone the Repository

```bash
git clone https://github.com/mohammednasrme-cyber/docspace.git
cd docspace
```

### 2. Start the Local Database

```bash
docker compose up -d
```

### 3. Configure the Backend

Navigate to the backend directory:

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example` and configure the required environment variables, including the database connection string and JWT secrets.

### 4. Initialize the Database

```bash
npx prisma generate
npx prisma migrate dev
npm run seed
```

The seed script creates demo accounts for testing.

### 5. Start the Backend Server

```bash
npm run start:dev
```

The backend API will be available at:

`http://localhost:3001/api`

### 6. Configure and Start the Frontend

Open a new terminal from the project root:

```bash
cd frontend
npm install
```

Create `.env.local` based on `.env.local.example` and configure the backend API URL.

Start the development server:

```bash
npm run dev
```

The frontend will be available at:

`http://localhost:3000`

## 👤 Demo Accounts

The following accounts are created by the database seed script:

| User | Email | Password |
|---|---|---|
| Mohamed | mohamed@example.com | Demo123! |
| Ahmed | ahmed@example.com | Demo123! |

These accounts can be used to test document ownership and sharing permissions, provided the seed script has been executed against the database being used.

## 🔄 Demo Scenario

The following workflow demonstrates the main application features:

1. Log in using Mohamed's account.
2. Create a new document.
3. Add content and apply rich-text formatting.
4. Import a Markdown file.
5. Verify that changes are automatically saved.
6. Share the document with Ahmed using VIEWER permission.
7. Log out and sign in using Ahmed's account.
8. Verify that Ahmed can view the document but cannot edit it.
9. Log back in as Mohamed and change Ahmed's permission to EDITOR.
10. Sign in as Ahmed again and verify that editing is now allowed.
11. Revoke Ahmed's access and verify that the document is no longer accessible.

## 🔐 Environment Variables

Environment variables are configured separately for the backend and frontend.

### Backend (`backend/.env`)

Refer to `backend/.env.example` for the complete list of required variables.

Typical configuration includes:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
ACCESS_TOKEN_TTL="15m"
REFRESH_TOKEN_TTL_DAYS=7
COOKIE_SECURE=false
```

### Frontend (`frontend/.env.local`)

Refer to `frontend/.env.local.example` for the exact variable names.

Configure the backend API URL according to the frontend API client implementation.

**Important:** Never commit actual database credentials, JWT secrets, or other sensitive environment variables to GitHub.

## 📡 API Documentation

The following endpoints represent the main application API routes.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |
| POST | `/api/auth/logout` | Log out the current user |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user information |

### Documents

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/documents` | List owned documents |
| POST | `/api/documents` | Create a document |
| GET | `/api/documents/:id` | Get document details |
| PATCH | `/api/documents/:id` | Update document |
| DELETE | `/api/documents/:id` | Delete a document |
| GET | `/api/documents/shared` | List shared documents |

### Sharing

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/documents/:documentId/shares` | List document shares |
| POST | `/api/documents/:documentId/share` | Share a document |
| PATCH | `/api/documents/:documentId/share/:userId` | Update sharing permission |
| DELETE | `/api/documents/:documentId/share/:userId` | Revoke sharing access |

### File Import

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/documents/import` | Import TXT or Markdown files |

## 🧪 Testing

### Backend Tests

Run the backend unit tests:

```bash
cd backend
npm test
```

Run the end-to-end tests:

```bash
npm run test:e2e
```

### TypeScript Checks

Run the available type-checking scripts from each application directory.

### Production Builds

Backend:

```bash
cd backend
npm run build
```

Frontend:

```bash
cd frontend
npm run build
```

### Verified Results

- Backend unit tests: 4/4 passed.
- Backend sharing E2E tests: 1/1 passed.
- Backend TypeScript checks: Passed.
- Backend production build: Passed.
- Frontend TypeScript checks: Passed.
- Frontend production build: Passed.

## 🚀 Deployment

### Frontend – Vercel

The frontend is deployed on Vercel:

https://docspace-orpin.vercel.app

### Database – Supabase

The application uses Supabase PostgreSQL as its database provider.

Prisma migrations were successfully applied using:

```bash
npx prisma migrate deploy
```

### Backend – NestJS

The backend is developed using NestJS and communicates with the PostgreSQL database through Prisma.

For local development, follow the Quick Start instructions above. Production API availability depends on the backend deployment and its environment configuration.

## ⚠️ Known Limitations & Future Improvements

### Collaboration
- No real-time simultaneous editing.
- No live cursor presence.
- No real-time conflict resolution.

### Document Management
- Document version history.
- PDF and DOCX export.
- Image uploads and embedding.
- Document templates.
- Folder-based organization.
- Advanced document search.

### User Experience
- Improved mobile toolbar interactions.
- Additional keyboard shortcuts.
- Dark mode.
- More descriptive validation messages.

### Infrastructure
- Rate limiting.
- Audit logging.
- Performance monitoring.
- Automated database backups.
- Offline editing support.

### Current Technical Limitations
- Complex nested Markdown lists may not preserve their complete structure during import.
- Document changes are not synchronized between users in real time.
- Import file-size restrictions could be improved.
- Saving documents requires an active internet connection.

## 📄 Project Documentation

Additional documentation is available in the repository:

- `ARCHITECTURE.md` – System architecture and technical design.
- `AI_WORKFLOW.md` – AI-assisted development process, code review, and verification.
- `SUBMISSION.md` – Assessment submission details.

## 📝 License

This project was developed for educational purposes as part of the AI-Native Full Stack Developer Assessment.
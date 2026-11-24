# DocSpace Architecture

## System Overview

DocSpace is a monolithic full-stack application with clear separation between frontend and backend responsibilities. The application follows a traditional client-server architecture with a RESTful API and server-side rendering.

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                 Next.js Frontend                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌─────────────┐    │   │
│  │  │   Pages    │  │ Components │  │    Hooks    │    │   │
│  │  └────────────┘  └────────────┘  └─────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Reverse Proxy                           │
│           (Next.js rewrites to backend API)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   NestJS Backend API                         │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │  Modules   │  │   Guards   │  │   Services/Logic     │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │ Controllers │  │   Pipes    │  │   Data Access       │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 PostgreSQL Database                          │
│  ┌────────────┐  ┌────────────┐  ┌──────────────────────┐  │
│  │   Users    │  │ Documents  │  │   DocumentShares     │  │
│  └────────────┘  └────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🗄 Database Schema

### Core Entities

#### User
- `id` (UUID): Primary key
- `name`: User's display name
- `email`: Unique email address
- `password`: Hashed password
- `createdAt` / `updatedAt`: Timestamps

#### Document
- `id` (UUID): Primary key
- `title`: Document title
- `content`: JSON content (Tiptap document format)
- `ownerId`: Foreign key to User
- `createdAt` / `updatedAt`: Timestamps
- Index on `(ownerId, updatedAt)` for efficient queries

#### DocumentShare
- `id` (UUID): Primary key
- `documentId`: Foreign key to Document
- `userId`: Foreign key to User
- `permission`: ENUM (VIEWER or EDITOR)
- Unique constraint on `(documentId, userId)`
- Indexes on `userId` and `documentId`

#### RefreshToken
- `id` (UUID): Primary key
- `tokenHash`: Hashed refresh token
- `userId`: Foreign key to User
- `expiresAt`: Token expiration
- Index on `expiresAt` for cleanup

## 🔐 Authentication Strategy

### Token-Based Authentication
- **Access Token**: Short-lived (15 minutes), stored in HttpOnly cookie
- **Refresh Token**: Longer-lived (7 days), stored in HttpOnly cookie
- **Token Rotation**: Refresh tokens are rotated on each use

### Security Features
- HttpOnly cookies prevent XSS attacks
- Secure flag in production (HTTPS only)
- SameSite=Lax to prevent CSRF
- BCrypt for password hashing
- JWT secrets stored in environment variables

### Flow:
1. User submits credentials
2. Server validates and issues access/refresh tokens
3. Tokens stored in HttpOnly cookies
4. Subsequent requests include cookies automatically
5. Access token verified on protected endpoints
6. Refresh token used to obtain new access token when expired

## 📄 Document Authorization

### Permission Model
- **OWNER**: Full control (create, read, update, delete, share)
- **EDITOR**: Can read and modify document content
- **VIEWER**: Read-only access

### Authorization Flow
1. Request hits protected endpoint
2. Auth guard validates JWT and extracts user ID
3. Document access service checks permissions:
   - Owner check via `document.ownerId`
   - Share check via `DocumentShare` table
4. Returns appropriate permission level or 403

### Centralized Authorization
The `DocumentAccessService` provides a single source of truth for document permissions, used by both document and sharing modules.

## 💾 Auto-Save Implementation

### Frontend (React Hook)
- Uses `useAutosave` custom hook
- Debounced saving (1.5 seconds after last change)
- Tracks pending saves to prevent navigation loss
- Shows saving/pending state in UI

### Backend
- Standard PATCH endpoint for document updates
- Optimistic locking via `updatedAt` timestamps
- Content validation ensures valid Tiptap JSON

## 📁 File Import System

### Supported Formats
1. **Plain Text (.txt)**: Preserves paragraphs and line breaks
2. **Markdown (.md)**: Converts headings, emphasis, lists to Tiptap format

### Processing Pipeline
1. File upload via multipart/form-data
2. Server-side validation (size, type)
3. Content extraction and parsing
4. Conversion to Tiptap JSON document format
5. Database persistence with ownership

### Markdown Conversion
Uses `marked` library with custom renderer to produce Tiptap-compatible JSON structure while sanitizing HTML.

## 🚀 Deployment Architecture

### Local Development
- PostgreSQL in Docker container
- Backend: NestJS dev server with hot reload
- Frontend: Next.js dev server with proxy

### Production (Target)
- **Frontend**: Vercel (global CDN, automatic SSL)
- **Backend**: Railway (Node.js runtime, auto-scaling)
- **Database**: Supabase (managed PostgreSQL with backups)

### Environment Configuration
- Separate environment files for development/production
- Database connection pooling
- Production-optimized cookie settings
- CORS configuration for cross-origin requests

## 🔄 Data Flow

### Document Editing
```
User Input → Tiptap Editor → Document State → Debounce → API Call → Database
     ↑                                                                  ↓
     └───────────────────── Auto-save Status ←─────────────────────────┘
```

### Sharing Workflow
```
Owner → Share Request → Permission Check → Share Creation → Notification
   ↓
Shared User → Access Request → Permission Verification → Document Access
```

## ⚡ Performance Considerations

### Database Optimization
- Indexes on frequently queried columns
- Efficient joins via foreign keys
- Pagination for document lists
- Connection pooling

### Frontend Optimization
- Code splitting via Next.js dynamic imports
- React Query for server state caching
- Debounced API calls
- Optimistic updates for better UX

### Security Optimizations
- Rate limiting (to be implemented)
- Request validation at multiple layers
- SQL injection prevention via Prisma
- XSS protection via content sanitization

## 📈 Scalability Path

### Current (Monolithic)
- Single backend instance
- Single PostgreSQL database
- Stateless authentication

### Future Improvements
1. **Horizontal Scaling**: Multiple backend instances with load balancer
2. **Database Scaling**: Read replicas, connection pooling
3. **Caching Layer**: Redis for frequent queries
4. **Real-time Features**: WebSocket integration for collaboration
5. **File Storage**: S3-compatible storage for uploaded files

## 🛡 Security Architecture

### Defense in Depth
1. **Network**: HTTPS/TLS for all traffic
2. **Application**: Input validation, output encoding
3. **Database**: Parameterized queries, least privilege
4. **Authentication**: Multi-layered token validation
5. **Authorization**: Role-based access control

### Compliance Considerations
- GDPR-ready (user data management)
- Privacy by design (minimal data collection)
- Audit logging capability

## 🔧 Technical Decisions & Tradeoffs

### Chosen Stack Justification
- **NestJS**: Enterprise-grade structure, TypeScript native
- **Next.js**: Optimal for SSR, excellent developer experience
- **Prisma**: Type-safe database access, migration system
- **PostgreSQL**: Reliable, JSON support for document content
- **Tiptap**: Headless editor framework, extensible

### Tradeoffs Accepted
1. **No real-time collaboration**: Simplified architecture, focus on core features
2. **Monolithic backend**: Easier deployment, suitable for current scale
3. **Server-side rendering**: Slightly slower initial load but better SEO/accessibility
4. **Cookie-based auth**: Simpler than token headers, works with HttpOnly security

### Future-Proofing
- Modular architecture allows incremental upgrades
- Clear separation of concerns
- Comprehensive test coverage
- Documented APIs and data models
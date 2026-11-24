 DocSpace – Assessment Submission
1. Project Overview
DocSpace is a collaborative document management and editing application developed for the AI-Native Full Stack Developer Assessment.
It allows users to create, edit, format, import, and share documents with other users through a simple interface and role-based access control.
The application focuses on secure authentication, document management, rich-text editing, and controlled document sharing.
2. Project Links
GitHub Repository: https://github.com/mohammednasrme-cyber/docspace
Live Application: https://docspace-orpin.vercel.app
3. Demo Credentials
The following accounts are intended for testing the document sharing workflow. Make sure both accounts have been seeded in the production database before submission.
User
Email
Password
Purpose
Mohamed
mohamed@example.com
Demo123!
Document Owner
Ahmed
ahmed@example.com
Demo123!
Shared User

Suggested sharing workflow:
Log in using Mohamed's account.
Create a document and open its sharing settings.
Share the document with Ahmed as a VIEWER.
Log in using Ahmed's account and verify read-only access.
Change Ahmed's permission to EDITOR and verify that editing is allowed.
4. Implemented Features
4.1 Authentication and Authorization
User registration with input validation.
Login and logout functionality.
JWT-based authentication.
Access token refresh mechanism.
Current-user endpoint.
Protected API endpoints.
4.2 Document Management
Create new documents.
Retrieve owned documents.
Retrieve individual documents.
Update document titles and content.
Delete documents.
Access documents shared by other users.
4.3 Rich Text Editor
Tiptap rich-text editor integration.
Bold, italic, and underline formatting.
Heading levels (H1–H3).
Bulleted and numbered lists.
Text alignment.
Placeholder support.
4.4 Auto-save
Debounced auto-save with a 1.5-second delay.
Save status indicators.
Pending-save detection.
Controlled save operations to reduce unnecessary API requests.
4.5 Document Sharing
Share documents with other registered users.
VIEWER permission for read-only access.
EDITOR permission for editing access.
View active sharing permissions.
Update existing permissions.
Revoke document access.
Backend authorization checks to enforce permissions.
4.6 File Import
Import plain-text (.txt) files.
Import Markdown (.md) files.
Preserve paragraphs and supported formatting.
Server-side file validation.
5. Technical Implementation
Backend
NestJS and TypeScript.
Prisma ORM.
PostgreSQL database.
JWT authentication.
Global exception handling.
Request validation.
Consistent API response handling.
Environment-based configuration.
Frontend
Next.js App Router.
TypeScript.
Tailwind CSS.
shadcn/ui components.
TanStack React Query.
React Hook Form.
Zod validation.
Tiptap editor.
Security
Password hashing.
JWT-based authentication using HttpOnly cookies.
Backend route protection.
Role-based document authorization.
Input validation.
CORS configuration.
Security headers using Helmet.
6. Testing and Verification
Backend Tests
Unit tests for plain-text and Markdown conversion.
End-to-end tests for document sharing and authorization.
TypeScript compilation checks.
Production build verification.
Latest recorded test results:
Unit Tests: 4/4 passed.
Sharing E2E Tests: 1/1 passed.
Backend TypeScript checks: Passed.
Backend production build: Passed.
Frontend Verification
TypeScript checks: Passed.
Production build: Passed.
Manual Testing Scenarios
The following scenarios should be verified against the deployed application before marking them as completed:
User registration and login.
Logout and token refresh.
Document creation, editing, and deletion.
Rich-text formatting.
Auto-save and document persistence.
TXT and Markdown imports.
Sharing documents with VIEWER and EDITOR permissions.
Updating and revoking sharing permissions.
Permission enforcement for unauthorized users.
Responsive layout across screen sizes.
7. Known Limitations and Future Improvements
Real-time Collaboration
No live cursor presence.
No simultaneous editing synchronization.
No real-time conflict resolution.
Document Management
Document version history.
PDF and DOCX export.
Image uploads and embedding.
Document templates.
Folder-based organization.
Advanced document search.
User Experience
Improved mobile toolbar interactions.
Additional keyboard shortcuts.
Dark mode.
More descriptive validation and error messages.
Infrastructure
Rate limiting.
Audit logging.
Performance monitoring.
Automated database backups.
Offline editing support.
Current Technical Limitations
Complex nested Markdown lists may not preserve their complete structure during import.
Document changes are not synchronized between users in real time.
Import file-size restrictions could be improved.
Saving documents requires an active internet connection.
8. Deployment Information
Frontend
Hosting Platform: Vercel.
Live URL: https://docspace-orpin.vercel.app
Database
Provider: Supabase.
Database: PostgreSQL.
ORM: Prisma.
Database migration successfully applied using npx prisma migrate deploy.
Backend
Framework: NestJS.
Production environment variables and database connectivity must be configured for the deployed API.
Note: The frontend and database deployment status does not by itself confirm that every production workflow is operational. Authentication, document operations, and sharing should be verified against the live environment.
9. Local Setup Instructions
Prerequisites
Node.js and npm.
Docker and Docker Compose.
Git.
Clone the Repository
git clone https://github.com/mohammednasrme-cyber/docspace.git
cd docspace
Start the Database
docker compose up -d
Backend Setup
cd backend
npm install
Create a .env file based on .env.example and configure the database connection and required secrets.
Then run:
npx prisma generate
npx prisma migrate dev
npm run seed
npm run start:dev
The backend API should be available at:
http://localhost:3001/api
Frontend Setup
Open another terminal:
cd frontend
npm install
Create .env.local based on .env.local.example and configure the backend API URL.
Then run:
npm run dev
The frontend should be available at:
http://localhost:3000
Environment Variables
Refer to the .env.example and .env.local.example files for the required configuration.
Never commit actual environment secrets or database passwords to the repository.
10. AI-Assisted Development
AI tools were used throughout the development process to support implementation, debugging, and problem-solving.
The development workflow included:
Using AI to explore implementation approaches and generate initial code.
Reviewing generated code before integrating it into the project.
Evaluating suggested solutions for security, maintainability, and performance.
Modifying or rejecting generated implementations when a better technical approach was identified.
Verifying the final implementation through tests, TypeScript checks, and production builds.
For specific examples of AI-generated code that was reviewed, modified, or rejected, see AI_WORKFLOW.md.
11. Project Deliverables
The assessment submission includes:
Complete frontend and backend source code.
Public GitHub repository.
README with setup instructions.
Architecture documentation.
AI workflow documentation.
Database schema and migration files.
Docker Compose configuration.
Environment variable examples.
Testing information.
Walkthrough video, if available.
12. Walkthrough Video
Video URL: [https://drive.google.com/file/d/1jcQbE9WUIewJOeLpr2Ph2z5JAPQDEOD3/view?usp=drive_link]
The walkthrough should demonstrate:
Application overview.
Authentication.
Document creation and editing.
Rich-text formatting.
Auto-save behavior.
Document sharing.
VIEWER and EDITOR permission differences.
13. Submission Information
Project: DocSpace
Assessment: AI-Native Full Stack Developer
Submission Date: November 24, 2026
Source Code: https://github.com/mohammednasrme-cyber/docspace
Live Application: https://docspace-orpin.vercel.app

DocSpace was developed as part of the AI-Native Full Stack Developer Assessment, demonstrating full-stack development, secure application design, AI-assisted engineering, and practical problem-solving.


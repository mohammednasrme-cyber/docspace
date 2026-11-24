AI Development Workflow
Overview

This document describes how AI tools were used in the development of DocSpace, a collaborative document editor built for the AI-Native Full Stack Developer assessment. AI was used heavily as an accelerator, but every part of the final codebase was reviewed, tested, and in many places rewritten by me.

🛠 AI Tools Used
Primary Development Tools
Antigravity IDE: Used as a main development environment and AI coding assistant
OpenCode: Used as an AI coding agent for implementation tasks and refactoring
Claude Code: Used for multi-file changes, debugging, and code review in the terminal
Supporting Tools
ChatGPT: Used for architectural discussions, comparing options, and problem-solving
🎯 Tasks Accelerated by AI
1. Project Setup & Configuration
AI-Generated: Initial project structure, package.json configurations, Docker setup
Human Modified: Adjusted dependencies, added specific scripts for testing
2. Database Schema Design
AI-Generated: Initial Prisma schema with User, Document, DocumentShare entities
Human Modified: Added indexes, refined relationships, included RefreshToken model
3. Authentication Implementation
AI-Generated: JWT setup, cookie configuration, bcrypt integration
Human Modified: Enhanced security, added token rotation, improved error handling
4. Document Management System
AI-Generated: CRUD operations, validation pipes, response formatting
Human Modified: Added authorization layer, optimized queries, implemented soft delete patterns
5. Tiptap Editor Integration
AI-Generated: Basic editor setup, toolbar configuration, content serialization
Human Modified: Added custom extensions, improved styling, implemented auto-save
6. Sharing System
AI-Generated: Permission enum, share endpoints, basic authorization
Human Modified: Centralized access service, enhanced permission checks, added E2E tests
7. File Import Feature
AI-Generated: Multer configuration, file validation, basic parsing
Human Modified: Added Markdown conversion, BOM handling, comprehensive testing
8. Deployment
AI-Assisted: Walkthroughs for Supabase, Railway, and Vercel setup, and help reading build logs
Human Modified: Made the final configuration decisions and fixed deployment issues myself (see "Deliberate Deviations" below)
👀 Human Review and Ownership

AI output was treated as a first draft, never as final code. For every feature:

I read and reviewed the generated code line by line, and rewrote anything I did not fully understand or agree with.
I tested everything myself: I ran the application, went through the full user journeys in the browser, and checked edge cases by hand instead of trusting the AI's claim that something worked.
I verified the workflow end to end: registration, login, token refresh, creating and editing documents, auto-save, sharing with VIEWER/EDITOR permissions, file import, and the deployed environment (Vercel frontend, Railway backend, Supabase database).
I confirmed the final result is consistent: what is described in this document matches what is actually implemented in the repository.
🔍 AI-Generated Code That Was Modified or Rejected
Modified Implementations
1. Auto-save Implementation (Reviewed and Rejected)
AI Suggestion: Trigger an API request on every editor change
Problem I Identified: This generates unnecessary network requests and can cause race conditions when multiple save requests overlap, so an older request could finish last and overwrite newer content
My Revision: Rejected that approach and implemented a debounced auto-save with a controlled save queue, which reduces unnecessary requests and ensures changes are saved in the correct order
Verification: I tested it myself by making rapid consecutive edits and confirming that the latest document content was the one persisted
Current state: The debounced auto-save with a controlled save queue is what runs in the project
2. Document Authorization (Initially Incomplete)
AI Suggestion: Basic owner check in each controller
My Revision: Centralized DocumentAccessService with comprehensive permission checks
Reason: Avoids duplicated checks that can drift apart, and gives one place to audit security
Current state: All document and sharing endpoints go through the centralized service
3. Error Handling (Generic Implementation)
AI Suggestion: Simple try-catch blocks with basic errors
My Revision: Global exception filter with structured error responses
Reason: Consistent error format and easier debugging
Current state: The global exception filter handles errors across the API
Deliberate Deviations From AI Output (Reviewed and Changed by Me)
4. Production Deployment Setup
My Decision: Deployed the three layers separately and configured each one deliberately instead of accepting default settings: the Supabase database through the Session pooler connection string (not the direct connection, which depends on IPv6 and failed from the hosting platform), the Railway backend built from the /backend Root Directory with the platform's automatic build detection and no custom config file (a corrupted railway.json had broken the build, so I removed it), and the Vercel frontend pointing to the Railway API
Verification: I diagnosed and fixed the build and connection errors myself from the deployment logs, then tested the live application end to end
Current state: The deployed backend connects through the Session pooler via DATABASE_URL and deploys from the backend folder without a custom Railway config file
Rejected Suggestions
1. Real-time Collaboration
AI Suggestion: WebSocket implementation for live editing
Rejection Reason: Out of scope for MVP, added complexity
2. File Export Feature
AI Suggestion: PDF and DOCX export functionality
Rejection Reason: Time constraints, focused on core features first
3. Advanced Search
AI Suggestion: Full-text search with PostgreSQL extensions
Rejection Reason: Performance concerns for initial deployment
🧪 Verification and Testing Approach
AI-Assisted Testing
Unit Tests: AI generated test skeletons, I added edge cases
E2E Tests: AI suggested test scenarios, I implemented the comprehensive flows
Type Checking: AI configured TypeScript, I verified the strict settings
Manual Verification (Done Personally)
Authentication Flow: Manually tested login, logout, token refresh
Permission System: Verified VIEWER/EDITOR restrictions work correctly
File Import: Tested various file formats and edge cases
UI/UX: Manual browser testing for responsive design and usability
Auto-save: Made rapid consecutive edits and verified the latest content was persisted in the correct order
Deployed Environment: Tested the live Vercel + Railway + Supabase setup, including CORS and database connectivity
Testing Decisions Made Through Engineering Judgment
1. E2E Test Focus
Decision: Focus on sharing authorization as the most critical path
Reason: Sharing involves multiple users and permissions, the highest risk area
2. Unit Test Coverage
Decision: Comprehensive tests for file conversion utilities
Reason: Complex logic with multiple input formats needs robust validation
3. Manual Browser Testing
Decision: Full user journey testing despite having E2E tests
Reason: UI interactions and user experience cannot be fully automated
🏗 Architectural Decisions Made Through Engineering Judgment
1. Monolithic vs Microservices
Decision: Monolithic architecture
Reason: Project scale doesn't justify microservices complexity
AI Input: Suggested both options, I chose based on requirements
2. State Management
Decision: React Query for server state, local state for UI
Reason: Optimal for REST APIs with caching needs
AI Input: Suggested multiple options (Redux, Zustand, Context)
3. Database Choice
Decision: PostgreSQL with Prisma
Reason: JSON support for document content, strong TypeScript integration
AI Input: Compared with MongoDB, SQLite, MySQL options
4. Deployment Strategy
Decision: Separate hosting for frontend (Vercel), backend (Railway), and database (Supabase)
Reason: Cost-effective, scalable, follows modern best practices
AI Input: Suggested various cloud providers and configurations
📊 AI Usage Statistics
Code Generation
Estimated AI-generated: 60-70% of initial implementation
Human-reviewed and modified: 100% of the final codebase
Lines of code: ~3000 total (frontend + backend)
Time Savings
Estimated acceleration: 3-4x faster development
Complex features: Sharing system completed in hours vs days
Quality Improvements
Consistency: AI helped keep consistent patterns across the codebase
Best Practices: Built-in security and performance suggestions, which I validated
Documentation: Comprehensive inline comments and type definitions
🔄 Iterative Development Process
Phase 1: Requirements → AI Prototype
Human: Define requirements and user stories
AI: Generate initial implementation sketches
Collaboration: Review and refine architecture
Phase 2: Implementation → AI Assistance
AI: Generate boilerplate and repetitive code
Human: Add business logic and complex features
Collaboration: Pair programming style interaction
Phase 3: Testing → AI + Human
AI: Generate test cases and skeletons
Human: Add edge cases and integration tests
Collaboration: Debug and fix issues together
Phase 4: Polish and Deployment → Human-led
Human: Refine UI/UX, optimize performance, deploy and verify the live app
AI: Suggest improvements and catch issues
Collaboration: Final review
🎯 Key Learnings
What AI Excels At
Boilerplate Generation: Setting up projects, configurations, repetitive code
Pattern Implementation: Following established patterns consistently
Documentation: Generating comprehensive comments and docs
Bug Detection: Finding potential issues in existing code
Where Human Judgment is Critical
Architectural Decisions: Balancing tradeoffs for specific use cases
User Experience: Understanding nuanced human interactions
Security Considerations: Depth of defense-in-depth thinking
Performance Optimization: Real-world usage pattern understanding
Effective Collaboration Patterns
AI as First Draft: Let AI create the initial implementation, then refine
Human as Reviewer: Always review and understand AI-generated code
Iterative Refinement: Multiple rounds of improvement yield the best results
Domain Knowledge: Human provides context, AI provides implementation
🚀 Future AI Integration Plans
Immediate Improvements
Enhanced Testing: AI-generated property-based tests
Performance Analysis: AI-assisted profiling and optimization
Security Auditing: Automated vulnerability scanning
Long-term Vision
AI-assisted Refactoring: Automated code quality improvements
Predictive Development: AI suggesting features based on usage patterns
Self-documenting Code: Real-time documentation generation
📝 Conclusion

AI tools (Antigravity IDE, OpenCode, Claude Code, and ChatGPT) significantly accelerated the development of DocSpace. The most effective workflow combined AI's code generation with my own architectural judgment, hands-on testing, and security awareness. I reviewed the generated code, tested the application myself, and verified that the workflow and the deployed system behave correctly. Where AI output was not the best solution, I replaced it, and the implementation in the repository reflects those final decisions.
# Moodlet Architecture

## Overview

### Project Description

Moodlet is a cloud-native collaborative moodboarding application designed for creative teams who need to discuss and iterate on creative projects in real-time while working remotely. It enhances communication for creative projects and significantly reduces time spent on iterations and back-and-forth proofing by enabling users to quickly upload creative files, build moodboards, and collaborate with instant visual feedback.

### Core Features

**Board Management**

- Create, view, edit, and delete personal boards
- Access boards from a centralized "My Boards" page
- Share boards via email or direct link

**Canvas Elements**

- Add and manipulate multiple content types: sticky notes, text, images, PDFs, and links
- Drag-and-drop interface for intuitive positioning
- Real-time element updates across all connected users

**Real-Time Collaboration**

- See collaborators' cursors and actions in real-time
- Simultaneous editing without conflicts
- Live updates as users add, move, or modify elements
- Similar to Figma but lighter and focused on rapid creative brainstorming

**Collaboration & Permissions**

- Invite collaborators to boards
- Granular permission controls: Owner, Editor, Viewer, Commenter
- Thread-based commenting system on canvas elements

### High-Level Architecture

![High-Level Architecture](../diagrams/high-level-architecture.png)

The architecture follows a client-server model with three primary layers:

**Client Layer (Browser)**

- React single-page application built with Vite
- Konva.js for high-performance canvas rendering
- Zustand for state management
- Communicates with backend via two protocols: REST and WebSocket

**Backend Layer (Express Server)**

- Node.js/Express server handling two communication patterns:
  - **REST API**: All CRUD operations and data retrieval (auth, boards, elements, collaborators, comments)
  - **WebSocket Server**: Real-time collaboration events (element updates, cursor positions, user presence)
- Prisma ORM for type-safe database access
- Manages file uploads to S3

**Data Layer**

- **PostgreSQL** (AWS RDS): Primary database for users, boards, elements, collaborators, comments
- **AWS S3**: Object storage for user-uploaded images, PDFs, and other files

### Technology Stack

- **Frontend**: React, TypeScript, Vite, Zustand, Konva, Tailwind CSS
- **Backend**: Node.js, Express, Socket.io, Prisma
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod schemas (shared between client and server)
- **Real-time**: Socket.io for WebSocket communication
- **Cloud Infrastructure**: AWS (RDS, S3, ECS, CloudFront)
- **Infrastructure as Code**: Terraform
- **Testing**: Vitest for unit and integration tests

See [TECH_STACK.md](./TECH_STACK.md) for detailed technology rationale.

### Architecture Principles

#### 1. Real-Time First

**Principle**: Prioritize real-time collaboration as the core feature that drives architectural decisions.

Real-time collaboration is what differentiates Moodlet from static moodboarding tools. The architecture treats WebSocket connections as first-class citizens, not an afterthought. This means optimistic UI updates for immediate user feedback, real-time events that take precedence where needed, and data models designed around collaborative editing.

**Implementation Examples**:

- Element updates broadcast via WebSocket before database persistence completes
- Client-side state optimistically updates on user actions for instant responsiveness
- Cursor positions shared in real-time without database writes
- WebSocket rooms organized by board ID for efficient event broadcasting

#### 2. MVP Simplicity

**Principle**: Start with the simplest architecture that works, avoiding premature optimization and over-engineering.

As a portfolio and learning project, shipping a working demonstration is more valuable than a perfectly scalable system. Simple architectures are easier to understand, debug, explain in interviews, and iterate upon. This principle guides decisions to defer complexity until it's needed.

**Implementation Examples**:

- Single monolithic Express server (REST + WebSocket in one process)
- Last-write-wins conflict resolution instead of complex CRDT or Operational Transformation
- File uploads flow through server before reaching S3 (simpler than pre-signed URLs)
- No Redis or caching layer initially—PostgreSQL handles all persistence
- Focus on core collaboration features, defer edge cases and advanced optimizations

**Known Trade-offs**:

- Single server limits horizontal scaling (mitigated by stateless JWT design)
- Last-write-wins may lose data in rare simultaneous edit scenarios
- Server-side file uploads consume bandwidth (acceptable for MVP scale)

#### 3. Designed for Scalability

**Principle**: Make MVP decisions that don't block future scaling, even if advanced features aren't implemented now.

While maintaining MVP simplicity, the architecture uses patterns and technologies that can evolve to handle production scale. This demonstrates understanding of production systems and architectural evolution without over-engineering the initial implementation.

**Scalability Patterns**:

- **Layered Backend**: Controllers → Services → Repositories pattern enables future extraction into microservices
- **Stateless Authentication**: JWT tokens eliminate server-side session storage, enabling horizontal scaling
- **WebSocket Architecture**: Socket.io rooms support multi-server deployments via Redis adapter (not implemented in MVP)
- **Containerization**: Docker-ready for deployment to ECS/Kubernetes
- **Database Design**: Indexed foreign keys, normalized schema ready for sharding

**Documented Evolution Path**:

| Aspect                  | MVP (Current)           | Production                         | At Scale                           |
| ----------------------- | ----------------------- | ---------------------------------- | ---------------------------------- |
| **Server**              | Single Express instance | Load balancer + multiple instances | Separate API and WebSocket servers |
| **Conflict Resolution** | Last-write-wins         | Optimistic locking                 | CRDT or Operational Transformation |
| **File Uploads**        | Server → S3             | Pre-signed URLs (direct upload)    | CDN + image processing pipeline    |
| **Sessions**            | JWT only                | Redis for active sessions          | Distributed cache with pub/sub     |
| **Database**            | Single RDS instance     | Read replicas                      | Sharded database                   |

This approach shows pragmatic engineering: solve today's problems simply while keeping tomorrow's solutions possible.

---

## System Architecture

### Component Overview

The system is composed of three main components:

#### **Client (React SPA)**

**Responsibilities**:

- Render interactive canvas UI using Konva.js
- Manage local application state with Zustand
- Handle user input and interactions
- Maintain WebSocket connection for real-time updates
- Perform optimistic UI updates before server confirmation
- Manage authentication tokens (JWT storage)

**Key Technologies**:

- React 19 with TypeScript for UI components
- Konva + react-konva for canvas rendering and manipulation
- Zustand for lightweight state management
- TanStack Query for server state synchronization
- Axios for HTTP requests
- Socket.io-client for WebSocket communication

#### **Backend (Express Server)**

**Responsibilities**:

- Provide REST API for all CRUD operations and data retrieval
- Manage WebSocket connections and real-time event broadcasting
- Authenticate and authorize users (JWT validation)
- Validate all incoming data with Zod schemas
- Orchestrate business logic (board permissions, file uploads)
- Persist data to PostgreSQL via Prisma
- Upload and retrieve files from S3

**Key Technologies**:

- Express.js for HTTP server and routing
- Socket.io for WebSocket server
- Prisma for type-safe database access
- Zod for runtime validation
- jsonwebtoken for JWT creation/validation
- bcrypt for password hashing

**Architecture Layers**:

```
Routes (API endpoints)
    ↓
Controllers (request/response handling)
    ↓
Services (business logic)
    ↓
Repositories (data access)
    ↓
Prisma (ORM)
    ↓
Database
```

#### **Data Layer**

**PostgreSQL Database (AWS RDS)**:

- Single source of truth for all persistent data
- Stores: users, boards, board_collaborators, elements, comments
- ACID compliance ensures data consistency
- JSON fields for flexible element properties
- Foreign key constraints enforce referential integrity

**AWS S3 (Object Storage)**:

- Stores user-uploaded files (images, PDFs)
- Organized by board ID for logical separation
- Accessed via AWS SDK from Express server
- Future: Pre-signed URLs for direct client uploads

---

## Communication Patterns

Moodlet uses two different communication patterns, each optimized for specific use cases:

### REST API

**Use Case**: All CRUD operations and data retrieval with predictable, fixed data requirements.

**Examples**:

- User registration and authentication
- Creating, reading, updating, and deleting boards
- Managing board elements (create, update, move, delete)
- Managing collaborators and permissions
- Fetching board data with nested elements and collaborators
- Adding and retrieving comments

**Characteristics**:

- Standard HTTP methods (GET, POST, PUT/PATCH, DELETE)
- Stateless request/response cycle
- Returns JSON responses
- JWT authentication via Authorization header
- Endpoints designed for specific page/component data needs
- Type-safe via Zod validation schemas shared between client and server

### WebSocket (Socket.io)

**Use Case**: Real-time, bidirectional communication for collaborative features.

**Event Categories**:

**Element Events** (canvas changes):

- `element:created` - New element added to board
- `element:updated` - Element properties changed
- `element:moved` - Element position changed
- `element:deleted` - Element removed from board

**Cursor Events** (user presence):

- `cursor:moved` - User moved their cursor
- `cursor:left` - User cursor no longer visible

**User Events** (collaboration):

- `user:joined` - User connected to board
- `user:left` - User disconnected from board

**Comment Events**:

- `comment:added` - New comment on board
- `comment:resolved` - Comment marked as resolved

**Characteristics**:

- Room-based architecture (one room per board)
- Automatic reconnection on network failure
- Fallback to long-polling if WebSocket unavailable
- Authentication via JWT token on connection

---

## Data Flow

### Critical Flow: Real-Time Element Update

This flow demonstrates how changes propagate in real-time across all connected users.

**Scenario**: User A moves a sticky note on a shared board. User B and User C are also viewing the same board.

**Sequence**:

1. **User A drags sticky note** on canvas
   - Konva detects drag event
   - Client updates local state optimistically (immediate visual feedback)
   - Client emits WebSocket event: `element:moved`

2. **Express server receives WebSocket event**
   - Validates JWT token and board permissions
   - Validates element data with Zod schema
   - Persists new position to PostgreSQL via Prisma (async, non-blocking)
   - Broadcasts event to all users in board room (except sender)

3. **User B and User C receive WebSocket event**
   - Socket.io client receives `element:moved` event
   - Zustand store updates element position
   - React re-renders canvas with new position
   - Konva animates element to new position

4. **Database persistence completes**
   - If successful: no additional action needed
   - If failed: server emits error event, clients revert optimistic update

**Key Design Decisions**:

- **Optimistic updates**: User A sees instant feedback before server confirms
- **Broadcast before persistence**: Real-time responsiveness prioritized over consistency
- **Non-blocking database writes**: Don't wait for DB before broadcasting to other users
- **Error handling**: Failed persistence triggers rollback event to all clients

**Latency Profile**:

- User A sees change: **0ms** (optimistic)
- Users B/C see change: **50-200ms** (WebSocket round-trip)
- Database persisted: **100-300ms** (async, non-blocking)

---

## Database Design

### Schema Overview

The database uses a relational model optimized for collaborative board management. See [server/prisma/schema.prisma](../../server/prisma/schema.prisma) for the complete schema.

**Core Entities**:

#### User

- Primary entity for authentication
- Stores: email (unique), hashed password, name
- Relationships: owns boards, collaborates on boards, creates comments

#### Board

- Represents a moodboard/canvas
- Stores: name, owner reference, timestamps
- Relationships: owned by one user, has many collaborators, has many elements, has many comments

#### BoardCollaborator

- Junction table for many-to-many user-board relationship
- Stores: board ID, user ID, role (owner/editor/viewer/commenter)
- Enables permission-based access control

#### Element

- Represents items on the canvas (notes, images, text, shapes, etc.)
- Stores: type, position (x, y), dimensions (width, height), flexible data (JSON)
- Uses **JSONB** for element-specific properties (color for notes, URL for images, etc.)
- Relationships: belongs to one board

#### Comment

- Represents discussion threads
- Stores: content, optional canvas position (x, y), resolved status
- Relationships: belongs to one board, created by one user

### Key Design Decisions

**Why JSON for Element Data?**

- Different element types require different properties (note color, image URL, text content)
- Avoids creating separate tables per element type
- Flexible schema enables rapid iteration on new element types
- PostgreSQL JSONB provides indexing and query capabilities
- Trade-off: Less type safety at database level (mitigated by Zod validation)

**Indexing Strategy**:

- Foreign keys indexed for join performance (`boardId`, `userId`, `ownerId`)
- Unique constraint on `(boardId, userId)` in BoardCollaborator prevents duplicates
- Composite indexes on frequently queried combinations

**Cascading Deletes**:

- Deleting a board cascades to elements, collaborators, and comments
- Deleting a user does NOT cascade (preserve board ownership or reassign)

---

## Real-Time Collaboration Strategy

Real-time collaboration is the architectural centerpiece of Moodlet. This section details how multiple users can simultaneously edit the same board.

### Connection Management

**WebSocket Lifecycle**:

1. **Client connects** to WebSocket server on page load
   - Sends JWT token for authentication
   - Server validates token and extracts user ID

2. **Client joins board room**
   - Emits `join:board` event with board ID
   - Server validates user has permission to access board
   - Server adds socket to board-specific room (`board:${boardId}`)
   - Server broadcasts `user:joined` to other users in room

3. **Active session**
   - Client sends events (element updates, cursor moves)
   - Server broadcasts to room
   - Client receives events from other users

4. **Client disconnects**
   - Server detects disconnection (network failure, tab close, etc.)
   - Server broadcasts `user:left` to room
   - Socket automatically removed from room

**Room-Based Architecture**:

- Each board has a dedicated Socket.io room
- Rooms enable efficient broadcasting (only send to relevant users)
- Users can be in multiple rooms (multiple boards open in tabs)
- Room name format: `board:${boardId}`

### Event Flow

**Outbound (Client → Server)**:

```javascript
// User moves an element
socket.emit("element:moved", {
  boardId: "abc123",
  elementId: "xyz789",
  x: 150,
  y: 200,
});
```

**Server Processing**:

1. Validate user is in board room
2. Validate element exists and belongs to board
3. Validate user has edit permissions
4. Update database (async)
5. Broadcast to room

**Inbound (Server → Other Clients)**:

```javascript
// Other users receive the update
socket.on("element:moved", (data) => {
  // Update Zustand store
  // Re-render canvas
});
```

### Conflict Resolution

**Strategy: Last-Write-Wins (MVP)**

When two users edit the same element simultaneously:

1. Both clients optimistically update their local state
2. Both send WebSocket events to server
3. Server processes events in order received
4. Last event to reach server "wins"
5. All clients eventually converge to the same state

**Example Conflict**:

- User A moves element to (100, 100) at 10:00:00.000
- User B moves element to (200, 200) at 10:00:00.001
- Server receives A's event first, broadcasts (100, 100)
- Server receives B's event second, broadcasts (200, 200)
- All clients end at (200, 200)

**Known Limitations**:

- User A's change is "lost" (overwritten by User B)
- Brief flicker on User B's screen as they see (100, 100) then (200, 200)
- Rare in practice due to low probability of exact simultaneous edits

**Future Improvements** (documented, not implemented):

- **Operational Transformation**: Resolve conflicts by transforming operations
- **CRDTs**: Conflict-free replicated data types guarantee convergence
- **Pessimistic Locking**: Lock elements during editing (bad UX but guaranteed consistency)

### State Synchronization

**Initial Load** (new user joins board):

1. Client requests board data via REST API
2. Receives full state: all elements, collaborators, comments
3. Renders canvas with current state
4. Opens WebSocket connection
5. Receives real-time updates from that point forward

**Reconnection** (user's network drops):

1. Socket.io automatically attempts reconnection
2. Client detects reconnection event
3. Client re-fetches board state via REST API (sync with changes during disconnect)
4. Client re-joins board room
5. Resumes real-time updates

**Offline/Online Transitions**:

- MVP: No offline support—requires active connection
- Future: Local storage cache for offline editing, sync on reconnection

---

## State Management

State in Moodlet exists at three different layers, each with specific responsibilities:

### Client State (Zustand)

**Stores**:

- Current board data (elements, collaborators, metadata)
- Canvas viewport (zoom level, pan position)
- UI state (selected elements, active tool, modal visibility)
- User cursor position
- Temporary state (drag position, resizing handles)

**Characteristics**:

- Single store with slices for different concerns
- Optimistic updates applied immediately
- Merged with real-time updates from WebSocket
- Persists across navigation within app (single-page app)
- Cleared on page refresh

**Update Sources**:

- User interactions (click, drag, type)
- WebSocket events (other users' changes)
- REST API responses (initial load, explicit refetch)

### Server State (In-Memory)

**Stores** (ephemeral, not persisted):

- Active WebSocket connections (socket ID → user ID mapping)
- User presence per board (who's currently viewing/editing)
- Temporary collaboration state (active cursors, typing indicators)

**Characteristics**:

- Lost on server restart (acceptable for MVP)
- Future: Move to Redis for persistence across server instances

### Persistent State (PostgreSQL)

**Stores** (permanent, source of truth):

- Users (accounts, credentials)
- Boards (metadata, ownership)
- Collaborators (permissions)
- Elements (canvas content)
- Comments (discussions)

**Characteristics**:

- ACID guarantees for consistency
- Accessed via Prisma ORM
- Indexed for query performance
- Backed up regularly (AWS RDS automated backups)

### State Flow Example

**User adds a sticky note**:

1. **Optimistic client update**:
   - Zustand store adds element with temporary ID
   - Canvas immediately renders new sticky note

2. **WebSocket broadcast**:
   - Server receives `element:created` event
   - Server adds to in-memory list of "pending elements"
   - Server broadcasts to other users (they update Zustand stores)

3. **Database persistence**:
   - Server writes to PostgreSQL via Prisma
   - Database generates permanent ID
   - Server emits `element:confirmed` with real ID
   - All clients replace temporary ID with real ID in Zustand

4. **Future page loads**:
   - REST API fetches from PostgreSQL
   - Element appears in initial state

---

## Authentication & Authorization

### Authentication (Who are you?)

**Strategy: JWT (JSON Web Tokens)**

**Registration Flow**:

1. User submits email, password, name
2. Server validates with Zod schema
3. Server hashes password with bcrypt (salt rounds: 10)
4. Server creates user in database
5. Server generates JWT token (payload: `{ userId, email }`)
6. Server returns JWT to client
7. Client stores JWT in memory (React state) and localStorage (persistence)

**Login Flow**:

1. User submits email, password
2. Server looks up user by email
3. Server compares password hash with bcrypt
4. If valid: generate JWT and return
5. If invalid: return 401 Unauthorized

**JWT Structure**:

```json
{
  "userId": "abc123",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234999999
}
```

**Token Configuration**:

- **Algorithm**: HS256 (symmetric signing)
- **Secret**: Environment variable `JWT_SECRET`
- **Expiration**: 7 days
- **Storage**: Client stores in memory + localStorage
- **Transmission**: `Authorization: Bearer <token>` header

**WebSocket Authentication**:

- Client sends JWT in connection handshake
- Server validates token before accepting connection
- Invalid token → connection rejected

### Authorization (What can you do?)

**Permission Model**:

Each board has collaborators with roles:

- **Owner**: Full control (edit, delete board, manage collaborators)
- **Editor**: Edit elements, add comments
- **Viewer**: View only, no edits
- **Commenter**: View and add comments, no element edits

**Permission Checks**:

REST/GraphQL:

```javascript
// Middleware validates JWT and loads user
// Controller checks board permission
const collaboration = await prisma.boardCollaborator.findUnique({
  where: { boardId_userId: { boardId, userId } },
});

if (!collaboration || collaboration.role === "viewer") {
  throw new ForbiddenError();
}
```

WebSocket:

```javascript
// On element:update event
socket.on("element:update", async (data) => {
  const hasPermission = await checkBoardPermission(userId, boardId, "editor");
  if (!hasPermission) {
    socket.emit("error", { message: "Insufficient permissions" });
    return;
  }
  // Process update
});
```

**Security Considerations**:

- All database queries filtered by user permissions
- Board IDs are UUIDs (not sequential integers) to prevent enumeration
- File uploads validated for type and size
- Input sanitization via Zod schemas prevents injection attacks

---

## Error Handling & Resilience

### Error Categories

#### Validation Errors (400 Bad Request)

- **Cause**: Client sends invalid data
- **Handling**: Zod schema validation catches before processing
- **Response**: Return detailed validation errors to client
- **Example**: Missing required field, invalid email format

#### Authentication Errors (401 Unauthorized)

- **Cause**: Missing or invalid JWT token
- **Handling**: Middleware intercepts before reaching controller
- **Response**: Return 401, client redirects to login
- **Example**: Expired token, malformed token

#### Authorization Errors (403 Forbidden)

- **Cause**: User lacks permission for requested action
- **Handling**: Permission check in controller or service layer
- **Response**: Return 403 with message
- **Example**: Viewer trying to edit element

#### Not Found Errors (404)

- **Cause**: Requested resource doesn't exist
- **Handling**: Database query returns null
- **Response**: Return 404
- **Example**: Board ID doesn't exist, element deleted

#### Server Errors (500 Internal Server Error)

- **Cause**: Unexpected error (database down, S3 failure, bug)
- **Handling**: Global error handler catches all unhandled errors
- **Response**: Return 500, log error for debugging
- **Example**: Database connection timeout

### Resilience Patterns

#### WebSocket Disconnection

**Automatic Reconnection** (Socket.io default):

- Exponential backoff (1s, 2s, 4s, 8s, ...)
- Max attempts: infinite (until user closes tab)
- Client shows "Reconnecting..." indicator

**Manual Recovery**:

```javascript
socket.on("disconnect", () => {
  // Show offline indicator
});

socket.on("connect", () => {
  // Re-fetch board state to sync missed changes
  refetchBoard();
  // Re-join board room
  socket.emit("join:board", { boardId });
});
```

#### Failed Database Writes

**Optimistic Update Rollback**:

1. Client optimistically adds element
2. Server attempts database write
3. Write fails (constraint violation, timeout, etc.)
4. Server emits `element:error` event
5. Client rolls back optimistic update
6. Client shows error toast to user

#### Network Timeouts

**Client-Side**:

- HTTP requests timeout after 30 seconds
- Show error message, allow retry
- GraphQL queries have retry logic (TanStack Query)

**Server-Side**:

- Database queries timeout after 10 seconds
- Return 503 Service Unavailable
- Client can retry

#### Concurrent Edit Conflicts

**Last-Write-Wins** (see Real-Time Collaboration Strategy):

- Accept data loss in rare simultaneous edits
- Future: Implement conflict detection and user notification

---

## Performance Considerations

### Canvas Rendering Optimization

**Konva.js Layers**:

- Separate layers for static vs dynamic content
- Only re-render layers that changed
- Batch updates using `requestAnimationFrame`

**Element Virtualization** (future):

- Only render elements in viewport
- Improves performance with 1000+ elements on board

### Database Query Optimization

**Indexing**:

- All foreign keys indexed
- Composite indexes on common query patterns
- Prisma generates optimized SQL

**Query Optimization**:

- Use GraphQL field selection to avoid over-fetching
- Prisma includes/selects only needed relations
- Pagination for large result sets

**Connection Pooling**:

- Prisma manages connection pool (default: 10 connections)
- Reuses connections across requests

### WebSocket Message Throttling

**Cursor Position Updates**:

- Throttled to max 10 updates/second
- Reduces bandwidth for high-frequency events
- No noticeable UX degradation

**Element Drag Updates**:

- Send updates on drag end, not during drag
- Reduces event spam during continuous movement
- Other users see smooth animation to final position

### File Upload Optimization

**Current (MVP)**:

- Max file size: 10MB
- Allowed types: images (JPEG, PNG, GIF, WebP), PDFs
- Basic validation before upload

**Future**:

- Image compression before upload (reduce bandwidth)
- Thumbnails for preview (reduce S3 costs)
- Progressive upload (chunking for large files)
- Pre-signed URLs (direct S3 upload, bypass server)

---

## Security Considerations

### Input Validation

**Zod Schemas**:

- All API inputs validated against Zod schemas
- Shared schemas between client and server (monorepo benefit)
- Type coercion and sanitization
- Prevents injection attacks (SQL, XSS, etc.)

### SQL Injection Prevention

**Prisma ORM**:

- Parameterized queries (no string concatenation)
- Type-safe query builder
- Automatic escaping

### XSS Prevention

**React**:

- Automatic escaping of rendered content
- Dangerous HTML explicitly marked with `dangerouslySetInnerHTML` (not used)

**Content Security Policy** (future):

- Restrict script sources
- Prevent inline scripts

### CORS Configuration

**Development**:

- Allow `http://localhost:5173` (Vite dev server)

**Production**:

- Allow only production client domain
- Credentials allowed for cookie-based auth (if implemented)

### File Upload Security

**Validation**:

- File type validation (MIME type + extension)
- File size limits (10MB)
- Virus scanning (future)

**Storage**:

- Files stored with generated UUIDs (prevent path traversal)
- Access controlled via pre-signed URLs (future)

### Rate Limiting (Future)

**API Endpoints**:

- Max 100 requests/minute per user
- Prevents brute force attacks

**WebSocket Events**:

- Max 50 events/second per connection
- Prevents spam and DoS

---

## Scalability & Future Improvements

### Current Limitations (MVP)

1. **Single Server Instance**
   - Cannot horizontally scale
   - Single point of failure
   - Limited by single machine resources

2. **Last-Write-Wins Conflicts**
   - Rare data loss in simultaneous edits
   - No conflict notification to users

3. **No Caching Layer**
   - All queries hit PostgreSQL
   - Slower response times for repeated queries

4. **File Uploads Through Server**
   - Server bandwidth bottleneck
   - Doesn't scale with many concurrent uploads

5. **No Offline Support**
   - Requires active internet connection
   - Poor experience on unreliable networks

### Production-Ready Improvements

**Infrastructure**:

- Application Load Balancer (ALB) for traffic distribution
- Multiple ECS tasks (horizontal scaling)
- Redis for session storage and pub/sub (Socket.io multi-server support)
- CloudFront CDN for static assets (React app, user uploads)
- RDS read replicas for query performance

**Features**:

- Pre-signed S3 URLs for direct client uploads
- Optimistic locking for conflict detection
- Rate limiting and request throttling
- Error tracking (Sentry) and monitoring (CloudWatch)
- Automated database backups and point-in-time recovery

**Code Quality**:

- Comprehensive test coverage (unit, integration, E2E)
- CI/CD pipeline (GitHub Actions)
- Code review process
- Performance monitoring (APM)

### At Scale (1000+ Concurrent Users)

**Architecture Evolution**:

1. **Microservices Separation**:
   - Dedicated WebSocket server (real-time events)
   - Dedicated API server (REST/GraphQL)
   - Dedicated worker service (file processing, email notifications)

2. **Database Sharding**:
   - Shard by board ID (distribute boards across multiple databases)
   - Read replicas for query load distribution

3. **Advanced Conflict Resolution**:
   - Implement CRDTs (Conflict-free Replicated Data Types)
   - Yjs or Automerge library for collaborative editing
   - Guarantees eventual consistency without data loss

4. **Edge Computing**:
   - CloudFront with Lambda@Edge for request routing
   - Geographically distributed WebSocket servers
   - Reduce latency for global users

5. **Message Queue**:
   - SQS/SNS for asynchronous operations
   - Decouple services
   - Retry failed operations

**Cost Optimization**:

- S3 lifecycle policies (move old files to Glacier)
- RDS reserved instances (cost savings)
- Elastic scaling based on traffic patterns
- Optimize database queries (query analysis, index tuning)

---

## Development & Deployment

### Local Development Setup

**Prerequisites**:

- Node.js 18+
- PostgreSQL 14+
- AWS account (for S3, optional for local dev)

**Steps**:

```bash
# Clone repository
git clone https://github.com/Ctollett/Moodlet.git
cd Moodlet

# Install dependencies
npm install

# Setup environment variables
cp server/.env.example server/.env
# Edit server/.env with database URL and JWT secret

# Generate Prisma client
npm run db:generate --workspace=server

# Run database migrations
npm run db:migrate --workspace=server

# Start development servers
npm run dev  # Starts both client and server
```

**Development URLs**:

- Client: `http://localhost:5173`
- Server: `http://localhost:3000`

### Deployment Architecture (AWS)

**Planned Infrastructure** (Terraform-managed):

```
┌─────────────────────────────────────────────┐
│              CloudFront CDN                 │
│  (Global content delivery for React app)    │
└────────┬─────────────────────────┬──────────┘
         │                         │
         ▼                         ▼
  ┌─────────────┐         ┌──────────────────┐
  │  S3 Bucket  │         │       ALB        │
  │ (Static     │         │ (Load Balancer)  │
  │  React App) │         └────────┬─────────┘
  └─────────────┘                  │
                                   ▼
                          ┌─────────────────┐
                          │   ECS Cluster   │
                          │ (Express Server)│
                          │   Fargate Tasks │
                          └────┬──────┬─────┘
                               │      │
                    ┌──────────┘      └──────────┐
                    ▼                            ▼
            ┌──────────────┐            ┌───────────────┐
            │ RDS Instance │            │  S3 Bucket    │
            │ (PostgreSQL) │            │ (User Uploads)│
            └──────────────┘            └───────────────┘
```

**AWS Services**:

- **ECS with Fargate**: Serverless container orchestration for Express app
- **RDS (PostgreSQL)**: Managed database with automated backups
- **S3**: Two buckets (static React app, user-uploaded files)
- **CloudFront**: CDN for global distribution and HTTPS
- **ALB**: Application Load Balancer for health checks and SSL termination
- **Route 53**: DNS management (optional)
- **ECR**: Container registry for Docker images

**Terraform Modules**:

- `terraform/modules/networking` - VPC, subnets, security groups
- `terraform/modules/ecs` - ECS cluster, task definitions, services
- `terraform/modules/rds` - PostgreSQL instance, parameter groups
- `terraform/modules/s3` - Buckets, policies, lifecycle rules
- `terraform/modules/cloudfront` - CDN distributions

### CI/CD Pipeline (Future)

**GitHub Actions Workflow**:

1. **On Pull Request**:
   - Run linters (ESLint, Prettier)
   - Run type checking (TypeScript)
   - Run tests (Vitest)
   - Build client and server

2. **On Merge to Main**:
   - Run all PR checks
   - Build Docker image
   - Push to ECR
   - Run Terraform plan
   - Deploy to staging environment
   - Run smoke tests

3. **On Release Tag**:
   - Deploy to production
   - Run database migrations
   - Invalidate CloudFront cache

---

## Testing Strategy

### Testing Pyramid

```
        ┌──────────┐
        │   E2E    │  Few, slow, high confidence
        │  Tests   │
        ├──────────┤
        │Integration│  Some, medium speed
        │   Tests   │
        ├──────────┤
        │   Unit    │  Many, fast, low-level
        │   Tests   │
        └──────────┘
```

### Unit Tests (Vitest)

**What to Test**:

- Validation schemas (Zod)
- Business logic functions
- Utility functions
- State management (Zustand stores)

**Example**:

```typescript
// Validate board creation schema
describe("boardSchema", () => {
  it("should accept valid board name", () => {
    const result = boardSchema.parse({ name: "My Board" });
    expect(result.name).toBe("My Board");
  });

  it("should reject empty name", () => {
    expect(() => boardSchema.parse({ name: "" })).toThrow();
  });
});
```

**Coverage Goal**: 80%+ for business logic

### Integration Tests (Vitest)

**What to Test**:

- API endpoints (REST, GraphQL)
- Database operations (Prisma repositories)
- WebSocket event handlers
- Authentication/authorization flows

**Example**:

```typescript
// Test board creation API
describe("POST /api/boards", () => {
  it("should create board for authenticated user", async () => {
    const token = await createTestUser();
    const response = await request(app)
      .post("/api/boards")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Board" });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe("Test Board");
  });
});
```

**Test Database**: Separate PostgreSQL instance or in-memory SQLite

### Component Tests (React Testing Library)

**What to Test**:

- UI components in isolation
- User interactions
- Conditional rendering
- Accessibility

**Example**:

```typescript
// Test sticky note component
describe('StickyNote', () => {
  it('should render note content', () => {
    render(<StickyNote content="Hello" color="yellow" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should call onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    render(<StickyNote content="Test" onDelete={onDelete} />);
    fireEvent.click(screen.getByLabelText('Delete note'));
    expect(onDelete).toHaveBeenCalled();
  });
});
```

### E2E Tests (Future - Playwright/Cypress)

**What to Test**:

- Critical user flows end-to-end
- Multi-user collaboration scenarios
- Cross-browser compatibility

**Example Scenarios**:

- User registers, creates board, adds sticky note
- Two users collaborate on same board in real-time
- User shares board via email, recipient gains access

**Deferred**: E2E tests skipped for MVP, added when application matures

---

## Monitoring & Observability (Future)

### Metrics to Track

**Application Performance**:

- API response times (p50, p95, p99)
- WebSocket message latency
- Database query performance
- Error rates by endpoint

**Business Metrics**:

- Active users (DAU, MAU)
- Boards created per day
- Elements added per board
- Collaboration sessions (multi-user boards)

**Infrastructure**:

- CPU and memory usage (ECS tasks)
- Database connections and query times
- S3 storage costs
- Network bandwidth

### Logging

**Structured Logging**:

- JSON format for machine parsing
- Correlation IDs for request tracing
- Log levels: DEBUG, INFO, WARN, ERROR

**What to Log**:

- All API requests (method, path, status, duration)
- Authentication failures
- Database errors
- WebSocket connections/disconnections

### Error Tracking

**Sentry Integration** (future):

- Automatic error capture on client and server
- Stack traces with source maps
- User context (anonymized)
- Release tracking for debugging

### Alerting

**CloudWatch Alarms**:

- High error rate (>5% of requests)
- Database connection pool exhausted
- ECS task failures
- High latency (p95 > 2 seconds)

---

## Known Issues & Trade-offs

### Acknowledged Technical Debt

1. **No Comprehensive Test Coverage**
   - MVP focused on feature delivery
   - Critical paths tested, edge cases deferred
   - Plan: Add tests incrementally, prioritize high-risk areas

2. **Last-Write-Wins Conflict Resolution**
   - Rare data loss in simultaneous edits
   - Acceptable for MVP (low user count, rare conflicts)
   - Plan: Implement CRDT or OT when user feedback indicates need

3. **Single Server Deployment**
   - No redundancy or failover
   - Limited scalability
   - Plan: Horizontal scaling with ALB + Redis when traffic grows

4. **No Rate Limiting**
   - Vulnerable to abuse or accidental DoS
   - Low risk for portfolio project
   - Plan: Add rate limiting before public launch

5. **File Uploads Through Server**
   - Server bandwidth bottleneck
   - Slower uploads compared to direct S3
   - Plan: Implement pre-signed URLs for production

### Design Trade-offs

**Simplicity vs Feature Richness**

- **Decision**: Limited element types (notes, text, images, PDFs, links)
- **Trade-off**: Excludes shapes, drawings, video embeds
- **Rationale**: Faster MVP delivery, demonstrate core collaboration

**Consistency vs Performance**

- **Decision**: Real-time events broadcast before database persistence
- **Trade-off**: Rare inconsistency if database write fails
- **Rationale**: Better UX (low latency), acceptable risk for MVP

**Monolith vs Microservices**

- **Decision**: Single Express server for all concerns
- **Trade-off**: Harder to scale specific components independently
- **Rationale**: Simpler development, easier debugging, sufficient for MVP scale

---

## Conclusion

Moodlet's architecture balances **real-time collaboration** requirements with **MVP simplicity** while maintaining clear **paths to scale**. The client-server design with layered backend, multiple communication protocols (REST, GraphQL, WebSocket), and modern cloud infrastructure demonstrates production-ready patterns applicable to real-world systems.

Key architectural strengths:

- **Type safety** from database to UI (Prisma → TypeScript → Zod → React)
- **Separation of concerns** (layered backend, distinct communication patterns)
- **Real-time first** design with optimistic updates and WebSocket-centric collaboration
- **Documented evolution** from MVP → Production → Scale

This architecture serves as both a **functional portfolio piece** and a **learning platform** for modern full-stack development, cloud-native deployment, and real-time collaborative systems.

---

**Next Steps**: See [API.md](./API.md) for detailed endpoint documentation and [DEPLOYMENT.md](./DEPLOYMENT.md) for Terraform setup and deployment instructions.

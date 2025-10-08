# Moodlet Data Model

## Overview

This document defines the complete data model for Moodlet, including all entities, their properties, relationships, and design decisions.

---

## Entities

Moodlet's data model consists of **4 core entities** and **1 junction table**:

1. **User** - People who use the application
2. **Board** - Collaborative moodboard canvases
3. **Element** - Objects on the canvas (notes, todos, images, PDFs, links, comment pins)
4. **Comment** - Discussion threads with replies
5. **BoardCollaborator** - Junction table linking users to boards with roles

---

## Entity Definitions

### **1. User**

Represents a person who has created an account and can own/collaborate on boards.

**Fields:**

| Field           | Type      | Constraints      | Description                        |
| --------------- | --------- | ---------------- | ---------------------------------- |
| `userId`        | UUID      | Primary Key      | Unique identifier                  |
| `email`         | String    | Unique, Required | User's email address (for login)   |
| `name`          | String    | Required         | Display name shown to other users  |
| `password`      | String    | Required         | Hashed password (bcrypt)           |
| `profileAvatar` | String    | Optional         | URL to user's profile picture (S3) |
| `createdAt`     | Timestamp | Auto-generated   | When the account was created       |
| `updatedAt`     | Timestamp | Auto-updated     | When the profile was last modified |

**Relationships:**

- Owns many **Boards** (via `Board.ownerId`)
- Collaborates on many **Boards** (via **BoardCollaborator**)
- Writes many **Comments** (via `Comment.userId`)

**Design Notes:**

- Email is unique and used for authentication
- Password is hashed using bcrypt before storage (never store plain text)
- `profileAvatar` is optional - if null, UI shows user initials instead
- `name` is displayed in collaborator lists, comments, and cursor labels

---

### **2. Board**

Represents a moodboard/canvas where users collaborate.

**Fields:**

| Field         | Type      | Constraints        | Description                              |
| ------------- | --------- | ------------------ | ---------------------------------------- |
| `boardId`     | UUID      | Primary Key        | Unique identifier                        |
| `boardName`   | String    | Required           | Title of the board                       |
| `ownerId`     | UUID      | Foreign Key → User | User who created/owns the board          |
| `description` | String    | Optional           | Brief description of the board's purpose |
| `createdAt`   | Timestamp | Auto-generated     | When the board was created               |
| `updatedAt`   | Timestamp | Auto-updated       | When the board was last modified         |

**Relationships:**

- Owned by one **User** (via `ownerId`)
- Has many collaborators via **BoardCollaborator** (many-to-many with User)
- Contains many **Elements** (via `Element.boardId`)
- Has many **Comments** (via `Comment.boardId`)

**Design Notes:**

- `ownerId` points to the user who created the board (primary owner)
- Owner is also listed in `BoardCollaborator` table with role='owner'
- `description` is optional - allows users to document board purpose
- `updatedAt` changes when board metadata changes OR when elements are added/modified

---

### **3. Element**

Represents objects on the canvas. Uses a **polymorphic design** - one table stores all element types with type-specific data in JSON field.

**Fields:**

| Field        | Type      | Constraints         | Description                          |
| ------------ | --------- | ------------------- | ------------------------------------ |
| `elementId`  | UUID      | Primary Key         | Unique identifier                    |
| `boardId`    | UUID      | Foreign Key → Board | Which board this element belongs to  |
| `type`       | Enum      | Required            | Type of element (see below)          |
| `position_x` | Float     | Required            | X coordinate on canvas               |
| `position_y` | Float     | Required            | Y coordinate on canvas               |
| `width`      | Float     | Required            | Element width in pixels              |
| `height`     | Float     | Required            | Element height in pixels             |
| `data`       | JSON      | Required            | Type-specific properties (see below) |
| `createdAt`  | Timestamp | Auto-generated      | When the element was created         |
| `updatedAt`  | Timestamp | Auto-updated        | When the element was last modified   |

**Element Types (Enum):**

- `'note'` - Sticky note
- `'todo'` - TODO list with checkboxes
- `'image'` - Uploaded image
- `'pdf'` - Uploaded PDF document
- `'link'` - External URL link
- `'comment_pin'` - Comment thread marker

**Relationships:**

- Belongs to one **Board** (via `boardId`)
- If `type='comment_pin'`: links to **Comment** thread (via `data.threadId`)

---

#### **Element Data Structures (JSON Field)**

The `data` field contains different properties based on the `type`:

**Type: `'note'` (Sticky Note)**

```json
{
  "text": "Quick note content",
  "color": "yellow" | "blue" | "pink" | "green" | "orange"
}
```

**Type: `'todo'` (TODO List)**

```json
{
  "title": "Optional list title",
  "items": [
    {
      "id": "unique-item-id",
      "text": "Task description",
      "completed": true | false
    }
  ]
}
```

**Type: `'image'` (Image)**

```json
{
  "url": "https://s3.amazonaws.com/bucket/image.jpg",
  "fileName": "original-filename.jpg",
  "thumbnailUrl": "https://s3.amazonaws.com/bucket/thumb.jpg"
}
```

**Type: `'pdf'` (PDF Document)**

```json
{
  "url": "https://s3.amazonaws.com/bucket/document.pdf",
  "fileName": "original-filename.pdf",
  "pageCount": 10
}
```

**Type: `'link'` (External Link)**

```json
{
  "url": "https://example.com",
  "title": "Link display text"
}
```

**Type: `'comment_pin'` (Comment Thread Marker)**

```json
{
  "threadId": "comment-thread-uuid",
  "userInitial": "A"
}
```

**Design Notes:**

- **Polymorphic design**: One table holds all element types
- **Shared properties**: All elements share position, size, timestamps (regular columns)
- **Type-specific properties**: Stored in flexible JSON `data` field
- **Validation**: Zod schemas validate `data` structure based on `type` in application code
- **Why JSON?**: Different element types need different properties; JSON provides flexibility without creating 6 separate tables
- Position (x, y) uses floats to support sub-pixel precision for smooth dragging

---

### **4. Comment**

Represents discussion threads on boards with support for nested replies.

**Fields:**

| Field             | Type      | Constraints                     | Description                               |
| ----------------- | --------- | ------------------------------- | ----------------------------------------- |
| `commentId`       | UUID      | Primary Key                     | Unique identifier                         |
| `content`         | String    | Required                        | The comment text/message                  |
| `userId`          | UUID      | Foreign Key → User              | User who wrote the comment                |
| `boardId`         | UUID      | Foreign Key → Board             | Board this comment belongs to             |
| `parentCommentId` | UUID      | Foreign Key → Comment, Nullable | Parent comment (null for root comments)   |
| `resolved`        | Boolean   | Default: false                  | Whether this thread is marked as resolved |
| `createdAt`       | Timestamp | Auto-generated                  | When the comment was written              |
| `updatedAt`       | Timestamp | Auto-updated                    | When the comment was last edited          |

**Relationships:**

- Belongs to one **Board** (via `boardId`)
- Written by one **User** (via `userId`)
- Can have one parent **Comment** (via `parentCommentId`) - for threading
- Can have many child **Comments** (replies) pointing to it
- Linked to one **Element** of type `'comment_pin'` (via matching threadId in element data)

**Design Notes:**

- **Threading**: `parentCommentId` creates a tree structure
  - Root comments have `parentCommentId = null`
  - Replies have `parentCommentId = <id of comment being replied to>`
- **Resolution**: `resolved` applies to root comments; when root is resolved, entire thread is considered resolved
- **Board relationship**: All comments store `boardId` for efficient querying ("all comments on this board")
- **Edit tracking**: `updatedAt` changes when comment content is edited
- **Comment pins**: A separate `Element` of type `'comment_pin'` visually represents the thread on canvas

---

### **5. BoardCollaborator** (Junction Table)

Links users to boards with specific permission roles. Enables many-to-many relationship between Users and Boards.

**Fields:**

| Field        | Type      | Constraints         | Description                    |
| ------------ | --------- | ------------------- | ------------------------------ |
| `junctionId` | UUID      | Primary Key         | Unique identifier              |
| `userId`     | UUID      | Foreign Key → User  | User who has access            |
| `boardId`    | UUID      | Foreign Key → Board | Board being accessed           |
| `role`       | Enum      | Required            | Permission level (see below)   |
| `createdAt`  | Timestamp | Auto-generated      | When collaboration was created |
| `updatedAt`  | Timestamp | Auto-updated        | When role was last modified    |

**Roles (Enum):**

- `'owner'` - Full control (can delete board, manage collaborators)
- `'editor'` - Can edit elements and add comments
- `'viewer'` - Can only view, no edits

**Relationships:**

- Connects one **User** to one **Board**
- Many BoardCollaborator records create many-to-many User ↔ Board relationship

**Constraints:**

- **Unique**: `(userId, boardId)` - a user can only have one role per board
- **Indexed**: Both `userId` and `boardId` are indexed for query performance

**Design Notes:**

- **Owner in two places**: Board owner is stored in both `Board.ownerId` AND in `BoardCollaborator` with role='owner'
  - `Board.ownerId` enables fast "show me boards I own" queries
  - `BoardCollaborator` enables unified "show me all boards I can access" queries
- **Role hierarchy**: owner > editor > viewer
- **Permission checks**: Application code checks role before allowing operations
- Board owner is automatically added to BoardCollaborator on board creation

---

## Relationships Summary

### **One-to-Many Relationships:**

**User → Board (Ownership)**

- One user can own many boards
- Each board has one owner
- Implementation: `Board.ownerId` → `User.userId`

**Board → Element**

- One board contains many elements
- Each element belongs to one board
- Implementation: `Element.boardId` → `Board.boardId`

**Board → Comment**

- One board has many comments (across all threads)
- Each comment belongs to one board
- Implementation: `Comment.boardId` → `Board.boardId`

**User → Comment**

- One user writes many comments
- Each comment is written by one user
- Implementation: `Comment.userId` → `User.userId`

**Comment → Comment (Threading)**

- One comment can have many replies
- Each reply has one parent (or null for root)
- Implementation: `Comment.parentCommentId` → `Comment.commentId`

---

### **Many-to-Many Relationships:**

**User ↔ Board (Collaboration)**

- Many users can collaborate on many boards
- Many boards can have many collaborators
- Implementation: **BoardCollaborator** junction table
  - `BoardCollaborator.userId` → `User.userId`
  - `BoardCollaborator.boardId` → `Board.boardId`
  - Stores `role` to define permission level

---

### **Special Relationships:**

**Element (comment_pin) → Comment Thread**

- One comment pin element links to one comment thread
- One thread has many comments (root + replies)
- Implementation:
  - Element with `type='comment_pin'` stores `threadId` in `data` JSON
  - Root comment has `commentId` matching the `threadId`
  - Replies link to root via `parentCommentId`
- This is a **logical relationship** (via JSON field), not a database foreign key

---

## Design Decisions

### **Why Polymorphic Elements?**

**Decision**: Use one `Element` table for all canvas object types instead of separate tables (NoteElement, TodoElement, ImageElement, etc.)

**Rationale:**

- ✅ **Simpler schema**: One table instead of 6
- ✅ **Consistent operations**: Move, resize, delete work the same for all types
- ✅ **Easy queries**: "Get all elements on board" is one query
- ✅ **Extensible**: Adding new element types doesn't require new tables
- ✅ **Canvas rendering**: All elements have same positioning/size properties

**Trade-offs:**

- ❌ Less type safety at database level (can't enforce "image must have URL")
- ❌ JSON queries are slower than regular column queries
- ✅ Mitigated by: Zod validation in application code ensures correct structure

---

### **Why Store Owner in Two Places?**

**Decision**: Board owner is stored in both `Board.ownerId` AND `BoardCollaborator` with role='owner'

**Rationale:**

- **Direct ownership** (`Board.ownerId`): Fast queries for "boards I own"
- **Unified access** (`BoardCollaborator`): Single query for "all boards I can access" (owned + collaborating)
- Common pattern for applications with ownership + sharing

**Alternative considered**: Only use BoardCollaborator

- Rejected: Querying "boards I own" would require filtering by role, less efficient

---

### **Why Comment Threading via parentCommentId?**

**Decision**: Use self-referential foreign key (`parentCommentId`) for comment threads instead of separate Thread table

**Rationale:**

- ✅ Simpler schema (no separate Thread table)
- ✅ Flexible depth (unlimited nesting if needed)
- ✅ Standard pattern for threaded discussions
- ✅ Easy to query root comments: `WHERE parentCommentId IS NULL`

**Trade-offs:**

- Need recursive queries to fetch entire thread (Prisma handles this well)

---

### **Why Separate Comment from Comment Pin?**

**Decision**: Comment pins are `Element` records (visual markers on canvas), Comments are separate table (discussion content)

**Rationale:**

- **Separation of concerns**:
  - Element = visual representation (where the bubble is on canvas)
  - Comment = content (what people are saying)
- **Can move pin without affecting comments**: Drag bubble to new position, discussion stays the same
- **Consistent with other elements**: Comment pins are positioned/sized like other canvas elements

---

### **Why JSON for Element Data?**

**Decision**: Use PostgreSQL JSON/JSONB field for type-specific element properties

**Rationale:**

- ✅ **Flexibility**: Each element type has different properties
- ✅ **No schema changes**: Adding properties to element types doesn't require migrations
- ✅ **PostgreSQL JSONB**: Indexed, queryable, performant
- ✅ **Validation in code**: Zod schemas provide type safety

**Alternative considered**: Separate tables per element type

- Rejected: Too many tables, harder to query all elements, more complex codebase

---

## Indexing Strategy

**Indexes to create for query performance:**

### **User Table:**

- Primary key on `userId` (automatic)
- Unique index on `email` (for login queries)

### **Board Table:**

- Primary key on `boardId` (automatic)
- Index on `ownerId` (for "boards owned by user" queries)

### **Element Table:**

- Primary key on `elementId` (automatic)
- Index on `boardId` (for "elements on board" queries - very common)

### **Comment Table:**

- Primary key on `commentId` (automatic)
- Index on `boardId` (for "comments on board" queries)
- Index on `userId` (for "comments by user" queries)
- Index on `parentCommentId` (for retrieving replies)

### **BoardCollaborator Table:**

- Primary key on `junctionId` (automatic)
- Unique composite index on `(userId, boardId)` (prevent duplicate collaborations)
- Index on `boardId` (for "collaborators on board" queries)
- Index on `userId` (for "boards user collaborates on" queries)

---

## Validation

**All data is validated using Zod schemas before database writes:**

**Shared schemas** (in `shared/src/schemas.ts`):

- User registration/update
- Board creation/update
- Element creation/update (with type-specific validation)
- Comment creation/update

**Type-specific element validation:**

- Each element type has its own Zod schema for the `data` field
- Application validates based on `type` before saving

---

## Data Constraints

**Required Fields:**

- All `id` fields (primary keys)
- All foreign keys (relationships)
- User: `email`, `name`, `password`
- Board: `boardName`, `ownerId`
- Element: `boardId`, `type`, `position_x`, `position_y`, `width`, `height`, `data`
- Comment: `content`, `userId`, `boardId`
- BoardCollaborator: `userId`, `boardId`, `role`

**Unique Constraints:**

- `User.email` - no duplicate emails
- `BoardCollaborator(userId, boardId)` - user can only have one role per board

**Default Values:**

- `Comment.resolved` - defaults to `false`
- All `createdAt` fields - auto-set to current timestamp
- All `updatedAt` fields - auto-update on modification

**Nullable Fields:**

- `User.profileAvatar` - optional
- `Board.description` - optional
- `Comment.parentCommentId` - null for root comments

---

## Future Enhancements (Not in MVP)

**Potential additions for Phase 2:**

### **Element Enhancements:**

- `createdBy` (userId) - track who created each element
- `updatedBy` (userId) - track who last modified element
- `zIndex` - layer order for overlapping elements
- `rotation` - element rotation in degrees
- `locked` - prevent editing/moving

### **Board Enhancements:**

- `isArchived` (boolean) - soft delete boards
- `backgroundColor` - custom board background
- `thumbnailUrl` - preview image for board list
- `lastAccessedAt` - track when user last viewed

### **User Enhancements:**

- `emailVerified` (boolean) - track email verification
- `lastLoginAt` - track login activity
- `isActive` - account status

### **Comment Enhancements:**

- `resolvedBy` (userId) - who marked it resolved
- `resolvedAt` (timestamp) - when it was resolved
- `editedAt` (timestamp) - distinct from updatedAt
- `attachments` - array of file URLs

### **New Entities:**

- **BoardInvite** - track pending invitations
- **Notification** - user notifications
- **ActivityLog** - audit trail of all actions

---

## Conclusion

This data model supports Moodlet's core collaboration features while maintaining simplicity and flexibility. The polymorphic element design enables diverse canvas content types without schema complexity. The threaded comment system provides rich discussion capabilities. The many-to-many user-board relationship via BoardCollaborator enables fine-grained permission control.

The model is designed for MVP delivery while documenting clear paths for future enhancements.

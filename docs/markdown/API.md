# Moodlet API Documentation

## Overview

Moodlet uses two communication patterns:

- **REST API**: All CRUD operations and data retrieval
- **WebSocket**: Real-time collaboration events

---

## REST API Endpoints

### Authentication

#### Register User

```
POST /api/auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token"
}
```

---

#### Login User

```
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token"
}
```

---

#### Get Current User

```
GET /api/users/me
```

**Headers:**

```
Authorization: Bearer {jwt-token}
```

**Response:**

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### Boards

#### Get All User Boards

```
GET /api/boards
```

**Headers:**

```
Authorization: Bearer {jwt-token}
```

**Response:**

```json
{
  "boards": [
    {
      "id": "board-uuid",
      "name": "My Moodboard",
      "ownerId": "user-uuid",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-02T00:00:00Z"
    }
  ]
}
```

---

#### Get Board by ID

```
GET /api/boards/:boardId
```

**Headers:**

```
Authorization: Bearer {jwt-token}
```

**Response:**

```json
{
  "id": "board-uuid",
  "name": "My Moodboard",
  "ownerId": "user-uuid",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-02T00:00:00Z",
  "elements": [
    {
      "id": "element-uuid",
      "type": "note",
      "x": 100,
      "y": 200,
      "width": 200,
      "height": 150,
      "data": {
        "content": "Sticky note text",
        "color": "yellow"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "collaborators": [
    {
      "userId": "user-uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "editor"
    }
  ]
}
```

---

#### Create Board

```
POST /api/boards
```

**Headers:**

```
Authorization: Bearer {jwt-token}
```

**Request Body:**

```json
{
  "name": "New Moodboard"
}
```

**Response:**

```json
{
  "id": "board-uuid",
  "name": "New Moodboard",
  "ownerId": "user-uuid",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

#### Update Board

```
PATCH /api/boards/:boardId
```

**Headers:**

```
Authorization: Bearer {jwt-token}
```

**Request Body:**

```json
{
  "name": "Updated Board Name"
}
```

**Response:**

```json
{
  "id": "board-uuid",
  "name": "Updated Board Name",
  "ownerId": "user-uuid",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

---

#### Delete Board

```
DELETE /api/boards/:boardId
```

**Headers:**

```
Authorization: Bearer {jwt-token}
```

**Response:**

```json
{
  "message": "Board deleted successfully"
}
```

---

### Board Elements

#### Create Element

```
POST /api/boards/:boardId/elements
```

**Headers:**

```
Authorization: Bearer {jwt-token}
```

**Request Body:**

```json
{
  "type": "note",
  "x": 100,
  "y": 200,
  "width": 200,
  "height": 150,
  "data": {
    "content": "My sticky note",
    "color": "yellow"
  }
}
```

**Response:**

```json
{
  "id": "element-uuid",
  "boardId": "board-uuid",
  "type": "note",
  "x": 100,
  "y": 200,
  "width": 200,
  "height": 150,
  "data": {
    "content": "My sticky note",
    "color": "yellow"
  },
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

#### Update Element

```
PATCH /api/boards/:boardId/elements/:elementId
```

**Headers:**

```
Authorization: Bearer {jwt-token}
```

**Request Body:**

```json
{
  "data": {
    "content": "Updated content",
    "color": "blue"
  }
}
```

**Response:**

```json
{
  "id": "element-uuid",
  "boardId": "board-uuid",
  "type": "note",
  "x": 100,
  "y": 200,
  "width": 200,
  "height": 150,
  "data": {
    "content": "Updated content",
    "color": "blue"
  },
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

---

#### Delete Element

```
DELETE /api/boards/:boardId/elements/:elementId
```

**Headers:**

```
Authorization: Bearer {jwt-token}
```

**Response:**

```json
{
  "message": "Element deleted successfully"
}
```

---

### Collaborators

#### Get Board Collaborators

```
GET /api/boards/:boardId/collaborators
```

**Headers:**

```
Authorization: Bearer {jwt-token}
```

**Response:**

```json
{
  "collaborators": [
    {
      "userId": "user-uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "editor",
      "addedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### Add Collaborator

```
POST /api/boards/:boardId/collaborators
```

**Headers:**

```
Authorization: Bearer {jwt-token}
```

**Request Body:**

```json
{
  "email": "collaborator@example.com",
  "role": "editor"
}
```

**Response:**

```json
{
  "userId": "user-uuid",
  "name": "Jane Smith",
  "email": "collaborator@example.com",
  "role": "editor",
  "addedAt": "2024-01-01T00:00:00Z"
}
```

---

#### Update Collaborator Permissions

```
PATCH /api/boards/:boardId/collaborators/:userId
```

**Headers:**

```
Authorization: Bearer {jwt-token}
```

**Request Body:**

```json
{
  "role": "viewer"
}
```

**Response:**

```json
{
  "userId": "user-uuid",
  "name": "Jane Smith",
  "email": "collaborator@example.com",
  "role": "viewer",
  "addedAt": "2024-01-01T00:00:00Z"
}
```

---

#### Remove Collaborator

```
DELETE /api/boards/:boardId/collaborators/:userId
```

**Headers:**

```
Authorization: Bearer {jwt-token}
```

**Response:**

```json
{
  "message": "Collaborator removed successfully"
}
```

---

## WebSocket Events

### Connection

#### Connect to WebSocket Server

```javascript
const socket = io("http://localhost:3000", {
  auth: {
    token: "jwt-token",
  },
});
```

---

#### Join Board Room

```javascript
socket.emit("join:board", {
  boardId: "board-uuid",
});
```

**Server Response:**

```javascript
socket.on("user:joined", (data) => {
  // { userId: 'user-uuid', name: 'John Doe' }
});
```

---

### Element Events

#### Element Created

**Client → Server:**

```javascript
socket.emit("element:created", {
  boardId: "board-uuid",
  element: {
    id: "element-uuid",
    type: "note",
    x: 100,
    y: 200,
    width: 200,
    height: 150,
    data: { content: "New note", color: "yellow" },
  },
});
```

**Server → Other Clients:**

```javascript
socket.on("element:created", (data) => {
  // { boardId, element }
});
```

---

#### Element Updated

**Client → Server:**

```javascript
socket.emit("element:updated", {
  boardId: "board-uuid",
  elementId: "element-uuid",
  updates: {
    data: { content: "Updated text", color: "blue" },
  },
});
```

**Server → Other Clients:**

```javascript
socket.on("element:updated", (data) => {
  // { boardId, elementId, updates }
});
```

---

#### Element Position Updated

**Client → Server:**

```javascript
socket.emit("element:position-updated", {
  boardId: "board-uuid",
  elementId: "element-uuid",
  x: 150,
  y: 250,
});
```

**Server → Other Clients:**

```javascript
socket.on("element:position-updated", (data) => {
  // { boardId, elementId, x, y }
});
```

---

#### Element Deleted

**Client → Server:**

```javascript
socket.emit("element:deleted", {
  boardId: "board-uuid",
  elementId: "element-uuid",
});
```

**Server → Other Clients:**

```javascript
socket.on("element:deleted", (data) => {
  // { boardId, elementId }
});
```

---

### Collaboration Events

#### Board Name Updated

**Client → Server:**

```javascript
socket.emit("board:name-updated", {
  boardId: "board-uuid",
  name: "New Board Name",
});
```

**Server → Other Clients:**

```javascript
socket.on("board:name-updated", (data) => {
  // { boardId, name }
});
```

---

#### Collaborator Added

**Client → Server:**

```javascript
socket.emit("collaborator:added", {
  boardId: "board-uuid",
  collaborator: {
    userId: "user-uuid",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "editor",
  },
});
```

**Server → Other Clients:**

```javascript
socket.on("collaborator:added", (data) => {
  // { boardId, collaborator }
});
```

---

#### Collaborator Removed

**Client → Server:**

```javascript
socket.emit("collaborator:removed", {
  boardId: "board-uuid",
  userId: "user-uuid",
});
```

**Server → Other Clients:**

```javascript
socket.on("collaborator:removed", (data) => {
  // { boardId, userId }
});
```

---

#### Collaborator Permissions Updated

**Client → Server:**

```javascript
socket.emit("collaborator:permissions-updated", {
  boardId: "board-uuid",
  userId: "user-uuid",
  role: "viewer",
});
```

**Server → Other Clients:**

```javascript
socket.on("collaborator:permissions-updated", (data) => {
  // { boardId, userId, role }
});
```

---

### Presence Events

#### User Cursor Movement

**Client → Server:**

```javascript
socket.emit("cursor:moved", {
  boardId: "board-uuid",
  x: 500,
  y: 300,
});
```

**Server → Other Clients:**

```javascript
socket.on("cursor:moved", (data) => {
  // { userId: 'user-uuid', name: 'John Doe', x: 500, y: 300 }
});
```

---

#### User Joined Board

**Server → All Clients (automatic):**

```javascript
socket.on("user:joined", (data) => {
  // { userId: 'user-uuid', name: 'John Doe' }
});
```

---

#### User Left Board

**Server → All Clients (automatic):**

```javascript
socket.on("user:left", (data) => {
  // { userId: 'user-uuid' }
});
```

---

#### Element Selection

**Client → Server:**

```javascript
socket.emit("element:selecting", {
  boardId: "board-uuid",
  elementId: "element-uuid",
});
```

**Server → Other Clients:**

```javascript
socket.on("element:selecting", (data) => {
  // { userId: 'user-uuid', name: 'John Doe', elementId: 'element-uuid' }
});
```

---

#### Element Editing (Typing Indicator)

**Client → Server:**

```javascript
socket.emit("element:editing", {
  boardId: "board-uuid",
  elementId: "element-uuid",
  isEditing: true,
});
```

**Server → Other Clients:**

```javascript
socket.on("element:editing", (data) => {
  // { userId: 'user-uuid', name: 'John Doe', elementId: 'element-uuid', isEditing: true }
});
```

---

## Error Responses

All REST endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 403 Forbidden

```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions to perform this action"
}
```

### 404 Not Found

```json
{
  "error": "Not found",
  "message": "Board not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

---

## WebSocket Error Events

### Error Event

**Server → Client:**

```javascript
socket.on("error", (data) => {
  // { message: 'Insufficient permissions', code: 'FORBIDDEN' }
});
```

---

## Request Flow Examples

### Creating and Broadcasting an Element

1. **User A creates element:**
   - Client sends: `POST /api/boards/:boardId/elements`
   - Server saves to database
   - Server responds with element data
   - Client optimistically shows element immediately

2. **Server broadcasts to others:**
   - Server emits: `socket.to(boardRoom).emit('element:created', { element })`
   - User B and User C receive WebSocket event
   - Their clients render the new element

### Moving an Element

1. **User A drags element:**
   - Client updates local position (optimistic)
   - Client emits: `socket.emit('element:position-updated', { elementId, x, y })`

2. **Server receives and broadcasts:**
   - Server validates permissions
   - Server saves to database (async)
   - Server emits to room: `socket.to(boardRoom).emit('element:position-updated', { ... })`
   - User B and User C see element move in real-time

---

## Authentication Flow

All REST endpoints (except `/api/auth/login` and `/api/auth/register`) require JWT authentication:

1. Client includes token in Authorization header: `Bearer {token}`
2. Server validates token and extracts user ID
3. Server checks user permissions for requested resource
4. Server processes request or returns 401/403 error

WebSocket authentication:

1. Client connects with token in auth handshake
2. Server validates token before accepting connection
3. Server maintains userId → socketId mapping
4. All WebSocket events include implicit user context

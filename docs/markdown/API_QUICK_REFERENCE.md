# API Quick Reference

## REST Endpoints

### Authentication

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/users/me
```

### Boards

```
GET    /api/boards                    # Get all user's boards
GET    /api/boards/:boardId           # Get board with elements & collaborators
POST   /api/boards                    # Create board
PATCH  /api/boards/:boardId           # Update board name
DELETE /api/boards/:boardId           # Delete board
```

### Elements

```
POST   /api/boards/:boardId/elements              # Create element
PATCH  /api/boards/:boardId/elements/:elementId   # Update element
DELETE /api/boards/:boardId/elements/:elementId   # Delete element
```

### Collaborators

```
GET    /api/boards/:boardId/collaborators             # Get all collaborators
POST   /api/boards/:boardId/collaborators             # Add collaborator
PATCH  /api/boards/:boardId/collaborators/:userId     # Update permissions
DELETE /api/boards/:boardId/collaborators/:userId     # Remove collaborator
```

---

## WebSocket Events

### Connection

```javascript
socket.emit("join:board", { boardId });
```

### Element Events (Emit & Listen)

```javascript
"element:created"; // { boardId, element }
"element:updated"; // { boardId, elementId, updates }
"element:position-updated"; // { boardId, elementId, x, y }
"element:deleted"; // { boardId, elementId }
```

### Collaboration Events (Emit & Listen)

```javascript
"board:name-updated"; // { boardId, name }
"collaborator:added"; // { boardId, collaborator }
"collaborator:removed"; // { boardId, userId }
"collaborator:permissions-updated"; // { boardId, userId, role }
```

### Presence Events (Emit & Listen)

```javascript
"cursor:moved"; // { boardId, x, y } → broadcasts { userId, name, x, y }
"user:joined"; // Auto-broadcast: { userId, name }
"user:left"; // Auto-broadcast: { userId }
"element:selecting"; // { boardId, elementId } → broadcasts { userId, name, elementId }
"element:editing"; // { boardId, elementId, isEditing } → broadcasts { userId, name, elementId, isEditing }
```

### Error Event (Listen only)

```javascript
"error"; // { message, code }
```

---

## Authentication

### REST

```javascript
headers: {
  'Authorization': 'Bearer {jwt-token}'
}
```

### WebSocket

```javascript
const socket = io("http://localhost:3000", {
  auth: { token: "jwt-token" },
});
```

---

## Common Patterns

### Creating an Element

```javascript
// 1. POST to REST API
const response = await fetch('/api/boards/boardId/elements', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer token' },
  body: JSON.stringify({ type: 'note', x: 100, y: 200, data: {...} })
});

// 2. Server broadcasts via WebSocket (automatic)
// Other users receive: socket.on('element:created', ...)
```

### Moving an Element (Real-time)

```javascript
// WebSocket only - no REST call
socket.emit("element:position-updated", {
  boardId: "board-uuid",
  elementId: "element-uuid",
  x: 150,
  y: 250,
});
```

### Updating Element Content

```javascript
// 1. PATCH to REST API
await fetch("/api/boards/boardId/elements/elementId", {
  method: "PATCH",
  body: JSON.stringify({ data: { content: "new text" } }),
});

// 2. Broadcast via WebSocket
socket.emit("element:updated", {
  boardId,
  elementId,
  updates: { data: { content: "new text" } },
});
```

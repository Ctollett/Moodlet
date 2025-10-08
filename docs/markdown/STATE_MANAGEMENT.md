# Moodlet State Management

## Overview

Moodlet uses **Zustand** for global state management and **React useState** for component-local state. This document defines the state architecture, store responsibilities, and guidelines for choosing between global and local state.

---

## State Management Architecture

### **Global State (Zustand)**

Used for data that multiple components need to access or data that persists across component lifecycles.

### **Local State (useState)**

Used for component-specific, temporary state that only one component (or its immediate children) need.

---

## Zustand Stores

Moodlet's global state is organized into **5 specialized stores**, each responsible for a specific domain:

```
authStore           - Authentication and current user
boardStore          - Board data and element data
canvasStore         - Canvas interaction state
collaborationStore  - Real-time presence and collaboration
uiStore             - UI state (modals, sidebars, notifications)
```

---

## Store Definitions

### **1. authStore**

**Purpose:** Manages user authentication and current user session.

**State:**

| Property | Type             | Description                                        |
| -------- | ---------------- | -------------------------------------------------- |
| `user`   | `User \| null`   | Current logged-in user (null if not authenticated) |
| `token`  | `string \| null` | JWT authentication token                           |

**User Object Structure:**

```typescript
{
  userId: string;
  email: string;
  name: string;
  profileAvatar: string | null;
}
```

**Actions:**

| Action     | Parameters                                        | Description                                  |
| ---------- | ------------------------------------------------- | -------------------------------------------- |
| `login`    | `(email: string, password: string)`               | Authenticate user, store user + token        |
| `logout`   | `()`                                              | Clear user + token, remove from localStorage |
| `setAuth`  | `(user: User, token: string)`                     | Set authenticated user (used on app load)    |
| `register` | `(email: string, name: string, password: string)` | Create new user account                      |

**Usage Examples:**

```typescript
// Check if user is logged in
const user = useAuthStore((state) => state.user);
const isLoggedIn = user !== null;

// Display user info
const userName = useAuthStore((state) => state.user?.name);

// Login
const login = useAuthStore((state) => state.login);
await login("user@example.com", "password123");

// Logout
const logout = useAuthStore((state) => state.logout);
logout();

// Make authenticated API request
const token = useAuthStore((state) => state.token);
fetch("/api/boards", {
  headers: { Authorization: `Bearer ${token}` },
});
```

**Persistence:**

- Token is stored in `localStorage` for persistence across sessions
- On app load, check `localStorage` and call `setAuth()` if token exists
- Token is validated with server on app initialization

---

### **2. boardStore**

**Purpose:** Manages board data and element data (source of truth for canvas content).

**State:**

| Property        | Type             | Description                                  |
| --------------- | ---------------- | -------------------------------------------- |
| `currentBoard`  | `Board \| null`  | The board currently being viewed             |
| `elements`      | `Element[]`      | All elements on the current board            |
| `collaborators` | `Collaborator[]` | Users with access to current board           |
| `boards`        | `Board[]`        | List of user's boards (for "My Boards" page) |
| `isLoading`     | `boolean`        | Loading state for board operations           |
| `error`         | `string \| null` | Error message if operation failed            |

**Board Object Structure:**

```typescript
{
  boardId: string;
  boardName: string;
  ownerId: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

**Element Object Structure:**

```typescript
{
  elementId: string;
  boardId: string;
  type: "note" | "todo" | "image" | "pdf" | "link" | "comment_pin";
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  data: Record<string, any>; // Type-specific properties
  createdAt: Date;
  updatedAt: Date;
}
```

**Actions:**

**Board Actions:**

| Action        | Parameters                                   | Description                              |
| ------------- | -------------------------------------------- | ---------------------------------------- |
| `loadBoard`   | `(boardId: string)`                          | Fetch board + elements, set as current   |
| `loadBoards`  | `()`                                         | Fetch user's board list                  |
| `createBoard` | `(name: string, description?: string)`       | Create new board                         |
| `updateBoard` | `(boardId: string, changes: Partial<Board>)` | Update board metadata                    |
| `deleteBoard` | `(boardId: string)`                          | Delete board (owner only)                |
| `clearBoard`  | `()`                                         | Clear current board (on navigation away) |

**Element Actions:**

| Action          | Parameters                                           | Description                      |
| --------------- | ---------------------------------------------------- | -------------------------------- |
| `addElement`    | `(element: Element)`                                 | Add new element to current board |
| `updateElement` | `(elementId: string, changes: Partial<Element>)`     | Update element properties        |
| `deleteElement` | `(elementId: string)`                                | Remove element from board        |
| `moveElement`   | `(elementId: string, x: number, y: number)`          | Update element position          |
| `resizeElement` | `(elementId: string, width: number, height: number)` | Update element size              |

**Usage Examples:**

```typescript
// Load a board
const loadBoard = useBoardStore((state) => state.loadBoard);
await loadBoard("board-123");

// Get current board
const board = useBoardStore((state) => state.currentBoard);

// Get all elements
const elements = useBoardStore((state) => state.elements);

// Add element
const addElement = useBoardStore((state) => state.addElement);
addElement({
  elementId: "elem-456",
  boardId: "board-123",
  type: "note",
  position_x: 100,
  position_y: 200,
  width: 150,
  height: 100,
  data: { text: "Hello", color: "yellow" },
});

// Update element position (during drag)
const moveElement = useBoardStore((state) => state.moveElement);
moveElement("elem-456", 250, 300);

// Delete element
const deleteElement = useBoardStore((state) => state.deleteElement);
deleteElement("elem-456");
```

**Integration with Real-time:**

- Local updates are optimistic (update store immediately)
- WebSocket broadcasts changes to other users
- Incoming WebSocket events update store via actions

---

### **3. canvasStore**

**Purpose:** Manages canvas interaction state (what the user is currently doing with elements).

**State:**

| Property             | Type             | Description                        |
| -------------------- | ---------------- | ---------------------------------- |
| `selectedElementIds` | `string[]`       | IDs of currently selected elements |
| `activeTool`         | `Tool`           | Currently active tool              |
| `draggingElementId`  | `string \| null` | ID of element being dragged        |
| `editingElementId`   | `string \| null` | ID of element being edited         |
| `viewport`           | `Viewport`       | Canvas zoom and pan state          |

**Tool Type:**

```typescript
type Tool = "select" | "note" | "todo" | "image" | "pdf" | "link" | "comment";
```

**Viewport Object:**

```typescript
{
  zoom: number; // 0.1 to 3.0
  panX: number; // Canvas pan X offset
  panY: number; // Canvas pan Y offset
}
```

**Actions:**

| Action            | Parameters                                   | Description                    |
| ----------------- | -------------------------------------------- | ------------------------------ |
| `selectElement`   | `(elementId: string)`                        | Add element to selection       |
| `deselectElement` | `(elementId: string)`                        | Remove element from selection  |
| `deselectAll`     | `()`                                         | Clear all selections           |
| `setActiveTool`   | `(tool: Tool)`                               | Change active tool             |
| `setDragging`     | `(elementId: string \| null)`                | Set element being dragged      |
| `setEditing`      | `(elementId: string \| null)`                | Set element being edited       |
| `setViewport`     | `(zoom: number, panX: number, panY: number)` | Update canvas viewport         |
| `zoomIn`          | `()`                                         | Increase zoom level            |
| `zoomOut`         | `()`                                         | Decrease zoom level            |
| `resetViewport`   | `()`                                         | Reset zoom and pan to defaults |

**Usage Examples:**

```typescript
// Get selected elements
const selectedIds = useCanvasStore((state) => state.selectedElementIds);

// Select element
const selectElement = useCanvasStore((state) => state.selectElement);
selectElement("elem-123");

// Check if element is selected
const isSelected = useCanvasStore((state) => state.selectedElementIds.includes("elem-123"));

// Change tool
const setActiveTool = useCanvasStore((state) => state.setActiveTool);
setActiveTool("note");

// Get active tool (to change cursor)
const activeTool = useCanvasStore((state) => state.activeTool);

// Start dragging
const setDragging = useCanvasStore((state) => state.setDragging);
setDragging("elem-123");

// Update viewport on zoom
const setViewport = useCanvasStore((state) => state.setViewport);
setViewport(1.5, 100, 50);
```

**Important Notes:**

- This store does NOT contain element data (that's in boardStore)
- This store does NOT modify element properties (use boardStore actions)
- This is purely for tracking user interaction state

---

### **4. collaborationStore**

**Purpose:** Manages real-time presence and collaboration state.

**State:**

| Property          | Type                             | Description                          |
| ----------------- | -------------------------------- | ------------------------------------ |
| `activeUsers`     | `ActiveUser[]`                   | Users currently online on this board |
| `cursors`         | `Record<string, CursorPosition>` | Real-time cursor positions           |
| `isConnected`     | `boolean`                        | WebSocket connection status          |
| `connectionError` | `string \| null`                 | Connection error message             |

**ActiveUser Object:**

```typescript
{
  userId: string;
  name: string;
  profileAvatar: string | null;
  color: string; // Assigned color for cursor/presence
  joinedAt: Date;
}
```

**CursorPosition Object:**

```typescript
{
  userId: string;
  x: number;
  y: number;
  color: string;
}
```

**Actions:**

| Action             | Parameters                               | Description                    |
| ------------------ | ---------------------------------------- | ------------------------------ |
| `connect`          | `(boardId: string)`                      | Connect to WebSocket for board |
| `disconnect`       | `()`                                     | Disconnect from WebSocket      |
| `addActiveUser`    | `(user: ActiveUser)`                     | Add user to active users list  |
| `removeActiveUser` | `(userId: string)`                       | Remove user from active users  |
| `updateCursor`     | `(userId: string, x: number, y: number)` | Update user's cursor position  |
| `setConnected`     | `(status: boolean)`                      | Set connection status          |

**Usage Examples:**

```typescript
// Connect to board on mount
const connect = useCollaborationStore((state) => state.connect);
useEffect(() => {
  connect(boardId);
  return () => disconnect();
}, [boardId]);

// Get active users
const activeUsers = useCollaborationStore((state) => state.activeUsers);

// Render cursors
const cursors = useCollaborationStore((state) => state.cursors);
{Object.values(cursors).map(cursor => (
  <Cursor key={cursor.userId} {...cursor} />
))}

// Show connection status
const isConnected = useCollaborationStore((state) => state.isConnected);
{!isConnected && <div>Reconnecting...</div>}
```

**WebSocket Integration:**

- WebSocket events trigger store actions
- Store updates cause React re-renders
- Throttle cursor updates to avoid performance issues

---

### **5. uiStore**

**Purpose:** Manages UI state (modals, sidebars, notifications).

**State:**

| Property        | Type                 | Description                         |
| --------------- | -------------------- | ----------------------------------- |
| `openModal`     | `ModalState \| null` | Currently open modal (null if none) |
| `sidebarOpen`   | `boolean`            | Whether sidebar is expanded         |
| `notifications` | `Notification[]`     | Active toast notifications          |

**ModalState Object:**

```typescript
{
  name: 'comment' | 'share' | 'settings' | 'delete-confirm';
  data?: any; // Modal-specific data
}
```

**Notification Object:**

```typescript
{
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // Auto-dismiss after ms
}
```

**Actions:**

| Action                | Parameters                                  | Description                |
| --------------------- | ------------------------------------------- | -------------------------- |
| `openModal`           | `(name: string, data?: any)`                | Open a modal               |
| `closeModal`          | `()`                                        | Close current modal        |
| `toggleSidebar`       | `()`                                        | Toggle sidebar open/closed |
| `showNotification`    | `(message: string, type: NotificationType)` | Show toast                 |
| `dismissNotification` | `(id: string)`                              | Remove notification        |

**Usage Examples:**

```typescript
// Open comment modal
const openModal = useUIStore((state) => state.openModal);
openModal('comment', { threadId: 'thread-123' });

// Close modal
const closeModal = useUIStore((state) => state.closeModal);
closeModal();

// Check which modal is open
const openModal = useUIStore((state) => state.openModal);
{openModal?.name === 'comment' && <CommentModal {...openModal.data} />}

// Show success notification
const showNotification = useUIStore((state) => state.showNotification);
showNotification('Board created successfully!', 'success');

// Toggle sidebar
const toggleSidebar = useUIStore((state) => state.toggleSidebar);
<button onClick={toggleSidebar}>☰</button>
```

---

## Local State (useState) Guidelines

### **When to Use useState**

Use `useState` for state that is:

- ✅ Only needed by one component (or its direct children)
- ✅ Temporary or transient (resets when component unmounts)
- ✅ Not shared across different parts of the UI
- ✅ Not updated by external events (WebSocket, API)

### **Common Use Cases**

#### **1. Form Inputs (Before Submission)**

```tsx
const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password); // Commit to Zustand
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
};
```

---

#### **2. Component-Specific UI State**

```tsx
const Dropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>Menu</button>
      {isOpen && <DropdownMenu />}
    </div>
  );
};
```

---

#### **3. Temporary Editing Drafts**

**Pattern:** Read from Zustand → Edit locally → Commit back to Zustand

```tsx
const StickyNote = ({ elementId }) => {
  // Read from Zustand (source of truth)
  const element = useBoardStore((state) => state.elements.find((e) => e.id === elementId));
  const updateElement = useBoardStore((state) => state.updateElement);

  // Local draft state
  const [draftText, setDraftText] = useState(element.data.text);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    // Commit to Zustand (syncs to server)
    updateElement(elementId, {
      data: { ...element.data, text: draftText },
    });
    setIsEditing(false);
  };

  return (
    <div onDoubleClick={() => setIsEditing(true)}>
      {isEditing ? (
        <input
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          onBlur={handleSave}
          autoFocus
        />
      ) : (
        <span>{element.data.text}</span>
      )}
    </div>
  );
};
```

---

#### **4. Hover States**

```tsx
const ElementCard = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {isHovered && <DeleteButton />}
    </div>
  );
};
```

---

#### **5. Loading/Error States (Component-Specific)**

```tsx
const ImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const addElement = useBoardStore((state) => state.addElement);

  const handleUpload = async (file) => {
    setIsUploading(true);
    setError(null);

    try {
      const url = await uploadToS3(file);
      addElement({ type: "image", data: { url } });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      {isUploading && <Spinner />}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
    </div>
  );
};
```

---

## Decision Framework

### **useState vs Zustand Decision Tree:**

```
Need to store state?
│
├─ Is it needed by multiple components at different levels?
│  ├─ Yes → Zustand
│  └─ No → Continue
│
├─ Does it need to persist when component unmounts?
│  ├─ Yes → Zustand
│  └─ No → Continue
│
├─ Is it updated by external events (WebSocket, API polling)?
│  ├─ Yes → Zustand
│  └─ No → Continue
│
├─ Is it temporary draft/input before submission?
│  ├─ Yes → useState
│  └─ No → Continue
│
├─ Is it pure UI state (hover, focus, dropdown open)?
│  ├─ Yes → useState
│  └─ No → Zustand (probably)
```

---

## Common Patterns

### **Pattern 1: Draft → Commit**

**Use Case:** Editing element properties

**Approach:**

1. Read from Zustand (source of truth)
2. Copy to local useState (draft)
3. User edits (local state updates)
4. On save/blur, commit back to Zustand

**Benefits:**

- Fast, responsive editing (no Zustand overhead)
- Other components don't re-render during editing
- Zustand remains source of truth

---

### **Pattern 2: Optimistic Updates**

**Use Case:** Adding/moving elements

**Approach:**

1. User performs action
2. Immediately update Zustand (optimistic)
3. Send to server via WebSocket
4. If server fails, rollback Zustand

**Benefits:**

- Instant UI feedback
- Feels responsive even with network latency

```tsx
const addNote = () => {
  const tempId = generateTempId();

  // Optimistic update
  addElement({ id: tempId, type: 'note', ... });

  // Send to server
  socket.emit('element:create', { id: tempId, ... });

  // Server will confirm or reject
  socket.on('element:created', (data) => {
    // Replace temp ID with real ID from server
    updateElement(tempId, { id: data.realId });
  });
};
```

---

### **Pattern 3: Derived State**

**Don't store computed values - derive them**

**❌ Bad:**

```typescript
// Don't store both
selectedElements: [...],
selectedElementCount: 3, // Redundant!
```

**✅ Good:**

```typescript
// Store only source data
selectedElementIds: [...],

// Compute in component
const selectedCount = useCanvasStore(state => state.selectedElementIds.length);
```

---

## Store Implementation Notes

### **File Structure:**

```
client/src/
└── stores/
    ├── authStore.ts
    ├── boardStore.ts
    ├── canvasStore.ts
    ├── collaborationStore.ts
    └── uiStore.ts
```

### **TypeScript Types:**

Define shared types in a separate file:

```
client/src/
└── types/
    ├── auth.types.ts
    ├── board.types.ts
    ├── element.types.ts
    └── collaboration.types.ts
```

### **Zustand Middleware:**

Consider using Zustand middleware for:

- **Persist**: Save auth token to localStorage
- **Devtools**: Debug state in browser
- **Immer**: Simpler state updates

```typescript
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

const useAuthStore = create(
  devtools(
    persist(
      (set) => ({
        // store definition
      }),
      { name: "auth-storage" },
    ),
  ),
);
```

---

## Performance Considerations

### **Selector Optimization:**

**❌ Bad (causes unnecessary re-renders):**

```typescript
const store = useBoardStore(); // Subscribes to entire store
const element = store.elements.find((e) => e.id === id);
```

**✅ Good (only re-renders when specific element changes):**

```typescript
const element = useBoardStore((state) => state.elements.find((e) => e.id === id));
```

### **Shallow Equality:**

For objects/arrays, use shallow equality:

```typescript
import { shallow } from "zustand/shallow";

const { zoom, panX, panY } = useCanvasStore((state) => state.viewport, shallow);
```

---

## Testing State

### **Zustand Store Testing:**

Stores can be tested independently:

```typescript
import { renderHook, act } from "@testing-library/react";
import { useBoardStore } from "./boardStore";

test("adds element to store", () => {
  const { result } = renderHook(() => useBoardStore());

  act(() => {
    result.current.addElement({
      id: "test-elem",
      type: "note",
      // ...
    });
  });

  expect(result.current.elements).toHaveLength(1);
  expect(result.current.elements[0].id).toBe("test-elem");
});
```

### **Component Testing:**

Mock Zustand stores in tests:

```typescript
import { vi } from 'vitest';
import { useAuthStore } from '@/stores/authStore';

vi.mock('@/stores/authStore');

test('shows login when not authenticated', () => {
  useAuthStore.mockReturnValue({ user: null });

  render(<App />);
  expect(screen.getByText('Login')).toBeInTheDocument();
});
```

---

## Summary

**Zustand Stores (Global State):**

- authStore - Who is logged in
- boardStore - Board + element data (source of truth)
- canvasStore - Canvas interactions (select, drag, tool)
- collaborationStore - Real-time presence
- uiStore - UI state (modals, notifications)

**useState (Local State):**

- Form inputs before submission
- Component-specific UI (hover, dropdown)
- Temporary editing drafts
- Loading/error states (component-level)

**Key Principle:**

> Use Zustand for shared data, useState for local interactions. When in doubt, start with useState and promote to Zustand if multiple components need it.

---

## Next Steps

1. Implement Zustand stores in `client/src/stores/`
2. Define TypeScript types in `client/src/types/`
3. Create store hooks with selectors
4. Test stores independently
5. Integrate with components
6. Connect to WebSocket for real-time updates
7. Add persistence middleware for auth

See [FRONTEND_ARCHITECTURE.md](./FRONTEND_ARCHITECTURE.md) for component structure and [API.md](./API.md) for backend integration.

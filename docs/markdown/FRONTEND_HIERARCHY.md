# Moodlet Frontend Component Hierarchy

## Overview

This document outlines the complete frontend architecture for Moodlet, including pages, routes, components, and their associated Zustand stores.

---

## Pages & Routes

### **1. Welcome Page** - route `/`

**Purpose:** Landing page with authentication modals  
**Stores:** `authStore`

**Component Structure:**

```
WelcomePage
├── WelcomeHeader
│   ├── Logo
│   ├── LoginButton
│   └── SignUpButton
├── WelcomeHero
│   ├── Welcome message
│   └── Call-to-action content
├── LoginModal (triggered by LoginButton)
│   ├── EmailInput
│   ├── PasswordInput
│   ├── LoginSubmitButton
│   └── Link to switch to RegisterModal
└── RegisterModal (triggered by SignUpButton)
    ├── NameInput
    ├── EmailInput
    ├── PasswordInput
    ├── SignUpSubmitButton
    └── Link to switch to LoginModal
```

### **2. Dashboard Page** - route `/dashboard`

**Purpose:** User's board management hub  
**Stores:** `boardStore`, `authStore`

**Component Structure:**

```
DashboardPage
├── DashboardHeader
│   ├── "My Boards" title
│   ├── Board count display
│   └── User avatar/menu
├── BoardGrid
│   ├── NewBoardButton
│   └── BoardCard (for each board)
│       ├── Board preview/thumbnail
│       ├── Board name
│       └── DeleteButton (shows on hover)
└── DeleteBoardModal (triggered by DeleteButton)
    ├── Warning message
    ├── Board preview
    └── Cancel/Confirm buttons
```

### **3. Canvas Page** - route `/board/:boardId`

**Purpose:** Main collaborative workspace  
**Stores:** `boardStore`, `collaborationStore`, `canvasStore`, `authStore`

**Component Structure:**

```
CanvasPage
├── CanvasHeader
│   ├── Column 1
│   │   ├── Breadcrumb (back to dashboard)
│   │   └── BoardTitle
│   └── Column 2
│       ├── ShareButton
│       ├── UserAvatars (who has access)
│       └── ActiveUsers (live presence indicator)
├── ShareModal (triggered by ShareButton)
├── CanvasContainer
│   ├── ElementToolbar
│   │   ├── Sticky note tool
│   │   ├── Todo tool
│   │   ├── Image tool
│   │   ├── PDF tool
│   │   ├── Link tool
│   │   └── Comment tool
│   ├── ZoomToolbar
│   │   ├── Zoom in/out buttons
│   │   ├── Fit to screen
│   │   └── Zoom percentage display
│   └── CanvasElements (draggable elements on canvas)
│       ├── StickyNote elements
│       ├── Todo elements
│       ├── Image elements
│       ├── PDF elements
│       ├── Link elements
│       └── Comment elements
```

---

## Component Organization

Components will be organized in the following directory structure:

```
src/
├── components/
│   ├── layout/          # Reusable layout components
│   │   ├── Header/
│   │   ├── Logo/
│   │   └── Breadcrumb/
│   ├── auth/           # Authentication components
│   │   ├── LoginModal/
│   │   ├── RegisterModal/
│   │   └── AuthForms/
│   ├── boards/         # Board management components
│   │   ├── BoardCard/
│   │   ├── BoardGrid/
│   │   ├── NewBoardButton/
│   │   └── DeleteBoardModal/
│   ├── canvas/         # Canvas workspace components
│   │   ├── CanvasContainer/
│   │   ├── ElementToolbar/
│   │   ├── ZoomToolbar/
│   │   └── elements/   # Individual canvas elements
│   │       ├── StickyNote/
│   │       ├── TodoElement/
│   │       ├── ImageElement/
│   │       ├── PDFElement/
│   │       ├── LinkElement/
│   │       └── CommentElement/
│   ├── collaboration/ # Real-time collaboration components
│   │   ├── ShareModal/
│   │   ├── UserAvatars/
│   │   ├── ActiveUsers/
│   │   └── UserCursor/
│   └── ui/            # Generic UI components
│       ├── Button/
│       ├── Modal/
│       ├── Input/
│       └── Avatar/
└── pages/             # Top-level page components
    ├── WelcomePage/
    ├── DashboardPage/
    └── CanvasPage/
```

---

## Store Integration

Each page integrates with specific Zustand stores:

| Page          | Stores Used                                                    | Purpose                   |
| ------------- | -------------------------------------------------------------- | ------------------------- |
| **Welcome**   | `authStore`                                                    | User authentication       |
| **Dashboard** | `boardStore`, `authStore`                                      | Board data + user session |
| **Canvas**    | `boardStore`, `collaborationStore`, `canvasStore`, `authStore` | Full application state    |

---

## Next Steps

1. **Routes** - Set up React Router with these page routes
2. **Components** - Create component files following this hierarchy
3. **Stores** - Implement Zustand stores as defined in STATE_MANAGEMENT.md
4. **Integration** - Connect components to their respective stores

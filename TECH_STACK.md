# Moodlet Tech Stack

## Overview

Moodlet is a cloud-native collaborative whiteboarding application built with modern web technologies optimized for real-time collaboration and scalability.

---

## Frontend Stack

### **React + TypeScript**

Core framework for building the user interface with type safety and component reusability.

### **Vite**

**Purpose**: Build tool and development server
**Reasoning**:

- Provides instant Hot Module Replacement (HMR) critical for real-time canvas development
- Lightning-fast build times compared to Webpack, essential for iterating on numerous small components
- Native ES modules support reduces bundle size and improves load times
- Optimized for TypeScript and React out of the box

### **Zustand**

**Purpose**: State management
**Reasoning**:

- Lightweight and minimal boilerplate compared to Redux
- Enables global state access without prop drilling through deeply nested canvas components
- Perfect for managing complex, interconnected state across multiple canvas elements, users, and real-time updates
- Simple API that scales well with application complexity
- Built-in TypeScript support with excellent type inference

### **Tailwind CSS**

**Purpose**: Styling framework
**Reasoning**:

- Utility-first approach keeps the UI performant by generating only the CSS classes actually used
- Ensures design consistency across components without custom CSS overhead
- Rapid prototyping and iteration for UI elements
- Minimal runtime cost - styles are purged and optimized at build time
- Excellent for building responsive, accessible interfaces quickly

### **Konva.js (React-Konva)**

**Purpose**: Canvas rendering and manipulation
**Reasoning**:

- Provides high-performance 2D canvas rendering with layering system
- Built-in drag-and-drop functionality essential for whiteboard elements
- Sophisticated hit detection for interactive elements
- Native React integration via react-konva for seamless component architecture
- Event handling system perfect for real-time collaborative interactions
- Excellent performance for rendering hundreds of objects simultaneously

---

## Backend Stack

### **Node.js + Express.js + TypeScript**

Core server framework with type safety for building RESTful APIs and WebSocket servers.

### **Prisma**

**Purpose**: Database ORM
**Reasoning**:

- Best-in-class TypeScript support with auto-generated types from schema
- Type-safe database queries prevent runtime errors
- Built-in migration system for schema evolution
- Enforces data integrity at the ORM level
- Excellent developer experience with autocomplete and IntelliSense
- Enables rapid iteration during development with schema prototyping
- Query optimization and performance monitoring built-in

### **PostgreSQL (AWS RDS)**

**Purpose**: Primary database
**Reasoning**:

- ACID compliance ensures data consistency for collaborative operations
- Robust relational model for complex relationships (users, boards, elements, collaborators)
- JSON/JSONB support for flexible element properties
- Excellent performance and scalability on AWS RDS
- Rich querying capabilities for complex data relationships

### **JWT (JSON Web Tokens)**

**Purpose**: Authentication
**Reasoning**:

- Stateless authentication reduces database load - tokens contain user info
- Enables horizontal scaling without shared session storage
- Perfect for microservices and distributed systems
- Reduces round-trips to database for auth validation on every request
- Works seamlessly with WebSocket authentication
- Industry standard with broad library support

### **Zod**

**Purpose**: Runtime validation and schema definition
**Reasoning**:

- Provides single source of truth for data validation across API boundaries
- TypeScript-first design with excellent type inference
- Validates incoming data at runtime, preventing crashes from malformed requests
- Eliminates guesswork and defensive programming
- Can be shared between client and server in monorepo for consistent validation
- Composable schemas enable complex validation logic

### **Socket.io**

**Purpose**: Real-time WebSocket communication
**Reasoning**:

- Reliable real-time bidirectional communication for collaborative features
- Automatic fallback mechanisms for poor network conditions
- Room-based architecture perfect for board-based collaboration
- Built-in support for broadcasting and event handling
- Scales well with Redis adapter for multi-server deployments

### **REST + GraphQL**

**Purpose**: API architecture
**Reasoning**:

- **REST** for simple CRUD operations: user registration, authentication, basic board operations
- **GraphQL** for complex queries: fetching boards with nested elements, collaborators, comments, and permissions in a single request
- GraphQL's flexible nature handles the complex relational data of whiteboard elements efficiently
- Reduces over-fetching and under-fetching of data
- Type-safe API contract via GraphQL schema
- Enables clients to request exactly the data they need, optimizing performance

---

## Testing Stack

### **Vitest**

**Purpose**: Unit and integration testing (frontend and backend)
**Reasoning**:

- Unified testing framework across the entire monorepo
- Vite-native for consistent development and test environments
- Blazing fast test execution with intelligent watch mode
- Compatible with Jest API, minimal learning curve
- Built-in TypeScript support
- Excellent integration with React Testing Library

### **React Testing Library**

**Purpose**: Frontend component testing
**Reasoning**:

- Encourages testing user behavior over implementation details
- Best practices for accessible component testing

### **E2E Testing**

**Status**: Skipped for MVP
**Future consideration**: Playwright or Cypress when application matures

---

## DevOps & Infrastructure

### **Monorepo (npm workspaces)**

**Purpose**: Project structure
**Reasoning**:

- Keeps client and server code in sync with shared types and utilities
- Simplifies dependency management across frontend and backend
- Enables atomic commits that span both client and server
- Facilitates code sharing (validation schemas, TypeScript interfaces)
- Single CI/CD pipeline for the entire application

### **AWS**

**Purpose**: Cloud infrastructure
**Reasoning**:

- **ECS/EC2**: Container orchestration for Express + Socket.io servers
- **RDS (PostgreSQL)**: Managed database with automated backups and scaling
- **ElastiCache (Redis)**: Session management and real-time caching
- **S3**: Object storage for user-uploaded images and assets
- **CloudFront**: CDN for global content delivery
- Industry-leading reliability and scalability

### **Terraform**

**Purpose**: Infrastructure as Code (IaC)
**Reasoning**:

- Declarative infrastructure management for AWS resources
- Version-controlled infrastructure changes
- Reproducible environments (dev, staging, production)
- Learning opportunity for modern DevOps practices
- Demonstrates scalability patterns for portfolio/production use

### **Docker**

**Purpose**: Containerization
**Reasoning**:

- Consistent development environments across team members
- Simplified local development setup
- Production-ready containers for AWS ECS deployment
- Enables CI/CD pipeline automation

---

## Development Tools

### **TypeScript**

End-to-end type safety from database to UI

### **ESLint + Prettier**

Code quality and consistent formatting

### **Husky**

Pre-commit hooks for linting and testing

### **Git**

Version control

---

## Architecture Summary

```
┌─────────────────────────────────────────┐
│          React + TypeScript             │
│     (Vite, Zustand, Tailwind, Konva)    │
└────────────┬────────────────────────────┘
             │
             │ REST/GraphQL + WebSocket
             │
┌────────────▼────────────────────────────┐
│       Express.js + TypeScript           │
│  (Prisma, JWT, Zod, Socket.io)          │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐     ┌─────▼──────┐
│  RDS   │     │ElastiCache │
│   PG   │     │   (Redis)  │
└────────┘     └────────────┘
```

This stack is optimized for real-time collaboration, developer experience, type safety, and cloud-native scalability.

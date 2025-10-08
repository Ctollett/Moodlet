# Moodlet

A cloud-native collaborative moodboarding application for creative teams. Build and iterate on creative projects in real-time with your team, all from your browser.

## What is Moodlet?

Moodlet is a real-time collaborative whiteboarding tool designed for creative professionals who need to discuss and iterate on projects remotely. Add sticky notes, images, text, and PDFs to shared boards while seeing your teammates' changes instantly.

Think Figma meets Miro, but focused on rapid creative brainstorming and visual collaboration.

## Key Features

- **Real-time Collaboration**: See your team's cursors, edits, and changes as they happen
- **Flexible Canvas**: Drag and drop sticky notes, text, images, and PDFs anywhere on the board
- **Smart Permissions**: Control who can view, comment, or edit your boards
- **Cloud-Native**: Access your boards from anywhere with automatic saving to the cloud
- **Built for Teams**: Invite collaborators, manage permissions, and work together seamlessly

## Tech Stack

### Frontend

- React with TypeScript
- Vite for blazing-fast builds
- Zustand for state management
- Konva.js for high-performance canvas rendering
- Tailwind CSS for styling

### Backend

- Node.js and Express with TypeScript
- PostgreSQL with Prisma ORM
- Socket.io for real-time WebSocket communication
- JWT authentication
- Zod for runtime validation

### Infrastructure

- AWS (RDS, S3, ECS, CloudFront)
- Docker for containerization
- Terraform for infrastructure as code

## Project Structure

```
Moodlet/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and utilities
└── docs/            # Project documentation
```

## Documentation

- [Architecture Overview](docs/markdown/ARCHITECTURE.md) - System design and architectural decisions
- [Tech Stack Details](docs/markdown/TECH_STACK.md) - Technology choices and rationale
- [Data Model](docs/markdown/DATA_MODEL.md) - Database schema and relationships
- [API Documentation](docs/markdown/API.md) - Complete REST and WebSocket API reference
- [API Quick Reference](docs/markdown/API_QUICK_REFERENCE.md) - Endpoint cheat sheet
- [Frontend Hierarchy](docs/markdown/FRONTEND_HIERARCHY.md) - Component structure
- [State Management](docs/markdown/STATE_MANAGEMENT.md) - Client state patterns

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- AWS account (optional for local development)

### Installation

```bash
# Clone the repository
git clone https://github.com/Ctollett/Moodlet.git
cd Moodlet

# Install dependencies
npm install

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your database URL and JWT secret

# Generate Prisma client
npm run db:generate --workspace=server

# Run database migrations
npm run db:migrate --workspace=server

# Start development servers
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Development

This is a monorepo using npm workspaces. All frontend and backend code shares common types and validation schemas for type safety across the stack.

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific workspace
npm test --workspace=client
npm test --workspace=server
```

### Building for Production

```bash
# Build both client and server
npm run build

# Build specific workspace
npm run build --workspace=client
```

## Architecture Highlights

### Real-Time First Design

Built around WebSocket-first collaboration with optimistic UI updates for instant feedback. REST API handles CRUD operations while WebSocket handles real-time event broadcasting.

### Type Safety End-to-End

TypeScript from database to UI, with Prisma-generated types, Zod runtime validation, and shared schemas across client and server.

### Designed for Scale

MVP simplicity with production-ready patterns: stateless JWT authentication, layered backend architecture, and documented evolution path from single-server to distributed systems.

## Project Status

Currently in active development. This is a portfolio and learning project demonstrating modern full-stack development, real-time collaboration systems, and cloud-native architecture.

## Contributing

This is a personal learning project, but feedback and suggestions are welcome. Feel free to open an issue to discuss improvements or architectural decisions.

## License

MIT

## Author

**Carson Tollett**
[GitHub](https://github.com/Ctollett)

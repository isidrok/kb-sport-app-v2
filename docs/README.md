# Kettlebell Workout Tracking App

## Overview

A real-time kettlebell workout tracking application that uses computer vision to detect and analyze kettlebell exercises. Built with Preact, TypeScript, and TensorFlow.js for browser-based pose detection.

## Key Features

- **Real-time Pose Detection**: YOLOv8 model for kettlebell exercise tracking
- **Camera Integration**: Live video feed with pose overlay visualization  
- **Workout Management**: Start/stop workout sessions with proper resource management
- **Responsive Design**: Optimized for both mobile and desktop

## Architecture

This project follows **Domain-Driven Design (DDD)** with **Clean Architecture** principles:

- **Domain Layer**: Core business entities and rules (Workout, WorkoutStatus)
- **Application Layer**: Use cases and services orchestrating business operations
- **Infrastructure Layer**: External integrations (camera, ML model, event system)
- **Presentation Layer**: UI components and hooks

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Project Structure

```
src/
├── domain/           # Business entities and types
├── application/      # Use cases and services
├── infrastructure/   # External adapters and event system
└── presentation/     # UI components and hooks
```

## Documentation

- [Architecture Decisions](./ARCHITECTURE.md) - Key architectural choices and rationale
- [Development Guide](./DEVELOPMENT.md) - Coding conventions and workflow
- [Domain Concepts](./DOMAIN.md) - Business rules and domain model

## Technology Stack

- **Frontend**: Preact with TypeScript
- **Build**: Vite with path aliases
- **ML**: TensorFlow.js with YOLOv8 pose model
- **Testing**: Vitest with Testing Library
- **Package Manager**: pnpm
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- **Development**: `pnpm dev` - Start development server with host binding
- **Build**: `pnpm build` - TypeScript compile + Vite build
- **Type checking**: `pnpm tsc` - Run TypeScript compiler without emit
- **Testing**: `pnpm test` - Run Vitest tests
- **Test UI**: `pnpm test:ui` - Run tests with Vitest UI
- **Preview**: `pnpm preview` - Preview production build

## Architecture Overview

This is a kettlebell workout tracking application built with Preact, TypeScript, and TensorFlow.js for pose detection.

### Tech Stack
- **Frontend**: Preact with TypeScript
- **Build**: Vite with path alias `@` → `src/`
- **ML**: TensorFlow.js with YOLOv8 pose model
- **Testing**: Vitest with happy-dom environment
- **Package Manager**: pnpm

### Project Structure

**Clean Architecture with DDD:**
- **Domain Layer** (`src/domain/`): Core entities, types and business logic
  - `entities/`: Domain entities (Workout, etc.)
  - `types/`: Domain-specific type definitions
- **Application Layer** (`src/application/`): Use cases and application services
  - `use-cases/`: Single-responsibility business operations
  - `services/`: Coordinate use cases and maintain application state
- **Infrastructure Layer** (`src/infrastructure/`): External integrations
  - `adapters/`: External API integrations (camera, ML model, rendering)
  - `event-bus/`: Event system for async communication (singleton)
- **Presentation Layer** (`src/presentation/`): UI components and hooks
  - `hooks/`: Custom hooks for state management and actions
  - `components/`: UI components with CSS modules
  - Clean architecture with CSS modules for styling

### Key Features
- Real-time camera feed with pose detection
- YOLOv8 pose model for kettlebell exercise tracking
- Canvas overlay for pose visualization
- Responsive design with portrait/landscape optimization

### Architecture Patterns

**Domain-Driven Design (DDD):**
- Domain entities with getters for direct property access
- Use cases focused on single business operations
- Application services coordinate multiple use cases
- All services and use cases exported as singletons

**Event-Driven Architecture:**
- EventBus in infrastructure layer for async communication
- Event classes extending base Event<T> for type safety
- Hooks use publish/subscribe pattern for UI integration

**Component Patterns:**
- Hooks split between state (useWorkoutState) and actions (useWorkoutActions)
- Components receive refs for video/canvas elements
- Video/canvas dimensions set from getBoundingClientRect before camera start

### Testing Setup
- Vitest with happy-dom environment
- Global test setup in `src/test-setup.ts`
- Testing Library for Preact components
- Test behavior, not implementation details
- No testing of CSS classes or styling
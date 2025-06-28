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
- **CRITICAL**: All events MUST extend base Event<T> class - enforced by TypeScript constraints
- Event organization: Base Event (infrastructure), Application events (application/events), Domain events (domain/events)
- EventBus and useEventBus both enforce `T extends Event` constraints
- Hooks use publish/subscribe pattern for UI integration
- Import pattern: Use `@/` path aliases for all imports

**Component Patterns:**
- Hooks split between state (useWorkoutState) and actions (useWorkoutActions)
- Components receive refs for video/canvas elements
- Video/canvas dimensions set from getBoundingClientRect before camera start

### Testing Setup
- Vitest with happy-dom environment
- Global test setup in `src/test-setup.ts`
- Testing Library for Preact components
- **Strict TDD**: RED-GREEN-REFACTOR cycle required
- Test behavior, not implementation details
- No testing of CSS classes or styling
- **Anti-patterns**: Don't test return types (TypeScript handles this), avoid complex async mocking
- Use natural language test descriptions: "creates workout with idle status"
- Clean mocking: Use `vi.mock()` and `vi.mocked()` patterns

### Testing Patterns

**Mocking Strategy:**
- Use `vi.mock()` at module level for external dependencies
- Access mocks with `vi.mocked()` for type-safe mock access
- Avoid complex mock factories - keep mocks simple
- For type issues with mocks, prefer `Partial<Type>` with type assertion over complex interfaces
- Separate base classes (like Event) into their own files to avoid circular mock dependencies

**File Naming:**
- Infrastructure adapters use `.adapter.ts` suffix (e.g., `prediction.adapter.ts`)
- Test files use `.test.ts` suffix alongside implementation files
- Event classes in their respective layer's `events/` folder

### Code Quality
- **Always run `pnpm tsc`** after implementing features to ensure type safety
- Fix TypeScript errors immediately - no `any` or `as` unless absolutely necessary
- Prefer satisfies operator over type assertions when possible
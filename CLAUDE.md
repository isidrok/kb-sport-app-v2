# Claude Assistant Instructions - Global

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

Kettlebell workout tracking application built with Preact, TypeScript, and TensorFlow.js for real-time pose detection and exercise analysis.

### Tech Stack
- **Frontend**: Preact with TypeScript
- **Build**: Vite with path alias `@` → `src/`
- **ML**: TensorFlow.js with YOLOv8 pose model
- **Testing**: Vitest with happy-dom environment
- **Package Manager**: pnpm

### Commands
- **Development**: `pnpm dev` - Start development server with host binding
- **Build**: `pnpm build` - TypeScript compile + Vite build
- **Type checking**: `pnpm tsc` - Run TypeScript compiler without emit
- **Testing**: `pnpm test` - Run Vitest tests
- **Test UI**: `pnpm test:ui` - Run tests with Vitest UI
- **Preview**: `pnpm preview` - Preview production build

## Global Architecture Patterns

### Clean Architecture with DDD
- **Domain Layer** (`src/domain/`): Core entities, types and business logic
- **Application Layer** (`src/application/`): Use cases and application services
- **Infrastructure Layer** (`src/infrastructure/`): External integrations
- **Presentation Layer** (`src/presentation/`): UI components and hooks

### Layer Dependencies
```
Presentation → Application → Domain
     ↓              ↓
Infrastructure ←──────┘
```

### Global Patterns

**Domain-Driven Design:**
- Domain entities with getters for direct property access
- Use cases focused on single business operations
- Application services coordinate multiple use cases
- All services and use cases exported as singletons
- Constructor Pattern: Services use object-based dependency injection
- ID Generation: Use `${entityType}_${new Date().toISOString()}` format

**Event-Driven Architecture:**
- EventBus in infrastructure layer for async communication
- **CRITICAL**: All events MUST extend base Event<T> class - enforced by TypeScript constraints
- Event organization by layer: Base Event (infrastructure), Application events (application/events), Domain events (domain/events)
- EventBus and useEventBus both enforce `T extends Event` constraints

**Component Patterns:**
- Hooks split between state queries and action commands
- Components receive refs for video/canvas elements
- Video/canvas dimensions set from getBoundingClientRect before camera start

## Global Testing Standards

### Test-Driven Development (TDD)
- **Strict TDD**: RED-GREEN-REFACTOR cycle required
- Test behavior, not implementation details
- Use natural language test descriptions: "creates workout with idle status"
- **CRITICAL**: Always run `pnpm tsc` after implementing features
- Zero tolerance for TypeScript errors

### Testing Patterns
- Use `vi.mock()` at module level for external dependencies
- Import `Mocked` type from vitest: `import { Mocked } from 'vitest'`
- Create mocks using `Partial<Type> as Mocked<Type>` pattern
- Avoid testing CSS classes, styling, or return types
- Focus on public APIs and expected outcomes

### File Naming Conventions
- Infrastructure adapters: `.adapter.ts` suffix
- Use cases: `-use-case.ts` suffix
- Application services: `.service.ts` suffix
- Test files: `.test.ts` suffix alongside implementation
- Event classes: In respective layer's `events/` folder

## Global Code Quality Standards

### TypeScript Requirements
- **Always run `pnpm tsc`** after implementing features
- Zero tolerance for TypeScript errors
- Fix errors immediately - no `any` or `as` unless absolutely necessary
- Prefer satisfies operator over type assertions
- Use combined import syntax: `import { foo, type Foo }`

### Import Patterns
- Use `@/` path aliases for all cross-layer imports
- Feature to shared: Relative paths `../../hooks/use-event-bus`
- Combined import syntax: `import { service, type ServiceType }`

## Module Registry

- **Application Layer**: Use cases and services (`src/application/CLAUDE.md`)
- **Presentation Layer**: UI components and hooks (`src/presentation/CLAUDE.md`)
- **Event Bus Module**: Type-safe event communication (`src/infrastructure/event-bus/CLAUDE.md`)

## Cross-Module Patterns

### Event System (Used Across All Modules)
- All events MUST extend base `Event<T>` class
- EventBus methods enforce `T extends Event` constraints
- useEventBus hook enforces same constraint
- Manual subscription pattern: consumers manage cleanup
- Event organization by architectural layer

### Service Pattern (Application + Infrastructure)
- Object-based dependency injection over multiple parameters
- Export both class and singleton instance
- Services coordinate use cases and maintain state

### Hook Patterns (Presentation + Application Integration)
- Split state queries from action commands
- Manual EventBus subscription cleanup via useEffect
- Type-safe event subscription with event classes
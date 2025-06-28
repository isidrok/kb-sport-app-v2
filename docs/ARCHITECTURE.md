# Architecture Decisions

## Overview

This application follows Domain-Driven Design (DDD) with Clean Architecture to separate business logic from technical concerns. The architecture supports real-time pose detection for kettlebell workout tracking.

## Key Decisions

### Clean Architecture with DDD
**Date**: 2025-06-28  
**Context**: Need for maintainable, testable code that separates business logic from UI and infrastructure  
**Decision**: Implement Clean Architecture with DDD principles using distinct layers  
**Rationale**: 
- Domain logic independent of frameworks
- Testable business rules
- Clear separation of concerns
- Future extensibility for new exercise types
**Consequences**: 
- More files and structure complexity
- Clear boundaries between layers
- Easier testing and maintenance

### Event-Driven Communication
**Date**: 2025-06-28  
**Context**: Need async communication between ML model loading, camera access, and UI updates  
**Decision**: Implement EventBus in infrastructure layer with typed event classes  
**Rationale**: 
- Decouples components from direct dependencies
- Supports multiple subscribers for same events
- Clean async state management
- Future-proof for additional event types
**Consequences**: 
- Additional complexity for simple operations
- Clear async communication patterns
- Easier to add new event subscribers

### Singleton Pattern for Services
**Date**: 2025-06-28  
**Context**: Need consistent state management across use cases and services  
**Decision**: Export all services and use cases as singletons  
**Rationale**: 
- Single source of truth for application state
- Consistent adapter instances
- Simplified dependency injection
**Consequences**: 
- Global state management
- Easier testing with known instances
- Potential testing isolation challenges

### Separate Camera from Workout Logic
**Date**: 2025-06-28  
**Context**: Future need for camera preview mode independent of workout sessions  
**Decision**: Create separate camera use cases independent of workout lifecycle  
**Rationale**: 
- Camera operations may be needed outside workouts
- Cleaner separation of concerns
- Supports future preview features
**Consequences**: 
- More granular use cases
- Additional coordination complexity
- Better feature extensibility

### Hook Splitting Pattern
**Date**: 2025-06-28  
**Context**: UI components need both state queries and action commands  
**Decision**: Split hooks into state (useWorkoutState) and actions (useWorkoutActions)  
**Rationale**: 
- Components can subscribe to only needed concerns
- Cleaner re-render optimization
- Single Responsibility Principle for hooks
**Consequences**: 
- More hooks to manage
- Clearer component dependencies
- Better performance optimization

### Video Buffer Management
**Date**: 2025-06-28  
**Context**: Canvas rendering corruption when video dimensions don't match client rect  
**Decision**: Set video/canvas dimensions from getBoundingClientRect before camera start  
**Rationale**: 
- Prevents internal buffer corruption
- Ensures proper canvas rendering
- Matches actual display dimensions
**Consequences**: 
- Additional setup step in camera initialization
- Reliable pose rendering
- Consistent visual output

## Layer Dependencies

```
Presentation → Application → Domain
     ↓              ↓
Infrastructure ←──────┘
```

- **Presentation** depends on Application (use cases, services)
- **Application** depends on Domain (entities, types)
- **Infrastructure** provides implementations for Application interfaces
- **Domain** has no dependencies (pure business logic)

## Event Flow

```
LoadModelUseCase → EventBus → useModelLoading hook → StatusPopup
StartCameraUseCase → EventBus → useWorkoutActions hook → WorkoutControls  
WorkoutService → Domain Entity → useWorkoutState hook → UI Components
```

## Testing Strategy

- **Domain**: Unit tests for entities and business rules
- **Application**: Unit tests for use cases with mocked adapters
- **Infrastructure**: Integration tests for adapters
- **Presentation**: Component tests with Testing Library

Focus on behavior testing, not implementation details or CSS classes.
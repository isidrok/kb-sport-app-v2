# Claude Assistant Instructions - Presentation Layer

## Module Purpose
Manages UI components, custom hooks, and presentation logic following clean architecture principles. Separates shared/reusable concerns from feature-specific presentation components.

## Module Structure
```
src/presentation/
├── hooks/                    # Shared/app-level hooks
├── components/               # Shared components across features
├── feature/                  # Feature-specific presentation
│   ├── hooks/                # Feature-specific hooks
│   ├── components/           # Feature-specific components
│   └── feature-page.tsx      # Main feature page component
└── app.tsx                   # App root component
```

## Module-Specific Rules

### File Organization
- **Shared hooks** (`hooks/`): Serve multiple features or app-level concerns
- **Shared components** (`components/`): Truly reusable across different features
- **Feature directories**: Named after domain feature (workout/, profile/, etc.)
- **Feature hooks**: Business logic specific to that feature domain
- **Feature components**: UI components that only make sense within that feature

### Component Patterns
- **Props Interface**: Always define explicit props interface for components
- **Ref Management**: Components receiving refs should expect `RefObject<T>`
- **Event Handling**: Use async event handlers for async operations
- **Conditional Rendering**: Early returns for visibility/conditional logic

## Deviations from Global
- **Feature to Shared Imports**: Use relative paths `../../hooks/use-event-bus`
- **Cross-feature imports**: Discouraged - shared concerns should be in `hooks/` or `components/`
- **EventBus Cleanup**: Hooks using EventBus manage their own subscription cleanup
- **Manual Cleanup**: Let consumers control subscription lifecycle via useEffect

## Module Rules
- All hooks using EventBus must manage their own cleanup
- Feature hooks cannot directly import from other features
- Shared components must be truly reusable (no feature-specific logic)
- Component props must have explicit TypeScript interfaces
- Test focus on user behavior, not implementation details
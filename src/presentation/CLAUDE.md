# Claude Assistant Instructions - Presentation Layer

## Module Purpose
Manages UI components, custom hooks, and presentation logic following clean architecture principles. Separates shared/reusable concerns from feature-specific presentation components.

## Module Structure
```
src/presentation/
├── hooks/                           # Shared/app-level hooks
│   ├── use-event-bus.ts            # Generic event system hook
│   └── use-model-loading.ts        # App-level model loading state
├── components/                      # Shared components across features
│   └── status-popup.tsx            # Generic popup (reusable)
├── feature/                         # Feature-specific presentation
│   ├── hooks/                       # Feature-specific hooks
│   │   ├── use-feature-state.ts    # Feature state management
│   │   └── use-feature-actions.ts  # Feature action commands
│   ├── components/                  # Feature-specific components
│   │   └── feature-controls.tsx    # Feature-specific UI
│   └── feature-page.tsx            # Main feature page component
└── app.tsx                         # App root component
```

## Module Conventions

### File Organization Rules
- **Shared hooks** (`hooks/`): Serve multiple features or app-level concerns
- **Shared components** (`components/`): Truly reusable across different features
- **Feature directories**: Named after domain feature (workout/, profile/, etc.)
- **Feature hooks**: Business logic specific to that feature domain
- **Feature components**: UI components that only make sense within that feature

### Import Patterns
- **Feature to shared**: Use relative paths `../../hooks/use-event-bus`
- **Cross-feature imports**: Discouraged - shared concerns should be in `hooks/` or `components/`
- **Domain imports**: Always use `@/` path aliases to other layers
- **Component imports**: Prefer named imports for clarity

### Component Patterns
- **Props Interface**: Always define explicit props interface for components
- **Ref Management**: Components receiving refs should expect `RefObject<T>`
- **Event Handling**: Use async event handlers for async operations
- **Conditional Rendering**: Early returns for visibility/conditional logic

### Hook Patterns
- **State vs Actions Split**: Separate hooks for querying state vs performing actions
- **Manual Cleanup**: Hooks using EventBus manage their own subscription cleanup
- **Type Safety**: All hooks using EventBus must specify event class, not string
- **Effect Dependencies**: Include all hook dependencies in useEffect dependency arrays

## Hook Design Patterns

### useEventBus Integration
```typescript
// Correct pattern for event subscription
const { subscribe } = useEventBus(EventClass)

useEffect(() => {
  const unsubscribe = subscribe((event) => {
    // Handle event
  })
  
  return unsubscribe
}, [subscribe])
```

### State Hook Pattern
```typescript
// Pattern for state query hooks
export function useFeatureState() {
  const [state, setState] = useState(initialState)
  const { subscribe } = useEventBus(FeatureEvent)

  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      setState(newState)
    })
    return unsubscribe
  }, [subscribe])

  return state
}
```

### Actions Hook Pattern
```typescript
// Pattern for action command hooks
export function useFeatureActions() {
  const [loading, setLoading] = useState(false)
  
  const performAction = async () => {
    setLoading(true)
    try {
      await service.performAction()
    } finally {
      setLoading(false)
    }
  }

  return { performAction, loading }
}
```

## Component Testing Patterns

### Component Test Structure
- **Mock all custom hooks**: Use `vi.mock()` for feature hooks
- **Mock services**: Mock application services used by hooks
- **Test user interactions**: Focus on clicks, form inputs, visibility
- **Use Testing Library**: Prefer `getByRole`, `getByText` over implementation details
- **Natural language**: Test names describe user behavior, not technical implementation

### Event Testing Pattern
```typescript
// Test pattern for event-driven components
it('calls action when button clicked', () => {
  const mockAction = vi.fn()
  vi.mocked(useFeatureActions).mockReturnValue({
    performAction: mockAction,
    loading: false
  })

  render(<Component />)
  screen.getByRole('button').click()
  
  expect(mockAction).toHaveBeenCalledOnce()
})
```

## Dependencies
- **Internal**: 
  - `@/application/services/*` for business operations
  - `@/domain/entities/*` for type definitions
  - `@/application/events/*` and `@/domain/events/*` for event types
- **External**: 
  - `preact/hooks` for React-style hooks
  - `preact` for components and refs

## Module Anti-Patterns

### ❌ Avoid These Patterns
- **Complex useEventBus cleanup**: Don't track multiple subscriptions in refs
- **Cross-feature imports**: Features shouldn't directly import from each other
- **Testing implementation details**: Don't test CSS classes or internal state
- **Automatic cleanup magic**: Don't hide subscription lifecycle from consumers
- **Mixed concerns in hooks**: Keep state queries separate from action commands

### ✅ Preferred Patterns
- **Explicit cleanup management**: Let consumers control subscription lifecycle
- **Clear boundaries**: Shared vs feature-specific code organization
- **Behavior testing**: Test what users see and do, not how code works internally
- **Type-safe events**: Always use event classes, not string-based event types
- **Single responsibility**: Each hook has one clear purpose

## Module Rules
- All hooks using EventBus must manage their own cleanup
- Feature hooks cannot directly import from other features
- Shared components must be truly reusable (no feature-specific logic)
- Component props must have explicit TypeScript interfaces
- Test focus on user behavior, not implementation details
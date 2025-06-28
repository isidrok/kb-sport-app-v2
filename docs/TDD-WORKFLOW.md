# TDD Workflow Guide

## Overview

This project follows strict Test-Driven Development (TDD) with the RED-GREEN-REFACTOR cycle. Every feature is implemented incrementally, one test at a time.

## The TDD Cycle

### 1. RED Phase
Write a failing test that describes the desired behavior:
- Test must fail initially (proving it tests something new)
- Test name should describe behavior, not implementation
- Keep test simple and focused
- Run linter/compiler to ensure no syntax errors

Example:
```typescript
it('publishes loading event on start', async () => {
  // Arrange
  mockAdapter.initialize.mockResolvedValue(undefined)
  
  // Act
  await useCase.execute()
  
  // Assert
  expect(mockEventBus.publish).toHaveBeenCalledTimes(1)
})
```

### 2. GREEN Phase
Write the minimal code to make the test pass:
- No extra functionality beyond what the test requires
- No premature optimization
- Resist adding code for future tests
- Run all tests to confirm the new one passes

Example:
```typescript
async execute(): Promise<void> {
  const event = new ModelLoadingEvent({ status: 'loading' })
  this.eventBus.publish(event)
}
```

### 3. REFACTOR Phase
Improve code structure without changing behavior:
- Extract methods to reduce duplication
- Improve naming for clarity
- Consolidate similar code
- Run tests after each change to ensure behavior unchanged

### 4. Type Check
After implementing each feature:
```bash
pnpm tsc
```
Fix any TypeScript errors immediately.

## Testing Best Practices

### Test Naming
Use natural language that describes behavior:
- ✅ "creates workout with idle status"
- ✅ "publishes ready event on success"
- ❌ "test_workout_creation"
- ❌ "should work correctly"

### Mocking Strategy
Keep mocks simple and type-safe:
```typescript
// Module-level mocks
vi.mock('@/infrastructure/event-bus/event-bus')
vi.mock('@/infrastructure/adapters/prediction.adapter')

// Access mocks with vi.mocked()
const mockEventBus = vi.mocked(eventBus)
const mockAdapter = vi.mocked(predictionAdapter)

// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks()
})
```

### Avoid Mock Complexity
When TypeScript complains about mock types:
1. First try: Use `Partial<Type>` with assertion
2. If needed: Extract interface for what you actually need
3. Last resort: Separate problematic classes into their own files

Example of the Event class separation:
```typescript
// event.ts - Separate file to avoid circular dependencies
export abstract class Event<T = any> {
  constructor(public readonly data: T) {}
}

// event-bus.ts - Import without re-exporting
import { Event } from './event'
```

### Test Organization
Group related tests logically:
```typescript
describe('LoadModelUseCase', () => {
  // Setup
  let useCase: LoadModelUseCase
  
  beforeEach(() => {
    // Common setup
  })
  
  // Group by behavior
  it('publishes loading event on start', ...)
  it('publishes ready event on success', ...)
  it('publishes error event on failure', ...)
  it('initializes prediction adapter', ...)
})
```

## Common Patterns

### Event-Driven Testing
When testing event publishers:
```typescript
// Check the event was published
expect(mockEventBus.publish).toHaveBeenCalledTimes(1)

// Verify event details
const call = mockEventBus.publish.mock.calls[0]
const event = call[0]
expect(event).toBeInstanceOf(ModelLoadingEvent)
expect(event.data.status).toBe('loading')
```

### Async Testing
For promises and async operations:
```typescript
// Success case
await expect(useCase.execute()).resolves.toBeUndefined()

// Error case
await expect(useCase.execute()).rejects.toThrow('Error message')
```

### State Verification
Test state changes, not implementation:
```typescript
// Good: Test observable behavior
expect(workout.status).toBe('active')
expect(workout.startTime).toBeDefined()

// Bad: Test internal implementation
expect(workout._internalState).toBe(...)
```

## Anti-Patterns to Avoid

1. **Testing Types**: TypeScript handles this
2. **Testing Private Methods**: Test through public API
3. **Over-Mocking**: Mock only external dependencies
4. **Testing Implementation**: Focus on behavior
5. **Complex Mock Factories**: Keep mocks simple
6. **Testing CSS/Styling**: Not unit test responsibility

## Incremental Development

Each component is built test by test:
1. Read the component's test plan
2. Implement one test at a time
3. Don't skip ahead to future tests
4. Mark progress in `progress.md`
5. Run type checking after each test passes
6. Only refactor with passing tests

## Example TDD Session

```bash
# 1. Write failing test
pnpm test component.test.ts
# ❌ Test fails (RED)

# 2. Implement minimal code
# Edit component.ts

# 3. Run test again
pnpm test component.test.ts
# ✅ Test passes (GREEN)

# 4. Check types
pnpm tsc
# Fix any type errors

# 5. Refactor if needed
# Edit code while keeping tests green

# 6. Run all tests
pnpm test
# ✅ All tests pass

# 7. Commit
git add -A
git commit -m "feat: implement feature X with test Y"
```

## Benefits

- **Confidence**: Every line of code is tested
- **Design**: Tests drive better API design
- **Documentation**: Tests document behavior
- **Refactoring**: Safe to change with test coverage
- **Focus**: One behavior at a time prevents scope creep
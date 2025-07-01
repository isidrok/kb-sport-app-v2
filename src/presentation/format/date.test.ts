import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatDateTime } from './date'

describe('formatDateTime', () => {
  let originalNavigator: typeof navigator

  beforeEach(() => {
    originalNavigator = global.navigator
  })

  afterEach(() => {
    global.navigator = originalNavigator
  })

  it('formats date using navigator language', () => {
    // Arrange
    global.navigator = { language: 'en-US' } as Navigator
    const date = new Date('2024-07-01T10:30:00.000Z')

    // Act
    const result = formatDateTime(date)

    // Assert
    expect(result).toMatch(/July 1, 2024/)
    expect(result).toMatch(/\d{1,2}:\d{2}/) // Time format
  })

  it('respects different locales', () => {
    // Arrange
    global.navigator = { language: 'de-DE' } as Navigator
    const date = new Date('2024-07-01T10:30:00.000Z')

    // Act
    const result = formatDateTime(date)

    // Assert
    expect(result).toMatch(/1\. Juli 2024/) // German format
  })

  it('includes time in the formatted string', () => {
    // Arrange
    global.navigator = { language: 'en-US' } as Navigator
    const date = new Date('2024-07-01T14:30:00.000Z')

    // Act
    const result = formatDateTime(date)

    // Assert
    expect(result).toContain('2024')
    expect(result).toMatch(/\d{1,2}:\d{2}/) // Contains time
  })
})
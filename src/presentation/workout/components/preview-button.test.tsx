import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/preact'
import { PreviewButton } from './preview-button'

describe('PreviewButton', () => {
  it('renders visibility icon when not active', () => {
    const mockStartPreview = vi.fn()
    const mockStopPreview = vi.fn()
    
    const { container } = render(
      <PreviewButton
        isPreviewActive={false}
        isDisabled={false}
        onStartPreview={mockStartPreview}
        onStopPreview={mockStopPreview}
      />
    )
    
    expect(container.querySelector('.material-icons')).toHaveTextContent('visibility')
    expect(container.querySelector('button')).toHaveAttribute('aria-label', 'Start Preview')
  })

  it('renders stop icon when active', () => {
    const mockStartPreview = vi.fn()
    const mockStopPreview = vi.fn()
    
    const { container } = render(
      <PreviewButton
        isPreviewActive={true}
        isDisabled={false}
        onStartPreview={mockStartPreview}
        onStopPreview={mockStopPreview}
      />
    )
    
    expect(container.querySelector('.material-icons')).toHaveTextContent('visibility_off')
    expect(container.querySelector('button')).toHaveAttribute('aria-label', 'Stop Preview')
  })

  it('sets disabled attribute when disabled', () => {
    const mockStartPreview = vi.fn()
    const mockStopPreview = vi.fn()
    
    const { container } = render(
      <PreviewButton
        isPreviewActive={false}
        isDisabled={true}
        onStartPreview={mockStartPreview}
        onStopPreview={mockStopPreview}
      />
    )
    
    const button = container.querySelector('button')
    expect(button?.disabled).toBe(true)
  })

  it('calls correct handler based on state', () => {
    const mockStartPreview = vi.fn()
    const mockStopPreview = vi.fn()
    
    // Test start preview call when inactive
    const { container: inactiveContainer } = render(
      <PreviewButton
        isPreviewActive={false}
        isDisabled={false}
        onStartPreview={mockStartPreview}
        onStopPreview={mockStopPreview}
      />
    )
    
    const inactiveButton = inactiveContainer.querySelector('button')!
    fireEvent.click(inactiveButton)
    
    expect(mockStartPreview).toHaveBeenCalledOnce()
    expect(mockStopPreview).not.toHaveBeenCalled()
    
    vi.clearAllMocks()
    
    // Test stop preview call when active
    const { container: activeContainer } = render(
      <PreviewButton
        isPreviewActive={true}
        isDisabled={false}
        onStartPreview={mockStartPreview}
        onStopPreview={mockStopPreview}
      />
    )
    
    const activeButton = activeContainer.querySelector('button')!
    fireEvent.click(activeButton)
    
    expect(mockStopPreview).toHaveBeenCalledOnce()
    expect(mockStartPreview).not.toHaveBeenCalled()
  })
})
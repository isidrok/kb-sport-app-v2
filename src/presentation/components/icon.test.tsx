import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/preact'
import { Icon } from './icon'

describe('Icon', () => {
  it('renders material icon with correct name', () => {
    const { container } = render(<Icon name="home" />)
    const icon = container.querySelector('.material-icons')
    
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveTextContent('home')
  })

  it('applies custom className', () => {
    const { container } = render(<Icon name="home" className="custom-class" />)
    const icon = container.querySelector('.material-icons')
    
    expect(icon).toHaveClass('material-icons', 'custom-class')
  })

  it('sets aria-label when provided', () => {
    const { container } = render(<Icon name="home" ariaLabel="Home icon" />)
    const icon = container.querySelector('.material-icons')
    
    expect(icon).toHaveAttribute('aria-label', 'Home icon')
    expect(icon).not.toHaveAttribute('aria-hidden')
  })

  it('sets aria-hidden when no ariaLabel provided', () => {
    const { container } = render(<Icon name="home" />)
    const icon = container.querySelector('.material-icons')
    
    expect(icon).toHaveAttribute('aria-hidden', 'true')
    expect(icon).not.toHaveAttribute('aria-label')
  })
})
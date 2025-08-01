import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/preact'
import { StatusPopup } from './status-popup'

describe('StatusPopup', () => {
  it('shows when visible', () => {
    render(
      <StatusPopup 
        message="Loading ML model..." 
        type="loading" 
        visible={true} 
      />
    )

    expect(screen.getByText('Loading ML model...')).toBeInTheDocument()
  })

  it('hides when not visible', () => {
    render(
      <StatusPopup 
        message="Loading ML model..." 
        type="loading" 
        visible={false} 
      />
    )

    expect(screen.queryByText('Loading ML model...')).not.toBeInTheDocument()
  })

  it('displays message', () => {
    render(
      <StatusPopup 
        message="Camera access denied" 
        type="error" 
        visible={true} 
      />
    )

    expect(screen.getByText('Camera access denied')).toBeInTheDocument()
  })

  it('handles loading and error types with icons', () => {
    const { rerender, container } = render(
      <StatusPopup 
        message="Loading..." 
        type="loading" 
        visible={true} 
      />
    )

    const loadingPopup = screen.getByText('Loading...')
    expect(loadingPopup).toBeInTheDocument()
    expect(container.querySelector('.material-icons')).toHaveTextContent('hourglass_empty')

    rerender(
      <StatusPopup 
        message="Error occurred" 
        type="error" 
        visible={true} 
      />
    )

    const errorPopup = screen.getByText('Error occurred')
    expect(errorPopup).toBeInTheDocument()
    expect(container.querySelector('.material-icons')).toHaveTextContent('error')
  })

  it('works without message', () => {
    const { container } = render(
      <StatusPopup 
        type="loading" 
        visible={true} 
      />
    )

    expect(container.querySelector('.material-icons')).toHaveTextContent('hourglass_empty')
    expect(container.querySelector('.message')).not.toBeInTheDocument()
  })
})
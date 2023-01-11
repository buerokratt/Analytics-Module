import { render, screen } from '@testing-library/react'
import HomePage from '../../pages/HomePage'

test('renders hello world message', () => {
    render(<HomePage />)
    const name = screen.getByText(/Analytics Module/i)
    expect(name).toBeInTheDocument()
})

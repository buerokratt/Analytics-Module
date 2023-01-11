import { render, screen } from '@testing-library/react'
import Testing from '../../components/Testing'

test('renders current date', () => {
    render(<Testing />)
    const text = screen.getByText(/testing data:/i)
    expect(text).toBeInTheDocument()
})

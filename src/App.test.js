import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

test('renders the home route content', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  )

  const headingElement = screen.getByRole('heading', { name: /cj & nicole wedding/i })
  expect(headingElement).toBeInTheDocument()
})

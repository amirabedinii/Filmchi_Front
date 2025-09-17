import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppThemeProvider, useThemeMode } from './ThemeProvider'

function ToggleProbe() {
  const { mode, toggleMode } = useThemeMode()
  return (
    <button onClick={toggleMode} aria-label="toggle">
      {mode}
    </button>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('toggles theme and persists to localStorage', async () => {
    render(
      <AppThemeProvider>
        <ToggleProbe />
      </AppThemeProvider>
    )

    const btn = screen.getByRole('button', { name: /toggle/i })
    expect(btn).toHaveTextContent('light')

    await userEvent.click(btn)
    expect(btn).toHaveTextContent('dark')
    expect(localStorage.getItem('themeMode')).toBe('dark')
  })
})



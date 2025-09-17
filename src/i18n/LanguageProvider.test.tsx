import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LanguageProvider, useLanguage } from './LanguageProvider'
import '../i18n/i18n'

function SwitchProbe() {
  const { language, setLanguage } = useLanguage()
  return (
    <button onClick={() => setLanguage(language === 'en' ? 'fa' : 'en')} aria-label="lng">
      {language}
    </button>
  )
}

describe('LanguageProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.dir = 'ltr'
    document.documentElement.lang = 'en'
  })

  it('switches language, persists, and updates dir', async () => {
    render(
      <LanguageProvider>
        <SwitchProbe />
      </LanguageProvider>
    )
    const btn = screen.getByRole('button', { name: /lng/i })
    expect(btn).toHaveTextContent('en')
    await userEvent.click(btn)
    expect(btn).toHaveTextContent('fa')
    expect(localStorage.getItem('lng')).toBe('fa')
    expect(document.documentElement.dir).toBe('rtl')
  })
})



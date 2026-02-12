import { NavLink } from 'react-router-dom'
import { ReactNode, useEffect, useState } from 'react'

interface AppShellProps {
  children: ReactNode
}

const navItems = [
  { to: '/', label: 'Overview' },
  { to: '/workbench', label: 'Workbench' },
  { to: '/feedback', label: 'Feedback Studio' },
  { to: '/versions', label: 'Version Timeline' },
]

export default function AppShell({ children }: AppShellProps) {
  const [theme, setTheme] = useState<'dark' | 'cold' | 'warm' | 'v2'>(() => {
    const saved = localStorage.getItem('ui_demo_theme')
    if (saved === 'dark' || saved === 'warm' || saved === 'cold' || saved === 'v2') {
      return saved
    }
    return 'cold'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('ui_demo_theme', theme)
  }, [theme])

  return (
    <div className="app-root">
      <aside className="sidebar">
        <p className="brand-kicker">AfterWord</p>
        <h1 className="brand-title">Iteration Lab</h1>
        <p className="brand-subtitle">AI-assisted essay refinement dashboard</p>

        <nav className="nav-list">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <p>Persona</p>
          <strong>Strict but fair admissions officer</strong>
        </div>
      </aside>

      <main className="main-content">
        <div className="top-actions">
          <div className="theme-switch">
            <label htmlFor="theme-select">Style</label>
            <select
              id="theme-select"
              className="theme-select"
              value={theme}
              onChange={(event) => setTheme(event.target.value as 'dark' | 'cold' | 'warm' | 'v2')}
            >
              <option value="dark">Dark</option>
              <option value="cold">Cold</option>
              <option value="warm">Warm</option>
              <option value="v2">V2</option>
            </select>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}

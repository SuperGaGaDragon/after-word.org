import { NavLink } from 'react-router-dom'
import { ReactNode, useEffect, useState } from 'react'

interface AppShellProps {
  children: ReactNode
}

type ThemeName =
  | 'dark'
  | 'cold'
  | 'warm'
  | 'v2'
  | 'v3'
  | 'v4'
  | 'v5'
  | 'v6'
  | 'v7'
  | 'v8'
  | 'v9'
  | 'v10'
  | 'v11'
  | 'v12'
  | 'v13'
  | 'v14'
  | 'v15'

const navItems = [
  { to: '/', label: 'Overview' },
  { to: '/workbench', label: 'Workbench' },
  { to: '/feedback', label: 'Feedback Studio' },
  { to: '/versions', label: 'Version Timeline' },
]

const themeOptions: ThemeName[] = [
  'dark',
  'cold',
  'warm',
  'v2',
  'v3',
  'v4',
  'v5',
  'v6',
  'v7',
  'v8',
  'v9',
  'v10',
  'v11',
  'v12',
  'v13',
  'v14',
  'v15',
]

export default function AppShell({ children }: AppShellProps) {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('ui_demo_theme')
    if (saved && themeOptions.includes(saved as ThemeName)) {
      return saved as ThemeName
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
              onChange={(event) => setTheme(event.target.value as ThemeName)}
            >
              {themeOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'cold' ? 'Cold（暂定）' : option.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}

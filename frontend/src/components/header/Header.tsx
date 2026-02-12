import { Link } from 'react-router-dom';
import { useAuthSession } from '../../modules/auth/session/AuthSessionContext';
import './Header.css';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthSession();

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="header-brand">
          <span className="brand-kicker">AfterWord</span>
          <span className="brand-title">Iteration Lab</span>
        </Link>

        <nav className="header-nav">
          {isAuthenticated ? (
            <>
              <Link to="/works" className="nav-link">
                Works
              </Link>
              <Link to="/why" className="nav-link">
                Why
              </Link>
              <Link to="/about" className="nav-link">
                About
              </Link>
              <div className="header-user">
                <span className="user-name">{user?.username || user?.email}</span>
                <button type="button" onClick={logout} className="btn-logout">
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/why" className="nav-link">
                Why
              </Link>
              <Link to="/about" className="nav-link">
                About
              </Link>
              <Link to="/auth/login" className="btn-primary">
                Sign In
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

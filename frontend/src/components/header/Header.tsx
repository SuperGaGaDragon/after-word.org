import { Link } from 'react-router-dom';
import { useAuthSession } from '../../modules/auth/session/AuthSessionContext';
import './Header.css';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthSession();

  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/home" className="header-brand">
          <span className="brand-kicker">AfterWord</span>
          <span className="brand-title">Iteration Lab</span>
        </Link>

        <nav className="header-nav">
          <Link to="/workspace" className="nav-link">
            Workspace
          </Link>
          <Link to="/about" className="nav-link">
            About
          </Link>
          {isAuthenticated ? (
            <div className="header-user">
              <Link to="/account" className="user-link">
                {user?.username || user?.email}
              </Link>
            </div>
          ) : (
            <Link to="/auth/login" className="btn-primary">
              Login / Signup
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

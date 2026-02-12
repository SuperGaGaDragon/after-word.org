import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthSession } from '../auth/session/AuthSessionContext';
import { changePassword, changeUsername, getCurrentUser, UserInfo } from './api/accountApi';
import './AccountPage.css';

type TabType = 'account' | 'password';

export function AccountPage() {
  const navigate = useNavigate();
  const { logout } = useAuthSession();
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Account tab state
  const [newUsername, setNewUsername] = useState('');
  const [updatingUsername, setUpdatingUsername] = useState(false);

  // Password tab state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    async function loadUserInfo() {
      try {
        const user = await getCurrentUser();
        setUserInfo(user);
        setNewUsername(user.username);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user info');
      } finally {
        setLoading(false);
      }
    }

    void loadUserInfo();
  }, []);

  async function handleUpdateUsername(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }

    if (newUsername === userInfo?.username) {
      setError('New username is the same as current username');
      return;
    }

    setUpdatingUsername(true);
    try {
      await changeUsername(newUsername);
      setUserInfo((prev) => (prev ? { ...prev, username: newUsername } : null));
      setSuccess('Username updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update username');
    } finally {
      setUpdatingUsername(false);
    }
  }

  async function handleChangePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    // Frontend validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword({
        oldPassword,
        newPassword,
        newPasswordConfirm: confirmPassword
      });
      setSuccess('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <main className="account-page">
        <div className="account-container">
          <p>Loading account information...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="account-page">
      <div className="account-container">
        <h1 className="account-title">Account Settings</h1>

        <div className="account-layout">
          {/* Left sidebar navigation */}
          <nav className="account-nav">
            <button
              type="button"
              className={`nav-item ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('account');
                setError(null);
                setSuccess(null);
              }}
            >
              Account
            </button>
            <button
              type="button"
              className={`nav-item ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('password');
                setError(null);
                setSuccess(null);
              }}
            >
              Change Password
            </button>
            <div className="nav-divider" />
            <button
              type="button"
              className="nav-item nav-logout"
              onClick={() => {
                logout();
                navigate('/auth/login');
              }}
            >
              Sign Out
            </button>
          </nav>

          {/* Right content area */}
          <div className="account-content">
            {error && (
              <div className="message-box error-box" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="message-box success-box" role="status">
                {success}
              </div>
            )}

            {activeTab === 'account' && (
              <section className="account-section">
                <h2>Account Information</h2>

                <div className="info-group">
                  <label className="info-label">Email</label>
                  <div className="info-value readonly">{userInfo?.email}</div>
                  <p className="info-hint">Email cannot be changed</p>
                </div>

                <form onSubmit={handleUpdateUsername} className="account-form">
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      id="username"
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      disabled={updatingUsername}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={updatingUsername || newUsername === userInfo?.username}
                  >
                    {updatingUsername ? 'Updating...' : 'Update Username'}
                  </button>
                </form>
              </section>
            )}

            {activeTab === 'password' && (
              <section className="account-section">
                <h2>Change Password</h2>

                <form onSubmit={handleChangePassword} className="account-form">
                  <div className="form-group">
                    <label htmlFor="old-password">Current Password</label>
                    <input
                      id="old-password"
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      disabled={changingPassword}
                      autoComplete="current-password"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="new-password">New Password</label>
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={changingPassword}
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                    <p className="field-hint">Minimum 6 characters</p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirm-password">Confirm New Password</label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={changingPassword}
                      autoComplete="new-password"
                      required
                      minLength={6}
                    />
                    {newPassword && confirmPassword && newPassword !== confirmPassword && (
                      <p className="field-error">Passwords do not match</p>
                    )}
                  </div>

                  <button type="submit" className="btn-primary" disabled={changingPassword}>
                    {changingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthShell } from './AuthShell';

export function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <AuthShell title="Welcome Back" subtitle="Sign in to continue to your works.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="login-email-username">Email or Username</label>
        <input
          id="login-email-username"
          name="email_or_username"
          type="text"
          autoComplete="username"
          value={emailOrUsername}
          onChange={(event) => setEmailOrUsername(event.target.value)}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <button type="submit">Sign In</button>
      </form>

      <p className="auth-footnote">
        New here? <Link to="/auth/signup">Create account</Link>
      </p>
    </AuthShell>
  );
}

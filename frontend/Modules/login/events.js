// -*- coding: utf-8 -*-
const API_BASE = '/api';
const JWT_TOKEN_KEY = 'jwt_token';
const USERNAME_KEY = 'username';
const LOGIN_FORM_SELECTOR = 'form[data-form="login"]';
const SIGNUP_LINK_SELECTOR = 'a[data-action="show-signup"]';

async function requestJson(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Login failed');
  }
  return response.json();
}

async function loginUser(emailOrUsername, password) {
  const data = await requestJson('/auth/login', {
    email_or_username: emailOrUsername,
    password
  });
  localStorage.setItem(JWT_TOKEN_KEY, data.token);
  if (data.user && data.user.username) {
    localStorage.setItem(USERNAME_KEY, data.user.username);
  }
  return data;
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector(LOGIN_FORM_SELECTOR);
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const emailOrUsername = formData.get('email_username');
      const password = formData.get('password');

      try {
        await loginUser(emailOrUsername, password);
        window.location.href = '/workspace';
      } catch (error) {
        alert(`Login failed: ${error.message}`);
      }
    });
  }

  const signupLink = document.querySelector(SIGNUP_LINK_SELECTOR);
  if (signupLink) {
    signupLink.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = '/signup';
    });
  }
});

window.LoginEvents = { loginUser };

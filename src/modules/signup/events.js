// -*- coding: utf-8 -*-
const API_BASE = '/api';
const JWT_TOKEN_KEY = 'jwt_token';
const USERNAME_KEY = 'username';
const SIGNUP_FORM_SELECTOR = 'form[data-form="signup"]';
const LOGIN_LINK_SELECTOR = 'a[data-action="show-login"]';

async function requestJson(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Signup failed');
  }
  return response.json();
}

async function signupUser(email, username, password) {
  const data = await requestJson('/auth/signup', { email, username, password });
  localStorage.setItem(JWT_TOKEN_KEY, data.token);
  if (data.user && data.user.username) {
    localStorage.setItem(USERNAME_KEY, data.user.username);
  }
  return data;
}

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.querySelector(SIGNUP_FORM_SELECTOR);
  if (signupForm) {
    signupForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(signupForm);
      const email = formData.get('email');
      const username = formData.get('username');
      const password = formData.get('password');

      try {
        await signupUser(email, username, password);
        window.location.href = '/workspace';
      } catch (error) {
        alert(`Signup failed: ${error.message}`);
      }
    });
  }

  const loginLink = document.querySelector(LOGIN_LINK_SELECTOR);
  if (loginLink) {
    loginLink.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = '/login';
    });
  }
});

window.SignupEvents = { signupUser };

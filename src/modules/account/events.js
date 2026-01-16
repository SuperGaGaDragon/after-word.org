// -*- coding: utf-8 -*-
const API_BASE = '/api';
const JWT_TOKEN_KEY = 'jwt_token';
const CHANGE_USERNAME_FORM_SELECTOR = 'form[data-form="change-username"]';
const CHANGE_PASSWORD_FORM_SELECTOR = 'form[data-form="change-password"]';
const STATUS_SELECTOR = '[data-role="status-message"]';

function getAuthToken() {
  return localStorage.getItem(JWT_TOKEN_KEY);
}

function setStatus(message, isError) {
  const status = document.querySelector(STATUS_SELECTOR);
  if (status) {
    status.textContent = message;
    status.style.color = isError ? '#b91c1c' : '#1f2937';
  } else if (message) {
    alert(message);
  }
}

async function requestAuth(path, body) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required.');
  }
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Request failed');
  }
  return response.json();
}

async function changeUsername(newUsername) {
  await requestAuth('/auth/change_username', { new_username: newUsername });
  const currentUsernameInput = document.getElementById('current-username');
  if (currentUsernameInput) currentUsernameInput.value = newUsername;
}

async function changePassword(oldPassword, newPassword, confirmPassword) {
  if (newPassword !== confirmPassword) {
    throw new Error('New passwords do not match.');
  }
  if (newPassword === oldPassword) {
    throw new Error('New password must differ from old password.');
  }
  await requestAuth('/auth/change_password', {
    old_password: oldPassword,
    new_password: newPassword,
    new_password_confirm: confirmPassword
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const changeUsernameForm = document.querySelector(CHANGE_USERNAME_FORM_SELECTOR);
  if (changeUsernameForm) {
    changeUsernameForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(changeUsernameForm);
      const newUsername = formData.get('new_username');

      try {
        await changeUsername(newUsername);
        setStatus('Username changed successfully.', false);
      } catch (error) {
        setStatus(`Failed to change username: ${error.message}`, true);
      }
    });
  }

  const changePasswordForm = document.querySelector(CHANGE_PASSWORD_FORM_SELECTOR);
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(changePasswordForm);
      const oldPassword = formData.get('old_password');
      const newPassword = formData.get('new_password');
      const confirmPassword = formData.get('confirm_password');

      try {
        await changePassword(oldPassword, newPassword, confirmPassword);
        setStatus('Password changed successfully.', false);
        changePasswordForm.reset();
      } catch (error) {
        setStatus(`Failed to change password: ${error.message}`, true);
      }
    });
  }
});

window.AccountSettingsEvents = { changeUsername, changePassword };

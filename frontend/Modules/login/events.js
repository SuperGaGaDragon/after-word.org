// -*- coding: utf-8 -*-
/**
 * This module handles events for the login page, interacting with the backend API
 * to authenticate users and manage JWT tokens.
 *
 * Implements Phase5D Stage4B - Auth Events JS for Login.
 */

// Global constant for JWT storage key
const JWT_TOKEN_KEY = 'jwt_token';
const LOGIN_FORM_SELECTOR = 'form[data-form="login"]';
const SIGNUP_LINK_SELECTOR = 'a[data-action="show-signup"]';

/**
 * Simulates an API call to log in a user.
 * In a real application, this would use fetch() or a library like Axios.
 * @param {string} email_username The user's email or username.
 * @param {string} password The user's password.
 * @returns {Promise<string>} A promise that resolves with a JWT token string on success.
 * @throws {Error} If login fails.
 */
async function loginUser(email_username, password) {
    console.log(`Attempting to log in user: ${email_username}`);
    // Simulate API call
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email_username && password === 'password123') { // Simple mock authentication
                const mockJwt = `mock_jwt_for_${email_username}`;
                localStorage.setItem(JWT_TOKEN_KEY, mockJwt);
                console.log('Login successful, JWT saved.');
                resolve(mockJwt);
            } else {
                reject(new Error('Invalid credentials.'));
            }
        }, 1000);
    });
}

/**
 * Sets up event listeners for the login form and navigation.
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector(LOGIN_FORM_SELECTOR);
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(loginForm);
            const email_username = formData.get('email_username');
            const password = formData.get('password');

            try {
                await loginUser(email_username, password);
                alert('Login successful! Redirecting to workspace.');
                // In a real app, redirect to workspace or update UI
                window.location.href = '/workspace'; // Example redirect
            } catch (error) {
                alert(`Login failed: ${error.message}`);
            }
        });
    }

    const signupLink = document.querySelector(SIGNUP_LINK_SELECTOR);
    if (signupLink) {
        signupLink.addEventListener('click', (event) => {
            event.preventDefault();
            console.log('Navigating to signup page.');
            // In a real app, change route or display signup form
            window.location.href = '/signup'; // Example redirect
        });
    }
});

// Expose functions for testing or interaction
window.LoginEvents = {
    loginUser,
};

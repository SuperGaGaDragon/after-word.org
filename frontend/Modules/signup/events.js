// -*- coding: utf-8 -*-
/**
 * This module handles events for the signup page, interacting with the backend API
 * to register new users and manage JWT tokens.
 *
 * Implements Phase5D Stage4B - Auth Events JS for Signup.
 */

// Global constant for JWT storage key
const JWT_TOKEN_KEY = 'jwt_token';
const SIGNUP_FORM_SELECTOR = 'form[data-form="signup"]';
const LOGIN_LINK_SELECTOR = 'a[data-action="show-login"]';

/**
 * Simulates an API call to sign up a new user.
 * @param {string} email The user's email address.
 * @param {string} username The desired username.
 * @param {string} password The user's password.
 * @returns {Promise<string>} A promise that resolves with a JWT token string on success.
 * @throws {Error} If signup fails.
 */
async function signupUser(email, username, password) {
    console.log(`Attempting to sign up user: ${username} (${email})`);
    // Simulate API call
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email && username && password && !email.includes('fail')) { // Simple mock
                const mockJwt = `mock_jwt_for_${username}`;
                localStorage.setItem(JWT_TOKEN_KEY, mockJwt);
                console.log('Signup successful, JWT saved.');
                resolve(mockJwt);
            } else {
                reject(new Error('Signup failed. Please check your details.'));
            }
        }, 1000);
    });
}

/**
 * Sets up event listeners for the signup form and navigation.
 */
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
                alert('Signup successful! Redirecting to workspace.');
                // In a real app, redirect to workspace or update UI
                window.location.href = '/workspace'; // Example redirect
            } catch (error) {
                alert(`Signup failed: ${error.message}`);
            }
        });
    }

    const loginLink = document.querySelector(LOGIN_LINK_SELECTOR);
    if (loginLink) {
        loginLink.addEventListener('click', (event) => {
            event.preventDefault();
            console.log('Navigating to login page.');
            // In a real app, change route or display login form
            window.location.href = '/login'; // Example redirect
        });
    }
});

// Expose functions for testing or interaction
window.SignupEvents = {
    signupUser,
};

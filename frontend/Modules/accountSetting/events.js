// -*- coding: utf-8 -*-
/**
 * This module handles events for the account settings page, interacting with the
 * backend API to allow users to change their username and password.
 *
 * Implements Phase5D Stage4B - Auth Events JS for Account Settings.
 */

// Global constant for JWT storage key
const JWT_TOKEN_KEY = 'jwt_token';
const CHANGE_USERNAME_FORM_SELECTOR = 'form[data-form="change-username"]';
const CHANGE_PASSWORD_FORM_SELECTOR = 'form[data-form="change-password"]';

/**
 * Helper to get the current JWT token from localStorage.
 * @returns {string|null} The JWT token or null if not found.
 */
function getAuthToken() {
    return localStorage.getItem(JWT_TOKEN_KEY);
}

/**
 * Simulates an API call to change the user's username.
 * @param {string} newUsername The new username.
 * @returns {Promise<void>} A promise that resolves on success.
 * @throws {Error} If the operation fails.
 */
async function changeUsername(newUsername) {
    console.log(`Attempting to change username to: ${newUsername}`);
    const token = getAuthToken();
    if (!token) {
        throw new Error("Authentication required.");
    }
    // Simulate API call (e.g., PUT /api/auth/change_username)
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (newUsername && newUsername !== '[Current Username]') { // Mock success
                console.log('Username changed successfully.');
                // Update UI to reflect new username if applicable
                document.getElementById('current-username').value = newUsername;
                resolve();
            } else {
                reject(new Error('Invalid new username or same as current.'));
            }
        }, 1000);
    });
}

/**
 * Simulates an API call to change the user's password.
 * @param {string} oldPassword The current password.
 * @param {string} newPassword The new password.
 * @param {string} confirmPassword The confirmed new password.
 * @returns {Promise<void>} A promise that resolves on success.
 * @throws {Error} If the operation fails.
 */
async function changePassword(oldPassword, newPassword, confirmPassword) {
    console.log('Attempting to change password.');
    const token = getAuthToken();
    if (!token) {
        throw new Error("Authentication required.");
    }
    if (newPassword !== confirmPassword) {
        throw new Error("New passwords do not match.");
    }
    if (newPassword === oldPassword) {
        throw new Error("New password cannot be the same as the old password.");
    }

    // Simulate API call (e.g., PUT /api/auth/change_password)
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (oldPassword === 'password123' && newPassword.length >= 6) { // Mock success
                console.log('Password changed successfully.');
                resolve();
            } else {
                reject(new Error('Old password incorrect or new password invalid.'));
            }
        }, 1000);
    });
}


/**
 * Sets up event listeners for the account settings forms.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Populate current username (mock for now)
    const currentUsernameInput = document.getElementById('current-username');
    if (currentUsernameInput && getAuthToken()) {
        // In a real app, you'd fetch the actual username via API
        currentUsernameInput.value = 'mockUser';
    }


    const changeUsernameForm = document.querySelector(CHANGE_USERNAME_FORM_SELECTOR);
    if (changeUsernameForm) {
        changeUsernameForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const formData = new FormData(changeUsernameForm);
            const newUsername = formData.get('new_username');

            try {
                await changeUsername(newUsername);
                alert('Username changed successfully!');
            } catch (error) {
                alert(`Failed to change username: ${error.message}`);
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
                alert('Password changed successfully!');
                changePasswordForm.reset(); // Clear form after success
            } catch (error) {
                alert(`Failed to change password: ${error.message}`);
            }
        });
    }
});

// Expose functions for testing or interaction
window.AccountSettingsEvents = {
    changeUsername,
    changePassword,
};

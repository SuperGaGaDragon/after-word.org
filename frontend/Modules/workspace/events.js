// -*- coding: utf-8 -*-
/**
 * This module handles JavaScript events and authentication gating for the workspace page.
 * It detects user's login status via JWT and controls the display of a login modal
 * to enforce authenticated access for certain actions.
 *
 * Implements Phase5C Stage3A - Workspace Auth Gate.
 */

// Placeholder for JWT utility - in a real app, this would be imported or
// part of a global utility. For now, we simulate.
const JWT_TOKEN_KEY = 'jwt_token'; // Key for localStorage
const LOGIN_MODAL_ID = 'login-prompt-modal'; // ID of the login modal from layout.html
const EDITOR_TEXTAREA_SELECTOR = 'textarea[data-role="editor"]'; // Selector for the editor
const NEW_WORK_BUTTON_SELECTOR = 'button[data-action="new-work"]'; // Selector for new work button
const LLM_COMMENT_BUTTON_SELECTOR = 'button[data-action="llm-comment"]'; // Selector for LLM button
const USER_ENTRY_SELECTOR = 'div[data-role="user-entry"]'; // Selector for user entry area

/**
 * Checks if a user is currently authenticated by looking for a JWT in localStorage.
 * @returns {boolean} True if a valid-looking JWT is present, false otherwise.
 */
function isAuthenticated() {
    const token = localStorage.getItem(JWT_TOKEN_KEY);
    // In a real application, you would also decode and validate the token's expiration.
    // For this stage, presence is sufficient.
    return !!token;
}

/**
 * Displays the login modal to prompt the user to sign up or log in.
 */
function showLoginModal() {
    const loginModal = document.getElementById(LOGIN_MODAL_ID);
    if (loginModal) {
        loginModal.style.display = 'block'; // Make modal visible
        // In a real app, you might add more sophisticated modal control (e.g., backdrop)
        console.log("Login modal displayed: Signup / Login for full experience");
    }
}

/**
 * Hides the login modal.
 */
function hideLoginModal() {
    const loginModal = document.getElementById(LOGIN_MODAL_ID);
    if (loginModal) {
        loginModal.style.display = 'none'; // Hide modal
    }
}

/**
 * Guards actions that require authentication. If the user is not authenticated,
 * it displays a login modal and prevents the default action.
 * @param {Event} event The DOM event that triggered the action.
 * @param {string} actionDescription A description of the action being guarded.
 * @returns {boolean} True if the user is authenticated and the action can proceed, false otherwise.
 */
function guardAuth(event, actionDescription = 'this action') {
    if (!isAuthenticated()) {
        event.preventDefault(); // Prevent the default action (e.g., button click)
        showLoginModal();
        console.warn(`Attempted "${actionDescription}" while unauthenticated. Showing login prompt.`);
        return false;
    }
    return true;
}

/**
 * Disables the editor for unauthenticated users.
 */
function disableEditorForUnauthenticated() {
    const editor = document.querySelector(EDITOR_TEXTAREA_SELECTOR);
    if (editor && !isAuthenticated()) {
        editor.setAttribute('readonly', 'true');
        editor.placeholder = "Please log in to start writing...";
        editor.style.cursor = 'not-allowed';
    } else if (editor && isAuthenticated()) {
        editor.removeAttribute('readonly');
        editor.placeholder = "Start writing...";
        editor.style.cursor = 'auto';
    }
}

/**
 * Sets up event listeners for authentication-gated actions.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Hide login modal on page load
    hideLoginModal();

    // Apply editor state based on authentication
    disableEditorForUnauthenticated();

    // Guard 'New Work' button
    const newWorkButton = document.querySelector(NEW_WORK_BUTTON_SELECTOR);
    if (newWorkButton) {
        newWorkButton.addEventListener('click', (event) => {
            guardAuth(event, 'create new work');
        });
    }

    // Guard 'LLM Comment' button
    const llmCommentButton = document.querySelector(LLM_COMMENT_BUTTON_SELECTOR);
    if (llmCommentButton) {
        llmCommentButton.addEventListener('click', (event) => {
            guardAuth(event, 'use LLM comment feature');
        });
    }

    // Guard editor input - if user tries to type
    const editor = document.querySelector(EDITOR_TEXTAREA_SELECTOR);
    if (editor) {
        editor.addEventListener('keydown', (event) => {
            if (editor.hasAttribute('readonly')) {
                guardAuth(event, 'edit the workspace');
            }
        });
    }

    // Example of how to close the modal (e.g., a close button inside the modal)
    // For now, let's just log. In a real app, modal would have its own close logic.
    const loginModal = document.getElementById(LOGIN_MODAL_ID);
    if (loginModal) {
        loginModal.addEventListener('click', (event) => {
            if (event.target === loginModal) { // Clicked outside the modal content
                hideLoginModal();
            }
        });
        // You'd typically have an explicit close button inside the modal
        // For example: document.getElementById('login-modal-close-button').addEventListener('click', hideLoginModal);
    }
});

// Expose some functions for testing or console interaction if needed
window.AuthEvents = {
    isAuthenticated,
    showLoginModal,
    hideLoginModal,
    guardAuth,
    disableEditorForUnauthenticated
};

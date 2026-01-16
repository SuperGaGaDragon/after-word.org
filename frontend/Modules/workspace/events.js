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
const WORK_LIST_CONTAINER_SELECTOR = 'div[data-role="work-list"]'; // Selector for work list container
const LLM_PANEL_SELECTOR = 'div[data-role="llm-panel"]'; // Selector for LLM floating panel

// Global state for the current work
let currentWorkId = null; // Stores the ID of the currently active work

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
 * Updates the work history list display.
 * In a real app, this would fetch data from a backend.
 */
function updateWorkList() {
    const workListContainer = document.querySelector(WORK_LIST_CONTAINER_SELECTOR);
    if (!workListContainer) return;

    // Simulate fetching work items
    const workItems = isAuthenticated() ? [
        { id: 'work-1', title: 'My First Work', content: 'Content of first work.' },
        { id: 'work-2', title: 'A Creative Piece', content: 'Content of creative piece.' },
        { id: 'work-3', title: 'Project Proposal', content: 'Content of project proposal.' },
    ] : []; // Empty if not authenticated

    workListContainer.innerHTML = ''; // Clear existing list

    if (workItems.length === 0) {
        workListContainer.innerHTML = '<p>No works yet. Create one!</p>';
        return;
    }

    workItems.forEach(work => {
        const workItemDiv = document.createElement('div');
        workItemDiv.classList.add('work-list-item');
        workItemDiv.setAttribute('data-work-id', work.id);
        workItemDiv.textContent = work.title;
        workItemDiv.addEventListener('click', () => loadWork(work.id, work.content));
        workListContainer.appendChild(workItemDiv);
    });
}

/**
 * Creates a new work.
 * @returns {string} The ID of the newly created work.
 */
function createNewWork() {
    if (!isAuthenticated()) {
        showLoginModal();
        return;
    }
    // In a real app, this would make an API call to create work and get an ID.
    const newId = `work-${Date.now()}`;
    const editor = document.querySelector(EDITOR_TEXTAREA_SELECTOR);
    if (editor) editor.value = ''; // Clear editor
    currentWorkId = newId;
    hideLLMPanel(); // Hide LLM panel as per instructions
    console.log(`New work created: ${newId}`);
    updateWorkList(); // Refresh the list
    return newId;
}

/**
 * Loads a specific work into the editor.
 * @param {string} workId The ID of the work to load.
 * @param {string} content The content of the work to load. (Simulated)
 */
function loadWork(workId, content) {
    if (!isAuthenticated()) {
        showLoginModal();
        return;
    }
    const editor = document.querySelector(EDITOR_TEXTAREA_SELECTOR);
    if (editor) {
        editor.value = content;
    }
    currentWorkId = workId;
    hideLLMPanel(); // Hide LLM panel as per instructions
    console.log(`Work ${workId} loaded.`);
}

/**
 * Shows the LLM comment panel.
 */
function showLLMPanel() {
    const llmPanel = document.querySelector(LLM_PANEL_SELECTOR);
    if (llmPanel) {
        llmPanel.style.display = 'block'; // Make LLM panel visible
    }
}

/**
 * Hides the LLM comment panel.
 */
function hideLLMPanel() {
    const llmPanel = document.querySelector(LLM_PANEL_SELECTOR);
    if (llmPanel) {
        llmPanel.style.display = 'none';
    }
}

/**
 * Calls the simulated LLM comment API.
 * @param {string} text The text to send to the LLM.
 * @returns {Promise<string>} A promise that resolves with the LLM's comment.
 */
async function fetchLLMComment(text) {
    // In a real app, this would be an actual API call.
    console.log(`Calling /api/llm/comment with text: "${text.substring(0, 50)}..."`);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`LLM comment on "${text.substring(0, 20)}...": This is a very insightful piece. Consider expanding point X.`);
        }, 1000); // Simulate network delay
    });
}

/**
 * Calls the simulated conversation history API.
 * @param {string} workId The ID of the work to fetch history for.
 * @returns {Promise<Array<string>>} A promise that resolves with an array of conversation messages.
 */
async function fetchConversationHistory(workId) {
    // In a real app, this would be an actual API call.
    console.log(`Calling /api/conversation/${workId} to get history.`);
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                `User: What do you think about this?`,
                `LLM: It has potential.`,
                `User: Should I change the tone?`,
                `LLM: A more assertive tone might be beneficial.`
            ]);
        }, 800); // Simulate network delay
    });
}


/**
 * Sets up event listeners for authentication-gated actions and workflow.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Hide login modal on page load
    hideLoginModal();
    hideLLMPanel(); // Hide LLM panel on page load too

    // Apply editor state based on authentication
    disableEditorForUnauthenticated();

    // Initial load of work list
    updateWorkList();

    // Guard 'New Work' button
    const newWorkButton = document.querySelector(NEW_WORK_BUTTON_SELECTOR);
    if (newWorkButton) {
        newWorkButton.addEventListener('click', (event) => {
            if (guardAuth(event, 'create new work')) {
                createNewWork();
            }
        });
    }

    // Guard 'LLM Comment' button
    const llmCommentButton = document.querySelector(LLM_COMMENT_BUTTON_SELECTOR);
    const llmPanel = document.querySelector(LLM_PANEL_SELECTOR);
    if (llmCommentButton && llmPanel) {
        llmCommentButton.addEventListener('click', async (event) => {
            if (guardAuth(event, 'use LLM comment feature') && currentWorkId) {
                showLLMPanel(); // Show panel first
                llmPanel.innerHTML = 'Loading LLM comment and history...';
                const editor = document.querySelector(EDITOR_TEXTAREA_SELECTOR);
                const currentText = editor ? editor.value : '';

                try {
                    const llmComment = await fetchLLMComment(currentText);
                    const conversationHistory = await fetchConversationHistory(currentWorkId);

                    llmPanel.innerHTML = `<h3>LLM Comment:</h3><p>${llmComment}</p>` +
                                         `<h3>Conversation History:</h3><ul>` +
                                         conversationHistory.map(msg => `<li>${msg}</li>`).join('') +
                                         `</ul>`;
                } catch (error) {
                    llmPanel.innerHTML = `<p style="color: red;">Error fetching LLM data: ${error.message}</p>`;
                    console.error("Error fetching LLM data:", error);
                }
            } else if (!currentWorkId) {
                // If authenticated but no current work, prompt user to create/load one.
                showLLMPanel(); // Maybe show a message in the panel
                llmPanel.innerHTML = '<p>Please create or load a work to use the LLM feature.</p>';
            }
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

    // Auto-save every 30 seconds if authenticated and work is active
    setInterval(saveCurrentWork, 30 * 1000);
});

// Expose some functions for testing or console interaction if needed
window.AuthEvents = {
    isAuthenticated,
    showLoginModal,
    hideLoginModal,
    guardAuth,
    disableEditorForUnauthenticated
};

window.WorkFlowEvents = {
    createNewWork,
    loadWork,
    saveCurrentWork,
    updateWorkList,
    getCurrentWorkId: () => currentWorkId
};

window.LLMEvents = {
    showLLMPanel,
    hideLLMPanel,
    fetchLLMComment,
    fetchConversationHistory
};

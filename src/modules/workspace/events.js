// -*- coding: utf-8 -*-
const API_BASE = '/api';
const JWT_TOKEN_KEY = 'jwt_token';
const USERNAME_KEY = 'username';
const DEVICE_ID_KEY = 'device_id';

const SELECTORS = {
  editor: 'textarea[data-role="editor"]',
  newWork: 'button[data-action="new-work"]',
  llmComment: 'button[data-action="llm-comment"]',
  workList: 'div[data-role="work-list"]',
  llmPanel: 'div[data-role="llm-panel"]',
  loginModal: '#login-prompt-modal',
  loginMessage: '[data-role="login-message"]',
  username: '#username-display',
  loginButton: '#login-button',
  signupButton: '#signup-button'
};

let currentWorkId = null;

function getToken() {
  return localStorage.getItem(JWT_TOKEN_KEY);
}

function getUsername() {
  return localStorage.getItem(USERNAME_KEY);
}

function ensureDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

function isAuthenticated() {
  return !!getToken();
}

function showLoginModal() {
  const modal = document.querySelector(SELECTORS.loginModal);
  const message = document.querySelector(SELECTORS.loginMessage);
  if (message) {
    message.textContent = 'Signup / Login for full experience';
  }
  if (modal) {
    modal.style.display = 'flex';
  }
}

function hideLoginModal() {
  const modal = document.querySelector(SELECTORS.loginModal);
  if (modal) {
    modal.style.display = 'none';
  }
}

function guardAuth(event) {
  if (!isAuthenticated()) {
    if (event) event.preventDefault();
    showLoginModal();
    return false;
  }
  return true;
}

function updateUserEntry() {
  const username = document.querySelector(SELECTORS.username);
  const loginButton = document.querySelector(SELECTORS.loginButton);
  const signupButton = document.querySelector(SELECTORS.signupButton);
  if (!username || !loginButton || !signupButton) return;
  if (isAuthenticated()) {
    username.textContent = getUsername() || 'User';
    loginButton.style.display = 'none';
    signupButton.style.display = 'none';
  } else {
    username.textContent = '';
    loginButton.style.display = 'inline-block';
    signupButton.style.display = 'inline-block';
  }
}

async function requestJson(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (options.auth) {
    headers.Authorization = `Bearer ${getToken()}`;
  }
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  if (!response.ok) {
    if (response.status === 401) {
      showLoginModal();
    }
    const errorText = await response.text();
    throw new Error(errorText || 'Request failed');
  }
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : null;
}

async function updateWorkList() {
  const container = document.querySelector(SELECTORS.workList);
  if (!container) return;
  container.innerHTML = '';
  if (!isAuthenticated()) {
    container.textContent = 'Please log in to view your works.';
    return;
  }
  try {
    const data = await requestJson('/work/list', { auth: true });
    const items = data && data.items ? data.items : [];
    if (items.length === 0) {
      container.textContent = 'No works yet.';
      return;
    }
    items.forEach((item) => {
      const entry = document.createElement('div');
      entry.className = 'work-list-item';
      entry.textContent = item.work_id;
      entry.dataset.workId = item.work_id;
      entry.addEventListener('click', () => loadWork(item.work_id));
      container.appendChild(entry);
    });
  } catch (error) {
    showLoginModal();
    container.textContent = '';
  }
}

async function createNewWork() {
  if (!guardAuth()) return;
  const result = await requestJson('/work/create', { method: 'POST', auth: true });
  currentWorkId = result ? result.work_id : null;
  const editor = document.querySelector(SELECTORS.editor);
  if (editor) editor.value = '';
  hideLLMPanel();
  await updateWorkList();
}

async function loadWork(workId) {
  if (!guardAuth()) return;
  const data = await requestJson(`/work/${workId}`, { auth: true });
  const editor = document.querySelector(SELECTORS.editor);
  if (editor) editor.value = data ? data.content : '';
  currentWorkId = workId;
  hideLLMPanel();
}

async function saveCurrentWork() {
  if (!isAuthenticated() || !currentWorkId) return;
  const editor = document.querySelector(SELECTORS.editor);
  const content = editor ? editor.value : '';
  await requestJson(`/work/${currentWorkId}/update`, {
    method: 'POST',
    auth: true,
    body: { content, device_id: ensureDeviceId() }
  });
}

function showLLMPanel() {
  const panel = document.querySelector(SELECTORS.llmPanel);
  if (panel) panel.style.display = 'block';
}

function hideLLMPanel() {
  const panel = document.querySelector(SELECTORS.llmPanel);
  if (panel) panel.style.display = 'none';
}

async function loadConversation(workId) {
  const data = await requestJson(`/conversation/${workId}`, { auth: true });
  return data && data.items ? data.items : [];
}

async function handleLLMComment() {
  if (!guardAuth()) return;
  const panel = document.querySelector(SELECTORS.llmPanel);
  if (!currentWorkId) {
    if (panel) panel.textContent = 'Please create or load a work first.';
    showLLMPanel();
    return;
  }
  const editor = document.querySelector(SELECTORS.editor);
  const textSnapshot = editor ? editor.value.trim() : '';
  if (!textSnapshot) {
    if (panel) panel.textContent = 'Please add content before requesting comments.';
    showLLMPanel();
    return;
  }
  showLLMPanel();
  if (panel) panel.textContent = 'Loading...';
  const response = await requestJson('/llm/comment', {
    method: 'POST',
    auth: true,
    body: { work_id: currentWorkId, text_snapshot: textSnapshot }
  });
  const history = await loadConversation(currentWorkId);
  if (panel) {
    panel.innerHTML = '';
    const latestTitle = document.createElement('strong');
    latestTitle.textContent = 'Latest Comment:';
    const latestBody = document.createElement('p');
    latestBody.textContent = response && response.comment ? response.comment : '';
    const historyTitle = document.createElement('strong');
    historyTitle.textContent = 'History:';
    const list = document.createElement('ul');
    history.forEach((item) => {
      const entry = document.createElement('li');
      entry.textContent = item && item.content ? item.content : '';
      list.appendChild(entry);
    });
    panel.append(latestTitle, latestBody, historyTitle, list);
  }
}

function syncEditorState() {
  const editor = document.querySelector(SELECTORS.editor);
  if (!editor) return;
  if (!isAuthenticated()) {
    editor.setAttribute('readonly', 'true');
    editor.placeholder = 'Please log in to start writing...';
    editor.style.cursor = 'not-allowed';
  } else {
    editor.removeAttribute('readonly');
    editor.placeholder = 'Start writing...';
    editor.style.cursor = 'auto';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  hideLoginModal();
  hideLLMPanel();
  syncEditorState();
  updateUserEntry();
  updateWorkList();

  const newWorkButton = document.querySelector(SELECTORS.newWork);
  if (newWorkButton) {
    newWorkButton.addEventListener('click', () => createNewWork());
  }

  const loginButton = document.querySelector(SELECTORS.loginButton);
  if (loginButton) {
    loginButton.addEventListener('click', () => {
      window.location.href = '/login';
    });
  }

  const signupButton = document.querySelector(SELECTORS.signupButton);
  if (signupButton) {
    signupButton.addEventListener('click', () => {
      window.location.href = '/signup';
    });
  }

  const llmButton = document.querySelector(SELECTORS.llmComment);
  if (llmButton) {
    llmButton.addEventListener('click', () => handleLLMComment());
  }

  const editor = document.querySelector(SELECTORS.editor);
  if (editor) {
    editor.addEventListener('keydown', (event) => {
      if (editor.hasAttribute('readonly')) {
        guardAuth(event);
      }
    });
  }

  const modal = document.querySelector(SELECTORS.loginModal);
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) hideLoginModal();
    });
  }

  setInterval(() => {
    saveCurrentWork().catch(() => showLoginModal());
  }, 30 * 1000);
});

window.WorkFlowEvents = {
  createNewWork,
  loadWork,
  saveCurrentWork,
  updateWorkList,
  getCurrentWorkId: () => currentWorkId
};

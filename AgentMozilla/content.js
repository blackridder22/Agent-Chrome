// content.js - Content script for Agent Mozilla extension

let selectedText = '';
let addButton = null;

// Function to create and show the "Add to Agent Mozilla" button
function createAddButton(x, y) {
  // Remove existing button if any
  removeAddButton();

  addButton = document.createElement('div');
  addButton.id = 'agent-mozilla-add-button';
  addButton.innerHTML = '📋 Add to Agent Mozilla';
  addButton.style.cssText = `
    position: fixed;
    top: ${y + 10}px;
    left: ${x + 10}px;
    background: #4f46e5;
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    cursor: pointer;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: none;
    transition: all 0.2s ease;
    user-select: none;
  `;

  // Add hover effect
  addButton.addEventListener('mouseenter', () => {
    addButton.style.background = '#3730a3';
    addButton.style.transform = 'scale(1.05)';
  });

  addButton.addEventListener('mouseleave', () => {
    addButton.style.background = '#4f46e5';
    addButton.style.transform = 'scale(1)';
  });

  // Handle click
  addButton.addEventListener('click', () => {
    if (selectedText) {
      // Send message to background script to store text for sidebar
      browser.runtime.sendMessage({
        action: 'storeTextForSidebar',
        text: selectedText
      });
      removeAddButton();
    }
  });

  document.body.appendChild(addButton);

  // Auto-remove button after 5 seconds
  setTimeout(() => {
    removeAddButton();
  }, 5000);
}

// Function to remove the add button
function removeAddButton() {
  if (addButton && addButton.parentNode) {
    addButton.parentNode.removeChild(addButton);
    addButton = null;
  }
}

// Handle text selection
document.addEventListener('mouseup', (event) => {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  
  if (text.length > 0) {
    selectedText = text;
  } else {
    selectedText = '';
    removeAddButton();
  }
});

// Handle double-click on selected text
document.addEventListener('dblclick', (event) => {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  
  if (text.length > 0) {
    selectedText = text;
    createAddButton(event.clientX, event.clientY);
  }
});

// Remove button when clicking elsewhere
document.addEventListener('click', (event) => {
  if (addButton && !addButton.contains(event.target)) {
    const selection = window.getSelection();
    if (selection.toString().trim() === '') {
      removeAddButton();
    }
  }
});

// Handle escape key to remove button
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    removeAddButton();
  }
});

// Listen for messages from background script
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    sendResponse({ text: selectedText });
  }
});
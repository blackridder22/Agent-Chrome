// background.js for Firefox extension

browser.runtime.onInstalled.addListener(() => {
  console.log('Agent Mozilla Sidebar installed.');
  // Set up initial storage if needed
  browser.storage.sync.get(['webhooks', 'defaultWebhookName', 'theme']).then((result) => {
    if (!result.webhooks) {
      browser.storage.sync.set({ webhooks: {} });
    }
    if (!result.defaultWebhookName) {
      browser.storage.sync.set({ defaultWebhookName: '' });
    }
    if (!result.theme) {
      browser.storage.sync.set({ theme: 'dark' }); // Default theme
    }
  });

  // Create context menu
  browser.contextMenus.create({
    id: 'addToAgentMozilla',
    title: 'Add text to Agent Mozilla',
    contexts: ['selection']
  });
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'addToAgentMozilla') {
    // Store the selected text
    browser.storage.local.set({ pendingText: info.selectionText });
    // Note: Firefox sidebar is always available, no need to open it programmatically
  }
});

// Listen for messages from content scripts or sidebar
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background:', request);
  
  if (request.action === "openOptionsPage") {
    browser.runtime.openOptionsPage();
    sendResponse({status: "Options page opened or opening"});
    return true;
  }
  
  if (request.action === "storeTextForSidebar") {
    // Store the text for the sidebar to pick up
    browser.storage.local.set({ pendingText: request.text });
    sendResponse({status: "Text stored for sidebar"});
    return true;
  }
  
  // Handle other messages
});
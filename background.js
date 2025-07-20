// background.js

chrome.runtime.onInstalled.addListener(() => {
  console.log('Chat LLM Assistant installed.');
  // Set up initial storage if needed
  chrome.storage.sync.get(['webhooks', 'defaultWebhookName', 'theme'], (result) => {
    if (!result.webhooks) {
      chrome.storage.sync.set({ webhooks: {} });
    }
    if (!result.defaultWebhookName) {
      chrome.storage.sync.set({ defaultWebhookName: '' });
    }
    if (!result.theme) {
      chrome.storage.sync.set({ theme: 'dark' }); // Default theme
    }
  });

  // Create context menu
  chrome.contextMenus.create({
    id: 'addToAgentChrome',
    title: 'Add text to Agent Chrome',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'addToAgentChrome') {
    // Store the selected text and then open side panel
    chrome.storage.local.set({ pendingText: info.selectionText }, () => {
      chrome.sidePanel.open({ tabId: tab.id });
    });
  }
});

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background:', request);
  
  if (request.action === "openOptionsPage") {
    chrome.runtime.openOptionsPage();
    sendResponse({status: "Options page opened or opening"});
    return true;
  }
  
  if (request.action === "openSidePanelWithText") {
    // Store the text and open side panel
    chrome.storage.local.set({ pendingText: request.text }, () => {
      chrome.sidePanel.open({ tabId: sender.tab.id });
    });
    sendResponse({status: "Side panel opened with text"});
    return true;
  }
  
  // Handle other messages
});
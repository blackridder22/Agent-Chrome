# File Structure Guide

This document provides a detailed breakdown of every file in the Agent Chrome Extension, explaining their purpose, key functions, and how they interact with other components.

## 📁 Project Structure

```
Agent Chrome - beta v2/
├── .Agent-UI/                    # React-based UI components (future)
├── docs/                         # Documentation
├── images/                       # Extension icons and assets
├── manifest.json                 # Extension configuration
├── background.js                 # Service worker
├── popup.html                    # Main UI structure
├── popup.js                      # Main UI logic
├── popup.css                     # Main UI styling
├── options.html                  # Settings page structure
├── options.js                    # Settings page logic
├── options.css                   # Settings page styling
├── content.js                    # Content script (minimal)
└── README.md                     # Project overview
```

## 📄 Core Files

### `manifest.json`
**Purpose**: Extension configuration and permissions

```json
{
  "manifest_version": 3,
  "name": "Agent Chrome Extension",
  "version": "2.0.0",
  "description": "AI-powered assistant with minimalist design",
  "permissions": ["storage", "activeTab", "scripting"],
  "host_permissions": ["https://*/*"],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_title": "Agent Assistant"
  },
  "options_page": "options.html",
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }]
}
```

**Key Configurations**:
- **Manifest V3**: Latest Chrome extension format
- **Permissions**: Storage access and tab interaction
- **Service Worker**: Background script for lifecycle management
- **Content Scripts**: Minimal web page interaction

---

### `popup.html`
**Purpose**: Main user interface structure

**Key Sections**:
```html
<!DOCTYPE html>
<html>
<head>
  <!-- Meta tags and CSS imports -->
</head>
<body>
  <!-- Chat container with header, messages, and input -->
  <div class="chat-container">
    <div class="chat-header">
      <!-- Theme toggle, settings, history buttons -->
    </div>
    <div class="chat-area">
      <!-- Message display area -->
    </div>
    <div class="chat-input-area">
      <!-- Input field, file attachment, send button -->
    </div>
  </div>
  
  <!-- Modals for history and settings -->
  <div class="history-modal">
    <!-- Chat history display -->
  </div>
  
  <!-- Welcome message for new users -->
  <div class="welcome-message">
    <!-- Getting started guide -->
  </div>
</body>
</html>
```

**Interactive Elements**:
- Chat input with file attachment support
- Voice input/output controls
- Theme switching buttons
- Settings and history access
- Modal dialogs for extended functionality

---

### `popup.js`
**Purpose**: Main application logic and user interaction handling

**File Size**: ~2000+ lines
**Key Functions**:

#### Core Initialization
```javascript
document.addEventListener('DOMContentLoaded', function() {
  initializeExtension();
  loadWebhookAndThemeSettings();
  setupEventListeners();
});
```

#### Message Handling
```javascript
function sendMessage() {
  // Validate input
  // Process attachments
  // Make API request
  // Display response
  // Save to history
}

function displayMessage(message, type) {
  // Create message element
  // Apply styling based on type
  // Handle markdown rendering
  // Scroll to bottom
}
```

#### File Management
```javascript
function handleFileAttachment(file) {
  // Validate file size and type
  // Convert to base64
  // Display preview
  // Store temporarily
}

function removeAttachment(index) {
  // Remove from array
  // Update UI
  // Clean up storage
}
```

#### Settings Integration
```javascript
function loadWebhookAndThemeSettings() {
  chrome.storage.sync.get([
    'webhooks', 'defaultWebhookName', 'theme', 
    'designStyle', 'textSize', 'fontFamily'
  ], function(result) {
    applySettings(result);
  });
}
```

#### Voice Features
```javascript
function startVoiceRecording() {
  // Initialize speech recognition
  // Handle voice input
  // Convert to text
}

function speakResponse(text) {
  // Text-to-speech synthesis
  // Handle voice settings
  // Manage playback
}
```

**Key Features Implemented**:
- Real-time chat interface
- File attachment system (images, documents)
- Voice input/output
- Theme switching
- Chat history management
- Webhook integration
- Error handling and validation
- Responsive design support

---

### `popup.css`
**Purpose**: Complete styling for the chat interface

**File Size**: ~1500+ lines
**Architecture**:

#### Base Theme (Dark Mode Default)
```css
body {
  background: #1a1a1a;
  color: #ffffff;
  font-family: 'Inter', system-ui, sans-serif;
}
```

#### Theme Variations
```css
/* Light Theme */
body.light-theme {
  background: #ffffff;
  color: #333333;
}

/* Glass Theme */
body.glass-theme {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

/* Complete Minimalist */
body.complete-minimalist {
  background: transparent;
  /* Minimal styling overrides */
}

/* Modern Design */
body.modern-design {
  /* Enhanced visual elements */
}
```

#### Component Styling
```css
/* Chat Container */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
  width: 400px;
}

/* Message Styles */
.message {
  margin: 8px 0;
  padding: 12px;
  border-radius: 12px;
}

.message.user {
  background: #007bff;
  color: white;
  align-self: flex-end;
}

.message.assistant {
  background: #f1f3f4;
  color: #333;
  align-self: flex-start;
}
```

#### Responsive Design
```css
@media (max-width: 480px) {
  .chat-container {
    width: 100vw;
    height: 100vh;
  }
}
```

**Styling Features**:
- Multiple theme support
- Responsive design
- Smooth animations
- Accessibility considerations
- Cross-browser compatibility

---

### `options.html`
**Purpose**: Settings and configuration interface

**Key Sections**:
```html
<div class="settings-container">
  <!-- Webhook Management -->
  <section class="webhook-section">
    <h3>Webhook Configuration</h3>
    <!-- Add/edit/delete webhooks -->
  </section>
  
  <!-- Design Settings -->
  <section class="design-section">
    <h3>Design & Appearance</h3>
    <!-- Theme and style selection -->
  </section>
  
  <!-- Typography Settings -->
  <section class="typography-section">
    <h3>Typography</h3>
    <!-- Font and size options -->
  </section>
  
  <!-- Voice Settings -->
  <section class="voice-section">
    <h3>Voice & Language</h3>
    <!-- Language and voice options -->
  </section>
</div>
```

**Form Elements**:
- Webhook URL input and management
- Design style dropdown (Minimalist/Modern)
- Theme selection (Dark/Light/Glass)
- Font family and size controls
- Voice language selection
- Background animation toggle

---

### `options.js`
**Purpose**: Settings page logic and storage management

**Key Functions**:

#### Settings Management
```javascript
function saveSettings() {
  const settings = {
    webhooks: getWebhookData(),
    defaultWebhookName: getSelectedWebhook(),
    designStyle: getDesignStyle(),
    theme: getTheme(),
    textSize: getTextSize(),
    fontFamily: getFontFamily(),
    voiceLanguage: getVoiceLanguage()
  };
  
  chrome.storage.sync.set(settings, function() {
    showSaveConfirmation();
  });
}

function loadSettings() {
  chrome.storage.sync.get([
    'webhooks', 'defaultWebhookName', 'designStyle',
    'theme', 'textSize', 'fontFamily', 'voiceLanguage'
  ], function(result) {
    populateForm(result);
    applyDesignStyle(result.designStyle);
  });
}
```

#### Webhook Management
```javascript
function addWebhook() {
  // Validate webhook URL
  // Add to storage
  // Update UI
}

function deleteWebhook(name) {
  // Remove from storage
  // Update default if needed
  // Refresh UI
}
```

#### Design Style Application
```javascript
function applyDesignStyle(style) {
  document.body.classList.remove('modern-design', 'complete-minimalist');
  
  if (style === 'modern') {
    document.body.classList.add('modern-design');
  } else if (style === 'minimalist') {
    document.body.classList.add('complete-minimalist');
  }
}
```

---

### `options.css`
**Purpose**: Settings page styling

**Features**:
- Clean, organized layout
- Form styling consistency
- Theme-aware design
- Responsive behavior
- Visual feedback for interactions

---

### `background.js`
**Purpose**: Service worker for extension lifecycle management

**Key Functions**:

#### Extension Lifecycle
```javascript
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    setDefaultSettings();
  } else if (details.reason === 'update') {
    handleUpdate(details.previousVersion);
  }
});
```

#### Message Handling
```javascript
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'makeAPIRequest') {
    handleAPIRequest(request.data)
      .then(response => sendResponse({success: true, data: response}))
      .catch(error => sendResponse({success: false, error: error.message}));
    return true; // Async response
  }
});
```

#### Storage Management
```javascript
function setDefaultSettings() {
  const defaults = {
    designStyle: 'minimalist',
    theme: 'dark',
    textSize: 'medium',
    fontFamily: 'inter',
    voiceLanguage: 'en-US',
    animatedBackground: false
  };
  
  chrome.storage.sync.set(defaults);
}
```

---

### `content.js`
**Purpose**: Content script for web page interaction (minimal implementation)

**Current Implementation**:
```javascript
// Minimal content script
// Reserved for future web page integration features
console.log('Agent Chrome Extension content script loaded');

// Future features might include:
// - Page content extraction
// - Form filling assistance
// - Context-aware suggestions
```

---

## 🖼️ Assets Directory

### `images/`
**Contents**:
- `icon16.png` - 16x16 extension icon
- `icon48.png` - 48x48 extension icon  
- `icon128.png` - 128x128 extension icon
- Additional UI icons and graphics

**Usage**:
- Extension toolbar icon
- Settings page icons
- UI element graphics
- Theme-specific assets

---

## 🔮 Future Directory

### `.Agent-UI/`
**Purpose**: React-based UI components for future development

**Planned Structure**:
```
.Agent-UI/
├── src/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── styles/
├── public/
├── package.json
└── webpack.config.js
```

**Integration Plan**:
- Gradual migration from vanilla JS to React
- Component-based architecture
- Enhanced state management
- Better testing capabilities

---

## 📋 File Dependencies

### Dependency Graph
```
manifest.json
├── popup.html
│   ├── popup.css
│   └── popup.js
├── options.html
│   ├── options.css
│   └── options.js
├── background.js
└── content.js
```

### Shared Resources
- **Chrome Storage API**: Used by popup.js, options.js, background.js
- **CSS Variables**: Shared across popup.css and options.css
- **Utility Functions**: Common functions in popup.js and options.js

---

## 🔧 Modification Guidelines

### Adding New Features
1. **UI Changes**: Modify `popup.html` and `popup.css`
2. **Logic Changes**: Update `popup.js`
3. **Settings**: Add to `options.html`, `options.js`, and storage schema
4. **Permissions**: Update `manifest.json` if needed

### Theme Customization
1. **New Theme**: Add CSS class in `popup.css`
2. **Theme Logic**: Update theme switching in `popup.js`
3. **Settings**: Add option in `options.html` and `options.js`

### API Integration
1. **Webhook Setup**: Configure in options page
2. **Request Handling**: Modify API functions in `popup.js`
3. **Error Handling**: Update error display logic
4. **Response Processing**: Enhance message display functions

---

**Next**: Read the [API Documentation](./api.md) for webhook integration details
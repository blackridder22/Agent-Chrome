# Architecture Overview

This document provides a high-level overview of the Agent Chrome Extension architecture, explaining how different components work together.

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Popup     │  │   Options   │  │    Background       │  │
│  │   (UI)      │  │   (Config)  │  │    (Service)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Storage   │  │   Content   │  │    Web APIs         │  │
│  │   (Data)    │  │   (Inject)  │  │    (External)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🧩 Core Components

### 1. Popup Interface (`popup.html`, `popup.js`, `popup.css`)
**Purpose**: Main user interface for chatting with the AI assistant

**Key Features**:
- Chat message display and input
- File attachment handling
- Voice input/output
- Theme switching
- Conversation history access

**Architecture**:
```javascript
// Main components
├── Chat Container
│   ├── Message Display Area
│   ├── Input Area with Attachments
│   └── Control Buttons (Voice, Settings, History)
├── Theme System
│   ├── Dark Mode
│   ├── Light Mode
│   ├── Glass Theme
│   └── Complete Minimalist
└── Storage Interface
    ├── Local Storage (Chat History)
    └── Sync Storage (Settings)
```

### 2. Options Page (`options.html`, `options.js`, `options.css`)
**Purpose**: Configuration interface for extension settings

**Key Features**:
- Webhook management
- Theme and design style selection
- Font and text size customization
- Voice language settings
- Settings persistence

**Data Flow**:
```
User Input → Validation → Chrome Storage → UI Update → Extension Reload
```

### 3. Background Script (`background.js`)
**Purpose**: Service worker that handles extension lifecycle and cross-tab communication

**Responsibilities**:
- Extension installation and updates
- Storage management
- Cross-tab messaging
- Webhook request handling
- File processing

### 4. Content Script (`content.js`)
**Purpose**: Injected script for web page interaction (if needed)

**Current Usage**:
- Minimal implementation
- Reserved for future web page integration features

## 🔄 Data Flow Architecture

### Chat Message Flow
```
User Input → Validation → File Processing → API Request → Response Processing → UI Update → Storage
```

### Settings Flow
```
Options Page → Validation → Chrome Storage → Background Script → Popup Update
```

### File Attachment Flow
```
File Selection → Size Validation → Base64 Encoding → Storage → API Transmission → Cleanup
```

## 🎨 Theme System Architecture

### Theme Hierarchy
```css
body (base styles)
├── .light-theme (light mode overrides)
├── .glass-theme (glass mode overrides)
├── .complete-minimalist (minimalist design)
└── .modern-design (modern design)
```

### CSS Architecture
```
popup.css
├── Base Styles (Dark theme default)
├── Light Theme Overrides
├── Glass Theme Overrides
├── Complete Minimalist Styles
├── Modern Design Styles
├── Component-Specific Styles
└── Responsive Design Rules
```

## 💾 Storage Architecture

### Chrome Storage Types Used

1. **Local Storage** (`chrome.storage.local`)
   - Chat history per session
   - Temporary file data
   - Large data that doesn't need sync

2. **Sync Storage** (`chrome.storage.sync`)
   - User preferences
   - Webhook configurations
   - Theme settings
   - Font and language preferences

3. **Session Storage** (JavaScript `sessionStorage`)
   - Current session data
   - Temporary UI state

### Storage Schema
```javascript
// Sync Storage
{
  webhooks: {
    "webhook-name": "https://api-url.com"
  },
  defaultWebhookName: "webhook-name",
  designStyle: "minimalist" | "modern",
  theme: "dark" | "light" | "glass",
  textSize: "small" | "medium" | "large",
  fontFamily: "system" | "inter" | "roboto" | ...,
  voiceLanguage: "en-US" | "fr-FR" | ...,
  animatedBackground: boolean
}

// Local Storage
{
  "chatHistory_sessionId": [
    {
      type: "user" | "assistant",
      content: "message content",
      timestamp: "ISO date string",
      files?: ["file data"]
    }
  ]
}
```

## 🌐 API Integration Architecture

### Webhook System
```javascript
// Request Format
POST /webhook-endpoint
{
  message: "User's message",
  files: ["base64-encoded-files"],
  history: ["previous-messages"],
  settings: {
    language: "en-US",
    model: "gpt-4"
  }
}

// Response Format
{
  response: "AI assistant response",
  error?: "Error message if any"
}
```

### Error Handling Flow
```
API Request → Network Check → Response Validation → Error Display → Retry Logic
```

## 🔧 Extension Lifecycle

### Installation Flow
```
Extension Install → Background Script Init → Default Settings → Storage Setup → UI Ready
```

### Startup Flow
```
Chrome Start → Extension Load → Settings Load → Theme Apply → UI Initialize
```

### Update Flow
```
Extension Update → Migration Check → Settings Preserve → UI Refresh → User Notification
```

## 🎯 Component Communication

### Message Passing
```javascript
// Popup to Background
chrome.runtime.sendMessage({
  action: "makeAPIRequest",
  data: { message, files, webhook }
});

// Background to Popup
chrome.runtime.sendMessage({
  action: "apiResponse",
  data: { response, error }
});
```

### Event System
```javascript
// Settings Change Event
document.addEventListener('settingsChanged', (event) => {
  applyNewSettings(event.detail);
});

// Theme Change Event
document.addEventListener('themeChanged', (event) => {
  updateTheme(event.detail.theme);
});
```

## 🔒 Security Architecture

### Content Security Policy
```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### Data Protection
- No sensitive data stored in plain text
- Webhook URLs encrypted in storage
- File data automatically cleaned after transmission
- No external script loading

### Permission Model
```json
{
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "https://*/*"
  ]
}
```

## 📱 Responsive Design Architecture

### Breakpoint System
```css
/* Mobile-first approach */
.container { /* Base mobile styles */ }

@media (min-width: 480px) { /* Small tablets */ }
@media (min-width: 768px) { /* Large tablets */ }
@media (min-width: 1024px) { /* Desktop */ }
```

### Adaptive Components
- Flexible grid system
- Scalable typography
- Touch-friendly interface elements
- Dynamic content sizing

## 🚀 Performance Architecture

### Optimization Strategies
1. **Lazy Loading**: Components loaded on demand
2. **Efficient Storage**: Minimal data persistence
3. **Debounced Inputs**: Reduced API calls
4. **CSS Optimization**: Minimal reflows and repaints
5. **Memory Management**: Automatic cleanup of temporary data

### Monitoring Points
- API response times
- Storage usage
- Memory consumption
- UI rendering performance

## 🔮 Extensibility Points

### Adding New Themes
1. Create CSS class in `popup.css`
2. Add theme option in `options.html`
3. Update theme logic in `options.js` and `popup.js`

### Adding New Features
1. Update `manifest.json` permissions if needed
2. Add UI components in `popup.html`
3. Implement logic in `popup.js`
4. Add styling in `popup.css`
5. Update settings in `options.js` if configurable

### Custom Webhook Integration
1. Implement webhook interface
2. Add authentication if needed
3. Handle custom response formats
4. Add error handling for specific endpoints

---

**Next**: Read the [File Structure Guide](./file-structure.md) for detailed file-by-file breakdown
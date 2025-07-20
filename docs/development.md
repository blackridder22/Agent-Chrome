# Development Guide

This guide provides detailed instructions for developers who want to modify, extend, or contribute to the Agent Chrome Extension codebase.

## 🚀 Development Setup

### Prerequisites
- **Chrome Browser**: Version 88 or higher
- **Code Editor**: VS Code, WebStorm, or similar
- **Git**: For version control
- **Node.js**: (Optional) For build tools and testing

### Development Environment Setup

#### 1. Clone and Setup
```bash
git clone https://github.com/your-repo/agent-chrome-extension.git
cd agent-chrome-extension

# Install development dependencies (optional)
npm install
```

#### 2. Enable Developer Mode
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the extension directory

#### 3. Development Workflow
```bash
# Make changes to files
# Reload extension in Chrome
# Test changes
# Commit and push
```

### Hot Reload Setup (Optional)
Create a simple file watcher for development:

```javascript
// dev-server.js
const fs = require('fs');
const path = require('path');

const watchFiles = ['popup.js', 'popup.css', 'options.js', 'background.js'];

watchFiles.forEach(file => {
  fs.watchFile(path.join(__dirname, file), () => {
    console.log(`${file} changed - reload extension`);
    // You can add auto-reload logic here
  });
});

console.log('Development server started. Watching files...');
```

---

## 📁 Code Organization

### File Structure Best Practices

#### Modular JavaScript Architecture
```javascript
// popup.js - Main structure
const ExtensionApp = {
  // Core modules
  ui: UIManager,
  storage: StorageManager,
  api: APIManager,
  theme: ThemeManager,
  
  // Initialization
  init() {
    this.ui.init();
    this.storage.init();
    this.theme.init();
    this.setupEventListeners();
  }
};

// Separate modules
const UIManager = {
  elements: {},
  
  init() {
    this.cacheElements();
    this.setupUI();
  },
  
  cacheElements() {
    this.elements = {
      chatContainer: document.querySelector('.chat-container'),
      messageArea: document.querySelector('.chat-area'),
      inputField: document.querySelector('.chat-input'),
      sendButton: document.querySelector('.send-btn')
    };
  }
};
```

#### CSS Organization
```css
/* popup.css - Organized structure */

/* 1. CSS Reset and Base Styles */
* { box-sizing: border-box; }
body { margin: 0; padding: 0; }

/* 2. CSS Custom Properties */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  /* ... other variables */
}

/* 3. Base Component Styles */
.chat-container { /* base styles */ }
.message { /* base styles */ }
.chat-input { /* base styles */ }

/* 4. Theme Variations */
body.light-theme { /* light theme overrides */ }
body.glass-theme { /* glass theme overrides */ }

/* 5. Design Style Variations */
body.modern-design { /* modern design overrides */ }
body.complete-minimalist { /* minimalist overrides */ }

/* 6. Responsive Design */
@media (max-width: 480px) { /* mobile styles */ }

/* 7. Utility Classes */
.hidden { display: none; }
.loading { opacity: 0.5; }
```

---

## 🔧 Core Systems Development

### Message System Architecture

#### Message Class Structure
```javascript
class Message {
  constructor(content, type, timestamp = new Date()) {
    this.id = this.generateId();
    this.content = content;
    this.type = type; // 'user' | 'assistant' | 'system'
    this.timestamp = timestamp;
    this.files = [];
    this.metadata = {};
  }
  
  generateId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  addFile(file) {
    this.files.push(file);
  }
  
  toJSON() {
    return {
      id: this.id,
      content: this.content,
      type: this.type,
      timestamp: this.timestamp.toISOString(),
      files: this.files,
      metadata: this.metadata
    };
  }
  
  static fromJSON(data) {
    const message = new Message(data.content, data.type, new Date(data.timestamp));
    message.id = data.id;
    message.files = data.files || [];
    message.metadata = data.metadata || {};
    return message;
  }
}
```

#### Chat Session Management
```javascript
class ChatSession {
  constructor(id = null) {
    this.id = id || this.generateSessionId();
    this.messages = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.title = 'New Chat';
  }
  
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  addMessage(message) {
    this.messages.push(message);
    this.updatedAt = new Date();
    this.updateTitle();
  }
  
  updateTitle() {
    if (this.messages.length > 0) {
      const firstMessage = this.messages.find(m => m.type === 'user');
      if (firstMessage) {
        this.title = firstMessage.content.substring(0, 50) + '...';
      }
    }
  }
  
  async save() {
    await StorageManager.saveChatSession(this);
  }
  
  static async load(sessionId) {
    const data = await StorageManager.loadChatSession(sessionId);
    return ChatSession.fromJSON(data);
  }
}
```

### Storage System Development

#### Advanced Storage Manager
```javascript
const StorageManager = {
  // Storage keys
  KEYS: {
    CHAT_SESSIONS: 'chatSessions',
    CURRENT_SESSION: 'currentSession',
    SETTINGS: 'settings',
    WEBHOOKS: 'webhooks'
  },
  
  // Chat session management
  async saveChatSession(session) {
    const sessions = await this.getAllChatSessions();
    sessions[session.id] = session.toJSON();
    
    await chrome.storage.local.set({
      [this.KEYS.CHAT_SESSIONS]: sessions
    });
  },
  
  async loadChatSession(sessionId) {
    const sessions = await this.getAllChatSessions();
    return sessions[sessionId] || null;
  },
  
  async getAllChatSessions() {
    const result = await chrome.storage.local.get(this.KEYS.CHAT_SESSIONS);
    return result[this.KEYS.CHAT_SESSIONS] || {};
  },
  
  async deleteChatSession(sessionId) {
    const sessions = await this.getAllChatSessions();
    delete sessions[sessionId];
    
    await chrome.storage.local.set({
      [this.KEYS.CHAT_SESSIONS]: sessions
    });
  },
  
  // Settings management
  async saveSettings(settings) {
    await chrome.storage.sync.set({
      [this.KEYS.SETTINGS]: settings
    });
  },
  
  async loadSettings() {
    const result = await chrome.storage.sync.get(this.KEYS.SETTINGS);
    return result[this.KEYS.SETTINGS] || this.getDefaultSettings();
  },
  
  getDefaultSettings() {
    return {
      theme: 'dark',
      designStyle: 'minimalist',
      textSize: 'medium',
      fontFamily: 'inter',
      voiceLanguage: 'en-US',
      animatedBackground: false
    };
  },
  
  // Storage cleanup
  async cleanupOldSessions(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days
    const sessions = await this.getAllChatSessions();
    const now = Date.now();
    
    Object.keys(sessions).forEach(sessionId => {
      const session = sessions[sessionId];
      const sessionAge = now - new Date(session.updatedAt).getTime();
      
      if (sessionAge > maxAge) {
        delete sessions[sessionId];
      }
    });
    
    await chrome.storage.local.set({
      [this.KEYS.CHAT_SESSIONS]: sessions
    });
  }
};
```

### API System Development

#### Robust API Manager
```javascript
const APIManager = {
  // Request queue for handling multiple requests
  requestQueue: [],
  isProcessing: false,
  
  async makeRequest(message, files = [], webhook = null) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        message,
        files,
        webhook,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      this.processQueue();
    });
  },
  
  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      
      try {
        const response = await this.executeRequest(request);
        request.resolve(response);
      } catch (error) {
        request.reject(error);
      }
    }
    
    this.isProcessing = false;
  },
  
  async executeRequest({ message, files, webhook }) {
    const settings = await StorageManager.loadSettings();
    const webhookUrl = webhook || await this.getDefaultWebhook();
    
    if (!webhookUrl) {
      throw new Error('No webhook configured');
    }
    
    const requestData = {
      message,
      files: await this.processFiles(files),
      history: await this.getChatHistory(),
      settings,
      metadata: {
        extensionVersion: chrome.runtime.getManifest().version,
        timestamp: new Date().toISOString()
      }
    };
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data;
  },
  
  async processFiles(files) {
    return Promise.all(files.map(async (file) => {
      return {
        name: file.name,
        type: file.type,
        size: file.size,
        data: await this.fileToBase64(file),
        lastModified: file.lastModified
      };
    }));
  },
  
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
  
  async getChatHistory(limit = 10) {
    const currentSession = await StorageManager.loadCurrentSession();
    if (!currentSession) return [];
    
    return currentSession.messages
      .slice(-limit)
      .map(msg => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp
      }));
  },
  
  async getDefaultWebhook() {
    const result = await chrome.storage.sync.get(['webhooks', 'defaultWebhookName']);
    const webhooks = result.webhooks || {};
    const defaultName = result.defaultWebhookName;
    
    return webhooks[defaultName] || null;
  }
};
```

---

## 🎨 Theme System Development

### Advanced Theme Manager
```javascript
const ThemeManager = {
  currentTheme: 'dark',
  currentDesignStyle: 'minimalist',
  
  init() {
    this.loadThemeSettings();
    this.setupThemeListeners();
  },
  
  async loadThemeSettings() {
    const settings = await StorageManager.loadSettings();
    this.applyTheme(settings.theme);
    this.applyDesignStyle(settings.designStyle);
  },
  
  applyTheme(theme) {
    // Remove all theme classes
    document.body.classList.remove('light-theme', 'glass-theme');
    
    // Apply new theme
    if (theme !== 'dark') {
      document.body.classList.add(`${theme}-theme`);
    }
    
    this.currentTheme = theme;
    this.updateMetaThemeColor(theme);
    this.dispatchThemeChange(theme);
  },
  
  applyDesignStyle(style) {
    // Remove all design style classes
    document.body.classList.remove('modern-design', 'complete-minimalist');
    
    // Apply new design style
    if (style === 'modern') {
      document.body.classList.add('modern-design');
    } else {
      document.body.classList.add('complete-minimalist');
    }
    
    this.currentDesignStyle = style;
    this.dispatchDesignStyleChange(style);
  },
  
  updateMetaThemeColor(theme) {
    const themeColors = {
      dark: '#1a1a1a',
      light: '#ffffff',
      glass: 'rgba(255, 255, 255, 0.1)'
    };
    
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.name = 'theme-color';
      document.head.appendChild(metaTheme);
    }
    
    metaTheme.content = themeColors[theme] || themeColors.dark;
  },
  
  setupThemeListeners() {
    // Listen for system theme changes
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addListener(this.handleSystemThemeChange.bind(this));
    }
  },
  
  handleSystemThemeChange(e) {
    const settings = await StorageManager.loadSettings();
    if (settings.theme === 'auto') {
      this.applyTheme(e.matches ? 'dark' : 'light');
    }
  },
  
  dispatchThemeChange(theme) {
    const event = new CustomEvent('themeChanged', {
      detail: { theme, designStyle: this.currentDesignStyle }
    });
    document.dispatchEvent(event);
  },
  
  dispatchDesignStyleChange(style) {
    const event = new CustomEvent('designStyleChanged', {
      detail: { designStyle: style, theme: this.currentTheme }
    });
    document.dispatchEvent(event);
  }
};
```

### Dynamic CSS Generation
```javascript
const CSSGenerator = {
  generateThemeCSS(themeConfig) {
    const {
      primaryColor,
      secondaryColor,
      backgroundColor,
      textColor,
      borderRadius,
      shadows
    } = themeConfig;
    
    return `
      :root {
        --primary-color: ${primaryColor};
        --secondary-color: ${secondaryColor};
        --background-color: ${backgroundColor};
        --text-color: ${textColor};
        --border-radius: ${borderRadius}px;
        --shadow-light: ${shadows.light};
        --shadow-medium: ${shadows.medium};
        --shadow-heavy: ${shadows.heavy};
      }
      
      .message.user {
        background: var(--primary-color);
        color: white;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-medium);
      }
      
      .message.assistant {
        background: var(--secondary-color);
        color: var(--text-color);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-light);
      }
    `;
  },
  
  injectCSS(css, id = 'dynamic-styles') {
    // Remove existing dynamic styles
    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
    }
    
    // Inject new styles
    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  }
};
```

---

## 🧪 Testing and Quality Assurance

### Unit Testing Setup

#### Test Framework Setup
```javascript
// test-framework.js - Simple testing framework
class TestFramework {
  constructor() {
    this.tests = [];
    this.results = [];
  }
  
  test(name, testFunction) {
    this.tests.push({ name, testFunction });
  }
  
  async runTests() {
    console.log('Running tests...');
    
    for (const test of this.tests) {
      try {
        await test.testFunction();
        this.results.push({ name: test.name, status: 'PASS' });
        console.log(`✅ ${test.name}`);
      } catch (error) {
        this.results.push({ 
          name: test.name, 
          status: 'FAIL', 
          error: error.message 
        });
        console.log(`❌ ${test.name}: ${error.message}`);
      }
    }
    
    this.printSummary();
  }
  
  printSummary() {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    
    console.log(`\nTest Summary: ${passed} passed, ${failed} failed`);
  }
}

// Usage
const test = new TestFramework();

test.test('Message creation', () => {
  const message = new Message('Hello', 'user');
  if (!message.id) throw new Error('Message should have an ID');
  if (message.content !== 'Hello') throw new Error('Content mismatch');
});

test.test('Storage operations', async () => {
  const testData = { test: 'value' };
  await StorageManager.saveSettings(testData);
  const loaded = await StorageManager.loadSettings();
  if (loaded.test !== 'value') throw new Error('Storage test failed');
});

// Run tests
test.runTests();
```

#### Component Testing
```javascript
// Component test utilities
const ComponentTester = {
  async testMessageRendering() {
    const message = new Message('Test message', 'user');
    const element = UIManager.renderMessage(message);
    
    // Test element creation
    if (!element) throw new Error('Message element not created');
    
    // Test content
    const content = element.querySelector('.message-content');
    if (content.textContent !== 'Test message') {
      throw new Error('Message content incorrect');
    }
    
    // Test classes
    if (!element.classList.contains('message')) {
      throw new Error('Message class missing');
    }
    
    if (!element.classList.contains('user')) {
      throw new Error('User class missing');
    }
  },
  
  async testThemeApplication() {
    ThemeManager.applyTheme('light');
    
    if (!document.body.classList.contains('light-theme')) {
      throw new Error('Light theme not applied');
    }
    
    ThemeManager.applyTheme('dark');
    
    if (document.body.classList.contains('light-theme')) {
      throw new Error('Light theme not removed');
    }
  }
};
```

### Performance Testing

#### Performance Monitoring
```javascript
const PerformanceMonitor = {
  metrics: {},
  
  startTimer(name) {
    this.metrics[name] = { start: performance.now() };
  },
  
  endTimer(name) {
    if (this.metrics[name]) {
      this.metrics[name].end = performance.now();
      this.metrics[name].duration = this.metrics[name].end - this.metrics[name].start;
    }
  },
  
  getMetric(name) {
    return this.metrics[name];
  },
  
  getAllMetrics() {
    return this.metrics;
  },
  
  logMetrics() {
    console.table(
      Object.entries(this.metrics).map(([name, data]) => ({
        Operation: name,
        Duration: `${data.duration?.toFixed(2)}ms`
      }))
    );
  }
};

// Usage
PerformanceMonitor.startTimer('messageRender');
UIManager.renderMessage(message);
PerformanceMonitor.endTimer('messageRender');

PerformanceMonitor.startTimer('apiRequest');
await APIManager.makeRequest('Hello');
PerformanceMonitor.endTimer('apiRequest');

PerformanceMonitor.logMetrics();
```

#### Memory Usage Monitoring
```javascript
const MemoryMonitor = {
  checkMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1048576),
        total: Math.round(performance.memory.totalJSHeapSize / 1048576),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
      };
    }
    return null;
  },
  
  logMemoryUsage() {
    const memory = this.checkMemoryUsage();
    if (memory) {
      console.log(`Memory Usage: ${memory.used}MB / ${memory.total}MB (Limit: ${memory.limit}MB)`);
    }
  },
  
  startMemoryMonitoring(interval = 5000) {
    setInterval(() => {
      this.logMemoryUsage();
    }, interval);
  }
};
```

---

## 🔧 Build and Deployment

### Build System Setup

#### Webpack Configuration (Optional)
```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  entry: {
    popup: './src/popup.js',
    options: './src/options.js',
    background: './src/background.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  optimization: {
    minimize: false // Keep readable for Chrome store review
  }
};
```

#### Build Scripts
```json
{
  "scripts": {
    "build": "webpack --mode production",
    "dev": "webpack --mode development --watch",
    "test": "node test-runner.js",
    "lint": "eslint src/**/*.js",
    "package": "npm run build && npm run package-extension"
  }
}
```

### Deployment Checklist

#### Pre-deployment Validation
```javascript
// validation-script.js
const fs = require('fs');
const path = require('path');

class DeploymentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }
  
  validateManifest() {
    const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
    
    // Check required fields
    const required = ['name', 'version', 'manifest_version', 'description'];
    required.forEach(field => {
      if (!manifest[field]) {
        this.errors.push(`Missing required field: ${field}`);
      }
    });
    
    // Check version format
    if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
      this.errors.push('Invalid version format');
    }
    
    // Check permissions
    if (!manifest.permissions || manifest.permissions.length === 0) {
      this.warnings.push('No permissions specified');
    }
  }
  
  validateFiles() {
    const requiredFiles = [
      'manifest.json',
      'popup.html',
      'popup.js',
      'popup.css',
      'background.js'
    ];
    
    requiredFiles.forEach(file => {
      if (!fs.existsSync(file)) {
        this.errors.push(`Missing required file: ${file}`);
      }
    });
  }
  
  validateCSS() {
    const cssContent = fs.readFileSync('popup.css', 'utf8');
    
    // Check for common issues
    if (cssContent.includes('!important')) {
      this.warnings.push('CSS contains !important declarations');
    }
    
    if (cssContent.includes('position: fixed')) {
      this.warnings.push('CSS contains fixed positioning');
    }
  }
  
  run() {
    this.validateManifest();
    this.validateFiles();
    this.validateCSS();
    
    console.log('Deployment Validation Results:');
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ All validations passed!');
    }
    
    return this.errors.length === 0;
  }
}

const validator = new DeploymentValidator();
const isValid = validator.run();

process.exit(isValid ? 0 : 1);
```

---

## 📚 Documentation Standards

### Code Documentation

#### JSDoc Standards
```javascript
/**
 * Represents a chat message in the extension
 * @class Message
 */
class Message {
  /**
   * Create a new message
   * @param {string} content - The message content
   * @param {('user'|'assistant'|'system')} type - The message type
   * @param {Date} [timestamp=new Date()] - The message timestamp
   */
  constructor(content, type, timestamp = new Date()) {
    this.id = this.generateId();
    this.content = content;
    this.type = type;
    this.timestamp = timestamp;
  }
  
  /**
   * Generate a unique ID for the message
   * @returns {string} Unique message ID
   * @private
   */
  generateId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Convert message to JSON format
   * @returns {Object} JSON representation of the message
   */
  toJSON() {
    return {
      id: this.id,
      content: this.content,
      type: this.type,
      timestamp: this.timestamp.toISOString()
    };
  }
}
```

#### CSS Documentation
```css
/**
 * Chat Container
 * Main container for the chat interface
 * 
 * @component ChatContainer
 * @responsive Mobile-first design
 * @themes Supports all theme variations
 */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
  width: 400px;
  background: var(--background-color);
  border-radius: var(--border-radius);
}

/**
 * Message Bubble
 * Individual message display component
 * 
 * @component Message
 * @variants .user, .assistant, .system
 * @states .loading, .error, .selected
 */
.message {
  padding: 12px 16px;
  margin: 8px 0;
  border-radius: 12px;
  max-width: 80%;
  word-wrap: break-word;
}
```

### API Documentation

#### Webhook Documentation Template
```markdown
## Webhook API

### Endpoint
`POST /your-webhook-endpoint`

### Request Format
```json
{
  "message": "string",
  "files": [
    {
      "name": "string",
      "type": "string", 
      "data": "base64-string"
    }
  ],
  "history": [
    {
      "type": "user|assistant",
      "content": "string",
      "timestamp": "ISO-8601-string"
    }
  ]
}
```

### Response Format
```json
{
  "response": "string",
  "status": "success|error",
  "metadata": {
    "processingTime": "number"
  }
}
```

### Error Handling
- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: Invalid API key
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
```

---

## 🚀 Advanced Development Patterns

### Event-Driven Architecture
```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
  
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

// Usage
const extensionEvents = new EventEmitter();

extensionEvents.on('messageReceived', (message) => {
  UIManager.displayMessage(message);
  StorageManager.saveMessage(message);
});

extensionEvents.on('themeChanged', (theme) => {
  ThemeManager.applyTheme(theme);
  UIManager.updateThemeElements(theme);
});
```

### Plugin Architecture
```javascript
class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.hooks = new Map();
  }
  
  registerPlugin(plugin) {
    this.plugins.set(plugin.name, plugin);
    plugin.onRegister(this);
  }
  
  addHook(name, callback) {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, []);
    }
    this.hooks.get(name).push(callback);
  }
  
  async executeHook(name, data) {
    const hooks = this.hooks.get(name) || [];
    let result = data;
    
    for (const hook of hooks) {
      result = await hook(result);
    }
    
    return result;
  }
}

// Example plugin
class CustomThemePlugin {
  constructor() {
    this.name = 'CustomTheme';
  }
  
  onRegister(pluginManager) {
    pluginManager.addHook('beforeThemeApply', this.modifyTheme.bind(this));
  }
  
  modifyTheme(themeData) {
    // Modify theme data before application
    return {
      ...themeData,
      customProperty: 'customValue'
    };
  }
}
```

---

**Next**: Read the [Troubleshooting Guide](./troubleshooting.md) for common issues and solutions
# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Agent Chrome Extension.

## 🚨 Common Issues and Solutions

### Extension Loading Issues

#### Issue: Extension won't load in Chrome
**Symptoms:**
- Extension doesn't appear in Chrome extensions page
- "Load unpacked" fails with error
- Extension icon doesn't show in toolbar

**Solutions:**

1. **Check Manifest Syntax**
   ```bash
   # Validate JSON syntax
   cat manifest.json | python -m json.tool
   ```
   
   Common manifest issues:
   ```json
   {
     "manifest_version": 3,  // Must be 3 for modern Chrome
     "name": "Agent Extension",
     "version": "1.0.0",     // Must follow semantic versioning
     "permissions": [        // Check permission names
       "storage",
       "activeTab"
     ]
   }
   ```

2. **Verify File Paths**
   - Ensure all referenced files exist
   - Check file paths in manifest.json
   - Verify case sensitivity (important on Linux/Mac)

3. **Check Console Errors**
   - Open Chrome DevTools (F12)
   - Look for JavaScript errors in Console tab
   - Check Network tab for failed resource loads

#### Issue: Extension loads but popup doesn't open
**Symptoms:**
- Extension icon appears but clicking does nothing
- Popup briefly flashes then disappears

**Solutions:**

1. **Check Popup HTML**
   ```html
   <!-- Ensure proper DOCTYPE and structure -->
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="utf-8">
     <link rel="stylesheet" href="popup.css">
   </head>
   <body>
     <!-- Content here -->
     <script src="popup.js"></script>
   </body>
   </html>
   ```

2. **Debug Popup JavaScript**
   - Right-click extension icon → "Inspect popup"
   - Check for JavaScript errors
   - Verify DOM elements exist before accessing them

3. **Check CSP (Content Security Policy)**
   ```json
   {
     "content_security_policy": {
       "extension_pages": "script-src 'self'; object-src 'self'"
     }
   }
   ```

---

### API and Webhook Issues

#### Issue: Webhook requests failing
**Symptoms:**
- "Network error" messages
- Requests timeout
- No response from AI

**Diagnostic Steps:**

1. **Test Webhook Manually**
   ```bash
   curl -X POST https://your-webhook-url.com/endpoint \
     -H "Content-Type: application/json" \
     -d '{"message": "test", "files": [], "history": []}'
   ```

2. **Check Network Tab**
   - Open DevTools → Network tab
   - Look for failed requests (red entries)
   - Check request/response details

3. **Verify CORS Settings**
   ```javascript
   // Server-side CORS configuration
   app.use((req, res, next) => {
     res.header('Access-Control-Allow-Origin', '*');
     res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
     res.header('Access-Control-Allow-Headers', 'Content-Type');
     next();
   });
   ```

**Common Solutions:**

1. **HTTPS Requirement**
   - Chrome extensions require HTTPS for external requests
   - Use ngrok for local development:
   ```bash
   ngrok http 3000
   # Use the HTTPS URL provided
   ```

2. **Request Format Issues**
   ```javascript
   // Ensure proper request structure
   const requestData = {
     message: "user input",           // Required
     files: [],                      // Array of file objects
     history: [],                    // Array of previous messages
     settings: {},                   // User preferences
     metadata: {                     // Extension info
       extensionVersion: "1.0.0",
       timestamp: new Date().toISOString()
     }
   };
   ```

3. **Response Format Issues**
   ```javascript
   // Server must return proper JSON
   res.json({
     response: "AI response text",   // Required
     status: "success",              // Optional
     metadata: {}                    // Optional
   });
   ```

#### Issue: File attachments not working
**Symptoms:**
- Files don't upload
- "File too large" errors
- Corrupted file data

**Solutions:**

1. **Check File Size Limits**
   ```javascript
   const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
   
   function validateFile(file) {
     if (file.size > MAX_FILE_SIZE) {
       throw new Error(`File too large: ${file.size} bytes`);
     }
   }
   ```

2. **Verify Base64 Encoding**
   ```javascript
   function fileToBase64(file) {
     return new Promise((resolve, reject) => {
       const reader = new FileReader();
       reader.onload = () => {
         // Remove data URL prefix
         const base64 = reader.result.split(',')[1];
         resolve(base64);
       };
       reader.onerror = reject;
       reader.readAsDataURL(file);
     });
   }
   ```

3. **Handle File Types**
   ```javascript
   const SUPPORTED_TYPES = [
     'image/jpeg', 'image/png', 'image/gif',
     'application/pdf', 'text/plain',
     'application/json'
   ];
   
   function validateFileType(file) {
     if (!SUPPORTED_TYPES.includes(file.type)) {
       throw new Error(`Unsupported file type: ${file.type}`);
     }
   }
   ```

---

### Storage and Settings Issues

#### Issue: Settings not saving
**Symptoms:**
- Changes revert after restart
- Settings page shows default values
- Error messages when saving

**Diagnostic Steps:**

1. **Check Storage Permissions**
   ```json
   {
     "permissions": ["storage"]  // Required for chrome.storage API
   }
   ```

2. **Test Storage Operations**
   ```javascript
   // Test in DevTools console
   chrome.storage.sync.set({test: 'value'}, () => {
     console.log('Save result:', chrome.runtime.lastError);
   });
   
   chrome.storage.sync.get('test', (result) => {
     console.log('Load result:', result);
   });
   ```

**Solutions:**

1. **Handle Storage Errors**
   ```javascript
   function saveSettings(settings) {
     return new Promise((resolve, reject) => {
       chrome.storage.sync.set(settings, () => {
         if (chrome.runtime.lastError) {
           reject(new Error(chrome.runtime.lastError.message));
         } else {
           resolve();
         }
       });
     });
   }
   ```

2. **Check Storage Quotas**
   ```javascript
   // Chrome storage limits
   const SYNC_QUOTA_BYTES = 102400;        // 100KB
   const LOCAL_QUOTA_BYTES = 5242880;      // 5MB
   
   function checkStorageUsage() {
     chrome.storage.sync.getBytesInUse(null, (bytes) => {
       console.log(`Sync storage used: ${bytes}/${SYNC_QUOTA_BYTES} bytes`);
     });
   }
   ```

3. **Implement Storage Cleanup**
   ```javascript
   async function cleanupOldData() {
     const result = await chrome.storage.local.get(null);
     const now = Date.now();
     const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
     
     Object.keys(result).forEach(key => {
       if (key.startsWith('chatHistory_')) {
         const data = result[key];
         if (now - new Date(data.timestamp).getTime() > maxAge) {
           chrome.storage.local.remove(key);
         }
       }
     });
   }
   ```

#### Issue: Chat history not loading
**Symptoms:**
- Previous conversations don't appear
- History modal is empty
- Error loading chat sessions

**Solutions:**

1. **Check Data Structure**
   ```javascript
   // Verify chat history format
   const expectedFormat = {
     sessionId: {
       id: "session_123",
       title: "Chat Title",
       messages: [
         {
           id: "msg_123",
           type: "user",
           content: "Hello",
           timestamp: "2024-01-15T10:30:00Z"
         }
       ],
       createdAt: "2024-01-15T10:30:00Z",
       updatedAt: "2024-01-15T10:35:00Z"
     }
   };
   ```

2. **Implement Data Migration**
   ```javascript
   async function migrateOldChatData() {
     const oldData = await chrome.storage.local.get('chatHistory');
     if (oldData.chatHistory && Array.isArray(oldData.chatHistory)) {
       // Convert old array format to new session format
       const newSession = {
         id: `migrated_${Date.now()}`,
         title: 'Migrated Chat',
         messages: oldData.chatHistory,
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString()
       };
       
       await chrome.storage.local.set({
         [`chatSession_${newSession.id}`]: newSession
       });
       
       // Remove old data
       await chrome.storage.local.remove('chatHistory');
     }
   }
   ```

---

### Theme and UI Issues

#### Issue: Themes not applying correctly
**Symptoms:**
- Theme changes don't take effect
- Mixed theme elements
- CSS not loading

**Solutions:**

1. **Check CSS Loading**
   ```html
   <!-- Ensure CSS is properly linked -->
   <link rel="stylesheet" href="popup.css">
   ```

2. **Verify Theme Classes**
   ```javascript
   function debugThemeApplication(theme) {
     console.log('Current body classes:', document.body.className);
     console.log('Applying theme:', theme);
     
     // Remove all theme classes
     document.body.classList.remove('light-theme', 'glass-theme');
     
     // Apply new theme
     if (theme !== 'dark') {
       document.body.classList.add(`${theme}-theme`);
     }
     
     console.log('New body classes:', document.body.className);
   }
   ```

3. **Check CSS Specificity**
   ```css
   /* Ensure theme styles have proper specificity */
   body.light-theme .message.user {
     background: #007bff;
     color: white;
   }
   
   /* Avoid overly specific selectors that can't be overridden */
   .chat-container .message-area .message.user.specific {
     /* This might be too specific */
   }
   ```

#### Issue: Responsive design not working
**Symptoms:**
- Layout breaks on different screen sizes
- Elements overlap or disappear
- Scrolling issues

**Solutions:**

1. **Check Viewport Meta Tag**
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

2. **Debug Media Queries**
   ```css
   /* Add debug styles to test breakpoints */
   @media (max-width: 480px) {
     body::before {
       content: "Mobile";
       position: fixed;
       top: 0;
       left: 0;
       background: red;
       color: white;
       padding: 4px;
       z-index: 9999;
     }
   }
   ```

3. **Test Container Sizing**
   ```javascript
   function debugContainerSizes() {
     const container = document.querySelector('.chat-container');
     console.log('Container dimensions:', {
       width: container.offsetWidth,
       height: container.offsetHeight,
       scrollWidth: container.scrollWidth,
       scrollHeight: container.scrollHeight
     });
   }
   ```

---

### Performance Issues

#### Issue: Extension running slowly
**Symptoms:**
- Delayed responses to user input
- UI freezing or stuttering
- High memory usage

**Diagnostic Tools:**

1. **Performance Monitoring**
   ```javascript
   function measurePerformance(operation, callback) {
     const start = performance.now();
     const result = callback();
     const end = performance.now();
     console.log(`${operation} took ${end - start}ms`);
     return result;
   }
   
   // Usage
   measurePerformance('Message Render', () => {
     renderMessage(message);
   });
   ```

2. **Memory Usage Tracking**
   ```javascript
   function logMemoryUsage() {
     if (performance.memory) {
       console.log('Memory usage:', {
         used: Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB',
         total: Math.round(performance.memory.totalJSHeapSize / 1048576) + 'MB'
       });
     }
   }
   
   setInterval(logMemoryUsage, 5000);
   ```

**Optimization Solutions:**

1. **Debounce User Input**
   ```javascript
   function debounce(func, wait) {
     let timeout;
     return function executedFunction(...args) {
       const later = () => {
         clearTimeout(timeout);
         func(...args);
       };
       clearTimeout(timeout);
       timeout = setTimeout(later, wait);
     };
   }
   
   const debouncedSearch = debounce(performSearch, 300);
   ```

2. **Implement Virtual Scrolling**
   ```javascript
   class VirtualScrollManager {
     constructor(container, itemHeight, renderItem) {
       this.container = container;
       this.itemHeight = itemHeight;
       this.renderItem = renderItem;
       this.visibleItems = [];
     }
     
     update(items) {
       const containerHeight = this.container.offsetHeight;
       const visibleCount = Math.ceil(containerHeight / this.itemHeight) + 2;
       const scrollTop = this.container.scrollTop;
       const startIndex = Math.floor(scrollTop / this.itemHeight);
       
       this.visibleItems = items.slice(startIndex, startIndex + visibleCount);
       this.render();
     }
   }
   ```

3. **Optimize DOM Operations**
   ```javascript
   // Batch DOM updates
   function batchDOMUpdates(updates) {
     const fragment = document.createDocumentFragment();
     
     updates.forEach(update => {
       const element = update.createElement();
       fragment.appendChild(element);
     });
     
     document.querySelector('.container').appendChild(fragment);
   }
   ```

---

### Browser Compatibility Issues

#### Issue: Extension doesn't work in older Chrome versions
**Symptoms:**
- Features not working in Chrome < 88
- API errors in console
- Manifest V3 compatibility issues

**Solutions:**

1. **Check Chrome Version Requirements**
   ```json
   {
     "minimum_chrome_version": "88"
   }
   ```

2. **Feature Detection**
   ```javascript
   function checkBrowserSupport() {
     const features = {
       serviceWorker: 'serviceWorker' in navigator,
       storage: typeof chrome !== 'undefined' && chrome.storage,
       manifestV3: chrome.runtime.getManifest().manifest_version === 3
     };
     
     console.log('Browser support:', features);
     return features;
   }
   ```

3. **Polyfills for Missing Features**
   ```javascript
   // Polyfill for older Chrome versions
   if (!chrome.action) {
     chrome.action = chrome.browserAction;
   }
   
   if (!chrome.scripting) {
     chrome.scripting = {
       executeScript: chrome.tabs.executeScript
     };
   }
   ```

---

## 🔧 Debug Tools and Utilities

### Extension Debug Console

```javascript
// Debug utility for extension development
const ExtensionDebugger = {
  enabled: false,
  
  enable() {
    this.enabled = true;
    console.log('🔧 Extension debugger enabled');
  },
  
  log(category, message, data = null) {
    if (!this.enabled) return;
    
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${category}]`;
    
    if (data) {
      console.group(prefix, message);
      console.log(data);
      console.groupEnd();
    } else {
      console.log(prefix, message);
    }
  },
  
  logAPI(method, url, data, response) {
    this.log('API', `${method} ${url}`, {
      request: data,
      response: response
    });
  },
  
  logStorage(operation, key, data) {
    this.log('STORAGE', `${operation} ${key}`, data);
  },
  
  logTheme(theme, designStyle) {
    this.log('THEME', `Applied ${theme} theme with ${designStyle} design`);
  },
  
  logError(error, context) {
    console.error(`🚨 Extension Error [${context}]:`, error);
  }
};

// Enable in development
if (chrome.runtime.getManifest().version.includes('dev')) {
  ExtensionDebugger.enable();
}
```

### Storage Inspector

```javascript
// Utility to inspect and manage extension storage
const StorageInspector = {
  async dumpAll() {
    const sync = await chrome.storage.sync.get(null);
    const local = await chrome.storage.local.get(null);
    
    console.group('📦 Storage Dump');
    console.log('Sync Storage:', sync);
    console.log('Local Storage:', local);
    console.groupEnd();
    
    return { sync, local };
  },
  
  async clearAll() {
    await chrome.storage.sync.clear();
    await chrome.storage.local.clear();
    console.log('🗑️ All storage cleared');
  },
  
  async exportData() {
    const data = await this.dumpAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extension-data-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  },
  
  async importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.sync) {
        await chrome.storage.sync.set(data.sync);
      }
      
      if (data.local) {
        await chrome.storage.local.set(data.local);
      }
      
      console.log('📥 Data imported successfully');
    } catch (error) {
      console.error('❌ Import failed:', error);
    }
  }
};
```

### Performance Profiler

```javascript
// Performance monitoring utility
const PerformanceProfiler = {
  timers: new Map(),
  metrics: [],
  
  start(label) {
    this.timers.set(label, performance.now());
  },
  
  end(label) {
    const startTime = this.timers.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics.push({
        label,
        duration,
        timestamp: Date.now()
      });
      
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      this.timers.delete(label);
      return duration;
    }
  },
  
  getReport() {
    const report = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.label]) {
        acc[metric.label] = {
          count: 0,
          total: 0,
          avg: 0,
          min: Infinity,
          max: 0
        };
      }
      
      const stats = acc[metric.label];
      stats.count++;
      stats.total += metric.duration;
      stats.avg = stats.total / stats.count;
      stats.min = Math.min(stats.min, metric.duration);
      stats.max = Math.max(stats.max, metric.duration);
      
      return acc;
    }, {});
    
    console.table(report);
    return report;
  },
  
  clear() {
    this.metrics = [];
    this.timers.clear();
  }
};
```

---

## 📞 Getting Help

### Community Resources

1. **Chrome Extension Documentation**
   - [Official Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
   - [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)

2. **Stack Overflow**
   - Tag: `google-chrome-extension`
   - Search for specific error messages

3. **GitHub Issues**
   - Check existing issues in the repository
   - Create new issues with detailed reproduction steps

### Reporting Bugs

When reporting bugs, include:

1. **Environment Information**
   ```
   - Chrome Version: 120.0.6099.109
   - Extension Version: 2.0.0
   - Operating System: macOS 14.1
   - Error Console Output: [paste here]
   ```

2. **Reproduction Steps**
   ```
   1. Open extension popup
   2. Click on settings
   3. Change theme to "Glass"
   4. Error occurs: [describe what happens]
   ```

3. **Expected vs Actual Behavior**
   ```
   Expected: Theme should change to glass effect
   Actual: Extension crashes with console error
   ```

### Debug Information Collection

```javascript
// Utility to collect debug information
function collectDebugInfo() {
  const info = {
    extension: {
      version: chrome.runtime.getManifest().version,
      id: chrome.runtime.id
    },
    browser: {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform
    },
    storage: {},
    errors: []
  };
  
  // Collect storage data
  chrome.storage.sync.get(null, (sync) => {
    chrome.storage.local.get(null, (local) => {
      info.storage = { sync, local };
      
      // Copy to clipboard
      navigator.clipboard.writeText(JSON.stringify(info, null, 2));
      console.log('Debug info copied to clipboard');
    });
  });
  
  return info;
}
```

---

**Next**: Read the [FAQ](./faq.md) for frequently asked questions and quick answers
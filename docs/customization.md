# Customization Guide

This comprehensive guide explains how to customize the Agent Chrome Extension's appearance, behavior, and functionality to match your specific needs.

## 🎨 Theme Customization

### Understanding the Theme System

The extension supports multiple theme layers:
1. **Base Theme**: Dark mode (default)
2. **Light Theme**: Light color scheme
3. **Glass Theme**: Translucent effects
4. **Design Styles**: Minimalist vs Modern
5. **Custom Themes**: Your own implementations

### Creating a Custom Theme

#### Step 1: Define Your Theme Class
Add a new theme class in <mcfile name="popup.css" path="/Users/werleydessources/Agent Chrome - beta v2/popup.css"></mcfile>:

```css
/* Custom Neon Theme */
body.neon-theme {
  background: #0a0a0a;
  color: #00ff88;
  font-family: 'Courier New', monospace;
}

body.neon-theme .chat-container {
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid #00ff88;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}

body.neon-theme .message.user {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  color: #000;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

body.neon-theme .message.assistant {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.3);
  color: #00ff88;
}

body.neon-theme .chat-input {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid #00ff88;
  color: #00ff88;
}

body.neon-theme .chat-input::placeholder {
  color: rgba(0, 255, 136, 0.6);
}

body.neon-theme .btn {
  background: transparent;
  border: 1px solid #00ff88;
  color: #00ff88;
  transition: all 0.3s ease;
}

body.neon-theme .btn:hover {
  background: #00ff88;
  color: #000;
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.7);
}
```

#### Step 2: Add Theme Option to Settings
Update <mcfile name="options.html" path="/Users/werleydessources/Agent Chrome - beta v2/options.html"></mcfile>:

```html
<select id="theme-select">
  <option value="dark">Dark</option>
  <option value="light">Light</option>
  <option value="glass">Glass</option>
  <option value="neon">Neon</option> <!-- Add your theme -->
</select>
```

#### Step 3: Update Theme Logic
Modify the theme switching logic in <mcfile name="popup.js" path="/Users/werleydessources/Agent Chrome - beta v2/popup.js"></mcfile>:

```javascript
function applyTheme(theme) {
  // Remove all theme classes
  document.body.classList.remove('light-theme', 'glass-theme', 'neon-theme');
  
  // Apply selected theme
  switch(theme) {
    case 'light':
      document.body.classList.add('light-theme');
      break;
    case 'glass':
      document.body.classList.add('glass-theme');
      break;
    case 'neon':
      document.body.classList.add('neon-theme');
      break;
    default:
      // Dark theme (no additional class needed)
      break;
  }
}
```

### Advanced Theme Features

#### CSS Custom Properties
Use CSS variables for easier theme management:

```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --background-color: #1a1a1a;
  --text-color: #ffffff;
  --border-radius: 12px;
  --shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

body.neon-theme {
  --primary-color: #00ff88;
  --secondary-color: #00cc6a;
  --background-color: #0a0a0a;
  --text-color: #00ff88;
  --border-radius: 0;
  --shadow: 0 0 20px rgba(0, 255, 136, 0.3);
}

.message.user {
  background: var(--primary-color);
  color: var(--text-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}
```

#### Dynamic Theme Switching
Implement smooth theme transitions:

```css
* {
  transition: background-color 0.3s ease, 
              color 0.3s ease, 
              border-color 0.3s ease,
              box-shadow 0.3s ease;
}
```

---

## 🎯 Design Style Customization

### Creating a New Design Style

#### Step 1: Define Design Philosophy
Choose your design approach:
- **Ultra Minimalist**: Absolute bare minimum
- **Retro**: Vintage computing aesthetic
- **Futuristic**: Sci-fi inspired design
- **Corporate**: Professional business look

#### Step 2: Implement Design Class
Add to <mcfile name="popup.css" path="/Users/werleydessources/Agent Chrome - beta v2/popup.css"></mcfile>:

```css
/* Retro Design Style */
body.retro-design {
  font-family: 'Courier New', monospace;
  background: #2d2d2d;
  color: #00ff00;
}

body.retro-design .chat-container {
  border: 2px solid #00ff00;
  background: #000000;
  border-radius: 0;
}

body.retro-design .message {
  border: 1px solid #00ff00;
  border-radius: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.4;
}

body.retro-design .message.user {
  background: #003300;
  color: #00ff00;
}

body.retro-design .message.assistant {
  background: #001100;
  color: #00cc00;
}

body.retro-design .chat-input {
  border: 1px solid #00ff00;
  border-radius: 0;
  background: #000000;
  color: #00ff00;
  font-family: 'Courier New', monospace;
}

body.retro-design .btn {
  border: 1px solid #00ff00;
  border-radius: 0;
  background: #000000;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}
```

#### Step 3: Update Options Interface
Add to <mcfile name="options.html" path="/Users/werleydessources/Agent Chrome - beta v2/options.html"></mcfile>:

```html
<select id="design-style-select">
  <option value="minimalist">Complete Minimalist</option>
  <option value="modern">Modern Well-Designed</option>
  <option value="retro">Retro Computing</option>
</select>
```

#### Step 4: Update JavaScript Logic
Modify <mcfile name="options.js" path="/Users/werleydessources/Agent Chrome - beta v2/options.js"></mcfile>:

```javascript
function applyDesignStyle(style) {
  // Remove all design style classes
  document.body.classList.remove(
    'modern-design', 
    'complete-minimalist', 
    'retro-design'
  );
  
  // Apply selected design style
  switch(style) {
    case 'modern':
      document.body.classList.add('modern-design');
      break;
    case 'retro':
      document.body.classList.add('retro-design');
      break;
    case 'minimalist':
    default:
      document.body.classList.add('complete-minimalist');
      break;
  }
}
```

---

## 🔤 Typography Customization

### Adding Custom Fonts

#### Step 1: Include Font Files
Add font files to your extension or use web fonts:

```css
/* Using Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap');

/* Or include local font files */
@font-face {
  font-family: 'CustomFont';
  src: url('fonts/CustomFont.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
}
```

#### Step 2: Update Font Options
Modify <mcfile name="options.html" path="/Users/werleydessources/Agent Chrome - beta v2/options.html"></mcfile>:

```html
<select id="font-family-select">
  <option value="system">System Default</option>
  <option value="inter">Inter</option>
  <option value="roboto">Roboto</option>
  <option value="jetbrains">JetBrains Mono</option>
  <option value="custom">Custom Font</option>
</select>
```

#### Step 3: Implement Font Logic
Update <mcfile name="popup.js" path="/Users/werleydessources/Agent Chrome - beta v2/popup.js"></mcfile>:

```javascript
function applyFontFamily(fontFamily) {
  const fontMap = {
    'system': 'system-ui, -apple-system, sans-serif',
    'inter': '"Inter", sans-serif',
    'roboto': '"Roboto", sans-serif',
    'jetbrains': '"JetBrains Mono", monospace',
    'custom': '"CustomFont", sans-serif'
  };
  
  document.body.style.fontFamily = fontMap[fontFamily] || fontMap['system'];
}
```

### Text Size Customization

#### Dynamic Text Scaling
```css
/* Base sizes */
:root {
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
}

/* Size variations */
body.text-small {
  --text-base: 0.875rem;
  --text-lg: 1rem;
  --text-xl: 1.125rem;
}

body.text-large {
  --text-base: 1.125rem;
  --text-lg: 1.25rem;
  --text-xl: 1.5rem;
}

.message {
  font-size: var(--text-base);
}

.message h1 { font-size: var(--text-xl); }
.message h2 { font-size: var(--text-lg); }
.message code { font-size: var(--text-sm); }
```

---

## 🎭 Animation Customization

### Adding Custom Animations

#### Message Entrance Animations
```css
/* Slide in from right for user messages */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Slide in from left for assistant messages */
@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.message.user {
  animation: slideInRight 0.3s ease-out;
}

.message.assistant {
  animation: slideInLeft 0.3s ease-out;
}
```

#### Typing Indicator Animation
```css
@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-color);
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}
```

#### Background Animations
```css
/* Animated gradient background */
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

body.animated-background {
  background: linear-gradient(-45deg, #1a1a1a, #2d2d2d, #1a1a1a, #333333);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}
```

### Animation Controls
Add animation preferences to settings:

```javascript
function toggleAnimations(enabled) {
  if (enabled) {
    document.body.classList.remove('no-animations');
  } else {
    document.body.classList.add('no-animations');
  }
}

// Disable all animations
.no-animations * {
  animation-duration: 0s !important;
  transition-duration: 0s !important;
}
```

---

## 🔧 Layout Customization

### Responsive Breakpoints

#### Custom Breakpoint System
```css
/* Mobile First Approach */
.chat-container {
  width: 100%;
  height: 100vh;
  padding: 1rem;
}

/* Small tablets and large phones */
@media (min-width: 480px) {
  .chat-container {
    width: 400px;
    height: 600px;
    padding: 1.5rem;
  }
}

/* Tablets */
@media (min-width: 768px) {
  .chat-container {
    width: 500px;
    height: 700px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .chat-container {
    width: 600px;
    height: 800px;
  }
}
```

#### Flexible Grid System
```css
.message-grid {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: start;
}

.message.user .message-grid {
  grid-template-columns: 1fr auto auto;
}

.avatar {
  grid-row: 1 / -1;
  width: 32px;
  height: 32px;
}

.message-content {
  min-width: 0; /* Allows text to wrap */
}

.message-actions {
  display: flex;
  gap: 0.5rem;
}
```

### Custom Layout Options

#### Compact Mode
```css
body.compact-mode .message {
  padding: 6px 12px;
  margin: 4px 0;
  font-size: 0.875rem;
}

body.compact-mode .avatar {
  width: 24px;
  height: 24px;
}

body.compact-mode .chat-input {
  padding: 8px 12px;
}
```

#### Wide Mode
```css
body.wide-mode .chat-container {
  max-width: 800px;
  width: 90vw;
}

body.wide-mode .message {
  max-width: none;
}
```

---

## 🎨 Component Customization

### Custom Message Bubbles

#### Speech Bubble Style
```css
.message.speech-bubble {
  position: relative;
  border-radius: 18px;
  padding: 12px 16px;
}

.message.speech-bubble::before {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border: 8px solid transparent;
}

.message.user.speech-bubble::before {
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: var(--user-message-bg);
}

.message.assistant.speech-bubble::before {
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: var(--assistant-message-bg);
}
```

#### Card Style Messages
```css
.message.card-style {
  background: var(--card-background);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin: 12px 0;
}

.message.card-style .message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.message.card-style .message-content {
  line-height: 1.6;
}
```

### Custom Input Styles

#### Rounded Input
```css
.chat-input.rounded {
  border-radius: 25px;
  padding: 12px 20px;
  border: 2px solid var(--border-color);
}

.chat-input.rounded:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
}
```

#### Underline Input
```css
.chat-input.underline {
  border: none;
  border-bottom: 2px solid var(--border-color);
  border-radius: 0;
  background: transparent;
  padding: 12px 0;
}

.chat-input.underline:focus {
  border-bottom-color: var(--primary-color);
  outline: none;
}
```

---

## 🎪 Advanced Customizations

### Custom CSS Injection

#### Runtime Style Injection
```javascript
function injectCustomStyles(css) {
  const styleElement = document.createElement('style');
  styleElement.textContent = css;
  document.head.appendChild(styleElement);
}

// Example usage
const customCSS = `
  .message.user {
    background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  }
  
  .message.assistant {
    background: linear-gradient(45deg, #74b9ff, #0984e3);
  }
`;

injectCustomStyles(customCSS);
```

#### User-Defined Themes
```javascript
function loadUserTheme(themeConfig) {
  const {
    primaryColor,
    secondaryColor,
    backgroundColor,
    textColor,
    borderRadius,
    fontFamily
  } = themeConfig;
  
  const css = `
    :root {
      --primary-color: ${primaryColor};
      --secondary-color: ${secondaryColor};
      --background-color: ${backgroundColor};
      --text-color: ${textColor};
      --border-radius: ${borderRadius}px;
    }
    
    body {
      font-family: ${fontFamily};
    }
  `;
  
  injectCustomStyles(css);
}
```

### Plugin System Architecture

#### Plugin Interface
```javascript
class ExtensionPlugin {
  constructor(name, version) {
    this.name = name;
    this.version = version;
  }
  
  // Plugin lifecycle methods
  onLoad() {}
  onUnload() {}
  onMessage(message) {}
  onThemeChange(theme) {}
  
  // Plugin API
  addCustomCSS(css) {
    injectCustomStyles(css);
  }
  
  addMessageHandler(handler) {
    this.messageHandlers.push(handler);
  }
  
  addCommand(command, handler) {
    this.commands[command] = handler;
  }
}

// Example plugin
class NeonThemePlugin extends ExtensionPlugin {
  constructor() {
    super('Neon Theme', '1.0.0');
  }
  
  onLoad() {
    this.addCustomCSS(`
      body.neon-theme {
        background: #0a0a0a;
        color: #00ff88;
      }
    `);
  }
}
```

### Configuration System

#### Advanced Settings Schema
```javascript
const settingsSchema = {
  appearance: {
    theme: {
      type: 'select',
      options: ['dark', 'light', 'glass', 'neon'],
      default: 'dark'
    },
    designStyle: {
      type: 'select',
      options: ['minimalist', 'modern', 'retro'],
      default: 'minimalist'
    },
    customColors: {
      primary: { type: 'color', default: '#007bff' },
      secondary: { type: 'color', default: '#6c757d' },
      background: { type: 'color', default: '#1a1a1a' }
    }
  },
  behavior: {
    animations: { type: 'boolean', default: true },
    autoScroll: { type: 'boolean', default: true },
    soundEffects: { type: 'boolean', default: false }
  },
  advanced: {
    customCSS: { type: 'textarea', default: '' },
    debugMode: { type: 'boolean', default: false }
  }
};
```

---

## 🔍 Debugging and Testing

### CSS Debugging Tools

#### Debug Mode Styles
```css
body.debug-mode * {
  outline: 1px solid red;
}

body.debug-mode .message {
  position: relative;
}

body.debug-mode .message::before {
  content: attr(class);
  position: absolute;
  top: -20px;
  left: 0;
  font-size: 10px;
  background: yellow;
  color: black;
  padding: 2px 4px;
}
```

#### Performance Monitoring
```javascript
function measureRenderTime(callback) {
  const start = performance.now();
  callback();
  const end = performance.now();
  console.log(`Render time: ${end - start}ms`);
}

// Usage
measureRenderTime(() => {
  applyTheme('neon');
});
```

### Testing Custom Themes

#### Theme Validation
```javascript
function validateTheme(themeCSS) {
  const requiredSelectors = [
    '.chat-container',
    '.message.user',
    '.message.assistant',
    '.chat-input'
  ];
  
  const missingSelectors = requiredSelectors.filter(selector => 
    !themeCSS.includes(selector)
  );
  
  if (missingSelectors.length > 0) {
    console.warn('Missing required selectors:', missingSelectors);
  }
  
  return missingSelectors.length === 0;
}
```

#### Accessibility Testing
```javascript
function checkAccessibility() {
  const elements = document.querySelectorAll('.message, .btn, .chat-input');
  
  elements.forEach(element => {
    const styles = getComputedStyle(element);
    const bgColor = styles.backgroundColor;
    const textColor = styles.color;
    
    // Check contrast ratio
    const contrast = calculateContrastRatio(bgColor, textColor);
    if (contrast < 4.5) {
      console.warn(`Low contrast ratio (${contrast}) for element:`, element);
    }
  });
}
```

---

**Next**: Read the [Development Guide](./development.md) for advanced modification techniques
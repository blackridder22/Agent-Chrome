# Contributing to Agent Chrome Extension

Thank you for your interest in contributing to the Agent Chrome Extension! This guide will help you get started with contributing code, documentation, themes, and more.

## 🤝 Ways to Contribute

### 1. Code Contributions
- **Bug fixes**: Fix existing issues
- **New features**: Add functionality
- **Performance improvements**: Optimize existing code
- **Security enhancements**: Improve security measures

### 2. Documentation
- **Improve existing docs**: Fix typos, add clarity
- **Write tutorials**: Create step-by-step guides
- **API documentation**: Document webhook interfaces
- **Code comments**: Add inline documentation

### 3. Design and Themes
- **New themes**: Create custom color schemes
- **UI improvements**: Enhance user interface
- **Icons and graphics**: Design visual elements
- **Accessibility**: Improve accessibility features

### 4. Testing and Quality Assurance
- **Bug reports**: Find and report issues
- **Test new features**: Validate functionality
- **Browser compatibility**: Test across different browsers
- **Performance testing**: Identify bottlenecks

### 5. Community Support
- **Answer questions**: Help other users
- **Write tutorials**: Share knowledge
- **Create examples**: Build sample implementations
- **Moderate discussions**: Help maintain community standards

---

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

1. **Git** installed on your system
2. **Chrome browser** (latest version recommended)
3. **Text editor** or IDE (VS Code, Sublime Text, etc.)
4. **Basic knowledge** of:
   - HTML, CSS, JavaScript
   - Chrome Extension APIs
   - Git workflow

### Setting Up Development Environment

1. **Fork the Repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/agent-chrome-extension.git
   cd agent-chrome-extension
   ```

2. **Load Extension in Chrome**
   ```bash
   # Open Chrome and navigate to chrome://extensions/
   # Enable "Developer mode"
   # Click "Load unpacked" and select the project folder
   ```

3. **Set Up Development Tools**
   ```bash
   # Optional: Install development dependencies
   npm install  # If package.json exists
   
   # Set up pre-commit hooks (if available)
   git config core.hooksPath .githooks
   ```

4. **Create Development Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

---

## 📝 Development Guidelines

### Code Style and Standards

#### JavaScript
```javascript
// Use modern ES6+ syntax
const apiCall = async (data) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Use descriptive variable names
const userMessage = document.getElementById('user-input');
const chatContainer = document.querySelector('.chat-container');

// Add JSDoc comments for functions
/**
 * Renders a message in the chat interface
 * @param {Object} message - The message object
 * @param {string} message.content - Message content
 * @param {string} message.type - Message type ('user' or 'assistant')
 * @param {string} message.timestamp - ISO timestamp
 */
function renderMessage(message) {
  // Implementation here
}
```

#### CSS
```css
/* Use CSS custom properties for theming */
:root {
  --primary-color: #007bff;
  --background-color: #ffffff;
  --text-color: #333333;
  --border-radius: 8px;
  --spacing-unit: 8px;
}

/* Use BEM naming convention */
.chat-container {
  /* Block */
}

.chat-container__message {
  /* Element */
}

.chat-container__message--user {
  /* Modifier */
}

/* Group related styles */
.button {
  padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 2);
  border-radius: var(--border-radius);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
```

#### HTML
```html
<!-- Use semantic HTML elements -->
<main class="chat-container" role="main">
  <section class="message-area" aria-label="Chat messages">
    <article class="message message--user" role="article">
      <div class="message__content">User message content</div>
      <time class="message__timestamp" datetime="2024-01-15T10:30:00Z">
        10:30 AM
      </time>
    </article>
  </section>
  
  <form class="input-area" role="form">
    <label for="message-input" class="sr-only">Type your message</label>
    <textarea 
      id="message-input" 
      placeholder="Type your message..."
      aria-describedby="input-help"
    ></textarea>
    <button type="submit" aria-label="Send message">Send</button>
  </form>
</main>
```

### File Organization

```
project-root/
├── manifest.json          # Extension manifest
├── popup.html             # Main popup interface
├── popup.js               # Popup logic
├── popup.css              # Popup styles
├── options.html           # Settings page
├── options.js             # Settings logic
├── options.css            # Settings styles
├── background.js          # Service worker
├── content.js             # Content script
├── assets/                # Static assets
│   ├── icons/            # Extension icons
│   └── images/           # UI images
├── docs/                 # Documentation
├── tests/                # Test files
└── .Agent-UI/            # Future React app
```

### Commit Message Format

Use conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(themes): add glass theme with glassmorphism effects

fix(api): handle network timeout errors gracefully

docs(readme): update installation instructions

style(popup): improve button hover animations

refactor(storage): simplify chat history management

test(api): add unit tests for webhook integration

chore(deps): update development dependencies
```

---

## 🧪 Testing Guidelines

### Manual Testing Checklist

Before submitting a pull request, test:

#### Basic Functionality
- [ ] Extension loads without errors
- [ ] Popup opens and displays correctly
- [ ] Settings page accessible and functional
- [ ] Messages send and receive properly
- [ ] File attachments work
- [ ] Chat history saves and loads

#### Theme Testing
- [ ] All themes apply correctly
- [ ] Theme switching works smoothly
- [ ] Design styles (modern/minimalist) work
- [ ] Dark/light mode compatibility
- [ ] Responsive design on different screen sizes

#### Browser Compatibility
- [ ] Chrome (latest version)
- [ ] Chrome (version 88+)
- [ ] Edge (Chromium-based)
- [ ] Brave browser

#### Error Handling
- [ ] Network errors handled gracefully
- [ ] Invalid webhook URLs show appropriate errors
- [ ] File upload errors display helpful messages
- [ ] Storage quota exceeded scenarios

### Automated Testing

```javascript
// Example unit test structure
describe('Message Rendering', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div class="chat-container"></div>';
  });

  test('should render user message correctly', () => {
    const message = {
      id: 'test-1',
      type: 'user',
      content: 'Hello, world!',
      timestamp: '2024-01-15T10:30:00Z'
    };

    renderMessage(message);

    const messageElement = document.querySelector('.message--user');
    expect(messageElement).toBeTruthy();
    expect(messageElement.textContent).toContain('Hello, world!');
  });

  test('should handle empty message content', () => {
    const message = {
      id: 'test-2',
      type: 'user',
      content: '',
      timestamp: '2024-01-15T10:30:00Z'
    };

    expect(() => renderMessage(message)).not.toThrow();
  });
});
```

### Performance Testing

```javascript
// Performance testing utilities
function measureRenderTime(messageCount) {
  const start = performance.now();
  
  for (let i = 0; i < messageCount; i++) {
    renderMessage({
      id: `test-${i}`,
      type: i % 2 === 0 ? 'user' : 'assistant',
      content: `Test message ${i}`,
      timestamp: new Date().toISOString()
    });
  }
  
  const end = performance.now();
  console.log(`Rendered ${messageCount} messages in ${end - start}ms`);
}

// Test with different message counts
measureRenderTime(10);   // Should be < 50ms
measureRenderTime(100);  // Should be < 500ms
measureRenderTime(1000); // Should be < 5000ms
```

---

## 🎨 Creating Custom Themes

### Theme Structure

```css
/* Theme: Custom Blue */
body.custom-blue-theme {
  /* Color Variables */
  --primary-color: #2196f3;
  --primary-hover: #1976d2;
  --secondary-color: #03dac6;
  --background-color: #fafafa;
  --surface-color: #ffffff;
  --text-primary: #212121;
  --text-secondary: #757575;
  --border-color: #e0e0e0;
  --shadow-color: rgba(33, 150, 243, 0.1);
  
  /* Component Styles */
  --message-user-bg: var(--primary-color);
  --message-user-text: #ffffff;
  --message-assistant-bg: var(--surface-color);
  --message-assistant-text: var(--text-primary);
  
  /* Interactive Elements */
  --button-bg: var(--primary-color);
  --button-text: #ffffff;
  --button-hover-bg: var(--primary-hover);
  
  /* Input Elements */
  --input-bg: var(--surface-color);
  --input-border: var(--border-color);
  --input-focus-border: var(--primary-color);
}
```

### Theme Registration

```javascript
// Add to options.js
const AVAILABLE_THEMES = {
  'dark': 'Dark Theme',
  'light': 'Light Theme',
  'glass': 'Glass Theme',
  'custom-blue': 'Custom Blue Theme'  // Add your theme here
};

function applyTheme(theme) {
  // Remove all theme classes
  document.body.classList.remove(
    'light-theme', 
    'glass-theme', 
    'custom-blue-theme'
  );
  
  // Apply new theme (dark is default, no class needed)
  if (theme !== 'dark') {
    document.body.classList.add(`${theme}-theme`);
  }
}
```

### Theme Submission Guidelines

1. **Create theme CSS** following the structure above
2. **Test thoroughly** across all components
3. **Ensure accessibility** (contrast ratios, etc.)
4. **Document theme features** in pull request
5. **Provide screenshots** showing the theme in action

---

## 🐛 Bug Reports

### Before Reporting

1. **Search existing issues** to avoid duplicates
2. **Test with latest version** of the extension
3. **Disable other extensions** to isolate the issue
4. **Try in incognito mode** to rule out conflicts

### Bug Report Template

```markdown
## Bug Description
A clear and concise description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
A clear description of what you expected to happen.

## Actual Behavior
A clear description of what actually happened.

## Screenshots
If applicable, add screenshots to help explain your problem.

## Environment
- Chrome Version: [e.g. 120.0.6099.109]
- Extension Version: [e.g. 2.0.0]
- Operating System: [e.g. macOS 14.1]
- Other Extensions: [list any other extensions that might interfere]

## Console Errors
```
Paste any console errors here
```

## Additional Context
Add any other context about the problem here.
```

---

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
A clear and concise description of the feature you'd like to see.

## Problem Statement
What problem does this feature solve? What use case does it address?

## Proposed Solution
Describe how you envision this feature working.

## Alternative Solutions
Describe any alternative solutions or features you've considered.

## Implementation Ideas
If you have ideas about how this could be implemented, share them here.

## Additional Context
Add any other context, mockups, or examples about the feature request.
```

### Feature Development Process

1. **Discussion**: Feature requests are discussed in GitHub Issues
2. **Planning**: Approved features are planned and designed
3. **Implementation**: Code is written following guidelines
4. **Review**: Pull requests are reviewed by maintainers
5. **Testing**: Features are thoroughly tested
6. **Documentation**: Documentation is updated
7. **Release**: Features are included in the next release

---

## 🔄 Pull Request Process

### Before Submitting

1. **Fork and clone** the repository
2. **Create a feature branch** from main
3. **Make your changes** following the guidelines
4. **Test thoroughly** using the testing checklist
5. **Update documentation** if needed
6. **Commit with descriptive messages**

### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Manual testing completed
- [ ] All existing tests pass
- [ ] New tests added for new functionality

## Screenshots
If applicable, add screenshots of the changes.

## Checklist
- [ ] Code follows the style guidelines
- [ ] Self-review of code completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] No new warnings or errors introduced
```

### Review Process

1. **Automated checks** run on pull request
2. **Maintainer review** for code quality and standards
3. **Testing verification** by reviewers
4. **Feedback incorporation** if changes requested
5. **Approval and merge** when ready

---

## 📚 Documentation Standards

### Writing Guidelines

1. **Clear and concise**: Use simple, direct language
2. **User-focused**: Write from the user's perspective
3. **Step-by-step**: Break complex tasks into steps
4. **Examples**: Include code examples and screenshots
5. **Up-to-date**: Keep documentation current with code changes

### Documentation Types

#### API Documentation
```javascript
/**
 * Sends a message to the configured webhook endpoint
 * @async
 * @function sendMessage
 * @param {Object} messageData - The message data to send
 * @param {string} messageData.message - The user's message
 * @param {Array} messageData.files - Array of attached files
 * @param {Array} messageData.history - Previous conversation history
 * @returns {Promise<Object>} The API response
 * @throws {Error} When the request fails or returns an error
 * 
 * @example
 * const response = await sendMessage({
 *   message: "Hello, AI!",
 *   files: [],
 *   history: []
 * });
 * console.log(response.response); // AI's reply
 */
async function sendMessage(messageData) {
  // Implementation
}
```

#### User Documentation
```markdown
## How to Change Themes

1. **Open the extension** by clicking the icon in your toolbar
2. **Access settings** by clicking the gear icon (⚙️)
3. **Select theme** from the "Theme" dropdown:
   - **Dark**: Dark background with light text (default)
   - **Light**: Light background with dark text
   - **Glass**: Translucent glassmorphism effect
4. **Save changes** by clicking "Save Settings"
5. **See results** immediately in the popup

> **Tip**: You can also change the design style (Modern vs Minimalist) for different visual approaches.
```

---

## 🏆 Recognition

### Contributors

We recognize contributors in several ways:

1. **Contributors file**: Listed in CONTRIBUTORS.md
2. **Release notes**: Mentioned in version releases
3. **GitHub profile**: Contributions show on your GitHub profile
4. **Special recognition**: Outstanding contributions get special mentions

### Contribution Types

- 🐛 **Bug fixes**
- ✨ **New features**
- 📝 **Documentation**
- 🎨 **Design/themes**
- 🧪 **Testing**
- 💡 **Ideas/feedback**
- 🤝 **Community support**

---

## 📞 Getting Help

### Development Questions

- **GitHub Discussions**: For general questions and ideas
- **GitHub Issues**: For specific bugs or feature requests
- **Code Review**: Request review in pull requests
- **Documentation**: Check existing docs first

### Communication Guidelines

1. **Be respectful** and professional
2. **Search first** before asking questions
3. **Provide context** when asking for help
4. **Be patient** - maintainers are volunteers
5. **Give back** by helping others when you can

---

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

---

**Thank you for contributing to the Agent Chrome Extension!** 🎉

Your contributions help make this tool better for everyone. Whether you're fixing a small typo or adding a major feature, every contribution is valuable and appreciated.
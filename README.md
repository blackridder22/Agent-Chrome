# Agent Chrome Extension 🤖

A powerful Chrome extension that enables seamless chat interactions with AI agents through configurable webhooks. The extension provides a modern, responsive interface with advanced features like text selection integration, voice input, and customizable themes.

## 🏗️ System Architecture

### Core Components

#### 1. **Manifest Configuration** (`manifest.json`)
- **Manifest Version**: 3 (Latest Chrome Extension standard)
- **Permissions**: 
  - `storage` - For saving user settings and chat history
  - `sidePanel` - Modern side panel interface
  - `activeTab` - Access to current tab content
  - `contextMenus` - Right-click menu integration
- **Host Permissions**: `<all_urls>` for webhook communication

#### 2. **Background Service Worker** (`background.js`)
- Manages extension lifecycle and initialization
- Handles context menu creation and interactions
- Manages side panel behavior
- Stores and retrieves selected text from web pages
- Initializes default settings (webhooks, themes, etc.)

#### 3. **Content Script** (`content.js`)
- Injected into all web pages
- Handles text selection and double-click events
- Creates floating "Add to Agent Chrome" button
- Communicates with background script for text transfer

#### 4. **Side Panel Interface** (`popup.html`, `popup.js`, `popup.css`)
- Modern chat interface with responsive design
- Real-time message rendering with markdown support
- Settings management and webhook configuration
- Voice input integration
- File attachment capabilities

#### 5. **Options Page** (`options.html`, `options.js`, `options.css`)
- Dedicated settings configuration page
- Webhook management interface
- Theme and appearance customization

## 🔄 Process Flow

### 1. **Text Selection Workflow**
```
User selects text on webpage → Content script detects selection → 
Floating button appears → User clicks button → Text sent to side panel → 
Chat interface opens with pre-filled text
```

### 2. **Context Menu Integration**
```
User right-clicks selected text → "Add text to Agent Chrome" appears → 
User clicks menu item → Background script stores text → 
Side panel opens with selected text
```

### 3. **Chat Message Flow**
```
User types message → Validation checks → Message sent to configured webhook → 
Response received → Markdown parsing → Message displayed in chat → 
History saved to local storage
```

### 4. **Session Management**
```
Extension loads → Generate/retrieve persistent session ID → 
Load chat history → Restore previous conversation → 
Continue seamless interaction
```

## ⚙️ Parameters & Configuration

### Webhook Configuration
- **Webhook URL**: Primary endpoint for AI communication
- **Webhook Name**: Display name for the current webhook
- **Multiple Webhooks**: Support for multiple AI services
- **Default Webhook**: Fallback webhook selection

### Request Format
```json
{
  "sessionId": "session_1234567890_abc123",
  "chatInput": "User message text"
}
```

### Expected Response Format
```json
[
  {
    "output": "AI response text with markdown support"
  }
]
```

### Storage Parameters
- **Chat History**: `chatHistory_{sessionId}`
- **Webhooks**: `webhooks` object with name-URL pairs
- **Settings**: Theme, font, default webhook preferences
- **Session Data**: Persistent session ID and temporary text

### Theme Options
- **Dark Theme** (default): Professional dark interface
- **Light Theme**: Clean light interface
- **Glass Theme**: Modern glassmorphism effects with blur

### Font Families
- Inter, Roboto, Poppins, Source Sans Pro
- Open Sans, Lato, Nunito
- **New additions**: Lexend, Outfit, Poiret One, Gabarito, Fugaz One, Playwrite VN, Caveat, Permanent Marker

## 🎨 Style & Design

### Design Philosophy
- **Modern Glassmorphism**: Transparent backgrounds with blur effects
- **Responsive Layout**: Adapts to different side panel widths
- **Accessibility**: High contrast ratios and keyboard navigation
- **Smooth Animations**: CSS transitions and hover effects

### Key Design Features

#### 1. **Responsive Webhook Indicator**
- Dynamic text truncation based on available space
- Breakpoints: 300px, 400px, 500px+ widths
- Character limits: 5-40 characters depending on panel size
- Real-time resize detection with ResizeObserver

#### 2. **Message Styling**
- Fully rounded corners (25px border-radius)
- Distinct user/assistant message alignment
- Markdown rendering support (bold, italic, code, links, lists)
- Enhanced shadows and visual depth

#### 3. **Glass Theme Effects**
```css
background: rgba(255, 255, 255, 0.15);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.25);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
```

#### 4. **Responsive Breakpoints**
- **Very Narrow** (<300px): Minimal UI, aggressive truncation
- **Narrow** (300-400px): Compact layout
- **Medium** (400-500px): Balanced design
- **Wide** (>500px): Full feature display

### CSS Architecture
- **Base Styles**: Typography, colors, layout fundamentals
- **Component Styles**: Modular styling for UI components
- **Theme Variants**: Dark, light, and glass theme overrides
- **Responsive Styles**: Media queries for different screen sizes
- **Animation Styles**: Transitions and interactive effects

## 🚀 Advanced Features

### 1. **Voice Input Integration**
- Web Speech API implementation
- Real-time voice recognition
- Visual feedback during recording
- Automatic text insertion

### 2. **File Attachment System**
- File selection interface
- Multiple file type support
- Integration with chat workflow

### 3. **Smart Text Processing**
- Markdown parsing and rendering
- Code syntax highlighting
- Link detection and formatting
- List and header formatting

### 4. **Session Persistence**
- Persistent session IDs across browser restarts
- Chat history preservation
- Settings synchronization
- Cross-tab consistency

### 5. **Dynamic UI Adaptation**
- Real-time panel resize detection
- Debounced update mechanisms (30-50ms)
- Intelligent space allocation
- Button visibility prioritization

## 🛠️ Development & Maintenance

### Code Quality Features
- **Modular Architecture**: Separated concerns across files
- **Error Handling**: Comprehensive try-catch blocks
- **Logging**: Detailed console logging for debugging
- **Performance**: Debounced events and optimized DOM operations

### Browser Compatibility
- Chrome Extension Manifest V3
- Modern JavaScript (ES6+)
- CSS Grid and Flexbox layouts
- Web APIs: Storage, Speech, ResizeObserver

### Security Considerations
- Content Security Policy compliance
- Secure webhook communication
- Input sanitization
- XSS prevention measures

## 📦 Installation & Setup

1. **Load Extension**: Chrome → Extensions → Developer mode → Load unpacked
2. **Configure Webhook**: Click settings → Add webhook URL and name
3. **Set Permissions**: Allow extension access to websites
4. **Customize**: Choose theme, font, and preferences

## 🔧 Configuration Examples

### Basic Webhook Setup
```javascript
// Example webhook configuration
const webhookConfig = {
  name: "OpenAI GPT",
  url: "https://api.example.com/chat",
  default: true
};
```

### Theme Customization
```javascript
// Apply glass theme
chrome.storage.sync.set({ theme: 'glass' });

// Set custom font
chrome.storage.sync.set({ fontFamily: 'Lexend' });
```

## 📈 Performance Optimizations

- **Debounced Resize Events**: 30-50ms delays prevent excessive updates
- **Efficient DOM Manipulation**: Minimal reflows and repaints
- **Smart Caching**: Settings and history cached in memory
- **Lazy Loading**: Components loaded on demand
- **Optimized Animations**: Hardware-accelerated CSS transitions

## 🤝 Contributing

The extension follows modern web development practices with clean, maintainable code structure. Key areas for contribution:

- **UI/UX Improvements**: Enhanced responsive design
- **Performance Optimization**: Faster load times and smoother interactions
- **Feature Extensions**: Additional AI service integrations
- **Accessibility**: Screen reader support and keyboard navigation
- **Testing**: Automated testing framework implementation

---

**Version**: 0.1.0  
**License**: MIT  
**Author**: Agent Chrome Development Team
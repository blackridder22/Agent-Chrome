# Getting Started

This guide will help you install, configure, and start using the Agent Chrome Extension.

## 📋 Prerequisites

- Google Chrome browser (version 88 or higher)
- Basic understanding of Chrome extensions
- Access to an AI webhook endpoint (optional, for custom AI integration)

## 🚀 Installation

### Method 1: Developer Mode (Recommended for Development)

1. **Download the Extension**
   ```bash
   git clone https://github.com/blackridder22/Agent-Chrome.git
   cd Agent-Chrome
   ```

2. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the extension directory
   - The extension icon should appear in your toolbar

### Method 2: Chrome Web Store (When Available)
- Visit the Chrome Web Store
- Search for "Agent Chrome Extension"
- Click "Add to Chrome"

## ⚙️ Initial Configuration

### 1. Access Settings
- Click the extension icon in your toolbar
- Click the settings (⚙️) icon in the popup
- This opens the options page

### 2. Configure Webhooks (Optional)
If you have your own AI backend:
```
Name: My AI Assistant
URL: https://your-api-endpoint.com/chat
```

### 3. Choose Your Design Style
- **Complete Minimalist**: Clean, distraction-free interface
- **Modern Well-Designed**: Rich, polished interface with effects

### 4. Select Theme
- **Dark Mode**: Dark background with light text
- **Light Mode**: Light background with dark text
- **Glass (Blur)**: Translucent interface with blur effects

### 5. Customize Appearance
- **Font Family**: Choose from 8 different fonts
- **Text Size**: Small, Medium, or Large
- **Voice Language**: Select your preferred language for voice features

## 🎯 Basic Usage

### Starting a Conversation
1. Click the extension icon
2. Type your message in the input field
3. Press Enter or click the send button
4. Wait for the AI response

### File Attachments
1. Click the attachment (📎) button
2. Select files from your computer
3. Files are displayed as tickets above the input
4. Send your message with attached files

### Voice Features
1. Click the microphone button to start voice input
2. Speak your message
3. Click again to stop recording
4. The text will appear in the input field

### Managing Conversations
1. Click the history (📋) button to view past conversations
2. Click "New Chat" to start a fresh conversation
3. Use the delete button (🗑️) to remove conversations

## 🔧 Advanced Configuration

### Custom Webhooks
Create your own AI backend that accepts POST requests:
```json
{
  "message": "User's message",
  "files": ["base64-encoded-files"],
  "history": ["previous-messages"]
}
```

Expected response format:
```json
{
  "response": "AI's response message"
}
```

### Keyboard Shortcuts
- `Enter`: Send message
- `Shift + Enter`: New line in message
- `Ctrl/Cmd + K`: Clear current conversation
- `Ctrl/Cmd + ,`: Open settings

### Storage Management
The extension stores:
- Conversation history (local storage)
- Settings and preferences (sync storage)
- Temporary file data (session storage)

## 🎨 Customization Tips

### Theme Selection
- **Dark Mode**: Best for low-light environments
- **Light Mode**: Ideal for bright environments
- **Glass Theme**: Modern look with background blur effects

### Design Styles
- **Complete Minimalist**: 
  - No animations or transitions
  - Flat design with minimal colors
  - Focus on functionality over aesthetics
  - Best for productivity and performance

- **Modern Well-Designed**:
  - Rich animations and transitions
  - Gradients and shadows
  - Polished, professional appearance
  - Best for visual appeal

### Font Recommendations
- **Inter**: Modern, highly readable
- **Roboto**: Google's material design font
- **System**: Uses your OS default font
- **Poppins**: Friendly, rounded appearance

## 🔍 Troubleshooting Quick Fixes

### Extension Not Loading
1. Check if Developer Mode is enabled
2. Refresh the extensions page
3. Reload the extension

### No AI Responses
1. Check webhook configuration
2. Verify internet connection
3. Check browser console for errors

### Settings Not Saving
1. Ensure Chrome sync is enabled
2. Check storage permissions
3. Try refreshing the extension

## 📱 Mobile Considerations

While this is a Chrome extension (desktop only), the responsive design ensures:
- Proper scaling on different screen sizes
- Touch-friendly interface elements
- Readable text at various zoom levels

## 🔄 Updates

The extension automatically checks for updates when:
- Chrome starts
- The extension is enabled/disabled
- Manual refresh in chrome://extensions/

## 📞 Getting Help

If you encounter issues:
1. Check the [Troubleshooting Guide](./troubleshooting.md)
2. Review browser console errors
3. Check the [API Reference](./api-reference.md)
4. Create an issue on GitHub

---

**Next Steps**: 
- Read the [Architecture Overview](./architecture.md) to understand how the extension works
- Check the [Development Guide](./development-guide.md) if you want to modify the code
- Explore the [Styling Guide](./styling-guide.md) for customization options
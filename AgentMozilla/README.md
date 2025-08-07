# Agent Mozilla Sidebar

A powerful Firefox sidebar application for AI chat interactions, converted from the Agent Chrome extension. This sidebar provides seamless AI assistance directly within your Firefox browser.

## Features

- **Smart Text Selection**: Double-click any text on a webpage to add it to your chat
- **Multiple Themes**: Dark, Light, and Glass (blur) themes
- **Voice Input**: Speech-to-text functionality for hands-free interaction
- **Responsive Design**: Optimized for sidebar usage
- **Multiple AI Services**: Support for various AI services via webhooks
- **Persistent Sessions**: Chat history is saved and can be accessed anytime
- **File Attachments**: Support for various file types in conversations
- **Markdown Support**: Rich text formatting in chat messages
- **Customizable UI**: Font selection, text size, and design style options

## Installation

1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" in the left sidebar
3. Click "Load Temporary Add-on..."
4. Navigate to the AgentMozilla folder and select the `manifest.json` file
5. The sidebar will be available in Firefox's sidebar panel

## Setup

1. **Configure Webhooks**: 
   - Right-click in the sidebar and select "Settings" or use the settings button
   - Add your AI service webhook URLs
   - Set a default webhook for your conversations

2. **Customize Appearance**:
   - Choose between Dark, Light, or Glass themes
   - Select your preferred font family and text size
   - Enable background animations for the Glass theme

3. **Voice Settings**:
   - Configure your preferred voice language for speech recognition

## Usage

### Text Selection Method
1. Double-click any text on a webpage
2. Click the "Add to Agent Mozilla" button that appears
3. The text will be added to your chat input

### Context Menu Method
1. Select text on any webpage
2. Right-click and choose "Add text to Agent Mozilla"
3. The text will be available in your sidebar

### Direct Chat
1. Open the Firefox sidebar (View > Sidebar > Agent Mozilla)
2. Type your message directly in the input field
3. Use the voice button for speech input
4. Attach files using the paperclip button

## File Structure

```
AgentMozilla/
├── manifest.json          # Extension manifest
├── sidebar.html           # Main sidebar interface
├── sidebar.js             # Sidebar functionality
├── sidebar.css            # Sidebar styling
├── background.js          # Background script
├── content.js             # Content script for text selection
├── options.html           # Settings page
├── options.js             # Settings functionality
├── options.css            # Settings styling
├── icons/                 # Extension icons
└── README.md              # This file
```

## Supported File Types

- **Images**: PNG, JPG, JPEG, GIF, WebP, SVG
- **Documents**: PDF, TXT, MD, DOC, DOCX
- **Data**: JSON, CSV, XML
- **Code**: JS, HTML, CSS, PY, and more

## Webhook Configuration

The sidebar communicates with AI services through webhooks. Configure your webhook URLs in the settings to connect with your preferred AI service.

### Webhook Format
Your webhook should accept POST requests with the following structure:
```json
{
  "message": "User message text",
  "sessionId": "unique-session-id",
  "attachments": [
    {
      "name": "filename.ext",
      "type": "mime/type",
      "data": "base64-encoded-data"
    }
  ]
}
```

## Themes

- **Dark Mode**: Default dark theme for comfortable viewing
- **Light Mode**: Clean light theme for bright environments  
- **Glass Mode**: Modern blur effect with optional animated background

## Keyboard Shortcuts

- **Escape**: Close floating "Add to Agent Mozilla" button
- **Enter**: Send message (in chat input)

## Privacy & Security

- All chat data is stored locally in Firefox's storage
- No data is sent to external services except your configured webhooks
- File attachments are processed locally before sending

## Troubleshooting

1. **Sidebar not appearing**: Check that the extension is properly loaded in about:debugging
2. **Webhook errors**: Verify your webhook URL is correct and accessible
3. **Voice input not working**: Check microphone permissions in Firefox settings
4. **File upload issues**: Ensure file size is under the limit and type is supported

## Development

This Firefox sidebar is converted from the Agent Chrome extension. The main differences:
- Uses `browser` API instead of `chrome` API
- Sidebar implementation instead of side panel
- Firefox-specific manifest format (v2)

## Support

For issues and feature requests, please refer to the original Chrome extension documentation or create an issue in the project repository.
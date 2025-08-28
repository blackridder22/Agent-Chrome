# Agent Chrome Extension 🤖

> A powerful Chrome extension that enables seamless AI chat interactions through configurable webhooks with modern UI and advanced features.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?logo=google-chrome)](https://chrome.google.com/webstore)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.0.0-green.svg)](https://github.com/yourusername/agent-chrome-extension)

## ✨ Features

- 🎯 **Smart Text Selection** - Select text on any webpage and instantly chat with AI
- 🎨 **Beautiful Themes** - Dark, Light, and Glass themes with customizable fonts
- 🗣️ **Voice Input** - Speak your messages using Web Speech API
- 📱 **Responsive Design** - Adapts perfectly to any side panel width
- 🔗 **Multiple AI Services** - Configure multiple webhooks for different AI providers
- 💾 **Persistent Sessions** - Your conversations are saved and restored
- 🎭 **Markdown Support** - Rich text formatting in messages
- ⚡ **Real-time Chat** - Instant responses with smooth animations

## 🚀 Quick Start

### Installation

1. **Download or Clone** this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top-right)
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

### Setup

1. **Click the extension icon** to open the side panel
2. **Go to Settings** (gear icon)
3. **Add your webhook URL** and give it a name
4. **Choose your preferred theme** and font
5. **Start chatting!** 🎉

## 🎯 How to Use

### Text Selection Method
1. **Select any text** on a webpage
2. **Click the floating "Add to Agent Chrome" button** that appears
3. **The side panel opens** with your selected text ready to discuss

### Context Menu Method
1. **Right-click on selected text**
2. **Choose "Add text to Agent Chrome"** from the context menu
3. **Start your conversation** in the side panel

### Direct Chat
1. **Click the extension icon** to open the side panel
2. **Type your message** or use voice input
3. **Get instant AI responses** with markdown formatting

## 🛠️ Configuration

### Webhook Setup

Your webhook should accept POST requests with this format:

```json
{
  "sessionId": "session_1234567890_abc123",
  "chatInput": "User message text"
}
```

And respond with:

```json
[
  {
    "output": "AI response text with markdown support"
  }
]
```

### Supported AI Services

- OpenAI GPT models
- Anthropic Claude
- Google Gemini
- Custom AI endpoints
- Local AI servers

## 🎨 Customization

- **3 Beautiful Themes**: Dark (default), Light, Glass
- **8+ Font Options**: Inter, Roboto, Poppins, Lexend, and more
- **Responsive Layout**: Automatically adapts to panel width
- **Custom Styling**: Modify CSS for your own look

## 📚 Documentation

For detailed information, check out our comprehensive documentation:

- 📖 **[Getting Started Guide](docs/getting-started.md)** - Complete setup and usage instructions
- 🏗️ **[Architecture Overview](docs/architecture.md)** - Technical system design
- 📁 **[File Structure](docs/file-structure.md)** - Understanding the codebase
- 🔌 **[API Integration](docs/api.md)** - Webhook setup and examples
- 🎨 **[Customization Guide](docs/customization.md)** - Themes and styling
- 👨‍💻 **[Development Setup](docs/development.md)** - For contributors
- 🐛 **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions
- ❓ **[FAQ](docs/faq.md)** - Frequently asked questions

## 🔧 Development

### Prerequisites

- Chrome browser (latest version)
- Basic knowledge of HTML, CSS, JavaScript
- Text editor or IDE

### Local Development

1. **Clone the repository**
   ```bash
   https://github.com/blackridder22/Agent-Chrome.git
   cd agent-chrome-extension
   ```

2. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable Developer Mode
   - Click "Load unpacked" and select the project folder

3. **Make changes** and reload the extension to test

### Project Structure

```
├── manifest.json          # Extension configuration
├── popup.html             # Main chat interface
├── popup.js               # Chat functionality
├── popup.css              # Styling and themes
├── options.html           # Settings page
├── options.js             # Settings functionality
├── background.js          # Service worker
├── content.js             # Web page integration
├── assets/                # Icons and images
└── docs/                  # Comprehensive documentation
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/contributing.md) for details on:

- 🐛 **Bug Reports** - Help us improve
- 💡 **Feature Requests** - Share your ideas
- 🔧 **Code Contributions** - Submit pull requests
- 📝 **Documentation** - Improve our guides
- 🎨 **Design** - UI/UX enhancements

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 **Documentation**: Check our [comprehensive docs](docs/)
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/agent-chrome-extension/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/agent-chrome-extension/discussions)
- 📧 **Email**: support@agentchrome.com

## 🎉 Acknowledgments

- Built with modern Chrome Extension Manifest V3
- Inspired by the need for seamless AI integration
- Thanks to all contributors and users

---

**Made with ❤️ by blackridder22 and Claude 4 Sonnet and Gemini 2.5 Pro**

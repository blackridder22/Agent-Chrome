# Frequently Asked Questions (FAQ)

Quick answers to common questions about the Agent Chrome Extension.

## 🚀 Getting Started

### Q: How do I install the extension?
**A:** The extension is currently in development and not available on the Chrome Web Store. To install:

1. Download or clone the repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your toolbar

### Q: What permissions does the extension need?
**A:** The extension requires:
- **Storage**: To save your settings and chat history
- **ActiveTab**: To interact with the current webpage when needed
- **Host permissions**: To communicate with your webhook/API endpoint

### Q: Can I use this extension offline?
**A:** Partially. You can:
- ✅ View saved chat history
- ✅ Access settings and documentation
- ❌ Send new messages (requires internet for API calls)

---

## 🔧 Configuration

### Q: How do I set up my webhook URL?
**A:** 
1. Click the extension icon
2. Go to Settings (gear icon)
3. Enter your webhook URL in the "Webhook URL" field
4. Click "Save Settings"

**Note**: The URL must be HTTPS for security reasons.

### Q: What should my webhook return?
**A:** Your webhook should return JSON in this format:
```json
{
  "response": "AI response text here",
  "status": "success"
}
```

See the [API Documentation](./api.md) for complete details.

### Q: Can I use multiple AI providers?
**A:** Yes! The extension is provider-agnostic. You can:
- Switch between different webhook endpoints
- Use OpenAI, Anthropic, local models, or custom APIs
- Implement routing logic in your webhook to use multiple providers

---

## 🎨 Themes and Customization

### Q: How many themes are available?
**A:** Currently 3 themes:
- **Dark** (default): Dark background with light text
- **Light**: Light background with dark text  
- **Glass**: Translucent glassmorphism effect

### Q: What's the difference between themes and design styles?
**A:** 
- **Themes** control color schemes (dark/light/glass)
- **Design styles** control layout and visual approach:
  - **Modern**: Rounded corners, shadows, animations
  - **Complete Minimalist**: Flat design, no animations, minimal colors

### Q: Can I create custom themes?
**A:** Yes! See the [Customization Guide](./customization.md) for:
- Adding new color schemes
- Creating custom CSS variables
- Modifying component styles

### Q: Why don't my theme changes apply immediately?
**A:** Try these steps:
1. Close and reopen the extension popup
2. Check browser console for CSS errors
3. Verify the theme CSS file is loading correctly
4. Clear browser cache if needed

---

## 💬 Chat Features

### Q: How much chat history is saved?
**A:** 
- **Local storage**: Up to 5MB of chat data
- **Sync storage**: Up to 100KB of settings (synced across devices)
- **Automatic cleanup**: Messages older than 30 days are automatically removed

### Q: Can I export my chat history?
**A:** Yes! In the chat history modal:
1. Click "Export" button
2. Choose format (JSON or plain text)
3. File will download automatically

### Q: How do I delete specific conversations?
**A:** 
1. Open chat history (clock icon)
2. Find the conversation you want to delete
3. Click the trash icon next to it
4. Confirm deletion

### Q: Can I search through my chat history?
**A:** Currently, there's no built-in search feature, but you can:
- Export your history and search in a text editor
- Use browser's find function (Ctrl/Cmd+F) in the history modal
- This feature is planned for a future update

---

## 📁 File Attachments

### Q: What file types can I attach?
**A:** Supported formats:
- **Images**: JPG, PNG, GIF, WebP
- **Documents**: PDF, TXT, JSON, CSV
- **Code**: JS, Python, HTML, CSS, and more

### Q: What's the maximum file size?
**A:** 
- **Default limit**: 10MB per file
- **Total limit**: 50MB per message
- **Recommendation**: Keep files under 5MB for best performance

### Q: Why do my file uploads fail?
**A:** Common causes:
- File too large (check size limits)
- Unsupported file type
- Network connectivity issues
- Webhook endpoint doesn't handle file data properly

### Q: Can I attach multiple files at once?
**A:** Yes! You can:
- Select multiple files in the file picker
- Drag and drop multiple files
- Add files one by one before sending

---

## 🔒 Privacy and Security

### Q: Is my data secure?
**A:** 
- **Local storage**: All data stays on your device
- **No tracking**: Extension doesn't collect analytics
- **HTTPS required**: All API communications must use HTTPS
- **No data sharing**: Extension doesn't share data with third parties

### Q: Where is my data stored?
**A:** 
- **Chat history**: Locally in Chrome's storage
- **Settings**: Synced across your Chrome browsers (if signed in)
- **Files**: Temporarily processed, not permanently stored

### Q: Can I use this with sensitive information?
**A:** Consider these factors:
- Data is sent to your configured webhook/API
- Ensure your API endpoint is secure and compliant
- Review your AI provider's privacy policy
- Consider using local AI models for sensitive data

### Q: How do I completely remove all data?
**A:** 
1. Go to Settings
2. Click "Clear All Data"
3. Confirm the action
4. Optionally uninstall the extension

---

## 🌐 Browser Compatibility

### Q: Which browsers are supported?
**A:** 
- **Chrome**: Version 88+ (recommended)
- **Edge**: Chromium-based versions
- **Brave**: Latest versions
- **Opera**: Chromium-based versions

**Note**: Firefox is not supported due to Manifest V3 differences.

### Q: Why doesn't it work on mobile?
**A:** Chrome extensions don't run on mobile browsers. However:
- You can access your webhook directly on mobile
- Consider building a web app version
- PWA (Progressive Web App) could be a future option

### Q: Does it work on all websites?
**A:** The extension popup works everywhere, but:
- Some websites may block extension content scripts
- Corporate firewalls might block API requests
- HTTPS websites are required for secure operation

---

## ⚡ Performance

### Q: Why is the extension slow?
**A:** Common causes and solutions:
- **Large chat history**: Clear old conversations
- **Big file attachments**: Use smaller files
- **Slow API endpoint**: Optimize your webhook
- **Too many browser extensions**: Disable unused ones

### Q: How can I improve performance?
**A:** 
1. **Optimize settings**:
   - Disable animations if not needed
   - Use minimalist design style
   - Limit chat history retention

2. **Optimize your API**:
   - Use faster hosting (Vercel, Netlify)
   - Implement response caching
   - Optimize AI model parameters

3. **Browser optimization**:
   - Close unused tabs
   - Restart Chrome periodically
   - Update to latest Chrome version

### Q: Does the extension use a lot of memory?
**A:** The extension is lightweight:
- **Base memory**: ~2-5MB
- **With chat history**: +1-3MB per 100 messages
- **During file processing**: Temporary spike based on file size

---

## 🔄 Updates and Maintenance

### Q: How do I update the extension?
**A:** For development versions:
1. Download the latest code
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Or disable/enable the extension

### Q: Will my data be lost during updates?
**A:** No, your data persists through updates:
- Settings are preserved
- Chat history remains intact
- Custom themes are maintained

### Q: How often should I update?
**A:** 
- **Security updates**: Install immediately
- **Feature updates**: When you need new features
- **Bug fixes**: If you're experiencing issues

### Q: Can I roll back to a previous version?
**A:** Yes:
1. Keep backups of working versions
2. Export your data before updating
3. Replace the extension folder with the previous version
4. Reload the extension

---

## 🛠️ Development and Customization

### Q: Can I modify the extension code?
**A:** Absolutely! The extension is open source:
- Fork the repository
- Make your changes
- Test thoroughly
- Consider contributing back to the project

### Q: How do I add new features?
**A:** See the [Development Guide](./development.md) for:
- Code structure overview
- Adding new components
- Implementing new themes
- Testing procedures

### Q: Can I integrate with other services?
**A:** Yes! You can:
- Add new API endpoints
- Integrate with databases
- Connect to other Chrome APIs
- Build custom webhook handlers

### Q: How do I debug issues?
**A:** 
1. Open Chrome DevTools (F12)
2. Check Console for errors
3. Use the Network tab for API issues
4. See [Troubleshooting Guide](./troubleshooting.md) for detailed steps

---

## 🤝 Community and Support

### Q: Where can I get help?
**A:** 
- **Documentation**: Start with these docs
- **GitHub Issues**: Report bugs and request features
- **Community**: Join discussions in GitHub Discussions
- **Email**: Contact the maintainers directly

### Q: How can I contribute?
**A:** Ways to contribute:
- **Report bugs**: Create detailed issue reports
- **Suggest features**: Share your ideas
- **Submit code**: Create pull requests
- **Improve docs**: Help make documentation better
- **Share themes**: Contribute custom themes

### Q: Is there a roadmap?
**A:** Planned features include:
- Search functionality for chat history
- More theme options
- Plugin system for extensions
- Mobile companion app
- Advanced file handling
- Team collaboration features

### Q: Can I use this commercially?
**A:** Check the license file, but generally:
- Personal use: ✅ Always allowed
- Commercial use: ✅ Usually allowed
- Redistribution: ✅ With proper attribution
- Modification: ✅ Encouraged

---

## 🚨 Troubleshooting Quick Fixes

### Q: Extension icon disappeared
**A:** 
1. Go to `chrome://extensions/`
2. Find the Agent Extension
3. Make sure it's enabled
4. Click the puzzle piece icon in Chrome toolbar
5. Pin the extension

### Q: Settings won't save
**A:** 
1. Check if storage permission is granted
2. Try clearing browser cache
3. Disable other extensions temporarily
4. Check browser console for errors

### Q: Webhook requests failing
**A:** 
1. Verify URL is HTTPS
2. Test webhook with curl or Postman
3. Check CORS settings on your server
4. Verify request/response format

### Q: Themes not working
**A:** 
1. Clear browser cache
2. Check CSS file loading in DevTools
3. Try switching themes back and forth
4. Restart Chrome

### Q: Files won't upload
**A:** 
1. Check file size (must be under 10MB)
2. Verify file type is supported
3. Test with a small text file first
4. Check network connectivity

---

**Need more help?** Check the [Troubleshooting Guide](./troubleshooting.md) for detailed solutions or create an issue on GitHub.
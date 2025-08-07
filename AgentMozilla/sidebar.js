document.addEventListener('DOMContentLoaded', () => {
    const chatArea = document.getElementById('chat-area');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const attachFileBtn = document.getElementById('attach-file-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const voiceStatus = document.getElementById('voice-status');

    let sessionId;
    let currentWebhookUrl = '';
    let currentWebhookName = 'Default';
    const webhooks = {};
    let defaultWebhookName = '';
    let attachedFiles = [];
    const MAX_FILES = 10;
    const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB
    let isRecording = false;
    let recognition = null;

    // Firefox storage API compatibility
    const storage = {
        local: {
            get: (keys) => browser.storage.local.get(keys),
            set: (items) => browser.storage.local.set(items)
        },
        sync: {
            get: (keys) => browser.storage.sync.get(keys),
            set: (items) => browser.storage.sync.set(items)
        }
    };

    // Get or create a persistent session ID
    storage.local.get(['persistentSessionId']).then((result) => {
        if (result.persistentSessionId) {
            console.log('Retrieved existing session ID:', result.persistentSessionId);
            sessionId = result.persistentSessionId;
        } else {
            sessionId = generateSessionId();
            console.log('Created new session ID:', sessionId);
            storage.local.set({ persistentSessionId: sessionId }).then(() => {
                console.log('Persistent session ID saved:', sessionId);
            });
        }
        loadSettingsAndHistory();
    });

    const webhookIndicator = document.createElement('div');
    webhookIndicator.className = 'webhook-indicator';
    const chatInputArea = document.querySelector('.chat-input-area');
    chatInputArea.insertBefore(webhookIndicator, chatInput);

    function generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    // Function to save a message to history
    async function saveMessageToHistory(sessionId, message) {
        const historyKey = `chatHistory_${sessionId}`;
        const result = await storage.local.get([historyKey]);
        const history = result[historyKey] || [];
        history.push(message);
        await storage.local.set({ [historyKey]: history });
        console.log(`Message saved to history for session ${sessionId}:`, message);
        await storage.local.set({ persistentSessionId: sessionId });
    }

    function addMessageToChat(text, sender, avatarSrc, skipSave = false) {
        const message = { text, sender, avatarSrc, timestamp: new Date().toISOString() };
        displayMessageOnUI(message.text, message.sender, message.avatarSrc);
        if (!skipSave) {
            saveMessageToHistory(sessionId, message)
                .then(() => {
                    console.log('Message successfully saved to history');
                })
                .catch(error => {
                    console.error('Error saving message to history:', error);
                });
        }
    }

    // Function to parse basic markdown syntax
    function parseMarkdown(text) {
        // Bold: **text** or __text__
        text = text.replace(/\\*\\*(.*?)\\*\\*|__(.*?)__/g, '<strong>$1$2</strong>');
        
        // Italic: *text* or _text_
        text = text.replace(/\\*(.*?)\\*|_(.*?)_/g, '<em>$1$2</em>');
        
        // Code: `text`
        text = text.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // Links: [text](url)
        text = text.replace(/\\[(.*?)\\]\\((.*?)\\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Lists: - item or * item
        text = text.replace(/^(\\s*)[-*]\\s+(.*?)$/gm, '$1<li>$2</li>');
        
        // Headers: # Header or ## Header
        text = text.replace(/^#\\s+(.*?)$/gm, '<h1>$1</h1>');
        text = text.replace(/^##\\s+(.*?)$/gm, '<h2>$1</h2>');
        text = text.replace(/^###\\s+(.*?)$/gm, '<h3>$1</h3>');
        
        // Paragraphs: separate by blank lines
        text = text.replace(/\\n\\n/g, '</p><p>');
        
        // Preserve line breaks
        text = text.replace(/\\n/g, '<br>');
        
        return text;
    }
    
    function displayMessageOnUI(text, sender, avatarSrc) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);

        const avatarImg = document.createElement('img');
        avatarImg.src = avatarSrc || (sender === 'user' ? 'icons/user-avatar.svg' : 'icons/assistant-avatar.svg');
        avatarImg.alt = sender;
        avatarImg.classList.add('avatar');

        const messageContentDiv = document.createElement('div');
        messageContentDiv.classList.add('message-content');
        const p = document.createElement('p');
        
        p.innerHTML = parseMarkdown(text);
        messageContentDiv.appendChild(p);

        if (sender === 'user') {
            messageDiv.appendChild(messageContentDiv);
            messageDiv.appendChild(avatarImg);
        } else {
            messageDiv.appendChild(avatarImg);
            messageDiv.appendChild(messageContentDiv);
        }

        chatArea.appendChild(messageDiv);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    async function sendMessage() {
        const messageText = chatInput.value.trim();
        if (!messageText && attachedFiles.length === 0) return;

        if (!currentWebhookUrl) {
            addMessageToChat('Error: No webhook URL configured. Please set one in settings.', 'assistant');
            console.error('No webhook URL configured.');
            return;
        }

        removeWelcomeMessage();
        
        let displayMessage = messageText;
        if (attachedFiles.length > 0) {
            const fileCount = attachedFiles.length;
            const totalSize = attachedFiles.reduce((sum, file) => sum + file.size, 0);
            const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);
            displayMessage += `\\n\\n📎 ${fileCount} file(s) attached (${totalSizeMB}MB)`;
        }
        
        addMessageToChat(displayMessage, 'user');
        chatInput.value = '';
        
        const filesToSend = [...attachedFiles];
        clearAttachedFiles();
        
        showLoadingIndicator(true);

        try {
            const payload = {
                sessionId: sessionId,
                chatInput: messageText,
                files: filesToSend.map(file => ({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                    data: file.data,
                    id: file.id
                }))
            };

            console.log(`Sending message with ${filesToSend.length} files, total payload size: ${JSON.stringify(payload).length} bytes`);

            const response = await fetch(currentWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            showLoadingIndicator(false);

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
            }

            const responseData = await response.json();
            if (responseData && responseData.length > 0 && responseData[0].output) {
                addMessageToChat(responseData[0].output, 'assistant');
            } else {
                addMessageToChat('Received an empty or invalid response from the webhook.', 'assistant');
                console.warn('Invalid response structure:', responseData);
            }

        } catch (error) {
            showLoadingIndicator(false);
            console.error('Error sending message:', error);
            addMessageToChat(`Error: Could not connect to the webhook or process the response. Details: ${error.message}`, 'assistant');
        }
    }

    function showLoadingIndicator(show) {
        const loadingMsgId = 'loading-indicator';
        let loadingDiv = document.getElementById(loadingMsgId);

        if (show) {
            if (!loadingDiv) {
                loadingDiv = document.createElement('div');
                loadingDiv.id = loadingMsgId;
                loadingDiv.className = 'typing-indicator';
                loadingDiv.textContent = 'Typing...';
                chatArea.appendChild(loadingDiv);
                chatArea.scrollTop = chatArea.scrollHeight;
            }
        } else {
            if (loadingDiv) {
                loadingDiv.remove();
            }
        }
    }

    function displayWelcomeMessage() {
        if (document.querySelector('.welcome-message')) return;
        const messages = chatArea.querySelectorAll('.message');
        if (messages.length === 0) {
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'welcome-message';
            welcomeDiv.textContent = 'Hey there! How can I help you today?';
            const container = document.querySelector('.container');
            if (container) container.appendChild(welcomeDiv);
            else chatArea.appendChild(welcomeDiv);
        }
    }

    function removeWelcomeMessage() {
        const welcomeDiv = document.querySelector('.welcome-message');
        if (welcomeDiv) {
            welcomeDiv.remove();
        }
    }

    // Load settings and history
    async function loadSettingsAndHistory() {
        try {
            const result = await storage.sync.get([
                'webhooks', 'defaultWebhookName', 'theme', 'designStyle', 
                'textSize', 'fontFamily', 'voiceLanguage', 'animatedBackground'
            ]);

            // Load webhooks
            if (result.webhooks) {
                Object.assign(webhooks, result.webhooks);
            }

            if (result.defaultWebhookName) {
                defaultWebhookName = result.defaultWebhookName;
                if (webhooks[defaultWebhookName]) {
                    currentWebhookUrl = webhooks[defaultWebhookName];
                    currentWebhookName = defaultWebhookName;
                }
            } else if (Object.keys(webhooks).length > 0) {
                const firstWebhookName = Object.keys(webhooks)[0];
                currentWebhookUrl = webhooks[firstWebhookName];
                currentWebhookName = firstWebhookName;
            }

            // Apply theme and design settings
            applyTheme(result.theme || 'dark');
            applyDesignStyle(result.designStyle || 'minimalist');
            applyTextSize(result.textSize || 'medium');
            applyFontFamily(result.fontFamily || 'inter');

            updateWebhookIndicator();

            // Load chat history
            await loadChatHistory();

            // Show welcome message if no history
            if (chatArea.children.length === 0) {
                displayWelcomeMessage();
            }

            // Make body visible after loading
            document.body.style.visibility = 'visible';

        } catch (error) {
            console.error('Error loading settings and history:', error);
            document.body.style.visibility = 'visible';
        }
    }

    async function loadChatHistory() {
        try {
            const historyKey = `chatHistory_${sessionId}`;
            const result = await storage.local.get([historyKey]);
            const history = result[historyKey] || [];

            history.forEach(message => {
                displayMessageOnUI(message.text, message.sender, message.avatarSrc);
            });

            if (history.length > 0) {
                chatArea.scrollTop = chatArea.scrollHeight;
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    function updateWebhookIndicator() {
        if (currentWebhookName && currentWebhookUrl) {
            webhookIndicator.textContent = `🔗 ${currentWebhookName}`;
            webhookIndicator.style.display = 'block';
        } else {
            webhookIndicator.textContent = '⚠️ No webhook configured';
            webhookIndicator.style.display = 'block';
        }
    }

    // Theme and styling functions
    function applyTheme(theme) {
        document.body.className = '';
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else if (theme === 'glass') {
            document.body.classList.add('glass-theme');
        }
    }

    function applyDesignStyle(style) {
        document.body.classList.remove('modern-design', 'complete-minimalist');
        if (style === 'modern') {
            document.body.classList.add('modern-design');
        } else if (style === 'minimalist') {
            document.body.classList.add('complete-minimalist');
        }
    }

    function applyTextSize(size) {
        document.body.classList.remove('text-small', 'text-medium', 'text-large');
        document.body.classList.add(`text-${size}`);
    }

    function applyFontFamily(font) {
        document.body.classList.remove('font-system', 'font-inter', 'font-roboto', 'font-poppins', 'font-source-sans', 'font-open-sans', 'font-lato', 'font-nunito');
        document.body.classList.add(`font-${font}`);
    }

    // File attachment functionality
    function clearAttachedFiles() {
        attachedFiles = [];
        updateFileAttachmentUI();
    }

    function updateFileAttachmentUI() {
        const container = document.querySelector('.attached-files-container');
        if (container) {
            if (attachedFiles.length === 0) {
                container.remove();
            }
        }
    }

    // Voice functionality
    function initializeVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                isRecording = true;
                voiceBtn.classList.add('recording');
                voiceStatus.textContent = 'Listening...';
                voiceStatus.style.display = 'block';
            };

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                chatInput.value = transcript;
                chatInput.focus();
            };

            recognition.onend = () => {
                isRecording = false;
                voiceBtn.classList.remove('recording');
                voiceStatus.style.display = 'none';
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                isRecording = false;
                voiceBtn.classList.remove('recording');
                voiceStatus.style.display = 'none';
            };
        }
    }

    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    newChatBtn.addEventListener('click', () => {
        const newSessionId = generateSessionId();
        console.log('Created new session ID:', newSessionId);
        
        sessionId = newSessionId;
        
        storage.local.set({ persistentSessionId: sessionId }).then(() => {
            console.log('New persistent session ID saved:', sessionId);
            
            chatArea.innerHTML = '';
            displayWelcomeMessage();
            
            if (defaultWebhookName && webhooks[defaultWebhookName]) {
                currentWebhookUrl = webhooks[defaultWebhookName];
                currentWebhookName = defaultWebhookName;
            } else if (Object.keys(webhooks).length > 0) {
                const firstWebhookName = Object.keys(webhooks)[0];
                currentWebhookUrl = webhooks[firstWebhookName];
                currentWebhookName = firstWebhookName;
            }
            updateWebhookIndicator();
        });
    });

    settingsBtn.addEventListener('click', () => {
        browser.runtime.openOptionsPage();
    });

    voiceBtn.addEventListener('click', () => {
        if (!recognition) {
            initializeVoiceRecognition();
        }
        
        if (recognition) {
            if (isRecording) {
                recognition.stop();
            } else {
                recognition.start();
            }
        } else {
            console.warn('Speech recognition not supported');
        }
    });

    // File attachment
    attachFileBtn.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = 'image/png,image/jpeg,image/jpg,image/webp,text/plain,text/markdown,text/html,text/css,text/javascript,text/yaml,text/xml,text/csv,application/pdf,application/json,application/rtf,.txt,.md,.html,.css,.js,.yaml,.yml,.xml,.csv,.tsv,.py,.sh,.c,.cpp,.java,.pdf,.json,.rtf';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', async (event) => {
            const files = Array.from(event.target.files);
            await handleFileSelection(files);
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    });

    async function handleFileSelection(files) {
        // Simplified file handling for Firefox
        for (const file of files) {
            if (attachedFiles.length >= MAX_FILES) {
                console.warn('Maximum files reached');
                break;
            }
            
            if (file.size > 10 * 1024 * 1024) { // 10MB limit per file
                console.warn('File too large:', file.name);
                continue;
            }
            
            try {
                const fileData = await processFile(file);
                attachedFiles.push(fileData);
            } catch (error) {
                console.error('Error processing file:', error);
            }
        }
    }

    async function processFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function() {
                const base64Data = reader.result.split(',')[1];
                resolve({
                    name: file.name,
                    size: file.size,
                    type: file.type || 'application/octet-stream',
                    lastModified: file.lastModified,
                    data: base64Data,
                    id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
                });
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    // Check for pending text from context menu
    storage.local.get(['pendingText']).then((result) => {
        if (result.pendingText) {
            chatInput.value = result.pendingText;
            chatInput.focus();
            storage.local.remove(['pendingText']);
        }
    });

    // Initialize
    initializeVoiceRecognition();
});
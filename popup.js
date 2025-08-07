document.addEventListener('DOMContentLoaded', () => {
    const chatArea = document.getElementById('chat-area');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const attachFileBtn = document.getElementById('attach-file-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const voiceStatus = document.getElementById('voice-status');
    const bgToggle = document.getElementById('bgToggle');

    // For settings panel (to be implemented later)
    // const settingsPanel = document.createElement('div'); // Placeholder
    // settingsPanel.className = 'settings-panel';
    // settingsPanel.innerHTML = `...`; // Placeholder
    // document.body.appendChild(settingsPanel);

    let sessionId;
    let currentWebhookUrl = ''; // To be loaded from storage
    let currentWebhookName = 'Default'; // To be loaded or set
    const webhooks = {}; // To be loaded from storage {name: url, ...}
    let defaultWebhookName = ''; // To be loaded from storage

    // Get or create a persistent session ID
    chrome.storage.local.get(['persistentSessionId'], (result) => {
        if (result.persistentSessionId) {
            console.log('Retrieved existing session ID:', result.persistentSessionId);
            sessionId = result.persistentSessionId;
        } else {
            sessionId = generateSessionId();
            console.log('Created new session ID:', sessionId);
            chrome.storage.local.set({ persistentSessionId: sessionId }, () => {
                console.log('Persistent session ID saved:', sessionId);
            });
        }
        // Load settings and history after we have the session ID
        loadSettingsAndHistory();
    });

    const webhookIndicator = document.createElement('div');
    webhookIndicator.className = 'webhook-indicator';
    const chatInputArea = document.querySelector('.chat-input-area');
    chatInputArea.insertBefore(webhookIndicator, chatInput);

    const slashCommandPopup = document.createElement('div');
    slashCommandPopup.className = 'slash-command-popup';
    slashCommandPopup.style.display = 'none';
    chatInputArea.appendChild(slashCommandPopup);

    // Settings and history will be loaded after we have the session ID

    function generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    // Function to save a message to history
    async function saveMessageToHistory(sessionId, message) {
        return new Promise((resolve) => {
            const historyKey = `chatHistory_${sessionId}`;
            chrome.storage.local.get([historyKey], (result) => {
                const history = result[historyKey] || [];
                history.push(message);
                chrome.storage.local.set({ [historyKey]: history }, () => {
                    console.log(`Message saved to history for session ${sessionId}:`, message);
                    // Force save the persistentSessionId to ensure it's always up to date
                    chrome.storage.local.set({ persistentSessionId: sessionId }, () => {
                        resolve();
                    });
                });
            });
        });
    }

    function addMessageToChat(text, sender, avatarSrc, skipSave = false) { // Added skipSave for loading history
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
        text = text.replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>');
        
        // Italic: *text* or _text_
        text = text.replace(/\*(.*?)\*|_(.*?)_/g, '<em>$1$2</em>');
        
        // Code: `text`
        text = text.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // Links: [text](url)
        text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Lists: - item or * item
        text = text.replace(/^(\s*)[-*]\s+(.*?)$/gm, '$1<li>$2</li>');
        
        // Headers: # Header or ## Header
        text = text.replace(/^#\s+(.*?)$/gm, '<h1>$1</h1>');
        text = text.replace(/^##\s+(.*?)$/gm, '<h2>$1</h2>');
        text = text.replace(/^###\s+(.*?)$/gm, '<h3>$1</h3>');
        
        // Paragraphs: separate by blank lines
        text = text.replace(/\n\n/g, '</p><p>');
        
        // Preserve line breaks
        text = text.replace(/\n/g, '<br>');
        
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
        
        // Use innerHTML with parsed markdown instead of textContent
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
        chatArea.scrollTop = chatArea.scrollHeight; // Scroll to bottom
    }

    async function sendMessage() {
        const messageText = chatInput.value.trim();
        if (!messageText && attachedFiles.length === 0) return;

        if (!currentWebhookUrl) {
            addMessageToChat('Error: No webhook URL configured. Please set one in settings.', 'assistant');
            console.error('No webhook URL configured.');
            return;
        }

        removeWelcomeMessage(); // Remove welcome message when user starts typing/sends message
        
        // Display message with file count if files are attached
        let displayMessage = messageText;
        if (attachedFiles.length > 0) {
            const fileCount = attachedFiles.length;
            const totalSize = attachedFiles.reduce((sum, file) => sum + file.size, 0);
            const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);
            displayMessage += `\n\n📎 ${fileCount} file(s) attached (${totalSizeMB}MB)`;
        }
        
        addMessageToChat(displayMessage, 'user');
        chatInput.value = '';
        
        // Create a copy of attached files before clearing the UI
        const filesToSend = [...attachedFiles];
        
        // Clear attached files immediately after sending the message
        clearAttachedFiles();
        
        showLoadingIndicator(true);

        try {
            // Prepare payload with files
            const payload = {
                sessionId: sessionId,
                chatInput: messageText,
                files: filesToSend.map(file => ({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                    data: file.data, // Base64 encoded binary data
                    id: file.id
                }))
            };

            // Enhanced debugging for file data
            if (filesToSend.length > 0) {
                console.log(`=== FILE ATTACHMENT DEBUG ===`);
                console.log(`Number of files: ${filesToSend.length}`);
                filesToSend.forEach((file, index) => {
                    console.log(`File ${index + 1}:`);
                    console.log(`  Name: ${file.name}`);
                    console.log(`  Size: ${file.size} bytes`);
                    console.log(`  Type: ${file.type}`);
                    console.log(`  Base64 data length: ${file.data ? file.data.length : 'NULL'}`);
                    console.log(`  Base64 data preview: ${file.data ? file.data.substring(0, 100) + '...' : 'NULL'}`);
                    console.log(`  Data is valid base64: ${file.data ? /^[A-Za-z0-9+/]*={0,2}$/.test(file.data) : false}`);
                });
                console.log(`Total payload size: ${JSON.stringify(payload).length} bytes`);
                console.log(`=== END FILE DEBUG ===`);
            }

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
                loadingDiv.className = 'typing-indicator'; // Use new class for shimmer
                loadingDiv.textContent = 'Typing...';
                // Insert it before the input area or at the end of chat messages
                // For simplicity, appending to chatArea, but could be positioned differently
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
        // Check if a welcome message already exists
        if (document.querySelector('.welcome-message')) return;
        // Check if chat area is empty (ignoring the potential typing indicator)
        const messages = chatArea.querySelectorAll('.message');
        if (messages.length === 0) {
            const welcomeDiv = document.createElement('div');
            welcomeDiv.className = 'welcome-message';
            welcomeDiv.textContent = 'Hey there! How can I help you today?';
            // This message should be a direct child of the container or a specifically positioned element
            // For simplicity, we'll add it to chatArea and rely on CSS for positioning.
            // A more robust solution might involve a dedicated placeholder element in popup.html.
            if(chatArea.parentNode) { // Ensure chatArea is in the DOM
                 // Let's try to put it inside the container but not in the scrollable chat-area for centering
                const container = document.querySelector('.container');
                if (container) container.appendChild(welcomeDiv);
                else chatArea.appendChild(welcomeDiv); // Fallback
            }
        }
    }

    function removeWelcomeMessage() {
        const welcomeDiv = document.querySelector('.welcome-message');
        if (welcomeDiv) {
            welcomeDiv.remove();
        }
    }

    newChatBtn.addEventListener('click', () => {
        // Create a new session ID instead of clearing the current one
        const newSessionId = generateSessionId();
        console.log('Created new session ID:', newSessionId);
        
        // Update the session ID
        sessionId = newSessionId;
        
        // Save the new session ID as the persistent one
        chrome.storage.local.set({ persistentSessionId: sessionId }, () => {
            console.log('New persistent session ID saved:', sessionId);
            
            // Clear chat area and display welcome message
            chatArea.innerHTML = '';
            displayWelcomeMessage();
            
            // Reset active webhook to default
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

    // Create history modal elements
    const historyModal = document.createElement('div');
    historyModal.className = 'history-modal';
    historyModal.style.display = 'none';
    document.body.appendChild(historyModal);

    const historyContent = document.createElement('div');
    historyContent.className = 'history-content';
    historyModal.appendChild(historyContent);

    const historyHeader = document.createElement('div');
    historyHeader.className = 'history-header';
    historyContent.appendChild(historyHeader);

    const historyTitle = document.createElement('h2');
    historyTitle.textContent = 'Conversation History';
    historyHeader.appendChild(historyTitle);

    const closeHistoryBtn = document.createElement('button');
    closeHistoryBtn.className = 'close-history-btn';
    closeHistoryBtn.textContent = '×';
    historyHeader.appendChild(closeHistoryBtn);

    const historyList = document.createElement('div');
    historyList.className = 'history-list';
    historyContent.appendChild(historyList);

    // Function to load all chat sessions from storage
    async function loadAllChatSessions() {
        return new Promise((resolve) => {
            chrome.storage.local.get(null, (result) => {
                const sessions = [];
                console.log('All storage items:', Object.keys(result));
                
                // Find all chat history keys
                for (const key in result) {
                    if (key.startsWith('chatHistory_')) {
                        const sessionId = key.replace('chatHistory_', '');
                        const messages = result[key];
                        console.log(`Found chat history for session ${sessionId} with ${messages ? messages.length : 0} messages`);
                        
                        if (messages && messages.length > 0) {
                            // Get first and last message for preview
                            const firstMessage = messages[0];
                            const lastMessage = messages[messages.length - 1];
                            const lastTimestamp = new Date(lastMessage.timestamp);
                            
                            sessions.push({
                                id: sessionId,
                                preview: firstMessage.text.substring(0, 50) + (firstMessage.text.length > 50 ? '...' : ''),
                                messageCount: messages.length,
                                lastUpdated: lastTimestamp,
                                messages: messages
                            });
                        }
                    }
                }
                
                // Sort by most recent first
                sessions.sort((a, b) => b.lastUpdated - a.lastUpdated);
                resolve(sessions);
            });
        });
    }

    // Function to display chat sessions in the history modal
    async function displayChatSessions() {
        historyList.innerHTML = '';
        console.log('Displaying chat sessions...');
        const sessions = await loadAllChatSessions();
        console.log('Found', sessions.length, 'chat sessions');
        
        if (sessions.length === 0) {
            const noHistory = document.createElement('div');
            noHistory.className = 'no-history';
            noHistory.textContent = 'No conversation history found.';
            historyList.appendChild(noHistory);
            console.log('No chat history found, displaying empty state');
            return;
        }
        
        sessions.forEach(session => {
            const sessionItem = document.createElement('div');
            sessionItem.className = 'history-item';
            if (session.id === sessionId) {
                sessionItem.classList.add('current-session');
            }
            
            // Create main content container
            const sessionContent = document.createElement('div');
            sessionContent.className = 'history-content';
            
            const sessionDate = document.createElement('div');
            sessionDate.className = 'history-date';
            sessionDate.textContent = session.lastUpdated.toLocaleString();
            sessionContent.appendChild(sessionDate);
            
            const sessionPreview = document.createElement('div');
            sessionPreview.className = 'history-preview';
            sessionPreview.textContent = session.preview;
            sessionContent.appendChild(sessionPreview);
            
            const sessionInfo = document.createElement('div');
            sessionInfo.className = 'history-info';
            sessionInfo.textContent = `${session.messageCount} messages`;
            sessionContent.appendChild(sessionInfo);
            
            // Create delete button
            const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-chat-btn';
        deleteBtn.innerHTML = '<img src="icons/delete-icon.svg" alt="Delete" width="14" height="14">';
        deleteBtn.title = 'Delete chat';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the session click
                deleteChatSession(session.id);
            });
            
            // Add click event to load this conversation (only on content, not delete button)
            sessionContent.addEventListener('click', () => {
                loadConversation(session.id, session.messages);
                historyModal.style.display = 'none';
            });
            
            sessionItem.appendChild(sessionContent);
            sessionItem.appendChild(deleteBtn);
            historyList.appendChild(sessionItem);
        });
    }

    // Function to delete a chat session
    async function deleteChatSession(sessionIdToDelete) {
        if (confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
            const historyKey = `chatHistory_${sessionIdToDelete}`;
            
            // Remove the chat history from storage
            chrome.storage.local.remove([historyKey], () => {
                console.log(`Chat session ${sessionIdToDelete} deleted`);
                
                // If we're deleting the current session, create a new one
                if (sessionIdToDelete === sessionId) {
                    sessionId = generateSessionId();
                    chrome.storage.local.set({ persistentSessionId: sessionId }, () => {
                        console.log('New session ID created:', sessionId);
                    });
                    
                    // Clear the current chat and show welcome message
                    chatArea.innerHTML = '';
                    displayWelcomeMessage();
                }
                
                // Refresh the history display
                displayChatSessions();
            });
        }
    }

    // Function to load a specific conversation
    function loadConversation(newSessionId, messages) {
        // Only change session ID if it's different
        if (newSessionId !== sessionId) {
            sessionId = newSessionId;
            // Update the persistent session ID
            chrome.storage.local.set({ persistentSessionId: sessionId }, () => {
                console.log('Session ID updated to:', sessionId);
            });
        }
        
        // Clear current chat and load messages
        chatArea.innerHTML = '';
        if (messages && messages.length > 0) {
            console.log('Loading conversation with', messages.length, 'messages');
            messages.forEach(msg => {
                displayMessageOnUI(msg.text, msg.sender, msg.avatarSrc, true); // true to skip saving again
            });
            
            // Remove welcome message since we're loading history
            removeWelcomeMessage();
        } else {
            console.log('No messages to load for this conversation');
            displayWelcomeMessage();
        }
    }

    // Event listeners for history modal
    closeHistoryBtn.addEventListener('click', () => {
        historyModal.style.display = 'none';
    });

    // Close modal if clicked outside content
    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            historyModal.style.display = 'none';
        }
    });

    const historyBtn = document.getElementById('history-btn');
    historyBtn.addEventListener('click', () => {
        displayChatSessions();
        historyModal.style.display = 'flex';
    });


    sendBtn.addEventListener('click', () => sendMessage()); // Ensure it calls the function
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            if (!e.shiftKey) {
                e.preventDefault(); // Prevent new line on Enter without Shift
                sendMessage();
            }
            // With Shift+Enter, the default behavior (new line) will occur
        }
    });

    settingsBtn.addEventListener('click', () => {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            // Fallback for environments where openOptionsPage might not be available
            // (though for a side panel extension, it should be)
            window.open(chrome.runtime.getURL('options.html'));
            console.warn('chrome.runtime.openOptionsPage is not available, falling back to window.open.');
        }
    });

    // File attachment state
    let attachedFiles = [];
    const MAX_FILES = 10;
    const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB in bytes

    // Show popup notification for errors and messages
    function showPopupNotification(message, type = 'error', duration = 4000) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.popup-notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `popup-notification ${type}`;
        
        // Create close button with SVG
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>`;
        closeButton.addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        });
        
        // Create message content
        const messageSpan = document.createElement('span');
        messageSpan.className = 'notification-message';
        messageSpan.textContent = message;
        
        // Assemble notification
        notification.appendChild(messageSpan);
        notification.appendChild(closeButton);
        
        // Add to document
        document.body.appendChild(notification);
        
        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, duration);
    }

    // File attachment functionality
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

    // Handle file selection and validation
    async function handleFileSelection(files) {
        const validFiles = [];
        let totalSize = attachedFiles.reduce((sum, file) => sum + file.size, 0);
        
        // Define allowed file types
        const allowedMimeTypes = [
            // Images
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/webp',
            // Text files
            'text/plain',
            'text/markdown',
            'text/html',
            'text/css',
            'text/javascript',
            'text/yaml',
            'text/xml',
            'text/csv',
            'text/tab-separated-values',
            'text/x-python',
            'text/x-shellscript',
            'text/x-c',
            'text/x-c++',
            'text/x-java-source',
            // Documents
            'application/pdf',
            'application/json',
            'application/xml',
            'application/rtf'
        ];
        
        const allowedExtensions = [
            '.png', '.jpg', '.jpeg', '.webp',
            '.txt', '.md', '.html', '.css', '.js', '.yaml', '.yml', '.xml', '.csv', '.tsv',
            '.py', '.sh', '.c', '.cpp', '.java', '.pdf', '.json', '.rtf'
        ];
        
        for (const file of files) {
            // Check file count limit
            if (attachedFiles.length + validFiles.length >= MAX_FILES) {
                showPopupNotification(`Maximum ${MAX_FILES} files allowed. Skipping additional files.`, 'error');
                break;
            }
            
            // Check file type - STRICT VALIDATION
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            const isValidMimeType = allowedMimeTypes.includes(file.type);
            const isValidExtension = allowedExtensions.includes(fileExtension);
            
            // STRICT: File must have BOTH valid extension AND valid MIME type
            // OR have a valid extension for files with empty/unknown MIME types
            const isFileTypeAllowed = (isValidExtension && (isValidMimeType || file.type === '' || file.type === 'application/octet-stream'));
            
            // Additional check: reject common unauthorized file types explicitly
            const unauthorizedExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.m4v', 
                                          '.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma',
                                          '.exe', '.msi', '.dmg', '.pkg', '.deb', '.rpm',
                                          '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2',
                                          '.vsix', '.crx', '.xpi', '.app', '.ipa', '.apk'];
            
            const unauthorizedMimeTypes = ['video/', 'audio/', 'application/x-executable', 'application/x-msdownload',
                                         'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'];
            
            const hasUnauthorizedExtension = unauthorizedExtensions.includes(fileExtension);
            const hasUnauthorizedMimeType = unauthorizedMimeTypes.some(type => file.type.startsWith(type));
            
            if (!isFileTypeAllowed || hasUnauthorizedExtension || hasUnauthorizedMimeType) {
                console.log(`File rejected: ${file.name}, Extension: ${fileExtension}, MIME: ${file.type}`);
                showPopupNotification(`File type not supported: "${file.name}". Only PNG, JPEG, WebP, text files, PDF, JSON, RTF, and code files are allowed.`, 'error');
                continue;
            }
            
            // Additional validation: check file content signature for images
            if (fileExtension.match(/\.(png|jpg|jpeg|webp)$/)) {
                // For images, we'll do a basic header check later in processing
                console.log(`Image file accepted: ${file.name}`);
            }
            
            // Check total size limit
            if (totalSize + file.size > MAX_TOTAL_SIZE) {
                const remainingSize = MAX_TOTAL_SIZE - totalSize;
                const remainingSizeMB = (remainingSize / (1024 * 1024)).toFixed(1);
                showPopupNotification(`File "${file.name}" exceeds remaining space (${remainingSizeMB}MB available). Skipping.`, 'error');
                continue;
            }
            
            validFiles.push(file);
            totalSize += file.size;
        }
        
        if (validFiles.length === 0) {
            return;
        }
        
        // Process valid files
        for (const file of validFiles) {
            try {
                const fileData = await processFileAsBinary(file);
                attachedFiles.push(fileData);
                addFileToUI(fileData);
            } catch (error) {
                console.error('Error processing file:', error);
                showPopupNotification(`Error processing file "${file.name}": ${error.message}`, 'error');
            }
        }
        
        updateFileAttachmentUI();
    }

    // Process file as binary data
    async function processFileAsBinary(file) {
        return new Promise((resolve, reject) => {
            // Final validation check before processing
            const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.txt', '.md', '.html', '.css', '.js', '.yaml', '.yml', '.xml', '.csv', '.tsv', '.py', '.sh', '.c', '.cpp', '.java', '.pdf', '.json', '.rtf'];
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            
            if (!allowedExtensions.includes(fileExtension)) {
                reject(new Error(`File type not allowed: ${fileExtension}`));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const arrayBuffer = e.target.result;
                const uint8Array = new Uint8Array(arrayBuffer);
                
                // Convert to base64 using a more robust method
                let base64String = '';
                const chunkSize = 8192; // Process in chunks to avoid stack overflow
                
                for (let i = 0; i < uint8Array.length; i += chunkSize) {
                    const chunk = uint8Array.slice(i, i + chunkSize);
                    const binaryString = Array.from(chunk, byte => String.fromCharCode(byte)).join('');
                    base64String += btoa(binaryString);
                }
                
                // Alternative method using FileReader for base64 (more reliable)
                const base64Reader = new FileReader();
                base64Reader.onload = function() {
                    // Remove the data URL prefix (data:mime/type;base64,)
                    const base64Data = base64Reader.result.split(',')[1];
                    
                    console.log(`Processed file: ${file.name}, size: ${file.size} bytes, base64 length: ${base64Data.length}`);
                    
                    resolve({
                        name: file.name,
                        size: file.size,
                        type: file.type || 'application/octet-stream',
                        lastModified: file.lastModified,
                        data: base64Data, // Clean base64 data without prefix
                        id: generateFileId()
                    });
                };
                
                base64Reader.onerror = function() {
                    reject(new Error('Failed to convert file to base64'));
                };
                
                // Use FileReader's built-in base64 conversion
                base64Reader.readAsDataURL(file);
            };
            
            reader.onerror = function() {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsArrayBuffer(file);
        });
    }

    // Generate unique file ID
    function generateFileId() {
        return `file_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    // Add file to UI display
    function addFileToUI(fileData) {
        // Create or get the attached files container
        let attachedFilesContainer = document.querySelector('.attached-files-container');
        if (!attachedFilesContainer) {
            attachedFilesContainer = document.createElement('div');
            attachedFilesContainer.className = 'attached-files-container';
            
            // Insert before the chat input area
            const chatInputArea = document.querySelector('.chat-input-area');
            chatInputArea.parentNode.insertBefore(attachedFilesContainer, chatInputArea);
        }

        // Create file ticket
        const fileTicket = document.createElement('div');
        fileTicket.className = 'file-ticket';
        fileTicket.setAttribute('data-file-id', fileData.id);

        const fileSize = formatFileSize(fileData.size);
        const fileIcon = getFileIcon(fileData.type);

        fileTicket.innerHTML = `
            <div class="file-ticket-content">
                <span class="file-icon">${fileIcon}</span>
                <div class="file-details">
                    <div class="file-name">${fileData.name}</div>
                    <div class="file-size">${fileSize}</div>
                </div>
                <button class="remove-file-btn" title="Remove file">×</button>
            </div>
        `;

        // Add remove functionality
        const removeBtn = fileTicket.querySelector('.remove-file-btn');
        removeBtn.addEventListener('click', () => {
            removeFileFromAttached(fileData.id);
            fileTicket.remove();
            
            // Remove container if no files left
            if (attachedFiles.length === 0) {
                attachedFilesContainer.remove();
            }
            
            updateFileAttachmentUI();
        });

        attachedFilesContainer.appendChild(fileTicket);
    }

    // Update file attachment UI state
    function updateFileAttachmentUI() {
        const totalSize = attachedFiles.reduce((sum, file) => sum + file.size, 0);
        const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(1);
        const fileCount = attachedFiles.length;
        
        // Update attach button appearance
        if (fileCount > 0) {
            attachFileBtn.classList.add('has-files');
            attachFileBtn.title = `${fileCount} file(s) attached (${totalSizeMB}MB)`;
            
            // Add file count indicator
            let indicator = attachFileBtn.querySelector('.file-count-indicator');
            if (!indicator) {
                indicator = document.createElement('span');
                indicator.className = 'file-count-indicator';
                attachFileBtn.appendChild(indicator);
            }
            indicator.textContent = fileCount;
        } else {
            attachFileBtn.classList.remove('has-files');
            attachFileBtn.title = 'Add file';
            const indicator = attachFileBtn.querySelector('.file-count-indicator');
            if (indicator) {
                indicator.remove();
            }
        }
    }

    // Format file size for display
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Get file icon based on type
    function getFileIcon(mimeType) {
        if (mimeType.startsWith('image/')) return '🖼️';
        if (mimeType.startsWith('video/')) return '🎥';
        if (mimeType.startsWith('audio/')) return '🎵';
        if (mimeType.includes('pdf')) return '📄';
        if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
        if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈';
        if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return '📦';
        if (mimeType.includes('text/')) return '📃';
        return '📁';
    }

    // Remove specific file from attached files
    function removeFileFromAttached(fileId) {
        const index = attachedFiles.findIndex(file => file.id === fileId);
        if (index !== -1) {
            attachedFiles.splice(index, 1);
            console.log(`Removed file with ID: ${fileId}`);
        }
    }

    // Clear all attached files
    function clearAttachedFiles() {
        attachedFiles = [];
        updateFileAttachmentUI();
        
        // Remove the attached files container from UI
        const attachedFilesContainer = document.querySelector('.attached-files-container');
        if (attachedFilesContainer) {
            attachedFilesContainer.remove();
        }
    }

    // Add clear files button functionality (will be added to UI)
    function addClearFilesButton() {
        if (attachedFiles.length === 0) return;
        
        const clearBtn = document.createElement('button');
        clearBtn.className = 'clear-files-btn';
        clearBtn.innerHTML = '🗑️ Clear Files';
        clearBtn.title = 'Clear all attached files';
        clearBtn.addEventListener('click', () => {
            clearAttachedFiles();
            addMessageToChat('📎 All attached files cleared', 'assistant');
            clearBtn.remove();
        });
        
        const chatInputArea = document.querySelector('.chat-input-area');
        chatInputArea.insertBefore(clearBtn, attachFileBtn);
    }

    // Voice Recognition Setup
    let recognition = null;
    let isRecording = false;
    let currentLanguage = 'en-US'; // Default language

    // Language detection and preference
    function detectUserLanguage() {
        // Check browser language
        const browserLang = navigator.language || navigator.userLanguage;
        
        // Check if French is preferred
        if (browserLang.startsWith('fr')) {
            return 'fr-FR';
        }
        
        // Default to English
        return 'en-US';
    }

    // Load language preference from storage
    async function loadLanguagePreference() {
        try {
            const result = await chrome.storage.sync.get(['voiceLanguage']);
            if (result.voiceLanguage && result.voiceLanguage !== 'auto') {
                currentLanguage = result.voiceLanguage;
            } else {
                // Auto-detect based on browser language
                currentLanguage = detectUserLanguage();
            }
        } catch (error) {
            console.log('Using default language detection');
            currentLanguage = detectUserLanguage();
        }
    }

    // Check if speech recognition is supported
    let processingTimeout; // Declare timeout variable at the top level
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = true;
        
        // Load language preference
        loadLanguagePreference().then(() => {
            recognition.lang = currentLanguage;
            updateVoiceButtonTooltip();
        });
        
        // Listen for storage changes to update language when changed in options
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && changes.voiceLanguage) {
            loadLanguagePreference();
            if (recognition) {
                recognition.lang = currentLanguage;
            }
        }
    });
        
        recognition.onstart = () => {
            isRecording = true;
            voiceBtn.classList.add('recording');
            const langDisplay = currentLanguage === 'fr-FR' ? 'FR' : 'EN';
            showVoiceStatus(`🎤 Listening... (${langDisplay})`);
            console.log('Voice recognition started');
        };
        
        recognition.onresult = (event) => {
            // Clear processing timeout since we got a result
            if (processingTimeout) {
                clearTimeout(processingTimeout);
                processingTimeout = null;
            }
            
            let transcript = '';
            let isFinal = false;
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    isFinal = true;
                }
            }
            
            if (isFinal) {
                // Final result - add to chat input
                const currentText = chatInput.value;
                chatInput.value = currentText + (currentText ? ' ' : '') + transcript;
                const successMessage = currentLanguage === 'fr-FR' ? '✓ Entrée vocale ajoutée' : '✓ Voice input added';
                showVoiceStatus(successMessage);
                setTimeout(hideVoiceStatus, 2000);
                chatInput.focus();
            } else {
                // Interim result - show in status
                showVoiceStatus(`🎤 "${transcript}"`);
            }
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            // Clear processing timeout since we got an error
            if (processingTimeout) {
                clearTimeout(processingTimeout);
                processingTimeout = null;
            }
            isRecording = false;
            voiceBtn.classList.remove('recording', 'processing');
            
            let errorMessage = 'Voice input error';
            if (currentLanguage === 'fr-FR') {
                switch (event.error) {
                    case 'no-speech':
                        errorMessage = 'Aucune parole détectée';
                        break;
                    case 'audio-capture':
                        errorMessage = 'Microphone non disponible';
                        break;
                    case 'not-allowed':
                        errorMessage = 'Permission microphone refusée';
                        break;
                    case 'network':
                        errorMessage = 'Erreur réseau';
                        break;
                    default:
                        errorMessage = `Erreur vocale: ${event.error}`;
                }
            } else {
                switch (event.error) {
                    case 'no-speech':
                        errorMessage = 'No speech detected';
                        break;
                    case 'audio-capture':
                        errorMessage = 'Microphone not available';
                        break;
                    case 'not-allowed':
                        errorMessage = 'Microphone permission denied';
                        break;
                    case 'network':
                        errorMessage = 'Network error';
                        break;
                    default:
                        errorMessage = `Voice error: ${event.error}`;
                }
            }
            
            showVoiceStatus(`❌ ${errorMessage}`);
            setTimeout(hideVoiceStatus, 3000);
        };
        
        recognition.onend = () => {
            isRecording = false;
            // Don't clear processing timeout here - let it handle the cleanup
            // Only remove recording class, keep processing class for timeout to handle
            voiceBtn.classList.remove('recording');
            if (voiceStatus.textContent.includes('Listening')) {
                hideVoiceStatus();
            }
        };
    }

    // Update voice button tooltip
    function updateVoiceButtonTooltip() {
        const langDisplay = currentLanguage === 'fr-FR' ? 'FR' : 'EN';
        const tooltip = currentLanguage === 'fr-FR' 
            ? `Entrée vocale (${langDisplay})`
            : `Voice input (${langDisplay})`;
        voiceBtn.title = tooltip;
    }



    // Voice button click handler
    voiceBtn.addEventListener('click', (event) => {
        if (!recognition) {
            const errorMsg = currentLanguage === 'fr-FR' ? '❌ Reconnaissance vocale non supportée' : '❌ Speech recognition not supported';
            showVoiceStatus(errorMsg);
            setTimeout(hideVoiceStatus, 3000);
            return;
        }
        
        if (isRecording) {
            recognition.stop();
            const processingMsg = currentLanguage === 'fr-FR' ? '🔄 Traitement...' : '🔄 Processing...';
            showVoiceStatus(processingMsg);
            voiceBtn.classList.remove('recording');
            voiceBtn.classList.add('processing');
            
            // Set timeout to clear processing state if no result comes
            processingTimeout = setTimeout(() => {
                if (voiceBtn.classList.contains('processing')) {
                    voiceBtn.classList.remove('processing');
                    hideVoiceStatus(); // Just hide status without showing message
                }
                processingTimeout = null; // Clear the timeout reference
            }, 10000); // 10 second timeout
        } else {
            try {
                // Ensure language is set before starting
                recognition.lang = currentLanguage;
                recognition.start();
            } catch (error) {
                console.error('Error starting recognition:', error);
                const startErrorMsg = currentLanguage === 'fr-FR' 
                    ? '❌ Impossible de démarrer l\'entrée vocale'
                    : '❌ Could not start voice input';
                showVoiceStatus(startErrorMsg);
                setTimeout(hideVoiceStatus, 3000);
            }
        }
    });

    function showVoiceStatus(message) {
        voiceStatus.textContent = message;
        voiceStatus.style.display = 'block';
    }

    function hideVoiceStatus() {
        voiceStatus.style.display = 'none';
    }

    function calculateMaxWebhookNameLength() {
        const chatInputArea = document.querySelector('.chat-input-area');
        const webhookIndicator = document.getElementById('webhook-indicator');
        
        if (!chatInputArea || !webhookIndicator) {
            return 8; // Conservative fallback for narrow panels
        }
        
        // Get the container width
        const containerWidth = chatInputArea.offsetWidth;
        
        // More aggressive space calculation for narrow panels
        // Account for: attach button (~40px), input margins (~16px), voice button (~40px), send button (~40px), 
        // webhook indicator padding/margins (~30px), safety margin (~20px)
        const reservedSpace = 146;
        const availableSpace = containerWidth - reservedSpace;
        
        // More conservative character width estimation for better button visibility
        const charWidth = 7;
        const maxChars = Math.floor(availableSpace / charWidth);
        
        // More aggressive bounds for narrow panels: minimum 5 characters, maximum 35 characters
        // This ensures buttons remain visible even in very narrow panels
        if (containerWidth < 300) {
            return Math.max(5, Math.min(8, maxChars)); // Very narrow: 5-8 chars
        } else if (containerWidth < 400) {
            return Math.max(6, Math.min(12, maxChars)); // Narrow: 6-12 chars
        } else if (containerWidth < 500) {
            return Math.max(8, Math.min(18, maxChars)); // Medium: 8-18 chars
        } else {
            return Math.max(10, Math.min(35, maxChars)); // Wide: 10-35 chars
        }
    }

    function updateWebhookIndicator() {
        if (currentWebhookName && currentWebhookName !== 'Default') {
            // Calculate dynamic max length based on available space
            const maxLength = calculateMaxWebhookNameLength();
            const displayName = currentWebhookName.length > maxLength ? 
                currentWebhookName.substring(0, maxLength) + '...' : 
                currentWebhookName;
            webhookIndicator.textContent = displayName;
            webhookIndicator.style.display = 'inline-block';
        } else {
            webhookIndicator.style.display = 'none';
        }
    }

    function showSlashCommands(query) {
        slashCommandPopup.innerHTML = '';
        let webhooksToShow = [];

        if (query === '') { // Show all webhooks if query is empty (i.e., just '/')
            webhooksToShow = Object.keys(webhooks);
        } else {
            webhooksToShow = Object.keys(webhooks).filter(name => 
                name.toLowerCase().startsWith(query.toLowerCase())
            );
        }

        if (webhooksToShow.length > 0) {
            webhooksToShow.forEach(name => {
                const div = document.createElement('div');
                div.textContent = name;
                div.onclick = () => {
                    currentWebhookUrl = webhooks[name];
                    currentWebhookName = name;
                    chatInput.value = ''; // Clear the slash command
                    slashCommandPopup.style.display = 'none';
                    updateWebhookIndicator();
                };
                slashCommandPopup.appendChild(div);
            });
            slashCommandPopup.style.display = 'block';
        } else {
            slashCommandPopup.style.display = 'none';
        }
    }

    chatInput.addEventListener('input', () => {
        const text = chatInput.value;
        if (text === '/') {
            showSlashCommands(''); // Show all webhooks
        } else if (text.startsWith('/')) {
            const query = text.substring(1);
            showSlashCommands(query);
        } else {
            slashCommandPopup.style.display = 'none';
        }
    });

    // Load initial settings and chat history
    function loadSettingsAndHistory() {
        // First, load chat history for the current session
        const historyKey = `chatHistory_${sessionId}`;
        console.log('Loading chat history for session:', sessionId);
        chrome.storage.local.get([historyKey], (result) => {
            const history = result[historyKey] || [];
            console.log('Retrieved history:', history);
            
            // Check if we have a valid history array
            if (Array.isArray(history) && history.length > 0) {
                console.log('Valid history found with', history.length, 'messages');
                chatArea.innerHTML = ''; // Clear any default messages
                
                // Display each message from history
                history.forEach((msg, index) => {
                    console.log(`Displaying message ${index + 1}/${history.length}:`, msg);
                    if (msg && msg.text && msg.sender) {
                        displayMessageOnUI(msg.text, msg.sender, msg.avatarSrc, true);
                    } else {
                        console.error('Invalid message in history:', msg);
                    }
                });
                
                removeWelcomeMessage(); // Remove welcome message if history is loaded
                console.log('Chat history loaded successfully with', history.length, 'messages');
            } else {
                // No history, or history is empty, ensure welcome message is displayed if chat area is empty
                displayWelcomeMessage();
                console.log('No chat history found for this session or invalid history format');
            }
            
            // After loading history (or not), load other settings
            loadWebhookAndThemeSettings();
        });
    }


    
    // Load webhook, theme, font, and text size settings
    function loadWebhookAndThemeSettings() {
        chrome.storage.sync.get(['webhooks', 'defaultWebhookName', 'designStyle', 'theme', 'textSize', 'fontFamily', 'animatedBackground'], (result) => {
            console.log('Settings loaded:', result);
            
            if (result.webhooks) {
                Object.assign(webhooks, result.webhooks);
            }
            if (result.defaultWebhookName && webhooks[result.defaultWebhookName]) {
                defaultWebhookName = result.defaultWebhookName;
                currentWebhookUrl = webhooks[defaultWebhookName];
                currentWebhookName = defaultWebhookName;
            } else if (Object.keys(webhooks).length > 0) {
                // Fallback to the first webhook if default is not set or invalid
                const firstWebhookName = Object.keys(webhooks)[0];
                defaultWebhookName = firstWebhookName;
                currentWebhookUrl = webhooks[firstWebhookName];
                currentWebhookName = firstWebhookName;
                // Optionally save this fallback as the new default
                chrome.storage.sync.set({ defaultWebhookName: firstWebhookName });
            }

            if (!currentWebhookUrl && Object.keys(webhooks).length > 0) {
                 // If no default, but webhooks exist, pick the first one
                const firstKey = Object.keys(webhooks)[0];
                currentWebhookUrl = webhooks[firstKey];
                currentWebhookName = firstKey;
                defaultWebhookName = firstKey; // Set as default
            } else if (Object.keys(webhooks).length === 0) {
                console.warn('No webhooks configured.');
                // Potentially guide user to settings
            }
            
            // Apply design style settings first
            document.body.classList.remove('complete-minimalist');
            if (result.designStyle === 'complete-minimalist') {
                document.body.classList.add('complete-minimalist');
            }
            
            // Apply theme settings
            document.body.classList.remove('light-theme', 'glass-theme');
            if (result.theme === 'light') {
                document.body.classList.add('light-theme');
            } else if (result.theme === 'glass') {
                document.body.classList.add('glass-theme');
            }
            
            // Apply text size settings
            document.body.classList.remove('text-small', 'text-medium', 'text-large');
            if (result.textSize) {
                document.body.classList.add(`text-${result.textSize}`);
            } else {
                document.body.classList.add('text-medium'); // Default to medium if not set
            }
            
            // Apply font family settings
            document.body.classList.remove('font-system', 'font-inter', 'font-roboto', 'font-poppins', 'font-source-sans', 'font-open-sans', 'font-lato', 'font-nunito');
            if (result.fontFamily) {
                document.body.classList.add(`font-${result.fontFamily}`);
            } else {
                document.body.classList.add('font-system'); // Default to system if not set
            }

            // Apply background animation if enabled and glass theme is active (but not in complete minimalist mode)
            if (result.theme === 'glass' && result.animatedBackground && result.designStyle !== 'complete-minimalist') {
                document.body.classList.add('animated-bg');
            }
            
            updateWebhookIndicator();
            
            // Show the UI after theme is loaded to prevent flash
            document.body.style.visibility = 'visible';
            
            // Welcome message is now handled by loadSettingsAndHistory based on history presence
        });
    }

    // Ensure the initial welcome message is handled correctly after history load attempt
    // displayWelcomeMessage(); // This is now called within loadSettingsAndHistory

    // displayWelcomeMessage(); // Moved to the end of loadSettings to ensure it runs after everything is set up.

    // Add resize listener to update webhook indicator when panel size changes
    window.addEventListener('resize', () => {
        // Debounce the resize event to avoid excessive updates
        clearTimeout(window.resizeTimeout);
        window.resizeTimeout = setTimeout(() => {
            updateWebhookIndicator();
        }, 50); // Reduced debounce time for more responsive updates
    });

    // Use ResizeObserver for more reliable detection of panel size changes
    // This is especially important for Chrome extension side panels
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver((entries) => {
            // Debounce the observer callback
            clearTimeout(window.observerTimeout);
            window.observerTimeout = setTimeout(() => {
                updateWebhookIndicator();
            }, 30); // Even faster response for ResizeObserver
        });
        
        // Observe the chat input area for size changes
        const chatInputArea = document.querySelector('.chat-input-area');
        if (chatInputArea) {
            resizeObserver.observe(chatInputArea);
        }
        
        // Also observe the body for overall panel changes
        resizeObserver.observe(document.body);
    }

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('Message received in popup:', request);
        
        if (request.action === 'addSelectedText') {
            // This is now handled by pendingText mechanism only
            // No need to add text here as it's already in storage
            sendResponse({status: 'Text will be added via pendingText'});
        }
        
        return true;
    });

    // Check for pending text on load (in case side panel was opened with text)
    chrome.storage.local.get(['pendingText'], (result) => {
        if (result.pendingText) {
            chatInput.value = result.pendingText;
            chatInput.focus();
            chatInput.setSelectionRange(chatInput.value.length, chatInput.value.length);
            
            // Auto-resize the textarea if needed
            chatInput.style.height = 'auto';
            chatInput.style.height = chatInput.scrollHeight + 'px';
            
            // Clear the pending text
            chrome.storage.local.remove(['pendingText']);
        }
    });
});
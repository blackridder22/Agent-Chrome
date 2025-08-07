document.addEventListener('DOMContentLoaded', () => {
    const webhookList = document.getElementById('webhook-list');
    const webhookNameInput = document.getElementById('webhook-name');
    const webhookUrlInput = document.getElementById('webhook-url');
    const addWebhookBtn = document.getElementById('add-webhook-btn');
    const designStyleSelect = document.getElementById('design-style-select');
    const themeSelect = document.getElementById('theme-select');
    const textSizeSelect = document.getElementById('text-size-select');
    const fontSelect = document.getElementById('font-select');
    const voiceLanguageSelect = document.getElementById('voice-language-select');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const statusMessage = document.getElementById('status-message');
    const bgAnimationSelect = document.getElementById('bg-animation-select');

    let webhooks = {};
    let defaultWebhookName = '';

    // Load settings from storage
    loadSettings();
    
    // Add event listener for design style toggle
    designStyleSelect.addEventListener('change', () => {
        const selectedDesign = designStyleSelect.value;
        document.body.classList.remove('modern-design', 'complete-minimalist');
        if (selectedDesign === 'modern') {
            document.body.classList.add('modern-design');
        } else if (selectedDesign === 'minimalist') {
            document.body.classList.add('complete-minimalist');
        }
    });
    
    // Add event listeners for immediate theme, font, and text size preview
    themeSelect.addEventListener('change', () => {
        const selectedTheme = themeSelect.value;
        document.body.classList.remove('light-theme', 'glass-theme');
        if (selectedTheme === 'light') {
            document.body.classList.add('light-theme');
        } else if (selectedTheme === 'glass') {
            document.body.classList.add('glass-theme');
        }
        
        // Show/hide background animation section based on theme
        const bgAnimationSection = document.getElementById('background-animation-section');
        if (selectedTheme === 'glass') {
            bgAnimationSection.style.display = 'block';
        } else {
            bgAnimationSection.style.display = 'none';
        }
    });
    
    textSizeSelect.addEventListener('change', () => {
        const selectedSize = textSizeSelect.value;
        document.body.classList.remove('text-small', 'text-medium', 'text-large');
        document.body.classList.add(`text-${selectedSize}`);
    });
    
    fontSelect.addEventListener('change', () => {
        const selectedFont = fontSelect.value;
        document.body.classList.remove('font-system', 'font-inter', 'font-roboto', 'font-poppins', 'font-source-sans', 'font-open-sans', 'font-lato', 'font-nunito');
        document.body.classList.add(`font-${selectedFont}`);
    });
    
    bgAnimationSelect.addEventListener('change', () => {
        if (bgAnimationSelect.value === 'on') {
            document.body.classList.add('animated-bg');
        } else {
            document.body.classList.remove('animated-bg');
        }
    });

    function displayStatus(message, isError = false) {
        statusMessage.textContent = message;
        statusMessage.style.color = isError ? '#e74c3c' : '#2ecc71';
        setTimeout(() => {
            statusMessage.textContent = '';
        }, 3000);
    }

    function renderWebhookList() {
        webhookList.innerHTML = ''; // Clear existing list
        if (Object.keys(webhooks).length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No webhooks configured yet.';
            li.style.textAlign = 'center';
            li.style.color = '#999';
            webhookList.appendChild(li);
            return;
        }

        for (const name in webhooks) {
            const url = webhooks[name];
            const li = document.createElement('li');

            const infoDiv = document.createElement('div');
            infoDiv.className = 'webhook-info';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'webhook-name';
            nameSpan.textContent = name;
            infoDiv.appendChild(nameSpan);

            if (name === defaultWebhookName) {
                const defaultSpan = document.createElement('span');
                defaultSpan.className = 'default-indicator';
                defaultSpan.textContent = '(Default)';
                infoDiv.appendChild(defaultSpan);
            }

            const urlSpan = document.createElement('span');
            urlSpan.className = 'webhook-url-display';
            urlSpan.textContent = url;
            infoDiv.appendChild(urlSpan);
            
            li.appendChild(infoDiv);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'webhook-actions';

            if (name !== defaultWebhookName) {
                const setDefaultBtn = document.createElement('button');
                setDefaultBtn.textContent = 'Set Default';
                setDefaultBtn.className = 'set-default-btn';
                setDefaultBtn.addEventListener('click', () => {
                    defaultWebhookName = name;
                    renderWebhookList(); // Re-render to show new default immediately
                    // Save will happen with main save button
                });
                actionsDiv.appendChild(setDefaultBtn);
            }

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete-btn';
            deleteBtn.addEventListener('click', () => {
                delete webhooks[name];
                if (name === defaultWebhookName) {
                    defaultWebhookName = Object.keys(webhooks)[0] || ''; // Set new default if old one deleted
                }
                renderWebhookList();
                // Save will happen with main save button
            });
            actionsDiv.appendChild(deleteBtn);
            li.appendChild(actionsDiv);
            webhookList.appendChild(li);
        }
    }

    addWebhookBtn.addEventListener('click', () => {
        const name = webhookNameInput.value.trim();
        const url = webhookUrlInput.value.trim();

        if (!name || !url) {
            displayStatus('Webhook name and URL cannot be empty.', true);
            return;
        }
        if (!isValidHttpUrl(url)) {
            displayStatus('Please enter a valid URL (starting with http:// or https://).', true);
            return;
        }
        if (webhooks[name]) {
            displayStatus(`Webhook with name "${name}" already exists.`, true);
            return;
        }

        webhooks[name] = url;
        if (Object.keys(webhooks).length === 1 && !defaultWebhookName) {
            // If it's the first webhook, make it default
            defaultWebhookName = name;
        }
        renderWebhookList();
        webhookNameInput.value = '';
        webhookUrlInput.value = '';
        displayStatus(`Webhook "${name}" added. Remember to save settings.`, false);
    });

    function isValidHttpUrl(string) {
        let url;
        try {
            url = new URL(string);
        } catch (_) {
            return false;  
        }
        return url.protocol === "http:" || url.protocol === "https:";
    }

    saveSettingsBtn.addEventListener('click', () => {
        const selectedDesignStyle = designStyleSelect.value;
        const selectedTheme = themeSelect.value;
        const selectedTextSize = document.getElementById('text-size-select').value;
        const selectedFont = fontSelect.value;
        const selectedVoiceLanguage = voiceLanguageSelect.value;
        const animatedBackground = bgAnimationSelect.value === 'on';
        browser.storage.sync.set({
            webhooks: webhooks,
            defaultWebhookName: defaultWebhookName,
            designStyle: selectedDesignStyle,
            theme: selectedTheme,
            textSize: selectedTextSize,
            fontFamily: selectedFont,
            voiceLanguage: selectedVoiceLanguage,
            animatedBackground: animatedBackground
        }).then(() => {
            displayStatus('Settings saved successfully!', false);
            console.log('Settings saved:', { webhooks, defaultWebhookName, designStyle: selectedDesignStyle, theme: selectedTheme, textSize: selectedTextSize, fontFamily: selectedFont, voiceLanguage: selectedVoiceLanguage });
        });
    });

    function loadSettings() {
        browser.storage.sync.get(['webhooks', 'defaultWebhookName', 'designStyle', 'theme', 'textSize', 'fontFamily', 'voiceLanguage', 'animatedBackground']).then((result) => {
            if (result.webhooks) {
                webhooks = result.webhooks;
            }
            if (result.defaultWebhookName) {
                defaultWebhookName = result.defaultWebhookName;
            }
            
            // Design style handling
            document.body.classList.remove('modern-design', 'complete-minimalist');
            if (result.designStyle) {
                designStyleSelect.value = result.designStyle;
                if (result.designStyle === 'modern') {
                    document.body.classList.add('modern-design');
                } else if (result.designStyle === 'minimalist') {
                    document.body.classList.add('complete-minimalist');
                }
            } else {
                designStyleSelect.value = 'minimalist'; // Default to minimalist if not set
                document.body.classList.add('complete-minimalist');
            }
            
            // Theme handling
            document.body.classList.remove('light-theme', 'glass-theme');
            if (result.theme) {
                themeSelect.value = result.theme;
                if (result.theme === 'light') {
                    document.body.classList.add('light-theme');
                } else if (result.theme === 'glass') {
                    document.body.classList.add('glass-theme');
                }
            } else {
                themeSelect.value = 'dark'; // Default to dark if not set
            }
            
            // Text size handling
            const textSizeSelect = document.getElementById('text-size-select');
            document.body.classList.remove('text-small', 'text-medium', 'text-large');
            if (result.textSize) {
                textSizeSelect.value = result.textSize;
                document.body.classList.add(`text-${result.textSize}`);
            } else {
                textSizeSelect.value = 'medium'; // Default to medium if not set
                document.body.classList.add('text-medium');
            }
            
            // Font handling
            document.body.classList.remove('font-system', 'font-inter', 'font-roboto', 'font-poppins', 'font-source-sans', 'font-open-sans', 'font-lato', 'font-nunito');
            if (result.fontFamily) {
                fontSelect.value = result.fontFamily;
                document.body.classList.add(`font-${result.fontFamily}`);
            } else {
                fontSelect.value = 'system'; // Default to system if not set
                document.body.classList.add('font-system');
            }
            
            // Voice language handling
            if (result.voiceLanguage) {
                voiceLanguageSelect.value = result.voiceLanguage;
            } else {
                voiceLanguageSelect.value = 'auto'; // Default to auto-detect if not set
            }
            
            // Background animation handling
            const bgAnimationSection = document.getElementById('background-animation-section');
            if (result.animatedBackground !== undefined) {
                bgAnimationSelect.value = result.animatedBackground ? 'on' : 'off';
                if (result.animatedBackground) {
                    document.body.classList.add('animated-bg');
                }
            } else {
                bgAnimationSelect.value = 'off'; // Default to off if not set
            }
            
            // Show/hide background animation section based on current theme
            if (result.theme === 'glass') {
                bgAnimationSection.style.display = 'block';
            } else {
                bgAnimationSection.style.display = 'none';
            }
            
            renderWebhookList();
            console.log('Settings loaded on options page:', result);
        });
    }
});
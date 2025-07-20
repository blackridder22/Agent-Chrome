import React, { useState, useRef, useEffect } from 'react';
import './App.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  avatarSrc?: string;
}

interface ChatSession {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  messages: Message[];
}



function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [webhooks, setWebhooks] = useState<Record<string, string>>({});
  const [currentWebhookName, setCurrentWebhookName] = useState<string>('');
  const [currentWebhookUrl] = useState<string>('');
  const [nextMessageWebhook, setNextMessageWebhook] = useState<string>('');
  const [defaultWebhookName, setDefaultWebhookName] = useState<string>('');
  const [audioTimeout, setAudioTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string>('');
  const [currentLanguage, setCurrentLanguage] = useState<string>('en-US');
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [newWebhookName, setNewWebhookName] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [showWebhookSelector, setShowWebhookSelector] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize first session
  useEffect(() => {
    const initialSession: ChatSession = {
      id: generateId(),
      name: 'New Chat',
      lastMessage: '',
      timestamp: new Date().toISOString(),
      messages: []
    };
    setChatSessions([initialSession]);
    setCurrentSessionId(initialSession.id);
    
    // Load settings from localStorage
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.className = savedTheme === 'light' ? 'light-theme' : '';
    }

    // Load webhooks and settings
    loadSettings();
    
    // Initialize speech recognition
    initializeSpeechRecognition();
  }, []);

  // Load settings from localStorage
  const loadSettings = () => {
    const savedWebhooks = localStorage.getItem('webhooks');
    const savedDefaultWebhook = localStorage.getItem('defaultWebhookName');
    const savedTextSize = localStorage.getItem('textSize') as 'small' | 'medium' | 'large';
    const savedLanguage = localStorage.getItem('voiceLanguage');
    
    if (savedWebhooks) {
      const parsedWebhooks = JSON.parse(savedWebhooks);
      setWebhooks(parsedWebhooks);
      
      if (savedDefaultWebhook && parsedWebhooks[savedDefaultWebhook]) {
        setDefaultWebhookName(savedDefaultWebhook);
        setCurrentWebhookName(savedDefaultWebhook);
        setNextMessageWebhook(savedDefaultWebhook);
      } else if (Object.keys(parsedWebhooks).length > 0) {
        const firstWebhook = Object.keys(parsedWebhooks)[0];
        setDefaultWebhookName(firstWebhook);
        setCurrentWebhookName(firstWebhook);
        setNextMessageWebhook(firstWebhook);
      }
    }
    
    if (savedTextSize) {
      setTextSize(savedTextSize);
      document.body.className = `${theme === 'light' ? 'light-theme' : ''} text-${savedTextSize}`;
    }
    
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  };

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentLanguage;
      
      recognition.onstart = () => {
        setIsRecording(true);
        const langDisplay = currentLanguage === 'fr-FR' ? 'FR' : 'EN';
        setVoiceStatus(`🎤 Listening... (${langDisplay})`);
        
        // Set 3-second timeout to cancel audio processing
        const timeout = setTimeout(() => {
          if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
            setIsProcessing(false);
            const timeoutMsg = currentLanguage === 'fr-FR' ? '⏱️ Délai d\'attente dépassé' : '⏱️ Audio timeout';
            setVoiceStatus(timeoutMsg);
            setTimeout(() => setVoiceStatus(''), 2000);
          }
        }, 3000);
        setAudioTimeout(timeout);
      };
      
      recognition.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }
        
        if (isFinal) {
          // Clear the timeout since we got a successful result
          if (audioTimeout) {
            clearTimeout(audioTimeout);
            setAudioTimeout(null);
          }
          setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
          const successMessage = currentLanguage === 'fr-FR' ? '✓ Entrée vocale ajoutée' : '✓ Voice input added';
          setVoiceStatus(successMessage);
          setTimeout(() => setVoiceStatus(''), 2000);
          inputRef.current?.focus();
        } else {
          setVoiceStatus(`🎤 "${transcript}"`);
        }
      };
      
      recognition.onerror = (event: any) => {
        setIsRecording(false);
        setIsProcessing(false);
        // Clear the timeout when an error occurs
        if (audioTimeout) {
          clearTimeout(audioTimeout);
          setAudioTimeout(null);
        }
        
        let errorMessage = 'Voice input error';
        if (currentLanguage === 'fr-FR') {
          switch (event.error) {
            case 'no-speech': errorMessage = 'Aucune parole détectée'; break;
            case 'audio-capture': errorMessage = 'Microphone non disponible'; break;
            case 'not-allowed': errorMessage = 'Permission microphone refusée'; break;
            case 'network': errorMessage = 'Erreur réseau'; break;
            default: errorMessage = `Erreur vocale: ${event.error}`;
          }
        } else {
          switch (event.error) {
            case 'no-speech': errorMessage = 'No speech detected'; break;
            case 'audio-capture': errorMessage = 'Microphone not available'; break;
            case 'not-allowed': errorMessage = 'Microphone permission denied'; break;
            case 'network': errorMessage = 'Network error'; break;
            default: errorMessage = `Voice error: ${event.error}`;
          }
        }
        
        setVoiceStatus(`❌ ${errorMessage}`);
        setTimeout(() => setVoiceStatus(''), 3000);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
        // Clear the timeout when recognition ends
        if (audioTimeout) {
          clearTimeout(audioTimeout);
          setAudioTimeout(null);
        }
        if (voiceStatus.includes('Listening')) {
          setVoiceStatus('');
        }
      };
      
      recognitionRef.current = recognition;
    }
  };

  // Load current session messages
  useEffect(() => {
    const currentSession = chatSessions.find(session => session.id === currentSessionId);
    if (currentSession) {
      setMessages(currentSession.messages);
    }
  }, [currentSessionId, chatSessions]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Apply theme
  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-theme' : '';
  }, [theme]);

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    // Determine which webhook to use for this message
    let webhookUrl = '';
    if (!nextMessageWebhook || nextMessageWebhook === '') {
      webhookUrl = currentWebhookUrl;
    } else {
      webhookUrl = webhooks[nextMessageWebhook] || '';
    }

    if (!webhookUrl) {
      const errorMessage: Message = {
        id: generateId(),
        text: 'Error: No webhook URL configured. Please set one in settings.',
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        avatarSrc: '/icons/assistant-avatar.svg'
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString(),
      avatarSrc: '/icons/user-avatar.svg'
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    // Update current session
    const updatedSessions = chatSessions.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: newMessages,
          name: session.messages.length === 0 ? userMessage.text.slice(0, 50) : session.name,
          lastMessage: userMessage.text,
          timestamp: userMessage.timestamp
        };
      }
      return session;
    });
    setChatSessions(updatedSessions);
    localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          chatInput: userMessage.text
        })
      });

      // Reset webhook selector to default webhook after sending
    setNextMessageWebhook(defaultWebhookName || Object.keys(webhooks)[0] || '');

      setIsTyping(false);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
      }

      const responseData = await response.json();
      let assistantText = 'Received an empty or invalid response from the webhook.';
      
      if (responseData && responseData.length > 0 && responseData[0].output) {
        assistantText = responseData[0].output;
      }

      const assistantMessage: Message = {
        id: generateId(),
        text: assistantText,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        avatarSrc: '/icons/assistant-avatar.svg'
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      // Update session with assistant response
      setChatSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: finalMessages,
            lastMessage: assistantMessage.text,
            timestamp: assistantMessage.timestamp
          };
        }
        return session;
      }));
      localStorage.setItem('chatSessions', JSON.stringify(chatSessions));

    } catch (error: any) {
      setIsTyping(false);
      const errorMessage: Message = {
        id: generateId(),
        text: `Error: Could not connect to the webhook or process the response. Details: ${error.message}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        avatarSrc: '/icons/assistant-avatar.svg'
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // Voice button handler
  const handleVoiceClick = () => {
    if (!recognitionRef.current) {
      const errorMsg = currentLanguage === 'fr-FR' ? '❌ Reconnaissance vocale non supportée' : '❌ Speech recognition not supported';
      setVoiceStatus(errorMsg);
      setTimeout(() => setVoiceStatus(''), 3000);
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      // Clear the timeout when manually stopping
      if (audioTimeout) {
        clearTimeout(audioTimeout);
        setAudioTimeout(null);
      }
      const processingMsg = currentLanguage === 'fr-FR' ? '🔄 Traitement...' : '🔄 Processing...';
      setVoiceStatus(processingMsg);
      setIsProcessing(true);
      
      setTimeout(() => {
        if (isProcessing) {
          setIsProcessing(false);
          setVoiceStatus('');
        }
      }, 10000);
    } else {
      try {
        recognitionRef.current.lang = currentLanguage;
        recognitionRef.current.start();
      } catch (error) {
        const startErrorMsg = currentLanguage === 'fr-FR' 
          ? '❌ Impossible de démarrer l\'entrée vocale'
          : '❌ Could not start voice input';
        setVoiceStatus(startErrorMsg);
        setTimeout(() => setVoiceStatus(''), 3000);
      }
    }
  };

  // Webhook management functions
  const addWebhook = () => {
    if (!newWebhookName.trim() || !newWebhookUrl.trim()) return;
    
    const updatedWebhooks = { ...webhooks, [newWebhookName]: newWebhookUrl };
    setWebhooks(updatedWebhooks);
    localStorage.setItem('webhooks', JSON.stringify(updatedWebhooks));
    
    // Set as default if it's the first webhook
    if (Object.keys(webhooks).length === 0) {
      setDefaultWebhookName(newWebhookName);
      setCurrentWebhookName(newWebhookName);
      localStorage.setItem('defaultWebhookName', newWebhookName);
    }
    
    setNewWebhookName('');
    setNewWebhookUrl('');
  };

  const removeWebhook = (name: string) => {
    const updatedWebhooks = { ...webhooks };
    delete updatedWebhooks[name];
    setWebhooks(updatedWebhooks);
    localStorage.setItem('webhooks', JSON.stringify(updatedWebhooks));
    
    // If removing current webhook, switch to another one
    if (name === currentWebhookName) {
      const remainingWebhooks = Object.keys(updatedWebhooks);
      if (remainingWebhooks.length > 0) {
        const newDefault = remainingWebhooks[0];
        setCurrentWebhookName(newDefault);
        setDefaultWebhookName(newDefault);
        localStorage.setItem('defaultWebhookName', newDefault);
      } else {
        setCurrentWebhookName('');
      setDefaultWebhookName('');
      setNextMessageWebhook('');
      localStorage.removeItem('defaultWebhookName');
      }
    }
  };

  const setAsDefaultWebhook = (name: string) => {
    setDefaultWebhookName(name);
    setCurrentWebhookName(name);
    localStorage.setItem('defaultWebhookName', name);
  };



  const selectWebhook = (webhookName: string) => {
    setNextMessageWebhook(webhookName);
    setShowWebhookSelector(false);
    // Remove the '/' from input when webhook is selected
    if (inputValue.startsWith('/')) {
      setInputValue('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Show webhook selector when '/' is typed as first character
    if (value === '/') {
      setShowWebhookSelector(true);
    } else if (value === '' || !value.startsWith('/') || value.includes('/ ')) {
      setShowWebhookSelector(false);
    }
  };

  // Close webhook selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showWebhookSelector && !target.closest('.webhook-selector-container')) {
        setShowWebhookSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWebhookSelector]);

  // Cleanup audio timeout on component unmount
  useEffect(() => {
    return () => {
      if (audioTimeout) {
        clearTimeout(audioTimeout);
      }
    };
  }, [audioTimeout]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: generateId(),
      name: 'New Chat',
      lastMessage: '',
      timestamp: new Date().toISOString(),
      messages: []
    };
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setShowHistory(false);
  };

  const switchToSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setShowHistory(false);
  };

  const deleteSession = (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this chat session?')) {
      const updatedSessions = chatSessions.filter(session => session.id !== sessionId);
      setChatSessions(updatedSessions);
      
      if (sessionId === currentSessionId) {
        if (updatedSessions.length > 0) {
          setCurrentSessionId(updatedSessions[0].id);
        } else {
          createNewChat();
        }
      }
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="chat-header">
        <button className="icon-btn" onClick={() => setShowHistory(true)}>
          <img src="/icons/history-icon.svg" alt="History" />
        </button>
        <img src="/AgentUIlogo.svg" alt="Agent UI" className="header-logo" />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button id="new-chat-btn" onClick={createNewChat}>
            New Chat
          </button>
          <button className="icon-btn" onClick={() => setShowSettings(true)}>
            <img src="/icons/settings-icon.svg" alt="Settings" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area" ref={chatAreaRef}>
        {messages.length === 0 && (
          <div className="welcome-message">
            Welcome! Start a conversation by typing a message below.
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.sender}-message`}>
            <img 
              className="avatar" 
              src={message.sender === 'user' ? '/icons/user-avatar.svg' : '/icons/assistant-avatar.svg'} 
              alt={message.sender} 
            />
            <div className="message-content">
              {message.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message assistant-message">
            <img className="avatar" src="/icons/assistant-avatar.svg" alt="assistant" />
            <div className="message-content">
              <div className="typing-indicator">Typing...</div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <button className="attach-file-btn" title="Add file">
          <span className="material-symbols-outlined">add_circle</span>
        </button>
        
        <div className="webhook-selector-container">
          <button 
            className="webhook-selector-btn" 
            onClick={() => setShowWebhookSelector(!showWebhookSelector)}
            title="Select webhook for next message"
          >
            🔗 {nextMessageWebhook}
          </button>
          
          {showWebhookSelector && (
            <div className="webhook-dropdown">
              {Object.keys(webhooks).map((webhookName) => (
                <div 
                  key={webhookName}
                  className={`webhook-option ${nextMessageWebhook === webhookName ? 'selected' : ''}`}
                  onClick={() => selectWebhook(webhookName)}
                >
                  {webhookName}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <textarea
          ref={inputRef}
          id="chat-input"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          rows={1}
        />
        
        <button 
          className={`voice-btn ${isRecording ? 'recording' : ''}`}
          onClick={handleVoiceClick}
          title="Voice input"
        >
          <span className="material-symbols-outlined">
            {isRecording ? 'mic' : 'mic_none'}
          </span>
        </button>
        
        <button className="send-btn" onClick={sendMessage} title="Send message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
      
      {/* Voice Status */}
      {voiceStatus && (
        <div className="voice-status">
          {voiceStatus}
        </div>
      )}
      


      {/* History Modal */}
      {showHistory && (
        <div className="history-modal" style={{ display: 'flex' }}>
          <div className="history-content">
            <div className="history-header">
              <h2>Chat History</h2>
              <button className="close-history-btn" onClick={() => setShowHistory(false)}>
                ×
              </button>
            </div>
            <div className="history-list">
              {chatSessions.length === 0 ? (
                <div className="no-history">No chat history yet</div>
              ) : (
                chatSessions.map((session) => (
                  <div 
                    key={session.id} 
                    className={`history-item ${session.id === currentSessionId ? 'current-session' : ''}`}
                  >
                    <div className="history-content" onClick={() => switchToSession(session.id)}>
                      <div className="history-date">{formatDate(session.timestamp)}</div>
                      <div className="history-preview">{session.name}</div>
                      <div className="history-info">{session.messages.length} messages</div>
                    </div>
                    <button 
                      className="delete-chat-btn" 
                      onClick={() => deleteSession(session.id)}
                      title="Delete chat"
                    >
                      <img src="/icons/delete-icon.svg" alt="Delete" width="16" height="16" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="settings-panel" style={{ display: 'flex' }}>
          <div className="settings-content">
            <div className="settings-header">
              <h2>Settings</h2>
              <button className="close-settings-btn" onClick={() => setShowSettings(false)}>×</button>
            </div>
            
            <div className="settings-body">
              <div className="settings-section">
              <h3>Appearance</h3>
              <label>
                Theme:
                <select 
                  value={theme} 
                  onChange={(e) => {
                    const newTheme = e.target.value as 'dark' | 'light';
                    setTheme(newTheme);
                    localStorage.setItem('theme', newTheme);
                    document.body.className = newTheme === 'light' ? 'light-theme' : '';
                  }}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </label>
              
              <label>
                Text Size:
                <select 
                  value={textSize} 
                  onChange={(e) => {
                    const newSize = e.target.value as 'small' | 'medium' | 'large';
                    setTextSize(newSize);
                    localStorage.setItem('textSize', newSize);
                    document.body.className = `${theme === 'light' ? 'light-theme' : ''} text-${newSize}`;
                  }}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </label>
            </div>
            
            <div className="settings-section">
              <h3>Voice Settings</h3>
              <label>
                Language:
                <select 
                  value={currentLanguage} 
                  onChange={(e) => {
                    setCurrentLanguage(e.target.value);
                    localStorage.setItem('voiceLanguage', e.target.value);
                    if (recognitionRef.current) {
                      recognitionRef.current.lang = e.target.value;
                    }
                  }}
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="fr-FR">Français</option>
                  <option value="es-ES">Español</option>
                  <option value="de-DE">Deutsch</option>
                  <option value="it-IT">Italiano</option>
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="ja-JP">日本語</option>
                  <option value="ko-KR">한국어</option>
                  <option value="zh-CN">中文 (简体)</option>
                </select>
              </label>
            </div>
            
            <div className="settings-section">
              <h3>Webhook Management</h3>
              <div className="webhook-form">
                <input
                  type="text"
                  placeholder="Webhook name"
                  value={newWebhookName}
                  onChange={(e) => setNewWebhookName(e.target.value)}
                />
                <input
                  type="url"
                  placeholder="Webhook URL"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                />
                <button onClick={addWebhook} disabled={!newWebhookName.trim() || !newWebhookUrl.trim()}>
                  Add Webhook
                </button>
              </div>
              
              <div className="webhook-list">
                {Object.entries(webhooks).map(([name, url]) => (
                  <div key={name} className="webhook-item">
                    <div className="webhook-info">
                      <strong>{name}</strong>
                      {name === defaultWebhookName && <span className="default-badge">Primary</span>}
                      <div className="webhook-url">{url}</div>
                    </div>
                    <div className="webhook-actions">
                      {name !== defaultWebhookName && (
                        <button onClick={() => setAsDefaultWebhook(name)}>Set as Primary</button>
                      )}
                      <button onClick={() => removeWebhook(name)} className="remove-btn">Remove</button>
                    </div>
                  </div>
                ))}
                {Object.keys(webhooks).length === 0 && (
                  <div className="no-webhooks">No webhooks configured</div>
                )}
              </div>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
# API Documentation

This document explains how to integrate external APIs with the Agent Chrome Extension, including webhook configuration, request/response formats, and custom implementations.

## 🔗 Webhook Integration

### Overview
The extension uses a webhook-based architecture to communicate with AI services. This allows for flexible integration with various AI providers and custom backends.

### Webhook Configuration

#### Adding a Webhook
1. Open extension options (right-click extension icon → Options)
2. Navigate to "Webhook Management" section
3. Click "Add New Webhook"
4. Enter webhook name and URL
5. Save settings

#### Webhook URL Format
```
https://your-api-domain.com/webhook-endpoint
```

**Requirements**:
- Must use HTTPS
- Must accept POST requests
- Must return JSON responses
- Should handle CORS if needed

---

## 📤 Request Format

### Standard Request Structure
```javascript
POST /your-webhook-endpoint
Content-Type: application/json

{
  "message": "User's input message",
  "files": [
    {
      "name": "document.pdf",
      "type": "application/pdf",
      "data": "base64-encoded-file-content"
    }
  ],
  "history": [
    {
      "type": "user",
      "content": "Previous user message",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "type": "assistant", 
      "content": "Previous assistant response",
      "timestamp": "2024-01-15T10:30:05Z"
    }
  ],
  "settings": {
    "language": "en-US",
    "theme": "dark",
    "textSize": "medium"
  },
  "metadata": {
    "extensionVersion": "2.0.0",
    "userAgent": "Chrome/120.0.0.0",
    "timestamp": "2024-01-15T10:35:00Z"
  }
}
```

### Request Fields

#### Required Fields
- **`message`** (string): The user's input message
- **`timestamp`** (string): ISO 8601 timestamp of the request

#### Optional Fields
- **`files`** (array): Attached files (images, documents, etc.)
- **`history`** (array): Previous conversation messages
- **`settings`** (object): User preferences and configuration
- **`metadata`** (object): Extension and browser information

### File Attachment Format
```javascript
{
  "name": "filename.ext",           // Original filename
  "type": "mime/type",              // MIME type
  "size": 1024,                     // File size in bytes
  "data": "base64-string",          // Base64 encoded content
  "lastModified": 1705312200000     // Last modified timestamp
}
```

**Supported File Types**:
- Images: PNG, JPEG, GIF, WebP
- Documents: PDF, TXT, DOC, DOCX
- Code: JS, HTML, CSS, JSON, XML
- Archives: ZIP (contents extracted)

**File Size Limits**:
- Individual file: 10MB
- Total request: 25MB
- Base64 encoding increases size by ~33%

---

## 📥 Response Format

### Standard Response Structure
```javascript
{
  "response": "AI assistant's response message",
  "status": "success",
  "metadata": {
    "model": "gpt-4",
    "tokens": {
      "input": 150,
      "output": 75,
      "total": 225
    },
    "processingTime": 1.5,
    "timestamp": "2024-01-15T10:35:02Z"
  }
}
```

### Response Fields

#### Required Fields
- **`response`** (string): The AI assistant's response message

#### Optional Fields
- **`status`** (string): Response status ("success", "error", "partial")
- **`metadata`** (object): Processing information and statistics
- **`suggestions`** (array): Follow-up suggestions for the user
- **`attachments`** (array): Files or media to display

### Error Response Format
```javascript
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "status": "error",
  "details": {
    "type": "validation_error",
    "field": "message",
    "reason": "Message cannot be empty"
  },
  "retry": true
}
```

### Enhanced Response Features

#### Markdown Support
The extension automatically renders markdown in responses:
```javascript
{
  "response": "Here's some **bold text** and a [link](https://example.com)\n\n```javascript\nconsole.log('code block');\n```"
}
```

#### Suggestions
```javascript
{
  "response": "I can help you with that!",
  "suggestions": [
    "Tell me more about this topic",
    "Show me an example",
    "What are the alternatives?"
  ]
}
```

#### File Attachments in Response
```javascript
{
  "response": "I've created a document for you:",
  "attachments": [
    {
      "name": "report.pdf",
      "type": "application/pdf",
      "url": "https://your-domain.com/files/report.pdf",
      "description": "Generated report based on your request"
    }
  ]
}
```

---

## 🔧 Implementation Examples

### Node.js Express Server
```javascript
const express = require('express');
const app = express();

app.use(express.json({ limit: '25mb' }));

app.post('/webhook', async (req, res) => {
  try {
    const { message, files, history, settings } = req.body;
    
    // Process the request
    const aiResponse = await processWithAI(message, files, history);
    
    // Return response
    res.json({
      response: aiResponse,
      status: 'success',
      metadata: {
        model: 'gpt-4',
        processingTime: Date.now() - startTime
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      status: 'error',
      retry: true
    });
  }
});

async function processWithAI(message, files, history) {
  // Your AI processing logic here
  // This could integrate with OpenAI, Anthropic, local models, etc.
}
```

### Python Flask Server
```python
from flask import Flask, request, jsonify
import base64
import time

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    try:
        data = request.get_json()
        message = data.get('message')
        files = data.get('files', [])
        history = data.get('history', [])
        
        # Process files
        processed_files = []
        for file in files:
            file_content = base64.b64decode(file['data'])
            # Process file content
            processed_files.append(process_file(file_content, file['type']))
        
        # Generate AI response
        response = generate_ai_response(message, processed_files, history)
        
        return jsonify({
            'response': response,
            'status': 'success',
            'metadata': {
                'processingTime': time.time() - start_time
            }
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error',
            'retry': True
        }), 500

def generate_ai_response(message, files, history):
    # Your AI integration logic
    pass
```

### Serverless Function (Vercel)
```javascript
// api/webhook.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { message, files, history } = req.body;
    
    // Process with your AI service
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          ...history.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          { role: 'user', content: message }
        ]
      })
    });
    
    const aiResponse = await response.json();
    
    res.json({
      response: aiResponse.choices[0].message.content,
      status: 'success'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      status: 'error'
    });
  }
}
```

---

## 🔐 Security Considerations

### Authentication
```javascript
// Add API key authentication
app.post('/webhook', authenticateAPIKey, async (req, res) => {
  // Your webhook logic
});

function authenticateAPIKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || !isValidAPIKey(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
}
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/webhook', limiter);
```

### Input Validation
```javascript
const { body, validationResult } = require('express-validator');

app.post('/webhook', [
  body('message').isLength({ min: 1, max: 10000 }),
  body('files').isArray().optional(),
  body('files.*.data').isBase64().optional()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  
  // Process request
});
```

---

## 🧪 Testing Your Webhook

### Test Request Example
```bash
curl -X POST https://your-domain.com/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, this is a test message",
    "files": [],
    "history": [],
    "settings": {
      "language": "en-US"
    }
  }'
```

### Expected Response
```json
{
  "response": "Hello! I received your test message successfully.",
  "status": "success"
}
```

### Testing Checklist
- ✅ Webhook accepts POST requests
- ✅ Returns valid JSON responses
- ✅ Handles file attachments correctly
- ✅ Processes conversation history
- ✅ Returns appropriate error messages
- ✅ Responds within reasonable time (< 30 seconds)
- ✅ Handles CORS if needed
- ✅ Validates input data
- ✅ Implements proper error handling

---

## 🔄 Advanced Features

### Streaming Responses
For real-time response streaming:
```javascript
app.post('/webhook/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  
  // Stream AI response chunks
  streamAIResponse(req.body.message, (chunk) => {
    res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
  });
  
  res.write('data: [DONE]\n\n');
  res.end();
});
```

### Custom Commands
Handle special commands in messages:
```javascript
function processMessage(message) {
  if (message.startsWith('/')) {
    return handleCommand(message);
  }
  return generateNormalResponse(message);
}

function handleCommand(command) {
  const [cmd, ...args] = command.slice(1).split(' ');
  
  switch (cmd) {
    case 'help':
      return 'Available commands: /help, /weather, /translate';
    case 'weather':
      return getWeather(args[0]);
    case 'translate':
      return translateText(args.join(' '));
    default:
      return 'Unknown command. Type /help for available commands.';
  }
}
```

### File Processing
Handle different file types:
```javascript
function processFile(file) {
  switch (file.type) {
    case 'image/jpeg':
    case 'image/png':
      return processImage(file.data);
    case 'application/pdf':
      return extractPDFText(file.data);
    case 'text/plain':
      return Buffer.from(file.data, 'base64').toString('utf-8');
    default:
      throw new Error(`Unsupported file type: ${file.type}`);
  }
}
```

---

## 📊 Monitoring and Analytics

### Request Logging
```javascript
app.use((req, res, next) => {
  console.log({
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    contentLength: req.headers['content-length']
  });
  next();
});
```

### Performance Metrics
```javascript
const startTime = Date.now();

// Process request...

const responseTime = Date.now() - startTime;
console.log(`Request processed in ${responseTime}ms`);
```

### Error Tracking
```javascript
app.use((error, req, res, next) => {
  console.error({
    error: error.message,
    stack: error.stack,
    request: {
      method: req.method,
      url: req.url,
      body: req.body
    }
  });
  
  res.status(500).json({
    error: 'Internal server error',
    status: 'error'
  });
});
```

---

**Next**: Read the [Customization Guide](./customization.md) for theming and UI modifications
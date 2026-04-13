# How to Use AI Chat Proxy in Your Workspace

This guide shows you how to integrate the `/ai/chat` proxy endpoint in your workspace, following the successful pattern used by Storyboard Studio.

---

## Quick Start (Copy-Paste Ready)

### 1. Import the AI functions

```typescript
import { 
  aiChatOnceViaProxy, 
  aiChatStreamViaProxy, 
  type ChatMessage 
} from '../apis/aiChat';

// Or use the convenience functions from aiCommon:
import { 
  aiTextViaProxy, 
  aiChatJSONViaProxy, 
  buildSystemMessage,
  AI_MODELS 
} from '../apis/aiCommon';
```

### 2. Simple text generation (one-liner)

```typescript
const suggestion = await aiTextViaProxy(
  'Write 3 taglines for a fitness app',
  'You are a marketing copywriter. Be creative but concise.'
);
console.log(suggestion);  // String result
```

### 3. Streaming with live feedback

```typescript
const [output, setOutput] = useState('');
const [isLoading, setIsLoading] = useState(false);

const handleGenerate = async () => {
  setIsLoading(true);
  let accumulated = '';
  
  try {
    await aiChatStreamViaProxy(
      [
        { 
          role: 'system', 
          content: 'You are a creative writer. Respond in Vietnamese.' 
        },
        { 
          role: 'user', 
          content: 'Write a product description for a smartphone' 
        },
      ],
      (token) => {
        accumulated += token;
        setOutput(accumulated);  // Updates UI per token for live feedback
      }
    );
  } catch (error) {
    console.error('Generation failed:', error);
    setOutput('Error: ' + error.message);
  } finally {
    setIsLoading(false);
  }
};
```

### 4. Structured JSON output with TypeScript types

```typescript
interface ProductBrief {
  headline: string;
  bulletPoints: string[];
  callToAction: string;
}

const generateBrief = async () => {
  const brief = await aiChatJSONViaProxy<ProductBrief>([
    buildSystemMessage({
      role: 'You are a product copywriter for e-commerce.',
      rules: [
        'Be concise and persuasive',
        'Focus on customer benefits',
        'Use power words',
      ],
      outputFormat: 'Return JSON: { headline: string, bulletPoints: string[], callToAction: string }',
      language: 'vi',
    }),
    { 
      role: 'user', 
      content: 'Create a brief for a wireless headphone product' 
    },
  ]);
  
  console.log(brief.headline);        // Typed ✓
  console.log(brief.bulletPoints);    // Typed ✓
  console.log(brief.callToAction);    // Typed ✓
};
```

### 5. Multi-turn conversation

```typescript
interface ChatState {
  messages: ChatMessage[];
}

const [chatState, setChatState] = useState<ChatState>({
  messages: [
    {
      role: 'system',
      content: buildSystemMessage({
        role: 'You are a Python programming tutor.',
        language: 'en',
      }).content,
    },
  ],
});

const sendMessage = async (userInput: string) => {
  // Add user message
  const newMessages = [
    ...chatState.messages,
    { role: 'user' as const, content: userInput },
  ];
  
  let response = '';
  
  // Stream the response
  await aiChatStreamViaProxy(
    newMessages,
    (token) => {
      response += token;
      setStreamingText(response);  // Live UI update
    }
  );
  
  // Add assistant response to history
  setChatState(prev => ({
    messages: [
      ...prev.messages,
      { role: 'user', content: userInput },
      { role: 'assistant', content: response },
    ],
  }));
};
```

### 6. With cancellation support (AbortController)

```typescript
const abortControllerRef = useRef<AbortController | null>(null);

const startGeneration = async () => {
  // Cancel any previous request
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  
  abortControllerRef.current = new AbortController();
  
  try {
    await aiChatStreamViaProxy(
      messages,
      (token) => setOutput(prev => prev + token),
      abortControllerRef.current.signal,  // Pass abort signal
    );
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Generation cancelled');
    } else {
      console.error('Error:', error);
    }
  }
};

const handleCancel = () => {
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
};
```

### 7. Using different models

```typescript
// Fast and cheap (default)
const fast = await aiTextViaProxy(
  'Quick summary',
  'You are a summarizer.',
  undefined,
  2048,
  AI_MODELS.SONNET,  // claude-sonnet-4-6
);

// Powerful for complex reasoning
const powerful = await aiChatOnceViaProxy(
  messages,
  undefined,
  4096,
  AI_MODELS.OPUS,  // claude-opus-4
);
```

### 8. Error handling patterns

```typescript
const robustGenerate = async () => {
  try {
    const result = await aiChatOnceViaProxy([
      { role: 'system', content: 'You are helpful.' },
      { role: 'user', content: 'Help me!' },
    ]);
    
    if (!result) {
      throw new Error('Empty response from AI');
    }
    
    return result;
  } catch (error: any) {
    if (error.message.includes('HTTP 429')) {
      // Rate limited
      toast.error('Too many requests. Please wait a moment.');
    } else if (error.message.includes('HTTP 401')) {
      // Auth failed
      toast.error('Please login again.');
      logout();
    } else if (error.name === 'AbortError') {
      // User cancelled
      console.log('Request cancelled');
    } else {
      // Other error
      toast.error(`AI Error: ${error.message}`);
    }
  }
};
```

### 9. JSON parsing with robust fallback

```typescript
import { parseAIJSON } from '../apis/aiCommon';

const raw = await aiChatOnceViaProxy([
  { 
    role: 'system', 
    content: 'Return JSON: {name: string, tags: string[]}' 
  },
  { role: 'user', content: 'Generate a product...' },
]);

// Handles:
// ✓ ```json ... ```
// ✓ ``` ... ```
// ✓ Control characters
// ✓ Extra text before/after JSON
try {
  const data = parseAIJSON<{ name: string; tags: string[] }>(raw);
  console.log(data.name);   // Typed ✓
} catch (error) {
  console.error('JSON parse failed:', error.message);
}
```

---

## Real-World Examples from Storyboard Studio

### Example 1: Generate Script with Terminal Feedback

```typescript
// From: hooks/useStoryboardStudio.ts (line 411-424)

const messages = [
  { role: 'system', content: 'You are a screenwriter...' },
  { role: 'user', content: 'Generate script based on: ' + idea },
];

let accumulated = '';
addLog('[AI] Starting script generation...');

await aiChatStreamViaProxy(
  messages,
  (token) => {
    accumulated += token;
    // Update terminal with last 120 chars for smooth UX
    setTerminalLogs(prev => {
      const last = prev[prev.length - 1];
      if (last?.startsWith('[AI WRITING] ')) {
        return [...prev.slice(0, -1), `[AI WRITING] ${accumulated.slice(-120)}...`];
      }
      return [...prev, `[AI WRITING] ${token}`];
    });
  }
);

// Parse result
const cleaned = accumulated
  .replace(/^```(?:json)?\s*/i, '')
  .replace(/\s*```\s*$/i, '')
  .trim();
const result = JSON.parse(cleaned);
```

### Example 2: Chat Assistant with History

```typescript
// From: components/storyboard-studio/AIScriptAssistant.tsx (line 166-174)

const messages: ChatMessage[] = [
  { role: 'system', content: buildChatSystemPrompt() },
  ...chatMessages.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  })),
];

let accumulated = '';
setIsStreaming(true);

try {
  await aiChatStreamViaProxy(
    messages,
    (token) => {
      accumulated += token;
      setStreamingText(accumulated);
    },
    abortRef.current.signal,
  );
  
  // Save to history
  setChatMessages(prev => [
    ...prev,
    { role: 'assistant', content: accumulated },
  ]);
} catch (e: any) {
  if (e?.name !== 'AbortError') {
    setChatMessages(prev => [
      ...prev,
      { role: 'assistant', content: '[Connection error. Try again.]' },
    ]);
  }
} finally {
  setStreamingText('');
  setIsStreaming(false);
}
```

---

## Complete Component Example

```typescript
import React, { useState, useRef } from 'react';
import { 
  aiChatStreamViaProxy, 
  type ChatMessage 
} from '../apis/aiChat';
import { buildSystemMessage } from '../apis/aiCommon';

interface AIWriterProps {
  topic: string;
  onComplete: (text: string) => void;
}

export const AIWriter: React.FC<AIWriterProps> = ({ topic, onComplete }) => {
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    let accumulated = '';

    // Create new abort controller
    abortRef.current = new AbortController();

    try {
      const messages: ChatMessage[] = [
        buildSystemMessage({
          role: 'You are an expert content writer.',
          rules: [
            'Write engaging and informative content',
            'Use clear language',
            'Include examples',
          ],
          outputFormat: 'Return plain text, no markdown.',
          language: 'en',
        }),
        {
          role: 'user',
          content: `Write a comprehensive article about: ${topic}`,
        },
      ];

      await aiChatStreamViaProxy(
        messages,
        (token) => {
          accumulated += token;
          setOutput(accumulated);
        },
        abortRef.current.signal,
      );

      onComplete(accumulated);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const message = err.message || 'Unknown error occurred';
        setError(message);
        console.error('Generation error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {isLoading ? 'Generating...' : 'Generate'}
      </button>

      {isLoading && (
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Cancel
        </button>
      )}

      {error && (
        <div className="text-red-500">Error: {error}</div>
      )}

      {output && (
        <div className="p-4 bg-gray-100 rounded whitespace-pre-wrap">
          {output}
        </div>
      )}
    </div>
  );
};
```

---

## API Reference

### `aiChatOnceViaProxy(messages, signal?, maxTokens?, model?)`
- **Returns:** `Promise<string>` - Full response text
- **Params:**
  - `messages`: ChatMessage[] - Conversation history
  - `signal?`: AbortSignal - For cancellation
  - `maxTokens?`: number - Max response length (default: 4096)
  - `model?`: string - Model ID (default: claude-sonnet-4-6)

### `aiChatStreamViaProxy(messages, onToken, signal?, maxTokens?, model?)`
- **Returns:** `Promise<string>` - Accumulated full text
- **Params:**
  - `messages`: ChatMessage[] - Conversation history
  - `onToken`: (token: string) => void - Called per chunk
  - `signal?`: AbortSignal - For cancellation
  - `maxTokens?`: number - Max response length (default: 4096)
  - `model?`: string - Model ID (default: claude-sonnet-4-6)

### `aiTextViaProxy(prompt, systemRole?, signal?, maxTokens?, model?)`
- **Returns:** `Promise<string>` - Simple text response
- **Shorthand for:** `aiChatOnceViaProxy([{role: 'system', content: systemRole}, {role: 'user', content: prompt}])`

### `aiChatJSONViaProxy<T>(messages, signal?, maxTokens?, model?)`
- **Returns:** `Promise<T>` - Parsed JSON response
- **Automatically:** Strips markdown fences and parses JSON

### `buildSystemMessage(options)`
- **Returns:** `ChatMessage` with well-formatted system prompt
- **Options:**
  - `role`: Core instruction (required)
  - `rules`: Array of constraints (optional)
  - `outputFormat`: Output spec (optional)
  - `language`: Force language (optional: 'vi' | 'en' | 'ko' | 'ja')

---

## Troubleshooting

### "No active API keys"
- Backend is out of API keys
- Check backend logs and `skyverses-backend/src/config/keyGenminiGommo.ts`

### "Too many requests" (HTTP 429)
- Hit rate limit: 10 requests per 60 seconds
- Wait before retrying
- Response includes `retryAfter` seconds

### "Unauthorized" (HTTP 401)
- Token expired or invalid
- User needs to login again
- Check localStorage for `skyverses_auth_token`

### Empty response
- Model returned no content
- Check request format and system prompt
- Try with `AI_MODELS.OPUS` for complex tasks

### Streaming stops early
- Network issue or timeout
- Try non-streaming mode first
- Check browser console for errors

---

## Best Practices

1. **Always use streaming for large outputs** - Better UX with live feedback
2. **Use proper error handling** - Don't leave users hanging
3. **Provide cancellation** - Let users abort long operations
4. **Set appropriate max_tokens** - Don't request 16k tokens for simple tasks
5. **Use system prompts** - Guide the AI with clear instructions
6. **Validate JSON output** - Wrap parseAIJSON in try/catch
7. **Implement rate limit handling** - Show user friendly message on 429
8. **Use OPUS sparingly** - It's more expensive, use SONNET as default
9. **Build messages incrementally** - Keep chat history for better context
10. **Test with different models** - SONNET for speed, OPUS for quality

---

Generated: April 13, 2026  
Reference Implementation: Storyboard Studio

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, RotateCcw, Maximize2, Copy, PlusCircle } from 'lucide-react';
import type { Message } from './Workspace';

interface ChatbotProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isTyping: boolean;
  isComplete: boolean;
}

export default function Chatbot({ messages, onSendMessage, isTyping, isComplete }: ChatbotProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping || isComplete) return;

    onSendMessage(inputValue);
    setInputValue('');
  };

  return (
    <div className="chatbot-container-main">
      <div className="chatbot-header-simple">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-gray-700" />
          <h3 className="font-semibold text-gray-800 text-sm">AI Assistant</h3>
        </div>
        <div className="flex gap-2 text-gray-400">
          <button className="icon-btn-small"><RotateCcw size={16} /></button>
          <button className="icon-btn-small"><Maximize2 size={16} /></button>
        </div>
      </div>

      <div className="chatbot-messages-simple">
        {messages.map((msg, index) => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            {msg.role === 'ai' && (
              <div className="avatar-bot">
                <Bot size={16} />
              </div>
            )}
            <div className="message-content-wrapper">
              <div className={`message-bubble-simple ${msg.role}`}>
                {msg.content}
              </div>

              {/* Fake action buttons for AI message like in wireframe */}
              {msg.role === 'ai' && index === 2 && (
                <div className="ai-actions">
                  <button><Copy size={14} /> Copy</button>
                  <button><PlusCircle size={14} /> Insert into editor</button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="chat-message ai">
            <div className="avatar-bot">
              <Bot size={16} />
            </div>
            <div className="message-content-wrapper">
              <div className="message-bubble-simple ai typing-indicator-simple">
                <div className="dot"></div><div className="dot"></div><div className="dot"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-input-simple">
        <form onSubmit={handleSubmit} className="input-box">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isTyping || isComplete}
          />
          <button
            type="submit"
            className="send-icon-btn"
            disabled={!inputValue.trim() || isTyping || isComplete}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

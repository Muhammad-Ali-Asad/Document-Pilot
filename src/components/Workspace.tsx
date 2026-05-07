import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Cloud, CheckCircle2, ChevronDown } from 'lucide-react';
import Editor from './Editor';
import type { EditorRef } from './Editor';
import Chatbot from './Chatbot';
import { chatWithDocumentAssistant } from '../lib/hf';

const SERVICE_CONTRACT_TEMPLATE = `
  <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #333;">
    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #ccc; padding-bottom: 10px; margin-bottom: 20px;">
      <strong>Soft Pyramid LLC</strong>
      <span style="color: #666; font-style: italic;">Service Contract — CONFIDENTIAL</span>
    </div>
    
    <div style="background-color: #1e3a5f; color: white; padding: 40px; text-align: center; margin-bottom: 30px;">
      <h1 style="margin: 0; font-size: 32px; letter-spacing: 1px;">SOFT PYRAMID LLC</h1>
      <h2 style="margin: 10px 0 0 0; font-size: 20px; font-weight: normal; color: #a0b2c6;">SERVICE CONTRACT</h2>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
      <tbody>
        <tr>
          <td style="padding: 12px; border: 1px solid #eee; width: 30%; font-weight: bold; color: #1e3a5f;">Contract No.</td>
          <td style="padding: 12px; border: 1px solid #eee; color: #d93025; font-weight: bold;">{{CONTRACT_NUMBER}}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #eee; font-weight: bold; color: #1e3a5f;">Effective Date</td>
          <td style="padding: 12px; border: 1px solid #eee; color: #d93025; font-weight: bold;">{{EFFECTIVE_DATE}}</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #eee; font-weight: bold; color: #1e3a5f;">Contract Type</td>
          <td style="padding: 12px; border: 1px solid #eee;">Professional Services Agreement</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #eee; font-weight: bold; color: #1e3a5f;">Prepared By</td>
          <td style="padding: 12px; border: 1px solid #eee;">Soft Pyramid LLC</td>
        </tr>
        <tr>
          <td style="padding: 12px; border: 1px solid #eee; font-weight: bold; color: #1e3a5f;">Prepared For</td>
          <td style="padding: 12px; border: 1px solid #eee; color: #d93025; font-weight: bold;">{{CLIENT_COMPANY_NAME}}</td>
        </tr>
      </tbody>
    </table>

    <h2 style="color: #1e3a5f; border-bottom: 1px solid #1e3a5f; padding-bottom: 5px;">1. Parties</h2>
    
    <h3 style="color: #1e3a5f; font-size: 16px; margin-top: 20px;">1.1 Service Provider</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <tbody>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; width: 30%; font-weight: bold; color: #1e3a5f;">Company</td>
          <td style="padding: 10px; border: 1px solid #eee;">Soft Pyramid LLC</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #1e3a5f;">Address</td>
          <td style="padding: 10px; border: 1px solid #eee;">Alabama, USA</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #1e3a5f;">Also Operating From</td>
          <td style="padding: 10px; border: 1px solid #eee;">Lahore, Pakistan</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #1e3a5f;">Website</td>
          <td style="padding: 10px; border: 1px solid #eee;">softpyramid.com</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #1e3a5f;">Represented By</td>
          <td style="padding: 10px; border: 1px solid #eee;">Fakhar Zaman Khan, CEO</td>
        </tr>
      </tbody>
    </table>

    <h3 style="color: #1e3a5f; font-size: 16px;">1.2 Client</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
      <tbody>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; width: 30%; font-weight: bold; color: #1e3a5f;">Company / Name</td>
          <td style="padding: 10px; border: 1px solid #eee; color: #d93025; font-weight: bold;">{{CLIENT_COMPANY_NAME}}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #1e3a5f;">Address</td>
          <td style="padding: 10px; border: 1px solid #eee; color: #d93025; font-weight: bold;">{{CLIENT_ADDRESS}}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #1e3a5f;">City, State, ZIP</td>
          <td style="padding: 10px; border: 1px solid #eee; color: #d93025; font-weight: bold;">{{CLIENT_CITY_STATE_ZIP}}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #1e3a5f;">Country</td>
          <td style="padding: 10px; border: 1px solid #eee; color: #d93025; font-weight: bold;">{{CLIENT_COUNTRY}}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #1e3a5f;">Contact Person</td>
          <td style="padding: 10px; border: 1px solid #eee; color: #d93025; font-weight: bold;">{{CLIENT_CONTACT_PERSON}}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #1e3a5f;">Email</td>
          <td style="padding: 10px; border: 1px solid #eee; color: #d93025; font-weight: bold;">{{CLIENT_EMAIL}}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #eee; font-weight: bold; color: #1e3a5f;">Phone</td>
          <td style="padding: 10px; border: 1px solid #eee; color: #d93025; font-weight: bold;">{{CLIENT_PHONE}}</td>
        </tr>
      </tbody>
    </table>
  </div>
`;

export type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
};

export default function Workspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const customHtml = location.state?.customHtml;
  
  const [content, setContent] = useState(customHtml || SERVICE_CONTRACT_TEMPLATE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(450);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<{ currentStep: number; totalSteps: number } | null>(null);
  const [filledKeys, setFilledKeys] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'failed'>('saved');
  const [activeTab, setActiveTab] = useState<'editor' | 'assistant'>('editor');
  
  const updateContentRef = useRef<EditorRef>(null);

  // Auto-save logic
  useEffect(() => {
    if (!hasStarted) return;
    
    const timer = setTimeout(() => {
      saveDocument();
    }, 1500); // Debounce manual edits

    return () => clearTimeout(timer);
  }, [content]);

  const saveDocument = async () => {
    setSaveStatus('saving');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setSaveStatus('saved');
    } catch (error) {
      setSaveStatus('failed');
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 300 && newWidth < window.innerWidth - 300) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Initialize the chat dynamically via Groq on first load
  useEffect(() => {
    if (!hasStarted && messages.length === 0) {
      setHasStarted(true);
      initiateChat();
    }
  }, [hasStarted, messages.length]);

  const initiateChat = async () => {
    setIsTyping(true);
    try {
      // Empty chat history initially. Groq reads the document and asks the first question.
      const response = await chatWithDocumentAssistant(content, []);
      
      setMessages([{
        id: Date.now().toString(),
        role: 'ai',
        content: response.message
      }]);
      if (response.progress) {
        setProgress(response.progress);
      }
    } catch (error: any) {
      setMessages([{
        id: Date.now().toString(),
        role: 'ai',
        content: `Error connecting to AI: ${error.message}`
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const newChatHistory = [...messages, userMsg];
    setMessages(newChatHistory);
    setIsTyping(true);

    try {
      const response = await chatWithDocumentAssistant(content, newChatHistory);
      
      // Apply Document Updates
      if (response.replacements && response.replacements.length > 0 && updateContentRef.current) {
        response.replacements.forEach(replacement => {
          updateContentRef.current?.updatePlaceholder(replacement.targetPlaceholder, replacement.newText);
          
          // Track the filled key
          const key = replacement.targetPlaceholder.replace(/\{\{|\}\}|\[|\]/g, '');
          setFilledKeys(prev => prev.includes(key) ? prev : [...prev, key]);
        });
      }

      // Add AI conversational message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: response.message
      }]);

      if (response.progress) {
        setProgress(response.progress);
      }

      if (response.isComplete) {
        setIsComplete(true);
      }

    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: `Error: ${error.message}`
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="workspace-layout">
      {/* Header */}
      <div className="workspace-header-simple">
        <div className="header-left">
          <button 
            className="back-btn"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={18} />
            <span>Back to Templates</span>
          </button>
        </div>
        
        <div className="header-center">
          <h2 className="doc-title">{id === 'custom' ? 'Uploaded Document' : 'Service Contract Template'}</h2>
          <div className="save-status">
            {saveStatus === 'saving' && (
              <div className="flex items-center gap-1.5 text-blue-500">
                <div className="save-spinner"></div>
                <span>Saving...</span>
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center gap-1.5 text-green-600">
                <CheckCircle2 size={14} />
                <span>All changes saved</span>
              </div>
            )}
            {saveStatus === 'failed' && (
              <div className="flex items-center gap-1.5 text-red-500">
                <span className="font-medium">Save failed</span>
                <button onClick={saveDocument} className="text-xs underline hover:text-red-600">Retry</button>
              </div>
            )}
          </div>
        </div>
        
        <div className="header-right">
          <button className="icon-btn">
            <Cloud size={18} />
          </button>
          <button 
            className={`btn-outline ${saveStatus === 'saving' ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={saveDocument}
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save'}
          </button>
          <button className={`btn-outline ${isComplete ? 'btn-export-highlight pulse' : ''}`}>
            Export
          </button>
          <div className="user-dropdown">
            <div className="avatar-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span>User Name</span>
            <ChevronDown size={14} className="text-gray-500" />
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="mobile-tabs-bar">
        <button 
          className={`tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          Document
        </button>
        <button 
          className={`tab-btn ${activeTab === 'assistant' ? 'active' : ''}`}
          onClick={() => setActiveTab('assistant')}
        >
          Assistant
          {progress && progress.currentStep > 0 && <span className="tab-badge"></span>}
        </button>
      </div>

      {/* Main Split View */}
      <div className={`workspace-content ${activeTab}-active`}>
        <div className="editor-panel-wrapper">
          <Editor 
            initialContent={content} 
            onChange={setContent} 
            ref={updateContentRef}
          />
        </div>

        {/* Resizer Handle (Desktop only) */}
        <div 
          className={`resizer ${isDragging ? 'active' : ''}`} 
          onMouseDown={handleMouseDown}
        />

        <div className="chatbot-panel-wrapper" style={{ width: window.innerWidth > 768 ? `${sidebarWidth}px` : '100%', flexShrink: 0 }}>
          <Chatbot 
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            isComplete={isComplete}
            progress={progress}
            filledKeys={filledKeys}
          />
        </div>
      </div>
    </div>
  );
}

import { HfInference } from '@huggingface/inference';

const hf = new HfInference(import.meta.env.VITE_HF_API_KEY || 'missing_key_to_prevent_crash_on_load');

export interface AIResponse {
  message: string;
  replacements: { targetPlaceholder: string; newText: string }[];
  isComplete: boolean;
  progress?: {
    currentStep: number;
    totalSteps: number;
  };
}

const SYSTEM_PROMPT = `
You are Pilot, an expert document assistant. Your mission is to help the user complete their document efficiently and naturally.

Phase 1: Full Document Scan
When you first see a document, identify ALL placeholders (e.g., {{KEY}}). Create a logical roadmap for filling them out, grouping them into these categories if applicable:
1. Basic Details (Contract numbers, dates)
2. Client/Party Information
3. Agreement Specifics (Terms, amounts, descriptions)
4. Formalities (Signatures, titles)

Phase 2: Conversational Flow
- Acknowledge inputs warmly.
- Ask for related fields in groups to minimize context switching.
- Always inform the user of their progress (e.g., "Step 2 of 5").

Output Schema (Strict JSON):
{
  "message": "Your conversational reply. Acknowledge the last answer and ask for the next logical group.",
  "replacements": [
    { "targetPlaceholder": "{{KEY}}", "newText": "Value" }
  ],
  "progress": {
    "currentStep": 3,
    "totalSteps": 8
  },
  "isComplete": false
}

Rules:
- NO markdown outside the JSON.
- Organize questions by category, not just top-to-bottom.
- If no more placeholders exist, set "isComplete": true.
`;

export async function chatWithDocumentAssistant(
  documentHtml: string,
  chatHistory: { role: 'user' | 'ai'; content: string }[]
): Promise<AIResponse> {
  if (!import.meta.env.VITE_HF_API_KEY) {
    throw new Error("Missing VITE_HF_API_KEY. Please add it to your .env.local file.");
  }

  // Convert chat history format to HF format
  const messages: any[] = [
    { role: 'system', content: SYSTEM_PROMPT }
  ];
  
  for (const msg of chatHistory) {
    messages.push({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      content: msg.content
    });
  }

  if (messages.length === 1) {
    // Only system prompt, add initial user message
    messages.push({
      role: 'user',
      content: "Hello, please review this document and tell me what needs to be filled out first.\\n\\nCURRENT DOCUMENT HTML STATE:\\n\\n" + documentHtml
    });
  } else {
    // Append document HTML to the last user message
    const lastUserMsgIdx = messages.map(m => m.role).lastIndexOf('user');
    if (lastUserMsgIdx !== -1) {
        messages[lastUserMsgIdx].content += "\\n\\nCURRENT DOCUMENT HTML STATE:\\n\\n" + documentHtml;
    }
  }

  try {
    const response = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-72B-Instruct",
      messages: messages,
      max_tokens: 1000,
      temperature: 0.1,
    });

    let content = response.choices[0]?.message?.content || '{}';
    
    // Fallback JSON parser if wrapped in markdown
    const jsonMatch = content.match(/\`\`\`(?:json)?([\s\S]*?)\`\`\`/);
    if (jsonMatch) {
        content = jsonMatch[1].trim();
    } else {
        // Find first { and last }
        const start = content.indexOf('{');
        const end = content.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
            content = content.substring(start, end + 1);
        }
    }

    return JSON.parse(content) as AIResponse;
  } catch (error) {
    console.error("Hugging Face API Error:", error);
    throw error;
  }
}

import { HfInference } from '@huggingface/inference';

const hf = new HfInference(import.meta.env.VITE_HF_API_KEY || 'missing_key_to_prevent_crash_on_load');

export interface AIResponse {
  message: string;
  replacements: { targetPlaceholder: string; newText: string }[];
  isComplete: boolean;
}

const SYSTEM_PROMPT = `
You are an intelligent, proactive document editing assistant. Your goal is to help the user complete, review, and modify their document step-by-step.

Here is how you operate:
1. You will be provided with the current HTML content of the document.
2. Analyze the document to identify ANY missing values, incomplete sections, or logical gaps. These could be explicit placeholders (like [PLACEHOLDER_NAME]), blank lines (like ____), or simply empty fields where data is expected (e.g., an empty table cell next to "Client Name:").
3. If the user makes a request to change something in the document, fulfill that request by providing the replacement.
4. If there are no direct user requests, identify the FIRST missing value or incomplete section that needs to be filled.
5. Ask the user a conversational, clear question to obtain the information needed for that missing field, or confirm if they want to make any changes.
6. You must ALWAYS respond in a strict JSON format matching this schema exactly:
{
  "message": "Your conversational reply to the user (e.g., asking the next question, confirming a change, or letting them know the document looks complete).",
  "replacements": [
    {
      "targetPlaceholder": "THE_EXACT_TEXT_TO_REPLACE",
      "newText": "The new text or information provided by the user"
    }
  ],
  "isComplete": false
}

Rules:
- NEVER output markdown formatting outside the JSON object. Your entire response must be a single parsable JSON object.
- If you use code blocks like \`\`\`json, that is fine, but the content inside must be valid JSON.
- The "targetPlaceholder" MUST match the exact string in the current document (including any brackets, underscores, or surrounding text if needed to make it unique). If replacing an empty space or missing value, include enough surrounding context in "targetPlaceholder" so it can be uniquely found and replaced (e.g., "Client Name: " -> "Client Name: John Doe").
- If the user explicitly asks to change an existing value, find that exact existing value in the HTML and use it as the "targetPlaceholder".
- Only include items in "replacements" if you are actively making a change based on the user's input. If you are just asking a question, "replacements" should be an empty array [].
- If you believe the document is fully complete and the user has no further requests, set "isComplete" to true.
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

import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";

// Allow responses up to 30 seconds
export const maxDuration = 30;

// Sample questions for the form
const formQuestions = [
  {
    id: "name",
    text: "What's your name?",
    type: "text",
  },
  {
    id: "email",
    text: "What's your email address?",
    type: "email",
  },
  {
    id: "experience",
    text: "How many years of experience do you have?",
    type: "number-range",
    min: 0,
    max: 20,
  },
  {
    id: "preferred_role",
    text: "What role are you applying for?",
    type: "single-select",
    options: [
      { id: "developer", label: "Developer" },
      { id: "designer", label: "Designer" },
      { id: "product_manager", label: "Product Manager" },
      { id: "marketing", label: "Marketing" },
      { id: "other", label: "Other" },
    ],
  },
  {
    id: "skills",
    text: "Which skills do you have? (Select all that apply)",
    type: "multi-select",
    options: [
      { id: "javascript", label: "JavaScript" },
      { id: "typescript", label: "TypeScript" },
      { id: "react", label: "React" },
      { id: "nextjs", label: "Next.js" },
      { id: "node", label: "Node.js" },
      { id: "design", label: "UI/UX Design" },
    ],
  },
  {
    id: "start_date",
    text: "When are you available to start?",
    type: "date",
  },
  {
    id: "about",
    text: "Tell us a bit about yourself and why you're interested in this position.",
    type: "long-text",
  },
];

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Track which question we're on based on the number of user responses
  const userMessageCount = messages.filter((m) => m.role === "user").length;

  // Get the current question or indicate form is complete
  let systemPrompt = "";
  if (userMessageCount < formQuestions.length) {
    const currentQuestion = formQuestions[userMessageCount];
    // Use a simpler marker format to avoid JSON parsing issues
    systemPrompt = `You are a friendly form assistant. Your job is to guide the user through a form one question at a time.
    
The current question is: "${currentQuestion.text}"

After acknowledging the user's previous answer (if any), ask this question in a conversational way.
At the end of your message, include this exact marker: QUESTION_DATA:${currentQuestion.id}:${currentQuestion.type}

Keep your responses brief and friendly. Don't mention the marker in your conversation.`;
  } else {
    systemPrompt = `You are a friendly form assistant. The user has completed all questions.
    
Thank them for completing the form and let them know their responses have been recorded.
Include FORM_COMPLETE at the end of your message.

Keep your response brief and friendly. Don't mention the marker in your conversation.`;
  }

  const result = streamText({
    model: groq("llama3-70b-8192"),
    messages,
    system: systemPrompt,
  });

  return result.toDataStreamResponse();
}

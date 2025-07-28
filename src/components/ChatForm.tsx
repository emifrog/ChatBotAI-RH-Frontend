import { useRef } from "react";
import type { FormEvent } from "react";

// Importation du type ChatMessageType depuis App
type ChatMessageType = {
  hideInChat?: boolean;
  role: "user" | "model";
  text: string;
  isError?: boolean;
};

// Props pour le composant ChatForm
type ChatFormProps = {
  chatHistory: ChatMessageType[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessageType[]>>;
  generateBotResponse: (history: ChatMessageType[]) => Promise<void>;
};
const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }: ChatFormProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userMessage = inputRef.current?.value.trim() || "";
    if (!userMessage) return;
    if (inputRef.current) inputRef.current.value = "";
    // Update chat history with the user's message
    setChatHistory((history) => [...history, { role: "user", text: userMessage }]);
    // Delay 600 ms before showing "Thinking..." and generating response
    setTimeout(() => {
      // Add a "Thinking..." placeholder for the bot's response
      setChatHistory((history) => [...history, { role: "model", text: "Je réfléchit..." }]);
      // Call the function to generate the bot's response
      generateBotResponse([...chatHistory, { role: "user", text: `Using the details provided above, please address this query: ${userMessage}` }]);
    }, 600);
  };
  return (
    <form onSubmit={handleFormSubmit} className="chat-form">
      <input ref={inputRef} placeholder="Message..." className="message-input" required />
      <button type="submit" id="send-message" className="material-symbols-rounded">
        arrow_upward
      </button>
    </form>
  );
};
export default ChatForm;
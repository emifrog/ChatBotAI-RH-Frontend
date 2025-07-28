import ChatbotIcon from "./ChatbotIcon";

// Type pour les messages du chat
type ChatMessageType = {
  hideInChat?: boolean;
  role: "user" | "model";
  text: string;
  isError?: boolean;
};

// Props pour le composant ChatMessage
type ChatMessageProps = {
  chat: ChatMessageType;
};
const ChatMessage = ({ chat }: ChatMessageProps) => {
  return (
    !chat.hideInChat && (
      <div className={`message ${chat.role === "model" ? "bot" : "user"}-message ${chat.isError ? "error" : ""}`}>
        {chat.role === "model" && <ChatbotIcon />}
        <p className="message-text">{chat.text}</p>
      </div>
    )
  );
};
export default ChatMessage;
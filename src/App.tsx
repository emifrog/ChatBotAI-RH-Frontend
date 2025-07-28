import { useEffect, useRef, useState } from "react";
import ChatbotIcon from "./components/ChatbotIcon";
import ChatForm from "./components/ChatForm";
import ChatMessage from "./components/ChatMessage";
import { companyInfo } from "./companyInfo";

// Types pour notre application
type ChatMessageType = {
  hideInChat?: boolean;
  role: "user" | "model";
  text: string;
  isError?: boolean;
};

const App = () => {
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>([
    {
      hideInChat: true,
      role: "model",
      text: companyInfo,
    },
  ]);
  const generateBotResponse = async (history: ChatMessageType[]) => {
    // Helper function to update chat history
    const updateHistory = (text: string, isError = false) => {
      setChatHistory((prev) => [...prev.filter((msg) => msg.text != "Je réfléchis..."), { role: "model", text, isError }]);
    };
    // Format chat history for API request - OpenRouter format
    const formattedMessages = history.map(({ role, text }) => ({
      role: role === "model" ? "assistant" : role, // OpenRouter utilise "assistant" au lieu de "model"
      content: text
    }));
    
    // Vérifier que les variables d'environnement requises sont définies
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME;
    const modelName = process.env.NEXT_PUBLIC_MODEL_NAME;
    
    if (!apiKey) {
      throw new Error("NEXT_PUBLIC_API_KEY n'est pas défini dans les variables d'environnement");
    }
    
    if (!modelName) {
      throw new Error("NEXT_PUBLIC_MODEL_NAME n'est pas défini dans les variables d'environnement");
    }
    
    const requestOptions = {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        ...(siteUrl && { "HTTP-Referer": siteUrl }), // Ajout conditionnel
        ...(siteName && { "X-Title": siteName }) // Ajout conditionnel
      },
      body: JSON.stringify({
        model: modelName,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000
      }),
    };
    
    try {
      // Make the API call to get the bot's response
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("NEXT_PUBLIC_API_URL n'est pas défini dans les variables d'environnement");
      }
      const response = await fetch(apiUrl, requestOptions);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data?.error?.message || "Something went wrong!");
      }
      
      // Extract response text from OpenRouter API format
      const apiResponseText = data.choices[0].message.content.trim();
      updateHistory(apiResponseText);
    } catch (error) {
      // Update chat history with the error message
      const errorMessage = error instanceof Error ? error.message : "Une erreur inattendue s'est produite";
      updateHistory(errorMessage, true);
    }
  };
  useEffect(() => {
    // Auto-scroll whenever chat history updates
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [chatHistory]);
  return (
    <div className={`container ${showChatbot ? "show-chatbot" : ""}`}>
      <button onClick={() => setShowChatbot((prev) => !prev)} id="chatbot-toggler">
        <span className="material-symbols-rounded">mode_comment</span>
        <span className="material-symbols-rounded">close</span>
      </button>
      <div className="chatbot-popup">
        {/* Chatbot Header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">ChatBotAI</h2>
          </div>
          <button onClick={() => setShowChatbot((prev) => !prev)} className="material-symbols-rounded">
            keyboard_arrow_down
          </button>
        </div>
        {/* Chatbot Body */}
        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Bonjour  <br /> Comment puis-je vous aider aujourd'hui ?
            </p>
          </div>
          {/* Render the chat history dynamically */}
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>
        {/* Chatbot Footer */}
        <div className="chat-footer">
          <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} generateBotResponse={generateBotResponse} />
        </div>
      </div>
    </div>
  );
};
export default App;
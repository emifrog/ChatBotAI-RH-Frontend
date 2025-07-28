import ChatBotEnhanced from '@/components/ChatBotEnhanced';

export default function Home() {
  return (
    <main className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/assets/chatbot.jpg')" }}>
      <ChatBotEnhanced />
    </main>
  );
}
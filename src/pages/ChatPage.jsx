import PageTransition from '../components/layout/PageTransition';
import Navbar from '../components/layout/Navbar';
import ChatWindow from '../components/user/ChatWindow';
import useChat from '../hooks/useChat';

export default function ChatPage() {
  const { messages, isTyping, sendMessage } = useChat();

  return (
    <PageTransition className="h-[100dvh] flex flex-col bg-white">
      <Navbar />
      <ChatWindow messages={messages} isTyping={isTyping} onSend={sendMessage} />
    </PageTransition>
  );
}

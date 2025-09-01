import AppLayout from '@/components/app-layout';
import ChatInterface from '@/components/chat-interface';

export default function ChatPage() {
  return (
    <AppLayout>
        <div className="h-[calc(100vh-var(--header-height))]">
            <style jsx>{`
                :root {
                    --header-height: 65px; /* Corresponds to p-4 (1rem) + border-b (1px) + p-4 (1rem) */
                }
            `}</style>
            <ChatInterface />
        </div>
    </AppLayout>
  );
}

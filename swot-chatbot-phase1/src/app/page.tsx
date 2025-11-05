import { Chat } from "@/components/chat/Chat";

export const metadata = {
  title: "SWOT Chatbot",
};

export default function Page() {
  return (
    <main className="flex flex-1 flex-col">
      <Chat />
    </main>
  );
}

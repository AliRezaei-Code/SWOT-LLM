import { FormEvent, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Array<{ id: string; title: string; snippet: string }>;
};

const SAMPLE_CITATIONS = [
  {
    id: "doc-001",
    title: "Chlorination SOP v3.2",
    snippet: "Maintain residuals between 1.5–2.0 mg/L. Increase dose cautiously when turbidity > 5 NTU."
  },
  {
    id: "doc-014",
    title: "Distribution System Troubleshooting Guide",
    snippet: "Check valve positions and verify pump calibration before adjusting chemical dosing pumps."
  }
];

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "system-welcome",
      role: "system",
      content:
        "Hi! I'm the Water Quality Technical Assistant. Ask for dosing guidance, SOP directives, or help with grant content."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // TODO: Replace with real API call to /api/chat
      const placeholder: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "This is a placeholder response. Connect the Express `/api/chat` endpoint to the retrieval pipeline to generate grounded answers.",
        citations: SAMPLE_CITATIONS
      };
      await new Promise((resolve) => setTimeout(resolve, 600));
      setMessages((prev) => [...prev, placeholder]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Something went wrong while contacting the backend. Please try again."
        }
      ]);
    } finally {
      setIsLoading(false);
      formRef.current?.reset();
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-6rem)] gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/80">
        <header className="border-b border-slate-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-100">Chat</h2>
          <p className="text-sm text-slate-400">
            Conversations stay grounded in the internal corpus. Each answer will include citations and a safety
            note once the RAG backend is online.
          </p>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {messages.map((message) => (
            <article
              key={message.id}
              className={[
                "rounded-xl border px-4 py-3 text-sm leading-relaxed",
                message.role === "user"
                  ? "border-brand-500/30 bg-brand-500/10 text-brand-100"
                  : message.role === "assistant"
                    ? "border-slate-800 bg-slate-900/80 text-slate-100"
                    : "border-slate-800 bg-slate-900/40 text-slate-400"
              ].join(" ")}
            >
              <p className="text-xs font-semibold uppercase tracking-wide">
                {message.role === "user" ? "You" : message.role === "assistant" ? "Assistant" : "System"}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{message.content}</p>
              {message.citations ? (
                <div className="mt-3 space-y-2 text-xs text-slate-400">
                  <p className="font-semibold uppercase tracking-wide text-slate-500">Citations</p>
                  <ul className="space-y-1">
                    {message.citations.map((citation) => (
                      <li key={citation.id} className="rounded-md border border-slate-800 bg-slate-950/60 p-2 font-mono text-[11px]">
                        {citation.id} — {citation.title}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          ))}
          {isLoading ? (
            <article className="w-fit animate-pulse rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-200">
              Generating response…
            </article>
          ) : null}
        </div>
        <footer className="border-t border-slate-800 px-6 py-4">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
            <textarea
              className="h-28 w-full rounded-lg border border-slate-700 bg-slate-950/80 p-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              placeholder="Ask for dosing guidance, troubleshooting steps, or grant support…"
              value={input}
              onChange={(event) => setInput(event.target.value)}
            />
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 hover:border-brand-400 hover:text-brand-200"
                >
                  Prompt library
                </button>
                <button
                  type="button"
                  className="rounded-md border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 hover:border-brand-400 hover:text-brand-200"
                >
                  Retrieval inspector
                </button>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:bg-brand-500/60"
              >
                Send
              </button>
            </div>
          </form>
        </footer>
      </section>

      <aside className="hidden flex-col rounded-2xl border border-slate-800 bg-slate-950/80 p-5 lg:flex">
        <h3 className="text-sm font-semibold text-slate-100">Retrieved context</h3>
        <p className="mt-2 text-xs text-slate-500">
          The assistant surfaces the most relevant documents from the internal corpus. Replace this placeholder
          with real retrieval data returned by the API.
        </p>
        <div className="mt-4 space-y-3 text-sm text-slate-200">
          {SAMPLE_CITATIONS.map((citation) => (
            <div key={citation.id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{citation.id}</p>
              <p className="mt-1 text-sm font-semibold text-slate-100">{citation.title}</p>
              <p className="mt-2 text-xs text-slate-400">{citation.snippet}</p>
              <button className="mt-3 text-xs font-semibold text-brand-200 hover:text-brand-100">Open source</button>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
};

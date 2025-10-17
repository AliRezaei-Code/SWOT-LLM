import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Citation = { id: string; title: string; snippet: string };

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Citation[];
};

const SYSTEM_MESSAGE: Message = {
  id: "system-welcome",
  role: "system",
  content:
    "Hi! I'm the Water Quality Technical Assistant. Ask for dosing guidance, SOP directives, or help with grant content."
};

type ParsedEvent =
  | { event: "conversation"; data: { conversationId: string } }
  | { event: "citations"; data: { citations: Citation[] } }
  | { event: "token"; data: { token: string } }
  | { event: "done"; data: { conversationId: string; citations: Citation[] } }
  | { event: "error"; data: { message: string } }
  | { event: "close"; data: Record<string, never> }
  | null;

const KNOWN_EVENTS = new Set(["conversation", "citations", "token", "done", "error", "close"]);

const parseSseEvent = (payload: string): ParsedEvent => {
  const lines = payload.split("\n");
  let event = "message";
  let data = "";

  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.replace("event:", "").trim();
    }
    if (line.startsWith("data:")) {
      data += line.replace("data:", "").trim();
    }
  }

  if (!data) {
    return null;
  }

  try {
    if (!KNOWN_EVENTS.has(event)) {
      return null;
    }
    return { event: event as ParsedEvent["event"], data: JSON.parse(data) } as ParsedEvent;
  } catch (_error) {
    return null;
  }
};

import { useEffect } from "react";

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([SYSTEM_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [activeCitations, setActiveCitations] = useState<Citation[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const appendAssistantToken = useCallback((token: string, assistantId: string) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === assistantId
          ? {
              ...message,
              content: `${message.content}${token}`
            }
          : message
      )
    );
  }, []);

  const setAssistantCitations = useCallback((citations: Citation[], assistantId: string) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === assistantId
          ? {
              ...message,
              citations
            }
          : message
      )
    );
  }, []);

  const setAssistantError = useCallback((assistantId: string, message: string) => {
    setMessages((prev) =>
      prev.map((item) =>
        item.id === assistantId
          ? {
              ...item,
              content: message
            }
          : item
      )
    );
  }, []);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
    },
    []
  );

  const helperActions = useMemo(
    () => [
      {
        label: "Prompt library",
        onClick: () => setErrorMessage("Prompt library integration is coming soon.")
      },
      {
        label: "Retrieval inspector",
        onClick: () => {
          if (activeCitations.length === 0) {
            setErrorMessage("Submit a question first to inspect retrieval context.");
          }
        }
      }
    ],
    [activeCitations.length]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setErrorMessage(null);

    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed
    };
    const assistantId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: "assistant", content: "" }
    ]);
    setActiveCitations([]);
    setInput("");
    setIsLoading(true);

    try {
      const controller = new AbortController();
      controllerRef.current = controller;

      const response = await fetch("/api/chat", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: trimmed,
          conversationId
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body received from server.");
      }

      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const rawEvent = buffer.slice(0, boundary).trim();
          buffer = buffer.slice(boundary + 2);
          boundary = buffer.indexOf("\n\n");

          const parsed = parseSseEvent(rawEvent);
          if (!parsed) continue;

          switch (parsed.event) {
            case "conversation":
              setConversationId(parsed.data.conversationId);
              break;
            case "citations":
              setActiveCitations(parsed.data.citations ?? []);
              setAssistantCitations(parsed.data.citations ?? [], assistantId);
              break;
            case "token":
              appendAssistantToken(parsed.data.token ?? "", assistantId);
              break;
            case "done":
              setConversationId(parsed.data.conversationId);
              setAssistantCitations(parsed.data.citations ?? [], assistantId);
              break;
            case "error":
              setErrorMessage(parsed.data.message ?? "An unknown error occurred.");
              setAssistantError(assistantId, parsed.data.message ?? "Generation failed.");
              break;
            case "close":
            default:
              break;
          }
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong while contacting the backend.";
      setErrorMessage(message);
      setAssistantError(assistantId, message);
    } finally {
      setIsLoading(false);
      formRef.current?.reset();
      controllerRef.current = null;
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-6rem)] gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="flex flex-col rounded-2xl border border-slate-800 bg-slate-950/80">
        <header className="border-b border-slate-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-100">Chat</h2>
          <p className="text-sm text-slate-400">
            Conversations stay grounded in the internal corpus. Answers stream live with citations to the source
            material.
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
              <p className="mt-2 whitespace-pre-wrap">{message.content || "…"}</p>
              {message.citations && message.citations.length > 0 ? (
                <div className="mt-3 space-y-2 text-xs text-slate-400">
                  <p className="font-semibold uppercase tracking-wide text-slate-500">Citations</p>
                  <ul className="space-y-1">
                    {message.citations.map((citation) => (
                      <li
                        key={citation.id}
                        className="rounded-md border border-slate-800 bg-slate-950/60 p-2 font-mono text-[11px]"
                      >
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
                {helperActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={action.onClick}
                    className="rounded-md border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 hover:border-brand-400 hover:text-brand-200"
                  >
                    {action.label}
                  </button>
                ))}
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
          {errorMessage ? (
            <p className="mt-3 text-xs text-red-400">Error: {errorMessage}</p>
          ) : null}
        </footer>
      </section>

      <aside className="hidden flex-col rounded-2xl border border-slate-800 bg-slate-950/80 p-5 lg:flex">
        <h3 className="text-sm font-semibold text-slate-100">Retrieved context</h3>
        <p className="mt-2 text-xs text-slate-500">
          The assistant surfaces the most relevant documents from the internal corpus. Sources update as
          responses stream in.
        </p>
        <div className="mt-4 space-y-3 text-sm text-slate-200">
          {activeCitations.length === 0 ? (
            <p className="text-xs text-slate-500">Submit a question to load retrieval context.</p>
          ) : (
            activeCitations.map((citation) => (
              <div key={citation.id} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{citation.id}</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{citation.title}</p>
                <p className="mt-2 text-xs text-slate-400">{citation.snippet}</p>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
};

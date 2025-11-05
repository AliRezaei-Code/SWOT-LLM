"use client";

import * as React from "react";
import { createParser, type ParsedEvent, type ReconnectInterval } from "eventsource-parser";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageList } from "@/components/chat/MessageList";
import { InputBar } from "@/components/chat/InputBar";
import { RightPane } from "@/components/chat/RightPane";
import { cn } from "@/lib/utils";
import type { Citation, GroundednessAssessment } from "@/lib/rag/answer";

const makeId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

export type UiChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  groundedness?: GroundednessAssessment;
  streaming?: boolean;
};

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);
  return prefersReducedMotion;
}

export function Chat() {
  const [messages, setMessages] = React.useState<UiChatMessage[]>([]);
  const [selectedCitation, setSelectedCitation] = React.useState<Citation | null>(null);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [abortController, setAbortController] = React.useState<AbortController | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  React.useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    document.body.dataset.reducedMotion = prefersReducedMotion ? "true" : "false";
  }, [prefersReducedMotion]);

  const appendMessage = React.useCallback((message: UiChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const updateLastMessage = React.useCallback((updater: (prev: UiChatMessage) => UiChatMessage) => {
    setMessages((prev) => {
      if (prev.length === 0) {
        return prev;
      }
      const next = [...prev];
      const last = next[next.length - 1];
      next[next.length - 1] = updater(last);
      return next;
    });
  }, []);

  const handleStop = React.useCallback(() => {
    abortController?.abort();
    setIsStreaming(false);
  }, [abortController]);

  const handleSend = React.useCallback(
    async (input: string) => {
      const trimmed = input.trim();
      if (!trimmed || isStreaming) {
        return;
      }

      const userMessage: UiChatMessage = {
        id: makeId(),
        role: "user",
        content: trimmed,
      };
      appendMessage(userMessage);

      const assistantMessage: UiChatMessage = {
        id: makeId(),
        role: "assistant",
        content: "",
        citations: [],
        streaming: true,
      };
      appendMessage(assistantMessage);

      const controller = new AbortController();
      setAbortController(controller);
      setIsStreaming(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Chat failed with status ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body from server");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        const parser = createParser((event: ParsedEvent | ReconnectInterval) => {
          if (event.type !== "event") {
            return;
          }
          if (event.event === "token") {
            updateLastMessage((prev) => ({
              ...prev,
              content: prev.content + event.data,
            }));
            return;
          }

          if (event.event === "done") {
            try {
              const payload = JSON.parse(event.data) as {
                citations: Citation[];
                groundedness: GroundednessAssessment;
              };
              updateLastMessage((prev) => ({
                ...prev,
                citations: payload.citations,
                groundedness: payload.groundedness,
                streaming: false,
              }));
              if (payload.citations?.length) {
                setSelectedCitation(payload.citations[0]);
              }
            } catch (error) {
              console.error("Failed to parse done payload", error);
            }
            setIsStreaming(false);
            setAbortController(null);
            return;
          }

          if (event.event === "error") {
            try {
              const payload = JSON.parse(event.data) as { message?: string };
              toast.error(payload.message ?? "Chat error");
            } catch (error) {
              toast.error("Chat error");
            }
            setIsStreaming(false);
            setAbortController(null);
          }
        });

        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          parser.feed(decoder.decode(value, { stream: true }));
        }
        parser.feed(decoder.decode());
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          toast.info("Generation stopped");
        } else {
          console.error(error);
          toast.error((error as Error).message);
        }
        setIsStreaming(false);
        setAbortController(null);
        updateLastMessage((prev) => ({ ...prev, streaming: false }));
      }
    },
    [appendMessage, isStreaming, updateLastMessage],
  );

  return (
    <section className="flex flex-1 flex-col gap-4 p-4 md:flex-row" aria-label="SWOT chatbot">
      <Card className="flex flex-1 flex-col">
        <CardContent className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-semibold">SWOT Chatbot</h1>
              <p className="text-sm text-muted-foreground">
                Ask questions about your internal corpus and inspect traceable citations.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleStop}
              disabled={!isStreaming}
              aria-disabled={!isStreaming}
              aria-label="Stop streaming response"
            >
              Stop
            </Button>
          </div>
          <Separator />
          <div className="flex flex-1 gap-4 overflow-hidden">
            <ScrollArea className="flex-1">
              <MessageList
                messages={messages}
                onCitationSelect={setSelectedCitation}
                selectedCitation={selectedCitation}
              />
            </ScrollArea>
            <Separator orientation="vertical" className="hidden h-full md:flex" />
            <div className="hidden w-80 shrink-0 md:flex">
              <RightPane citation={selectedCitation} onClose={() => setSelectedCitation(null)} />
            </div>
          </div>
          <InputBar onSend={handleSend} disabled={isStreaming} />
        </CardContent>
      </Card>
      <div
        className={cn("md:hidden", selectedCitation ? "flex" : "hidden")}
        aria-live="polite"
      >
        <RightPane citation={selectedCitation} onClose={() => setSelectedCitation(null)} />
      </div>
    </section>
  );
}

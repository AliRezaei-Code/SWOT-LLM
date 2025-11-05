"use client";

import * as React from "react";
import { Clipboard, Loader2, ShieldAlert, ShieldCheck, UserRound, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CitationPill } from "@/components/chat/CitationPill";
import type { UiChatMessage } from "@/components/chat/Chat";
import type { Citation } from "@/lib/rag/answer";

interface MessageListProps {
  messages: UiChatMessage[];
  selectedCitation: Citation | null;
  onCitationSelect: (citation: Citation | null) => void;
}

export function MessageList({ messages, selectedCitation, onCitationSelect }: MessageListProps) {
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    anchorRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCopy = React.useCallback(async (message: UiChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedId(message.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      setCopiedId(null);
    }
  }, []);

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
        <Bot className="h-8 w-8" aria-hidden="true" />
        <p className="max-w-sm text-sm">
          Ask about recent SWOT analyses, internal briefings, or competitive intel. I will cite my sources
          so you can validate every claim.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-16">
      {messages.map((message) => {
        const isAssistant = message.role === "assistant";
        const icon = isAssistant ? Bot : UserRound;
        return (
          <article
            key={message.id}
            className={cn(
              "group relative flex flex-col gap-3 rounded-lg border border-border bg-card/40 p-4",
              isAssistant ? "" : "bg-muted/50",
            )}
            aria-live={message.streaming ? "polite" : undefined}
          >
            <header className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  {React.createElement(icon, { className: "h-4 w-4" })}
                </span>
                <Badge variant={isAssistant ? "secondary" : "outline"}>
                  {isAssistant ? "Assistant" : "You"}
                </Badge>
              </div>
              {isAssistant && message.content && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Copy response"
                  onClick={() => handleCopy(message)}
                >
                  {copiedId === message.id ? <ShieldCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                </Button>
              )}
            </header>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {message.content ? message.content : message.streaming ? (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Generating answer…</span>
                </div>
              ) : (
                <span className="text-muted-foreground">No response produced.</span>
              )}
            </div>
            {isAssistant && message.groundedness && (
              <div className="flex items-center gap-2 text-xs">
                {message.groundedness.grounded ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                    Grounded ({Math.round(message.groundedness.confidence * 100)}%)
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                    Needs review
                  </Badge>
                )}
                {!message.groundedness.grounded && message.groundedness.missingEvidence?.length ? (
                  <span className="text-muted-foreground">
                    Missing evidence: {message.groundedness.missingEvidence.join(", ")}
                  </span>
                ) : null}
              </div>
            )}
            {isAssistant && message.citations && message.citations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {message.citations.map((citation) => (
                  <CitationPill
                    key={citation.id}
                    citation={citation}
                    active={selectedCitation?.id === citation.id}
                    onSelect={() => onCitationSelect(citation)}
                  />
                ))}
              </div>
            )}
          </article>
        );
      })}
      <div ref={anchorRef} />
    </div>
  );
}

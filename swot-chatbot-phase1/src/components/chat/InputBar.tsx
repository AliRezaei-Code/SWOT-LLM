"use client";

import * as React from "react";
import { SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface InputBarProps {
  onSend: (value: string) => void;
  disabled?: boolean;
}

export function InputBar({ onSend, disabled }: InputBarProps) {
  const [value, setValue] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const submit = React.useCallback(() => {
    if (!value.trim()) {
      return;
    }
    onSend(value);
    setValue("");
    textareaRef.current?.focus();
  }, [onSend, value]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submit();
      }
    },
    [submit],
  );

  return (
    <form
      className="flex flex-col gap-2 rounded-lg border border-border bg-background p-2"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      aria-label="Send a message"
    >
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={3}
        placeholder="Ask about strengths, weaknesses, opportunities, or threats…"
        aria-label="Message"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Press Enter to send · Shift+Enter for newline</span>
        <Button type="submit" size="sm" disabled={disabled || !value.trim()} aria-label="Send message">
          <SendHorizonal className="mr-1 h-4 w-4" aria-hidden="true" />
          Send
        </Button>
      </div>
    </form>
  );
}

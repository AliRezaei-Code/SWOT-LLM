"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Citation } from "@/lib/rag/answer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CitationPillProps {
  citation: Citation;
  active: boolean;
  onSelect: () => void;
}

export function CitationPill({ citation, active, onSelect }: CitationPillProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={active ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-1"
            onClick={onSelect}
            aria-pressed={active}
            aria-label={`View citation from ${citation.title}`}
          >
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
            {citation.title}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" align="start" className="max-w-xs text-xs">
          <p className="font-medium">{citation.title}</p>
          <p className="text-muted-foreground">Source {citation.documentId}:{citation.ordinal}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

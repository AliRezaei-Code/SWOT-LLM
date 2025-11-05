"use client";

import * as React from "react";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Citation } from "@/lib/rag/answer";

interface RightPaneProps {
  citation: Citation | null;
  onClose: () => void;
}

export function RightPane({ citation, onClose }: RightPaneProps) {
  const [content, setContent] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    if (!citation) {
      setContent("");
      setError(null);
      return () => {
        active = false;
      };
    }

    const fetchSource = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/sources?id=${encodeURIComponent(citation.id)}`);
        if (!response.ok) {
          throw new Error(`Failed to load source (${response.status})`);
        }
        const data = await response.json();
        if (!active) {
          return;
        }
        setContent(data.content ?? "");
      } catch (err) {
        if (!active) {
          return;
        }
        setError((err as Error).message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchSource();

    return () => {
      active = false;
    };
  }, [citation]);

  if (!citation) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-base">Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a citation to preview the referenced chunk. Sources open in this panel for quick
            verification.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full" aria-live="polite">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">{citation.title}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close source panel">
          <XCircle className="h-4 w-4" aria-hidden="true" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">Source {citation.documentId}:{citation.ordinal}</p>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-muted/50 p-3 text-sm">
            {content}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}

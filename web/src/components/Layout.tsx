import { ReactNode } from "react";

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-lg font-semibold text-brand-200">Water Quality Technical Assistant</h1>
            <p className="text-sm text-slate-400">
              Retrieval-augmented chat interface grounded in your internal corpus.
            </p>
          </div>
          <div className="hidden text-right text-xs text-slate-500 sm:block">
            <p>Mode: RAG Chat Prototype</p>
            <p>Next: Connect `/api/chat` to generation pipeline</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
};

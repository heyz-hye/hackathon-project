"use client";

import { useAuth } from "@/contexts/AuthContext";
import { sendDerryAiMessages, type DerryChatMessage } from "@/lib/derryAiApi";
import { useCallback, useEffect, useRef, useState } from "react";

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
      />
    </svg>
  );
}

export default function DerryAiChat() {
  const { user, token, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<DerryChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, open, sending, scrollToBottom]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || !token || sending) return;

    setError(null);
    const nextMessages: DerryChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const reply = await sendDerryAiMessages(token, nextMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      setMessages(messages);
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  if (loading || !user || !token) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-[70] flex flex-col items-end p-4 sm:p-6">
      <div className="pointer-events-auto flex flex-col items-end gap-3">
        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <section
              className="mb-0 flex max-h-[min(70vh,28rem)] w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border border-[rgba(192,57,43,0.35)] bg-[#0d0808]/95 shadow-[0_0_0_1px_rgba(255,45,45,0.08),0_24px_48px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:max-h-[32rem]"
              aria-hidden={!open}
            >
              <header className="flex shrink-0 items-start justify-between gap-2 border-b border-[rgba(192,57,43,0.25)] px-4 py-3">
                <div>
                  <p className="font-sans text-base font-semibold text-[#F5F5F5]">
                    Derry Ai
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF6B6B]/90">
                    CampusCompass
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-[#A89090] transition hover:bg-[rgba(192,57,43,0.2)] hover:text-[#F5F5F5]"
                  aria-label="Close chat"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </header>

              <div
                ref={listRef}
                className="min-h-[12rem] flex-1 space-y-3 overflow-y-auto px-4 py-3"
              >
                {messages.length === 0 && !sending ? (
                  <p className="rounded-xl border border-[rgba(192,57,43,0.2)] bg-[#1A0D0D]/80 px-3 py-2.5 font-sans text-sm leading-relaxed text-[#A89090]">
                    Ask me anything about CampusCompass—navigation, pantries,
                    study spots, events, or the budget tools.
                  </p>
                ) : null}

                {messages.map((m, i) => (
                  <div
                    key={`${m.role}-${i}`}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[92%] rounded-xl px-3 py-2 font-sans text-sm leading-relaxed ${
                        m.role === "user"
                          ? "border border-[rgba(255,45,45,0.35)] bg-[rgba(192,57,43,0.22)] text-[#F5F5F5]"
                          : "border border-[rgba(192,57,43,0.2)] bg-[#1A0D0D]/90 text-[#E8DEDE]"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}

                {sending ? (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-xl border border-[rgba(192,57,43,0.2)] bg-[#1A0D0D]/90 px-3 py-2 font-mono text-xs text-[#A89090]">
                      <span
                        className="inline-block h-3 w-3 animate-pulse rounded-full bg-[#FF2D2D]/70"
                        aria-hidden
                      />
                      Thinking…
                    </div>
                  </div>
                ) : null}

                {error ? (
                  <p className="rounded-lg border border-[#FF2D2D]/40 bg-[rgba(192,57,43,0.15)] px-3 py-2 font-mono text-xs text-[#FF6B6B]">
                    {error}
                  </p>
                ) : null}
              </div>

              <footer className="shrink-0 border-t border-[rgba(192,57,43,0.25)] p-3">
                <div className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                    placeholder="Ask about the app…"
                    rows={2}
                    disabled={sending}
                    className="input-hud max-h-24 min-h-[2.75rem] flex-1 resize-y font-sans text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={sending || !input.trim()}
                    className="btn-primary self-end px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </footer>
            </section>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            setError(null);
          }}
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2D2D]/60 ${
            open
              ? "border-[rgba(192,57,43,0.55)] bg-[#1A0D0D] text-[#FF6B6B] shadow-[0_0_20px_rgba(255,45,45,0.25)]"
              : "border-[rgba(255,45,45,0.45)] bg-gradient-to-br from-[#2a1515] to-[#120a0a] text-[#F5F5F5] shadow-[0_8px_28px_rgba(0,0,0,0.45),0_0_18px_rgba(255,45,45,0.35)] hover:border-[#FF2D2D] hover:shadow-[0_0_24px_rgba(255,45,45,0.45)]"
          }`}
          aria-expanded={open}
          aria-label={open ? "Close Derry Ai chat" : "Open Derry Ai chat"}
        >
          {open ? (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <ChatIcon className="h-7 w-7" />
          )}
        </button>
      </div>
    </div>
  );
}

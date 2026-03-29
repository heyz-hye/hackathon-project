import { API_BASE, authHeaders } from "./api";

export type DerryChatRole = "user" | "assistant";

export type DerryChatMessage = { role: DerryChatRole; content: string };

export async function sendDerryAiMessages(
  token: string,
  messages: DerryChatMessage[]
): Promise<string> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ messages }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string" ? data.error : "Chat request failed"
    );
  }
  return typeof data.reply === "string" ? data.reply : "";
}

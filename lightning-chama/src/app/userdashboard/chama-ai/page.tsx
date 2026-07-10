"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Loader2, RefreshCw, Send, Sparkles, UserRound, Users } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import SatsAmount from "@/components/SatsAmount";
import { useBitcoinKesRate } from "@/hooks/useBitcoinKesRate";

type ChamaRecommendation = {
  chamaReference: string;
  name: string;
  description?: string;
  contributionAmount?: number;
  visibility?: string;
  maxMembers?: number;
  iconUrl?: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommendedChamas?: ChamaRecommendation[];
};

type ChatResponse = {
  conversationId: string;
  response: string;
};

type ApiErrorResponse = {
  message?: string;
  error?: string;
  status?: number;
};

const SUGGESTED_PROMPTS = [
  "What is a chama?",
  "Recommend low-risk chamas",
  "Help me save for a laptop",
  "How much should I contribute monthly?",
];

const STORAGE_KEY = "chamaAiChat";

const createMessage = (role: ChatMessage["role"], content: string): ChatMessage => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  role,
  content,
});

const extractError = (data: ApiErrorResponse | null, fallback: string) => {
  if (!data) return fallback;
  return data.message || data.error || fallback;
};

const getFriendlyAiError = (data: ApiErrorResponse | null, fallback: string) => {
  const rawMessage = extractError(data, fallback);
  const lowerMessage = rawMessage.toLowerCase();

  if (
    data?.status === 429 ||
    lowerMessage.includes("429") ||
    lowerMessage.includes("quota exceeded") ||
    lowerMessage.includes("rate-limits")
  ) {
    const retryMatch = rawMessage.match(/retry in ([\d.]+)s/i);
    const retrySeconds = retryMatch ? Math.ceil(Number(retryMatch[1])) : null;
    return retrySeconds
      ? `The AI guide is busy right now. Please try again in about ${retrySeconds} seconds.`
      : "The AI guide is busy right now. Please wait a moment, then try again.";
  }

  return rawMessage;
};

const extractChamaReferences = (text: string) => {
  const uuidPattern = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";
  const explicitReferencePattern = new RegExp(
    `(?:Chama\\s+Reference|Reference|Ref)\\s*:?\\s*\`?(${uuidPattern})\`?`,
    "gi"
  );
  const backtickedUuidPattern = new RegExp(`\`(${uuidPattern})\``, "gi");

  return Array.from(new Set([
    ...Array.from(text.matchAll(explicitReferencePattern), (match) => match[1]),
    ...Array.from(text.matchAll(backtickedUuidPattern), (match) => match[1]),
  ]));
};

const normalizeChama = (data: unknown, fallbackReference: string): ChamaRecommendation | null => {
  const candidate = data && typeof data === "object" && "chama" in data
    ? (data as { chama?: unknown }).chama
    : data;

  if (!candidate || typeof candidate !== "object") return null;

  const chama = candidate as Partial<ChamaRecommendation>;
  return {
    chamaReference: chama.chamaReference || fallbackReference,
    name: chama.name || "Recommended chama",
    description: chama.description,
    contributionAmount: chama.contributionAmount,
    visibility: chama.visibility,
    maxMembers: chama.maxMembers,
    iconUrl: chama.iconUrl,
  };
};

export default function ChamaAiPage() {
  const { exchangeRate, loadingRate } = useBitcoinKesRate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage(
      "assistant",
      "Hi, I can help you understand chamas, compare contribution goals, and discover groups that fit your savings style. What would you like to work toward?"
    ),
  ]);
  const [conversationId, setConversationId] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const canSend = input.trim().length > 0 && !loading;

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as { conversationId?: string; messages?: ChatMessage[] };
      if (parsed.messages?.length) setMessages(parsed.messages);
      if (parsed.conversationId) setConversationId(parsed.conversationId);
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ conversationId, messages }));
  }, [conversationId, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const latestAssistantMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === "assistant"),
    [messages]
  );

  const sendMessage = async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed || loading) return;

    setError("");
    setLoading(true);
    setInput("");
    setMessages((current) => [...current, createMessage("user", trimmed)]);

    try {
      const token = localStorage.getItem("token");
      const userReference = localStorage.getItem("userReference");

      if (!token || !userReference) {
        setError("Not authenticated");
        return;
      }

      const response = await fetch(
        "https://dada-devs-labs-dada-lab2-chamavault.onrender.com/messaging/chama-chat-ai/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-USER_ID": userReference,
          },
          body: JSON.stringify({
            message: trimmed,
            ...(conversationId ? { conversationId } : {}),
          }),
        }
      );

      const data = await response.json().catch(() => null) as ChatResponse | ApiErrorResponse | null;

      if (!response.ok) {
        const friendlyError = getFriendlyAiError(
          data as ApiErrorResponse | null,
          "Unable to get a response. Please try again."
        );
        setError(friendlyError);
        setMessages((current) => [
          ...current,
          createMessage("assistant", friendlyError),
        ]);
        return;
      }

      const chatData = data as ChatResponse;
      const recommendedChamas = await fetchRecommendedChamas(chatData.response || "", token);

      setConversationId(chatData.conversationId);
      setMessages((current) => [
        ...current,
        {
          ...createMessage("assistant", chatData.response || "I received your message, but I do not have a response yet."),
          recommendedChamas,
        },
      ]);
    } catch {
      setError("Failed to connect to the AI assistant. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedChamas = async (responseText: string, token: string) => {
    const references = extractChamaReferences(responseText);
    if (references.length === 0) return undefined;

    const results = await Promise.all(
      references.map(async (reference) => {
        try {
          const response = await fetch(
            `https://dada-devs-labs-dada-lab2-chamavault.onrender.com/chama/${reference}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) return null;

          const data = await response.json();
          return normalizeChama(data, reference);
        } catch {
          return null;
        }
      })
    );

    const chamas = results.filter((chama): chama is ChamaRecommendation => Boolean(chama));
    return chamas.length > 0 ? chamas : undefined;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  const resetChat = () => {
    const starter = createMessage(
      "assistant",
      "Fresh start. Tell me your goal, risk comfort, and monthly contribution, and I can help you think through chama options."
    );
    setMessages([starter]);
    setConversationId("");
    setInput("");
    setError("");
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isAuthenticated={true} userName="" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mt-14 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/userdashboard"
              className="p-2 bg-white rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h1 className="text-xl font-bold text-gray-900">Chama AI Guide</h1>
              </div>
              <p className="text-sm text-gray-500">
                Ask about chama basics, contribution planning, and recommendation ideas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetChat}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6">
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden min-h-[640px] flex flex-col">
            <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Recommendation chat</p>
                  <p className="text-xs text-gray-500">
                    {conversationId ? `Conversation ${conversationId.slice(0, 8)}...` : "New conversation"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/60">
              {messages.map((message) => {
                const isUser = message.role === "user";
                return (
                  <div key={message.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                        isUser
                          ? "bg-emerald-600 text-white rounded-br-md"
                          : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                      }`}
                    >
                      {message.content}
                      {!isUser && message.recommendedChamas && message.recommendedChamas.length > 0 && (
                        <div className="mt-4 space-y-3 whitespace-normal">
                          {message.recommendedChamas.map((chama) => (
                            <Link
                              key={chama.chamaReference}
                              href={`/userdashboard/contribute/${chama.chamaReference}`}
                              className="block rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 hover:bg-emerald-50 transition"
                            >
                              <div className="flex gap-3">
                                <div className="h-12 w-12 rounded-full bg-white overflow-hidden flex items-center justify-center shrink-0 border border-emerald-100">
                                  {chama.iconUrl ? (
                                    <img
                                      src={chama.iconUrl}
                                      alt={chama.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <Users className="h-5 w-5 text-emerald-700" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="font-semibold text-gray-900 truncate">{chama.name}</p>
                                      <p className="text-[11px] text-gray-500 break-all">{chama.chamaReference}</p>
                                    </div>
                                    {chama.visibility && (
                                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
                                        {chama.visibility}
                                      </span>
                                    )}
                                  </div>
                                  {chama.description && (
                                    <p className="mt-1 text-xs text-gray-600 line-clamp-2">{chama.description}</p>
                                  )}
                                  <div className="mt-2 flex items-end justify-between gap-3">
                                    {typeof chama.contributionAmount === "number" ? (
                                      <SatsAmount
                                        sats={chama.contributionAmount}
                                        exchangeRate={exchangeRate}
                                        loadingRate={loadingRate}
                                        primaryClassName="text-xs font-semibold text-gray-900"
                                        detailClassName="text-[10px] text-gray-500"
                                      />
                                    ) : (
                                      <span className="text-xs text-gray-500">Contribution unavailable</span>
                                    )}
                                    {typeof chama.maxMembers === "number" && (
                                      <span className="text-xs text-gray-500">Max {chama.maxMembers} members</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0">
                        <UserRound className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 text-sm text-gray-500 inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {error && (
              <p className="mx-4 mt-3 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-end gap-3">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about chamas, goals, risk, or contribution plans..."
                  rows={2}
                  className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage(input);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="h-12 w-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h2 className="font-semibold text-gray-900 mb-2">Try asking</h2>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    disabled={loading}
                    className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-emerald-600 rounded-xl shadow-sm p-4 text-white">
              <h2 className="font-semibold mb-2">Better recommendations</h2>
              <p className="text-sm text-emerald-50">
                Mention your goal, monthly budget, timeline, and risk comfort. The assistant can keep context within this chat.
              </p>
            </div>

            {latestAssistantMessage && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h2 className="font-semibold text-gray-900 mb-2">Latest answer</h2>
                <p className="text-sm text-gray-600 line-clamp-6 whitespace-pre-line">
                  {latestAssistantMessage.content}
                </p>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

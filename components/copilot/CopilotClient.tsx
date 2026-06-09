"use client";

import { useState } from "react";
import { Bot, Send, User } from "lucide-react";

type Message = { role: "assistant" | "user"; content: string };

const starters = [
  "Which companies are improving ESG fastest?",
  "Show hidden ESG winners in technology.",
  "Why did DBS Group Holdings improve?"
];

export function CopilotClient() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Ask about ESG momentum, hidden winners, risk alerts, or why a company score changed. I will answer only from fetched analysis data." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question: trimmed })
      });
      const data = await response.json();
      setMessages((current) => [...current, { role: "assistant", content: data.answer || "I could not find enough evidence to answer that." }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "The copilot API is unavailable. Try again after the local server is running cleanly." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="copilot-shell">
      <div className="prompt-row">
        {starters.map((starter) => (
          <button className="secondary-btn fit" key={starter} onClick={() => ask(starter)} type="button">
            {starter}
          </button>
        ))}
      </div>
      <div className="chat-log">
        {messages.map((message, index) => (
          <div className={`chat-bubble ${message.role}`} key={`${message.role}-${index}`}>
            {message.role === "assistant" ? <Bot size={17} /> : <User size={17} />}
            <span>{message.content}</span>
          </div>
        ))}
        {loading && <div className="chat-bubble assistant typing"><Bot size={17} /><span>Reading ESG evidence...</span></div>}
      </div>
      <form className="chat-form" onSubmit={(event) => { event.preventDefault(); ask(input); }}>
        <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask the ESG copilot..." />
        <button className="primary-btn fit" type="submit"><Send size={17} /> Send</button>
      </form>
    </section>
  );
}

"use client";

import { useState } from "react";
import { Send } from "lucide-react";

type Message = { role: "user" | "assistant"; text: string };

export function CopilotClient() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Ask about hidden ESG winners, fastest improvers, or early-warning risks. I answer only from fetched ESG Alpha evidence." }
  ]);
  const [loading, setLoading] = useState(false);

  async function ask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = question.trim();
    if (!text) return;
    setMessages((current) => [...current, { role: "user", text }]);
    setQuestion("");
    setLoading(true);
    const response = await fetch("/api/copilot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question: text })
    });
    const data = await response.json();
    setMessages((current) => [...current, { role: "assistant", text: data.answer }]);
    setLoading(false);
  }

  return (
    <section className="copilot-shell">
      <div className="chat-log">
        {messages.map((message, index) => (
          <div className={`chat-bubble ${message.role}`} key={`${message.role}-${index}`}>{message.text}</div>
        ))}
        {loading ? <div className="chat-bubble assistant">Reading live evidence...</div> : null}
      </div>
      <form className="search-box" onSubmit={ask}>
        <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Which companies are improving ESG fastest?" />
        <button className="primary-btn" style={{ width: "auto", minWidth: 110 }} type="submit"><Send size={17} /> Ask</button>
      </form>
    </section>
  );
}

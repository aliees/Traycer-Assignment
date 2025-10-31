import React, { useState, useEffect, useRef } from "react";
import "./App.css";

interface Message {
  role: "user" | "assistant";
  content: any;
}

interface PlanStepDetail {
  type: "command" | "file" | "info";
  content: string;
  name?: string;
}

interface PlanStep {
  id: number;
  task: string;
  status: "pending" | "completed";
  details: PlanStepDetail[];
  generatedCode?: any;
}

const ChatMessage = ({
  message,
  onGenerateCode,
}: {
  message: Message;
  onGenerateCode: (plan: PlanStep[]) => void;
}) => {
  if (typeof message.content === "string") {
    return <div className={`message ${message.role}`}>{message.content}</div>;
  }

  if (message.content.plan) {
    return (
      <div className={`message ${message.role}`}>
        <div className="plan">
          {message.content.plan.map((step: PlanStep) => (
            <div key={step.id} className="plan-step">
              <div className="plan-step-header">
                <input
                  type="checkbox"
                  checked={step.status === "completed"}
                  readOnly
                />
                <span>{step.task}</span>
              </div>
              <div className="plan-step-details">
                {step.details.map((detail, index) => (
                  <div key={index} className={`detail detail-${detail.type}`}>
                    {detail.type === "command" && (
                      <pre>
                        <code>{detail.content}</code>
                      </pre>
                    )}
                    {detail.type === "file" && (
                      <div>
                        <strong>{detail.name}</strong>
                        <pre>
                          <code>{detail.content}</code>
                        </pre>
                      </div>
                    )}
                    {detail.type === "info" && <p>{detail.content}</p>}
                  </div>
                ))}
              </div>
              {step.generatedCode && (
                <div className="generated-code">
                  <h4>Generated Code:</h4>
                  {step.generatedCode.files.map((file: any, index: number) => (
                    <div key={index} className="file">
                      <strong>{file.name}</strong>
                      <pre>
                        <code>{file.content}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {message.content.confirmation &&
          !message.content.plan.every(
            (step: PlanStep) => step.status === "completed"
          ) && (
            <div className="confirmation">
              <p>{message.content.confirmation}</p>
              <button onClick={() => onGenerateCode(message.content.plan)}>
                Generate Code
              </button>
            </div>
          )}
      </div>
    );
  }
  if (message.content.question) {
    return (
      <div className={`message ${message.role}`}>
        {message.content.question}
      </div>
    );
  }
  return null;
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: input },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const messagesForApi = newMessages.map((msg) => {
      if (typeof msg.content === "object") {
        return { ...msg, content: JSON.stringify(msg.content) };
      }
      return msg;
    });

    try {
      const response = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesForApi }),
      });

      if (!response.ok)
        throw new Error("Failed to get response from the assistant");

      const data = await response.json();
      const newAssistantMessage: Message = { role: "assistant", content: data };
      setMessages([...newMessages, newAssistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I ran into an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async (plan: PlanStep[]) => {
    setLoading(true);

    let currentPlan = [...plan];

    for (const step of plan) {
      if (step.status === "pending") {
        try {
          const response = await fetch(
            "http://localhost:5000/api/generate-code",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ step, messages }),
            }
          );

          if (!response.ok)
            throw new Error(`Failed to generate code for step ${step.id}`);

          const data = await response.json();

          currentPlan = currentPlan.map((s) =>
            s.id === data.id
              ? { ...s, status: "completed", generatedCode: data }
              : s
          );
        } catch (error) {
          console.error(error);
          // Handle error in UI
          break; // Stop generation if a step fails
        }
      }
    }

    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.content.plan
          ? { ...msg, content: { ...msg.content, plan: currentPlan } }
          : msg
      )
    );

    setLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Traycer</h1>
        <p>Your AI-powered planning assistant</p>
      </header>
      <main className="App-main">
        <div className="chat-window">
          <div className="messages">
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg}
                onGenerateCode={handleGenerateCode}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
            />
            <button type="submit" disabled={loading}>
              {loading ? "Thinking..." : "Send"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;

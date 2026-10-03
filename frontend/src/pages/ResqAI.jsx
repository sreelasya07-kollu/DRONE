import {
  Bot,
  Send,
  BrainCircuit
} from "lucide-react";

import { useState } from "react";

import { askAI } from "../services/api";

export default function ResqAI() {

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text:
        "RESQ AI online. Ask about rescue protocols, victim prioritization, hazards, drone operations or emergency response."
    }
  ]);

  const [loading, setLoading] = useState(false);

  const send = async () => {

    if (!question.trim()) return;

    const current = question;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: current
      }
    ]);

    setQuestion("");
    setLoading(true);

    try {

      const response = await askAI(current);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            response.data.answer ||
            "No response received."
        }
      ]);

    } catch (error) {

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "Unable to connect to the RESQ AI service."
        }
      ]);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      <div className="page-header">

        <div>
          <div className="eyebrow">
            AI / DECISION SUPPORT
          </div>

          <h1>RESQ AI</h1>

          <p>
            Retrieval-augmented emergency response
            decision support.
          </p>
        </div>

        <div className="ai-status">
          <BrainCircuit size={17} />
          AI ENGINE ONLINE
        </div>

      </div>

      <div className="ai-layout">

        <div className="ai-sidebar">

          <div className="panel">

            <Bot size={30} />

            <h2>
              RESQ Intelligence
            </h2>

            <p>
              Query the operational knowledge
              base for response guidance.
            </p>

            <div className="ai-capability">
              ✓ Rescue protocols
            </div>

            <div className="ai-capability">
              ✓ Victim prioritization
            </div>

            <div className="ai-capability">
              ✓ Hazard management
            </div>

            <div className="ai-capability">
              ✓ Drone operations
            </div>

            <div className="ai-capability">
              ✓ Route planning
            </div>

          </div>

        </div>

        <div className="ai-chat panel">

          <div className="chat-header">
            <div>
              <strong>RESQ AI ASSISTANT</strong>
              <span>DECISION SUPPORT CHANNEL</span>
            </div>

            <span className="online-dot">
              ONLINE
            </span>
          </div>

          <div className="chat-messages">

            {messages.map((message, index) => (
              <div
                key={index}
                className={`chat-message ${message.role}`}
              >

                <div className="chat-avatar">
                  {message.role === "ai"
                    ? <Bot size={15} />
                    : "C"}
                </div>

                <div className="chat-bubble">
                  {message.text}
                </div>

              </div>
            ))}

            {loading && (
              <div className="chat-message ai">
                <div className="chat-avatar">
                  <Bot size={15} />
                </div>

                <div className="chat-bubble">
                  ANALYZING...
                </div>
              </div>
            )}

          </div>

          <div className="chat-input">

            <input
              placeholder="Ask RESQ AI..."
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  send();
                }
              }}
            />

            <button onClick={send}>
              <Send size={18} />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
"use client";

import { useState, useRef, useEffect, FormEvent, ChangeEvent } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { MdMessage } from "react-icons/md";
import { LuTextCursorInput } from "react-icons/lu";

import Modal from "./modal";
import Ragsubmit from "./ragsubmit";

// Define message object
interface Message {
  text: string;
  sender: "user" | "other";
}

// Fetching response from gen ai endpoint
const GetResponse = async (
  messages: Message[]
): Promise<{ success: boolean; body?: { message: { content: string } } }> => {
  const data = { message: messages };
  const headers = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  return await fetch("/api/chat", headers)
    .then(async (data) => {
      const reader = data.body.getReader();
      const decoder = new TextDecoder();

      let result = "";

      return reader.read().then(function processText({ done, value }) {
        if (done) return result;

        const text = decoder.decode(value || new Uint8Array(), {
          stream: true,
        });
        result += text;

        return reader.read().then(processText);
      });
    })
    .then((text) => {
      return { success: true, body: text };
    })
    .catch((e) => {
      console.log(e.text);
      return { success: false };
    });
};

const Chatbox = () => {
  const initialMessage: Message = {
    text: "Hello, This is your Professor AI Chatbot assistant, how can I help you?",
    sender: "other",
  };
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);

  // Auto scroll if message overflow
  const scrollRef = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    if (scrollRef.current !== null) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Sending message
  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    // Check for no white space
    if (input.trim()) {
      const userMessage: Message = { text: input, sender: "user" };
      const newMessage = [...messages, userMessage];
      setMessages(newMessage);
      setInput("");
      setLoading(true);

      // Add loading message
      const loadingMessage: Message = { text: "...", sender: "other" };
      setMessages((prevMessages) => [...prevMessages, loadingMessage]);

      // Fetch the response from the backend
      const response = await GetResponse(newMessage);
      setLoading(false);

      // Update the messages list, replacing the loading message with the actual response
      if (response.success && response.body) {
        const aiResponse: Message = {
          text: String(response.body),
          sender: "other",
        };
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1), // Remove the last (loading) message
          aiResponse,
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1), // Remove the last (loading) message
          {
            text: "There was an error with generating our statement",
            sender: "other",
          },
        ]);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen rounded-lg bg-gray-50 w-full">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#F5851E] text-white px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <MdMessage size={30} />
          <h2 className="text-xl font-medium">Professor Review Assistant</h2>
        </div>
        <div className="inline-flex">
          {/* Open Modal for RAG */}
          <div className="flex items-center p-1">
            <button
              onClick={() => setOpenModal(true)}
              className="rounded-full p-2 hover:bg-white hover:text-[#F5851E] text-white transition duration-300"
            >
              <LuTextCursorInput size={30} />
            </button>
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
              <div className="px-2 py-6">
                <Ragsubmit />
              </div>
            </Modal>
          </div>
        </div>
      </div>

      {/* Message box */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          // Messages
          <div
            key={index}
            // w-max: set max width based on child
            // max-w-75%: max possible width of message
            className={`flex w-max max-w-[75%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
              // user messages are blue, other is gray
              msg.sender === "user"
                ? "ml-auto bg-[#F5851E] text-white"
                : "bg-gray-200"
            }`}
          >
            {msg.text}
          </div>
        ))}

        <span ref={scrollRef} />
      </div>

      {/* Submission */}
      <div className="border-t px-4 py-3">
        <form onSubmit={handleSend} className="flex items-center w-full gap-2">
          {/* Input for textfield */}
          <input
            placeholder="Type your message..."
            value={input}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setInput(e.target.value);
            }}
            className="flex px-4 py-2 border rounded w-full focus:outline-none"
          />
          {/* Submit button */}
          <button
            type="submit"
            className="p-2 bg-[#F5851E] hover:bg-[#F5851E]/80 transition duration-300 text-white rounded-full"
          >
            <FaPaperPlane size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbox;

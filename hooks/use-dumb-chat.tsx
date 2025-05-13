"use client";

import { useState, useCallback } from "react";
import { nanoid } from "nanoid";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface UseDumbChatOptions {
  questions?: any[];
}

export function useDumbChat(options: UseDumbChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const append = useCallback(
    (message: { role: "user" | "assistant" | "system"; content: string }) => {
      const id = nanoid();
      const newMessage = { ...message, id };
      setMessages((prev) => [...prev, newMessage]);

      return id;
    },
    []
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim()) return;

      append({ role: "user", content: input });

      setInput("");
    },
    [input, append]
  );

  const stop = useCallback(() => {}, []);

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    isLoading,
    stop,
  };
}

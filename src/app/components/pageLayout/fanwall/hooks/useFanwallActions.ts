"use client";

import { useState } from "react";
import {
  getApiError,
  removeMessageById,
  upsertMessage,
} from "../message-state";
import type {
  ApiResponse,
  FanwallError,
  FanwallMessage,
  FanwallUser,
} from "../types";

type UseFanwallActionsParams = {
  sessionUser: FanwallUser | null;
  isAdmin: boolean;
  refreshMessages: () => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<FanwallMessage[]>>;
};

export function useFanwallActions({
  sessionUser,
  isAdmin,
  refreshMessages,
  setMessages,
}: UseFanwallActionsParams) {
  const [nickname, setNickname] = useState("");
  const [contact, setContact] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<FanwallError>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");

  async function submitMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const trimmedBody = body.trim();
    const trimmedTitle = title.trim();
    const trimmedNickname = nickname.trim();
    const trimmedContact = contact.trim();

    if (!sessionUser && (!trimmedNickname || !trimmedContact)) {
      setError("Nickname and contact are required for anonymous posts.");
      return;
    }

    if (!trimmedBody) {
      setError("Message is required.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/fanwall/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          body: trimmedBody,
          title: isAdmin ? trimmedTitle : undefined,
          nickname: sessionUser ? undefined : trimmedNickname,
          contact: sessionUser ? undefined : trimmedContact,
        }),
      });

      const data = (await response.json()) as ApiResponse<FanwallMessage>;

      if (!response.ok) {
        setError(getApiError(data, "Failed to post message."));
        return;
      }

      setBody("");
      setTitle("");

      if (!sessionUser) {
        setNickname("");
        setContact("");
      }

      const newMessage = data.message;

      if (newMessage) {
        setMessages((prev) => upsertMessage(prev, newMessage));
      }
    } catch {
      setError("Failed to post message.");
    } finally {
      setLoading(false);
    }
  }

  function startEditing(message: FanwallMessage) {
    setEditingId(message.id);
    setEditingBody(message.body);
  }

  function stopEditing() {
    setEditingId(null);
    setEditingBody("");
  }

  async function saveEdit(message: FanwallMessage) {
    const trimmedBody = editingBody.trim();

    if (!trimmedBody) {
      setError("Message is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/fanwall/messages/${message.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: trimmedBody }),
      });

      const data = (await response.json()) as ApiResponse<FanwallMessage>;

      if (!response.ok) {
        setError(getApiError(data, "Failed to update message."));
        return;
      }

      const updatedMessage = data.message;

      if (updatedMessage) {
        setMessages((prev) => upsertMessage(prev, updatedMessage));
      }

      stopEditing();
    } catch {
      setError("Failed to update message.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteMessage(message: FanwallMessage) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/fanwall/messages/${message.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as ApiResponse<FanwallMessage>;
        setError(getApiError(data, "Failed to delete message."));
        return;
      }

      setMessages((prev) => removeMessageById(prev, message.id));
    } catch {
      setError("Failed to delete message.");
    } finally {
      setLoading(false);
    }
  }

  async function togglePin(message: FanwallMessage) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/fanwall/messages/${message.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isPinned: !message.isPinned }),
      });

      const data = (await response.json()) as ApiResponse<FanwallMessage>;

      if (!response.ok) {
        setError(getApiError(data, "Failed to update pin."));
        return;
      }

      const updatedMessage = data.message;

      if (updatedMessage) {
        setMessages((prev) => upsertMessage(prev, updatedMessage));
      }

      await refreshMessages();
    } catch {
      setError("Failed to update pin.");
    } finally {
      setLoading(false);
    }
  }

  return {
    nickname,
    contact,
    title,
    body,
    error,
    loading,
    editingId,
    editingBody,
    setNickname,
    setContact,
    setTitle,
    setBody,
    setEditingBody,
    submitMessage,
    startEditing,
    stopEditing,
    saveEdit,
    deleteMessage,
    togglePin,
  };
}

"use client";

import { useEffect, useState } from "react";
import {
  getApiError,
  removeMessageById,
  upsertMessage,
} from "../components/pageLayout/fanwall/message-state";
import type {
  ApiResponse,
  FanwallError,
  FanwallMessage,
  FanwallUser,
} from "../components/pageLayout/fanwall/types";

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
  const [isWriteCheckLoading, setIsWriteCheckLoading] = useState(false);
  const [writeBlockMessages, setWriteBlockMessages] = useState<{
    create: string | null;
    update: string | null;
    delete: string | null;
  }>({
    create: null,
    update: null,
    delete: null,
  });

  const writeBlockMessage = writeBlockMessages.create;

  useEffect(() => {
    let isCancelled = false;

    const loadWriteAccess = async () => {
      setIsWriteCheckLoading(true);
      try {
        const loadActionBlock = async (
          action: "FANWALL_CREATE" | "FANWALL_UPDATE" | "FANWALL_DELETE",
          label: string,
        ) => {
          const response = await fetch(
            `/api/moderation/write-access?action=${action}`,
            {
              cache: "no-store",
            },
          );

          const payload = (await response.json()) as {
            blocked?: boolean;
            reason?: string;
            endsAt?: string | null;
          };

          if (!response.ok || !payload.blocked) {
            return null;
          }

          const endsAtLabel = payload.endsAt
            ? ` until ${new Date(payload.endsAt).toLocaleString("cs-CZ")}`
            : " permanently";

          return `You are blocked from ${label}${endsAtLabel}. Reason: ${payload.reason ?? "No reason provided"}`;
        };

        const [createMessage, updateMessage, deleteMessage] = await Promise.all(
          [
            loadActionBlock("FANWALL_CREATE", "writing fanwall messages"),
            loadActionBlock("FANWALL_UPDATE", "editing fanwall messages"),
            loadActionBlock("FANWALL_DELETE", "deleting fanwall messages"),
          ],
        );

        if (!isCancelled) {
          setWriteBlockMessages({
            create: createMessage,
            update: updateMessage,
            delete: deleteMessage,
          });
        }
      } catch {
        if (!isCancelled) {
          setWriteBlockMessages({
            create: null,
            update: null,
            delete: null,
          });
        }
      } finally {
        if (!isCancelled) {
          setIsWriteCheckLoading(false);
        }
      }
    };

    loadWriteAccess();

    return () => {
      isCancelled = true;
    };
  }, []);

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

    if (writeBlockMessage) {
      setError(writeBlockMessage);
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
    if (writeBlockMessages.update) {
      setError(writeBlockMessages.update);
      return;
    }

    setEditingId(message.id);
    setEditingBody(message.body);
  }

  function stopEditing() {
    setEditingId(null);
    setEditingBody("");
  }

  async function saveEdit(message: FanwallMessage) {
    if (writeBlockMessages.update) {
      setError(writeBlockMessages.update);
      return;
    }

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
    if (writeBlockMessages.delete) {
      setError(writeBlockMessages.delete);
      return;
    }

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
    writeBlockMessage,
    writeBlockMessages,
    isWriteCheckLoading,
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

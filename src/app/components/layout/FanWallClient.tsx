"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import AutoResizeTextarea from "../ui/form/AutoResizeTextarea";
import Badge from "../ui/Badge";

import { BsPinFill } from "react-icons/bs";
import { BsFillPinAngleFill } from "react-icons/bs";
import { BsThreeDotsVertical } from "react-icons/bs";
import { IoTrash } from "react-icons/io5";
import { FaPen } from "react-icons/fa6";
import { PiPaperPlaneRightFill } from "react-icons/pi";

type FanwallUser = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
  role: string | null;
};

type FanwallMessage = {
  id: string;
  body: string;
  title: string | null;
  nickname: string | null;
  contact: string | null;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  user: FanwallUser | null;
};

type FanWallClientProps = {
  initialMessages: FanwallMessage[];
  sessionUser: FanwallUser | null;
  isAdmin: boolean;
};

type FanwallError = string | null;

const DEFAULT_AVATAR = "/uploads/avatars/alien.png";

function getAuthorName(message: FanwallMessage) {
  return (
    message.user?.name || message.user?.username || message.nickname || "Guest"
  );
}

function getAvatarSrc(message: FanwallMessage) {
  return message.user?.image || DEFAULT_AVATAR;
}

type PinnedMessageCardProps = {
  message: FanwallMessage;
  isAdmin: boolean;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onTogglePin: (message: FanwallMessage) => void;
  onCloseMenu: () => void;
};

function PinnedMessageCard({
  message,
  isAdmin,
  isMenuOpen,
  onToggleMenu,
  onTogglePin,
  onCloseMenu,
}: PinnedMessageCardProps) {
  const authorName = getAuthorName(message);
  const avatarSrc = getAvatarSrc(message);

  return (
    <div className="bg-neutral-200 py-4 dark:bg-[#444444]">
      <div className="group relative flex flex-row items-center justify-baseline gap-2 px-2 md:gap-4 md:px-6">
        <div>
          <Image
            src={avatarSrc}
            alt="profile-avatar"
            className="h-20 w-20 rounded-full object-cover md:h-16 md:w-16"
            width={65}
            height={65}
          />
          <Badge />
        </div>
        <div className="flex flex-col space-y-1">
          {message.title && <h5 className="font-medium">{message.title}</h5>}
          <p>{authorName}</p>
          <div className="rounded-lg bg-neutral-300 px-4 py-2 shadow dark:bg-neutral-500">
            <p className="text-sm font-normal md:text-base">{message.body}</p>
          </div>
          {isAdmin && (
            <>
              <button
                className="fanwall-menu-button absolute top-2 right-2 rounded-full bg-neutral-300 p-1 opacity-100 transition-opacity hover:bg-neutral-400 md:opacity-0 md:group-hover:opacity-100 dark:bg-neutral-500 dark:hover:bg-neutral-400"
                onClick={onToggleMenu}
              >
                <BsThreeDotsVertical />
              </button>
              {isMenuOpen && (
                <div className="fanwall-menu absolute top-8 right-2 z-10 w-32 rounded-md bg-white shadow-lg dark:bg-neutral-600">
                  <button
                    className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm hover:rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-500"
                    onClick={() => {
                      onTogglePin(message);
                      onCloseMenu();
                    }}
                  >
                    {message.isPinned ? <BsFillPinAngleFill /> : <BsPinFill />}
                    Unpin
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type FanwallMessageItemProps = {
  message: FanwallMessage;
  sessionUser: FanwallUser | null;
  isAdmin: boolean;
  isEditing: boolean;
  editingBody: string;
  isMenuOpen: boolean;
  loading: boolean;
  onToggleMenu: () => void;
  onStartEdit: (message: FanwallMessage) => void;
  onStopEdit: () => void;
  onSaveEdit: (message: FanwallMessage) => void;
  onDelete: (message: FanwallMessage) => void;
  onTogglePin: (message: FanwallMessage) => void;
  onChangeEditingBody: (value: string) => void;
  onCloseMenu: () => void;
};

function FanwallMessageItem({
  message,
  sessionUser,
  isAdmin,
  isEditing,
  editingBody,
  isMenuOpen,
  loading,
  onToggleMenu,
  onStartEdit,
  onStopEdit,
  onSaveEdit,
  onDelete,
  onTogglePin,
  onChangeEditingBody,
  onCloseMenu,
}: FanwallMessageItemProps) {
  const authorName = getAuthorName(message);
  const avatarSrc = getAvatarSrc(message);
  const isOwner = sessionUser?.id && message.userId === sessionUser.id;
  const canEdit = Boolean(isOwner || isAdmin);
  const canDelete = Boolean(isOwner || isAdmin);

  return (
    <div className="group relative flex flex-row items-start justify-baseline gap-2 px-2 py-4 md:gap-4 md:px-6">
      <div className="md:w-auto">
        <Image
          src={avatarSrc}
          alt="profile-avatar"
          className="h-16 w-16 rounded-full object-cover md:h-20 md:w-20"
          width={65}
          height={65}
        />
      </div>
      <div className="flex w-4/5 flex-col space-y-1">
        {message.title && (
          <h5 className="text-lg font-medium text-neutral-700 dark:text-neutral-200">
            {message.title}
          </h5>
        )}
        <p>{authorName}</p>
        <div className="w-fit rounded-lg bg-neutral-300 px-4 py-2 shadow-md dark:bg-neutral-500">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <AutoResizeTextarea
                value={editingBody}
                onChange={onChangeEditingBody}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-dark cursor-pointer rounded-md bg-neutral-600 px-2 py-1 text-sm dark:text-white"
                  onClick={() => onSaveEdit(message)}
                  disabled={loading}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="cursor-pointer rounded-md border-2 border-neutral-400 px-2 py-1 text-sm text-black dark:text-white"
                  onClick={onStopEdit}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm font-light md:text-base">{message.body}</p>
          )}
        </div>
        {(canEdit || canDelete || isAdmin) && (
          <>
            <button
              title="Edit post"
              className="fanwall-menu-button absolute top-2 right-2 rounded-full bg-none p-1 opacity-100 transition-opacity md:bg-neutral-300 md:opacity-0 md:group-hover:opacity-100 md:hover:bg-neutral-400 md:dark:bg-neutral-600 md:dark:hover:bg-neutral-400"
              onClick={onToggleMenu}
            >
              <BsThreeDotsVertical />
            </button>
            {isMenuOpen && (
              <div className="fanwall-menu absolute top-8 right-2 z-10 w-32 rounded-md bg-white shadow-lg dark:bg-neutral-600">
                {canEdit && !isEditing && (
                  <button
                    className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm hover:bg-neutral-200 dark:hover:bg-neutral-500"
                    onClick={() => {
                      onStartEdit(message);
                      onCloseMenu();
                    }}
                  >
                    <FaPen />
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    title="Delete post"
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-200 dark:hover:bg-neutral-500"
                    onClick={() => {
                      onDelete(message);
                      onCloseMenu();
                    }}
                  >
                    <IoTrash />
                    Delete
                  </button>
                )}
                {isAdmin && (
                  <button
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-200 dark:hover:bg-neutral-500"
                    title="Pin post"
                    onClick={() => {
                      onTogglePin(message);
                      onCloseMenu();
                    }}
                  >
                    {message.isPinned ? <BsPinFill /> : <BsFillPinAngleFill />}
                    {message.isPinned ? "Unpin" : "Pin"}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

type FanwallFormProps = {
  sessionUser: FanwallUser | null;
  isAdmin: boolean;
  nickname: string;
  contact: string;
  title: string;
  body: string;
  error: FanwallError;
  loading: boolean;
  messageLabel: string;
  onNicknameChange: (value: string) => void;
  onContactChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

function FanwallForm({
  sessionUser,
  isAdmin,
  nickname,
  contact,
  title,
  body,
  error,
  loading,
  messageLabel,
  onNicknameChange,
  onContactChange,
  onTitleChange,
  onBodyChange,
  onSubmit,
}: FanwallFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full flex-row justify-center border-t-2 border-neutral-300 bg-neutral-200 px-4 py-4 text-neutral-700 md:px-16 dark:bg-neutral-700 dark:text-white"
    >
      {!sessionUser && (
        <div className="block w-full flex-row gap-2 py-2 md:flex md:w-1/2">
          <input
            type="text"
            placeholder="Nickname*"
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            className="mb-2 w-full rounded-md bg-neutral-300 py-2 indent-2 shadow-md ring-neutral-400 outline-none placeholder:text-neutral-400 focus:ring-2 md:mb-0 md:w-96 dark:bg-neutral-500 dark:placeholder:text-[#aaaaaa]"
          />
          <input
            type="text"
            placeholder="Contact*"
            value={contact}
            onChange={(e) => onContactChange(e.target.value)}
            className="mb-2 w-full rounded-md bg-neutral-300 py-2 indent-2 shadow-md ring-neutral-400 outline-none placeholder:text-neutral-400 focus:ring-2 md:mb-0 md:w-96 dark:bg-neutral-500 dark:placeholder:text-[#aaaaaa]"
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        {isAdmin && (
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="mb-2 w-full rounded-md bg-neutral-300 py-2 indent-2 shadow-md ring-neutral-400 outline-none placeholder:text-neutral-400 focus:ring-2 md:mb-0 md:w-1/2 dark:bg-neutral-500 dark:placeholder:text-[#aaaaaa]"
          />
        )}
        <AutoResizeTextarea
          placeholder="Type a message... Show your support or ask a question"
          value={body}
          onChange={onBodyChange}
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="text-xs text-neutral-500 dark:text-neutral-300">
          {messageLabel}
        </div>
        <button
          type="submit"
          className="flex cursor-pointer items-center gap-2 rounded-md bg-cyan-700 px-4 py-2 text-sm text-white shadow transition-colors hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send message"}
          <PiPaperPlaneRightFill />
        </button>
      </div>
    </form>
  );
}

export default function FanWallClient({
  initialMessages,
  sessionUser,
  isAdmin,
}: FanWallClientProps) {
  const [messages, setMessages] = useState<FanwallMessage[]>(initialMessages);
  const [nickname, setNickname] = useState("");
  const [contact, setContact] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<FanwallError>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const pinnedMessage = useMemo(
    () => messages.find((message) => message.isPinned) || null,
    [messages],
  );

  const otherMessages = useMemo(() => {
    return messages
      .filter((message) => !message.isPinned)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }, [messages]);

  useEffect(() => {
    const socketUrl =
      process.env.NEXT_PUBLIC_FANWALL_SOCKET_URL || "http://localhost:3001";

    const socket: Socket = io(socketUrl, {
      transports: ["websocket"],
    });

    socket.on("fanwall:created", (message: FanwallMessage) => {
      setMessages((prev) => {
        const exists = prev.some((item) => item.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
    });

    socket.on("fanwall:updated", (message: FanwallMessage) => {
      setMessages((prev) =>
        prev.map((item) => (item.id === message.id ? message : item)),
      );
    });

    socket.on("fanwall:deleted", ({ id }: { id: string }) => {
      setMessages((prev) => prev.filter((item) => item.id !== id));
    });

    socket.on("fanwall:refresh", () => void refreshMessages());

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target) return;

      if (
        !target.closest(".fanwall-menu") &&
        !target.closest(".fanwall-menu-button")
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function refreshMessages() {
    try {
      const response = await fetch("/api/fanwall/messages?limit=50", {
        cache: "no-store",
      });
      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages ?? []);
      }
    } catch {
      // ignore background refresh failures
    }
  }

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

      const data = await response.json();

      if (!response.ok) {
        const message =
          typeof data.error === "string"
            ? data.error
            : "Failed to post message.";
        setError(message);
        return;
      }

      setBody("");
      setTitle("");
      if (!sessionUser) {
        setNickname("");
        setContact("");
      }

      if (data.message) {
        setMessages((prev) => {
          const exists = prev.some((item) => item.id === data.message.id);
          if (exists) return prev;
          return [...prev, data.message];
        });
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

      const data = await response.json();

      if (!response.ok) {
        const message =
          typeof data.error === "string"
            ? data.error
            : "Failed to update message.";
        setError(message);
        return;
      }

      if (data.message) {
        setMessages((prev) =>
          prev.map((item) => (item.id === message.id ? data.message : item)),
        );
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
        const data = await response.json();
        const message =
          typeof data.error === "string"
            ? data.error
            : "Failed to delete message.";
        setError(message);
        return;
      }

      setMessages((prev) => prev.filter((item) => item.id !== message.id));
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

      const data = await response.json();

      if (!response.ok) {
        const message =
          typeof data.error === "string" ? data.error : "Failed to update pin.";
        setError(message);
        return;
      }

      if (data.message) {
        setMessages((prev) =>
          prev.map((item) => (item.id === message.id ? data.message : item)),
        );
      }

      await refreshMessages();
    } catch {
      setError("Failed to update pin.");
    } finally {
      setLoading(false);
    }
  }

  const sessionDisplayName =
    sessionUser?.name || sessionUser?.username || "Username";

  const messageLabel = sessionUser
    ? `You are posting as ${sessionDisplayName}`
    : "";

  const toggleMenu = (id: string) =>
    setOpenMenuId((prev) => (prev === id ? null : id));

  return (
    <div className="mx-auto my-3 w-full px-1 md:block md:px-0">
      <p className="rounded-t-lg bg-cyan-700 py-2 text-center text-lg text-white md:px-4">
        FanWall
      </p>

      {pinnedMessage && (
        <PinnedMessageCard
          message={pinnedMessage}
          isAdmin={isAdmin}
          isMenuOpen={openMenuId === pinnedMessage.id}
          onToggleMenu={() => toggleMenu(pinnedMessage.id)}
          onTogglePin={togglePin}
          onCloseMenu={() => setOpenMenuId(null)}
        />
      )}

      <div className="bg-neutral-200 py-4 dark:bg-neutral-700">
        {otherMessages.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-neutral-500 dark:text-neutral-300">
            No messages yet.
          </div>
        )}

        {otherMessages.map((message) => (
          <FanwallMessageItem
            key={message.id}
            message={message}
            sessionUser={sessionUser}
            isAdmin={isAdmin}
            isEditing={editingId === message.id}
            editingBody={editingBody}
            isMenuOpen={openMenuId === message.id}
            loading={loading}
            onToggleMenu={() => toggleMenu(message.id)}
            onStartEdit={startEditing}
            onStopEdit={stopEditing}
            onSaveEdit={saveEdit}
            onDelete={deleteMessage}
            onTogglePin={togglePin}
            onChangeEditingBody={setEditingBody}
            onCloseMenu={() => setOpenMenuId(null)}
          />
        ))}
      </div>
      <FanwallForm
        sessionUser={sessionUser}
        isAdmin={isAdmin}
        nickname={nickname}
        contact={contact}
        title={title}
        body={body}
        error={error}
        loading={loading}
        messageLabel={messageLabel}
        onNicknameChange={setNickname}
        onContactChange={setContact}
        onTitleChange={setTitle}
        onBodyChange={setBody}
        onSubmit={submitMessage}
      />
    </div>
  );
}

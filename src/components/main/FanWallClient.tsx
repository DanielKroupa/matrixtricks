"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BsFillPinAngleFill,
  BsPinFill,
  BsThreeDotsVertical,
} from "react-icons/bs";
import { FaPen } from "react-icons/fa6";
import { IoTrash } from "react-icons/io5";
import { PiPaperPlaneRightFill } from "react-icons/pi";
import { UserInfoBubble } from "@/components/social/UserInfoBubble";
import { usePresenceStatuses } from "@/hooks/PresenceContext";
import { useFanwallActions } from "@/hooks/useFanwallActions";
import { useFanwallPagination } from "@/hooks/useFanwallPagination";
import { useFanwallSocket } from "@/hooks/useFanwallSocket";
import type {
  ApiResponse,
  FanWallClientProps,
  FanwallError,
  FanwallMessage,
  FanwallUser,
} from "../../types/fanwall";
import Badge from "../ui/Badge";
import AutoResizeTextarea from "../ui/form/AutoResizeTextarea";
import { getAuthorName, getAvatarSrc } from "./fanwall/message-state";

function formatTime(iso: string) {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = Date.now();
  const diffInSeconds = Math.round((date.getTime() - now) / 1000);
  const absSeconds = Math.abs(diffInSeconds);
  const rtf = new Intl.RelativeTimeFormat("cs", { numeric: "auto" });

  if (absSeconds < 60) {
    return rtf.format(diffInSeconds, "second");
  }

  const diffInMinutes = Math.round(diffInSeconds / 60);
  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(diffInMinutes, "minute");
  }

  const diffInHours = Math.round(diffInMinutes / 60);
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(diffInHours, "hour");
  }

  const diffInDays = Math.round(diffInHours / 24);
  if (Math.abs(diffInDays) < 30) {
    return rtf.format(diffInDays, "day");
  }

  return date.toLocaleString("cs-CZ");
}

function formatExactTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("cs-CZ");
}

function renderFanwallBody(body: string, className: string) {
  const paragraphs = body.split("\n");

  return (
    <div className={className}>
      {paragraphs.map((paragraphText, index) => (
        <p
          key={`${index}-${paragraphText.length}`}
          className={index > 0 ? "mt-2" : undefined}
        >
          {paragraphText || "\u00A0"}
        </p>
      ))}
    </div>
  );
}

type PinnedMessageCardProps = {
  message: FanwallMessage;
  isAuthorOnline: boolean;
  isAdmin: boolean;
  isMenuOpen: boolean;
  onToggleMenu: () => void;
  onTogglePin: (message: FanwallMessage) => void;
  onCloseMenu: () => void;
};

function PinnedMessageCard({
  message,
  isAuthorOnline,
  isAdmin,
  isMenuOpen,
  onToggleMenu,
  onTogglePin,
  onCloseMenu,
}: PinnedMessageCardProps) {
  const authorName = getAuthorName(message);
  const avatarSrc = getAvatarSrc(message);

  return (
    <div className="bg-neutral-300 py-3 shadow-lg dark:bg-[#353535]">
      <div className="group relative flex flex-row items-center justify-baseline gap-2 px-2 md:gap-4 md:px-6">
        <div className="relative">
          <UserInfoBubble userId={message.userId}>
            <Image
              src={avatarSrc}
              alt="profile-avatar"
              className="flex h-20 w-20 rounded-full object-cover md:h-16 md:w-16"
              width={65}
              height={65}
            />
          </UserInfoBubble>

          {message.userId || isAuthorOnline ? (
            <span
              title={isAuthorOnline ? "Online" : ""}
              className={`absolute right-0 bottom-1 z-10 flex size-4 rounded-full border-4 border-neutral-300 dark:border-neutral-700 ${isAuthorOnline ? "bg-green-500" : "hidden"} `}
            />
          ) : null}
          {message.user?.isVipActive && <Badge className="-mt-2 ml-8" />}
        </div>

        <div className="flex flex-col space-y-1">
          {message.title && <h5 className="font-medium">{message.title}</h5>}
          <p className="flex items-center gap-2">
            <UserInfoBubble userId={message.userId}>
              <span>{authorName}</span>
            </UserInfoBubble>
            <time
              className="text-xs text-neutral-500"
              dateTime={message.createdAt}
              title={formatExactTime(message.createdAt)}
            >
              {formatTime(message.createdAt)}
            </time>
          </p>
          <div className="rounded-lg bg-neutral-200 px-4 py-2 shadow dark:bg-neutral-500">
            {renderFanwallBody(
              message.body,
              "text-sm font-normal md:text-base",
            )}
          </div>
          {isAdmin && (
            <>
              <button
                type="button"
                className="fanwall-menu-button absolute top-2 right-2 cursor-pointer rounded-full bg-neutral-300 p-1 opacity-100 transition-opacity hover:bg-neutral-400 md:opacity-0 md:group-hover:opacity-100 dark:bg-neutral-500 dark:hover:bg-neutral-400"
                onClick={onToggleMenu}
              >
                <BsThreeDotsVertical />
              </button>
              {isMenuOpen && (
                <div className="fanwall-menu absolute top-8 right-2 z-10 w-32 rounded-md bg-white shadow-lg dark:bg-neutral-600">
                  <button
                    type="button"
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
  isAuthorOnline: boolean;
  sessionUser: FanwallUser | null;
  isAdmin: boolean;
  isEditing: boolean;
  editingBody: string;
  isMenuOpen: boolean;
  loading: boolean;
  updateBlockMessage: string | null;
  deleteBlockMessage: string | null;
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
  isAuthorOnline,
  sessionUser,
  isAdmin,
  isEditing,
  editingBody,
  isMenuOpen,
  loading,
  updateBlockMessage,
  deleteBlockMessage,
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
  const isUpdateBlocked = Boolean(updateBlockMessage);
  const isDeleteBlocked = Boolean(deleteBlockMessage);

  return (
    <div className="group relative flex flex-row items-start justify-baseline gap-2 px-2 py-4 md:gap-4 md:px-6">
      <div className="relative md:w-auto">
        <UserInfoBubble userId={message.userId}>
          <Image
            src={avatarSrc}
            alt="profile-avatar"
            className="h-16 w-16 rounded-full object-cover"
            width={65}
            loading="lazy"
            height={65}
          />
        </UserInfoBubble>
        {message.userId ? (
          <span
            title={isAuthorOnline ? "Online" : ""}
            className={`absolute right-0 bottom-1 z-10 flex size-4 rounded-full border-4 border-neutral-200 shadow dark:border-neutral-700 ${isAuthorOnline ? "bg-green-500" : "hidden"}`}
          />
        ) : null}
      </div>
      <div className="flex w-4/5 flex-col space-y-1">
        {message.title && (
          <h5 className="text-lg font-medium text-neutral-700 dark:text-neutral-200">
            {message.title}
          </h5>
        )}
        <p className="flex items-center gap-2">
          <UserInfoBubble userId={message.userId}>
            <span>{authorName}</span>
          </UserInfoBubble>
          {message.user?.isVipActive && <Badge />}
          <time
            className="text-xs text-neutral-500"
            dateTime={message.createdAt}
            title={formatExactTime(message.createdAt)}
          >
            {formatTime(message.createdAt)}
          </time>
        </p>
        <div className="w-fit rounded-lg bg-neutral-300 px-4 py-2 shadow-md dark:bg-neutral-500">
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <AutoResizeTextarea
                value={editingBody}
                onChange={onChangeEditingBody}
                disabled={loading || isUpdateBlocked}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-dark cursor-pointer rounded-md bg-cyan-600 px-2 py-1 text-sm text-white"
                  onClick={() => onSaveEdit(message)}
                  disabled={loading || isUpdateBlocked}
                  title={
                    isUpdateBlocked
                      ? (updateBlockMessage ?? undefined)
                      : undefined
                  }
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
            renderFanwallBody(message.body, "text-sm font-light md:text-base")
          )}
        </div>
        {(canEdit || canDelete || isAdmin) && (
          <>
            <button
              type="button"
              title="Edit post"
              className="fanwall-menu-button absolute top-2 right-2 cursor-pointer rounded-full bg-none p-1 opacity-100 transition-opacity md:bg-neutral-300 md:opacity-0 md:group-hover:opacity-100 md:hover:bg-neutral-400 md:dark:bg-neutral-600 md:dark:hover:bg-neutral-400"
              onClick={onToggleMenu}
            >
              <BsThreeDotsVertical />
            </button>
            {isMenuOpen && (
              <div className="fanwall-menu absolute top-8 right-2 z-10 w-32 rounded-md bg-white shadow-lg dark:bg-neutral-600">
                {isAdmin && (
                  <button
                    type="button"
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
                {canEdit && !isEditing && (
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-left text-sm hover:bg-neutral-200 dark:hover:bg-neutral-500"
                    disabled={loading || isUpdateBlocked}
                    title={
                      isUpdateBlocked
                        ? (updateBlockMessage ?? undefined)
                        : undefined
                    }
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
                    type="button"
                    title="Delete post"
                    className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm text-red-500 hover:bg-red-100 dark:text-red-300 dark:hover:bg-neutral-500"
                    disabled={loading || isDeleteBlocked}
                    aria-disabled={loading || isDeleteBlocked}
                    onClick={() => {
                      onDelete(message);
                      onCloseMenu();
                    }}
                  >
                    <IoTrash />
                    Delete
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
  isWriteCheckLoading: boolean;
  writeBlockMessage: string | null;
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
  isWriteCheckLoading,
  writeBlockMessage,
  messageLabel,
  onNicknameChange,
  onContactChange,
  onTitleChange,
  onBodyChange,
  onSubmit,
}: FanwallFormProps) {
  const isWriteBlocked = Boolean(writeBlockMessage);

  return (
    <form
      onSubmit={onSubmit}
      className="w-full flex-row justify-center border-t-2 border-neutral-300 bg-neutral-200 px-4 py-4 text-neutral-700 md:px-16 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white"
    >
      {!sessionUser && (
        <div className="block w-full flex-row gap-2 py-2 md:flex md:w-1/2">
          <input
            type="text"
            placeholder="Nickname*"
            value={nickname}
            onChange={(e) => onNicknameChange(e.target.value)}
            className="mb-2 w-full rounded-md bg-neutral-300 py-2 indent-2 shadow-md ring-neutral-400 outline-none placeholder:text-neutral-400 focus:ring-2 md:mb-0 md:w-96 dark:bg-neutral-500 dark:placeholder:text-[#aaaaaa]"
            disabled={loading || isWriteBlocked || isWriteCheckLoading}
          />
          <input
            type="text"
            placeholder="Contact*"
            value={contact}
            onChange={(e) => onContactChange(e.target.value)}
            className="mb-2 w-full rounded-md bg-neutral-300 py-2 indent-2 shadow-md ring-neutral-400 outline-none placeholder:text-neutral-400 focus:ring-2 md:mb-0 md:w-96 dark:bg-neutral-500 dark:placeholder:text-[#aaaaaa]"
            disabled={loading || isWriteBlocked || isWriteCheckLoading}
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
            className="mb-2 w-full rounded-md bg-neutral-300 py-2 indent-2 ring-neutral-400 outline-none placeholder:text-neutral-400 focus:ring-2 md:mb-0 md:w-1/2 dark:bg-neutral-500 dark:placeholder:text-[#aaaaaa]"
            disabled={loading || isWriteBlocked || isWriteCheckLoading}
          />
        )}
        <AutoResizeTextarea
          placeholder="Type a message... Show your support or ask a question"
          value={body}
          onChange={onBodyChange}
          disabled={loading || isWriteBlocked || isWriteCheckLoading}
        />
      </div>

      {(error || writeBlockMessage || isWriteCheckLoading) && (
        <p className="mt-2 text-sm text-red-500" role="alert">
          {isWriteCheckLoading
            ? "Checking write access..."
            : (writeBlockMessage ?? error)}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="text-xs text-neutral-500 dark:text-neutral-300">
          {messageLabel}
        </div>
        <button
          type="submit"
          className="flex cursor-pointer items-center gap-2 rounded-md bg-cyan-700 px-4 py-2 text-sm text-white shadow transition-colors hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading || isWriteBlocked || isWriteCheckLoading}
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const refreshMessages = useCallback(async () => {
    try {
      const response = await fetch("/api/fanwall/messages?limit=50", {
        cache: "no-store",
      });
      const data = (await response.json()) as ApiResponse<FanwallMessage>;

      if (response.ok) {
        setMessages(data.messages ?? []);
      }
    } catch {
      // ignore background refresh failures
    }
  }, []);

  useFanwallSocket({ refreshMessages, setMessages });

  const {
    nickname,
    contact,
    title,
    body,
    error,
    loading,
    isWriteCheckLoading,
    writeBlockMessage,
    writeBlockMessages,
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
  } = useFanwallActions({
    sessionUser,
    isAdmin,
    refreshMessages,
    setMessages,
  });

  const messageAuthorIds = useMemo(
    () =>
      messages
        .map((message) => message.userId)
        .filter((userId): userId is string => Boolean(userId)),
    [messages],
  );
  const presenceStatuses = usePresenceStatuses(messageAuthorIds);

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

  const { containerRef, loadingOlder, onScroll } = useFanwallPagination({
    messages,
    otherMessages,
    setMessages,
  });

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

  const sessionDisplayName =
    sessionUser?.name || sessionUser?.username || "Username";

  const messageLabel = sessionUser
    ? `You are posting as ${sessionDisplayName}`
    : "";

  const toggleMenu = (id: string) =>
    setOpenMenuId((prev) => (prev === id ? null : id));

  return (
    <div className="mx-auto my-0 w-full px-1 md:block md:px-0">
      <p className="rounded-t-lg bg-linear-to-r from-cyan-700 via-cyan-700/85 to-cyan-700 py-2 text-center text-lg text-white md:px-4">
        FanWall
      </p>

      {pinnedMessage && (
        <PinnedMessageCard
          message={pinnedMessage}
          isAuthorOnline={
            pinnedMessage.userId
              ? Boolean(presenceStatuses[pinnedMessage.userId])
              : false
          }
          isAdmin={isAdmin}
          isMenuOpen={openMenuId === pinnedMessage.id}
          onToggleMenu={() => toggleMenu(pinnedMessage.id)}
          onTogglePin={togglePin}
          onCloseMenu={() => setOpenMenuId(null)}
        />
      )}

      <div className="bg-neutral-200 dark:bg-neutral-700">
        {otherMessages.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-neutral-500 dark:text-neutral-300">
            No messages yet.
          </div>
        )}

        <div
          ref={containerRef}
          onScroll={onScroll}
          className="fanwall-scroll overflow-auto px-0 md:px-2"
        >
          {loadingOlder && (
            <div className="px-4 py-2 text-center text-xs text-neutral-500">
              Loading older messages…
            </div>
          )}

          {otherMessages.map((message) => (
            <FanwallMessageItem
              key={message.id}
              message={message}
              isAuthorOnline={
                message.userId
                  ? Boolean(presenceStatuses[message.userId])
                  : false
              }
              sessionUser={sessionUser}
              isAdmin={isAdmin}
              isEditing={editingId === message.id}
              editingBody={editingBody}
              isMenuOpen={openMenuId === message.id}
              loading={loading}
              updateBlockMessage={writeBlockMessages.update}
              deleteBlockMessage={writeBlockMessages.delete}
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
        isWriteCheckLoading={isWriteCheckLoading}
        writeBlockMessage={writeBlockMessage}
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

"use client";

import { User as UserIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  BlockUserDialog,
  type BlockScopes,
  type BlockType,
} from "./BlockUserDialog";

type UserCardResponse = {
  id: string;
  nickname: string;
  avatarUrl: string | null;
  commentsGiven: number;
  sharesGiven: number;
  likesGiven: number;
  registeredAt: string;
  lastCommentAt: string | null;
  isAdminProfile: boolean;
  fansCount: number | null;
  isFan: boolean;
  isSelf: boolean;
  viewerIsAdmin: boolean;
  isBlocked: boolean;
  blockedUntil: string | null;
  blockedReason: string | null;
};

type FanToggleResponse = {
  fansCount: number;
  isFan: boolean;
};

type BubblePosition = {
  top: number;
  left: number;
};

const CARD_WIDTH = 320;
const VIEWPORT_PADDING = 8;
const TRIGGER_GAP = 10;
const HOVER_OPEN_DELAY_MS = 350;

const defaultBlockScopes: BlockScopes = {
  commentCreate: true,
  commentUpdate: true,
  commentDelete: true,
  fanwallCreate: true,
  fanwallUpdate: true,
  fanwallDelete: true,
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getCanHover() {
  if (typeof window === "undefined") {
    return true;
  }

  const hasHover = window.matchMedia("(hover: hover)").matches;
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  return hasHover && !hasCoarsePointer;
}

function getFallbackPosition(trigger: HTMLSpanElement): BubblePosition {
  const triggerRect = trigger.getBoundingClientRect();
  const desiredLeft = triggerRect.left + triggerRect.width / 2 - CARD_WIDTH / 2;
  const clampedLeft = Math.min(
    Math.max(desiredLeft, VIEWPORT_PADDING),
    window.innerWidth - CARD_WIDTH - VIEWPORT_PADDING,
  );

  return {
    top: triggerRect.bottom + TRIGGER_GAP,
    left: clampedLeft,
  };
}

export function UserInfoBubble({
  userId,
  children,
}: {
  userId?: string | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [canHover, setCanHover] = useState(true);
  const [position, setPosition] = useState<BubblePosition | null>(null);
  const [placeAbove, setPlaceAbove] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<UserCardResponse | null>(null);
  const [fanLoading, setFanLoading] = useState(false);
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blockType, setBlockType] = useState<BlockType>("permanent");
  const [blockUntil, setBlockUntil] = useState("");
  const [blockScopes, setBlockScopes] =
    useState<BlockScopes>(defaultBlockScopes);
  const [blockLoading, setBlockLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCanHover(getCanHover());
  }, []);

  const clearCloseTimeout = useCallback(() => {
    if (!closeTimeoutRef.current) {
      return;
    }

    clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = null;
  }, []);

  const clearOpenTimeout = useCallback(() => {
    if (!openTimeoutRef.current) {
      return;
    }

    clearTimeout(openTimeoutRef.current);
    openTimeoutRef.current = null;
  }, []);

  const closeWithDelay = useCallback(() => {
    clearOpenTimeout();
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 120);
  }, [clearCloseTimeout, clearOpenTimeout]);

  const openBubbleImmediately = useCallback(() => {
    clearCloseTimeout();
    clearOpenTimeout();
    if (!userId) {
      return;
    }

    if (!position && triggerRef.current) {
      setPosition(getFallbackPosition(triggerRef.current));
      setPlaceAbove(false);
    }

    setIsOpen(true);
  }, [clearCloseTimeout, clearOpenTimeout, position, userId]);

  const openBubble = useCallback(() => {
    clearCloseTimeout();
    clearOpenTimeout();
    if (!userId) {
      return;
    }

    openTimeoutRef.current = setTimeout(() => {
      openBubbleImmediately();
    }, HOVER_OPEN_DELAY_MS);
  }, [clearCloseTimeout, clearOpenTimeout, openBubbleImmediately, userId]);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const card = cardRef.current;

    if (!trigger || !card) {
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const cardWidth = cardRect.width || CARD_WIDTH;
    const cardHeight = cardRect.height;

    const desiredLeft =
      triggerRect.left + triggerRect.width / 2 - cardWidth / 2;
    const clampedLeft = Math.min(
      Math.max(desiredLeft, VIEWPORT_PADDING),
      window.innerWidth - cardWidth - VIEWPORT_PADDING,
    );

    const shouldPlaceAbove =
      triggerRect.bottom + TRIGGER_GAP + cardHeight > window.innerHeight &&
      triggerRect.top - TRIGGER_GAP - cardHeight > VIEWPORT_PADDING;

    const top = shouldPlaceAbove
      ? triggerRect.top - cardHeight - TRIGGER_GAP
      : triggerRect.bottom + TRIGGER_GAP;

    setPlaceAbove(shouldPlaceAbove);
    setPosition({ top, left: clampedLeft });
  }, []);

  useEffect(() => {
    if (!isOpen || !userId) {
      return;
    }

    let isCancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/users/${userId}/card`, {
          cache: "no-store",
        });

        const payload = (await response.json()) as
          | UserCardResponse
          | { error?: string };

        if (!response.ok) {
          const message =
            typeof payload === "object" && payload && "error" in payload
              ? payload.error || "Nepodařilo se načíst profil"
              : "Nepodařilo se načíst profil";
          throw new Error(message);
        }

        if (!isCancelled) {
          setData(payload as UserCardResponse);
        }
      } catch (loadError) {
        if (!isCancelled) {
          const message =
            loadError instanceof Error
              ? loadError.message
              : "Nepodařilo se načíst profil";
          setError(message);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, userId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onResizeOrScroll = () => updatePosition();

    window.addEventListener("resize", onResizeOrScroll);
    window.addEventListener("scroll", onResizeOrScroll, true);

    return () => {
      window.removeEventListener("resize", onResizeOrScroll);
      window.removeEventListener("scroll", onResizeOrScroll, true);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }

      if (
        triggerRef.current?.contains(target) ||
        cardRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, loading, data, error, updatePosition]);

  useEffect(() => {
    return () => {
      clearCloseTimeout();
      clearOpenTimeout();
    };
  }, [clearCloseTimeout, clearOpenTimeout]);

  const showFanSection = useMemo(() => {
    return Boolean(data?.isAdminProfile);
  }, [data?.isAdminProfile]);

  const handleToggleFan = async () => {
    if (!userId || !data || data.isSelf || fanLoading) {
      return;
    }

    setFanLoading(true);

    try {
      const response = await fetch(`/api/users/${userId}/fan`, {
        method: "POST",
      });

      const payload = (await response.json()) as
        | FanToggleResponse
        | { error?: string };

      if (!response.ok) {
        const message =
          typeof payload === "object" && payload && "error" in payload
            ? payload.error || "Nepodařilo se změnit fan stav"
            : "Nepodařilo se změnit fan stav";
        throw new Error(message);
      }

      const parsed = payload as FanToggleResponse;
      setData((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          isFan: parsed.isFan,
          fansCount: parsed.fansCount,
        };
      });
    } catch (toggleError) {
      const message =
        toggleError instanceof Error
          ? toggleError.message
          : "Nepodařilo se změnit fan stav";
      setError(message);
    } finally {
      setFanLoading(false);
    }
  };

  const handleCreateBlock = async () => {
    if (!userId || !data?.viewerIsAdmin || data.isSelf || blockLoading) {
      return;
    }

    const reason = blockReason.trim();

    if (reason.length < 3) {
      setError("Block reason must have at least 3 characters.");
      return;
    }

    if (blockType === "temporary" && !blockUntil) {
      setError("Please choose block end date and time.");
      return;
    }

    setBlockLoading(true);
    setError(null);

    try {
      const endsAtIso =
        blockType === "temporary" && blockUntil
          ? new Date(blockUntil).toISOString()
          : null;

      const response = await fetch(`/api/users/${userId}/block`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          reason,
          endsAt: endsAtIso,
          scopes: blockScopes,
        }),
      });

      const payload = (await response.json()) as
        | { error?: string }
        | { block: { endsAt: string | null } };

      if (!response.ok) {
        const message =
          typeof payload === "object" && payload && "error" in payload
            ? payload.error || "Failed to block user"
            : "Failed to block user";
        throw new Error(message);
      }

      const blockedUntil =
        typeof payload === "object" && payload && "block" in payload
          ? payload.block.endsAt
          : null;

      setData((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          isBlocked: true,
          blockedUntil,
          blockedReason: reason,
        };
      });

      setIsBlockDialogOpen(false);
      setBlockReason("");
      setBlockType("permanent");
      setBlockUntil("");
      setBlockScopes(defaultBlockScopes);
    } catch (blockError) {
      const message =
        blockError instanceof Error
          ? blockError.message
          : "Failed to block user";
      setError(message);
    } finally {
      setBlockLoading(false);
    }
  };

  const handleUnblock = async () => {
    if (!userId || !data?.viewerIsAdmin || blockLoading) {
      return;
    }

    const confirmed = window.confirm(
      "Do you really want to unblock this user?",
    );
    if (!confirmed) {
      return;
    }

    setBlockLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}/block`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Failed to unblock user");
      }

      setData((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          isBlocked: false,
          blockedUntil: null,
          blockedReason: null,
        };
      });
    } catch (unblockError) {
      const message =
        unblockError instanceof Error
          ? unblockError.message
          : "Failed to unblock user";
      setError(message);
    } finally {
      setBlockLoading(false);
    }
  };

  const handleOpenChat = () => {
    if (data?.viewerIsAdmin && !data.isSelf) {
      router.push(`/admin/chat?userId=${encodeURIComponent(data.id)}`);
      setIsOpen(false);
      return;
    }

    window.dispatchEvent(new Event("matrix:open-chat-widget"));
    setIsOpen(false);
  };

  if (!userId) {
    return <>{children}</>;
  }

  const card =
    mounted && isOpen && position
      ? createPortal(
          <div
            ref={cardRef}
            onMouseEnter={canHover ? clearCloseTimeout : undefined}
            onMouseLeave={canHover ? closeWithDelay : undefined}
            className="fixed z-80 w-64 rounded-2xl border border-neutral-300 bg-neutral-200 p-4 shadow-xl md:w-80 dark:border-neutral-600 dark:bg-neutral-700"
            style={{
              top: position.top,
              left: position.left,
            }}
          >
            <div
              className={`absolute left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border border-neutral-300 bg-neutral-200 dark:border-neutral-600 dark:bg-neutral-700 ${placeAbove ? "-bottom-1.5 border-t-0 border-l-0" : "-top-1.5 border-r-0 border-b-0"}`}
            />

            {loading ? (
              <div className="py-6 text-center text-sm text-neutral-500 dark:text-neutral-300">
                Loading profile data...
              </div>
            ) : error ? (
              <div className="py-4 text-center text-sm text-red-500">
                {error}
              </div>
            ) : data ? (
              <div className="space-y-3">
                <div className="flex flex-col items-center">
                  {data.avatarUrl ? (
                    <Image
                      src={data.avatarUrl}
                      alt={data.nickname}
                      width={96}
                      height={96}
                      className="h-20 w-20 rounded-full object-cover md:h-24 md:w-24"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-300 dark:bg-neutral-600">
                      <UserIcon
                        size={36}
                        className="text-neutral-500 dark:text-neutral-300"
                      />
                    </div>
                  )}
                  <p className="mt-3 text-base font-semibold text-neutral-900 dark:text-white">
                    {data.nickname}
                  </p>
                </div>

                <div className="space-y-1 text-sm text-neutral-800 dark:text-neutral-100">
                  <p className="text-left">Comments: {data.commentsGiven}</p>
                  <p className="text-left">Shares: {data.sharesGiven}</p>
                  <p className="text-left">Likes: {data.likesGiven}</p>
                </div>

                {showFanSection && (
                  <div className="space-y-2 border-t border-neutral-300 pt-3 dark:border-neutral-600">
                    <p className="text-sm text-neutral-800 dark:text-neutral-100">
                      Fans: {data.fansCount ?? 0}
                    </p>
                    {!data.isSelf ? (
                      <button
                        type="button"
                        onClick={handleToggleFan}
                        disabled={fanLoading}
                        className="w-full cursor-pointer rounded-md bg-cyan-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-cyan-600 dark:hover:bg-cyan-500"
                      >
                        {fanLoading
                          ? "Working…"
                          : data.isFan
                            ? "Unfan"
                            : `Become a fan (${data.fansCount ?? 0})`}
                      </button>
                    ) : null}
                  </div>
                )}

                <div className="space-y-1 border-t border-neutral-300 pt-3 text-xs text-neutral-600 dark:border-neutral-600 dark:text-neutral-300">
                  <p>Registered: {formatDateTime(data.registeredAt)}</p>
                  <p>Last comment: {formatDateTime(data.lastCommentAt)}</p>
                </div>

                <div className="flex items-center justify-center gap-2 border-t border-neutral-300 pt-3 dark:border-neutral-600">
                  <button
                    type="button"
                    onClick={handleOpenChat}
                    className="flex w-fit cursor-pointer gap-2 rounded-md border border-neutral-400 px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-300 dark:border-neutral-500 dark:text-neutral-100 dark:hover:bg-neutral-600"
                  >
                    <Image
                      src="/icons/mail.svg"
                      alt="mail"
                      width={24}
                      style={{ height: "auto" }}
                      height={20}
                      className="invert-50 dark:invert-0"
                    />
                    Message
                  </button>

                  {data.viewerIsAdmin && !data.isSelf ? (
                    data.isBlocked ? (
                      <button
                        type="button"
                        onClick={handleUnblock}
                        disabled={blockLoading}
                        className="w-fit cursor-pointer rounded-md bg-red-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {blockLoading ? "Working…" : "Unblock User"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsBlockDialogOpen(true)}
                        disabled={blockLoading}
                        className="w-fit cursor-pointer rounded-md bg-red-700 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Block User
                      </button>
                    )
                  ) : null}
                </div>

                {data.viewerIsAdmin && data.isBlocked ? (
                  <p className="text-center text-[11px] text-red-600 dark:text-red-300">
                    Blocked{" "}
                    {data.blockedUntil
                      ? `until ${formatDateTime(data.blockedUntil)}`
                      : "permanently"}
                    {/* {data.blockedReason ? ` — ${data.blockedReason}` : null} */}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={canHover ? openBubble : undefined}
        onMouseLeave={canHover ? closeWithDelay : undefined}
        onClick={!canHover ? openBubbleImmediately : undefined}
        className="inline-flex"
      >
        {children}
      </span>
      {card}
      {mounted ? (
        <BlockUserDialog
          isOpen={isBlockDialogOpen}
          blockReason={blockReason}
          onBlockReasonChange={setBlockReason}
          blockType={blockType}
          onBlockTypeChange={setBlockType}
          blockUntil={blockUntil}
          onBlockUntilChange={setBlockUntil}
          blockScopes={blockScopes}
          onBlockScopeChange={(key, value) =>
            setBlockScopes((prev) => ({
              ...prev,
              [key]: value,
            }))
          }
          blockLoading={blockLoading}
          onClose={() => setIsBlockDialogOpen(false)}
          onConfirm={handleCreateBlock}
        />
      ) : null}
    </>
  );
}

"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { MdOutlineFileUpload } from "react-icons/md";
import type { User } from "@/lib/auth";
import { getMessages } from "@/lib/i18n/messages";
import { localeFromPathname } from "@/lib/i18n/routing";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

type AvatarUploadProps = {
  maxSize?: number; // bytes
  user?: User | null;
  onImageChange?: (imageFile: File | null) => void;
};

const AVATAR_DIMENSION = 256;
const CLIENT_WEBP_QUALITY = 0.7;

function stripExtension(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "");
}

async function compressForPreviewAndUpload(
  file: File,
  labels: ReturnType<typeof getMessages>["admin"],
) {
  if (!file.type.startsWith("image/")) {
    throw new Error(labels.avatarOnlyImages);
  }

  const sourceUrl = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(labels.avatarReadFailed));
      image.src = sourceUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = AVATAR_DIMENSION;
    canvas.height = AVATAR_DIMENSION;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error(labels.avatarCanvasUnavailable);
    }

    const sourceSize = Math.min(img.naturalWidth, img.naturalHeight);
    const sourceX = Math.floor((img.naturalWidth - sourceSize) / 2);
    const sourceY = Math.floor((img.naturalHeight - sourceSize) / 2);

    context.drawImage(
      img,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      AVATAR_DIMENSION,
      AVATAR_DIMENSION,
    );

    const webpBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", CLIENT_WEBP_QUALITY);
    });

    if (webpBlob) {
      return new File([webpBlob], `${stripExtension(file.name)}.webp`, {
        type: "image/webp",
      });
    }

    const pngBlob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });

    if (!pngBlob) {
      throw new Error(labels.avatarProcessFailed);
    }

    return new File([pngBlob], `${stripExtension(file.name)}.png`, {
      type: "image/png",
    });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

export default function AvatarUpload({
  maxSize = 10 * 1024 * 1024,
  user,
  onImageChange,
}: AvatarUploadProps) {
  const pathname = usePathname();
  const locale = localeFromPathname(pathname || "/");
  const labels = getMessages(locale).admin;
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      clearFile();
      return;
    }

    if (file.size > maxSize) {
      clearFile();
      setError(`${labels.avatarTooLargePrefix} ${formatBytes(maxSize)}.`);
      // reset input so the same file can be picked again
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    try {
      const processedFile = await compressForPreviewAndUpload(file, labels);

      setError(null);
      setFile(processedFile);
      setLocalPreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return URL.createObjectURL(processedFile);
      });
      onImageChange?.(processedFile);
    } catch {
      setError(labels.avatarSelectedProcessFailed);
      setFile(null);
      setLocalPreview((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function clearFile() {
    setFile(null);
    setLocalPreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    if (inputRef.current) inputRef.current.value = "";
    setError(null);
    onImageChange?.(null);
  }

  const fallbackAvatar = "/uploads/avatars/alien.png";
  const userImage = user?.image && user.image.length > 0 ? user.image : null;
  const previewSource = localPreview ?? userImage ?? null;

  return (
    <div className="my-6 flex w-full flex-col items-center justify-center gap-2 rounded-md border-2 border-neutral-300 p-4 md:w-fit md:min-w-md md:flex-row md:justify-start dark:border-neutral-700">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-neutral-300 dark:bg-neutral-700">
        {previewSource ? (
          <Image
            src={previewSource}
            alt={labels.avatarPreviewAlt}
            className="h-24 w-24 rounded-full object-cover"
            width={100}
            height={100}
            unoptimized
          />
        ) : (
          <Image
            src={fallbackAvatar}
            alt={labels.defaultAvatarAlt}
            className="h-24 w-24 rounded-full object-cover"
            width={100}
            height={100}
            unoptimized
          />
        )}
      </div>

      <div className="ml-2 flex flex-col justify-center gap-2 py-4">
        <div>
          <div className="flex">
            <input
              id="avatar_upload"
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={onChange}
              className="hidden"
              aria-describedby="avatar-help"
            />
            <label
              htmlFor="avatar_upload"
              className="mr-2 flex w-fit cursor-pointer items-center justify-center gap-2 rounded bg-cyan-800 px-3 py-2 text-white shadow-md dark:bg-cyan-900"
            >
              <MdOutlineFileUpload size={20} />
              {labels.uploadAvatar}
            </label>
          </div>

          <div
            id="avatar-help"
            className="mt-1 text-center text-xs text-neutral-400 md:text-left"
          >
            {labels.maxSize}: {formatBytes(maxSize)}
          </div>

          {error && (
            <div
              className="mt-2 text-sm text-red-400"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          {file && (
            <div className="mt-2 text-sm text-neutral-400">
              <div>
                <span className="font-semibold">{labels.fileName}:</span>{" "}
                {file.name}
              </div>
              <div>
                <span className="font-semibold">{labels.fileSize}:</span>{" "}
                {formatBytes(file.size)}
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={clearFile}
                  className="cursor-pointer rounded bg-neutral-500 px-2 py-1 text-white dark:bg-neutral-600"
                >
                  {labels.remove}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

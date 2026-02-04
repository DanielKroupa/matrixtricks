"use client";

import React, { useState, useRef } from "react";
import { MdOutlineFileUpload } from "react-icons/md";
import Image from "next/image";
import { User } from "@/lib/auth";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

type AvatarUploadProps = {
  maxSize?: number; // bytes
  user?: User | null;
  value?: string | null;
  onImageChange?: (image: string | null) => void;
};

export default function AvatarUpload({
  maxSize = 10 * 1024 * 1024,
  user,
  value,
  onImageChange,
}: AvatarUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      clearFile();
      return;
    }

    if (file.size > maxSize) {
      clearFile();
      setError(
        `The image size is too big. Max allowed is ${formatBytes(maxSize)}.`,
      );
      // reset input so the same file can be picked again
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setError(null);
    setFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = typeof reader.result === "string" ? reader.result : null;
      if (!base64) {
        setError("Failed to read the selected image.");
        setFile(null);
        return;
      }

      if (value === undefined) {
        setLocalPreview(base64);
      }

      onImageChange?.(base64);
    };

    reader.onerror = () => {
      setError("Failed to read the selected image.");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    };

    reader.readAsDataURL(file);
  }

  function clearFile() {
    setFile(null);
    if (value === undefined) {
      setLocalPreview(null);
    }
    if (inputRef.current) inputRef.current.value = "";
    setError(null);
    onImageChange?.(null);
  }

  const fallbackAvatar = "/uploads/avatars/alien.png";
  const userImage = user?.image && user.image.length > 0 ? user.image : null;
  const previewSource = value ?? localPreview ?? userImage ?? null;

  return (
    <div className="md:flex block gap-2 items-center my-6">
      <div className="w-28 h-28 dark:bg-neutral-700 bg-neutral-300 rounded-full overflow-hidden flex items-center justify-center">
        {previewSource ? (
          <Image
            src={previewSource}
            alt="avatar preview"
            className="w-full h-full object-cover"
            width={112}
            height={112}
            unoptimized
          />
        ) : (
          <Image
            src={fallbackAvatar}
            alt="default avatar"
            className="w-full h-full object-cover"
            width={112}
            height={112}
            unoptimized
          />
        )}
      </div>

      <div className="flex flex-col gap-2 justify-center ml-2 py-4">
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
              className="dark:bg-cyan-900 bg-cyan-800 flex text-white py-2 px-3 rounded mr-2 w-fit cursor-pointer shadow-md justify-center items-center gap-2"
            >
              <MdOutlineFileUpload size={20} />
              Upload avatar
            </label>
          </div>

          <div id="avatar-help" className="text-xs text-neutral-400 mt-1">
            Max size: {formatBytes(maxSize)}
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
            <div className="mt-2 text-sm text-neutral-300">
              <div>
                <span className="font-semibold">Name:</span> {file.name}
              </div>
              <div>
                <span className="font-semibold">Size:</span>{" "}
                {formatBytes(file.size)}
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={clearFile}
                  className="cursor-pointer dark:bg-neutral-600 bg-neutral-500 text-white py-1 px-2 rounded"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

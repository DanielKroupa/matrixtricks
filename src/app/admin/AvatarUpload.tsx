"use client";
import React, { useState, useRef, useEffect } from "react";
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
};

export default function AvatarUpload({
  maxSize = 10 * 1024 * 1024,
  user,
}: AvatarUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;

    if (!f) {
      clearFile();
      return;
    }

    if (f.size > maxSize) {
      clearFile();
      setError(
        `The image size is too big. Max allowed is ${formatBytes(maxSize)}.`,
      );
      // reset input so the same file can be picked again
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setError(null);
    setFile(f);

    // revoke previous preview if any, then create new
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  }

  function clearFile() {
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (inputRef.current) inputRef.current.value = "";
    setError(null);
  }

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="flex gap-2 items-center mt-6">
      <div className="w-20 h-20 dark:bg-neutral-700 bg-neutral-300 rounded-full overflow-hidden flex items-center justify-center">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <Image
            src={previewUrl}
            alt="preview"
            className="w-full h-full object-cover"
            width={80}
            height={80}
          />
        ) : (
          <div className="text-neutral-400">
            {user?.image ? (
              <Image
                src={user.image || "/uploads/avatars/alien.png"}
                alt="avatar"
                width={80}
                height={80}
                className="object-cover"
              />
            ) : null}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 justify-center ml-2 py-4">
        <div>
          <p className="text-neutral-400">
            {file ? `Avatar / ${file.name}` : "Avatar / none"}
          </p>
        </div>
        <div>
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
            Change avatar
          </label>

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

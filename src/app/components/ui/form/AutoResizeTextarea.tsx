"use client";

import { useRef, useState } from "react";

type AutoResizeTextareaProps = {
  placeholder?: string;
};

export default function AutoResizeTextarea({
  placeholder,
}: AutoResizeTextareaProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);

    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      rows={1}
      placeholder={placeholder}
      className="dark:bg-neutral-500 bg-neutral-300 outline-none w-full min-h-28 focus:ring-2 ring-neutral-400 dark:placeholder:text-[#aaaaaa] placeholder:text-neutral-400 rounded-md py-2 px-2 shadow-md"
    />
  );
}

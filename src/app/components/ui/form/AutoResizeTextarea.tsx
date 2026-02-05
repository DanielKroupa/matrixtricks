"use client";

import { useEffect, useRef, useState } from "react";

type AutoResizeTextareaProps = {
  placeholder?: string;
  value?: string;
  name?: string;
  required?: boolean;
  className?: string;
  onChange?: (value: string) => void;
};

export default function AutoResizeTextarea({
  placeholder,
  value,
  name,
  required,
  className,
  onChange,
}: AutoResizeTextareaProps) {
  const [internalValue, setInternalValue] = useState(value ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  useEffect(() => {
    if (!isControlled) return;
    setInternalValue(value ?? "");
  }, [isControlled, value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) {
      setInternalValue(e.target.value);
    }

    onChange?.(e.target.value);

    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [currentValue]);

  return (
    <textarea
      ref={textareaRef}
      value={currentValue}
      onChange={handleChange}
      rows={1}
      placeholder={placeholder}
      name={name}
      required={required}
      className={
        className ||
        "min-h-28 w-full rounded-md bg-neutral-300 px-2 py-2 shadow-md ring-neutral-400 outline-none placeholder:text-neutral-400 focus:ring-2 dark:bg-neutral-500 dark:placeholder:text-[#aaaaaa]"
      }
    />
  );
}

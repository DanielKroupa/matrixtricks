"use client";
import { Link, X } from "lucide-react";
import { FaFacebook, FaTwitter, FaLinkedin } from "react-icons/fa6";

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  heading?: string;
}

export const SocialShareModal = ({
  isOpen,
  onClose,
  url,
  title,
  heading = "Share Video",
}: SocialShareModalProps) => {
  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: "Facebook",
      icon: <FaFacebook size={20} />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "Twitter",
      icon: <FaTwitter size={20} />,
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedin size={20} />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-neutral-800">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{heading}</h3>
          <button
            onClick={onClose}
            title="Close"
            className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-neutral-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex justify-center gap-4 py-4">
          {shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-neutral-600">
                {link.icon}
              </div>
              <span className="text-xs text-gray-600 dark:text-neutral-500">
                {link.name}
              </span>
            </a>
          ))}
          <button
            onClick={copyToClipboard}
            className="group flex cursor-pointer flex-col items-center gap-2"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-neutral-600">
              <Link size={20} />
            </div>
            <span className="text-xs text-gray-600 dark:text-neutral-500">
              Copy
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

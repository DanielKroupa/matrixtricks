import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaXTwitter,
} from "react-icons/fa6";

import { Tooltip } from "../ui/Tooltip";
import { Copyright } from "./Copyright";

const socialLinks = [
  { label: "Facebook", href: "#", icon: FaFacebookF },
  { label: "TikTok", href: "#", icon: FaTiktok },
  { label: "Instagram", href: "#", icon: FaInstagram },
  { label: "X / Twitter", href: "#", icon: FaXTwitter },
];

export function Footer() {
  return (
    <footer className="bg:text-dark flex w-full flex-col items-center bg-neutral-300 dark:bg-neutral-700">
      <p className="pt-4 text-center text-base">Follow me on</p>

      <div className="flex w-full justify-center gap-6 py-4 text-black">
        {socialLinks.map(({ label, href, icon: Icon }) => (
          <Tooltip key={label} text={label}>
            <a
              href={href}
              className="group flex items-center justify-center rounded-full border-2 border-neutral-400 p-3 transition-colors hover:border-neutral-700 focus:border-neutral-800 dark:hover:border-white dark:focus:border-white"
            >
              <Icon
                size={24}
                className="text-neutral-700 transition-colors group-hover:fill-black group-focus:fill-white dark:text-neutral-300 dark:group-hover:fill-white dark:group-focus:fill-white"
              />
            </a>
          </Tooltip>
        ))}
      </div>
      <div className="flex w-full flex-row items-center justify-center gap-4 border-b-2 border-b-neutral-500 pb-2">
        <Link href="/">GDPR</Link>
        <Link href="/">Privacy Policy</Link>
        <Link href="/">Cookies settings</Link>
      </div>

      <Copyright />
    </footer>
  );
}

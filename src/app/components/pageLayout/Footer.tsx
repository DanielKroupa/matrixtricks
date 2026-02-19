import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaXTwitter,
} from "react-icons/fa6";
import Link from "next/link";

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
    <footer className="flex flex-col items-center bg:text-dark w-full bg-neutral-300 dark:bg-neutral-700">
      <p className="text-base text-center pt-4">Follow me on</p>

      <div className="flex justify-center gap-6 py-4 text-black w-full">
        {socialLinks.map(({ label, href, icon: Icon }, i) => (
          <Tooltip key={i} text={label}>
            <a
              href={href}
              className="rounded-full group dark:focus:border-white focus:border-neutral-800  transition-colors dark:hover:border-white hover:border-neutral-700 flex justify-center items-center border-2 border-neutral-400 p-3"
            >
              <Icon
                size={24}
                className="group-hover:fill-black dark:group-hover:fill-white dark:text-neutral-300 text-neutral-700 transition-colors group-focus:fill-white dark:group-focus:fill-white "
              />
            </a>
          </Tooltip>
        ))}
      </div>
      <div className="border-b-2 border-b-neutral-500 w-full pb-2 flex justify-center gap-4 flex-row items-center">
        <Link href="/">GDPR</Link>
        <Link href="/">Privacy Policy</Link>
        <Link href="/">Cookies settings</Link>
      </div>

      <Copyright />
    </footer>
  );
}

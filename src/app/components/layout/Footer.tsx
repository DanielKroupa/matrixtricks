import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaXTwitter,
} from "react-icons/fa6";
import Link from "next/link";

import { Tooltip } from "../ui/Tooltip";

const socialLinks = [
  { label: "Facebook", href: "#", icon: FaFacebookF },
  { label: "TikTok", href: "#", icon: FaTiktok },
  { label: "Instagram", href: "#", icon: FaInstagram },
  { label: "X / Twitter", href: "#", icon: FaXTwitter },
];

export function Footer() {
  return (
    <footer className="flex flex-col items-center text-white w-full bg-gray-700">
      <p className="text-base text-center pt-4">Follow me on</p>

      <div className="flex justify-center gap-6 py-4  w-full">
        {socialLinks.map(({ label, href, icon: Icon }, i) => (
          <Tooltip key={i} text={label}>
            <a
              href={href}
              className="rounded-full group focus:border-white transition-colors hover:border-white flex justify-center items-center border-2 border-neutral-400 p-3"
            >
              <Icon
                size={24}
                className="group-hover:fill-white transition-colors group-focus:fill-white "
                color="#aaaaaa"
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

      <div className="py-2">
        <p>© 2025 MatrixTricks.com</p>
      </div>
    </footer>
  );
}

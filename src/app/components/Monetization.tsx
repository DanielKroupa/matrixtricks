import Image from "next/image";
import Link from "next/link";
import { Tooltip } from "./ui/Tooltip";

const ITEMS = [
  { text: "VIP", src: "/icons/vip.png", width: 45, height: 45 },
  { text: "Donate", src: "/icons/donate.png", width: 83, height: 45 },
  { text: "Buy", src: "/icons/buy.svg", width: 45, height: 45 },
  {
    text: "Collaboration",
    src: "/icons/collaboration.png",
    width: 62,
    height: 45,
  },
  {
    text: "Advertisement",
    src: "/icons/advertisement.png",
    width: 45,
    height: 45,
  },
];

export function Monetization() {
  return (
    <div className="mx-auto my-4 w-3xl">
      <div className="flex items-center justify-between gap-4 rounded-lg bg-neutral-700 px-8 py-1">
        {ITEMS.map(({ text, src, width, height }) => (
          <Tooltip key={text} text={text}>
            <Link
              href="."
              className="flex h-fit items-center justify-center rounded-md bg-neutral-500 px-4 py-1.5"
            >
              <Image src={src} alt={text} width={width} height={height} />
            </Link>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

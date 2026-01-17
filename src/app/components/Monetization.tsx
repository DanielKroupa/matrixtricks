import Image from "next/image";
import Link from "next/link";
import { Tooltip } from "./ui/Tooltip";

const items = [
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
    <div className="md:mx-auto my-4 lg:w-3xl">
      <div className="flex items-center overflow-x-auto whitespace-nowrap scroll-smooth md:touch-pan-x w-auto md:overflow-x-hidden justify-between gap-4 rounded-lg dark:bg-neutral-700 bg-neutral-300 border-2 dark:border-none border-neutral-400 md:px-8 px-0 py-1">
        {items.map(({ text, src, width, height }) => (
          <Tooltip key={text} text={text} position="top">
            <Link
              href="."
              className="flex h-fit items-center justify-center rounded-md dark:bg-neutral-500 bg-neutral-400 px-4 py-1.5"
            >
              <Image
                src={src}
                alt={text}
                width={width}
                height={height}
                className="md:object-contain"
              />
            </Link>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { getMessages } from "@/lib/i18n/messages";
import { localizePathname } from "@/lib/i18n/routing";
import { getRequestLocale } from "@/lib/i18n/server";
import { Tooltip } from "../ui/Tooltip";

export async function Monetization() {
  const locale = await getRequestLocale();
  const { main } = getMessages(locale);
  const items = [
    {
      text: main.monetizationVip,
      src: "/icons/vip.png",
      width: 45,
      height: 45,
    },
    {
      text: main.monetizationDonate,
      src: "/icons/donate.png",
      width: 83,
      height: 45,
    },
    {
      text: main.monetizationBuy,
      src: "/icons/buy.svg",
      width: 45,
      height: 45,
    },
    {
      text: main.monetizationCollaboration,
      src: "/icons/collaboration.png",
      width: 62,
      height: 45,
    },
    {
      text: main.monetizationAdvertisement,
      src: "/icons/advertisement.png",
      width: 45,
      height: 45,
    },
  ];

  return (
    <div className="my-4 md:mx-auto lg:w-3xl">
      <div className="flex w-auto items-center justify-between gap-4 overflow-x-auto scroll-smooth rounded-lg border-2 border-neutral-400 bg-neutral-300 px-0 py-1 whitespace-nowrap md:touch-pan-x md:overflow-x-hidden md:px-8 dark:border-none dark:bg-neutral-700">
        {items.map(({ text, src, width, height }) => (
          <Tooltip key={text} text={text} position="top">
            <Link
              href={localizePathname("/", locale)}
              className="flex h-fit items-center justify-center rounded-md bg-neutral-400 px-4 py-1.5 dark:bg-neutral-500"
            >
              <Image
                src={src}
                alt={text}
                width={width}
                height={height}
                style={{ height: "auto" }}
                className="md:object-contain"
              />
            </Link>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

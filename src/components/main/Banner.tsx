import Image from "next/image";
import Link from "next/link";
import { localizePathname } from "@/lib/i18n/routing";
import { getRequestLocale } from "@/lib/i18n/server";

export async function Banner() {
  const locale = await getRequestLocale();

  return (
    <Link href={localizePathname("/", locale)} className="w-full">
      <Image
        src="/static/banner.png"
        alt=""
        height={315}
        width={1660}
        className="h-auto w-full object-contain select-none"
        draggable="false"
      />
    </Link>
  );
}

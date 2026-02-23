import Image from "next/image";
import Link from "next/link";

export function Banner() {
  return (
    <Link href="/" className="w-full">
      <Image
        src="/static/banner.png"
        alt=""
        height={315}
        width={1660}
        className="w-full object-contain h-auto select-none"
        draggable="false"
      />
    </Link>
  );
}

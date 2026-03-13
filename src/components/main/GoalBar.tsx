import Image from "next/image";
import { getMessages } from "@/lib/i18n/messages";
import { getRequestLocale } from "@/lib/i18n/server";

export async function GoalBar() {
  const locale = await getRequestLocale();
  const { main } = getMessages(locale);

  return (
    <div className="flex w-full items-center justify-between rounded-full bg-linear-to-r from-yellow-300 to-orange-400 px-4 py-3 font-semibold text-red-900 md:py-1 xl:w-155.25">
      <div>
        <p className="font-bold">0 CZK</p>
      </div>
      <div className="absolute left-1/2">
        <Image
          src="/images/goalbar-ball.png"
          alt={main.goalBarBallAlt}
          width={130}
          className="relative object-contain select-none"
          draggable="false"
          height={130}
          style={{ height: "auto" }}
        />
      </div>
      <div className="font-bold">500 CZK</div>
    </div>
  );
}

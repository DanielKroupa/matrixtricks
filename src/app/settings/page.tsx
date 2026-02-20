import { getServerSession } from "@/lib/get-session";
import { entitlementService } from "@/application/billing/entitlement.service";
import { vipPriceService } from "@/application/billing/vip-price.service";
import { VipCheckoutCard } from "./VipCheckoutCard";
import { getCurrentUserOnlineVisibility } from "@/app/helpers/online-visibility";
import { OnlineVisibilityToggle } from "./OnlineVisibilityToggle";

import { unauthorized } from "next/navigation";
import Link from "next/link";

export default async function Page() {
  const session = await getServerSession();
  const user = session?.user;
  const vipStatus = await entitlementService.getUserVipStatus(user?.id);
  const effectivePrices = await vipPriceService.listEffectivePrices();
  const onlineVisibility = await getCurrentUserOnlineVisibility();
  const configuredCurrencies = effectivePrices.map((price) => price.currency);
  const vipExpiresText = vipStatus.expiresAt
    ? vipStatus.expiresAt.toLocaleDateString("cs-CZ")
    : "No expiry";

  if (!user) {
    unauthorized();
  }
  return (
    <div className="flex justify-evenly gap-2">
      <form className="w-lg rounded-br-md rounded-bl-md border-r-2 border-b-2 border-l-2 border-neutral-300 dark:border-neutral-700">
        <h3 className="bg-neutral-300 p-2 text-center font-medium dark:bg-neutral-700">
          User info
        </h3>
        <div className="space-y-4 p-4">
          <span className="text-xl">{user?.name} </span>
          <div className="flex items-center gap-4 py-2">
            <OnlineVisibilityToggle initialEnabled={onlineVisibility.enabled} />
          </div>
          <div className="flex">
            <p className="">
              VIP: <span>{vipStatus.isVipActive ? "Active" : "Inactive"}</span>
            </p>
          </div>
        </div>
      </form>
      <form className="">
        <h3 className="bg-neutral-300 p-2 text-center font-medium dark:bg-neutral-700">
          Change password
        </h3>
        <div className="w-full rounded-br-md rounded-bl-md border-r-2 border-b-2 border-l-2 border-neutral-300 dark:border-neutral-700">
          <div className="space-y-4 p-4">
            <div className="flex flex-col gap-2">
              <label className="font-normal">Current password:</label>
              <input
                type="password"
                autoComplete="current-password"
                className="w-full rounded bg-neutral-300 px-2 py-1.5 ring-neutral-400 outline-none focus:ring-2 md:w-72 dark:bg-neutral-700 dark:ring-neutral-600"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label>New password:</label>
              <input
                type="password"
                autoComplete="new-password"
                className="w-full rounded bg-neutral-300 px-2 py-1.5 ring-neutral-400 outline-none focus:ring-2 md:w-72 dark:bg-neutral-700 dark:ring-neutral-600"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label>Confirm new password:</label>
              <input
                type="password"
                autoComplete="new-password"
                className="w-full rounded bg-neutral-300 px-2 py-1.5 ring-neutral-400 outline-none focus:ring-2 md:w-72 dark:bg-neutral-700 dark:ring-neutral-600"
              />
            </div>
            <button
              type="submit"
              className="mr-2 flex w-full cursor-pointer items-center justify-center gap-2 justify-self-center rounded-md bg-cyan-800 px-4 py-2 text-white shadow-md md:w-fit dark:bg-cyan-900"
            >
              Update password
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

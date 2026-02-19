import { getServerSession } from "@/lib/get-session";
import { entitlementService } from "@/application/billing/entitlement.service";
import { vipPriceService } from "@/application/billing/vip-price.service";
import { VipCheckoutCard } from "./VipCheckoutCard";

import { unauthorized } from "next/navigation";
import Link from "next/link";

export default async function Page() {
  const session = await getServerSession();
  const user = session?.user;
  const vipStatus = await entitlementService.getUserVipStatus(user?.id);
  const effectivePrices = await vipPriceService.listEffectivePrices();
  const configuredCurrencies = effectivePrices.map((price) => price.currency);
  const vipExpiresText = vipStatus.expiresAt
    ? vipStatus.expiresAt.toLocaleDateString("cs-CZ")
    : "No expiry";

  if (!user) {
    unauthorized();
  }
  return (
    <div className="flex gap-2">
      <div className="rounded-br-md rounded-bl-md border-r-2 border-b-2 border-l-2 border-neutral-600">
        <h3 className="bg-neutral-600 p-2 font-medium">User info</h3>
        <span className="text-xl">{user?.name} </span>
        <div className="flex items-center gap-4">
          <div className="">
            <button className="flex items-center justify-center gap-1.5 rounded-md bg-neutral-500 px-2 py-1.5">
              <span className="flex size-3 rounded-full bg-green-500 p-1"></span>
              Online
            </button>
          </div>
          <div> / </div>
          <div>
            <button className="flex items-center justify-center gap-1.5 rounded-md bg-neutral-500 px-2 py-1.5">
              <span className="flex size-3 rounded-full bg-amber-600 p-1"></span>
              Offline
            </button>
          </div>
        </div>
        <div className="flex gap-4">
          <p className="">
            VIP: <span>{vipStatus.isVipActive ? "Active" : "Inactive"}</span>
          </p>

          <div className="space-y-2">
            <VipCheckoutCard
              isVipActive={vipStatus.isVipActive}
              vipExpiresText={vipExpiresText}
              currencies={configuredCurrencies}
              isAdmin={user?.role === "admin"}
            />
            {user?.role === "admin" ? (
              <Link
                href="/admin/monetization"
                className="rounded-md bg-neutral-600 px-3 py-2"
              >
                Manage VIP
              </Link>
            ) : null}
          </div>
        </div>
      </div>
      <form className="">
        <h3 className="bg-neutral-600 p-2 text-center font-medium">
          Change password
        </h3>
        <div className="w-full rounded-br-md rounded-bl-md border-r-2 border-b-2 border-l-2 border-neutral-600">
          <div className="space-y-4 p-4">
            <div className="flex flex-col gap-2">
              <label className="font-normal">Current password:</label>
              <input
                type="password"
                autoComplete="current-password"
                className="w-full rounded bg-neutral-300 px-2 py-1.5 outline-none md:w-72 dark:bg-neutral-800"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label>New password:</label>
              <input
                type="password"
                autoComplete="new-password"
                className="w-full rounded bg-neutral-300 px-2 py-1.5 outline-none md:w-72 dark:bg-neutral-800"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label>Confirm new password:</label>
              <input
                type="password"
                autoComplete="new-password"
                className="w-full rounded bg-neutral-300 px-2 py-1.5 outline-none md:w-72 dark:bg-neutral-800"
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

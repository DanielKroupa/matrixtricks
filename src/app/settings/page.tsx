import { getServerSession } from "@/lib/get-session";
import { entitlementService } from "@/application/billing/entitlement.service";
import { vipPriceService } from "@/application/billing/vip-price.service";
import { VipCheckoutCard } from "./VipCheckoutCard";
import { getCurrentUserOnlineVisibility } from "@/app/helpers/online-visibility";
import { OnlineVisibilityToggle } from "@/app/components/social/OnlineVisibilityToggle";
import { canUserChangePassword } from "@/app/helpers/auth-capabilities";

import { unauthorized } from "next/navigation";
import UpdatePasswordForm from "../components/authLayout/UpdatePasswordForm";
import DeleteAccountForm from "../components/authLayout/DeleteAccountForm";
import SettingsAvatarForm from "../components/authLayout/SettingsAvatarForm";

import Image from "next/image";

export default async function Page() {
  const session = await getServerSession();
  const user = session?.user;
  const vipStatus = await entitlementService.getUserVipStatus(user?.id);
  const effectivePrices = await vipPriceService.listEffectivePrices();
  const onlineVisibility = await getCurrentUserOnlineVisibility();
  const canChangePassword = user?.id
    ? await canUserChangePassword(user.id)
    : false;
  const configuredCurrencies = effectivePrices.map((price) => price.currency);
  const vipExpiresText = vipStatus.expiresAt
    ? vipStatus.expiresAt.toLocaleDateString("cs-CZ")
    : "No expiry";

  if (!user) {
    unauthorized();
  }
  return (
    <>
      <div className="block justify-center gap-2 md:flex">
        <div className="mb-4 rounded-br-md rounded-bl-md border-r-2 border-b-2 border-l-2 border-neutral-300 md:min-w-sm lg:min-w-lg dark:border-neutral-700">
          <h3 className="bg-neutral-300 p-2 text-center font-medium dark:bg-neutral-700">
            User info
          </h3>
          <div className="space-y-4 p-4">
            <span className="text-xl font-medium">{user?.name} </span>
            <SettingsAvatarForm user={user} />

            <div className="flex items-center gap-4 py-2">
              <OnlineVisibilityToggle
                initialEnabled={onlineVisibility.enabled}
              />
            </div>

            <div className="flex">
              <p className="">
                VIP:{" "}
                <span>{vipStatus.isVipActive ? "Active" : "Inactive"}</span>
              </p>
              <VipCheckoutCard
                isVipActive={vipStatus.isVipActive}
                vipExpiresText={vipExpiresText}
                currencies={configuredCurrencies}
                isAdmin={user?.role === "ADMIN"}
              />
            </div>
          </div>
        </div>
        <div className="ml-0 w-full md:ml-10 md:w-fit">
          <UpdatePasswordForm canChangePassword={canChangePassword} />
        </div>
      </div>
      <DeleteAccountForm canChangePassword={canChangePassword} />
    </>
  );
}

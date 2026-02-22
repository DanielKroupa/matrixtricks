import type { Metadata } from "next";
import { forbidden, unauthorized } from "next/navigation";
import { getSiteSettings } from "@/app/helpers/main-title";
import { getCurrentUserOnlineVisibility } from "@/app/helpers/online-visibility";
import { canUserChangePassword } from "@/app/helpers/auth-capabilities";
import { getServerSession } from "@/lib/get-session";
import { ProfileDetailsForm } from "../components/adminPage/profile-details-form";
import UpdatePasswordForm from "../components/authLayout/UpdatePasswordForm";

export const metadata: Metadata = {
  title: "Admin settings | Matrix Tricks",
};

export default async function Page() {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    unauthorized();
  }
  if (user?.role !== "admin") {
    forbidden();
  }

  const siteSettings = await getSiteSettings();
  const onlineVisibility = await getCurrentUserOnlineVisibility();
  const canChangePassword = await canUserChangePassword(user.id);

  return (
    <div className="block w-full justify-evenly md:flex">
      <div className="w-full">
        <h3 className="text-lg font-medium">Admin profile settings</h3>
        <p className="mt-3 text-base font-thin text-neutral-400 dark:text-white">
          Change admin profile, edit bio or change password
        </p>
        <ProfileDetailsForm
          user={user}
          initialTitle={siteSettings.title}
          initialBio={siteSettings.bio}
          initialOnlineVisibilityEnabled={onlineVisibility.enabled}
        />
      </div>
      <div className="ml-0 w-full self-end md:ml-10">
        <UpdatePasswordForm canChangePassword={canChangePassword} />
      </div>
    </div>
  );
}

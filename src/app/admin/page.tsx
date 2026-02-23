import type { Metadata } from "next";
import { forbidden, unauthorized } from "next/navigation";
import { ProfileDetailsForm } from "@/components/admin/profile-details-form";
import UpdatePasswordForm from "@/components/auth/UpdatePasswordForm";
import { canUserChangePassword } from "@/lib/auth-capabilities";
import { getServerSession } from "@/lib/get-session";
import { getSiteSettings } from "@/lib/main-title";
import { getCurrentUserOnlineVisibility } from "@/lib/online-visibility";

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
      <div className="ml-0 self-end lg:ml-10">
        <UpdatePasswordForm canChangePassword={canChangePassword} />
      </div>
    </div>
  );
}

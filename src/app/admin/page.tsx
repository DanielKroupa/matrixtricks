import { Metadata } from "next";
import { getServerSession } from "@/lib/get-session";
import { forbidden, unauthorized } from "next/navigation";
import { ProfileDetailsForm } from "../components/adminPage/profile-details-form";
import UpdatePasswordForm from "../components/adminPage/update-password-form";
import { getSiteSettings } from "@/app/helpers/main-title";

export const metadata: Metadata = {
  title: "Admin settings | Matrix Tricks",
};

export default async function Page({}) {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) {
    unauthorized();
  }
  if (user?.role !== "admin") {
    forbidden();
  }

  const siteSettings = await getSiteSettings();

  return (
    <>
      <div className="block md:flex">
        <div className="w-full">
          <h3 className="text-lg font-medium">Admin profile settings</h3>
          <p className="mt-3 text-base font-thin text-neutral-400 dark:text-white">
            Change admin profile, edit bio or change password
          </p>
          <ProfileDetailsForm
            user={user}
            initialTitle={siteSettings.title}
            initialBio={siteSettings.bio}
          />
        </div>
        <UpdatePasswordForm />
      </div>
    </>
  );
}

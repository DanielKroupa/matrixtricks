import { Metadata } from "next";
import { getServerSession } from "@/lib/get-session";
import { forbidden, unauthorized } from "next/navigation";
import { ProfileDetailsForm } from "./profile-details-form";
import UpdatePasswordForm from "./update-password-form";

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

  return (
    <>
      <div className="md:flex block">
        <div className="w-full">
          <h3 className="text-lg font-medium">Admin profile settings</h3>
          <p className="font-thin dark:text-white text-neutral-400 text-base mt-3">
            Change admin profile, edit bio or change password
          </p>
          <ProfileDetailsForm user={user} />
        </div>
        <UpdatePasswordForm />
      </div>
    </>
  );
}

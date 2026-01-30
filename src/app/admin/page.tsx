import { Metadata } from "next";
import { getServerSession } from "@/lib/get-session";
import AvatarUpload from "./AvatarUpload";

export const metadata: Metadata = {
  title: "Admin settings | Matrix Tricks",
};

export default async function Page() {
  const session = await getServerSession();
  const user = session?.user;

  return (
    <>
      <form className="w-full" encType="multipart/form-data">
        <h3 className="text-lg font-medium">Admin profile settings</h3>
        <p className="font-thin dark:text-white text-neutral-400 text-base mt-3">
          Change admin profile, edit bio or change password
        </p>
        <AvatarUpload user={user} />
        <div className="flex">
          {/* Input change nickname */}
          <div className="w-72 space-y-4 ">
            <div className="flex flex-col gap-2">
              <p>Nickname:</p>
              <input
                type="text"
                className="dark:bg-neutral-700 bg-neutral-300 rounded px-2 py-1.5 w-72 outline-none"
              />
            </div>
            {/* Input change bio information */}
            <div className="flex flex-col gap-2">
              <p>Change bio information:</p>
              <textarea className="dark:bg-neutral-700 bg-neutral-300 rounded px-2 py-1.5 w-72 h-48 min-h-28 outline-none"></textarea>
              <button
                type="submit"
                className="dark:bg-cyan-900 bg-cyan-800 text-white py-2 px-3 rounded mr-2 w-fit cursor-pointer shadow-md flex justify-center items-center gap-2"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      </form>
      <form className="ml-10 w-full">
        {/* Input change password */}
        <div className="flex gap-2">
          <div className="w-full">
            <h3 className="text-lg dark:bg-neutral-600 bg-neutral-400 p-1">
              Change sign in password:
            </h3>
            <div>
              <p>Current password</p>
              <input
                type="text"
                className="dark:bg-neutral-700 bg-neutral-300 rounded px-2 py-1.5 w-72 outline-none"
              />
            </div>
            <div>
              <p>New password</p>
              <input
                type="text"
                className="dark:bg-neutral-700 bg-neutral-300 rounded px-2 py-1.5 w-72 outline-none"
              />
            </div>
            <div>
              <p>Confirm new password</p>
              <input
                type="text"
                className="dark:bg-neutral-700 bg-neutral-300 rounded px-2 py-1.5 w-72 outline-none"
              />
            </div>
            <button
              type="submit"
              className="dark:bg-cyan-900 bg-cyan-800 text-white py-2 px-3 rounded mr-2 w-fit cursor-pointer shadow-md flex justify-center items-center gap-2"
            >
              Update password
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

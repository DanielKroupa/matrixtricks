import { Metadata } from "next";
import { getServerSession } from "@/lib/get-session";
import AvatarUpload from "./AvatarUpload";
import AutoResizeTextarea from "../components/ui/form/AutoResizeTextarea";

export const metadata: Metadata = {
  title: "Admin settings | Matrix Tricks",
};

export default async function Page() {
  const session = await getServerSession();
  const user = session?.user;

  return (
    <>
      <div className="md:flex block">
        <div className="w-full">
          <h3 className="text-lg font-medium">Admin profile settings</h3>
          <p className="font-thin dark:text-white text-neutral-400 text-base mt-3">
            Change admin profile, edit bio or change password
          </p>
          <form className="pb-4" encType="multipart/form-data">
            <AvatarUpload user={user} />

            {/* Input change nickname */}
            <div className="md:w-72 w-auto space-y-4 ">
              <div className="flex flex-col gap-2">
                <label>Nickname:</label>
                <input
                  type="text"
                  className="dark:bg-neutral-700 bg-neutral-300 rounded px-2 py-1.5 md:w-72 w-auto outline-none"
                />
              </div>
              {/* Input change bio information */}
              <div className="flex flex-col gap-2 ">
                <label>Change bio information:</label>
                <AutoResizeTextarea />
                <button
                  type="submit"
                  className="dark:bg-cyan-900 w-full bg-cyan-800 mt-2 md:mb-0 mb-4 text-white py-2 px-3 rounded mr-2 md:w-fit cursor-pointer shadow-md flex justify-center items-center gap-2"
                >
                  Save changes
                </button>
              </div>
            </div>
          </form>
        </div>
        <form className="md:ml-10 ml-0 w-full self-end">
          {/* Input change password */}
          <div className="flex gap-2 border-b-2 border-l-2 rounded-br-md rounded-bl-md border-r-2 border-neutral-300 dark:border-neutral-600">
            <div className="w-full ">
              <h3 className="text-lg dark:bg-neutral-600 bg-neutral-300 p-1 text-center">
                Change sign in password:
              </h3>
              <div className="space-y-4 p-4">
                <div className="flex flex-col">
                  <label>Current password</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    className="dark:bg-neutral-700 bg-neutral-300 rounded px-2 py-1.5 md:w-72 w-full  outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <label>New password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="dark:bg-neutral-700 bg-neutral-300 rounded px-2 py-1.5 md:w-72 w-full  outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <label>Confirm new password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className="dark:bg-neutral-700 bg-neutral-300 rounded px-2 py-1.5 md:w-72 w-full  outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="dark:bg-cyan-900 bg-cyan-800 text-white py-2 px-3 rounded mr-2 md:w-fit w-full cursor-pointer shadow-md flex justify-center items-center gap-2"
                >
                  Update password
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

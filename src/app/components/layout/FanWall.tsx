import Image from "next/image";
import AutoResizeTextarea from "../ui/form/AutoResizeTextarea";
import Badge from "../ui/Badge";
import { getServerSession } from "@/lib/get-session";

export async function FanWall() {
  const session = await getServerSession();
  const user = session?.user;

  const admin = session?.user?.role === "admin";

  const displayName =
    session?.user?.name ?? session?.user?.username ?? "Username";
  const avatarSrc =
    session?.user?.image ?? user?.image ?? "/uploads/avatars/alien.png";

  return (
    <div className="w-full md:block mx-auto my-3 px-1 md:px-0">
      <p className="text-lg text-center md:px-4 text-white  bg-cyan-700 py-2 rounded-t-lg">
        FanWall
      </p>
      {/* Pinned comment */}
      <div className="dark:bg-[#444444] bg-neutral-200 py-4">
        <div className="flex flex-row justify-baseline items-center md:gap-4 gap-2 md:px-6 px-2">
          <div className="">
            <Image
              src={avatarSrc}
              alt="profile-avatar"
              className="md:w-16 md:h-16 w-20 h-20 rounded-full object-cover"
              width={65}
              height={65}
            />
            <Badge />
            {/* <ProfileInformation user={user} /> */}
          </div>
          <div className="flex flex-col space-y-1">
            <h5 className="font-medium">Title - optional</h5>
            <p>{displayName}</p>
            <div
              className="dark:bg-neutral-500 bg-neutral-300 py-2 px-4 rounded-lg shadow
            "
            >
              <p className="font-normal md:text-base text-sm">
                Lorem ipsum maecenas viverra diam eget aliquet...
                <span className="font-medium"> Read more</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Message section */}
      <div className="dark:bg-neutral-700 bg-neutral-200 py-4">
        <div className="flex flex-row justify-baseline items-center md:gap-4 gap-2 md:px-6 px-2 py-4">
          <div className="w-1/4 md:w-auto">
            <Image
              src="/uploads/avatars/alien.png"
              alt="profile-avatar"
              className="md:w-16 md:h-16 w-20 h-20  object-contain"
              width={65}
              height={65}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <p>Alien</p>
            <div className="dark:bg-neutral-500 bg-neutral-300 py-2 px-4 rounded-lg shadow-md">
              <p className="font-light md:text-base text-sm">
                Lorem ipsum maecenas viverra diam eget aliquet...
                <span className="font-medium"> Read more</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-baseline items-center md:gap-4 gap-2 md:px-6 px-2 py-4">
          <div className="w-1/6 md:w-auto">
            <Image
              src="/uploads/avatars/alien.png"
              alt="profile-avatar"
              className="md:w-16 md:h-16 w-20 h-20  object-contain"
              width={65}
              height={65}
            />
          </div>
          <div className="flex flex-col space-y-1 w-4/5">
            <p>Alien</p>
            <div className="dark:bg-neutral-500 bg-neutral-300 py-2 px-4 rounded-lg shadow-md">
              <p className="font-light md:text-base text-sm">
                Lorem ipsum dolor sit amet consectetur. Faucibus nunc et posuere
                fermentum aliquet purus fermentum. Urna bibendum ornare aliquet
                in mattis neque mi orci in.
                <span className="font-medium"> Read more</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-baseline items-center md:gap-4 gap-2 md:px-6 px-2 py-4">
          <div>
            <Image
              src="/uploads/avatars/alien.png"
              alt="profile-avatar"
              className="md:w-16 md:h-16 w-20 h-20  object-contain"
              width={65}
              height={65}
            />
          </div>
          <div className="flex flex-col space-y-1">
            <p>Alien</p>
            <div className="dark:bg-neutral-500 bg-neutral-300 py-2 px-4 rounded-lg shadow-md">
              <p className="font-normal">
                Lorem ipsum maecenas viverra diam eget aliquet...
                <span className="font-medium"> Read more</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Form */}
      <form
        action=""
        className="py-4 dark:bg-neutral-700 bg-neutral-200 border-t-2 border-neutral-300 w-full flex-row justify-center md:px-16 px-4 dark:text-white text-neutral-700"
      >
        {!session && (
          <div className={`md:flex block flex-row gap-2 md:w-1/2 w-full py-2 `}>
            <input
              type="text"
              placeholder="Nickname*"
              name=""
              className="dark:bg-neutral-500 bg-neutral-300 outline-none md:w-96 w-full focus:ring-2 ring-neutral-400 dark:placeholder:text-[#aaaaaa] placeholder:text-neutral-400 rounded-md mb-2 md:mb-0 py-2 indent-2 shadow-md "
            />
            <input
              type="text"
              placeholder="Contact*"
              className="dark:bg-neutral-500 bg-neutral-300 outline-none md:w-96 w-full focus:ring-2 ring-neutral-400 dark:placeholder:text-[#aaaaaa] placeholder:text-neutral-400 rounded-md mb-2 md:mb-0 py-2 indent-2 shadow-md"
            />
          </div>
        )}

        <div className="flex flex-col gap-2">
          {admin && (
            <input
              type="text"
              placeholder="Title"
              className="dark:bg-neutral-500 bg-neutral-300 outline-none md:w-1/2 w-full focus:ring-2 ring-neutral-400 dark:placeholder:text-[#aaaaaa] placeholder:text-neutral-400 rounded-md mb-2 md:mb-0 py-2 indent-2 shadow-md "
            />
          )}
          <AutoResizeTextarea placeholder="Type a message.. Show your support or ask a question" />
        </div>
      </form>
    </div>
  );
}

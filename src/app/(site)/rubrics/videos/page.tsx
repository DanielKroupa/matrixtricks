import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Videos | Matrix Tricks",
};

const NUMBER_OF_VIDEOS = 8; // Adjust to control how many cards render.

type VideoCardProps = {
  title: string;
  likes: number;
  shares: number;
};

const VideoCard = ({ title, likes, shares }: VideoCardProps) => (
  <div className="dark:bg-neutral-700 rounded bg-neutral-300">
    <div className=" flex justify-between h-64 ">
      <div className="p-2.5">
        <p className="text-sm"> {title}</p>
      </div>
      <div className="flex p-2.5 gap-2 ">
        <Image
          src="/icons/pin.svg"
          className="size-4"
          alt=""
          width={16}
          height={16}
        />
        <Image
          src="/icons/video-icon.svg"
          className="size-4"
          width={16}
          height={16}
          alt=""
        />
      </div>
    </div>
    <div className="flex p-2 justify-between">
      <div className="flex gap-1.5 items-center">
        <Image
          src="/icons/heart.svg"
          className="size-4"
          width={16}
          height={16}
          alt=""
        />
        <span>{likes}</span>
      </div>

      <div className="flex gap-1.5 items-center">
        <Image
          src="/icons/share.svg"
          className="size-4"
          width={16}
          height={16}
          alt=""
        />
        <span>{shares}</span>
      </div>
    </div>
  </div>
);

export default function Page() {
  const videos = Array.from({ length: NUMBER_OF_VIDEOS }, (_, index) => ({
    id: index,
    title: "Basketbal Shaolin",
    likes: 366,
    shares: 366,
  }));

  return (
    <>
      {/* VideoList */}
      <div className="grid lg:grid-cols-5 md:grid-cols-4 grid-cols-3 gap-2 p-2">
        {videos.map(({ id, title, likes, shares }) => (
          <VideoCard key={id} title={title} likes={likes} shares={shares} />
        ))}
      </div>
    </>
  );
}

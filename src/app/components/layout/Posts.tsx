import Image from "next/image";

export function Posts() {
  return (
    <>
      {/* Texts */}
      <div className="p-2 w-full grid gap-4">
        <div className="bg-neutral-700 py-2 px-4">
          <h3 className="text-xl py-4 px-2">
            Lorem ipsum enim senectus nec enim rhoncus eu nunc velit eget leo
            dignissim elementum pharetra.
          </h3>
          <p className="text-normal p-2">
            Lorem ipsum dolor sit amet consectetur. Tortor habitasse massa porta
            a ultrices fermentum. In id tellus cras tristique. Tempus porttitor
            ut mauris arcu vel porttitor ac. Pharetra tempus eu cras viverra.
            Donec diam aenean eu est. Adipiscing habitant suscipit ut mattis
            malesuada nisi nulla. Id lectus pulvinar augue aliquet tincidunt. A
            eget egestas amet leo odio scelerisque amet. At ut mollis turpis
            etiam pellentesque. Nulla egestas arcu vel arcu phasellus. Facilisis
            lorem eget facilisi porttitor eu sociis diam.
          </p>
        </div>
        <div className="bg-neutral-700 py-2 px-4">
          <h3 className="text-xl py-4 px-2">
            Lorem ipsum enim senectus nec enim rhoncus eu nunc velit eget leo
            dignissim elementum pharetra.
          </h3>
          <p className="text-normal p-2">
            Lorem ipsum dolor sit amet consectetur. Tortor habitasse massa porta
            a ultrices fermentum. In id tellus cras tristique. Tempus porttitor
            ut mauris arcu vel porttitor ac. Pharetra tempus eu cras viverra.
            Donec diam aenean eu est. Adipiscing habitant suscipit ut mattis
            malesuada nisi nulla. Id lectus pulvinar augue aliquet tincidunt. A
            eget egestas amet leo odio scelerisque amet. At ut mollis turpis
            etiam pellentesque. Nulla egestas arcu vel arcu phasellus. Facilisis
            lorem eget facilisi porttitor eu sociis diam.
          </p>
        </div>
        <div className="bg-neutral-700 py-2 px-4">
          <h3 className="text-xl py-4 px-2">
            Lorem ipsum enim senectus nec enim rhoncus eu nunc velit eget leo
            dignissim elementum pharetra.
          </h3>
          <p className="text-normal p-2">
            Lorem ipsum dolor sit amet consectetur. Tortor habitasse massa porta
            a ultrices fermentum. In id tellus cras tristique. Tempus porttitor
            ut mauris arcu vel porttitor ac. Pharetra tempus eu cras viverra.
            Donec diam aenean eu est. Adipiscing habitant suscipit ut mattis
            malesuada nisi nulla. Id lectus pulvinar augue aliquet tincidunt. A
            eget egestas amet leo odio scelerisque amet. At ut mollis turpis
            etiam pellentesque. Nulla egestas arcu vel arcu phasellus. Facilisis
            lorem eget facilisi porttitor eu sociis diam.
          </p>
        </div>
        <div className="bg-neutral-700 py-2 px-4">
          <h3 className="text-xl py-4 px-2">
            Lorem ipsum enim senectus nec enim rhoncus eu nunc velit eget leo
            dignissim elementum pharetra.
          </h3>
          <p className="text-normal p-2">
            Lorem ipsum dolor sit amet consectetur. Tortor habitasse massa porta
            a ultrices fermentum. In id tellus cras tristique. Tempus porttitor
            ut mauris arcu vel porttitor ac. Pharetra tempus eu cras viverra.
            Donec diam aenean eu est. Adipiscing habitant suscipit ut mattis
            malesuada nisi nulla. Id lectus pulvinar augue aliquet tincidunt. A
            eget egestas amet leo odio scelerisque amet. At ut mollis turpis
            etiam pellentesque. Nulla egestas arcu vel arcu phasellus. Facilisis
            lorem eget facilisi porttitor eu sociis diam.
          </p>
        </div>
      </div>
      {/* VideoList */}
      <div className="grid lg:grid-cols-5 md:grid-cols-4 grid-cols-3 gap-2 p-2">
        {/* Video */}
        <div className="bg-neutral-700 rounded">
          <div className=" flex justify-between h-64 ">
            <div className="p-2.5">
              <p className="text-sm"> Basketbal Shaolin</p>
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
              <span>366</span>
            </div>
            <div className="flex gap-1.5 items-center">
              <Image
                src="/icons/share.svg"
                className="size-4"
                width={16}
                height={16}
                alt=""
              />
              <span>366</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

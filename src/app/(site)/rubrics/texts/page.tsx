import { TextPost } from "@/app/components/layout/TextPost";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Texts | Matrix Tricks",
};

export default function Page() {
  const textPosts = [
    {
      title:
        "Lorem ipsum enim senectus nec enim rhoncus eu nunc velit eget leo dignissim elementum pharetra.",
      body: (
        <>
          Lorem ipsum dolor sit amet consectetur. Tortor habitasse massa porta a
          ultrices fermentum. In id tellus cras tristique. Tempus porttitor ut
          mauris arcu vel porttitor ac. Pharetra tempus eu cras viverra. Donec
          diam aenean eu est. Adipiscing habitant suscipit ut mattis malesuada
          nisi nulla. Id lectus pulvinar augue aliquet tincidunt. A eget egestas
          amet leo odio scelerisque amet. At ut mollis turpis etiam
          pellentesque. Nulla egestas arcu vel arcu phasellus. Facilisis lorem
          eget facilisi porttitor eu sociis diam.
        </>
      ),
    },
    {
      title:
        "Lorem ipsum enim senectus nec enim rhoncus eu nunc velit eget leo dignissim elementum pharetra.",
      body: (
        <>
          Lorem ipsum dolor sit amet consectetur. Tortor habitasse massa porta a
          ultrices fermentum. In id tellus cras tristique. Tempus porttitor ut
          mauris arcu vel porttitor ac. Pharetra tempus eu cras viverra. Donec
          diam aenean eu est. Adipiscing habitant suscipit ut mattis malesuada
          nisi nulla. Id lectus pulvinar augue aliquet tincidunt. A eget egestas
          amet leo odio scelerisque amet. At ut mollis turpis etiam
          pellentesque. Nulla egestas arcu vel arcu phasellus. Facilisis lorem
          eget facilisi porttitor eu sociis diam.
        </>
      ),
    },
    {
      title:
        "Lorem ipsum enim senectus nec enim rhoncus eu nunc velit eget leo dignissim elementum pharetra.",
      body: (
        <>
          Lorem ipsum dolor sit amet consectetur. Tortor habitasse massa porta a
          ultrices fermentum. In id tellus cras tristique. Tempus porttitor ut
          mauris arcu vel porttitor ac. Pharetra tempus eu cras viverra. Donec
          diam aenean eu est. Adipiscing habitant suscipit ut mattis malesuada
          nisi nulla. Id lectus pulvinar augue aliquet tincidunt. A eget egestas
          amet leo odio scelerisque amet. At ut mollis turpis etiam
          pellentesque. Nulla egestas arcu vel arcu phasellus. Facilisis lorem
          eget facilisi porttitor eu sociis diam.
        </>
      ),
    },
    {
      title:
        "Lorem ipsum enim senectus nec enim rhoncus eu nunc velit eget leo dignissim elementum pharetra.",
      body: (
        <>
          Lorem ipsum dolor sit amet consectetur. Tortor habitasse massa porta a
          ultrices fermentum. In id tellus cras tristique. Tempus porttitor ut
          mauris arcu vel porttitor ac. Pharetra tempus eu cras viverra. Donec
          diam aenean eu est. Adipiscing habitant suscipit ut mattis malesuada
          nisi nulla. Id lectus pulvinar augue aliquet tincidunt. A eget egestas
          amet leo odio scelerisque amet. At ut mollis turpis etiam
          pellentesque. Nulla egestas arcu vel arcu phasellus. Facilisis lorem
          eget facilisi porttitor eu sociis diam.
        </>
      ),
    },
  ];

  return (
    <>
      {/* Texts */}
      <div className="p-2 w-full grid gap-4 dark:text-white text-black">
        {textPosts.map((post, index) => (
          <TextPost key={index} title={post.title} body={post.body} />
        ))}
      </div>
    </>
  );
}

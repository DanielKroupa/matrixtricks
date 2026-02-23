"use client";

import { useRouter } from "next/navigation";
import { PostModal } from "./PostModal";

export const PostModalRoute = ({
  post,
  rubric,
  closeHref,
}: {
  // biome-ignore lint/suspicious/noExplicitAny: Post shape varies by feed source and is normalized inside PostModal.
  post: any;
  rubric: string;
  closeHref?: string;
}) => {
  const router = useRouter();

  const handleClose = () => {
    if (closeHref) {
      router.push(closeHref);
      return;
    }

    router.back();
  };

  return (
    <PostModal
      post={{ ...post, rubric: post?.rubric ?? rubric }}
      onClose={handleClose}
      mode={closeHref ? "page" : "modal"}
    />
  );
};

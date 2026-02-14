"use client";

import { useRouter } from "next/navigation";
import { PostModal } from "./PostModal";

export const PostModalRoute = ({
  post,
  rubric,
  closeHref,
}: {
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
    />
  );
};

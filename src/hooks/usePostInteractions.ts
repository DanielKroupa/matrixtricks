"use client";

import { useEffect, useState } from "react";
import {
  getPostDetails,
  incrementShareCount,
  togglePostLike,
} from "@/actions/social";

// biome-ignore lint/suspicious/noExplicitAny: Initial post DTO is polymorphic across feed endpoints.
export const usePostInteractions = (initialPost: any) => {
  // biome-ignore lint/suspicious/noExplicitAny: Full post shape depends on route-mode payload enrichment.
  const [fullPost, setFullPost] = useState<any>(null);
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(
    initialPost._count?.likes || 0,
  );
  const [shareCount, setShareCount] = useState<number>(
    initialPost.shareCount || 0,
  );

  useEffect(() => {
    const fetchDetails = async () => {
      const details = await getPostDetails(initialPost.id);
      setFullPost(details);
      if (details) {
        setLiked(details.likes?.length > 0);
        setLikeCount(details._count.likes);
        setShareCount(details.shareCount || 0);
      }
    };

    fetchDetails();
  }, [initialPost.id]);

  const handleLike = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));
    await togglePostLike(initialPost.id);
  };

  const handleShareIncrement = async () => {
    setShareCount((prev) => prev + 1);
    await incrementShareCount(initialPost.id);
  };

  return {
    fullPost,
    setFullPost,
    liked,
    likeCount,
    shareCount,
    handleLike,
    handleShareIncrement,
  };
};

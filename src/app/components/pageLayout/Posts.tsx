"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Post {
  id: string;
  title: string;
  content: string;
  type: string;
  rubric: string;
  media: { id: string; url: string; type: string }[];
  createdAt: string;
}

export function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const normalizeEmptyParagraphs = (html: string) =>
    html.replace(/<p>(?:\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "<p><br></p>");

  useEffect(() => {
    fetch("/api/posts?rubric=videos")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid w-full gap-4 p-2 text-black dark:text-white">
      {posts.map((post) => (
        <div key={post.id} className="rounded border p-4">
          <h2 className="text-xl font-bold">{post.title}</h2>
          <p className="text-sm text-gray-500">{post.rubric}</p>
          {post.content && (
            <div
              dangerouslySetInnerHTML={{
                __html: normalizeEmptyParagraphs(post.content),
              }}
            />
          )}
          <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
            {post.media.map((media) => (
              <div key={media.id}>
                {media.type === "image" ? (
                  <Image
                    src={media.url}
                    alt=""
                    width={300}
                    height={200}
                    className="h-auto w-full"
                  />
                ) : (
                  <video src={media.url} controls className="w-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

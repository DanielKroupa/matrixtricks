"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaCheck } from "react-icons/fa6";
import { MdOutlineFileUpload } from "react-icons/md";
import PrimaryButton from "@/components/ui/form/PrimaryButton";
import { RichTextEditor } from "@/components/ui/form/RichTextEditor";
import { Spinner } from "@/components/ui/spinner";
import {
  postSchema,
  type PostFormData,
} from "@/lib/schemas/postsChema/post-schema";

const rubrics = [
  { value: "TEXTS", label: "Texts" },
  { value: "BASICS", label: "Basics" },
  { value: "VIDEOS", label: "Videos" },
  { value: "TRICKS", label: "Tricks" },
] as const;

export default function NewPostPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [vipOnly, setVipOnly] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      type: undefined,
      rubric: undefined,
      scheduledAt: undefined,
      vipOnly: false,
    },
  });

  const postType = watch("type");

  const onSubmit = async (data: PostFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content || "");
      formData.append("type", data.type);
      formData.append("rubric", data.rubric);

      if (data.scheduledAt) {
        formData.append("scheduledAt", data.scheduledAt);
      }

      formData.append("vipOnly", String(vipOnly));

      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        alert("Error creating post");
        return;
      }

      const post = await response.json();

      if (mediaFiles.length > 0) {
        for (const file of mediaFiles) {
          const mediaFormData = new FormData();
          mediaFormData.append("file", file);
          mediaFormData.append("postId", post.id);

          await fetch("/api/media", {
            method: "POST",
            body: mediaFormData,
          });
        }
      }

      alert("Post created successfully!");
      reset();
      setMediaFiles([]);
      setVipOnly(false);
    } catch (error) {
      console.error(error);
      alert("Error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="block md:flex">
      <div className="mx-auto my-3 w-full px-1 md:block md:px-0">
        <h3 className="bg-cyan-800 py-2 text-center text-lg font-medium text-white dark:bg-cyan-900">
          New post
        </h3>
        <form
          encType="multipart/form-data"
          onSubmit={handleSubmit(onSubmit)}
          className="bg-neutral-200 px-2 py-6 md:px-12 md:py-18 lg:px-36 lg:py-12 xl:px-64 dark:bg-neutral-700"
        >
          <div className="mb-4">
            <p className="mb-2 block text-black dark:text-white">
              Choose a type:
            </p>
            <div className="flex gap-4">
              <label className="hover flex cursor-pointer items-center rounded-md bg-neutral-300 px-4 py-2 transition-colors peer-checked:bg-neutral-400 hover:bg-neutral-400 dark:bg-neutral-600 dark:peer-checked:bg-cyan-800 dark:hover:bg-neutral-500">
                <input
                  type="radio"
                  value="text"
                  {...register("type")}
                  className="peer sr-only"
                />
                <span className="mr-2 h-4 w-4 rounded-full border-2 border-white peer-checked:border-cyan-700 peer-checked:bg-cyan-700" />
                Text
              </label>
              <label className="hover flex cursor-pointer items-center rounded-md bg-neutral-300 px-4 py-2 transition-colors peer-checked:bg-neutral-400 hover:bg-neutral-400 dark:bg-neutral-600 dark:peer-checked:bg-cyan-800 dark:hover:bg-neutral-500">
                <input
                  type="radio"
                  value="media"
                  {...register("type")}
                  className="peer sr-only"
                />
                <span className="mr-2 h-4 w-4 rounded-full border-2 border-white peer-checked:border-cyan-700 peer-checked:bg-cyan-700" />
                Media
              </label>
            </div>
            {errors.type && <p className="text-red-500">{errors.type.message}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-black dark:text-white" htmlFor="title">
              <span className="text-red-600">*</span> Title
            </label>
            <input
              type="text"
              id="title"
              {...register("title")}
              className="mt-2 w-full rounded bg-neutral-300 px-2 py-1.5 outline-none dark:bg-neutral-600"
              placeholder="Enter title"
            />
            {errors.title && <p className="text-red-500">{errors.title.message}</p>}
          </div>

          <div className="mb-4 max-w-64">
            <p className="block text-black dark:text-white">
              <span className="text-red-600">*</span> Rubric
            </p>
            <select
              required
              {...register("rubric")}
              defaultValue="default"
              className="mt-2 w-full cursor-pointer rounded bg-neutral-300 px-2 py-1.5 outline-none dark:bg-neutral-600"
            >
              <option value="default" disabled hidden>
                Select rubric
              </option>
              {rubrics.map((rubric) => (
                <option key={rubric.value} value={rubric.value}>
                  {rubric.label}
                </option>
              ))}
            </select>
            {errors.rubric && <p className="text-red-500">{errors.rubric.message}</p>}
          </div>

          {postType === "text" && (
            <div className="mb-4">
              <span className="mb-2 block text-black dark:text-white">Content</span>
              <RichTextEditor
                value={watch("content") || ""}
                onChange={(value) => setValue("content", value)}
              />
            </div>
          )}

          {(postType === "text" || postType === "media") && (
            <div className="mb-4">
              <p className="mb-2 block text-black dark:text-white">Media</p>
              <div className="flex">
                <input
                  id="media_upload"
                  type="file"
                  multiple
                  accept={
                    postType === "text"
                      ? ".jpg, .jpeg, .png, .webp"
                      : "image/*,video/*"
                  }
                  onChange={(event) =>
                    setMediaFiles(Array.from(event.target.files || []))
                  }
                  className="hidden"
                />
                <label
                  htmlFor="media_upload"
                  className="mr-2 mb-4 flex w-fit cursor-pointer items-center justify-center gap-2 rounded bg-cyan-800 px-3 py-2 text-white shadow-md hover:bg-cyan-900"
                >
                  <MdOutlineFileUpload size={20} />
                  Upload Media
                </label>
              </div>

              <div className="flex flex-wrap gap-4">
                {mediaFiles.map((file) => {
                  const fileKey = `${file.name}-${file.lastModified}-${file.size}-${file.type}`;

                  return (
                    <div
                      key={fileKey}
                      className="flex h-fit w-fit flex-col items-start gap-2 rounded bg-neutral-300 p-1 dark:bg-neutral-600"
                    >
                      {file.type.startsWith("image/") ? (
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          width={320}
                          height={320}
                          unoptimized
                          className="max-h-1/2 max-w-1/2 rounded object-cover"
                        />
                      ) : (
                        <video
                          src={URL.createObjectURL(file)}
                          className="max-h-1/2 max-w-1/2 rounded object-cover"
                          controls
                        >
                          <track kind="captions" srcLang="en" label="English" />
                        </video>
                      )}

                      <div>
                        <p className="mt-1 text-sm text-black dark:text-white">
                          {file.name}
                        </p>
                        <p className="text-xs text-black dark:text-white">
                          Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setMediaFiles((prev) =>
                            prev.filter(
                              (entry) =>
                                `${entry.name}-${entry.lastModified}-${entry.size}-${entry.type}` !==
                                fileKey,
                            ),
                          )
                        }
                        className="mt-1 cursor-pointer rounded-md bg-red-500 px-2 py-1 text-sm text-white hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mb-4">
            <p className="mb-2 block text-black dark:text-white">Schedule (optional)</p>
            <input
              type="datetime-local"
              {...register("scheduledAt")}
              className="rounded bg-neutral-300 px-2 py-1.5 outline-none dark:bg-neutral-600"
            />
          </div>

          <div className="mb-4 flex items-center">
            <label
              htmlFor="vip-only"
              className="flex cursor-pointer items-center gap-2 select-none"
            >
              <input
                id="vip-only"
                type="checkbox"
                checked={vipOnly}
                onChange={(event) => setVipOnly(event.target.checked)}
                className="peer sr-only"
                aria-checked={vipOnly}
              />

              <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-gray-400 bg-neutral-300 transition-colors peer-checked:border-cyan-600 peer-checked:bg-cyan-700 dark:border-gray-600 dark:bg-neutral-800">
                {vipOnly && <FaCheck size={14} className="text-white" />}
              </span>

              <p className="text-base text-neutral-700 dark:text-neutral-300">
                Show this content only for <span className="font-golden font-semibold">VIP</span> users.
              </p>
            </label>
          </div>

          <PrimaryButton type="submit" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="size-5" /> Creating a new post...
              </span>
            ) : (
              "Create Post"
            )}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}

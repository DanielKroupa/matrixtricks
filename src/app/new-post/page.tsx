"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema, PostFormData } from "@/app/helpers/post-schema";
import { MdOutlineFileUpload } from "react-icons/md";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { Spinner } from "@/components/ui/spinner";
import { RichTextEditor } from "@/components/RichTextEditor";

const rubrics = [
  { value: "TEXTS", label: "Texts" },
  { value: "BASICS", label: "Basics" },
  { value: "VIDEOS", label: "Videos" },
  { value: "TRICKS", label: "Tricks" },
];

export default function NewPostPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

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

      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        alert("Error creating post");
        return;
      }

      const post = await response.json();

      // Upload media if any
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
      // Reset form
      reset();
      setMediaFiles([]);
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
          onSubmit={handleSubmit(onSubmit)}
          className="bg-neutral-200 px-2 py-6 md:px-36 md:py-12 dark:bg-neutral-700"
        >
          {/* Type Selection */}
          <div className="mb-4">
            <label className="mb-2 block text-black dark:text-white">
              Choose a type:
            </label>
            <div className="flex gap-4">
              <label className="hover flex cursor-pointer items-center rounded-md bg-neutral-300 px-4 py-2 transition-colors peer-checked:bg-neutral-400 hover:bg-neutral-400 dark:bg-neutral-600 dark:peer-checked:bg-cyan-800 dark:hover:bg-neutral-500">
                <input
                  type="radio"
                  value="text"
                  {...register("type")}
                  className="peer sr-only"
                />
                <span className="mr-2 h-4 w-4 rounded-full border-2 border-white peer-checked:border-cyan-700 peer-checked:bg-cyan-700"></span>
                Text
              </label>
              <label className="hover flex cursor-pointer items-center rounded-md bg-neutral-300 px-4 py-2 transition-colors peer-checked:bg-neutral-400 hover:bg-neutral-400 dark:bg-neutral-600 dark:peer-checked:bg-cyan-800 dark:hover:bg-neutral-500">
                <input
                  type="radio"
                  value="media"
                  {...register("type")}
                  className="peer sr-only"
                />
                <span className="mr-2 h-4 w-4 rounded-full border-2 border-white peer-checked:border-cyan-700 peer-checked:bg-cyan-700"></span>
                Media
              </label>
            </div>
            {errors.type && (
              <p className="text-red-500">{errors.type.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="mb-2 block text-black dark:text-white">
              <span className="text-red-600">*</span>
              Title
            </label>
            <input
              type="text"
              {...register("title")}
              className="w-full rounded bg-neutral-300 px-2 py-1.5 outline-none dark:bg-neutral-600"
              placeholder="Enter title"
            />
            {errors.title && (
              <p className="text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Rubric */}
          <div className="mb-4 max-w-64">
            <label className="mb-2 block text-black dark:text-white">
              <span className="text-red-600">*</span>
              Rubric
            </label>
            <select
              required
              {...register("rubric")}
              defaultValue={"default"}
              className="w-full cursor-pointer rounded bg-neutral-300 px-2 py-1.5 outline-none dark:bg-neutral-600"
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
            {errors.rubric && (
              <p className="text-red-500">{errors.rubric.message}</p>
            )}
          </div>

          {/* Content */}
          {postType === "text" && (
            <div className="mb-4">
              <label className="mb-2 block text-black dark:text-white">
                Content
              </label>
              <RichTextEditor
                value={watch("content") || ""}
                onChange={(value) => setValue("content", value)}
              />
            </div>
          )}

          {/* Media Upload */}
          {(postType === "text" || postType === "media") && (
            <div className="mb-4">
              <label className="mb-2 block text-black dark:text-white">
                Media
              </label>
              <div className="flex">
                <input
                  id="media_upload"
                  type="file"
                  multiple
                  accept={postType === "text" ? "image/*" : "image/*,video/*"}
                  onChange={(e) =>
                    setMediaFiles(Array.from(e.target.files || []))
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                {mediaFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-start gap-2 rounded bg-neutral-300 p-1 dark:bg-neutral-600"
                  >
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="h-fit w-full rounded object-cover"
                      />
                    ) : (
                      <video
                        src={URL.createObjectURL(file)}
                        className="h-fit w-full rounded object-cover"
                        controls
                      />
                    )}
                    <div className="">
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
                        setMediaFiles(mediaFiles.filter((_, i) => i !== index))
                      }
                      className="mt-1 cursor-pointer text-sm text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scheduling */}
          <div className="mb-4">
            <label className="mb-2 block text-black dark:text-white">
              Schedule (optional)
            </label>
            <input
              type="datetime-local"
              {...register("scheduledAt")}
              className="rounded bg-neutral-300 px-2 py-1.5 outline-none dark:bg-neutral-600"
            />
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

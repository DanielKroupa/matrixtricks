import type { NextRequest } from "next/server";
import {
  handlePostsGet,
  handlePostsPost,
} from "@/interface/http/posts/posts.controller";

export async function POST(request: NextRequest) {
  return handlePostsPost(request);
}

export async function GET(request: NextRequest) {
  return handlePostsGet(request);
}

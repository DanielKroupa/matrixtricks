import type { NextRequest } from "next/server";
import {
  handlePostByIdDelete,
  handlePostByIdPatch,
} from "@/interface/http/posts/post-by-id.controller";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handlePostByIdPatch(request, id);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handlePostByIdDelete(id);
}

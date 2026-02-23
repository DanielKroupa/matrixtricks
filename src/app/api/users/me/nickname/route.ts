import { handleMyNicknamePatch } from "@/interface/http/account/username-availability.controller";

export async function PATCH(request: Request) {
  return handleMyNicknamePatch(request);
}

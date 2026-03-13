import { handleMyLanguagePatch } from "@/interface/http/account/language-preference.controller";

export async function PATCH(request: Request) {
  return handleMyLanguagePatch(request);
}

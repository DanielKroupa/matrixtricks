import { handleUsernameAvailabilityGet } from "@/interface/http/account/username-availability.controller";

export async function GET(request: Request) {
  return handleUsernameAvailabilityGet(request);
}

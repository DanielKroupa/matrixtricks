import {
  handleFanwallMessagesGet,
  handleFanwallMessagesPost,
} from "@/interface/http/fanwall/messages.controller";

export async function GET(request: Request) {
  return handleFanwallMessagesGet(request);
}

export async function POST(request: Request) {
  return handleFanwallMessagesPost(request);
}

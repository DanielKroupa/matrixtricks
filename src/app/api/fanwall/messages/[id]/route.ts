import {
  handleFanwallMessageDelete,
  handleFanwallMessagePatch,
} from "@/interface/http/fanwall/message-by-id.controller";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleFanwallMessagePatch(request, id);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleFanwallMessageDelete(request, id);
}

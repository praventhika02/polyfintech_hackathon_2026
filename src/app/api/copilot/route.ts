import { NextResponse } from "next/server";
import { askCopilot } from "@/features/copilot/service";
import { createApiResponse } from "@/utils/api-response";

type CopilotBody = {
  conversationId?: string;
  message?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CopilotBody;
  const result = await askCopilot({
    conversationId: body.conversationId,
    message: body.message || ""
  });
  return NextResponse.json(createApiResponse(result));
}

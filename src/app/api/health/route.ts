import { NextResponse } from "next/server";
import { appConfig } from "@/config/app";
import { createApiResponse } from "@/utils/api-response";

export function GET() {
  return NextResponse.json(
    createApiResponse({
      status: "ok",
      service: appConfig.name,
      version: appConfig.apiVersion
    })
  );
}

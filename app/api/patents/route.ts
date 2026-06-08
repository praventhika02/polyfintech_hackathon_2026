import { NextResponse } from "next/server";

export async function GET() {
  const configured = Boolean(process.env.PATENTSVIEW_API_KEY);
  return NextResponse.json({
    available: configured,
    source: configured ? "PatentsView" : "PatentsView API key optional",
    message: configured
      ? "Patent signal connector is configured."
      : "Patent innovation is estimated from public news until PATENTSVIEW_API_KEY is added."
  });
}

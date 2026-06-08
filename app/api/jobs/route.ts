import { NextResponse } from "next/server";

export async function GET() {
  const configured = Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY);
  return NextResponse.json({
    available: configured,
    source: configured ? "Adzuna" : "Adzuna API keys required",
    message: configured
      ? "Job signal connector is configured."
      : "Add ADZUNA_APP_ID and ADZUNA_APP_KEY to enable live sustainability hiring signals."
  });
}

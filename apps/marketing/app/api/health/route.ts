import { NextResponse } from "next/server";

export async function GET() {
  const loopsEndpoint = process.env.NEXT_LOOP_FORM_ENDPOINT;
  const loopsFormId = process.env.NEXT_LOOP_FORM_ID;

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: {
      loopsConfigured: !!(loopsEndpoint && loopsFormId),
      loopsFormId: loopsFormId ? "configured" : "missing",
    },
  });
}

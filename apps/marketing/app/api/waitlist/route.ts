import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 },
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    // Get Loops endpoint from environment variables
    const loopsEndpoint = process.env.NEXT_LOOP_FORM_ENDPOINT;

    if (!loopsEndpoint) {
      console.error("NEXT_LOOP_FORM_ENDPOINT not configured");
      return NextResponse.json(
        { success: false, message: "Form endpoint not configured" },
        { status: 500 },
      );
    }

    // Prepare form data for Loops
    const formBody = new URLSearchParams({
      email: email.trim().toLowerCase(),
      source: "Ordo Landing Page",
      userGroup: "Waitlist",
    }).toString();

    // Submit to Loops
    const response = await fetch(loopsEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    });

    const loopsResponse = await response.json();

    if (response.ok && loopsResponse.success) {
      return NextResponse.json({
        success: true,
        message: "Successfully added to waitlist!",
      });
    } else {
      console.error("Loops API error:", loopsResponse);
      return NextResponse.json(
        {
          success: false,
          message: loopsResponse.message || "Failed to add to waitlist",
        },
        { status: response.status },
      );
    }
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const slug = pathname.split("/").pop();
    const response = await prisma.surveys.findUnique({
      where: { slug },
    });

    if (!response) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }
    return NextResponse.json({ response }, { status: 200 });
  } catch (error) {
    console.error("Error fetching surveys:", error);
    return NextResponse.json(
      { error: "Failed to fetch surveys" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const slug = pathname.split("/").pop();
    
    // Find the survey by slug to get the ID
    const survey = await prisma.surveys.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { answers, email } = body;
    
    // Validate that answers is an array
    if (!Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Invalid answers format. Expected an array." },
        { status: 400 }
      );
    }

    // Create response in database
    const response = await prisma.responses.create({
      data: {
        survey_id: survey.id,
        email: email || null,
        answers: answers,
      },
    });

    return NextResponse.json(
      { message: "Response saved successfully", responseId: response.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving survey response:", error);
    return NextResponse.json(
      { error: "Failed to save survey response" },
      { status: 500 }
    );
  }
}

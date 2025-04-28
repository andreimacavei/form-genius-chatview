import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    // const slug = pathname.split("/")[4]; // Get surveyId from /api/survey/[slug]/pages
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

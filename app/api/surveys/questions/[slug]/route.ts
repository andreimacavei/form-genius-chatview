import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    // const slug = pathname.split("/")[4]; // Get surveyId from /api/survey/[slug]/pages
    const slug = pathname.split("/").pop();
    const response = await prisma.surveys.findUnique({
      where: { slug },
      select: {
        survey_questions: true,
      },
    });

    if (!response) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }
    if (Array.isArray(response.survey_questions)) {
      const surveyQuestions = response?.survey_questions?.map(
        (question: any) => {
          switch (question.type) {
            case "radio":
              question.type = "single-select";
              break;
            case "checkboxes":
              question.type = "multi-select";
              break;
            case "linear-scale":
              question.type = "number-range";
              break;
          }
          return question;
        }
      );
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

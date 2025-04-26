import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET({ params }: { params: { slug: string } }) {
  try {
    // const { params } = await context;
    // const slug = params?.slug;\
    const { slug } = params;

    const response = await prisma.Survey.findUnique({
      where: { slug },
      select: {
        survey_questions: true,
      },
    });
    if (!response) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }
    const surveyQuestions = response?.survey_questions.map((question: any) => {
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
    });

    return NextResponse.json({ surveyQuestions }, { status: 200 });
  } catch (error) {
    console.error("Error fetching surveys:", error);
    return NextResponse.json(
      { error: "Failed to fetch surveys" },
      { status: 500 }
    );
  }
}

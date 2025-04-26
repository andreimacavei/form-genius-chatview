import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const survey = await prisma.Survey.findUnique({
      where: {
        slug,
      },
    });
    if (!survey) {
      return new Response(JSON.stringify({ error: "Survey not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    console.log("REQUEST123", request, "REQUEST");

    return NextResponse.json({ survey }, { status: 200 });
  } catch (error) {
    console.error("Error fetching surveys:", error);
    return NextResponse.json(
      { error: "Failed to fetch surveys" },
      { status: 500 }
    );
  }
}

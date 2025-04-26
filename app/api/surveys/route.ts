import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const surveys = await prisma.Survey.findMany({
      orderBy: {
        created_at: "desc",
      },

      // Uncomment to filter by user when auth is implemented
      // where: {
      //   userId: user.id,
      // },
    });
    // console.log("REQUEST123", request, "REQUEST");

    return NextResponse.json({ surveys }, { status: 200 });
  } catch (error) {
    console.error("Error fetching surveys:", error);
    return NextResponse.json(
      { error: "Failed to fetch surveys" },
      { status: 500 }
    );
  }
}

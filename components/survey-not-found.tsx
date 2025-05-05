"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function SurveyNotFound() {
  const router = useRouter();
  const dashboardUrl = process.env.NEXT_PUBLIC_SITE_URL || "/";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100 mx-auto mb-6">
          <svg
            className="h-10 w-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-gray-900">
          Survey Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The survey you're looking for doesn't exist or may have been removed.
          Please check the URL and try again.
        </p>
        <Button
          size="lg"
          className="px-8 py-6 bg-black hover:bg-gray-800 text-white"
          onClick={() => router.push(dashboardUrl)}
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
}

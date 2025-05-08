"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";

export default function ChatForm() {
  const goToCreateForm = () => {
    // Navigate to the create form page from process.env.NEXT_PUBLIC_DASHBOARD_URL
    const dashboardUrl: any = process.env.NEXT_PUBLIC_DASHBOARD_URL;
    redirect(dashboardUrl);
  };

  const SplashScreen = () => (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-6 z-50">
      <div className="w-full max-w-md text-center">
        <div className="relative h-40 mb-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-20 bg-yellow-300 rotate-12 transform-gpu z-10"></div>
          <div className="absolute top-6 right-1/3 w-24 h-16 bg-purple-200 -rotate-6 transform-gpu z-20"></div>
          <div className="absolute top-16 left-1/3 w-28 h-16 bg-green-200 rotate-3 transform-gpu z-30"></div>
        </div>

        <h1 className="text-xl font-bold mb-6 text-gray-900">
          Good afternoon!
        </h1>

        <p className="text-gray-600 mb-12 text-base max-w-md mx-auto">
          Welcome! We're curious about your experience with AI tools for survey
          creation. You can create a survey form using our platform. We would
          love to hear your feedback on the process.
        </p>

        <Button
          size="lg"
          className="px-8 py-6 rounded-full bg-black hover:bg-gray-800 text-white"
          onClick={goToCreateForm}
        >
          Create Form
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <SplashScreen />
    </div>
  );
}

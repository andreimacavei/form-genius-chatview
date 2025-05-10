"use client";
import { redirect } from "next/navigation";
import SplashScreen from "@/components/splash-screen";

export default function ChatForm() {
  const goToCreateForm = () => {
    const dashboardUrl: any = process.env.NEXT_PUBLIC_DASHBOARD_URL;
    redirect(dashboardUrl);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <SplashScreen buttonText="Create Form" onButtonClick={goToCreateForm} />
    </div>
  );
}

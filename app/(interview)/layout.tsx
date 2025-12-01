import React from "react";
import Sidebar from "@/components/sidebar";
import { Toaster } from "sonner";

const InterviewLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid grid-cols-1 h-screen bg-gray-50">
      <Sidebar />
      <main className="relative overflow-y-auto">
        <Toaster />
        {children}
      </main>
    </div>
  );
};

export default InterviewLayout;
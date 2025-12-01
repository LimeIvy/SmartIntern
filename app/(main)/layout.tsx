import React from "react";
import Sidebar from "@/components/sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[250px_1fr] h-screen bg-gray-50">
      <Sidebar />
      <main className="relative overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;

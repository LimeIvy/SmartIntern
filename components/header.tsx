import { SignInButton, SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import { checkUser } from "@/lib/checkUser";
import React from "react";
import { Kanban } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

const header = async () => {
  await checkUser();

  return (
    <div>
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Kanban className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Smart Intern</span>
            </div>

            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton>
                  <Button className="bg-blue-600 hover:bg-blue-700">登録する</Button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <SignOutButton>
                  <Button className="bg-blue-600 hover:bg-blue-700">ログアウト</Button>
                </SignOutButton>
                <Link href="/dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700">ダッシュボードへ</Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default header;

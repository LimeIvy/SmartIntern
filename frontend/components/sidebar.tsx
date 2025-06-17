"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, User, LogOut, Home, Kanban, Calendar, Building2, Menu, X } from "lucide-react";
import type { ComponentType } from "react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { SignOutButton, useUser } from "@clerk/nextjs";

export type NavigationItem = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();

  const navigationItems: NavigationItem[] = [
    { id: "dashboard", label: "ダッシュボード", icon: Home },
    { id: "kanban", label: "カンバン", icon: Kanban },
    { id: "calendar", label: "カレンダー", icon: Calendar },
    { id: "companies", label: "企業一覧", icon: Building2 },
  ];

  const handleClick = (id: string) => {
    router.push(`/${id}`);
  };

  return (
    <>
      {/* ハンバーガーメニュー（sm未満のみ表示） */}
      <div className="absolute top-4 left-4 z-50 sm:hidden">
        <button
          className="rounded border p-2"
          onClick={() => setOpen(true)}
          aria-label="メニューを開く"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* サイドバー本体（sm以上で表示） */}
      <div className="sticky top-0 hidden h-screen w-64 min-w-64 flex-shrink-0 flex-col border-r sm:flex">
        <div className="p-6">
          <h1 className="text-xl font-bold">就活管理</h1>
        </div>
        <nav className="flex-1 px-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const itemPath = `/${item.id}`;
              const isActive = pathname === itemPath;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleClick(item.id)}
                    className={
                      isActive
                        ? "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors"
                        : "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors"
                    }
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t p-4">
          <button className="mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2">
            <Settings className="h-5 w-5" />
            設定
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.imageUrl ?? ""} />
                  <AvatarFallback>{user?.fullName ?? ""}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="text-sm font-medium">{user?.fullName ?? ""}</div>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                プロフィール
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                ログアウト
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* モバイル用ドロワーサイドバー */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* オーバーレイ */}
          <div
            className="fixed inset-0"
            onClick={() => setOpen(false)}
            aria-label="メニューを閉じる"
          />
          {/* サイドバー本体 */}
          <div className="relative flex h-full w-64 min-w-64 flex-col">
            <button
              className="absolute top-4 right-4"
              onClick={() => setOpen(false)}
              aria-label="メニューを閉じる"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="p-6">
              <h1 className="text-xl font-bold">就活管理</h1>
            </div>
            <nav className="flex-1 px-4">
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const itemPath = `/${item.id}`;
                  const isActive = pathname === itemPath;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleClick(item.id)}
                        className={
                          isActive
                            ? "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors"
                            : "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors"
                        }
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="border-t p-4">
              <button className="mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2">
                <Settings className="h-5 w-5" />
                設定
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.imageUrl ?? ""} />
                      <AvatarFallback>{user?.fullName ?? ""}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <div className="text-sm font-medium">{user?.fullName ?? ""}</div>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    プロフィール
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <SignOutButton>
                        <LogOut className="mr-2 h-4 w-4" />
                        ログアウト
                    </SignOutButton>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

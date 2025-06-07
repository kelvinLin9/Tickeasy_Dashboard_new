"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/dashboard/navbar";

// Dashboard 專屬 Layout，所有 dashboard 相關頁面都會自動套用
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // 檢查 localStorage 是否有 token，無則導向登入頁
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("tickeasy_token");
      console.log("dashboard layout 檢查 token", token);
      if (!token) {
        router.replace("/auth/login");
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-muted">
      {/* 上方導覽列 */}
      <Navbar />
      {/* 主要內容區域 */}
      <main className="flex-1 container mx-auto py-8">
        {children}
      </main>
    </div>
  );
} 
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// 只允許 POST 請求
export async function POST(req: NextRequest) {
  try {
    const { concertId, status, notes } = await req.json();

    // 權限驗證
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "未授權" }, { status: 401 });
    }
    const { data: currentUser } = await supabase
      .from("users")
      .select("role")
      .eq("email", user.email)
      .single();
    if (!currentUser || !["admin", "superuser"].includes(currentUser.role)) {
      return NextResponse.json({ success: false, error: "沒有審核權限" }, { status: 403 });
    }

    // 呼叫外部 API
    const apiRes = await fetch(
      `https://tickeasy-team-backend.onrender.com/api/v1/${concertId}/manual-review`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      }
    );
    if (!apiRes.ok) {
      return NextResponse.json({ success: false, error: "外部 API 調用失敗" }, { status: 500 });
    }

    // 更新 Supabase 資料庫
    const newConInfoStatus = status === "approved" ? "published" : "rejected";
    const { error } = await supabase
      .from("concert")
      .update({
        reviewStatus: status,
        reviewNote: notes,
        conInfoStatus: newConInfoStatus,
        updatedAt: new Date().toISOString(),
      })
      .eq("concertId", concertId);
    if (error) {
      return NextResponse.json({ success: false, error: "資料庫更新失敗" }, { status: 500 });
    }

    // 重新驗證快取
    revalidatePath("/dashboard/concerts");

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: "伺服器錯誤" }, { status: 500 });
  }
} 
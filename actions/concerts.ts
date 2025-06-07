import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function reviewConcert(
  concertId: string,
  reviewData: {
    status: "approved" | "rejected";
    notes?: string;
  }
) {
  const supabase = await createClient();

  // 檢查當前用戶權限
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "未授權" };
  }

  const { data: currentUser } = await supabase
    .from("users")
    .select("role")
    .eq("email", user.email)
    .single();

  if (!currentUser || !["admin", "superuser"].includes(currentUser.role)) {
    return { success: false, error: "沒有審核權限" };
  }

  try {
    // 調用審核 API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/${concertId}/manual-review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 如果需要認證 token，在這裡加上
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      throw new Error("API 調用失敗");
    }

    // 更新資料庫中的審核狀態
    const newConInfoStatus = reviewData.status === "approved" ? "published" : "rejected";
    
    const { error } = await supabase
      .from("concert")
      .update({ 
        reviewStatus: reviewData.status,
        reviewNote: reviewData.notes,
        conInfoStatus: newConInfoStatus,
        updatedAt: new Date().toISOString()
      })
      .eq("concertId", concertId);

    if (error) {
      throw error;
    }

    revalidatePath("/dashboard/concerts");
    return { success: true };
  } catch (error) {
    console.error("Review error:", error);
    return { success: false, error: "審核失敗" };
  }
} 
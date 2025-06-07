"use server";

import { createClient } from "@/lib/supabase/server";
import { UserRole } from "@/lib/types/user";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, newRole: UserRole) {
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

  if (!currentUser || currentUser.role !== "superuser") {
    return { success: false, error: "只有超級管理員可以修改用戶角色" };
  }

  // 更新用戶角色
  const { error } = await supabase
    .from("users")
    .update({ role: newRole, updatedAt: new Date().toISOString() })
    .eq("userId", userId);

  if (error) {
    return { success: false, error: "更新失敗" };
  }

  revalidatePath("/dashboard/users");
  return { success: true };
} 
// app/(dashboard)/dashboard/users/page.tsx
import { createClient } from "@/lib/supabase/server";
import { UserTable } from "@/components/users/user-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function UsersPage() {
  const supabase = await createClient();
  
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">用戶管理</h1>
        <p className="text-muted-foreground">
          管理系統用戶和權限設定
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>用戶列表</CardTitle>
          <CardDescription>
            查看和管理所有註冊用戶
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable users={users || []} />
        </CardContent>
      </Card>
    </div>
  );
}

// components/users/user-table.tsx
"use client";

import { useState } from "react";
import { User } from "@/lib/types/user";
import { RoleSwitcher } from "./role-switcher";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

interface UserTableProps {
  users: User[];
}

export function UserTable({ users: initialUsers }: UserTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRoleUpdate = (userId: string, newRole: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.userId === userId ? { ...user, role: newRole as User["role"] } : user
      )
    );
  };

  const getRoleBadgeVariant = (role: User["role"]) => {
    switch (role) {
      case "superuser":
        return "destructive";
      case "admin":
        return "default";
      default:
        return "secondary";
    }
  };

  const getRoleLabel = (role: User["role"]) => {
    switch (role) {
      case "superuser":
        return "超級管理員";
      case "admin":
        return "管理員";
      default:
        return "一般用戶";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="搜尋用戶名稱或信箱..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名稱</TableHead>
              <TableHead>信箱</TableHead>
              <TableHead>電話</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>註冊時間</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  沒有找到用戶
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell className="font-medium">
                    {user.name}
                    {user.nickname && (
                      <span className="text-sm text-muted-foreground ml-2">
                        ({user.nickname})
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), "yyyy/MM/dd", {
                      locale: zhTW,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <RoleSwitcher
                      userId={user.userId}
                      currentRole={user.role}
                      onRoleChange={handleRoleUpdate}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// components/users/role-switcher.tsx
"use client";

import { useState } from "react";
import { UserRole } from "@/lib/types/user";
import { updateUserRole } from "@/actions/users";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface RoleSwitcherProps {
  userId: string;
  currentRole: UserRole;
  onRoleChange: (userId: string, newRole: string) => void;
}

export function RoleSwitcher({ userId, currentRole, onRoleChange }: RoleSwitcherProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = async (newRole: string) => {
    setIsLoading(true);
    try {
      const result = await updateUserRole(userId, newRole as UserRole);
      if (result.success) {
        onRoleChange(userId, newRole);
        toast.success("角色更新成功");
      } else {
        toast.error(result.error || "更新失敗");
      }
    } catch (error) {
      toast.error("更新角色時發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Select
      value={currentRole}
      onValueChange={handleRoleChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="user">一般用戶</SelectItem>
        <SelectItem value="admin">管理員</SelectItem>
        <SelectItem value="superuser">超級管理員</SelectItem>
      </SelectContent>
    </Select>
  );
}

// actions/users.ts
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

// components/ui/select.tsx (需要添加這個組件)
"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
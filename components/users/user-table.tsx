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
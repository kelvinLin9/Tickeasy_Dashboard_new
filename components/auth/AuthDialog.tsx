"use client";

import { useState } from "react";
import { useAuth } from "./useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "login") {
      const res = await login(email, password);
      if (res.success) {
        toast.success("登入成功");
        onOpenChange(false);
        window.location.href = "/dashboard";
      } else {
        toast.error(res.message);
      }
    } else {
      const res = await register(email, password, name);
      if (res.success) {
        toast.success("註冊並自動登入成功");
        onOpenChange(false);
        window.location.href = "/dashboard";
      } else {
        toast.error(res.message);
      }
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "login" ? "登入" : "註冊"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "register" && (
            <Input
              placeholder="姓名"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              disabled={loading}
            />
          )}
          <Input
            type="email"
            placeholder="電子郵件"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            type="password"
            placeholder="密碼"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={loading}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {mode === "login" ? "登入" : "註冊"}
          </Button>
        </form>
        <div className="text-center text-sm mt-2">
          {mode === "login" ? (
            <>
              沒有帳號？{" "}
              <button className="text-primary underline" onClick={() => setMode("register")} disabled={loading}>
                註冊
              </button>
            </>
          ) : (
            <>
              已有帳號？{" "}
              <button className="text-primary underline" onClick={() => setMode("login")} disabled={loading}>
                登入
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 
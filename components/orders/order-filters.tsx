"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderFiltersProps {
  onStatusChange: (status: string) => void;
  onSearchChange: (search: string) => void;
}

// 訂單篩選元件
export function OrderFilters({ onStatusChange, onSearchChange }: OrderFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <Input
        placeholder="搜尋訂單編號、購買人..."
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
      <Select defaultValue="all" onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="選擇狀態" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部狀態</SelectItem>
          <SelectItem value="held">保留中</SelectItem>
          <SelectItem value="expired">已過期</SelectItem>
          <SelectItem value="paid">已付款</SelectItem>
          <SelectItem value="cancelled">已取消</SelectItem>
          <SelectItem value="refunded">已退款</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 
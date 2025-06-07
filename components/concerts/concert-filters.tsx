"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ConcertFiltersProps {
  onStatusChange: (status: string) => void;
  onSearchChange: (search: string) => void;
}

// 演唱會篩選元件
export function ConcertFilters({ onStatusChange, onSearchChange }: ConcertFiltersProps) {
  return (
    <div className="flex items-center gap-4">
      <Input
        placeholder="搜尋演唱會名稱或主辦單位..."
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm"
      />
      <Select defaultValue="all" onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="選擇狀態" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部狀態</SelectItem>
          <SelectItem value="draft">草稿</SelectItem>
          <SelectItem value="reviewing">審核中</SelectItem>
          <SelectItem value="published">已發布</SelectItem>
          <SelectItem value="rejected">已拒絕</SelectItem>
          <SelectItem value="finished">已完成</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 
// app/(dashboard)/dashboard/concerts/page.tsx
import { createClient } from "@/lib/supabase/server";
import { ConcertStats } from "@/components/concerts/concert-stats";
import { ConcertTable } from "@/components/concerts/concert-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ConcertsPage() {
  const supabase = await createClient();
  
  // 獲取演唱會數據，包含關聯的 organization 和 venue
  const { data: concerts, error } = await supabase
    .from("concert")
    .select(`
      *,
      organization:organizationId (
        organizationId,
        orgName,
        userId
      ),
      venue:venueId (
        venueId,
        venueName,
        venueAddress
      )
    `)
    .order("createdAt", { ascending: false });

  if (error) {
    console.error("Error fetching concerts:", error);
  }

  // 計算統計數據
  const stats = {
    total: concerts?.length || 0,
    pending_review: 0,
    reviewing: 0,
    published: 0,
    draft: 0,
    rejected: 0,
    finished: 0,
    review_skipped: 0,
  };

  concerts?.forEach((concert) => {
    switch (concert.conInfoStatus) {
      case 'draft':
        stats.draft++;
        break;
      case 'reviewing':
        stats.reviewing++;
        if (concert.reviewStatus === 'pending') {
          stats.pending_review++;
        }
        break;
      case 'published':
        stats.published++;
        break;
      case 'rejected':
        stats.rejected++;
        break;
      case 'finished':
        stats.finished++;
        break;
    }
    
    if (concert.reviewStatus === 'skipped') {
      stats.review_skipped++;
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">演唱會審核</h1>
        <p className="text-muted-foreground">
          審核和管理所有演唱會活動
        </p>
      </div>

      <ConcertStats stats={stats} />

      <Card>
        <CardHeader>
          <CardTitle>演唱會列表</CardTitle>
          <CardDescription>
            查看和審核所有演唱會
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConcertTable concerts={concerts || []} />
        </CardContent>
      </Card>
    </div>
  );
}

// components/concerts/concert-stats.tsx
import { StatsCard } from "@/components/dashboard/stats-card";
import { ConcertStats as ConcertStatsType } from "@/lib/types/concert";
import { 
  Music, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  PlayCircle,
  SkipForward,
  AlertCircle
} from "lucide-react";

interface ConcertStatsProps {
  stats: ConcertStatsType;
}

export function ConcertStats({ stats }: ConcertStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
      <StatsCard
        title="總演唱會數"
        value={stats.total}
        icon={<Music className="h-4 w-4" />}
      />
      <StatsCard
        title="待審核"
        value={stats.pending_review}
        icon={<AlertCircle className="h-4 w-4" />}
        className={stats.pending_review > 0 ? "border-orange-200" : ""}
      />
      <StatsCard
        title="審核中"
        value={stats.reviewing}
        icon={<Clock className="h-4 w-4" />}
      />
      <StatsCard
        title="已發布"
        value={stats.published}
        icon={<CheckCircle className="h-4 w-4" />}
        className="border-green-200"
      />
      <StatsCard
        title="草稿"
        value={stats.draft}
        icon={<FileText className="h-4 w-4" />}
      />
      <StatsCard
        title="已拒絕"
        value={stats.rejected}
        icon={<XCircle className="h-4 w-4" />}
        className={stats.rejected > 0 ? "border-red-200" : ""}
      />
      <StatsCard
        title="已完成"
        value={stats.finished}
        icon={<PlayCircle className="h-4 w-4" />}
      />
      <StatsCard
        title="已跳過審核"
        value={stats.review_skipped}
        icon={<SkipForward className="h-4 w-4" />}
      />
    </div>
  );
}

// components/concerts/concert-table.tsx
"use client";

import { useState } from "react";
import { Concert } from "@/lib/types/concert";
import { ConcertFilters } from "./concert-filters";
import { ReviewDialog } from "./review-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

interface ConcertTableProps {
  concerts: Concert[];
}

export function ConcertTable({ concerts: initialConcerts }: ConcertTableProps) {
  const [concerts, setConcerts] = useState(initialConcerts);
  const [filteredStatus, setFilteredStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConcert, setSelectedConcert] = useState<Concert | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const filteredConcerts = concerts.filter((concert) => {
    const matchesStatus = filteredStatus === "all" || concert.conInfoStatus === filteredStatus;
    const matchesSearch = 
      concert.conTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concert.organization?.orgName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: Concert["conInfoStatus"], reviewStatus?: Concert["reviewStatus"]) => {
    const statusConfig = {
      draft: { label: "草稿", variant: "secondary" as const },
      reviewing: { label: "審核中", variant: "outline" as const },
      published: { label: "已發布", variant: "default" as const },
      rejected: { label: "已拒絕", variant: "destructive" as const },
      finished: { label: "已完成", variant: "secondary" as const },
    };

    return (
      <div className="flex gap-2">
        <Badge variant={statusConfig[status].variant}>
          {statusConfig[status].label}
        </Badge>
        {reviewStatus && reviewStatus !== 'skipped' && (
          <Badge variant="outline" className="text-xs">
            {reviewStatus === 'pending' ? '待審' : 
             reviewStatus === 'approved' ? '已通過' : '已拒絕'}
          </Badge>
        )}
      </div>
    );
  };

  const handleReview = (concert: Concert) => {
    setSelectedConcert(concert);
    setIsReviewDialogOpen(true);
  };

  const handleReviewComplete = (concertId: string, newStatus: string) => {
    setConcerts((prev) =>
      prev.map((concert) =>
        concert.concertId === concertId
          ? { ...concert, reviewStatus: newStatus as Concert["reviewStatus"] }
          : concert
      )
    );
  };

  return (
    <div className="space-y-4">
      <ConcertFilters
        onStatusChange={setFilteredStatus}
        onSearchChange={setSearchTerm}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>演唱會名稱</TableHead>
              <TableHead>主辦單位</TableHead>
              <TableHead>場地</TableHead>
              <TableHead>活動日期</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>建立時間</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConcerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  沒有找到演唱會
                </TableCell>
              </TableRow>
            ) : (
              filteredConcerts.map((concert) => (
                <TableRow key={concert.concertId}>
                  <TableCell className="font-medium">
                    {concert.conTitle}
                  </TableCell>
                  <TableCell>
                    {concert.organization?.orgName || "-"}
                  </TableCell>
                  <TableCell>
                    {concert.venue?.venueName || concert.conLocation || "-"}
                  </TableCell>
                  <TableCell>
                    {concert.eventStartDate
                      ? format(new Date(concert.eventStartDate), "yyyy/MM/dd", {
                          locale: zhTW,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(concert.conInfoStatus, concert.reviewStatus)}
                  </TableCell>
                  <TableCell>
                    {format(new Date(concert.createdAt), "yyyy/MM/dd", {
                      locale: zhTW,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/dashboard/concerts/${concert.concertId}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {concert.conInfoStatus === "reviewing" && 
                       concert.reviewStatus === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReview(concert)}
                        >
                          審核
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ReviewDialog
        concert={selectedConcert}
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
        onReviewComplete={handleReviewComplete}
      />
    </div>
  );
}

// components/concerts/concert-filters.tsx
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

// components/concerts/review-dialog.tsx
"use client";

import { useState } from "react";
import { Concert } from "@/lib/types/concert";
import { reviewConcert } from "@/actions/concerts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

interface ReviewDialogProps {
  concert: Concert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewComplete: (concertId: string, newStatus: string) => void;
}

export function ReviewDialog({ 
  concert, 
  open, 
  onOpenChange, 
  onReviewComplete 
}: ReviewDialogProps) {
  const [reviewNote, setReviewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!concert) return null;

  const handleReview = async (action: "approved" | "rejected") => {
    setIsLoading(true);
    try {
      const result = await reviewConcert(concert.concertId, {
        status: action,
        notes: reviewNote,
      });

      if (result.success) {
        toast.success(action === "approved" ? "演唱會已通過審核" : "演唱會已拒絕");
        onReviewComplete(concert.concertId, action);
        onOpenChange(false);
        setReviewNote("");
      } else {
        toast.error(result.error || "審核失敗");
      }
    } catch (error) {
      toast.error("審核時發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>審核演唱會</DialogTitle>
          <DialogDescription>
            審核演唱會：{concert.conTitle}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>演唱會資訊</Label>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>主辦單位：{concert.organization?.orgName}</p>
              <p>活動日期：{concert.eventStartDate || "未設定"}</p>
              <p>場地：{concert.venue?.venueName || concert.conLocation || "未設定"}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reviewNote">審核備註</Label>
            <Textarea
              id="reviewNote"
              placeholder="請輸入審核意見..."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleReview("rejected")}
            disabled={isLoading}
          >
            <XCircle className="mr-2 h-4 w-4" />
            拒絕
          </Button>
          <Button
            onClick={() => handleReview("approved")}
            disabled={isLoading}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            通過
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// actions/concerts.ts
"use server";

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

// components/ui/dialog.tsx (需要添加這個組件)
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

// components/ui/textarea.tsx (需要添加這個組件)
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
import { useState, useEffect } from "react";
import { Concert } from "@/lib/types/concert";
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

// 上次審核結果型別
interface ReviewRecord {
  reviewStatus: string;
  reviewNote: string | null;
  aiResponse?: {
    summary?: string;
    reasons?: string[];
    suggestions?: string[];
  };
  createdAt: string;
}

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
  const [lastReview, setLastReview] = useState<ReviewRecord | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  // 取得上次審核結果
  useEffect(() => {
    console.log("fetch review for", concert?.concertId, "open:", open);
    if (!concert?.concertId || !open) {
      setLastReview(null);
      return;
    }
    setIsReviewLoading(true);
    // 從 localStorage 取得 token，並加到 Authorization header
    const token = typeof window !== "undefined" ? localStorage.getItem("tickeasy_token") : null;
    console.log(concert.concertId);
    fetch(`https://tickeasy-team-backend.onrender.com/api/v1/concerts/${concert.concertId}/reviews`, {
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log("審核API回傳", data);
        if (data.status === "success" && data.data && data.data.length > 0) {
          setLastReview(data.data[0]);
        } else {
          setLastReview(null);
        }
      })
      .catch((err) => {
        console.log("審核API錯誤", err);
        setLastReview(null);
      })
      .finally(() => setIsReviewLoading(false));
  }, [concert?.concertId, open]);

  if (!concert) return null;

  const handleReview = async (action: "approved" | "rejected") => {
    setIsLoading(true);
    try {
      const res = await fetch("/dashboard/concerts/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concertId: concert.concertId,
          status: action,
          notes: reviewNote,
        }),
      });
      const result = await res.json();

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

  // 狀態中文對應
  const statusMap: Record<string, string> = {
    pending: "待審核",
    approved: "已通過",
    rejected: "已拒絕",
  };

  // 時間格式化
  function formatDate(iso: string) {
    const date = new Date(iso);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  }

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
          {/* 演唱會基本資訊 */}
          <div className="space-y-2">
            <Label>演唱會資訊</Label>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>主辦單位：{concert.organization?.orgName}</p>
              <p>活動日期：{concert.eventStartDate || "未設定"}</p>
              <p>場地：{concert.venue?.venueName || concert.conLocation || "未設定"}</p>
            </div>
          </div>
          {/* 上次審核結果 */}
          <div className="space-y-2">
            <Label>上次審核結果</Label>
            {isReviewLoading ? (
              <div className="text-sm text-muted-foreground">載入中...</div>
            ) : lastReview ? (
              <div className="text-sm bg-gray-50 rounded p-3 space-y-1">
                <p>狀態：{statusMap[lastReview.reviewStatus] || lastReview.reviewStatus}</p>
                {lastReview.reviewNote && <p>審核備註：{lastReview.reviewNote}</p>}
                {lastReview.aiResponse?.summary && <p>AI 審核摘要：{lastReview.aiResponse.summary}</p>}
                {lastReview.aiResponse?.reasons && lastReview.aiResponse.reasons.length > 0 && (
                  <div>
                    <p>AI 主要理由：</p>
                    <ul className="list-disc pl-5">
                      {lastReview.aiResponse.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {lastReview.aiResponse?.suggestions && lastReview.aiResponse.suggestions.length > 0 && (
                  <div>
                    <p>AI 建議調整：</p>
                    <ul className="list-disc pl-5">
                      {lastReview.aiResponse.suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p>審核時間：{formatDate(lastReview.createdAt)}</p>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">尚無審核紀錄</div>
            )}
          </div>
          {/* 審核備註 */}
          <div className="space-y-2">
            <Label htmlFor="reviewNote">審核備註</Label>
            <Textarea
              id="reviewNote"
              placeholder="請輸入審核意見..."
              value={reviewNote}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewNote(e.target.value)}
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
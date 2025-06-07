import { useState } from "react";
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
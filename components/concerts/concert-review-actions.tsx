"use client";
import React, { useState } from "react";
import { toast } from "sonner";

interface ConcertReviewActionsProps {
  concertId: string;
  onReviewComplete: () => void;
}

// 人工審核操作元件，管理者可輸入備註並通過/拒絕審核
const ConcertReviewActions: React.FC<ConcertReviewActionsProps> = ({ concertId, onReviewComplete }) => {
  const [reviewNote, setReviewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 審核送出處理
  const handleReview = async (action: "approved" | "rejected") => {
    setIsLoading(true);
    try {
      // 從 localStorage 取得 token，並加到 Authorization header
      const token = typeof window !== "undefined" ? localStorage.getItem("tickeasy_token") : null;
      const res = await fetch("/dashboard/concerts/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          concertId,
          status: action,
          notes: reviewNote,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(action === "approved" ? "演唱會已通過審核" : "演唱會已拒絕");
        setReviewNote("");
        onReviewComplete();
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
    <div className="card mt-6">
      {/* 標題 */}
      <h2 className="text-xl font-bold mb-2">人工審核操作</h2>
      <div className="space-y-2">
        <textarea
          className="w-full border rounded p-2 text-sm"
          rows={3}
          placeholder="請輸入審核備註（選填）"
          value={reviewNote}
          onChange={e => setReviewNote(e.target.value)}
          disabled={isLoading}
        />
        <div className="flex gap-4 mt-2">
          <button
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            onClick={() => handleReview("approved")}
            disabled={isLoading}
          >
            通過審核
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            onClick={() => handleReview("rejected")}
            disabled={isLoading}
          >
            拒絕審核
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConcertReviewActions; 
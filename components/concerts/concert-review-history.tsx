"use client";
import React, { useEffect, useState } from "react";

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

interface ConcertReviewHistoryProps {
  concertId: string;
}

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

// 過往審核紀錄元件，顯示所有歷史審核紀錄
const ConcertReviewHistory: React.FC<ConcertReviewHistoryProps> = ({ concertId }) => {
  const [records, setRecords] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!concertId) return;
    setLoading(true);
    // 從 localStorage 取得 token，並加到 Authorization header
    const token = typeof window !== "undefined" ? localStorage.getItem("tickeasy_token") : null;
    fetch(`https://tickeasy-team-backend.onrender.com/api/v1/concerts/${concertId}/reviews`, {
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "success" && Array.isArray(data.data)) {
          setRecords(data.data);
        } else {
          setRecords([]);
        }
      })
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  }, [concertId]);

  return (
    <div className="card mt-6">
      {/* 標題 */}
      <h2 className="text-xl font-bold mb-2">過往審核紀錄</h2>
      {loading ? (
        <div className="text-sm text-muted-foreground">載入中...</div>
      ) : records.length === 0 ? (
        <div className="text-sm text-muted-foreground">尚無審核紀錄</div>
      ) : (
        <div className="space-y-4">
          {records.map((rec, idx) => (
            <div key={idx} className="rounded border p-3 bg-gray-50 space-y-1">
              <p>狀態：{statusMap[rec.reviewStatus] || rec.reviewStatus}</p>
              {rec.reviewNote && <p>審核備註：{rec.reviewNote}</p>}
              {rec.aiResponse?.summary && <p>AI 審核摘要：{rec.aiResponse.summary}</p>}
              {rec.aiResponse?.reasons && rec.aiResponse.reasons.length > 0 && (
                <div>
                  <p>AI 主要理由：</p>
                  <ul className="list-disc pl-5">
                    {rec.aiResponse.reasons.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
              {rec.aiResponse?.suggestions && rec.aiResponse.suggestions.length > 0 && (
                <div>
                  <p>AI 建議調整：</p>
                  <ul className="list-disc pl-5">
                    {rec.aiResponse.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              <p>審核時間：{formatDate(rec.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConcertReviewHistory; 
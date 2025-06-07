"use client";
import React, { useEffect, useState } from "react";

interface TicketType {
  ticketTypeId: string;
  ticketTypeName: string;
  ticketTypePrice: string;
  totalQuantity: number;
  remainingQuantity: number;
  ticketBenefits?: string;
}

interface ConcertSession {
  sessionId: string;
  sessionDate?: string;
  sessionStart?: string;
  sessionEnd?: string;
  sessionTitle?: string;
  tickets: TicketType[];
}

interface ConcertSessionsAndTicketsCardProps {
  concertId: string;
}

// 場次與票價卡片元件
const ConcertSessionsAndTicketsCard: React.FC<ConcertSessionsAndTicketsCardProps> = ({ concertId }) => {
  const [sessions, setSessions] = useState<ConcertSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!concertId) return;
    setLoading(true);
    // 從 localStorage 取得 token，並加到 Authorization header
    const token = typeof window !== "undefined" ? localStorage.getItem("tickeasy_token") : null;
    fetch(`/api/concerts/${concertId}/sessions-tickets`, {
      headers: {
        ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === "success" && Array.isArray(data.data)) {
          setSessions(data.data);
        } else {
          setSessions([]);
        }
      })
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [concertId]);

  return (
    <div className="card mt-6">
      {/* 標題 */}
      <h2 className="text-xl font-bold mb-2">場次與票價</h2>
      {loading ? (
        <div className="text-sm text-muted-foreground">載入中...</div>
      ) : sessions.length === 0 ? (
        <div className="text-sm text-muted-foreground">尚無場次資料</div>
      ) : (
        <div className="space-y-6">
          {sessions.map((session) => (
            <div key={session.sessionId} className="border rounded p-3 bg-gray-50">
              <div className="font-medium mb-1">
                場次：{session.sessionTitle || "未命名"}（{session.sessionDate || "未設定"} {session.sessionStart || ""}~{session.sessionEnd || ""}）
              </div>
              {session.tickets.length === 0 ? (
                <div className="text-sm text-muted-foreground">此場次尚無票種</div>
              ) : (
                <table className="w-full text-sm mt-2">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1">票種名稱</th>
                      <th className="text-left py-1">價格</th>
                      <th className="text-left py-1">剩餘/總數</th>
                      <th className="text-left py-1">票種描述</th>
                    </tr>
                  </thead>
                  <tbody>
                    {session.tickets.map((t) => (
                      <tr key={t.ticketTypeId} className="border-b last:border-0">
                        <td>{t.ticketTypeName}</td>
                        <td>${t.ticketTypePrice}</td>
                        <td>{t.remainingQuantity} / {t.totalQuantity}</td>
                        <td>{t.ticketBenefits || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConcertSessionsAndTicketsCard; 
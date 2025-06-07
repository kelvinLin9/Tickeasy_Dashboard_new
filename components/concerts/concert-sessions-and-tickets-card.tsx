"use client";
import React from "react";

interface TicketType {
  ticketTypeId: string;
  ticketTypeName: string;
  ticketTypePrice: string;
  totalQuantity: number;
  remainingQuantity: number;
  ticketBenefits?: string;
  entranceType?: string;
  ticketRefundPolicy?: string;
}

interface ConcertSession {
  sessionId: string;
  sessionDate?: string;
  sessionStart?: string;
  sessionEnd?: string;
  sessionTitle?: string;
  imgSeattable?: string;
  ticketTypes: TicketType[];
}

interface ConcertSessionsAndTicketsCardProps {
  sessions: ConcertSession[];
}

// 場次與票價卡片元件（只接收 sessions props，不再 fetch）
const ConcertSessionsAndTicketsCard: React.FC<ConcertSessionsAndTicketsCardProps> = ({ sessions }) => {
  return (
    <div className="card mt-6">
      {/* 標題 */}
      <h2 className="text-xl font-bold mb-2">場次與票價</h2>
      {sessions.length === 0 ? (
        <div className="text-sm text-muted-foreground">尚無場次資料</div>
      ) : (
        <div className="space-y-6">
          {sessions.map((session) => (
            <div key={session.sessionId} className="border rounded p-3 bg-gray-50">
              <div className="font-medium mb-1">
                場次：{session.sessionTitle || "未命名"}（{session.sessionDate || "未設定"} {session.sessionStart || ""}~{session.sessionEnd || ""}）
              </div>
              {session.ticketTypes.length === 0 ? (
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
                    {session.ticketTypes.map((t) => (
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
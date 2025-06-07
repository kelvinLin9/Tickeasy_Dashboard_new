import React from "react";

interface ConcertBasicInfoCardProps {
  concert: {
    conTitle: string;
    eventStartDate?: string;
    eventEndDate?: string;
    conLocation?: string;
    conAddress?: string;
    musicTag?: { musicTagName: string };
    locationTag?: { locationTagName: string };
    visitCount?: number;
    conDescription?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

// 演唱會基本資訊卡片元件
const ConcertBasicInfoCard: React.FC<ConcertBasicInfoCardProps> = ({ concert }) => {
  return (
    <div className="card">
      {/* 標題 */}
      <h2 className="text-xl font-bold mb-2">基本資訊</h2>
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">活動日期：</span>
          {concert.eventStartDate ? (
            concert.eventEndDate && concert.eventEndDate !== concert.eventStartDate ?
              `${concert.eventStartDate} 至 ${concert.eventEndDate}` :
              concert.eventStartDate
          ) : "未設定"}
        </div>
        <div>
          <span className="font-medium">地點：</span>{concert.conLocation || "未設定"}
        </div>
        <div>
          <span className="font-medium">地址：</span>{concert.conAddress || "未設定"}
        </div>
        <div>
          <span className="font-medium">音樂類型：</span>{concert.musicTag?.musicTagName || "未設定"}
        </div>
        <div>
          <span className="font-medium">地區標籤：</span>{concert.locationTag?.locationTagName || "未設定"}
        </div>
        <div>
          <span className="font-medium">瀏覽次數：</span>{concert.visitCount ?? 0} 次
        </div>
        <div>
          <span className="font-medium">活動描述：</span>{concert.conDescription || "未提供"}
        </div>
        <div>
          <span className="font-medium">建立時間：</span>{concert.createdAt || "-"}
        </div>
        <div>
          <span className="font-medium">更新時間：</span>{concert.updatedAt || "-"}
        </div>
      </div>
    </div>
  );
};

export default ConcertBasicInfoCard; 
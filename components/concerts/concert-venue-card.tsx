import React from "react";

interface ConcertVenueCardProps {
  venue: {
    venueName?: string;
    venueDescription?: string;
    venueAddress?: string;
    venueCapacity?: number;
    venueImageUrl?: string;
    googleMapUrl?: string;
    isAccessible?: boolean;
    hasParking?: boolean;
    hasTransit?: boolean;
  };
}

// 場地資訊卡片元件
const ConcertVenueCard: React.FC<ConcertVenueCardProps> = ({ venue }) => {
  return (
    <div className="card">
      {/* 標題 */}
      <h2 className="text-xl font-bold mb-2">場地資訊</h2>
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">場地名稱：</span>{venue.venueName || "未設定"}
        </div>
        <div>
          <span className="font-medium">場地描述：</span>{venue.venueDescription || "未提供"}
        </div>
        <div>
          <span className="font-medium">場地地址：</span>{venue.venueAddress || "未設定"}
        </div>
        <div>
          <span className="font-medium">容納人數：</span>{venue.venueCapacity ? `${venue.venueCapacity} 人` : "未設定"}
        </div>
        <div>
          <span className="font-medium">場地圖片：</span>
          {venue.venueImageUrl ? (
            <img src={venue.venueImageUrl} alt="場地圖片" className="w-full max-w-xs rounded mt-1" />
          ) : "未提供"}
        </div>
        <div>
          <span className="font-medium">Google 地圖：</span>
          {venue.googleMapUrl ? (
            <a href={venue.googleMapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">查看地圖</a>
          ) : "未提供"}
        </div>
        <div>
          <span className="font-medium">無障礙設施：</span>{venue.isAccessible ? "有" : "無"}
        </div>
        <div>
          <span className="font-medium">停車場：</span>{venue.hasParking ? "有" : "無"}
        </div>
        <div>
          <span className="font-medium">大眾運輸：</span>{venue.hasTransit ? "有" : "無"}
        </div>
      </div>
    </div>
  );
};

export default ConcertVenueCard; 
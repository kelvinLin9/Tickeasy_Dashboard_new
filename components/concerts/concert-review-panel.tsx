"use client";
import React, { useState } from "react";
import ConcertReviewHistory from "./concert-review-history";
import ConcertReviewActions from "./concert-review-actions";

interface ConcertReviewPanelProps {
  concertId: string;
}

// 審核面板，整合審核紀錄與操作，審核後自動刷新紀錄
const ConcertReviewPanel: React.FC<ConcertReviewPanelProps> = ({ concertId }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  // 當審核完成時，刷新審核紀錄
  const handleReviewComplete = () => setRefreshKey((k) => k + 1);

  return (
    <div>
      <ConcertReviewHistory key={refreshKey} concertId={concertId} />
      <ConcertReviewActions concertId={concertId} onReviewComplete={handleReviewComplete} />
    </div>
  );
};

export default ConcertReviewPanel; 
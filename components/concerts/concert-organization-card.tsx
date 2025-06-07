import React from "react";

interface ConcertOrganizationCardProps {
  organization: {
    orgName?: string;
    orgAddress?: string;
    orgContact?: string;
    orgMobile?: string;
    orgMail?: string;
    orgPhone?: string;
    orgWebsite?: string;
  };
}

// 主辦單位資訊卡片元件
const ConcertOrganizationCard: React.FC<ConcertOrganizationCardProps> = ({ organization }) => {
  return (
    <div className="card">
      {/* 標題 */}
      <h2 className="text-xl font-bold mb-2">主辦單位資訊</h2>
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">單位名稱：</span>{organization.orgName || "未設定"}
        </div>
        <div>
          <span className="font-medium">地址：</span>{organization.orgAddress || "未設定"}
        </div>
        <div>
          <span className="font-medium">聯絡人：</span>{organization.orgContact || "未設定"}
        </div>
        <div>
          <span className="font-medium">手機：</span>{organization.orgMobile || "未設定"}
        </div>
        <div>
          <span className="font-medium">Email：</span>{organization.orgMail || "未設定"}
        </div>
        <div>
          <span className="font-medium">電話：</span>{organization.orgPhone || "未設定"}
        </div>
        <div>
          <span className="font-medium">官方網站：</span>
          {organization.orgWebsite ? (
            <a href={organization.orgWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{organization.orgWebsite}</a>
          ) : "未設定"}
        </div>
      </div>
    </div>
  );
};

export default ConcertOrganizationCard; 
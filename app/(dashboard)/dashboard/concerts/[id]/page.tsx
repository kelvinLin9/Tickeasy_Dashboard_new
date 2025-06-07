import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, Users, Globe, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import ConcertBasicInfoCard from "@/components/concerts/concert-basic-info-card";
import ConcertOrganizationCard from "@/components/concerts/concert-organization-card";
import ConcertVenueCard from "@/components/concerts/concert-venue-card";
import ConcertReviewHistory from "@/components/concerts/concert-review-history";
import ConcertReviewActions from "@/components/concerts/concert-review-actions";
import ConcertReviewPanel from "@/components/concerts/concert-review-panel";
import ConcertSessionsAndTicketsCard from "@/components/concerts/concert-sessions-and-tickets-card";

interface ConcertDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ConcertDetailPage({ params }: ConcertDetailPageProps) {
  // 直接 fetch API 取得完整演唱會資料（含 sessions）
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/concerts/${params.id}`, { cache: "no-store" });
  const { data: concert } = await res.json();

  if (!concert) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { label: "草稿", variant: "secondary" },
      reviewing: { label: "審核中", variant: "outline" },
      published: { label: "已發布", variant: "default" },
      rejected: { label: "已拒絕", variant: "destructive" },
      finished: { label: "已完成", variant: "secondary" },
    };

    return statusConfig[status] || { label: status, variant: "outline" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/concerts">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回列表
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{concert.conTitle}</h1>
            <p className="text-muted-foreground">
              演唱會詳細資訊
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadge(concert.conInfoStatus).variant}>
            {getStatusBadge(concert.conInfoStatus).label}
          </Badge>
          {concert.reviewStatus && concert.reviewStatus !== 'skipped' && (
            <Badge variant="outline">
              審核：{concert.reviewStatus === 'pending' ? '待審' : 
                    concert.reviewStatus === 'approved' ? '已通過' : '已拒絕'}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <ConcertBasicInfoCard concert={concert} />
        <ConcertOrganizationCard organization={concert.organization || {}} />
        <ConcertVenueCard venue={concert.venue || {}} />
      </div>

      {/* 場次與票價卡片 */}
      <ConcertSessionsAndTicketsCard sessions={concert.sessions || []} />

      <ConcertReviewPanel concertId={concert.concertId} />
    </div>
  );
} 
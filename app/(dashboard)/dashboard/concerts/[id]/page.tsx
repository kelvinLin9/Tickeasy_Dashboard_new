import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, Users, Globe, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";

interface ConcertDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ConcertDetailPage({ params }: ConcertDetailPageProps) {
  const supabase = await createClient();

  const { data: concert, error } = await supabase
    .from("concert")
    .select(`
      *,
      organization:organizationId (
        organizationId,
        orgName,
        orgAddress,
        orgMail,
        orgContact,
        orgMobile,
        orgPhone,
        orgWebsite
      ),
      venue:venueId (
        venueId,
        venueName,
        venueDescription,
        venueAddress,
        venueCapacity,
        venueImageUrl,
        googleMapUrl,
        isAccessible,
        hasParking,
        hasTransit
      ),
      locationTag:locationTagId (
        locationTagId,
        locationTagName
      ),
      musicTag:musicTagId (
        musicTagId,
        musicTagName
      )
    `)
    .eq("concertId", params.id)
    .single();

  if (error || !concert) {
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

      <div className="grid gap-6 md:grid-cols-2">
        {/* 基本資訊 */}
        <Card>
          <CardHeader>
            <CardTitle>基本資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">活動日期</p>
              <p className="text-sm">
                {concert.eventStartDate && concert.eventEndDate ? (
                  <>
                    {format(new Date(concert.eventStartDate), "yyyy年MM月dd日", { locale: zhTW })}
                    {concert.eventStartDate !== concert.eventEndDate && (
                      <> 至 {format(new Date(concert.eventEndDate), "yyyy年MM月dd日", { locale: zhTW })}</>
                    )}
                  </>
                ) : (
                  "未設定"
                )}
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">地點</p>
              <p className="text-sm flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {concert.conLocation || "未設定"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">地址</p>
              <p className="text-sm">{concert.conAddress || "未設定"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">音樂類型</p>
              <p className="text-sm">{concert.musicTag?.musicTagName || "未設定"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">地區標籤</p>
              <p className="text-sm">{concert.locationTag?.locationTagName || "未設定"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">瀏覽次數</p>
              <p className="text-sm">{concert.visitCount || 0} 次</p>
            </div>
          </CardContent>
        </Card>

        {/* 主辦單位資訊 */}
        <Card>
          <CardHeader>
            <CardTitle>主辦單位資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">單位名稱</p>
              <p className="text-sm">{concert.organization?.orgName || "未設定"}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground">地址</p>
              <p className="text-sm">{concert.organization?.orgAddress || "未設定"}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">聯絡資訊</p>
              <div className="text-sm space-y-1">
                {concert.organization?.orgMail && (
                  <p className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {concert.organization.orgMail}
                  </p>
                )}
                {concert.organization?.orgPhone && (
                  <p className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {concert.organization.orgPhone}
                  </p>
                )}
                {concert.organization?.orgWebsite && (
                  <p className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    <a 
                      href={concert.organization.orgWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {concert.organization.orgWebsite}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 場地資訊 */}
        {concert.venue && (
          <Card>
            <CardHeader>
              <CardTitle>場地資訊</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">場地名稱</p>
                <p className="text-sm">{concert.venue.venueName}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">地址</p>
                <p className="text-sm">{concert.venue.venueAddress}</p>
              </div>

              {concert.venue.venueCapacity && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">容納人數</p>
                  <p className="text-sm flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {concert.venue.venueCapacity} 人
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground">設施</p>
                <div className="flex gap-2 mt-1">
                  {concert.venue.isAccessible && <Badge variant="outline">無障礙設施</Badge>}
                  {concert.venue.hasParking && <Badge variant="outline">停車場</Badge>}
                  {concert.venue.hasTransit && <Badge variant="outline">大眾運輸</Badge>}
                </div>
              </div>

              {concert.venue.googleMapUrl && (
                <div>
                  <a 
                    href={concert.venue.googleMapUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <MapPin className="mr-2 h-4 w-4" />
                      在 Google 地圖查看
                    </Button>
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 詳細資訊 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>詳細資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {concert.conIntroduction && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">活動介紹</p>
                <p className="text-sm">{concert.conIntroduction}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
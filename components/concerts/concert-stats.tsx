import { StatsCard } from "@/components/dashboard/stats-card";
import { ConcertStats as ConcertStatsType } from "@/lib/types/concert";
import { 
  Music, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  PlayCircle,
  SkipForward,
  AlertCircle
} from "lucide-react";

interface ConcertStatsProps {
  stats: ConcertStatsType;
}

export function ConcertStats({ stats }: ConcertStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-8">
      <StatsCard
        title="總演唱會數"
        value={stats.total}
        icon={<Music className="h-4 w-4" />}
      />
      <StatsCard
        title="待審核"
        value={stats.pending_review}
        icon={<AlertCircle className="h-4 w-4" />}
        className={stats.pending_review > 0 ? "border-orange-200" : ""}
      />
      <StatsCard
        title="審核中"
        value={stats.reviewing}
        icon={<Clock className="h-4 w-4" />}
      />
      <StatsCard
        title="已發布"
        value={stats.published}
        icon={<CheckCircle className="h-4 w-4" />}
        className="border-green-200"
      />
      <StatsCard
        title="草稿"
        value={stats.draft}
        icon={<FileText className="h-4 w-4" />}
      />
      <StatsCard
        title="已拒絕"
        value={stats.rejected}
        icon={<XCircle className="h-4 w-4" />}
        className={stats.rejected > 0 ? "border-red-200" : ""}
      />
      <StatsCard
        title="已完成"
        value={stats.finished}
        icon={<PlayCircle className="h-4 w-4" />}
      />
      <StatsCard
        title="已跳過審核"
        value={stats.review_skipped}
        icon={<SkipForward className="h-4 w-4" />}
      />
    </div>
  );
} 
import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export function StatCard({ label, value, subtext, icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("relative overflow-hidden bg-white border border-[#DED1BD] shadow-xs", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8B5E4B]">{label}</p>
          {icon && <div className="text-[#683B2B] p-2 rounded-lg bg-[#FAF6F2] border border-[#E8DFD5]">{icon}</div>}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-[#683B2B]">{value}</span>
          {trend && (
            <span
              className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                trend.isPositive ? "text-[#745501] bg-[#FBF6EA] border border-[#ECD693]" : "text-[#B08401] bg-[#FAF3F1] border border-[#EAC8BF]"
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
        {subtext && <p className="mt-1 text-[11px] text-[#8B5E4B]">{subtext}</p>}
      </CardContent>
    </Card>
  );
}

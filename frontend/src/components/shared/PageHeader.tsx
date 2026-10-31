import React from "react";
import { Badge } from "@/components/ui/Badge";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, badge, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[#DED1BD]">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-[#683B2B]">{title}</h1>
          {badge && <Badge variant="cit">{badge}</Badge>}
        </div>
        {description && <p className="text-xs text-[#8B5E4B]">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
    </div>
  );
}

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatWeekRange } from "@/lib/utils";

interface WeekNavigatorProps {
  weekStart: string;
  onPrev: () => void;
  onNext: () => void;
}

export function WeekNavigator({ weekStart, onPrev, onNext }: WeekNavigatorProps) {
  return (
    <div className="flex items-center gap-0.5">
      <Button variant="ghost" size="icon" onClick={onPrev} className="h-7 w-7 text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <h1 className="text-sm font-semibold text-foreground tracking-tight min-w-[260px] text-center select-none px-1">
        {formatWeekRange(weekStart)} Haftası
      </h1>

      <Button variant="ghost" size="icon" onClick={onNext} className="h-7 w-7 text-muted-foreground hover:text-foreground">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

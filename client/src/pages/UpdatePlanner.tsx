import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import type { UpdatePlan } from "@shared/schema";

export default function UpdatePlanner() {
  const { data: plans } = useQuery<UpdatePlan[]>({
    queryKey: ["/api/update-plans"],
  });

  // Generate months from December 2024 to December 2026
  const startDate = new Date(2024, 11, 1); // December 2024
  const endDate = new Date(2026, 11, 31); // December 2026
  const months = eachMonthOfInterval({ start: startDate, end: endDate });

  // Create a map for quick lookup
  const plansMap = new Map<string, boolean>();
  if (plans) {
    plans.forEach((plan) => {
      const key = `${plan.year}-${String(plan.month).padStart(2, "0")}`;
      plansMap.set(key, plan.hasUpdate);
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl md:text-5xl font-black mb-2" data-testid="text-page-title">
        Update Planner
      </h1>
      <p className="text-muted-foreground mb-8">Check what months have upcoming website updates planned</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {months.map((month) => {
          const year = month.getFullYear();
          const monthNum = month.getMonth() + 1;
          const key = `${year}-${String(monthNum).padStart(2, "0")}`;
          const hasUpdate = plansMap.get(key) || false;

          return (
            <Card
              key={key}
              className={`p-6 text-center transition-all duration-200 ${
                hasUpdate
                  ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 hover:border-primary/60"
                  : "bg-muted/20 border-muted"
              }`}
            >
              <p className="text-sm text-muted-foreground mb-1">{year}</p>
              <h3 className="text-2xl font-bold mb-4">{format(month, "MMMM")}</h3>
              {hasUpdate ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/40">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-semibold text-primary">Update Coming</span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">No update planned</span>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

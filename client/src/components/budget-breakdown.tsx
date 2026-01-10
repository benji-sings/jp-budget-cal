import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Calculator, 
  Download, 
  Share2, 
  Plane, 
  Building2, 
  Train, 
  UtensilsCrossed, 
  Ticket, 
  ShoppingBag,
  Users,
  Calendar
} from "lucide-react";
import type { CostBreakdown } from "@shared/schema";
import { formatCurrency, convertToJPY } from "@/lib/pricing-data";

interface BudgetBreakdownProps {
  breakdown: CostBreakdown;
  duration: number;
  travelers: number;
  exchangeRate: number;
  onExport: () => void;
  onShare: () => void;
}

const categoryConfig = [
  { key: "flights", label: "Flights", icon: Plane, color: "bg-chart-1" },
  { key: "accommodation", label: "Accommodation", icon: Building2, color: "bg-chart-2" },
  { key: "transportation", label: "Transportation", icon: Train, color: "bg-chart-3" },
  { key: "food", label: "Food & Dining", icon: UtensilsCrossed, color: "bg-chart-4" },
  { key: "activities", label: "Activities", icon: Ticket, color: "bg-chart-5" },
  { key: "shopping", label: "Shopping & Misc", icon: ShoppingBag, color: "bg-primary" },
] as const;

export const BudgetBreakdown = memo(function BudgetBreakdown({
  breakdown,
  duration,
  travelers,
  exchangeRate,
  onExport,
  onShare,
}: BudgetBreakdownProps) {
  const maxCategory = Math.max(
    breakdown.flights,
    breakdown.accommodation,
    breakdown.transportation,
    breakdown.food,
    breakdown.activities,
    breakdown.shopping
  );

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calculator className="h-5 w-5 text-primary" />
          Budget Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center p-4 rounded-md bg-primary/5 border border-primary/20">
          <p className="text-sm text-muted-foreground mb-1">Total Estimated Trip Cost</p>
          <p className="text-4xl font-bold text-primary tabular-nums" data-testid="text-total-cost">
            {formatCurrency(breakdown.total)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatCurrency(convertToJPY(breakdown.total, exchangeRate), "JPY")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-md bg-muted/50 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Per Person</span>
            </div>
            <p className="text-lg font-semibold tabular-nums" data-testid="text-per-person">
              {formatCurrency(breakdown.perPerson)}
            </p>
          </div>
          <div className="p-3 rounded-md bg-muted/50 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">Daily Average</span>
            </div>
            <p className="text-lg font-semibold tabular-nums" data-testid="text-daily-average">
              {formatCurrency(breakdown.dailyAverage)}
            </p>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-sm font-medium">Cost Breakdown</p>
          {categoryConfig.map(({ key, label, icon: Icon, color }) => {
            const value = breakdown[key as keyof CostBreakdown] as number;
            const percentage = breakdown.total > 0 ? (value / breakdown.total) * 100 : 0;
            const barWidth = maxCategory > 0 ? (value / maxCategory) * 100 : 0;

            return (
              <div key={key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs tabular-nums">
                      {percentage.toFixed(0)}%
                    </Badge>
                    <span className="font-medium tabular-nums w-20 text-right">
                      {formatCurrency(value)}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-300`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        <div className="flex gap-2">
          <Button 
            onClick={onExport} 
            className="flex-1"
            data-testid="button-export"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline" 
            onClick={onShare}
            className="flex-1"
            data-testid="button-share"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Exchange rate: 1 SGD = ¥{Math.round(1 / exchangeRate).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

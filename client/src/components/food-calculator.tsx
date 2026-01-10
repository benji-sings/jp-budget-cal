import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FoodTier } from "@shared/schema";
import { foodBudgets, formatCurrency } from "@/lib/pricing-data";

interface FoodCalculatorProps {
  foodTier: FoodTier;
  dailyBudget: number;
  duration: number;
  travelers: number;
  onTierChange: (tier: FoodTier) => void;
  onBudgetChange: (budget: number) => void;
}

const tierOptions: { value: FoodTier; label: string; icon: string }[] = [
  { value: "budget", label: "Budget", icon: "rice-bowl" },
  { value: "midrange", label: "Mid-range", icon: "soup" },
  { value: "splurge", label: "Splurge", icon: "chef-hat" },
];

export const FoodCalculator = memo(function FoodCalculator({
  foodTier,
  dailyBudget,
  duration,
  travelers,
  onTierChange,
  onBudgetChange,
}: FoodCalculatorProps) {
  const totalCost = dailyBudget * duration * travelers;
  const tierData = foodBudgets[foodTier];

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
            Food & Dining
          </CardTitle>
          <span className="text-lg font-semibold tabular-nums text-primary" data-testid="text-food-total">
            {formatCurrency(totalCost)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Dining Style</Label>
          <div className="grid grid-cols-3 gap-2">
            {tierOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onTierChange(option.value);
                  onBudgetChange(foodBudgets[option.value].average);
                }}
                className={cn(
                  "p-3 rounded-md text-center transition-all border",
                  foodTier === option.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover-elevate"
                )}
                data-testid={`button-food-${option.value}`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  ~{formatCurrency(foodBudgets[option.value].average)}/day
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm font-medium">Daily Food Budget</Label>
            <Badge variant="secondary" className="tabular-nums">
              {formatCurrency(dailyBudget)}/day
            </Badge>
          </div>
          <Slider
            value={[dailyBudget]}
            onValueChange={(v) => onBudgetChange(v[0])}
            min={tierData.min}
            max={tierData.max}
            step={5}
            className="w-full"
            data-testid="slider-food-budget"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(tierData.min)}</span>
            <span>{formatCurrency(tierData.max)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-muted-foreground">Typical meals at this budget:</Label>
          <div className="flex flex-wrap gap-1.5">
            {tierData.examples.map((example, i) => (
              <Badge key={i} variant="outline" className="text-xs font-normal">
                {example}
              </Badge>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground" data-testid="text-food-calculation">
              {travelers} pax × {duration} days × {formatCurrency(dailyBudget)}
            </span>
            <span className="font-semibold" data-testid="text-food-subtotal">{formatCurrency(totalCost)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

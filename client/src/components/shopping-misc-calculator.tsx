import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Wifi, Coins, AlertCircle, Receipt, Smartphone, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/pricing-data";
import { Button } from "@/components/ui/button";

export type ConnectivityType = "none" | "pocket-wifi" | "esim" | "tourist-sim";

interface ShoppingMiscCalculatorProps {
  shoppingBudget: number;
  connectivityType: ConnectivityType;
  duration: number;
  travelers: number;
  onShoppingBudgetChange: (budget: number) => void;
  onConnectivityChange: (type: ConnectivityType) => void;
}

const POCKET_WIFI_DAILY = 8;
const ESIM_COST = 25;
const TOURIST_SIM_COST = 30;
const EMERGENCY_FUND_PER_PERSON = 100;

export const ShoppingMiscCalculator = memo(function ShoppingMiscCalculator({
  shoppingBudget,
  connectivityType,
  duration,
  travelers,
  onShoppingBudgetChange,
  onConnectivityChange,
}: ShoppingMiscCalculatorProps) {
  const getConnectivityCost = () => {
    switch (connectivityType) {
      case "pocket-wifi":
        return POCKET_WIFI_DAILY * duration;
      case "esim":
        return ESIM_COST;
      case "tourist-sim":
        return TOURIST_SIM_COST;
      default:
        return 0;
    }
  };
  
  const connectivityCost = getConnectivityCost();
  const emergencyFund = EMERGENCY_FUND_PER_PERSON;
  const totalCost = (shoppingBudget + emergencyFund) * travelers + connectivityCost;

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Shopping & Miscellaneous
          </CardTitle>
          <span className="text-lg font-semibold tabular-nums text-primary" data-testid="text-shopping-total">
            {formatCurrency(totalCost)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm font-medium">Shopping Budget (per person)</Label>
            <Badge variant="secondary" className="tabular-nums">
              {formatCurrency(shoppingBudget)}
            </Badge>
          </div>
          <Slider
            value={[shoppingBudget]}
            onValueChange={(v) => onShoppingBudgetChange(v[0])}
            min={0}
            max={1000}
            step={50}
            className="w-full"
            data-testid="slider-shopping-budget"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(0)}</span>
            <span>{formatCurrency(1000)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            For souvenirs, clothing, electronics, snacks, etc.
          </p>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Connectivity</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              variant={connectivityType === "none" ? "default" : "outline"}
              className="h-auto py-3 flex flex-col items-center gap-1"
              onClick={() => onConnectivityChange("none")}
              data-testid="button-connectivity-none"
            >
              <span className="text-xs font-medium">None</span>
              <span className="text-[10px] text-muted-foreground">{formatCurrency(0)}</span>
            </Button>
            <Button
              variant={connectivityType === "pocket-wifi" ? "default" : "outline"}
              className="h-auto py-3 flex flex-col items-center gap-1"
              onClick={() => onConnectivityChange("pocket-wifi")}
              data-testid="button-connectivity-wifi"
            >
              <Wifi className="h-4 w-4" />
              <span className="text-xs font-medium">Pocket WiFi</span>
              <span className="text-[10px] text-muted-foreground">{formatCurrency(POCKET_WIFI_DAILY)}/day</span>
            </Button>
            <Button
              variant={connectivityType === "esim" ? "default" : "outline"}
              className="h-auto py-3 flex flex-col items-center gap-1"
              onClick={() => onConnectivityChange("esim")}
              data-testid="button-connectivity-esim"
            >
              <Smartphone className="h-4 w-4" />
              <span className="text-xs font-medium">eSIM</span>
              <span className="text-[10px] text-muted-foreground">{formatCurrency(ESIM_COST)}</span>
            </Button>
            <Button
              variant={connectivityType === "tourist-sim" ? "default" : "outline"}
              className="h-auto py-3 flex flex-col items-center gap-1"
              onClick={() => onConnectivityChange("tourist-sim")}
              data-testid="button-connectivity-sim"
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-xs font-medium">Tourist SIM</span>
              <span className="text-[10px] text-muted-foreground">{formatCurrency(TOURIST_SIM_COST)}</span>
            </Button>
          </div>
          {connectivityType !== "none" && (
            <p className="text-xs text-muted-foreground">
              {connectivityType === "pocket-wifi" && "Unlimited data, pick up at airport. Great for groups."}
              {connectivityType === "esim" && "Install before departure via Airalo, Ubigi, or Holafly. No physical SIM needed."}
              {connectivityType === "tourist-sim" && "Buy at airport or convenience stores. Includes local number for calls."}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Tax-Free Shopping
          </Label>
          <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
            <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
              Save 10% on your purchases!
            </p>
            <ul className="text-xs text-green-600 dark:text-green-400 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">-</span>
                <span>Minimum purchase: 5,000 (approx. {formatCurrency(45)})</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">-</span>
                <span>Bring your passport when shopping</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">-</span>
                <span>Look for "Tax Free" signs at stores</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">-</span>
                <span>Available at Don Quijote, BIC Camera, Uniqlo, etc.</span>
              </li>
            </ul>
            {shoppingBudget > 0 && (
              <p className="text-xs text-green-700 dark:text-green-300 mt-2 pt-2 border-t border-green-500/20 font-medium">
                Potential savings: {formatCurrency(Math.round(shoppingBudget * 0.1))} per person
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-md bg-amber-500/10 border border-amber-500/20">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
              Emergency Fund Recommendation
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              We recommend keeping {formatCurrency(emergencyFund)} per person for unexpected expenses.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-border space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span data-testid="text-shopping-label">Shopping ({travelers} pax)</span>
            <span className="tabular-nums" data-testid="text-shopping-cost">{formatCurrency(shoppingBudget * travelers)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span data-testid="text-connectivity-label">
              {connectivityType === "pocket-wifi" && `Pocket WiFi (${duration} days)`}
              {connectivityType === "esim" && "eSIM"}
              {connectivityType === "tourist-sim" && "Tourist SIM"}
              {connectivityType === "none" && "Connectivity"}
            </span>
            <span className="tabular-nums" data-testid="text-connectivity-cost">{formatCurrency(connectivityCost)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span data-testid="text-emergency-label">
              <Coins className="h-3 w-3 inline mr-1" />
              Emergency fund
            </span>
            <span className="tabular-nums" data-testid="text-emergency-cost">{formatCurrency(emergencyFund * travelers)}</span>
          </div>
          <div className="flex justify-between font-semibold pt-1 border-t border-border">
            <span>Total</span>
            <span className="tabular-nums" data-testid="text-shopping-subtotal">{formatCurrency(totalCost)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

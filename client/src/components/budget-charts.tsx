import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { BarChart3 } from "lucide-react";
import type { CostBreakdown } from "@shared/schema";
import { formatCurrency } from "@/lib/pricing-data";

interface BudgetChartsProps {
  breakdown: CostBreakdown;
  duration: number;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
];

const categoryLabels = {
  flights: "Flights",
  accommodation: "Accommodation",
  transportation: "Transport",
  food: "Food",
  activities: "Activities",
  shopping: "Shopping",
};

export function BudgetCharts({ breakdown, duration }: BudgetChartsProps) {
  const pieData = [
    { name: "Flights", value: breakdown.flights },
    { name: "Accommodation", value: breakdown.accommodation },
    { name: "Transport", value: breakdown.transportation },
    { name: "Food", value: breakdown.food },
    { name: "Activities", value: breakdown.activities },
    { name: "Shopping", value: breakdown.shopping },
  ].filter((d) => d.value > 0);

  const dailyData = Array.from({ length: Math.min(duration, 14) }, (_, i) => ({
    day: `Day ${i + 1}`,
    accommodation: Math.round(breakdown.accommodation / duration),
    food: Math.round(breakdown.food / duration),
    transport: Math.round(breakdown.transportation / duration),
    activities: Math.round(breakdown.activities / duration),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-popover-border rounded-md p-2 shadow-lg">
          <p className="text-sm font-medium">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-primary" />
          Budget Visualization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Cost Distribution</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Daily Cost Projection</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 11 }} 
                  className="text-muted-foreground"
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11 }} 
                  className="text-muted-foreground"
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const total = payload.reduce((sum, p) => sum + (p.value as number), 0);
                      return (
                        <div className="bg-popover border border-popover-border rounded-md p-2 shadow-lg">
                          <p className="text-sm font-medium mb-1">{label}</p>
                          {payload.map((p: any, i: number) => (
                            <p key={i} className="text-xs text-muted-foreground">
                              {p.dataKey}: {formatCurrency(p.value)}
                            </p>
                          ))}
                          <p className="text-sm font-medium mt-1 pt-1 border-t border-border">
                            Total: {formatCurrency(total)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="accommodation" stackId="a" fill={COLORS[1]} name="Accommodation" />
                <Bar dataKey="food" stackId="a" fill={COLORS[3]} name="Food" />
                <Bar dataKey="transport" stackId="a" fill={COLORS[2]} name="Transport" />
                <Bar dataKey="activities" stackId="a" fill={COLORS[4]} name="Activities" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Lightbulb, 
  Receipt, 
  CreditCard, 
  Store, 
  Train, 
  Landmark, 
  Calendar, 
  Banknote, 
  HandCoins,
  MapPin,
  UtensilsCrossed,
  Ticket
} from "lucide-react";
import type { City } from "@shared/schema";
import { moneyTips, cityRecommendations } from "@/lib/pricing-data";
import { useState, memo } from "react";

interface TipsSectionProps {
  selectedCities: City[];
}

const iconMap: Record<string, typeof Lightbulb> = {
  receipt: Receipt,
  "credit-card": CreditCard,
  store: Store,
  train: Train,
  landmark: Landmark,
  calendar: Calendar,
  banknote: Banknote,
  "hand-coins": HandCoins,
};

export const TipsSection = memo(function TipsSection({ selectedCities }: TipsSectionProps) {
  const [checkedSpots, setCheckedSpots] = useState<Set<string>>(new Set());

  const toggleSpot = (spot: string) => {
    const newSet = new Set(checkedSpots);
    if (newSet.has(spot)) {
      newSet.delete(spot);
    } else {
      newSet.add(spot);
    }
    setCheckedSpots(newSet);
  };

  return (
    <div className="space-y-6">
      <Card className="border-card-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-primary" />
            Money-Saving Tips for Singaporeans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {moneyTips.map((tip, index) => {
              const Icon = iconMap[tip.icon] || Lightbulb;
              return (
                <div
                  key={index}
                  className="p-4 rounded-md border border-border space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <h4 className="font-medium text-sm">{tip.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedCities.length > 0 && (
        <Card className="border-card-border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-primary" />
              City Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="space-y-2">
              {selectedCities.map((city) => {
                const recommendations = cityRecommendations[city];
                if (!recommendations) return null;

                return (
                  <AccordionItem key={city} value={city} className="border rounded-md px-4">
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium">{city}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Famous Foods</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {recommendations.foods.map((food, i) => (
                              <Badge key={i} variant="secondary" className="text-xs font-normal">
                                {food}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Must-Visit Checklist</span>
                          </div>
                          <div className="space-y-2">
                            {recommendations.spots.map((spot, i) => {
                              const spotKey = `${city}-${spot}`;
                              return (
                                <div key={i} className="flex items-center gap-2">
                                  <Checkbox
                                    id={spotKey}
                                    checked={checkedSpots.has(spotKey)}
                                    onCheckedChange={() => toggleSpot(spotKey)}
                                    data-testid={`checkbox-spot-${city.toLowerCase()}-${i}`}
                                  />
                                  <label
                                    htmlFor={spotKey}
                                    className="text-sm cursor-pointer"
                                  >
                                    {spot}
                                  </label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

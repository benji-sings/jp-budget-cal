import { useState, useCallback, useMemo, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Ticket, Search, Snowflake, Landmark, MapPin, ChevronDown, ChevronUp, Compass, Trees, Eye, Castle, Loader2, Map, Star, X } from "lucide-react";
import type { City, Activity } from "@shared/schema";
import { activities, formatCurrency } from "@/lib/pricing-data";

interface OSMAttraction {
  id: string;
  name: string;
  type: string;
  lat: number;
  lon: number;
  category: string;
}

interface PlaceDetails {
  placeId?: string;
  name?: string;
  rating: number | null;
  userRatingsTotal: number;
  lat?: number;
  lng?: number;
  vicinity?: string;
}

interface ActivitiesCalculatorProps {
  selectedCities: City[];
  selectedActivities: string[];
  travelers: number;
  onActivitiesChange: (activities: string[]) => void;
}

const categoryIcons: Record<string, typeof Landmark> = {
  theme_park: Ticket,
  museum: Landmark,
  temple: Landmark,
  experience: MapPin,
  day_trip: MapPin,
  viewpoint: Eye,
  landmark: Castle,
  nature: Trees,
};

const StarRating = memo(function StarRating({ rating, reviewCount }: { rating: number | null; reviewCount: number }) {
  if (rating === null) return null;
  
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i}
            className={`h-3 w-3 ${
              i < fullStars 
                ? "fill-yellow-400 text-yellow-400" 
                : i === fullStars && hasHalf 
                  ? "fill-yellow-400/50 text-yellow-400" 
                  : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {rating.toFixed(1)} ({reviewCount.toLocaleString()})
      </span>
    </div>
  );
});

const ActivityRating = memo(function ActivityRating({ activity, isVisible }: { activity: Activity; isVisible: boolean }) {
  const { data, isLoading } = useQuery<PlaceDetails>({
    queryKey: ["/api/place-details", activity.id],
    queryFn: async () => {
      if (!activity.lat || !activity.lng) return { rating: null, userRatingsTotal: 0 };
      const res = await fetch(`/api/place-details?name=${encodeURIComponent(activity.name)}&lat=${activity.lat}&lng=${activity.lng}`);
      if (!res.ok) return { rating: null, userRatingsTotal: 0 };
      return res.json();
    },
    enabled: !!(activity.lat && activity.lng) && isVisible,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
  });

  if (!isVisible) return null;
  
  if (isLoading) {
    return <div className="h-4 w-20 bg-muted animate-pulse rounded" />;
  }

  if (!data || data.rating === null) return null;

  return <StarRating rating={data.rating} reviewCount={data.userRatingsTotal} />;
});

export function ActivitiesCalculator({
  selectedCities,
  selectedActivities,
  travelers,
  onActivitiesChange,
}: ActivitiesCalculatorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 200);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<{ name: string; lat: number; lng: number } | null>(null);

  const { data: embedData, isLoading: embedLoading } = useQuery<{ embedUrl: string }>({
    queryKey: ["/api/maps-embed", selectedPlace?.lat, selectedPlace?.lng, selectedPlace?.name],
    queryFn: async () => {
      if (!selectedPlace) throw new Error("No place selected");
      const res = await fetch(`/api/maps-embed?lat=${selectedPlace.lat}&lng=${selectedPlace.lng}&name=${encodeURIComponent(selectedPlace.name)}`);
      if (!res.ok) throw new Error("Failed to get embed URL");
      return res.json();
    },
    enabled: !!selectedPlace && mapDialogOpen,
    staleTime: 1000 * 60 * 60,
  });

  const primaryCity = selectedCities[0];
  
  const { data: osmData, isLoading: osmLoading, isError } = useQuery<{ attractions: OSMAttraction[] }>({
    queryKey: ["/api/attractions", primaryCity],
    enabled: !!primaryCity && discoverOpen,
  });

  const relevantActivities = activities.filter((a) => 
    selectedCities.includes(a.city as City) || selectedCities.length === 0
  );

  const searchLower = debouncedSearchQuery.toLowerCase();
  const filteredActivities = relevantActivities.filter((a) =>
    a.name.toLowerCase().includes(searchLower) ||
    a.city.toLowerCase().includes(searchLower)
  );

  const groupedActivities = filteredActivities.reduce((acc, activity) => {
    if (!acc[activity.city]) acc[activity.city] = [];
    acc[activity.city].push(activity);
    return acc;
  }, {} as Record<City, Activity[]>);

  const totalCost = selectedActivities.reduce((sum, id) => {
    const activity = activities.find((a) => a.id === id);
    return sum + (activity?.priceSGD || 0) * travelers;
  }, 0);

  const toggleActivity = useCallback((id: string) => {
    if (selectedActivities.includes(id)) {
      onActivitiesChange(selectedActivities.filter((a) => a !== id));
    } else {
      onActivitiesChange([...selectedActivities, id]);
    }
  }, [selectedActivities, onActivitiesChange]);

  const openMapDialog = (name: string, lat: number, lng: number) => {
    setSelectedPlace({ name, lat, lng });
    setMapDialogOpen(true);
  };

  const curatedIds = new Set(activities.map(a => a.id));
  const osmAttractions = osmData?.attractions?.filter(
    a => !curatedIds.has(a.id) && 
    a.name.length > 2 && 
    !a.name.match(/^[0-9]+$/)
  ).slice(0, 20) || [];

  return (
    <>
      <Card className="border-card-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ticket className="h-5 w-5 text-primary" />
              Activities & Attractions
            </CardTitle>
            <span className="text-lg font-semibold tabular-nums text-primary" data-testid="text-activities-total">
              {formatCurrency(totalCost)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-activities"
            />
          </div>

          {selectedCities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Select destination cities to see available activities
            </p>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {Object.entries(groupedActivities).map(([city, cityActivities]) => (
                <div key={city} className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {city}
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {cityActivities.length} options
                    </Badge>
                  </Label>
                  <div className="space-y-1">
                    {cityActivities.map((activity) => {
                      const Icon = categoryIcons[activity.category] || Landmark;
                      const isSelected = selectedActivities.includes(activity.id);
                      const hasCoords = !!(activity.lat && activity.lng);
                      
                      return (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-md hover-elevate"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Checkbox
                              id={activity.id}
                              checked={isSelected}
                              onCheckedChange={() => toggleActivity(activity.id)}
                              data-testid={`checkbox-activity-${activity.id}`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <label
                                  htmlFor={activity.id}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <span className="text-sm truncate">{activity.name}</span>
                                  {activity.seasonal && (
                                    <Snowflake className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                  )}
                                </label>
                                {hasCoords && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 flex-shrink-0"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      openMapDialog(activity.name, activity.lat!, activity.lng!);
                                    }}
                                    data-testid={`button-map-${activity.id}`}
                                  >
                                    <Map className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                              <ActivityRating activity={activity} isVisible={isSelected} />
                            </div>
                          </div>
                          <span className="text-sm tabular-nums text-muted-foreground flex-shrink-0">
                            {activity.priceSGD === 0 ? "Free" : formatCurrency(activity.priceSGD)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {primaryCity && (
            <Collapsible open={discoverOpen} onOpenChange={setDiscoverOpen}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  data-testid="button-discover-more"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="h-4 w-4" />
                    Discover More in {primaryCity}
                  </span>
                  {discoverOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-3">
                {osmLoading ? (
                  <div className="flex items-center justify-center py-6 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span className="text-sm">Finding attractions...</span>
                  </div>
                ) : isError ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Unable to load attractions. Please try again later.
                  </p>
                ) : osmAttractions.length > 0 ? (
                  <>
                    <p className="text-xs text-muted-foreground">
                      Additional attractions (click map icon to view location)
                    </p>
                    <div className="grid gap-2">
                      {osmAttractions.map((attraction) => {
                        const Icon = categoryIcons[attraction.category] || Compass;
                        return (
                          <div
                            key={attraction.id}
                            className="flex items-center justify-between gap-2 p-2 rounded-md hover-elevate group"
                            data-testid={`attraction-${attraction.id}`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="text-sm truncate block">{attraction.name}</span>
                                <span className="text-xs text-muted-foreground capitalize">
                                  {attraction.type.replace(/_/g, ' ')}
                                </span>
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 flex-shrink-0"
                              onClick={() => openMapDialog(attraction.name, attraction.lat, attraction.lon)}
                              data-testid={`button-map-osm-${attraction.id}`}
                            >
                              <Map className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      Data from OpenStreetMap contributors
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No additional attractions found. Try selecting a different city.
                  </p>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          {selectedActivities.length > 0 && (
            <div className="pt-2 border-t border-border">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground" data-testid="text-activities-calculation">
                  {selectedActivities.length} activit{selectedActivities.length === 1 ? "y" : "ies"} x {travelers} pax
                </span>
                <span className="font-semibold" data-testid="text-activities-subtotal">{formatCurrency(totalCost)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent className="sm:max-w-[900px] w-[95vw] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {selectedPlace?.name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Map location for {selectedPlace?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="w-full h-[750px] bg-muted">
            {embedLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : embedData?.embedUrl ? (
              <iframe
                src={embedData.embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map of ${selectedPlace?.name}`}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Map className="h-12 w-12 mb-2" />
                <p className="text-sm">Unable to load map</p>
              </div>
            )}
          </div>
          <div className="p-4 pt-2 border-t flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => setMapDialogOpen(false)}
              data-testid="button-close-map"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

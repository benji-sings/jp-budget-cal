import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, Sun, CloudRain, Snowflake, CloudSun, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { City } from "@shared/schema";

interface WeatherData {
  city: string;
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
  };
}

interface WeatherForecastProps {
  city: City;
  departureDate?: Date;
  returnDate?: Date;
}

const getWeatherIcon = (code: number) => {
  if (code === 0 || code === 1) return <Sun className="h-5 w-5 text-yellow-500" />;
  if (code >= 2 && code <= 3) return <CloudSun className="h-5 w-5 text-gray-500" />;
  if (code >= 45 && code <= 48) return <Cloud className="h-5 w-5 text-gray-400" />;
  if (code >= 51 && code <= 67) return <CloudRain className="h-5 w-5 text-blue-500" />;
  if (code >= 71 && code <= 77) return <Snowflake className="h-5 w-5 text-blue-300" />;
  if (code >= 80 && code <= 99) return <CloudRain className="h-5 w-5 text-blue-600" />;
  return <Cloud className="h-5 w-5 text-gray-500" />;
};

const getWeatherDescription = (code: number): string => {
  if (code === 0) return "Clear";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code >= 45 && code <= 48) return "Foggy";
  if (code >= 51 && code <= 55) return "Drizzle";
  if (code >= 56 && code <= 57) return "Freezing drizzle";
  if (code >= 61 && code <= 65) return "Rain";
  if (code >= 66 && code <= 67) return "Freezing rain";
  if (code >= 71 && code <= 75) return "Snow";
  if (code === 77) return "Snow grains";
  if (code >= 80 && code <= 82) return "Rain showers";
  if (code >= 85 && code <= 86) return "Snow showers";
  if (code >= 95 && code <= 99) return "Thunderstorm";
  return "Unknown";
};

export function WeatherForecast({ city, departureDate, returnDate }: WeatherForecastProps) {
  const { data, isLoading, error } = useQuery<WeatherData>({
    queryKey: [`/api/weather/${city}`],
    staleTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <Card className="border-card-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Cloud className="h-5 w-5 text-primary" />
            Weather Forecast
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return null;
  }

  const forecastDays = data.daily.time.slice(0, 7).map((date, index) => ({
    date: parseISO(date),
    maxTemp: Math.round(data.daily.temperature_2m_max[index]),
    minTemp: Math.round(data.daily.temperature_2m_min[index]),
    precipitation: data.daily.precipitation_probability_max[index],
    weatherCode: data.daily.weather_code[index],
  }));

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Cloud className="h-5 w-5 text-primary" />
          {city} Weather (Next 7 Days)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Live forecast from Open-Meteo API
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {forecastDays.map((day, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-2 rounded-md bg-muted/30 text-center"
              data-testid={`weather-day-${index}`}
            >
              <span className="text-xs font-medium text-muted-foreground">
                {format(day.date, "EEE")}
              </span>
              <span className="text-xs text-muted-foreground mb-1">
                {format(day.date, "d/M")}
              </span>
              <div className="my-1">
                {getWeatherIcon(day.weatherCode)}
              </div>
              <span className="text-sm font-semibold" data-testid={`text-temp-${index}`}>
                {day.maxTemp}°
              </span>
              <span className="text-xs text-muted-foreground">
                {day.minTemp}°
              </span>
              {day.precipitation > 30 && (
                <Badge variant="secondary" className="mt-1 text-xs px-1">
                  {day.precipitation}%
                </Badge>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Pack accordingly: Umbrella if rain expected, layers for temperature changes
        </p>
      </CardContent>
    </Card>
  );
}

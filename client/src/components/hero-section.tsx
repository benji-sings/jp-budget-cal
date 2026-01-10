import { memo } from "react";
import { MapPin, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { City } from "@shared/schema";
import tokyoImage from "@assets/clay-banks-hwLAI5lRhdM-unsplash_1767887041996.jpg";
import osakaImage from "@assets/miram-oh-mYIgb7zl70M-unsplash_1767887171577.jpg";
import kyotoImage from "@assets/daisy-chen-J4H50uMTw3M-unsplash_1767887247671.jpg";
import hokkaidoImage from "@assets/backpacker-deogyusan-mountains-winter_1767887365106.jpg";
import fukuokaImage from "@assets/yux-xiang-bAsOgzNy3XM-unsplash_1767887662533.jpg";
import okinawaImage from "@assets/romeo-a-uvNQOFjqjns-unsplash_1767887767123.jpg";
import hiroshimaImage from "@assets/juliana-barquero-GptJ5L7niVk-unsplash_1767887831046.jpg";
import yokohamaImage from "@assets/finn-u1nFAZS_wcs-unsplash_1767887921215.jpg";
import nagoyaImage from "@assets/tim-d-XL7BJV4zWhg-unsplash_1767888053492.jpg";
import naraImage from "@assets/timo-volz-tEOhkLuqmUI-unsplash_1767888427864.jpg";

const cityBackgrounds: Record<City, string> = {
  Tokyo: tokyoImage,
  Osaka: osakaImage,
  Kyoto: kyotoImage,
  Hiroshima: hiroshimaImage,
  Fukuoka: fukuokaImage,
  Hokkaido: hokkaidoImage,
  Okinawa: okinawaImage,
  Nagoya: nagoyaImage,
  Nara: naraImage,
  Yokohama: yokohamaImage,
};

interface HeroSectionProps {
  exchangeRate: number;
  onStartPlanning: () => void;
  selectedCity?: City;
}

export const HeroSection = memo(function HeroSection({ exchangeRate, onStartPlanning, selectedCity }: HeroSectionProps) {
  const backgroundImage = selectedCity ? cityBackgrounds[selectedCity] : cityBackgrounds.Tokyo;
  
  return (
    <section className="relative w-full h-48 md:h-64 overflow-hidden">
      <img
        src={backgroundImage}
        alt={selectedCity || "Japan"}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
        loading="eager"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      
      <div className="relative h-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-5 w-5 text-primary-foreground" />
          <span className="text-primary-foreground/90 text-sm font-medium">
            Singapore to {selectedCity || "Japan"}
          </span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Japan Travel Budget Calculator
        </h1>
        
        <p className="text-white/80 text-base md:text-lg max-w-xl mb-4">
          Plan your perfect Japan trip from Singapore with accurate cost estimates in SGD
        </p>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={onStartPlanning}
            className="bg-primary text-primary-foreground border-primary-border backdrop-blur-sm"
            data-testid="button-start-planning"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Start Planning
          </Button>
          
          <Badge 
            variant="outline" 
            className="bg-white/10 border-white/30 text-white backdrop-blur-sm"
            data-testid="badge-hero-exchange-rate"
          >
            1 SGD = ¥{Math.round(1 / exchangeRate).toLocaleString()}
          </Badge>
        </div>
      </div>
    </section>
  );
});

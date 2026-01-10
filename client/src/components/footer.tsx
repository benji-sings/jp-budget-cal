import { Plane, MapPin, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card/50" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="flex flex-col items-center justify-center space-y-2">
          <p className="text-sm text-muted-foreground text-center" data-testid="text-footer-tagline">
            Made for Singaporeans, by Singaporeans
          </p>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <Plane className="h-4 w-4 text-muted-foreground" />
            <Heart className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground" data-testid="text-footer-disclaimer">
            Prices are estimates and may vary. Always check current rates before booking.
          </p>
        </div>
      </div>
    </footer>
  );
}

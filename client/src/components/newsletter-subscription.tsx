import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function NewsletterSubscription() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/newsletter/subscribe", { email });
      return response.json();
    },
    onSuccess: () => {
      setIsSubscribed(true);
      setEmail("");
      toast({
        title: "Subscribed!",
        description: "You'll receive updates about new features and Japan travel tips.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      subscribeMutation.mutate(email.trim());
    }
  };

  if (isSubscribed) {
    return (
      <Card className="border-card-border bg-primary/5">
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-3 text-primary">
            <CheckCircle className="h-6 w-6" />
            <span className="font-medium">Thank you for subscribing!</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-card-border">
      <CardContent className="py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-5 w-5 text-primary" />
            <span>Subscribe to get Japan travel tips and updates</span>
          </div>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={subscribeMutation.isPending}
              className="flex-1"
              data-testid="input-newsletter-email"
            />
            <Button
              type="submit"
              disabled={!email.trim() || subscribeMutation.isPending}
              data-testid="button-newsletter-subscribe"
            >
              {subscribeMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Subscribe"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

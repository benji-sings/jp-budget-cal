import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  CreditCard, 
  Train, 
  Utensils, 
  MessageCircle, 
  Backpack,
  Wifi,
  ShieldCheck
} from "lucide-react";

const essentialPhrases = [
  { japanese: "Arigatou gozaimasu", english: "Thank you very much", pronunciation: "ah-ree-gah-toh goh-zai-mas" },
  { japanese: "Sumimasen", english: "Excuse me / Sorry", pronunciation: "soo-mee-mah-sen" },
  { japanese: "Eigo wa hanasemasu ka?", english: "Do you speak English?", pronunciation: "eh-go wa hah-nah-seh-mas ka" },
  { japanese: "Ikura desu ka?", english: "How much is it?", pronunciation: "ee-koo-rah des ka" },
  { japanese: "Kore kudasai", english: "This one, please", pronunciation: "koh-reh koo-dah-sai" },
  { japanese: "Oishii", english: "Delicious!", pronunciation: "oh-ee-shee" },
  { japanese: "Doko desu ka?", english: "Where is...?", pronunciation: "doh-koh des ka" },
  { japanese: "Toire wa doko desu ka?", english: "Where is the toilet?", pronunciation: "toy-reh wa doh-koh des ka" },
];

const packingEssentials = [
  { item: "Portable WiFi / SIM card", reason: "Essential for navigation and translation apps" },
  { item: "IC Card (Suica/Pasmo)", reason: "Tap-and-go for trains, buses, and convenience stores" },
  { item: "Compact umbrella", reason: "Weather can be unpredictable, especially in spring/summer" },
  { item: "Comfortable walking shoes", reason: "You'll walk 15,000-25,000 steps daily" },
  { item: "Small towel (tenugui)", reason: "Many restrooms don't have paper towels" },
  { item: "Cash in JPY", reason: "Many small shops and restaurants are cash-only" },
  { item: "Reusable shopping bag", reason: "Plastic bags cost money in Japan" },
  { item: "Travel adapter", reason: "Japan uses Type A plugs (same as US)" },
];

const mustKnowTips = [
  { 
    title: "Train Etiquette", 
    tips: [
      "No talking on phone in trains",
      "Priority seats for elderly/pregnant",
      "Stand to the left on escalators (Tokyo) or right (Osaka)",
      "Rush hour (7:30-9:30am) is very crowded"
    ]
  },
  { 
    title: "Restaurant Culture", 
    tips: [
      "Many have ticket machines - buy ticket first",
      "No tipping in Japan",
      "Say 'Gochisousama deshita' when leaving",
      "Slurping noodles is polite!"
    ]
  },
  { 
    title: "Payment Tips", 
    tips: [
      "7-Eleven ATMs accept foreign cards",
      "Tax-free shopping at ¥5,000+ (bring passport)",
      "Use IC card for small purchases",
      "Credit cards accepted at large stores"
    ]
  },
  { 
    title: "Cultural Etiquette", 
    tips: [
      "Remove shoes when entering homes/some restaurants",
      "Don't eat while walking",
      "Bow to show respect",
      "Be quiet on trains and in public"
    ]
  },
];

export function BeginnerGuide() {
  return (
    <Card className="border-card-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <BookOpen className="h-5 w-5 text-primary" />
          Japan Travel Guide for Beginners
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Essential information for first-time visitors from Singapore
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="phrases" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="phrases" className="text-xs sm:text-sm" data-testid="tab-phrases">
              <MessageCircle className="h-4 w-4 mr-1 hidden sm:inline" />
              Phrases
            </TabsTrigger>
            <TabsTrigger value="packing" className="text-xs sm:text-sm" data-testid="tab-packing">
              <Backpack className="h-4 w-4 mr-1 hidden sm:inline" />
              Packing
            </TabsTrigger>
            <TabsTrigger value="tips" className="text-xs sm:text-sm" data-testid="tab-tips">
              <ShieldCheck className="h-4 w-4 mr-1 hidden sm:inline" />
              Tips
            </TabsTrigger>
            <TabsTrigger value="apps" className="text-xs sm:text-sm" data-testid="tab-apps">
              <Wifi className="h-4 w-4 mr-1 hidden sm:inline" />
              Apps
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="phrases" className="mt-4">
            <div className="space-y-2">
              {essentialPhrases.map((phrase, index) => (
                <div 
                  key={index} 
                  className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 p-2 rounded-md bg-muted/30"
                  data-testid={`phrase-${index}`}
                >
                  <span className="font-medium text-sm">{phrase.japanese}</span>
                  <span className="text-xs text-muted-foreground italic">({phrase.pronunciation})</span>
                  <span className="text-sm text-muted-foreground sm:ml-auto">{phrase.english}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="packing" className="mt-4">
            <div className="space-y-2">
              {packingEssentials.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-2 rounded-md bg-muted/30"
                  data-testid={`packing-${index}`}
                >
                  <Badge variant="secondary" className="mt-0.5 shrink-0">{index + 1}</Badge>
                  <div>
                    <span className="font-medium text-sm">{item.item}</span>
                    <p className="text-xs text-muted-foreground">{item.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="tips" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mustKnowTips.map((category, index) => (
                <div 
                  key={index} 
                  className="p-3 rounded-md bg-muted/30"
                  data-testid={`tips-category-${index}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {index === 0 && <Train className="h-4 w-4 text-primary" />}
                    {index === 1 && <Utensils className="h-4 w-4 text-primary" />}
                    {index === 2 && <CreditCard className="h-4 w-4 text-primary" />}
                    {index === 3 && <ShieldCheck className="h-4 w-4 text-primary" />}
                    <span className="font-medium text-sm">{category.title}</span>
                  </div>
                  <ul className="space-y-1">
                    {category.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="text-xs text-muted-foreground flex items-start gap-1">
                        <span className="text-primary">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="apps" className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-md bg-muted/30" data-testid="apps-navigation">
                <h4 className="font-medium text-sm mb-2">Navigation</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li><strong>Google Maps</strong> - Best for walking/driving</li>
                  <li><strong>Japan Transit (Jorudan)</strong> - Train routes with JR Pass filter</li>
                  <li><strong>Navitime</strong> - Local buses and detailed routes</li>
                </ul>
              </div>
              <div className="p-3 rounded-md bg-muted/30" data-testid="apps-translation">
                <h4 className="font-medium text-sm mb-2">Translation</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li><strong>Google Translate</strong> - Camera mode for menus</li>
                  <li><strong>Papago</strong> - Good for Asian languages</li>
                  <li><strong>Yomiwa</strong> - Japanese dictionary with OCR</li>
                </ul>
              </div>
              <div className="p-3 rounded-md bg-muted/30" data-testid="apps-food">
                <h4 className="font-medium text-sm mb-2">Food & Dining</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li><strong>Tabelog</strong> - Japan's top restaurant ratings</li>
                  <li><strong>Gurunavi</strong> - English menus available</li>
                  <li><strong>PayPay</strong> - QR payment (if you can set up)</li>
                </ul>
              </div>
              <div className="p-3 rounded-md bg-muted/30" data-testid="apps-connectivity">
                <h4 className="font-medium text-sm mb-2">Connectivity</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li><strong>Klook/KKday</strong> - Buy SIM or WiFi in advance</li>
                  <li><strong>eSIM (Airalo/Ubigi)</strong> - No physical SIM needed</li>
                  <li><strong>Pocket WiFi</strong> - Collect at airport counter</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

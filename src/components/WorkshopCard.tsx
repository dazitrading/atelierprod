import { Card, CardContent } from "@/components/ui/card";
import { type Workshop, getWorkshopWeeklyTotal, type ProductionEntry, type Article } from "@/lib/data";
import { Factory, Package, Banknote } from "lucide-react";

const WORKSHOP_COLORS: Record<string, string> = {
  "atelier-1": "bg-workshop-1/10 border-workshop-1/30",
  "atelier-2": "bg-workshop-2/10 border-workshop-2/30",
  "atelier-3": "bg-workshop-3/10 border-workshop-3/30",
};

const ICON_COLORS: Record<string, string> = {
  "atelier-1": "text-workshop-1",
  "atelier-2": "text-workshop-2",
  "atelier-3": "text-workshop-3",
};

interface Props {
  workshop: Workshop;
  production: ProductionEntry[];
  articles: Article[];
  weekStart: string;
  weekEnd: string;
}

export default function WorkshopCard({ workshop, production, articles, weekStart, weekEnd }: Props) {
  const { totalAmount, totalItems } = getWorkshopWeeklyTotal(
    workshop.id, production, articles, weekStart, weekEnd
  );

  return (
    <Card className={`border ${WORKSHOP_COLORS[workshop.id] || ""} animate-fade-in`}>
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className={`rounded-lg p-2 bg-card ${ICON_COLORS[workshop.id] || ""}`}>
            <Factory className="h-5 w-5" />
          </div>
          <h3 className="font-display font-semibold text-lg">{workshop.name}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Articles</p>
              <p className="font-display font-bold text-xl">{totalItems}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Montant</p>
              <p className="font-display font-bold text-xl">{totalAmount.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">DA</span></p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

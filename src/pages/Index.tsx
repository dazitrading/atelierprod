import { useState, useCallback } from "react";
import { WORKSHOPS, getArticles, getProduction, getWeekRange } from "@/lib/data";
import WorkshopCard from "@/components/WorkshopCard";
import ProductionTable from "@/components/ProductionTable";
import AddProductionDialog from "@/components/AddProductionDialog";
import ArticleManager from "@/components/ArticleManager";
import { Scissors } from "lucide-react";

const Index = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const articles = getArticles();
  const production = getProduction();
  const { start, end } = getWeekRange();

  // Force re-render on refreshKey change
  void refreshKey;

  const weekLabel = `${new Date(start).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} — ${new Date(end).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <Scissors className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">ConfectionPro</h1>
              <p className="text-xs text-muted-foreground">Gestion de production</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ArticleManager onChanged={refresh} />
            <AddProductionDialog onAdded={refresh} />
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Week summary */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-lg">Résumé de la semaine</h2>
              <p className="text-sm text-muted-foreground">{weekLabel}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {WORKSHOPS.map((w) => (
              <WorkshopCard
                key={w.id}
                workshop={w}
                production={production}
                articles={articles}
                weekStart={start}
                weekEnd={end}
              />
            ))}
          </div>
        </section>

        {/* Production history */}
        <section>
          <h2 className="font-display font-semibold text-lg mb-4">Historique de production</h2>
          <ProductionTable production={production} articles={articles} onChanged={refresh} />
        </section>
      </main>
    </div>
  );
};

export default Index;

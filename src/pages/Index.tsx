import { WORKSHOPS, getWeekRange } from "@/lib/data";
import { useArticles } from "@/hooks/useArticles";
import { useProduction } from "@/hooks/useProduction";
import WorkshopCard from "@/components/WorkshopCard";
import ProductionTable from "@/components/ProductionTable";
import AddProductionDialog from "@/components/AddProductionDialog";
import ArticleManager from "@/components/ArticleManager";
import { Scissors } from "lucide-react";

const Index = () => {
  const { articles, addArticle, deleteArticle } = useArticles();
  const { production, fetchProduction, addProduction, updateProduction, deleteProduction } = useProduction();
  const { start, end } = getWeekRange();

  const weekLabel = `${new Date(start).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} — ${new Date(end).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex flex-wrap items-center justify-between gap-2 py-3 px-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="rounded-lg bg-primary p-1.5 sm:p-2">
              <Scissors className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base sm:text-xl">ConfectionPro</h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Gestion de production</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <ArticleManager articles={articles} onAdd={addArticle} onDelete={deleteArticle} />
            <AddProductionDialog onAdded={fetchProduction} addProduction={addProduction} articles={articles} />
          </div>
        </div>
      </header>

      <main className="container px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
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
                onUpdateProduction={updateProduction}
                onDeleteProduction={deleteProduction}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg mb-4">Historique de production</h2>
          <ProductionTable production={production} articles={articles} onDeleteProduction={deleteProduction} />
        </section>
      </main>
    </div>
  );
};

export default Index;

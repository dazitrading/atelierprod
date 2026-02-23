import { WORKSHOPS, getWeekRange, getWorkshopWeeklyTotal } from "@/lib/data";
const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);
import { useArticles } from "@/hooks/useArticles";
import { useProduction } from "@/hooks/useProduction";
import { useOrders } from "@/hooks/useOrders";
import { useStock } from "@/hooks/useStock";
import { useAuth } from "@/hooks/useAuth";
import WorkshopCard from "@/components/WorkshopCard";
import ProductionTable from "@/components/ProductionTable";
import AddProductionDialog from "@/components/AddProductionDialog";
import StockSection from "@/components/StockSection";
import { Scissors, LogOut, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openWhatsApp } from "@/lib/whatsapp";

const Index = () => {
  const { articles, addArticle, updateArticle, deleteArticle } = useArticles();
  const { signOut } = useAuth();
  const { production, fetchProduction, addProduction, updateProduction, deleteProduction } = useProduction();
  const { orders, addOrder, deleteOrder } = useOrders();
  const { stock, addStock, deleteStock, getStockLevels } = useStock();
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
            <AddProductionDialog onAdded={fetchProduction} addProduction={addProduction} articles={articles} />
            <Button variant="ghost" size="icon" onClick={signOut} title="Se déconnecter">
              <LogOut className="h-4 w-4" />
            </Button>
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
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-600/30 hover:bg-green-50 hover:text-green-700 gap-1.5"
              onClick={() => {
                let msg = `📋 *Récapitulatif hebdomadaire*\n📅 ${weekLabel}\n`;
                let grandTotal = 0;
                let grandItems = 0;
                const articleMap = new Map(articles.map((a) => [a.id, a]));

                for (const w of WORKSHOPS) {
                  const wArticles = articles.filter((a) => a.workshopId === w.id);
                  const { totalAmount, totalItems } = getWorkshopWeeklyTotal(w.id, production, wArticles, start, end);
                  if (totalItems === 0) continue;

                  msg += `\n🏭 *${w.name}*\n`;
                  const entries = production
                    .filter((e) => e.workshopId === w.id && e.date >= start && e.date <= end)
                    .sort((a, b) => a.date.localeCompare(b.date));
                  for (const entry of entries) {
                    const art = articleMap.get(entry.articleId);
                    if (art) {
                      msg += `  • ${art.name} | ${entry.quantity} | ${fmt(art.price)} DH | ${fmt(entry.quantity * art.price)} DH\n`;
                    }
                  }
                  msg += `  📦 Sous-total: ${totalItems} articles — ${fmt(totalAmount)} DH\n`;
                  grandTotal += totalAmount;
                  grandItems += totalItems;
                }

                msg += `\n✅ *TOTAL GÉNÉRAL: ${grandItems} articles — ${fmt(grandTotal)} DH*`;
                openWhatsApp(msg);
              }}
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Partager</span>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {WORKSHOPS.map((w) => (
              <WorkshopCard
                key={w.id}
                workshop={w}
                production={production}
                articles={articles}
                orders={orders}
                weekStart={start}
                weekEnd={end}
                onUpdateProduction={updateProduction}
                onDeleteProduction={deleteProduction}
                onAddArticle={addArticle}
                onUpdateArticle={updateArticle}
                onDeleteArticle={deleteArticle}
                onAddOrder={addOrder}
                onDeleteOrder={deleteOrder}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg mb-4">Historique de production</h2>
          <ProductionTable production={production} articles={articles} onDeleteProduction={deleteProduction} />
        </section>

        <StockSection
          stock={stock}
          articles={articles}
          onAddStock={addStock}
          onDeleteStock={deleteStock}
          getStockLevels={getStockLevels}
        />
      </main>
    </div>
  );
};

export default Index;

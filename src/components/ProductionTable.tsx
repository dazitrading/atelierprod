import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Send } from "lucide-react";
import { WORKSHOPS, type ProductionEntry, type Article } from "@/lib/data";
import { toast } from "@/hooks/use-toast";

interface Props {
  production: ProductionEntry[];
  articles: Article[];
  onDeleteProduction: (id: string) => Promise<void>;
}

export default function ProductionTable({ production, articles, onDeleteProduction }: Props) {
  const articleMap = new Map(articles.map((a) => [a.id, a]));
  const workshopMap = new Map(WORKSHOPS.map((w) => [w.id, w]));

  const sorted = [...production].sort((a, b) => b.date.localeCompare(a.date));

  const handleDelete = async (id: string) => {
    try {
      await onDeleteProduction(id);
      toast({ title: "Entrée supprimée" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Aucune production enregistrée. Commencez par ajouter des articles puis enregistrez la production.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="rounded-lg border bg-card overflow-hidden hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Date</TableHead>
              <TableHead>Atelier</TableHead>
              <TableHead>Article</TableHead>
              <TableHead className="text-right">Qté</TableHead>
              <TableHead className="text-right">Prix unit.</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-10"></TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((entry) => {
              const article = articleMap.get(entry.articleId);
              const workshop = workshopMap.get(entry.workshopId);
              const total = article ? entry.quantity * article.price : 0;
              return (
                <TableRow key={entry.id}>
                  <TableCell className="text-sm">{new Date(entry.date).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell className="font-medium">{workshop?.name || "—"}</TableCell>
                  <TableCell>{article?.name || "—"}</TableCell>
                  <TableCell className="text-right font-display font-semibold">{entry.quantity}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{article?.price.toLocaleString() || "—"} DA</TableCell>
                  <TableCell className="text-right font-display font-semibold">{total.toLocaleString()} DA</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700" title="Envoyer par WhatsApp" onClick={() => {
                      const date = new Date(entry.date).toLocaleDateString("fr-FR");
                      const colorLine = entry.color ? `\n🎨 Couleur: ${entry.color}` : "";
                      const detailLine = entry.detail ? `\n📝 Détails: ${entry.detail}` : "";
                      const msg = `📋 *Production du ${date}*\n🏭 Atelier: ${workshop?.name || "—"}\n👕 Article: ${article?.name || "—"}${colorLine}${detailLine}\n📦 Quantité: ${entry.quantity}\n💲 Prix unit.: ${article?.price.toLocaleString() || "—"} DA\n💰 Total: ${total.toLocaleString()} DA`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
                    }}>
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 sm:hidden">
        {sorted.map((entry) => {
          const article = articleMap.get(entry.articleId);
          const workshop = workshopMap.get(entry.workshopId);
          const total = article ? entry.quantity * article.price : 0;
          return (
            <div key={entry.id} className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString("fr-FR")}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => {
                    const date = new Date(entry.date).toLocaleDateString("fr-FR");
                    const colorLine = entry.color ? `\n🎨 Couleur: ${entry.color}` : "";
                    const detailLine = entry.detail ? `\n📝 Détails: ${entry.detail}` : "";
                    const msg = `📋 *Production du ${date}*\n🏭 Atelier: ${workshop?.name || "—"}\n👕 Article: ${article?.name || "—"}${colorLine}${detailLine}\n📦 Quantité: ${entry.quantity}\n💲 Prix unit.: ${article?.price.toLocaleString() || "—"} DA\n💰 Total: ${total.toLocaleString()} DA`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
                  }}>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(entry.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{workshop?.name || "—"}</span>
                <span className="text-sm">{article?.name || "—"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{entry.quantity} × {article?.price.toLocaleString() || "—"} DA</span>
                <span className="font-display font-semibold">{total.toLocaleString()} DA</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

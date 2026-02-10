import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { WORKSHOPS, type ProductionEntry, type Article, deleteProduction } from "@/lib/data";
import { toast } from "@/hooks/use-toast";

interface Props {
  production: ProductionEntry[];
  articles: Article[];
  onChanged: () => void;
}

export default function ProductionTable({ production, articles, onChanged }: Props) {
  const articleMap = new Map(articles.map((a) => [a.id, a]));
  const workshopMap = new Map(WORKSHOPS.map((w) => [w.id, w]));

  const sorted = [...production].sort((a, b) => b.date.localeCompare(a.date));

  const handleDelete = (id: string) => {
    deleteProduction(id);
    onChanged();
    toast({ title: "Entrée supprimée" });
  };

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        Aucune production enregistrée. Commencez par ajouter des articles puis enregistrez la production.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
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
  );
}

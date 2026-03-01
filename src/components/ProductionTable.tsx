import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Trash2, Send, Printer, Search } from "lucide-react";
import { WORKSHOPS, type ProductionEntry, type Article } from "@/lib/data";
import { type Fourniture } from "@/hooks/useFournitures";

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n).replace(/\u202F/g, ' ');
import { toast } from "@/hooks/use-toast";
import { openWhatsApp } from "@/lib/whatsapp";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Props {
  production: ProductionEntry[];
  articles: Article[];
  fournitures: Fourniture[];
  onDeleteProduction: (id: string) => Promise<void>;
}

export default function ProductionTable({ production, articles, fournitures, onDeleteProduction }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [workshopFilter, setWorkshopFilter] = useState<string>("");
  const [includeFournitures, setIncludeFournitures] = useState(false);
  const articleMap = new Map(articles.map((a) => [a.id, a]));
  const workshopMap = new Map(WORKSHOPS.map((w) => [w.id, w]));

  const sorted = [...production]
    .filter((e) => {
      if (!workshopFilter) return true;
      const ws = workshopMap.get(e.workshopId);
      return ws?.name.toLowerCase().includes(workshopFilter.toLowerCase());
    })
    .sort((a, b) => (b.createdAt || b.date).localeCompare(a.createdAt || a.date));

  const toggleId = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === sorted.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(sorted.map((e) => e.id)));
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteProduction(id);
      selectedIds.delete(id);
      setSelectedIds(new Set(selectedIds));
      toast({ title: "Entrée supprimée" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handlePrintSelected = () => {
    const entries = sorted.filter((e) => selectedIds.has(e.id));
    if (entries.length === 0) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Récapitulatif de Production", 14, 18);
    doc.setFontSize(10);
    doc.text(`${entries.length} entrée(s) sélectionnée(s) — ${new Date().toLocaleDateString("fr-FR")}`, 14, 26);

    const rows = entries.map((e) => {
      const art = articleMap.get(e.articleId);
      const ws = workshopMap.get(e.workshopId);
      const total = art ? e.quantity * art.price : 0;
      const details = [e.color, e.size, e.detail].filter(Boolean).join(" · ") || "—";
      return [
        new Date(e.date).toLocaleDateString("fr-FR"),
        ws?.name || "—",
        art?.name || "—",
        details,
        e.quantity.toString(),
        art ? `${fmt(art.price)} DH` : "—",
        `${fmt(total)} DH`,
      ];
    });

    const grandTotal = entries.reduce((sum, e) => {
      const art = articleMap.get(e.articleId);
      return sum + (art ? e.quantity * art.price : 0);
    }, 0);
    const grandQty = entries.reduce((sum, e) => sum + e.quantity, 0);

    autoTable(doc, {
      startY: 32,
      head: [["Date", "Atelier", "Article", "Détails", "Qté", "Prix unit.", "Total"]],
      body: rows,
      foot: [["", "", "TOTAL", "", fmt(grandQty), "", `${fmt(grandTotal)} DH`]],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [80, 80, 80] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
    });

    // Add fournitures section if includeFournitures is checked
    if (includeFournitures && fournitures.length > 0) {
      const workshopIds = [...new Set(entries.map((e) => e.workshopId))];
      const relevantFournitures = fournitures.filter((f) => workshopIds.includes(f.workshopId));
      
      if (relevantFournitures.length > 0) {
        const finalY = (doc as any).lastAutoTable?.finalY || 120;
        doc.setFontSize(14);
        doc.text("FOURNITURES", 14, finalY + 12);

        for (const wsId of workshopIds) {
          const ws = workshopMap.get(wsId);
          const wsFournitures = relevantFournitures.filter((f) => f.workshopId === wsId);
          if (wsFournitures.length === 0) continue;

          const fRows = wsFournitures.map((f) => [
            f.quantity.toString(),
            f.article,
            `${fmt(f.unitPrice)} DH`,
            `${fmt(f.quantity * f.unitPrice)} DH`,
          ]);
          const fTotal = wsFournitures.reduce((s, f) => s + f.quantity * f.unitPrice, 0);

          const startAt = (doc as any).lastAutoTable?.finalY 
            ? (doc as any).lastAutoTable.finalY + 8 
            : finalY + 18;

          doc.setFontSize(11);
          doc.text(`${ws?.name || wsId}`, 14, startAt);

          autoTable(doc, {
            startY: startAt + 4,
            head: [["Quantité", "Article", "Prix Unit.", "Prix Total"]],
            body: fRows,
            foot: [["", "TOTAL", "", `${fmt(fTotal)} DH`]],
            styles: { fontSize: 9 },
            headStyles: { fillColor: [100, 100, 100] },
            footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
          });
        }
      }
    }

    doc.save(`production_${new Date().toISOString().split("T")[0]}.pdf`);
    toast({ title: "PDF généré avec succès" });
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
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Filtrer par atelier..."
            value={workshopFilter}
            onChange={(e) => setWorkshopFilter(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        {WORKSHOPS.map((w) => (
          <Button
            key={w.id}
            size="sm"
            variant={workshopFilter === w.name ? "default" : "outline"}
            className="h-7 text-xs px-2.5"
            onClick={() => setWorkshopFilter(workshopFilter === w.name ? "" : w.name)}
          >
            {w.name}
          </Button>
        ))}
        {workshopFilter && (
          <span className="text-xs text-muted-foreground ml-1">
            {sorted.length} résultat{sorted.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={handlePrintSelected}>
            <Printer className="h-3.5 w-3.5" />
            Imprimer ({selectedIds.size})
          </Button>
          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
            <Checkbox checked={includeFournitures} onCheckedChange={(v) => setIncludeFournitures(!!v)} />
            Inclure fournitures
          </label>
          <span className="text-xs text-muted-foreground">{selectedIds.size} sélectionnée(s)</span>
        </div>
      )}

      {/* Desktop table */}
      <div className="rounded-lg border bg-card overflow-hidden hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="w-10">
                <Checkbox checked={selectedIds.size === sorted.length && sorted.length > 0} onCheckedChange={toggleAll} />
              </TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Atelier</TableHead>
              <TableHead>Article</TableHead>
              <TableHead>Détails</TableHead>
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
              const isSelected = selectedIds.has(entry.id);
              return (
                <TableRow key={entry.id} className={isSelected ? "bg-primary/5" : ""}>
                  <TableCell>
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleId(entry.id)} />
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{new Date(entry.date).toLocaleDateString("fr-FR")}</div>
                    {entry.createdAt && (
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{workshop?.name || "—"}</TableCell>
                  <TableCell>{article?.name || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {[entry.color, entry.size, entry.detail].filter(Boolean).join(" · ") || "—"}
                  </TableCell>
                  <TableCell className="text-right font-display font-semibold">{entry.quantity}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{article ? fmt(article.price) : "—"} DH</TableCell>
                  <TableCell className="text-right font-display font-semibold">{fmt(total)} DH</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700" title="Envoyer par WhatsApp" onClick={() => {
                      const date = new Date(entry.date).toLocaleDateString("fr-FR");
                      const colorLine = entry.color ? `\n🎨 Couleur: ${entry.color}` : "";
                      const detailLine = entry.detail ? `\n📝 Détails: ${entry.detail}` : "";
                      const msg = `📋 *Production du ${date}*\n🏭 Atelier: ${workshop?.name || "—"}\n👕 Article: ${article?.name || "—"}${colorLine}${detailLine}\n📦 Quantité: ${entry.quantity}\n💲 Prix unit.: ${article ? fmt(article.price) : "—"} DH\n💰 Total: ${fmt(total)} DH`;
                      openWhatsApp(msg);
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
          const isSelected = selectedIds.has(entry.id);
          return (
            <div key={entry.id} className={`rounded-lg border bg-card p-3 space-y-2 ${isSelected ? "ring-2 ring-primary/30 bg-primary/5" : ""}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox checked={isSelected} onCheckedChange={() => toggleId(entry.id)} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString("fr-FR")}
                    {entry.createdAt && ` à ${new Date(entry.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={() => {
                    const date = new Date(entry.date).toLocaleDateString("fr-FR");
                    const colorLine = entry.color ? `\n🎨 Couleur: ${entry.color}` : "";
                    const detailLine = entry.detail ? `\n📝 Détails: ${entry.detail}` : "";
                    const msg = `📋 *Production du ${date}*\n🏭 Atelier: ${workshop?.name || "—"}\n👕 Article: ${article?.name || "—"}${colorLine}${detailLine}\n📦 Quantité: ${entry.quantity}\n💲 Prix unit.: ${article ? fmt(article.price) : "—"} DH\n💰 Total: ${fmt(total)} DH`;
                    openWhatsApp(msg);
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
              {[entry.color, entry.size, entry.detail].some(Boolean) && (
                <div className="text-xs text-muted-foreground">
                  {[entry.color, entry.size, entry.detail].filter(Boolean).join(" · ")}
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span>{entry.quantity} {article?.name || "—"}</span>
                <span className="font-display font-semibold">{fmt(total)} DH</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

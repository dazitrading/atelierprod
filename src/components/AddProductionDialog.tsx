import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { WORKSHOPS, type ProductionEntry, type Article } from "@/lib/data";
import { toast } from "@/hooks/use-toast";

const COLORS = [
  "Noir", "Blanc", "Bleu Nuit", "Bleu Ciel", "Rouge", "Bordeaux",
  "Vert", "Kaki", "Gris", "Beige", "Marron", "Rose", "Orange", "Violet", "Crème",
];

interface LineEntry {
  articleId: string;
  quantity: string;
  color: string;
  detail: string;
}

const emptyLine = (): LineEntry => ({ articleId: "", quantity: "", color: "", detail: "" });

interface Props {
  onAdded: () => void;
  addProduction: (entry: Omit<ProductionEntry, "id">) => Promise<void>;
  articles: Article[];
}

export default function AddProductionDialog({ onAdded, addProduction, articles }: Props) {
  const [open, setOpen] = useState(false);
  const [workshopId, setWorkshopId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [lines, setLines] = useState<LineEntry[]>([emptyLine()]);
  const [submitting, setSubmitting] = useState(false);

  const updateLine = (index: number, field: keyof LineEntry, value: string) => {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshopId) {
      toast({ title: "Erreur", description: "Veuillez choisir un atelier.", variant: "destructive" });
      return;
    }
    const validLines = lines.filter((l) => l.articleId && l.quantity && Number(l.quantity) > 0);
    if (validLines.length === 0) {
      toast({ title: "Erreur", description: "Ajoutez au moins une ligne avec article et quantité.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      for (const line of validLines) {
        await addProduction({
          workshopId,
          articleId: line.articleId,
          quantity: Number(line.quantity),
          date,
          color: line.color.trim() || undefined,
          detail: line.detail.trim() || undefined,
        });
      }
      toast({ title: "Production ajoutée", description: `${validLines.length} entrée(s) enregistrée(s).` });

      // Build WhatsApp message with all lines
      const workshopName = WORKSHOPS.find((w) => w.id === workshopId)?.name || "—";
      const dateFormatted = new Date(date).toLocaleDateString("fr-FR");
      let msg = `📋 *Production du ${dateFormatted}*\n🏭 Atelier: ${workshopName}\n\n`;
      let grandTotal = 0;
      for (const line of validLines) {
        const art = articles.find((a) => a.id === line.articleId);
        if (art) {
          const lineTotal = Number(line.quantity) * art.price;
          grandTotal += lineTotal;
          msg += `• ${art.name} | Qté: ${Number(line.quantity)} | Prix: ${art.price.toLocaleString()} DA | Total: ${lineTotal.toLocaleString()} DA`;
          if (line.color.trim()) msg += ` 🎨 ${line.color.trim()}`;
          if (line.detail.trim()) msg += ` 📝 ${line.detail.trim()}`;
          msg += `\n`;
        }
      }
      msg += `\n💰 *Total: ${grandTotal.toLocaleString()} DA*`;
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");

      setWorkshopId("");
      setLines([emptyLine()]);
      setOpen(false);
      onAdded();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Impossible d'enregistrer.";
      console.error("Erreur ajout production:", err);
      toast({ title: "Erreur", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Ajouter production</span>
          <span className="sm:hidden">Ajouter</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Nouvelle entrée de production</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Atelier</Label>
              <Select value={workshopId} onValueChange={setWorkshopId}>
                <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  {WORKSHOPS.map((w) => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Lignes de production</Label>
            <div className="space-y-3">
              {lines.map((line, index) => (
                <div key={index} className="flex items-start gap-2 p-3 rounded-lg border bg-muted/30">
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Select value={line.articleId} onValueChange={(v) => updateLine(index, "articleId", v)}>
                      <SelectTrigger className="text-xs sm:text-sm">
                        <SelectValue placeholder="Article" />
                      </SelectTrigger>
                      <SelectContent>
                        {articles.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground">Aucun article</div>
                        ) : (
                          articles.map((a) => (
                            <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) => updateLine(index, "quantity", e.target.value)}
                      placeholder="Qté"
                      className="text-xs sm:text-sm"
                    />
                    <Select value={line.color} onValueChange={(v) => updateLine(index, "color", v)}>
                      <SelectTrigger className="text-xs sm:text-sm">
                        <SelectValue placeholder="Couleur" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLORS.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={line.detail}
                      onChange={(e) => updateLine(index, "detail", e.target.value)}
                      placeholder="Détails"
                      className="text-xs sm:text-sm"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive mt-0.5"
                    onClick={() => removeLine(index)}
                    disabled={lines.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addLine} className="gap-1.5 mt-1">
              <Plus className="h-3.5 w-3.5" />
              Ajouter une ligne
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Enregistrement..." : `Enregistrer (${lines.filter((l) => l.articleId && l.quantity).length} ligne(s))`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

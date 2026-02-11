import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { WORKSHOPS, type ProductionEntry, type Article } from "@/lib/data";
import { toast } from "@/hooks/use-toast";

interface Props {
  onAdded: () => void;
  addProduction: (entry: Omit<ProductionEntry, "id">) => Promise<void>;
  articles: Article[];
}

export default function AddProductionDialog({ onAdded, addProduction, articles }: Props) {
  const [open, setOpen] = useState(false);
  const [workshopId, setWorkshopId] = useState("");
  const [articleId, setArticleId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [color, setColor] = useState("");
  const [detail, setDetail] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workshopId || !articleId || !quantity || Number(quantity) <= 0) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs.", variant: "destructive" });
      return;
    }
    try {
      await addProduction({ workshopId, articleId, quantity: Number(quantity), date, color: color.trim() || undefined, detail: detail.trim() || undefined });
      toast({ title: "Production ajoutée", description: "L'entrée a été enregistrée avec succès." });
      setWorkshopId("");
      setArticleId("");
      setQuantity("");
      setColor("");
      setDetail("");
      setOpen(false);
      onAdded();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Impossible d'enregistrer.";
      console.error("Erreur ajout production:", err);
      toast({ title: "Erreur", description: message, variant: "destructive" });
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Nouvelle entrée de production</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Atelier</Label>
            <Select value={workshopId} onValueChange={setWorkshopId}>
              <SelectTrigger><SelectValue placeholder="Choisir un atelier" /></SelectTrigger>
              <SelectContent>
                {WORKSHOPS.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Article</Label>
            <Select value={articleId} onValueChange={setArticleId}>
              <SelectTrigger><SelectValue placeholder="Choisir un article" /></SelectTrigger>
              <SelectContent>
                {articles.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Aucun article. Ajoutez-en d'abord.</div>
                ) : (
                  articles.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name} — {a.price.toLocaleString()} DA</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Quantité</Label>
            <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Ex: 50" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label>Couleur</Label>
              <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Ex: Rouge" />
            </div>
            <div className="flex-1 space-y-2">
              <Label>Détails</Label>
              <Input value={detail} onChange={(e) => setDetail(e.target.value)} placeholder="Ex: Taille L" />
            </div>
          </div>
          <Button type="submit" className="w-full">Enregistrer</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Plus, ArrowDownCircle, ArrowUpCircle, Trash2, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { type Article } from "@/lib/data";
import { WORKSHOPS } from "@/lib/data";
import { type StockEntry } from "@/hooks/useStock";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = [
  "Noir", "Blanc", "Bleu Nuit", "Bleu Ciel", "Bleu Roi",
  "Rouge", "Bordeaux", "Vert", "Gris", "Beige", "Marron", "Rose", "Orange",
];
const DESTINATIONS = [
  { id: "dazi", name: "DAZI" },
  { id: "top", name: "TOP" },
  { id: "ecommerce", name: "ECOMMERCE" },
];

interface Props {
  stock: StockEntry[];
  articles: Article[];
  onAddStock: (entry: Omit<StockEntry, "id" | "createdAt">) => Promise<void>;
  onDeleteStock: (id: string) => Promise<void>;
  getStockLevels: () => { articleId: string; workshopId: string; color: string | null; size: string | null; quantity: number }[];
}

export default function StockSection({ stock, articles, onAddStock, onDeleteStock, getStockLevels }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [workshopId, setWorkshopId] = useState("");
  const [articleId, setArticleId] = useState("");
  const [color, setColor] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [size, setSize] = useState("");
  const [customSize, setCustomSize] = useState("");
  const [quantity, setQuantity] = useState("");
  const [movementType, setMovementType] = useState<"in" | "out">("in");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");

  const workshopArticles = movementType === "out" ? articles : articles.filter((a) => a.workshopId === workshopId);
  const articleMap = new Map(articles.map((a) => [a.id, a]));
  const workshopMap = new Map([...WORKSHOPS.map((w) => [w.id, w.name] as [string, string]), ...DESTINATIONS.map((d) => [d.id, d.name] as [string, string]), ["autres", "Autres"]]);

  const levels = getStockLevels();

  const normalizedSearch = searchQuery.toLowerCase().trim();
  const filteredLevels = normalizedSearch
    ? levels.filter((l) => {
        const art = articleMap.get(l.articleId);
        const text = `${art?.name || ""} ${l.color || ""} ${l.size || ""}`.toLowerCase();
        return text.includes(normalizedSearch);
      })
    : levels;
  const filteredStock = normalizedSearch
    ? stock.filter((s) => {
        const art = articleMap.get(s.articleId);
        const text = `${art?.name || ""} ${s.color || ""} ${s.size || ""}`.toLowerCase();
        return text.includes(normalizedSearch);
      })
    : stock;

  const resetForm = () => {
    setWorkshopId("");
    setArticleId("");
    setColor("");
    setCustomColor("");
    setSize("");
    setCustomSize("");
    setQuantity("");
    setMovementType("in");
    setDate(new Date().toISOString().split("T")[0]);
    setNote("");
  };

  const handleSubmit = async () => {
    if (!workshopId || !articleId || !quantity || Number(quantity) <= 0) {
      toast({ title: "Erreur", description: "Remplissez tous les champs obligatoires", variant: "destructive" });
      return;
    }
    const finalColor = color === "__custom" ? customColor : color || null;
    const finalSize = size === "__custom" ? customSize : size || null;

    try {
      await onAddStock({
        workshopId,
        articleId,
        color: finalColor,
        size: finalSize,
        quantity: Number(quantity),
        movementType,
        date,
        note: note || null,
      });
      toast({ title: movementType === "in" ? "Entrée de stock ajoutée" : "Sortie de stock ajoutée" });
      resetForm();
      setOpen(false);
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-lg">Gestion de stock</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Mouvement</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nouveau mouvement de stock</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={movementType === "in" ? "default" : "outline"}
                  className="flex-1 gap-1.5"
                  onClick={() => { setMovementType("in"); setWorkshopId(""); setArticleId(""); }}
                >
                  <ArrowDownCircle className="h-4 w-4" /> Entrée
                </Button>
                <Button
                  type="button"
                  variant={movementType === "out" ? "default" : "outline"}
                  className="flex-1 gap-1.5"
                  onClick={() => { setMovementType("out"); setWorkshopId(""); setArticleId(""); }}
                >
                  <ArrowUpCircle className="h-4 w-4" /> Sortie
                </Button>
              </div>

              <Select value={workshopId} onValueChange={(v) => { setWorkshopId(v); setArticleId(""); }}>
                <SelectTrigger><SelectValue placeholder={movementType === "in" ? "Sources" : "Destination"} /></SelectTrigger>
                <SelectContent>
                  {movementType === "out"
                    ? DESTINATIONS.map((d) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))
                     : <>
                         {WORKSHOPS.map((w) => (
                           <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                         ))}
                         <SelectItem value="autres">Autres</SelectItem>
                       </>
                   }
                </SelectContent>
              </Select>

              <Select value={articleId} onValueChange={setArticleId} disabled={!workshopId}>
                <SelectTrigger><SelectValue placeholder="Article" /></SelectTrigger>
                <SelectContent>
                  {workshopArticles.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={color} onValueChange={setColor}>
                <SelectTrigger><SelectValue placeholder="Couleur (optionnel)" /></SelectTrigger>
                <SelectContent className="max-h-[60vh]">
                  {COLORS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                  <SelectItem value="__custom">Autre...</SelectItem>
                </SelectContent>
              </Select>
              {color === "__custom" && (
                <Input placeholder="Couleur personnalisée" value={customColor} onChange={(e) => setCustomColor(e.target.value)} />
              )}

              <Select value={size} onValueChange={setSize}>
                <SelectTrigger><SelectValue placeholder="Taille (optionnel)" /></SelectTrigger>
                <SelectContent>
                  {SIZES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                  <SelectItem value="__custom">Autre...</SelectItem>
                </SelectContent>
              </Select>
              {size === "__custom" && (
                <Input placeholder="Taille personnalisée" value={customSize} onChange={(e) => setCustomSize(e.target.value)} />
              )}

              <Input type="number" min="1" placeholder="Quantité *" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Input placeholder="Note (optionnel)" value={note} onChange={(e) => setNote(e.target.value)} />

              <Button className="w-full" onClick={handleSubmit}>Enregistrer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par article, couleur, taille..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="levels" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="levels" className="flex-1">État du stock</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="levels">
          {filteredLevels.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun stock enregistré</p>
          ) : (
            <div className="space-y-2">
              {filteredLevels.map((l, i) => {
                const art = articleMap.get(l.articleId);
                return (
                  <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                    <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{art?.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {workshopMap.get(l.workshopId) || l.workshopId}
                        {l.color && ` • ${l.color}`}
                        {l.size && ` • ${l.size}`}
                      </p>
                    </div>
                    <span className={`font-display font-bold text-lg ${l.quantity > 0 ? "text-green-600" : "text-destructive"}`}>
                      {l.quantity}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {filteredStock.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun mouvement</p>
          ) : (
            <div className="space-y-2">
              {filteredStock.map((s) => {
                const art = articleMap.get(s.articleId);
                return (
                  <div key={s.id} className="flex items-center gap-3 rounded-lg border p-3 group">
                    {s.movementType === "in" ? (
                      <ArrowDownCircle className="h-4 w-4 text-green-600 shrink-0" />
                    ) : (
                      <ArrowUpCircle className="h-4 w-4 text-destructive shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{art?.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(s.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        {s.color && ` • ${s.color}`}
                        {s.size && ` • ${s.size}`}
                        {s.note && ` • ${s.note}`}
                      </p>
                    </div>
                    <span className="font-semibold text-sm">{s.movementType === "in" ? "+" : "-"}{s.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      onClick={() => onDeleteStock(s.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Workshop, getWorkshopWeeklyTotal, type ProductionEntry, type Article } from "@/lib/data";
import { Factory, Package, Banknote, ChevronDown, ChevronUp, Pencil, Check, X, Trash2, Send } from "lucide-react";
import { getArticleIcon } from "./UniformIcons";
import { toast } from "@/hooks/use-toast";

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
  onUpdateProduction: (id: string, updates: Partial<Omit<ProductionEntry, "id">>) => Promise<void>;
  onDeleteProduction: (id: string) => Promise<void>;
}

export default function WorkshopCard({ workshop, production, articles, weekStart, weekEnd, onUpdateProduction, onDeleteProduction }: Props) {
  const { totalAmount, totalItems } = getWorkshopWeeklyTotal(
    workshop.id, production, articles, weekStart, weekEnd
  );

  const [expanded, setExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editArticleId, setEditArticleId] = useState("");

  const weekEntries = production
    .filter((e) => e.workshopId === workshop.id && e.date >= weekStart && e.date <= weekEnd)
    .sort((a, b) => b.date.localeCompare(a.date));

  const articleMap = new Map(articles.map((a) => [a.id, a]));

  const startEdit = (entry: ProductionEntry) => {
    setEditingId(entry.id);
    setEditQty(String(entry.quantity));
    setEditArticleId(entry.articleId);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    if (!editQty || Number(editQty) <= 0) {
      toast({ title: "Erreur", description: "La quantité doit être > 0", variant: "destructive" });
      return;
    }
    try {
      await onUpdateProduction(id, { quantity: Number(editQty), articleId: editArticleId });
      setEditingId(null);
      toast({ title: "Entrée modifiée" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteProduction(id);
      toast({ title: "Entrée supprimée" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const sendWhatsApp = () => {
    const weekLabel = `${new Date(weekStart).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} — ${new Date(weekEnd).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;
    let msg = `📋 *Situation ${workshop.name}*\n📅 Semaine: ${weekLabel}\n\n`;
    for (const entry of weekEntries) {
      const art = articleMap.get(entry.articleId);
      if (art) {
        const date = new Date(entry.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
        msg += `• ${date} — ${art.name}: ${entry.quantity} × ${art.price.toLocaleString()} DA = ${(entry.quantity * art.price).toLocaleString()} DA\n`;
      }
    }
    msg += `\n📦 Total articles: ${totalItems}\n💰 Montant total: ${totalAmount.toLocaleString()} DA`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <Card className={`border ${WORKSHOP_COLORS[workshop.id] || ""} animate-fade-in`}>
      <CardContent className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className={`rounded-lg p-2 bg-card ${ICON_COLORS[workshop.id] || ""}`}>
            <Factory className="h-5 w-5" />
          </div>
          <h3 className="font-display font-semibold text-lg flex-1">{workshop.name}</h3>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700" onClick={sendWhatsApp} title="Envoyer par WhatsApp">
              <Send className="h-4 w-4" />
            </Button>
            {weekEntries.length > 0 && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpanded(!expanded)}>
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>
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

        {expanded && weekEntries.length > 0 && (
          <div className="mt-4 border-t pt-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">Détails de la semaine</p>
            {weekEntries.map((entry) => {
              const article = articleMap.get(entry.articleId);
              const isEditing = editingId === entry.id;

              if (isEditing) {
                return (
                  <div key={entry.id} className="flex items-center gap-2 rounded-md bg-secondary/50 p-2">
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(entry.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </span>
                    <Select value={editArticleId} onValueChange={setEditArticleId}>
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {articles.map((a) => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      value={editQty}
                      onChange={(e) => setEditQty(e.target.value)}
                      className="h-8 w-20 text-xs"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => saveEdit(entry.id)}>
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEdit}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              }

              return (
                <div key={entry.id} className="flex items-center gap-2 rounded-md hover:bg-secondary/30 p-2 group">
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(entry.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </span>
                  <span className="text-sm flex-1 flex items-center gap-1.5">
                    {article ? (() => { const Icon = getArticleIcon(article.name); return <Icon size={16} className="text-muted-foreground shrink-0" />; })() : null}
                    {article?.name || "—"}
                  </span>
                  <span className="text-sm font-semibold">{entry.quantity}</span>
                  <span className="text-xs text-muted-foreground">× {article?.price.toLocaleString()} DA</span>
                  <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex gap-0.5 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700" onClick={() => {
                      const date = new Date(entry.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
                      let msg = `📋 *${workshop.name}*\n📅 ${date}\n\n• ${article?.name}: ${entry.quantity} × ${article?.price?.toLocaleString()} DA = ${(entry.quantity * (article?.price || 0)).toLocaleString()} DA`;
                      if (entry.color) msg += `\n🎨 Couleur: ${entry.color}`;
                      if (entry.detail) msg += `\n📝 Détails: ${entry.detail}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
                    }} title="Envoyer par WhatsApp">
                      <Send className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(entry)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

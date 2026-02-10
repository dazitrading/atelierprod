import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Plus, Trash2 } from "lucide-react";
import { getArticles, addArticle, deleteArticle, type Article } from "@/lib/data";
import { toast } from "@/hooks/use-toast";

interface Props {
  onChanged: () => void;
}

export default function ArticleManager({ onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [color, setColor] = useState("");
  const [detail, setDetail] = useState("");
  const [articles, setArticles] = useState<Article[]>(getArticles);

  const refresh = () => {
    setArticles(getArticles());
    onChanged();
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || Number(price) <= 0) {
      toast({ title: "Erreur", description: "Nom et prix requis.", variant: "destructive" });
      return;
    }
    addArticle({ name: name.trim(), price: Number(price), color: color.trim() || undefined, detail: detail.trim() || undefined });
    setName("");
    setPrice("");
    setColor("");
    setDetail("");
    refresh();
    toast({ title: "Article ajouté" });
  };

  const handleDelete = (id: string) => {
    deleteArticle(id);
    refresh();
    toast({ title: "Article supprimé" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Articles
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Gérer les articles</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAdd} className="space-y-2 pt-2">
          <div className="flex gap-2">
            <Input placeholder="Nom de l'article" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
            <Input type="number" placeholder="Prix" value={price} onChange={(e) => setPrice(e.target.value)} className="w-24" />
          </div>
          <div className="flex gap-2">
            <Input placeholder="Couleur" value={color} onChange={(e) => setColor(e.target.value)} className="flex-1" />
            <Input placeholder="Autre détail" value={detail} onChange={(e) => setDetail(e.target.value)} className="flex-1" />
            <Button type="submit" size="icon"><Plus className="h-4 w-4" /></Button>
          </div>
        </form>
        <div className="mt-2 max-h-60 space-y-1 overflow-y-auto">
          {articles.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">Aucun article configuré</p>
          )}
          {articles.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{a.name}</span>
                {(a.color || a.detail) && (
                  <span className="text-xs text-muted-foreground">
                    {[a.color, a.detail].filter(Boolean).join(" · ")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{a.price.toLocaleString()} DA</span>
                <button onClick={() => handleDelete(a.id)} className="text-destructive hover:text-destructive/80 transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

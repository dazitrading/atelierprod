import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Article } from "@/lib/data";

interface Props {
  articles: Article[];
  onAdd: (article: Omit<Article, "id">) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Omit<Article, "id">>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ArticleManager({ articles, onAdd, onUpdate, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || Number(price) <= 0) {
      toast({ title: "Erreur", description: "Nom et prix requis.", variant: "destructive" });
      return;
    }
    try {
      await onAdd({ name: name.trim(), price: Number(price) });
      setName("");
      setPrice("");
      toast({ title: "Article ajouté" });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'ajouter l'article.", variant: "destructive" });
    }
  };

  const startEdit = (article: Article) => {
    setEditingId(article.id);
    setEditName(article.name);
    setEditPrice(String(article.price));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditPrice("");
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim() || !editPrice || Number(editPrice) <= 0) {
      toast({ title: "Erreur", description: "Nom et prix requis.", variant: "destructive" });
      return;
    }
    try {
      await onUpdate(id, { name: editName.trim(), price: Number(editPrice) });
      cancelEdit();
      toast({ title: "Article modifié" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de modifier l'article.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
      toast({ title: "Article supprimé" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer l'article.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
          <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Articles</span>
          <span className="sm:hidden">Art.</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Gérer les articles</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAdd} className="flex gap-2 pt-2">
          <Input placeholder="Nom de l'article" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
          <Input type="number" placeholder="Prix" value={price} onChange={(e) => setPrice(e.target.value)} className="w-24" />
          <Button type="submit" size="icon"><Plus className="h-4 w-4" /></Button>
        </form>
        <div className="mt-2 max-h-60 space-y-1 overflow-y-auto">
          {articles.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">Aucun article configuré</p>
          )}
          {articles.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2 gap-2">
              {editingId === a.id ? (
                <>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 h-8 text-sm"
                  />
                  <Input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-20 h-8 text-sm"
                  />
                  <button onClick={() => handleUpdate(a.id)} className="text-primary hover:text-primary/80 transition-colors">
                    <Check className="h-4 w-4" />
                  </button>
                  <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium flex-1">{a.name}</span>
                  <span className="text-sm text-muted-foreground">{a.price.toLocaleString()} DA</span>
                  <button onClick={() => startEdit(a)} className="text-muted-foreground hover:text-primary transition-colors">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="text-destructive hover:text-destructive/80 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

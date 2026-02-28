import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Plus, Trash2, Pencil, Check, X, Copy, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { WORKSHOPS, type Article } from "@/lib/data";

interface Props {
  articles: Article[];
  workshopId: string;
  workshopName: string;
  onAdd: (article: Omit<Article, "id">) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Omit<Article, "id">>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function ArticleManager({ articles, workshopId, workshopName, onAdd, onUpdate, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [dupWorkshopId, setDupWorkshopId] = useState("");
  const [dupPrice, setDupPrice] = useState("");
  const [search, setSearch] = useState("");

  const workshopArticles = articles
    .filter((a) => a.workshopId === workshopId)
    .filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));
  const otherWorkshops = WORKSHOPS.filter((w) => w.id !== workshopId);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || Number(price) <= 0) {
      toast({ title: "Erreur", description: "Nom et prix requis.", variant: "destructive" });
      return;
    }
    try {
      await onAdd({ name: name.trim(), price: Number(price), workshopId });
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
    setDuplicatingId(null);
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

  const startDuplicate = (article: Article) => {
    setDuplicatingId(article.id);
    setDupWorkshopId("");
    setDupPrice(String(article.price));
    setEditingId(null);
  };

  const cancelDuplicate = () => {
    setDuplicatingId(null);
    setDupWorkshopId("");
    setDupPrice("");
  };

  const handleDuplicate = async (article: Article) => {
    if (!dupWorkshopId) {
      toast({ title: "Erreur", description: "Choisissez un atelier.", variant: "destructive" });
      return;
    }
    if (!dupPrice || Number(dupPrice) <= 0) {
      toast({ title: "Erreur", description: "Prix requis.", variant: "destructive" });
      return;
    }
    try {
      await onAdd({ name: article.name, price: Number(dupPrice), workshopId: dupWorkshopId });
      const targetName = WORKSHOPS.find((w) => w.id === dupWorkshopId)?.name;
      cancelDuplicate();
      toast({ title: "Article dupliqué", description: `${article.name} ajouté à ${targetName}` });
    } catch {
      toast({ title: "Erreur", description: "Impossible de dupliquer.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title={`Articles ${workshopName}`}>
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Articles — {workshopName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAdd} className="flex gap-2 pt-2">
          <Input placeholder="Nom de l'article" value={name} onChange={(e) => setName(e.target.value)} className="flex-1" />
          <Input type="number" placeholder="Prix" value={price} onChange={(e) => setPrice(e.target.value)} className="w-24" />
          <Button type="submit" size="icon"><Plus className="h-4 w-4" /></Button>
        </form>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher un article..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="mt-2 max-h-72 space-y-1 overflow-y-auto">
          <p className="text-xs text-muted-foreground px-1 pb-1">{workshopArticles.length} article{workshopArticles.length !== 1 ? 's' : ''}</p>
          {workshopArticles.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">Aucun article trouvé</p>
          )}
          {workshopArticles.map((a) => (
            <div key={a.id} className="space-y-1">
              <div className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2 gap-2">
                {editingId === a.id ? (
                  <>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="flex-1 h-8 text-sm" />
                    <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-20 h-8 text-sm" />
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
                    <span className="text-sm text-muted-foreground">{new Intl.NumberFormat("fr-FR").format(a.price).replace(/\u202F/g, ' ')} DH</span>
                    <button onClick={() => startDuplicate(a)} className="text-muted-foreground hover:text-primary transition-colors" title="Dupliquer vers un autre atelier">
                      <Copy className="h-4 w-4" />
                    </button>
                    <button onClick={() => startEdit(a)} className="text-muted-foreground hover:text-primary transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(a.id)} className="text-destructive hover:text-destructive/80 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
              {duplicatingId === a.id && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/5 border border-primary/20">
                  <Select value={dupWorkshopId} onValueChange={setDupWorkshopId}>
                    <SelectTrigger className="h-8 text-xs flex-1">
                      <SelectValue placeholder="Atelier cible" />
                    </SelectTrigger>
                    <SelectContent>
                      {otherWorkshops.map((w) => (
                        <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={dupPrice}
                    onChange={(e) => setDupPrice(e.target.value)}
                    placeholder="Prix"
                    className="w-20 h-8 text-xs"
                  />
                  <button onClick={() => handleDuplicate(a)} className="text-primary hover:text-primary/80 transition-colors">
                    <Check className="h-4 w-4" />
                  </button>
                  <button onClick={cancelDuplicate} className="text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

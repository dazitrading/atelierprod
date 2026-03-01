import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { type Fourniture } from "@/hooks/useFournitures";
import { toast } from "@/hooks/use-toast";

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n).replace(/\u202F/g, ' ');

interface Props {
  workshopId: string;
  workshopName: string;
  fournitures: Fourniture[];
  onAdd: (f: Omit<Fourniture, "id">) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Omit<Fourniture, "id">>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function FournituresSection({ workshopId, workshopName, fournitures, onAdd, onUpdate, onDelete }: Props) {
  const items = fournitures.filter((f) => f.workshopId === workshopId);
  const [adding, setAdding] = useState(false);
  const [newArticle, setNewArticle] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editArticle, setEditArticle] = useState("");
  const [editQty, setEditQty] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const total = items.reduce((s, f) => s + f.quantity * f.unitPrice, 0);

  const handleAdd = async () => {
    if (!newArticle || !newQty || !newPrice) {
      toast({ title: "Remplir tous les champs", variant: "destructive" });
      return;
    }
    try {
      await onAdd({ workshopId, article: newArticle, quantity: Number(newQty), unitPrice: Number(newPrice) });
      setNewArticle(""); setNewQty(""); setNewPrice(""); setAdding(false);
      toast({ title: "Fourniture ajoutée" });
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const startEdit = (f: Fourniture) => {
    setEditId(f.id);
    setEditArticle(f.article);
    setEditQty(String(f.quantity));
    setEditPrice(String(f.unitPrice));
  };

  const saveEdit = async () => {
    if (!editId) return;
    try {
      await onUpdate(editId, { article: editArticle, quantity: Number(editQty), unitPrice: Number(editPrice) });
      setEditId(null);
      toast({ title: "Fourniture modifiée" });
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDelete(id);
      toast({ title: "Fourniture supprimée" });
    } catch { toast({ title: "Erreur", variant: "destructive" }); }
  };

  return (
    <div className="mt-4 border-t pt-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground">FOURNITURES</p>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setAdding(!adding)}>
          <Plus className="h-3 w-3" /> Ajouter
        </Button>
      </div>

      {adding && (
        <div className="flex flex-wrap items-center gap-2 mb-3 p-2 rounded-md bg-secondary/30">
          <Input placeholder="Article" value={newArticle} onChange={(e) => setNewArticle(e.target.value)} className="h-8 text-xs flex-1 min-w-[100px]" />
          <Input type="number" placeholder="Qté" value={newQty} onChange={(e) => setNewQty(e.target.value)} className="h-8 text-xs w-16" />
          <Input type="number" placeholder="Prix U." value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="h-8 text-xs w-20" />
          <Button size="sm" className="h-8 text-xs" onClick={handleAdd}>OK</Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setAdding(false)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">Aucune fourniture</p>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden sm:block rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead className="text-xs h-8">Quantité</TableHead>
                  <TableHead className="text-xs h-8">Article</TableHead>
                  <TableHead className="text-xs h-8 text-right">Prix Unit.</TableHead>
                  <TableHead className="text-xs h-8 text-right">Prix Total</TableHead>
                  <TableHead className="text-xs h-8 w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((f) => {
                  if (editId === f.id) {
                    return (
                      <TableRow key={f.id}>
                        <TableCell className="p-1"><Input type="number" value={editQty} onChange={(e) => setEditQty(e.target.value)} className="h-7 text-xs w-16" /></TableCell>
                        <TableCell className="p-1"><Input value={editArticle} onChange={(e) => setEditArticle(e.target.value)} className="h-7 text-xs" /></TableCell>
                        <TableCell className="p-1"><Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="h-7 text-xs w-20" /></TableCell>
                        <TableCell className="p-1 text-right text-xs font-semibold">{fmt(Number(editQty) * Number(editPrice))} DH</TableCell>
                        <TableCell className="p-1">
                          <div className="flex gap-0.5">
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" onClick={saveEdit}><Check className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditId(null)}><X className="h-3 w-3" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  }
                  return (
                    <TableRow key={f.id} className="group">
                      <TableCell className="text-xs p-2">{f.quantity}</TableCell>
                      <TableCell className="text-xs p-2">{f.article}</TableCell>
                      <TableCell className="text-xs p-2 text-right">{fmt(f.unitPrice)} DH</TableCell>
                      <TableCell className="text-xs p-2 text-right font-semibold">{fmt(f.quantity * f.unitPrice)} DH</TableCell>
                      <TableCell className="p-1">
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(f)}><Pencil className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(f.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile */}
          <div className="sm:hidden space-y-2">
            {items.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/20 text-xs">
                <div>
                  <span className="font-medium">{f.article}</span>
                  <span className="text-muted-foreground ml-2">×{f.quantity} à {fmt(f.unitPrice)} DH</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{fmt(f.quantity * f.unitPrice)} DH</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(f)}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(f.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-2">
            <span className="text-xs font-semibold">Total fournitures: {fmt(total)} DH</span>
          </div>
        </>
      )}
    </div>
  );
}

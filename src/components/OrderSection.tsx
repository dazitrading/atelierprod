import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, ClipboardList, Download, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { type Article } from "@/lib/data";
import { type Order } from "@/hooks/useOrders";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { openWhatsApp } from "@/lib/whatsapp";

const COLORS = [
  "Noir", "Blanc", "Bleu Nuit", "Bleu Ciel", "Bleu Roi", "Rouge", "Bordeaux",
  "Vert", "Gris", "Beige", "Marron", "Rose", "Orange",
];

interface Props {
  workshopId: string;
  workshopName: string;
  articles: Article[];
  orders: Order[];
  onAddOrder: (order: Omit<Order, "id" | "createdAt">) => Promise<void>;
  onDeleteOrder: (id: string) => Promise<void>;
}

export default function OrderSection({ workshopId, workshopName, articles, orders, onAddOrder, onDeleteOrder }: Props) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [articleId, setArticleId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [color, setColor] = useState("");
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const workshopArticles = articles.filter((a) => a.workshopId === workshopId);
  const workshopOrders = orders.filter((o) => o.workshopId === workshopId);
  const articleMap = new Map(workshopArticles.map((a) => [a.id, a]));

  const handleAdd = async () => {
    if (!articleId || !quantity || Number(quantity) <= 0) {
      toast({ title: "Erreur", description: "Remplissez article et quantité.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await onAddOrder({
        workshopId,
        articleId,
        quantity: Number(quantity),
        color: color || null,
        detail: detail || null,
        date,
      });
      setArticleId("");
      setQuantity("");
      setColor("");
      setDetail("");
      toast({ title: "Commande ajoutée" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteOrder(id);
      toast({ title: "Commande supprimée" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Bon de commande — ${workshopName}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 14, 28);

    const rows = workshopOrders.map((order) => {
      const art = articleMap.get(order.articleId);
      return [
        new Date(order.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
        art?.name || "—",
        String(order.quantity),
        order.color || "—",
        order.detail || "—",
      ];
    });

    autoTable(doc, {
      startY: 34,
      head: [["Date", "Article", "Quantité", "Couleur", "Détails"]],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 37, 36] },
    });

    doc.save(`bon-commande-${workshopName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
    toast({ title: "PDF téléchargé" });
  };

  const handleShareWhatsApp = () => {
    const lines = workshopOrders.map((order) => {
      const art = articleMap.get(order.articleId);
      const dateFmt = new Date(order.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
      const parts = [
        `📦 ${art?.name || "—"}`,
        `× ${order.quantity}`,
        order.color || "",
        order.detail || "",
      ].filter(Boolean);
      return `${dateFmt} — ${parts.join(" | ")}`;
    });

    const message = `📋 *Bon de commande — ${workshopName}*\n${new Date().toLocaleDateString("fr-FR")}\n\n${lines.join("\n")}`;
    openWhatsApp(message);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Bon de commande">
          <ClipboardList className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-display">Bon de commande — {workshopName}</DialogTitle>
            {workshopOrders.length > 0 && (
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" onClick={handleShareWhatsApp} className="gap-1.5">
                  <Send className="h-3.5 w-3.5" />
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Add new order row */}
        <div className="flex flex-wrap items-end gap-2 p-3 rounded-lg border bg-muted/30">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 w-36 text-xs" />
          </div>
          <div className="space-y-1 flex-1 min-w-[120px]">
            <label className="text-xs font-medium text-muted-foreground">Article</label>
            <Select value={articleId} onValueChange={setArticleId}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Choisir" /></SelectTrigger>
              <SelectContent>
                {workshopArticles.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 w-20">
            <label className="text-xs font-medium text-muted-foreground">Quantité</label>
            <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="h-9 text-xs" placeholder="Qté" />
          </div>
          <div className="space-y-1 min-w-[110px]">
            <label className="text-xs font-medium text-muted-foreground">Couleur</label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Couleur" /></SelectTrigger>
              <SelectContent position="popper" side="bottom" className="max-h-[60vh]">
                {COLORS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 flex-1 min-w-[120px]">
            <label className="text-xs font-medium text-muted-foreground">Détails</label>
            <Input value={detail} onChange={(e) => setDetail(e.target.value)} className="h-9 text-xs" placeholder="Détails…" />
          </div>
          <Button size="sm" onClick={handleAdd} disabled={submitting} className="h-9 gap-1">
            <Plus className="h-3.5 w-3.5" />
            Ajouter
          </Button>
        </div>

        {/* Orders table */}
        {workshopOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucune commande pour cet atelier.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Article</TableHead>
                <TableHead className="text-xs text-right">Quantité</TableHead>
                <TableHead className="text-xs">Couleur</TableHead>
                <TableHead className="text-xs">Détails</TableHead>
                <TableHead className="text-xs w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workshopOrders.map((order) => {
                const art = articleMap.get(order.articleId);
                return (
                  <TableRow key={order.id}>
                    <TableCell className="text-xs">
                      {new Date(order.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{art?.name || "—"}</TableCell>
                    <TableCell className="text-xs text-right font-semibold">{order.quantity}</TableCell>
                    <TableCell className="text-xs">{order.color || "—"}</TableCell>
                    <TableCell className="text-xs">{order.detail || "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(order.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}

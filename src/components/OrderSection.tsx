import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, ClipboardList, Download, Send, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [orderNumber, setOrderNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedBCs, setSelectedBCs] = useState<Set<string>>(new Set());
  const workshopArticles = articles.filter((a) => a.workshopId === workshopId);
  const workshopOrders = orders.filter((o) => o.workshopId === workshopId);
  const articleMap = new Map(workshopArticles.map((a) => [a.id, a]));

  // Unique BC numbers for selection
  const uniqueBCNumbers = useMemo(() => {
    const nums = [...new Set(workshopOrders.map((o) => o.orderNumber).filter(Boolean))] as string[];
    return nums.sort((a, b) => parseInt(a) - parseInt(b));
  }, [workshopOrders]);

  const toggleBC = (bc: string) => {
    setSelectedBCs((prev) => {
      const next = new Set(prev);
      if (next.has(bc)) next.delete(bc);
      else next.add(bc);
      return next;
    });
  };

  const toggleAllBCs = () => {
    if (selectedBCs.size === uniqueBCNumbers.length) {
      setSelectedBCs(new Set());
    } else {
      setSelectedBCs(new Set(uniqueBCNumbers));
    }
  };
  // Auto-compute next order number
  const getNextOrderNumber = () => {
    const nums = workshopOrders
      .map((o) => parseInt(o.orderNumber || "0", 10))
      .filter((n) => !isNaN(n));
    return String((nums.length > 0 ? Math.max(...nums) : 0) + 1);
  };

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (v) setOrderNumber(getNextOrderNumber());
  };

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
        orderNumber: orderNumber || null,
        date,
      });
      setArticleId("");
      setQuantity("");
      setColor("");
      setDetail("");
      setOrderNumber(String(Number(orderNumber || "0") + 1));
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

  const handleDownloadPDF = (filteredOrders?: Order[]) => {
    const ordersToExport = filteredOrders || workshopOrders;
    const doc = new jsPDF();
    doc.setFontSize(16);
    const bcLabel = filteredOrders
      ? `Bon de commande N° ${[...selectedBCs].sort((a, b) => parseInt(a) - parseInt(b)).join(", ")} — ${workshopName}`
      : `Bon de commande — ${workshopName}`;
    doc.text(bcLabel, 14, 20);
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, 14, 28);

    const rows = ordersToExport.map((order) => {
      const art = articleMap.get(order.articleId);
      return [
        order.orderNumber || "—",
        new Date(order.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
        art?.name || "—",
        String(order.quantity),
        order.color || "—",
        order.detail || "—",
      ];
    });

    autoTable(doc, {
      startY: 34,
      head: [["BC N°", "Date", "Article", "Quantité", "Couleur", "Détails"]],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 37, 36] },
    });

    doc.save(`bon-commande-${workshopName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
    toast({ title: "PDF téléchargé" });
  };

  const handlePrintSelectedPDF = () => {
    if (selectedBCs.size === 0) {
      toast({ title: "Sélectionnez au moins un BC N°", variant: "destructive" });
      return;
    }
    const filtered = workshopOrders.filter((o) => o.orderNumber && selectedBCs.has(o.orderNumber));
    handleDownloadPDF(filtered);
  };

  const handleShareWhatsApp = () => {
    const lines = workshopOrders.map((order) => {
      const art = articleMap.get(order.articleId);
      const dateFmt = new Date(order.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
      const bcLabel = order.orderNumber ? `BC ${order.orderNumber}` : "";
      const parts = [
        bcLabel,
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
                {selectedBCs.size > 0 && (
                  <Button variant="default" size="sm" onClick={handlePrintSelectedPDF} className="gap-1.5">
                    <Printer className="h-3.5 w-3.5" />
                    Imprimer BC ({selectedBCs.size})
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleShareWhatsApp} className="gap-1.5">
                  <Send className="h-3.5 w-3.5" />
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDownloadPDF()} className="gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Add new order row */}
        <div className="flex flex-wrap items-end gap-2 p-3 rounded-lg border bg-muted/30">
          <div className="space-y-1 w-20">
            <label className="text-xs font-medium text-muted-foreground">BC N°</label>
            <Input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="h-9 text-xs" placeholder="N°" />
          </div>
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
                <TableHead className="text-xs w-10">
                  <Checkbox
                    checked={uniqueBCNumbers.length > 0 && selectedBCs.size === uniqueBCNumbers.length}
                    onCheckedChange={toggleAllBCs}
                  />
                </TableHead>
                <TableHead className="text-xs">BC N°</TableHead>
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
                  <TableRow key={order.id} className={order.orderNumber && selectedBCs.has(order.orderNumber) ? "bg-primary/5" : ""}>
                    <TableCell>
                      {order.orderNumber ? (
                        <Checkbox
                          checked={selectedBCs.has(order.orderNumber)}
                          onCheckedChange={() => toggleBC(order.orderNumber!)}
                        />
                      ) : null}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{order.orderNumber || "—"}</TableCell>
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

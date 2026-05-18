import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ScanLine,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Receipt,
  X,
  PackagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import {
  type Product,
  type Sale,
  type SaleItem,
  findProductByBarcode,
  getAllProducts,
  newId,
  saveSale,
} from "@/lib/db";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function POSPage() {
  const { t, formatPrice } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickPrice, setQuickPrice] = useState("");
  const [quickCost, setQuickCost] = useState("");
  const [quickQty, setQuickQty] = useState("1");

  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<"cash" | "card" | "credit" | "other">("cash");
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const refresh = async () => setProducts(await getAllProducts());
  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products.slice(0, 8);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.barcode ?? "").toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [products, search]);

  const [searchFocused, setSearchFocused] = useState(false);
  const showDropdown = searchFocused || search.length > 0;

  const addToCart = (p: Product) => {
    if (p.quantity <= 0) {
      toast.error(t.inventory.outOfStock);
      return;
    }
    setCart((c) => {
      const existing = c.find((i) => i.productId === p.id);
      if (existing) {
        if (existing.quantity >= p.quantity) {
          toast.warning(t.pos.stockWarning);
          return c;
        }
        return c.map((i) =>
          i.productId === p.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...c,
        {
          productId: p.id,
          name: p.name,
          unitPrice: p.salePrice,
          purchasePrice: p.purchasePrice,
          quantity: 1,
        },
      ];
    });
    setSearch("");
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  const handleScanned = async (code: string) => {
    const p = await findProductByBarcode(code);
    if (!p) {
      toast.error(t.pos.notFound);
      return;
    }
    addToCart(p);
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((c) =>
      c
        .map((i) => {
          if (i.productId !== productId) return i;
          const prod = products.find((p) => p.id === productId);
          if (prod) {
            const next = i.quantity + delta;
            if (next > prod.quantity) {
              toast.warning(t.pos.stockWarning);
              return i;
            }
            return { ...i, quantity: next };
          }
          // manual line — no stock cap
          return { ...i, quantity: i.quantity + delta };
        })
        .filter((i) => i.quantity > 0),
    );
  };

  const removeItem = (productId: string) =>
    setCart((c) => c.filter((i) => i.productId !== productId));

  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const total = Math.max(0, subtotal - discount);
  const profit =
    cart.reduce(
      (s, i) => s + (i.unitPrice - i.purchasePrice) * i.quantity,
      0,
    ) - discount;

  // Sync paid amount with payment method changes
  useEffect(() => {
    if (paymentMethod === "credit") setPaidAmount("0");
    else setPaidAmount(String(total));
  }, [paymentMethod, total]);

  const paidNum = Math.max(0, Math.min(total, Number(paidAmount) || 0));
  const dueNum = Math.max(0, total - paidNum);

  const submitQuick = () => {
    const name = quickName.trim();
    const price = Number(quickPrice) || 0;
    const cost = Number(quickCost) || 0;
    const qty = Math.max(1, Number(quickQty) || 1);
    if (!name || price <= 0) {
      toast.error(t.form.required);
      return;
    }
    const lineId = "manual-" + newId();
    setCart((c) => [
      ...c,
      { productId: lineId, name, unitPrice: price, purchasePrice: cost, quantity: qty },
    ]);
    setQuickName("");
    setQuickPrice("");
    setQuickCost("");
    setQuickQty("1");
    setQuickOpen(false);
  };

  const checkout = async () => {
    if (cart.length === 0) return;
    if (paymentMethod === "credit" && !customerName.trim()) {
      toast.error(t.pos.customerName);
      return;
    }
    const debtId = dueNum > 0 ? "debt-" + newId() : undefined;
    const sale: Sale = {
      id: newId(),
      items: cart,
      subtotal,
      discount,
      total,
      profit,
      paymentMethod,
      currency: "DZD",
      exchangeRate: 1,
      customerName: customerName.trim() || undefined,
      paidAmount: paidNum,
      dueAmount: dueNum,
      debtId,
      createdAt: Date.now(),
    };
    await saveSale(sale);
    toast.success(t.pos.saleSuccess);
    setLastSale(sale);
    setReceiptOpen(true);
    setCart([]);
    setDiscount(0);
    setCustomerName("");
    setPaymentMethod("cash");
    refresh();
  };

  return (
    <div className="px-4 py-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gold" />
          {t.pos.title}
        </h2>
        {cart.length > 0 && (
          <Button variant="gold" size="sm" onClick={checkout} className="gap-1.5 font-bold shadow-gold">
            <Receipt className="w-4 h-4" />
            {t.pos.pay}
            <Badge variant="secondary" className="ms-1 bg-black/20 text-white text-xs">
              {formatPrice(total)}
            </Badge>
          </Button>
        )}
      </div>

      {/* Search + Scan + Quick add */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => { setSearchFocused(true); refresh(); }}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            placeholder={t.pos.search}
            className="ps-10 h-11"
            autoComplete="off"
            inputMode="search"
          />
          {showDropdown && filtered.length > 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border bg-popover shadow-lg overflow-hidden max-h-72 overflow-y-auto">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => addToCart(p)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-accent/30 text-start"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ×{p.quantity} · {p.barcode || "—"}
                    </p>
                  </div>
                  <span className="text-gold font-bold text-xs ms-2">
                    {formatPrice(p.salePrice)}
                  </span>
                </button>
              ))}
            </div>
          )}
          {showDropdown && filtered.length === 0 && (
            <div className="absolute z-20 mt-1 w-full rounded-lg border bg-popover shadow-lg p-3 text-xs text-muted-foreground text-center">
              {search ? t.pos.notFound : t.pos.emptyHint}
            </div>
          )}
        </div>
        <Button variant="gold" onClick={() => setScanOpen(true)} className="shrink-0 h-11 w-11 p-0" aria-label={t.scanner.title}>
          <ScanLine className="w-4 h-4" />
        </Button>
        <Button variant="outline" onClick={() => setQuickOpen(true)} className="shrink-0 h-11 w-11 p-0" aria-label={t.pos.quickAdd}>
          <PackagePlus className="w-4 h-4" />
        </Button>
      </div>

      {/* Cart */}
      <div className="rounded-xl border bg-card shadow-elegant overflow-hidden">
        <div className="px-4 py-2.5 border-b flex items-center justify-between">
          <span className="text-sm font-semibold">{t.pos.cart}</span>
          <Badge variant="secondary">{cart.length}</Badge>
        </div>
        {cart.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingCart className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="font-medium">{t.pos.emptyCart}</p>
            <p className="text-xs text-muted-foreground">{t.pos.emptyHint}</p>
          </div>
        ) : (
          <div className="divide-y">
            <AnimatePresence initial={false}>
              {cart.map((item) => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="p-3 flex items-center gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatPrice(item.unitPrice)} ×{item.quantity} ={" "}
                      <span className="text-gold font-semibold">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(item.productId, -1)}>
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(item.productId, 1)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.productId)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="rounded-xl border bg-card shadow-elegant p-4 space-y-3">
          <div>
            <Label className="text-xs">{t.pos.customerName}</Label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">{t.pos.discount}</Label>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">{t.pos.paymentMethod}</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "cash" | "card" | "credit" | "other")}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{t.pos.cash}</SelectItem>
                  <SelectItem value="card">{t.pos.card}</SelectItem>
                  <SelectItem value="credit">{t.pos.credit}</SelectItem>
                  <SelectItem value="other">{t.pos.other}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(paymentMethod === "credit" || paidNum < total) && (
            <div>
              <Label className="text-xs">{t.pos.paidAmount}</Label>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                max={total}
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="mt-1"
              />
              {dueNum > 0 && (
                <p className="text-[11px] text-warning mt-1">
                  {t.pos.dueAmount}: <span className="font-bold">{formatPrice(dueNum)}</span> — {t.pos.creditWarning}
                </p>
              )}
            </div>
          )}

          <div className="pt-2 border-t space-y-1 text-sm">
            <Row label={t.pos.subtotal} value={formatPrice(subtotal)} />
            {discount > 0 && <Row label={t.pos.discount} value={`- ${formatPrice(discount)}`} muted />}
            <Row label={t.pos.total} value={formatPrice(total)} emphasized />
            {dueNum > 0 && <Row label={t.pos.dueAmount} value={formatPrice(dueNum)} muted />}
          </div>

          <Button variant="gold" size="lg" className="w-full" onClick={checkout}>
            <Receipt className="w-4 h-4" />
            {t.pos.pay}
          </Button>
        </div>
      )}

      <BarcodeScanner open={scanOpen} onOpenChange={setScanOpen} onDetected={handleScanned} />

      {/* Quick add manual line */}
      <Dialog open={quickOpen} onOpenChange={setQuickOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.pos.quickAddTitle}</DialogTitle>
            <DialogDescription className="text-xs">{t.pos.quickAddHint}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">{t.pos.itemName}</Label>
              <Input value={quickName} onChange={(e) => setQuickName(e.target.value)} className="mt-1" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">{t.form.salePrice}</Label>
                <Input type="number" inputMode="decimal" value={quickPrice} onChange={(e) => setQuickPrice(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">{t.form.purchasePrice}</Label>
                <Input type="number" inputMode="decimal" value={quickCost} onChange={(e) => setQuickCost(e.target.value)} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs">{t.form.quantity}</Label>
              <Input type="number" inputMode="numeric" min="1" value={quickQty} onChange={(e) => setQuickQty(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setQuickOpen(false)}>{t.form.cancel}</Button>
            <Button variant="gold" onClick={submitQuick}>
              <Plus className="w-4 h-4" />
              {t.form.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.pos.saleSuccess}</DialogTitle>
          </DialogHeader>
          {lastSale && (
            <div className="space-y-2 text-sm">
              <Row label={t.pos.invoiceNo} value={lastSale.id.slice(-8).toUpperCase()} />
              <Row label={t.pos.total} value={formatPrice(lastSale.total)} emphasized />
              {lastSale.dueAmount > 0 && (
                <Row label={t.pos.dueAmount} value={formatPrice(lastSale.dueAmount)} muted />
              )}
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="gold" onClick={() => setReceiptOpen(false)} className="w-full">
              <X className="w-4 h-4" />
              {t.form.cancel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value, emphasized, muted }: { label: string; value: string; emphasized?: boolean; muted?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between", emphasized && "text-base pt-1", muted && "text-muted-foreground")}>
      <span>{label}</span>
      <span className={cn("font-semibold", emphasized && "text-gold text-lg font-bold")}>{value}</span>
    </div>
  );
}

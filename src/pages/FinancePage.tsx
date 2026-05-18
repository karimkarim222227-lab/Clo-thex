import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Plus,
  Trash2,
  HandCoins,
  Receipt,
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import {
  type Debt,
  type DebtType,
  type Expense,
  deleteDebt,
  deleteExpense,
  getAllDebts,
  getAllExpenses,
  newId,
  saveDebt,
  saveExpense,
} from "@/lib/db";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EXPENSE_CATEGORIES = ["rent", "salaries", "utilities", "supplies", "transport", "marketing", "other"] as const;

export function FinancePage() {
  const { t, formatPrice, lang } = useApp();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [debtOpen, setDebtOpen] = useState(false);
  const [debtType, setDebtType] = useState<DebtType>("receivable");
  const [debtParty, setDebtParty] = useState("");
  const [debtAmount, setDebtAmount] = useState("");
  const [debtNotes, setDebtNotes] = useState("");
  const [debtDue, setDebtDue] = useState("");

  const [payOpen, setPayOpen] = useState<Debt | null>(null);
  const [payAmount, setPayAmount] = useState("");

  const [expOpen, setExpOpen] = useState(false);
  const [expCategory, setExpCategory] = useState<string>("rent");
  const [expDescription, setExpDescription] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  const refresh = async () => {
    setDebts(await getAllDebts());
    setExpenses(await getAllExpenses());
  };
  useEffect(() => { refresh(); }, []);

  const receivables = useMemo(() => debts.filter((d) => d.type === "receivable").sort((a, b) => b.createdAt - a.createdAt), [debts]);
  const payables = useMemo(() => debts.filter((d) => d.type === "payable").sort((a, b) => b.createdAt - a.createdAt), [debts]);

  const totalReceivable = receivables.reduce((s, d) => s + (d.amount - d.paid), 0);
  const totalPayable = payables.reduce((s, d) => s + (d.amount - d.paid), 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const submitDebt = async () => {
    const amt = Number(debtAmount) || 0;
    if (!debtParty.trim() || amt <= 0) {
      toast.error(t.form.required);
      return;
    }
    const d: Debt = {
      id: newId(),
      type: debtType,
      party: debtParty.trim(),
      amount: amt,
      paid: 0,
      notes: debtNotes.trim() || undefined,
      dueDate: debtDue ? new Date(debtDue).getTime() : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveDebt(d);
    toast.success(t.form.saved);
    setDebtOpen(false);
    setDebtParty(""); setDebtAmount(""); setDebtNotes(""); setDebtDue("");
    refresh();
  };

  const submitPayment = async () => {
    if (!payOpen) return;
    const amt = Number(payAmount) || 0;
    if (amt <= 0) return;
    const remaining = payOpen.amount - payOpen.paid;
    const next: Debt = {
      ...payOpen,
      paid: Math.min(payOpen.amount, payOpen.paid + amt),
      updatedAt: Date.now(),
    };
    await saveDebt(next);
    toast.success(amt >= remaining ? t.finance.settled : t.finance.partiallySettled);
    setPayOpen(null);
    setPayAmount("");
    refresh();
  };

  const removeDebt = async (id: string) => {
    await deleteDebt(id);
    refresh();
  };

  const submitExpense = async () => {
    const amt = Number(expAmount) || 0;
    if (amt <= 0) {
      toast.error(t.form.required);
      return;
    }
    const e: Expense = {
      id: newId(),
      category: expCategory,
      description: expDescription.trim() || undefined,
      amount: amt,
      date: new Date(expDate).getTime() || Date.now(),
      createdAt: Date.now(),
    };
    await saveExpense(e);
    toast.success(t.form.saved);
    setExpOpen(false);
    setExpDescription(""); setExpAmount("");
    refresh();
  };

  const removeExpense = async (id: string) => {
    await deleteExpense(id);
    refresh();
  };

  return (
    <div className="px-4 py-5 space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Wallet className="w-5 h-5 text-gold" />
        {t.finance.title}
      </h2>

      <Tabs defaultValue="debts">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="debts" className="gap-1.5">
            <HandCoins className="w-4 h-4" />
            {t.finance.debts}
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-1.5">
            <Receipt className="w-4 h-4" />
            {t.finance.expenses}
          </TabsTrigger>
        </TabsList>

        {/* DEBTS */}
        <TabsContent value="debts" className="space-y-3 mt-3">
          <div className="grid grid-cols-2 gap-3">
            <Kpi
              icon={<ArrowDownCircle className="w-4 h-4" />}
              label={t.finance.totalReceivable}
              value={formatPrice(totalReceivable)}
              tone="success"
            />
            <Kpi
              icon={<ArrowUpCircle className="w-4 h-4" />}
              label={t.finance.totalPayable}
              value={formatPrice(totalPayable)}
              tone="destructive"
            />
          </div>

          <Button variant="gold" className="w-full" onClick={() => setDebtOpen(true)}>
            <Plus className="w-4 h-4" />
            {t.finance.addDebt}
          </Button>

          <Tabs defaultValue="receivable">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="receivable">{t.finance.receivablesShort}</TabsTrigger>
              <TabsTrigger value="payable">{t.finance.payablesShort}</TabsTrigger>
            </TabsList>
            <TabsContent value="receivable" className="space-y-2 mt-3">
              {receivables.length === 0 ? (
                <Empty text={t.finance.noDebts} />
              ) : (
                receivables.map((d) => (
                  <DebtCard
                    key={d.id} debt={d} t={t} formatPrice={formatPrice} lang={lang}
                    onPay={() => { setPayOpen(d); setPayAmount(String(d.amount - d.paid)); }}
                    onDelete={() => removeDebt(d.id)}
                  />
                ))
              )}
            </TabsContent>
            <TabsContent value="payable" className="space-y-2 mt-3">
              {payables.length === 0 ? (
                <Empty text={t.finance.noDebts} />
              ) : (
                payables.map((d) => (
                  <DebtCard
                    key={d.id} debt={d} t={t} formatPrice={formatPrice} lang={lang}
                    onPay={() => { setPayOpen(d); setPayAmount(String(d.amount - d.paid)); }}
                    onDelete={() => removeDebt(d.id)}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* EXPENSES */}
        <TabsContent value="expenses" className="space-y-3 mt-3">
          <Kpi
            icon={<Receipt className="w-4 h-4" />}
            label={t.finance.totalExpenses}
            value={formatPrice(totalExpenses)}
            tone="destructive"
          />
          <Button variant="gold" className="w-full" onClick={() => setExpOpen(true)}>
            <Plus className="w-4 h-4" />
            {t.finance.addExpense}
          </Button>
          {expenses.length === 0 ? (
            <Empty text={t.finance.noExpenses} />
          ) : (
            <div className="space-y-2">
              {[...expenses].sort((a, b) => b.date - a.date).map((e) => (
                <div key={e.id} className="rounded-xl border bg-card p-3 shadow-sm flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-destructive/10 text-destructive grid place-items-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {e.description || categoryLabel(e.category, t)}
                    </p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                      <CalendarDays className="w-3 h-3" />
                      {new Date(e.date).toLocaleDateString(lang === "ar" ? "ar-DZ" : lang)}
                      <span>·</span>
                      {categoryLabel(e.category, t)}
                    </p>
                  </div>
                  <span className="text-destructive font-bold text-sm whitespace-nowrap">
                    - {formatPrice(e.amount)}
                  </span>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeExpense(e.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add debt dialog */}
      <Dialog open={debtOpen} onOpenChange={setDebtOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.finance.addDebt}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">{t.finance.type}</Label>
              <Select value={debtType} onValueChange={(v) => setDebtType(v as DebtType)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="receivable">{t.finance.receivablesShort}</SelectItem>
                  <SelectItem value="payable">{t.finance.payablesShort}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t.finance.party}</Label>
              <Input value={debtParty} onChange={(e) => setDebtParty(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">{t.finance.amount}</Label>
              <Input type="number" inputMode="decimal" value={debtAmount} onChange={(e) => setDebtAmount(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">{t.finance.dueDate}</Label>
              <Input type="date" value={debtDue} onChange={(e) => setDebtDue(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">{t.finance.notes}</Label>
              <Input value={debtNotes} onChange={(e) => setDebtNotes(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setDebtOpen(false)}>{t.form.cancel}</Button>
            <Button variant="gold" onClick={submitDebt}>{t.form.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settlement dialog */}
      <Dialog open={!!payOpen} onOpenChange={(o) => !o && setPayOpen(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.finance.addPayment}</DialogTitle>
          </DialogHeader>
          {payOpen && (
            <div className="space-y-3">
              <div className="text-sm">
                <p className="font-semibold">{payOpen.party}</p>
                <p className="text-muted-foreground text-xs">
                  {t.finance.remaining}: <span className="text-gold font-bold">{formatPrice(payOpen.amount - payOpen.paid)}</span>
                </p>
              </div>
              <div>
                <Label className="text-xs">{t.finance.paymentAmount}</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max={payOpen.amount - payOpen.paid}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setPayOpen(null)}>{t.form.cancel}</Button>
            <Button variant="gold" onClick={submitPayment}>{t.form.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add expense dialog */}
      <Dialog open={expOpen} onOpenChange={setExpOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t.finance.addExpense}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">{t.finance.expenseCategory}</Label>
              <Select value={expCategory} onValueChange={setExpCategory}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{categoryLabel(c, t)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">{t.finance.expenseDescription}</Label>
              <Input value={expDescription} onChange={(e) => setExpDescription(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">{t.finance.amount}</Label>
              <Input type="number" inputMode="decimal" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">{t.finance.expenseDate}</Label>
              <Input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} className="mt-1" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setExpOpen(false)}>{t.form.cancel}</Button>
            <Button variant="gold" onClick={submitExpense}>{t.form.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DebtCard({
  debt, t, formatPrice, lang, onPay, onDelete,
}: {
  debt: Debt;
  t: ReturnType<typeof useApp>["t"];
  formatPrice: (n: number) => string;
  lang: string;
  onPay: () => void;
  onDelete: () => void;
}) {
  const remaining = debt.amount - debt.paid;
  const settled = remaining <= 0;
  return (
    <div className="rounded-xl border bg-card p-3 shadow-sm space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{debt.party}</p>
          <p className="text-[11px] text-muted-foreground">
            {new Date(debt.createdAt).toLocaleDateString(lang === "ar" ? "ar-DZ" : lang)}
            {debt.saleId && <> · {t.finance.fromSale}</>}
            {debt.notes && <> · {debt.notes}</>}
          </p>
        </div>
        <Badge variant={settled ? "secondary" : "outline"} className={cn(settled && "bg-success/15 text-success")}>
          {settled ? t.finance.settled : debt.paid > 0 ? t.finance.partiallySettled : ""}
        </Badge>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div>{t.finance.amount}: <span className="text-foreground font-medium">{formatPrice(debt.amount)}</span></div>
          <div>{t.finance.paid}: <span className="text-success font-medium">{formatPrice(debt.paid)}</span></div>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground">{t.finance.remaining}</p>
          <p className={cn("font-bold text-lg", settled ? "text-success" : debt.type === "receivable" ? "text-warning" : "text-destructive")}>
            {formatPrice(remaining)}
          </p>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        {!settled && (
          <Button size="sm" variant="gold" className="flex-1" onClick={onPay}>
            {t.finance.settle}
          </Button>
        )}
        <Button size="sm" variant="ghost" className="text-destructive" onClick={onDelete}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

function Kpi({
  icon, label, value, tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "default" | "success" | "destructive";
}) {
  return (
    <div className={cn("rounded-xl border bg-card p-3 shadow-sm",
      tone === "success" && "border-success/40",
      tone === "destructive" && "border-destructive/40")}>
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
        <span className={cn("w-6 h-6 rounded-md grid place-items-center bg-muted",
          tone === "success" && "bg-success/15 text-success",
          tone === "destructive" && "bg-destructive/15 text-destructive")}>
          {icon}
        </span>
        {label}
      </div>
      <p className={cn("text-lg font-bold truncate",
        tone === "success" && "text-success",
        tone === "destructive" && "text-destructive")}>
        {value}
      </p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">{text}</div>;
}

function categoryLabel(key: string, t: ReturnType<typeof useApp>["t"]) {
  const map: Record<string, Record<string, string>> = {
    rent: { ar: "إيجار", fr: "Loyer", en: "Rent" },
    salaries: { ar: "رواتب", fr: "Salaires", en: "Salaries" },
    utilities: { ar: "فواتير", fr: "Factures", en: "Utilities" },
    supplies: { ar: "مستلزمات", fr: "Fournitures", en: "Supplies" },
    transport: { ar: "نقل", fr: "Transport", en: "Transport" },
    marketing: { ar: "تسويق", fr: "Marketing", en: "Marketing" },
    other: { ar: "أخرى", fr: "Autre", en: "Other" },
  };
  // pick lang from t.appName? Just return ar default with fallback to key
  const langGuess = t.nav.inventory === "Inventaire" ? "fr" : t.nav.inventory === "Inventory" ? "en" : "ar";
  return map[key]?.[langGuess] ?? key;
}

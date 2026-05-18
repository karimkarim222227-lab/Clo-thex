import { useEffect, useRef, useState } from "react";
import { Languages, Palette, Store, Save, Download, Upload, DatabaseBackup, Image as ImageIcon, X, Phone, MapPin, Mail, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import { useApp } from "@/contexts/AppContext";
import { getDB, getSetting, setSetting } from "@/lib/db";
import { toast } from "sonner";
import type { Lang } from "@/i18n/translations";

interface StoreState {
  name: string; phone: string; address: string; email: string;
  rc: string; nif: string; nis: string; art: string; logo: string;
}

const empty: StoreState = { name: "", phone: "", address: "", email: "", rc: "", nif: "", nis: "", art: "", logo: "" };

export function SettingsPage() {
  const { t, lang, setLang, theme, setTheme } = useApp();
  const [store, setStore] = useState<StoreState>(empty);
  const importRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);

  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    (async () => {
      setStore({
        name: String((await getSetting("storeName")) ?? ""),
        phone: String((await getSetting("storePhone")) ?? ""),
        address: String((await getSetting("storeAddress")) ?? ""),
        email: String((await getSetting("storeEmail")) ?? ""),
        rc: String((await getSetting("storeRC")) ?? ""),
        nif: String((await getSetting("storeNIF")) ?? ""),
        nis: String((await getSetting("storeNIS")) ?? ""),
        art: String((await getSetting("storeArtNum")) ?? ""),
        logo: String((await getSetting("storeLogo")) ?? ""),
      });
    })();
  }, []);

  const update = (k: keyof StoreState, v: string) => setStore((s) => ({ ...s, [k]: v }));

  const handleSaveStore = async () => {
    await Promise.all([
      setSetting("storeName", store.name),
      setSetting("storePhone", store.phone),
      setSetting("storeAddress", store.address),
      setSetting("storeEmail", store.email),
      setSetting("storeRC", store.rc),
      setSetting("storeNIF", store.nif),
      setSetting("storeNIS", store.nis),
      setSetting("storeArtNum", store.art),
      setSetting("storeLogo", store.logo),
    ]);
    toast.success(t.settings.saved);
  };

  const onLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error("Max 1MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => update("logo", String(ev.target?.result || ""));
    reader.readAsDataURL(file);
  };

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const db = await getDB();
      const [products, sales, debts, expenses, settings] = await Promise.all([
        db.getAll("products"), db.getAll("sales"), db.getAll("debts"), db.getAll("expenses"), db.getAll("settings"),
      ]);
      const backup = { products, sales, debts, expenses, settings, exportedAt: Date.now(), version: 3 };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `clowthex-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(t.settings.exported);
    } catch (err) {
      console.error(err);
      toast.error("❌ " + t.settings.importError);
    } finally {
      setIsExporting(false);
      setShowExportConfirm(false);
    }
  };

  const handleImportConfirmed = () => {
    setShowImportConfirm(false);
    setTimeout(() => importRef.current?.click(), 150);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(String(ev.target?.result || ""));
        const db = await getDB();
        const tx = db.transaction(["products", "sales", "debts", "expenses", "settings"], "readwrite");
        await tx.objectStore("products").clear();
        await tx.objectStore("sales").clear();
        await tx.objectStore("debts").clear();
        await tx.objectStore("expenses").clear();
        await tx.objectStore("settings").clear();
        for (const p of (data.products ?? [])) await tx.objectStore("products").put(p);
        for (const s of (data.sales ?? [])) await tx.objectStore("sales").put(s);
        for (const d of (data.debts ?? [])) await tx.objectStore("debts").put(d);
        for (const x of (data.expenses ?? [])) await tx.objectStore("expenses").put(x);
        for (const st of (data.settings ?? [])) await tx.objectStore("settings").put(st);
        await tx.done;
        toast.success(t.settings.imported);
        setTimeout(() => window.location.reload(), 1200);
      } catch (err) {
        console.error(err);
        toast.error(t.settings.importError);
      } finally {
        setIsImporting(false);
      }
    };
    reader.onerror = () => { toast.error(t.settings.importError); setIsImporting(false); };
    reader.readAsText(file);
  };

  return (
    <div className="px-4 py-5 space-y-5">
      <h2 className="text-xl font-bold">{t.settings.title}</h2>

      <Section icon={<Languages className="w-4 h-4" />} title={t.settings.language}>
        <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ar">العربية</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </Section>

      <Section icon={<Palette className="w-4 h-4" />} title={t.settings.theme}>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <Button variant={theme === "light" ? "gold" : "outline"} onClick={() => setTheme("light")}>
            {t.settings.themeLight}
          </Button>
          <Button variant={theme === "dark" ? "gold" : "outline"} onClick={() => setTheme("dark")}>
            {t.settings.themeDark}
          </Button>
        </div>
      </Section>

      {/* Professional store info card */}
      <div className="rounded-2xl border bg-gradient-to-br from-card to-card/60 shadow-elegant overflow-hidden">
        <div className="px-4 py-4 border-b flex items-center gap-3 bg-gold/5">
          <div className="w-10 h-10 rounded-lg bg-gradient-gold grid place-items-center shadow-gold shrink-0">
            <Store className="w-5 h-5 text-gold-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base">{t.settings.store}</p>
            <p className="text-[11px] text-muted-foreground">{t.settings.storeNameHint}</p>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* Branding */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t.settings.storeBrandingSection}</p>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border bg-muted/30 grid place-items-center overflow-hidden shrink-0">
                {store.logo ? (
                  <img src={store.logo} alt="logo" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={onLogoFile} />
                <Button variant="outline" size="sm" className="w-full" onClick={() => logoRef.current?.click()}>
                  <Upload className="w-3.5 h-3.5" />
                  {t.settings.uploadLogo}
                </Button>
                {store.logo && (
                  <Button variant="ghost" size="sm" className="w-full text-destructive" onClick={() => update("logo", "")}>
                    <X className="w-3.5 h-3.5" />
                    {t.settings.removeLogo}
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label className="text-xs">{t.settings.storeName}</Label>
              <Input value={store.name} onChange={(e) => update("name", e.target.value)} className="mt-1" />
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t.settings.storeContactSection}</p>
            <Field icon={<Phone className="w-3.5 h-3.5" />} label={t.settings.storePhone}>
              <Input value={store.phone} onChange={(e) => update("phone", e.target.value)} inputMode="tel" />
            </Field>
            <Field icon={<Mail className="w-3.5 h-3.5" />} label={t.settings.storeEmail}>
              <Input value={store.email} onChange={(e) => update("email", e.target.value)} type="email" inputMode="email" />
            </Field>
            <Field icon={<MapPin className="w-3.5 h-3.5" />} label={t.settings.storeAddress}>
              <Input value={store.address} onChange={(e) => update("address", e.target.value)} />
            </Field>
          </div>

          {/* Legal */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t.settings.storeLegalSection}</p>
            <div className="grid grid-cols-2 gap-2">
              <Field icon={<FileText className="w-3.5 h-3.5" />} label={t.settings.storeRC}>
                <Input value={store.rc} onChange={(e) => update("rc", e.target.value)} />
              </Field>
              <Field icon={<FileText className="w-3.5 h-3.5" />} label={t.settings.storeNIF}>
                <Input value={store.nif} onChange={(e) => update("nif", e.target.value)} />
              </Field>
              <Field icon={<FileText className="w-3.5 h-3.5" />} label={t.settings.storeNIS}>
                <Input value={store.nis} onChange={(e) => update("nis", e.target.value)} />
              </Field>
              <Field icon={<FileText className="w-3.5 h-3.5" />} label={t.settings.storeArtNum}>
                <Input value={store.art} onChange={(e) => update("art", e.target.value)} />
              </Field>
            </div>
          </div>

          <Button variant="gold" className="w-full" onClick={handleSaveStore}>
            <Save className="w-4 h-4" />
            {t.form.save}
          </Button>
        </div>
      </div>

      <Section icon={<DatabaseBackup className="w-4 h-4" />} title={t.settings.backup}>
        <div className="space-y-3">
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />
          <Button variant="gold" className="w-full" onClick={() => setShowExportConfirm(true)} disabled={isExporting}>
            <Download className="w-4 h-4" />
            {isExporting ? "..." : t.settings.export}
          </Button>
          <Button variant="outline" className="w-full" onClick={() => setShowImportConfirm(true)} disabled={isImporting}>
            <Upload className="w-4 h-4" />
            {isImporting ? "..." : t.settings.import}
          </Button>
        </div>
      </Section>

      <AlertDialog open={showExportConfirm} onOpenChange={setShowExportConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.settings.export}</AlertDialogTitle>
            <AlertDialogDescription>JSON</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.form.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleExport} disabled={isExporting}>{t.settings.export}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">⚠️</AlertDialogTitle>
            <AlertDialogDescription>{t.settings.import}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.form.cancel}</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={handleImportConfirmed}>
              {t.settings.import}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Section({ children, icon, title }: { children: React.ReactNode; icon?: React.ReactNode; title?: string }) {
  return (
    <div className="bg-card rounded-xl border p-4 space-y-2 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold border-b pb-2 mb-2">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[11px] flex items-center gap-1.5 text-muted-foreground">
        {icon}
        {label}
      </Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export type Lang = "ar" | "fr" | "en";

export interface Translation {
  appName: string;
  appTagline: string;
  nav: { inventory: string; pos: string; finance: string; reports: string; settings: string };
  scanner: { title: string; hint: string; permissionDenied: string };
  activation: { subtitle: string; step1: string; step2: string; scanHint: string; startScan: string; passwordPlaceholder: string; button: string; back: string; qrVerified: string; qrInvalid: string; success: string; invalid: string };
  inventory: { addProduct: string; editProduct: string; search: string; allCategories: string; sortName: string; sortPrice: string; sortQty: string; asc: string; desc: string; empty: string; emptyHint: string; noResults: string; lowStock: string; outOfStock: string; stats: { products: string; units: string; value: string; lowStock: string } };
  form: { save: string; cancel: string; delete: string; deleted: string; saved: string; required: string; name: string; category: string; color: string; size: string; quantity: string; purchasePrice: string; salePrice: string; lowStockThreshold: string; barcode: string; scan: string; generate: string; image: string; pickImage: string; changeImage: string; printBarcode: string; confirmDelete: string };
  pos: {
    title: string; search: string; notFound: string; cart: string; emptyCart: string; emptyHint: string;
    qty: string; price: string; lineTotal: string; subtotal: string; discount: string; total: string;
    paymentMethod: string; cash: string; card: string; credit: string; other: string;
    customerName: string; pay: string; saleSuccess: string; stockWarning: string;
    invoice: string; invoiceNo: string; date: string; item: string; printInvoice: string; thanks: string;
    quickAdd: string; quickAddTitle: string; quickAddHint: string; itemName: string;
    paidAmount: string; dueAmount: string; markAsCredit: string; creditWarning: string;
  };
  finance: {
    title: string; debts: string; expenses: string;
    receivables: string; payables: string;
    receivablesShort: string; payablesShort: string;
    addDebt: string; addExpense: string;
    party: string; amount: string; paid: string; remaining: string; notes: string; dueDate: string;
    type: string; settle: string; settled: string; partiallySettled: string;
    totalReceivable: string; totalPayable: string; netDebt: string;
    totalExpenses: string; expenseCategory: string; expenseDescription: string; expenseDate: string;
    noDebts: string; noExpenses: string; addPayment: string; paymentAmount: string;
    fromSale: string;
  };
  reports: {
    title: string; today: string; week: string; month: string; year: string;
    revenue: string; profit: string; netProfit: string; salesCount: string; avgSale: string;
    expenses: string; receivables: string; payables: string;
    topProducts: string; recentSales: string; units: string; noSales: string; chartSales: string;
  };
  settings: {
    title: string; language: string; theme: string; themeLight: string; themeDark: string;
    store: string; storeName: string; storePhone: string; storeAddress: string;
    storeEmail: string; storeRC: string; storeNIF: string; storeNIS: string; storeArtNum: string;
    storeLogo: string; uploadLogo: string; removeLogo: string;
    storeNameHint: string; storeContactSection: string; storeLegalSection: string; storeBrandingSection: string;
    saved: string; backup: string; export: string; import: string; exported: string; imported: string; importError: string;
  };
  categories: Record<"shirts" | "pants" | "shoes" | "jackets" | "accessories" | "other", string>;
}

const ar = {
  appName: "ClowtheX",
  appTagline: "إدارة محل الملابس",
  nav: { inventory: "المخزون", pos: "نقطة البيع", finance: "المالية", reports: "التقارير", settings: "الإعدادات" },
  scanner: { title: "مسح الباركود", hint: "وجّه الكاميرا نحو الباركود", permissionDenied: "لا يمكن الوصول إلى الكاميرا" },
  activation: { subtitle: "يرجى تفعيل التطبيق للمتابعة", step1: "امسح رمز QR للتفعيل", step2: "أدخل كلمة المرور", scanHint: "وجّه الكاميرا نحو رمز QR أعلاه", startScan: "بدء المسح", passwordPlaceholder: "كلمة المرور", button: "تفعيل", back: "رجوع", qrVerified: "تم التحقق من رمز QR", qrInvalid: "رمز QR غير صحيح", success: "تم تفعيل التطبيق بنجاح", invalid: "كلمة المرور غير صحيحة" },
  inventory: { addProduct: "إضافة منتج", editProduct: "تعديل المنتج", search: "بحث عن منتج...", allCategories: "جميع الفئات", sortName: "الاسم", sortPrice: "السعر", sortQty: "الكمية", asc: "تصاعدي", desc: "تنازلي", empty: "المخزون فارغ", emptyHint: "ابدأ بإضافة منتجاتك", noResults: "لا توجد نتائج", lowStock: "مخزون منخفض", outOfStock: "نفد المخزون", stats: { products: "منتجات", units: "وحدات", value: "القيمة", lowStock: "مخزون منخفض" } },
  form: { save: "حفظ", cancel: "إلغاء", delete: "حذف", deleted: "تم الحذف", saved: "تم الحفظ", required: "هذا الحقل مطلوب", name: "اسم المنتج", category: "الفئة", color: "اللون", size: "المقاس", quantity: "الكمية", purchasePrice: "سعر الشراء", salePrice: "سعر البيع", lowStockThreshold: "حد المخزون المنخفض", barcode: "الباركود", scan: "مسح", generate: "توليد", image: "الصورة", pickImage: "اختر صورة", changeImage: "تغيير الصورة", printBarcode: "طباعة الباركود", confirmDelete: "هل تريد حذف هذا المنتج؟" },
  pos: {
    title: "نقطة البيع", search: "ابحث بالاسم أو الباركود...", notFound: "لم يتم العثور على المنتج",
    cart: "السلة", emptyCart: "السلة فارغة", emptyHint: "ابحث عن منتج أو أضف بيعاً سريعاً",
    qty: "الكمية", price: "السعر", lineTotal: "المجموع", subtotal: "المجموع الفرعي",
    discount: "الخصم", total: "الإجمالي",
    paymentMethod: "طريقة الدفع", cash: "نقداً", card: "بطاقة", credit: "آجل (دين)", other: "أخرى",
    customerName: "اسم العميل", pay: "إتمام البيع", saleSuccess: "تمت عملية البيع بنجاح",
    stockWarning: "الكمية المطلوبة تتجاوز المخزون",
    invoice: "فاتورة", invoiceNo: "رقم الفاتورة", date: "التاريخ", item: "المنتج",
    printInvoice: "طباعة الفاتورة", thanks: "شكراً لتسوقكم معنا",
    quickAdd: "بيع سريع", quickAddTitle: "إضافة عنصر يدوي", quickAddHint: "أضف منتجاً بدون مخزون (خدمة، عنصر مؤقت...)",
    itemName: "اسم العنصر",
    paidAmount: "المبلغ المدفوع", dueAmount: "المبلغ المتبقي",
    markAsCredit: "بيع آجل (تسجيل كدين)", creditWarning: "سيتم إنشاء دين باسم العميل بقيمة المبلغ المتبقي",
  },
  finance: {
    title: "المالية", debts: "الديون والذمم", expenses: "المصاريف",
    receivables: "ديون لي (مستحقات على العملاء)", payables: "ديون عليّ (مستحقات للموردين)",
    receivablesShort: "ديون لي", payablesShort: "ديون عليّ",
    addDebt: "إضافة دين", addExpense: "إضافة مصروف",
    party: "الطرف", amount: "المبلغ", paid: "المدفوع", remaining: "المتبقي", notes: "ملاحظات", dueDate: "تاريخ الاستحقاق",
    type: "النوع", settle: "تسديد", settled: "مسدد", partiallySettled: "مسدد جزئياً",
    totalReceivable: "إجمالي ديون لي", totalPayable: "إجمالي ديون عليّ", netDebt: "صافي الذمم",
    totalExpenses: "إجمالي المصاريف", expenseCategory: "الفئة", expenseDescription: "الوصف", expenseDate: "التاريخ",
    noDebts: "لا توجد ديون مسجلة", noExpenses: "لا توجد مصاريف مسجلة",
    addPayment: "تسجيل دفعة", paymentAmount: "قيمة الدفعة",
    fromSale: "من بيع آجل",
  },
  reports: {
    title: "التقارير", today: "اليوم", week: "الأسبوع", month: "الشهر", year: "السنة",
    revenue: "الإيرادات", profit: "الربح الإجمالي", netProfit: "الربح الصافي",
    salesCount: "عدد المبيعات", avgSale: "متوسط البيع",
    expenses: "المصاريف", receivables: "ديون لي", payables: "ديون عليّ",
    topProducts: "أكثر المنتجات مبيعاً", recentSales: "آخر المبيعات",
    units: "وحدة", noSales: "لا توجد مبيعات", chartSales: "مبيعات",
  },
  settings: {
    title: "الإعدادات", language: "اللغة", theme: "المظهر", themeLight: "فاتح", themeDark: "داكن",
    store: "معلومات المتجر", storeName: "اسم المتجر", storePhone: "رقم الهاتف", storeAddress: "العنوان",
    storeEmail: "البريد الإلكتروني", storeRC: "السجل التجاري (RC)", storeNIF: "الرقم الجبائي (NIF)",
    storeNIS: "رقم التعريف الإحصائي (NIS)", storeArtNum: "رقم المادة (Art)",
    storeLogo: "شعار المتجر", uploadLogo: "رفع شعار", removeLogo: "إزالة الشعار",
    storeNameHint: "يظهر على الفواتير والتقارير",
    storeContactSection: "معلومات الاتصال", storeLegalSection: "المعلومات القانونية", storeBrandingSection: "الهوية البصرية",
    saved: "تم حفظ الإعدادات بنجاح",
    backup: "النسخ الاحتياطي", export: "تصدير البيانات", import: "استيراد البيانات",
    exported: "تم التصدير بنجاح", imported: "تم الاستيراد بنجاح", importError: "فشل استيراد الملف",
  },
};

const fr = {
  appName: "ClowtheX",
  appTagline: "Gestion de boutique",
  nav: { inventory: "Inventaire", pos: "Vente", finance: "Finance", reports: "Rapports", settings: "Paramètres" },
  scanner: { title: "Scanner", hint: "Pointez la caméra", permissionDenied: "Caméra refusée" },
  activation: { subtitle: "Activez l'application", step1: "Scannez le QR code", step2: "Mot de passe", scanHint: "Pointez la caméra", startScan: "Scanner", passwordPlaceholder: "Mot de passe", button: "Activer", back: "Retour", qrVerified: "QR vérifié", qrInvalid: "QR invalide", success: "Activé", invalid: "Mot de passe incorrect" },
  inventory: { addProduct: "Ajouter", editProduct: "Modifier", search: "Rechercher...", allCategories: "Toutes", sortName: "Nom", sortPrice: "Prix", sortQty: "Quantité", asc: "Croissant", desc: "Décroissant", empty: "Inventaire vide", emptyHint: "Ajoutez vos produits", noResults: "Aucun résultat", lowStock: "Stock faible", outOfStock: "Rupture", stats: { products: "Produits", units: "Unités", value: "Valeur", lowStock: "Stock faible" } },
  form: { save: "Enregistrer", cancel: "Annuler", delete: "Supprimer", deleted: "Supprimé", saved: "Enregistré", required: "Obligatoire", name: "Nom", category: "Catégorie", color: "Couleur", size: "Taille", quantity: "Quantité", purchasePrice: "Prix d'achat", salePrice: "Prix de vente", lowStockThreshold: "Seuil", barcode: "Code-barres", scan: "Scanner", generate: "Générer", image: "Image", pickImage: "Choisir", changeImage: "Changer", printBarcode: "Imprimer", confirmDelete: "Supprimer ?" },
  pos: {
    title: "Point de vente", search: "Nom ou code-barres...", notFound: "Produit introuvable",
    cart: "Panier", emptyCart: "Panier vide", emptyHint: "Recherchez ou ajoutez une vente rapide",
    qty: "Qté", price: "Prix", lineTotal: "Total", subtotal: "Sous-total", discount: "Remise", total: "Total",
    paymentMethod: "Paiement", cash: "Espèces", card: "Carte", credit: "Crédit", other: "Autre",
    customerName: "Client", pay: "Valider", saleSuccess: "Vente effectuée", stockWarning: "Stock insuffisant",
    invoice: "Facture", invoiceNo: "N°", date: "Date", item: "Article", printInvoice: "Imprimer", thanks: "Merci",
    quickAdd: "Vente rapide", quickAddTitle: "Ajouter un article", quickAddHint: "Article hors stock",
    itemName: "Nom",
    paidAmount: "Payé", dueAmount: "Restant",
    markAsCredit: "Vente à crédit", creditWarning: "Une dette sera créée au nom du client",
  },
  finance: {
    title: "Finance", debts: "Dettes & Créances", expenses: "Dépenses",
    receivables: "Créances (clients)", payables: "Dettes (fournisseurs)",
    receivablesShort: "Créances", payablesShort: "Dettes",
    addDebt: "Ajouter", addExpense: "Ajouter",
    party: "Partie", amount: "Montant", paid: "Payé", remaining: "Restant", notes: "Notes", dueDate: "Échéance",
    type: "Type", settle: "Régler", settled: "Réglé", partiallySettled: "Partiel",
    totalReceivable: "Total créances", totalPayable: "Total dettes", netDebt: "Solde net",
    totalExpenses: "Total dépenses", expenseCategory: "Catégorie", expenseDescription: "Description", expenseDate: "Date",
    noDebts: "Aucune dette", noExpenses: "Aucune dépense",
    addPayment: "Paiement", paymentAmount: "Montant",
    fromSale: "Vente à crédit",
  },
  reports: {
    title: "Rapports", today: "Aujourd'hui", week: "Semaine", month: "Mois", year: "Année",
    revenue: "CA", profit: "Bénéfice brut", netProfit: "Bénéfice net",
    salesCount: "Ventes", avgSale: "Moyenne",
    expenses: "Dépenses", receivables: "Créances", payables: "Dettes",
    topProducts: "Top produits", recentSales: "Dernières ventes",
    units: "u.", noSales: "Aucune vente", chartSales: "Ventes",
  },
  settings: {
    title: "Paramètres", language: "Langue", theme: "Thème", themeLight: "Clair", themeDark: "Sombre",
    store: "Magasin", storeName: "Nom", storePhone: "Téléphone", storeAddress: "Adresse",
    storeEmail: "Email", storeRC: "RC", storeNIF: "NIF", storeNIS: "NIS", storeArtNum: "Art",
    storeLogo: "Logo", uploadLogo: "Télécharger", removeLogo: "Supprimer",
    storeNameHint: "Affiché sur les factures",
    storeContactSection: "Contact", storeLegalSection: "Légal", storeBrandingSection: "Identité",
    saved: "Enregistré",
    backup: "Sauvegarde", export: "Exporter", import: "Importer",
    exported: "Exporté", imported: "Importé", importError: "Échec",
  },
};

const en = {
  appName: "ClowtheX",
  appTagline: "Clothing Store Manager",
  nav: { inventory: "Inventory", pos: "POS", finance: "Finance", reports: "Reports", settings: "Settings" },
  scanner: { title: "Scan", hint: "Point camera at barcode", permissionDenied: "Camera denied" },
  activation: { subtitle: "Activate the app", step1: "Scan QR", step2: "Password", scanHint: "Point at QR", startScan: "Start", passwordPlaceholder: "Password", button: "Activate", back: "Back", qrVerified: "QR verified", qrInvalid: "Invalid QR", success: "Activated", invalid: "Wrong password" },
  inventory: { addProduct: "Add", editProduct: "Edit", search: "Search...", allCategories: "All", sortName: "Name", sortPrice: "Price", sortQty: "Qty", asc: "Asc", desc: "Desc", empty: "Empty", emptyHint: "Add products", noResults: "No results", lowStock: "Low", outOfStock: "Out", stats: { products: "Products", units: "Units", value: "Value", lowStock: "Low Stock" } },
  form: { save: "Save", cancel: "Cancel", delete: "Delete", deleted: "Deleted", saved: "Saved", required: "Required", name: "Name", category: "Category", color: "Color", size: "Size", quantity: "Qty", purchasePrice: "Purchase", salePrice: "Sale", lowStockThreshold: "Threshold", barcode: "Barcode", scan: "Scan", generate: "Generate", image: "Image", pickImage: "Pick", changeImage: "Change", printBarcode: "Print", confirmDelete: "Delete?" },
  pos: {
    title: "POS", search: "Name or barcode...", notFound: "Not found",
    cart: "Cart", emptyCart: "Empty", emptyHint: "Search or quick-add",
    qty: "Qty", price: "Price", lineTotal: "Total", subtotal: "Subtotal", discount: "Discount", total: "Total",
    paymentMethod: "Payment", cash: "Cash", card: "Card", credit: "Credit", other: "Other",
    customerName: "Customer", pay: "Complete", saleSuccess: "Sale done", stockWarning: "Insufficient stock",
    invoice: "Invoice", invoiceNo: "No.", date: "Date", item: "Item", printInvoice: "Print", thanks: "Thank you",
    quickAdd: "Quick add", quickAddTitle: "Add manual item", quickAddHint: "Off-stock item",
    itemName: "Item name",
    paidAmount: "Paid", dueAmount: "Due",
    markAsCredit: "Credit sale", creditWarning: "A debt will be recorded under the customer",
  },
  finance: {
    title: "Finance", debts: "Debts & Credits", expenses: "Expenses",
    receivables: "Receivables (owed to me)", payables: "Payables (I owe)",
    receivablesShort: "Receivables", payablesShort: "Payables",
    addDebt: "Add debt", addExpense: "Add expense",
    party: "Party", amount: "Amount", paid: "Paid", remaining: "Remaining", notes: "Notes", dueDate: "Due date",
    type: "Type", settle: "Settle", settled: "Settled", partiallySettled: "Partial",
    totalReceivable: "Total receivable", totalPayable: "Total payable", netDebt: "Net balance",
    totalExpenses: "Total expenses", expenseCategory: "Category", expenseDescription: "Description", expenseDate: "Date",
    noDebts: "No debts", noExpenses: "No expenses",
    addPayment: "Add payment", paymentAmount: "Amount",
    fromSale: "From credit sale",
  },
  reports: {
    title: "Reports", today: "Today", week: "Week", month: "Month", year: "Year",
    revenue: "Revenue", profit: "Gross profit", netProfit: "Net profit",
    salesCount: "Sales", avgSale: "Average",
    expenses: "Expenses", receivables: "Receivables", payables: "Payables",
    topProducts: "Top products", recentSales: "Recent sales",
    units: "u.", noSales: "No sales", chartSales: "Sales",
  },
  settings: {
    title: "Settings", language: "Language", theme: "Theme", themeLight: "Light", themeDark: "Dark",
    store: "Store", storeName: "Store name", storePhone: "Phone", storeAddress: "Address",
    storeEmail: "Email", storeRC: "Trade register (RC)", storeNIF: "Tax ID (NIF)",
    storeNIS: "Statistical ID (NIS)", storeArtNum: "Article number (Art)",
    storeLogo: "Logo", uploadLogo: "Upload", removeLogo: "Remove",
    storeNameHint: "Shown on invoices",
    storeContactSection: "Contact", storeLegalSection: "Legal", storeBrandingSection: "Branding",
    saved: "Saved",
    backup: "Backup", export: "Export", import: "Import",
    exported: "Exported", imported: "Imported", importError: "Failed",
  },
};

export const translations: Record<Lang, Translation> = {
  ar: ar as unknown as Translation,
  fr: fr as unknown as Translation,
  en: en as unknown as Translation,
};

// Augment translation type with categories map (added late to keep core type readable)
declare module "./translations" {
  interface Translation {
    categories: Record<"shirts" | "pants" | "shoes" | "jackets" | "accessories" | "other", string>;
  }
}

(translations.ar as Translation).categories = { shirts: "قمصان", pants: "بناطيل", shoes: "أحذية", jackets: "جاكيتات", accessories: "إكسسوارات", other: "أخرى" };
(translations.fr as Translation).categories = { shirts: "Chemises", pants: "Pantalons", shoes: "Chaussures", jackets: "Vestes", accessories: "Accessoires", other: "Autres" };
(translations.en as Translation).categories = { shirts: "Shirts", pants: "Pants", shoes: "Shoes", jackets: "Jackets", accessories: "Accessories", other: "Other" };

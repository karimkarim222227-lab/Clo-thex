import { openDB, type DBSchema, type IDBPDatabase } from "idb";

// Currency kept as type for backward compatibility. Only DZD is supported now.
export type Currency = "DZD";

export interface Product {
  id: string;
  name: string;
  category: string;
  size?: string;
  color?: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  lowStockThreshold: number;
  image?: string;
  barcode?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SaleItem {
  productId: string; // empty string for manual / quick-add items
  name: string;
  unitPrice: number;
  purchasePrice: number;
  quantity: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  profit: number;
  paymentMethod: "cash" | "card" | "credit" | "other";
  currency: Currency;
  exchangeRate: number;
  customerName?: string;
  paidAmount: number;   // amount actually paid at checkout
  dueAmount: number;    // remaining (debt) amount
  debtId?: string;      // linked receivable debt id
  createdAt: number;
}

export type DebtType = "receivable" | "payable";
// receivable = customer owes the store (ديون لي)
// payable    = store owes supplier/other (ديون عليّ)

export interface Debt {
  id: string;
  type: DebtType;
  party: string;          // customer or supplier name
  amount: number;         // total amount (DZD)
  paid: number;           // amount already settled
  notes?: string;
  dueDate?: number;
  saleId?: string;        // for receivables created from a credit sale
  createdAt: number;
  updatedAt: number;
}

export interface Expense {
  id: string;
  category: string;       // rent, salaries, utilities, supplies, other...
  description?: string;
  amount: number;         // DZD
  date: number;
  createdAt: number;
}

export interface Settings {
  key: string;
  value: unknown;
}

interface StoreSchema extends DBSchema {
  products: {
    key: string;
    value: Product;
    indexes: { "by-category": string; "by-name": string; "by-barcode": string };
  };
  sales: {
    key: string;
    value: Sale;
    indexes: { "by-date": number };
  };
  debts: {
    key: string;
    value: Debt;
    indexes: { "by-type": string; "by-date": number };
  };
  expenses: {
    key: string;
    value: Expense;
    indexes: { "by-date": number };
  };
  settings: {
    key: string;
    value: Settings;
  };
}

const DB_NAME = "style-stock-manager";
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase<StoreSchema>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<StoreSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("products")) {
          const store = db.createObjectStore("products", { keyPath: "id" });
          store.createIndex("by-category", "category");
          store.createIndex("by-name", "name");
          store.createIndex("by-barcode", "barcode");
        }
        if (!db.objectStoreNames.contains("sales")) {
          const sales = db.createObjectStore("sales", { keyPath: "id" });
          sales.createIndex("by-date", "createdAt");
        }
        if (!db.objectStoreNames.contains("debts")) {
          const debts = db.createObjectStore("debts", { keyPath: "id" });
          debts.createIndex("by-type", "type");
          debts.createIndex("by-date", "createdAt");
        }
        if (!db.objectStoreNames.contains("expenses")) {
          const exp = db.createObjectStore("expenses", { keyPath: "id" });
          exp.createIndex("by-date", "date");
        }
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}

// ----- Products -----
export async function getAllProducts(): Promise<Product[]> {
  return (await getDB()).getAll("products");
}
export async function getProduct(id: string) {
  return (await getDB()).get("products", id);
}
export async function findProductByBarcode(barcode: string): Promise<Product | undefined> {
  const all = await (await getDB()).getAll("products");
  return all.find((p) => p.barcode && p.barcode === barcode);
}
export async function saveProduct(p: Product) {
  await (await getDB()).put("products", p);
}
export async function deleteProduct(id: string) {
  await (await getDB()).delete("products", id);
}

// ----- Sales -----
export async function saveSale(sale: Sale) {
  const db = await getDB();
  const tx = db.transaction(["sales", "products", "debts"], "readwrite");
  await tx.objectStore("sales").put(sale);
  for (const item of sale.items) {
    if (!item.productId) continue; // manual line, no stock
    const prod = await tx.objectStore("products").get(item.productId);
    if (prod) {
      prod.quantity = Math.max(0, prod.quantity - item.quantity);
      prod.updatedAt = Date.now();
      await tx.objectStore("products").put(prod);
    }
  }
  if (sale.dueAmount > 0 && sale.debtId) {
    const debt: Debt = {
      id: sale.debtId,
      type: "receivable",
      party: sale.customerName || "—",
      amount: sale.dueAmount,
      paid: 0,
      saleId: sale.id,
      createdAt: sale.createdAt,
      updatedAt: sale.createdAt,
    };
    await tx.objectStore("debts").put(debt);
  }
  await tx.done;
}
export async function getAllSales(): Promise<Sale[]> {
  return (await getDB()).getAll("sales");
}
export async function getSale(id: string) {
  return (await getDB()).get("sales", id);
}
export async function deleteSale(id: string) {
  await (await getDB()).delete("sales", id);
}

// ----- Debts -----
export async function getAllDebts(): Promise<Debt[]> {
  return (await getDB()).getAll("debts");
}
export async function saveDebt(d: Debt) {
  await (await getDB()).put("debts", d);
}
export async function deleteDebt(id: string) {
  await (await getDB()).delete("debts", id);
}

// ----- Expenses -----
export async function getAllExpenses(): Promise<Expense[]> {
  return (await getDB()).getAll("expenses");
}
export async function saveExpense(e: Expense) {
  await (await getDB()).put("expenses", e);
}
export async function deleteExpense(id: string) {
  await (await getDB()).delete("expenses", id);
}

// ----- Settings -----
export async function getSetting<T = unknown>(key: string): Promise<T | undefined> {
  const row = await (await getDB()).get("settings", key);
  return row?.value as T | undefined;
}
export async function setSetting(key: string, value: unknown) {
  await (await getDB()).put("settings", { key, value });
}

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

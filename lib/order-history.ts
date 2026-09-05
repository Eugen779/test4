const STORAGE_KEY = "ocean-produs-orders";

export type StoredOrder = { id: string; order_number: string };

export function addOrderToHistory(order: StoredOrder) {
  try {
    const existing = getOrderHistory();
    // cel mai nou primul, fără duplicate
    const next = [order, ...existing.filter((o) => o.id !== order.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage indisponibil — istoricul pur și simplu nu se salvează pe acest dispozitiv
  }
}

export function getOrderHistory(): StoredOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

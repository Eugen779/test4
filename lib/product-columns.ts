// Coloane sigure pentru interogări publice (magazin) — exclude cost_price,
// care e strict pentru admin și nu trebuie trimis niciodată către vizitatori.
export const PUBLIC_PRODUCT_COLUMNS =
  "id, category_id, name, slug, description, price, compare_at_price, stock, unit, size, weight_note, weight_options, images, is_active, is_featured, display_order";

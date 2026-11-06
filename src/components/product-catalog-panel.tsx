"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowDownUp, Boxes, CheckCircle2, CircleAlert, LoaderCircle, Plus, RefreshCw, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  unit: string;
  price_amount: number | null;
  price_currency: string | null;
  available_quantity: number;
};

export function ProductCatalogPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingStock, setSavingStock] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("unit");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [quantity, setQuantity] = useState("0");
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});

  async function loadProducts() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Could not load catalog");
      setProducts(payload.products ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Product catalog unavailable");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function initialLoad() {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.error ?? "Could not load catalog");
        if (!cancelled) setProducts(payload.products ?? []);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Product catalog unavailable");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void initialLoad();
    return () => { cancelled = true; };
  }, []);

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const priceValue = price.trim() === "" ? null : Number(price);
    const quantityValue = Number(quantity);
    if ((priceValue !== null && (!Number.isFinite(priceValue) || priceValue < 0)) || !Number.isFinite(quantityValue) || quantityValue < 0) {
      setError("Enter a valid non-negative price and stock quantity.");
      setSaving(false);
      return;
    }
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku, name, description, unit, price_amount: priceValue,
          price_currency: priceValue === null ? null : currency.toUpperCase(),
          available_quantity: quantityValue,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Product could not be created");
      setNotice("Product created and inventory record initialized.");
      setSku(""); setName(""); setDescription(""); setUnit("unit"); setPrice(""); setCurrency("USD"); setQuantity("0");
      setShowForm(false);
      await loadProducts();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Product creation failed");
    } finally {
      setSaving(false);
    }
  }

  async function saveStock(product: Product) {
    const quantityValue = Number(stockDrafts[product.id] ?? product.available_quantity);
    if (!Number.isFinite(quantityValue) || quantityValue < 0) {
      setError("Stock cannot be negative.");
      return;
    }
    setSavingStock(product.id);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/products/" + product.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available_quantity: quantityValue }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error ?? "Stock update failed");
      setProducts(current => current.map(item => item.id === product.id ? { ...item, available_quantity: quantityValue } : item));
      setStockDrafts(current => {
        const next = { ...current };
        delete next[product.id];
        return next;
      });
      setNotice("Inventory quantity updated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Stock update failed");
    } finally {
      setSavingStock(null);
    }
  }

  const totalStock = products.reduce((sum, product) => sum + Number(product.available_quantity || 0), 0);

  return (
    <main className="page-wrap">
      <div className="mb-7 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div><p className="page-kicker mb-4">05 / Commercial data</p><h1 className="page-title">Product register.</h1><p className="page-intro mt-3">Maintain the products and available quantities used by catalog matching and stock verification. These are operational records, not uploaded examples.</p></div>
        <div className="flex gap-2">
          <button onClick={() => void loadProducts()} disabled={loading} className="inline-flex h-9 items-center gap-2 border border-[#d0dcd7] bg-white px-3 text-[10px] font-bold text-[#526660] hover:border-[#bc5034] hover:text-[#bc5034] disabled:opacity-50"><RefreshCw size={13} className={loading ? "animate-spin" : ""}/> Refresh</button>
          <Button onClick={() => setShowForm(value => !value)} variant={showForm ? "secondary" : "primary"} size="small">{showForm ? <X size={13}/> : <Plus size={13}/>}{showForm ? "Close form" : "Add product"}</Button>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="stat-tile"><p className="stat-label">Active products</p><p className="stat-value">{products.length}</p><p className="mt-2 text-[9px] text-[#84958e]">Current catalog entries</p></div>
        <div className="stat-tile"><p className="stat-label">Total available units</p><p className="stat-value">{totalStock.toLocaleString()}</p><p className="mt-2 text-[9px] text-[#84958e]">Across active inventory</p></div>
        <div className="stat-tile"><p className="stat-label">Currency coverage</p><p className="stat-value text-[22px]">{Array.from(new Set(products.map(item => item.price_currency).filter(Boolean))).join(" · ") || "—"}</p><p className="mt-2 text-[9px] text-[#84958e]">Currencies present in catalog</p></div>
      </div>

      {error && <div role="alert" className="mb-4 flex items-start gap-2 border border-[#f0d9d0] bg-[#fff7f6] p-3 text-[10px] leading-[1.6] text-[#a94f3e]"><CircleAlert size={13} className="mt-0.5 shrink-0"/>{error}</div>}
      {notice && <div role="status" className="mb-4 flex items-center gap-2 border border-[#cfdfd5] bg-[#f5fbf7] p-3 text-[10px] text-[#2e7858]"><CheckCircle2 size={13}/>{notice}</div>}

      {showForm && <section className="ui-panel mb-4">
        <div className="ui-panel-header"><div><p className="page-kicker">New record / 001</p><h2 className="ui-panel-title mt-1.5">Create catalog product</h2></div><Boxes size={16} className="text-[#bc5034]"/></div>
        <form onSubmit={createProduct} className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
          <div><label htmlFor="product-sku" className="field-label">SKU *</label><input id="product-sku" required maxLength={80} value={sku} onChange={event=>setSku(event.target.value)} className="field-control" placeholder="LAP-BIZ-016"/></div>
          <div className="md:col-span-1 xl:col-span-2"><label htmlFor="product-name" className="field-label">Product name *</label><input id="product-name" required maxLength={180} value={name} onChange={event=>setName(event.target.value)} className="field-control" placeholder="Business laptop 16 GB"/></div>
          <div><label htmlFor="product-unit" className="field-label">Unit</label><input id="product-unit" maxLength={30} value={unit} onChange={event=>setUnit(event.target.value)} className="field-control"/></div>
          <div className="md:col-span-2 xl:col-span-4"><label htmlFor="product-description" className="field-label">Description / technical details</label><textarea id="product-description" rows={2} maxLength={4000} value={description} onChange={event=>setDescription(event.target.value)} className="field-control resize-y" placeholder="CPU, memory, storage, model, warranty…"/></div>
          <div><label htmlFor="product-price" className="field-label">Unit price</label><input id="product-price" type="number" min="0" step="0.01" value={price} onChange={event=>setPrice(event.target.value)} className="field-control" placeholder="Optional"/></div>
          <div><label htmlFor="product-currency" className="field-label">Currency</label><input id="product-currency" maxLength={3} minLength={3} value={currency} onChange={event=>setCurrency(event.target.value.toUpperCase())} className="field-control mono"/></div>
          <div><label htmlFor="product-stock" className="field-label">Initial available quantity</label><input id="product-stock" type="number" min="0" step="0.001" required value={quantity} onChange={event=>setQuantity(event.target.value)} className="field-control"/></div>
          <div className="flex items-end"><Button type="submit" disabled={saving} className="w-full">{saving ? <LoaderCircle size={13} className="animate-spin"/> : <Save size={13}/>}{saving ? "Creating…" : "Save product"}</Button></div>
        </form>
      </section>}

      <section className="ui-panel">
        <div className="ui-panel-header"><div><p className="page-kicker">Catalog / 002</p><h2 className="ui-panel-title mt-1.5">Active product records <span className="mono ml-1 text-[9px] font-medium text-[#899a94]">{products.length}</span></h2><p className="ui-panel-subtitle">Edit available quantities directly. Price and SKU are shown as stored.</p></div><ArrowDownUp size={15} className="text-[#7c8290]"/></div>
        {loading ? <div className="empty-state"><LoaderCircle size={17} className="animate-spin text-[#bc5034]"/><p className="mt-3 text-[10px] text-[#869790]">Loading catalog products…</p></div>
        : products.length ? <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Product / SKU</th><th>Description</th><th>Unit price</th><th>Available stock</th><th></th></tr></thead>
            <tbody>{products.map(product => {
              const current = stockDrafts[product.id] ?? String(product.available_quantity);
              const changed = stockDrafts[product.id] !== undefined && Number(current) !== Number(product.available_quantity);
              return <tr key={product.id}>
                <td className="min-w-[170px]"><p className="font-bold text-[#29413e]">{product.name}</p><p className="mono mt-1 text-[8px] text-[#899a94]">{product.sku}</p></td>
                <td className="min-w-[150px] max-w-[260px]"><p className="line-clamp-2 text-[9px] leading-[1.7] text-[#6b7d77]">{product.description || "No description"}</p></td>
                <td className="mono min-w-[100px] text-[9px]">{product.price_amount === null ? "—" : product.price_amount.toFixed(2) + " " + (product.price_currency ?? "")}</td>
                <td className="min-w-[130px]"><input aria-label={"Available quantity for " + product.name} type="number" min="0" step="0.001" value={current} onChange={event=>setStockDrafts(existing=>({...existing,[product.id]:event.target.value}))} className="h-8 w-[100px] border border-[#d6e1dc] bg-white px-2 text-[10px] outline-none focus:border-[#bc5034]"/><span className="ml-2 text-[8px] text-[#869790]">{product.unit}</span></td>
                <td className="text-right"><Button variant="secondary" size="small" disabled={!changed || savingStock === product.id} onClick={()=>void saveStock(product)}>{savingStock === product.id ? <LoaderCircle size={12} className="animate-spin"/> : <Save size={12}/>}Save</Button></td>
              </tr>;
            })}</tbody>
          </table>
        </div> : <div className="empty-state"><span className="empty-symbol"><Boxes size={18}/></span><p className="mt-4 text-[12px] font-bold">No active products</p><p className="mt-2 max-w-[300px] text-[10px] leading-[1.7] text-[#899a94]">Add the products your team quotes and fulfills. The analyzer will use these records for catalog matching and stock checks.</p><Button onClick={()=>setShowForm(true)} size="small" className="mt-4"><Plus size={12}/> Add first product</Button></div>}
        <div className="border-t border-[#d8e2de] bg-[#f7f8fa] px-4 py-3 text-[9px] text-[#858b98]">Inventory updates are written to the database and are used by subsequent request analyses.</div>
      </section>
    </main>
  );
}

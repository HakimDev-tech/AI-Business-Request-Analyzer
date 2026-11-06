import { CatalogIngestPanel } from "@/components/catalog-ingest-panel";
import { ProductCatalogPanel } from "@/components/product-catalog-panel";

export const metadata = { title: "Catalog and knowledge base" };

export default function CatalogPage() {
  return (
    <>
      <ProductCatalogPanel />
      <CatalogIngestPanel />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import ProductForm from "@/components/admin/ProductForm";
import { AdminHeader, AdminLoading } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { listCategories } from "@/lib/products";

export const metadata: Metadata = { title: "Nouveau produit" };

export default function NewProductPage() {
  return (
    <>
      <AdminHeader
        back={
          <Link className="admin-back" href="/admin/produits">
            ← Produits
          </Link>
        }
        eyebrow="Épicerie"
        title="Nouveau produit"
      />
      <Suspense fallback={<AdminLoading />}>
        <NewProduct />
      </Suspense>
    </>
  );
}

async function NewProduct() {
  await requireAdmin();
  const categories = await listCategories(await db());
  return (
    <ProductForm
      categories={categories}
      product={{
        name: "",
        nameEn: "",
        categoryId: "",
        format: "",
        description: "",
        descriptionEn: "",
        price: "",
        stock: "",
        isActive: true,
        isTaxable: false,
        imageUrl: null,
      }}
    />
  );
}

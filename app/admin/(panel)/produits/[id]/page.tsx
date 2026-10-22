import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { deleteProduct } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/forms";
import ProductForm from "@/components/admin/ProductForm";
import { AdminHeader, AdminLoading } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { mediaUrl } from "@/lib/media";
import { centsToInput } from "@/lib/money";
import { getProduct, isUuid, listCategories } from "@/lib/products";

export const metadata: Metadata = { title: "Modifier un produit" };

export default function EditProductPage({ params }: PageProps<"/admin/produits/[id]">) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <EditProduct params={params} />
    </Suspense>
  );
}

async function EditProduct({ params }: { params: PageProps<"/admin/produits/[id]">["params"] }) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const sql = await db();
  const [product, categories] = await Promise.all([getProduct(sql, id), listCategories(sql)]);
  if (!product) notFound();

  return (
    <>
      <AdminHeader
        back={
          <Link className="admin-back" href="/admin/produits">
            ← Produits
          </Link>
        }
        eyebrow="Modifier"
        title={product.name}
        actions={
          <form action={deleteProduct}>
            <input type="hidden" name="id" value={product.id} />
            <ConfirmButton message={`Supprimer « ${product.name} » ? Il sera retiré de l’épicerie.`}>
              Supprimer
            </ConfirmButton>
          </form>
        }
      />
      <ProductForm
        categories={categories}
        product={{
          id: product.id,
          name: product.name,
          nameEn: product.nameEn,
          categoryId: product.categoryId ?? "",
          format: product.format,
          description: product.description,
          descriptionEn: product.descriptionEn,
          price: centsToInput(product.priceCents),
          stock: product.stock === null ? "" : String(product.stock),
          isActive: product.isActive,
          isTaxable: product.isTaxable,
          imageUrl: product.imageId ? mediaUrl(product.imageId) : null,
        }}
      />
    </>
  );
}

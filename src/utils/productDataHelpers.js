// File: src/utils/productDataHelpers.js

export function mapPayloadToNewProduct(payload) {
  return {
    name: {
      en: payload.nameEn || "",
      he: payload.nameHe || "",
    },
    description: {
      en: payload.descriptionEn || "",
      he: payload.descriptionHe || "",
    },
    price: payload.price ?? "",
    stock: payload.stock ?? "",
    manufacturingCost: payload.manufacturingCost ?? "",
    highlight: {
      en: payload.highlightEn || [],
      he: payload.highlightHe || [],
    },
    selectedCategories: payload.selectedCategories || [],
    allowBackorder: payload.allowBackorder || false,
    internationalShipping: payload.internationalShipping || false,
    images: payload.images || [],
    newImageUrl: "",
    discountPercentage: payload.discountPercentage ?? "",
    discountStart: payload.discountStart || "",
    discountEnd: payload.discountEnd || "",
  };
}

export function findProductIdByName(products, productName) {
  if (!productName) return null;
  const normalized = productName.trim().toLowerCase();

  const found = products.find((product) => {
    const nameHe = product.name?.he?.toLowerCase() || "";
    const nameEn = product.name?.en?.toLowerCase() || "";
    return nameHe.includes(normalized) || nameEn.includes(normalized);
  });

  return found?._id || null;
}

export function mapUpdatesToNewProduct(products, editProductId, editingProduct, updates) {
  const productToEdit = products.find((p) => p._id === editProductId);
  if (!productToEdit) return editingProduct;

  const mapped = { ...productToEdit };

  if (updates.nameHe) mapped.nameHe = updates.nameHe;
  if (updates.nameEn) mapped.nameEn = updates.nameEn;
  if (updates.price) mapped.price = updates.price;
  if (updates.stock) mapped.stock = updates.stock;
  if (updates.descriptionHe) mapped.descriptionHe = updates.descriptionHe;
  if (updates.descriptionEn) mapped.descriptionEn = updates.descriptionEn;
  if (updates.highlightHe) mapped.highlightHe = updates.highlightHe;
  if (updates.highlightEn) mapped.highlightEn = updates.highlightEn;
  if (updates.manufacturingCost) mapped.manufacturingCost = updates.manufacturingCost;
  if (updates.allowBackorder !== undefined) mapped.allowBackorder = updates.allowBackorder;
  if (updates.internationalShipping !== undefined) mapped.internationalShipping = updates.internationalShipping;
  if (updates.images) mapped.images = updates.images;
  if (updates.discountPercentage) mapped.discountPercentage = updates.discountPercentage;
  if (updates.discountStart) mapped.discountStart = updates.discountStart;
  if (updates.discountEnd) mapped.discountEnd = updates.discountEnd;
  if (updates.selectedCategories) mapped.selectedCategories = updates.selectedCategories;

  return mapped;
}

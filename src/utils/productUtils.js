export const mapPayloadToNewProduct = (payload) => {
  return {
    name: {
      en: payload.nameEn || "",
      he: payload.nameHe || "",
    },
    description: {
      en: payload.descriptionEn,
      he: payload.descriptionHe,
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
};

export const findProductIdByName = (products, productName) => {
  if (!productName) return null;
  const normalized = productName.trim().toLowerCase();
  const found = products.find((product) => {
    const nameHe = product.name?.he?.toLowerCase() || "";
    const nameEn = product.name?.en?.toLowerCase() || "";
    return nameHe.includes(normalized) || nameEn.includes(normalized);
  });
  return found?._id || null;
};

export const mapUpdatesToProduct = (productToEdit, updates) => {
  if (!productToEdit) return null;
  const updated = { ...productToEdit };
  if (updates.nameHe) updated.nameHe = updates.nameHe;
  if (updates.nameEn) updated.nameEn = updates.nameEn;
  if (updates.price) updated.price = updates.price;
  if (updates.stock) updated.stock = updates.stock;
  if (updates.descriptionHe) updated.descriptionHe = updates.descriptionHe;
  if (updates.descriptionEn) updated.descriptionEn = updates.descriptionEn;
  if (updates.highlightHe) updated.highlightHe = updates.highlightHe;
  if (updates.highlightEn) updated.highlightEn = updates.highlightEn;
  if (updates.manufacturingCost !== undefined)
    updated.manufacturingCost = updates.manufacturingCost;
  if (updates.allowBackorder !== undefined)
    updated.allowBackorder = updates.allowBackorder;
  if (updates.internationalShipping !== undefined)
    updated.internationalShipping = updates.internationalShipping;
  if (updates.images) updated.images = updates.images;
  if (updates.discountPercentage)
    updated.discountPercentage = updates.discountPercentage;
  if (updates.discountStart) updated.discountStart = updates.discountStart;
  if (updates.discountEnd) updated.discountEnd = updates.discountEnd;
  if (updates.selectedCategories)
    updated.selectedCategories = updates.selectedCategories;
  return updated;
};

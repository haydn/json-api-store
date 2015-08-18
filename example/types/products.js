Store.types["products"] = {
  title: Store.attr(),
  description: Store.attr(),
  categories: Store.hasMany(),
  // Because the inverse relationship isn't "products" we need provide it).
  comments: Store.hasMany({ inverse: "product" }),
  // This relationship is one-way (no iverse relationship).
  relatedProducts: Store.hasMany("related")
};

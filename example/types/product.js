var Product = {
  title: Store.attr(),
  description: Store.attr(),
  categories: Store.hasMany(),
  comments: Store.hasMany(),
  // This relationship is one-way (no inverse relationship).
  relatedProducts: Store.hasMany("related")
};

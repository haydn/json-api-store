var Category = {
  // Maps the "name" attribute in the data to the "title" property in the store.
  title: Store.attr("name"),
  products: Store.hasMany()
};

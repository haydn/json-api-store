Store.types["comments"] = {
  body: Store.attr(),
  // FIXME: There shouldn't be a need to set the inverse relationship here.
  product: Store.hasOne({ inverse: "comments" })
};

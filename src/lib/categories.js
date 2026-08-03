import { getCollection } from "astro:content";

export async function getAllCategories() {
  const entries = await getCollection("categories");
  return entries.map((entry) => entry.data);
}

export async function getCategoryBySlug(slug) {
  const categories = await getAllCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

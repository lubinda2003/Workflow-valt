import { getCollection } from "astro:content";

export function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function getAllWorkflows() {
  const entries = await getCollection("workflows");
  return entries.map((entry) => entry.data);
}

export async function getFeaturedWorkflows() {
  const workflows = await getAllWorkflows();
  return workflows.filter((workflow) => workflow.featured);
}

export async function getWorkflowBySlug(slug) {
  const workflows = await getAllWorkflows();
  return workflows.find((workflow) => workflow.slug === slug) ?? null;
}

export async function getWorkflowsByCategorySlug(categorySlug) {
  const workflows = await getAllWorkflows();
  return workflows.filter((workflow) => slugify(workflow.category) === categorySlug);
}

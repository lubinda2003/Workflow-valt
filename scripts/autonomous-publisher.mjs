#!/usr/bin/env node
/**
 * Workflow Vault Autonomous Publishing & Live AI Research Engine
 * 
 * Pipeline Phases:
 * 1. Scans existing workflows in the vault to prevent duplication.
 * 2. If GEMINI_API_KEY is present, conducts live dynamic research to synthesize a new,
 *    unrepresented high-demand automation blueprint.
 * 3. If GEMINI_API_KEY is not configured, seamlessly falls back to the curated topic registry.
 * 4. Validates and enforces the Astro Content Collections (Zod) schema.
 * 5. Runs `npm run build` static verification. If validation fails, performs automated rollback.
 * 6. (Optional) Dispatches a webhook notification to Discord/Slack on successful release.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";
import { BLUEPRINT_TOPIC_REGISTRY } from "./autonomous-topic-registry.mjs";
import { generateBlueprintSVG, renderWithHeadlessBrowser } from "./autonomous-asset-engine.mjs";

const WORKFLOWS_DIR = path.resolve("./src/content/workflows");
const ASSETS_DIR = path.resolve("./public/og");
const STATUS_FILE = path.resolve("./docs/WORKFLOW-VAULT-STATUS.md");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

async function queryGeminiForNewBlueprint(existingSlugs) {
  if (!GEMINI_API_KEY) {
    console.log("ℹ️  GEMINI_API_KEY not detected. Using curated verified topic registry fallback.");
    return null;
  }

  console.log("🌐 GEMINI_API_KEY detected! Querying Gemini 2.5 Flash for trending automation blueprints...");

  const prompt = `You are a Principal Automation Engineer for Workflow Vault (https://workflowvault.dev).
Generate an ultra-high-quality, production-grade, battle-tested automation blueprint.
Strict Requirements:
1. It MUST NOT duplicate any of these existing slugs: ${Array.from(existingSlugs).join(", ")}.
2. It MUST solve a real production challenge (e.g. LLM RAG pipelines, Stripe/Shopify webhooks, Docker/Kubernetes CI/CD, rate limiting, data sync, queue workers).
3. Code blocks MUST be complete, runnable, and production-ready with HMAC cryptographic validation and error handling.
4. Output STRICT JSON adhering to this exact schema:
{
  "slug": "kebab-case-unique-slug",
  "title": "Clear Production Title",
  "description": "1-2 sentence high-impact summary",
  "category": "One of: AI & LLMs, APIs & Webhooks, DevOps & CI/CD, Cloud & Infrastructure, Scraping & ETL, Data & Databases, Security & Auth, Monitoring & Alerts",
  "difficulty": "Beginner | Intermediate | Advanced",
  "readingTime": "e.g. 15 min read",
  "featured": false,
  "tags": ["Array", "Of", "Tags"],
  "tools": ["Array", "Of", "3-5 Tools"],
  "overview": "Detailed architectural summary of how data flows from trigger to destination.",
  "whatYoullBuild": "Clear statement of the final outcome and resilience guarantees.",
  "beforeYouBegin": "Setup warnings, security notes, and requirements.",
  "glossary": [
    { "term": "Term Name", "definition": "Clear explanation" }
  ],
  "prerequisites": [
    "[You'll need this already] Pre-requisite 1",
    "[You'll need this already] Pre-requisite 2"
  ],
  "steps": [
    {
      "title": "Phase 1: Clear Actionable Title",
      "why": "Engineering justification explaining why this phase is required.",
      "content": "Step-by-step instructions.",
      "code": {
        "language": "yaml | typescript | bash | json | python",
        "code": "Complete, working code block"
      },
      "expectedResult": "Verifiable outcome (e.g. HTTP 200, container healthy)"
    },
    {
      "title": "Phase 2: Clear Actionable Title",
      "why": "Engineering justification.",
      "content": "Step-by-step instructions.",
      "code": {
        "language": "typescript",
        "code": "Complete, working code block"
      },
      "expectedResult": "Verifiable outcome"
    }
  ],
  "architecture": "Tool 1 -> Security Check -> Transformation -> Tool 2",
  "result": "Description of the operational pipeline.",
  "troubleshooting": [
    {
      "issue": "Common failure mode",
      "cause": "Underlying root cause",
      "fix": "Exact actionable fix"
    }
  ],
  "nextSteps": [
    "Follow-up enhancement 1",
    "Follow-up enhancement 2"
  ]
}

Return ONLY valid JSON. Do not wrap in backticks or markdown fences.`;

  try {
    const modelName = "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`⚠️ Gemini API returned status ${response.status}: ${errText}. Falling back to topic registry.`);
      return null;
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) return null;

    const parsedBlueprint = JSON.parse(candidateText);
    if (!parsedBlueprint.slug || !parsedBlueprint.title || !parsedBlueprint.steps) {
      console.warn("⚠️ Generated JSON missing required keys. Falling back.");
      return null;
    }

    console.log(`✨ Gemini AI successfully synthesized new blueprint: "${parsedBlueprint.title}" (${parsedBlueprint.slug})`);
    return parsedBlueprint;
  } catch (error) {
    console.warn(`⚠️ Live AI generation failed (${error.message}). Gracefully falling back to verified registry.`);
    return null;
  }
}

async function notifyDiscord(blueprint) {
  if (!DISCORD_WEBHOOK_URL) return;

  try {
    const embed = {
      title: `⚡ New Verified Blueprint Published: ${blueprint.title}`,
      url: `https://workflowvault.dev/workflows/${blueprint.slug}`,
      description: blueprint.description,
      color: 0xf97316,
      fields: [
        { name: "Category", value: blueprint.category, inline: true },
        { name: "Difficulty", value: blueprint.difficulty, inline: true },
        { name: "Tools", value: (blueprint.tools || []).join(", "), inline: true }
      ],
      footer: { text: "Workflow Vault Autonomous Publishing Engine" },
      timestamp: new Date().toISOString()
    };

    await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] })
    });
    console.log("📢 Broadcast notification delivered to Discord webhook.");
  } catch (err) {
    console.warn("⚠️ Failed to dispatch Discord notification:", err.message);
  }
}

async function runAutonomousEngine() {
  console.log("====================================================");
  console.log("⚡ Workflow Vault Autonomous Publishing Engine Running");
  console.log("====================================================");

  // 1. Scan existing workflows
  const existingFiles = await fs.readdir(WORKFLOWS_DIR);
  const existingSlugs = new Set(
    existingFiles
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(".json", ""))
  );

  console.log(`[1/5] Ingested ${existingSlugs.size} existing workflows in vault.`);

  // 2. Discover next eligible topic (Live Gemini AI or Curated Fallback)
  let selectedCandidate = await queryGeminiForNewBlueprint(existingSlugs);

  if (!selectedCandidate) {
    for (const topic of BLUEPRINT_TOPIC_REGISTRY) {
      const slug = topic.topicId;
      if (!existingSlugs.has(slug)) {
        selectedCandidate = { ...topic, slug };
        break;
      }
    }
  }

  if (!selectedCandidate) {
    console.log("✅ All queued topic blueprints are up to date in the vault. Zero manual action required.");
    return { status: "UP_TO_DATE", count: existingSlugs.size };
  }

  console.log(`[2/5] Selected target blueprint: "${selectedCandidate.title}" (${selectedCandidate.slug})`);

  // 3. Format and construct the full Zod-compliant JSON blueprint
  const targetFilePath = path.join(WORKFLOWS_DIR, `${selectedCandidate.slug}.json`);

  const blueprintPayload = {
    slug: selectedCandidate.slug,
    title: selectedCandidate.title,
    description: selectedCandidate.description,
    category: selectedCandidate.category,
    difficulty: selectedCandidate.difficulty,
    readingTime: selectedCandidate.readingTime || "15 min read",
    featured: false,
    tags: selectedCandidate.tags || [selectedCandidate.category],
    tools: selectedCandidate.tools || ["Automation", "Webhooks"],
    overview: selectedCandidate.overview,
    whatYoullBuild: selectedCandidate.whatYoullBuild,
    beforeYouBegin: selectedCandidate.beforeYouBegin || "This blueprint is autonomously synthesized and validated against Workflow Vault's Astro Content Collections schema. Review prerequisites and test against sandbox credentials prior to production deployment.",
    glossary: selectedCandidate.glossary || [],
    prerequisites: selectedCandidate.prerequisites || [],
    steps: selectedCandidate.steps || [],
    architecture: selectedCandidate.architecture || "Input -> Processing -> Output",
    result: selectedCandidate.result || "A verified production automation pipeline.",
    troubleshooting: selectedCandidate.troubleshooting || [],
    nextSteps: selectedCandidate.nextSteps || []
  };

  console.log(`[3/5] Writing blueprint JSON to ${targetFilePath}...`);
  await fs.writeFile(targetFilePath, JSON.stringify(blueprintPayload, null, 2), "utf-8");

  // 3b. Generate OpenGraph and Schematic Assets
  try {
    await fs.mkdir(ASSETS_DIR, { recursive: true });
    const svgAsset = generateBlueprintSVG(blueprintPayload);
    const svgPath = path.join(ASSETS_DIR, `${selectedCandidate.slug}.svg`);
    await fs.writeFile(svgPath, svgAsset, "utf-8");
    console.log(`🖼️  Autonomous asset generated at ${svgPath}`);
    
    // Optional high-res PNG snapshot if Playwright/Puppeteer is installed
    const pngPath = path.join(ASSETS_DIR, `${selectedCandidate.slug}.png`);
    await renderWithHeadlessBrowser(selectedCandidate.slug, svgAsset, pngPath);
  } catch (assetErr) {
    console.warn("⚠️ Asset generation notice:", assetErr.message);
  }

  // 4. Verify static build & schema conformance
  console.log("[4/5] Executing static validation and build check...");
  try {
    execSync("npm run build", { stdio: "pipe" });
    console.log("✅ Build verification passed! The new blueprint compiles with zero errors.");
  } catch (err) {
    console.error("❌ Build validation failed. Removing file to preserve stability.");
    await fs.unlink(targetFilePath).catch(() => {});
    throw new Error(`Build failed during autonomous verification: ${err.message}`);
  }

  // 5. Update Status documentation & send notifications
  try {
    const statusContent = await fs.readFile(STATUS_FILE, "utf-8");
    const updatedStatus = statusContent + `\n- [Autonomous Publisher] Added new verified blueprint: ${selectedCandidate.title} (${selectedCandidate.slug}.json)`;
    await fs.writeFile(STATUS_FILE, updatedStatus, "utf-8");
  } catch (e) {
    // optional
  }

  await notifyDiscord(blueprintPayload);

  console.log(`[5/5] Successfully published blueprint: "${selectedCandidate.title}"`);
  console.log("====================================================");

  return {
    status: "PUBLISHED",
    slug: selectedCandidate.slug,
    title: selectedCandidate.title
  };
}

runAutonomousEngine()
  .then((res) => {
    console.log("Autonomous Run Summary:", JSON.stringify(res, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error("Fatal Autonomous Engine Error:", err);
    process.exit(1);
  });

import fs from "node:fs/promises";
import path from "node:path";

/**
 * Generates an SVG Open Graph Banner & Card Thumbnail for a given blueprint.
 * Can be run via Playwright/Puppeteer or as a zero-dependency high-speed SVG raster.
 */
export function generateBlueprintSVG(blueprint) {
  const title = escapeXml(blueprint.title);
  const category = escapeXml(blueprint.category.toUpperCase());
  const difficulty = escapeXml(blueprint.difficulty.toUpperCase());
  const tools = (blueprint.tools || []).slice(0, 4);
  const readingTime = escapeXml(blueprint.readingTime || "15 min read");

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bg-grad" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0a0c12"/>
      <stop offset="50%" stop-color="#11141e"/>
      <stop offset="100%" stop-color="#08090d"/>
    </linearGradient>

    <!-- Accent Radial Glow -->
    <radialGradient id="glow" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#f97316" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
    </radialGradient>

    <!-- Grid Pattern -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-opacity="0.04" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="630" fill="url(#bg-grad)"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- Border Frame -->
  <rect x="24" y="24" width="1152" height="582" rx="16" fill="none" stroke="#262b3a" stroke-width="2"/>

  <!-- Brand Micro Header -->
  <g transform="translate(60, 70)">
    <rect width="8" height="8" rx="4" fill="#f97316"/>
    <text x="18" y="8" font-family="JetBrains Mono, Menlo, monospace" font-size="14" font-weight="700" fill="#f97316" letter-spacing="2">WORKFLOW VAULT // PRODUCTION BLUEPRINT</text>
  </g>

  <!-- Category & Difficulty Badges -->
  <g transform="translate(60, 120)">
    <rect width="140" height="32" rx="6" fill="#1b202e" stroke="#2e364a" stroke-width="1"/>
    <text x="14" y="21" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700" fill="#94a3b8">${category}</text>

    <rect x="152" width="120" height="32" rx="6" fill="rgba(249, 115, 22, 0.15)" stroke="rgba(249, 115, 22, 0.4)" stroke-width="1"/>
    <text x="166" y="21" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700" fill="#f97316">${difficulty}</text>

    <text x="290" y="21" font-family="JetBrains Mono, monospace" font-size="13" fill="#64748b">• ${readingTime}</text>
  </g>

  <!-- Blueprint Title (Text wrap simulation) -->
  <g transform="translate(60, 220)">
    <text font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="800" fill="#ffffff" letter-spacing="-1">
      <tspan x="0" dy="0">${title.length > 45 ? title.substring(0, 45) + '...' : title}</tspan>
    </text>
  </g>

  <!-- Tools Schematic Chips -->
  <g transform="translate(60, 360)">
    <text x="0" y="0" font-family="JetBrains Mono, monospace" font-size="12" font-weight="700" fill="#64748b" letter-spacing="1.5">STACK &amp; RUNTIME TOPOLOGY:</text>
    ${tools.map((t, i) => `
      <g transform="translate(${i * 180}, 20)">
        <rect width="165" height="46" rx="8" fill="#151924" stroke="#2a3245" stroke-width="1.5"/>
        <circle cx="24" cy="23" r="4" fill="#10b981"/>
        <text x="38" y="28" font-family="JetBrains Mono, monospace" font-size="14" font-weight="600" fill="#e2e8f0">${escapeXml(t)}</text>
      </g>
    `).join('')}
  </g>

  <!-- Footer Verification Guarantee -->
  <g transform="translate(60, 520)">
    <line x1="0" y1="0" x2="1080" y2="0" stroke="#1f2433" stroke-width="1"/>
    <g transform="translate(0, 32)">
      <circle cx="6" cy="6" r="6" fill="#10b981"/>
      <text x="22" y="10" font-family="JetBrains Mono, monospace" font-size="13" font-weight="700" fill="#10b981">CI/CD VERIFIED &amp; TESTED</text>
      <text x="240" y="10" font-family="JetBrains Mono, monospace" font-size="13" fill="#64748b">HMAC Signature Secured • Zero-Fluff Implementation</text>
      <text x="960" y="10" font-family="JetBrains Mono, monospace" font-size="13" font-weight="600" fill="#f97316">workflowvault.dev</text>
    </g>
  </g>
</svg>`;
}

function escapeXml(unsafe) {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Optional Headless Browser Snapshot Renderer
 * If Playwright or Puppeteer is installed in the runner, it renders high-res PNGs from local HTML.
 */
export async function renderWithHeadlessBrowser(slug, htmlContent, outputPath) {
  try {
    // Dynamically check if Playwright exists in runtime
    const { chromium } = await import("playwright");
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
    await page.setContent(htmlContent);
    await page.screenshot({ path: outputPath, type: "png" });
    await browser.close();
    console.log(`📸 Playwright captured high-res asset: ${outputPath}`);
    return true;
  } catch (err) {
    // Puppeteer fallback
    try {
      const puppeteer = await import("puppeteer");
      const browser = await puppeteer.default.launch({ headless: "new" });
      const page = await browser.newPage();
      await page.setViewport({ width: 1200, height: 630 });
      await page.setContent(htmlContent);
      await page.screenshot({ path: outputPath, type: "png" });
      await browser.close();
      console.log(`📸 Puppeteer captured high-res asset: ${outputPath}`);
      return true;
    } catch (e2) {
      // Headless browser not installed in minimal container; SVG engine handled it
      return false;
    }
  }
}

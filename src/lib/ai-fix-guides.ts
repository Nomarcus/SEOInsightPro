/**
 * AI Search Readiness — Detailed Fix Guides
 *
 * Maps each AI signal ID to step-by-step fix instructions
 * written for non-technical users. Used by the Fix Guide page.
 */

export interface AIFixGuide {
  fixSteps: string[];
  solutionSnippets: (string | null)[];
  estimatedFixTime: string;
  technicalLevel: "beginner" | "intermediate" | "advanced";
  tools: string[];
}

const AI_FIX_GUIDES: Record<string, AIFixGuide> = {
  schema: {
    fixSteps: [
      "Decide which schema type fits your page: `Article` for blog posts, `Product` for product pages, `LocalBusiness` for local companies, `FAQPage` for FAQ sections, or `HowTo` for tutorials.",
      "Go to Schema.org (schema.org) and find the properties for your chosen type. At minimum include: `@type`, `name`, `description`, `url`, and `image`.",
      "Create a JSON-LD script block and place it in your page's `<head>` section. Example: `<script type=\"application/ld+json\">{\"@context\":\"https://schema.org\",\"@type\":\"Article\",\"headline\":\"Your Title\",\"author\":{\"@type\":\"Person\",\"name\":\"Author Name\"}}</script>`",
      "Test your markup using Google's Rich Results Test at search.google.com/test/rich-results — paste your URL and verify no errors are shown.",
      "If you use a CMS like WordPress, install the 'Yoast SEO' or 'Rank Math' plugin which generates JSON-LD automatically based on your content.",
    ],
    solutionSnippets: [
      null,
      null,
      `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Your Page Title Here",
  "description": "A brief description of your article content.",
  "image": "https://yoursite.com/images/featured.jpg",
  "author": {
    "@type": "Person",
    "name": "Author Name",
    "url": "https://yoursite.com/about"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Your Company Name",
    "logo": {
      "@type": "ImageObject",
      "url": "https://yoursite.com/logo.png"
    }
  },
  "datePublished": "2026-01-15",
  "dateModified": "2026-03-01"
}
</script>`,
      null,
      null,
    ],
    estimatedFixTime: "30 minutes",
    technicalLevel: "intermediate",
    tools: ["Schema.org", "Google Rich Results Test", "Yoast SEO / Rank Math"],
  },

  faq: {
    fixSteps: [
      "Identify 3-5 common questions your visitors ask about your topic. Use Google's 'People Also Ask' section for inspiration — search your main keyword and note the questions shown.",
      "Add each question as an H2 or H3 heading on your page, starting with question words like 'What', 'How', 'Why', 'When', or 'Where'. Write a clear, direct answer (2-4 sentences) immediately below each heading.",
      "Add FAQPage JSON-LD schema to your `<head>`. Example: `<script type=\"application/ld+json\">{\"@context\":\"https://schema.org\",\"@type\":\"FAQPage\",\"mainEntity\":[{\"@type\":\"Question\",\"name\":\"Your question?\",\"acceptedAnswer\":{\"@type\":\"Answer\",\"text\":\"Your answer.\"}}]}</script>`",
      "Validate your FAQ schema using Google's Rich Results Test. If it passes, Google may show your FAQ directly in search results and AI Overviews.",
    ],
    solutionSnippets: [
      null,
      `<h2>What Is [Your Topic]?</h2>
<p>[Your Topic] is... Write a clear, direct answer
in 2-4 sentences that explains the concept.</p>

<h2>How Does [Your Topic] Work?</h2>
<p>Explain the process step by step. Be specific
and include details that demonstrate expertise.</p>

<h2>Why Is [Your Topic] Important?</h2>
<p>Describe the key benefits. Use concrete examples
or real statistics when possible.</p>`,
      `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is [your topic]?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Write your clear answer here. Aim for 2-4 sentences."
      }
    },
    {
      "@type": "Question",
      "name": "How does [your topic] work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Explain the process or mechanism clearly."
      }
    },
    {
      "@type": "Question",
      "name": "Why is [your topic] important?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Describe the benefits with concrete examples."
      }
    }
  ]
}
</script>`,
      null,
    ],
    estimatedFixTime: "20 minutes",
    technicalLevel: "intermediate",
    tools: [
      "Google Rich Results Test",
      "Google Search (People Also Ask)",
      "AnswerThePublic.com",
    ],
  },

  author: {
    fixSteps: [
      "Add a meta author tag to your page's `<head>` section: `<meta name=\"author\" content=\"Your Full Name\">`",
      "If your CMS supports it, fill in the author profile field — WordPress has this under Users → Your Profile. Make sure your display name is your real full name.",
      "Add a visible author byline on the page itself — near the title, show 'By [Author Name]' with a link to an author bio page. This builds E-E-A-T trust.",
      "For maximum AI visibility, add Person JSON-LD: `<script type=\"application/ld+json\">{\"@context\":\"https://schema.org\",\"@type\":\"Person\",\"name\":\"Your Name\",\"url\":\"https://yoursite.com/about\",\"sameAs\":[\"https://linkedin.com/in/yourprofile\"]}</script>`",
    ],
    solutionSnippets: [
      `<meta name="author" content="Your Full Name">`,
      null,
      `<p class="author-byline">
  By <a href="/about">Your Full Name</a>
  · Published <time datetime="2026-01-15">January 15, 2026</time>
</p>`,
      `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Your Full Name",
  "url": "https://yoursite.com/about",
  "jobTitle": "Your Job Title",
  "worksFor": {
    "@type": "Organization",
    "name": "Your Company Name"
  },
  "sameAs": [
    "https://linkedin.com/in/yourprofile",
    "https://twitter.com/yourhandle"
  ]
}
</script>`,
    ],
    estimatedFixTime: "10 minutes",
    technicalLevel: "beginner",
    tools: ["Text Editor / CMS Admin", "LinkedIn Profile URL"],
  },

  depth: {
    fixSteps: [
      "Check your current word count — you can use wordcounter.net or your CMS's built-in counter. AI systems prefer pages with 1,500+ words for in-depth topics.",
      "Identify gaps in your content by comparing with the top 3 Google results for your main keyword. Note which subtopics they cover that you don't.",
      "Expand your page by adding new sections: detailed explanations, real-world examples, step-by-step guides, comparison tables, or a FAQ section at the bottom.",
      "Use clear H2/H3 headings for each new section so AI crawlers can easily parse and understand the structure of your expanded content.",
      "After expanding, re-read for quality — avoid filler text. Every paragraph should add genuine value. AI systems detect and deprioritise low-quality padding.",
    ],
    solutionSnippets: [
      null,
      null,
      null,
      `<h2>What Is [Subtopic]?</h2>
<p>Your detailed explanation here...</p>

<h2>Step-by-Step Guide to [Process]</h2>
<ol>
  <li>First step with details...</li>
  <li>Second step with details...</li>
  <li>Third step with details...</li>
</ol>

<h2>[Topic A] vs [Topic B]: Key Differences</h2>
<table>
  <tr><th>Feature</th><th>[Topic A]</th><th>[Topic B]</th></tr>
  <tr><td>Feature 1</td><td>Value</td><td>Value</td></tr>
  <tr><td>Feature 2</td><td>Value</td><td>Value</td></tr>
</table>`,
      null,
    ],
    estimatedFixTime: "1-2 hours",
    technicalLevel: "intermediate",
    tools: ["WordCounter.net", "Google Search (competitor analysis)", "CMS Editor"],
  },

  freshness: {
    fixSteps: [
      "Add a published date meta tag to your `<head>`: `<meta property=\"article:published_time\" content=\"2024-01-15T08:00:00Z\">`",
      "Add a modified date meta tag: `<meta property=\"article:modified_time\" content=\"2026-03-01T10:00:00Z\">` — update this every time you change the content.",
      "If you use WordPress, these tags are usually added automatically by SEO plugins (Yoast, Rank Math). Check Settings → SEO → Appearance → Date in SERP.",
      "Show a visible 'Last updated: [date]' label on the page itself. This signals freshness to both users and AI crawlers scanning the page content.",
      "Set a calendar reminder to review and update your content every 3-6 months. Even small updates (adding new stats, refreshing examples) reset the freshness signal.",
    ],
    solutionSnippets: [
      `<meta property="article:published_time" content="2026-01-15T08:00:00Z">`,
      `<meta property="article:modified_time" content="2026-03-01T10:00:00Z">`,
      null,
      `<p class="last-updated">
  Last updated: <time datetime="2026-03-01">March 1, 2026</time>
</p>`,
      null,
    ],
    estimatedFixTime: "10 minutes",
    technicalLevel: "beginner",
    tools: ["CMS Admin / Text Editor", "Yoast SEO / Rank Math"],
  },

  structure: {
    fixSteps: [
      "Review your page's current heading structure — every page should have exactly one H1 (the main title) followed by multiple H2 headings for major sections.",
      "Add H2 headings to break your content into clear, scannable sections. Aim for at least 5 H2/H3 headings. Each should describe what the section is about.",
      "Use question-format headings where possible: 'What is X?', 'How does Y work?', 'Why is Z important?' — these match how people search and how AI Overviews are structured.",
      "Add H3 sub-headings under your H2 sections for detailed breakdowns. Example: H2 'How to Fix SEO Issues' → H3 'Fix Missing Meta Descriptions' → H3 'Fix Broken Links'.",
      "Consider adding a table of contents at the top of long pages with links to each section. This helps both users and AI systems navigate your content.",
    ],
    solutionSnippets: [
      null,
      null,
      `<h2>What Is [Your Topic]?</h2>
<p>Your answer here...</p>

<h2>How Does [Your Topic] Work?</h2>
<p>Your explanation here...</p>

<h2>Why Is [Your Topic] Important?</h2>
<p>Your reasoning here...</p>

<h3>What Are the Benefits of [Your Topic]?</h3>
<p>Your details here...</p>

<h3>When Should You Use [Your Topic]?</h3>
<p>Your guidance here...</p>`,
      null,
      `<nav aria-label="Table of Contents">
  <h2>Table of Contents</h2>
  <ol>
    <li><a href="#what-is-topic">What Is [Your Topic]?</a></li>
    <li><a href="#how-it-works">How Does It Work?</a></li>
    <li><a href="#why-important">Why Is It Important?</a></li>
    <li><a href="#faq">Frequently Asked Questions</a></li>
  </ol>
</nav>`,
    ],
    estimatedFixTime: "20 minutes",
    technicalLevel: "beginner",
    tools: ["CMS Editor", "Browser DevTools (F12 → Elements)"],
  },

  crawler: {
    fixSteps: [
      "Check your `robots.txt` file at `yoursite.com/robots.txt`. Look for lines that block AI bots: `User-agent: GPTBot`, `User-agent: ClaudeBot`, `User-agent: CCBot` followed by `Disallow: /`.",
      "If you find AI bot blocks, remove those lines or change `Disallow: /` to `Allow: /` to let AI crawlers index your content.",
      "Check your page's HTML for `<meta>` tags that block AI: look for `<meta name=\"robots\" content=\"noai\">` or similar. Remove them if found.",
      "In WordPress, check Settings → Reading → 'Discourage search engines' is unchecked. Also check your SEO plugin's crawler settings.",
      "Verify the fix: use Google Search Console's URL Inspection tool to confirm your page is crawlable, and check robots.txt again after saving changes.",
    ],
    solutionSnippets: [
      null,
      `# robots.txt — Allow AI crawlers
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: *
Allow: /

Sitemap: https://yoursite.com/sitemap.xml`,
      `<!-- REMOVE this if found in your <head>: -->
<!-- <meta name="robots" content="noai, noimageai"> -->

<!-- KEEP your normal robots meta tag: -->
<meta name="robots" content="index, follow">`,
      null,
      null,
    ],
    estimatedFixTime: "15 minutes",
    technicalLevel: "intermediate",
    tools: [
      "FTP/File Manager",
      "Google Search Console",
      "robots.txt Editor (CMS)",
    ],
  },

  entity: {
    fixSteps: [
      "Create an Organization (or LocalBusiness) JSON-LD schema with your company details. At minimum include: `name`, `url`, `logo`, `description`.",
      "Add `sameAs` links to your official profiles: LinkedIn company page, Facebook, Twitter/X, Wikipedia (if you have one), Crunchbase, etc. This connects your entity across the web.",
      "Place the JSON-LD in your site's `<head>` on every page (ideally in a shared layout/header): `<script type=\"application/ld+json\">{\"@context\":\"https://schema.org\",\"@type\":\"Organization\",\"name\":\"Your Company\",\"url\":\"https://yoursite.com\",\"logo\":\"https://yoursite.com/logo.png\",\"sameAs\":[\"https://linkedin.com/company/yours\"]}</script>`",
      "Validate with Google's Rich Results Test. When correct, Google's Knowledge Graph may start displaying your brand information in search results.",
    ],
    solutionSnippets: [
      `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company Name",
  "url": "https://yoursite.com",
  "logo": "https://yoursite.com/logo.png",
  "description": "Brief description of your company.",
  "foundingDate": "2020",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-000-0000",
    "contactType": "customer service"
  },
  "sameAs": [
    "https://linkedin.com/company/yourcompany",
    "https://twitter.com/yourcompany",
    "https://facebook.com/yourcompany"
  ]
}
</script>`,
      null,
      null,
      null,
    ],
    estimatedFixTime: "15 minutes",
    technicalLevel: "intermediate",
    tools: [
      "Google Rich Results Test",
      "Schema.org",
      "Google Knowledge Graph",
    ],
  },

  https: {
    fixSteps: [
      "Contact your web hosting provider and ask them to install a free SSL certificate (most hosts offer free Let's Encrypt SSL). Many hosts have a one-click setup in the control panel.",
      "If you use WordPress, install the 'Really Simple SSL' plugin — it automatically redirects all HTTP traffic to HTTPS and fixes mixed content issues.",
      "Update all internal links in your content, menus, and settings from `http://` to `https://`. Search your database or files for `http://yourdomain.com` and replace with `https://`.",
      "Set up a permanent 301 redirect from HTTP to HTTPS. In `.htaccess` add: `RewriteEngine On` / `RewriteCond %{HTTPS} off` / `RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`",
      "Update your site URL in Google Search Console by adding the HTTPS version as a new property, and submit your sitemap again.",
    ],
    solutionSnippets: [
      null,
      null,
      null,
      `# Add to your .htaccess file
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`,
      null,
    ],
    estimatedFixTime: "1-2 hours",
    technicalLevel: "advanced",
    tools: [
      "Hosting Control Panel",
      "Really Simple SSL (WordPress)",
      "Google Search Console",
    ],
  },

  language: {
    fixSteps: [
      "Open your site's main HTML template or layout file. Find the opening `<html>` tag.",
      "Add the `lang` attribute with your language code: `<html lang=\"en\">` for English, `<html lang=\"sv\">` for Swedish, `<html lang=\"de\">` for German, etc.",
      "If you use a CMS like WordPress, go to Settings → General → Site Language and make sure the correct language is selected. WordPress sets the `lang` attribute automatically.",
      "For multilingual sites, ensure each page version has the correct `lang` value. Use `hreflang` tags to link translations: `<link rel=\"alternate\" hreflang=\"sv\" href=\"https://yoursite.com/sv/\">`",
    ],
    solutionSnippets: [
      null,
      `<!-- English -->
<html lang="en">

<!-- Swedish -->
<html lang="sv">

<!-- German -->
<html lang="de">

<!-- Spanish -->
<html lang="es">

<!-- French -->
<html lang="fr">`,
      null,
      `<link rel="alternate" hreflang="en" href="https://yoursite.com/en/">
<link rel="alternate" hreflang="sv" href="https://yoursite.com/sv/">
<link rel="alternate" hreflang="de" href="https://yoursite.com/de/">
<link rel="alternate" hreflang="x-default" href="https://yoursite.com/">`,
    ],
    estimatedFixTime: "5 minutes",
    technicalLevel: "beginner",
    tools: ["CMS Admin / Text Editor"],
  },

  refs: {
    fixSteps: [
      "Review your page content and identify claims, statistics, or definitions that could benefit from external source links.",
      "Find 3-5 authoritative sources to link to: government websites (.gov), educational institutions (.edu), Wikipedia, official industry reports, or well-known publications.",
      "Add the links naturally within your text — don't just list them at the bottom. Example: 'According to [Google's SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)...'",
      "Set all external links to open in a new tab using `target=\"_blank\"` and `rel=\"noopener noreferrer\"` for security. This keeps visitors on your site.",
      "Avoid linking to competitors or low-quality sites. Focus on sources that demonstrate you've done research and are part of the topic's knowledge ecosystem.",
    ],
    solutionSnippets: [
      null,
      null,
      `<a href="https://developers.google.com/search/docs"
   target="_blank"
   rel="noopener noreferrer">
  Google Search Documentation
</a>`,
      `<!-- Template for external links -->
<a href="https://example.com/source"
   target="_blank"
   rel="noopener noreferrer">
  Source Title Here
</a>`,
      null,
    ],
    estimatedFixTime: "15 minutes",
    technicalLevel: "beginner",
    tools: ["CMS Editor / Text Editor", "Google Scholar"],
  },
};

/** Get detailed fix guide for an AI signal by its ID */
export function getAIFixGuide(signalId: string): AIFixGuide | null {
  return AI_FIX_GUIDES[signalId] ?? null;
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.shelfieease.app",
  generateRobotsTxt: true,
  changefreq: "weekly",
  priority: 0.7,
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/tiktok", "/admin", "/debug", "/api"] },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },
    ],
    additionalSitemaps: [],
  },
  exclude: ["/tiktok", "/tiktok/*", "/admin/*", "/debug", "/api/*", "/pay/*"],
  transform: async (config, path) => {
    const landingPaths = new Set([
      "/",
      "/booktok-shelf-tracker",
      "/goodreads-alternative",
      "/isbn-book-scanner",
      "/boektok",
    ]);

    return {
      loc: path,
      changefreq: landingPaths.has(path) ? "weekly" : "monthly",
      priority: path === "/" ? 1 : landingPaths.has(path) ? 0.9 : 0.6,
      lastmod: new Date().toISOString(),
    };
  },
};

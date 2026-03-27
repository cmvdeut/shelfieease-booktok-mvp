/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.shelfieease.app",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/tiktok", "/admin", "/debug", "/api"] },
    ],
  },
  exclude: ["/tiktok", "/tiktok/*", "/admin/*", "/debug", "/api/*"],
};

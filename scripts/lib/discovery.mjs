import { execFileSync } from "node:child_process";
import { load } from "cheerio";
import TurndownService from "turndown";
import { root } from "./io.mjs";

export function resolveSite(config, env = process.env) {
  const url = new URL(env.SITE_URL || config.url);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  )
    throw new Error("SITE_URL 必须是无路径的 HTTPS 站点地址");
  const flag = env.SITE_INDEXABLE;
  if (flag && !["true", "false"].includes(flag))
    throw new Error("SITE_INDEXABLE 仅允许 true / false");
  const indexable = flag ? flag === "true" : config.indexable;
  if (
    indexable &&
    /(?:\.workers\.dev|\.localhost|^localhost)$/.test(url.hostname)
  )
    throw new Error("测试地址禁止开放收录，请先配置正式域名");
  return {
    ...config,
    url: url.origin,
    indexable,
    repository: env.PUBLIC_REPOSITORY || config.repository,
  };
}
export const xml = (value) =>
  String(value).replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );
export const jsonLd = (value) => JSON.stringify(value).replace(/</g, "\\u003c");
export function gitDate(path, oldest = false) {
  try {
    const lines = execFileSync("git", ["log", "--format=%cI", "--", path], {
      cwd: root,
      encoding: "utf8",
      windowsHide: true,
    })
      .trim()
      .split("\n")
      .filter(Boolean);
    return oldest ? lines.at(-1) : lines[0];
  } catch {
    return undefined;
  }
}
let intentHistory;
export function intentDate(id) {
  try {
    if (!intentHistory) {
      const commits = execFileSync(
      "git",
      ["log", "--format=%H %cI", "--", "content/discovery.json"],
      { cwd: root, encoding: "utf8", windowsHide: true },
    )
      .trim()
      .split("\n")
      .filter(Boolean);
      intentHistory = commits.map(line => {
      const [commit, at] = line.split(" ");
      const value = JSON.parse(
        execFileSync("git", ["show", `${commit}:content/discovery.json`], {
          cwd: root,
          encoding: "utf8",
          windowsHide: true,
          stdio: ["ignore", "pipe", "ignore"],
        }),
      );
      return { at, pages: value.pages };
      });
    }
    let previous, date;
    for (const revision of intentHistory) {
      const value = revision.pages.find((p) => p.id === id);
      if (value === undefined && previous === undefined) continue;
      const serialized = JSON.stringify(value);
      if (previous !== undefined && previous !== serialized) break;
      previous = serialized;
      date = revision.at;
    }
    return date;
  } catch {
    return undefined;
  }
}
export function sourceLinks(page, registry) {
  return (page.sources || []).map((id) => {
    const baseline = page.reviewedSources[id];
    const source = registry.sources.find((s) => s.id === id);
    if (!baseline?.commit || !baseline.path)
      throw new Error(`来源没有固定路径与提交：${page.id}/${id}`);
    return {
      id,
      label: source.label,
      url: `https://github.com/${registry.repository}/blob/${baseline.commit}/${baseline.path}`,
      ...baseline,
    };
  });
}
export function structuredData(page, site) {
  const org = `${site.url}/#maintainers`;
  const website = `${site.url}/#website`;
  const url = site.url + page.route;
  const graph = [
    {
      "@type": "Organization",
      "@id": org,
      name: "HyperFrames 中文指南维护者",
      url: site.url + "/community/about/",
      description: "独立维护的中文开源学习项目，不代表 HeyGen 官方。",
      sameAs: [site.repository],
    },
    {
      "@type": "WebSite",
      "@id": website,
      name: site.name,
      url: site.url + "/",
      inLanguage: "zh-CN",
      publisher: { "@id": org },
    },
    {
      "@type": page.kind === "index" ? "CollectionPage" : "WebPage",
      "@id": url + "#webpage",
      url,
      name: page.title,
      description: page.description,
      inLanguage: "zh-CN",
      isPartOf: { "@id": website },
      breadcrumb:
        page.id === "home" ? undefined : { "@id": url + "#breadcrumb" },
      dateModified: page.modified,
      citation: page.sources.map((s) => s.url),
    },
  ];
  if (page.id !== "home")
    graph.push({
      "@type": "BreadcrumbList",
      "@id": url + "#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "首页",
          item: site.url + "/",
        },
        { "@type": "ListItem", position: 2, name: page.title, item: url },
      ],
    });
  if (["tutorial", "adaptation", "case", "update"].includes(page.kind))
    graph.push({
      "@type": page.kind === "update" ? "Article" : "TechArticle",
      "@id": url + "#article",
      headline: page.title,
      description: page.description,
      mainEntityOfPage: { "@id": url + "#webpage" },
      inLanguage: "zh-CN",
      author: { "@id": org },
      publisher: { "@id": org },
      dateModified: page.modified,
      citation: page.sources.map((s) => s.url),
      about: {
        "@type": "SoftwareApplication",
        name: "HyperFrames",
        url: "https://github.com/heygen-com/hyperframes",
      },
    });
  return { "@context": "https://schema.org", "@graph": graph };
}
export function toMarkdown(html, url) {
  const $ = load(html);
  const body = $("[data-pagefind-body]").first().clone();
  body
    .find("[data-pagefind-ignore],script,style,button,.copy,.anchor-link,nav")
    .remove();
  body.find(".expressive-code").each((_, element) => {
    const pre = $(element).find("pre").first();
    const code = pre.find("code").first();
    const lines = code.find(".ec-line .code");
    const text = lines.length
      ? lines
          .map((_, line) => $(line).text())
          .get()
          .join("\n")
      : code.text();
    $(element).replaceWith(
      $("<pre>").append(
        $("<code>")
          .attr("class", `language-${pre.attr("data-language") || "text"}`)
          .text(text),
      ),
    );
  });
  body.find("a").each((_, el) => {
    if (!$(el).text().trim() && !$(el).find("img").length) $(el).remove();
  });
  body
    .find("a[href],img[src],video[poster],source[src],track[src]")
    .each((_, el) => {
      for (const attr of ["href", "src", "poster"]) {
        const value = $(el).attr(attr);
        if (value && !/^(mailto:|tel:)/.test(value))
          $(el).attr(attr, new URL(value, url).href);
      }
    });
  body.find("video").each((_, el) => {
    const video = $(el);
    const media = video.find("source").attr("src");
    const poster = video.attr("poster");
    video.replaceWith(
      `<p><a href="${xml(media || url)}">播放实际成片</a></p>${poster ? `<p><img alt="案例海报" src="${xml(poster)}"></p>` : ""}`,
    );
  });
  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });
  td.addRule("table", {
    filter: "table",
    replacement(_, node) {
      const rows = Array.from(node.getElementsByTagName("tr")).map((row) =>
        Array.from(row.childNodes)
          .filter((cell) => ["TH", "TD"].includes(cell.nodeName))
          .map((cell) =>
            td.turndown(cell.innerHTML).trim().replace(/\|/g, "\\|").replace(/\n/g, " "),
          ),
      );
      if (!rows.length) return "";
      const width = Math.max(...rows.map((r) => r.length));
      const format = (row) =>
        "| " +
        Array.from({ length: width }, (_, i) => row[i] || "").join(" | ") +
        " |";
      return (
        "\n\n" +
        [
          format(rows[0]),
          format(Array(width).fill("---")),
          ...rows.slice(1).map(format),
        ].join("\n") +
        "\n\n"
      );
    },
  });
  return td.turndown(body.html() || "").trim();
}
export function renderHead(html, page, site) {
  const $ = load(html);
  const head = $("head");
  const url = site.url + page.route;
  head
    .find(
      'title,meta[name="description"],meta[name="robots"],meta[name="author"],meta[property^="og:"],meta[name^="twitter:"],link[rel="canonical"],link[type="text/markdown"],script[type="application/ld+json"]',
    )
    .remove();
  $(".editorial-date").remove();
  head.append(
    $("<title>").text(
      page.id === "home"
        ? page.title
        : `${page.title} | ${site.name}`,
    ),
  );
  const meta = (key, value, property = false) =>
    head.append(
      $("<meta>")
        .attr(property ? "property" : "name", key)
        .attr("content", value),
    );
  meta("description", page.description);
  meta(
    "robots",
    site.indexable
      ? "index,follow,max-image-preview:large,max-video-preview:-1"
      : "noindex,nofollow",
  );
  meta("author", "HyperFrames 中文指南维护者");
  head.append($('<link rel="canonical">').attr("href", url));
  for (const [key, value] of Object.entries({
    title: page.title,
    description: page.description,
    type: page.kind === "home" || page.kind === "index" ? "website" : "article",
    url,
    site_name: site.name,
    locale: "zh_CN",
    image: site.url + page.image,
    "image:alt": page.title,
    "image:width": String(page.imageWidth || 960),
    "image:height": String(page.imageHeight || 540),
  }))
    meta("og:" + key, value, true);
  meta("twitter:card", "summary_large_image");
  meta("twitter:title", page.title);
  meta("twitter:description", page.description);
  meta("twitter:image", site.url + page.image);
  meta("twitter:image:alt", page.title);
  head.append(
    $('<link rel="alternate" type="text/markdown">')
      .attr("title", "正文与来源 Markdown")
      .attr("href", site.url + page.markdown),
  );
  head.append(
    `<script type="application/ld+json">${jsonLd(structuredData(page, site))}</script>`,
  );
  if (page.modified)
    $(".source-meta").append(
      $("<span>")
        .addClass("editorial-date")
        .text(`正文修订：${page.modified.slice(0, 10)}（Git 记录）`),
    );
  return $.html();
}

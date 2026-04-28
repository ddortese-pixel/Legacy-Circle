import { useEffect } from "react";

export const LEGACY_CIRCLE_ICON = "https://media.base44.com/images/public/69cdc0f4895939ce59ad81c4/3508b8e9c_1774579448257.png";

function upsertMeta(selector, attributes) {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    document.head.appendChild(tag);
  }
  Object.entries(attributes).forEach(([key, value]) => {
    if (value) tag.setAttribute(key, value);
  });
}

export function usePageMeta({ title, description, keywords, image = LEGACY_CIRCLE_ICON, icon = LEGACY_CIRCLE_ICON }) {
  useEffect(() => {
    if (title) document.title = title;

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    if (icon) link.href = icon;

    upsertMeta('meta[name="description"]', { name: "description", content: description || "" });
    upsertMeta('meta[name="keywords"]', { name: "keywords", content: keywords || "" });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: title || "" });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: description || "" });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: image || "" });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
  }, [description, icon, image, keywords, title]);
}
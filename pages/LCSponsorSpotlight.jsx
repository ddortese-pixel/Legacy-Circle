import { useEffect, useMemo, useState } from "react";
import { GET_SPONSORS_URL, TRACK_SPONSOR_CLICK_URL } from "../functionUrls";

const SPONSOR_CACHE_TTL_MS = 5 * 60 * 1000;

const FALLBACK_BY_APP = {
  legacy_circle: {
    id: "fallback-lc",
    sponsor_name: "Legacy Circle Reading Shelf",
    sponsor_tagline: "Curated character-building titles available on Google Books.",
    cta_text: "Open Books",
    cta_url: "https://books.google.com/books?q=character+education+for+kids",
    disclosure: "Sponsored",
  },
  ourspace: {
    id: "fallback-os",
    sponsor_name: "OurSpace Creator Books",
    sponsor_tagline: "Creator marketing and entrepreneurship books on Google Books.",
    cta_text: "Browse Books",
    cta_url: "https://books.google.com/books?q=creator+economy+marketing+books",
    disclosure: "Sponsored",
  },
};

export default function LCSponsorSpotlight({ app = "legacy_circle", placement = "global" }) {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSponsors() {
      const cacheKey = `lc_sponsor_${app}_${placement}`;
      try {
        const cachedRaw = sessionStorage.getItem(cacheKey);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          if (cached && Array.isArray(cached.sponsors) && Number(cached.expiresAt || 0) > Date.now()) {
            if (mounted) {
              setSponsors(cached.sponsors);
              setLoading(false);
            }
            return;
          }
        }
      } catch {
        // Ignore cache parsing/storage errors.
      }

      try {
        const response = await fetch(GET_SPONSORS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ app, placement, limit: 1 }),
        });

        const payload = await response.json().catch(() => null);
        if (mounted && response.ok) {
          const nextSponsors = Array.isArray(payload?.sponsors) ? payload.sponsors : [];
          setSponsors(nextSponsors);
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify({
              sponsors: nextSponsors,
              expiresAt: Date.now() + SPONSOR_CACHE_TTL_MS,
            }));
          } catch {
            // Ignore cache storage errors.
          }
        }
      } catch {
        if (mounted) {
          setSponsors([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSponsors();
    return () => { mounted = false; };
  }, [app, placement]);

  const sponsor = useMemo(() => {
    if (sponsors.length > 0) return sponsors[0];
    return FALLBACK_BY_APP[app] || FALLBACK_BY_APP.legacy_circle;
  }, [app, sponsors]);

  if (loading && !sponsor) return null;

  async function onSponsorClick() {
    const clickPayload = JSON.stringify({
      sponsor_placement_id: sponsor.id,
      app,
      placement,
      user_email: (localStorage.getItem("lc_email") || "").toLowerCase(),
      session_id: localStorage.getItem("lc_profile_id") || "anon",
      referrer: window.location.pathname,
      user_agent: navigator.userAgent,
    });

    try {
      if (typeof navigator.sendBeacon === "function") {
        const blob = new Blob([clickPayload], { type: "application/json" });
        navigator.sendBeacon(TRACK_SPONSOR_CLICK_URL, blob);
      } else {
        fetch(TRACK_SPONSOR_CLICK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: clickPayload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Intentionally non-blocking.
    }

    if (sponsor.cta_url) {
      window.open(sponsor.cta_url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, #1f2937, #111827)",
      border: "1px solid #334155",
      borderRadius: 16,
      padding: "14px 16px",
      marginBottom: 18,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 14,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#60a5fa", fontWeight: 700, marginBottom: 3 }}>
          {sponsor.disclosure || "Sponsored"}
        </div>
        <div style={{ color: "#e5e7eb", fontSize: 14, fontWeight: 800, lineHeight: 1.3 }}>
          {sponsor.sponsor_name}
        </div>
        <div style={{ color: "#9ca3af", fontSize: 12, lineHeight: 1.4, marginTop: 2 }}>
          {sponsor.sponsor_tagline}
        </div>
      </div>
      <button onClick={onSponsorClick} style={{
        background: "#60a5fa",
        border: "none",
        borderRadius: 10,
        color: "#0b1020",
        fontWeight: 800,
        fontSize: 12,
        padding: "10px 12px",
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}>
        {sponsor.cta_text || "Learn More"}
      </button>
    </div>
  );
}

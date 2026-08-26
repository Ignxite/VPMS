import { css } from "@emotion/react";
import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";

type SearchResult = {
  lat: string;
  lon: string;
  display_name: string;
};

export function SearchBar({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeholder = useMemo(
    () => "Search city, place, or address",
    []
  );

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setError(null);

    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("limit", "1");
      url.searchParams.set("q", trimmed);

      const response = await fetch(url.toString(), {
        headers: {
          "Accept-Language": "en",
        },
      });
      const results = (await response.json()) as SearchResult[];

      if (!results.length) {
        setError("No location found");
        return;
      }

      onLocationSelect(Number(results[0].lat), Number(results[0].lon));
    } catch (searchError) {
      console.error(searchError);
      setError("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div
      css={css({
        position: "relative",
        zIndex: 2,
        width: "100%",
        maxWidth: "760px",
        alignSelf: "stretch",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
      })}
    >
      <div
        css={css({
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          alignItems: "center",
          padding: "0.7rem",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.94), rgba(247,249,253,0.86))",
          backdropFilter: "blur(16px)",
          borderRadius: "20px",
          boxShadow: "0 14px 36px rgba(15, 23, 42, 0.1)",
          border: "1px solid rgba(17,24,39,0.08)",
        })}
      >
        <div
          css={css({
            width: "2.25rem",
            height: "2.25rem",
            borderRadius: "14px",
            display: "grid",
            placeItems: "center",
            background: "rgba(37, 99, 235, 0.08)",
            color: "#2563eb",
            flexShrink: 0,
          })}
        >
          <MapPin size={14} />
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              void handleSearch();
            }
          }}
          placeholder={placeholder}
          css={css({
            flex: 1,
            minWidth: "14rem",
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "14px",
            color: "#111827",
            padding: "0.2rem 0",
          })}
        />
        <button
          type="button"
          onClick={() => void handleSearch()}
          disabled={isSearching}
          css={css({
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            flexShrink: 0,
            border: "none",
            borderRadius: "14px",
            padding: "0.55rem 0.8rem",
            backgroundColor: "#2563eb",
            color: "#fff",
            cursor: "pointer",
            fontSize: "13px",
            fontWeight: 500,
            opacity: isSearching ? 0.75 : 1,
            boxShadow: "0 10px 18px rgba(37, 99, 235, 0.2)",
          })}
        >
          <Search size={14} />
          {isSearching ? "Searching" : "Search"}
        </button>
      </div>

      {error && (
        <div
          css={css({
            marginLeft: "0.25rem",
            color: "#b91c1c",
            fontSize: "12px",
            backgroundColor: "rgba(255, 255, 255, 0.92)",
            padding: "0.35rem 0.6rem",
            borderRadius: "999px",
            width: "fit-content",
          })}
        >
          {error}
        </div>
      )}
    </div>
  );
}

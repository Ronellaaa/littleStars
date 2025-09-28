import { useMemo, useState } from "react";

function heavyFilter(items, query) {
  // pretend this is expensive
  // (waste some CPU cycles on purpose)
  let count = 0;
  for (let i = 0; i < 8_000_000; i++) count += i % 7; // delay
  return items.filter((x) => x.label.toLowerCase().includes(query.toLowerCase()));
}

export default function Example() {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("light");

  // Big static dataset (memoized so we don't rebuild it on each render)
  const data = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 10_000; i++) {
      arr.push({ id: i, label: `Item ${i}` });
    }
    return arr;
  }, []);

  // ❌ Without useMemo — recomputes on EVERY render (even theme toggles)
  const filteredNormal = (() => {
    console.time("normal");
    const out = heavyFilter(data, query);
    console.timeEnd("normal");
    return out;
  })();

  // ✅ With useMemo — recomputes ONLY when `data` or `query` changes
  const filteredMemo = useMemo(() => {
    console.time("memo");
    const out = heavyFilter(data, query);
    console.timeEnd("memo");
    return out;
  }, [data, query]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Heavy Filter Demo</h2>

      <input
        placeholder="Type to filter…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: 8, marginRight: 8 }}
      />

      <button onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}>
        Toggle theme (current: {theme})
      </button>

      <p>
        Results (normal): {filteredNormal.length} | Results (memo): {filteredMemo.length}
      </p>
    </div>
  );
}

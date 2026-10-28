# DSA Visualizer

Step-wise sorting & searching visualizer.

## ✅ Easiest way to run (no setup, works offline)

Just open `frontend/index.html` in your browser — double-click it.
All algorithms (Merge Sort, Quick Sort, Linear Search, Binary Search) run in the browser. **No Java, no Node, no install required.**

## Controls

- **Category** — Sorting or Searching
- **Algorithm** — pick one (Target field appears only for Searching)
- **Size** slider 1–100 — generates a random array of that size
- **Speed** slider 1–100 — higher = faster animation
- **Array input** — type numbers separated by space, then press **Enter** to confirm
- **Random** — generate a fresh random array
- **Run ▶** — start the visualization

## Optional: Java + Node backend

The `backend/` folder contains a Java implementation of the same algorithms
plus a tiny Node.js/Express bridge — useful if you want the algorithms to
actually run in Java (e.g. for a class project).

Run it like this:

```bash
# 1. Compile Java (requires JDK 11+)
cd backend/java
mkdir -p out
javac -d out src/com/sortviz/*.java

# 2. Start the Node bridge (requires Node 18+)
cd ../node
npm install
npm start
# → open http://localhost:3000
```

The bridge serves `frontend/` and forwards `/api/run` calls to the Java process.
The frontend works fine without it — the backend is purely optional.

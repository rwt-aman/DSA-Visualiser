// Optional Express bridge: serves /frontend and forwards /api/run to Java.
// The frontend works without this — open frontend/index.html directly.
const express = require("express");
const path = require("path");
const { spawn } = require("child_process");

const app = express();
app.use(express.json({ limit: "256kb" }));

const FRONTEND_DIR = path.resolve(__dirname, "../../frontend");
const JAVA_DIR     = path.resolve(__dirname, "../java");
app.use(express.static(FRONTEND_DIR));

app.post("/api/run", (req, res) => {
  const { category, algorithm, array, target } = req.body || {};
  if (!Array.isArray(array) || array.length === 0)
    return res.status(400).json({ error: "array required" });

  const sep = process.platform === "win32" ? ";" : ":";
  const classpath = ["out"].join(sep);
  const java = spawn("java", ["-cp", classpath, "com.sortviz.SortRunner"], { cwd: JAVA_DIR });

  let out = "", err = "";
  java.stdout.on("data", (d) => (out += d));
  java.stderr.on("data", (d) => (err += d));
  java.on("error", (e) => res.status(500).json({ error: "Failed to spawn java: " + e.message }));
  java.on("close", (code) => {
    if (code !== 0) return res.status(500).json({ error: err || `java exited ${code}` });
    res.type("application/json").send(out.trim());
  });

  java.stdin.write(JSON.stringify({ category, algorithm, array, target }));
  java.stdin.end();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Algo Visualizer → http://localhost:${PORT}`));

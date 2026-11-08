// Fetches the last year of GitHub contributions via the GraphQL API and writes
// them to public/github-contributions.json, which the heatmap loads at runtime.
// Token: GITHUB_TOKEN env var (set in CI) or the local `gh` CLI login.
// On failure the existing snapshot is kept and the build continues.

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const USER = "NilsHellwig";
const OUT = new URL("../public/github-contributions.json", import.meta.url);
const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

const token = (() => {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execSync("gh auth token", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "";
  }
})();

const query = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

try {
  if (!token) throw new Error("no GITHUB_TOKEN and no gh login");
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { login: USER } }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(JSON.stringify(json.errors ?? res.status));
  const contributions = json.data.user.contributionsCollection.contributionCalendar.weeks
    .flatMap((w) => w.contributionDays)
    .map((d) => ({ date: d.date, count: d.contributionCount, level: LEVEL[d.contributionLevel] ?? 0 }));
  writeFileSync(OUT, JSON.stringify({ updated: new Date().toISOString(), contributions }) + "\n");
  console.log(`GitHub contributions: wrote ${contributions.length} days`);
} catch (e) {
  console.warn(`GitHub contributions: fetch failed, keeping existing snapshot (${e.message})`);
}

/**
 * Smoke checks against a running API (default http://localhost:3001).
 * Usage: node scripts/smoke-check.mjs
 */
const base = (process.env.SMOKE_API_URL ?? "http://localhost:3001").replace(/\/$/, "");

async function check(path, expectOk = true) {
  const url = `${base}${path}`;
  const res = await fetch(url, { redirect: "manual" });
  const ok = expectOk ? res.ok : true;
  const body = await res.text();
  let preview = body.slice(0, 120).replace(/\s+/g, " ");
  try {
    preview = JSON.stringify(JSON.parse(body)).slice(0, 120);
  } catch {
    /* keep text */
  }
  if (!ok) {
    throw new Error(`${res.status} ${path} → ${preview}`);
  }
  console.log(`OK  ${res.status} ${path}`);
}

async function main() {
  console.log(`Smoke → ${base}`);
  await check("/api/health");
  await check("/api/ready");
  await check("/api/public/home");
  await check("/api/public/contact");
  await check("/api/public/people?role=FIGHTER");
  await check("/api/public/schedule");
  await check("/api/public/events");
  await check("/api/public/posts");
  await check("/api/public/gallery");
  console.log("All smoke checks passed.");
}

main().catch((err) => {
  console.error("FAIL", err.message || err);
  process.exit(1);
});

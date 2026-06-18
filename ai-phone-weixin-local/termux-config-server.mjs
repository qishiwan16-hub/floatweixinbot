#!/usr/bin/env node

import { createServer } from "node:http";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(here, "config.txt");
const CONFIG_TMP_PATH = resolve(here, "config.txt.tmp");
const DEFAULT_BUCKET = "ai-phone-backup";
const DEFAULT_INTERVAL_SECONDS = 5;
const HOST = process.env.AI_PHONE_CONFIG_HOST || "127.0.0.1";
const PORT = Number(process.env.AI_PHONE_CONFIG_PORT || 8787);

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || `${HOST}:${PORT}`}`);
    if (req.method === "GET" && url.pathname === "/") {
      sendHtml(res, renderPage(getConfigStatus()));
      return;
    }
    if (req.method === "GET" && url.pathname === "/status") {
      sendJson(res, getConfigStatus());
      return;
    }
    if (req.method === "POST" && url.pathname === "/save") {
      const form = parseUrlEncoded(await readRequestBody(req));
      const config = buildConfigFromForm(form);
      const savedCode = saveConfig(config);
      sendHtml(res, renderPage(getConfigStatus(), {
        type: "success",
        message: `配置已保存。已写入 config.txt，长度 ${savedCode.length} 字符。`,
      }));
      return;
    }
    if (req.method === "POST" && url.pathname === "/test") {
      const form = parseUrlEncoded(await readRequestBody(req));
      const config = buildConfigFromForm(form);
      const result = await testSupabaseConfig(config);
      sendHtml(res, renderPage(getConfigStatus(config), {
        type: "success",
        message: `连接成功：index 更新时间 ${escapeHtml(result.updatedAt || "未知")}，运行包数量 ${result.packageCount}。`,
      }));
      return;
    }
    sendText(res, 404, "Not Found");
  } catch (err) {
    sendHtml(res, renderPage(getConfigStatus(), {
      type: "error",
      message: errorMessage(err),
    }), 400);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[AI Phone Config] 配置页已启动：http://${HOST}:${PORT}`);
  console.log("[AI Phone Config] 请在手机浏览器打开上面的地址，输入 Supabase URL 和 service_role key。");
});

function buildConfigFromForm(form) {
  const configCode = String(form.configCode || "").trim();
  if (configCode) return validateConfig(parseConfigCode(configCode));

  const supabaseUrl = normalizeRequiredUrl(form.supabaseUrl, "Supabase URL");
  const supabaseServiceRoleKey = String(form.supabaseServiceRoleKey || "").trim();
  if (!supabaseServiceRoleKey) throw new Error("请填写 Supabase service_role key。");

  return validateConfig({
    format: "ai-phone-weixin-local-assistant-config",
    version: 1,
    supabaseUrl,
    supabaseServiceRoleKey,
    supabaseBucket: DEFAULT_BUCKET,
    pollIntervalSeconds: DEFAULT_INTERVAL_SECONDS,
  });
}

function validateConfig(config) {
  if (!config || typeof config !== "object") throw new Error("配置内容不是有效对象。");
  if (config.format !== "ai-phone-weixin-local-assistant-config" || config.version !== 1) {
    throw new Error("配置格式不正确：format/version 不匹配。");
  }
  config.supabaseUrl = normalizeRequiredUrl(config.supabaseUrl, "Supabase URL");
  config.supabaseServiceRoleKey = String(config.supabaseServiceRoleKey || "").trim();
  if (!config.supabaseServiceRoleKey) throw new Error("配置缺少 Supabase service_role key。");
  config.supabaseBucket = String(config.supabaseBucket || DEFAULT_BUCKET).trim() || DEFAULT_BUCKET;
  config.pollIntervalSeconds = clampInterval(config.pollIntervalSeconds);
  return config;
}

function saveConfig(config) {
  const code = Buffer.from(JSON.stringify(validateConfig(config)), "utf8").toString("base64url");
  writeFileSync(CONFIG_TMP_PATH, `${code}\n`, { encoding: "utf8", mode: 0o600 });
  renameSync(CONFIG_TMP_PATH, CONFIG_PATH);
  return code;
}

async function testSupabaseConfig(config) {
  const checked = validateConfig(config);
  const index = await getSupabaseObjectJson(checked, "weixin-cloud/index.json");
  return {
    updatedAt: typeof index?.updatedAt === "string" ? index.updatedAt : "",
    packageCount: Array.isArray(index?.packages) ? index.packages.length : 0,
  };
}

async function getSupabaseObjectJson(config, path) {
  const url = `${normalizeRequiredUrl(config.supabaseUrl, "Supabase URL")}/storage/v1/object/${config.supabaseBucket || DEFAULT_BUCKET}/${path.replace(/^\/+/, "")}`;
  const key = String(config.supabaseServiceRoleKey || "").trim();
  const res = await fetch(url, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase 连接失败 ${res.status}: ${text.slice(0, 300)}`);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Supabase 返回非 JSON 内容：${text.slice(0, 160)}`);
  }
}

function getConfigStatus(overrideConfig = null) {
  const raw = overrideConfig ? JSON.stringify(overrideConfig) : readConfigText();
  if (!raw.trim()) {
    return { exists: false, valid: false, message: "尚未保存配置" };
  }
  try {
    const parsed = validateConfig(typeof overrideConfig === "object" ? overrideConfig : parseConfigCode(raw.trim()));
    return {
      exists: existsSync(CONFIG_PATH) || Boolean(overrideConfig),
      valid: true,
      supabaseHost: maskUrl(parsed.supabaseUrl),
      bucket: parsed.supabaseBucket || DEFAULT_BUCKET,
      interval: parsed.pollIntervalSeconds || DEFAULT_INTERVAL_SECONDS,
      keyPreview: maskKey(parsed.supabaseServiceRoleKey),
      message: "配置有效",
    };
  } catch (err) {
    return { exists: existsSync(CONFIG_PATH), valid: false, message: errorMessage(err) };
  }
}

function readConfigText() {
  if (!existsSync(CONFIG_PATH)) return "";
  return readFileSync(CONFIG_PATH, "utf8");
}

function parseConfigCode(code) {
  const trimmed = String(code || "").trim();
  if (!trimmed) throw new Error("配置为空。");
  if (trimmed.startsWith("{")) return JSON.parse(trimmed);
  const normalized = trimmed.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
}

function parseUrlEncoded(body) {
  const params = new URLSearchParams(body);
  return Object.fromEntries(params.entries());
}

function readRequestBody(req) {
  return new Promise((resolveBody, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("提交内容过大。"));
        req.destroy();
      }
    });
    req.on("end", () => resolveBody(body));
    req.on("error", reject);
  });
}

function renderPage(status, flash = null) {
  const statusClass = status.valid ? "ok" : status.exists ? "warn" : "muted";
  const flashHtml = flash ? `<div class="flash ${flash.type}">${escapeHtml(flash.message)}</div>` : "";
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AI Phone 微信助手配置</title>
<style>
:root{color-scheme:light dark;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}
body{margin:0;background:#f6f7f9;color:#17202a;}
main{max-width:760px;margin:0 auto;padding:22px 16px 40px;}
.card{background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:18px;margin:14px 0;box-shadow:0 4px 16px rgba(0,0,0,.04);}
h1{font-size:24px;margin:0 0 8px;} h2{font-size:18px;margin:0 0 12px;} p{line-height:1.65;}
label{display:block;font-weight:700;margin:14px 0 6px;}
input,textarea{width:100%;box-sizing:border-box;border:1px solid #d1d5db;border-radius:12px;padding:12px;font:inherit;background:#fff;color:inherit;}
textarea{min-height:120px;resize:vertical;}
button{border:0;border-radius:999px;padding:12px 18px;font-weight:700;background:#1677ff;color:#fff;margin:14px 8px 0 0;}
button.secondary{background:#374151;}
.badge{display:inline-block;border-radius:999px;padding:5px 10px;font-size:13px;font-weight:700;}
.ok{background:#ecfdf3;color:#027a48;}.warn{background:#fff7ed;color:#c2410c;}.muted{background:#f3f4f6;color:#4b5563;}
.flash{border-radius:12px;padding:12px;margin:12px 0;font-weight:700;}.flash.success{background:#ecfdf3;color:#027a48;}.flash.error{background:#fef2f2;color:#b42318;}
small{color:#667085;}.danger{color:#b42318;font-weight:700;} code{background:#f3f4f6;border-radius:6px;padding:2px 5px;}
@media (prefers-color-scheme:dark){body{background:#111827;color:#e5e7eb}.card{background:#1f2937;border-color:#374151}input,textarea{background:#111827;border-color:#4b5563}.muted{background:#374151;color:#d1d5db}code{background:#111827}}
</style>
</head>
<body><main>
<h1>AI Phone 微信助手配置</h1>
<p>在 Termux 本机保存 Supabase 连接信息。页面只监听本机地址，不会显示完整密钥。</p>
${flashHtml}
<section class="card">
  <h2>当前状态 <span class="badge ${statusClass}">${escapeHtml(status.message || "未知")}</span></h2>
  <p>配置文件：<code>config.txt</code> ${status.exists ? "已存在" : "未创建"}</p>
  ${status.valid ? `<p>Supabase：<code>${escapeHtml(status.supabaseHost)}</code><br>Bucket：<code>${escapeHtml(status.bucket)}</code><br>轮询间隔：<code>${escapeHtml(String(status.interval))}s</code><br>Key：<code>${escapeHtml(status.keyPreview)}</code></p>` : ""}
</section>
<section class="card">
  <h2>方式一：输入 Supabase URL 和 service_role key</h2>
  <form method="post" action="/save">
    <label>Supabase URL</label>
    <input name="supabaseUrl" placeholder="https://xxxx.supabase.co" autocomplete="off">
    <label>Supabase service_role key</label>
    <textarea name="supabaseServiceRoleKey" placeholder="粘贴 service_role key"></textarea>
    <button type="submit">保存配置</button>
    <button class="secondary" type="submit" formaction="/test">测试连接</button>
  </form>
</section>
<section class="card">
  <h2>方式二：粘贴完整配置码</h2>
  <form method="post" action="/save">
    <label>配置码</label>
    <textarea name="configCode" placeholder="粘贴小手机导出的完整配置码，支持 JSON 或 base64"></textarea>
    <button type="submit">保存配置码</button>
    <button class="secondary" type="submit" formaction="/test">测试连接</button>
  </form>
</section>
<section class="card">
  <p class="danger">不要把 <code>config.txt</code>、service_role key 或完整配置码发给别人。</p>
  <p><small>保存后可回到 Termux 执行一键启动脚本，助手会自动读取 Supabase 上最新运行包。</small></p>
</section>
</main></body></html>`;
}

function sendHtml(res, html, statusCode = 200) {
  res.writeHead(statusCode, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  res.end(html);
}

function sendJson(res, data, statusCode = 200) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(data, null, 2));
}

function sendText(res, statusCode, text) {
  res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
  res.end(text);
}

function normalizeRequiredUrl(value, name) {
  const raw = String(value || "").trim().replace(/\/+$/, "");
  if (!raw) throw new Error(`请填写 ${name}。`);
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

function clampInterval(value) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return DEFAULT_INTERVAL_SECONDS;
  return Math.min(60, Math.max(3, n));
}

function maskUrl(url) {
  try {
    const parsed = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    return `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    return "(invalid url)";
  }
}

function maskKey(key) {
  const value = String(key || "").trim();
  if (value.length <= 12) return "***";
  return `${value.slice(0, 6)}...${value.slice(-6)}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;")
    .replace(/'/g, "\u0026#39;");
}

function errorMessage(err) {
  return err instanceof Error ? err.message : String(err);
}

#!/usr/bin/env node

import { createServer } from "node:http";
import { existsSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(here, "config.txt");
const CONFIG_TMP_PATH = resolve(here, "config.txt.tmp");
const CONFIG_EXAMPLE_PATH = resolve(here, "config.example.txt");
const DEFAULT_BUCKET = "ai-phone-backup";
const DEFAULT_INTERVAL_SECONDS = 5;
const INDEX_PATH = "weixin-cloud/index.json";
// 配置页版本号：用于让用户确认浏览器/服务加载的是最新页面。
// 如果页面上看不到这个版本号，或仍出现“方式二/配置码”，说明加载的是旧页面或旧服务。
const PAGE_VERSION = "2026-06-19-single-form";
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
      const submittedUrl = String(form.supabaseUrl || "").trim();
      try {
        const config = buildConfigFromForm(form);
        const result = saveConfig(config);
        const exampleDelete = result.exampleDelete;
        sendHtml(res, renderPage(getConfigStatus(), {
          type: exampleDelete.error ? "warning" : "success",
          message: formatSaveSuccessMessage(result),
        }, { supabaseUrl: result.config.supabaseUrl }));
      } catch (err) {
        sendHtml(res, renderPage(getConfigStatus(), {
          type: "error",
          message: `配置保存失败：${errorMessage(err)}`,
        }, { supabaseUrl: submittedUrl }), 200);
      }
      return;
    }
    if (req.method === "POST" && url.pathname === "/test") {
      const form = parseUrlEncoded(await readRequestBody(req));
      const submittedUrl = String(form.supabaseUrl || "").trim();
      try {
        const config = buildConfigFromForm(form);
        const result = await testSupabaseConfig(config);
        sendHtml(res, renderPage(getConfigStatus(), {
          type: "success",
          message: `测试连接成功（HTTP ${result.httpStatus}）。正在测试的 URL：${result.supabaseUrl}；读取对象：${result.bucket}/${result.path}；index 更新时间 ${result.updatedAt || "未知"}，运行包数量 ${result.packageCount}。（service_role key 不会明文显示）`,
        }, { supabaseUrl: config.supabaseUrl }));
      } catch (err) {
        sendHtml(res, renderPage(getConfigStatus(), {
          type: "error",
          message: `测试连接失败：${friendlyTestError(err)}（测试的 URL：${submittedUrl || "未填写"}；读取对象：${DEFAULT_BUCKET}/${INDEX_PATH}）`,
        }, { supabaseUrl: submittedUrl }), 200);
      }
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
  const savedConfig = readSavedConfigOrNull();
  const supabaseUrl = normalizeRequiredUrl(form.supabaseUrl, "Supabase URL");
  const inputKey = String(form.supabaseServiceRoleKey || "").trim();
  const savedKey = String(savedConfig?.supabaseServiceRoleKey || "").trim();
  const supabaseServiceRoleKey = inputKey || savedKey;
  if (!supabaseServiceRoleKey) {
    throw new Error("请填写 Supabase service_role key。首次保存必须填写 key；已有配置时不填会沿用已保存 key。");
  }

  return validateConfig({
    format: "ai-phone-weixin-local-assistant-config",
    version: 1,
    supabaseUrl,
    supabaseServiceRoleKey,
    supabaseBucket: savedConfig?.supabaseBucket || DEFAULT_BUCKET,
    pollIntervalSeconds: savedConfig?.pollIntervalSeconds || DEFAULT_INTERVAL_SECONDS,
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
  const checked = validateConfig(config);
  const code = Buffer.from(JSON.stringify(checked), "utf8").toString("base64url");
  try {
    writeFileSync(CONFIG_TMP_PATH, `${code}\n`, { encoding: "utf8", mode: 0o600 });
  } catch (err) {
    throw new Error(`未能写入临时配置文件 config.txt.tmp：${errorMessage(err)}`);
  }
  try {
    renameSync(CONFIG_TMP_PATH, CONFIG_PATH);
  } catch (err) {
    throw new Error(`未能把临时配置文件替换为 config.txt：${errorMessage(err)}`);
  }
  return { code, config: checked, exampleDelete: deleteExampleConfigIfPresent() };
}

function deleteExampleConfigIfPresent() {
  if (!existsSync(CONFIG_EXAMPLE_PATH)) {
    return { existed: false, deleted: false, error: "" };
  }
  try {
    unlinkSync(CONFIG_EXAMPLE_PATH);
    return { existed: true, deleted: true, error: "" };
  } catch (err) {
    return { existed: true, deleted: false, error: errorMessage(err) };
  }
}

function formatSaveSuccessMessage(result) {
  const parts = [
    `配置已保存，Supabase URL 已写入 config.txt：${result.config.supabaseUrl}。`,
    `Key 已保存：${maskKey(result.config.supabaseServiceRoleKey)}（不会明文显示）。`,
  ];
  if (result.exampleDelete.deleted) {
    parts.push("已删除示例配置文件 config.example.txt。");
  } else if (result.exampleDelete.error) {
    parts.push(`配置已保存，但示例文件删除失败：${result.exampleDelete.error}`);
  } else {
    parts.push("本地未发现示例配置文件 config.example.txt，无需删除。");
  }
  return parts.join(" ");
}

async function testSupabaseConfig(config) {
  const checked = validateConfig(config);
  const fetched = await getSupabaseObjectJson(checked, INDEX_PATH);
  const index = fetched.json;
  if (!index || typeof index !== "object" || Array.isArray(index)) {
    throw new Error(`${INDEX_PATH} 已读取，但内容不是有效 JSON 对象。请先让小手机重新提交远程备份/上传最新微信运行包。`);
  }
  if (!Array.isArray(index.packages)) {
    throw new Error(`${INDEX_PATH} 已读取，但缺少 packages 数组。请先让小手机重新提交远程备份/上传最新微信运行包。`);
  }
  return {
    supabaseUrl: fetched.supabaseUrl,
    httpStatus: fetched.httpStatus,
    bucket: checked.supabaseBucket || DEFAULT_BUCKET,
    path: INDEX_PATH,
    updatedAt: typeof index.updatedAt === "string" ? index.updatedAt : "",
    packageCount: index.packages.length,
  };
}

async function getSupabaseObjectJson(config, path) {
  if (typeof fetch !== "function") {
    throw new Error("当前 Node.js 不支持 fetch，请安装 Node.js 20 或更高版本后再测试连接。");
  }

  const supabaseUrl = normalizeRequiredUrl(config.supabaseUrl, "Supabase URL");
  const bucket = String(config.supabaseBucket || DEFAULT_BUCKET).trim() || DEFAULT_BUCKET;
  const objectPath = path.replace(/^\/+/, "");
  const url = `${supabaseUrl}/storage/v1/object/${encodePathPart(bucket)}/${encodeObjectPath(objectPath)}`;
  const key = String(config.supabaseServiceRoleKey || "").trim();
  if (!key) throw new Error("请填写 Supabase service_role key。已有配置时不填会沿用已保存 key。");

  let res;
  try {
    res = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
  } catch (err) {
    throw new Error(`网络请求失败：无法连接 Supabase。请检查网络和 Supabase URL。${withDetail(errorMessage(err))}`);
  }

  let text = "";
  try {
    text = await res.text();
  } catch (err) {
    throw new Error(`读取 Supabase 响应失败。${withDetail(errorMessage(err))}`);
  }

  if (!res.ok) {
    throw new Error(formatSupabaseHttpError(res.status, text, bucket, objectPath));
  }

  try {
    return { json: JSON.parse(text), httpStatus: res.status, supabaseUrl };
  } catch {
    throw new Error(`已连接 Supabase，但 ${bucket}/${objectPath} 不是有效 JSON。请先让小手机重新提交远程备份/上传最新微信运行包。`);
  }
}

function getConfigStatus(overrideConfig = null) {
  const exists = existsSync(CONFIG_PATH);
  if (overrideConfig) {
    try {
      return configToStatus(validateConfig(overrideConfig), exists, "当前表单配置有效");
    } catch (err) {
      return { exists, valid: false, message: errorMessage(err), supabaseUrl: "", keySaved: false };
    }
  }

  const raw = readConfigText().trim();
  if (!raw) {
    return {
      exists,
      valid: false,
      message: exists ? "config.txt 已存在但内容为空" : "尚未保存配置",
      supabaseUrl: "",
      keySaved: false,
    };
  }
  try {
    const parsed = readSavedConfig();
    return configToStatus(parsed, exists, "已读取到本地配置，URL 已写入 config.txt");
  } catch (err) {
    return { exists, valid: false, message: `config.txt 读取失败：${errorMessage(err)}`, supabaseUrl: "", keySaved: false };
  }
}

function configToStatus(config, exists, message) {
  const parsed = validateConfig(config);
  return {
    exists,
    valid: true,
    supabaseUrl: parsed.supabaseUrl,
    supabaseHost: maskUrl(parsed.supabaseUrl),
    bucket: parsed.supabaseBucket || DEFAULT_BUCKET,
    interval: parsed.pollIntervalSeconds || DEFAULT_INTERVAL_SECONDS,
    keySaved: Boolean(parsed.supabaseServiceRoleKey),
    keyPreview: maskKey(parsed.supabaseServiceRoleKey),
    message,
  };
}

function readSavedConfig() {
  const raw = readConfigText().trim();
  if (!raw) return null;
  return validateConfig(parseConfigCode(raw));
}

function readSavedConfigOrNull() {
  try {
    return readSavedConfig();
  } catch {
    return null;
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

function renderPage(status, flash = null, formValues = {}) {
  const statusClass = status.valid ? "ok" : status.exists ? "warn" : "muted";
  const flashHtml = flash ? `<div class="flash ${flash.type}">${escapeHtml(flash.message)}</div>` : "";
  const supabaseUrlValue = formValues.supabaseUrl !== undefined
    ? String(formValues.supabaseUrl || "").trim()
    : status.valid
      ? status.supabaseUrl
      : "";
  const hasSavedKey = Boolean(status.valid && status.keySaved);
  const keyPlaceholder = hasSavedKey
    ? `已保存 key：${status.keyPreview}；不填会沿用，点击可重新输入`
    : "首次配置请粘贴 service_role key";
  const keyHelp = hasSavedKey
    ? "已保存 key 不会明文显示；不填 key 会沿用已保存 key；点击输入框可重新输入新的 key。"
    : "首次保存必须填写 key；保存后页面只显示打码占位，不会明文展示 key。";
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
input{width:100%;box-sizing:border-box;border:1px solid #d1d5db;border-radius:12px;padding:12px;font:inherit;background:#fff;color:inherit;}
button{border:0;border-radius:999px;padding:12px 18px;font-weight:700;background:#1677ff;color:#fff;margin:14px 8px 0 0;}
button.secondary{background:#374151;}
.badge{display:inline-block;border-radius:999px;padding:5px 10px;font-size:13px;font-weight:700;}
.ok{background:#ecfdf3;color:#027a48;}.warn{background:#fff7ed;color:#c2410c;}.muted{background:#f3f4f6;color:#4b5563;}
.flash{border-radius:12px;padding:12px;margin:12px 0;font-weight:700;}.flash.success{background:#ecfdf3;color:#027a48;}.flash.warning{background:#fff7ed;color:#c2410c;}.flash.error{background:#fef2f2;color:#b42318;}
small{display:block;color:#667085;margin-top:6px;line-height:1.55;}.danger{color:#b42318;font-weight:700;} code{background:#f3f4f6;border-radius:6px;padding:2px 5px;}
@media (prefers-color-scheme:dark){body{background:#111827;color:#e5e7eb}.card{background:#1f2937;border-color:#374151}input{background:#111827;border-color:#4b5563}.muted{background:#374151;color:#d1d5db}code{background:#111827}}
</style>
</head>
<body><main>
<h1>AI Phone 微信助手配置</h1>
<p>在 Termux 本机保存 Supabase 连接信息。页面只监听本机地址，key 只显示打码占位，不会明文展示。</p>
<p><small>页面版本：<code>${escapeHtml(PAGE_VERSION)}</code>。本页只有一种配置方式：直接填写 Supabase URL 和 service_role key。如果你还看到“方式二／粘贴完整配置码”，说明加载的是旧页面或旧服务，请按 README 第十节更新项目并重启 <code>termux-start.sh</code>。</small></p>
${flashHtml}
<section class="card">
  <h2>当前状态 <span class="badge ${statusClass}">${escapeHtml(status.message || "未知")}</span></h2>
  <p>配置文件：<code>config.txt</code> ${status.exists ? "已存在" : "未创建"}</p>
  ${status.valid
    ? `<p>已读取到 <code>config.txt</code>，Supabase URL 已写入：<code>${escapeHtml(status.supabaseUrl)}</code><br>Bucket：<code>${escapeHtml(status.bucket)}</code><br>轮询间隔：<code>${escapeHtml(String(status.interval))}s</code><br>Key（已打码，不填会沿用旧 key）：<code>${escapeHtml(status.keyPreview)}</code></p>`
    : `<p>还没有把 Supabase URL 写入 <code>config.txt</code>。请在下方填写 Supabase URL 和 service_role key 后点“保存配置”。</p>`}
</section>
<section class="card">
  <h2>保存 Supabase 配置</h2>
  <form method="post" action="/save">
    <label for="supabaseUrl">Supabase URL</label>
    <input id="supabaseUrl" name="supabaseUrl" value="${escapeHtml(supabaseUrlValue)}" placeholder="https://xxxx.supabase.co" autocomplete="off" autocapitalize="none" spellcheck="false" required>
    <label for="supabaseServiceRoleKey">Supabase service_role key</label>
    <input id="supabaseServiceRoleKey" type="password" name="supabaseServiceRoleKey" value="" placeholder="${escapeHtml(keyPlaceholder)}" autocomplete="new-password" autocapitalize="none" spellcheck="false">
    <small>${escapeHtml(keyHelp)}</small>
    <button type="submit">保存配置</button>
    <button class="secondary" type="submit" formaction="/test">测试连接</button>
  </form>
</section>
<section class="card">
  <p class="danger">不要把 <code>config.txt</code>、Supabase URL 或 service_role key 发给别人。</p>
  <p><small>保存后可回到 Termux 执行一键启动脚本，助手会自动读取 Supabase 上最新运行包。点“测试连接”只会测试上面这一份表单：当前 URL +（不填则沿用旧 key）当前 key，读取默认 Bucket <code>${escapeHtml(DEFAULT_BUCKET)}</code> 中的 <code>${escapeHtml(INDEX_PATH)}</code>，并显示 HTTP 状态和正在测试的 URL；不会显示明文 key。</small></p>
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
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  let parsed;
  try {
    parsed = new URL(withProtocol);
  } catch {
    throw new Error(`${name} 格式不正确，请填写类似 https://xxxx.supabase.co 的项目根地址。`);
  }
  if (!/^https?:$/.test(parsed.protocol) || !parsed.hostname) {
    throw new Error(`${name} 格式不正确，请填写类似 https://xxxx.supabase.co 的项目根地址。`);
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash || (parsed.pathname && parsed.pathname !== "/")) {
    throw new Error(`${name} 格式不正确，请只填写项目根地址，例如 https://xxxx.supabase.co。`);
  }
  return `${parsed.protocol}//${parsed.host}`;
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
  if (!value) return "未保存";
  const tail = value.length > 4 ? value.slice(-4) : "";
  return tail ? `••••••••${tail}` : "••••••••";
}

function encodePathPart(value) {
  return encodeURIComponent(String(value || ""));
}

function encodeObjectPath(path) {
  return String(path || "")
    .split("/")
    .filter(Boolean)
    .map(encodePathPart)
    .join("/");
}

function formatSupabaseHttpError(status, text, bucket, objectPath) {
  const detail = summarizeResponseText(text);
  if (status === 401 || status === 403) {
    return `Supabase 权限验证失败（${status}）。请检查 service_role key 是否正确，或重新输入新的 key 后再测试。${withDetail(detail)}`;
  }
  if (status === 400 || status === 404) {
    return `未找到 Storage bucket 或文件：${bucket}/${objectPath}。请确认默认 Bucket ${bucket} 已创建，并先让小手机提交远程备份/上传最新微信运行包。${withDetail(detail)}`;
  }
  return `Supabase 返回 HTTP ${status}。请检查 Supabase URL、key、Bucket 权限和网络状态。${withDetail(detail)}`;
}

function summarizeResponseText(text) {
  const raw = String(text || "").trim();
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    const parts = [parsed.message, parsed.error, parsed.error_description, parsed.msg]
      .map(value => String(value || "").trim())
      .filter(Boolean);
    if (parts.length) return parts.join("；").slice(0, 260);
  } catch {
    // Keep plain-text response below.
  }
  return raw.replace(/\s+/g, " ").slice(0, 260);
}

function withDetail(detail) {
  return detail ? ` Supabase 返回：${detail}` : "";
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

function friendlyTestError(err) {
  return errorMessage(err);
}

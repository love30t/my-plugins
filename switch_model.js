/**
 * @title 模型切换
 * @rule raw ^(切DeepSeek|切基元|切本地|当前模型|模型状态)$
 * @priority 100
 * @disable false
 * @admin false
 * @public true
 * @description 切换模型（DeepSeek、基元、本地）
 * @class 工具类
 * @platform qq
 */

const http = require("http");
const { sender: s, Bucket, console } = require("sillygirl");

const config = new Bucket("model_config");
const models = {
  "deepseek": { name: "DeepSeek v4 Flash", host: "api.deepseek.com", path: "/v1/chat/completions", key: "sk-", model: "deepseek-v4-flash" },
  "jiyuan": { name: "基元(tokenrhythm)", host: "tokenrhythm.studio", path: "/v1/chat/completions", key: "sk-", model: "deepseek-v4-flash" },
  "local": { name: "本地Qwen2.5:0.5b", host: "172.17.0.1", path: "/api/generate", key: "", model: "qwen2.5:0.5b" }
};

async function callAI(modelCfg, question) {
  if (modelCfg.name.includes("本地")) {
    const res = await new Promise((resolve, reject) => {
      const data = JSON.stringify({ model: modelCfg.model, prompt: question, stream: false, options: { temperature: 0.7, max_tokens: 512 } });
      const req = http.request({ hostname: modelCfg.host, port: 11434, path: modelCfg.path, method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) } },
        (r) => { let b = ""; r.on("data", c => b += c); r.on("end", () => { try { resolve(JSON.parse(b).response.trim()); } catch(e) { reject(e); } }); });
      req.on("error", reject); req.write(data); req.end();
    });
    return res;
  } else {
    const res = await new Promise((resolve, reject) => {
      const data = JSON.stringify({ model: modelCfg.model, messages: [{ role: "user", content: question }], stream: false });
      const req = http.request({ hostname: modelCfg.host, port: 443, path: modelCfg.path, method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + modelCfg.key, "Content-Length": Buffer.byteLength(data) } },
        (r) => { let b = ""; r.on("data", c => b += c); r.on("end", () => { try { resolve(JSON.parse(b).choices[0].message.content.trim()); } catch(e) { reject(e); } }); });
      req.on("error", reject); req.write(data); req.end();
    });
    return res;
  }
}

async function main() {
  const content = String(await s.getContent() || "").trim();
  const current = config.get("current", "local");

  if (content === "当前模型" || content === "模型状态") {
    const m = models[current];
    await s.reply("🤖 **当前模型**: " + (m ? m.name : "未知") + "\\n📌 发送 `切DeepSeek` / `切基元` / `切本地` 切换");
    return;
  }

  let target = "";
  if (content.includes("DeepSeek") || content.includes("deepseek") || content.includes("原版")) target = "deepseek";
  else if (content.includes("基元") || content.includes("token")) target = "jiyuan";
  else if (content.includes("本地") || content.includes("ollama") || content.includes("qwen")) target = "local";

  if (!target) { await s.reply("❌ 未知模型，可选：DeepSeek、基元、本地"); return; }

  config.set("current", target);
  const m = models[target];
  await s.reply("✅ 已切换到 **" + m.name + "**\\n🔄 新对话生效，现在试试问我吧！");
}

main();
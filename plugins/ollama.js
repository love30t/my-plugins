/**
 * @title 本地AI问答
 * @rule raw ^问
 * @priority 0
 * @disable false
 * @admin false
 * @public true
 * @description 调用本地Ollama模型回答问题
 * @class 工具
 */
const http = require("http");
const { sender: s, console } = require("sillygirl");

async function main() {
  const content = String(await s.getContent() || "").trim();
  const question = content.replace(/^问\s*/, "").trim();
  if (!question) {
    await s.reply("用法：问 你的问题");
    return;
  }
  await s.reply("🤔 思考中...");
  try {
    const res = await new Promise((resolve, reject) => {
      const data = JSON.stringify({
        model: "qwen2.5:0.5b",
        prompt: question,
        stream: false,
        options: { temperature: 0.7, max_tokens: 512 }
      });
      const req = http.request({
        hostname: "172.17.0.1",
        port: 11434,
        path: "/api/generate",
        method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) }
      }, (r) => {
        let body = "";
        r.on("data", c => body += c);
        r.on("end", () => { try { resolve(JSON.parse(body).response.trim()); } catch(e) { reject(e); } });
      });
      req.on("error", reject);
      req.write(data);
      req.end();
    });
    await s.reply(res);
  } catch(e) {
    await s.reply("❌ " + (e.message || String(e)));
  }
}
main();

/**
 * @title 今日铜价
 * @author Hermes
 * @version v1.0.0
 * @description 查询今日铜价行情（长江现货、上海、广东等地区铜价）
 * @rule raw ^(铜价|今日铜价|铜价行情|铜)$
 * @admin false
 * @public true
 * @priority 0
 * @origin love30t/my-plugins
 */

const { sender: s, console } = require("sillygirl");
const https = require("https");
const zlib = require("zlib");

// 涨跌箭头
function getArrow(change) {
  const num = parseInt(change.replace(/[+,]/g, ""));
  if (num > 0) return "📈";
  if (num < 0) return "📉";
  return "➡️";
}

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9"
      },
      timeout: 15000
    }, (res) => {
      const chunks = [];
      res.on("data", chunk => chunks.push(chunk));
      res.on("end", () => {
        const buffer = Buffer.concat(chunks);
        const encoding = res.headers["content-encoding"];

        if (encoding && encoding.includes("gzip")) {
          zlib.gunzip(buffer, (err, decoded) => {
            if (err) reject(err);
            else resolve(decoded.toString("utf-8"));
          });
        } else {
          resolve(buffer.toString("utf-8"));
        }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("请求超时")); });
  });
}

function extractPriceData(html) {
  // 匹配铜价表格行
  // 格式: <a ...>NAME</a></td><td ...><span ...>PRICE_RANGE</span></td><td ...><span ...>AVG</span></td><td ...><span ...>CHANGE</span></td>
  const regex = /<a[^>]*href="[^"]*"[^>]*>([^<]+)<\/a><\/td><td[^>]*><span[^>]*>([0-9,\s]+-[0-9,\s]+)<\/span><\/td><td[^>]*><span[^>]*>([0-9,]+)<\/span><\/td><td[^>]*><span[^>]*>([+-]?[0-9,]+)<\/span><\/td>/g;

  const prices = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    prices.push({
      name: match[1].trim().replace(/铜价$/, ""),
      range: match[2].trim(),
      avg: match[3].trim(),
      change: match[4].trim()
    });
  }
  return prices;
}

function formatMessage(prices) {
  const lines = [];
  lines.push("🟠 **今日铜价行情**");
  lines.push("━━━━━━━━━━━━━━━━");
  lines.push("");

  for (const p of prices) {
    const arrow = getArrow(p.change);
    const changeStr = p.change.startsWith("+") ? p.change : p.change;
    lines.push(`${arrow} ${p.name}: ${p.range}`);
    lines.push(`   均价 ${p.avg} 元/吨  (${changeStr})`);
  }

  lines.push("");
  lines.push("━━━━━━━━━━━━━━━━");
  lines.push("📊 数据来源：上海有色网 (SMM)");
  return lines.join("\n");
}

async function main() {
  try {
    const html = await fetchPage("https://hq.smm.cn/h5/cu");
    const prices = extractPriceData(html);

    if (prices.length === 0) {
      await s.reply("❌ 获取铜价数据失败，请稍后再试");
      return;
    }

    const msg = formatMessage(prices);
    await s.reply(msg);
  } catch (e) {
    console.error("[铜价插件] Error:", e.message);
    await s.reply("❌ 查询铜价失败: " + e.message);
  }
}

main();
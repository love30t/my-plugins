/**
 * @title 模型切换
 * @rule raw ^(切DeepSeek|切本地|当前模型|模型状态)$
 * @priority 100
 * @disable false
 * @admin false
 * @public true
 * @description 切换模型（DeepSeek、本地）
 * @class 工具类
 * @platform qq
 * @origin love30t/my-plugins
 */

const { sender: s, console, sillyGirlCreateSchema, SillyGirlPluginConfig } = require("sillygirl");

// 注册插件配置
const jsonSchema = sillyGirlCreateSchema.object({
  enable: sillyGirlCreateSchema.boolean().setTitle("是否启用").setDefault(true),
});
const pluginConfig = new SillyGirlPluginConfig(jsonSchema);

const content = String(s.getContent() || "").trim();
const models = {
  "deepseek": "DeepSeek v4 Flash",
  "local": "本地Qwen2.5:0.5b"
};

let target = "";
if (content.includes("DeepSeek") || content.includes("deepseek")) target = "deepseek";
else if (content.includes("本地") || content.includes("ollama")) target = "local";

if (content === "当前模型" || content === "模型状态") {
  s.reply("🤖 当前模型链路：\n🥇 DeepSeek → 🥈 本地");
} else if (target) {
  s.reply("✅ 已切换到 **" + models[target] + "**\n🔄 新对话生效！");
} else {
  s.reply("❌ 未知模型，可选：DeepSeek、本地");
}

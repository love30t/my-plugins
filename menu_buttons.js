/**
 * @title 菜单按钮
 * @rule raw ^(菜单|功能|按钮|start)$
 * @priority 100
 * @disable false
 * @admin false
 * @public true
 * @description 带按钮的功能菜单
 * @class 工具类
 * @platform qq
 */

const { sender: s, console } = require("sillygirl");

async function main() {
  const text = "📋 **功能菜单**\n════════════════\n\n" +
    "🍑 发 `乃子` - 随机乃子图\n" +
    "👩 发 `美女` - 随机美女图\n" +
    "🖤 发 `黑丝` - 随机黑丝图\n" +
    "🤍 发 `白丝` - 随机白丝图\n" +
    "🖼 发 `头像` - 随机头像\n" +
    "🌄 发 `壁纸` - 随机壁纸\n" +
    "🤖 发 `问 xxx` - 本地AI问答\n" +
    "════════════════\n" +
    "🔄 模型切换：\n" +
    "  `切DeepSeek` / `切基元` / `切本地`\n" +
    "════════════════\n" +
    "💡 点下面的按钮更快👇";
  
  // 使用 markdown 格式发送键盘消息
  // 通过 JSON 格式让 Napcat 解析为 keyboard 消息
  await s.reply(text);
}

main();
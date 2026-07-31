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

// 键盘按钮布局
const keyboard = {
  content: {
    rows: [
      {
        buttons: [
          { id: "1", render_data: { label: "🍑 乃子", visited_label: "已点" }, action: { type: 2, permission: { type: 2 }, data: "乃子", reply: true, enter: true } },
          { id: "2", render_data: { label: "👩 美女", visited_label: "已点" }, action: { type: 2, permission: { type: 2 }, data: "美女", reply: true, enter: true } },
          { id: "3", render_data: { label: "🖤 黑丝", visited_label: "已点" }, action: { type: 2, permission: { type: 2 }, data: "黑丝", reply: true, enter: true } },
          { id: "4", render_data: { label: "🤍 白丝", visited_label: "已点" }, action: { type: 2, permission: { type: 2 }, data: "白丝", reply: true, enter: true } }
        ]
      },
      {
        buttons: [
          { id: "5", render_data: { label: "🖼 头像", visited_label: "已点" }, action: { type: 2, permission: { type: 2 }, data: "头像", reply: true, enter: true } },
          { id: "6", render_data: { label: "🌄 壁纸", visited_label: "已点" }, action: { type: 2, permission: { type: 2 }, data: "壁纸", reply: true, enter: true } },
          { id: "7", render_data: { label: "🤖 问AI", visited_label: "已点" }, action: { type: 2, permission: { type: 2 }, data: "问 ", reply: true, enter: true } },
          { id: "8", render_data: { label: "📋 菜单", visited_label: "已点" }, action: { type: 2, permission: { type: 2 }, data: "菜单", reply: true, enter: true } }
        ]
      },
      {
        buttons: [
          { id: "9", render_data: { label: "🔄 切DeepSeek", visited_label: "已切" }, action: { type: 2, permission: { type: 2 }, data: "切DeepSeek", reply: true, enter: true } },
          { id: "10", render_data: { label: "🔄 切基元", visited_label: "已切" }, action: { type: 2, permission: { type: 2 }, data: "切基元", reply: true, enter: true } },
          { id: "11", render_data: { label: "🔄 切本地", visited_label: "已切" }, action: { type: 2, permission: { type: 2 }, data: "切本地", reply: true, enter: true } }
        ]
      }
    ]
  }
};

s.reply({
  type: "markdown",
  data: {
    content: "📋 **功能菜单**\\n════════════════\\n点按钮自动回复👇",
    keyboard: keyboard
  }
});
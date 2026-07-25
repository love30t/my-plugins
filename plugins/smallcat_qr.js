/**
 * @title 扫码上号
 * @rule raw ^扫码$
 * @rule raw ^上号$
 * @rule raw ^账号列表$
 * @priority 0
 * @disable false
 * @admin false
 * @public true
 * @description 通过 Smallcat 扫码登录，支持京东等平台
 * @class 工具
 * @version v1.0.0
 */

const { SmallCat, sender: s, console } = require("sillygirl");

async function main() {
  const content = String(await s.getContent() || "").trim();

  // 账号列表
  if (content === "账号列表") {
    try {
      const sc = new SmallCat({ id: 1 });
      const users = await sc.userList();
      if (users.status && users.data && users.data.items) {
        const list = users.data.items.map((u, i) => 
          `${i+1}. ${u.displayName || u.nickname || "未知"} (${u.type == 1 ? "京东" : "其他"})`
        );
        await s.reply("📋 已登录账号：\n" + (list.length ? list.join("\n") : "暂无"));
      } else {
        await s.reply("暂无账号");
      }
    } catch(e) {
      await s.reply("❌ 获取失败: " + (e.message || String(e)));
    }
    return;
  }

  // 扫码登录
  try {
    const sc = new SmallCat({ id: 1 });
    const qr = await sc.createQr(1);  // type 1 = 京东
    
    if (!qr.status) {
      await s.reply("❌ 生成二维码失败：" + (qr.message || "未知错误"));
      return;
    }

    const qrUrl = qr.data && (qr.data.qrcodeUrl || qr.data.url);
    const uuid = qr.data && qr.data.uuid;

    if (!qrUrl) {
      await s.reply("❌ 二维码数据异常");
      return;
    }

    await s.reply(`📱 请用京东/微信扫码\n[CQ:image,file=${qrUrl}]\n有效期2分钟`);

    if (!uuid) {
      await s.reply("❌ 缺少UUID，无法检测扫码状态");
      return;
    }

    // 等待扫码
    for (let i = 0; i < 40; i++) {  // 最长等2分钟（3秒*40次）
      const checked = await sc.checkQr(uuid);
      
      if (checked.data && checked.data.state === "confirmed") {
        const wxCode = checked.data.wxCode || checked.data.code;
        if (wxCode) {
          const saved = await sc.addUser({
            code: wxCode,
            type: checked.data.type || 1,
            displayName: "QQ扫码_" + (await s.getUserName() || ""),
          });
          await s.reply("✅ 登录成功！" + (saved.message || ""));
        } else {
          await s.reply("❌ 扫码成功但未获取到授权码");
        }
        return;
      }
      
      if (checked.data && checked.data.state === "expired") {
        await s.reply("⏰ 二维码已过期，请重新发送「扫码」");
        return;
      }
      
      await new Promise(r => setTimeout(r, 3000));
    }

    await s.reply("⏰ 扫码超时，请重新发送「扫码」");
    
  } catch(e) {
    console.error("扫码插件错误:", e);
    await s.reply("❌ 出错: " + (e.message || String(e)));
  }
}

main();

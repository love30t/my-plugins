/**
 * @title 涩涩
 * @rule raw ^(乃子|美女|黑丝|白丝|头像|壁纸)$
 * @priority 0
 * @disable false
 * @admin false
 * @public true
 * @author Jray_P
 * @version v1.1.0
 * @description 根据命令随机获取图片，可选记录并推送使用通知
 * @class 娱乐类
 * @platform qq
 * @icon http://jray.fun:5080/admin/images/gallery/1732760275082925068.gif
 * @origin Jray_P
 */

const http = require("http");
const https = require("https");
const { Bucket, sender: s, console } = require("sillygirl");

const config = new Bucket("Jray_config");

/*
 * 接口配置。
 * apiKey 为空时不携带 apiKey 参数。
 */
const commands = {
  "乃子": {
    apiType: "yo_cup",
    apiKey: "9d02cd6e10c51f16ccc27cc164ac4b6d",
    featureName: "乃子"
  },
  "美女": {
    apiType: "meinv_img",
    apiKey: "5139167a391a2f282283bc8eb28fe6ab",
    featureName: "美女"
  },
  "黑丝": {
    apiType: "heisi_img",
    apiKey: "9f2132d1e1ace9d304afe3c4e999e0ad",
    featureName: "黑丝"
  },
  "白丝": {
    apiType: "baisi_img",
    apiKey: "efa4842cc08a1265d7fe54f5dd4f1f32",
    featureName: "白丝"
  },
  "头像": {
    apiType: "avatar_woman",
    apiKey: "",
    featureName: "头像"
  },
  "壁纸": {
    apiType: "bing_img",
    apiKey: "",
    featureName: "壁纸"
  }
};

function requestImage(url, timeout = 10000, redirects = 5) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https:") ? https : http;

    const req = client.get(
      url,
      {
        headers: {
          "User-Agent": "SillyGirl-image-plugin/1.1"
        }
      },
      (res) => {
        const statusCode = res.statusCode || 0;

        if (
          statusCode >= 300 &&
          statusCode < 400 &&
          res.headers.location
        ) {
          res.resume();

          if (redirects <= 0) {
            reject(new Error("图片接口重定向次数过多"));
            return;
          }

          const redirectUrl = new URL(res.headers.location, url).toString();

          requestImage(redirectUrl, timeout, redirects - 1)
            .then(resolve)
            .catch(reject);
          return;
        }

        /*
         * 部分接口直接返回图片，而不是重定向。
         * 这种情况下继续使用原接口 URL 作为图片地址。
         */
        if (statusCode >= 200 && statusCode < 300) {
          res.resume();
          resolve(url);
          return;
        }

        res.resume();
        reject(new Error(`图片接口返回 HTTP ${statusCode}`));
      }
    );

    req.setTimeout(timeout, () => {
      req.destroy(new Error(`图片接口请求超时（${timeout}ms）`));
    });

    req.on("error", reject);
  });
}

function buildApiUrl(item) {
  const baseUrl = `https://jkapi.com/api/${item.apiType}`;

  if (!item.apiKey) {
    return baseUrl;
  }

  return `${baseUrl}?apiKey=${encodeURIComponent(item.apiKey)}`;
}

async function getImageUrl(item) {
  const apiUrl = buildApiUrl(item);
  const imageUrl = await requestImage(apiUrl);

  if (!/^https?:\/\//i.test(imageUrl)) {
    throw new Error("图片接口没有返回有效 URL");
  }

  return imageUrl;
}

async function replyImage(imageUrl) {
  /*
   * OneBot CQ 图片格式。
   * SillyGirl 会将其交给 QQ 适配器发送。
   */
  await s.reply(`[CQ:image,file=${imageUrl}]`);
}

async function sendUsageNotice(featureName) {
  const enabled = String(
    await config.get("ss_pushconfig", "false") || "false"
  ).toLowerCase() === "true";

  if (!enabled) {
    return;
  }

  const imType = String(
    await config.get("ss_pushimtype", "") || ""
  ).trim();

  const groupCode = String(
    await config.get("ss_pushgroupcode", "") || ""
  ).trim();

  const userID = String(
    await config.get("ss_pushuserid", "") || ""
  ).trim();

  const title = String(
    await config.get("ss_pushtitle", "") || ""
  ).trim();

  const content = String(
    await config.get("ss_pushcontent", "") || ""
  ).trim();

  if (!imType || !content || (!groupCode && !userID)) {
    console.error("涩涩推送配置不完整，已跳过推送");
    return;
  }

  let username = "";

  try {
    username = String(await s.getUserName() || "").trim();
  } catch (error) {
    console.error(`读取用户名失败：${error.message || error}`);
  }

  const dynamicContent = [
    username,
    content,
    featureName
  ].filter(Boolean).join(" ");

  /*
   * 不同 SillyGirl 版本的主动推送接口可能不同。
   * 优先使用 sender.push；当前版本不支持时只记录日志，
   * 不影响正常回复图片。
   */
  if (typeof s.push !== "function") {
    console.error(
      `当前版本不支持 sender.push，未推送：` +
      `${imType}/${groupCode}/${userID} ${title} ${dynamicContent}`
    );
    return;
  }

  await s.push({
    imType,
    groupCode,
    userID,
    title,
    content: dynamicContent
  });
}

async function main() {
  const content = String(await s.getContent() || "").trim();
  const item = commands[content];

  if (!item) {
    return;
  }

  try {
    const imageUrl = await getImageUrl(item);

    console.log(
      `图片接口请求成功：${item.featureName} -> ${imageUrl}`
    );

    await replyImage(imageUrl);

    try {
      await sendUsageNotice(item.featureName);
    } catch (error) {
      console.error(`推送失败：${error.message || error}`);
    }
  } catch (error) {
    const message = error && error.message
      ? error.message
      : String(error);

    console.error(error);
    await s.reply(`图片获取失败：${message}`);
  }
}

main();
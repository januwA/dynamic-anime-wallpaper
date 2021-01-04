const https = require("https");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

/**
 * 发送https.get请求
 * @param {string} url
 */
const get = async function get(url) {
  const { data, status } = await axios.get(url);
  console.log("%s statusCode is %d", url, status);
  return data;
};
module.exports = {
  get,

  /**
   * 创建一个PowerShell脚本
   * @param {string} localpath local image file path
   */
  async create_ps1(localpath, filename) {
    return new Promise((_res, _rej) => {
      fs.writeFile(
        filename,
        `$imgPath="${localpath}"
$code = @'
using System.Runtime.InteropServices; 
namespace Win32{ 
     public class Wallpaper{ 
        [DllImport("user32.dll", CharSet=CharSet.Auto)] 
         static extern int SystemParametersInfo (int uAction , int uParam , string lpvParam , int fuWinIni); 
         public static void SetWallpaper(string thePath){ 
            SystemParametersInfo(20,0,thePath,3); 
         }
    }
 } 
'@

add-type $code 
[Win32.Wallpaper]::SetWallpaper($imgPath)
  `,
        (err) => {
          if (err) _rej(err);
          else _res();
        }
      );
    });
  },

  /**
   * 将网络上的image下载到本地
   * @param {string} imgUrl
   */
  async download(imgUrl) {
    return new Promise((_res, _rej) => {
      https.get(imgUrl, (res) => {
        const ext = path.extname(imgUrl);
        const localpath = path.resolve(__dirname, "./wallpaper" + ext);
        res
          .pipe(fs.createWriteStream(localpath))
          .on("close", () => _res(localpath))
          .on("error", _rej);
      });
    });
  },

  /**
   * 从html中获取imgUrl
   * @param {string} url
   */
  async getWallpaperImage(url) {
    const data = await get(url);
    const m = data.match(
      /<div class="wpBig wpBigFull">\s*<a href="([^"]+)" title=/
    );
    if (m && m[1]) return m[1];
  },

  /**
   * 获取壁纸的大小
   * @param {string} data
   */
  getImageSize(data) {
    const m = data.match(
      /<div class="wallpaperBgRes wallpaperBgDefault">(\d+x\d+)<\/div>/
    );
    return m[1] ?? "1920x1080";
  },

  getFirstImage(data) {
    const m = data.match(
      /<div\s*class="wallpaperBg">\s*<a href="([^"]+)" title=/
    );
    if (m && m[1]) return m[1];
  },
};

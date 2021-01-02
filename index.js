#!/usr/bin/env node

const path = require("path");
const exec = require("child_process").exec;

const {
  create_ps1,
  download,
  get,
  getWallpaperImage,
  getImageSize,
} = require("./util");

const ANIME_BASE_URL = "https://www.wallpapermaiden.com/category/anime";
const PS1_FINENAME = "SetWall.ps1";
const PS1_PATH = path.resolve(__dirname, PS1_FINENAME);
const MS = 1000 * 60 * 60 * 3; // 3小时

let newImage = "";
let errorCount = 0;

handle();
setInterval(handle, MS); // 每隔3小时检查一次

async function handle() {
  try {
    const data = await get(ANIME_BASE_URL);
    const m = data.match(
      /<div\s*class="wallpaperBg">\s*<a href="([^"]+)" title=/
    );
    if (m && m[1]) {
      if (newImage === m[1]) return console.log("is not update.");
      newImage = m[1];
      const size = getImageSize(data) ?? "1920x1080";
      const imgUrl = await getWallpaperImage(newImage + "/download/" + size);
      console.log("imgUrl: %s", imgUrl);
      if (imgUrl) {
        const localpath = await download(imgUrl);
        console.log("localpath: %s", localpath);
        await create_ps1(localpath, PS1_FINENAME);
        exec(`powershell.exe ${PS1_PATH}`, (err) => {
          if (err) console.error(err);
        });
        errorCount = 0;
      }
    }
  } catch (error) {
    console.error(error);
    // 出现了任何错误直接重试
    errorCount++;
    if (errorCount < 100) await handle();
    else errorCount = 0;
  }
}

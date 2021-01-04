#!/usr/bin/env node

const path = require("path");
const { exec } = require("child_process");

const {
  create_ps1,
  download,
  get,
  getWallpaperImage,
  getImageSize,
  getFirstImage,
} = require("./util");

const ANIME_BASE_URL = "https://www.wallpapermaiden.com/category/anime";
const PS1_PATH = path.resolve(__dirname, "SetWall.ps1");

let newImage = "";

handle();
setInterval(handle, 1000 * 60 * 10); // 每隔10分钟

async function handle() {
  try {
    const data = await get(ANIME_BASE_URL);
    const firstImage = getFirstImage(data);
    if (!firstImage) return console.error;
    ("Error: is not find new image.");
    if (newImage === firstImage) return console.log("is not update.");
    const size = getImageSize(data);
    console.log("New Image Size: %s", size);
    const imgLink = await getWallpaperImage(firstImage + "/download/" + size);
    if (!imgLink) return console.error("not find image download link.");

    console.log("start download image: %s", imgLink);
    const localpath = await download(imgLink);
    console.log("local path: %s", localpath);

    await create_ps1(localpath, PS1_PATH);
    exec(`powershell.exe ${PS1_PATH}`, (err) => {
      if (err) return console.error(err);
      console.log("set wallpaper success.");
      newImage = firstImage;
    });
  } catch (error) {
    console.error("Handle Error: %s", error.message);
  }
}

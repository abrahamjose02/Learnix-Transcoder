
import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import ffmpeg from "fluent-ffmpeg";
import crypto from "crypto";


// Ensure ffmpegStatic is not null
const ffmpegPath = "C:\\ffmpeg\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe";
if (!ffmpegPath) {
  throw new Error(
    "FFmpeg binary not found. Please ensure ffmpeg-static is installed correctly."
  );
}

// Set ffmpeg path to the static binary
ffmpeg.setFfmpegPath(ffmpegPath);


export const FFmpegTranscoder = async (file: any): Promise<any> => {
  try {
    console.log("Starting script");
    console.time("req_time");

    const randomName = (bytes = 32) =>
      crypto.randomBytes(bytes).toString("hex");
    const fileName = randomName();
    const directoryPath = path.join(__dirname, "..", "..", "input");
    const filePath = path.join(directoryPath, `${fileName}.mp4`);

    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    const paths = await new Promise<any>((resolve, reject) => {
      fs.writeFile(filePath, file, async (err) => {
        if (err) {
          console.error("Error saving file:", err);
          throw err;
        }
        console.log("File saved successfully:", filePath);

        try {
          const outputDirectoryPath = await transcodeWithFFmpeg(
            fileName,
            filePath
          );
          resolve({ directoryPath, filePath, fileName, outputDirectoryPath });
          // const wavFilePath = await convertToWav(filePath);
          // const vttFilePath = await transcriber(wavFilePath);
          // console.log(`Deleting locally uploaded mp4 file`);
          // fs.unlinkSync(filePath);
          // console.log(`Deleted locally uploaded mp4 file`);
        } catch (error) {
          console.error("Error transcoding with FFmpeg:", error);
        }
      });
    });
    return paths;
  } catch (e: any) {
    console.log(e);
  }
};

const transcodeWithFFmpeg = async (fileName: string, filePath: string) => {
  const directoryPath = path.join(
    __dirname,
    "..",
    "..",
    `output/hls/${fileName}`
  );
  // const directoryPath = `../output/hls/${fileName}`;
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  // resolutions..
  const resolutions = [
    {
      resolution: "256x144",
      videoBitrate: "200k",
      audioBitrate: "64k",
    },
    {
      resolution: "640x360",
      videoBitrate: "800k",
      audioBitrate: "128k",
    },
    {
      resolution: "1280x720",
      videoBitrate: "2500k",
      audioBitrate: "192k",
    },
    {
      resolution: "1920x1080",
      videoBitrate: "5000k",
      audioBitrate: "256k",
    },
  ];

  const variantPlaylists: { resolution: string; outputFileName: string }[] = [];

  for (const { resolution, videoBitrate, audioBitrate } of resolutions) {
    console.log(`HLS conversion starting for ${resolution}`);
    const outputFileName = `${fileName}_${resolution}.m3u8`;
    const segmentFileName = `${fileName}_${resolution}_%03d.ts`;

    await new Promise<void>((resolve, reject) => {
      ffmpeg(filePath)
        .outputOptions([
          `-c:v h264`,
          `-b:v ${videoBitrate}`,
          `-c:a aac`,
          `-b:a ${audioBitrate}`,
          `-vf scale=${resolution}`,
          `-f hls`,
          `-hls_time 10`,
          `-hls_list_size 0`,
          `-hls_segment_filename`, `${directoryPath}/${segmentFileName}`,
        ])
        .output(`${directoryPath}/${outputFileName}`)
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .run();
    });
    const variantPlaylist = {
      resolution,
      outputFileName,
    };
    variantPlaylists.push(variantPlaylist);
    console.log(`HLS conversion done for ${resolution}`);
  }
  console.log(`HLS master m3u8 playlist generating`);

  let masterPlaylist = variantPlaylists
    .map((variantPlaylist) => {
      const { resolution, outputFileName } = variantPlaylist;
      const bandwidth =
      resolution === "256x144"
      ? 264000
      : resolution === "640x360"
      ? 1024000
      : resolution === "1280x720"
      ? 3072000
      : 5500000;``
      return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n${outputFileName}`;
    })
    .join("\n");
  masterPlaylist = `#EXTM3U\n` + masterPlaylist;

  const masterPlaylistFileName = `${fileName}_master.m3u8`;

  const masterPlaylistPath = `${directoryPath}/${masterPlaylistFileName}`;
  fs.writeFileSync(masterPlaylistPath, masterPlaylist);
  console.log(`HLS master m3u8 playlist generated`);
  return directoryPath;
};
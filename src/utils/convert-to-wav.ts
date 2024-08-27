import Ffmpeg from "fluent-ffmpeg";
import * as path from "path";

export const convertToWav = async (filePath: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const wavFileName =
      path.basename(filePath, path.extname(filePath)) + ".wav";
    const wavFilePath = path.join(path.dirname(filePath), wavFileName);

    Ffmpeg(filePath)
      .outputOptions([
        "-vn", // Extract audio
        "-acodec pcm_s16le", // Audio codec
        "-ar 16000", // Sample rate 16 kHz
        "-ac 1", // Audio channels to 1 (mono)
      ])
      .output(wavFilePath)
      .on("end", () => resolve(wavFilePath))
      .on("error", (err) => reject(err))
      .run();
  });
};

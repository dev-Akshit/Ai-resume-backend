import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import fs from "fs";
import { createClient } from "@deepgram/sdk";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

export function extractAudio(videoPath, audioPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(audioPath)
      .noVideo()
      .audioCodec("libmp3lame")
      .on("end", () => resolve(audioPath))
      .on("error", (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
      .run();
  });
}

export async function transcribeAudio(filePath) {
  const audio = fs.readFileSync(filePath);

  const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
    audio,
    {
      model: "nova-3",
      smart_format: true,
      language: "en",
    }
  );

  if (error) throw new Error(`Deepgram error: ${error}`);
  return result.results.channels[0].alternatives[0].transcript;
}

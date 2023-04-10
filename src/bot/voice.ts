import f from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import { Readable } from 'stream';
import fetch from 'node-fetch';
import AIService from '../openai/openAI.service';

ffmpeg.setFfmpegPath(f.path);

class Voice {
  private openai: AIService;
  constructor() {
    this.openai = new AIService();
  }
  async download(fileUrl: string) {
    const stream = await fetch(fileUrl).then((res) => res.body);
    return stream;
  }
  async convert(stream: Readable) {
    const outStream = fs.createWriteStream('tmp/out.mp3');
    const audio = ffmpeg(stream)
      .audioCodec('libmp3lame')
      .format('mp3')
      .on('error', (err) => {
        console.log('An error occurred: ' + err.message);
      })
      .pipe(outStream, { end: true });
    return audio;
  }
  async handle(fileUrl: string) {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      console.log('Failed to download the file:', response.statusText);
      return;
    }
    const stream = response.body;
    const readable = Readable.from(stream);
    const audio = await this.convert(readable);
    return new Promise<string>((resolve, reject) => {
      audio.on('finish', async () => {
        const res = await this.openai.transcribeAudio('tmp/out.mp3');
        if (res === "Une erreur est survenue") {
          reject(res);
          return;
        }
        const message = res.text;
        resolve(message);
      });
      audio.on('error', (err) => {
        reject(err);
      });
    });
  }
}

export default Voice;

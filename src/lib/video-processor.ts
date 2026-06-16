import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from 'ffmpeg-static';
import path from 'path';
import fs from 'fs';

// Set ffmpeg path
// Set ffmpeg path
let resolvedPath: string = ffmpegInstaller || '';

if (resolvedPath.startsWith('/ROOT/')) {
    resolvedPath = path.join(process.cwd(), resolvedPath.replace('/ROOT/', ''));
}

if (!resolvedPath || !fs.existsSync(resolvedPath)) {
    // Definitive path discovered via terminal on this system
    resolvedPath = '/Users/christian/WORKSPACE ANTIGRAVITY/node_modules/ffmpeg-static/ffmpeg';
}

console.log('Final FFmpeg Executable Path:', resolvedPath);
if (fs.existsSync(resolvedPath)) {
  console.log('FFmpeg binary found!');
  ffmpeg.setFfmpegPath(resolvedPath);
} else {
  // Last resort: standard system path
  const fallback = '/usr/local/bin/ffmpeg';
  if (fs.existsSync(fallback)) {
     ffmpeg.setFfmpegPath(fallback);
  }
}

export type CompressionPreset = 'high' | 'medium' | 'low';

export interface VideoMetadata {
  id: string;
  originalName: string;
  processedName: string;
  path: string;
  size: number;
  format: string;
  date: string;
  situation: string;
  tags: string[];
}

export async function processVideo(
  inputPath: string,
  outputPath: string,
  preset: CompressionPreset,
  suffix: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath);

    switch (preset) {
      case 'high':
        command = command.videoCodec('libx264').outputOptions('-crf 18').preset('slow');
        break;
      case 'medium':
        command = command.size('1280x720').videoCodec('libx264').outputOptions('-crf 23');
        break;
      case 'low':
        command = command.size('854x480').videoCodec('libx264').outputOptions('-crf 28');
        break;
    }

    command
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(outputPath);
  });
}

export function generateOutputPath(
  originalPath: string,
  suffix: string,
  folderPattern: string = 'processed'
): string {
  const ext = path.extname(originalPath);
  const name = path.basename(originalPath, ext);
  const publicPath = path.join(process.cwd(), 'public', folderPattern);
  
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
  }

  return path.join(publicPath, `${name}${suffix}${ext}`);
}

'use server';

import { processVideo, generateOutputPath, CompressionPreset, VideoMetadata } from '@/lib/video-processor';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const CATALOG_PATH = path.join(process.cwd(), 'src/data/video-catalog.json');

export async function getVideos(): Promise<VideoMetadata[]> {
  if (!fs.existsSync(CATALOG_PATH)) {
    return [];
  }
  const data = fs.readFileSync(CATALOG_PATH, 'utf-8');
  return JSON.parse(data);
}

export async function getPublicVideos(): Promise<string[]> {
  const publicVideosPath = path.join(process.cwd(), 'public/videos');
  if (!fs.existsSync(publicVideosPath)) {
    return [];
  }
  
  const files = fs.readdirSync(publicVideosPath, { withFileTypes: true });
  return files
    .filter(file => !file.isDirectory() && /\.(mp4|mov|avi|mkv|m4v)$/i.test(file.name))
    .map(file => file.name);
}

export async function processVideoAction(
  inputFileName: string,
  preset: CompressionPreset,
  suffix: string,
  situation: string,
  tags: string[],
  targetFolder: string = 'processed'
) {
  const inputPath = path.join(process.cwd(), 'public', inputFileName);
  
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Archivo no encontrado: ${inputFileName}`);
  }

  const outputPath = generateOutputPath(inputFileName, suffix, targetFolder);
  const processedName = path.basename(outputPath);

  await processVideo(inputPath, outputPath, preset, suffix);

  const stats = fs.statSync(outputPath);
  const newVideo: VideoMetadata = {
    id: uuidv4(),
    originalName: path.basename(inputFileName),
    processedName,
    path: `/${targetFolder}/${processedName}`,
    size: stats.size,
    format: path.extname(outputPath),
    date: new Date().toISOString(),
    situation,
    tags
  };

  const currentCatalog = await getVideos();
  currentCatalog.push(newVideo);
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(currentCatalog, null, 2));

  return newVideo;
}

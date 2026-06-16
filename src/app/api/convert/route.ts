import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { promisify } from "util";
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

// Set FFmpeg path globally for fluent-ffmpeg
ffmpeg.setFfmpegPath(ffmpegStatic!);

// Local temporary directory for conversion
const TEMP_DIR = path.join(process.cwd(), 'public', 'temp_convert');

// Ensure directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se ha subido ningún archivo" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const inputExt = path.extname(file.name);
    const inputPath = path.join(TEMP_DIR, `${timestamp}_input${inputExt}`);
    const outputPath = path.join(TEMP_DIR, `${timestamp}_output.mp4`);

    // Write input file to disk
    fs.writeFileSync(inputPath, buffer);

    console.log(`🚀 Iniciando conversión: ${file.name} -> MP4`);

    return new Promise((resolve) => {
      ffmpeg(inputPath)
        .output(outputPath)
        .videoCodec('libx264')
        .size('1280x?') // HD 720p scaling for better performance/size
        .on('start', (commandLine) => {
          console.log('FFmpeg command: ' + commandLine);
        })
        .on('end', () => {
          console.log('✅ Conversión completada.');
          
          // Cleanup input
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          
          const relativeUrl = `/temp_convert/${timestamp}_output.mp4`;
          
          resolve(NextResponse.json({ 
            success: true, 
            url: relativeUrl,
            message: "¡Conversión exitosa!"
          }));
        })
        .on('error', (err) => {
          console.error('❌ Error FFmpeg:', err);
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          resolve(NextResponse.json({ error: "Error en el procesamiento de video" }, { status: 500 }));
        })
        .run();
    });

  } catch (error) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// Optional: Cleanup old files periodically could be added here

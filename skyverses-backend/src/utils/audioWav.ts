export interface WavInfo {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
  dataOffset: number;
  dataSize: number;
}

export function parseWav(buf: Buffer): WavInfo {
  if (
    buf.length < 44 ||
    buf.toString("ascii", 0, 4) !== "RIFF" ||
    buf.toString("ascii", 8, 12) !== "WAVE"
  ) {
    throw new Error("Not a WAV buffer");
  }

  let off = 12;
  let sampleRate = 0;
  let channels = 1;
  let bitsPerSample = 16;
  let dataOffset = 0;
  let dataSize = 0;

  while (off + 8 <= buf.length) {
    const id = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === "fmt ") {
      const fmtCode = buf.readUInt16LE(off + 8);
      if (fmtCode !== 1) throw new Error(`WAV format ${fmtCode} unsupported`);
      channels = buf.readUInt16LE(off + 10);
      sampleRate = buf.readUInt32LE(off + 12);
      bitsPerSample = buf.readUInt16LE(off + 22);
    } else if (id === "data") {
      dataOffset = off + 8;
      dataSize = size;
      break;
    }
    off += 8 + size + (size & 1);
  }

  if (!sampleRate || !dataSize) throw new Error("WAV missing fmt or data chunk");
  return { sampleRate, channels, bitsPerSample, dataOffset, dataSize };
}

export function buildWavHeader(
  pcmSize: number,
  sampleRate: number,
  channels = 1,
  bitsPerSample = 16
): Buffer {
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcmSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcmSize, 40);
  return header;
}

export function concatWavs(buffers: Buffer[], gapMs = 0): Buffer {
  if (buffers.length === 0) throw new Error("concatWavs: empty input");
  if (buffers.length === 1 && gapMs === 0) return buffers[0];

  const infos = buffers.map(parseWav);
  const { sampleRate, channels, bitsPerSample } = infos[0];

  for (let i = 1; i < infos.length; i += 1) {
    if (
      infos[i].sampleRate !== sampleRate ||
      infos[i].channels !== channels ||
      infos[i].bitsPerSample !== bitsPerSample
    ) {
      throw new Error("WAV format mismatch");
    }
  }

  const blockAlign = (channels * bitsPerSample) / 8;
  const rawGapSize =
    gapMs > 0 ? Math.floor((sampleRate * blockAlign * gapMs) / 1000) : 0;
  const gapSize = rawGapSize - (rawGapSize % blockAlign);
  const totalDataSize =
    infos.reduce((sum, info) => sum + info.dataSize, 0) +
    gapSize * (buffers.length - 1);

  return Buffer.concat(
    [
      buildWavHeader(totalDataSize, sampleRate, channels, bitsPerSample),
      ...buffers.flatMap((buf, index) => {
        const info = infos[index];
        const pcm = buf.subarray(info.dataOffset, info.dataOffset + info.dataSize);
        if (index === buffers.length - 1 || gapSize === 0) return [pcm];
        return [pcm, Buffer.alloc(gapSize)];
      }),
    ],
    44 + totalDataSize
  );
}

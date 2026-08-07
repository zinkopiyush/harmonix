/**
 * Parses raw LRC lyrics string into timestamped lines.
 * Format: [mm:ss.xx] Lyrics text
 */
export function parseLRC(lrcText) {
  if (!lrcText) return [];

  const lines = lrcText.split(/\r?\n/);
  const result = [];

  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/g;

  for (const line of lines) {
    const matches = [...line.matchAll(timeRegex)];
    if (matches.length > 0) {
      const text = line.replace(timeRegex, '').trim();
      for (const match of matches) {
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const msStr = match[3];
        const ms = msStr.length === 2 ? parseInt(msStr, 10) * 10 : parseInt(msStr, 10);
        const totalTime = min * 60 + sec + ms / 1000;

        result.push({
          time: totalTime,
          text: text || '♪',
        });
      }
    }
  }

  // Sort by timestamp
  return result.sort((a, b) => a.time - b.time);
}

/**
 * Given current playback position in seconds and parsed lyrics array,
 * find the active line index.
 */
export function getActiveLyricIndex(lyrics, currentTime) {
  if (!lyrics || lyrics.length === 0) return -1;
  
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      return i;
    }
  }
  return 0;
}

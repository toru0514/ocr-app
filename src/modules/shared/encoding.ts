import iconv from 'iconv-lite';

export function encodeShiftJIS(text: string) {
  return iconv.encode(text, 'Shift_JIS');
}

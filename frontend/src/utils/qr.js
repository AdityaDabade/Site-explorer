export function parsePlaceIdFromQr(decodedText) {
  const rawText = String(decodedText || '').trim();
  let placeId = null;

  try {
    const parsed = JSON.parse(rawText);
    placeId = parsed.place_id || parsed.placeId || null;
  } catch {
    // Non-JSON QR formats are handled below.
  }

  if (!placeId && rawText.includes('/place/')) {
    placeId = rawText.split('/place/')[1];
  }

  if (!placeId) {
    placeId = rawText;
  }

  return String(placeId || '')
    .split(/[?#]/)[0]
    .replace(/^\/+|\/+$/g, '')
    .trim();
}

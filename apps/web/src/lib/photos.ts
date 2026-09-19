/** デモ用静的画像 or R2 経由の表示 URL */
export function photoUrl(path: string): string {
  if (path.startsWith('images/')) return `/${path}`;
  return `/api/photos/${path}`;
}

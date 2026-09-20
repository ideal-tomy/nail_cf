import type { VisitPhotoRow } from '../types';

/** R2 に保存された写真のみ削除（デモ用 images/ 静的パスはスキップ） */
export async function deleteStoredPhotos(
  photos: R2Bucket,
  rows: VisitPhotoRow[],
): Promise<void> {
  for (const photo of rows) {
    for (const key of [photo.path, photo.thumb_path]) {
      if (key.startsWith('images/')) continue;
      await photos.delete(key);
    }
  }
}

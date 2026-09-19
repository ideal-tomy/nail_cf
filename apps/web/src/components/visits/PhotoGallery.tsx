import { photoUrl } from '../../lib/photos';
import type { VisitPhoto } from '../../lib/types';

type Props = {
  photos: VisitPhoto[];
  size?: 'thumb' | 'full';
};

export function PhotoGallery({ photos, size = 'thumb' }: Props) {
  if (photos.length === 0) return null;

  const gridClass =
    size === 'full'
      ? 'grid grid-cols-2 gap-2'
      : 'flex gap-2 overflow-x-auto pb-1';

  return (
    <div className={gridClass}>
      {photos.map((photo) => {
        const src = photoUrl(size === 'full' ? photo.path : photo.thumbPath);
        return (
          <img
            key={photo.id}
            src={src}
            alt=""
            className={
              size === 'full'
                ? 'aspect-square w-full rounded-xl object-cover'
                : 'h-20 w-20 shrink-0 rounded-xl object-cover'
            }
            loading="lazy"
          />
        );
      })}
    </div>
  );
}

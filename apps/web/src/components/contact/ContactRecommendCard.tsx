import { photoUrl } from '../../lib/photos';
import { jpDate } from '../../lib/messageTemplates';
import type { ContactRecommendation } from '../../lib/types';

type Props = {
  recommendation: ContactRecommendation;
  onCompose: (recommendation: ContactRecommendation) => void;
};

export function ContactRecommendCard({ recommendation, onCompose }: Props) {
  const thumbSrc = recommendation.thumbPath
    ? photoUrl(recommendation.thumbPath)
    : null;

  return (
    <button
      type="button"
      onClick={() => onCompose(recommendation)}
      className="flex w-full items-center gap-3 rounded-[14px] border border-petal bg-card p-3 text-left transition active:bg-blush"
    >
      {thumbSrc ? (
        <img
          src={thumbSrc}
          alt=""
          className="h-16 w-16 shrink-0 rounded-[11px] object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[11px] bg-blush text-xs text-mauve">
          写真なし
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-base font-bold text-ink">{recommendation.name}</p>
        <p className="mt-0.5 line-clamp-1 text-[13px] text-mauve">
          {recommendation.lastVisit
            ? `前回 ${jpDate(recommendation.lastVisit)}・${recommendation.lastDesign ?? '—'}`
            : '来店履歴なし'}
        </p>
        <p className="mt-1 text-[13px] font-semibold text-plum">
          {recommendation.daysSince}日たちました
        </p>
      </div>
      <span className="shrink-0 text-xl text-petal">›</span>
    </button>
  );
}

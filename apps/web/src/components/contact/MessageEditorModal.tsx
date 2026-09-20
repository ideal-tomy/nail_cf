import { useEffect, useState } from 'react';
import { createContactLog } from '../../lib/api';
import { copyMessage } from '../../lib/line';
import { buildMessage, jpDate } from '../../lib/messageTemplates';
import { photoUrl } from '../../lib/photos';
import type { ContactRecommendation, MessageTemplate } from '../../lib/types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useToast } from '../ui/Toast';

type Props = {
  open: boolean;
  onClose: () => void;
  recommendation: ContactRecommendation | null;
  templates: MessageTemplate[];
  onContacted: () => void;
};

export function MessageEditorModal({
  open,
  onClose,
  recommendation,
  templates,
  onContacted,
}: Props) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? '');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const customerName = recommendation?.name ?? '';
  const lastDesign = recommendation?.lastDesign ?? 'デザイン';
  const daysSince = recommendation?.daysSince ?? null;
  const thumbSrc = recommendation?.thumbPath ? photoUrl(recommendation.thumbPath) : null;

  useEffect(() => {
    if (!open || !recommendation) return;
    const template = templates.find((item) => item.id === templateId) ?? templates[0];
    if (!template) return;
    setMessage(buildMessage(template, customerName, lastDesign, daysSince));
  }, [open, templateId, customerName, lastDesign, daysSince, recommendation, templates]);

  useEffect(() => {
    if (!open) setTemplateId(templates[0]?.id ?? '');
  }, [open, templates]);

  const handleCopy = async () => {
    await copyMessage(message);
    showToast('コピーしました');
  };

  const handleMarkContacted = async () => {
    if (!recommendation) return;
    setSaving(true);
    try {
      await createContactLog({
        customerId: recommendation.customerId,
        body: message,
        templateKey: templateId || null,
      });
      showToast(`${customerName}さんを連絡済みにしました`);
      onContacted();
      onClose();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '記録に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (!recommendation) return null;

  return (
    <Modal open={open} onClose={onClose} title={`${customerName}さんへの文面`}>
      <div className="space-y-3.5">
        <div className="flex items-center gap-3 rounded-[13px] bg-blush p-2.5">
          {thumbSrc ? (
            <img
              src={thumbSrc}
              alt=""
              className="h-16 w-16 shrink-0 rounded-[11px] object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[11px] bg-card text-xs text-mauve">
              写真なし
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[12px] text-mauve">
              {recommendation.lastVisit
                ? `前回 ${jpDate(recommendation.lastVisit)}`
                : '前回のデザイン'}
            </p>
            <p className="mt-0.5 line-clamp-2 text-[15px] font-semibold text-ink">
              {lastDesign}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {templates.map((template) => {
            const active = template.id === templateId;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setTemplateId(template.id)}
                className={[
                  'rounded-full border px-3.5 py-2 text-sm',
                  active
                    ? 'border-plum bg-plum font-bold text-white'
                    : 'border-petal bg-card text-mauve',
                ].join(' ')}
              >
                {template.title}
              </button>
            );
          })}
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[130px] w-full resize-y rounded-xl border border-petal bg-white px-3 py-2.5 text-sm leading-relaxed text-ink outline-none focus:border-plum"
        />

        <div className="space-y-2.5">
          <Button className="w-full" onClick={handleCopy}>
            文面をコピー
          </Button>
          <p className="text-center text-xs leading-relaxed text-mauve">
            コピーして LINE などにお貼り付けてください
          </p>
          <Button
            className="w-full"
            variant="secondary"
            onClick={handleMarkContacted}
            disabled={saving}
          >
            {saving ? '記録中…' : '連絡済みにする'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

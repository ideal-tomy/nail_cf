export type MessageTemplate = {
  id: string;
  title: string;
  body: string;
};

export function buildMessage(
  template: Pick<MessageTemplate, 'body'>,
  name: string,
  lastDesign: string,
  daysSince?: number | null,
): string {
  return template.body
    .replaceAll('{name}', name)
    .replaceAll('{last_design}', lastDesign || 'デザイン')
    .replaceAll('{days}', daysSince != null ? String(daysSince) : '28');
}

export function jpDate(iso: string): string {
  const parts = iso.slice(0, 10).split('-');
  if (parts.length < 3) return iso;
  return `${Number(parts[1])}月${Number(parts[2])}日`;
}

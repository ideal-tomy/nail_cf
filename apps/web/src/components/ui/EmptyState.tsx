type Props = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: Props) {
  return (
    <div className="rounded-[14px] border border-dashed border-petal bg-card px-5 py-8 text-center shadow-sm">
      <p className="font-bold text-ink">{title}</p>
      {description && <p className="mt-2 text-sm leading-relaxed text-mauve">{description}</p>}
    </div>
  );
}

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <span className="text-3xl">{icon}</span>
      <p className="text-sm font-bold text-app-text">{title}</p>
      {description && (
        <p className="max-w-[220px] text-xs text-app-text-2">{description}</p>
      )}
    </div>
  );
}

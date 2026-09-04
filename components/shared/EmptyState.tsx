interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
}

import AppIcon from "./AppIcon";

export default function EmptyState({
  icon,
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <AppIcon name={icon} className="h-8 w-8 text-app-primary" size={32} />
      <p className="text-sm font-bold text-app-text">{title}</p>
      {description && (
        <p className="max-w-[220px] text-xs text-app-text-2">{description}</p>
      )}
    </div>
  );
}

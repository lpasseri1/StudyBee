import { CLASS_COLOR_STYLES } from '@/lib/constants';
import { ClassItem } from '@/lib/types';
import { cn } from '@/lib/utils';

export function ClassBadge({
  classItem,
  className
}: {
  classItem: ClassItem | undefined;
  className?: string;
}) {
  if (!classItem) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground',
          className
        )}
      >
        General
      </span>
    );
  }
  const styles = CLASS_COLOR_STYLES[classItem.color];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        styles.bg,
        styles.text,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', styles.dot)} />
      {classItem.name}
    </span>
  );
}

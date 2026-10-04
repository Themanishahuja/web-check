import type { Severity } from '@whc/shared';
import { severityLabel, severityTone } from '@/lib/health-styles';
import { Tag } from './tag';

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  return (
    <Tag tone={severityTone[severity]} className={className}>
      {severityLabel[severity]}
    </Tag>
  );
}

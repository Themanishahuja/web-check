import type { Issue, ModuleId, Severity } from '@whc/shared';

export type FailSeverity = Exclude<Severity, 'passed'>;

export interface CheckSpec {
  /** Stable id within the module, e.g. "meta-description". */
  id: string;
  severity: FailSeverity;
  /** Title when the check fails. */
  fail: string;
  /** Title when the check passes. */
  pass: string;
  why: string;
  fix: string;
  /** Where the problem was found; ignored when the check passes. */
  affected?: string[];
}

/** Builds typed `Issue`s for one module so rules stay one-liners. */
export function issueFactory(module: ModuleId) {
  const make = (spec: CheckSpec, ok: boolean): Issue =>
    ok
      ? {
          id: `${module}-${spec.id}`,
          module,
          severity: 'passed',
          title: spec.pass,
          why: '',
          fix: '',
        }
      : {
          id: `${module}-${spec.id}`,
          module,
          severity: spec.severity,
          title: spec.fail,
          why: spec.why,
          fix: spec.fix,
          ...(spec.affected && spec.affected.length > 0
            ? { affected: spec.affected }
            : {}),
        };

  return {
    /** A check that passes when `ok` is true. */
    check: (ok: boolean, spec: CheckSpec): Issue => make(spec, ok),
    /** A check that passes when no page/URL violates it (`affected` is empty). */
    forEach: (affected: string[], spec: CheckSpec): Issue =>
      make({ ...spec, affected }, affected.length === 0),
  };
}

export type AuditModule = (
  context: import('./context.js').AuditContext,
) => Issue[] | Promise<Issue[]>;

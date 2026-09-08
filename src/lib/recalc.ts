export type RaceRow = {
  id: string;
  driver_id: string;
  driver_name: string;
  finish_ms: number | null;
  dnf: boolean;
  dsq: boolean;
  pole: boolean;
  fastest_lap: boolean;
  position: number | null;
  points: number;
  penalty_s: number;
};

export type RecalcRow = RaceRow & {
  adjusted_ms: number | null;
  new_position: number;
  new_points: number;
};

/** Reordena por tiempo ajustado y recalcula puntos. */
export function computeClassification(
  rows: RaceRow[],
  scheme: number[],
  flPoint: number,
  polePoint: number,
): RecalcRow[] {
  const withAdj = rows.map((r) => ({
    ...r,
    adjusted_ms:
      r.finish_ms != null && !r.dnf && !r.dsq
        ? r.finish_ms + (r.penalty_s || 0) * 1000
        : null,
  }));

  const finishers = withAdj
    .filter((r) => r.adjusted_ms != null)
    .sort((a, b) => (a.adjusted_ms as number) - (b.adjusted_ms as number));
  const dnfs = withAdj
    .filter((r) => r.adjusted_ms == null && !r.dsq)
    .sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
  const dsqs = withAdj.filter((r) => r.dsq);

  return [...finishers, ...dnfs, ...dsqs].map((r, i) => {
    const pos = i + 1;
    let pts = 0;
    if (r.adjusted_ms != null) {
      pts = scheme[pos - 1] ?? 0;
      if (r.fastest_lap && pos <= 10) pts += flPoint || 0;
      if (r.pole) pts += polePoint || 0;
    }
    return { ...r, new_position: pos, new_points: pts };
  });
}

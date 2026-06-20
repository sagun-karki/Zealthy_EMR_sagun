type PrescriptionLike = {
  id: number;
  medication: string;
  dosage: string;
  quantity: number;
  refillOn: Date;
  refillSchedule: string;
};

export type RefillOccurrence = {
  key: string;
  id: number;
  medication: string;
  dosage: string;
  quantity: number;
  refillOn: Date;
  refillSchedule: string;
};

function addRefillInterval(date: Date, refillSchedule: string) {
  const normalizedSchedule = refillSchedule.trim().toLowerCase();
  const next = new Date(date);

  if (normalizedSchedule === "weekly") {
    next.setDate(next.getDate() + 7);
    return next;
  }

  if (normalizedSchedule === "monthly") {
    next.setMonth(next.getMonth() + 1);
    return next;
  }

  return null;
}

export function expandRefillOccurrences(
  prescriptions: PrescriptionLike[],
  start: Date,
  end: Date,
) {
  const occurrences: RefillOccurrence[] = [];

  for (const prescription of prescriptions) {
    let refillDate = new Date(prescription.refillOn);

    while (refillDate < start) {
      const nextDate = addRefillInterval(
        refillDate,
        prescription.refillSchedule,
      );

      if (!nextDate || nextDate <= refillDate) {
        break;
      }

      refillDate = nextDate;
    }

    while (refillDate <= end) {
      if (refillDate >= start) {
        occurrences.push({
          key: `${prescription.id}-${refillDate.toISOString()}`,
          id: prescription.id,
          medication: prescription.medication,
          dosage: prescription.dosage,
          quantity: prescription.quantity,
          refillOn: new Date(refillDate),
          refillSchedule: prescription.refillSchedule,
        });
      }

      const nextDate = addRefillInterval(refillDate, prescription.refillSchedule);

      if (!nextDate || nextDate <= refillDate) {
        break;
      }

      refillDate = nextDate;
    }
  }

  return occurrences.toSorted(
    (a, b) => a.refillOn.getTime() - b.refillOn.getTime(),
  );
}

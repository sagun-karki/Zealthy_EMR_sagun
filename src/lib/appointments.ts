type AppointmentLike = {
  id: number;
  provider: string;
  datetime: Date;
  repeat: string | null;
  endedAt?: Date | null;
};

export type AppointmentOccurrence = {
  key: string;
  id: number;
  provider: string;
  datetime: Date;
  repeat: string | null;
};

function addRepeatInterval(date: Date, repeat: string | null) {
  const next = new Date(date);

  if (repeat === "weekly") {
    next.setDate(next.getDate() + 7);
    return next;
  }

  if (repeat === "monthly") {
    next.setMonth(next.getMonth() + 1);
    return next;
  }

  return null;
}

export function expandAppointmentOccurrences(
  appointments: AppointmentLike[],
  start: Date,
  end: Date,
) {
  const occurrences: AppointmentOccurrence[] = [];

  for (const appointment of appointments) {
    if (!appointment.repeat) {
      if (appointment.datetime >= start && appointment.datetime <= end) {
        occurrences.push({
          key: appointment.id.toString(),
          id: appointment.id,
          provider: appointment.provider,
          datetime: appointment.datetime,
          repeat: appointment.repeat,
        });
      }

      continue;
    }

    let occurrenceDate = new Date(appointment.datetime);
    const recurrenceEnd = appointment.endedAt
      ? new Date(Math.min(appointment.endedAt.getTime(), end.getTime()))
      : end;

    while (occurrenceDate < start) {
      const nextDate = addRepeatInterval(occurrenceDate, appointment.repeat);

      if (!nextDate || nextDate <= occurrenceDate) {
        break;
      }

      occurrenceDate = nextDate;
    }

    while (occurrenceDate <= recurrenceEnd) {
      occurrences.push({
        key: `${appointment.id}-${occurrenceDate.toISOString()}`,
        id: appointment.id,
        provider: appointment.provider,
        datetime: new Date(occurrenceDate),
        repeat: appointment.repeat,
      });

      const nextDate = addRepeatInterval(occurrenceDate, appointment.repeat);

      if (!nextDate || nextDate <= occurrenceDate) {
        break;
      }

      occurrenceDate = nextDate;
    }
  }

  return occurrences.toSorted(
    (a, b) => a.datetime.getTime() - b.datetime.getTime(),
  );
}

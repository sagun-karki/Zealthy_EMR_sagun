"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { useState } from "react";

type PatientDetailData = {
  id: number;
  name: string;
  email: string;
  appointments: {
    id: number;
    provider: string;
    datetimeDisplay: string;
    datetimeInput: string;
    repeat: string | null;
    recurrenceEndsOn: string;
    recurrenceEndsOnDisplay: string;
  }[];
  prescriptions: {
    id: number;
    medication: string;
    dosage: string;
    quantity: number;
    refillOnDisplay: string;
    refillOnInput: string;
    refillSchedule: string;
  }[];
};

type Option = {
  id: number;
  name: string;
};

type ServerAction = (formData: FormData) => void | Promise<void>;

type PatientDetailProps = {
  patient: PatientDetailData;
  medications: Option[];
  dosages: Option[];
  actions: {
    createAppointment: ServerAction;
    updatePatient: ServerAction;
    updateAppointment: ServerAction;
    deleteAppointment: ServerAction;
    endRecurringAppointment: ServerAction;
    createPrescription: ServerAction;
    updatePrescription: ServerAction;
    deletePrescription: ServerAction;
  };
};

export function PatientDetail({
  patient,
  medications,
  dosages,
  actions,
}: PatientDetailProps) {
  const router = useRouter();
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [isAddingAppointment, setIsAddingAppointment] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<number | null>(
    null,
  );
  const [isAddingPrescription, setIsAddingPrescription] = useState(false);
  const [editingPrescriptionId, setEditingPrescriptionId] = useState<
    number | null
  >(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  function runAction(
    action: ServerAction,
    closeForm: () => void,
    message: string,
  ) {
    return async (formData: FormData) => {
      setStatusMessage(message);
      closeForm();
      await action(formData);
      router.refresh();
      setStatusMessage(null);
    };
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-4">
          <Link
            href="/admin"
            className="text-sm font-medium text-teal-700 hover:underline"
          >
            &larr; Back to Patients
          </Link>
          {statusMessage ? (
            <div
              className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm font-medium text-teal-800"
              role="status"
            >
              {statusMessage}
            </div>
          ) : null}
          {isEditingPatient ? (
            <form
              action={runAction(
                actions.updatePatient,
                () => setIsEditingPatient(false),
                "Saving patient...",
              )}
              className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <input type="hidden" name="userId" value={patient.id} />
              <h1 className="text-3xl font-semibold text-slate-950">
                Edit Patient
              </h1>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">Name</span>
                <input
                  name="name"
                  required
                  defaultValue={patient.name}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">
                  Email
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={patient.email}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-medium text-slate-700">
                  New Password
                </span>
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  placeholder="Leave blank to keep current password"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <SubmitButton
                  label="Save Patient"
                  pendingLabel="Saving..."
                  statusMessage="Saving patient..."
                />
                <button
                  type="button"
                  onClick={() => setIsEditingPatient(false)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-3xl font-semibold text-slate-950">
                  {patient.name}
                </h1>
                <p className="mt-2 text-slate-600">{patient.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingPatient(true)}
                className="shrink-0 text-sm font-medium text-teal-700 hover:underline"
              >
                Edit Patient
              </button>
            </div>
          )}
        </header>

        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Appointments
              </h2>
              <button
                type="button"
                onClick={() => setIsAddingAppointment(true)}
                className="rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"
              >
                Add Appointment
              </button>
            </div>
            {isAddingAppointment ? (
              <form
                action={runAction(
                  actions.createAppointment,
                  () => setIsAddingAppointment(false),
                  "Saving appointment...",
                )}
                className="space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <input type="hidden" name="userId" value={patient.id} />
                <h3 className="font-medium text-slate-900">Add appointment</h3>
                <AppointmentFields />
                <div className="flex flex-wrap gap-2">
                  <SubmitButton
                    label="Save Appointment"
                    pendingLabel="Saving..."
                    statusMessage="Saving appointment..."
                  />
                  <button
                    type="button"
                    onClick={() => setIsAddingAppointment(false)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}
            {patient.appointments.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
                No upcoming appointments found.
              </div>
            ) : (
              <div className="space-y-4">
                {patient.appointments.map((appt) =>
                  editingAppointmentId === appt.id ? (
                    <form
                      action={runAction(
                        actions.updateAppointment,
                        () => setEditingAppointmentId(null),
                        "Saving appointment...",
                      )}
                      key={appt.id}
                      className="space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <input type="hidden" name="userId" value={patient.id} />
                      <input type="hidden" name="appointmentId" value={appt.id} />
                      <AppointmentFields
                        provider={appt.provider}
                        datetime={appt.datetimeInput}
                        repeat={appt.repeat}
                        recurrenceEndsOn={appt.recurrenceEndsOn}
                      />
                      <div className="flex flex-wrap gap-2">
                        <SubmitButton
                          label="Save"
                          pendingLabel="Saving..."
                          statusMessage="Saving appointment..."
                        />
                        <button
                          type="button"
                          onClick={() => setEditingAppointmentId(null)}
                          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        {appt.repeat ? (
                          <button
                            formAction={runAction(
                              actions.endRecurringAppointment,
                              () => setEditingAppointmentId(null),
                              "Ending recurrence...",
                            )}
                            className="rounded-md border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"
                          >
                            End Recurrence
                          </button>
                        ) : null}
                        <button
                          formAction={runAction(
                            actions.deleteAppointment,
                            () => setEditingAppointmentId(null),
                            "Deleting appointment...",
                          )}
                          className="rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div
                      key={appt.id}
                      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-medium text-slate-900">
                            {appt.provider}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            {appt.datetimeDisplay}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            {appt.repeat
                              ? `Repeats ${appt.repeat}`
                              : "Does not repeat"}
                          </div>
                          {appt.recurrenceEndsOnDisplay ? (
                            <div className="mt-1 text-sm text-slate-600">
                              Ends {appt.recurrenceEndsOnDisplay}
                            </div>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingAppointmentId(appt.id)}
                          className="shrink-0 text-sm font-medium text-teal-700 hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Prescriptions
              </h2>
              <button
                type="button"
                onClick={() => setIsAddingPrescription(true)}
                className="rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"
              >
                Add Prescription
              </button>
            </div>
            {isAddingPrescription ? (
              <form
                action={runAction(
                  actions.createPrescription,
                  () => setIsAddingPrescription(false),
                  "Saving prescription...",
                )}
                className="space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <input type="hidden" name="userId" value={patient.id} />
                <h3 className="font-medium text-slate-900">Add prescription</h3>
                <PrescriptionFields medications={medications} dosages={dosages} />
                <div className="flex flex-wrap gap-2">
                  <SubmitButton
                    label="Save Prescription"
                    pendingLabel="Saving..."
                    statusMessage="Saving prescription..."
                  />
                  <button
                    type="button"
                    onClick={() => setIsAddingPrescription(false)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}
            {patient.prescriptions.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
                No prescriptions found.
              </div>
            ) : (
              <div className="space-y-4">
                {patient.prescriptions.map((rx) =>
                  editingPrescriptionId === rx.id ? (
                    <form
                      action={runAction(
                        actions.updatePrescription,
                        () => setEditingPrescriptionId(null),
                        "Saving prescription...",
                      )}
                      key={rx.id}
                      className="space-y-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <input type="hidden" name="userId" value={patient.id} />
                      <input type="hidden" name="prescriptionId" value={rx.id} />
                      <PrescriptionFields
                        medications={medications}
                        dosages={dosages}
                        medication={rx.medication}
                        dosage={rx.dosage}
                        quantity={rx.quantity}
                        refillOn={rx.refillOnInput}
                        refillSchedule={rx.refillSchedule}
                      />
                      <div className="flex flex-wrap gap-2">
                        <SubmitButton
                          label="Save"
                          pendingLabel="Saving..."
                          statusMessage="Saving prescription..."
                        />
                        <button
                          type="button"
                          onClick={() => setEditingPrescriptionId(null)}
                          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Cancel
                        </button>
                        <button
                          formAction={runAction(
                            actions.deletePrescription,
                            () => setEditingPrescriptionId(null),
                            "Deleting prescription...",
                          )}
                          className="rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div
                      key={rx.id}
                      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-medium text-slate-900">
                            {rx.medication} - {rx.dosage}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            Qty: {rx.quantity}
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            Refill due {rx.refillOnDisplay} ({rx.refillSchedule})
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingPrescriptionId(rx.id)}
                          className="shrink-0 text-sm font-medium text-teal-700 hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function SubmitButton({
  label,
  pendingLabel,
  statusMessage,
}: {
  label: string;
  pendingLabel: string;
  statusMessage: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      data-pending-message={statusMessage}
      className="rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-teal-900 disabled:opacity-70"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function AppointmentFields({
  provider,
  datetime,
  repeat,
  recurrenceEndsOn,
}: {
  provider?: string;
  datetime?: string;
  repeat?: string | null;
  recurrenceEndsOn?: string;
}) {
  const [repeatValue, setRepeatValue] = useState(repeat || "");

  return (
    <>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-700">Provider</span>
        <input
          name="provider"
          required
          placeholder="Provider"
          defaultValue={provider}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-700">
          Appointment Date and Time
        </span>
        <input
          name="datetime"
          type="datetime-local"
          required
          defaultValue={datetime}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-700">
          Repeat Schedule
        </span>
        <select
          name="repeat"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950"
          value={repeatValue}
          onChange={(event) => setRepeatValue(event.target.value)}
        >
          <option value="">Does not repeat</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </label>
      {repeatValue ? (
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">
            Recurrence End Date
          </span>
          <input
            name="recurrenceEndsOn"
            type="date"
            defaultValue={recurrenceEndsOn}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950"
          />
        </label>
      ) : null}
    </>
  );
}

function PrescriptionFields({
  medications,
  dosages,
  medication,
  dosage,
  quantity,
  refillOn,
  refillSchedule = "monthly",
}: {
  medications: Option[];
  dosages: Option[];
  medication?: string;
  dosage?: string;
  quantity?: number;
  refillOn?: string;
  refillSchedule?: string;
}) {
  return (
    <>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-700">Medication</span>
        <select
          name="medication"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950"
          defaultValue={medication || ""}
        >
          <option value="" disabled>
            Medication
          </option>
          {medications.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-700">Dosage</span>
        <select
          name="dosage"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950"
          defaultValue={dosage || ""}
        >
          <option value="" disabled>
            Dosage
          </option>
          {dosages.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-700">Quantity</span>
        <input
          name="quantity"
          type="number"
          min="1"
          required
          placeholder="Quantity"
          defaultValue={quantity}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-700">Refill Date</span>
        <input
          name="refillOn"
          type="date"
          required
          defaultValue={refillOn}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950"
        />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-slate-700">
          Refill Schedule
        </span>
        <input
          name="refillSchedule"
          required
          placeholder="Refill schedule"
          defaultValue={refillSchedule}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-950"
        />
      </label>
    </>
  );
}

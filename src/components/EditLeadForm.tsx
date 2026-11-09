"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type LeadTemperature =
  | "HOT"
  | "WARM"
  | "COLD";

type EditableLead = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  interest: string | null;
  budget: string | null;
  location: string | null;
  notes: string | null;
  temperature: LeadTemperature;
};

type LeadResponse = {
  success?: boolean;
  message?: string;
  data?: EditableLead;
};

type EditLeadFormProps = {
  leadId: string;
};

const nullableFields = [
  "email",
  "phone",
  "source",
  "interest",
  "budget",
  "location",
  "notes",
] as const;

function nullableValue(
  value: FormDataEntryValue | null,
) {
  const normalized =
    String(
      value ?? "",
    ).trim();

  return normalized.length > 0
    ? normalized
    : null;
}

export default function EditLeadForm({
  leadId,
}: EditLeadFormProps) {
  const router =
    useRouter();

  const [
    lead,
    setLead,
  ] =
    useState<EditableLead | null>(
      null,
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  const [
    loadError,
    setLoadError,
  ] =
    useState("");

  const [
    submitError,
    setSubmitError,
  ] =
    useState("");

  useEffect(
    () => {
      const controller =
        new AbortController();

      async function loadLead() {
        setIsLoading(true);
        setLoadError("");

        try {
          const response =
            await fetch(
              `/api/leads/${encodeURIComponent(leadId)}`,
              {
                cache:
                  "no-store",
                signal:
                  controller.signal,
              },
            );

          if (
            response.status === 401
          ) {
            router.replace(
              `/login?next=/leads/${encodeURIComponent(leadId)}/edit`,
            );

            return;
          }

          let result:
            | LeadResponse
            | null = null;

          try {
            result =
              await response.json();
          } catch {
            result = null;
          }

          if (
            !response.ok
            || !result?.success
            || !result.data
          ) {
            throw new Error(
              result?.message
              ?? "Unable to retrieve lead.",
            );
          }

          setLead(
            result.data,
          );
        } catch (
          loadFailure
        ) {
          if (
            loadFailure
              instanceof DOMException
            && loadFailure.name
              === "AbortError"
          ) {
            return;
          }

          setLoadError(
            loadFailure
              instanceof Error
              ? loadFailure.message
              : "Unable to retrieve lead.",
          );
        } finally {
          setIsLoading(false);
        }
      }

      void loadLead();

      return () => {
        controller.abort();
      };
    },
    [
      leadId,
      router,
    ],
  );

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      isSubmitting
      || !lead
    ) {
      return;
    }

    setSubmitError("");

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const fullName =
      String(
        formData.get(
          "fullName",
        ) ?? "",
      ).trim();

    if (
      fullName.length < 2
      || fullName.length > 120
    ) {
      setSubmitError(
        "Full name must contain between 2 and 120 characters.",
      );

      return;
    }

    const temperature =
      String(
        formData.get(
          "temperature",
        ) ?? "",
      ) as LeadTemperature;

    if (
      ![
        "HOT",
        "WARM",
        "COLD",
      ].includes(
        temperature,
      )
    ) {
      setSubmitError(
        "Select a valid lead temperature.",
      );

      return;
    }

    const candidate = {
      fullName,
      email:
        nullableValue(
          formData.get(
            "email",
          ),
        ),
      phone:
        nullableValue(
          formData.get(
            "phone",
          ),
        ),
      source:
        nullableValue(
          formData.get(
            "source",
          ),
        ),
      interest:
        nullableValue(
          formData.get(
            "interest",
          ),
        ),
      budget:
        nullableValue(
          formData.get(
            "budget",
          ),
        ),
      location:
        nullableValue(
          formData.get(
            "location",
          ),
        ),
      notes:
        nullableValue(
          formData.get(
            "notes",
          ),
        ),
      temperature,
    };

    const payload:
      Record<
        string,
        string | null
      > = {};

    if (
      candidate.fullName
      !== lead.fullName
    ) {
      payload.fullName =
        candidate.fullName;
    }

    for (
      const field
      of nullableFields
    ) {
      if (
        candidate[field]
        !== lead[field]
      ) {
        payload[field] =
          candidate[field];
      }
    }

    if (
      candidate.temperature
      !== lead.temperature
    ) {
      payload.temperature =
        candidate.temperature;
    }

    if (
      Object.keys(
        payload,
      ).length === 0
    ) {
      setSubmitError(
        "No changes to save.",
      );

      return;
    }

    setIsSubmitting(true);

    try {
      const response =
        await fetch(
          `/api/leads/${encodeURIComponent(leadId)}`,
          {
            method:
              "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify(
                payload,
              ),
          },
        );

      let result:
        | LeadResponse
        | null = null;

      try {
        result =
          await response.json();
      } catch {
        result = null;
      }

      if (
        response.status === 401
      ) {
        router.replace(
          `/login?next=/leads/${encodeURIComponent(leadId)}/edit`,
        );

        return;
      }

      if (
        !response.ok
        || !result?.success
      ) {
        throw new Error(
          result?.message
          ?? "Unable to update lead.",
        );
      }

      router.push(
        `/leads/${encodeURIComponent(leadId)}`,
      );

      router.refresh();
    } catch (
      submitFailure
    ) {
      setSubmitError(
        submitFailure
          instanceof Error
          ? submitFailure.message
          : "Unable to update lead.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
        <div className="animate-pulse space-y-5">
          <div className="h-6 w-48 rounded bg-gray-200" />
          <div className="grid gap-5 md:grid-cols-2">
            {Array.from(
              {
                length: 6,
              },
            ).map(
              (
                _,
                index,
              ) => (
                <div
                  key={index}
                  className="h-12 rounded-2xl bg-gray-100"
                />
              ),
            )}
          </div>
        </div>
      </section>
    );
  }

  if (
    loadError
    || !lead
  ) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <p className="font-bold text-red-700">
          Lead could not be loaded
        </p>

        <p className="mt-2 text-sm text-red-600">
          {loadError
            || "The requested lead is unavailable."}
        </p>

        <Link
          href="/leads"
          className="mt-5 inline-flex rounded-full border border-red-200 bg-white px-5 py-2 text-sm font-bold text-red-700"
        >
          Back to Leads
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
      <div className="mb-7">
        <h2 className="text-xl font-bold text-gray-950">
          Edit lead information
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
          Update the prospect&apos;s contact and requirement details.
          Pipeline stage, assignment, AI score and system ownership
          are managed separately.
        </p>
      </div>

      {submitError ? (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <p className="font-semibold text-red-700">
            Lead could not be updated
          </p>

          <p className="mt-1 text-sm text-red-600">
            {submitError}
          </p>
        </div>
      ) : null}

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Full name
              <span className="text-red-600">
                {" "}
                *
              </span>
            </label>

            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              minLength={2}
              maxLength={120}
              autoComplete="name"
              defaultValue={
                lead.fullName
              }
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition focus:border-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={
                lead.email ?? ""
              }
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition focus:border-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Phone
            </label>

            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              defaultValue={
                lead.phone ?? ""
              }
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition focus:border-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="source"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Lead source
            </label>

            <input
              id="source"
              name="source"
              type="text"
              maxLength={100}
              defaultValue={
                lead.source ?? ""
              }
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition focus:border-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="temperature"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Lead temperature
            </label>

            <select
              id="temperature"
              name="temperature"
              defaultValue={
                lead.temperature
              }
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition focus:border-red-500"
            >
              <option value="HOT">
                Hot
              </option>
              <option value="WARM">
                Warm
              </option>
              <option value="COLD">
                Cold
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="interest"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Property interest
            </label>

            <input
              id="interest"
              name="interest"
              type="text"
              maxLength={250}
              defaultValue={
                lead.interest ?? ""
              }
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition focus:border-red-500"
            />
          </div>

          <div>
            <label
              htmlFor="budget"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Budget
            </label>

            <input
              id="budget"
              name="budget"
              type="text"
              maxLength={120}
              defaultValue={
                lead.budget ?? ""
              }
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition focus:border-red-500"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Preferred location
            </label>

            <input
              id="location"
              name="location"
              type="text"
              maxLength={200}
              defaultValue={
                lead.location ?? ""
              }
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition focus:border-red-500"
            />
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="notes"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Notes
            </label>

            <textarea
              id="notes"
              name="notes"
              rows={6}
              maxLength={5000}
              defaultValue={
                lead.notes ?? ""
              }
              className="w-full resize-y rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition focus:border-red-500"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
          <Link
            href={`/leads/${encodeURIComponent(leadId)}`}
            className="rounded-full border border-gray-200 px-6 py-3 text-center text-sm font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {isSubmitting
              ? "Saving changes..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}

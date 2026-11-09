"use client";

import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type CreateLeadResponse = {
  success?: boolean;
  message?: string;
  data?: {
    id?: string;
  };
};

const optionalFields = [
  "email",
  "phone",
  "source",
  "interest",
  "budget",
  "location",
  "notes",
] as const;

export default function CreateLeadForm() {
  const router = useRouter();

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");

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
    ) {
      setError(
        "Full name must contain at least 2 characters.",
      );

      return;
    }

    const payload:
      Record<
        string,
        string
      > = {
        fullName,
      };

    for (
      const field
      of optionalFields
    ) {
      const value =
        String(
          formData.get(field)
          ?? "",
        ).trim();

      if (value) {
        payload[field] =
          value;
      }
    }

    setIsSubmitting(true);

    try {
      const response =
        await fetch(
          "/api/leads",
          {
            method: "POST",
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
        | CreateLeadResponse
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
          "/login?next=/leads/new",
        );

        return;
      }

      if (
        !response.ok
        || !result?.success
      ) {
        throw new Error(
          result?.message
          ?? "Unable to create lead.",
        );
      }

      router.push(
        "/leads",
      );

      router.refresh();
    } catch (
      submitError
    ) {
      setError(
        submitError
          instanceof Error
          ? submitError.message
          : "Unable to create lead.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
      <div className="mb-7">
        <h2 className="text-xl font-bold text-gray-950">
          Lead information
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
          Add the prospect information currently available.
          Only the full name is required. New leads begin
          in the New stage with a Warm temperature.
        </p>
      </div>

      {error ? (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <p className="font-semibold text-red-700">
            Lead could not be created
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
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
              placeholder="e.g. Ada Okafor"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-red-500"
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
              placeholder="ada@example.com"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-red-500"
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
              placeholder="+234..."
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-red-500"
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
              placeholder="e.g. Instagram, referral, website"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-red-500"
            />
          </div>

          <div>
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
              placeholder="e.g. Maitama / Asokoro"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-red-500"
            />
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
              placeholder="e.g. 3-bedroom apartment"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-red-500"
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
              placeholder="e.g. ₦80m-₦120m"
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-red-500"
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
              placeholder="Add useful context about the prospect, requirements, or conversation."
              className="w-full resize-y rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-red-500"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-end">
          <Link
            href="/leads"
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
              ? "Creating lead..."
              : "Create Lead"}
          </button>
        </div>
      </form>
    </section>
  );
}

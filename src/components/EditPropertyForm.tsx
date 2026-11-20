"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type PropertyStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "SOLD"
  | "RENTED"
  | "INACTIVE";

type EditableProperty = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  location: string;
  price: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  status: PropertyStatus;
  isFeatured: boolean;
};

type PropertyResponse = {
  success?: boolean;
  message?: string;
  data?: EditableProperty;
};

type EditPropertyFormProps = {
  propertyId: string;
};

function nullableText(
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

function optionalInteger(
  value:
    FormDataEntryValue | null,
  label: string,
) {
  const normalized =
    String(
      value ?? "",
    ).trim();

  if (!normalized) {
    return null;
  }

  const parsed =
    Number(normalized);

  if (
    !Number.isInteger(parsed)
    || parsed < 0
    || parsed > 100
  ) {
    throw new Error(
      `${label} must be a whole number between 0 and 100.`,
    );
  }

  return parsed;
}

export default function EditPropertyForm({
  propertyId,
}: EditPropertyFormProps) {
  const router =
    useRouter();

  const [
    property,
    setProperty,
  ] =
    useState<EditableProperty | null>(
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

      async function loadProperty() {
        setIsLoading(true);
        setLoadError("");

        try {
          const response =
            await fetch(
              `/api/properties/${encodeURIComponent(propertyId)}`,
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
              `/login?next=/properties/${encodeURIComponent(propertyId)}/edit`,
            );

            return;
          }

          let result:
            PropertyResponse | null =
            null;

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
              ?? "Unable to retrieve property.",
            );
          }

          setProperty(
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
              : "Unable to retrieve property.",
          );
        } finally {
          setIsLoading(false);
        }
      }

      void loadProperty();

      return () => {
        controller.abort();
      };
    },
    [
      propertyId,
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
      || !property
    ) {
      return;
    }

    setSubmitError("");

    const form =
      event.currentTarget;

    const formData =
      new FormData(form);

    const title =
      String(
        formData.get(
          "title",
        ) ?? "",
      ).trim();

    const type =
      String(
        formData.get(
          "type",
        ) ?? "",
      ).trim();

    const location =
      String(
        formData.get(
          "location",
        ) ?? "",
      ).trim();

    if (
      title.length < 2
      || title.length > 160
    ) {
      setSubmitError(
        "Property title must contain between 2 and 160 characters.",
      );

      return;
    }

    if (
      type.length < 2
      || type.length > 80
    ) {
      setSubmitError(
        "Property type must contain between 2 and 80 characters.",
      );

      return;
    }

    if (
      location.length < 2
      || location.length > 160
    ) {
      setSubmitError(
        "Location must contain between 2 and 160 characters.",
      );

      return;
    }

    const priceInput =
      String(
        formData.get(
          "price",
        ) ?? "",
      ).trim();

    if (
      priceInput
      && !/^\d{1,15}(\.\d{1,2})?$/.test(
        priceInput,
      )
    ) {
      setSubmitError(
        "Price must be a valid non-negative amount with no more than 2 decimal places.",
      );

      return;
    }

    const status =
      String(
        formData.get(
          "status",
        ) ?? "",
      ) as PropertyStatus;

    if (
      ![
        "AVAILABLE",
        "RESERVED",
        "SOLD",
        "RENTED",
        "INACTIVE",
      ].includes(
        status,
      )
    ) {
      setSubmitError(
        "Select a valid property status.",
      );

      return;
    }

    let bedrooms:
      number | null;

    let bathrooms:
      number | null;

    try {
      bedrooms =
        optionalInteger(
          formData.get(
            "bedrooms",
          ),
          "Bedrooms",
        );

      bathrooms =
        optionalInteger(
          formData.get(
            "bathrooms",
          ),
          "Bathrooms",
        );
    } catch (
      validationError
    ) {
      setSubmitError(
        validationError
          instanceof Error
          ? validationError.message
          : "Property details are invalid.",
      );

      return;
    }

    const candidate = {
      title,
      description:
        nullableText(
          formData.get(
            "description",
          ),
        ),
      type,
      location,
      price:
        priceInput
          ? priceInput
          : null,
      bedrooms,
      bathrooms,
      status,
      isFeatured:
        formData.get(
          "isFeatured",
        ) === "on",
    };

    const payload:
      Record<
        string,
        string
        | number
        | boolean
        | null
      > = {};

    if (
      candidate.title
      !== property.title
    ) {
      payload.title =
        candidate.title;
    }

    if (
      candidate.description
      !== property.description
    ) {
      payload.description =
        candidate.description;
    }

    if (
      candidate.type
      !== property.type
    ) {
      payload.type =
        candidate.type;
    }

    if (
      candidate.location
      !== property.location
    ) {
      payload.location =
        candidate.location;
    }

    if (
      candidate.price
      !== property.price
    ) {
      payload.price =
        candidate.price;
    }

    if (
      candidate.bedrooms
      !== property.bedrooms
    ) {
      payload.bedrooms =
        candidate.bedrooms;
    }

    if (
      candidate.bathrooms
      !== property.bathrooms
    ) {
      payload.bathrooms =
        candidate.bathrooms;
    }

    if (
      candidate.status
      !== property.status
    ) {
      payload.status =
        candidate.status;
    }

    if (
      candidate.isFeatured
      !== property.isFeatured
    ) {
      payload.isFeatured =
        candidate.isFeatured;
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
          `/api/properties/${encodeURIComponent(propertyId)}`,
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
        PropertyResponse | null =
        null;

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
          `/login?next=/properties/${encodeURIComponent(propertyId)}/edit`,
        );

        return;
      }

      if (
        response.status === 403
      ) {
        throw new Error(
          result?.message
          ?? "Your account does not have permission to update properties.",
        );
      }

      if (
        !response.ok
        || !result?.success
      ) {
        throw new Error(
          result?.message
          ?? "Unable to update property.",
        );
      }

      router.push(
        "/properties",
      );

      router.refresh();
    } catch (
      submitFailure
    ) {
      setSubmitError(
        submitFailure
          instanceof Error
          ? submitFailure.message
          : "Unable to update property.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <div className="animate-pulse space-y-5">
          <div className="h-7 w-52 rounded bg-gray-200" />

          <div className="grid gap-5 md:grid-cols-2">
            {Array.from(
              {
                length: 8,
              },
            ).map(
              (
                _,
                index,
              ) => (
                <div
                  key={index}
                  className="h-14 rounded-2xl bg-gray-100"
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
    || !property
  ) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-6">
        <p className="font-bold text-red-700">
          Property could not be loaded
        </p>

        <p className="mt-2 text-sm text-red-600">
          {loadError
            || "The requested property is unavailable."}
        </p>

        <Link
          href="/properties"
          className="mt-5 inline-flex rounded-full border border-red-200 bg-white px-5 py-2 text-sm font-bold text-red-700"
        >
          Back to Properties
        </Link>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="mb-7">
        <h2 className="text-xl font-bold text-gray-950">
          Property information
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
          Keep this catalogue record current so sales, inspection, and marketing teams work with accurate property information.
        </p>
      </div>

      {submitError ? (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <p className="font-semibold text-red-700">
            Property could not be updated
          </p>

          <p className="mt-1 text-sm text-red-600">
            {submitError}
          </p>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-gray-700">
            Property Title *
          </span>

          <input
            name="title"
            type="text"
            required
            minLength={2}
            maxLength={160}
            defaultValue={
              property.title
            }
            className="rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-gray-700">
            Property Type *
          </span>

          <input
            name="type"
            type="text"
            required
            minLength={2}
            maxLength={80}
            defaultValue={
              property.type
            }
            className="rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <label className="grid gap-2 lg:col-span-2">
          <span className="text-sm font-bold text-gray-700">
            Location *
          </span>

          <input
            name="location"
            type="text"
            required
            minLength={2}
            maxLength={160}
            defaultValue={
              property.location
            }
            className="rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-gray-700">
            Price (NGN)
          </span>

          <input
            name="price"
            type="text"
            inputMode="decimal"
            maxLength={18}
            defaultValue={
              property.price ?? ""
            }
            className="rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-gray-700">
            Status
          </span>

          <select
            name="status"
            defaultValue={
              property.status
            }
            className="rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          >
            <option value="AVAILABLE">
              Available
            </option>

            <option value="RESERVED">
              Reserved
            </option>

            <option value="SOLD">
              Sold
            </option>

            <option value="RENTED">
              Rented
            </option>

            <option value="INACTIVE">
              Inactive
            </option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-gray-700">
            Bedrooms
          </span>

          <input
            name="bedrooms"
            type="number"
            min="0"
            max="100"
            step="1"
            defaultValue={
              property.bedrooms
              ?? ""
            }
            className="rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-gray-700">
            Bathrooms
          </span>

          <input
            name="bathrooms"
            type="number"
            min="0"
            max="100"
            step="1"
            defaultValue={
              property.bathrooms
              ?? ""
            }
            className="rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <label className="grid gap-2 lg:col-span-2">
          <span className="text-sm font-bold text-gray-700">
            Description
          </span>

          <textarea
            name="description"
            rows={6}
            maxLength={5000}
            defaultValue={
              property.description
              ?? ""
            }
            className="rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <label className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 lg:col-span-2">
          <input
            name="isFeatured"
            type="checkbox"
            defaultChecked={
              property.isFeatured
            }
            className="mt-1 h-4 w-4 accent-red-600"
          />

          <span>
            <span className="block text-sm font-bold text-gray-900">
              Featured property
            </span>

            <span className="mt-1 block text-sm text-gray-500">
              Prioritise this property for marketing and internal recommendations.
            </span>
          </span>
        </label>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Saving Changes..."
            : "Save Changes"}
        </button>

        <Link
          href="/properties"
          className="rounded-full border border-gray-300 px-6 py-3 text-center text-sm font-bold text-gray-700 transition hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

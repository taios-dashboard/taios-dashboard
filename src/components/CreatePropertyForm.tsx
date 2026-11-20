"use client";

import Link from "next/link";
import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type PropertyStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "SOLD"
  | "RENTED"
  | "INACTIVE";

type CreatePropertyResponse = {
  success: boolean;
  message?: string;
  data?: {
    id: string;
  };
};

function parseOptionalInteger(
  value: string,
  fieldLabel: string,
) {
  const trimmed =
    value.trim();

  if (!trimmed) {
    return null;
  }

  const number =
    Number(trimmed);

  if (
    !Number.isInteger(number)
    || number < 0
    || number > 100
  ) {
    throw new Error(
      `${fieldLabel} must be a whole number between 0 and 100.`,
    );
  }

  return number;
}

export default function CreatePropertyForm() {
  const router =
    useRouter();

  const [title, setTitle] =
    useState("");

  const [type, setType] =
    useState("");

  const [location, setLocation] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [bedrooms, setBedrooms] =
    useState("");

  const [bathrooms, setBathrooms] =
    useState("");

  const [
    description,
    setDescription,
  ] =
    useState("");

  const [status, setStatus] =
    useState<PropertyStatus>(
      "AVAILABLE",
    );

  const [
    isFeatured,
    setIsFeatured,
  ] =
    useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  const [error, setError] =
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

    const normalizedTitle =
      title.trim();

    const normalizedType =
      type.trim();

    const normalizedLocation =
      location.trim();

    const normalizedPrice =
      price.trim();

    if (
      normalizedTitle.length < 2
    ) {
      setError(
        "Property title must contain at least 2 characters.",
      );
      return;
    }

    if (
      normalizedType.length < 2
    ) {
      setError(
        "Property type must contain at least 2 characters.",
      );
      return;
    }

    if (
      normalizedLocation.length < 2
    ) {
      setError(
        "Location must contain at least 2 characters.",
      );
      return;
    }

    if (
      normalizedPrice
      && !/^\d{1,15}(\.\d{1,2})?$/.test(
        normalizedPrice,
      )
    ) {
      setError(
        "Price must be a valid non-negative amount with no more than 2 decimal places.",
      );
      return;
    }

    let bedroomCount:
      number | null;

    let bathroomCount:
      number | null;

    try {
      bedroomCount =
        parseOptionalInteger(
          bedrooms,
          "Bedrooms",
        );

      bathroomCount =
        parseOptionalInteger(
          bathrooms,
          "Bathrooms",
        );
    } catch (validationError) {
      setError(
        validationError instanceof Error
          ? validationError.message
          : "Property details are invalid.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response =
        await fetch(
          "/api/properties",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                title:
                  normalizedTitle,
                description:
                  description.trim()
                    || null,
                type:
                  normalizedType,
                location:
                  normalizedLocation,
                price:
                  normalizedPrice
                    || null,
                bedrooms:
                  bedroomCount,
                bathrooms:
                  bathroomCount,
                status,
                isFeatured,
              }),
          },
        );

      let payload:
        CreatePropertyResponse
        | null = null;

      try {
        payload =
          await response.json();
      } catch {
        payload = null;
      }

      if (
        response.status === 401
      ) {
        router.replace(
          "/login?next=/properties/new",
        );
        return;
      }

      if (
        response.status === 403
      ) {
        throw new Error(
          payload?.message
          ?? "Your account does not have permission to add properties.",
        );
      }

      if (
        !response.ok
        || !payload?.success
      ) {
        throw new Error(
          payload?.message
          ?? "Unable to create property.",
        );
      }

      router.push(
        "/properties",
      );

      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to create property.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-gray-700">
            Property Title *
          </span>

          <input
            type="text"
            value={title}
            maxLength={160}
            required
            onChange={(event) =>
              setTitle(
                event.target.value,
              )
            }
            placeholder="Example: Guzape Luxury Duplex"
            className="rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-gray-700">
            Property Type *
          </span>

          <input
            type="text"
            value={type}
            maxLength={80}
            required
            onChange={(event) =>
              setType(
                event.target.value,
              )
            }
            placeholder="Example: Duplex, Land, Apartment"
            className="rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <label className="grid gap-2 lg:col-span-2">
          <span className="text-sm font-bold text-gray-700">
            Location *
          </span>

          <input
            type="text"
            value={location}
            maxLength={160}
            required
            onChange={(event) =>
              setLocation(
                event.target.value,
              )
            }
            placeholder="Example: Guzape, Abuja"
            className="rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-gray-700">
            Price (NGN)
          </span>

          <input
            type="text"
            inputMode="decimal"
            value={price}
            maxLength={18}
            onChange={(event) =>
              setPrice(
                event.target.value,
              )
            }
            placeholder="Example: 85000000"
            className="rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />

          <span className="text-xs text-gray-500">
            Enter numbers only. Do not add commas or the ₦ symbol.
          </span>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-gray-700">
            Status
          </span>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as PropertyStatus,
              )
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
            type="number"
            min="0"
            max="100"
            step="1"
            value={bedrooms}
            onChange={(event) =>
              setBedrooms(
                event.target.value,
              )
            }
            placeholder="Example: 4"
            className="rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-bold text-gray-700">
            Bathrooms
          </span>

          <input
            type="number"
            min="0"
            max="100"
            step="1"
            value={bathrooms}
            onChange={(event) =>
              setBathrooms(
                event.target.value,
              )
            }
            placeholder="Example: 5"
            className="rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />
        </label>

        <label className="grid gap-2 lg:col-span-2">
          <span className="text-sm font-bold text-gray-700">
            Description
          </span>

          <textarea
            value={description}
            maxLength={5000}
            rows={6}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            placeholder="Describe the property, location advantages, finishing, access, and other relevant details."
            className="rounded-2xl border border-gray-300 px-4 py-3 text-sm text-gray-950 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
          />

          <span className="text-right text-xs text-gray-500">
            {description.length}/5000
          </span>
        </label>

        <label className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 lg:col-span-2">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(event) =>
              setIsFeatured(
                event.target.checked,
              )
            }
            className="mt-1 h-4 w-4 accent-red-600"
          />

          <span>
            <span className="block text-sm font-bold text-gray-900">
              Featured property
            </span>

            <span className="mt-1 block text-sm text-gray-500">
              Mark this property for priority placement and marketing use.
            </span>
          </span>
        </label>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4"
        >
          <p className="font-semibold text-red-700">
            Unable to add property
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Adding Property..."
            : "Add Property"}
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

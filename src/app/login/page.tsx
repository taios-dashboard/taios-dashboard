"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function getSafeNextPath(value: string | null) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/dashboard";
  }

  return value;
}

type LoginResponse = {
  success?: boolean;
  message?: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response =
        await fetch(
          "/api/auth/login",
          {
            method: "POST",
            headers: {
              Accept:
                "application/json",
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                email,
                password,
              }),
          },
        );

      let payload:
        | LoginResponse
        | null = null;

      try {
        payload =
          await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        setError(
          payload?.message ??
            "Unable to sign in.",
        );

        return;
      }

      const params =
        new URLSearchParams(
          window.location.search,
        );

      const nextPath =
        getSafeNextPath(
          params.get("next"),
        );

      router.replace(
        nextPath,
      );

      router.refresh();
    } catch {
      setError(
        "Unable to reach the authentication service.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-5 py-10 text-gray-950">
      <section className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
        <Link
          href="/"
          className="mb-6 inline-flex text-sm font-semibold text-gray-500 hover:text-red-600"
        >
          ← Back to home
        </Link>

        <div className="mx-auto mb-6 w-fit rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
          <Image
            src="/images/tobee-logo.jpg"
            alt="Tobee Empires logo"
            width={150}
            height={60}
            className="h-20 w-auto object-contain"
            priority
          />
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-600">
            TAIOS Access
          </p>

          <h1 className="mt-3 text-3xl font-bold text-gray-950">
            Sign in to Tobee AI OS
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600">
            Secure access for Tobee Empires staff, sales teams,
            marketing users, and management.
          </p>
        </div>

        <form
          className="mt-8 space-y-5"
          onSubmit={handleSubmit}
        >
          <div>
            <label
              htmlFor="email"
              className="text-sm font-semibold text-gray-700"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              autoComplete="email"
              required
              disabled={isSubmitting}
              placeholder="admin@tobeeempires.com"
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="text-sm font-semibold text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              autoComplete="current-password"
              required
              disabled={isSubmitting}
              placeholder="Enter password"
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-red-500 disabled:cursor-not-allowed disabled:bg-gray-100"
            />
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
          >
            {isSubmitting
              ? "Signing In..."
              : "Sign In"}
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
            Security Note
          </p>

          <p className="mt-2 text-xs leading-5 text-gray-600">
            Credentials are verified by the TAIOS backend.
            Your access token is stored in a secure HTTP-only
            session cookie and is not exposed to browser storage.
          </p>
        </div>
      </section>
    </main>
  );
}

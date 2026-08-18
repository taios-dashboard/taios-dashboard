import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
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
            Secure access for Tobee Empires staff, sales teams, marketing users,
            and management.
          </p>
        </div>

        <form className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Email address
            </label>
            <input
              type="email"
              placeholder="admin@tobeeempires.com"
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-red-500"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-red-500"
            />
          </div>

          <button
            type="button"
            className="w-full rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 rounded-2xl bg-gray-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
            Security Note
          </p>
          <p className="mt-2 text-xs leading-5 text-gray-600">
            This is an auth-ready frontend screen. Real authentication,
            password hashing, session handling, role checks, and audit logging
            will be handled securely by the backend.
          </p>
        </div>
      </section>
    </main>
  );
}

"use client";

import LegalLayout from "@/components/layout/LegalLayout";

export default function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="January 12, 2026">
      <p className="lead text-xl text-gray-600 mb-8 font-medium">
        Welcome to{" "}
        <strong className="text-gray-900">Learning Management System</strong>.
        Please read these terms carefully as they define the rules and
        regulations for using our educational platform.
      </p>

      <div className="space-y-8">
        <section className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
          <h3 className="text-xl font-bold text-blue-900 mb-2">
            🚀 Quick Summary
          </h3>
          <p className="text-blue-800 text-sm">
            By using our platform, you agree to respect intellectual property,
            maintain civil conduct, and use your account responsibly. We grant
            you a limited license to access purchased content.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            1. Agreement to Terms
          </h3>
          <p className="text-gray-700">
            By accessing our website and taking our courses, you confirm that
            you are bound by these Terms. If you are accessing the service on
            behalf of an organization, you agree to these terms for that
            organization.
          </p>
        </section>

        <hr className="border-gray-100" />

        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            2. Accounts & Security
          </h3>
          <p className="mb-4 text-gray-700">
            To access most features, you must register for an account. You agree
            to:
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            <li className="flex gap-3 items-start p-3 rounded-lg bg-gray-50">
              <span className="text-green-500 font-bold">✓</span>
              <span className="text-sm">
                Provide accurate and complete information.
              </span>
            </li>
            <li className="flex gap-3 items-start p-3 rounded-lg bg-gray-50">
              <span className="text-green-500 font-bold">✓</span>
              <span className="text-sm">
                Maintain the confidentiality of your password.
              </span>
            </li>
            <li className="flex gap-3 items-start p-3 rounded-lg bg-gray-50">
              <span className="text-green-500 font-bold">✓</span>
              <span className="text-sm">
                Notify us immediately of unauthorized access.
              </span>
            </li>
            <li className="flex gap-3 items-start p-3 rounded-lg bg-gray-50">
              <span className="text-red-500 font-bold">✕</span>
              <span className="text-sm">
                Not share your account credentials with others.
              </span>
            </li>
          </ul>
        </section>

        <hr className="border-gray-100" />

        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            3. Intellectual Property Rights
          </h3>
          <p className="mb-4 text-gray-700">
            The content on this platform, including videos, text, quizzes, and
            code, is the property of{" "}
            <strong className="text-gray-900">
              Learning Management System
            </strong>{" "}
            or its content creators.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <p className="text-yellow-800 text-sm font-semibold">
              You are granted a limited, non-exclusive, non-transferable license
              to access and view the content for personal, non-commercial
              educational purposes.
            </p>
          </div>
        </section>

        <hr className="border-gray-100" />

        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            4. User Conduct
          </h3>
          <p className="text-gray-700 mb-4">
            We foster a positive learning environment. You agree not to:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Harass, threaten, or intimidate other users or instructors.</li>
            <li>
              Post content that is infringing, libelous, defamatory, or obscene.
            </li>
            <li>Use the service for any illegal or unauthorized purpose.</li>
            <li>
              Attempt to scrape, reverse engineer, or compromise the platform
              integrity.
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            5. Termination
          </h3>
          <p className="text-gray-700">
            We reserve the right to suspend or terminate your account at our
            sole discretion, without notice, for conduct that we believe
            violates these Terms or is harmful to other users, us, or third
            parties, or for any other reason.
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}

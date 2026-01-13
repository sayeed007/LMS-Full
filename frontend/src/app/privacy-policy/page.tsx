"use client";

import LegalLayout from "@/components/layout/LegalLayout";

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="January 12, 2026">
      <p className="lead text-xl text-gray-600 mb-8 font-medium">
        At <strong className="text-gray-900">Learning Management System</strong>
        , we value your trust and are committed to protecting your privacy. This
        policy details how we handle your data transparently and securely.
      </p>

      <div className="space-y-8">
        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">
              1
            </span>
            Information We Collect
          </h3>
          <p className="mb-4">
            We collect information ensuring we can provide you with the best
            possible learning experience. This includes:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <strong className="text-gray-900">
                Personal Identification:
              </strong>{" "}
              Name, email address, and profile pictures when you register.
            </li>
            <li>
              <strong className="text-gray-900">Course Data:</strong> Progress
              tracking, quiz scores, and course completion certificates.
            </li>
            <li>
              <strong className="text-gray-900">Payment Information:</strong>{" "}
              Securely processed transaction details (we do not store sensitive
              card data).
            </li>
            <li>
              <strong className="text-gray-900">Usage Analytics:</strong> Data
              on how you interact with our platform to help us improve
              performance.
            </li>
          </ul>
        </section>

        <hr className="border-gray-100" />

        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">
              2
            </span>
            How We Use Your Data
          </h3>
          <p className="mb-4">
            Your data powers your personalized journey. We utilize it to:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <strong className="block text-gray-900 mb-1">
                Service Delivery
              </strong>
              Provide, troubleshoot, and maintain your access to courses.
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <strong className="block text-gray-900 mb-1">
                Communication
              </strong>
              Send course updates, support responses, and security alerts.
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <strong className="block text-gray-900 mb-1">
                Personalization
              </strong>
              Recommend courses based on your skills and interests.
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <strong className="block text-gray-900 mb-1">Security</strong>
              Detect and prevent fraudulent usage or security incidents.
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">
              3
            </span>
            Sharing & Disclosures
          </h3>
          <p>
            <strong className="text-gray-900">
              We do not sell your personal data.
            </strong>{" "}
            Usage is strictly limited to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-gray-700">
            <li>
              <strong className="text-gray-900">Service Providers:</strong> Who
              help us with hosting, support, and payments (under strict
              confidentiality).
            </li>
            <li>
              <strong className="text-gray-900">Legal Compliance:</strong> When
              required by law or to protect rights and safety.
            </li>
          </ul>
        </section>

        <hr className="border-gray-100" />

        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">
              4
            </span>
            Your Rights
          </h3>
          <p>
            You have full control over your digital footprint with us. You can:
          </p>
          <ul className="mt-4 space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Access and export your personal data.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Request correction of inaccurate information.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Delete your account and associated data (Right to be Forgotten).
            </li>
          </ul>
        </section>
      </div>
    </LegalLayout>
  );
}

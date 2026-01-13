"use client";

import LegalLayout from "@/components/layout/LegalLayout";

export default function CookiePolicy() {
  return (
    <LegalLayout title="Cookie Policy" lastUpdated="January 12, 2026">
      <p className="lead text-xl text-gray-600 mb-8 font-medium">
        We use cookies to improve your experience, personalize content, and
        analyze our traffic. This policy explains what cookies are and how we
        use them on{" "}
        <strong className="text-gray-900">Learning Management System</strong>.
      </p>

      <div className="space-y-10">
        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            🍪 What is a Cookie?
          </h3>
          <p className="text-gray-700 bg-gray-50 p-6 rounded-xl border border-gray-100">
            A cookie is a small text file that a website stores on your computer
            or mobile device when you visit the site. It enables the website to
            remember your actions and preferences (such as login, language, font
            size, and other display preferences) over a period of time, so you
            don’t have to keep re-entering them whenever you come back to the
            site or browse from one page to another.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            How We Use Cookies
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mb-4">
                1
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Essential Cookies
              </h4>
              <p className="text-gray-600 text-sm">
                Strictly necessary for the website to function (e.g., logging
                in, accessing secure areas). You cannot opt-out of these.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold mb-4">
                2
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Performance Cookies
              </h4>
              <p className="text-gray-600 text-sm">
                Allow us to count visits and traffic sources so we can measure
                and improve the performance of our site.
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold mb-4">
                3
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Functional Cookies
              </h4>
              <p className="text-gray-600 text-sm">
                Enable the website to provide enhanced functionality and
                personalization (e.g., remembering your name).
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold mb-4">
                4
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                Targeting Cookies
              </h4>
              <p className="text-gray-600 text-sm">
                May be set by our advertising partners to build a profile of
                your interests and show you relevant adverts on other sites.
              </p>
            </div>
          </div>
        </section>

        <hr className="border-gray-100" />

        <section>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Managing Your Preferences
          </h3>
          <p className="text-gray-700 mb-4">
            You can control and/or delete cookies as you wish. You can delete
            all cookies that are already on your computer and you can set most
            browsers to prevent them from being placed. If you do this, however,
            you may have to manually adjust some preferences every time you
            visit a site and some services and functionalities may not work.
          </p>

          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="font-bold text-gray-900 mb-2">Browser Settings:</h4>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>
                <a href="#" className="text-blue-600 hover:underline">
                  Google Chrome
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:underline">
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:underline">
                  Apple Safari
                </a>
              </li>
              <li>
                <a href="#" className="text-blue-600 hover:underline">
                  Microsoft Edge
                </a>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </LegalLayout>
  );
}

"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import { Mail, MapPin, Phone, Send, MessageSquare } from "lucide-react";
import LandingButton from "@/components/landing/LandingButton";
import { motion } from "framer-motion";
import { useSendContactMessageMutation } from "@/store/api/contactApi";
import { showFormSuccessToast, showFormErrorToast } from "@/lib/toast-utils";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });

  const [sendMessage, { isLoading }] = useSendContactMessageMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMessage(formData).unwrap();
      showFormSuccessToast(
        "We've received your message and will get back to you shortly."
      );
      setFormData({ firstName: "", lastName: "", email: "", message: "" });
    } catch (error: any) {
      showFormErrorToast(
        error?.data?.message || "Failed to send message. Please try again."
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-blue-50/50" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

        <Container size="xl" className="relative z-10 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Get in{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Touch
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            We&apos;d love to hear from you. Whether you have a question about
            features, pricing, or just want to say hi, our team is ready to
            answer all your questions.
          </motion.p>
        </Container>
      </section>

      <Container size="xl" className="py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                Contact Information
              </h3>
              <div className="space-y-6">
                <ContactItem
                  icon={Mail}
                  color="blue"
                  title="Email Us"
                  content="Our friendly team is here to help."
                  link="mailto:support@lms.com"
                  linkText="support@lms.com"
                />
                <ContactItem
                  icon={MapPin}
                  color="purple"
                  title="Visit Us"
                  content="Come say hello at our office HQ."
                  detail={
                    <span>
                      100 Smith Street
                      <br />
                      Collingwood VIC 3066 AU
                    </span>
                  }
                />
                <ContactItem
                  icon={Phone}
                  color="green"
                  title="Call Us"
                  content="Mon-Fri from 8am to 5pm."
                  link="tel:+1555000000"
                  linkText="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">Chat with us</h3>
                <p className="text-blue-100 mb-6">
                  Speak to our friendly team via live chat.
                </p>
                <div className="flex items-center gap-4 text-sm font-semibold cursor-pointer hover:text-white/80 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  <span>Start Live Chat</span>
                </div>
              </div>
              {/* Decorative circles */}
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Send us a message
            </h2>
            <p className="text-gray-500 mb-8">
              Fill out the form below and we&apos;ll get back to you as soon as
              possible.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <InputField
                  label="Last Name"
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>

              <InputField
                label="Email"
                id="email"
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
              />

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 resize-none bg-gray-50 focus:bg-white"
                  placeholder="Tell us about your inquiry..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <LandingButton
                type="submit"
                className="flex w-full justify-center py-4 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Send Message <Send className="w-5 h-5" />
                  </span>
                )}
              </LandingButton>
            </form>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}

const ContactItem = ({
  icon: Icon,
  color,
  title,
  content,
  link,
  linkText,
  detail,
}: any) => {
  const colorClasses: any = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className="flex items-start gap-5 group">
      <div
        className={`w-12 h-12 ${colorClasses[color]} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon size={24} />
      </div>
      <div>
        <h4 className="font-bold text-gray-900 text-lg mb-1">{title}</h4>
        <p className="text-gray-500 mb-2">{content}</p>
        {link && (
          <a
            href={link}
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            {linkText}
          </a>
        )}
        {detail && (
          <p className="font-semibold text-gray-900 leading-relaxed">
            {detail}
          </p>
        )}
      </div>
    </div>
  );
};

const InputField = ({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
}: any) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-semibold text-gray-700 mb-2"
    >
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        id={id}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 bg-gray-50 focus:bg-white"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
      />
    </div>
  </div>
);

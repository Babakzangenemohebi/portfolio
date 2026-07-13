"use client";

import React, { useState } from "react";
import { Phone, Mail, Send, SendHorizontal, MessageSquare, ArrowUpLeft, CheckCircle } from "lucide-react";

const Instagram = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);


export default function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: <Phone className="w-5 h-5 text-brand-orange" />,
      label: "تلفن تماس",
      value: "۰۹۰۱۰۲۲۷۳۵۵",
      link: "tel:09010227355"
    },
    {
      icon: <Mail className="w-5 h-5 text-brand-teal" />,
      label: "آدرس ایمیل",
      value: "babakzangenemohebi@gmail.com",
      link: "mailto:babakzangenemohebi@gmail.com"
    },
    {
      icon: <Instagram className="w-5 h-5 text-brand-orange" />,
      label: "اینستاگرام",
      value: "@babakzangenemohebi",
      link: "https://instagram.com/babakzangenemohebi"
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-brand-teal" />,
      label: "آیدی تلگرام / سایر",
      value: "B4BACK",
      link: "https://t.me/B4BACK"
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  return (
    <section id="contact" className="relative w-full max-w-6xl mx-auto px-4 py-20 z-10">
      {/* Section Title */}
      <div className="text-center mb-16">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-semibold mb-3">
          <Mail className="w-3 h-3" />
          ارتباط با من
        </span>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
          بیایید پروژه بعدی شما را بسازیم
        </h2>
        <p className="text-zinc-400 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
          آماده پاسخگویی به ایده‌ها و پروژه‌های خلاقانه شما هستم. از پیام شما در زمینه‌های گرافیک، تدوین و کارهای چندرسانه‌ای استقبال می‌کنم.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Info: 5 columns */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-lg md:text-xl font-bold text-white mb-6">راه های ارتباطی سریع</h3>
          
          <div className="space-y-4">
            {contactInfo.map((info, idx) => (
              <a
                key={idx}
                href={info.link}
                target={info.link.startsWith("http") ? "_blank" : undefined}
                rel={info.link.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-center gap-5 p-5 rounded-2xl glass glow-hover shadow-md hover:bg-zinc-800/30 group transition-all"
              >
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
                  {info.icon}
                </div>
                <div className="flex-1">
                  <span className="block text-[10px] text-zinc-500 font-semibold mb-0.5">{info.label}</span>
                  <span className="font-bold text-sm md:text-base text-zinc-200 group-hover:text-white transition-colors">{info.value}</span>
                </div>
                <ArrowUpLeft className="w-4 h-4 text-zinc-600 group-hover:text-brand-orange group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
              </a>
            ))}
          </div>

          <div className="p-6 rounded-3xl border border-zinc-800/80 bg-zinc-950/20 text-xs text-zinc-500 leading-relaxed text-justify">
            <span className="font-bold text-brand-orange block mb-1">درباره همکاری‌های دورکاری:</span>
            من به صورت پروژه‌ای و دورکاری با آژانس‌ها و شرکت‌های مختلف در سراسر کشور همکاری می‌کنم. پروژه‌ها با سناریو و زمان‌بندی دقیق برنامه‌ریزی شده و در موعد مقرر تحویل خواهند شد.
          </div>
        </div>

        {/* Contact Form: 7 columns */}
        <div className="lg:col-span-7">
          <div className="glass p-8 md:p-10 rounded-3xl shadow-xl relative overflow-hidden">
            {submitted ? (
              <div className="py-16 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-white">پیام شما با موفقیت ارسال شد</h4>
                <p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed">
                  ممنون از پیام شما. در کوتاه‌ترین زمان ممکن پس از بررسی اطلاعات پیام، با شما تماس خواهم گرفت.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors text-xs font-semibold cursor-pointer"
                >
                  ارسال پیام جدید
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-lg md:text-xl font-bold text-white mb-2">ارسال پیغام مستقیم</h3>
                <p className="text-xs md:text-sm text-zinc-400 mb-6 leading-relaxed">
                  می‌توانید از طریق فرم زیر، جزئیات پروژه یا ایده خود را برای من ارسال کنید.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-xs font-semibold text-zinc-400">نام و نام خانوادگی</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-orange/60 focus:bg-zinc-900 transition-all text-sm"
                      placeholder="مثال: علی رضایی"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-xs font-semibold text-zinc-400">آدرس ایمیل</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-teal/60 focus:bg-zinc-900 transition-all text-sm dir-ltr text-right"
                      placeholder="example@gmail.com"
                    />
                  </div>
                </div>

                {/* Subject Input */}
                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-xs font-semibold text-zinc-400">موضوع پیام</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-orange/60 focus:bg-zinc-900 transition-all text-sm"
                    placeholder="مثال: سفارش تدوین تیزر یا هویت بصری"
                  />
                </div>

                {/* Message Input */}
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-xs font-semibold text-zinc-400">متن پیغام</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-white placeholder-zinc-600 focus:outline-none focus:border-brand-orange/60 focus:bg-zinc-900 transition-all text-sm resize-none leading-relaxed"
                    placeholder="توضیحات خود را در مورد ایده یا پروژه بنویسید..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-brand-orange to-[#ff8452] text-black font-bold text-sm hover:scale-[1.01] hover:shadow-[0_0_20px_-3px_rgba(255,107,53,0.4)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4.5 w-4.5 border-2 border-black border-t-transparent rounded-full" />
                      در حال ارسال پیام...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      ارسال پیغام مستقیم
                      <SendHorizontal className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

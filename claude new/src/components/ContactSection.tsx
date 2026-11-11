import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Mail, MapPin, Check, Send, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const STUDIO_EMAIL = 'paintlabs2000@gmail.com';

export const ContactSection: React.FC = () => {
  const { submitContactInquiry } = useShop();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastSubmission, setLastSubmission] = useState<{ name: string; email: string; message: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !name.trim() || !email.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const submissionData = {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    };

    // Saved straight to the `inquiries` table in Supabase (status: 'New').
    const ok = await submitContactInquiry(submissionData.name, submissionData.email, submissionData.message);

    if (ok) {
      setLastSubmission(submissionData);
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } else {
      setErrorMessage('We could not send your message just now. Please check your connection and try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="py-20 bg-[#FBFBFA] border-b border-[#EAE8E3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-500 font-semibold mb-2">
            <Mail className="w-3.5 h-3.5 text-stone-700" />
            <span>Direct Inquiries</span>
            <span aria-hidden="true">·</span>
            <span>Connect with the CEO</span>
          </div>

          <h2 className="font-editorial text-3xl sm:text-4xl text-[#191918] font-normal leading-tight">
            Contact the Paint Labs Studio
          </h2>

          <p className="text-stone-600 text-sm sm:text-base mt-2">
            Have questions about an original painting, a custom portrait idea, or delivery on campus? Ask your question below and it goes straight to the Paint Labs studio team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-xl p-6 sm:p-8 border border-stone-200 shadow-xs">
            {submitted && lastSubmission ? (
              <div className="py-10 text-center space-y-5">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-200">
                  <Check className="w-7 h-7" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-editorial text-2xl text-stone-900 font-normal">
                    Message Received
                  </h3>
                  <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="font-semibold text-stone-900">{lastSubmission.name}</span>! Your question has reached the Paint Labs studio.
                  </p>
                  <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                    A reply will be sent to <span className="font-medium text-stone-800">{lastSubmission.email}</span> within 24 hours.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setLastSubmission(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-black hover:bg-stone-100 rounded-lg transition-colors"
                  >
                    Ask Another Question
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Daniyal Khan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 bg-[#FBFBFA] border border-stone-300 rounded focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. student@giki.edu.pk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 bg-[#FBFBFA] border border-stone-300 rounded focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Your Question or Idea</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe your question, custom portrait ideas, preferred size, or delivery details..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3 bg-[#FBFBFA] border border-stone-300 rounded focus:outline-none focus:border-black leading-relaxed"
                  />
                  {errorMessage && (
                    <p className="text-xs text-red-600 flex items-center gap-1.5 font-medium mt-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errorMessage}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs uppercase tracking-wider font-semibold text-white bg-[#191918] hover:bg-stone-800 disabled:bg-stone-400 transition-colors rounded-md shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Question</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right: Studio Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#F5F2EB] rounded-xl p-6 sm:p-7 border border-[#E6E1D4] space-y-5 text-xs">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold uppercase tracking-wider text-stone-800">
                  Paint Labs Working Studio
                </h4>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Direct Contact
                </span>
              </div>

              <div className="space-y-3.5 text-stone-600">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-stone-800 shrink-0" />
                  <span>Paint Labs Studio · GIK Institute, Topi, Swabi, KPK</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-stone-800 shrink-0" />
                  <span className="font-mono text-stone-900 font-semibold select-text">{STUDIO_EMAIL}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-300 flex items-center justify-between text-xs">
                <span className="text-stone-700 font-medium">Campus Delivery:</span>
                <span className="font-semibold text-emerald-900 bg-emerald-100/90 px-2.5 py-1 rounded border border-emerald-300">
                  Free delivery across GIKI
                </span>
              </div>
            </div>

            {/* Quick Studio Note */}
            <div className="bg-white rounded-xl p-6 border border-stone-200 text-xs text-stone-600 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-stone-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Custom Commissions & Inquiries</span>
              </div>
              <p className="leading-relaxed">
                Whether you want to order one of our existing paintings or discuss a custom portrait idea, send your question above and we will connect with you right away.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

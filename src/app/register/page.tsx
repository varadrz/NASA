// Participant Registration Form Page (Bauhaus Theme)
// Location: src/app/register/page.tsx

'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Compass, Loader2, QrCode } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const barrelRedirect = searchParams.get('barrel');

  const [formData, setFormData] = useState({
    full_name: '',
    college_name: '',
    phone_number: '',
    registration_id: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!formData.full_name.trim() || !formData.college_name.trim() || !formData.phone_number.trim() || !formData.registration_id.trim()) {
      setError('All fields are required.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please verify credentials.');
        setSubmitting(false);
        return;
      }

      window.dispatchEvent(new Event('refresh-session'));

      if (barrelRedirect) {
        router.push(`/barrel/${barrelRedirect}`);
      } else {
        router.push('/');
      }
      router.refresh();
    } catch (err) {
      console.error('Registration submit error:', err);
      setError('A connection error occurred. Please verify your connection.');
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl relative">
      {/* Bauhaus Decorative Offset Blocks */}
      <div className="absolute -top-6 -left-6 w-24 h-24 bg-brand-mustard border-4 border-brand-on-surface -z-10"></div>
      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-secondary border-4 border-brand-on-surface -z-10"></div>

      {/* Main Registration Card */}
      <div className="bg-brand-surface border-4 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] p-8 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <span className="font-mono text-[10px] font-bold bg-brand-primary text-brand-on-primary px-3 py-1 mb-2 inline-block uppercase tracking-wider">
              MANDATORY EVENT ACCESS
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-brand-on-surface">
              REGISTER
            </h1>
          </div>
          
          <div className="bg-brand-secondary-container p-4 border-2 border-brand-on-surface hidden md:block">
            <Compass className="h-10 w-10 text-brand-secondary" />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 border-2 border-brand-error bg-red-50 text-brand-error font-mono text-xs font-bold uppercase">
            ERROR: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="font-mono text-xs font-bold block mb-2 text-brand-on-surface-variant uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="ENTER YOUR FULL NAME"
              disabled={submitting}
              className="w-full input-brutalist px-4 py-3.5 text-sm uppercase placeholder:text-brand-outline-variant placeholder:opacity-50"
              required
            />
          </div>

          {/* College Name */}
          <div>
            <label htmlFor="college_name" className="font-mono text-xs font-bold block mb-2 text-brand-on-surface-variant uppercase tracking-wider">
              College / Institute
            </label>
            <input
              type="text"
              id="college_name"
              name="college_name"
              value={formData.college_name}
              onChange={handleChange}
              placeholder="ARCHITECTURAL INSTITUTE"
              disabled={submitting}
              className="w-full input-brutalist px-4 py-3.5 text-sm uppercase placeholder:text-brand-outline-variant placeholder:opacity-50"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Phone Number */}
            <div>
              <label htmlFor="phone_number" className="font-mono text-xs font-bold block mb-2 text-brand-on-surface-variant uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+91 99999 99999"
                disabled={submitting}
                className="w-full input-brutalist px-4 py-3.5 text-sm uppercase placeholder:text-brand-outline-variant placeholder:opacity-50"
                required
              />
            </div>

            {/* NASA Registration ID */}
            <div>
              <label htmlFor="registration_id" className="font-mono text-xs font-bold block mb-2 text-brand-on-surface-variant uppercase tracking-wider">
                NASA Registration ID (Unique)
              </label>
              <input
                type="text"
                id="registration_id"
                name="registration_id"
                value={formData.registration_id}
                onChange={handleChange}
                placeholder="NASA-2026-XXXX"
                disabled={submitting}
                className="w-full input-brutalist px-4 py-3.5 text-sm uppercase placeholder:text-brand-outline-variant placeholder:opacity-50"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 py-5 bg-brand-primary text-brand-on-primary border-4 border-brand-on-surface font-display font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-primary-container active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                VERIFYING REGISTRATION DATA...
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4" />
                {barrelRedirect ? 'COMPLETE REGISTRATION & JOIN HUNT' : 'START ARCHITECTURAL QUEST'}
              </>
            )}
          </button>
        </form>

        <p className="mt-8 font-mono text-[10px] text-brand-on-surface-variant text-center tracking-wide leading-relaxed">
          By joining, you agree to the 68th Convention Code of Conduct. Accounts are bound to one active session.
        </p>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-surface">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-16 px-4 md:px-8">
        <Suspense fallback={
          <div className="text-brand-on-surface text-center">
            <Compass className="h-10 w-10 text-brand-primary animate-spin mb-2 mx-auto" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest">LOADING MODULES...</span>
          </div>
        }>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}

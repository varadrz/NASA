// Participant Registration Form Page (Bauhaus Theme)
// Location: src/app/register/page.tsx

'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
    registration_id: '',
    instagram_id: ''
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

    if (!formData.full_name.trim() || !formData.college_name.trim() || !formData.phone_number.trim() || !formData.registration_id.trim() || !formData.instagram_id.trim()) {
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
        body: JSON.stringify({
          ...formData,
          registration_id: `Z-${formData.registration_id.trim()}`
        })
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

          {/* Zone Number */}
          <div>
            <label htmlFor="college_name" className="font-mono text-xs font-bold block mb-2 text-brand-on-surface-variant uppercase tracking-wider">
              Zone No.
            </label>
            <select
              id="college_name"
              name="college_name"
              value={formData.college_name}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  college_name: e.target.value
                });
                setError(null);
              }}
              disabled={submitting}
              className="w-full input-brutalist px-4 py-3.5 text-sm uppercase bg-brand-surface text-brand-on-surface font-sans font-bold cursor-pointer"
              required
            >
              <option value="" disabled>SELECT YOUR ZONE</option>
              <option value="Zone 1">ZONE 1</option>
              <option value="Zone 2">ZONE 2</option>
              <option value="Zone 3">ZONE 3</option>
              <option value="Zone 4">ZONE 4</option>
              <option value="Zone 5">ZONE 5</option>
              <option value="Zone 6">ZONE 6</option>
            </select>
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

            {/* Z-Id */}
            <div>
              <label htmlFor="registration_id" className="font-mono text-xs font-bold block mb-2 text-brand-on-surface-variant uppercase tracking-wider">
                Z-Id (Unique Code)
              </label>
              <div className="flex border-2 border-brand-on-surface focus-within:border-brand-secondary focus-within:shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] transition-all bg-brand-surface">
                <span className="flex items-center justify-center px-4 bg-brand-surface-container text-brand-on-surface border-r-2 border-brand-on-surface font-mono font-bold text-sm select-none">
                  Z-
                </span>
                <input
                  type="text"
                  id="registration_id"
                  name="registration_id"
                  value={formData.registration_id}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, ''); // Numbers only
                    setFormData({ ...formData, registration_id: val });
                    setError(null);
                  }}
                  placeholder="NUMBER"
                  disabled={submitting}
                  className="flex-grow px-4 py-3.5 text-sm bg-transparent text-brand-on-surface placeholder:text-brand-outline-variant placeholder:opacity-50 outline-none border-none uppercase"
                  required
                />
              </div>
            </div>
          </div>

          {/* Instagram Handle */}
          <div>
            <label htmlFor="instagram_id" className="font-mono text-xs font-bold block mb-2 text-brand-on-surface-variant uppercase tracking-wider">
              Instagram Handle
            </label>
            <div className="flex border-2 border-brand-on-surface focus-within:border-brand-secondary focus-within:shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] transition-all bg-brand-surface">
              <span className="flex items-center justify-center px-4 bg-brand-surface-container text-brand-on-surface border-r-2 border-brand-on-surface font-mono font-bold text-sm select-none">
                @
              </span>
              <input
                type="text"
                id="instagram_id"
                name="instagram_id"
                value={formData.instagram_id}
                onChange={handleChange}
                placeholder="username"
                disabled={submitting}
                className="flex-grow px-4 py-3.5 text-sm bg-transparent text-brand-on-surface placeholder:text-brand-outline-variant placeholder:opacity-50 outline-none border-none"
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

        <div className="mt-6 text-center">
          <p className="font-mono text-xs text-brand-on-surface-variant">
            Already registered?{' '}
            <Link href="/login" className="font-bold text-brand-primary hover:underline uppercase">
              Log In Here
            </Link>
          </p>
        </div>

        <p className="mt-8 font-mono text-[10px] text-brand-on-surface-variant text-center tracking-wide leading-relaxed">
          By joining, you agree to the 68th Year Annual Nasa Heritage Hunt Code of Conduct. Accounts are bound to one active session.
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

// Participant Login / Resume Session Page (Bauhaus Theme)
// Location: src/app/login/page.tsx

'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Compass, Loader2, LogIn } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const barrelRedirect = searchParams.get('barrel');

  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: ''
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

    if (!formData.full_name.trim() || !formData.phone_number.trim()) {
      setError('Both fields are required.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: formData.full_name.trim(),
          phone_number: formData.phone_number.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please verify credentials.');
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
      console.error('Login submit error:', err);
      setError('A connection error occurred. Please verify your connection.');
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md relative">
      {/* Bauhaus Decorative Offset Blocks */}
      <div className="absolute -top-6 -left-6 w-24 h-24 bg-brand-mustard border-4 border-brand-on-surface -z-10 animate-pulse"></div>
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-brand-secondary border-4 border-brand-on-surface -z-10"></div>

      {/* Main Login Card */}
      <div className="bg-brand-surface border-4 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] p-8 md:p-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="font-mono text-[9px] font-bold bg-brand-secondary text-brand-on-secondary px-3 py-1 mb-2 inline-block uppercase tracking-wider">
              RESUME ACTIVE SESSION
            </span>
            <h1 className="font-display text-4xl font-black uppercase tracking-tighter leading-none text-brand-on-surface">
              LOG IN
            </h1>
          </div>
          <div className="bg-brand-primary-container p-3 border-2 border-brand-on-surface">
            <Compass className="h-6 w-6 text-brand-on-primary" />
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
              autoFocus
            />
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone_number" className="font-mono text-xs font-bold block mb-2 text-brand-on-surface-variant uppercase tracking-wider">
              Registered Phone Number
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 py-4.5 bg-brand-primary text-brand-on-primary border-4 border-brand-on-surface font-display font-black text-sm uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] hover:bg-brand-primary-container active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                VERIFYING ACCESS CREDS...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                LOG IN & START HUNT
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="font-mono text-xs text-brand-on-surface-variant">
            Don't have event access?{' '}
            <Link href="/register" className="font-bold text-brand-primary hover:underline uppercase">
              Register Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-surface">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-16 px-4 md:px-8">
        <Suspense fallback={
          <div className="text-brand-on-surface text-center">
            <Compass className="h-10 w-10 text-brand-primary animate-spin mb-2 mx-auto" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest">LOADING AUTH MODULES...</span>
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

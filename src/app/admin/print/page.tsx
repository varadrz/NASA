'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const BARREL_CODES: { [key: number]: string } = {
  1: '48392015',
  2: '89201543',
  3: '31548920',
  4: '54389201',
  5: '92015438',
  6: '15438920',
  7: '83920154',
  8: '43892015',
  9: '20154389',
  10: '71543892',
  11: '62940183',
  12: '30958174',
  13: '84920173',
  14: '15948302',
  15: '93018472',
  16: '48201937',
  17: '75039182',
  18: '29481037',
  19: '58392014',
  20: '10394827'
};

export default function AdminPrintPage() {
  const [originUrl, setOriginUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOriginUrl(window.location.origin);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-brand-surface-low p-6 print:p-0 print:bg-white">
      {/* Print Page Control Panel */}
      <div className="max-w-4xl mx-auto mb-8 p-6 border-4 border-brand-on-surface bg-brand-mustard text-brand-on-surface flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden shadow-[4px_4px_0px_0px_rgba(28,27,27,1)]">
        <div>
          <h1 className="font-display text-2xl font-black uppercase">A3 Checkpoint placard print dashboard</h1>
          <p className="font-mono text-xs font-bold mt-1 text-brand-on-surface-variant uppercase">
            Optimized for 1 target QR code placard per A3 page.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/admin"
            className="px-4 py-2.5 border-2 border-brand-on-surface bg-brand-surface text-brand-on-surface font-display font-bold text-xs uppercase hover:bg-brand-surface-low active:translate-y-[1px] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-brand-on-surface text-brand-surface border-2 border-brand-on-surface font-display font-black text-xs uppercase shadow-[3px_3px_0px_0px_rgba(28,27,27,1)] hover:bg-opacity-95 active:translate-y-[2px] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="h-4.5 w-4.5" />
            PRINT PLACARDS (A3)
          </button>
        </div>
      </div>

      {/* A3 Placard Sheets Container */}
      <div className="space-y-12 print:space-y-0 print:m-0">
        {Array.from({ length: 20 }, (_, i) => i + 1).map((barrelNum) => {
          const scanLink = `${originUrl || 'https://nasa-nine-rosy.vercel.app'}/barrel/${barrelNum}`;
          return (
            <div 
              key={barrelNum}
              className="a3-page-placard bg-white border-8 border-brand-on-surface mx-auto flex flex-col items-center justify-between p-16 text-center select-none shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] print:shadow-none print:border-black print:text-black print:p-12 print:mx-0 print:w-full print:h-full print:min-h-screen page-break-after"
              style={{
                width: '297mm', // A3 width
                height: '420mm', // A3 height
                maxHeight: '420mm',
                boxSizing: 'border-box'
              }}
            >
              {/* Header Header */}
              <div className="w-full border-b-4 border-brand-on-surface pb-6 mt-4">
                <span className="font-mono text-2xl font-black tracking-widest text-brand-on-surface-variant uppercase">
                  68TH YEAR ANNUAL NASA HERITAGE HUNT
                </span>
                <h1 className="font-display text-6xl font-black text-brand-on-surface uppercase tracking-wide mt-2">
                  HERITAGE SCAVENGER HUNT
                </h1>
              </div>

              {/* Central Target Display */}
              <div className="my-auto py-8 space-y-8 flex flex-col items-center justify-center">
                <div>
                  <h2 className="font-display text-8xl font-black text-brand-primary uppercase tracking-tight">
                    BARREL TARGET #{barrelNum.toString().padStart(2, '0')}
                  </h2>
                  <div className="font-mono text-lg text-brand-on-surface-variant mt-2 font-bold uppercase tracking-wider">
                    SCAN THE HIGH-DENSITY QR TARGET WITH YOUR DEVICE CAMERA TO UNLOCK NEXT QUIZ
                  </div>
                </div>

                {/* Massive A3 High Density QR Code */}
                <div className="p-8 bg-white border-8 border-brand-on-surface shadow-[8px_8px_0px_0px_rgba(28,27,27,1)] print:shadow-none inline-block">
                  <QRCodeSVG 
                    value={scanLink} 
                    size={700} 
                    level="H"
                    includeMargin={false}
                  />
                </div>

                {/* Big physical fallback access key displays */}
                <div className="w-full max-w-xl p-6 border-4 border-brand-on-surface bg-brand-surface-low rounded-none space-y-2 shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] print:shadow-none">
                  <div>
                    <span className="font-mono text-base font-black text-brand-on-surface-variant uppercase tracking-widest block mb-2">
                      PHYSICAL ACCESS KEY (MANUAL FALLBACK)
                    </span>
                    <div className="font-mono text-7xl font-black text-brand-primary uppercase tracking-widest leading-none">
                      {BARREL_CODES[barrelNum]}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Disclaimers */}
              <div className="w-full border-t-4 border-brand-on-surface pt-6 mb-4">
                <p className="font-mono text-sm text-brand-on-surface-variant font-bold uppercase leading-relaxed">
                  DO NOT REMOVE, COVER, OR INTERFERE WITH THIS PLACARD ASSEMBLY.<br />
                  AUTOMATIC AUDIT LOGS TRIGGER ON SUSPICIOUS ACTIVITY. ORGANISED BY NASA INDIA.
                </p>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

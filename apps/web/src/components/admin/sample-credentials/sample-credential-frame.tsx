'use client';

import { ReactNode, useRef } from 'react';
import Image from 'next/image';
import { BRAND } from '@/lib/branding';
import { CERT_SIGNATORY, downloadCertificateDocument } from '@/lib/certificate-template';

const NAVY = '#0B1A3A';
const CYAN = '#0891B2';

export interface SampleMeta {
  credentialId: string;
  issueDate: string;
}

interface SampleCredentialFrameProps {
  title: string;
  subtitle?: string;
  meta: SampleMeta;
  children: ReactNode;
  variant?: 'certificate' | 'letter';
  bodyHtmlForDownload?: string;
}

export function SampleCredentialFrame({
  title,
  subtitle,
  meta,
  children,
  variant = 'certificate',
  bodyHtmlForDownload,
}: SampleCredentialFrameProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = ref.current;
    if (!content) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><title>${title}</title>
      <style>
        body { margin: 0; padding: 24px; font-family: Georgia, 'Times New Roman', serif; background: #f8fafc; }
        @page { size: A4 landscape; margin: 12mm; }
        @media print { body { padding: 0; background: white; } }
      </style></head><body>${content.outerHTML}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 400);
  };

  const handleDownload = async () => {
    if (!bodyHtmlForDownload) return;
    await downloadCertificateDocument({
      title,
      subtitle,
      bodyHtml: bodyHtmlForDownload,
      credentialId: meta.credentialId,
      issueDate: meta.issueDate,
      variant,
      signatoryName: CERT_SIGNATORY.name,
      signatoryTitle: CERT_SIGNATORY.title,
    });
  };

  return (
    <div className="space-y-3">
      <div
        ref={ref}
        className="relative mx-auto bg-white text-slate-800 shadow-lg overflow-hidden"
        style={{
          width: '100%',
          maxWidth: variant === 'letter' ? 680 : 820,
          minHeight: variant === 'letter' ? 880 : 520,
          border: `3px solid ${NAVY}`,
        }}
      >
        <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-cyan-500" />
        <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-cyan-500" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-cyan-500" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-cyan-500" />

        <div className="px-8 py-8 md:px-12 md:py-10">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <Image
                src="/mantra-ai-icon.png"
                alt={BRAND.name}
                width={56}
                height={56}
                className="w-14 h-14 rounded-xl shrink-0"
              />
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: CYAN }}>
                  {BRAND.name}
                </p>
                <p className="text-sm font-bold" style={{ color: NAVY }}>
                  {BRAND.programName}
                </p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-500 hidden sm:block">
              <p>Credential ID</p>
              <p className="font-mono font-semibold text-slate-700">{meta.credentialId}</p>
              <p className="mt-1">{meta.issueDate}</p>
            </div>
          </div>

          <div className="text-center mb-6">
            <h2
              className="text-2xl md:text-3xl font-bold tracking-wide uppercase"
              style={{ color: NAVY, fontFamily: 'Georgia, serif' }}
            >
              {title}
            </h2>
            {subtitle && <p className="text-sm text-slate-600 mt-2">{subtitle}</p>}
          </div>

          {children}

          <div className="mt-8 pt-4 border-t border-slate-200 flex flex-wrap items-end justify-between gap-4 text-xs text-slate-500">
            <p>{BRAND.name} · Verify at program portal</p>
            <p className="font-mono sm:hidden">{meta.credentialId}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 max-w-[820px] mx-auto">
        {bodyHtmlForDownload && (
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 py-2 text-sm rounded-md border border-cyan-600 bg-cyan-600 text-white hover:bg-cyan-700 transition-colors"
          >
            Download Certificate
          </button>
        )}
        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 py-2 text-sm rounded-md border border-cyan-600 text-cyan-700 hover:bg-cyan-50 transition-colors"
        >
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}

export function SampleQrPlaceholder({ label = 'VERIFY' }: { label?: string }) {
  return (
    <div className="w-20 h-20 border-2 border-slate-300 bg-white p-1 mx-auto">
      <div
        className="w-full h-full grid grid-cols-5 grid-rows-5 gap-px bg-slate-800"
        aria-hidden
      >
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className={i % 3 === 0 ? 'bg-white' : 'bg-slate-900'} />
        ))}
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function SignatureBlock({ name, title }: { name: string; title: string }) {
  return (
    <div className="text-center">
      <div className="h-10 mb-1 flex items-end justify-center">
        <span className="font-serif italic text-2xl text-slate-700">{name.split(' ')[0]}</span>
      </div>
      <div className="border-t border-slate-400 w-48 mx-auto pt-1">
        <p className="font-semibold text-sm text-slate-800">{name}</p>
        <p className="text-xs text-slate-600">{title}</p>
      </div>
    </div>
  );
}

export { CERT_SIGNATORY };

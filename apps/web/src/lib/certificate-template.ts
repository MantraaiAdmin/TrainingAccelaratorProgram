import { BRAND } from '@/lib/branding';

export const CERT_SIGNATORY = {
  name: 'Vinodhini Y',
  title: 'Founder',
} as const;

const NAVY = '#0B1A3A';
const CYAN = '#0891B2';

export interface CertificateTemplateOptions {
  title: string;
  subtitle?: string;
  bodyHtml: string;
  credentialId: string;
  issueDate: string;
  logoDataUrl?: string;
  qrCodeData?: string;
  signatoryName?: string;
  signatoryTitle?: string;
  variant?: 'certificate' | 'letter';
}

export async function fetchLogoDataUrl(): Promise<string> {
  try {
    const response = await fetch('/mantra-ai-icon.png');
    if (!response.ok) throw new Error('logo fetch failed');
    const blob = await response.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return 'https://mantraai.cloud/mantra-ai-icon.png';
  }
}

export function buildCertificateHtml(options: CertificateTemplateOptions): string {
  const {
    title,
    subtitle,
    bodyHtml,
    credentialId,
    issueDate,
    logoDataUrl,
    qrCodeData,
    signatoryName = CERT_SIGNATORY.name,
    signatoryTitle = CERT_SIGNATORY.title,
    variant = 'certificate',
  } = options;

  const logo = logoDataUrl
    ? `<img src="${logoDataUrl}" alt="${BRAND.name}" width="56" height="56" style="border-radius:12px;display:block;" />`
    : '';

  const qr = qrCodeData
    ? `<img src="${qrCodeData}" alt="Verification QR" width="96" height="96" style="display:block;margin:0 auto;" />`
    : `<div style="width:96px;height:96px;border:2px solid #cbd5e1;margin:0 auto;background:#fff;"></div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${credentialId} — ${BRAND.name}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      font-family: Georgia, 'Times New Roman', serif;
      background: #f8fafc;
      color: #1e293b;
    }
    .page {
      max-width: ${variant === 'letter' ? '680px' : '820px'};
      margin: 0 auto;
      background: #fff;
      border: 3px solid ${NAVY};
      min-height: ${variant === 'letter' ? '880px' : '520px'};
      position: relative;
    }
    .corner { position: absolute; width: 64px; height: 64px; border-color: ${CYAN}; border-style: solid; }
    .corner-tl { top: 0; left: 0; border-width: 4px 0 0 4px; }
    .corner-tr { top: 0; right: 0; border-width: 4px 4px 0 0; }
    .corner-bl { bottom: 0; left: 0; border-width: 0 0 4px 4px; }
    .corner-br { bottom: 0; right: 0; border-width: 0 4px 4px 0; }
    .inner { padding: 40px 48px; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .brand-row { display: flex; align-items: center; gap: 12px; }
    .brand-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: ${CYAN};
      margin: 0;
    }
    .brand-name {
      font-size: 14px;
      font-weight: 700;
      color: ${NAVY};
      margin: 4px 0 0;
    }
    .meta { text-align: right; font-size: 11px; color: #64748b; }
    .meta-id { font-family: monospace; font-weight: 700; color: #334155; }
    .title-block { text-align: center; margin-bottom: 24px; }
    .title-block h1 {
      margin: 0;
      font-size: 28px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: ${NAVY};
    }
    .title-block p { margin: 8px 0 0; font-size: 13px; color: #475569; }
    .body { font-size: 14px; line-height: 1.7; color: #334155; }
    .footer-row {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 24px;
      align-items: end;
    }
    .signature { text-align: center; }
    .signature-line {
      border-top: 1px solid #94a3b8;
      width: 180px;
      margin: 8px auto 0;
      padding-top: 8px;
    }
    .signature-name { font-weight: 700; font-size: 13px; margin: 0; }
    .signature-title { font-size: 11px; color: #64748b; margin: 2px 0 0; }
    .seal {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: 2px solid ${CYAN};
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 8px auto 0;
      font-size: 10px;
      font-weight: 700;
      color: ${CYAN};
    }
    .page-footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 10px;
      color: #64748b;
      text-align: center;
    }
    @media print {
      body { padding: 0; background: #fff; }
      .page { border-width: 2px; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>
    <div class="inner">
      <div class="header">
        <div class="brand-row">
          ${logo}
          <div>
            <p class="brand-label">${BRAND.name}</p>
            <p class="brand-name">${BRAND.programName}</p>
          </div>
        </div>
        <div class="meta">
          <p style="margin:0;">Credential ID</p>
          <p class="meta-id">${credentialId}</p>
          <p style="margin:8px 0 0;">${issueDate}</p>
        </div>
      </div>
      <div class="title-block">
        <h1>${title}</h1>
        ${subtitle ? `<p>${subtitle}</p>` : ''}
      </div>
      <div class="body">${bodyHtml}</div>
      <div class="footer-row">
        <div style="text-align:center;">${qr}</div>
        <div class="signature">
          <div class="signature-line">
            <p class="signature-name">${signatoryName}</p>
            <p class="signature-title">${signatoryTitle}</p>
          </div>
        </div>
        <div style="text-align:center;">
          <p style="font-size:11px;font-weight:700;color:#334155;margin:0;">Official Seal</p>
          <div class="seal">VERIFIED</div>
        </div>
      </div>
      <div class="page-footer">${BRAND.name} · Verify at program portal</div>
    </div>
  </div>
</body>
</html>`;
}

export function triggerHtmlDownload(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export async function downloadCertificateDocument(
  options: Omit<CertificateTemplateOptions, 'logoDataUrl'>,
) {
  const logoDataUrl = await fetchLogoDataUrl();
  const html = buildCertificateHtml({ ...options, logoDataUrl });
  triggerHtmlDownload(html, options.credentialId);
}

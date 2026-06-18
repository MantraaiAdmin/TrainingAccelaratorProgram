import { BRAND } from '@/lib/branding';

export interface CertificateDownloadData {
  certificateId: string;
  studentName: string;
  trackName: string;
  programName?: string;
  issuedAt: string;
  qrCodeData?: string;
}

export function downloadCertificateHtml(cert: CertificateDownloadData) {
  const issued = new Date(cert.issuedAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const program = cert.programName || BRAND.programName;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${cert.certificateId} — ${BRAND.name}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; padding: 40px; border: 8px solid #7c3aed; }
    h1 { color: #7c3aed; margin-bottom: 8px; }
    .meta { color: #555; line-height: 1.8; }
    .qr { margin-top: 24px; }
  </style>
</head>
<body>
  <h1>Certificate of Completion</h1>
  <p class="meta"><strong>${BRAND.name}</strong> · ${program}</p>
  <p>This certifies that</p>
  <h2>${cert.studentName}</h2>
  <p>has successfully completed</p>
  <h3>${cert.trackName}</h3>
  <p class="meta">Certificate ID: ${cert.certificateId}<br/>Issued: ${issued}</p>
  ${cert.qrCodeData ? `<div class="qr"><img src="${cert.qrCodeData}" alt="Verification QR" width="120" height="120" /></div>` : ''}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${cert.certificateId}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

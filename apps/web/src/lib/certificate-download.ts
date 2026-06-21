import { BRAND } from '@/lib/branding';
import { CERT_SIGNATORY, downloadCertificateDocument } from '@/lib/certificate-template';

export interface CertificateDownloadData {
  certificateId: string;
  studentName: string;
  trackName: string;
  programName?: string;
  issuedAt: string;
  qrCodeData?: string;
}

export async function downloadCertificateHtml(cert: CertificateDownloadData) {
  const issued = new Date(cert.issuedAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const program = cert.programName || BRAND.programName;

  const bodyHtml = `
    <div style="text-align:center;">
      <p style="font-size:13px;color:#64748b;margin:0 0 12px;">This is to certify that</p>
      <p style="font-size:32px;font-weight:700;color:#0f172a;margin:0 0 12px;">${cert.studentName}</p>
      <p style="font-size:13px;color:#64748b;margin:0 0 12px;">has successfully completed</p>
      <p style="font-size:20px;font-weight:700;color:${'#0891B2'};margin:0 0 16px;">${cert.trackName}</p>
      <p style="font-size:13px;color:#64748b;margin:0;">${program}</p>
      <p style="font-size:12px;color:#64748b;margin:16px 0 0;">Issued: ${issued}</p>
    </div>`;

  await downloadCertificateDocument({
    title: 'Certificate of Completion',
    subtitle: `${BRAND.name} · ${program}`,
    bodyHtml,
    credentialId: cert.certificateId,
    issueDate: issued,
    qrCodeData: cert.qrCodeData,
    signatoryName: CERT_SIGNATORY.name,
    signatoryTitle: CERT_SIGNATORY.title,
  });
}

import { SampleCredentialFrame, SampleQrPlaceholder, SignatureBlock, CERT_SIGNATORY } from './sample-credential-frame';

const SAMPLE = {
  studentName: 'Priya Sharma',
  college: 'SRM Institute of Science & Technology',
  department: 'Computer Science & Engineering',
  year: '3rd Year',
  track: 'Foundation Track: Python, Data & AI',
  duration: '10 Weeks (Mantra AI Talent Accelerator Internship Program)',
  issueDate: '14 June 2026',
  credentialId: 'MAN-INT-COMP-2026-SAMPLE',
};

const BODY_HTML = `
  <div style="text-align:center;">
    <p style="font-size:13px;color:#64748b;">This is to certify that</p>
    <p style="font-size:32px;font-weight:700;color:#0f172a;margin:12px 0;">${SAMPLE.studentName}</p>
    <p style="font-size:13px;color:#64748b;max-width:520px;margin:0 auto;">
      student of <strong>${SAMPLE.college}</strong>, ${SAMPLE.department} (${SAMPLE.year}),
      has successfully completed the
    </p>
    <p style="font-size:18px;font-weight:700;color:#0891B2;margin:12px 0;">${SAMPLE.track}</p>
    <p style="font-size:13px;color:#64748b;">${SAMPLE.duration}</p>
    <p style="font-size:13px;color:#64748b;max-width:560px;margin:12px auto 0;">
      including live coding labs, weekly assessments, capstone project,
      interview preparation modules, and platform-verified progress tracking.
    </p>
  </div>`;

export function InternshipCompletionSample() {
  return (
    <SampleCredentialFrame
      title="Certificate of Internship Course Completion"
      subtitle="This certifies successful completion of the Mantra.ai internship program"
      meta={{ credentialId: SAMPLE.credentialId, issueDate: SAMPLE.issueDate }}
      bodyHtmlForDownload={BODY_HTML}
    >
      <div className="text-center space-y-4 font-serif">
        <p className="text-sm text-slate-600">This is to certify that</p>
        <p className="text-3xl font-bold text-slate-900">{SAMPLE.studentName}</p>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          student of <strong>{SAMPLE.college}</strong>, {SAMPLE.department} ({SAMPLE.year}),
          has successfully completed the
        </p>
        <p className="text-lg font-semibold text-cyan-700">{SAMPLE.track}</p>
        <p className="text-sm text-slate-600">{SAMPLE.duration}</p>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          including live coding labs, weekly assessments, capstone project,
          interview preparation modules, and platform-verified progress tracking.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
        <SampleQrPlaceholder />
        <SignatureBlock name={CERT_SIGNATORY.name} title={CERT_SIGNATORY.title} />
        <div className="text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Official Seal</p>
          <div className="w-16 h-16 rounded-full border-2 border-cyan-600 mx-auto mt-2 flex items-center justify-center text-cyan-700 font-bold text-[10px]">
            VERIFIED
          </div>
        </div>
      </div>
    </SampleCredentialFrame>
  );
}

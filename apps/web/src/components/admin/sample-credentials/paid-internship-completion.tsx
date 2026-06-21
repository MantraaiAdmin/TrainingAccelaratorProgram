import { SampleCredentialFrame, SampleQrPlaceholder, SignatureBlock, CERT_SIGNATORY } from './sample-credential-frame';

const SAMPLE = {
  studentName: 'Priya Sharma',
  college: 'SRM Institute of Science & Technology',
  role: 'Engineering Intern',
  department: 'Product Engineering · AI Systems',
  period: 'July 2026 – September 2026 (12 Weeks)',
  project: 'RAG-powered learning assistant & analytics pipeline',
  issueDate: '14 June 2026',
  credentialId: 'MAN-INT-2026-SAMPLE',
};

const BODY_HTML = `
  <div style="text-align:center;">
    <p style="font-size:13px;color:#64748b;">This certifies that</p>
    <p style="font-size:32px;font-weight:700;color:#0f172a;margin:12px 0;">${SAMPLE.studentName}</p>
    <p style="font-size:13px;color:#64748b;">
      from <strong>${SAMPLE.college}</strong>, successfully completed a
    </p>
    <p style="font-size:20px;font-weight:700;color:#0891B2;margin:12px 0;">${SAMPLE.role}</p>
    <p style="font-size:13px;color:#64748b;">${SAMPLE.department}</p>
    <div style="background:linear-gradient(to right,#f8fafc,#ecfeff);border:1px solid #a5f3fc;border-radius:8px;padding:20px;max-width:480px;margin:16px auto;text-align:left;font-size:13px;">
      <p><span style="color:#64748b;">Internship Period:</span> ${SAMPLE.period}</p>
      <p><span style="color:#64748b;">Primary Project:</span> ${SAMPLE.project}</p>
      <p><span style="color:#64748b;">Selection:</span> Top 5% · Hackathon & leaderboard performance</p>
    </div>
    <p style="font-size:13px;color:#64748b;max-width:560px;margin:0 auto;">
      During this internship, ${SAMPLE.studentName.split(' ')[0]} contributed to production
      AI features, participated in code reviews, followed agile delivery practices, and
      demonstrated readiness for full-time engineering roles.
    </p>
  </div>`;

export function PaidInternshipCompletionSample() {
  return (
    <SampleCredentialFrame
      title="Internship Completion Certificate"
      subtitle="Issued by Mantra.ai · Top Performer Program"
      meta={{ credentialId: SAMPLE.credentialId, issueDate: SAMPLE.issueDate }}
      bodyHtmlForDownload={BODY_HTML}
    >
      <div className="text-center space-y-4 font-serif">
        <p className="text-sm text-slate-600">This certifies that</p>
        <p className="text-3xl font-bold text-slate-900">{SAMPLE.studentName}</p>
        <p className="text-sm text-slate-600">
          from <strong>{SAMPLE.college}</strong>, successfully completed a
        </p>
        <p className="text-xl font-semibold text-cyan-700">{SAMPLE.role}</p>
        <p className="text-sm text-slate-600">{SAMPLE.department}</p>

        <div className="bg-gradient-to-r from-slate-50 to-cyan-50 border border-cyan-200 rounded-lg p-5 max-w-lg mx-auto text-sm text-left space-y-2">
          <p><span className="text-slate-500">Internship Period:</span> {SAMPLE.period}</p>
          <p><span className="text-slate-500">Primary Project:</span> {SAMPLE.project}</p>
          <p><span className="text-slate-500">Selection:</span> Top 5% · Hackathon & leaderboard performance</p>
        </div>

        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          During this internship, {SAMPLE.studentName.split(' ')[0]} contributed to production
          AI features, participated in code reviews, followed agile delivery practices, and
          demonstrated readiness for full-time engineering roles.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
        <SampleQrPlaceholder label="Internship verify" />
        <SignatureBlock name={CERT_SIGNATORY.name} title={CERT_SIGNATORY.title} />
        <div className="text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Official Seal</p>
          <div className="w-16 h-16 rounded-full border-2 border-indigo-600 mx-auto mt-2 flex items-center justify-center text-indigo-700 font-bold text-[10px] leading-tight px-1">
            VERIFIED
          </div>
        </div>
      </div>
    </SampleCredentialFrame>
  );
}

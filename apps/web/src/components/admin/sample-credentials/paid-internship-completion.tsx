import { SampleCredentialFrame, SampleQrPlaceholder, SignatureBlock } from './sample-credential-frame';

const SAMPLE = {
  studentName: 'Priya Sharma',
  college: 'SRM Institute of Science & Technology',
  role: 'AI Engineering Intern',
  department: 'Product Engineering · AI Systems',
  period: 'July 2026 – September 2026 (12 Weeks)',
  stipend: '₹8,000 / month (Performance-Based)',
  project: 'RAG-powered learning assistant & analytics pipeline',
  issueDate: '14 June 2026',
  credentialId: 'AING-PAID-INT-2026-SAMPLE',
};

export function PaidInternshipCompletionSample() {
  return (
    <SampleCredentialFrame
      title="Paid Internship Completion Certificate"
      subtitle="Issued by the Company · Top Performer Program"
      meta={{ credentialId: SAMPLE.credentialId, issueDate: SAMPLE.issueDate }}
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
          <p><span className="text-slate-500">Stipend:</span> <strong>{SAMPLE.stipend}</strong></p>
          <p><span className="text-slate-500">Primary Project:</span> {SAMPLE.project}</p>
          <p><span className="text-slate-500">Selection:</span> Top 5% · Hackathon & leaderboard performance</p>
        </div>

        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          During this paid internship, {SAMPLE.studentName.split(' ')[0]} contributed to production
          AI features, participated in code reviews, followed agile delivery practices, and
          demonstrated readiness for full-time engineering roles.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
        <SampleQrPlaceholder label="Internship verify" />
        <SignatureBlock name="Praveen Manoharan" title="Engineering Lead · AI NextGen" />
        <div className="text-center text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Company Seal</p>
          <div className="w-16 h-16 rounded-full border-2 border-indigo-600 mx-auto mt-2 flex items-center justify-center text-indigo-700 font-bold text-[9px] leading-tight px-1">
            PAID INTERN
          </div>
        </div>
      </div>
    </SampleCredentialFrame>
  );
}

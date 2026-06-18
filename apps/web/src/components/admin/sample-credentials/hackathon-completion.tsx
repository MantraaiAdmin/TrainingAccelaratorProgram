import { SampleCredentialFrame, SampleQrPlaceholder, SignatureBlock } from './sample-credential-frame';

const SAMPLE = {
  studentName: 'Priya Sharma',
  college: 'SRM Institute of Science & Technology',
  event: 'AI NextGen Industry Hackathon 2026',
  theme: 'Build Intelligent Solutions for Campus & Enterprise',
  team: 'Team Constellation',
  placement: '2nd Place · AI Engineering Track',
  issueDate: '14 June 2026',
  credentialId: 'AING-HACK-2026-SAMPLE',
};

export function HackathonCompletionSample() {
  return (
    <SampleCredentialFrame
      title="Hackathon Completion Certificate"
      subtitle="End-of-Program Industry Hackathon · Partner Colleges"
      meta={{ credentialId: SAMPLE.credentialId, issueDate: SAMPLE.issueDate }}
    >
      <div className="text-center space-y-4 font-serif">
        <p className="text-sm text-slate-600">Presented to</p>
        <p className="text-3xl font-bold text-slate-900">{SAMPLE.studentName}</p>
        <p className="text-sm text-slate-600">
          representing <strong>{SAMPLE.college}</strong>
        </p>
        <p className="text-base text-slate-700 max-w-lg mx-auto">
          For outstanding participation and performance in
        </p>
        <p className="text-xl font-semibold text-cyan-700">{SAMPLE.event}</p>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-w-md mx-auto text-sm text-left space-y-1">
          <p><span className="text-slate-500">Theme:</span> {SAMPLE.theme}</p>
          <p><span className="text-slate-500">Team:</span> {SAMPLE.team}</p>
          <p><span className="text-slate-500">Result:</span> <strong>{SAMPLE.placement}</strong></p>
        </div>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Judged on code quality, innovation, technical architecture, demo presentation,
          and real-world applicability of the solution built during the 48-hour hackathon.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
        <SampleQrPlaceholder label="Hackathon verify" />
        <SignatureBlock name="Praveen Manoharan" title="Hackathon Chair · AI NextGen" />
        <div className="text-center">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Top Performer</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">★ ★ ★</p>
          <p className="text-xs text-slate-500 mt-1">Eligible for paid internship pathway</p>
        </div>
      </div>
    </SampleCredentialFrame>
  );
}

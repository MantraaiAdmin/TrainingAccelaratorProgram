import { SampleCredentialFrame, SampleQrPlaceholder, SignatureBlock, CERT_SIGNATORY } from './sample-credential-frame';

const SAMPLE = {
  studentName: 'Priya Sharma',
  college: 'SRM Institute of Science & Technology',
  event: 'Mantra.ai Industry Hackathon 2026',
  theme: 'Build Intelligent Solutions for Campus & Enterprise',
  team: 'Team Mantra',
  placement: '2nd Place · Engineering Track',
  issueDate: '14 June 2026',
  credentialId: 'MAN-HACK-2026-SAMPLE',
};

const BODY_HTML = `
  <div style="text-align:center;">
    <p style="font-size:13px;color:#64748b;">Presented to</p>
    <p style="font-size:32px;font-weight:700;color:#0f172a;margin:12px 0;">${SAMPLE.studentName}</p>
    <p style="font-size:13px;color:#64748b;">representing <strong>${SAMPLE.college}</strong></p>
    <p style="font-size:14px;color:#334155;max-width:520px;margin:12px auto;">
      For outstanding participation and performance in
    </p>
    <p style="font-size:20px;font-weight:700;color:#0891B2;margin:12px 0;">${SAMPLE.event}</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;max-width:420px;margin:0 auto;text-align:left;font-size:13px;">
      <p><span style="color:#64748b;">Theme:</span> ${SAMPLE.theme}</p>
      <p><span style="color:#64748b;">Team:</span> ${SAMPLE.team}</p>
      <p><span style="color:#64748b;">Result:</span> <strong>${SAMPLE.placement}</strong></p>
    </div>
    <p style="font-size:13px;color:#64748b;max-width:560px;margin:16px auto 0;">
      Judged on code quality, innovation, technical architecture, demo presentation,
      and real-world applicability of the solution built during the 48-hour hackathon.
    </p>
  </div>`;

export function HackathonCompletionSample() {
  return (
    <SampleCredentialFrame
      title="Hackathon Completion Certificate"
      subtitle="End-of-Program Industry Hackathon · Partner Colleges"
      meta={{ credentialId: SAMPLE.credentialId, issueDate: SAMPLE.issueDate }}
      bodyHtmlForDownload={BODY_HTML}
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
        <SignatureBlock name={CERT_SIGNATORY.name} title={CERT_SIGNATORY.title} />
        <div className="text-center">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Top Performer</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">★ ★ ★</p>
        </div>
      </div>
    </SampleCredentialFrame>
  );
}

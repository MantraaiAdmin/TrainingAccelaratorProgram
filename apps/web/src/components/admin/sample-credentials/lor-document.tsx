import { SampleCredentialFrame, SignatureBlock, CERT_SIGNATORY } from './sample-credential-frame';

const SAMPLE = {
  studentName: 'Priya Sharma',
  college: 'SRM Institute of Science & Technology',
  track: 'Foundation Track: Python, Data & AI',
  issueDate: '14 June 2026',
  credentialId: 'MAN-LOR-2026-SAMPLE',
  rank: 'Top 10% of cohort',
  quizAvg: '92%',
  capstone: 'Document Intelligence RAG Platform',
};

const BODY_HTML = `
  <div style="font-size:14px;line-height:1.7;color:#334155;">
    <p>To Whom It May Concern,</p>
    <p>
      I am pleased to recommend <strong>${SAMPLE.studentName}</strong>, a student at
      <strong>${SAMPLE.college}</strong>, who completed the
      <strong>Mantra.ai Internship Program</strong> — <em>${SAMPLE.track}</em> track —
      under our structured curriculum.
    </p>
    <p>
      During the program, ${SAMPLE.studentName.split(' ')[0]} demonstrated exceptional
      consistency and technical depth. Key highlights:
    </p>
    <ul>
      <li>Cohort performance: ${SAMPLE.rank} · average quiz score ${SAMPLE.quizAvg}</li>
      <li>Capstone project: &ldquo;${SAMPLE.capstone}&rdquo; — deployed with GitHub portfolio</li>
      <li>Strong grasp of Python engineering, APIs, data foundations, and AI-ready workflows</li>
      <li>Professional communication in weekly live mentor sessions and interview prep modules</li>
    </ul>
    <p>
      I confidently recommend ${SAMPLE.studentName.split(' ')[0]} for internship and entry-level
      engineering roles. They combine practical project experience with the discipline
      required to contribute from day one in a product engineering team.
    </p>
    <p>
      Please feel free to contact our program office to verify this letter using credential ID
      <span style="font-family:monospace;font-size:12px;"> ${SAMPLE.credentialId}</span>.
    </p>
    <p>Sincerely,</p>
  </div>`;

export function LetterOfRecommendationSample() {
  return (
    <SampleCredentialFrame
      title="Letter of Recommendation"
      subtitle="Mantra.ai Internship Program · Merit-Based Recognition"
      meta={{ credentialId: SAMPLE.credentialId, issueDate: SAMPLE.issueDate }}
      variant="letter"
      bodyHtmlForDownload={BODY_HTML}
    >
      <div className="space-y-4 text-sm leading-relaxed text-slate-700 font-serif">
        <p>To Whom It May Concern,</p>
        <p>
          I am pleased to recommend <strong>{SAMPLE.studentName}</strong>, a student at{' '}
          <strong>{SAMPLE.college}</strong>, who completed the{' '}
          <strong>Mantra.ai Internship Program</strong> —{' '}
          <em>{SAMPLE.track}</em> track — under our structured curriculum.
        </p>
        <p>
          During the program, {SAMPLE.studentName.split(' ')[0]} demonstrated exceptional
          consistency and technical depth. Key highlights:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Cohort performance: {SAMPLE.rank} · average quiz score {SAMPLE.quizAvg}</li>
          <li>Capstone project: &ldquo;{SAMPLE.capstone}&rdquo; — deployed with GitHub portfolio</li>
          <li>Strong grasp of Python engineering, APIs, data foundations, and AI-ready workflows</li>
          <li>Professional communication in weekly live mentor sessions and interview prep modules</li>
        </ul>
        <p>
          I confidently recommend {SAMPLE.studentName.split(' ')[0]} for internship and entry-level
          engineering roles. They combine practical project experience with the discipline
          required to contribute from day one in a product engineering team.
        </p>
        <p>
          Please feel free to contact our program office to verify this letter using credential ID{' '}
          <span className="font-mono text-xs">{SAMPLE.credentialId}</span>.
        </p>
        <p>Sincerely,</p>
      </div>

      <div className="mt-10">
        <SignatureBlock name={CERT_SIGNATORY.name} title={CERT_SIGNATORY.title} />
        <p className="text-xs text-slate-500 text-center mt-4">Mantra.ai Internship Program</p>
      </div>
    </SampleCredentialFrame>
  );
}

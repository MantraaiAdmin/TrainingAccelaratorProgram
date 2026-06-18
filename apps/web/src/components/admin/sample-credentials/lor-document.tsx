import { SampleCredentialFrame, SignatureBlock } from './sample-credential-frame';

const SAMPLE = {
  studentName: 'Priya Sharma',
  college: 'SRM Institute of Science & Technology',
  track: 'AI Engineering & Intelligent Systems',
  issueDate: '14 June 2026',
  credentialId: 'AING-LOR-2026-SAMPLE',
  rank: 'Top 10% of cohort',
  quizAvg: '92%',
  capstone: 'Document Intelligence RAG Platform',
};

export function LetterOfRecommendationSample() {
  return (
    <SampleCredentialFrame
      title="Letter of Recommendation"
      subtitle="Internship Program · Merit-Based Recognition"
      meta={{ credentialId: SAMPLE.credentialId, issueDate: SAMPLE.issueDate }}
      variant="letter"
    >
      <div className="space-y-4 text-sm leading-relaxed text-slate-700 font-serif">
        <p>To Whom It May Concern,</p>
        <p>
          I am pleased to recommend <strong>{SAMPLE.studentName}</strong>, a student at{' '}
          <strong>{SAMPLE.college}</strong>, who completed the{' '}
          <strong>AI NextGen Industry Readiness Internship Program</strong> —{' '}
          <em>{SAMPLE.track}</em> track — under our structured 8-week curriculum.
        </p>
        <p>
          During the program, {SAMPLE.studentName.split(' ')[0]} demonstrated exceptional
          consistency and technical depth. Key highlights:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Cohort performance: {SAMPLE.rank} · average quiz score {SAMPLE.quizAvg}</li>
          <li>Capstone project: &ldquo;{SAMPLE.capstone}&rdquo; — deployed with GitHub portfolio</li>
          <li>Strong grasp of LLMs, RAG pipelines, API integration, and production AI workflows</li>
          <li>Professional communication in weekly live mentor sessions and interview prep modules</li>
        </ul>
        <p>
          I confidently recommend {SAMPLE.studentName.split(' ')[0]} for internship and entry-level
          AI engineering roles. They combine practical project experience with the discipline
          required to contribute from day one in a product engineering team.
        </p>
        <p>
          Please feel free to contact our program office to verify this letter using credential ID{' '}
          <span className="font-mono text-xs">{SAMPLE.credentialId}</span>.
        </p>
        <p>Sincerely,</p>
      </div>

      <div className="mt-10">
        <SignatureBlock name="Praveen Manoharan" title="Program Lead · AI NextGen Industry Readiness" />
        <p className="text-xs text-slate-500 text-center mt-4">
          AI NextGen Industry Readiness Internship Program
        </p>
      </div>
    </SampleCredentialFrame>
  );
}

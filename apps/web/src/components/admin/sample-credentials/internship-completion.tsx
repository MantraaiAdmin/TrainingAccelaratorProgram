import { SampleCredentialFrame, SampleQrPlaceholder, SignatureBlock } from './sample-credential-frame';

const SAMPLE = {
  studentName: 'Priya Sharma',
  college: 'SRM Institute of Science & Technology',
  department: 'Computer Science & Engineering',
  year: '3rd Year',
  track: 'AI Engineering & Intelligent Systems',
  duration: '8 Weeks (Industry Readiness Internship)',
  issueDate: '14 June 2026',
  credentialId: 'AING-INT-COMP-2026-SAMPLE',
};

export function InternshipCompletionSample() {
  return (
    <SampleCredentialFrame
      title="Certificate of Internship Course Completion"
      subtitle="This certifies successful completion of the industry-aligned internship program"
      meta={{ credentialId: SAMPLE.credentialId, issueDate: SAMPLE.issueDate }}
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
          including live coding labs, weekly assessments (80% pass), capstone project,
          interview preparation modules, and platform-verified progress tracking.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
        <SampleQrPlaceholder />
        <SignatureBlock name="Praveen Manoharan" title="Program Director · AI NextGen" />
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

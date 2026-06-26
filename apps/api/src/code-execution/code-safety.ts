const BLOCKED_PATTERNS: RegExp[] = [
  /\bimport\s+os\b/i,
  /\bfrom\s+os\b/i,
  /\bimport\s+subprocess\b/i,
  /\bfrom\s+subprocess\b/i,
  /\bimport\s+socket\b/i,
  /\bfrom\s+socket\b/i,
  /\bimport\s+shutil\b/i,
  /\bfrom\s+shutil\b/i,
  /\bimport\s+sys\b/i,
  /\bfrom\s+sys\b/i,
  /\bimport\s+ctypes\b/i,
  /\bfrom\s+ctypes\b/i,
  /\bimport\s+multiprocessing\b/i,
  /\bfrom\s+multiprocessing\b/i,
  /\bimport\s+pickle\b/i,
  /\bfrom\s+pickle\b/i,
  /\bimport\s+pty\b/i,
  /\bfrom\s+pty\b/i,
  /\bimport\s+signal\b/i,
  /\bfrom\s+signal\b/i,
  /\b__import__\s*\(/,
  /\bopen\s*\(/,
  /\bexec\s*\(/,
  /\beval\s*\(/,
  /\bcompile\s*\(/,
  /\bbreakpoint\s*\(/,
  /\bos\s*\.\s*system\b/i,
  /\bos\s*\.\s*popen\b/i,
  /\bsubprocess\s*\./i,
];

export function assertSafePythonCode(code: string): void {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(code)) {
      throw new Error('Code uses restricted operations and cannot be executed');
    }
  }
}

import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTimeMs?: number;
  testResults?: Array<{
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput?: string;
    error?: string;
  }>;
  passed?: number;
  total?: number;
}

@Injectable()
export class CodeExecutionService {
  private timeout = parseInt(process.env.CODE_EXECUTION_TIMEOUT || '10000', 10);
  private useDocker = process.env.USE_DOCKER_SANDBOX === 'true';

  async runCode(code: string, input?: string): Promise<ExecutionResult> {
    const start = Date.now();
    try {
      const output = await this.executePython(code, input);
      return {
        success: true,
        output: output.trim(),
        executionTimeMs: Date.now() - start,
      };
    } catch (err) {
      const error = err as { stderr?: string; message?: string };
      return {
        success: false,
        error: error.stderr || error.message || 'Execution failed',
        executionTimeMs: Date.now() - start,
      };
    }
  }

  async submitSolution(
    code: string,
    testCases: TestCase[],
    hiddenOnly = false,
  ): Promise<ExecutionResult> {
    const start = Date.now();
    const cases = hiddenOnly ? testCases.filter((t) => t.isHidden) : testCases;
    const results = [];
    let passed = 0;

    for (const tc of cases) {
      try {
        const output = await this.executePython(code, tc.input);
        const actual = output.trim();
        const expected = tc.expectedOutput.trim();
        const isPassed = actual === expected;
        if (isPassed) passed++;
        results.push({
          passed: isPassed,
          input: tc.input,
          expectedOutput: expected,
          actualOutput: tc.isHidden ? undefined : actual,
        });
      } catch (err) {
        const error = err as { stderr?: string; message?: string };
        results.push({
          passed: false,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          error: error.stderr || error.message,
        });
      }
    }

    return {
      success: passed === cases.length,
      testResults: results,
      passed,
      total: cases.length,
      executionTimeMs: Date.now() - start,
    };
  }

  private async executePython(code: string, input?: string): Promise<string> {
    if (this.useDocker) {
      return this.executeInDocker(code, input);
    }
    return this.executeLocally(code, input);
  }

  private async executeLocally(code: string, input?: string): Promise<string> {
    const tmpDir = path.join(os.tmpdir(), `constel-${uuidv4()}`);
    await fs.mkdir(tmpDir, { recursive: true });
    const scriptPath = path.join(tmpDir, 'solution.py');

    try {
      await fs.writeFile(scriptPath, code);
      const inputRedirect = input ? `echo ${JSON.stringify(input)} | ` : '';
      const { stdout, stderr } = await execAsync(
        `${inputRedirect}python3 "${scriptPath}"`,
        { timeout: this.timeout, maxBuffer: 1024 * 1024 },
      );
      if (stderr && !stdout) throw new Error(stderr);
      return stdout;
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  private async executeInDocker(code: string, input?: string): Promise<string> {
    const tmpDir = path.join(os.tmpdir(), `constel-${uuidv4()}`);
    await fs.mkdir(tmpDir, { recursive: true });
    const scriptPath = path.join(tmpDir, 'solution.py');

    try {
      await fs.writeFile(scriptPath, code);
      const memory = process.env.CODE_EXECUTION_MEMORY || '128m';
      const dockerCmd = input
        ? `echo ${JSON.stringify(input)} | docker run --rm -i --memory=${memory} --network=none -v "${tmpDir}:/code:ro" constel-python-sandbox:latest python /code/solution.py`
        : `docker run --rm --memory=${memory} --network=none -v "${tmpDir}:/code:ro" constel-python-sandbox:latest python /code/solution.py`;

      const { stdout, stderr } = await execAsync(dockerCmd, {
        timeout: this.timeout,
        maxBuffer: 1024 * 1024,
      });
      if (stderr && !stdout) throw new Error(stderr);
      return stdout;
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}

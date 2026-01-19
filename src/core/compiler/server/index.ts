'use server'

import { Sandbox } from '@e2b/code-interpreter'

export type ProjectFile = { path: string; content: string }

export type ExecutionResult = {
  stdout: string
  stderr: string
  error?: string
}

/**
 * Execute a single Python code snippet
 */
export const compileCode = async (code: string): Promise<ExecutionResult> => {
  const sbx = await Sandbox.create()

  try {
    const execution = await sbx.runCode(code)

    return {
      stdout: execution.logs.stdout.join('\n'),
      stderr: execution.logs.stderr.join('\n'),
      error: execution.error?.value || undefined,
    }
  } catch (error) {
    return {
      stdout: '',
      stderr: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  } finally {
    await sbx.kill()
  }
}

/**
 * Execute a Python project with multiple files
 */
export const compileProject = async (
  files: ProjectFile[],
  entryPoint = 'main.py'
): Promise<ExecutionResult> => {
  const sbx = await Sandbox.create()

  try {
    // Write all files to the sandbox
    await sbx.files.write(
      files.map((file) => ({
        path: file.path,
        data: file.content,
      }))
    )

    // Find the entry point file path
    const entryFile = files.find((f) => f.path.endsWith(entryPoint))

    if (!entryFile) {
      return {
        stdout: '',
        stderr: '',
        error: `Entry point ${entryPoint} not found in files`,
      }
    }

    // Execute the entry point file using absolute path
    const execution = await sbx.runCode(`
import subprocess
result = subprocess.run(['python', '${entryFile.path}'], capture_output=True, text=True, cwd='/home/user')
print(result.stdout)
if result.stderr:
    print(result.stderr, file=__import__('sys').stderr)
`)

    return {
      stdout: execution.logs.stdout.join('\n'),
      stderr: execution.logs.stderr.join('\n'),
    }
  } catch (error) {
    return {
      stdout: '',
      stderr: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  } finally {
    await sbx.kill()
  }
}

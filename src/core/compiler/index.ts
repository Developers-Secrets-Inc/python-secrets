import { compileCode as compileCodeServer, compileProject as compileProjectServer } from './server'
import { compileCode as compileCodeClient, compileProject as compileProjectClient } from './client'

export type ProjectFile = { path: string; content: string }

export type ExecutionResult = {
  stdout: string
  stderr: string
  error?: string
}

export type Compiler = 'server' | 'client'

/**
 * Execute a single Python code snippet
 * @param code - Python code to execute
 * @param compiler - 'server' for E2B, 'client' for Pyodide
 */
export async function compileCode(
  code: string,
  compiler: Compiler = 'client'
): Promise<ExecutionResult> {
  if (compiler === 'server') {
    return compileCodeServer(code)
  }
  return compileCodeClient(code)
}

/**
 * Execute a Python project with multiple files
 * @param files - Array of files to execute
 * @param entryPoint - Entry file name (default: 'main.py')
 * @param compiler - 'server' for E2B, 'client' for Pyodide
 */
export async function compileProject(
  files: ProjectFile[],
  entryPoint = 'main.py',
  compiler: Compiler = 'client'
): Promise<ExecutionResult> {
  if (compiler === 'server') {
    return compileProjectServer(files, entryPoint)
  }
  return compileProjectClient(files, entryPoint)
}

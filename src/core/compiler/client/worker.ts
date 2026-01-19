// Load pyodide.js in the worker context
// @ts-expect-error - importScripts is not in TS types but exists in workers
self.importScripts('https://cdn.jsdelivr.net/pyodide/v0.29.1/full/pyodide.js')

let pyodide: any = null
let initializing = false

// Initialize Pyodide once
async function getPyodide() {
  if (pyodide) return pyodide
  if (initializing) {
    // Wait for initialization to complete
    while (initializing) {
      await new Promise((resolve) => setTimeout(resolve, 10))
    }
    return pyodide
  }

  initializing = true
  // @ts-expect-error - loadPyodide is not defined on self in TS context, but it will be at runtime
  pyodide = await self.loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.1/full/',
  })
  initializing = false
  return pyodide
}

async function runCode(code: string) {
  const py = await getPyodide()

  // Redirect stdout and stderr to capture them
  await py.runPythonAsync(`
import sys
from io import StringIO

_old_stdout = sys.stdout
_old_stderr = sys.stderr
sys.stdout = StringIO()
sys.stderr = StringIO()
  `)

  let error: string | undefined
  try {
    await py.runPythonAsync(code)
  } catch (e: any) {
    error = e.message || String(e)
  }

  // Get captured output
  const stdout = await py.runPythonAsync('sys.stdout.getvalue()')
  const stderr = await py.runPythonAsync('sys.stderr.getvalue()')

  // Restore stdout and stderr
  await py.runPythonAsync(`
sys.stdout = _old_stdout
sys.stderr = _old_stderr
  `)

  return { stdout, stderr, error }
}

async function runProject(files: { path: string; content: string }[], entryPoint: string) {
  const py = await getPyodide()

  // Find the entry point file path
  const entryFile = files.find((f) => f.path.endsWith(entryPoint) || f.path === entryPoint)

  if (!entryFile) {
    return {
      stdout: '',
      stderr: '',
      error: `Entry point ${entryPoint} not found in files`,
    }
  }

  // Write all files to the virtual filesystem
  for (const file of files) {
    py.FS.writeFile(file.path, file.content, { encoding: 'utf8' })
  }

  // Redirect stdout and stderr
  await py.runPythonAsync(`
import sys
from io import StringIO
import os

_old_stdout = sys.stdout
_old_stderr = sys.stderr
sys.stdout = StringIO()
sys.stderr = StringIO()

# Change working directory to root for imports to work
os.chdir('/')
  `)

  let error: string | undefined
  try {
    // Execute the entry point file
    await py.runPythonAsync(`
with open('${entryFile.path}', 'r') as f:
    exec(f.read())
    `)
  } catch (e: any) {
    error = e.message || String(e)
  }

  // Get captured output
  const stdout = await py.runPythonAsync('sys.stdout.getvalue()')
  const stderr = await py.runPythonAsync('sys.stderr.getvalue()')

  // Restore stdout and stderr
  await py.runPythonAsync(`
sys.stdout = _old_stdout
sys.stderr = _old_stderr
  `)

  // Clean up files
  for (const file of files) {
    try {
      py.FS.unlink(file.path)
    } catch {
      // Ignore errors
    }
  }

  return { stdout, stderr, error }
}

// Message handler
self.onmessage = async (event: MessageEvent) => {
  const { id, type, code, files, entryPoint } = event.data

  try {
    let result
    if (type === 'code') {
      result = await runCode(code)
    } else if (type === 'project') {
      result = await runProject(files, entryPoint)
    } else {
      throw new Error('Unknown message type')
    }

    self.postMessage({ id, result })
  } catch (error: any) {
    self.postMessage({
      id,
      result: {
        stdout: '',
        stderr: '',
        error: error.message || 'Unknown error',
      },
    })
  }
}

export {}

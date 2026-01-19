export type ProjectFile = { path: string; content: string }

export type ExecutionResult = {
  stdout: string
  stderr: string
  error?: string
}

type WorkerMessage =
  | { id: number; type: 'code'; code: string }
  | { id: number; type: 'project'; files: ProjectFile[]; entryPoint: string }

type WorkerResponse = { id: number; result: ExecutionResult }

const isBrowser = typeof window !== 'undefined' && typeof Worker !== 'undefined'

// Lazy worker initialization
let worker: Worker | null = null
let messageId = 0
const pendingMessages = new Map<number, (result: ExecutionResult) => void>()

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module',
    })

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { id, result } = event.data
      const resolve = pendingMessages.get(id)
      if (resolve) {
        pendingMessages.delete(id)
        resolve(result)
      }
    }
  }
  return worker
}

function sendMessage(message: Omit<WorkerMessage, 'id'>): Promise<ExecutionResult> {
  if (!isBrowser) {
    return Promise.resolve({
      stdout: '',
      stderr: '',
      error: 'Python execution is only available in the browser',
    })
  }

  return new Promise((resolve, reject) => {
    const id = messageId++
    pendingMessages.set(id, resolve)

    const w = getWorker()
    w.postMessage({ id, ...message })

    // Timeout after 30 seconds
    setTimeout(() => {
      if (pendingMessages.has(id)) {
        pendingMessages.delete(id)
        reject(new Error('Execution timeout'))
      }
    }, 30000)
  })
}

/**
 * Execute a single Python code snippet in the browser
 */
export async function compileCode(code: string): Promise<ExecutionResult> {
  return sendMessage({ type: 'code', code })
}

/**
 * Execute a Python project with multiple files in the browser
 */
export async function compileProject(
  files: ProjectFile[],
  entryPoint = 'main.py'
): Promise<ExecutionResult> {
  return sendMessage({ type: 'project', files, entryPoint })
}

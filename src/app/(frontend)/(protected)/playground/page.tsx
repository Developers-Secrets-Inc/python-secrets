'use client'

import { useState } from 'react'
import { compileCode, compileProject, type Compiler } from '@/core/compiler'

export default function PlaygroundPage() {
  const [output, setOutput] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [compiler, setCompiler] = useState<Compiler>('client')

  const testSimpleCode = async () => {
    setLoading(true)
    setOutput('Running...')

    const result = await compileCode(
      `
print("Hello from ${compiler === 'client' ? 'Pyodide' : 'E2B'}!")
x = 10
y = 20
print(f"Sum: {x + y}")
for i in range(5):
    print(f"Count: {i}")
    `,
      compiler
    )

    setOutput(
      `STDOUT:\n${result.stdout}\n\nSTDERR:\n${result.stderr}\n\nERROR:\n${result.error || 'None'}`
    )
    setLoading(false)
  }

  const testProject = async () => {
    setLoading(true)
    setOutput('Running project...')

    const result = await compileProject(
      [
        {
          path: '/utils.py',
          content: `
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b
            `,
        },
        {
          path: '/main.py',
          content: `
from utils import add, multiply

print("Testing utilities module")
print(f"2 + 3 = {add(2, 3)}")
print(f"4 * 5 = {multiply(4, 5)}")

# Test with loop
for i in range(3):
    print(f"Iteration {i}: add({i}, {i+1}) = {add(i, i+1)}")
            `,
        },
      ],
      'main.py',
      compiler
    )

    setOutput(
      `STDOUT:\n${result.stdout}\n\nSTDERR:\n${result.stderr}\n\nERROR:\n${result.error || 'None'}`
    )
    setLoading(false)
  }

  const testWithError = async () => {
    setLoading(true)
    setOutput('Running code with error...')

    const result = await compileCode(
      `
print("Starting execution")
x = 10
y = 0
# This will cause an error
result = x / y
print(f"Result: {result}")
    `,
      compiler
    )

    setOutput(
      `STDOUT:\n${result.stdout}\n\nSTDERR:\n${result.stderr}\n\nERROR:\n${result.error || 'None'}`
    )
    setLoading(false)
  }

  const testMathFunctions = async () => {
    setLoading(true)
    setOutput('Running math functions...')

    const result = await compileCode(
      `
import math
import statistics

data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

print(f"Mean: {statistics.mean(data)}")
print(f"Median: {statistics.median(data)}")
print(f"Stdev: {statistics.stdev(data)}")
print(f"Square root of 2: {math.sqrt(2)}")
print(f"Pi: {math.pi}")
print(f"Sin(45°): {math.sin(math.radians(45))}")
    `,
      compiler
    )

    setOutput(
      `STDOUT:\n${result.stdout}\n\nSTDERR:\n${result.stderr}\n\nERROR:\n${result.error || 'None'}`
    )
    setLoading(false)
  }

  const testFileOperations = async () => {
    setLoading(true)
    setOutput('Running file operations...')

    const result = await compileProject(
      [
        {
          path: '/data.txt',
          content: `
Alice
Bob
Charlie
            `,
        },
        {
          path: '/reader.py',
          content: `
# Read and process file
with open('/data.txt', 'r') as f:
    lines = f.readlines()

print("Lines from file:")
for i, line in enumerate(lines, 1):
    print(f"{i}. {line.strip()}")

print(f"\\nTotal lines: {len(lines)}")
            `,
        },
      ],
      'reader.py',
      compiler
    )

    setOutput(
      `STDOUT:\n${result.stdout}\n\nSTDERR:\n${result.stderr}\n\nERROR:\n${result.error || 'None'}`
    )
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Python Compiler Playground</h1>

      <div className="mb-6">
        <span className="mr-4 font-semibold">Compiler:</span>
        <button
          onClick={() => setCompiler('server')}
          className={`px-4 py-2 rounded mr-2 ${compiler === 'server' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Server (E2B)
        </button>
        <button
          onClick={() => setCompiler('client')}
          className={`px-4 py-2 rounded ${compiler === 'client' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
        >
          Client (Pyodide)
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={testSimpleCode}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Simple Code
        </button>

        <button
          onClick={testProject}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Project (Multi-file)
        </button>

        <button
          onClick={testWithError}
          disabled={loading}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Test Error Handling
        </button>

        <button
          onClick={testMathFunctions}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Math Functions
        </button>

        <button
          onClick={testFileOperations}
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
        >
          Test File Operations
        </button>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">
          Output: {compiler === 'server' ? '(E2B Server)' : '(Pyodide Browser)'}
        </h2>
        <pre className="whitespace-pre-wrap font-mono text-sm">{output || 'No output yet'}</pre>
      </div>
    </div>
  )
}

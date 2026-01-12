export default function LessonDescriptionPage() {
  return (
    <>
      <h3 className="text-lg font-semibold mb-3">Exercise Instructions</h3>
      <p className="text-muted-foreground leading-relaxed">
        Implement a sorting function that minimizes memory swaps. You should focus on 
        the <strong>QuickSort</strong> algorithm and handle edge cases such as empty arrays 
        or arrays with duplicate values.
      </p>
      
      <ul className="list-disc ml-6 mt-4 space-y-2 text-muted-foreground">
        <li>Time Complexity goal: O(n log n)</li>
        <li>Space Complexity goal: O(log n)</li>
        <li>Ensure the implementation is stable.</li>
      </ul>

      <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-dashed text-xs text-muted-foreground">
        <strong>Tip:</strong> Use a pivot strategy like "median-of-three" to avoid worst-case 
        scenarios on already sorted data.
      </div>
    </>
  )
}
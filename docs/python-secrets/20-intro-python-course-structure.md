# Course Structure: Introduction to Python

## Course Overview

**Title:** Introduction to Python
**Level:** Beginner
**Duration:** 8-10 hours (self-paced)
**Structure:** 6 chapters, 36 lessons total
**Prerequisites:** None

**Learning Outcomes:**
By the end of this course, you will:
- Write and execute Python code confidently
- Understand variables, data types, and operators
- Control program flow with conditionals and loops
- Create reusable functions
- Work with lists and dictionaries
- Handle errors gracefully
- Read from and write to files
- Build a practical automation project

**Teaching Philosophy:**
- Short, focused lessons (5-10 minutes each)
- Learn by doing - code immediately after concept
- Interactive exercises after every lesson
- Real-world examples, not toy problems
- Build toward a final project

---

## Chapter 1: Welcome to Python (4 lessons)

### Lesson 1.1: What is Python and Why Learn It?
**Duration:** 5 min
**Type:** Theory + Demo

**Topics:**
- What is Python? (brief history, philosophy)
- Why Python is popular (versatility, beginner-friendly)
- What you can build with Python (web, data, automation, AI)
- Course overview and what you'll learn

**Demo:** Show a simple Python script running in the browser

**End with:** "Next: You'll write your first line of Python code in under 2 minutes"

---

### Lesson 1.2: Your First Python Program
**Duration:** 7 min
**Type:** Practice + Exercise

**Topics:**
- The interactive Python shell (in-browser)
- `print()` - your first function
- Your first program: "Hello, World!"
- Comments in Python (`#`)

**Practice Exercise:**
```python
# Task 1: Print your name
print("Your Name")

# Task 2: Print a fun message
print("I'm learning Python!")

# Task 3: Print multiple lines
print("Line 1")
print("Line 2")
```

**Quiz (3 questions):**
1. What function displays output in Python?
2. How do you write a comment?
3. What will `print("Hello" + "World")` output?

**End with:** "Next: Variables - how computers remember things"

---

### Lesson 1.3: Variables - Storing Information
**Duration:** 8 min
**Type:** Theory + Practice

**Topics:**
- What is a variable? (analogy: labeled box)
- Creating variables in Python
- Variable naming rules
- Reassigning variables
- `print()` with variables

**Examples:**
```python
name = "Alice"
age = 25
print(name)
print(age)

# Reassigning
age = 26
print(age)  # Now 26
```

**Practice Exercise:**
```python
# Create variables for:
# - Your favorite color
# - Your lucky number
# - Today's temperature

# Then print them all
```

**Quiz (4 questions):**
1. Which variable name is valid?
2. What happens when you reassign a variable?
3. Can a variable store different types over time?
4. What will `x = 5; x = 10; print(x)` output?

**End with:** "Next: Different types of data - numbers, text, and more"

---

### Lesson 1.4: Data Types - Numbers and Strings
**Duration:** 10 min
**Type:** Theory + Practice + Quiz

**Topics:**
- Basic data types: `int`, `float`, `str`, `bool`
- How to check type with `type()`
- String basics
- Boolean values (`True`, `False`)

**Examples:**
```python
# Numbers
age = 25           # int
price = 19.99      # float

# Text
name = "Alice"     # str
message = 'Hello'  # str (single quotes too)

# Boolean
is_student = True  # bool
has_job = False    # bool

# Check types
print(type(age))   # <class 'int'>
```

**Practice Exercise:**
```python
# Create variables with different types
# - Your age (int)
# - Price of coffee (float)
# - Your city (str)
# - Whether you like Python (bool)

# Print each one with its type
```

**Quiz (5 questions):**
1. What data type is `3.14`?
2. What data type is `"Hello"`?
3. What's the difference between `5` and `5.0`?
4. What does `type("hello")` return?
5. Is `True` a string or boolean?

**End with:** "Next: Do math with Python - operators and expressions"

---

## Chapter 2: Working with Data (6 lessons)

### Lesson 2.1: Arithmetic Operators
**Duration:** 8 min
**Type:** Practice + Exercise

**Topics:**
- Basic math: `+`, `-`, `*`, `/`
- Integer division `//` and modulus `%`
- Exponentiation `**`
- Operator precedence

**Examples:**
```python
# Basic operations
print(10 + 5)      # 15
print(10 - 3)      # 7
print(4 * 3)       # 12
print(10 / 3)      # 3.333...

# Integer division
print(10 // 3)     # 3 (no decimal)
print(10 % 3)      # 1 (remainder)

# Exponentiation
print(2 ** 3)      # 8 (2 × 2 × 2)

# With variables
price = 100
discount = 20
final_price = price - discount
print(final_price)  # 80
```

**Practice Exercise:**
```python
# Calculate:
# - Area of a rectangle (length × width)
# - How many hours in a year (365 × 24)
# - If you have 100 cookies and 3 friends, how many does each get? (use //)
# - What's the remainder? (use %)
```

**Quiz (4 questions):**
1. What's `10 // 3`?
2. What's `10 % 3`?
3. What's `2 ** 4`?
4. What's `5 + 3 * 2`? (precedence)

**End with:** "Next: Comparing values - making decisions starts here"

---

### Lesson 2.2: Comparison Operators
**Duration:** 7 min
**Type:** Theory + Practice

**Topics:**
- Comparison operators: `==`, `!=`, `<`, `>`, `<=`, `>=`
- Results are always `True` or `False`
- Comparing numbers and strings

**Examples:**
```python
# Numbers
print(5 > 3)        # True
print(5 == 5)       # True
print(5 != 3)       # True
print(10 <= 10)     # True

# Strings
print("apple" == "apple")  # True
print("Apple" == "apple")  # False (case-sensitive)

# With variables
age = 18
print(age >= 18)    # True (can vote!)
```

**Practice Exercise:**
```python
# Check if:
# - 100 is greater than 50
# - Your age is not equal to 100
# - "python" equals "Python"
# - 25 is less than or equal to 25

# Bonus: What happens when you compare strings?
print("apple" < "banana")  # Try it!
```

**Quiz (5 questions):**
1. What's `5 == 5`?
2. What's `5 != 5`?
3. What's `10 > 5`?
4. What's `10 <= 5`?
5. What's `"A" == "a"`?

**End with:** "Next: Combine conditions with logical operators"

---

### Lesson 2.3: Logical Operators
**Duration:** 8 min
**Type:** Theory + Practice

**Topics:**
- `and` - both must be True
- `or` - at least one must be True
- `not` - reverses the value
- Combining comparisons

**Examples:**
```python
# AND
age = 25
has_license = True
print(age >= 18 and has_license)  # True

# OR
is_weekend = True
is_holiday = False
print(is_weekend or is_holiday)    # True

# NOT
raining = True
print(not raining)                  # False

# Complex
age = 17
has_parent = True
print(age >= 18 or (age >= 16 and has_parent))  # True
```

**Practice Exercise:**
```python
# Check if a person can:
# - Drive: age >= 18 AND has_license
# - Get discount: age < 12 OR age > 65
# - Enter: NOT banned

# Test with different values
```

**Quiz (4 questions):**
1. What's `True and False`?
2. What's `True or False`?
3. What's `not True`?
4. What's `(5 > 3) and (10 < 20)`?

**End with:** "Next: Manipulate text with string operations"

---

### Lesson 2.4: String Operations
**Duration:** 10 min
**Type:** Practice + Exercise

**Topics:**
- String concatenation with `+`
- String repetition with `*`
- String length with `len()`
- String methods: `.upper()`, `.lower()`, `.title()`
- f-strings for formatting

**Examples:**
```python
# Concatenation
first = "John"
last = "Doe"
full = first + " " + last
print(full)  # John Doe

# Repetition
echo = "hello "
print(echo * 3)  # hello hello hello

# Length
name = "Python"
print(len(name))  # 6

# Methods
text = "hello world"
print(text.upper())      # HELLO WORLD
print(text.title())      # Hello World
print(text.lower())      # hello world

# f-strings (Python 3.6+)
name = "Alice"
age = 25
print(f"{name} is {age} years old")  # Alice is 25 years old
```

**Practice Exercise:**
```python
# Create a simple profile:
# - First name and last name (combine them)
# - Age
# - City
# Print a formatted sentence like:
# "John Doe, 30 years old, lives in Paris"

# Bonus: Make it ALL CAPS
```

**Quiz (5 questions):**
1. What's `"Py" + "thon"`?
2. What's `"ha" * 3`?
3. What's `len("Python")`?
4. What's `"hello".upper()`?
5. What's `f"{2} + {2} = {2+2}"`?

**End with:** "Next: Get user input and make your programs interactive"

---

### Lesson 2.5: User Input
**Duration:** 8 min
**Type:** Practice + Exercise

**Topics:**
- `input()` function
- Input is always a string
- Converting input: `int()`, `float()`
- Simple interactive programs

**Examples:**
```python
# Basic input
name = input("What's your name? ")
print(f"Hello, {name}!")

# Always a string
age = input("Your age? ")
print(type(age))  # <class 'str'>

# Converting
age = int(input("Your age? "))
print(f"In 10 years, you'll be {age + 10}")

# Number input
price = float(input("Price: $"))
tax = 0.1
total = price * (1 + tax)
print(f"Total: ${total:.2f}")
```

**Practice Exercise:**
```python
# Create a simple calculator:
# - Ask for two numbers
# - Ask for operation (+, -, *, /)
# - Print the result
# Bonus: Handle division by zero
```

**Quiz (3 questions):**
1. What's the type of `input()` result?
2. How do you convert "25" to a number?
3. What happens with `int("hello")`?

**End with:** "Next: Make decisions in your code with if statements"

---

### Lesson 2.6: Chapter Project - Simple Calculator
**Duration:** 10 min
**Type:** Project + Quiz

**Build:** A simple calculator that:
1. Asks for two numbers
2. Asks for an operation
3. Displays the result
4. Handles basic errors

**Starter Code:**
```python
print("=== Simple Calculator ===")

# Get input
num1 = float(input("First number: "))
op = input("Operation (+, -, *, /): ")
num2 = float(input("Second number: "))

# Your code here
# Calculate based on operation
# Print result nicely

# Challenge: Handle division by zero
```

**Quiz Summary (5 questions):**
Review: arithmetic, comparisons, logical operators, strings, input

**End with:** "Next: Control the flow of your program with if statements"

---

## Chapter 3: Control Flow (7 lessons)

### Lesson 3.1: If Statements
**Duration:** 10 min
**Type:** Theory + Practice

**Topics:**
- `if` statement syntax
- Indentation matters!
- `else` clause
- `elif` clause
- Nested if statements

**Examples:**
```python
# Basic if
age = 18
if age >= 18:
    print("You can vote")

# if-else
age = 15
if age >= 18:
    print("You can vote")
else:
    print("You can't vote yet")

# if-elif-else
score = 85
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"
print(f"Grade: {grade}")

# Nested
age = 25
has_license = True
if age >= 18:
    if has_license:
        print("Can drive")
    else:
        print("Get a license")
else:
    print("Too young to drive")
```

**Practice Exercise:**
```python
# Check a number:
# - If positive, print "Positive"
# - If negative, print "Negative"
# - If zero, print "Zero"

# Bonus: Check if it's even or odd
```

**Quiz (5 questions):**
1. What's the purpose of indentation?
2. Can you have multiple `elif` blocks?
3. Is `else` required?
4. What prints: `if False: print("A") else: print("B")`?
5. What's `elif` short for?

**End with:** "Next: Repeat code with loops - do things automatically"

---

### Lesson 3.2: While Loops
**Duration:** 8 min
**Type:** Theory + Practice

**Topics:**
- `while` loop syntax
- Loop condition
- Infinite loops (and how to avoid them)
- `break` to exit
- `continue` to skip

**Examples:**
```python
# Basic while
count = 0
while count < 5:
    print(count)
    count += 1  # Important: update!

# Sum user input until 0
total = 0
while True:
    num = int(input("Enter number (0 to stop): "))
    if num == 0:
        break
    total += num
print(f"Total: {total}")

# Continue
for i in range(10):
    if i % 2 == 0:
        continue  # Skip even numbers
    print(i)
```

**Practice Exercise:**
```python
# Guess the number game:
# - Computer picks random number (1-100)
# - User guesses
# - Say "too high" or "too low"
# - Count guesses

# Hint: import random; number = random.randint(1, 100)
```

**Quiz (4 questions):**
1. What's a common while loop mistake?
2. What does `break` do?
3. What does `continue` do?
4. What's wrong with: `while True: print("Hi")`?

**End with:** "Next: For loops - the Python way to iterate"

---

### Lesson 3.3: For Loops
**Duration:** 10 min
**Type:** Practice + Exercise

**Topics:**
- `for` loop syntax
- `range()` function
- Iterating over strings
- Loop variable naming

**Examples:**
```python
# Range
for i in range(5):
    print(i)  # 0, 1, 2, 3, 4

for i in range(1, 6):
    print(i)  # 1, 2, 3, 4, 5

for i in range(0, 10, 2):
    print(i)  # 0, 2, 4, 6, 8

# String iteration
name = "Python"
for char in name:
    print(char)

# Sum of numbers
total = 0
for i in range(1, 11):
    total += i
print(f"Sum: {total}")  # 55
```

**Practice Exercise:**
```python
# Print multiplication table for number 5
# Output:
# 5 × 1 = 5
# 5 × 2 = 10
# ...
# 5 × 10 = 50

# Bonus: Ask user for the number
```

**Quiz (5 questions):**
1. What does `range(5)` produce?
2. What does `range(1, 5)` produce?
3. What does `range(0, 10, 2)` produce?
4. How do you iterate over a string?
5. What's the sum of `range(1, 4)`?

**End with:** "Next: Loop patterns - counting, summing, searching"

---

### Lesson 3.4: Loop Patterns
**Duration:** 10 min
**Type:** Practice + Exercise

**Topics:**
- Counting occurrences
- Finding max/min
- Summing with condition
- Nested loops introduction

**Examples:**
```python
# Count evens
count = 0
for i in range(1, 11):
    if i % 2 == 0:
        count += 1
print(f"Even numbers: {count}")  # 5

# Find max
numbers = [3, 7, 2, 9, 1]
maximum = numbers[0]
for num in numbers:
    if num > maximum:
        maximum = num
print(f"Max: {maximum}")  # 9

# Nested loop - multiplication table
for i in range(1, 4):
    for j in range(1, 4):
        print(f"{i} × {j} = {i*j}")
```

**Practice Exercise:**
```python
# Find the minimum number in a list
# Count how many numbers are greater than 5
# Print a 3×3 grid of stars

# Hint: For the grid, use nested loops and print("*", end="")
```

**Quiz (4 questions):**
1. How do you track a maximum in a loop?
2. What's a nested loop?
3. What's `end=""` in print?
4. What's the time complexity of nested loops?

**End with:** "Next: List comprehensions - write loops like a Python pro"

---

### Lesson 3.5: List Comprehensions
**Duration:** 8 min
**Type:** Theory + Practice

**Topics:**
- Basic list comprehension syntax
- Conditional comprehensions
- When to use (and when not to)

**Examples:**
```python
# Basic
numbers = [1, 2, 3, 4, 5]
squared = [x**2 for x in numbers]
print(squared)  # [1, 4, 9, 16, 25]

# With condition
evens = [x for x in range(10) if x % 2 == 0]
print(evens)  # [0, 2, 4, 6, 8]

# String operations
names = ["alice", "bob", "charlie"]
uppercase = [name.upper() for name in names]
print(uppercase)  # ['ALICE', 'BOB', 'CHARLIE']
```

**Practice Exercise:**
```python
# Create a list of:
# - Squares of numbers 1-10
# - Only odd numbers from 1-20
# - Length of strings in a list

# Bonus: Convert all to lowercase
```

**Quiz (3 questions):**
1. What's `[x*2 for x in range(3)]`?
2. What's `[x for x in range(10) if x % 2 == 0]`?
3. When should you NOT use list comprehensions?

**End with:** "Next: Match statement - Python's powerful pattern matching (Python 3.10+)"

---

### Lesson 3.6: Match Statement (Python 3.10+)
**Duration:** 7 min
**Type:** Theory + Practice

**Topics:**
- `match` statement syntax
- Pattern matching
- `case` clauses
- Wildcard with `_`

**Examples:**
```python
# Basic match
status = 404
match status:
    case 200:
        print("OK")
    case 404:
        print("Not Found")
    case _:
        print("Other")

# With patterns
value = 5
match value:
    case 0:
        print("Zero")
    case 1 | 2 | 3:
        print("Small")
    case _:
        print("Large")
```

**Practice Exercise:**
```python
# Rock, Paper, Scissors with match:
# - Get user choice
# - Get computer choice (random)
# - Determine winner
# - Use match for clean logic
```

**Quiz (3 questions):**
1. What's `match` used for?
2. What does `_` match?
3. What's `|` in a case?

**End with:** "Next: Build a decision-making project"

---

### Lesson 3.7: Chapter Project - Text Adventure Game
**Duration:** 15 min
**Type:** Project

**Build:** A simple text adventure:
```python
print("You're in a dark room.")
print("There's a door to your left and right.")

choice = input("Which way? (left/right) ").lower()

match choice:
    case "left":
        print("You found a treasure!")
    case "right":
        print("A monster! Game over.")
    case _:
        print("Invalid choice. Try again.")

# Extend: Add more rooms, inventory, items
```

**Quiz Summary (7 questions):**
Review: if/else, while, for, comprehensions, match

**End with:** "Next: Functions - reuse your code"

---

## Chapter 4: Functions (6 lessons)

### Lesson 4.1: Creating Functions
**Duration:** 10 min
**Type:** Theory + Practice

**Topics:**
- `def` keyword
- Function naming
- Calling functions
- Return values
- Why functions matter

**Examples:**
```python
# Simple function
def greet():
    print("Hello!")

greet()  # Hello!

# With parameter
def greet_name(name):
    print(f"Hello, {name}!")

greet_name("Alice")  # Hello, Alice!

# With return
def add(a, b):
    return a + b

result = add(5, 3)
print(result)  # 8
```

**Practice Exercise:**
```python
# Create functions for:
# - Calculating area of rectangle
# - Converting Celsius to Fahrenheit
# - Checking if a number is even

# Test each function
```

**Quiz (4 questions):**
1. What keyword defines a function?
2. What's a parameter?
3. What does `return` do?
4. What's the difference between `print` and `return`?

**End with:** "Next: Function parameters - make functions flexible"

---

### Lesson 4.2: Parameters and Arguments
**Duration:** 8 min
**Type:** Theory + Practice

**Topics:**
- Positional arguments
- Keyword arguments
- Default values
- Multiple parameters

**Examples:**
```python
# Positional
def greet(name, age):
    print(f"{name} is {age}")

greet("Alice", 25)  # Alice is 25

# Keyword
greet(age=25, name="Alice")  # Alice is 25

# Default values
def greet(name, greeting="Hello"):
    print(f"{greeting}, {name}!")

greet("Alice")              # Hello, Alice!
greet("Bob", "Hi")          # Hi, Bob!

# Multiple parameters
def describe(name, age, city):
    print(f"{name}, {age}, from {city}")

describe("Alice", 25, "Paris")
```

**Practice Exercise:**
```python
# Create a function:
# power(base, exponent=2)
# Returns base^exponent

# Test: power(3), power(2, 3), power(5, exponent=3)
```

**Quiz (4 questions):**
1. What's the difference between positional and keyword arguments?
2. What are default values?
3. Can you mix positional and keyword arguments?
4. What's `def f(a, b=2)` called?

**End with:** "Next: Return values and function scope"

---

### Lesson 4.3: Return Values and Scope
**Duration:** 10 min
**Type:** Theory + Practice

**Topics:**
- Returning multiple values
- Early returns
- Local vs global scope
- Global keyword

**Examples:**
```python
# Multiple returns
def min_max(numbers):
    return min(numbers), max(numbers)

minimum, maximum = min_max([1, 5, 3])
print(minimum, maximum)  # 1 5

# Early return
def divide(a, b):
    if b == 0:
        return "Cannot divide by zero"
    return a / b

# Scope
x = 10  # Global

def func():
    x = 5  # Local
    print(x)  # 5

func()
print(x)  # 10

# Global keyword
x = 10

def change():
    global x
    x = 5

change()
print(x)  # 5
```

**Practice Exercise:**
```python
# Function that:
# - Returns True if number is positive
# - Returns False if negative
# - Returns "Zero" if 0

# Try accessing a global variable inside a function
```

**Quiz (5 questions):**
1. How do you return multiple values?
2. What's local scope?
3. What's global scope?
4. What does `global` do?
5. What prints: `x=5; def f(): x=10; f(); print(x)`?

**End with:** "Next: Lambda functions - write functions in one line"

---

### Lesson 4.4: Lambda Functions
**Duration:** 7 min
**Type:** Theory + Practice

**Topics:**
- Lambda syntax
- When to use lambdas
- Common use cases

**Examples:**
```python
# Basic lambda
add = lambda a, b: a + b
print(add(5, 3))  # 8

# With built-in functions
numbers = [1, 5, 3, 9, 2]
squared = list(map(lambda x: x**2, numbers))
print(squared)  # [1, 25, 9, 81, 4]

# Filter
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(evens)  # [2]

# Sort
pairs = [(1, 'one'), (3, 'three'), (2, 'two')]
pairs.sort(key=lambda x: x[0])
print(pairs)  # [(1, 'one'), (2, 'two'), (3, 'three')]
```

**Practice Exercise:**
```python
# Use lambda to:
# - Square all numbers in a list
# - Keep only numbers > 5
# - Sort strings by length

# Hint: Use map, filter, and sort
```

**Quiz (3 questions):**
1. What's a lambda?
2. When should you use lambdas?
3. What's `lambda x: x*2`(5)?

**End with:** "Next: Recursion - functions that call themselves"

---

### Lesson 4.5: Recursion
**Duration**: 8 min
**Type:** Theory + Practice

**Topics:**
- Recursive functions
- Base case
- Recursive case
- Common examples

**Examples:**
```python
# Factorial
def factorial(n):
    if n == 0 or n == 1:  # Base case
        return 1
    return n * factorial(n - 1)  # Recursive case

print(factorial(5))  # 120

# Fibonacci
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(6))  # 8
```

**Practice Exercise:**
```python
# Write recursive functions for:
# - Sum of numbers 1 to n
# - Power (base, exponent)
# - Count down from n to 1

# Bonus: What happens without a base case?
```

**Quiz (3 questions):**
1. What's recursion?
2. What's a base case?
3. What's `factorial(3)`?

**End with:** "Next: Build reusable code modules"

---

### Lesson 4.6: Chapter Project - Utility Functions Library
**Duration:** 12 min
**Type:** Project

**Build:** A collection of useful functions:
```python
# String utilities
def reverse_string(s):
    return s[::-1]

def is_palindrome(s):
    return s == s[::-1]

def capitalize_words(s):
    return ' '.join(word.capitalize() for word in s.split())

# Math utilities
def is_prime(n):
    if n < 2:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

def fibonacci_sequence(n):
    return [fibonacci(i) for i in range(n)]

# Test all functions
# Print documentation for each
```

**Quiz Summary (6 questions):**
Review: functions, parameters, return, scope, lambda, recursion

**End with:** "Next: Data structures - organize your data"

---

## Chapter 5: Data Structures (7 lessons)

### Lesson 5.1: Lists - Creation and Access
**Duration:** 10 min
**Type:** Theory + Practice

**Topics:**
- Creating lists
- Accessing elements (indexing)
- Negative indexing
- Slicing
- List length

**Examples:**
```python
# Creation
fruits = ["apple", "banana", "cherry"]
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]

# Accessing
print(fruits[0])      # apple
print(fruits[-1])     # cherry (last)
print(fruits[-2])     # banana

# Slicing
numbers = [0, 1, 2, 3, 4, 5]
print(numbers[1:4])   # [1, 2, 3]
print(numbers[:3])    # [0, 1, 2]
print(numbers[3:])    # [3, 4, 5]
print(numbers[::2])   # [0, 2, 4]

# Length
print(len(fruits))    # 3
```

**Practice Exercise:**
```python
# Create a list of your favorite movies
# Print:
# - First movie
# - Last movie
# - First 3 movies
# - Movies in reverse order
# - Number of movies
```

**Quiz (5 questions):**
1. What's `["a", "b", "c"][1]`?
2. What's `["a", "b", "c"][-1]`?
3. What's `[0, 1, 2, 3, 4][1:4]`?
4. What's `len([1, 2, 3])`?
5. What's `[0, 1, 2, 3, 4][::2]`?

**End with:** "Next: Modify lists - add, remove, change elements"

---

### Lesson 5.2: List Methods
**Duration:** 10 min
**Type:** Practice + Exercise

**Topics:**
- `append()`, `insert()`
- `remove()`, `pop()`
- `sort()`, `reverse()`
- `index()`, `count()`
- `clear()`, `copy()`

**Examples:**
```python
# Adding
fruits = ["apple", "banana"]
fruits.append("cherry")
fruits.insert(1, "orange")
print(fruits)  # ['apple', 'orange', 'banana', 'cherry']

# Removing
fruits.remove("banana")
last = fruits.pop()
print(fruits)  # ['apple', 'orange']

# Sorting
numbers = [3, 1, 4, 1, 5]
numbers.sort()
print(numbers)  # [1, 1, 3, 4, 5]

numbers.reverse()
print(numbers)  # [5, 4, 3, 1, 1]

# Info
print(numbers.index(3))  # 2
print(numbers.count(1))  # 2

# Copy vs reference
original = [1, 2, 3]
copy = original.copy()
reference = original
copy[0] = 99
print(original)  # [1, 2, 3] (unchanged)
```

**Practice Exercise:**
```python
# Create a todo list:
# - Add 5 tasks
# - Remove completed task
# - Insert urgent task at beginning
# - Sort alphabetically
# - Count how many tasks remain
```

**Quiz (5 questions):**
1. What does `append()` do?
2. What's the difference between `remove()` and `pop()`?
3. What does `sort()` do?
4. What's the difference between `copy()` and `=`?
5. What does `count(3)` return for `[1, 3, 3, 5]`?

**End with:** "Next: List comprehensions and patterns"

---

### Lesson 5.3: List Comprehensions Deep Dive
**Duration:** 8 min
**Type:** Practice + Exercise

**Topics:**
- Complex comprehensions
- Nested comprehensions
- Performance considerations

**Examples:**
```python
# Flatten 2D list
matrix = [[1, 2], [3, 4], [5, 6]]
flat = [num for row in matrix for num in row]
print(flat)  # [1, 2, 3, 4, 5, 6]

# Filter and transform
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
even_squared = [x**2 for x in numbers if x % 2 == 0]
print(even_squared)  # [4, 16, 36, 64, 100]

# Nested comprehension
multiplication = [[i * j for j in range(1, 4)] for i in range(1, 4)]
print(multiplication)  # [[1, 2, 3], [2, 4, 6], [3, 6, 9]]
```

**Practice Exercise:**
```python
# Use comprehensions to:
# - Get all even numbers from 1-20
# - Square only odd numbers from 1-10
# - Create a 5x5 grid where each cell is row * column
# - Filter out words shorter than 5 letters
```

**Quiz (4 questions):**
1. What's `[x for x in range(10) if x % 2 == 0]`?
2. What's `[[i*j for j in range(3)] for i in range(3)]`?
3. When are comprehensions NOT recommended?
4. What's the time complexity of nested comprehensions?

**End with:** "Next: Tuples - immutable sequences"

---

### Lesson 5.4: Tuples
**Duration:** 7 min
**Type:** Theory + Practice

**Topics:**
- Creating tuples
- Tuple vs list
- When to use tuples
- Tuple unpacking
- Named tuples (intro)

**Examples:**
```python
# Creation
coordinates = (3, 5)
single = (1,)  # Note the comma!
empty = ()

# Access (same as lists)
print(coordinates[0])  # 3
print(coordinates[1])  # 5

# Immutable
# coordinates[0] = 10  # Error!

# Unpacking
x, y = coordinates
print(x, y)  # 3 5

# Swapping
a, b = 5, 10
a, b = b, a  # Swap without temp variable!

# Multiple return values
def get_user():
    return "Alice", 25, "Paris"

name, age, city = get_user()
```

**Practice Exercise:**
```python
# Use tuples for:
# - RGB color values
# - 2D coordinates
# - Returning multiple values from function
# - Swapping two variables

# Try: Why can't you modify a tuple?
```

**Quiz (4 questions):**
1. What's a tuple?
2. How do you create a single-element tuple?
3. What's tuple unpacking?
4. When should you use tuples over lists?

**End with:** "Next: Dictionaries - key-value pairs"

---

### Lesson 5.5: Dictionaries
**Duration:** 12 min
**Type:** Theory + Practice

**Topics:**
- Creating dictionaries
- Accessing values
- Adding/updating/deleting
- Dictionary methods
- Iterating over dictionaries

**Examples:**
```python
# Creation
person = {
    "name": "Alice",
    "age": 25,
    "city": "Paris"
}

# Accessing
print(person["name"])        # Alice
print(person.get("age"))     # 25
print(person.get("job", "Unknown"))  # Unknown (default)

# Adding/updating
person["email"] = "alice@example.com"
person["age"] = 26  # Update

# Deleting
del person["city"]
job = person.pop("email", None)

# Methods
print(person.keys())    # dict_keys(['name', 'age'])
print(person.values())  # dict_values(['Alice', 26])
print(person.items())   # dict_items([('name', 'Alice'), ('age', 26)])

# Iterating
for key in person:
    print(key, person[key])

for key, value in person.items():
    print(f"{key}: {value}")
```

**Practice Exercise:**
```python
# Create a contact book:
# - Add 5 contacts with name, phone, email
# - Search for a contact
# - Update a contact's phone
# - Delete a contact
# - Print all contacts nicely formatted
```

**Quiz (5 questions):**
1. What's a dictionary?
2. How do you access a value safely?
3. What's the difference between `del` and `pop()`?
4. What does `.items()` return?
5. What's `{"a": 1, "b": 2}.get("c", 0)`?

**End with:** "Next: Sets - unique values"

---

### Lesson 5.6: Sets
**Duration:** 7 min
**Type:** Theory + Practice

**Topics:**
- Creating sets
- Set operations (union, intersection, difference)
- When to use sets
- Set methods

**Examples:**
```python
# Creation
numbers = {1, 2, 3, 4, 5}
duplicates = {1, 2, 2, 3, 3, 3}  # {1, 2, 3}

# Operations
a = {1, 2, 3}
b = {3, 4, 5}

print(a | b)  # Union: {1, 2, 3, 4, 5}
print(a & b)  # Intersection: {3}
print(a - b)  # Difference: {1, 2}
print(a ^ b)  # Symmetric difference: {1, 2, 4, 5}

# Methods
numbers.add(6)
numbers.remove(3)
print(numbers.discard(100))  # No error if not exists

# Checking membership
print(3 in numbers)  # True
```

**Practice Exercise:**
```python
# Use sets to:
# - Find common elements in two lists
# - Remove duplicates from a list
# - Check if two lists have any overlap
# - Find elements in list1 but not in list2
```

**Quiz (4 questions):**
1. What's a set?
2. What does `|` do with sets?
3. What does `&` do with sets?
4. What's unique about sets?

**End with:** "Next: Choose the right data structure"

---

### Lesson 5.7: Data Structure Comparison
**Duration:** 8 min
**Type:** Theory + Reference

**When to use what:**

```
LIST: Use when...
✅ Order matters
✅ You need to modify (add/remove)
✅ Duplicates are OK
✅ You need to slice
Example: Shopping cart, to-do list

TUPLE: Use when...
✅ Data shouldn't change
✅ You want to pack/unpack
✅ Performance matters
Example: Coordinates, settings

DICT: Use when...
✅ Key-value pairs
✅ Fast lookup by key
✅ You need to label data
Example: User profile, config

SET: Use when...
✅ Unique values only
✅ Fast membership testing
✅ Set operations (union, etc.)
Example: Tags, removing duplicates
```

**Practice Exercise:**
```python
# For each scenario, choose the best structure:
# - Store a user's name, age, email
# - Keep a shopping cart (can have duplicates)
# - Track unique tags on a post
# - Store RGB color (won't change)
# - List of tasks in order
```

**Quiz Summary (7 questions):**
Review: lists, tuples, dicts, sets, comprehensions

**End with:** "Next: Handle errors gracefully"

---

## Chapter 6: Real-World Python (6 lessons)

### Lesson 6.1: Error Handling
**Duration:** 10 min
**Type:** Theory + Practice

**Topics:**
- Types of errors (syntax, runtime, logical)
- `try`, `except`, `else`, `finally`
- Catching specific exceptions
- Raising exceptions
- Best practices

**Examples:**
```python
# Basic try-except
try:
    num = int(input("Enter a number: "))
    print(f"Double: {num * 2}")
except ValueError:
    print("That's not a number!")

# Specific exceptions
try:
    result = 10 / 0
except ZeroDivisionError:
    print("Can't divide by zero!")
except ValueError as e:
    print(f"Invalid value: {e}")

# Else and finally
try:
    file = open("data.txt", "r")
    data = file.read()
except FileNotFoundError:
    print("File not found")
else:
    print(f"Read {len(data)} characters")
finally:
    print("Cleanup code here")

# Raising exceptions
def calculate_age(birth_year):
    age = 2024 - birth_year
    if age < 0:
        raise ValueError("Birth year can't be in the future")
    return age
```

**Practice Exercise:**
```python
# Safe division function:
# - Ask for two numbers
# - Handle division by zero
# - Handle non-numeric input
# - Return result or error message

# Bonus: Add retry logic
```

**Quiz (5 questions):**
1. What's the difference between syntax and runtime error?
2. What does `try` do?
3. What's `else` in try-except?
4. What's `finally`?
5. How do you raise an exception?

**End with:** "Next: Work with files"

---

### Lesson 6.2: File Operations
**Duration:** 10 min
**Type:** Theory + Practice

**Topics:**
- Reading files
- Writing files
- Context managers (`with`)
- File modes
- Working with CSV

**Examples:**
```python
# Reading (best practice)
with open("file.txt", "r") as f:
    content = f.read()
    print(content)

# Reading line by line
with open("file.txt", "r") as f:
    for line in f:
        print(line.strip())

# Writing
with open("output.txt", "w") as f:
    f.write("Hello, World!\n")
    f.write("Second line")

# Appending
with open("log.txt", "a") as f:
    f.write(f"Error at {time}\n")

# CSV
import csv

with open("data.csv", "r") as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)

with open("output.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["Name", "Age"])
    writer.writerow(["Alice", 25])
```

**Practice Exercise:**
```python
# Create a simple todo app:
# - Load todos from file (or create if not exists)
# - Add new todos
# - Mark todos as complete
# - Save back to file
# - Display all todos
```

**Quiz (4 questions):**
1. Why use `with` for files?
2. What's file mode "r"?
3. What's file mode "w" vs "a"?
4. What does `.strip()` do?

**End with:** "Next: Work with JSON data"

---

### Lesson 6.3: JSON and Data Serialization
**Duration:** 8 min
**Type:** Theory + Practice

**Topics:**
- What is JSON?
- Reading JSON
- Writing JSON
- Working with APIs (intro)

**Examples:**
```python
import json

# Reading JSON
with open("data.json", "r") as f:
    data = json.load(f)
    print(data)

# Writing JSON
person = {
    "name": "Alice",
    "age": 25,
    "skills": ["Python", "JavaScript"]
}

with open("person.json", "w") as f:
    json.dump(person, f, indent=2)

# Pretty print
print(json.dumps(person, indent=2))

# Parse JSON string
json_string = '{"name": "Bob"}'
data = json.loads(json_string)
print(data["name"])  # Bob
```

**Practice Exercise:**
```python
# Create a config system:
# - Load config from config.json
# - Default values if file doesn't exist
# - Save user preferences
# - Pretty print with indentation
```

**Quiz (4 questions):**
1. What's JSON?
2. What's `json.load()` vs `json.loads()`?
3. What's `json.dump()` vs `json.dumps()`?
4. What does `indent=2` do?

**End with:** "Next: Work with modules and libraries"

---

### Lesson 6.4: Modules and Packages
**Duration:** 8 min
**Type:** Theory + Practice

**Topics:**
- Importing modules
- Standard library highlights
- `pip` and external packages
- Creating your own modules

**Examples:**
```python
# Importing
import math
print(math.sqrt(16))  # 4.0

from random import randint
print(randint(1, 10))  # Random 1-10

from datetime import datetime
now = datetime.now()
print(now.strftime("%Y-%m-%d"))

# Aliases
import numpy as np
import pandas as pd

# Your own module
# In mymodule.py:
def greet(name):
    return f"Hello, {name}!"

# In main.py:
from mymodule import greet
print(greet("Alice"))
```

**Practice Exercise:**
```python
# Use standard library modules:
# - random: Roll a dice 10 times
# - datetime: Calculate days until your birthday
# - math: Calculate area of circle
# - os: List files in current directory
```

**Quiz (4 questions):**
1. What's a module?
2. What's `import` vs `from ... import`?
3. What's `pip`?
4. Name 3 standard library modules

**End with:** "Next: Virtual environments (brief intro)"

---

### Lesson 6.5: Best Practices and PEP 8
**Duration:** 7 min
**Type:** Theory + Reference

**Key principles:**
```python
# Naming conventions
variable_name = "snake_case"
CONSTANT_NAME = "UPCASE"
ClassName = "PascalCase"
function_name = "snake_case"

# Spacing
x = 5  # One space around operators
def func(a, b):  # One space after comma
    return a + b

# Indentation (4 spaces)
if True:
    print("Use 4 spaces, not tabs")

# Line length (max 79 characters)
# Bad
very_long_variable_name = some_function_with_many_arguments(arg1, arg2, arg3, arg4, arg5)

# Good
very_long_variable_name = some_function_with_many_arguments(
    arg1, arg2, arg3, arg4, arg5
)

# Docstrings
def calculate_area(length, width):
    """
    Calculate the area of a rectangle.

    Args:
        length: The length of the rectangle
        width: The width of the rectangle

    Returns:
        The area of the rectangle
    """
    return length * width
```

**Practice Exercise:**
```python
# Review your code:
# - Check naming conventions
# - Fix spacing issues
# - Add docstrings to functions
# - Break long lines
# - Add comments where needed
```

**Quiz (3 questions):**
1. What's PEP 8?
2. Snake_case or CamelCase for variables?
3. How many spaces for indentation?

**End with:** "Next: Build your final project"

---

### Lesson 6.6: Final Project - File Organizer
**Duration:** 20 min
**Type:** Project

**Build:** A practical file automation tool

**Requirements:**
```python
"""
File Organizer:
- Scan a folder for files
- Organize by type (images, docs, music, etc.)
- Create folders if needed
- Move files to appropriate folders
- Generate a report
"""

import os
import shutil
from pathlib import Path

def get_file_type(filename):
    """Determine file type from extension"""
    extensions = {
        'Images': ['.jpg', '.png', '.gif', '.webp'],
        'Documents': ['.pdf', '.doc', '.docx', '.txt'],
        'Music': ['.mp3', '.wav', '.flac'],
        'Videos': ['.mp4', '.avi', '.mov'],
        'Code': ['.py', '.js', '.html', '.css'],
    }

    ext = Path(filename).suffix.lower()
    for file_type, exts in extensions.items():
        if ext in exts:
            return file_type
    return 'Other'

def organize_files(source_folder):
    """Organize files in the given folder"""
    # Your implementation here
    pass

def generate_report(organized):
    """Generate a report of organized files"""
    # Your implementation here
    pass

# Main execution
if __name__ == "__main__":
    folder = input("Enter folder path: ")
    organize_files(folder)
    print("✅ Files organized!")
```

**Bonus features:**
- Handle duplicates
- Create log file
- Add dry-run mode (preview)
- Custom file type rules

**End of Course Quiz (10 questions):**
Comprehensive review of all chapters

**Certificate:** 🎉 Congratulations on completing Introduction to Python!

---

## What's Next?

Now that you've mastered Python fundamentals:

1. **Continue Learning**
   - Object-Oriented Programming in Python
   - Advanced Python Patterns
   - Backend Development with FastAPI

2. **Build Projects**
   - Automation scripts
   - Web scrapers
   - APIs
   - Data analysis tools

3. **Join the Community**
   - Share your projects
   - Contribute to open source
   - Help other learners

**Keep coding! 🐍**

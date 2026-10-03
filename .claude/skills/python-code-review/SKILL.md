---
description: Python-specific code review guidance covering idioms, correctness, maintainability, and common pitfalls
---

# Python Code Review

Expert guidance for reviewing Python code.

## Pythonic Code
- Prefer clear Python idioms.
- Use comprehensions when they improve readability.
- Use context managers for resources.
- Prefer enumerate and zip where appropriate.
- Avoid unnecessary manual indexing.

## Functions
- Keep functions focused.
- Use meaningful names.
- Validate inputs at appropriate boundaries.
- Avoid excessive mutable global state.

## Error Handling
- Catch specific exceptions.
- Avoid broad `except Exception` unless there is a clear reason.
- Preserve useful error context.
- Do not silently ignore failures.

## Data Handling
- Avoid accidental mutation of shared objects.
- Use appropriate data structures.
- Consider generators for large streams of data.

## Async and Performance
- Avoid blocking operations inside async functions.
- Use concurrency only when it provides a meaningful benefit.
- Avoid unnecessary repeated computation.

## Security
- Never use eval or exec on untrusted input.
- Validate file paths and external input.
- Never hardcode credentials.

## Output:
For each issue provide:
1. Description
2. Why it matters
3. Severity
4. Recommended fix
5. Code example when useful

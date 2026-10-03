---
description: TypeScript-specific patterns for type safety, maintainability, and robust application design
---

# TypeScript Patterns

Expert guidance for reviewing TypeScript code.

## Type Safety
- Prefer explicit types at public API boundaries.
- Avoid `any`; use `unknown` when the type is genuinely unknown.
- Use strict null checks and handle `null` and `undefined` explicitly.
- Prefer discriminated unions for related variants.
- Use type guards when narrowing complex values.
- Keep interfaces and types focused and meaningful.

## Functions and APIs
- Use clear parameter and return types for reusable functions.
- Prefer small functions with a single responsibility.
- Avoid excessive optional parameters.
- Use generics when they improve reusable type safety.

## Async Code
- Type Promise return values where useful.
- Handle rejected promises.
- Avoid unhandled asynchronous operations.
- Use Promise.all for independent asynchronous operations.

## Common Problems
- Unsafe type assertions.
- Excessive non-null assertions (`!`).
- Duplicate or conflicting types.
- Weakly typed object maps.
- Inconsistent error types.
- Missing return type safety.

## Maintainability
- Prefer readable types over overly clever type-level programming.
- Keep exported types stable and intentional.
- Avoid unnecessary duplication.

## Output:
For each issue provide:
1. Description
2. Why it matters
3. Severity
4. Recommended fix
5. Code example when useful

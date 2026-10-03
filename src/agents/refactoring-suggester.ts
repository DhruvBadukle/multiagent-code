import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { REFACTORING_SUGGESTER_PROMPT } from '../prompts/refactoring-suggester.prompt.js';

export const refactoringSuggester: AgentDefinition = {
  description:
    'Identifies practical refactoring opportunities that improve readability, maintainability, structure, and code quality without changing intended behavior.',
  model: 'inherit',
  tools: [
    'Skill',
    'Read',
    'Grep',
    'Glob',
    'mcp__github__get_file_contents'
  ],
  prompt: REFACTORING_SUGGESTER_PROMPT
};

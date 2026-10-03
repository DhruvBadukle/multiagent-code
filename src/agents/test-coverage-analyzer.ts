import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { TEST_COVERAGE_ANALYZER_PROMPT } from '../prompts/test-coverage-analyzer.prompt.js';

export const testCoverageAnalyzer: AgentDefinition = {
  description:
    'Analyzes source code and tests to identify missing test coverage, untested paths, edge cases, and high-priority testing gaps.',
  model: 'inherit',
  tools: [
    'Skill',
    'Read',
    'Grep',
    'Glob',
    'mcp__github__get_file_contents'
  ],
  prompt: TEST_COVERAGE_ANALYZER_PROMPT
};

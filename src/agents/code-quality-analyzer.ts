import type { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';
import { CODE_QUALITY_ANALYZER_PROMPT } from '../prompts/code-quality-analyzer.prompt.js';

export const codeQualityAnalyzer: AgentDefinition = {
  description:
    'Analyzes source code for bugs, security risks, performance issues, maintainability problems, style issues, and best-practice violations.',
  model: 'inherit',
  tools: [
    'Skill',
    'Read',
    'Grep',
    'Glob',
    'mcp__github__get_file_contents',
    'mcp__eslint__lint'
  ],
  prompt: CODE_QUALITY_ANALYZER_PROMPT
};

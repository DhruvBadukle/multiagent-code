import path from 'node:path';

import { query } from '@anthropic-ai/claude-agent-sdk';

import { mcpServersConfig } from './config/mcp.config.js';
import { createOrchestratorPrompt } from './prompts/orchestrator.prompt.js';
import {
  codeQualityAnalyzer,
  testCoverageAnalyzer,
  refactoringSuggester
} from './agents/index.js';
import {
  ReviewReportSchema,
  ReviewReportJSONSchema,
  type ReviewReport
} from './types/report-types.js';

export interface OrchestratorOptions {
  model?: string;
  cwd?: string;
  maxTurns?: number;
  maxBudgetUsd?: number;
}

export class CodeReviewOrchestrator {
  private readonly options: OrchestratorOptions;

  constructor(options: OrchestratorOptions = {}) {
    this.options = {
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
      cwd: process.env.PROJECT_ROOT || process.cwd(),
      ...options
    };
  }

  async reviewPullRequest(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<ReviewReport> {
    const startTime = Date.now();

    const prompt = createOrchestratorPrompt(owner, repo, prNumber);

    try {
      const response = query({
        prompt,
        options: {
          model: this.options.model,
          cwd: this.options.cwd,
          executable: 'node',
          env: {
            ...process.env,
            PATH: [process.env.PATH, path.dirname(process.execPath)]
              .filter(Boolean)
              .join(path.delimiter)
          },
          maxTurns: this.options.maxTurns ?? 30,
          maxBudgetUsd: this.options.maxBudgetUsd,

          allowedTools: [
            'Task',
            'mcp__github__get_pull_request',
            'mcp__github__get_pull_request_files',
            'mcp__github__get_file_contents'
          ],

          mcpServers: mcpServersConfig,

          agents: {
            'code-quality-analyzer': codeQualityAnalyzer,
            'test-coverage-analyzer': testCoverageAnalyzer,
            'refactoring-suggester': refactoringSuggester
          },

          outputFormat: {
            type: 'json_schema',
            schema: ReviewReportJSONSchema
          }
        }
      });

      let structuredOutput: unknown;

      for await (const message of response) {
        const result = message as {
          structured_output?: unknown;
        };

        if (result.structured_output !== undefined) {
          structuredOutput = result.structured_output;
        }
      }

      if (structuredOutput === undefined) {
        throw new Error('No structured ReviewReport was returned by Claude');
      }

      const validation = ReviewReportSchema.safeParse(structuredOutput);

      if (!validation.success) {
        throw new Error(
          `ReviewReport validation failed: ${validation.error.message}`
        );
      }

      const report = validation.data;

      return {
        ...report,
        pullRequest: {
          owner,
          repo,
          number: prNumber
        },
        metadata: {
          ...report.metadata,
          analyzedAt: new Date().toISOString(),
          duration: Date.now() - startTime
        }
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);

      throw new Error(
        `Code review failed for ${owner}/${repo}#${prNumber}: ${message}`
      );
    }
  }
}

import { describe, expect, it, vi } from 'vitest';

import { codeQualityAnalyzer } from '../src/agents/code-quality-analyzer';
import { testCoverageAnalyzer } from '../src/agents/test-coverage-analyzer';
import { refactoringSuggester } from '../src/agents/refactoring-suggester';
import {
  CodeQualityResultSchema,
  TestCoverageResultSchema,
  RefactoringSuggestionSchema
} from '../src/types/analysis-results';
import { ReviewReportSchema } from '../src/types/report-types';
import { RateLimiter, withRateLimit } from '../src/utils/rate-limiter';
import {
  ErrorCodes,
  ReviewError,
  formatError,
  isReviewError,
  withRetry,
  withTimeout
} from '../src/utils/error-handler';

const agentDefinitions = [
  codeQualityAnalyzer,
  testCoverageAnalyzer,
  refactoringSuggester
];

describe('CodeReviewOrchestrator supporting components', () => {
  describe('Agent configuration', () => {
    it('exposes the Skill tool for all specialized agents', () => {
      for (const agent of agentDefinitions) {
        expect(agent.tools).toContain('Skill');
      }
    });
  });

  describe('Schema validation', () => {
    it('accepts a valid code-quality result', () => {
      const result = CodeQualityResultSchema.safeParse({
        file: 'src/example.ts',
        issues: [],
        overallScore: 92,
        summary: 'No significant issues found.'
      });

      expect(result.success).toBe(true);
    });

    it('rejects an invalid code-quality severity', () => {
      const result = CodeQualityResultSchema.safeParse({
        file: 'src/example.ts',
        issues: [{
          line: 10,
          severity: 'urgent',
          category: 'security',
          description: 'Invalid severity',
          suggestion: 'Use a supported severity'
        }],
        overallScore: 50,
        summary: 'Invalid test fixture'
      });

      expect(result.success).toBe(false);
    });

    it('accepts valid test-coverage and refactoring results', () => {
      const coverage = TestCoverageResultSchema.safeParse({
        file: 'src/example.ts',
        hasTests: true,
        testFiles: ['tests/example.test.ts'],
        untestedPaths: [],
        coverageEstimate: 85,
        summary: 'Core paths are covered.'
      });
      const refactoring = RefactoringSuggestionSchema.safeParse({
        file: 'src/example.ts',
        suggestions: [],
        summary: 'No refactoring required.'
      });

      expect(coverage.success).toBe(true);
      expect(refactoring.success).toBe(true);
    });

    it('rejects a ReviewReport with an invalid summary value', () => {
      const result = ReviewReportSchema.safeParse({
        pullRequest: { owner: 'octocat', repo: 'Hello-World', number: 1 },
        fileReviews: [],
        summary: {
          totalFiles: 1,
          overallScore: 'not-a-number',
          criticalIssues: 0,
          highPriorityTests: 0,
          refactoringOpportunities: 0
        },
        recommendations: [],
        metadata: {
          analyzedAt: new Date().toISOString(),
          duration: 100,
          agentVersions: {}
        }
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Rate limiting', () => {
    it('tracks requests, tokens, and available capacity', async () => {
      const limiter = new RateLimiter({
        maxRequestsPerMinute: 2,
        maxTokensPerMinute: 1000,
        maxConcurrent: 1
      });

      expect(limiter.canProceed(400)).toBe(true);
      await limiter.acquire(400);

      const status = limiter.getStatus();
      expect(status.activeRequests).toBe(1);
      expect(status.requestsInWindow).toBe(1);
      expect(status.tokensInWindow).toBe(400);
      expect(status.availableRequests).toBe(1);
      expect(status.availableTokens).toBe(600);

      limiter.release(350);
      expect(limiter.getStatus().activeRequests).toBe(0);
      expect(limiter.getStatus().tokensInWindow).toBe(350);
    });

    it('releases the rate-limit slot when the wrapped operation fails', async () => {
      const limiter = new RateLimiter({
        maxRequestsPerMinute: 5,
        maxTokensPerMinute: 5000,
        maxConcurrent: 1
      });

      await expect(
        withRateLimit(limiter, async () => {
          throw new Error('operation failed');
        }, 100)
      ).rejects.toThrow('operation failed');

      expect(limiter.getStatus().activeRequests).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('retries a transient failure and returns the successful result', async () => {
      let attempts = 0;

      const result = await withRetry(async () => {
        attempts += 1;
        if (attempts < 3) {
          throw new Error('transient failure');
        }
        return 'success';
      }, 3, 0);

      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('throws RETRY_EXHAUSTED after retries are exhausted', async () => {
      await expect(
        withRetry(async () => {
          throw new Error('permanent failure');
        }, 1, 0)
      ).rejects.toMatchObject({
        code: ErrorCodes.RETRY_EXHAUSTED
      });
    });

    it('returns before timeout and reports timeout errors consistently', async () => {
      await expect(
        withTimeout(async () => 'ok', 100)
      ).resolves.toBe('ok');

      await expect(
        withTimeout(
          () => new Promise<string>(resolve => setTimeout(() => resolve('late'), 30)),
          5
        )
      ).rejects.toMatchObject({
        code: ErrorCodes.AGENT_TIMEOUT
      });
    });

    it('identifies and formats ReviewError instances', () => {
      const error = new ReviewError('Bad input', ErrorCodes.INVALID_CONFIG);

      expect(isReviewError(error)).toBe(true);
      expect(formatError(error)).toBe('[INVALID_CONFIG] Bad input');
      expect(formatError(new Error('plain error'))).toBe('plain error');
    });
  });

  describe('Integration', () => {
    // This test requires actual API keys and should be skipped in CI.
    it.skip('should review a real small PR', async () => {
      vi.fn();
    });
  });
});

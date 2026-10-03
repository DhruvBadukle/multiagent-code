export function createOrchestratorPrompt(
  owner: string,
  repo: string,
  prNumber: number
): string {
  return `
You are the main orchestrator for a production-ready multi-agent code review system.

Review GitHub pull request:
Repository: ${owner}/${repo}
Pull Request: #${prNumber}

Follow this workflow:

1. Use the GitHub MCP server to inspect the pull request and identify changed files.
2. For each relevant source file, use the Task tool to invoke ALL THREE specialized agents:
   - code-quality-analyzer
   - test-coverage-analyzer
   - refactoring-suggester
3. The three agents should analyze independently and in parallel where possible.
4. Collect their results.
5. Combine the results into one ReviewReport.
6. Include accurate file paths and line numbers.
7. Calculate the summary values:
   - totalFiles
   - overallScore
   - criticalIssues
   - highPriorityTests
   - refactoringOpportunities
8. Generate actionable recommendations.
9. Do not invent files, line numbers, issues, tests, or refactorings.
10. If one agent fails, continue using the available results and provide a valid report.
11. Return only the data required by the ReviewReport schema.
`;
}

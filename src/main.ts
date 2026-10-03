import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

import { CodeReviewOrchestrator } from './orchestrator.js';
import { ReportGenerator } from './utils/report-generator.js';

dotenv.config();

async function main() {
  const [owner, repo, prStr] = process.argv.slice(2);

  // Validate CLI arguments
  if (!owner || !repo || !prStr) {
    console.error(
      'Usage: npm run dev -- <owner> <repo> <pr-number>'
    );
    process.exit(1);
  }

  const prNumber = Number(prStr);

  if (!Number.isInteger(prNumber) || prNumber <= 0) {
    console.error('Error: PR number must be a positive integer.');
    process.exit(1);
  }

  // Validate authentication
  const hasAnthropicAuth = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasBedrockAuth =
    Boolean(process.env.AWS_ACCESS_KEY_ID) &&
    Boolean(process.env.AWS_SECRET_ACCESS_KEY);

  if (!hasAnthropicAuth && !hasBedrockAuth) {
    console.error(
      'Error: Authentication is not configured.\n' +
      'Configure either ANTHROPIC_API_KEY or AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY.'
    );
    process.exit(1);
  }

  if (hasBedrockAuth) {
    if (!process.env.AWS_REGION) {
      console.error(
        'Error: AWS_REGION is required when using AWS Bedrock.'
      );
      process.exit(1);
    }

    console.log('🔐 Using AWS Bedrock authentication');
  } else {
    console.log('🔐 Using Anthropic API authentication');
  }

  // Validate model
  if (!process.env.ANTHROPIC_MODEL) {
    console.error(
      'Error: ANTHROPIC_MODEL environment variable is required.'
    );
    process.exit(1);
  }

  try {
    console.log(
      `🔍 Reviewing ${owner}/${repo} PR #${prNumber}...`
    );

    const orchestrator = new CodeReviewOrchestrator();

    const report = await orchestrator.reviewPullRequest(
      owner,
      repo,
      prNumber
    );

    const generator = new ReportGenerator();

    const markdown = generator.generateMarkdownReport(report);
    const html = generator.generateHTMLReport(report);
    const json = generator.generateJSONReport(report);

    const reportsDir = path.resolve(process.cwd(), 'reports');

    fs.mkdirSync(reportsDir, { recursive: true });

    const baseName = `${owner}-${repo}-pr-${prNumber}`;

    fs.writeFileSync(
      path.join(reportsDir, `${baseName}.md`),
      markdown,
      'utf8'
    );

    fs.writeFileSync(
      path.join(reportsDir, `${baseName}.html`),
      html,
      'utf8'
    );

    fs.writeFileSync(
      path.join(reportsDir, `${baseName}.json`),
      json,
      'utf8'
    );

    console.log('\n✅ Review completed successfully.');
    console.log(`📁 Reports saved to: ${reportsDir}`);
    console.log(`   - ${baseName}.json`);
    console.log(`   - ${baseName}.md`);
    console.log(`   - ${baseName}.html`);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error);

    console.error(`\n❌ Error: ${message}`);
    process.exit(1);
  }
}

main();

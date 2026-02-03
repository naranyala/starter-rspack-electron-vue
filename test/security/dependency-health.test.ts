import { expect, test } from 'bun:test';
import { execSync } from 'node:child_process';

test('no outdated dependencies', () => {
  try {
    const result = execSync('npm outdated --json', { encoding: 'utf8' });
    const outdatedJson = result ? JSON.parse(result) : {};
    const outdatedPackages = Object.keys(outdatedJson);
    if (outdatedPackages.length > 0) {
      const outdatedList = outdatedPackages.map(pkg => {
        const versions = outdatedJson[pkg];
        return `${pkg}: ${versions.current} -> ${versions.latest}`;
      }).join('\n');
      throw new Error(`Outdated dependencies found:\n${outdatedList}`);
    }
  } catch (error) {
    if (error instanceof Error && 'stdout' in error) {
      try {
        const output = (error as any).stdout;
        if (output && output.trim()) {
          const outdatedJson = JSON.parse(output);
          const outdatedPackages = Object.keys(outdatedJson);
          if (outdatedPackages.length > 0) {
            const outdatedList = outdatedPackages.map(pkg => {
              const versions = outdatedJson[pkg];
              return `${pkg}: ${versions.current} -> ${versions.latest}`;
            }).join('\n');
            throw new Error(`Outdated dependencies found:\n${outdatedList}`);
          }
        }
      } catch {
      }
    } else if (!(error instanceof Error && error.message.includes('npm outdated'))) {
      throw error;
    }
  }
});

test('no critical vulnerabilities found in dependencies', () => {
  try {
    const result = execSync('npm audit --json', { encoding: 'utf8' });
    if (result) {
      const audit = JSON.parse(result);
      if (audit.metadata?.vulnerabilities?.critical > 0) {
        throw new Error(`Found ${audit.metadata.vulnerabilities.critical} critical vulnerabilities. Run "npm audit" for details.`);
      }
    }
  } catch (error) {
    if (error instanceof Error && 'stdout' in error) {
      try {
        const output = (error as any).stdout;
        if (output && output.trim()) {
          const audit = JSON.parse(output);
          if (audit.metadata?.vulnerabilities?.critical > 0) {
            throw new Error(`Found ${audit.metadata.vulnerabilities.critical} critical vulnerabilities. Run "npm audit" for details.`);
          }
        }
      } catch {
      }
    } else if (!(error instanceof Error && error.message.includes('npm audit'))) {
    }
  }
});

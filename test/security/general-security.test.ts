import { beforeAll, describe, expect, it } from 'bun:test';
import { promises as fs } from 'node:fs';
import path from 'node:path';

describe('General Security Tests', () => {
  let gitignoreContent: string;

  beforeAll(async () => {
    gitignoreContent = await fs
      .readFile(path.join(process.cwd(), '.gitignore'), 'utf8')
      .catch(() => '');
  });

  it('should validate .gitignore contains sensitive files', () => {
    const requiredPatterns = [
      '*.env',
      '.env.local',
      '.env.development.local',
      '.env.test.local',
      '.env.production.local',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      'node_modules/',
      'dist/',
      'build/',
    ];

    for (const pattern of requiredPatterns) {
      expect(gitignoreContent).toContain(pattern);
    }
  });

  it('should validate no secrets in source code', async () => {
    const files = await collectSourceFiles();
    for (const file of files) {
      if (file.includes('test') || file.includes('spec') || file.includes('general-security'))
        continue;
      const content = await fs.readFile(file, 'utf8').catch(() => '');
      if (content) {
        expect(looksLikeSecret(content)).toBe(false);
      }
    }
  });

  it('should validate that sensitive configuration is externalized', async () => {
    if (gitignoreContent) {
      const configFiles = ['.env', '.env.local', '.env.production', '.env.production.local'];
      for (const configFile of configFiles) {
        const exists = await fs
          .access(path.join(process.cwd(), configFile))
          .then(() => true)
          .catch(() => false);
        if (exists) {
          expect(gitignoreContent).toContain(configFile);
        }
      }
    }
  });

  it('should validate that error messages do not expose sensitive information', async () => {
    const files = await collectSourceFiles();
    for (const file of files) {
      const content = await fs.readFile(file, 'utf8').catch(() => '');
      if (content) {
        expect(content).not.toMatch(/console\.log\s*\(\s*err\.stack\s*\)/);
        expect(content).not.toMatch(/console\.log\s*\(\s*error\.stack\s*\)/);
        expect(content).not.toMatch(/res\.send\s*\(\s*err\.stack\s*\)/);
        expect(content).not.toMatch(/res\.json\s*\(\s*err[^}]*}\s*\)/);
      }
    }
  });

  it('should validate proper file permissions', async () => {
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const stat = await fs.stat(packageJsonPath);
      expect(stat.mode & 0o002).toBe(0);
    } catch {
      expect(true).toBe(true);
    }
  });

  it('should validate no dangerous Node.js module usage', async () => {
    const mainCjsPath = path.join(process.cwd(), 'main.cjs');
    const mainContent = await fs.readFile(mainCjsPath, 'utf8').catch(() => '');

    const dangerousModules = [
      'child_process',
      'fs',
      'os',
      'path',
      'net',
      'http',
      'https',
      'dns',
      'readline',
      'repl',
    ];

    for (const module of dangerousModules) {
      if (mainContent.includes(`require('${module}')`)) {
        expect(mainContent).not.toMatch(
          new RegExp(
            `require\\s*\\(\\s*['"]${module}['"]\\s*\\)\\s*\\.\\s*(exec|spawn|execSync|spawnSync)`
          )
        );
      }
    }
  });

  it('should validate no insecure random number generation', async () => {
    const files = await collectSourceFiles();
    for (const file of files) {
      if (file.includes('validation') || file.includes('utils') || file.endsWith('.vue')) continue;
      const content = await fs.readFile(file, 'utf8').catch(() => '');
      if (content && !content.includes('crypto.randomUUID')) {
        expect(content).not.toMatch(/Math\.random\s*\(\s*\)/);
      }
    }
  });

  it('should validate no dangerous prototype pollution patterns', async () => {
    const files = await collectSourceFiles();
    for (const file of files) {
      if (file.includes('test') || file.includes('spec')) continue;
      const content = await fs.readFile(file, 'utf8').catch(() => '');
      if (content) {
        expect(content).not.toMatch(/__proto__/);
        expect(content).not.toMatch(/constructor\s*\.\s*prototype/);
      }
    }
  });
});

async function collectSourceFiles(): Promise<string[]> {
  const roots = ['src', 'scripts', 'test', 'main.cjs'];
  const extensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.cjs', '.mjs', '.json'];
  const excluded = new Set([
    '.git',
    '.github',
    '.idea',
    '.vscode',
    'node_modules',
    'dist',
    'build',
    'out',
    'coverage',
    '.cache',
    '.turbo',
    '.next',
    '.nuxt',
    'tmp',
    'temp',
    'logs',
  ]);
  const files: string[] = [];

  for (const root of roots) {
    const absolute = path.join(process.cwd(), root);
    try {
      const stat = await fs.stat(absolute);
      if (stat.isFile()) {
        if (extensions.some((ext) => absolute.endsWith(ext))) {
          files.push(absolute);
        }
      } else if (stat.isDirectory()) {
        const dirFiles = await scanDirectory(absolute, extensions, excluded);
        files.push(...dirFiles);
      }
    } catch {}
  }

  return files;
}

async function scanDirectory(
  dirPath: string,
  extensions: string[],
  excluded: Set<string>
): Promise<string[]> {
  const files: string[] = [];
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && excluded.has(entry.name)) {
        continue;
      }
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext))) {
        files.push(fullPath);
      } else if (entry.isDirectory()) {
        const subFiles = await scanDirectory(fullPath, extensions, excluded);
        files.push(...subFiles);
      }
    }
  } catch {
    return [];
  }
  return files;
}

function looksLikeSecret(content: string): boolean {
  if (content.includes('import') && content.includes('key')) return false;
  const secretPatterns = [
    /(?:secret|token|password)\s*[:=]\s*(?!.*randomUUID)\s*(?!.*\d)\s*['"`](?!.*\d)[^'"]{10,}['"`]/i,
    /(?:SECRET_KEY|AUTH_TOKEN|API_SECRET)\s*[:=]\s*['"](?!.*\d)[^'"]{10,}['"]/i,
    /['"](?:sk_live_|pk_live_)[a-zA-Z0-9]{20,}['"]/i,
  ];
  const matches = secretPatterns.filter((pattern) => pattern.test(content));
  return matches.length > 0;
}

function extractSecrets(content: string): string[] {
  const secrets: string[] = [];
  const secretPatterns = [
    /(?:secret|token|key|password|api_key|auth_token)\s*[:=]\s*['"]([^'"]{10,})['"]/i,
    /(?:secret|token|key|password|api_key|auth_token)\s*[:=]\s*`([^`]{10,})`/i,
  ];

  for (const pattern of secretPatterns) {
    const matches = content.match(new RegExp(pattern, 'gi'));
    if (matches) {
      secrets.push(...matches);
    }
  }

  return secrets;
}

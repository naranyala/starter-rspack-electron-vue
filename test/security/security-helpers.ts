import { promises as fs } from 'node:fs';
import path from 'node:path';

const DEFAULT_EXCLUDED_DIRS = new Set([
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

const DEFAULT_EXTENSIONS = [
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.vue',
  '.cjs',
  '.mjs',
  '.json',
  '.html',
  '.css',
];

export type CollectOptions = {
  roots?: string[];
  extensions?: string[];
  excludeDirs?: string[];
  maxBytes?: number;
};

export async function collectSourceFiles(options: CollectOptions = {}): Promise<string[]> {
  const roots = options.roots ?? ['src', 'scripts', 'test', 'main.cjs'];
  const extensions = options.extensions ?? DEFAULT_EXTENSIONS;
  const excluded = new Set([...(options.excludeDirs ?? []), ...DEFAULT_EXCLUDED_DIRS]);
  const files: string[] = [];

  for (const root of roots) {
    const absolute = path.resolve(process.cwd(), root);
    const exists = await fs.access(absolute).then(() => true).catch(() => false);
    if (!exists) continue;

    const stat = await fs.stat(absolute);
    if (stat.isFile()) {
      if (extensions.some((ext) => absolute.endsWith(ext))) {
        files.push(absolute);
      }
      continue;
    }

    if (stat.isDirectory()) {
      const dirFiles = await scanDirectory(absolute, extensions, excluded);
      files.push(...dirFiles);
    }
  }

  return files;
}

export async function readTextIfSmall(filePath: string, maxBytes: number = 1024 * 1024): Promise<string | null> {
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile() || stat.size > maxBytes) return null;
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

export function looksLikeSecret(content: string): boolean {
  const secretPatterns = [
    /(?:secret|token|key|password|api_key|auth_token)\s*[:=]\s*['"][^'\"]{10,}['"]/i,
    /(?:secret|token|key|password|api_key|auth_token)\s*[:=]\s*`[^`]{10,}`/i,
    /(?:AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|SECRET_KEY).*=/i,
  ];

  return secretPatterns.some((pattern) => pattern.test(content));
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
    // Directory doesn't exist or isn't readable
  }

  return files;
}

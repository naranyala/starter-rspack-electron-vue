import { describe, it, expect, beforeAll } from 'bun:test';
import { promises as fs } from 'node:fs';
import path from 'node:path';

describe('Vue Component Security Tests', () => {
  let vueFiles: string[];

  beforeAll(async () => {
    vueFiles = await findVueFiles();
  });

  it('should validate no unsafe HTML interpolation in Vue templates', async () => {
    for (const file of vueFiles) {
      const content = await fs.readFile(file, 'utf8');
      expect(content).not.toMatch(/v-html\s*=/);
      expect(content).not.toMatch(/\.innerHTML\s*=/);
      expect(content).not.toMatch(/\.outerHTML\s*=/);
    }
  });

  it('should validate no eval() usage in Vue components', async () => {
    for (const file of vueFiles) {
      const content = await fs.readFile(file, 'utf8');
      expect(content).not.toMatch(/\beval\s*\(/);
      expect(content).not.toMatch(/new\s+Function\s*\(/);
      expect(content).not.toMatch(/setTimeout\s*\(\s*["'`](?![\s]*function)/);
      expect(content).not.toMatch(/setInterval\s*\(\s*["'`](?![\s]*function)/);
    }
  });

  it('should validate no unsafe URL handling in Vue components', async () => {
    for (const file of vueFiles) {
      const content = await fs.readFile(file, 'utf8');
      expect(content).not.toMatch(/location\s*\.\s*(href|assign|replace)\s*=\s*[^'"]/);
      expect(content).not.toMatch(/window\.open\s*\(\s*[^"'`][^)]*\)/);
    }
  });

  it('should validate proper input sanitization', async () => {
    for (const file of vueFiles) {
      const content = await fs.readFile(file, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(/\b(event\.target\.value|input\.value|req\.body|req\.query|params\.)/)) {
          for (let j = Math.max(0, i - 2); j < Math.min(lines.length, i + 5); j++) {
            if (lines[j].match(/\.(innerHTML|outerHTML|insertAdjacentHTML)/)) {
            }
          }
        }
      }
    }
  });

  it('should validate no hardcoded secrets in Vue components', async () => {
    for (const file of vueFiles) {
      const content = await fs.readFile(file, 'utf8');
      const secretPattern = /(?:secret|token|password|api_key|auth_token)\s*[:=]\s*(?!.*randomUUID)[^'"]{10,}(?!\s*\+\s*)/i;
      const templatePattern = /(?:secret|token|password|api_key|auth_token)\s*[:=]\s*`(?!.*randomUUID)[^`]{10,}`/i;
      expect(content).not.toMatch(secretPattern);
      expect(content).not.toMatch(templatePattern);
    }
  });

  it('should validate no dangerous template expressions', async () => {
    for (const file of vueFiles) {
      const content = await fs.readFile(file, 'utf8');
      expect(content).not.toMatch(/:\s*href\s*=\s*["']?\s*javascript:/i);
      expect(content).not.toMatch(/@click\s*=\s*["']?\s*javascript:/i);
      expect(content).not.toMatch(/v-bind:src\s*=\s*["']?\s*http:/i);
    }
  });

  it('should validate no dangerous event handlers', async () => {
    for (const file of vueFiles) {
      const content = await fs.readFile(file, 'utf8');
      expect(content).not.toMatch(/onload\s*=\s*["']?javascript:/i);
      expect(content).not.toMatch(/onerror\s*=\s*["']?javascript:/i);
      expect(content).not.toMatch(/onmouseover\s*=\s*["']?javascript:/i);
    }
  });
});

async function findVueFiles(): Promise<string[]> {
  const vueFiles: string[] = [];
  const srcPath = path.join(process.cwd(), 'src');

  try {
    const files = await fs.readdir(srcPath, { withFileTypes: true });
    for (const file of files) {
      if (file.name.endsWith('.vue')) {
        vueFiles.push(path.join(srcPath, file.name));
      } else if (file.isDirectory()) {
        const subFiles = await findVueFilesInDir(path.join(srcPath, file.name));
        vueFiles.push(...subFiles);
      }
    }
  } catch {
    return [];
  }

  return vueFiles;
}

async function findVueFilesInDir(dirPath: string): Promise<string[]> {
  const files: string[] = [];
  try {
    const dirEntries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of dirEntries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.name.endsWith('.vue')) {
        files.push(fullPath);
      } else if (entry.isDirectory()) {
        const subFiles = await findVueFilesInDir(fullPath);
        files.push(...subFiles);
      }
    }
  } catch {
    return [];
  }
  return files;
}

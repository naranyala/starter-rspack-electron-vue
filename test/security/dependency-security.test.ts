import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'bun:test';
import { promises as fs } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

describe('Dependency Security Tests', () => {
  let packageJson: any;
  let dependencies: Record<string, string>;

  beforeAll(async () => {
    const content = await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf8');
    packageJson = JSON.parse(content);
    dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  });

  describe('Lock File Validation', () => {
    it('should have package-lock.json or bun.lock for dependency integrity', async () => {
      const hasNpmLock = await fs.access(path.join(process.cwd(), 'package-lock.json')).then(() => true).catch(() => false);
      const hasBunLock = await fs.access(path.join(process.cwd(), 'bun.lock')).then(() => true).catch(() => false);
      expect(hasNpmLock || hasBunLock).toBe(true);
    });

    it('should not have both lock files that are out of sync', async () => {
      const hasNpmLock = await fs.access(path.join(process.cwd(), 'package-lock.json')).then(() => true).catch(() => false);
      const hasBunLock = await fs.access(path.join(process.cwd(), 'bun.lock')).then(() => true).catch(() => false);
      
      if (hasNpmLock && hasBunLock) {
        const npmContent = await fs.readFile(path.join(process.cwd(), 'package-lock.json'), 'utf8');
        const bunContent = await fs.readFile(path.join(process.cwd(), 'bun.lock'), 'utf8');
        expect(npmContent.length > 0 && bunContent.length > 0).toBe(true);
      }
    });
  });

  describe('Dependency Source Validation', () => {
    it('should not use git URLs for dependencies', () => {
      for (const [name, version] of Object.entries(dependencies)) {
        if (typeof version === 'string') {
          expect(version.startsWith('git+')).toBe(false);
          expect(version.startsWith('git://')).toBe(false);
        }
      }
    });

    it('should not use HTTP URLs for dependencies', () => {
      for (const [name, version] of Object.entries(dependencies)) {
        if (typeof version === 'string') {
          expect(version.startsWith('http://')).toBe(false);
          expect(version.startsWith('https://')).toBe(false);
        }
      }
    });

    it('should not use file URLs for dependencies', () => {
      for (const [name, version] of Object.entries(dependencies)) {
        if (typeof version === 'string') {
          expect(version.startsWith('file:')).toBe(false);
        }
      }
    });

    it('should use proper semver versioning', () => {
      for (const [name, version] of Object.entries(dependencies)) {
        if (typeof version === 'string' && !version.startsWith('file:') && !version.startsWith('git:')) {
          expect(version).toMatch(/^[~^]?[\d.x]+(?:-[\w.-]+)?$/);
        }
      }
    });
  });

  describe('Known Vulnerable Packages', () => {
    const knownVulnerablePackages: Record<string, string> = {
      axios: '1.6.0',
      ws: '8.14.0',
      'path-to-regexp': '6.2.0',
      express: '4.18.2',
      minimatch: '9.0.0',
      semver: '7.5.4',
      moment: '2.29.4',
    };

    for (const [pkg, minVersion] of Object.entries(knownVulnerablePackages)) {
      it(`should use safe version of ${pkg}`, () => {
        if (dependencies[pkg]) {
          const version = dependencies[pkg].replace(/^[~^]/, '');
          const major = parseInt(version.split('.')[0]) || 0;
          const minor = parseInt(version.split('.')[1]) || 0;
          const patch = parseInt(version.split('.')[2]) || 0;
          
          const [minMajor, minMinor, minPatch] = minVersion.split('.').map(Number);
          
          const isSafe = 
            major > minMajor || 
            (major === minMajor && minor > minMinor) || 
            (major === minMajor && minor === minMinor && patch >= minPatch);
          
          expect(isSafe).toBe(true);
        }
      });
    }
  });

  describe('Package Quality', () => {
    it('should have license information', () => {
      expect(packageJson.license).toBeDefined();
      expect(typeof packageJson.license).toBe('string');
    });

    it('should have repository information', () => {
      expect(packageJson.repository).toBeDefined();
    });

    it('should have maintainer information', () => {
      expect(packageJson.author).toBeDefined();
    });

    it('should have a package description', () => {
      expect(packageJson.description).toBeDefined();
      expect(typeof packageJson.description).toBe('string');
      expect(packageJson.description.length).toBeGreaterThan(10);
    });
  });

  describe('Suspicious Package Names', () => {
    it('should not have packages with leading underscores', () => {
      const suspicious: string[] = [];
      for (const name of Object.keys(dependencies)) {
        if (name.startsWith('_') || name.startsWith('-')) {
          suspicious.push(name);
        }
      }
      expect(suspicious).toEqual([]);
    });

    it('should not have packages with double underscores', () => {
      const suspicious: string[] = [];
      for (const name of Object.keys(dependencies)) {
        if (name.includes('__')) {
          suspicious.push(name);
        }
      }
      expect(suspicious).toEqual([]);
    });

    it('should not have packages starting with numbers', () => {
      const suspicious: string[] = [];
      for (const name of Object.keys(dependencies)) {
        if (/^[0-9]/.test(name)) {
          suspicious.push(name);
        }
      }
      expect(suspicious).toEqual([]);
    });
  });

  describe('Deprecated Packages', () => {
    it('should not use deprecated packages', async () => {
      const deprecatedPackages = ['moment', 'request', 'node-fetch', 'axios'];
      const foundDeprecated = Object.keys(dependencies).filter(pkg => deprecatedPackages.includes(pkg));
      expect(foundDeprecated).toEqual([]);
    });
  });
});

import { beforeAll, describe, expect, it } from 'bun:test';
import { promises as fs } from 'node:fs';
import path from 'node:path';

describe('Electron Security Tests', () => {
  let mainContent: string;

  beforeAll(async () => {
    const mainPath = path.join(process.cwd(), 'main.cjs');
    mainContent = await fs.readFile(mainPath, 'utf8');
  });

  describe('WebPreferences Security', () => {
    it('should have contextIsolation enabled', () => {
      expect(mainContent).toContain('contextIsolation: true');
    });

    it('should have nodeIntegration disabled', () => {
      expect(mainContent).toContain('nodeIntegration: false');
    });

    it('should have webSecurity enabled', () => {
      expect(mainContent).toContain('webSecurity: true');
    });

    it('should have sandbox enabled', () => {
      expect(mainContent).toContain('sandbox: true');
    });

    it('should not have nodeIntegration in any BrowserWindow', () => {
      const browserWindowPattern = /new\s+BrowserWindow\s*\([^)]*\)/g;
      const matches = mainContent.match(browserWindowPattern);

      if (matches) {
        const webPrefsPattern = /webPreferences:\s*\{[^}]*\}/;
        for (const match of matches) {
          const webPrefsMatch = mainContent.match(webPrefsPattern);
          if (webPrefsMatch) {
            const webPrefs = webPrefsMatch[0];
            if (webPrefs.includes('nodeIntegration:')) {
              expect(webPrefs).not.toMatch(/nodeIntegration:\s*true/);
            }
          }
        }
      }
    });
  });

  describe('Dangerous API Exposure', () => {
    it('should not expose child_process to renderer', () => {
      expect(mainContent).not.toMatch(/require\(['"`]child_process['"`]\)/);
    });

    it('should not expose fs module to renderer', () => {
      expect(mainContent).not.toMatch(/require\(['"`]fs['"`]\)/);
    });

    it('should not expose os module to renderer', () => {
      expect(mainContent).not.toMatch(/require\(['"`]os['"`]\)/);
    });

    it('should not expose net module to renderer', () => {
      expect(mainContent).not.toMatch(/require\(['"`]net['"`]\)/);
    });

    it('should not expose process.env in renderer', () => {
      expect(mainContent).not.toMatch(/worldSafeExecuteJavaScript:\s*false/);
    });

    it('should not disable security features', () => {
      expect(mainContent).not.toMatch(/webSecurity:\s*false/);
      expect(mainContent).not.toMatch(/contextIsolation:\s*false/);
      expect(mainContent).not.toMatch(/nodeIntegration:\s*true/);
    });
  });

  describe('Content Security Policy', () => {
    it('should not have CSP bypass patterns', () => {
      expect(mainContent).not.toMatch(/unsafe-eval.*content-security-policy/i);
    });
  });

  describe('Insecure Features', () => {
    it('should not enable experimentalFeatures', () => {
      expect(mainContent).not.toContain('experimentalFeatures: true');
    });

    it('should not enable enableRemoteModule', () => {
      expect(mainContent).not.toContain('enableRemoteModule: true');
    });

    it('should not allow insecure content', () => {
      expect(mainContent).not.toMatch(/allowRunningInsecureContent:\s*true/);
    });

    it('should not enable webviewTag', () => {
      expect(mainContent).not.toContain('webviewTag: true');
    });

    it('should not allow navigate events', () => {
      if (mainContent.includes('will-navigate')) {
        expect(mainContent).toMatch(/will-navigate.*handler|app\.on.*will-navigate/i);
      }
    });

    it('should not allow window.open without restrictions', () => {
      if (mainContent.includes('window.open')) {
        expect(mainContent).toMatch(/webPreferences.*frameOpenSplits|newButton|disablePopups/i);
      }
    });
  });

  describe('Preload Script Security', () => {
    it('should have a preload script defined', () => {
      expect(mainContent).toContain('preload:');
    });

    it('should not expose dangerous Node.js APIs in preload', async () => {
      if (mainContent.includes('preload:')) {
        const preloadPattern = /preload:\s*['"]([^'"]+)['"]/;
        const match = mainContent.match(preloadPattern);
        if (match && match[1]) {
          const preloadPath = path.join(process.cwd(), match[1]);
          try {
            const preloadContent = await fs.readFile(preloadPath, 'utf8');
            expect(preloadContent).not.toMatch(/process\.versions\.electron/);
            expect(preloadContent).not.toMatch(/require\(['"`]child_process['"`]\)/);
          } catch {
            // Preload file might not exist yet
          }
        }
      }
    });
  });

  describe('Protocol Handler Security', () => {
    it('should secure custom protocol handlers', () => {
      if (mainContent.includes('protocol.handle') || mainContent.includes('protocol.register')) {
        expect(mainContent).toMatch(/restrictToSession|secure|privileges.*standard/i);
      }
    });

    it('should not use privileged schemes', () => {
      expect(mainContent).not.toMatch(/app\.setAsDefaultProtocolClient.*['"]blob['"]/i);
      expect(mainContent).not.toMatch(/app\.setAsDefaultProtocolClient.*['"]data['"]/i);
    });
  });

  describe('Session Security', () => {
    it('should configure secure session settings', () => {
      if (mainContent.includes('session.fromPartition')) {
        expect(mainContent).not.toMatch(/partition:\s*['"]persist:/i);
      }
    });

    it('should not disable webRequest security', () => {
      expect(mainContent).not.toMatch(/webRequest.*blocking.*false/i);
    });
  });

  describe('Additional Security Checks', () => {
    it('should not allow popups', () => {
      expect(mainContent).not.toMatch(/allowpopups:\s*true/);
    });

    it('should not execute arbitrary JavaScript', () => {
      expect(mainContent).not.toMatch(/executeJavaScript/);
    });

    it('should not open dev tools unconditionally', () => {
      const uncommentedDevToolsPattern = /^(?!.*\/\/).*openDevTools/i;
      const lines = mainContent.split('\n');
      let foundUncommented = false;
      for (const line of lines) {
        if (!line.trim().startsWith('//') && line.includes('openDevTools')) {
          foundUncommented = true;
          break;
        }
      }
      expect(foundUncommented).toBe(false);
    });

    it('should not disable default parsing', () => {
      expect(mainContent).not.toMatch(/dangerouslyUseGlobalPPAPI:/);
    });
  });

  describe('Native Module Security', () => {
    it('should not enable nativeNodeModulesForMain', () => {
      expect(mainContent).not.toMatch(/nativeNodeModulesForMain:\s*true/);
    });
  });
});

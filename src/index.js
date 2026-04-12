const chokidar = require('chokidar');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;

const execAsync = promisify(exec);

class AutoSync {
    constructor(options = {}) {
        this.projectDir = options.projectDir || process.cwd();
        this.inactivityInterval = options.inactivityInterval || 300000; // 5 minutes
        this.remoteName = options.remoteName || 'updates';
        this.changedFiles = new Set();
        this.inactivityTimer = null;
        this.watcher = null;
    }

    async execGit(command) {
        try {
            const { stdout, stderr } = await execAsync(`git ${command}`, {
                cwd: this.projectDir
            });
            return { stdout: stdout.trim(), stderr: stderr.trim() };
        } catch (error) {
            throw new Error(`Git command failed: ${error.message}`);
        }
    }

    async isGitRepo() {
        try {
            await this.execGit('rev-parse --git-dir');
            return true;
        } catch {
            return false;
        }
    }

    async hasUncommittedChanges() {
        try {
            const { stdout } = await this.execGit('status --porcelain');
            return stdout.length > 0;
        } catch {
            return false;
        }
    }

    async createBackupCommit() {
        if (this.changedFiles.size === 0) return;

        console.log(`\n📦 Creating backup commit for ${this.changedFiles.size} changed file(s)...`);

        try {
            // Add all changed files
            await this.execGit('add .');

            // Create commit with timestamp
            const timestamp = new Date().toISOString();
            const fileList = Array.from(this.changedFiles).slice(0, 5).join(', ');
            const message = `[AutoSync] Backup at ${timestamp}\n\nFiles: ${fileList}${this.changedFiles.size > 5 ? '...' : ''}`;

            await this.execGit(`commit -m "${message}"`);
            console.log('✅ Commit created successfully');

            // Push to backup remote
            await this.pushToBackup();

            this.changedFiles.clear();
        } catch (error) {
            console.error('❌ Failed to create backup:', error.message);
        }
    }

    async pushToBackup() {
        try {
            const { stdout } = await this.execGit('remote');
            const remotes = stdout.split('\n');

            if (!remotes.includes(this.remoteName)) {
                console.log(`⚠️  Remote '${this.remoteName}' not configured. Skipping push.`);
                console.log(`   Add it with: git remote add ${this.remoteName} <url>`);
                return;
            }

            console.log(`🔄 Pushing to '${this.remoteName}'...`);
            await this.execGit(`push ${this.remoteName} HEAD`);
            console.log('✅ Pushed successfully');
        } catch (error) {
            console.error('❌ Push failed:', error.message);
        }
    }

    resetInactivityTimer() {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
        }

        this.inactivityTimer = setTimeout(() => {
            this.createBackupCommit();
        }, this.inactivityInterval);
    }

    async handleFileChange(filePath) {
        const relativePath = path.relative(this.projectDir, filePath);

        // Ignore git directory and node_modules
        if (relativePath.startsWith('.git') || relativePath.includes('node_modules')) {
            return;
        }

        this.changedFiles.add(relativePath);
        console.log(`📝 Detected change: ${relativePath}`);

        this.resetInactivityTimer();
    }

    async checkCrashRecovery() {
        console.log('🔍 Checking for uncommitted changes from previous session...');

        if (await this.hasUncommittedChanges()) {
            console.log('⚠️  Found uncommitted changes! Creating recovery backup...');
            await this.createBackupCommit();
        } else {
            console.log('✅ No uncommitted changes found');
        }
    }

    async start() {
        console.log('🚀 AutoSync Dev Starting...\n');
        console.log(`📂 Project: ${this.projectDir}`);
        console.log(`⏱️  Inactivity interval: ${this.inactivityInterval / 1000}s`);
        console.log(`🔄 Remote: ${this.remoteName}\n`);

        // Check if it's a git repository
        if (!(await this.isGitRepo())) {
            console.error('❌ Not a Git repository. Please run "git init" first.');
            process.exit(1);
        }

        // Check for crash recovery
        await this.checkCrashRecovery();

        // Start watching files
        this.watcher = chokidar.watch(this.projectDir, {
            ignored: /(^|[\/\\])\..|(node_modules|\.git)/,
            persistent: true,
            ignoreInitial: true
        });

        this.watcher
            .on('add', (path) => this.handleFileChange(path))
            .on('change', (path) => this.handleFileChange(path))
            .on('unlink', (path) => this.handleFileChange(path));

        console.log('👀 Watching for file changes...\n');
        console.log('Press Ctrl+C to stop\n');

        // Handle graceful shutdown
        process.on('SIGINT', async () => {
            console.log('\n\n🛑 Stopping AutoSync Dev...');

            if (this.changedFiles.size > 0) {
                console.log('💾 Saving pending changes...');
                await this.createBackupCommit();
            }

            if (this.watcher) {
                await this.watcher.close();
            }

            console.log('✅ Stopped successfully');
            process.exit(0);
        });
    }
}

module.exports = AutoSync;

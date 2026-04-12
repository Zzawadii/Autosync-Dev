#!/usr/bin/env node

const { program } = require('commander');
const AutoSync = require('./index');
const path = require('path');

program
    .name('autosync')
    .description('AutoSync Dev - Automated Git backup system')
    .version('1.0.0');

program
    .command('start')
    .description('Start monitoring the current directory')
    .option('-d, --dir <path>', 'Directory to monitor', process.cwd())
    .option('-i, --interval <seconds>', 'Inactivity interval before commit', '300')
    .option('-r, --remote <name>', 'Remote repository name', 'updates')
    .action((options) => {
        const autoSync = new AutoSync({
            projectDir: path.resolve(options.dir),
            inactivityInterval: parseInt(options.interval) * 1000,
            remoteName: options.remote
        });

        autoSync.start();
    });

program.parse();

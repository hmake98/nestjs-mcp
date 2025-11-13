#!/usr/bin/env node
/* eslint-disable no-undef */
const { Command } = require('commander');
const { generateClient } = require('../dist/cli/generate-client');
const fs = require('fs');
const path = require('path');
const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'),
);

const program = new Command();

program
    .name('nestjs-mcp')
    .description(
        'NestJS MCP CLI - Generate type-safe clients for your MCP server',
    )
    .version(packageJson.version);

program
    .command('client:generate')
    .description(
        'Generate a type-safe TypeScript client from a running MCP server',
    )
    .requiredOption(
        '--url <url>',
        'MCP server URL (e.g., http://localhost:3000/mcp)',
    )
    .option(
        '--out <directory>',
        'Output directory for generated client',
        './mcp-client',
    )
    .option('--name <name>', 'Client package name', 'mcp-client')
    .action(async (options) => {
        try {
            console.log('🔍 Introspecting MCP server at:', options.url);
            await generateClient({
                serverUrl: options.url,
                outputDir: options.out,
                clientName: options.name,
            });
            console.log('✅ Client generated successfully at:', options.out);
        } catch (error) {
            console.error('❌ Failed to generate client:', error.message);
            process.exit(1);
        }
    });

program.parse(process.argv);

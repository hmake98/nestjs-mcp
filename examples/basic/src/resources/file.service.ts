import { Injectable } from '@nestjs/common';
import { MCPResource, MCPResourceTemplate } from 'nestjs-mcp';

@Injectable()
export class FileService {
    // Static resource example
    @MCPResource({
        uri: 'file:///readme.txt',
        name: 'README',
        description: 'Application README file',
        mimeType: 'text/plain',
    })
    async getReadme() {
        return {
            uri: 'file:///readme.txt',
            mimeType: 'text/plain',
            text: `# NestJS MCP Example Server

This is a basic example of using nestjs-mcp to create an MCP server.

## Available Tools:
- add: Add two numbers
- multiply: Multiply two numbers
- reverse-string: Reverse a string
- calculate: Perform basic arithmetic

## Available Resources:
- file:///readme.txt: This file
- file:///{filename}: Dynamic file access

## Available Prompts:
- code-review: Generate code review prompt
- summarize: Generate summarization prompt`,
        };
    }

    @MCPResource({
        uri: 'config://app/settings',
        name: 'App Settings',
        description: 'Application configuration',
        mimeType: 'application/json',
    })
    async getSettings() {
        return {
            uri: 'config://app/settings',
            mimeType: 'application/json',
            text: JSON.stringify(
                {
                    name: 'example-mcp-server',
                    version: '1.0.0',
                    environment: 'development',
                    features: {
                        tools: true,
                        resources: true,
                        prompts: true,
                    },
                },
                null,
                2,
            ),
        };
    }

    // Dynamic resource with template
    @MCPResourceTemplate({
        uriTemplate: 'file:///{filename}',
        name: 'File',
        description: 'Get any file by filename',
        mimeType: 'text/plain',
    })
    async getFile(variables: { filename: string }) {
        // In a real application, you would read from the filesystem
        const mockFiles: Record<string, string> = {
            'example.txt': 'This is an example file content.',
            'data.json': JSON.stringify({ key: 'value', data: [1, 2, 3] }),
            'notes.md': '# Notes\n\nThis is a markdown file.',
        };

        const content =
            mockFiles[variables.filename] ||
            `File "${variables.filename}" not found. Available files: ${Object.keys(mockFiles).join(', ')}`;

        return {
            uri: `file:///${variables.filename}`,
            mimeType: variables.filename.endsWith('.json')
                ? 'application/json'
                : 'text/plain',
            text: content,
        };
    }

    @MCPResourceTemplate({
        uriTemplate: 'user:///{userId}/profile',
        name: 'User Profile',
        description: 'Get user profile by ID',
        mimeType: 'application/json',
    })
    async getUserProfile(variables: { userId: string }) {
        // Mock user data
        const users: Record<string, any> = {
            '1': { id: '1', name: 'John Doe', email: 'john@example.com' },
            '2': { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
            '3': { id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
        };

        const user = users[variables.userId] || {
            error: 'User not found',
            userId: variables.userId,
        };

        return {
            uri: `user:///${variables.userId}/profile`,
            mimeType: 'application/json',
            text: JSON.stringify(user, null, 2),
        };
    }
}

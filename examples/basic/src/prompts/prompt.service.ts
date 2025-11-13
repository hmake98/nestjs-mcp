import { Injectable } from '@nestjs/common';
import { MCPPrompt } from 'nestjs-mcp';

@Injectable()
export class PromptService {
    @MCPPrompt({
        name: 'code-review',
        description: 'Generate a code review prompt',
        arguments: [
            {
                name: 'language',
                description: 'Programming language',
                required: true,
            },
            {
                name: 'code',
                description: 'Code to review',
                required: true,
            },
            {
                name: 'focus',
                description: 'Areas to focus on (e.g., security, performance)',
                required: false,
            },
        ],
    })
    async codeReview(args: { language: string; code: string; focus?: string }) {
        const focusArea = args.focus ? ` with focus on ${args.focus}` : '';

        return [
            {
                role: 'user' as const,
                content: {
                    type: 'text' as const,
                    text: `Please review the following ${args.language} code${focusArea}:

\`\`\`${args.language}
${args.code}
\`\`\`

Provide feedback on:
- Code quality and best practices
- Potential bugs or issues
- Performance considerations
- Security concerns${args.focus ? `\n- Special attention to: ${args.focus}` : ''}`,
                },
            },
        ];
    }

    @MCPPrompt({
        name: 'summarize',
        description: 'Generate a summarization prompt',
        arguments: [
            {
                name: 'content',
                description: 'Content to summarize',
                required: true,
            },
            {
                name: 'length',
                description: 'Summary length (short, medium, long)',
                required: false,
            },
        ],
    })
    async summarize(args: { content: string; length?: string }) {
        const lengthInstruction = args.length
            ? `Provide a ${args.length} summary.`
            : 'Provide a concise summary.';

        return [
            {
                role: 'user' as const,
                content: {
                    type: 'text' as const,
                    text: `Please summarize the following content. ${lengthInstruction}

Content:
${args.content}`,
                },
            },
        ];
    }

    @MCPPrompt({
        name: 'explain-concept',
        description: 'Generate a prompt to explain a concept',
        arguments: [
            {
                name: 'concept',
                description: 'Concept to explain',
                required: true,
            },
            {
                name: 'level',
                description:
                    'Explanation level (beginner, intermediate, advanced)',
                required: false,
            },
            {
                name: 'examples',
                description: 'Whether to include examples (true/false)',
                required: false,
            },
        ],
    })
    async explainConcept(args: {
        concept: string;
        level?: string;
        examples?: string;
    }) {
        const level = args.level || 'intermediate';
        const includeExamples = args.examples === 'true';

        return [
            {
                role: 'user' as const,
                content: {
                    type: 'text' as const,
                    text: `Please explain the concept of "${args.concept}" at a ${level} level.${includeExamples ? '\n\nPlease include practical examples to illustrate the concept.' : ''}`,
                },
            },
        ];
    }
}

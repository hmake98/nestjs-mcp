import { Injectable } from '@nestjs/common';
import { MCPTool, MCPToolWithParams } from 'nestjs-mcp';

@Injectable()
export class CalculatorService {
    @MCPToolWithParams({
        name: 'add',
        description: 'Add two numbers together',
        parameters: [
            {
                name: 'a',
                type: 'number',
                description: 'First number',
                required: true,
            },
            {
                name: 'b',
                type: 'number',
                description: 'Second number',
                required: true,
            },
        ],
    })
    async add(params: { a: number; b: number }): Promise<number> {
        return params.a + params.b;
    }

    @MCPToolWithParams({
        name: 'multiply',
        description: 'Multiply two numbers',
        parameters: [
            {
                name: 'a',
                type: 'number',
                description: 'First number',
                required: true,
            },
            {
                name: 'b',
                type: 'number',
                description: 'Second number',
                required: true,
            },
        ],
    })
    async multiply(params: { a: number; b: number }): Promise<number> {
        return params.a * params.b;
    }

    @MCPTool({
        name: 'reverse-string',
        description: 'Reverse a string',
    })
    async reverseString(params: { text: string }): Promise<string> {
        return params.text.split('').reverse().join('');
    }

    @MCPToolWithParams({
        name: 'calculate',
        description: 'Perform basic arithmetic operations',
        parameters: [
            {
                name: 'operation',
                type: 'string',
                description: 'Operation to perform',
                required: true,
                enum: ['add', 'subtract', 'multiply', 'divide'],
            },
            {
                name: 'a',
                type: 'number',
                description: 'First operand',
                required: true,
            },
            {
                name: 'b',
                type: 'number',
                description: 'Second operand',
                required: true,
            },
        ],
    })
    async calculate(params: {
        operation: 'add' | 'subtract' | 'multiply' | 'divide';
        a: number;
        b: number;
    }): Promise<number> {
        switch (params.operation) {
            case 'add':
                return params.a + params.b;
            case 'subtract':
                return params.a - params.b;
            case 'multiply':
                return params.a * params.b;
            case 'divide':
                if (params.b === 0) {
                    throw new Error('Cannot divide by zero');
                }
                return params.a / params.b;
            default:
                throw new Error('Invalid operation');
        }
    }
}

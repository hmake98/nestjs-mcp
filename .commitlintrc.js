module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        // Type enforcement
        'type-enum': [
            2,
            'always',
            [
                'feat', // New feature
                'fix', // Bug fix
                'docs', // Documentation only changes
                'style', // Changes that don't affect code meaning (formatting, etc)
                'refactor', // Code change that neither fixes a bug nor adds a feature
                'perf', // Performance improvement
                'test', // Adding or updating tests
                'build', // Changes to build system or dependencies
                'ci', // Changes to CI configuration
                'chore', // Other changes that don't modify src or test files
                'revert', // Revert a previous commit
            ],
        ],
        'type-case': [2, 'always', 'lower-case'],
        'type-empty': [2, 'never'],

        // Subject line rules
        'subject-empty': [2, 'never'],
        'subject-full-stop': [2, 'never', '.'],
        'subject-case': [0], // Allow any case for subject (common in NestJS ecosystem)

        // Header (type + subject) rules
        'header-max-length': [2, 'always', 100],

        // Body rules - more lenient following NestJS/Prisma practices
        'body-leading-blank': [2, 'always'], // Require blank line before body
        'body-max-line-length': [1, 'always', 120], // Warning only, 120 chars
        'body-empty': [0], // Body is optional

        // Footer rules - more lenient
        'footer-leading-blank': [2, 'always'], // Require blank line before footer
        'footer-max-line-length': [0], // No limit on footer (for long URLs, refs, etc)

        // Scope rules
        'scope-case': [0], // Allow any case for scope
        'scope-empty': [0], // Scope is optional
    },
    ignores: [
        (commit) => commit.includes('[skip ci]'),
        (commit) => commit.includes('[ci skip]'),
        (commit) => commit.includes('WIP'),
        (commit) => commit.includes('wip'),
    ],
};

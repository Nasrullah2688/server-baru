module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/index.ts',
        '!src/**/*.d.ts',
        '!src/models/**',
        '!src/controllers/**',
        '!src/routes/**',
        '!src/config/**',
        '!src/lib/**',
        '!src/middleware/**',
        '!src/helpers/**',
        '!src/types/**',
        '!src/routes/imageRoute.ts',
        '!src/routes/transactionRouters.ts'
    ]
};
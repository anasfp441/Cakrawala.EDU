module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/tests/**/*.test.ts',
    '**/tests/**/*.spec.ts',
    '**/tests/**/*.test.jsx',
    '**/tests/**/*.spec.jsx',
    '**/tests/**/*.test.tsx',
    '**/tests/**/*.spec.tsx'
  ],
  
  // Test file extensions
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
    'node'
  ],
  
  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Transform files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    '^.+\\.(css|less|scss|sass)$': 'jest-transform-stub',
    '^.+\\.(jpg|jpeg|png|gif|webp|svg)$': 'jest-transform-stub',
    '^.+\\.(woff|woff2|eot|ttf|otf)$': 'jest-transform-stub'
  },
  
  // Transform ignore patterns
  transformIgnorePatterns: [
    '/node_modules/(?!(chart\.js|@chartjs|fabric|konva|react-konva|react-fabric|react-chartjs-2)/)'
  ],
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js',
    '<rootDir>/tests/setup-dom.js'
  ],
  
  // Test setup files
  setupFiles: [
    '<rootDir>/tests/setup-env.js'
  ],
  
  // Test environment setup
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
    customExportConditions: ['node', 'node-addons']
  },
  
  // Coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
    '!src/**/index.{js,jsx,ts,tsx}',
    '!src/**/main.{js,jsx,ts,tsx}',
    '!src/**/App.{js,jsx,ts,tsx}',
    '!src/**/vendor/**',
    '!src/**/node_modules/**',
    '!src/**/coverage/**',
    '!src/**/dist/**',
    '!src/**/build/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/components/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/utils/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './src/services/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Coverage reporters
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'cobertura',
    'json',
    'json-summary'
  ],
  
  // Coverage directory
  coverageDirectory: 'coverage',
  
  // Coverage output directory
  coverageOutputDirectory: 'coverage',
  
  // Test results processor
  testResultsProcessor: 'jest-junit',
  
  // Reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}-{title}',
        titleTemplate: '{classname}-{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true
      }
    ],
    [
      'jest-html-reporters',
      {
        publicPath: './coverage',
        filename: 'test-report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'CBT Sekolah Test Report'
      }
    ]
  ],
  
  // Watch plugins
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  
  // Watch path ignore patterns
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/build/',
    '/.git/',
    '/.vscode/',
    '/.idea/'
  ],
  
  // Test timeout
  testTimeout: 10000,
  
  // Slow test threshold
  slowTestThreshold: 5,
  
  // Max workers
  maxWorkers: '50%',
  
  // Worker idle memory limit
  workerIdleMemoryLimit: '512MB',
  
  // Force exit
  forceExit: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
  
  // Reset modules between tests
  resetModules: true,
  
  // Reset mocks between tests
  resetMocks: true,
  
  // Clear cache
  clearCache: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Detect leaks
  detectLeaks: true,
  
  // Error on deprecated
  errorOnDeprecated: true,
  
  // Fail on coverage
  failOnCoverage: false,
  
  // Global setup
  globalSetup: '<rootDir>/tests/global-setup.js',
  
  // Global teardown
  globalTeardown: '<rootDir>/tests/global-teardown.js',
  
  // Test location in results
  testLocationInResults: true,
  
  // Update snapshots
  updateSnapshot: false,
  
  // Verbose
  verbose: true,
  
  // Silent
  silent: false,
  
  // Notify
  notify: false,
  
  // Notify mode
  notifyMode: 'failure-change',
  
  // Projects for monorepo
  projects: [
    {
      displayName: 'Unit Tests',
      testMatch: [
        '<rootDir>/tests/unit/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/tests/unit/**/*.spec.{js,jsx,ts,tsx}'
      ],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/tests/setup-unit.js']
    },
    {
      displayName: 'Integration Tests',
      testMatch: [
        '<rootDir>/tests/integration/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/tests/integration/**/*.spec.{js,jsx,ts,tsx}'
      ],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/tests/setup-integration.js']
    },
    {
      displayName: 'E2E Tests',
      testMatch: [
        '<rootDir>/tests/e2e/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/tests/e2e/**/*.spec.{js,jsx,ts,tsx}'
      ],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/tests/setup-e2e.js']
    },
    {
      displayName: 'CBT Application Tests',
      testMatch: [
        '<rootDir>/tests/cbt/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/tests/cbt/**/*.spec.{js,jsx,ts,tsx}'
      ],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/tests/setup-cbt.js']
    }
  ],
  
  // Extensions to treat as ES modules
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Globals
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }
  },
  
  // Module paths
  modulePaths: [
    '<rootDir>/src',
    '<rootDir>/node_modules'
  ],
  
  // Module directories
  moduleDirectories: [
    'node_modules',
    'src'
  ],
  
  // Module file extensions
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx',
    'json',
    'node'
  ],
  
  // Module name mapping for CSS modules
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/tests/__mocks__/fileMock.js',
    '\\.(woff|woff2|eot|ttf|otf)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },
  
  // Test path ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/build/',
    '/.git/',
    '/.vscode/',
    '/.idea/',
    '/tests/__mocks__/',
    '/tests/setup/'
  ],
  
  // Test regex
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  
  // Test URL
  testURL: 'http://localhost:3000',
  
  // Timers
  timers: 'modern',
  
  // Unmocked module path patterns
  unmockedModulePathPatterns: [
    'node_modules/react/',
    'node_modules/react-dom/',
    'node_modules/chart.js/',
    'node_modules/@chartjs/'
  ],
  
  // Preprocessor ignore patterns
  preprocessorIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/build/'
  ],
  
  // Root directory
  rootDir: '.',
  
  // Roots
  roots: [
    '<rootDir>/src',
    '<rootDir>/tests'
  ],
  
  // Runtime
  runtime: 'node',
  
  // Scripts
  scripts: {
    'test': 'jest',
    'test:watch': 'jest --watch',
    'test:coverage': 'jest --coverage',
    'test:ci': 'jest --ci --coverage --watchAll=false',
    'test:debug': 'node --inspect-brk node_modules/.bin/jest --runInBand',
    'test:unit': 'jest --testPathPattern=tests/unit',
    'test:integration': 'jest --testPathPattern=tests/integration',
    'test:e2e': 'jest --testPathPattern=tests/e2e',
    'test:cbt': 'jest --testPathPattern=tests/cbt'
  }
};
module.exports = {
  // PHP files
  '*.php': [
    'php -l',
    'vendor/bin/phpcs --standard=PSR12 --fix',
    'vendor/bin/phpstan analyse --level=5',
    'git add'
  ],
  
  // JavaScript/TypeScript files
  '*.{js,jsx,ts,tsx}': [
    'eslint --fix',
    'prettier --write',
    'git add'
  ],
  
  // CSS/SCSS files
  '*.{css,scss}': [
    'stylelint --fix',
    'prettier --write',
    'git add'
  ],
  
  // HTML files
  '*.html': [
    'prettier --write',
    'git add'
  ],
  
  // JSON files
  '*.json': [
    'prettier --write',
    'git add'
  ],
  
  // Markdown files
  '*.md': [
    'prettier --write',
    'markdownlint --fix',
    'git add'
  ],
  
  // YAML files
  '*.{yml,yaml}': [
    'prettier --write',
    'git add'
  ],
  
  // XML files
  '*.xml': [
    'prettier --write',
    'git add'
  ],
  
  // SQL files
  '*.sql': [
    'prettier --write',
    'git add'
  ],
  
  // Configuration files
  '*.{ini,conf,config}': [
    'prettier --write',
    'git add'
  ],
  
  // Shell scripts
  '*.sh': [
    'shellcheck --fix',
    'prettier --write',
    'git add'
  ],
  
  // Docker files
  'Dockerfile*': [
    'hadolint',
    'git add'
  ],
  
  // Docker Compose files
  'docker-compose*.yml': [
    'docker-compose config --quiet',
    'prettier --write',
    'git add'
  ],
  
  // All files
  '*': [
    'git add'
  ]
};
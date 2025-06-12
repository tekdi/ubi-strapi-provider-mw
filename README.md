# UBI Strapi Provider Middleware (ubi-strapi-provider-mw)

## Description

This is a <a href="http://nestjs.com/" target="blank">Nestjs</a> based application

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Code Quality Scripts

```bash
# Lint all files and auto-fix issues
npm run lint

# Check linting issues without fixing
npm run lint:check

# Fix all auto-fixable linting issues
npm run lint:fix

# Run lint-staged (used by pre-commit hook)
npm run lint:staged
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

- [deployment documentation](https://docs.nestjs.com/deployment) for more information.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# 🐕 Husky Git Hooks Setup Guide

## Manual Setup

```bash
# Install dependencies and Husky hooks
npm install && npm run prepare

# Set Git hooks path (required for Husky to work)
git config core.hooksPath .husky/_

# Verify hooks are executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg

# Check Git configuration
git config core.hooksPath
# Should output: .husky/_
```

## Commit Workflow

When you run `git commit`, the following happens:

1. **ESLint Validation** → Lints staged files and auto-fixes issues
2. **Build Validation** → Ensures TypeScript compiles without errors
3. **Commit Message Validation** → Checks message format
4. **Commit Success** → Only if all validations pass

## Troubleshooting

### ESLint Issues

If ESLint validation fails:

```bash
# See detailed linting errors
npm run lint:check

# Auto-fix issues where possible
npm run lint:fix

# Check specific file
npx eslint src/path/to/file.ts
```

### Build Issues

If build validation fails:

```bash
# See detailed build errors
npm run build

# Start development server to see live errors
npm run start:dev
```

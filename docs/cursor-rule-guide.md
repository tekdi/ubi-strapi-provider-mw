# Cursor Rules Guide for UBI Strapi Provider Middleware

This guide explains when and how to use the various cursor rules available in this project to maintain code quality, consistency, and best practices.

## Overview

Cursor rules are AI-powered coding guidelines that help maintain consistent code quality and architectural patterns across the project. They provide context-aware suggestions and enforce best practices specific to different aspects of development.

## Available Rules

### 1. ubi-strapi-provider-mw (Project-Specific)
**When to Use**: Always use when working on this specific project

**Use Cases**:
- Understanding the project architecture and module structure
- Working with Strapi integration and admin panel features
- Managing applications, benefits, and file storage
- Implementing ONDC compliance and DSEP integration
- Database operations with Prisma models
- Authentication and authorization patterns
- File storage with AWS S3 or local adapters

**Key Areas Covered**:
- Project-specific technology stack and dependencies
- Database schema and Prisma models
- API endpoints and request/response patterns
- Environment configuration and validation
- Security implementation and data encryption
- Testing strategies and development workflow

### 2. nestjs-1-core-architecture
**When to Use**: When implementing core NestJS architecture patterns

**Use Cases**:
- Setting up new modules and services
- Implementing dependency injection patterns
- Organizing project structure and file naming
- Configuring modules and providers
- Implementing 12-factor app principles
- Setting up configuration management

**Key Areas Covered**:
- Layered architecture (Controller, Service, Repository)
- Module organization and dependency injection
- Project structure standards
- Configuration management patterns
- Code quality and naming conventions

### 3. nestjs-2-api-design-rest
**When to Use**: When designing RESTful APIs and implementing controllers

**Use Cases**:
- Creating new API endpoints
- Implementing HTTP methods and status codes
- Designing request/response DTOs
- Setting up API versioning
- Implementing pagination and filtering
- Adding Swagger documentation

**Key Areas Covered**:
- RESTful design principles
- HTTP methods and status codes
- Controller implementation patterns
- Request/response validation
- API documentation with Swagger
- Error handling in controllers

### 4. nestjs-3-documentation
**When to Use**: When creating API documentation and writing code documentation

**Use Cases**:
- Setting up Swagger/OpenAPI documentation
- Writing JSDoc comments for services
- Creating comprehensive README files
- Documenting DTOs and entities
- Adding API examples and descriptions

**Key Areas Covered**:
- Swagger configuration and setup
- API endpoint documentation
- DTO and entity documentation
- Code documentation standards
- README file templates

### 5. nestjs-4-deployment-config
**When to Use**: When configuring deployments and environment settings

**Use Cases**:
- Setting up environment configurations
- Configuring Docker containers
- Setting up CI/CD pipelines
- Implementing health checks
- Managing production configurations

**Key Areas Covered**:
- Environment configuration management
- Docker configuration
- Health check implementation
- Production deployment considerations
- Configuration validation

### 6. nestjs-5-error-handling
**When to Use**: When implementing error handling and monitoring

**Use Cases**:
- Creating custom exception classes
- Implementing global exception filters
- Setting up logging and monitoring
- Implementing circuit breakers
- Adding error recovery mechanisms

**Key Areas Covered**:
- Exception management patterns
- Error response formats
- Logging and monitoring
- Error classification
- Recovery and circuit breaker patterns

### 7. nestjs-6-database-performance
**When to Use**: When working with databases and optimizing performance

**Use Cases**:
- Implementing database operations
- Optimizing database queries
- Setting up caching strategies
- Implementing background processing
- Performance monitoring

**Key Areas Covered**:
- Database optimization patterns
- Caching strategies
- Query optimization
- Background processing
- Performance monitoring

### 8. nestjs-7-security-auth
**When to Use**: When implementing security features and authentication

**Use Cases**:
- Setting up authentication systems
- Implementing authorization patterns
- Adding input validation
- Implementing security headers
- Setting up rate limiting

**Key Areas Covered**:
- Authentication and authorization
- Input validation and sanitization
- Security configuration
- Rate limiting and abuse prevention
- Data protection patterns

### 9. nestjs-8-testing-quality
**When to Use**: When writing tests and ensuring code quality

**Use Cases**:
- Writing unit tests
- Implementing integration tests
- Setting up E2E tests
- Creating test fixtures
- Implementing test coverage

**Key Areas Covered**:
- Testing strategies and patterns
- Test organization and structure
- Test data management
- Coverage requirements
- Testing best practices

## How to Use Cursor Rules

### 1. Automatic Application
Some rules are automatically applied based on file patterns:
- **Project-specific rules**: Applied when working in the project directory
- **File-type rules**: Applied based on file extensions and patterns

### 2. Manual Application
You can manually apply rules by:
- Mentioning the rule name in your request
- Using specific keywords that trigger rule application
- Referencing the rule in your code comments

### 3. Rule Combinations
You can combine multiple rules for comprehensive guidance:
```
"Use nestjs-2-api-design-rest and nestjs-7-security-auth when creating the new authentication endpoint"
```

## Rule Selection Guidelines

### For New Features
1. **Start with ubi-strapi-provider-mw** for project context
2. **Add nestjs-1-core-architecture** for module structure
3. **Include nestjs-2-api-design-rest** for API design
4. **Add nestjs-7-security-auth** for security considerations
5. **Include nestjs-8-testing-quality** for testing

### For Database Work
1. **Use ubi-strapi-provider-mw** for Prisma models
2. **Add nestjs-6-database-performance** for optimization
3. **Include nestjs-5-error-handling** for error management

### For API Development
1. **Use nestjs-2-api-design-rest** for RESTful design
2. **Add nestjs-3-documentation** for API docs
3. **Include nestjs-7-security-auth** for security
4. **Add nestjs-5-error-handling** for error responses

### For Deployment
1. **Use nestjs-4-deployment-config** for configuration
2. **Add nestjs-5-error-handling** for monitoring
3. **Include nestjs-6-database-performance** for optimization

## Best Practices

### 1. Always Start with Project Context
- Begin with `ubi-strapi-provider-mw` to understand the project structure
- Reference the specific technology stack and patterns used

### 2. Layer Your Approach
- Use core architecture rules for structure
- Add specific rules for implementation details
- Include quality rules for testing and security

### 3. Consider Dependencies
- Security rules should be applied with API design rules
- Performance rules should be used with database rules
- Documentation rules should accompany API development

### 4. Maintain Consistency
- Use the same rule combinations for similar features
- Follow established patterns within the project
- Reference existing implementations for guidance

## Troubleshooting

### Rule Not Applying
- Check if the rule name is correctly referenced
- Ensure the file type matches the rule's scope
- Verify the rule is available in the project

### Conflicting Guidance
- Prioritize project-specific rules over general ones
- Use the most specific rule for the current task
- Combine rules carefully to avoid conflicts

### Performance Considerations
- Don't apply unnecessary rules
- Use targeted rules for specific tasks
- Avoid over-engineering with too many rules

## Examples

### Creating a New API Endpoint
```markdown
Use the following rules:
1. ubi-strapi-provider-mw - for project context and patterns
2. nestjs-2-api-design-rest - for RESTful API design
3. nestjs-7-security-auth - for authentication and validation
4. nestjs-3-documentation - for Swagger documentation
```

### Implementing Database Operations
```markdown
Use the following rules:
1. ubi-strapi-provider-mw - for Prisma models and patterns
2. nestjs-6-database-performance - for optimization
3. nestjs-5-error-handling - for error management
```

### Setting Up Authentication
```markdown
Use the following rules:
1. ubi-strapi-provider-mw - for Strapi integration patterns
2. nestjs-7-security-auth - for security implementation
3. nestjs-1-core-architecture - for module structure
```

## Conclusion

Cursor rules are powerful tools for maintaining code quality and consistency. By understanding when and how to use each rule, you can ensure that your code follows best practices and project-specific patterns. Always start with the project-specific rule and layer additional rules based on your specific needs.

Remember that these rules are guidelines, not strict requirements. Use them to inform your decisions and maintain consistency, but adapt them to your specific use cases when necessary. 
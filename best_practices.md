
<b>Pattern 1: Use consistent parameter naming conventions throughout the codebase, specifically using 'authToken' instead of 'authorization' for authentication token parameters in controllers and services. This improves code readability and maintains consistency across the application.
</b>

Example code before:
```
async findAll(@Query() listDto: ListApplicationsDto, authorization: string) {
  return this.service.findAll(listDto, authorization);
}
```

Example code after:
```
async findAll(@Query() listDto: ListApplicationsDto, authToken: string) {
  return this.service.findAll(listDto, authToken);
}
```

<details><summary>Examples for relevant past discussions:</summary>

- https://github.com/tekdi/ubi-strapi-provider-mw/pull/70#discussion_r2120301454
- https://github.com/tekdi/ubi-strapi-provider-mw/pull/70#discussion_r2120305340
- https://github.com/tekdi/ubi-strapi-provider-mw/pull/70#discussion_r2120305822
</details>


___

<b>Pattern 2: Extract authentication tokens directly within service methods using utility functions like getAuthToken(req) rather than passing tokens as separate parameters from controllers to services. This reduces parameter coupling and centralizes token extraction logic.
</b>

Example code before:
```
// Controller
async findAll(@Query() listDto: ListApplicationsDto, @Req() req: Request) {
  const authToken = getAuthToken(req);
  return this.service.findAll(listDto, authToken);
}
// Service
async findAll(listDto: ListApplicationsDto, authToken: string) { }
```

Example code after:
```
// Controller
async findAll(@Query() listDto: ListApplicationsDto, @Req() req: Request) {
  return this.service.findAll(listDto, req);
}
// Service
async findAll(listDto: ListApplicationsDto, req: Request) {
  const authToken = getAuthToken(req);
}
```

<details><summary>Examples for relevant past discussions:</summary>

- https://github.com/tekdi/ubi-strapi-provider-mw/pull/70#discussion_r2123425272
</details>


___

<b>Pattern 3: Apply the Single Responsibility Principle by splitting functions that perform multiple tasks into separate, focused functions. Each function should have one clear responsibility, and complex operations should be decomposed into smaller, more manageable functions.
</b>

Example code before:
```
async checkAndFormatEligibility(benefitDefinition: any, application: any, strictCheck: boolean) {
  // Format eligibility rules
  const rules = this.formatRules(benefitDefinition);
  // Check eligibility
  const result = await this.checkEligibility(rules, application);
  return result;
}
```

Example code after:
```
async getEligibilityRules(benefitDefinition: any) {
  return this.formatRules(benefitDefinition);
}

async checkApplicationEligibility(rules: any, application: any) {
  return await this.checkEligibility(rules, application);
}
```

<details><summary>Examples for relevant past discussions:</summary>

- https://github.com/tekdi/ubi-strapi-provider-mw/pull/74#discussion_r2128521396
</details>


___

<b>Pattern 4: Name functions based on their actual behavior rather than their intended purpose. When a function performs access control checks and returns boolean results, use names like 'canAccessBenefit' instead of 'getBenefitData' to accurately reflect the function's responsibility.
</b>

Example code before:
```
async getBenefitData(benefitId: string, authToken: string, userId: number): Promise<boolean> {
  const benefit = await this.getBenefit(benefitId);
  // Access control logic
  return hasAccess;
}
```

Example code after:
```
async canAccessBenefit(benefitId: string, authToken: string, userId: number): Promise<boolean> {
  const benefit = await this.getBenefit(benefitId);
  // Access control logic
  return hasAccess;
}
```

<details><summary>Examples for relevant past discussions:</summary>

- https://github.com/tekdi/ubi-strapi-provider-mw/pull/87#discussion_r2149422021
</details>


___

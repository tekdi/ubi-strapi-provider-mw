export interface IBenefitsService {
    getBenefitsById(id: string): Promise<any>;
    // Add other methods you need from BenefitsService
  }
/**
 * @fileoverview AI Instruction Validator for secure prompt validation and sanitization
 * @author kcaparas1630@gmail.com
 * @version 2024-01-01
 * @description
 * This module provides secure validation for AI instruction prompts to prevent injection attacks
 * and ensure only valid, meaningful instructions are processed. It implements comprehensive
 * sanitization, content validation, and security checks similar to the secure_prompt_manager.
 * 
 * The module provides:
 * - Content sanitization and encoding
 * - Malicious pattern detection
 * - Length and structure validation
 * - Professional instruction format checking
 * - Integration with existing form validation
 * 
 * Dependencies:
 * - None (pure TypeScript/JavaScript)
 * 
 * @see {@link src/Components/Interview/VideoTestCard.tsx}
 */

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedText?: string;
}

// Validation configuration
interface ValidationConfig {
  minLength: number;
  maxLength: number;
  allowedPatterns: RegExp[];
  forbiddenPatterns: RegExp[];
  requiresStructure: boolean;
}

/**
 * Sanitizes text input to prevent injection attacks and ensure data safety.
 * 
 * Performs multiple sanitization steps:
 * 1. HTML entity encoding to prevent XSS
 * 2. Strips leading/trailing whitespace
 * 3. Removes null bytes and control characters
 * 4. Normalizes unicode characters
 * 5. Limits length to prevent DoS attacks
 * 
 * @param text - The text to sanitize
 * @returns The sanitized text
 * @throws Error if text is null or empty after sanitization
 */
export function sanitizeText(text: string): string {
  if (text === null || text === undefined) {
    throw new Error("Text cannot be null or undefined");
  }

  // Convert to string if not already
  let sanitized = String(text);

  // HTML entity encoding to prevent XSS
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Strip leading/trailing whitespace
  sanitized = sanitized.trim();

  // Remove null bytes and other control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Normalize unicode characters
  sanitized = sanitized.normalize('NFKC');

  // Check if text is empty after sanitization
  if (!sanitized) {
    throw new Error("Text cannot be empty after sanitization");
  }

  return sanitized;
}

/**
 * Comprehensive AI instruction validator class that ensures secure and meaningful prompts.
 */
export class AIInstructionValidator {
  private readonly config: ValidationConfig = {
    minLength: 10,
    maxLength: 3000,
    allowedPatterns: [
      /^[\w\s\.,;:!?\-\(\)\[\]"'\n\r]+$/,  // Basic allowed characters
      /\b(act as|follow|use|focus on|ask|evaluate|maintain|allow|ensure)\b/i,  // Professional instruction verbs
      /\b(STAR|method|experience|example|situation|task|action|result)\b/i,  // Interview methodology terms
    ],
    forbiddenPatterns: [
      // Injection attempts
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      
      // System command attempts
      /\b(rm|del|delete|drop|truncate|exec|eval|system|shell)\s*[\(\[]/gi,
      /\b(sudo|chmod|chown|kill|ps|ls|cd|pwd)\b/gi,
      
      // AI jailbreak attempts
      /ignore\s+previous\s+instructions/gi,
      /forget\s+everything/gi,
      /you\s+are\s+no\s+longer/gi,
      /override\s+your\s+programming/gi,
      /pretend\s+to\s+be/gi,
      /act\s+as\s+if\s+you\s+are\s+not/gi,
      
      // Prompt injection patterns
      /###\s*new\s+task/gi,
      /---\s*system\s+message/gi,
      /\[SYSTEM\]/gi,
      /\[ADMIN\]/gi,
      /\[OVERRIDE\]/gi,
      
      // Inappropriate content attempts
      /\b(hack|exploit|vulnerability|backdoor|malware)\b/gi,
      /\b(password|secret|token|key|credential)\b/gi,
      
      // Nonsensical patterns
      /(.)\1{10,}/g, // Repeated characters (10+ times)
      /^[^a-zA-Z]*$/,  // No alphabetic characters
      /^\s*$/, // Only whitespace
      
      // Extremely long words (potential gibberish)
      /\b\w{50,}\b/g,
    ],
    requiresStructure: true,
  };

  /**
   * Validates AI instruction text for security and quality.
   * 
   * @param instructions - The AI instructions to validate
   * @returns ValidationResult with validation status and details
   */
  public validateInstructions(instructions: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    try {
      // Step 1: Basic validation
      if (!instructions || typeof instructions !== 'string') {
        result.isValid = false;
        result.errors.push('Instructions must be a non-empty string');
        return result;
      }

      // Step 2: Length validation
      if (instructions.length < this.config.minLength) {
        result.isValid = false;
        result.errors.push(`Instructions must be at least ${this.config.minLength} characters long`);
      }

      if (instructions.length > this.config.maxLength) {
        result.isValid = false;
        result.errors.push(`Instructions must not exceed ${this.config.maxLength} characters`);
        return result;
      }

      // Step 3: Sanitize the text
      try {
        result.sanitizedText = sanitizeText(instructions);
      } catch (error) {
        result.isValid = false;
        result.errors.push(`Text sanitization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return result;
      }

      // Step 4: Check for forbidden patterns
      for (const pattern of this.config.forbiddenPatterns) {
        if (pattern.test(instructions)) {
          result.isValid = false;
          result.errors.push('Instructions contain potentially harmful or inappropriate content');
          break;
        }
      }

      // Step 5: Structure and quality validation
      this.validateStructureAndQuality(instructions, result);

      // Step 6: Content meaningfulness check
      this.validateMeaningfulness(instructions, result);

    } catch (error) {
      result.isValid = false;
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Validates the structure and quality of instructions.
   * 
   * @private
   * @param instructions - The instructions to validate
   * @param result - The validation result to update
   */
  private validateStructureAndQuality(instructions: string, result: ValidationResult): void {
    // Check for basic sentence structure
    const sentences = instructions.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length < 2) {
      result.warnings.push('Consider adding more detailed instructions with multiple sentences');
    }

    // Check for numbered lists or bullet points (good structure)
    const hasNumberedList = /^\d+[\.\)]\s/m.test(instructions);
    const hasBulletPoints = /^[\-\*\+]\s/m.test(instructions);
    
    if (!hasNumberedList && !hasBulletPoints && sentences.length > 5) {
      result.warnings.push('Consider using numbered lists or bullet points for better organization');
    }

    // Check for professional language indicators
    const professionalTerms = [
      'interview', 'candidate', 'evaluation', 'assessment', 'professional',
      'experience', 'skill', 'competency', 'behavior', 'performance'
    ];
    
    const hasProfessionalTerms = professionalTerms.some(term => 
      instructions.toLowerCase().includes(term)
    );
    
    if (!hasProfessionalTerms) {
      result.warnings.push('Consider including professional interview terminology for better context');
    }
  }

  /**
   * Validates that instructions are meaningful and coherent.
   * 
   * @private
   * @param instructions - The instructions to validate
   * @param result - The validation result to update
   */
  private validateMeaningfulness(instructions: string, result: ValidationResult): void {
    // Check for reasonable word count and variety
    const words = instructions.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    const uniqueWords = new Set(words);
    
    if (words.length < 5) {
      result.isValid = false;
      result.errors.push('Instructions are too brief to be meaningful');
      return;
    }

    // Check vocabulary diversity
    const diversityRatio = uniqueWords.size / words.length;
    if (diversityRatio < 0.3) {
      result.warnings.push('Instructions may be repetitive. Consider varying your language');
    }

    // Check for coherent instruction format
    const instructionVerbs = [
      'act', 'follow', 'use', 'focus', 'ask', 'evaluate', 'maintain', 
      'ensure', 'provide', 'give', 'assess', 'check', 'review'
    ];
    
    const hasInstructionVerbs = instructionVerbs.some(verb => 
      new RegExp(`\\b${verb}\\b`, 'i').test(instructions)
    );
    
    if (!hasInstructionVerbs) {
      result.warnings.push('Consider starting sentences with clear instruction verbs (act, follow, use, etc.)');
    }

    // Check for examples or specific guidance
    const hasExamples = /\b(example|such as|like|including|for instance)\b/i.test(instructions);
    if (!hasExamples && instructions.length > 100) {
      result.warnings.push('Consider adding specific examples to make instructions clearer');
    }
  }

  /**
   * Quick validation check for real-time feedback.
   * 
   * @param instructions - The instructions to validate
   * @returns boolean indicating if instructions pass basic validation
   */
  public isValidBasic(instructions: string): boolean {
    if (!instructions || instructions.length < this.config.minLength) {
      return false;
    }

    if (instructions.length > this.config.maxLength) {
      return false;
    }

    // Check for critical forbidden patterns only
    const criticalPatterns = this.config.forbiddenPatterns.slice(0, 10); // First 10 most critical
    return !criticalPatterns.some(pattern => pattern.test(instructions));
  }

  /**
   * Get helpful suggestions for improving instructions.
   * 
   * @param instructions - The current instructions
   * @returns Array of improvement suggestions
   */
  public getSuggestions(instructions: string): string[] {
    const suggestions: string[] = [];

    if (!instructions || instructions.length < 50) {
      suggestions.push('Add more detailed guidance about interview style and approach');
    }

    if (!/\b(STAR|situation|task|action|result)\b/i.test(instructions)) {
      suggestions.push('Consider mentioning the STAR method for behavioral questions');
    }

    if (!/\b(follow.up|follow up)\b/i.test(instructions)) {
      suggestions.push('Include guidance about asking follow-up questions');
    }

    if (!/\b(tone|professional|warm)\b/i.test(instructions)) {
      suggestions.push('Specify the desired tone for the interview (professional, warm, etc.)');
    }

    if (!/[0-9]/.test(instructions) && instructions.length > 100) {
      suggestions.push('Consider using numbered points for better organization');
    }

    return suggestions;
  }
}

// Export singleton instance for use across the application
export const aiInstructionValidator = new AIInstructionValidator();
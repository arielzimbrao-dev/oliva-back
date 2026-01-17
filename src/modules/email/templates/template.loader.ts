import * as fs from 'fs';
import * as path from 'path';
import { getTranslation } from '../i18n/translations';

export interface TemplateVariables {
  [key: string]: string | number;
}

/**
 * Load HTML template from file
 */
export function loadTemplate(templateName: string): string {
  const templatePath = path.join(__dirname, 'html', `${templateName}.html`);
  return fs.readFileSync(templatePath, 'utf-8');
}

/**
 * Replace template variables with actual values
 */
export function replaceVariables(template: string, variables: TemplateVariables): string {
  let result = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value));
  }
  
  return result;
}

/**
 * Get reset password email HTML
 */
export function getResetPasswordEmail(
  userName: string,
  resetUrl: string,
  language: string = 'pt',
  expirationMinutes: number = 60,
): string {
  const t = getTranslation(language).resetPassword;
  const template = loadTemplate('reset-password');
  
  const variables: TemplateVariables = {
    language: language || 'pt',
    subject: t.subject,
    greeting: t.greeting,
    userName,
    body1: t.body1,
    body2: t.body2,
    buttonText: t.buttonText,
    resetUrl,
    orCopyLink: t.orCopyLink,
    warningTitle: t.warningTitle,
    warningText: t.warningText.replace('{minutes}', String(expirationMinutes)),
    footer: t.footer,
    autoMessage: t.autoMessage,
    year: new Date().getFullYear(),
  };
  
  return replaceVariables(template, variables);
}

/**
 * Get welcome email HTML
 */
export function getWelcomeEmail(
  userName: string,
  churchName: string,
  language: string = 'pt',
): string {
  const t = getTranslation(language).welcome;
  const template = loadTemplate('welcome');
  
  const variables: TemplateVariables = {
    language: language || 'pt',
    subject: t.subject,
    greeting: t.greeting,
    userName,
    body1: t.body1,
    body2: t.body2.replace('{churchName}', churchName),
    body3: t.body3,
    footer: getTranslation(language).resetPassword.footer,
    year: new Date().getFullYear(),
  };
  
  return replaceVariables(template, variables);
}

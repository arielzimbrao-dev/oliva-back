export interface EmailTranslations {
  resetPassword: {
    subject: string;
    greeting: string;
    body1: string;
    body2: string;
    buttonText: string;
    orCopyLink: string;
    warningTitle: string;
    warningText: string;
    footer: string;
    autoMessage: string;
  };
  welcome: {
    subject: string;
    greeting: string;
    body1: string;
    body2: string;
    body3: string;
  };
}

export const translations: Record<string, EmailTranslations> = {
  pt: {
    resetPassword: {
      subject: 'Oliva: Recupere sua senha de acesso',
      greeting: 'Olá',
      body1: 'Recebemos uma solicitação para redefinir a senha da sua conta no',
      body2: 'Clique no botão abaixo para criar uma nova senha:',
      buttonText: 'Redefinir Senha',
      orCopyLink: 'Ou copie e cole o link abaixo no seu navegador:',
      warningTitle: 'Importante:',
      warningText: 'Este link expira em {minutes} minutos. Se você não solicitou a redefinição de senha, ignore este email e sua senha permanecerá inalterada.',
      footer: 'Oliva - Sistema de Gestão de Igrejas',
      autoMessage: 'Este é um email automático, por favor não responda.',
    },
    welcome: {
      subject: 'Bem-vindo ao Oliva!',
      greeting: 'Olá',
      body1: 'Seja muito bem-vindo ao <strong>Oliva</strong>, o sistema completo de gestão para igrejas!',
      body2: 'Sua conta na igreja <strong>{churchName}</strong> foi criada com sucesso. Agora você tem acesso a todas as funcionalidades para gerenciar sua comunidade de forma eficiente.',
      body3: 'Estamos felizes em tê-lo conosco! 🙏',
    },
  },
  en: {
    resetPassword: {
      subject: 'Oliva: Reset your password',
      greeting: 'Hello',
      body1: 'We received a request to reset your account password on',
      body2: 'Click the button below to create a new password:',
      buttonText: 'Reset Password',
      orCopyLink: 'Or copy and paste the link below into your browser:',
      warningTitle: 'Important:',
      warningText: 'This link expires in {minutes} minutes. If you did not request a password reset, please ignore this email and your password will remain unchanged.',
      footer: 'Oliva - Church Management System',
      autoMessage: 'This is an automated email, please do not reply.',
    },
    welcome: {
      subject: 'Welcome to Oliva!',
      greeting: 'Hello',
      body1: 'Welcome to <strong>Oliva</strong>, the complete church management system!',
      body2: 'Your account at <strong>{churchName}</strong> church has been successfully created. You now have access to all features to efficiently manage your community.',
      body3: 'We are happy to have you with us! 🙏',
    },
  },
  es: {
    resetPassword: {
      subject: 'Oliva: Recupera tu contraseña',
      greeting: 'Hola',
      body1: 'Recibimos una solicitud para restablecer la contraseña de tu cuenta en',
      body2: 'Haz clic en el botón de abajo para crear una nueva contraseña:',
      buttonText: 'Restablecer Contraseña',
      orCopyLink: 'O copia y pega el enlace de abajo en tu navegador:',
      warningTitle: 'Importante:',
      warningText: 'Este enlace expira en {minutes} minutos. Si no solicitaste restablecer tu contraseña, ignora este correo y tu contraseña permanecerá sin cambios.',
      footer: 'Oliva - Sistema de Gestión de Iglesias',
      autoMessage: 'Este es un correo automático, por favor no respondas.',
    },
    welcome: {
      subject: '¡Bienvenido a Oliva!',
      greeting: 'Hola',
      body1: '¡Bienvenido a <strong>Oliva</strong>, el sistema completo de gestión para iglesias!',
      body2: 'Tu cuenta en la iglesia <strong>{churchName}</strong> ha sido creada exitosamente. Ahora tienes acceso a todas las funcionalidades para gestionar tu comunidad de manera eficiente.',
      body3: '¡Estamos felices de tenerte con nosotros! 🙏',
    },
  },
  fr: {
    resetPassword: {
      subject: 'Oliva: Réinitialisez votre mot de passe',
      greeting: 'Bonjour',
      body1: 'Nous avons reçu une demande de réinitialisation du mot de passe de votre compte sur',
      body2: 'Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe:',
      buttonText: 'Réinitialiser le mot de passe',
      orCopyLink: 'Ou copiez et collez le lien ci-dessous dans votre navigateur:',
      warningTitle: 'Important:',
      warningText: 'Ce lien expire dans {minutes} minutes. Si vous n\'avez pas demandé de réinitialisation de mot de passe, veuillez ignorer cet email et votre mot de passe restera inchangé.',
      footer: 'Oliva - Système de Gestion d\'Églises',
      autoMessage: 'Ceci est un email automatique, veuillez ne pas répondre.',
    },
    welcome: {
      subject: 'Bienvenue sur Oliva!',
      greeting: 'Bonjour',
      body1: 'Bienvenue sur <strong>Oliva</strong>, le système complet de gestion pour les églises!',
      body2: 'Votre compte à l\'église <strong>{churchName}</strong> a été créé avec succès. Vous avez maintenant accès à toutes les fonctionnalités pour gérer efficacement votre communauté.',
      body3: 'Nous sommes heureux de vous avoir avec nous! 🙏',
    },
  },
};

export function getTranslation(language: string = 'pt'): EmailTranslations {
  const lang = language?.toLowerCase() || 'pt';
  return translations[lang] || translations.pt;
}

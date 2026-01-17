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
  paymentFailed: {
    subject: string;
    greeting: string;
    body1: string;
    body2: string;
    body3: string;
    body4: string;
    body5: string;
    buttonText: string;
    warningTitle: string;
    warningText: string;
    footer: string;
    securityNote: string;
    thanksText: string;
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
    paymentFailed: {
      subject: 'Oliva: Falha no pagamento da sua assinatura',
      greeting: 'Olá',
      body1: 'Não foi possível processar o pagamento da assinatura mensal da igreja',
      body2: 'em nosso sistema.',
      body3: 'Isso pode ter acontecido devido a cartão expirado, saldo insuficiente ou outros problemas com o método de pagamento.',
      body4: 'Para evitar a interrupção dos serviços, por favor acesse sua conta e atualize as informações de pagamento o mais breve possível.',
      body5: 'Se você tiver dúvidas ou precisar de assistência, nossa equipe de suporte está à disposição.',
      buttonText: 'Acessar Minha Conta',
      warningTitle: 'Atenção!',
      warningText: 'Após 3 tentativas de cobrança sem sucesso, sua assinatura será cancelada automaticamente e o acesso aos recursos será suspenso.',
      footer: 'Oliva - Sistema de Gestão de Igrejas',
      securityNote: 'Este é um email automático enviado pelo sistema Oliva. Se você não reconhece esta atividade, entre em contato com nosso suporte imediatamente.',
      thanksText: 'Obrigado por confiar no Oliva!',
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
    paymentFailed: {
      subject: 'Oliva: Payment Failed for Your Subscription',
      greeting: 'Hello',
      body1: 'We were unable to process the monthly subscription payment for',
      body2: 'church in our system.',
      body3: 'This may have occurred due to an expired card, insufficient funds, or other issues with your payment method.',
      body4: 'To avoid service interruption, please access your account and update your payment information as soon as possible.',
      body5: 'If you have questions or need assistance, our support team is available to help.',
      buttonText: 'Access My Account',
      warningTitle: 'Attention!',
      warningText: 'After 3 unsuccessful billing attempts, your subscription will be automatically canceled and access to resources will be suspended.',
      footer: 'Oliva - Church Management System',
      securityNote: 'This is an automated email sent by the Oliva system. If you do not recognize this activity, please contact our support immediately.',
      thanksText: 'Thank you for trusting Oliva!',
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
    paymentFailed: {
      subject: 'Oliva: Fallo en el pago de tu suscripción',
      greeting: 'Hola',
      body1: 'No pudimos procesar el pago de la suscripción mensual de la iglesia',
      body2: 'en nuestro sistema.',
      body3: 'Esto puede haber ocurrido debido a una tarjeta vencida, fondos insuficientes u otros problemas con el método de pago.',
      body4: 'Para evitar la interrupción de los servicios, por favor accede a tu cuenta y actualiza la información de pago lo antes posible.',
      body5: 'Si tienes dudas o necesitas asistencia, nuestro equipo de soporte está a tu disposición.',
      buttonText: 'Acceder a Mi Cuenta',
      warningTitle: '¡Atención!',
      warningText: 'Después de 3 intentos de cobro sin éxito, tu suscripción será cancelada automáticamente y el acceso a los recursos será suspendido.',
      footer: 'Oliva - Sistema de Gestión de Iglesias',
      securityNote: 'Este es un correo automático enviado por el sistema Oliva. Si no reconoces esta actividad, contacta a nuestro soporte inmediatamente.',
      thanksText: '¡Gracias por confiar en Oliva!',
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
    paymentFailed: {
      subject: 'Oliva: Échec du paiement de votre abonnement',
      greeting: 'Bonjour',
      body1: 'Nous n\'avons pas pu traiter le paiement de l\'abonnement mensuel de l\'église',
      body2: 'dans notre système.',
      body3: 'Cela peut être dû à une carte expirée, des fonds insuffisants ou d\'autres problèmes avec votre méthode de paiement.',
      body4: 'Pour éviter l\'interruption des services, veuillez accéder à votre compte et mettre à jour vos informations de paiement dès que possible.',
      body5: 'Si vous avez des questions ou avez besoin d\'aide, notre équipe de support est disponible.',
      buttonText: 'Accéder à Mon Compte',
      warningTitle: 'Attention!',
      warningText: 'Après 3 tentatives de facturation infructueuses, votre abonnement sera automatiquement annulé et l\'accès aux ressources sera suspendu.',
      footer: 'Oliva - Système de Gestion d\'Églises',
      securityNote: 'Ceci est un email automatique envoyé par le système Oliva. Si vous ne reconnaissez pas cette activité, veuillez contacter notre support immédiatement.',
      thanksText: 'Merci de faire confiance à Oliva!',
    },
  },
};

export function getTranslation(language: string = 'pt'): EmailTranslations {
  const lang = language?.toLowerCase() || 'pt';
  return translations[lang] || translations.pt;
}

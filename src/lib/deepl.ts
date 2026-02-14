// DeepL Translation Service with Firebase Cloud Functions
// NOTE: Full translations require Firebase to be on the Blaze (pay-as-you-go) plan
// To enable: https://console.firebase.google.com/project/ogs-solutions/usage/details
// 
// For development/testing, this uses a local fallback translation system
// In production with upgraded Firebase, these functions will call the Cloud Functions

interface TranslationCache {
  [key: string]: string;
}

let translationCache: TranslationCache = {};

// Get the Firebase Cloud Functions URL - adjust based on your region
const FUNCTIONS_URL = 'https://us-central1-ogs-solutions.cloudfunctions.net';
const TRANSLATE_ENDPOINT = `${FUNCTIONS_URL}/translateText`;
const TRANSLATE_BATCH_ENDPOINT = `${FUNCTIONS_URL}/translateBatch`;

// Local translation fallbacks for development (comprehensive phrase dictionary)
const translationFallbacks: { [key: string]: { [key: string]: string } } = {
  'FR': {
    // Navigation & General
    'Start Your LLC': 'Commencez votre LLC',
    'Today': 'Aujourd\'hui',
    'Home': 'Accueil',
    'Services': 'Services',
    'Contact': 'Contact',
    'Company': 'Entreprise',
    'About Us': 'À Propos',
    'Dashboard': 'Tableau de bord',
    'Admin Dashboard': 'Tableau de bord administrateur',
    'Sign Out': 'Se déconnecter',
    'Sign In': 'Se connecter',
    
    // Hero & Main Messages
    'Form your Limited Liability Company in any U.S. state with confidence.\nSimple, affordable, and secure business formation.': 'Formez votre Société à Responsabilité Limitée dans n\'importe quel État américain en toute confiance.\nFormation d\'entreprise simple, abordable et sécurisée.',
    'Form your Limited Liability Company': 'Formez votre Société à Responsabilité Limitée',
    'Get Started Now': 'Commencer maintenant',
    'Learn How It Works': 'Apprenez comment ça fonctionne',
    
    // Benefits
    'No Hidden Fees': 'Pas de frais cachés',
    '100% Satisfaction Guarantee': 'Garantie de satisfaction à 100%',
    'Same-Day Processing': 'Traitement le même jour',
    'Trusted by 10,000+ Entrepreneurs': 'De confiance pour plus de 10 000 entrepreneurs',
    'Fast Processing': 'Traitement rapide',
    'Get your LLC formed in as little as 1-2 business days with our expedited service.': 'Obtenez votre LLC formée en aussi peu que 1-2 jours ouvrables avec notre service accéléré.',
    'Affordable Pricing': 'Tarification abordable',
    'Transparent pricing starting at just $99. No hidden fees or surprises.': 'Tarification transparente à partir de 99 $. Pas de frais cachés ni de surprises.',
    'Secure & Reliable': 'Sûr et fiable',
    'Bank-level security and 100% satisfaction guarantee for peace of mind.': 'Sécurité au niveau bancaire et garantie de satisfaction à 100% pour votre tranquillité d\'esprit.',
    'Expert Support': 'Support Expert',
    '24/7 customer support from LLC formation specialists ready to help.': 'Support client 24h/24 et 7j/7 de la part de spécialistes en formation LLC prêts à vous aider.',
    
    // Why Choose Us Section
    'Why Choose Us': 'Pourquoi nous choisir',
    'Why Choose OGS Solution?': 'Pourquoi choisir OGS Solution?',
    'We make LLC formation easy, fast, and affordable for entrepreneurs nationwide.': 'Nous rendons la formation LLC facile, rapide et abordable pour les entrepreneurs du pays.',
    
    // How It Works
    'Simple Process': 'Processus simple',
    'How It Works': 'Comment ça fonctionne',
    'Four simple steps to get your LLC up and running.': 'Quatre étapes simples pour créer votre LLC.',
    'Start Your LLC Now': 'Commencez votre LLC maintenant',
    'Choose Your State': 'Choisissez votre État',
    'Select the state where you want to form your LLC using our interactive tool.': 'Sélectionnez l\'État dans lequel vous souhaitez former votre LLC en utilisant notre outil interactif.',
    'Select a Package': 'Sélectionner un forfait',
    'Pick the service package that best fits your business needs and budget.': 'Choisissez le forfait de service qui correspond le mieux à vos besoins et à votre budget.',
    'Complete the Form': 'Complétez le formulaire',
    'Fill out our simple step-by-step form with your business information.': 'Remplissez notre formulaire simple étape par étape avec vos informations commerciales.',
    'We Handle Everything': 'Nous gérons tout',
    'Sit back and relax while we file your LLC and handle all the paperwork.': 'Détendez-vous pendant que nous déposons votre LLC et gérons tous les documents.',
    
    // Testimonials Section
    'Client Success Stories': 'Histoires de Succès des Clients',
    'What Our Clients Say': 'Ce Que Disent Nos Clients',
    'Join thousands of entrepreneurs who trust OGS Solution.': 'Rejoignez des milliers d\'entrepreneurs qui font confiance à OGS Solution.',
    'OGS Solution made forming my LLC incredibly easy. The process was straightforward and completed in just 3 days!': 'OGS Solution a rendu la formation de ma LLC incroyablement facile. Le processus était simple et terminé en seulement 3 jours!',
    'Sarah Johnson': 'Sarah Johnson',
    'E-commerce Founder': 'Fondatrice E-commerce',
    'Best decision for my business. The Colorado package included everything I needed, and support was outstanding.': 'La meilleure décision pour mon entreprise. Le forfait Colorado incluait tout ce dont j\'avais besoin, et le support était excellent.',
    'Michael Chen': 'Michael Chen',
    'Consultant': 'Consultant',
    'Professional, efficient, and affordable. I\'ve recommended OGS Solution to all my business partners.': 'Professionnel, efficace et abordable. J\'ai recommandé OGS Solution à tous mes partenaires commerciaux.',
    'Emily Rodriguez': 'Emily Rodriguez',
    'Real Estate Investor': 'Investisseur Immobilier',
    
    // Dashboard & Applications
    'My Dashboard': 'Mon tableau de bord',
    'Welcome Back!': 'Bienvenue!',
    'Track your LLC formation applications': 'Suivez vos demandes de formation LLC',
    'Loading your dashboard...': 'Chargement de votre tableau de bord...',
    'No Applications Yet': 'Aucune application pour le moment',
    'Loading applications...': 'Chargement des applications...',
    'Contact Admin': 'Contacter l\'administrateur',
    'You haven\'t submitted any LLC formation applications yet. Start your business journey today!': 'Vous n\'avez pas encore soumis de demandes de formation LLC. Commencez votre parcours professionnel aujourd\'hui!',
    'Start Your First Application': 'Commencer Votre Première Demande',
    'Awaiting Review': 'En Attente d\'Examen',
    'Your application is pending review. Please ensure payment is completed to proceed.': 'Votre demande est en attente d\'examen. Veuillez vous assurer que le paiement est complété pour continuer.',
    'Submitted on': 'Soumis le',
    'State': 'État',
    'Business': 'Entreprise',
    'Review': 'Examen',
    'Package Type': 'Type de Forfait',
    'Order Status': 'Statut de la Commande',
    'Payment': 'Paiement',
    'Complete Payment': 'Paiement Complet',
    'Messages from Admin': 'Messages de l\'Administrateur',
    'No messages yet': 'Aucun message pour le moment',
    'Application Completed': 'Demande Complétée',
    'Processing Application': 'Traitement de la Demande',
    'Requires Attention': 'Nécessite une Attention',
    'Your LLC has been successfully formed! Congratulations on your new business!': 'Votre LLC a été formée avec succès! Félicitations pour votre nouvelle entreprise!',
    'Your application is being processed. We will notify you of any updates soon.': 'Votre demande est en cours de traitement. Nous vous informerons de toute mise à jour bientôt.',
    'Your application needs attention. Please contact our support team for assistance.': 'Votre demande nécessite une attention. Veuillez contacter notre équipe d\'assistance pour vos demandes.',
    'Total Applications': 'Candidatures Totales',
    
    // Edit Application Modal
    'Edit Application': 'Modifier l\'Application',
    'Update your LLC application details': 'Mettez à jour les détails de votre application LLC',
    'Company Information': 'Informations sur l\'Entreprise',
    'Company Name': 'Nom de l\'Entreprise',
    'Your LLC name': 'Nom de votre LLC',
    'Select a state': 'Sélectionner un état',
    'Business Type': 'Type d\'Entreprise',
    'Select business type': 'Sélectionner le type d\'entreprise',
    'Single Member LLC': 'LLC à Membre Unique',
    'Multi-Member LLC': 'LLC Multi-Membre',
    'Series LLC': 'LLC Série',
    'Contact Information': 'Informations de Contact',
    'Member Name': 'Nom du Membre',
    'Full name': 'Nom complet',
    'Email': 'E-mail',
    'email@example.com': 'email@exemple.com',
    'Phone': 'Téléphone',
    'Phone number': 'Numéro de téléphone',
    'Address': 'Adresse',
    'Street Address': 'Adresse de la rue',
    'Street address': 'Adresse de la rue',
    'City': 'Ville',
    'Zip Code': 'Code Postal',
    'Zip code': 'Code postal',
    'Business Details': 'Détails de l\'Entreprise',
    'Business Purpose': 'Objet d\'Entreprise',
    'Describe your business purpose': 'Décrivez l\'objet de votre entreprise',
    'Cancel': 'Annuler',
    'Save Changes': 'Enregistrer les Modifications',
    'Saving...': 'Enregistrement...',
    
    // Package Tier Names
    'Basic': 'Essentiel',
    'Epic': 'Épique',
    'Ultimate': 'Ultime',
    'Essential LLC registration and documents': 'Enregistrement essentiel et documents LLC',
    'Everything in Basic plus EIN and registered agent': 'Tout ce qui est dans Essentiel plus SIREN et agent enregistré',
    'Complete business setup with maximum support': 'Configuration commerciale complète avec support maximal',
    
    // Feature Descriptions
    'Single-Member LLC': 'LLC à Membre Unique',
    'LLC Formation in your state': 'Formation LLC dans votre état',
    'Business name reservation': 'Réservation du nom commercial',
    'Operating agreement template': 'Modèle d\'accord d\'exploitation',
    'EIN application assistance': 'Assistance à la demande SIREN',
    'Registered agent service': 'Service d\'agent enregistré',
    'Filing and processing': 'Dépôt et traitement',
    'Banking setup assistance': 'Assistance à la configuration bancaire',
    'Accounting software setup': 'Configuration du logiciel comptable',
    'Quarterly compliance check-ins': 'Vérifications de conformité trimestrielles',
    'Tax planning consultation': 'Consultation en planification fiscale',
    '24/7 dedicated support line': 'Ligne de support dédiée 24h/24 et 7j/7',
    'Annual business review meeting': 'Réunion annuelle d\'examen commercial',
    'Business credit building guidance': 'Conseils sur la création de crédit commercial',
    
    // GetStartedPage
    'Quick & Easy Process': 'Processus Rapide et Facile',
    'Start Your LLC Formation': 'Commencez Votre Formation LLC',
    'Complete the following steps to form your LLC': 'Complétez les étapes suivantes pour former votre LLC',
    'Select Your State': 'Sélectionnez Votre État',
    'Choose the state where you want to form your LLC': 'Choisissez l\'État où vous souhaitez former votre LLC',
    'Select a state...': 'Sélectionnez un État...',
    'Choose Your Package': 'Choisissez Votre Forfait',
    'Select the service package that fits your needs': 'Sélectionnez le forfait de service qui correspond à vos besoins',
    'Select a state first to view available packages': 'Sélectionnez d\'abord un État pour voir les forfaits disponibles',
    'Showing prices for': 'Affichage des prix pour',
    'for': 'pour',
    'per state': 'par état',
    'Enter your business details': 'Entrez vos détails commerciaux',
    'Enter your contact details': 'Entrez vos détails de contact',
    'Review Your Information': 'Examinez Vos Informations',
    'Please review your information before submitting': 'Veuillez examiner vos informations avant de soumettre',
    'Features:': 'Caractéristiques:',
    'Included Features:': 'Caractéristiques Incluses:',
    'Summary': 'Résumé',
    'Total Price': 'Prix Total',
    'Package Details': 'Détails du Forfait',
    
    // Contact Page
    'Have questions or need help? Our team is here for you.': 'Avez-vous des questions ou besoin d\'aide? Notre équipe est là pour vous.',
    'Send Us a Message': 'Envoyez-nous un message',
    'Your Name': 'Votre Nom',
    'Your Email': 'Votre E-mail',
    'Your Message': 'Votre Message',
    'Message Sent Successfully!': 'Message envoyé avec succès!',
    'Thank you for contacting us! We\'ll get back to you shortly.': 'Merci de nous avoir contactés! Nous vous répondrons bientôt.',
    'John Doe': 'Jean Dupont',
    'john@example.com': 'jean@exemple.com',
    'How can we help you?': 'Comment pouvons-nous vous aider?',
    'Tell us more about your inquiry...': 'Parlez-nous plus de votre demande...',
    'Our AI assistant is available 24/7 to answer your questions and guide you through the LLC formation process.': 'Notre assistant IA est disponible 24h/24 et 7j/7 pour répondre à vos questions et vous guider à travers le processus de formation LLC.',
    'You can also reach us on WhatsApp using the button in the bottom-right corner.': 'Vous pouvez également nous contacter sur WhatsApp en utilisant le bouton dans le coin inférieur droit.',
    'We\'re Here to Help': 'Nous sommes là pour vous aider',
    'Availability': 'Disponibilité',
    '24/7 Support Available': 'Support 24h/24 et 7j/7 Disponible',
    'Subject': 'Sujet',
    'Message': 'Message',
    'Send Message': 'Envoyer le Message',
    'Sending...': 'Envoi...',
    'Prefer to Chat?': 'Préférez Discuter?',
    
    // Admin Panel
    'Manage LLC formation submissions': 'Gérer les soumissions de formation LLC',
    'Admin Panel': 'Panneau d\'administration',
    'Applications': 'Candidatures',
    'Payments': 'Paiements',
    'Activity Log': 'Journal d\'activité',
    'Contact Submissions': 'Soumissions de contact',
    'State Pricing': 'Tarification d\'État',
    'Packages': 'Forfaits',
    'Payment Methods': 'Méthodes de paiement',
    
    // Status & Actions
    'TOTAL ORDERS': 'COMMANDES TOTALES',
    'PENDING': 'EN ATTENTE',
    'PROCESSING': 'EN COURS DE TRAITEMENT',
    'COMPLETED': 'TERMINÉ',
    'Pending': 'En Attente',
    'Processing': 'En Cours de Traitement',
    'Completed': 'Terminé',
    'In Progress': 'En Cours',
    'Status': 'Statut',
    'Package': 'Forfait',
    'Amount': 'Montant',
    'Created': 'Créé',
    'Action': 'Action',
    'Edit': 'Modifier',
    'Delete': 'Supprimer',
    'Submit': 'Soumettre',
    'Save': 'Enregistrer',
    'Back': 'Retour',
    'Next Step': 'Étape Suivante',
    'Submit Application': 'Soumettre la Demande',
    'Submitting...': 'Soumission en cours...',
    
    // UI & Messages
    'Select Package': 'Sélectionner le forfait',
    'Search companies': 'Rechercher des entreprises',
    'All Status': 'Tous les statuts',
    'All Packages': 'Tous les forfaits',
    'Refresh': 'Actualiser',
    'Loading': 'Chargement',
    'Error': 'Erreur',
    'Success': 'Succès',
    'No data': 'Aucune donnée',
    'Select': 'Sélectionner',
    'CSV': 'CSV',
    'Excel': 'Excel',
    
    // FAQ Section
    'Frequently Asked Questions': 'Questions Fréquemment Posées',
    'Everything you need to know about forming your LLC': 'Tout ce que vous devez savoir sur la formation de votre LLC',
    'What is an LLC?': 'Qu\'est-ce qu\'une LLC?',
    'A Limited Liability Company (LLC) is a business structure that combines the flexibility of a partnership with the liability protection of a corporation. It protects your personal assets from business debts and lawsuits.': 'Une Société à Responsabilité Limitée (LLC) est une structure commerciale qui combine la flexibilité d\'un partenariat avec la protection en responsabilité d\'une entreprise. Elle protège vos actifs personnels contre les dettes commerciales et les poursuites.',
    'How long does it take to form an LLC?': 'Combien de temps faut-il pour former une LLC?',
    'Processing times vary by package: New Mexico (5-7 business days), Wyoming (3-5 business days), and Colorado (1-2 business days). These times are in addition to state processing times, which vary by location.': 'Les délais de traitement varient selon les forfaits: Nouveau-Mexique (5-7 jours ouvrables), Wyoming (3-5 jours ouvrables) et Colorado (1-2 jours ouvrables). Ces délais s\'ajoutent aux délais de traitement de l\'État, qui varient selon le lieu.',
    'Which state should I form my LLC in?': 'Dans quel État dois-je former ma LLC?',
    'Most businesses should form their LLC in the state where they primarily operate. However, Delaware, Wyoming, and Nevada are popular choices for their business-friendly laws. Our AI assistant can help you choose the right state for your needs.': 'La plupart des entreprises doivent former leur LLC dans l\'État où elles opèrent principalement. Cependant, Delaware, Wyoming et Nevada sont des choix populaires pour leurs lois favorables aux entreprises. Notre assistant IA peut vous aider à choisir le bon État selon vos besoins.',
    'Do I need an EIN for my LLC?': 'Ai-je besoin d\'une SIREN pour ma LLC?',
    'An EIN (Employer Identification Number) is required if you have employees, multiple members, or want to open a business bank account. Our Wyoming and Colorado packages include EIN registration.': 'Une SIREN (numéro d\'identification patronale) est requise si vous avez des employés, plusieurs membres ou si vous souhaitez ouvrir un compte bancaire professionnel. Nos forfaits du Wyoming et du Colorado incluent l\'enregistrement SIREN.',
    'What is a registered agent?': 'Qu\'est-ce qu\'un agent enregistré?',
    'A registered agent is a person or company designated to receive legal documents on behalf of your LLC. Every LLC must have a registered agent in the state where it\'s formed. Our Wyoming and Colorado packages include 1 year of registered agent service.': 'Un agent enregistré est une personne ou une entreprise désignée pour recevoir les documents judiciaires au nom de votre LLC. Chaque LLC doit avoir un agent enregistré dans l\'État où elle est constituée. Nos forfaits du Wyoming et du Colorado incluent 1 an de service d\'agent enregistré.',
    'What are the ongoing requirements for an LLC?': 'Quelles sont les exigences permanentes pour une LLC?',
    'LLCs typically need to file annual reports, pay annual fees, and maintain good standing with the state. Requirements vary by state. Our Colorado package includes compliance alerts to help you stay on track.': 'Les LLC doivent généralement déposer des rapports annuels, payer des frais annuels et maintenir une bonne réputation auprès de l\'État. Les exigences varient selon l\'État. Notre forfait du Colorado inclut des alertes de conformité pour vous aider à rester sur la bonne voie.',
    'Can I form an LLC if I\'m not a U.S. citizen?': 'Puis-je former une LLC si je ne suis pas citoyen américain?',
    'Yes! Non-U.S. citizens and residents can form an LLC in any state. You don\'t need to be a U.S. citizen or have a Social Security Number to start an LLC.': 'Oui! Les non-citoyens et résidents des États-Unis peuvent former une LLC dans n\'importe quel État. Vous n\'avez pas besoin d\'être citoyen américain ou d\'avoir un numéro de sécurité sociale pour créer une LLC.',
    'What\'s included in your packages?': 'Qu\'est-ce qui est inclus dans vos forfaits?',
    'New Mexico includes essential LLC registration and documents. Wyoming adds EIN registration and registered agent service. Colorado includes everything plus bank account setup assistance and priority support. All packages include expert support and filing services.': 'Nouveau-Mexique inclut l\'enregistrement essentiel et les documents de LLC. Wyoming ajoute l\'enregistrement SIREN et le service d\'agent enregistré. Colorado inclut tout plus assistance à la configuration du compte bancaire et support prioritaire. Tous les forfaits incluent un support expert et des services de dépôt.',
    'Is there a money-back guarantee?': 'Y a-t-il une garantie de remboursement?',
    'Yes! We offer a 100% satisfaction guarantee. If you\'re not completely satisfied with our service, contact us within 60 days for a full refund (excluding state filing fees).': 'Oui! Nous offrons une garantie de satisfaction à 100%. Si vous n\'êtes pas complètement satisfait de notre service, contactez-nous dans les 60 jours pour un remboursement complet (à l\'exclusion des frais d\'enregistrement de l\'État).',
    'How do I contact support?': 'Comment puis-je contacter le support?',
    'Our support team is available 24/7 via email (support@ogssolution.com), phone (+212 69 11 81 00 2), or WhatsApp. You can also chat with our AI assistant anytime for instant answers.': 'Notre équipe d\'assistance est disponible 24h/24 et 7j/7 par email (support@ogssolution.com), téléphone (+212 69 11 81 00 2) ou WhatsApp. Vous pouvez également discuter avec notre assistant IA à tout moment pour obtenir des réponses instantanées.',
    'Still have questions?': 'Vous avez toujours des questions?',
    'Our AI assistant and support team are here to help 24/7.': 'Notre assistant IA et notre équipe d\'assistance sont là pour vous aider 24h/24 et 7j/7.',
    
    // Social Proof Section
    'LLCs Formed': 'LLCs Formées',
    'Success Rate': 'Taux de Réussite',
    'Customer Satisfaction': 'Satisfaction des Clients',
    'States Supported': 'États Pris en Charge',
    
    // Security & Compliance Section
    'Security & Compliance': 'Sécurité et Conformité',
    'Your data is protected by enterprise-grade security measures and we maintain full compliance with all major data protection standards.': 'Vos données sont protégées par des mesures de sécurité de qualité entreprise et nous respectons la conformité avec tous les principaux normes de protection des données.',
    'Bank-Level Encryption': 'Chiffrement de Niveau Bancaire',
    'SSL 256-bit encryption protects all your data in transit and at rest': 'Le chiffrement SSL 256 bits protège toutes vos données en transit et au repos',
    'GDPR Compliant': 'Conforme au RGPD',
    'Full compliance with General Data Protection Regulation for data privacy': 'Conformité totale avec le Règlement Général sur la Protection des Données pour la confidentialité des données',
    'PCI DSS Certified': 'Certifié PCI DSS',
    'Payment Card Industry Data Security Standard certified for secure transactions': 'Certifié par la Norme de Sécurité des Données de l\'Industrie Des Cartes de Paiement pour les transactions sécurisées',
    'ISO 27001 Certified': 'Certifié ISO 27001',
    'International standard for information security management': 'Norme internationale pour la gestion de la sécurité de l\'information',
    'We never share or sell your personal information.': 'Nous ne partageons jamais et ne vendons jamais vos informations personnelles.',
    'Read our Privacy Policy': 'Lire notre Politique de Confidentialité',
    
    // Process Timeline Section
    'Simple 4-Step Process': 'Processus Simple en 4 Étapes',
    'From submission to receiving your LLC documents': 'De la soumission à la réception de vos documents LLC',
    'Submit Information': 'Soumettre les Informations',
    'Fill out a simple form with your business details': 'Remplissez un formulaire simple avec vos détails commerciaux',
    '10 minutes': '10 minutes',
    'Expert Review': 'Examen Expert',
    'Our team reviews and verifies your information': 'Notre équipe examine et vérifie vos informations',
    '2 hours': '2 heures',
    'File with State': 'Déposer auprès de l\'État',
    'We file your LLC formation documents': 'Nous déposons vos documents de formation LLC',
    'WY: 1-2 days\nCO: 1-2 days\nNM: 5-7 days': 'WY: 1-2 jours\nCO: 1-2 jours\nNM: 5-7 jours',
    'Receive Documents': 'Recevoir les Documents',
    'Get your Certificate of Formation and documents': 'Obtenez votre certificat de formation et documents',
    '2-3 business days': '2-3 jours ouvrables',
    '100% Satisfaction Guaranteed': '100% Satisfaction Garantie',
    'If your application is rejected by the state, we\'ll refile for free. Not satisfied? 30-day full refund (excluding state fees).': 'Si votre demande est rejetée par l\'État, nous la redéposons gratuitement. Non satisfait? Remboursement complet de 30 jours (frais d\'État exclus).',
    
    // Pricing Comparison Table
    'Compare our service to DIY and traditional attorney options': 'Comparez notre service aux options DIY et aux services d\'avocats traditionnels',
    'Feature': 'Caractéristique',
    'DIY': 'DIY',
    'Attorney': 'Avocat',
    'LLC Registration': 'Enregistrement LLC',
    'Low cost': 'Faible coût',
    'High cost': 'Coût élevé',
    'Time Required': 'Temps Requis',
    '20+ hours': '20+ heures',
    '5-7 hours': '5-7 heures',
    '~1 hour': '~1 heure',
    'EIN Registration': 'Enregistrement SIREN',
    'Registered Agent (1 Year)': 'Agent Enregistré (1 An)',
    'Extra cost': 'Coût supplémentaire',
    'Bank Account Setup Assist': 'Assistance de Configuration de Compte Bancaire',
    'Operating Agreement': 'Accord d\'Exploitation',
    '24/7': '24h/24, 7j/7',
    '24/7 + Priority': '24h/24, 7j/7 + Priorité',
    '24/7 + VIP': '24h/24, 7j/7 + VIP',
    'Money-Back Guarantee': 'Garantie de Remboursement',
    '30 days': '30 jours',
    '60 days': '60 jours',
    'Typical Cost': 'Coût Typique',
    '$100-200': '$100-200',
    '$2,000-5,000': '$2 000-5 000',
    '$890-1,490': '$890-1 490',
    '$2,490-3,490': '$2 490-3 490',
    '$4,490-5,490': '$4 490-5 490',
    'OGS Basic': 'OGS Essentiel',
    'OGS Epic': 'OGS Épique',
    'OGS Ultimate': 'OGS Ultime',
    'Save time and money compared to DIY or hiring an attorney': 'Économisez du temps et de l\'argent par rapport aux options DIY ou engager un avocat',
    
    // Company Credibility Section
    'Why Trust OGS Solution': 'Pourquoi Faire Confiance à OGS Solution',
    'A team of certified business formation experts with proven track record of success': 'Une équipe d\'experts certifiés en formation commerciale ayant un parcours éprouvé de succès',
    '10+ Years Experience': '10+ Ans d\'Expérience',
    'Over a decade of expertise in business formation and LLC services': 'Plus d\'une décennie d\'expertise en formation commerciale et services LLC',
    'Nationwide Coverage': 'Couverture Nationale',
    'Serving entrepreneurs across Wyoming, Colorado, and New Mexico': 'Servant les entrepreneurs à travers le Wyoming, le Colorado et le Nouveau-Mexique',
    'Industry Certified': 'Certifié par l\'Industrie',
    'Team certified by leading business formation and legal organizations': 'Équipe certifiée par les organisations de formation commerciale et juridique leaders',
    'Established Business': 'Entreprise Établie',
    'Registered and in good standing with state business authorities': 'Enregistrée et en bonne situation auprès des autorités commerciales de l\'État',
    'About OGS Solution': 'À Propos d\'OGS Solution',
    'OGS Solution is a trusted provider of LLC formation services, helping entrepreneurs navigate the complex process of starting their businesses. Our mission is to make business formation simple, affordable, and accessible to everyone.': 'OGS Solution est un fournisseur de confiance de services de formation LLC, aidant les entrepreneurs à naviguer dans le processus complexe de création de leurs entreprises. Notre mission est de rendre la formation commerciale simple, abordable et accessible à tous.',
    'Backed by a team of certified business formation specialists and legal experts, we\'ve successfully guided thousands of entrepreneurs through the LLC formation process across multiple states.': 'Soutenue par une équipe de spécialistes certifiés en formation commerciale et d\'experts juridiques, nous avons guidé avec succès des milliers d\'entrepreneurs à travers le processus de formation LLC dans plusieurs États.',
    'Our Commitment': 'Notre Engagement',
    '100% Transparency in pricing and process': '100% Transparence dans la tarification et le processus',
    'Expert support available 24/7': 'Support expert disponible 24h/24 et 7j/7',
    'Money-back guarantee on all services': 'Garantie de remboursement sur tous les services',
    'Latest technology and compliance standards': 'Dernière technologie et normes de conformité',
    'Proven success with 99%+ approval rate': 'Succès éprouvé avec un taux d\'approbation de 99%+',
    'Confidentiality and data protection': 'Confidentialité et protection des données',
    
    // Guarantee Section
    'Risk-Free Guarantees': 'Garanties Sans Risque',
    'Multiple guarantees to protect your investment and ensure your success': 'Plusieurs garanties pour protéger votre investissement et assurer votre succès',
    'Not happy with our service? Get a full refund.': 'Pas satisfait de notre service? Obtenez un remboursement complet.',
    'Full refund within 60 days if not satisfied': 'Remboursement complet dans les 60 jours si non satisfait',
    'No questions asked - simple refund process': 'Pas de questions posées - processus de remboursement simple',
    'Excludes state filing and government fees': 'Exclut les frais d\'enregistrement d\'État et les frais gouvernementaux',
    'Risk-free way to try our service': 'Moyen sans risque d\'essayer notre service',
    'Free Re-filing Guarantee': 'Garantie de Redépôt Gratuit',
    'State rejection? We handle it for you, free.': 'Rejet d\'État? Nous nous en chargeons pour vous, gratuitement.',
    'If state rejects your application, we refile at no cost': 'Si l\'État rejette votre demande, nous la redéposons sans frais',
    'Includes all corrections and amendments': 'Inclut toutes les corrections et modifications',
    'Unlimited re-filing attempts': 'Tentatives de redépôt illimitées',
    'Peace of mind that you\'ll get approved': 'Tranquillité d\'esprit que vous serez approuvé',
    'Data Security Guarantee': 'Garantie de Sécurité des Données',
    'Your information is protected and never sold.': 'Vos informations sont protégées et jamais vendues.',
    'Bank-level encryption for all data': 'Chiffrement de niveau bancaire pour toutes les données',
    'GDPR and CCPA compliant': 'Conforme au RGPD et à la CCPA',
    'No third-party data sharing': 'Aucun partage de données tiers',
    'Regular security audits and compliance': 'Audits de sécurité réguliers et conformité',
    'Expert Support Guarantee': 'Garantie de Support Expert',
    '24/7 support from certified business experts.': 'Support 24h/24 et 7j/7 d\'experts commerciaux certifiés.',
    'Response within 2 hours (24/7 availability)': 'Réponse dans les 2 heures (disponibilité 24h/24 et 7j/7)',
    'Certified business formation specialists': 'Spécialistes certifiés en formation commerciale',
    'No automated responses - real people help': 'Pas de réponses automatisées - une vraie aide',
    'Dedicated support for Ultimate package': 'Support dédié pour le forfait Ultime',
    'We\'re confident in our service and want you to feel completely secure. Our guarantees show that we stand behind every LLC formation.': 'Nous sommes confiants dans notre service et voulons que vous vous sentiez complètement sécurisé. Nos garanties montrent que nous soutenons chaque formation LLC.',
    'Start with confidence knowing you\'re protected.': 'Commencez en toute confiance en sachant que vous êtes protégé.',
    
    // State Information
    'Compare State Benefits': 'Comparer les Avantages de l\'État',
    'Each state offers unique advantages for different business needs': 'Chaque État offre des avantages uniques selon les besoins commerciaux différents',
    'Starting at': 'À partir de',
    'Choose': 'Choisir',
    'Wyoming': 'Wyoming',
    'Colorado': 'Colorado',
    'New Mexico': 'Nouveau-Mexique',
    'Privacy Powerhouse': 'Bastion de la Vie Privée',
    'Business-Friendly State': 'État Favorable aux Affaires',
    'Budget-Friendly Option': 'Option Conviviale pour le Budget',
    'Owner Privacy': 'Confidentialité du Propriétaire',
    'No public disclosure of LLC members - your privacy is protected': 'Aucune divulgation publique des membres de LLC - votre confidentialité est protégée',
    'Tax Flexibility': 'Flexibilité Fiscale',
    'Choose how your LLC is taxed - none, sole proprietor, or corporate': 'Choisissez comment votre LLC est imposée - aucune, propriétaire unique ou entreprise',
    'No Director Requirements': 'Pas d\'exigences de Directeur',
    'No annual meetings required - more operational flexibility': 'Aucune réunion annuelle requise - plus de flexibilité opérationnelle',
    'Strongest Liability Protection': 'Protection en Responsabilité la Plus Forte',
    'Comprehensive legal protection for business owner assets': 'Protection juridique complète des actifs du propriétaire de l\'entreprise',
    'Growing Tech Hub': 'Centre Technologique Croissant',
    'Home to thousands of thriving startups and tech companies': 'Accueil de milliers de startups prospères et d\'entreprises technologiques',
    'Favorable Tax Climate': 'Climat Fiscal Favorable',
    'No state income tax on business profits - keep more of your money': 'Pas d\'impôt sur le revenu de l\'État sur les bénéfices commerciaux - conservez plus d\'argent',
    'Strong Business Community': 'Communauté Commerciale Solide',
    'Access to networking, resources, and investment opportunities': 'Accès aux réseaux, ressources et opportunités d\'investissement',
    'Quickest turnaround - 1-2 business days for approval': 'Délai d\'exécution le plus rapide - 1-2 jours ouvrables pour approbation',
    'Most Affordable Filing': 'Dépôt le Plus Abordable',
    'Lowest state filing and annual fees of the three options': 'Frais d\'enregistrement d\'État et frais annuels les plus bas des trois options',
    'Strong Protection': 'Protection Solide',
    'Solid liability protection for business owners and assets': 'Protection en responsabilité solide pour les propriétaires d\'entreprises et les actifs',
    'Privacy Available': 'Confidentialité Disponible',
    'Can maintain owner privacy with proper structuring': 'Peut maintenir la confidentialité du propriétaire avec une structuration appropriée',
    'Growing Business': 'Entreprise en Croissance',
    'Established support systems for new and growing businesses': 'Systèmes de soutien établis pour les entreprises nouvelles et en croissance',
    'Choose Wyoming': 'Choisir Wyoming',
    'Choose Colorado': 'Choisir Colorado',
    'Choose New Mexico': 'Choisir Nouveau-Mexique',
    '$990 - $2,990': '$990 - $2 990',
    '$1,490 - $5,490': '$1 490 - $5 490',
    '$890 - $4,490': '$890 - $4 490',
    
    // Package Selection / Services Page
    'Choose Your LLC Package': 'Choisissez Votre Forfait LLC',
    'Select the perfect package for your business needs. All packages include professional filing and expert support.': 'Sélectionnez le forfait parfait selon vos besoins commerciaux. Tous les forfaits incluent le dépôt professionnel et le support expert.',
    'Most Popular': 'Plus Populaire',
    'Best Value': 'Meilleure Valeur',
    'Loading packages...': 'Chargement des forfaits...',
    'Finding the best options for you': 'Recherche des meilleures options pour vous',
    'Not Sure Which Package to Choose?': 'Ne Savez Pas Quel Forfait Choisir?',
    'Our AI assistant can help you find the perfect package for your business needs. Get personalized recommendations in minutes.': 'Notre assistant IA peut vous aider à trouver le forfait parfait selon vos besoins commerciaux. Obtenez des recommandations personnalisées en quelques minutes.',
    'Contact Our Team': 'Contacter Notre Équipe',
    'View Comparison Chart': 'Voir le Tableau de Comparaison',
    'Free Consultation': 'Consultation Gratuite',
    'No Obligation': 'Sans Engagement',
    'Expert Guidance': 'Conseils Expert',
    
    // CTA & Footer Sections
    'Ready to Start Your Business?': 'Prêt à Démarrer Votre Enterprise?',
    'Secure & Encrypted': 'Sécurisé et Chiffré',
    'A+ Rated Service': 'Service Noté A+',
    '10,000+ Happy Clients': '10 000+ Clients Heureux',
    
    // Footer Links
    'LLC Formation': 'Formation LLC',
    'Registered Agent': 'Agent Enregistré',
    'Compliance Services': 'Services de Conformité',
    'Contact Us': 'Nous Contacter',
    'Privacy Policy': 'Politique de Confidentialité',
    'Making LLC formation simple, affordable, and transparent for entrepreneurs nationwide.': 'Rendant la formation LLC simple, abordable et transparente pour les entrepreneurs du pays.',
    'OGS Solution. All rights reserved.': 'OGS Solution. Tous les droits réservés.',
  },




};

export type LanguageCode = 
  | 'EN' | 'FR' | 'AR';

export const SUPPORTED_LANGUAGES: { [key: string]: string } = {
  'EN': 'English',
  'FR': 'Français',
  'AR': 'العربية',
};

// Map LanguageCode to DeepL language codes
const languageMapping: { [key in LanguageCode]: string } = {
  'EN': 'EN-US',
  'FR': 'FR',
  'AR': 'AR',
};

// Simple fallback translation using local dictionary
function getLocalTranslation(text: string, targetLanguage: LanguageCode): string | null {
  const langFallbacks = translationFallbacks[targetLanguage];
  if (!langFallbacks) return null;
  
  const trimmedText = text.trim();
  
  // Try exact match first
  if (langFallbacks[trimmedText]) {
    return langFallbacks[trimmedText];
  }
  
  // Try case-insensitive match
  for (const [key, value] of Object.entries(langFallbacks)) {
    if (key.toLowerCase() === trimmedText.toLowerCase()) {
      return value;
    }
  }
  
  // Try partial match for phrases containing the text
  for (const [key, value] of Object.entries(langFallbacks)) {
    if (key.toLowerCase().includes(trimmedText.toLowerCase()) ||
        trimmedText.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return null;
}

// Translate single text through Firebase Cloud Function or fallback
export async function translateText(
  text: string,
  targetLanguage: LanguageCode,
  sourceLanguage?: LanguageCode
): Promise<string> {
  if (!text || text.trim().length === 0) {
    return text;
  }

  // If target is English, return original text
  if (targetLanguage === 'EN') {
    return text;
  }

  // Check cache
  const cacheKey = `${text}|${targetLanguage}`;
  if (translationCache[cacheKey]) {
    console.log(`[Translation] Cache hit: "${text}" -> ${targetLanguage}`);
    return translationCache[cacheKey];
  }

  // Try local fallback first
  const localTranslation = getLocalTranslation(text, targetLanguage);
  if (localTranslation) {
    console.log(`[Translation] Fallback: "${text}" -> "${localTranslation}"`);
    translationCache[cacheKey] = localTranslation;
    return localTranslation;
  }

  console.log(`[Translation] No fallback found for: "${text}" in ${targetLanguage}`);

  // Skip Cloud Functions in development (localhost)
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isDevelopment) {
    console.log(`[Translation] Skipping Cloud Function in development, returning original: "${text}"`);
    return text;
  }

  // Try Cloud Functions only in production (requires Firebase Blaze plan)
  try {
    const deepLTargetLang = languageMapping[targetLanguage] || targetLanguage;
    const deepLSourceLang = sourceLanguage ? languageMapping[sourceLanguage] : undefined;

    const response = await fetch(TRANSLATE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        target_lang: deepLTargetLang,
        ...(deepLSourceLang && { source_lang: deepLSourceLang }),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const translatedText = data.translations?.[0]?.text || text;
      
      // Cache the result
      translationCache[cacheKey] = translatedText;
      console.log(`[Translation] Cloud: "${text}" -> "${translatedText}"`);
      
      return translatedText;
    }
  } catch (error) {
    console.warn('[Translation] Cloud translation not available:', error);
  }

  // Return original text if all else fails
  console.log(`[Translation] Returning original: "${text}"`);
  return text;
}

// Translate multiple texts through Firebase Cloud Function or fallback
export async function translateArray(
  texts: string[],
  targetLanguage: LanguageCode,
  sourceLanguage?: LanguageCode
): Promise<string[]> {
  if (texts.length === 0) {
    return texts;
  }

  // If target is English, return original texts
  if (targetLanguage === 'EN') {
    return texts;
  }

  // Try local fallback for all texts first
  const localResults = texts.map(text => getLocalTranslation(text, targetLanguage) || text);
  
  // Check if all have local translations
  const allHaveLocal = localResults.every((result, index) => result !== texts[index]);
  if (allHaveLocal) {
    return localResults;
  }

  // Try Cloud Functions for remaining translations
  try {
    const deepLTargetLang = languageMapping[targetLanguage] || targetLanguage;
    const deepLSourceLang = sourceLanguage ? languageMapping[sourceLanguage] : undefined;

    const response = await fetch(TRANSLATE_BATCH_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texts,
        target_lang: deepLTargetLang,
        ...(deepLSourceLang && { source_lang: deepLSourceLang }),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const translatedTexts = data.translations?.map((t: { text: string }) => t.text) || texts;
      
      return translatedTexts;
    }
  } catch (error) {
    console.warn('Batch Cloud translation not available, using fallback or returning original texts');
  }

  // Return original texts if all else fails
  // Return original texts if all else fails
  return texts;
}

export function clearTranslationCache(): void {
  translationCache = {};
}

export function getTranslationCache(): TranslationCache {
  return translationCache;
}

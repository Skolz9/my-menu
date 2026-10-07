import { config } from '../config';
import type { Language } from '../menus/types';

export const translations = {
  ar: {
    dir: 'rtl' as const,
    langName: 'العربية',
    langShort: 'AR',
    seo: {
      title: 'My Menu — منيو QR رقمي للمقاهي والمطاعم في المغرب | Menu QR Maroc',
      description:
        'منيو QR مقهى المغرب جاهز في دقائق بدون طباعة وبدون عمولة. تصميم منيو إلكتروني احترافي للمقاهي والمطاعم في أكادير، الدار البيضاء، مراكش وكل المغرب بالعربية والفرنسية والإنجليزية.',
    },
    nav: {
      howItWorks: 'كيف يعمل',
      pricing: 'الأسعار',
      demo: 'منيو تجريبي',
      faq: 'الأسئلة الشائعة',
      contact: 'تواصل معنا',
      whatsappCta: 'تواصل معنا عبر واتساب',
      whatsappDefaultMsg: 'السلام عليكم، بغيت نصاوب منيو QR للمقهى / المطعم ديالي',
    },
    hero: {
      badge: '0% عمولة • بدون إعادة طباعة • خاص بالمقاهي والمطاعم في المغرب',
      headline: 'منيو QR ديالك واجد فدقائق، بلا طباعة وبلا عمولة',
      subheadline:
        'حوّل قائمة الطعام الورقية ديال المقهى أو المطعم ديالك إلى منيو رقمي عصري كيفتح مباشرة على أي هاتف غير بمسح رمز QR. عدّل الأسعار والأصناف في أي وقت وبثلاث لغات.',
      whatsappCta: 'اطلب المنيو عبر واتساب',
      demoCta: 'شاهد المنيو التجريبي',
      ticks: [
        'بدون تحميل أي تطبيق',
        '0% عمولة على الطلبات',
        'تحديث الأسعار في أي وقت',
      ],
      qrCardTitle: 'امسح الرمز للتجربة',
      qrCardSubtitle: 'جرّب منيو مقهى أكادير المباشر',
      phonePreviewBadge: 'معاينة حية • Marina Sol Agadir',
    },
    trustedBy: {
      title: 'مقاهي ومطاعم في المغرب تثق في خدماتنا لتقديم منيو رقمي عصري',
    },
    benefits: {
      kicker: 'لماذا تختار My Menu؟',
      title: 'كل ما يحتاجه المقهى أو المطعم ديالك — بدون تعقيد',
      subtitle:
        'صممنا الخدمة خصيصاً لأصحاب المقاهي، المطاعم، السناكات والباتيسري في المغرب باش تتهنى من مصاريف الطباعة المتكررة.',
      cards: [
        {
          title: 'تحديث فوري للأسعار والأصناف',
          description:
            'تبدل ثمن شي مشروب أو تقاضى شي طبق؟ تواصل معنا أو عدّلو في ثوانٍ وكيظهر فوراً لجميع الزبناء فوق الطاولات بلا ما تعاود تطبع المنيو.',
        },
        {
          title: 'صور وأوصاف تفتح الشهية',
          description:
            'اعرض أطباقك، الفطور البلدي، العصائر والبيتزا بصور واضحة وعالية الجودة مع شارات (جديد، نباتي، حار، نفد) كتخلي الزبون يختار بسرعة ويزيد من قيمة الطلب.',
        },
        {
          title: 'عربي / فرنسي / إنجليزي بضغطة زر',
          description:
            'منيو واحد كيخدم الزبون المحلي والسياح الأجانب! يقدر الزبون يبدل اللغة بين العربية، الفرنسية والإنجليزية في لحظة ومن نفس الصفحة.',
        },
      ],
    },
    showcase: {
      kicker: 'بهوية مشروعك الخاصة',
      title: 'هكذا يرى زبونك المنيو على هاتفه',
      subtitle:
        'بمجرد مسح رمز QR فوق الطاولة، تفتح صفحة سريعة جداً بشعار المقهى ديالك، ألوانك الخاصة، وأقسام مرتبة تسهل التصفح والطلب.',
      ticks: [
        'تصميم مخصص بشعار وألوان المقهى أو المطعم ديالك',
        'تبديل فوري بين العربية والفرنسية والإنجليزية',
        'إمكانية إرسال الطلب مباشرة عبر واتساب بدون أي عمولة',
        'خفيف وسريع جداً على جميع الهواتف (Android و iPhone)',
      ],
      demoCta: 'افتح المنيو التجريبي الكامل',
      colorLabel: 'ألوان قابلة للتخصيص حسب هويتك:',
      sampleCafesTitle: 'أقسام متوفرة في المنيو التجريبي (أكادير):',
    },
    steps: {
      kicker: 'كيف يعمل؟',
      title: 'من إرسال القائمة إلى أول مسح QR في 3 خطوات بسيطة',
      subtitle: 'ما كتحتاج حتى خبرة تقنية — فريقنا كيتكلف بكلشي من الألف إلى الياء.',
      items: [
        {
          num: '1',
          title: 'أرسل لنا المنيو عبر واتساب',
          description:
            'صوّر لينا المنيو الورقي ديالك بالهاتف، أو صيفطو لينا PDF أو مكتوب فواتساب مع الشعار (Logo) ديال المحل.',
        },
        {
          num: '2',
          title: 'نصمم ونبرمج المنيو الرقمي ديالك',
          description:
            'كنقادّو ليك المنيو كامل بالأقسام، الأسعار بالدرهم (MAD)، الترجمة لـ 3 لغات، والصور بألوان وهوية مشروعك.',
        },
        {
          num: '3',
          title: 'اطبع رمز QR وانطلق!',
          description:
            'كنصيفطو ليك رمز QR جاهز للطباعة بجودة عالية مع تصميم حامل الطاولة (A5) باش تحطو فوق الطاولات وتستقبل زبنائك فوراً.',
        },
      ],
      cta: 'ابدأ الآن عبر واتساب',
    },
    pricing: {
      kicker: 'الأسعار',
      title: 'باقة واحدة واضحة وشاملة — بدون مصاريف خفية',
      subtitle: 'استثمر في صورة عصرية لمطعمك أو مقهاك بدون أي عمولة على المبيعات.',
      monthlyLabel: 'شهري',
      yearlyLabel: 'سنوي',
      discountBadge: `وفّر ${config.pricing.yearlyDiscountPercent}%`,
      planName: 'باقة المنيو الرقمي المتكاملة (Pack Menu QR)',
      planTagline: 'شاملة التصميم، الإعداد، الترجمة بـ 3 لغات، ورمز QR جاهز للطباعة.',
      perMonth: 'درهم / شهر',
      perYear: 'درهم / سنة',
      equivalentMonthly: 'أي ما يعادل 82.5 درهم فقط في الشهر',
      setupFeeTitle: 'مصاريف الإنشاء والتصميم (مرة واحدة عند البداية):',
      setupFeeValue: `+ ${config.pricing.setupFee} درهم`,
      setupFeeNote: 'تدفع مرة واحدة فقط لتصميم المنيو وإدخال جميع الأصناف والصور والترجمة.',
      features: [
        'عدد غير محدود من الأقسام والأصناف ومسح QR',
        'متوفر بـ 3 لغات: العربية، الفرنسية والإنجليزية',
        'تخصيص كامل بألوان وشعار المقهى أو المطعم',
        'تحديثات مجانية للأسعار والأصناف عبر واتساب',
        'زر الطلب المباشر عبر واتساب + موقع Google Maps وإنستغرام',
        'تصميم رمز QR جاهز للطباعة (PNG / SVG / بطاقة طاولة A5 PDF)',
        'استضافة سريعة جداً وآمنة مع شهادة SSL',
        'دعم فني متواصل 7/7 عبر واتساب في المغرب',
      ],
      ctaButton: 'اطلب باقتك الآن عبر واتساب',
      whatsappOrderMonthly: `السلام عليكم، بغيت نطلب "Pack Menu QR" (الاشتراك الشهري: ${config.pricing.monthlyPrice} درهم/شهر + ${config.pricing.setupFee} درهم مصاريف الإنشاء).`,
      whatsappOrderYearly: `السلام عليكم، بغيت نطلب "Pack Menu QR" (الاشتراك السنوي بتخفيض ${config.pricing.yearlyDiscountPercent}%: ${config.pricing.yearlyPrice} درهم/سنة + ${config.pricing.setupFee} درهم مصاريف الإنشاء).`,
    },
    payment: {
      kicker: 'طرق الدفع في المغرب',
      title: 'كيف يتم الدفع؟',
      banner: `تسبيق ${config.payment.advancePercent}% للبدء في تصميم المنيو، والباقي عند التسليم النهائي. بدون أداء إلكتروني معقد، وبدون أي عمولة.`,
      methods: {
        virement: {
          title: 'تحويل بنكي (Virement)',
          desc: 'تحويل مباشر إلى حسابنا البنكي المغربي (CIH / Attijari / BMCE...).',
        },
        especes: {
          title: 'نقداً (Espèces)',
          desc: 'الدفع نقداً مباشرة عند اللقاء أو التسليم (أكادير والنواحي).',
        },
        cih_pay_wafacash_cashplus: {
          title: 'CIH Pay / Wafacash / Cash Plus',
          desc: 'تحويل سريع عبر وكالات Wafacash أو Cash Plus أو تطبيق CIH.',
        },
        mobile_wallet: {
          title: 'المحفظة الإلكترونية (Mobile Wallet)',
          desc: 'الدفع عبر خدمات الأداء بالهاتف المحمول المتوفرة في المغرب.',
        },
      },
      toggleShowDetails: 'عرض معلومات الحساب البنكي (RIB)',
      toggleHideDetails: 'إخفاء معلومات الحساب البنكي',
      ribLabel: 'رقم الحساب البنكي (RIB):',
      holderLabel: 'اسم صاحب الحساب (Titulaire):',
      copyRib: 'نسخ RIB',
      copiedRib: 'تم النسخ!',
      paymentHelpNote:
        'بعد إرسال التسبيق، أرسل لنا وصل الأداء عبر واتساب لنشرع فوراً في إعداد المنيو الخاص بك.',
    },
    stats: {
      kicker: 'أرقام تعكس الثقة',
      title: 'My Menu يعمل يومياً في مقاهي ومطاعم مغربية',
      items: {
        scans: 'مشاهدة ومسح للمنيو',
        cafes: 'مقهى ومطعم يثق بنا',
        commission: 'عمولة على الطلبات',
        support: 'دعم فني عبر واتساب',
      },
    },
    faq: {
      kicker: 'الأسئلة الشائعة',
      title: 'أسئلة قبل أن تبدأ',
      items: [
        {
          q: 'ما هي مدة تجهيز وتسليم المنيو الرقمي؟',
          a: 'بمجرد ما تصيفط لينا لائحة الأطباق والأسعار والشعار عبر واتساب، كنجهزو ليك المنيو الرقمي الكامل مع رمز QR في أقل من 24 إلى 48 ساعة عمل.',
        },
        {
          q: 'كيف يمكنني تعديل الأسعار أو إضافة أصناف جديدة لاحقاً؟',
          a: 'الأمر بسيط جداً! غير صيفط لينا رسالة فواتساب بالتعديلات لي بغيتي (تغيير ثمن، إضافة طبق جديد، أو إشارة "نفد" لصنف معين) وكنحدثوه ليك فوراً بلا ما يتغير رمز QR المطبوع فوق الطاولات.',
        },
        {
          q: 'بأي لغات يظهر المنيو للزبناء؟',
          a: 'المنيو يدعم 3 لغات بشكل كامل: العربية (مع اتجاه قراءة من اليمين لليسار RTL)، الفرنسية، والإنجليزية. يمكن للزبون التبديل بينها بضغطة زر واحدة.',
        },
        {
          q: 'كيف أحصل على رمز QR وهل أحتاج لإعادة طباعته عند تغيير المنيو؟',
          a: 'كنسلموك رمز QR بجودة عالية جداً (PNG و SVG) بالإضافة إلى تصميم جاهز للطباعة بحجم A5 للطاولات. والأهم: رمز QR كيبقى صالح للأبد حتى لو بدلتي الأسعار والأطباق 100 مرة!',
        },
        {
          q: 'هل يمكنني استخدام اسم نطاق (Domaine) خاص بمطعمي؟',
          a: 'بشكل افتراضي تحصل على رابط سريع ومجاني خاص بمحلّك (مثلاً mymenu.ma/m/your-cafe)، وإذا بغيتي نربطوه باسم نطاق خاص بيك (مثل menu.moncafe.ma) ففريقنا كيتكلف بإعداده لك بكل سهولة.',
        },
      ],
    },
    finalCta: {
      title: 'منيو إلكتروني احترافي جاهز قبل ما تكمل قهوتك!',
      subtitle:
        'تواصل معنا الآن عبر واتساب، أرسل قائمة مقهاك أو مطعمك، واحصل على منيو QR عصري يزيد من مبيعاتك ويريّح زبناءك.',
      primaryCta: 'تحدث معنا عبر واتساب الآن',
      secondaryCta: 'شاهد المنيو التجريبي',
    },
    footer: {
      description:
        'منصة مغربية لتصميم وإنشاء قوائم الطعام الرقمية (Menu QR Code) للمقاهي، المطاعم، البيتزيريا والفنادق في أكادير، الدار البيضاء، مراكش وجميع مدن المغرب.',
      navigationTitle: 'روابط سريعة',
      contactTitle: 'تواصل معنا',
      seoKeywordsTitle: 'خدماتنا في المغرب',
      seoKeywords:
        'منيو QR مقهى المغرب • menu QR code cafe Maroc • menu digital restaurant Agadir • creation menu QR Maroc',
      rights: 'جميع الحقوق محفوظة.',
      madeBy: `صُنع بكل إتقان بواسطة ${config.agencyName}`,
    },
    menuPage: {
      backToHome: 'العودة إلى My Menu',
      searchPlaceholder: 'ابحث عن مشروب، بيتزا، فطور...',
      allCategories: 'الكل',
      noResults: 'لا توجد أصناف مطابقة لبحثك.',
      clearSearch: 'مسح البحث',
      badges: {
        new: 'جديد',
        vegetarian: 'نباتي',
        spicy: 'حار',
        soldout: 'نفد حالياً',
      },
      addToOrder: 'إضافة',
      hoursTitle: 'أوقات العمل',
      addressTitle: 'العنوان والموقع',
      openInMaps: 'فتح في خرائط Google',
      callNow: 'اتصال هاتفي',
      whatsappContact: 'تواصل عبر واتساب',
      instagramFollow: 'صفحة إنستغرام',
      cartButton: 'عرض طلبيتي',
      cartTitle: 'ملخص طلبك',
      cartSubtitle: 'يمكنك إرسال طلبك مباشرة عبر واتساب أو إظهاره للنادل',
      cartEmpty: 'لم تختر أي صنف بعد',
      totalLabel: 'المجموع:',
      sendOrderWhatsapp: 'إرسال الطلب عبر واتساب',
      clearCart: 'إفراغ السلة',
      orderWhatsappHeader: 'السلام عليكم، أود طلب الأصناف التالية من',
      orderWhatsappTotal: 'المجموع الإجمالي',
      footerCredit: 'Menu by My Menu',
    },
    notFound: {
      title: 'الصفحة غير موجودة (404)',
      description: 'عذراً، الرابط الذي تبحث عنه غير متوفر أو تم نقله.',
      backHome: 'العودة للصفحة الرئيسية',
      viewDemo: 'مشاهدة المنيو التجريبي',
    },
  },

  fr: {
    dir: 'ltr' as const,
    langName: 'Français',
    langShort: 'FR',
    seo: {
      title: 'My Menu — Création Menu QR Code Café & Restaurant au Maroc',
      description:
        'Votre menu QR prêt en quelques minutes, sans impression et sans commission. Menu digital restaurant Agadir, Casablanca, Marrakech en Arabe, Français et Anglais.',
    },
    nav: {
      howItWorks: 'Comment ça marche',
      pricing: 'Tarifs',
      demo: 'Démo',
      faq: 'FAQ',
      contact: 'Contact',
      whatsappCta: 'Contactez-nous sur WhatsApp',
      whatsappDefaultMsg: 'Salam, je veux un menu QR pour mon cafe',
    },
    hero: {
      badge: '0% commission • Zéro réimpression • Pensé pour les cafés & restaurants au Maroc',
      headline: 'Votre menu QR prêt en quelques minutes, sans impression',
      subheadline:
        'Transformez votre carte papier en un menu digital élégant qui s’ouvre instantanément sur tout smartphone par simple scan QR. Modifiez vos prix et plats à tout moment.',
      whatsappCta: 'Contactez-nous sur WhatsApp',
      demoCta: 'Voir la démo',
      ticks: [
        'Sans application',
        'Sans commission',
        'Mise à jour à tout moment',
      ],
      qrCardTitle: 'Scannez pour tester',
      qrCardSubtitle: 'Découvrez le menu démo d’Agadir',
      phonePreviewBadge: 'Aperçu en direct • Marina Sol Agadir',
    },
    trustedBy: {
      title: 'Ils nous font confiance au Maroc',
    },
    benefits: {
      kicker: 'Pourquoi My Menu ?',
      title: 'Tout ce dont votre carte a besoin — sans la moindre complication',
      subtitle:
        'Une solution clé en main pensée pour les cafés, restaurants, snacks, glaciers et salons de thé partout au Maroc.',
      cards: [
        {
          title: 'Mise à jour instantanée des prix',
          description:
            'Un changement de tarif ou un plat en rupture de stock ? Nous mettons à jour votre carte en quelques secondes sans jamais changer vos QR codes déjà imprimés sur les tables.',
        },
        {
          title: 'Photos et descriptions appétissantes',
          description:
            'Mettez en valeur vos spécialités avec des photos HD, des descriptions claires et des badges pratiques (Nouveau, Végétarien, Épicé, Épuisé) qui donnent envie de commander.',
        },
        {
          title: 'Arabe / Français / Anglais en un clic',
          description:
            'Accueillez aussi bien la clientèle marocaine que les touristes internationaux grâce au changement de langue instantané (Arabe RTL, Français et Anglais).',
        },
      ],
    },
    showcase: {
      kicker: 'À votre image',
      title: 'Voici ce que verra votre client',
      subtitle:
        'En scannant le QR code sur table, votre client accède immédiatement à un menu ultra-rapide aux couleurs et au logo de votre établissement.',
      ticks: [
        'Personnalisé avec le logo et les couleurs de votre établissement',
        'Photos, descriptions détaillées et prix en Dirhams (MAD)',
        'Bascule instantanée Arabe / Français / Anglais',
        'Option panier et commande directe sur WhatsApp sans commission',
      ],
      demoCta: 'Voir la démo',
      colorLabel: 'Couleurs personnalisables :',
      sampleCafesTitle: 'Catégories de notre démo live (Agadir) :',
    },
    steps: {
      kicker: 'Comment ça marche',
      title: 'Votre menu digital en ligne en 3 étapes simples',
      subtitle: 'Aucune compétence technique requise : notre équipe s’occupe de tout pour vous.',
      items: [
        {
          num: '1',
          title: 'Envoyez-nous votre menu sur WhatsApp',
          description:
            'Prenez simplement en photo votre menu papier actuel ou envoyez-nous votre liste de prix et votre logo sur WhatsApp.',
        },
        {
          num: '2',
          title: 'Nous créons votre menu digital',
          description:
            'Nous intégrons vos catégories, plats, photos et traductions (AR / FR / EN) avec la charte graphique de votre café ou restaurant.',
        },
        {
          num: '3',
          title: "Imprimez votre QR code et c'est parti",
          description:
            'Vous recevez votre QR code haute définition ainsi qu’une fiche chevalet A5 prête à imprimer et à poser sur vos tables.',
        },
      ],
      cta: 'Démarrer sur WhatsApp',
    },
    pricing: {
      kicker: 'Tarifs transparents',
      title: 'Un seul pack complet, sans frais cachés ni commission',
      subtitle: 'Choisissez la formule mensuelle ou économisez 17% avec l’abonnement annuel.',
      monthlyLabel: 'Mensuel',
      yearlyLabel: 'Annuel',
      discountBadge: `-${config.pricing.yearlyDiscountPercent}%`,
      planName: 'Pack Menu QR',
      planTagline: 'Création complète de votre menu digital, hébergement rapide et mises à jour incluses.',
      perMonth: 'MAD / mois',
      perYear: 'MAD / an',
      equivalentMonthly: 'Soit l’équivalent de 82,5 MAD / mois seulement',
      setupFeeTitle: 'Frais de création et mise en service (paiement unique) :',
      setupFeeValue: `+ ${config.pricing.setupFee} MAD`,
      setupFeeNote: 'Payable une seule fois au démarrage pour le design, la saisie complète et la traduction.',
      features: [
        'Catégories, articles et scans QR illimités',
        'Menu trilingue inclus : Arabe, Français et Anglais',
        'Design personnalisé aux couleurs et logo de votre café',
        'Mises à jour des prix et articles sur simple message WhatsApp',
        'Panier de sélection & commande directe sur WhatsApp (0% commission)',
        'QR code HD (PNG, SVG) + affiche chevalet de table A5 PDF prête à imprimer',
        'Hébergement ultra-rapide optimisé mobile & référencement Google Maps',
        'Support réactif 7j/7 sur WhatsApp au Maroc',
      ],
      ctaButton: 'Commander sur WhatsApp',
      whatsappOrderMonthly: `Salam, je souhaite commander le "Pack Menu QR" en formule Mensuelle (${config.pricing.monthlyPrice} MAD/mois + ${config.pricing.setupFee} MAD de frais de création).`,
      whatsappOrderYearly: `Salam, je souhaite commander le "Pack Menu QR" en formule Annuelle (-${config.pricing.yearlyDiscountPercent}% : ${config.pricing.yearlyPrice} MAD/an + ${config.pricing.setupFee} MAD de frais de création).`,
    },
    payment: {
      kicker: 'Paiement simple & local',
      title: 'Comment payer ?',
      banner: `Avance de ${config.payment.advancePercent}% pour démarrer, le reste à la livraison. Pas de paiement en ligne, pas de commission.`,
      methods: {
        virement: {
          title: 'Virement bancaire',
          desc: 'Virement instantané ou classique vers notre compte bancaire au Maroc.',
        },
        especes: {
          title: 'Espèces',
          desc: 'Paiement en espèces en main propre (Agadir et régions ou à la livraison).',
        },
        cih_pay_wafacash_cashplus: {
          title: 'CIH Pay / Wafacash / Cash Plus',
          desc: 'Transfert rapide en agence Wafacash, Cash Plus ou via CIH Mobile.',
        },
        mobile_wallet: {
          title: 'Mobile wallet',
          desc: 'Paiement mobile rapide via votre portefeuille électronique marocain.',
        },
      },
      toggleShowDetails: 'Voir les coordonnées de paiement',
      toggleHideDetails: 'Masquer les coordonnées de paiement',
      ribLabel: 'RIB Bancaire :',
      holderLabel: 'Titulaire du compte :',
      copyRib: 'Copier le RIB',
      copiedRib: 'RIB copié !',
      paymentHelpNote:
        'Envoyez-nous simplement le reçu de votre avance sur WhatsApp pour lancer la création immédiate de votre menu.',
    },
    stats: {
      kicker: 'En chiffres',
      title: 'My Menu accompagne les cafés et restaurants au quotidien',
      items: {
        scans: 'Scans de menus QR',
        cafes: 'Cafés & restaurants équipés',
        commission: 'Commission sur vos ventes',
        support: 'Assistance WhatsApp dédiée',
      },
    },
    faq: {
      kicker: 'Questions fréquentes',
      title: 'Tout savoir avant de lancer votre menu QR',
      items: [
        {
          q: 'Quel est le délai de livraison de mon menu QR ?',
          a: 'Votre menu digital complet est prêt en 24h à 48h après réception de votre carte actuelle (photo, PDF ou texte) et de votre logo sur WhatsApp.',
        },
        {
          q: 'Comment fonctionne la modification des prix ou des plats ?',
          a: 'Envoyez-nous simplement un message sur WhatsApp avec les nouveaux prix, les nouveaux plats ou les articles épuisés. La mise à jour est effectuée rapidement sans jamais avoir à réimprimer vos QR codes.',
        },
        {
          q: 'Quelles sont les langues disponibles sur le menu ?',
          a: 'Chaque menu est disponible en 3 langues : Arabe (affichage RTL), Français et Anglais. Vos clients passent d’une langue à l’autre en un seul clic.',
        },
        {
          q: 'Comment recevoir et imprimer mon QR code ?',
          a: 'Nous vous fournissons le QR code en haute qualité (PNG et SVG vectoriel) ainsi qu’une maquette de chevalet de table au format A5 (PDF) aux couleurs de votre café, prête à être imprimée chez n’importe quel imprimeur.',
        },
        {
          q: 'Puis-je utiliser un nom de domaine personnalisé ?',
          a: 'Oui ! Par défaut, votre menu dispose d’un lien dédié et rapide (ex: mymenu.ma/m/votre-cafe), et nous pouvons également configurer votre propre domaine personnalisé sur demande.',
        },
      ],
    },
    finalCta: {
      title: 'Votre menu digital prêt avant même de finir votre café',
      subtitle:
        'Contactez-nous dès maintenant sur WhatsApp pour moderniser la carte de votre café ou restaurant au Maroc.',
      primaryCta: 'Contactez-nous sur WhatsApp',
      secondaryCta: 'Voir la démo live',
    },
    footer: {
      description:
        'La solution de menu digital QR code pensée pour les cafés, restaurants, pizzerias et glaciers au Maroc (Agadir, Casablanca, Marrakech, Rabat, Tanger).',
      navigationTitle: 'Navigation',
      contactTitle: 'Contact direct',
      seoKeywordsTitle: 'Recherches populaires',
      seoKeywords:
        'menu QR code cafe Maroc • menu digital restaurant Agadir • creation menu QR Maroc • منيو QR مقهى المغرب',
      rights: 'Tous droits réservés.',
      madeBy: `Made by ${config.agencyName}`,
    },
    menuPage: {
      backToHome: 'Créé avec My Menu',
      searchPlaceholder: 'Rechercher un plat, café, jus, pizza...',
      allCategories: 'Tout',
      noResults: 'Aucun article ne correspond à votre recherche.',
      clearSearch: 'Effacer la recherche',
      badges: {
        new: 'Nouveau',
        vegetarian: 'Végétarien',
        spicy: 'Épicé',
        soldout: 'Épuisé',
      },
      addToOrder: 'Ajouter',
      hoursTitle: 'Horaires d’ouverture',
      addressTitle: 'Adresse & Localisation',
      openInMaps: 'Ouvrir dans Google Maps',
      callNow: 'Appeler',
      whatsappContact: 'WhatsApp',
      instagramFollow: 'Instagram',
      cartButton: 'Commander sur WhatsApp',
      cartTitle: 'Votre sélection',
      cartSubtitle: 'Envoyez votre commande sur WhatsApp ou montrez cet écran au serveur',
      cartEmpty: 'Votre sélection est vide',
      totalLabel: 'Total :',
      sendOrderWhatsapp: 'Commander sur WhatsApp',
      clearCart: 'Vider la sélection',
      orderWhatsappHeader: 'Bonjour, je souhaite commander chez',
      orderWhatsappTotal: 'Total de la commande',
      footerCredit: 'Menu by My Menu',
    },
    notFound: {
      title: 'Page introuvable (404)',
      description: 'Désolé, la page ou le menu que vous cherchez n’existe pas.',
      backHome: 'Retour à l’accueil',
      viewDemo: 'Voir le menu démo',
    },
  },

  en: {
    dir: 'ltr' as const,
    langName: 'English',
    langShort: 'EN',
    seo: {
      title: 'My Menu — Digital QR Code Menu for Cafes & Restaurants in Morocco',
      description:
        'Your QR menu ready in minutes, with zero printing and 0% commission. Digital menu for cafes and restaurants in Agadir, Casablanca, Marrakech in Arabic, French & English.',
    },
    nav: {
      howItWorks: 'How it works',
      pricing: 'Pricing',
      demo: 'Live Demo',
      faq: 'FAQ',
      contact: 'Contact',
      whatsappCta: 'Chat with us on WhatsApp',
      whatsappDefaultMsg: 'Salam, je veux un menu QR pour mon cafe',
    },
    hero: {
      badge: '0% commission • No reprinting • Built for Moroccan cafes & restaurants',
      headline: 'Your QR menu ready in minutes, with zero printing',
      subheadline:
        'Turn your paper menu into a fast, modern digital menu that opens instantly on any phone with a simple QR scan. Update prices and items anytime.',
      whatsappCta: 'Contact us on WhatsApp',
      demoCta: 'View live demo',
      ticks: [
        'No app required',
        'Zero commission',
        'Update prices anytime',
      ],
      qrCardTitle: 'Scan to test live',
      qrCardSubtitle: 'Try our Agadir cafe demo menu',
      phonePreviewBadge: 'Live Preview • Marina Sol Agadir',
    },
    trustedBy: {
      title: 'Trusted by cafes and restaurants across Morocco',
    },
    benefits: {
      kicker: 'Why My Menu?',
      title: 'Everything your cafe menu needs — without the hassle',
      subtitle:
        'Designed specifically for Moroccan cafes, restaurants, pizzerias, and lounges to eliminate repetitive printing costs.',
      cards: [
        {
          title: 'Instant price & item updates',
          description:
            'Changed a price or ran out of an ingredient? Update your digital menu in seconds without ever reprinting the QR codes on your tables.',
        },
        {
          title: 'Appetizing photos & descriptions',
          description:
            'Showcase your signature dishes, Moroccan breakfast, and fresh drinks with crisp photos and clear badges (New, Vegetarian, Spicy, Sold out).',
        },
        {
          title: 'Arabic / French / English in one click',
          description:
            'Serve both local guests and international tourists effortlessly with instant language switching between Arabic (RTL), French, and English.',
        },
      ],
    },
    showcase: {
      kicker: 'Tailored to your brand',
      title: 'Here is what your customer will see',
      subtitle:
        'With a single scan, guests get a lightning-fast mobile menu featuring your logo, brand colors, and categorized dishes.',
      ticks: [
        'Custom branded with your cafe logo and color palette',
        'High-res dish photos, descriptions, and prices in MAD',
        'One-tap switch between Arabic, French, and English',
        'Optional WhatsApp order cart with 0% commission',
      ],
      demoCta: 'Open live demo',
      colorLabel: 'Customizable brand colors:',
      sampleCafesTitle: 'Categories featured in our Agadir demo:',
    },
    steps: {
      kicker: 'How it works',
      title: 'From WhatsApp message to first table scan in 3 steps',
      subtitle: 'Zero technical skills needed — our team handles the entire setup for you.',
      items: [
        {
          num: '1',
          title: 'Send us your menu on WhatsApp',
          description:
            'Snap a photo of your current paper menu or send your items list and logo directly via WhatsApp.',
        },
        {
          num: '2',
          title: 'We build your digital menu',
          description:
            'We design and structure your categories, MAD prices, photos, and AR/FR/EN translations to match your brand.',
        },
        {
          num: '3',
          title: 'Print your QR code and go live',
          description:
            'Receive your high-resolution QR code and a print-ready A5 table stand sheet ready for your guests.',
        },
      ],
      cta: 'Start on WhatsApp',
    },
    pricing: {
      kicker: 'Simple Pricing',
      title: 'One all-inclusive plan — no hidden fees, 0% commission',
      subtitle: 'Choose flexible monthly billing or save 17% with our annual plan.',
      monthlyLabel: 'Monthly',
      yearlyLabel: 'Yearly',
      discountBadge: `-${config.pricing.yearlyDiscountPercent}%`,
      planName: 'Pack Menu QR',
      planTagline: 'Complete setup, custom branding, 3 languages, and print-ready QR code included.',
      perMonth: 'MAD / month',
      perYear: 'MAD / year',
      equivalentMonthly: 'Equivalent to just 82.5 MAD / month',
      setupFeeTitle: 'One-time setup & design fee:',
      setupFeeValue: `+ ${config.pricing.setupFee} MAD`,
      setupFeeNote: 'Paid once at launch for full menu digitization, translation, and branding setup.',
      features: [
        'Unlimited categories, items, and QR scans',
        '3 languages included: Arabic, French, and English',
        'Custom brand colors and logo integration',
        'Fast price & item updates via WhatsApp request',
        'In-menu selection cart & direct WhatsApp ordering (0% commission)',
        'High-res QR code (PNG, SVG) + printable A5 table stand PDF',
        'Ultra-fast mobile hosting & Google Maps / SEO optimization',
        'Dedicated 7/7 WhatsApp support in Morocco',
      ],
      ctaButton: 'Order on WhatsApp',
      whatsappOrderMonthly: `Salam, je souhaite commander le "Pack Menu QR" en formule Mensuelle (${config.pricing.monthlyPrice} MAD/mois + ${config.pricing.setupFee} MAD de frais de création).`,
      whatsappOrderYearly: `Salam, je souhaite commander le "Pack Menu QR" en formule Annuelle (-${config.pricing.yearlyDiscountPercent}% : ${config.pricing.yearlyPrice} MAD/an + ${config.pricing.setupFee} MAD de frais de création).`,
    },
    payment: {
      kicker: 'Local Moroccan Payment Methods',
      title: 'How to pay?',
      banner: `${config.payment.advancePercent}% advance to start, the rest upon delivery. No online card checkout required, zero commission.`,
      methods: {
        virement: {
          title: 'Bank Transfer (Virement)',
          desc: 'Direct transfer to our Moroccan bank account.',
        },
        especes: {
          title: 'Cash (Espèces)',
          desc: 'In-person cash payment (available in Agadir & upon delivery).',
        },
        cih_pay_wafacash_cashplus: {
          title: 'CIH Pay / Wafacash / Cash Plus',
          desc: 'Fast transfer at any Wafacash, Cash Plus branch or via CIH Mobile.',
        },
        mobile_wallet: {
          title: 'Mobile Wallet',
          desc: 'Instant payment via Moroccan mobile wallet services.',
        },
      },
      toggleShowDetails: 'View payment details (RIB)',
      toggleHideDetails: 'Hide payment details',
      ribLabel: 'Bank RIB:',
      holderLabel: 'Account Holder:',
      copyRib: 'Copy RIB',
      copiedRib: 'Copied!',
      paymentHelpNote:
        'Simply send your transfer receipt on WhatsApp to kick off your digital menu creation right away.',
    },
    stats: {
      kicker: 'Proven Impact',
      title: 'Powering Moroccan cafes and restaurants every day',
      items: {
        scans: 'Menu QR scans',
        cafes: 'Cafes & restaurants served',
        commission: 'Commission on orders',
        support: 'WhatsApp technical support',
      },
    },
    faq: {
      kicker: 'Frequently Asked Questions',
      title: 'Everything you need to know before starting',
      items: [
        {
          q: 'How long does it take to deliver my QR menu?',
          a: 'Your complete digital menu and print-ready QR code are delivered within 24 to 48 hours after you send us your menu items and logo on WhatsApp.',
        },
        {
          q: 'How do I update prices or mark items as sold out?',
          a: 'Just send us a quick WhatsApp message! We update your prices, add new dishes, or mark items as sold out immediately—and your printed QR codes never need to change.',
        },
        {
          q: 'Which languages are supported?',
          a: 'Every menu supports Arabic (with native right-to-left layout), French, and English out of the box.',
        },
        {
          q: 'Do you provide a printable design for table QR stands?',
          a: 'Yes! Along with PNG and vector SVG files, you get a ready-to-print A5 table stand PDF featuring your logo, brand colors, and scan instructions in Arabic, French, and English.',
        },
        {
          q: 'Can I use a custom domain name?',
          a: 'Yes. By default you get a fast, clean link (e.g. mymenu.ma/m/your-cafe), and we can also connect a custom domain or subdomain for your restaurant upon request.',
        },
      ],
    },
    finalCta: {
      title: 'Your digital menu ready before you finish your coffee',
      subtitle:
        'Message us on WhatsApp today to get your custom QR menu for your cafe or restaurant in Morocco.',
      primaryCta: 'Chat with us on WhatsApp',
      secondaryCta: 'Explore live demo',
    },
    footer: {
      description:
        'Modern QR code digital menu platform crafted for cafes, restaurants, pizzerias, and lounges across Morocco (Agadir, Casablanca, Marrakech, Rabat, Tangier).',
      navigationTitle: 'Quick Links',
      contactTitle: 'Direct Contact',
      seoKeywordsTitle: 'Popular Searches',
      seoKeywords:
        'menu QR code cafe Maroc • menu digital restaurant Agadir • creation menu QR Maroc • منيو QR مقهى المغرب',
      rights: 'All rights reserved.',
      madeBy: `Made by ${config.agencyName}`,
    },
    menuPage: {
      backToHome: 'Powered by My Menu',
      searchPlaceholder: 'Search coffee, juice, breakfast, pizza...',
      allCategories: 'All',
      noResults: 'No menu items match your search.',
      clearSearch: 'Clear search',
      badges: {
        new: 'New',
        vegetarian: 'Vegetarian',
        spicy: 'Spicy',
        soldout: 'Sold Out',
      },
      addToOrder: 'Add',
      hoursTitle: 'Opening Hours',
      addressTitle: 'Address & Location',
      openInMaps: 'Open in Google Maps',
      callNow: 'Call',
      whatsappContact: 'WhatsApp',
      instagramFollow: 'Instagram',
      cartButton: 'Order on WhatsApp',
      cartTitle: 'Your Order Selection',
      cartSubtitle: 'Send your selection via WhatsApp or show this screen to your waiter',
      cartEmpty: 'Your selection is empty',
      totalLabel: 'Total:',
      sendOrderWhatsapp: 'Order on WhatsApp',
      clearCart: 'Clear selection',
      orderWhatsappHeader: 'Hello, I would like to order from',
      orderWhatsappTotal: 'Total amount',
      footerCredit: 'Menu by My Menu',
    },
    notFound: {
      title: 'Page Not Found (404)',
      description: 'Sorry, the page or menu you are looking for does not exist.',
      backHome: 'Back to Home',
      viewDemo: 'View Demo Menu',
    },
  },
};

export type TranslationBundle = (typeof translations)[Language];

import { config } from '../config';
import type { ClientMenu } from './types';

export const demoMenu: ClientMenu = {
  slug: 'demo',
  name: 'Marina Sol Café',
  logo: config.images.demoMenu.logo,
  tagline: {
    ar: 'قهوة مختصة، فطور بلدي مغربي وإطلالة على مارينا أكادير',
    fr: 'Café de spécialité, petit-déjeuner beldi & vue sur la Marina d’Agadir',
    en: 'Specialty coffee, Moroccan beldi breakfast & Agadir Marina view',
  },
  city: 'Agadir',
  languages: ['ar', 'fr', 'en'],
  defaultLanguage: 'ar',
  colors: {
    primary: '#6BBF3A',
    accent: '#0F1410',
    background: '#F9FAF8',
  },
  currency: 'MAD',
  contact: {
    whatsapp: '212633226714',
    phone: '+212 5 28 84 00 00',
    instagram: 'https://instagram.com/mymenu.ma',
    mapsLink: 'https://maps.google.com/?q=Marina+Agadir+Morocco',
    address: {
      ar: 'كورنيش مارينا أكادير، الشطر 2، أكادير 80000، المغرب',
      fr: 'Corniche Marina d’Agadir, Quai Principal, 80000 Agadir, Maroc',
      en: 'Agadir Marina Corniche, Main Pier, 80000 Agadir, Morocco',
    },
  },
  hours: {
    ar: 'يومياً من 07:30 صباحاً إلى 11:30 ليلاً',
    fr: 'Tous les jours de 07h30 à 23h30',
    en: 'Daily from 07:30 AM to 11:30 PM',
  },
  categories: [
    {
      id: 'cafe',
      name: {
        ar: 'قهوة ومشروبات ساخنة',
        fr: 'Café',
        en: 'Coffee & Hot Drinks',
      },
      items: [
        {
          id: 'nous-nous',
          name: {
            ar: 'قهوة نص نص مغربية',
            fr: 'Café Nous-Nous Marocain',
            en: 'Moroccan Nous-Nous Coffee',
          },
          description: {
            ar: 'نصف إسبريسو إيطالي مركز ونصف حليب طازج برغوة كريمية ناعمة.',
            fr: 'Moitié espresso italien intense, moitié lait chaud moussé à la marocaine.',
            en: 'Half rich Italian espresso, half steamed velvety milk served in a glass.',
          },
          price: 18,
          image: config.images.demoMenu.items.nousNous,
        },
        {
          id: 'espresso-arabica',
          name: {
            ar: 'إسبريسو أرابيكا 100%',
            fr: 'Espresso Pur Arabica',
            en: '100% Arabica Espresso',
          },
          description: {
            ar: 'حبوب بن محمصة بعناية بنكهة غنية وقوام متوازن، يقدم مع ماء معدني.',
            fr: 'Grains fraîchement torréfiés, arômes intenses et crema onctueuse.',
            en: 'Freshly roasted specialty beans with rich aroma and smooth crema.',
          },
          price: 16,
          image: config.images.demoMenu.items.espresso,
        },
        {
          id: 'cappuccino-artisanal',
          name: {
            ar: 'كابتشينو أرتيزانال',
            fr: 'Cappuccino Artisanal',
            en: 'Artisanal Cappuccino',
          },
          description: {
            ar: 'إسبريسو مزدوج مع حليب مبخر ورشة كاكاو خام أو قرفة حسب الطلب.',
            fr: 'Double shot d’espresso, mousse de lait micro-texturée et touche de cacao.',
            en: 'Double espresso shot with silky micro-foam and a dusting of cocoa.',
          },
          price: 22,
          image: config.images.demoMenu.items.cappuccino,
        },
        {
          id: 'the-marocain-menthe',
          name: {
            ar: 'أتاي مغربي بالنعناع والأعشاب',
            fr: 'Thé Marocain à la Menthe Fraîche',
            en: 'Fresh Mint Moroccan Tea',
          },
          description: {
            ar: 'براد أتاي شعرية أصيل بالنعناع الطازج والشيبة أو اللويزة حسب الموسم.',
            fr: 'Thé vert gunpowder infusé à la menthe fraîche d’Agadir (verre ou théière).',
            en: 'Traditional Moroccan gunpowder green tea infused with fresh local mint.',
          },
          price: 18,
          image: config.images.demoMenu.items.mintTea,
          badges: ['vegetarian'],
        },
        {
          id: 'iced-spanish-latte',
          name: {
            ar: 'سبانيش لاتيه مثلج بالكراميل',
            fr: 'Iced Spanish Latte Caramel',
            en: 'Iced Caramel Spanish Latte',
          },
          description: {
            ar: 'قهوة باردة منعشة مع الحليب المكثف المحلى، الثلج وصوص الكراميل المملح.',
            fr: 'Espresso glacé, lait froid, touche de lait concentré sucré et caramel salé.',
            en: 'Chilled espresso over ice with sweet condensed milk and salted caramel.',
          },
          price: 28,
          image: config.images.demoMenu.items.icedLatte,
          badges: ['new'],
        },
      ],
    },
    {
      id: 'jus-frais',
      name: {
        ar: 'عصائر طازجة',
        fr: 'Jus frais',
        en: 'Fresh Juices',
      },
      items: [
        {
          id: 'jus-orange-souss',
          name: {
            ar: 'عصير برتقال سوس طبيعي 100%',
            fr: 'Jus d’Orange Pressé du Souss',
            en: 'Freshly Squeezed Souss Orange Juice',
          },
          description: {
            ar: 'برتقال منطقة سوس الطازج المعصور عند الطلب بدون إضافة سكر.',
            fr: 'Oranges fraîches de la région Souss-Massa pressées à la minute, sans sucre ajouté.',
            en: 'Sweet Souss-Massa oranges freshly squeezed to order with no added sugar.',
          },
          price: 20,
          image: config.images.demoMenu.items.orangeJuice,
          badges: ['vegetarian'],
        },
        {
          id: 'zaazaa-agadir',
          name: {
            ar: 'زعزع أكادير الملكي بالفواكه الجافة',
            fr: 'Zaazaa Royal d’Agadir',
            en: 'Royal Agadir Zaazaa Smoothie',
          },
          description: {
            ar: 'سموذي الأفوكادو الكريمي مع اللوز، الكركاع، الزبيب، التمر، الشوكولاتة والكراميل.',
            fr: 'Avocat onctueux mixé au lait, garni d’amandes, noix, dattes, fruits frais et caramel.',
            en: 'Rich avocado base topped with almonds, walnuts, dates, fresh fruits and caramel.',
          },
          price: 38,
          image: config.images.demoMenu.items.avocadoZaazaa,
          badges: ['new', 'vegetarian'],
        },
        {
          id: 'panache-fruits',
          name: {
            ar: 'باناشي فواكه موسمية طازجة',
            fr: 'Panaché de Fruits Frais',
            en: 'Seasonal Fresh Fruit Cocktail',
          },
          description: {
            ar: 'مزيج منعش من الفراولة، الموز، المانجو وعصير البرتقال الطبيعي.',
            fr: 'Mélange vitaminé de fraise, mangue, banane et jus d’orange pressé.',
            en: 'Refreshing blend of strawberries, mango, banana, and fresh orange juice.',
          },
          price: 28,
          image: config.images.demoMenu.items.panacheFruits,
          badges: ['vegetarian'],
        },
        {
          id: 'citronnade-menthe',
          name: {
            ar: 'سيتروناد الحامض والنعناع والزنجبيل',
            fr: 'Citronnade Menthe & Gingembre',
            en: 'Mint & Ginger Fresh Lemonade',
          },
          description: {
            ar: 'عصير الليمون الحامض المثلج مع أوراق النعناع الطازجة ولمسة زنجبيل.',
            fr: 'Citrons jaunes pressés, feuilles de menthe fraîche, glace pilée et pointe de gingembre.',
            en: 'Freshly squeezed lemons blended with mint leaves, crushed ice, and ginger.',
          },
          price: 24,
          image: config.images.demoMenu.items.lemonMint,
          badges: ['vegetarian'],
        },
      ],
    },
    {
      id: 'petit-dejeuner',
      name: {
        ar: 'فطور الصباح',
        fr: 'Petit-déjeuner',
        en: 'Breakfast',
      },
      items: [
        {
          id: 'ftour-beldi-soussi',
          name: {
            ar: 'فطور بلدي سوسي متكامل',
            fr: 'Ftour Beldi Soussi Complet',
            en: 'Traditional Soussi Beldi Breakfast',
          },
          description: {
            ar: 'زيت أركان، أملو باللوز، عسل حر، مسمن، حرشة، بيضتان بلديتان، عصير برتقال ومشروب ساخن.',
            fr: 'Huile d’argan, amlou maison, miel, msemen, harcha, 2 œufs beldi, jus d’orange & boisson chaude.',
            en: 'Argan oil, homemade almond amlou, honey, msemen, harcha, 2 farm eggs, orange juice & hot drink.',
          },
          price: 55,
          image: config.images.demoMenu.items.ftourBeldi,
          badges: ['new'],
        },
        {
          id: 'brunch-marina',
          name: {
            ar: 'برانش مارينا سول (أفوكادو وبانكيك)',
            fr: 'Brunch Marina Sol (Avocado & Pancakes)',
            en: 'Marina Sol Signature Brunch',
          },
          description: {
            ar: 'توست الأفوكادو مع البيض المسلوق، بانكيك بالفواكه، ياغورت بالجرانولا، عصير طازج وقهوة.',
            fr: 'Avocado toast & œufs pochés, mini pancakes aux fruits, granola, jus pressé et café au choix.',
            en: 'Poached egg avocado toast, fruit pancakes, Greek yogurt granola, fresh juice & coffee.',
          },
          price: 68,
          image: config.images.demoMenu.items.brunchMarina,
        },
        {
          id: 'omelette-khlii',
          name: {
            ar: 'طاجين أومليت بالخليع الفاسي والجبن',
            fr: 'Tagine Omelette au Khliî & Fromage',
            en: 'Moroccan Khliî & Cheese Omelette Tagine',
          },
          description: {
            ar: 'ثلاث بيضات بلدية مطهوة في طاجين الفخار مع الخليع المغربي التقليدي، خبز الدار وأتاي.',
            fr: '3 œufs beldi cuits en tagine avec khliî traditionnel, fromage fondant, pain chaud et thé.',
            en: 'Clay tagine omelette with traditional Moroccan cured beef (khliî), melted cheese, bread & tea.',
          },
          price: 45,
          image: config.images.demoMenu.items.omeletteKhlii,
        },
        {
          id: 'pancakes-amlou',
          name: {
            ar: 'بانكيك بأملو اللوز والموز المكرمل',
            fr: 'Pancakes Amlou & Banane Caramélisée',
            en: 'Almond Amlou & Banana Pancakes',
          },
          description: {
            ar: 'ثلاث قطع بانكيك هشة مغطاة بأملو سوس الأصلي، شرائح الموز ورقائق اللوز المحمص.',
            fr: 'Trio de pancakes moelleux nappés d’amlou artisanal d’Agadir, banane et amandes effilées.',
            en: 'Fluffy pancakes drizzled with authentic Agadir almond amlou, banana slices, and toasted almonds.',
          },
          price: 38,
          image: config.images.demoMenu.items.pancakesAmlou,
          badges: ['vegetarian'],
        },
      ],
    },
    {
      id: 'pizza',
      name: {
        ar: 'بيتزا إيطالية',
        fr: 'Pizza',
        en: 'Artisan Pizza',
      },
      items: [
        {
          id: 'pizza-margherita',
          name: {
            ar: 'بيتزا مارغريتا الإيطالية بالريحان',
            fr: 'Pizza Margherita Authentique',
            en: 'Classic Margherita Pizza',
          },
          description: {
            ar: 'صلصة طماطم سان مارزانو، جبن موزاريلا فيور دي لاتي، أوراق الحبق الطازجة وزيت الزيتون.',
            fr: 'Sauce tomate maison, mozzarella fior di latte, basilic frais et filet d’huile d’olive vierge.',
            en: 'San Marzano tomato sauce, fior di latte mozzarella, fresh basil leaves, and extra virgin olive oil.',
          },
          price: 48,
          image: config.images.demoMenu.items.pizzaMargherita,
          badges: ['vegetarian'],
        },
        {
          id: 'pizza-fruits-de-mer',
          name: {
            ar: 'بيتزا فواكه البحر أطلس أكادير',
            fr: 'Pizza Fruits de Mer d’Agadir',
            en: 'Agadir Atlantic Seafood Pizza',
          },
          description: {
            ar: 'قمرون طازج، كالمار، بلح البحر، صلصة طماطم بالأعشاب، موزاريلا ولمسة حارة خفيفة.',
            fr: 'Crevettes fraîches du port d’Agadir, calamars, moules, mozzarella, ail et pointe pimentée.',
            en: 'Fresh Agadir shrimp, calamari, mussels, herb tomato sauce, mozzarella, and a hint of chili.',
          },
          price: 72,
          image: config.images.demoMenu.items.pizzaSeafood,
          badges: ['new', 'spicy'],
        },
        {
          id: 'pizza-poulet-fume',
          name: {
            ar: 'بيتزا الدجاج المدخن والفطر الطازج',
            fr: 'Pizza Poulet Fumé & Champignons',
            en: 'Smoked Chicken & Mushroom Pizza',
          },
          description: {
            ar: 'صلصة بيضاء كريمية، شرائح صدر الدجاج المدخن، فطر طازج، جبن موزاريلا وزعتر بري.',
            fr: 'Base crème fraîche, émincé de poulet fumé, champignons de Paris frais, mozzarella et origan.',
            en: 'Creamy white base, smoked chicken breast, fresh mushrooms, melted mozzarella, and oregano.',
          },
          price: 62,
          image: config.images.demoMenu.items.pizzaChicken,
        },
        {
          id: 'pizza-quatre-fromages',
          name: {
            ar: 'بيتزا الأجبان الأربعة الإيطالية',
            fr: 'Pizza 4 Fromages Affinés',
            en: 'Four Cheese Artisan Pizza',
          },
          description: {
            ar: 'مزيج غني من الموزاريلا، الغورغونزولا، البارميزان وجبن الماعز مع لمسة عسل.',
            fr: 'Alliance fondante de mozzarella, gorgonzola, parmesan reggiano et chèvre avec filet de miel.',
            en: 'Rich blend of mozzarella, gorgonzola, aged parmesan, and goat cheese with a honey drizzle.',
          },
          price: 65,
          image: config.images.demoMenu.items.pizzaFourCheese,
          badges: ['vegetarian', 'soldout'],
        },
      ],
    },
    {
      id: 'desserts',
      name: {
        ar: 'حلويات',
        fr: 'Desserts',
        en: 'Desserts',
      },
      items: [
        {
          id: 'tiramisu-cafe',
          name: {
            ar: 'تيراميسو إيطالي بالقهوة المختصة',
            fr: 'Tiramisu Maison au Café Espresso',
            en: 'Homemade Espresso Tiramisu',
          },
          description: {
            ar: 'طبقات البسكويت المشرب بالإسبريسو مع كريمة الماسكاربوني الغنية والكاكاو المر.',
            fr: 'Biscuits cuillère imbibés d’espresso arabica, crème mascarpone légère et cacao pur.',
            en: 'Espresso-soaked Savoiardi biscuits layered with whipped mascarpone cream and cocoa.',
          },
          price: 35,
          image: config.images.demoMenu.items.tiramisu,
          badges: ['vegetarian'],
        },
        {
          id: 'cheesecake-fruits-rouges',
          name: {
            ar: 'تشيز كيك نيويورك بالفواكه الحمراء',
            fr: 'Cheesecake aux Fruits Rouges',
            en: 'Red Berry New York Cheesecake',
          },
          description: {
            ar: 'تشيز كيك مخبوز بقوام كريمي على قاعدة بسكويت مقرمش مع كولي التوت والفراولة.',
            fr: 'Cheesecake onctueux sur biscuit spéculoos croquant, nappé d’un coulis de fruits rouges maison.',
            en: 'Creamy baked cheesecake over a crunchy biscuit base topped with homemade berry coulis.',
          },
          price: 38,
          image: config.images.demoMenu.items.cheesecake,
          badges: ['vegetarian'],
        },
        {
          id: 'fondant-chocolat',
          name: {
            ar: 'فوندان الشوكولاتة الداكنة مع آيس كريم الفانيليا',
            fr: 'Fondant au Chocolat Noir & Glace Vanille',
            en: 'Warm Dark Chocolate Lava Cake',
          },
          description: {
            ar: 'كيك شوكولاتة بقلب سائل دافئ يقدم مع كرة آيس كريم فانيليا مدغشقر.',
            fr: 'Cœur coulant au chocolat noir 70% servi tiède avec sa boule de glace vanille artisanale.',
            en: '70% dark chocolate molten lava cake served warm with a scoop of vanilla bean ice cream.',
          },
          price: 42,
          image: config.images.demoMenu.items.fondantChocolat,
          badges: ['new', 'vegetarian'],
        },
        {
          id: 'crepe-amlou-amandes',
          name: {
            ar: 'كريب أملو السوسي واللوز المقرمش',
            fr: 'Crêpe Amlou & Amandes Grillées',
            en: 'Soussi Amlou & Toasted Almond Crepe',
          },
          description: {
            ar: 'كريب فرنسي رقيق محشو بأملو اللوز الحر، شرائح اللوز المحمص والعسل.',
            fr: 'Crêpe fine garnie d’amlou traditionnel aux amandes torréfiées et filet de miel d’oranger.',
            en: 'Delicate crepe filled with roasted almond amlou, crunchy almonds, and orange blossom honey.',
          },
          price: 32,
          image: config.images.demoMenu.items.crepeAmlou,
          badges: ['vegetarian'],
        },
      ],
    },
  ],
};

export default demoMenu;

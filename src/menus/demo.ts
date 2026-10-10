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
    primary: '#C25E28',
    accent: '#18181B',
    background: '#FAF8F5',
  },
  currency: 'MAD',
  contact: {
    whatsapp: config.whatsappNumber,
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
  weeklyHours: {
    monday: { open: '07:30', close: '23:30' },
    tuesday: { open: '07:30', close: '23:30' },
    wednesday: { open: '07:30', close: '23:30' },
    thursday: { open: '07:30', close: '23:30' },
    friday: { open: '07:30', close: '23:59' },
    saturday: { open: '08:00', close: '23:59' },
    sunday: { open: '08:00', close: '23:30' },
  },
  promoBanner: {
    enabled: true,
    badge: {
      ar: 'عرض الصباح • مارينا أكادير',
      fr: 'Offre Matinale • Marina Agadir',
      en: 'Morning Special • Agadir Marina',
    },
    title: {
      ar: 'فطور بلدي سوسي متكامل مع أملو وأركان',
      fr: 'Ftour Beldi Soussi Complet avec Amlou & Argan',
      en: 'Complete Soussi Beldi Breakfast with Amlou & Argan',
    },
    subtitle: {
      ar: 'مسمن، حرشة، بيض بلدي، عصير برتقال سوس الطازج ومشروب ساخن من اختيارك',
      fr: 'Msemen, harcha, œufs beldi, jus d’orange pressé du Souss & boisson chaude au choix',
      en: 'Msemen, harcha, farm eggs, fresh Souss orange juice & your choice of hot drink',
    },
    buttonText: {
      ar: 'اكتشف القائمة',
      fr: 'Découvrir la sélection',
      en: 'Explore selection',
    },
    image: config.images.demoMenu.cover,
    targetCategoryId: 'plats-gourmands',
  },
  upsellItemIds: ['tiramisu-cafe', 'jus-orange-souss', 'the-marocain-menthe', 'pancakes-amlou'],
  orderTypes: {
    dineIn: true,
    takeaway: true,
    delivery: true,
  },
  delivery: {
    minimumOrder: 50,
    freeDeliveryThreshold: 120,
    zones: [
      {
        id: 'marina-centre',
        name: {
          ar: 'مارينا ووسط مدينة أكادير',
          fr: 'Marina & Centre-Ville Agadir',
          en: 'Agadir Marina & City Center',
        },
        fee: 10,
        estimatedTime: {
          ar: '20 إلى 30 دقيقة',
          fr: '20 à 30 min',
          en: '20 to 30 mins',
        },
      },
      {
        id: 'talborjt-founty',
        name: {
          ar: 'تالبرجت، فونتي وحي الداخلة',
          fr: 'Talborjt, Founty & Hay Dakhla',
          en: 'Talborjt, Founty & Hay Dakhla',
        },
        fee: 15,
        estimatedTime: {
          ar: '30 إلى 40 دقيقة',
          fr: '30 à 40 min',
          en: '30 to 40 mins',
        },
      },
      {
        id: 'anza-salam',
        name: {
          ar: 'أنزا، حي السلام وحي المحمدي',
          fr: 'Anza, Hay Salam & Hay Mohammadi',
          en: 'Anza, Hay Salam & Hay Mohammadi',
        },
        fee: 20,
        estimatedTime: {
          ar: '35 إلى 45 دقيقة',
          fr: '35 à 45 min',
          en: '35 to 45 mins',
        },
      },
    ],
  },
  categories: [
    {
      id: 'boissons',
      name: {
        ar: 'قهوة وعصائر طازجة',
        fr: 'Café & Jus Frais',
        en: 'Coffee & Fresh Juices',
      },
      items: [
        {
          id: 'nous-nous',
          name: {
            ar: 'قهوة نص نص مغربية أرابيكا',
            fr: 'Café Nous-Nous Marocain Pur Arabica',
            en: 'Moroccan Nous-Nous Arabica Coffee',
          },
          description: {
            ar: 'نصف إسبريسو إيطالي مركز ونصف حليب طازج برغوة كريمية ناعمة يقدم على الطريقة المغربية.',
            fr: 'Moitié espresso italien intense, moitié lait chaud moussé à la marocaine servi en verre.',
            en: 'Half rich Italian espresso, half steamed velvety milk served in a traditional glass.',
          },
          price: 18,
          image: config.images.demoMenu.items.nousNous,
          popular: true,
          badges: ['popular'],
          allergens: {
            ar: ['الحليب (اللاكتوز)'],
            fr: ['Lait (lactose)'],
            en: ['Milk (lactose)'],
          },
          options: [
            {
              id: 'size',
              name: {
                ar: 'الحجم',
                fr: 'Taille',
                en: 'Size',
              },
              type: 'single',
              required: true,
              choices: [
                {
                  id: 'regular',
                  name: { ar: 'عادي (كأس كلاسيكي)', fr: 'Classique', en: 'Regular' },
                  price: 0,
                },
                {
                  id: 'large',
                  name: { ar: 'كبير (دوبل شوت)', fr: 'Grand (Double shot)', en: 'Large (Double shot)' },
                  price: 6,
                },
              ],
            },
            {
              id: 'extras',
              name: {
                ar: 'إضافات اختيارية',
                fr: 'Suppléments',
                en: 'Extras',
              },
              type: 'multiple',
              choices: [
                {
                  id: 'oat-milk',
                  name: { ar: 'حليب الشوفان النباتي', fr: 'Lait d’avoine végétal', en: 'Oat milk' },
                  price: 5,
                },
                {
                  id: 'caramel-drizzle',
                  name: { ar: 'لمسة كراميل مملح', fr: 'Touche de caramel salé', en: 'Salted caramel drizzle' },
                  price: 4,
                },
              ],
            },
          ],
        },
        {
          id: 'iced-spanish-latte',
          name: {
            ar: 'سبانيش لاتيه مثلج بالكراميل المملح',
            fr: 'Iced Spanish Latte au Caramel Salé',
            en: 'Iced Salted Caramel Spanish Latte',
          },
          description: {
            ar: 'قهوة إسبريسو باردة منعشة مع الحليب المكثف المحلى، مكعبات الثلج وصوص الكراميل.',
            fr: 'Double espresso glacé, lait froid onctueux, touche de lait concentré sucré et caramel.',
            en: 'Chilled double espresso over ice with sweet condensed milk and salted caramel.',
          },
          price: 28,
          image: config.images.demoMenu.items.icedLatte,
          popular: true,
          badges: ['popular', 'new'],
          allergens: {
            ar: ['الحليب (اللاكتوز)'],
            fr: ['Lait (lactose)'],
            en: ['Milk (lactose)'],
          },
          options: [
            {
              id: 'sweetness',
              name: {
                ar: 'درجة الحلاوة',
                fr: 'Niveau de sucre',
                en: 'Sweetness Level',
              },
              type: 'single',
              required: true,
              choices: [
                {
                  id: 'normal',
                  name: { ar: 'حلاوة معتدلة (الأصلي)', fr: 'Normal (Recette originale)', en: 'Regular sweetness' },
                  price: 0,
                },
                {
                  id: 'light',
                  name: { ar: 'خفيف الحلاوة', fr: 'Léger en sucre', en: 'Less sweet' },
                  price: 0,
                },
              ],
            },
            {
              id: 'toppings',
              name: {
                ar: 'إضافات',
                fr: 'Extras gourmands',
                en: 'Toppings',
              },
              type: 'multiple',
              choices: [
                {
                  id: 'whipped-cream',
                  name: { ar: 'كريمة مخفوقة (شانتيي)', fr: 'Crème chantilly maison', en: 'Whipped cream' },
                  price: 5,
                },
                {
                  id: 'extra-shot',
                  name: { ar: 'شوت إسبريسو إضافي', fr: 'Shot espresso supplémentaire', en: 'Extra espresso shot' },
                  price: 6,
                },
              ],
            },
          ],
        },
        {
          id: 'zaazaa-agadir',
          name: {
            ar: 'زعزع أكادير الملكي بالفواكه الجافة',
            fr: 'Zaazaa Royal d’Agadir aux Fruits Secs',
            en: 'Royal Agadir Zaazaa Avocado Smoothie',
          },
          description: {
            ar: 'سموذي الأفوكادو الكريمي مع اللوز، الكركاع، الزبيب، التمر، الموز وصوص الشوكولاتة.',
            fr: 'Avocat onctueux mixé au lait, garni d’amandes, noix, dattes, banane et chocolat.',
            en: 'Rich avocado base topped with almonds, walnuts, dates, fresh banana and chocolate.',
          },
          price: 38,
          image: config.images.demoMenu.items.avocadoZaazaa,
          badges: ['vegetarian', 'new'],
          allergens: {
            ar: ['الحليب', 'المكسرات (اللوز والكركاع)'],
            fr: ['Lait', 'Fruits à coque (amandes, noix)'],
            en: ['Milk', 'Tree nuts (almonds, walnuts)'],
          },
          options: [
            {
              id: 'zaazaa-extras',
              name: {
                ar: 'إضافات ملكية',
                fr: 'Suppléments Royaux',
                en: 'Royal Add-ons',
              },
              type: 'multiple',
              choices: [
                {
                  id: 'amlou-spoon',
                  name: { ar: 'ملعقة أملو اللوز السوسي', fr: 'Cuillère d’amlou pur amandes', en: 'Scoop of almond amlou' },
                  price: 8,
                },
                {
                  id: 'cashews',
                  name: { ar: 'أكاجو وفستق إضافي', fr: 'Noix de cajou & pistaches', en: 'Extra cashews & pistachios' },
                  price: 7,
                },
              ],
            },
          ],
        },
        {
          id: 'jus-orange-souss',
          name: {
            ar: 'عصير برتقال سوس طبيعي 100%',
            fr: 'Jus d’Orange Pressé du Souss 100% Naturel',
            en: '100% Freshly Squeezed Souss Orange Juice',
          },
          description: {
            ar: 'برتقال منطقة سوس الطازج المعصور عند الطلب بدون ماء وبدون إضافة سكر.',
            fr: 'Oranges fraîches de la région Souss-Massa pressées à la minute, sans sucre ajouté.',
            en: 'Sweet Souss-Massa oranges freshly squeezed to order with zero added sugar.',
          },
          price: 20,
          image: config.images.demoMenu.items.orangeJuice,
          badges: ['vegetarian'],
          options: [
            {
              id: 'juice-size',
              name: { ar: 'الحجم', fr: 'Format', en: 'Size' },
              type: 'single',
              required: true,
              choices: [
                { id: 'verre-33cl', name: { ar: 'كأس 33 سل', fr: 'Verre 33 cl', en: 'Glass 330ml' }, price: 0 },
                { id: 'carafe-50cl', name: { ar: 'كأس كبير 50 سل', fr: 'Grand Verre 50 cl', en: 'Large 500ml' }, price: 8 },
              ],
            },
          ],
        },
        {
          id: 'the-marocain-menthe',
          name: {
            ar: 'براد أتاي مغربي بالنعناع والأعشاب',
            fr: 'Théière Marocaine à la Menthe Fraîche',
            en: 'Traditional Moroccan Mint Tea Pot',
          },
          description: {
            ar: 'أتاي شعرية أصيل بالنعناع الطازج أو الأعشاب العطرية (الشيبة واللويزة).',
            fr: 'Thé vert gunpowder infusé à la menthe fraîche d’Agadir et plantes aromatiques.',
            en: 'Authentic gunpowder green tea infused with fresh Agadir mint leaves.',
          },
          price: 18,
          image: config.images.demoMenu.items.mintTea,
          badges: ['vegetarian'],
          options: [
            {
              id: 'tea-sugar',
              name: { ar: 'السكر', fr: 'Sucre', en: 'Sugar preference' },
              type: 'single',
              required: true,
              choices: [
                { id: 'medium-sugar', name: { ar: 'حلو معتدل', fr: 'Sucre moyen', en: 'Medium sweet' }, price: 0 },
                { id: 'sugar-on-side', name: { ar: 'السكر على جنب', fr: 'Sucre à part', en: 'Sugar on the side' }, price: 0 },
                { id: 'no-sugar', name: { ar: 'بدون سكر (مسوس)', fr: 'Sans sucre', en: 'Unsweetened' }, price: 0 },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'plats-gourmands',
      name: {
        ar: 'فطور، بيتزا وحلويات',
        fr: 'Brunch, Pizzas & Desserts',
        en: 'Brunch, Pizzas & Desserts',
      },
      items: [
        {
          id: 'ftour-beldi-soussi',
          name: {
            ar: 'فطور بلدي سوسي متكامل بأملو وأركان',
            fr: 'Ftour Beldi Soussi Complet (Amlou & Argan)',
            en: 'Complete Soussi Beldi Breakfast Platter',
          },
          description: {
            ar: 'زيت أركان، أملو اللوز، عسل حر، مسمن، حرشة، بيضتان بلديتان، عصير برتقال ومشروب ساخن.',
            fr: 'Huile d’argan, amlou maison, miel, msemen, harcha, 2 œufs beldi, jus d’orange & boisson chaude.',
            en: 'Argan oil, almond amlou, honey, msemen, harcha, 2 farm eggs, fresh orange juice & hot drink.',
          },
          price: 55,
          image: config.images.demoMenu.items.ftourBeldi,
          popular: true,
          badges: ['popular', 'new'],
          allergens: {
            ar: ['الغلوتين (القمح)', 'البيض', 'اللوز (المكسرات)', 'الحليب'],
            fr: ['Gluten (blé)', 'Œufs', 'Amandes (fruits à coque)', 'Lait'],
            en: ['Gluten (wheat)', 'Eggs', 'Almonds (tree nuts)', 'Milk'],
          },
          options: [
            {
              id: 'hot-drink',
              name: {
                ar: 'المشروب الساخن المرافق',
                fr: 'Boisson chaude incluse',
                en: 'Included Hot Drink',
              },
              type: 'single',
              required: true,
              choices: [
                { id: 'atay', name: { ar: 'براد أتاي بالنعناع', fr: 'Thé marocain à la menthe', en: 'Moroccan mint tea' }, price: 0 },
                { id: 'nousnous', name: { ar: 'قهوة نص نص أو إسبريسو', fr: 'Café Nous-Nous ou Espresso', en: 'Nous-Nous or Espresso' }, price: 0 },
                { id: 'cappuccino', name: { ar: 'كابتشينو إيطالي', fr: 'Cappuccino artisanal', en: 'Artisanal Cappuccino' }, price: 5 },
              ],
            },
            {
              id: 'ftour-extras',
              name: {
                ar: 'إضافات الفطور البلدي',
                fr: 'Suppléments Ftour',
                en: 'Breakfast Extras',
              },
              type: 'multiple',
              choices: [
                { id: 'khlii', name: { ar: 'إضافة الخليع الفاسي للبيض', fr: 'Supplément Khliî traditionnel', en: 'Add traditional cured beef (Khliî)' }, price: 12 },
                { id: 'extra-msemen', name: { ar: 'مسمنة وحرشة إضافية', fr: 'Msemen & Harcha supplémentaires', en: 'Extra Msemen & Harcha' }, price: 8 },
              ],
            },
          ],
        },
        {
          id: 'pizza-fruits-de-mer',
          name: {
            ar: 'بيتزا فواكه البحر أطلس أكادير',
            fr: 'Pizza Fruits de Mer d’Agadir au Feu de Bois',
            en: 'Agadir Atlantic Wood-Fired Seafood Pizza',
          },
          description: {
            ar: 'قمرون طازج، كالمار، بلح البحر، صلصة طماطم بالأعشاب، جبن موزاريلا ولمسة حارة خفيفة.',
            fr: 'Crevettes fraîches du port d’Agadir, calamars, moules, mozzarella fior di latte et pointe pimentée.',
            en: 'Fresh Agadir shrimp, calamari, mussels, herb tomato sauce, fior di latte mozzarella & chili.',
          },
          price: 72,
          image: config.images.demoMenu.items.pizzaSeafood,
          popular: true,
          badges: ['popular', 'spicy'],
          allergens: {
            ar: ['القشريات وفواكه البحر', 'الغلوتين', 'الحليب (موزاريلا)'],
            fr: ['Crustacés & mollusques', 'Gluten', 'Lait (mozzarella)'],
            en: ['Shellfish & seafood', 'Gluten', 'Milk (mozzarella)'],
          },
          options: [
            {
              id: 'pizza-size',
              name: { ar: 'حجم البيتزا', fr: 'Taille de la Pizza', en: 'Pizza Size' },
              type: 'single',
              required: true,
              choices: [
                { id: 'medium-30cm', name: { ar: 'متوسطة (30 سم)', fr: 'Moyenne (30 cm)', en: 'Medium (30 cm)' }, price: 0 },
                { id: 'large-36cm', name: { ar: 'عائلية كبيرة (36 سم)', fr: 'Grande Familiale (36 cm)', en: 'Large Family (36 cm)' }, price: 18 },
              ],
            },
            {
              id: 'pizza-extras',
              name: { ar: 'إضافات البيتزا', fr: 'Suppléments Pizza', en: 'Pizza Toppings' },
              type: 'multiple',
              choices: [
                { id: 'extra-mozzarella', name: { ar: 'جبن موزاريلا إضافي', fr: 'Double Mozzarella', en: 'Extra Mozzarella' }, price: 10 },
                { id: 'stuffed-crust', name: { ar: 'أطراف محشوة بالجبن', fr: 'Croûte fourrée au fromage', en: 'Cheese-stuffed crust' }, price: 12 },
              ],
            },
          ],
        },
        {
          id: 'pancakes-amlou',
          name: {
            ar: 'بانكيك بأملو اللوز الحر والموز المكرمل',
            fr: 'Pancakes Moelleux Amlou & Banane Caramélisée',
            en: 'Fluffy Almond Amlou & Banana Pancakes',
          },
          description: {
            ar: 'ثلاث قطع بانكيك هشة مغطاة بأملو سوس الأصلي، شرائح الموز الطازج ورقائق اللوز المحمص.',
            fr: 'Trio de pancakes moelleux nappés d’amlou artisanal d’Agadir, banane fraîche et amandes effilées.',
            en: 'Three fluffy pancakes drizzled with authentic Agadir almond amlou, banana slices & toasted almonds.',
          },
          price: 38,
          image: config.images.demoMenu.items.pancakesAmlou,
          badges: ['vegetarian'],
          allergens: {
            ar: ['اللوز', 'الغلوتين', 'البيض', 'الحليب'],
            fr: ['Amandes', 'Gluten', 'Œufs', 'Lait'],
            en: ['Almonds', 'Gluten', 'Eggs', 'Milk'],
          },
          options: [
            {
              id: 'pancake-toppings',
              name: { ar: 'إضافات حلوة', fr: 'Gourmandises supplémentaires', en: 'Sweet Add-ons' },
              type: 'multiple',
              choices: [
                { id: 'vanilla-icecream', name: { ar: 'كرة آيس كريم فانيليا', fr: 'Boule de glace vanille', en: 'Scoop of vanilla ice cream' }, price: 8 },
                { id: 'nutella-drizzle', name: { ar: 'صوص شوكولاتة البندق', fr: 'Filet de chocolat noisette', en: 'Hazelnut chocolate drizzle' }, price: 6 },
              ],
            },
          ],
        },
        {
          id: 'tiramisu-cafe',
          name: {
            ar: 'تيراميسو إيطالي بالقهوة المختصة',
            fr: 'Tiramisu Maison au Café Espresso',
            en: 'Homemade Specialty Espresso Tiramisu',
          },
          description: {
            ar: 'طبقات البسكويت المشرب بالإسبريسو مع كريمة الماسكاربوني الغنية ورشة الكاكاو الخام.',
            fr: 'Biscuits cuillère imbibés d’espresso arabica, crème mascarpone légère et cacao pur.',
            en: 'Espresso-soaked Savoiardi biscuits layered with whipped mascarpone cream and pure cocoa.',
          },
          price: 35,
          image: config.images.demoMenu.items.tiramisu,
          badges: ['vegetarian'],
          allergens: {
            ar: ['الحليب (ماسكاربوني)', 'البيض', 'الغلوتين'],
            fr: ['Lait (mascarpone)', 'Œufs', 'Gluten'],
            en: ['Milk (mascarpone)', 'Eggs', 'Gluten'],
          },
        },
        {
          id: 'pizza-quatre-fromages',
          name: {
            ar: 'بيتزا الأجبان الأربعة الإيطالية بالعسل',
            fr: 'Pizza 4 Fromages Affinés & Filet de Miel',
            en: 'Four Cheese Artisan Pizza with Honey Drizzle',
          },
          description: {
            ar: 'مزيج غني من الموزاريلا، الغورغونزولا، البارميزان وجبن الماعز مع لمسة عسل حر.',
            fr: 'Alliance fondante de mozzarella, gorgonzola, parmesan reggiano et chèvre avec filet de miel.',
            en: 'Rich blend of mozzarella, gorgonzola, aged parmesan, and goat cheese with wildflower honey.',
          },
          price: 65,
          image: config.images.demoMenu.items.pizzaFourCheese,
          badges: ['vegetarian', 'soldout'],
          allergens: {
            ar: ['الحليب والأجبان', 'الغلوتين'],
            fr: ['Lait & fromages', 'Gluten'],
            en: ['Milk & cheese', 'Gluten'],
          },
        },
      ],
    },
  ],
};

export default demoMenu;

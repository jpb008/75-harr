// Average grocery prices for estimating a shopping list's cost.
//
// Canada: Statistics Canada, table 18-10-0245-01 "Monthly average retail
// prices for selected products", Canada, September 2026 (released
// 2026-11-04). US: Bureau of Labor Statistics CPI average price data,
// U.S. city average, October 2026.
//
// These are national averages across all stores. Discount grocers and
// store brands usually come in below them, and prices vary by city and
// week, so the app always labels totals as estimates.
//
// Each buy option says how much of the ingredient AS USED in the meal plan
// one purchase covers. `yield` converts raw/dry/whole weight to the
// cooked/edible weight the recipes use (e.g. 1 kg raw chicken -> ~750 g
// cooked; 1 kg dry rice -> ~3 kg cooked; bananas lose ~1/3 to the peel).
//
// kinds: 'pack' = fixed package (size = used grams/ml it covers),
//        'weight' = sold by weight (per 'kg' or 'lb').

export const PRICE_SOURCES = {
  ca: {
    currency: 'CAD',
    symbol: '$',
    label: 'Statistics Canada average retail prices, Canada, September 2026',
    url: 'https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810024501',
  },
  us: {
    currency: 'USD',
    symbol: '$',
    label: 'U.S. Bureau of Labor Statistics average prices, U.S. city average, October 2026',
    url: 'https://www.bls.gov/charts/consumer-price-index/consumer-price-index-average-price-data.htm',
  },
}

const LB = 453.6

export const BUY_OPTIONS = {
  ca: {
    eggs: [{ kind: 'pack', label: '1 dozen eggs', size: 600, price: 4.83 }],
    milk: [
      { kind: 'pack', label: '4 L milk', size: 4000, price: 6.99 },
      { kind: 'pack', label: '2 L milk', size: 2000, price: 5.5 },
      { kind: 'pack', label: '1 L milk', size: 1000, price: 3.22 },
    ],
    soyMilk: [{ kind: 'pack', label: '1.89 L soy milk', size: 1890, price: 4.57 }],
    chicken: [{ kind: 'weight', per: 'kg', label: 'chicken breasts (raw)', price: 14.48, yield: 0.75 }],
    leanBeef: [{ kind: 'weight', per: 'kg', label: 'ground beef (raw)', price: 16.92, yield: 0.75 }],
    salmon: [{ kind: 'weight', per: 'kg', label: 'salmon (raw)', price: 28.22, yield: 0.8 }],
    tuna: [{ kind: 'pack', label: '170 g can of tuna', size: 120, price: 1.69 }],
    shrimp: [{ kind: 'pack', label: '300 g bag of shrimp', size: 300, price: 7.39 }],
    tofu: [{ kind: 'pack', label: '350 g block of tofu', size: 350, price: 2.77 }],
    lentils: [
      { kind: 'pack', label: '900 g bag of dry lentils', size: 2250, price: 3.56, needsCooking: true },
      { kind: 'pack', label: '540 mL can of lentils', size: 300, price: 1.75 },
    ],
    blackBeans: [
      { kind: 'pack', label: '900 g bag of dry beans', size: 2160, price: 3.52, needsCooking: true },
      { kind: 'pack', label: '540 mL can of beans', size: 300, price: 1.75 },
    ],
    chickpeas: [
      { kind: 'pack', label: '900 g bag of dry chickpeas', size: 2160, price: 3.52, needsCooking: true },
      { kind: 'pack', label: '540 mL can of chickpeas', size: 300, price: 1.75 },
    ],
    greekYogurt: [{ kind: 'pack', label: '500 g tub of yogurt', size: 500, price: 3.88, note: 'Price is the average for plain yogurt; Greek usually costs a little more.' }],
    cheddar: [{ kind: 'pack', label: '500 g block of cheese', size: 500, price: 6.98 }],
    mozzarella: [{ kind: 'pack', label: '500 g block of mozzarella', size: 500, price: 6.98 }],
    rice: [{ kind: 'pack', label: '2 kg bag of white rice', size: 6000, price: 9.35 }],
    wwPasta: [{ kind: 'pack', label: '500 g box of pasta', size: 1125, price: 3.4 }],
    bread: [{ kind: 'pack', label: '675 g loaf of bread', size: 675, price: 3.58 }],
    tortilla: [{ kind: 'pack', label: '500 g pack of tortillas/flatbread', size: 500, price: 3.51 }],
    potato: [
      { kind: 'pack', label: '4.54 kg (10 lb) bag of potatoes', size: 4540, price: 4.05 },
      { kind: 'weight', per: 'kg', label: 'loose potatoes', price: 5.12, yield: 1 },
    ],
    sweetPotato: [{ kind: 'weight', per: 'kg', label: 'sweet potatoes', price: 4.24, yield: 0.9 }],
    banana: [{ kind: 'weight', per: 'kg', label: 'bananas', price: 1.88, yield: 0.67 }],
    apple: [{ kind: 'weight', per: 'kg', label: 'apples', price: 4.79, yield: 0.9 }],
    berries: [
      { kind: 'pack', label: '600 g bag of frozen strawberries', size: 600, price: 5.28 },
      { kind: 'pack', label: '454 g fresh strawberries', size: 430, price: 5.19, fresh: true },
    ],
    broccoli: [
      { kind: 'pack', label: 'head of broccoli', size: 350, price: 2.25, fresh: true },
      { kind: 'pack', label: '500 g bag of frozen broccoli', size: 500, price: 3.93 },
    ],
    spinach: [{ kind: 'pack', label: '300 g frozen spinach', size: 300, price: 2.14 }],
    greens: [
      { kind: 'pack', label: 'head of romaine lettuce', size: 400, price: 3.13, fresh: true },
      { kind: 'pack', label: '142 g bag of salad greens', size: 142, price: 4.48, fresh: true },
    ],
    mixedVeg: [{ kind: 'pack', label: '750 g bag of frozen mixed vegetables', size: 750, price: 4.22 }],
    bellPepper: [{ kind: 'weight', per: 'kg', label: 'peppers', price: 5.93, yield: 0.85 }],
    tomato: [{ kind: 'weight', per: 'kg', label: 'tomatoes', price: 4.71, yield: 1 }],
    cannedTomato: [{ kind: 'pack', label: '796 mL can of tomatoes', size: 796, price: 2.07 }],
    onion: [
      { kind: 'pack', label: '1.36 kg bag of onions', size: 1220, price: 4.56 },
      { kind: 'weight', per: 'kg', label: 'loose onions', price: 5.49, yield: 0.9 },
    ],
    avocado: [{ kind: 'pack', label: 'avocado', size: 140, price: 1.67, fresh: true }],
    oliveOil: [
      { kind: 'pack', label: '3 L canola oil', size: 2760, price: 11.16, swapName: 'Canola oil', note: 'Canola works for cooking and costs far less per litre than olive oil.' },
      { kind: 'pack', label: '1 L olive oil', size: 920, price: 11.04 },
    ],
    peanutButter: [{ kind: 'pack', label: '1 kg jar of peanut butter', size: 1000, price: 5.99 }],
    almonds: [{ kind: 'pack', label: '200 g bag of almonds', size: 200, price: 5.46 }],
    hummus: [{ kind: 'pack', label: '227 g tub of hummus', size: 227, price: 3.84 }],
    salsa: [{ kind: 'pack', label: '418 mL jar of salsa', size: 430, price: 5.11 }],
    marinara: [{ kind: 'pack', label: '650 mL jar of pasta sauce', size: 680, price: 3.47 }],
  },
  us: {
    eggs: [{ kind: 'pack', label: '1 dozen eggs', size: 600, price: 2.32 }],
    milk: [{ kind: 'pack', label: '1 gallon milk', size: 3785, price: 4.1, note: 'Price is the average for whole milk.' }],
    chicken: [{ kind: 'weight', per: 'lb', label: 'boneless chicken breast (raw)', price: 4.1, yield: 0.75 }],
    leanBeef: [{ kind: 'weight', per: 'lb', label: 'lean ground beef (raw)', price: 8.4, yield: 0.75 }],
    lentils: [{ kind: 'weight', per: 'lb', label: 'dry lentils', price: 1.68, yield: 2.5, needsCooking: true }],
    blackBeans: [{ kind: 'weight', per: 'lb', label: 'dry beans', price: 1.68, yield: 2.4, needsCooking: true }],
    chickpeas: [{ kind: 'weight', per: 'lb', label: 'dry chickpeas', price: 1.68, yield: 2.4, needsCooking: true }],
    cheddar: [{ kind: 'weight', per: 'lb', label: 'block cheddar', price: 6.13, yield: 1 }],
    rice: [{ kind: 'weight', per: 'lb', label: 'white rice (dry)', price: 1.1, yield: 3 }],
    wwPasta: [{ kind: 'weight', per: 'lb', label: 'pasta (dry)', price: 1.38, yield: 2.25 }],
    bread: [{ kind: 'pack', label: '1 lb loaf of bread', size: LB, price: 1.86 }],
    potato: [{ kind: 'weight', per: 'lb', label: 'potatoes', price: 0.99, yield: 1 }],
    banana: [{ kind: 'weight', per: 'lb', label: 'bananas', price: 0.655, yield: 0.67 }],
    tomato: [{ kind: 'weight', per: 'lb', label: 'tomatoes', price: 2.08, yield: 1 }],
    greens: [{ kind: 'weight', per: 'lb', label: 'romaine lettuce', price: 3.49, yield: 0.85 }],
    berries: [{ kind: 'pack', label: '12 oz fresh strawberries', size: 320, price: 2.81, fresh: true }],
  },
}

// Where cheap groceries usually are. General guidance, not live prices.
export const STORE_TIPS = {
  ca: {
    discount: ['No Frills', 'FreshCo', 'Food Basics', 'Walmart', 'Giant Tiger', 'Maxi or Super C (Quebec)'],
    bulk: ['Costco (membership)'],
    brands: 'Store brands like No Name, Great Value, Compliments and Selection are usually the cheapest version of the same food.',
  },
  us: {
    discount: ['Aldi', 'Walmart', 'Lidl', 'WinCo'],
    bulk: ['Costco (membership)', "Sam's Club (membership)"],
    brands: "Store brands like Great Value and Aldi's own labels are usually the cheapest version of the same food.",
  },
  other: {
    discount: ['Your area\'s discount supermarket'],
    bulk: ['A warehouse club, if there is one near you'],
    brands: 'Store-brand versions are usually the cheapest version of the same food.',
  },
}

// Money-saving advice per ingredient (cheaper form of the same food).
export const SAVING_TIPS = {
  chicken: 'Family packs are cheaper per kg; freeze what you won\'t cook in 2 days.',
  leanBeef: 'Bigger packs cost less per kg; split and freeze.',
  salmon: 'Frozen fillets are usually cheaper than fresh and just as good.',
  shrimp: 'Frozen bags are the cheapest way to buy shrimp.',
  rice: 'A big bag of store-brand rice is one of the cheapest calories you can buy.',
  oats: 'Big bags of store-brand oats cost far less per bowl than packets.',
  wwPasta: 'Store-brand pasta is nearly always the cheapest.',
  cheddar: 'Buy a block and grate it yourself; pre-shredded costs more.',
  mozzarella: 'Buy a block and grate it yourself; pre-shredded costs more.',
  berries: 'Frozen berries cost less than fresh and last for months.',
  spinach: 'Frozen spinach is cheap and fine for eggs, smoothies and cooked dishes.',
  greens: 'A whole head of romaine is cheaper than bagged salad mix.',
  potato: 'A big bag costs far less per kg than loose potatoes.',
  onion: 'A bag costs less per kg than loose onions.',
  peanutButter: 'Store-brand peanut butter is usually the cheapest protein-and-fat combo.',
  whey: 'Bigger tubs cost less per scoop; check the price per serving.',
  peaProtein: 'Bigger tubs cost less per scoop; check the price per serving.',
  greekYogurt: 'Big tubs cost less than single cups.',
  eggs: 'Larger packs (18 or 30) usually cost less per egg.',
}

// About how many days an ingredient keeps once bought (fridge), and
// whether it freezes well. Used to warn when a trip covers more days.
export const KEEPS = {
  chicken: [2, true], groundTurkey: [2, true], leanBeef: [2, true], salmon: [2, true], cod: [2, true], shrimp: [2, true], turkeyDeli: [5, true],
  tofu: [7, false], tempeh: [10, true], seitan: [7, true], edamame: [90, false],
  eggs: [28, false], milk: [7, false], greekYogurt: [14, false], soyYogurt: [14, false], cottageCheese: [7, false],
  bread: [5, true], gfBread: [5, true], tortilla: [14, true], cornTortilla: [14, true],
  banana: [5, false], berries: [4, false], apple: [21, false], broccoli: [5, false], spinach: [5, false], greens: [5, false],
  bellPepper: [7, false], tomato: [5, false], avocado: [4, false], hummus: [7, false], potato: [30, false], sweetPotato: [21, false], onion: [30, false],
}

// The frozen version to suggest when fresh won't last the whole trip.
export const FROZEN_SWAP = { berries: 'frozen berries', spinach: 'frozen spinach', broccoli: 'frozen broccoli' }

// Friendlier storage advice than "top up" for specific produce.
export const KEEP_TIPS = {
  banana: 'Buy a mix of yellow and green bananas so they ripen through the week.',
  avocado: 'Buy some firm avocados so they ripen later in the week.',
  tomato: 'Keep tomatoes on the counter, not the fridge, and use the ripest first.',
  greens: 'Store lettuce wrapped in a paper towel in the fridge; it lasts days longer.',
  bellPepper: 'Peppers keep about a week in the fridge crisper.',
}

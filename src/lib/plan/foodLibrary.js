// Ingredient nutrition is per 100 g (or 100 ml for liquids), rounded from
// USDA FoodData Central values for the cooked/ready-to-eat form named.
// Brands and cooking vary, so meal totals are estimates.
//
// tags: meat, fish, shellfish, egg, dairy, gluten, soy, nut, honey
// group: what a "foods I don't eat" answer removes (see FOOD_DISLIKES).

export const INGREDIENTS = {
  chicken: { name: 'Chicken breast, cooked', kcal: 165, p: 31, c: 0, f: 3.6, tags: ['meat'], group: 'chicken', category: 'Protein', cost: 2 },
  groundTurkey: { name: 'Lean ground turkey (93%), cooked', kcal: 190, p: 27, c: 0, f: 9, tags: ['meat'], group: 'turkey', category: 'Protein', cost: 2 },
  turkeyDeli: { name: 'Sliced turkey breast', kcal: 104, p: 17, c: 4, f: 2, tags: ['meat'], group: 'turkey', category: 'Protein', cost: 2 },
  leanBeef: { name: 'Lean ground beef (90%), cooked', kcal: 217, p: 26, c: 0, f: 12, tags: ['meat'], group: 'beef', category: 'Protein', cost: 2 },
  salmon: { name: 'Salmon, cooked', kcal: 206, p: 22, c: 0, f: 12, tags: ['fish'], group: 'fish', category: 'Protein', cost: 3 },
  tuna: { name: 'Canned tuna in water, drained', kcal: 116, p: 26, c: 0, f: 1, tags: ['fish'], group: 'fish', category: 'Protein', cost: 1 },
  cod: { name: 'White fish (cod), cooked', kcal: 105, p: 23, c: 0, f: 0.9, tags: ['fish'], group: 'fish', category: 'Protein', cost: 2 },
  shrimp: { name: 'Shrimp, cooked', kcal: 99, p: 24, c: 0.2, f: 0.3, tags: ['shellfish'], group: 'shrimp', category: 'Protein', cost: 3 },
  eggs: { name: 'Eggs', kcal: 143, p: 12.6, c: 0.7, f: 9.5, tags: ['egg'], group: 'eggs', category: 'Protein', cost: 1, unitGrams: 50, unitName: 'egg' },
  tofu: { name: 'Firm tofu', kcal: 144, p: 17, c: 3, f: 9, tags: ['soy'], group: 'tofu', category: 'Protein', cost: 1 },
  tempeh: { name: 'Tempeh', kcal: 192, p: 20, c: 8, f: 11, tags: ['soy'], group: 'tofu', category: 'Protein', cost: 2 },
  seitan: { name: 'Seitan', kcal: 140, p: 25, c: 6, f: 2, tags: ['gluten'], group: 'tofu', category: 'Protein', cost: 2 },
  lentils: { name: 'Lentils, cooked', kcal: 116, p: 9, c: 20, f: 0.4, tags: [], group: 'beans', category: 'Pantry', cost: 1 },
  blackBeans: { name: 'Black beans, cooked/canned', kcal: 132, p: 8.9, c: 24, f: 0.5, tags: [], group: 'beans', category: 'Pantry', cost: 1 },
  chickpeas: { name: 'Chickpeas, cooked/canned', kcal: 164, p: 8.9, c: 27, f: 2.6, tags: [], group: 'beans', category: 'Pantry', cost: 1 },
  edamame: { name: 'Edamame, shelled', kcal: 121, p: 12, c: 9, f: 5, tags: ['soy'], group: 'tofu', category: 'Frozen', cost: 1 },
  greekYogurt: { name: 'Plain Greek yogurt (nonfat)', kcal: 59, p: 10, c: 3.6, f: 0.4, tags: ['dairy'], group: 'yogurt', category: 'Dairy', cost: 1 },
  soyYogurt: { name: 'Plain soy yogurt', kcal: 66, p: 3.5, c: 6, f: 2.5, tags: ['soy'], category: 'Dairy alternatives', cost: 2 },
  cottageCheese: { name: 'Cottage cheese (2%)', kcal: 84, p: 11, c: 4.3, f: 2.3, tags: ['dairy'], group: 'yogurt', category: 'Dairy', cost: 1 },
  milk: { name: 'Milk (2%)', kcal: 50, p: 3.3, c: 4.8, f: 2, tags: ['dairy'], category: 'Dairy', cost: 1, liquid: true },
  soyMilk: { name: 'Soy milk, unsweetened', kcal: 33, p: 2.9, c: 1.7, f: 1.6, tags: ['soy'], category: 'Dairy alternatives', cost: 1, liquid: true },
  oatMilk: { name: 'Oat milk, unsweetened', kcal: 45, p: 1, c: 7, f: 1.5, tags: [], category: 'Dairy alternatives', cost: 1, liquid: true },
  cheddar: { name: 'Cheddar cheese', kcal: 403, p: 25, c: 1.3, f: 33, tags: ['dairy'], group: 'cheese', category: 'Dairy', cost: 2 },
  mozzarella: { name: 'Part-skim mozzarella', kcal: 254, p: 24, c: 2.8, f: 16, tags: ['dairy'], group: 'cheese', category: 'Dairy', cost: 2 },
  feta: { name: 'Feta cheese', kcal: 264, p: 14, c: 4, f: 21, tags: ['dairy'], group: 'cheese', category: 'Dairy', cost: 2 },
  whey: { name: 'Whey protein powder', kcal: 400, p: 80, c: 8, f: 6, tags: ['dairy'], group: 'shakes', category: 'Pantry', cost: 2, unitGrams: 30, unitName: 'scoop', countStep: 0.25 },
  peaProtein: { name: 'Pea protein powder', kcal: 380, p: 80, c: 4, f: 6, tags: [], group: 'shakes', category: 'Pantry', cost: 2, unitGrams: 30, unitName: 'scoop', countStep: 0.25 },
  oats: { name: 'Rolled oats (dry)', kcal: 389, p: 17, c: 66, f: 7, tags: [], category: 'Pantry', cost: 1 },
  rice: { name: 'White rice, cooked', kcal: 130, p: 2.7, c: 28, f: 0.3, tags: [], category: 'Pantry', cost: 1 },
  quinoa: { name: 'Quinoa, cooked', kcal: 120, p: 4.4, c: 21, f: 1.9, tags: [], category: 'Pantry', cost: 2 },
  wwPasta: { name: 'Whole-wheat pasta, cooked', kcal: 149, p: 6, c: 30, f: 1.7, tags: ['gluten'], category: 'Pantry', cost: 1 },
  gfPasta: { name: 'Gluten-free pasta, cooked', kcal: 160, p: 3, c: 34, f: 1, tags: [], category: 'Pantry', cost: 2 },
  bread: { name: 'Whole-wheat bread', kcal: 247, p: 13, c: 41, f: 3.4, tags: ['gluten'], category: 'Bakery', cost: 1, unitGrams: 30, unitName: 'slice' },
  gfBread: { name: 'Gluten-free bread', kcal: 250, p: 4, c: 45, f: 5, tags: [], category: 'Bakery', cost: 2, unitGrams: 30, unitName: 'slice' },
  tortilla: { name: 'Whole-wheat tortilla', kcal: 300, p: 9, c: 50, f: 7, tags: ['gluten'], category: 'Bakery', cost: 1, unitGrams: 70, unitName: 'large whole-wheat tortilla' },
  cornTortilla: { name: 'Corn tortillas', kcal: 218, p: 5.7, c: 45, f: 2.9, tags: [], category: 'Bakery', cost: 1, unitGrams: 30, unitName: 'small corn tortilla' },
  riceCakes: { name: 'Rice cakes', kcal: 387, p: 8, c: 82, f: 2.8, tags: [], category: 'Pantry', cost: 1, unitGrams: 9, unitName: 'rice cake' },
  potato: { name: 'Potato, baked', kcal: 93, p: 2.5, c: 21, f: 0.1, tags: [], category: 'Produce', cost: 1 },
  sweetPotato: { name: 'Sweet potato, baked', kcal: 90, p: 2, c: 21, f: 0.2, tags: [], category: 'Produce', cost: 1 },
  banana: { name: 'Banana', kcal: 89, p: 1.1, c: 23, f: 0.3, tags: [], category: 'Produce', cost: 1, unitGrams: 118, unitName: 'banana' },
  berries: { name: 'Berries (fresh or frozen)', kcal: 57, p: 0.7, c: 14, f: 0.3, tags: [], category: 'Produce', cost: 2 },
  apple: { name: 'Apple', kcal: 52, p: 0.3, c: 14, f: 0.2, tags: [], category: 'Produce', cost: 1, unitGrams: 180, unitName: 'apple' },
  broccoli: { name: 'Broccoli', kcal: 35, p: 2.4, c: 7, f: 0.4, tags: [], category: 'Produce', cost: 1 },
  spinach: { name: 'Spinach', kcal: 23, p: 2.9, c: 3.6, f: 0.4, tags: [], category: 'Produce', cost: 1 },
  mixedVeg: { name: 'Frozen mixed vegetables', kcal: 65, p: 3, c: 13, f: 0.5, tags: [], category: 'Frozen', cost: 1 },
  bellPepper: { name: 'Bell pepper', kcal: 31, p: 1, c: 6, f: 0.3, tags: [], category: 'Produce', cost: 1 },
  greens: { name: 'Salad greens', kcal: 17, p: 1.2, c: 3.3, f: 0.2, tags: [], category: 'Produce', cost: 1 },
  tomato: { name: 'Tomatoes', kcal: 18, p: 0.9, c: 3.9, f: 0.2, tags: [], category: 'Produce', cost: 1 },
  cannedTomato: { name: 'Canned diced tomatoes', kcal: 32, p: 1.6, c: 7, f: 0.3, tags: [], category: 'Pantry', cost: 1 },
  onion: { name: 'Onion', kcal: 40, p: 1.1, c: 9.3, f: 0.1, tags: [], category: 'Produce', cost: 1 },
  avocado: { name: 'Avocado', kcal: 160, p: 2, c: 8.5, f: 14.7, tags: [], category: 'Produce', cost: 2 },
  oliveOil: { name: 'Olive oil', kcal: 884, p: 0, c: 0, f: 100, tags: [], category: 'Pantry', cost: 1, tbsp: 13.5 },
  peanutButter: { name: 'Peanut butter', kcal: 588, p: 25, c: 20, f: 50, tags: ['nut'], group: 'peanutButter', category: 'Pantry', cost: 1, tbsp: 16 },
  sunflowerButter: { name: 'Sunflower seed butter', kcal: 617, p: 17, c: 24, f: 55, tags: [], category: 'Pantry', cost: 2, tbsp: 16 },
  almonds: { name: 'Almonds', kcal: 579, p: 21, c: 22, f: 50, tags: ['nut'], category: 'Pantry', cost: 2 },
  pumpkinSeeds: { name: 'Pumpkin seeds', kcal: 574, p: 30, c: 15, f: 49, tags: [], category: 'Pantry', cost: 2, tbsp: 9 },
  chia: { name: 'Chia seeds', kcal: 486, p: 17, c: 42, f: 31, tags: [], category: 'Pantry', cost: 2, tbsp: 12 },
  hummus: { name: 'Hummus', kcal: 166, p: 7.9, c: 14, f: 9.6, tags: [], category: 'Deli', cost: 1, tbsp: 15 },
  salsa: { name: 'Salsa', kcal: 36, p: 1.5, c: 7, f: 0.2, tags: [], category: 'Pantry', cost: 1, tbsp: 16 },
  marinara: { name: 'Marinara sauce', kcal: 50, p: 1.5, c: 8, f: 1.5, tags: [], category: 'Pantry', cost: 1 },
  soySauce: { name: 'Soy sauce', kcal: 53, p: 8, c: 5, f: 0.6, tags: ['soy', 'gluten'], category: 'Pantry', cost: 1, tbsp: 16 },
  tamari: { name: 'Tamari (gluten-free soy sauce)', kcal: 60, p: 10, c: 5, f: 0.1, tags: ['soy'], category: 'Pantry', cost: 1, tbsp: 16 },
  coconutAminos: { name: 'Coconut aminos', kcal: 100, p: 0, c: 25, f: 0, tags: [], category: 'Pantry', cost: 2, tbsp: 15 },
  honey: { name: 'Honey', kcal: 304, p: 0.3, c: 82, f: 0, tags: ['honey'], category: 'Pantry', cost: 1, tbsp: 21 },
  maple: { name: 'Maple syrup', kcal: 260, p: 0, c: 67, f: 0, tags: [], category: 'Pantry', cost: 2, tbsp: 20 },
}

export const FOOD_DISLIKES = [
  { id: 'chicken', label: 'Chicken' },
  { id: 'beef', label: 'Beef' },
  { id: 'turkey', label: 'Turkey' },
  { id: 'fish', label: 'Fish' },
  { id: 'shrimp', label: 'Shrimp' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'beans', label: 'Beans & lentils' },
  { id: 'tofu', label: 'Tofu, tempeh & seitan' },
  { id: 'cheese', label: 'Cheese' },
  { id: 'yogurt', label: 'Yogurt & cottage cheese' },
  { id: 'peanutButter', label: 'Peanut butter' },
]

export const CUISINES = [
  { id: 'american', label: 'American' },
  { id: 'mexican', label: 'Mexican' },
  { id: 'asian', label: 'Asian' },
  { id: 'italian', label: 'Italian' },
  { id: 'mediterranean', label: 'Mediterranean' },
  { id: 'indian', label: 'Indian' },
  { id: 'middleEastern', label: 'Middle Eastern' },
  { id: 'caribbean', label: 'Caribbean' },
]

// kitchen: 'none' (assemble), 'microwave', 'stove' (stove/oven).
// time: 'quick' (<=10 min), 'some' (<=30 min), 'batch' (best cooked in bulk).
const m = (id, name, slot, ingredients, opts) => ({ id, name, slot, ingredients, ...opts })

export const MEALS = [
  // ── Breakfasts ──
  m('oats_pb_banana', 'Peanut butter banana oatmeal', 'breakfast', [['oats', 60], ['milk', 250], ['peanutButter', 16], ['banana', 100]], {
    kitchen: 'microwave', time: 'quick', cuisines: ['american'], steps: ['Microwave the oats with the milk for 2-3 minutes, stirring halfway.', 'Top with sliced banana and peanut butter.'],
  }),
  m('yogurt_bowl', 'Greek yogurt berry bowl', 'breakfast', [['greekYogurt', 250], ['berries', 100], ['oats', 30], ['chia', 10], ['honey', 10]], {
    kitchen: 'none', time: 'quick', cuisines: ['american', 'mediterranean'], steps: ['Spoon the yogurt into a bowl.', 'Top with berries, oats, chia and a drizzle of honey.'],
  }),
  m('egg_scramble', 'Spinach egg scramble with toast', 'breakfast', [['eggs', 150], ['spinach', 50], ['bread', 60], ['oliveOil', 5]], {
    kitchen: 'stove', time: 'quick', cuisines: ['american'], steps: ['Wilt the spinach in a pan with the oil.', 'Add whisked eggs and stir gently until just set.', 'Serve with toast.'],
  }),
  m('tofu_scramble', 'Tofu veggie scramble with toast', 'breakfast', [['tofu', 200], ['spinach', 50], ['bellPepper', 60], ['bread', 60], ['oliveOil', 5]], {
    kitchen: 'stove', time: 'quick', cuisines: ['american'], steps: ['Crumble the tofu into a hot oiled pan with the pepper.', 'Season with salt, pepper and a pinch of turmeric; add spinach at the end.', 'Serve with toast.'],
  }),
  m('protein_smoothie', 'Berry protein smoothie', 'breakfast', [['whey', 30], ['banana', 100], ['berries', 100], ['milk', 250], ['oats', 30]], {
    kitchen: 'none', time: 'quick', cuisines: ['american'], shake: true, steps: ['Blend everything until smooth (add ice if you like it thick).'],
  }),
  m('breakfast_burrito', 'Egg and black bean breakfast burrito', 'breakfast', [['eggs', 100], ['blackBeans', 60], ['cheddar', 20], ['tortilla', 70], ['salsa', 30]], {
    kitchen: 'stove', time: 'quick', cuisines: ['mexican'], steps: ['Scramble the eggs; warm the beans.', 'Fill the tortilla with eggs, beans, cheese and salsa, then roll up.'],
  }),
  m('cottage_fruit', 'Cottage cheese with berries and almonds', 'breakfast', [['cottageCheese', 200], ['berries', 100], ['almonds', 15]], {
    kitchen: 'none', time: 'quick', cuisines: ['american'], steps: ['Top the cottage cheese with berries and chopped almonds.'],
  }),
  m('overnight_oats', 'Overnight oats', 'breakfast', [['oats', 50], ['greekYogurt', 150], ['milk', 100], ['chia', 10], ['berries', 80]], {
    kitchen: 'none', time: 'quick', cuisines: ['american'], prepAhead: true, steps: ['The night before, stir oats, yogurt, milk and chia in a jar.', 'Refrigerate overnight; top with berries in the morning.'],
  }),
  m('eggs_toast_pb', 'Boiled eggs and peanut butter toast', 'breakfast', [['eggs', 100], ['bread', 60], ['peanutButter', 16]], {
    kitchen: 'stove', time: 'quick', cuisines: ['american'], prepAhead: true, steps: ['Boil a batch of eggs for the week (10 minutes, then cold water).', 'Toast the bread and spread with peanut butter.'],
  }),
  m('chia_pudding', 'Protein chia pudding', 'breakfast', [['soyMilk', 250], ['chia', 30], ['peaProtein', 30], ['berries', 100], ['maple', 10]], {
    kitchen: 'none', time: 'quick', cuisines: ['american'], prepAhead: true, steps: ['Whisk soy milk, protein powder, chia and maple syrup in a jar.', 'Refrigerate at least 4 hours; top with berries.'],
  }),

  // ── Lunches & dinners ──
  m('chicken_rice_broccoli', 'Chicken, rice and broccoli', 'main', [['chicken', 150], ['rice', 180], ['broccoli', 150], ['oliveOil', 10]], {
    kitchen: 'stove', time: 'batch', cuisines: ['american', 'asian'], steps: ['Season and bake or pan-cook the chicken (internal temp 74°C / 165°F).', 'Cook rice and steam the broccoli.', 'Portion into containers with a drizzle of olive oil.'],
  }),
  m('chicken_burrito_bowl', 'Chicken burrito bowl', 'main', [['chicken', 150], ['rice', 150], ['blackBeans', 80], ['salsa', 50], ['avocado', 50], ['greens', 30]], {
    kitchen: 'stove', time: 'batch', cuisines: ['mexican'], steps: ['Cook seasoned chicken (chili powder, cumin, salt) and slice.', 'Build the bowl: rice, beans, chicken, greens, salsa and avocado.'],
  }),
  m('turkey_chili', 'Turkey and bean chili', 'main', [['groundTurkey', 150], ['blackBeans', 120], ['cannedTomato', 150], ['onion', 50], ['oliveOil', 5]], {
    kitchen: 'stove', time: 'batch', cuisines: ['american', 'mexican'], steps: ['Brown the turkey with diced onion.', 'Add beans, tomatoes, chili powder and cumin; simmer 20 minutes.', 'Makes great leftovers — portion and refrigerate up to 4 days.'],
  }),
  m('beef_stir_fry', 'Beef and vegetable stir-fry', 'main', [['leanBeef', 130], ['mixedVeg', 200], ['rice', 180], ['soySauce', 15], ['oliveOil', 10]], {
    kitchen: 'stove', time: 'some', cuisines: ['asian'], steps: ['Brown the beef in a hot pan.', 'Add the vegetables and soy sauce; stir-fry 5-7 minutes.', 'Serve over rice.'],
  }),
  m('salmon_potato', 'Salmon with potatoes and salad', 'main', [['salmon', 150], ['potato', 250], ['greens', 60], ['oliveOil', 10]], {
    kitchen: 'stove', time: 'some', cuisines: ['mediterranean', 'american'], steps: ['Bake the salmon at 200°C / 400°F for 12-15 minutes.', 'Microwave or bake the potato.', 'Serve with greens dressed in olive oil and lemon.'],
  }),
  m('tuna_wrap', 'Tuna salad wrap', 'main', [['tuna', 120], ['tortilla', 70], ['greekYogurt', 30], ['greens', 30], ['tomato', 50]], {
    kitchen: 'none', time: 'quick', cuisines: ['american'], steps: ['Mix tuna with Greek yogurt, salt and pepper.', 'Wrap with greens and sliced tomato.'],
  }),
  m('shrimp_pasta', 'Shrimp marinara pasta', 'main', [['shrimp', 150], ['wwPasta', 200], ['marinara', 120], ['spinach', 50], ['oliveOil', 5]], {
    kitchen: 'stove', time: 'some', cuisines: ['italian'], steps: ['Cook the pasta.', 'Sauté shrimp in oil 2-3 minutes per side, add marinara and spinach.', 'Toss with the pasta.'],
  }),
  m('lentil_curry', 'Lentil and spinach curry with rice', 'main', [['lentils', 250], ['cannedTomato', 100], ['spinach', 60], ['onion', 50], ['rice', 150], ['oliveOil', 10]], {
    kitchen: 'stove', time: 'batch', cuisines: ['indian'], steps: ['Soften onion in oil with curry powder.', 'Add lentils and tomatoes; simmer 15 minutes, stir in spinach.', 'Serve over rice. Keeps 4 days in the fridge.'],
  }),
  m('tofu_stir_fry', 'Tofu vegetable stir-fry', 'main', [['tofu', 200], ['mixedVeg', 200], ['rice', 180], ['soySauce', 15], ['oliveOil', 10]], {
    kitchen: 'stove', time: 'some', cuisines: ['asian'], steps: ['Press and cube the tofu; pan-fry until golden.', 'Add vegetables and soy sauce; stir-fry 5 minutes.', 'Serve over rice.'],
  }),
  m('chickpea_salad', 'Mediterranean chickpea quinoa salad', 'main', [['chickpeas', 180], ['quinoa', 150], ['tomato', 80], ['greens', 50], ['feta', 30], ['oliveOil', 10]], {
    kitchen: 'none', time: 'quick', cuisines: ['mediterranean'], steps: ['Combine chickpeas, cooked quinoa, tomatoes and greens.', 'Top with feta, olive oil, lemon and salt.'],
  }),
  m('turkey_sandwich', 'Turkey and cheese sandwich', 'main', [['turkeyDeli', 100], ['bread', 80], ['cheddar', 20], ['tomato', 40], ['greens', 20]], {
    kitchen: 'none', time: 'quick', cuisines: ['american'], steps: ['Layer turkey, cheese, tomato and greens on the bread.'],
  }),
  m('chicken_pasta', 'Chicken marinara pasta', 'main', [['chicken', 130], ['wwPasta', 180], ['marinara', 120], ['mozzarella', 20], ['spinach', 40]], {
    kitchen: 'stove', time: 'batch', cuisines: ['italian'], steps: ['Cook the pasta and the chicken.', 'Warm marinara with spinach, toss everything together, top with mozzarella.'],
  }),
  m('beef_tacos', 'Beef tacos', 'main', [['leanBeef', 120], ['cornTortilla', 90], ['salsa', 50], ['cheddar', 20], ['greens', 30]], {
    kitchen: 'stove', time: 'some', cuisines: ['mexican'], steps: ['Brown the beef with taco seasoning.', 'Warm the tortillas and fill with beef, greens, cheese and salsa.'],
  }),
  m('tempeh_bowl', 'Tempeh quinoa bowl', 'main', [['tempeh', 150], ['quinoa', 180], ['broccoli', 120], ['soySauce', 10], ['oliveOil', 5]], {
    kitchen: 'stove', time: 'some', cuisines: ['asian'], steps: ['Slice and pan-fry the tempeh with soy sauce.', 'Serve over quinoa with steamed broccoli.'],
  }),
  m('egg_fried_rice', 'Vegetable egg fried rice', 'main', [['eggs', 150], ['rice', 200], ['mixedVeg', 150], ['soySauce', 15], ['oliveOil', 10]], {
    kitchen: 'stove', time: 'quick', cuisines: ['asian'], steps: ['Stir-fry the vegetables in oil.', 'Push aside, scramble the eggs, then add cold rice and soy sauce and toss.'],
  }),
  m('cod_rice_veg', 'Baked white fish with rice and vegetables', 'main', [['cod', 180], ['rice', 180], ['mixedVeg', 150], ['oliveOil', 10]], {
    kitchen: 'stove', time: 'some', cuisines: ['mediterranean', 'american'], steps: ['Bake the fish with oil, lemon and paprika at 200°C / 400°F for 12 minutes.', 'Serve with rice and steamed vegetables.'],
  }),
  m('bean_quesadilla', 'Black bean quesadilla', 'main', [['blackBeans', 150], ['tortilla', 70], ['cheddar', 40], ['salsa', 50], ['greens', 30]], {
    kitchen: 'stove', time: 'quick', cuisines: ['mexican'], steps: ['Mash the beans onto half the tortilla, add cheese, fold.', 'Cook in a dry pan 2-3 minutes per side; serve with salsa and greens.'],
  }),
  m('chicken_shawarma', 'Chicken shawarma plate', 'main', [['chicken', 150], ['rice', 150], ['hummus', 50], ['tomato', 60], ['greens', 40], ['oliveOil', 5]], {
    kitchen: 'stove', time: 'batch', cuisines: ['middleEastern', 'mediterranean'], steps: ['Season chicken with cumin, paprika, garlic and lemon; cook and slice.', 'Plate with rice, hummus, tomato and greens.'],
  }),
  m('microwave_chicken_potato', 'Rotisserie chicken, potato and veg', 'main', [['chicken', 150], ['potato', 250], ['mixedVeg', 150]], {
    kitchen: 'microwave', time: 'quick', cuisines: ['american'], steps: ['Pull meat from a store rotisserie chicken (skin off).', 'Microwave the potato 6-8 minutes and the frozen vegetables 4 minutes.'],
  }),
  m('tuna_rice_bowl', 'Tuna edamame rice bowl', 'main', [['tuna', 120], ['rice', 180], ['edamame', 80], ['soySauce', 10], ['avocado', 40]], {
    kitchen: 'microwave', time: 'quick', cuisines: ['asian'], steps: ['Microwave a rice cup and the edamame.', 'Top with tuna, avocado and a splash of soy sauce.'],
  }),
  m('chickpea_curry', 'Chickpea spinach curry', 'main', [['chickpeas', 200], ['spinach', 60], ['cannedTomato', 120], ['rice', 150], ['oliveOil', 10]], {
    kitchen: 'stove', time: 'batch', cuisines: ['indian'], steps: ['Fry curry powder and garlic in oil for 1 minute.', 'Add chickpeas and tomatoes; simmer 15 minutes, stir in spinach.', 'Serve over rice.'],
  }),
  m('jerk_chicken', 'Jerk chicken with rice and beans', 'main', [['chicken', 150], ['rice', 150], ['blackBeans', 80], ['mixedVeg', 100], ['oliveOil', 5]], {
    kitchen: 'stove', time: 'batch', cuisines: ['caribbean'], steps: ['Rub chicken with jerk seasoning; bake at 200°C / 400°F for 20-25 minutes.', 'Serve with rice, beans and vegetables.'],
  }),
  m('seitan_wrap', 'Seitan hummus wrap', 'main', [['seitan', 120], ['tortilla', 70], ['hummus', 40], ['greens', 30], ['tomato', 50]], {
    kitchen: 'none', time: 'quick', cuisines: ['mediterranean', 'middleEastern'], steps: ['Spread hummus on the tortilla.', 'Add sliced seitan, greens and tomato, then roll.'],
  }),
  m('lentil_soup', 'Lentil vegetable soup with bread', 'main', [['lentils', 250], ['mixedVeg', 120], ['cannedTomato', 100], ['bread', 60], ['oliveOil', 5]], {
    kitchen: 'stove', time: 'batch', cuisines: ['mediterranean'], steps: ['Simmer lentils, vegetables and tomatoes in broth for 20 minutes.', 'Season and serve with bread. Freezes well.'],
  }),

  // ── Snacks ──
  m('yogurt_berries', 'Greek yogurt and berries', 'snack', [['greekYogurt', 200], ['berries', 80]], { kitchen: 'none', time: 'quick', cuisines: ['american'], steps: ['Top yogurt with berries.'] }),
  m('protein_shake', 'Protein shake', 'snack', [['whey', 30], ['milk', 250]], { kitchen: 'none', time: 'quick', cuisines: ['american'], shake: true, steps: ['Shake or blend the powder with the milk.'] }),
  m('apple_pb', 'Apple with peanut butter', 'snack', [['apple', 180], ['peanutButter', 16]], { kitchen: 'none', time: 'quick', cuisines: ['american'], steps: ['Slice the apple and dip in peanut butter.'] }),
  m('cottage_cheese_snack', 'Cottage cheese and berries', 'snack', [['cottageCheese', 150], ['berries', 60]], { kitchen: 'none', time: 'quick', cuisines: ['american'], steps: ['Top cottage cheese with berries.'] }),
  m('hummus_veg', 'Hummus and pepper strips', 'snack', [['hummus', 60], ['bellPepper', 120]], { kitchen: 'none', time: 'quick', cuisines: ['middleEastern'], steps: ['Slice the pepper and dip.'] }),
  m('edamame_snack', 'Steamed edamame', 'snack', [['edamame', 150]], { kitchen: 'microwave', time: 'quick', cuisines: ['asian'], steps: ['Microwave frozen edamame 3-4 minutes; salt lightly.'] }),
  m('tuna_rice_cakes', 'Tuna on rice cakes', 'snack', [['tuna', 80], ['riceCakes', 27], ['tomato', 40]], { kitchen: 'none', time: 'quick', cuisines: ['american'], steps: ['Top rice cakes with tuna and sliced tomato.'] }),
  m('almonds_banana', 'Banana and almonds', 'snack', [['banana', 118], ['almonds', 20]], { kitchen: 'none', time: 'quick', cuisines: ['american'], steps: ['Grab and go.'] }),
  m('turkey_rollups', 'Turkey roll-ups', 'snack', [['turkeyDeli', 80], ['cheddar', 20], ['greens', 20]], { kitchen: 'none', time: 'quick', cuisines: ['american'], steps: ['Roll turkey slices around cheese and greens.'] }),
  m('boiled_eggs_fruit', 'Boiled eggs and an apple', 'snack', [['eggs', 100], ['apple', 180]], { kitchen: 'stove', time: 'quick', cuisines: ['american'], prepAhead: true, steps: ['Boil eggs ahead for the week; grab two with an apple.'] }),
  m('pea_shake', 'Plant protein shake', 'snack', [['peaProtein', 30], ['soyMilk', 250], ['banana', 60]], { kitchen: 'none', time: 'quick', cuisines: ['american'], shake: true, steps: ['Blend protein powder, soy milk and banana.'] }),
]

export function mealCost(meal) {
  return Math.max(...meal.ingredients.map(([id]) => INGREDIENTS[id]?.cost ?? 1))
}

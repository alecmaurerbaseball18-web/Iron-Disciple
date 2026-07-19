(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.IronNutrition = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const clamp = (n, a = 0, b = Infinity) => Math.max(a, Math.min(b, Number(n) || 0));
  const round = (n, step = 1) => Math.round((Number(n) || 0) / step) * step;
  const MEAL_KEYS = ['calories', 'protein', 'carbs', 'fat', 'fiber'];

  const ACTIVITY_PROFILES = Object.freeze({
    rest: { calorieDelta: 0, carbMultiplier: 0.9, hydrationMultiplier: 1, sodium: 2300 },
    recovery: { calorieDelta: 0, carbMultiplier: 0.95, hydrationMultiplier: 1.05, sodium: 2300 },
    mobility: { calorieDelta: 50, carbMultiplier: 1, hydrationMultiplier: 1.05, sodium: 2400 },
    strength: { calorieDelta: 150, carbMultiplier: 1.15, hydrationMultiplier: 1.15, sodium: 2800 },
    golf: { calorieDelta: 175, carbMultiplier: 1.1, hydrationMultiplier: 1.2, sodium: 3000 },
    softball: { calorieDelta: 225, carbMultiplier: 1.2, hydrationMultiplier: 1.25, sodium: 3200 },
    'double-session': { calorieDelta: 375, carbMultiplier: 1.35, hydrationMultiplier: 1.4, sodium: 3500 },
    'tournament-week': { calorieDelta: 150, carbMultiplier: 1.15, hydrationMultiplier: 1.2, sodium: 3200 },
    tournament: { calorieDelta: 400, carbMultiplier: 1.4, hydrationMultiplier: 1.5, sodium: 3800 }
  });

  const ingredient = (name, quantity, unit, category = 'Other', cost = 0) => ({
    name,
    quantity,
    unit,
    category,
    cost
  });

  const DEFAULT_MEALS = [
    { id: 'beef-rice-broccoli', name: 'Beef, Rice & Broccoli', serving: '1 plate', calories: 610, protein: 48, carbs: 58, fat: 20, fiber: 7, cost: 4.25, prepMinutes: 18, equipment: ['stovetop', 'microwave'], tags: ['high-protein', 'performance', 'meal-prep'], ingredients: [ingredient('Ground beef', 8, 'oz', 'Meat', 2.35), ingredient('Cooked rice', 1.25, 'cup', 'Grains', 0.55), ingredient('Broccoli', 1.5, 'cup', 'Produce', 0.85), ingredient('Seasoning', 1, 'serving', 'Pantry', 0.15), ingredient('Cooking oil', 1, 'tsp', 'Pantry', 0.35)] },
    { id: 'greek-yogurt-bowl', name: 'Greek Yogurt Protein Bowl', serving: '1 bowl', calories: 430, protein: 46, carbs: 48, fat: 7, fiber: 6, cost: 3.1, prepMinutes: 5, equipment: ['none'], tags: ['high-protein', 'quick', 'breakfast'], ingredients: [ingredient('Greek yogurt', 1.5, 'cup', 'Dairy', 1.75), ingredient('Protein powder', 1, 'scoop', 'Supplements', 0.85), ingredient('Berries', 0.75, 'cup', 'Produce', 0.5)] },
    { id: 'chicken-rice-plate', name: 'Chicken Recovery Plate', serving: '1 plate', calories: 560, protein: 54, carbs: 62, fat: 10, fiber: 5, cost: 4, prepMinutes: 15, equipment: ['air-fryer', 'microwave'], tags: ['high-protein', 'low-fat', 'recovery'], ingredients: [ingredient('Chicken breast', 8, 'oz', 'Meat', 2.25), ingredient('Cooked rice', 1.5, 'cup', 'Grains', 0.65), ingredient('Mixed vegetables', 1, 'cup', 'Produce', 0.8), ingredient('Sauce', 1, 'tbsp', 'Pantry', 0.3)] },
    { id: 'protein-shake-banana', name: 'Protein Shake & Banana', serving: '1 shake', calories: 330, protein: 34, carbs: 43, fat: 4, fiber: 4, cost: 2.2, prepMinutes: 3, equipment: ['shaker'], tags: ['quick', 'pre-workout', 'high-protein'], ingredients: [ingredient('Protein powder', 1.25, 'scoop', 'Supplements', 1.05), ingredient('Banana', 1, 'each', 'Produce', 0.35), ingredient('Milk', 1, 'cup', 'Dairy', 0.65), ingredient('Honey', 1, 'tbsp', 'Pantry', 0.15)] },
    { id: 'turkey-wrap', name: 'Turkey Performance Wrap', serving: '1 wrap', calories: 490, protein: 42, carbs: 52, fat: 13, fiber: 8, cost: 3.8, prepMinutes: 8, equipment: ['none'], tags: ['travel', 'quick', 'high-protein'], ingredients: [ingredient('Turkey breast', 6, 'oz', 'Meat', 1.9), ingredient('Whole-grain wrap', 1, 'each', 'Bakery', 0.65), ingredient('Cheese', 1, 'oz', 'Dairy', 0.55), ingredient('Spinach', 1, 'cup', 'Produce', 0.35), ingredient('Condiment', 1, 'tbsp', 'Pantry', 0.35)] },
    { id: 'oats-protein', name: 'Protein Oatmeal', serving: '1 bowl', calories: 470, protein: 38, carbs: 65, fat: 8, fiber: 9, cost: 2.35, prepMinutes: 6, equipment: ['microwave'], tags: ['breakfast', 'carbs', 'fiber'], ingredients: [ingredient('Oats', 0.75, 'cup', 'Grains', 0.35), ingredient('Protein powder', 1, 'scoop', 'Supplements', 0.85), ingredient('Milk', 1, 'cup', 'Dairy', 0.65), ingredient('Banana', 1, 'each', 'Produce', 0.35), ingredient('Cinnamon', 1, 'tsp', 'Pantry', 0.15)] }
  ];

  function normalizeProfile(profile = {}) {
    return {
      sex: profile.sex === 'female' ? 'female' : 'male',
      age: clamp(profile.age || 35, 18, 90),
      heightIn: clamp(profile.heightIn || 72, 48, 84),
      weightLb: clamp(profile.weightLb || 220, 80, 500),
      bodyFat: clamp(profile.bodyFat || 30, 3, 70),
      targetWeightLb: clamp(profile.targetWeightLb || 200, 80, 500),
      mode: ['cut', 'maintain', 'recomp', 'gain'].includes(profile.mode) ? profile.mode : 'cut',
      activity: ['low', 'moderate', 'high', 'very-high'].includes(profile.activity) ? profile.activity : 'moderate',
      weeklyChangePct: clamp(profile.weeklyChangePct || 0.6, 0.1, 1.5)
    };
  }

  function normalizeContext(context = {}) {
    const activityType = ACTIVITY_PROFILES[context.activityType]
      ? context.activityType
      : context.eventDay
        ? 'tournament'
        : context.trainingDay === false
          ? 'rest'
          : 'strength';

    return {
      activityType,
      trainingDay: context.trainingDay !== false && activityType !== 'rest',
      eventDay: context.eventDay === true || activityType === 'tournament',
      readiness: clamp(context.readiness == null ? 70 : context.readiness, 0, 100),
      recoveryScore: clamp(context.recoveryScore == null ? context.readiness || 70 : context.recoveryScore, 0, 100),
      activityHours: clamp(context.activityHours || 0, 0, 16),
      temperatureF: clamp(context.temperatureF || context.temperature || 72, -20, 130),
      humidityPct: clamp(context.humidityPct || 50, 0, 100),
      startTime: context.startTime || null,
      sessions: clamp(context.sessions || (activityType === 'double-session' ? 2 : 1), 0, 4)
    };
  }

  function leanMassLb(profile) {
    const p = normalizeProfile(profile);
    return p.weightLb * (1 - p.bodyFat / 100);
  }

  function bmr(profile) {
    const p = normalizeProfile(profile);
    const kg = p.weightLb * 0.453592;
    const cm = p.heightIn * 2.54;
    return Math.round(10 * kg + 6.25 * cm - 5 * p.age + (p.sex === 'male' ? 5 : -161));
  }

  function baseTargets(profile = {}) {
    const p = normalizeProfile(profile);
    const factors = { low: 1.3, moderate: 1.5, high: 1.7, 'very-high': 1.85 };
    let calories = bmr(p) * factors[p.activity];
    const weekly = p.weightLb * (p.weeklyChangePct / 100) * 3500 / 7;

    if (p.mode === 'cut') calories -= weekly;
    else if (p.mode === 'gain') calories += Math.min(weekly, 450);
    else if (p.mode === 'recomp') calories -= 150;

    calories = round(Math.max(calories, 1400), 25);
    const protein = round(Math.max(leanMassLb(p), p.weightLb * 0.75), 5);
    const fat = round(Math.max(p.weightLb * 0.28, 50), 5);
    const carbs = round(Math.max((calories - protein * 4 - fat * 9) / 4, 75), 5);

    return { calories, protein, carbs, fat };
  }

  function performanceFuelProfile(activityType = 'strength') {
    const key = ACTIVITY_PROFILES[activityType] ? activityType : 'strength';
    return { activityType: key, ...ACTIVITY_PROFILES[key] };
  }

  function hydrationPlan(profile = {}, context = {}) {
    const p = normalizeProfile(profile);
    const c = normalizeContext(context);
    const activity = performanceFuelProfile(c.activityType);
    let waterOz = Math.max(96, p.weightLb * 0.55);
    waterOz += c.activityHours * 20;
    if (c.temperatureF >= 85) waterOz += 16;
    if (c.temperatureF >= 95) waterOz += 8;
    if (c.humidityPct >= 70) waterOz += 8;
    waterOz *= activity.hydrationMultiplier;

    const sweatLossOz = round(c.activityHours * (c.temperatureF >= 85 ? 28 : 20), 4);
    const electrolytesNeeded = c.activityHours >= 1 || c.temperatureF >= 85 || c.eventDay;

    return {
      waterOz: round(waterOz, 8),
      sweatLossOz,
      sodiumMg: electrolytesNeeded ? activity.sodium : 2300,
      potassiumMg: 3500,
      electrolytesNeeded,
      guidance: electrolytesNeeded
        ? 'Use fluids with electrolytes during prolonged activity or heavy sweating.'
        : 'Water and normal meals should cover routine hydration needs.'
    };
  }

  function recoveryNutrition(profile = {}, context = {}) {
    const p = normalizeProfile(profile);
    const c = normalizeContext(context);
    const highLoad = c.activityHours >= 1.5 || c.sessions >= 2 || ['softball', 'tournament', 'double-session'].includes(c.activityType);
    const lowRecovery = c.readiness < 60 || c.recoveryScore < 60;
    const protein = round(clamp(p.weightLb * (lowRecovery ? 0.22 : 0.18), 30, 55), 5);
    const carbs = round(clamp(p.weightLb * (highLoad ? 0.45 : 0.3), 35, 110), 5);

    return {
      required: c.trainingDay || c.eventDay,
      protein,
      carbs,
      mealWindowMinutes: highLoad || lowRecovery ? 45 : 90,
      priority: highLoad && lowRecovery ? 'high' : c.trainingDay ? 'normal' : 'low',
      guidance: c.trainingDay
        ? `Aim for approximately ${protein} g protein and ${carbs} g carbohydrate after activity.`
        : 'Maintain normal protein distribution across the day.'
    };
  }

  function nutrientTiming(profile = {}, context = {}) {
    const p = normalizeProfile(profile);
    const c = normalizeContext(context);
    const eventLike = ['golf', 'softball', 'tournament', 'double-session'].includes(c.activityType);
    const preCarbs = round(clamp(p.weightLb * (eventLike ? 0.35 : 0.25), 25, 85), 5);
    const preProtein = round(clamp(p.weightLb * 0.12, 20, 35), 5);
    const intraCarbs = c.activityHours >= 1.5 ? round(clamp(c.activityHours * 20, 20, 75), 5) : 0;

    return {
      pre: {
        window: '60–120 minutes before activity',
        protein: preProtein,
        carbs: preCarbs,
        fatLimit: 15,
        guidance: 'Choose familiar, lower-fiber foods when activity intensity is high.'
      },
      intra: {
        required: c.activityHours >= 1.5 || c.eventDay,
        carbsPerHour: intraCarbs ? round(intraCarbs / Math.max(c.activityHours, 1), 5) : 0,
        fluidOzPerHour: c.temperatureF >= 85 ? 24 : 18
      },
      post: recoveryNutrition(p, c),
      evening: {
        protein: c.trainingDay ? 30 : 25,
        guidance: 'Finish the day with a complete protein serving if the daily protein target remains open.'
      }
    };
  }

  function energyAvailabilityRisk(profile = {}, plan = {}, context = {}) {
    const p = normalizeProfile(profile);
    const c = normalizeContext(context);
    const minimumCalories = round(Math.max(leanMassLb(p) * 11, bmr(p) * 0.9), 25);
    const loadAdjustedMinimum = minimumCalories + (c.activityHours >= 1.5 ? 250 : c.trainingDay ? 100 : 0);
    const calories = Number(plan.calories) || 0;
    const ratio = calories / Math.max(loadAdjustedMinimum, 1);
    const level = ratio < 0.85 ? 'high' : ratio < 1 ? 'moderate' : 'low';

    return {
      level,
      minimumCalories: loadAdjustedMinimum,
      calorieMargin: round(calories - loadAdjustedMinimum, 25),
      muscleLossRisk: level === 'high',
      recoveryRisk: level !== 'low' && c.trainingDay,
      performanceRisk: level !== 'low' && (c.eventDay || c.activityHours >= 1.5),
      guidance: level === 'low'
        ? 'Current intake is above the workload-adjusted minimum.'
        : 'Increase intake or reduce the planned deficit on demanding days.'
    };
  }

  function buildDailyNutritionPlan(profile = {}, context = {}) {
    const p = normalizeProfile(profile);
    const c = normalizeContext(context);
    const base = baseTargets(p);
    const activity = performanceFuelProfile(c.activityType);
    const hydration = hydrationPlan(p, c);

    let calories = base.calories + activity.calorieDelta;
    if (c.readiness < 45 && !c.eventDay) calories -= 75;
    calories = round(Math.max(calories, 1400), 25);

    const protein = base.protein;
    const fat = round(Math.max(base.fat, calories * 0.2 / 9), 5);
    const availableCarbCalories = Math.max(300, calories - protein * 4 - fat * 9);
    const carbs = round(Math.max((availableCarbCalories / 4) * activity.carbMultiplier, 75), 5);
    const adjustedCalories = round(Math.max(calories, protein * 4 + carbs * 4 + fat * 9), 25);

    const plan = {
      calories: adjustedCalories,
      protein,
      carbs,
      fat,
      fiber: Math.max(25, round(adjustedCalories / 1000 * 14)),
      water: hydration.waterOz,
      sodium: hydration.sodiumMg,
      potassium: hydration.potassiumMg,
      activityType: c.activityType,
      readiness: c.readiness,
      hydration,
      timing: nutrientTiming(p, c),
      recovery: recoveryNutrition(p, c),
      fuelProfile: activity
    };

    plan.energyAvailability = energyAvailabilityRisk(p, plan, c);
    return plan;
  }

  function targets(profile = {}, context = {}) {
    return buildDailyNutritionPlan(profile, context);
  }

  function compliance(log = {}, target = {}) {
    const keys = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'water'];
    const scored = keys.filter((key) => Number(target[key]) > 0);
    if (!scored.length) return 0;

    const score = scored.reduce((sum, key) => {
      const value = Number(log[key]) || 0;
      const goal = Number(target[key]) || 0;
      const ratio = value / goal;
      const component = key === 'calories'
        ? Math.max(0, 100 - Math.abs(1 - ratio) * 140)
        : Math.min(100, ratio * 100);
      return sum + component;
    }, 0) / scored.length;

    return Math.round(score || 0);
  }

  function gaps(log = {}, target = {}) {
    return ['protein', 'carbs', 'fat', 'fiber', 'water', 'calories']
      .map((key) => ({
        key,
        remaining: Math.max(0, round((Number(target[key]) || 0) - (Number(log[key]) || 0), key === 'calories' ? 25 : 1))
      }))
      .filter((item) => item.remaining > 0);
  }

  function recommendation(log = {}, target = {}, context = {}) {
    const gap = Object.fromEntries(gaps(log, target).map((item) => [item.key, item.remaining]));
    if (gap.protein >= 40) return { title: 'Close the protein gap', detail: `Prioritize a meal with about ${round(gap.protein, 5)} g protein. Pair it with a familiar carbohydrate source if training remains.`, type: 'protein' };
    if (gap.water >= 24) return { title: 'Hydration is the next lever', detail: `Drink ${round(Math.min(gap.water, 32), 8)} oz over the next two hours${context.eventDay ? ' with electrolytes' : ''}.`, type: 'water' };
    if (gap.carbs >= 60 && context.trainingDay !== false) return { title: 'Fuel performance', detail: `Add approximately ${round(Math.min(gap.carbs, 80), 5)} g carbohydrate around training.`, type: 'carbs' };
    if ((Number(log.calories) || 0) > (Number(target.calories) || 0) * 1.1) return { title: 'Protect the calorie target', detail: 'Choose lean protein, vegetables, and calorie-free fluids for the rest of the day.', type: 'calories' };
    return { title: 'Nutrition is on course', detail: 'Complete the planned meals, preserve hydration, and avoid unnecessary changes.', type: 'aligned' };
  }

  function missionNutritionStatus(log = {}, plan = {}, library = [], context = {}) {
    const remaining = remainingTargets(log, plan);
    const meal = mealSuggestion(log, plan, library, context);
    const hydrationPercent = plan.water ? Math.round(clamp((Number(log.water) || 0) / plan.water, 0, 1.5) * 100) : 0;
    const risk = plan.energyAvailability || { level: 'low' };

    return {
      title: 'Nutrition Status',
      proteinRemaining: round(remaining.protein, 5),
      carbsRemaining: round(remaining.carbs, 5),
      waterRemaining: round(remaining.water, 8),
      hydrationPercent,
      hydrationStatus: hydrationPercent >= 90 ? 'On target' : hydrationPercent >= 65 ? 'In progress' : 'Needs attention',
      bestNextMeal: meal,
      recoveryWindow: plan.recovery && plan.recovery.required ? `Within ${plan.recovery.mealWindowMinutes} minutes` : 'Normal meal timing',
      performanceFuel: risk.level === 'high' ? 'At risk' : risk.level === 'moderate' ? 'Watch closely' : 'Optimal',
      alert: risk.level === 'low' ? null : risk.guidance
    };
  }

  function parseIngredients(value) {
    if (Array.isArray(value)) return value.map(normalizeIngredient).filter((item) => item.name);
    return String(value || '').split(/\n|;/).map((line) => {
      const parts = line.split('|').map((item) => item.trim());
      return normalizeIngredient({ name: parts[0], quantity: parts[1] || 1, unit: parts[2] || 'serving', category: parts[3] || 'Other', cost: parts[4] || 0 });
    }).filter((item) => item.name);
  }

  function normalizeIngredient(item = {}) {
    return {
      name: String(item.name || '').trim(),
      quantity: clamp(item.quantity || 1, 0, 100000),
      unit: String(item.unit || 'serving').trim().toLowerCase(),
      category: String(item.category || 'Other').trim() || 'Other',
      cost: clamp(item.cost, 0, 10000)
    };
  }

  function normalizeMeal(meal = {}) {
    const name = String(meal.name || 'Untitled meal').trim();
    return {
      id: String(meal.id || `meal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
      name,
      serving: String(meal.serving || '1 serving').trim(),
      calories: clamp(meal.calories, 0, 5000),
      protein: clamp(meal.protein, 0, 500),
      carbs: clamp(meal.carbs, 0, 800),
      fat: clamp(meal.fat, 0, 300),
      fiber: clamp(meal.fiber, 0, 150),
      cost: clamp(meal.cost, 0, 1000),
      prepMinutes: clamp(meal.prepMinutes, 0, 1440),
      equipment: Array.isArray(meal.equipment) ? meal.equipment.map(String) : String(meal.equipment || '').split(',').map((item) => item.trim()).filter(Boolean),
      tags: Array.isArray(meal.tags) ? meal.tags.map(String) : String(meal.tags || '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean),
      ingredients: parseIngredients(meal.ingredients),
      favorite: Boolean(meal.favorite),
      notes: String(meal.notes || '')
    };
  }

  function seedMeals(library = []) {
    const merged = [...DEFAULT_MEALS, ...(Array.isArray(library) ? library : [])].map(normalizeMeal);
    return [...new Map(merged.map((meal) => [meal.id, meal])).values()];
  }

  function mealTotals(entries = []) {
    return (Array.isArray(entries) ? entries : []).reduce((total, entry) => {
      const quantity = clamp(entry.quantity || 1, 0.1, 20);
      const meal = normalizeMeal(entry.meal || entry);
      MEAL_KEYS.forEach((key) => { total[key] += meal[key] * quantity; });
      total.cost += meal.cost * quantity;
      return total;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, cost: 0 });
  }

  function remainingTargets(log = {}, target = {}) {
    return Object.fromEntries([...MEAL_KEYS, 'water'].map((key) => [key, Math.max(0, (Number(target[key]) || 0) - (Number(log[key]) || 0))]));
  }

  function scoreMeal(meal, remaining = {}, context = {}) {
    const normalized = normalizeMeal(meal);
    let score = 0;
    const calorieNeed = Math.max(1, remaining.calories || 1);
    score += Math.min(normalized.protein, remaining.protein || 0) * 2.4;
    score += Math.min(normalized.carbs, remaining.carbs || 0) * (context.trainingDay !== false ? 1.05 : 0.55);
    score += Math.min(normalized.fiber, remaining.fiber || 0) * 2;
    score -= Math.max(0, normalized.calories - calorieNeed) * 0.12;
    score -= normalized.cost * 1.5;
    score -= Math.max(0, normalized.prepMinutes - (context.maxPrepMinutes || 30)) * 0.8;
    if (normalized.favorite) score += 12;
    if (context.maxPrepMinutes != null && normalized.prepMinutes <= context.maxPrepMinutes) score += 8;
    return Math.round(score);
  }

  function rankMeals(library = [], log = {}, target = {}, context = {}) {
    const remaining = remainingTargets(log, target);
    return seedMeals(library)
      .map((meal) => ({ ...meal, matchScore: scoreMeal(meal, remaining, context) }))
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  function mealSuggestion(log = {}, target = {}, library = [], context = {}) {
    return rankMeals(library, log, target, { trainingDay: true, ...context })[0] || normalizeMeal(DEFAULT_MEALS[0]);
  }

  function normalizePrepPlan(plan = []) {
    return (Array.isArray(plan) ? plan : [])
      .map((item) => ({ mealId: String(item.mealId || ''), servings: clamp(item.servings || 1, 1, 50) }))
      .filter((item) => item.mealId);
  }

  function groceryList(plan = [], library = [], pantry = {}) {
    const meals = new Map(seedMeals(library).map((meal) => [meal.id, meal]));
    const items = new Map();
    normalizePrepPlan(plan).forEach((planned) => {
      const meal = meals.get(planned.mealId);
      if (!meal) return;
      meal.ingredients.forEach((raw) => {
        const ing = normalizeIngredient(raw);
        const key = `${ing.name.toLowerCase()}|${ing.unit}`;
        if (!items.has(key)) items.set(key, { ...ing, quantity: 0, cost: 0, mealIds: [] });
        const item = items.get(key);
        item.quantity += ing.quantity * planned.servings;
        item.cost += ing.cost * planned.servings;
        if (!item.mealIds.includes(meal.id)) item.mealIds.push(meal.id);
      });
    });

    return [...items.values()]
      .map((item) => {
        const have = clamp(pantry[item.name.toLowerCase()] || 0, 0, 100000);
        const needed = Math.max(0, item.quantity - have);
        return {
          ...item,
          quantity: round(item.quantity, 0.01),
          pantryQuantity: have,
          needed: round(needed, 0.01),
          estimatedCost: item.quantity ? round(item.cost * (needed / item.quantity), 0.01) : 0
        };
      })
      .filter((item) => item.needed > 0)
      .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  }

  function prepSummary(plan = [], library = [], pantry = {}) {
    const normalized = normalizePrepPlan(plan);
    const meals = new Map(seedMeals(library).map((meal) => [meal.id, meal]));
    const servings = normalized.reduce((sum, item) => sum + item.servings, 0);
    const minutes = normalized.reduce((sum, item) => sum + (meals.get(item.mealId)?.prepMinutes || 0), 0);
    const cost = normalized.reduce((sum, item) => sum + (meals.get(item.mealId)?.cost || 0) * item.servings, 0);
    const groceries = groceryList(normalized, library, pantry);
    return {
      meals: normalized.length,
      servings,
      prepMinutes: minutes,
      estimatedCost: round(cost, 0.01),
      shoppingCost: round(groceries.reduce((sum, item) => sum + item.estimatedCost, 0), 0.01),
      groceries
    };
  }

  return {
    ACTIVITY_PROFILES,
    DEFAULT_MEALS,
    normalizeProfile,
    normalizeContext,
    leanMassLb,
    bmr,
    baseTargets,
    performanceFuelProfile,
    hydrationPlan,
    recoveryNutrition,
    nutrientTiming,
    energyAvailabilityRisk,
    buildDailyNutritionPlan,
    targets,
    compliance,
    gaps,
    recommendation,
    missionNutritionStatus,
    normalizeIngredient,
    parseIngredients,
    normalizeMeal,
    seedMeals,
    mealTotals,
    remainingTargets,
    scoreMeal,
    rankMeals,
    mealSuggestion,
    normalizePrepPlan,
    groceryList,
    prepSummary
  };
});

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


  function toDateKey(value) {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
  }

  function normalizeWeighIns(entries = []) {
    return (Array.isArray(entries) ? entries : [])
      .map((entry) => ({
        date: toDateKey(entry.date || entry.timestamp),
        weightLb: clamp(entry.weightLb ?? entry.weight, 50, 800),
        note: String(entry.note || '')
      }))
      .filter((entry) => entry.date && entry.weightLb)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  function average(values = []) {
    const valid = values.map(Number).filter(Number.isFinite);
    return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : 0;
  }

  function weeklyWeightAverages(entries = []) {
    const weighIns = normalizeWeighIns(entries);
    const weeks = new Map();
    weighIns.forEach((entry) => {
      const date = new Date(`${entry.date}T12:00:00`);
      const day = (date.getUTCDay() + 6) % 7;
      date.setUTCDate(date.getUTCDate() - day);
      const weekStart = date.toISOString().slice(0, 10);
      if (!weeks.has(weekStart)) weeks.set(weekStart, []);
      weeks.get(weekStart).push(entry.weightLb);
    });
    return [...weeks.entries()].map(([weekStart, values]) => ({
      weekStart,
      averageWeightLb: round(average(values), 0.1),
      samples: values.length
    }));
  }

  function weightTrend(entries = [], profile = {}) {
    const p = normalizeProfile(profile);
    const weeks = weeklyWeightAverages(entries);
    if (weeks.length < 2) {
      return {
        status: 'insufficient-data',
        weeks,
        weeklyChangeLb: 0,
        weeklyChangePct: 0,
        targetWeeklyChangePct: p.mode === 'cut' ? -p.weeklyChangePct : p.mode === 'gain' ? p.weeklyChangePct : 0,
        message: 'Record weigh-ins on at least two different weeks to calculate a reliable trend.'
      };
    }
    const recent = weeks.slice(-4);
    const first = recent[0].averageWeightLb;
    const last = recent[recent.length - 1].averageWeightLb;
    const intervals = Math.max(1, recent.length - 1);
    const weeklyChangeLb = (last - first) / intervals;
    const weeklyChangePct = first ? weeklyChangeLb / first * 100 : 0;
    const target = p.mode === 'cut' ? -p.weeklyChangePct : p.mode === 'gain' ? p.weeklyChangePct : 0;
    let status = 'on-target';
    if (p.mode === 'cut') {
      if (weeklyChangePct > -0.1) status = 'stalled';
      else if (weeklyChangePct < -(p.weeklyChangePct + 0.45)) status = 'too-fast';
      else if (weeklyChangePct > -(Math.max(0.1, p.weeklyChangePct - 0.35))) status = 'too-slow';
    } else if (p.mode === 'gain') {
      if (weeklyChangePct < 0.05) status = 'stalled';
      else if (weeklyChangePct > p.weeklyChangePct + 0.35) status = 'too-fast';
      else if (weeklyChangePct < Math.max(0.05, p.weeklyChangePct - 0.25)) status = 'too-slow';
    } else if (Math.abs(weeklyChangePct) > 0.35) status = weeklyChangePct < 0 ? 'losing' : 'gaining';
    return {
      status,
      weeks,
      weeklyChangeLb: round(weeklyChangeLb, 0.1),
      weeklyChangePct: round(weeklyChangePct, 0.01),
      targetWeeklyChangePct: round(target, 0.01),
      message: `The current trend is ${weeklyChangeLb < 0 ? 'down' : weeklyChangeLb > 0 ? 'up' : 'flat'} ${Math.abs(round(weeklyChangeLb, 0.1))} lb per week.`
    };
  }

  function normalizeDailyLogs(logs = []) {
    return (Array.isArray(logs) ? logs : []).map((entry) => ({
      date: toDateKey(entry.date || entry.timestamp),
      calories: clamp(entry.calories, 0, 10000),
      protein: clamp(entry.protein, 0, 1000),
      carbs: clamp(entry.carbs, 0, 1500),
      fat: clamp(entry.fat, 0, 500),
      fiber: clamp(entry.fiber, 0, 300),
      water: clamp(entry.water, 0, 1000),
      target: entry.target || entry.targets || {}
    })).filter((entry) => entry.date);
  }

  function adherenceAnalytics(logs = [], fallbackTarget = {}) {
    const normalized = normalizeDailyLogs(logs);
    if (!normalized.length) return { score: 0, daysLogged: 0, calorieAdherence: 0, proteinAdherence: 0, hydrationAdherence: 0, consistency: 0 };
    const daily = normalized.map((entry) => {
      const target = { ...fallbackTarget, ...entry.target };
      return {
        calorie: target.calories ? Math.max(0, 100 - Math.abs(entry.calories - target.calories) / target.calories * 100) : 0,
        protein: target.protein ? Math.min(100, entry.protein / target.protein * 100) : 0,
        water: target.water ? Math.min(100, entry.water / target.water * 100) : 0,
        complete: Number(Boolean(entry.calories || entry.protein || entry.water)) * 100
      };
    });
    const calorieAdherence = average(daily.map((entry) => entry.calorie));
    const proteinAdherence = average(daily.map((entry) => entry.protein));
    const hydrationAdherence = average(daily.map((entry) => entry.water));
    const consistency = average(daily.map((entry) => entry.complete));
    return {
      score: Math.round(calorieAdherence * 0.45 + proteinAdherence * 0.30 + hydrationAdherence * 0.15 + consistency * 0.10),
      daysLogged: normalized.length,
      calorieAdherence: Math.round(calorieAdherence),
      proteinAdherence: Math.round(proteinAdherence),
      hydrationAdherence: Math.round(hydrationAdherence),
      consistency: Math.round(consistency)
    };
  }

  function plateauDetection(entries = [], profile = {}, adherence = {}) {
    const trend = weightTrend(entries, profile);
    const p = normalizeProfile(profile);
    const enoughData = trend.weeks.length >= 3;
    const adherent = Number(adherence.score || 0) >= 80;
    const stalled = p.mode === 'cut'
      ? trend.weeklyChangePct > -0.15
      : p.mode === 'gain'
        ? trend.weeklyChangePct < 0.08
        : Math.abs(trend.weeklyChangePct) < 0.08;
    return {
      isPlateau: Boolean(enoughData && adherent && stalled),
      enoughData,
      adherent,
      trendStatus: trend.status,
      reason: !enoughData
        ? 'More weekly trend data is required.'
        : !adherent
          ? 'Improve adherence before changing calorie targets.'
          : stalled
            ? 'The weight trend has stalled despite strong adherence.'
            : 'Progress remains measurable; no plateau adjustment is needed.'
    };
  }

  function adaptiveCalorieAdjustment(profile = {}, currentPlan = {}, trend = {}, adherence = {}, options = {}) {
    const p = normalizeProfile(profile);
    const currentCalories = clamp(currentPlan.calories || targets(p).calories, 1200, 8000);
    const minimumAdherence = clamp(options.minimumAdherence || 75, 50, 100);
    const step = round(clamp(options.stepCalories || 150, 50, 300), 25);
    let adjustment = 0;
    let decision = 'hold';
    let reason = 'Current targets remain appropriate.';
    if ((adherence.score || 0) < minimumAdherence) {
      reason = 'Targets are unchanged because adherence is not yet high enough to judge the plan accurately.';
    } else if (p.mode === 'cut') {
      if (trend.status === 'stalled' || trend.status === 'too-slow') {
        adjustment = -step;
        decision = 'decrease';
        reason = 'Weight loss is slower than the selected target despite sufficient adherence.';
      } else if (trend.status === 'too-fast') {
        adjustment = step;
        decision = 'increase';
        reason = 'Weight loss is faster than planned, so calories should increase to protect performance and lean mass.';
      }
    } else if (p.mode === 'gain') {
      if (trend.status === 'stalled' || trend.status === 'too-slow') {
        adjustment = step;
        decision = 'increase';
        reason = 'Weight gain is slower than planned despite sufficient adherence.';
      } else if (trend.status === 'too-fast') {
        adjustment = -step;
        decision = 'decrease';
        reason = 'Weight gain is faster than planned, so calories should decrease to limit unnecessary fat gain.';
      }
    }
    const floor = Math.max(1400, bmr(p) * 0.9);
    const proposedCalories = round(Math.max(floor, currentCalories + adjustment), 25);
    const actualAdjustment = proposedCalories - currentCalories;
    return {
      decision: actualAdjustment === 0 ? 'hold' : actualAdjustment > 0 ? 'increase' : 'decrease',
      currentCalories,
      adjustmentCalories: actualAdjustment,
      proposedCalories,
      reason,
      applyAfterDays: 7,
      safeguards: {
        adherenceRequired: minimumAdherence,
        minimumCalories: round(floor, 25),
        maximumSingleAdjustment: step
      }
    };
  }

  function normalizeMeasurements(entries = []) {
    return (Array.isArray(entries) ? entries : []).map((entry) => ({
      date: toDateKey(entry.date || entry.timestamp),
      waistIn: clamp(entry.waistIn || entry.waist, 0, 100),
      chestIn: clamp(entry.chestIn || entry.chest, 0, 100),
      hipsIn: clamp(entry.hipsIn || entry.hips, 0, 100),
      armIn: clamp(entry.armIn || entry.arm, 0, 40),
      thighIn: clamp(entry.thighIn || entry.thigh, 0, 60),
      bodyFat: clamp(entry.bodyFat, 0, 70),
      note: String(entry.note || '')
    })).filter((entry) => entry.date).sort((a, b) => a.date.localeCompare(b.date));
  }

  function measurementTrend(entries = []) {
    const normalized = normalizeMeasurements(entries);
    if (normalized.length < 2) return { status: 'insufficient-data', entries: normalized, changes: {} };
    const first = normalized[0];
    const last = normalized[normalized.length - 1];
    const keys = ['waistIn', 'chestIn', 'hipsIn', 'armIn', 'thighIn', 'bodyFat'];
    const changes = Object.fromEntries(keys.map((key) => [key, round((last[key] || 0) - (first[key] || 0), 0.1)]));
    return { status: 'ready', entries: normalized, firstDate: first.date, latestDate: last.date, changes };
  }

  function normalizeProgressPhotos(entries = []) {
    return (Array.isArray(entries) ? entries : []).map((entry) => ({
      id: String(entry.id || `photo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
      date: toDateKey(entry.date || entry.timestamp),
      view: ['front', 'side', 'back', 'other'].includes(entry.view) ? entry.view : 'other',
      url: String(entry.url || entry.dataUrl || ''),
      note: String(entry.note || '')
    })).filter((entry) => entry.date && entry.url);
  }

  function coachingExplanation(profile = {}, trend = {}, adherence = {}, adjustment = {}, plateau = {}) {
    const p = normalizeProfile(profile);
    const actions = [];
    if ((adherence.score || 0) < 75) actions.push('Log food and body weight consistently for the next seven days before changing calories.');
    if ((adherence.proteinAdherence || 0) < 85) actions.push('Raise protein consistency by planning the first two protein servings before the day begins.');
    if ((adherence.hydrationAdherence || 0) < 80) actions.push('Use scheduled water checkpoints rather than relying on thirst alone.');
    if (adjustment.adjustmentCalories) actions.push(`Change the daily calorie target by ${adjustment.adjustmentCalories > 0 ? '+' : ''}${adjustment.adjustmentCalories} calories and reassess after seven compliant days.`);
    if (!actions.length) actions.push('Keep the current targets unchanged and continue collecting trend data.');
    return {
      headline: plateau.isPlateau ? 'A true plateau is likely.' : adjustment.decision === 'hold' ? 'The plan should remain stable.' : `A calorie ${adjustment.decision} is supported.`,
      summary: `${p.mode === 'cut' ? 'Fat-loss' : p.mode === 'gain' ? 'Mass-gain' : 'Body-composition'} trend: ${trend.message || 'insufficient data'}`,
      rationale: adjustment.reason,
      actions
    };
  }

  function buildWeeklyNutritionReview(input = {}) {
    const profile = normalizeProfile(input.profile || {});
    const currentPlan = input.currentPlan || buildDailyNutritionPlan(profile, input.context || {});
    const trend = weightTrend(input.weighIns || [], profile);
    const adherence = adherenceAnalytics(input.logs || [], currentPlan);
    const plateau = plateauDetection(input.weighIns || [], profile, adherence);
    const adjustment = adaptiveCalorieAdjustment(profile, currentPlan, trend, adherence, input.options || {});
    const measurements = measurementTrend(input.measurements || []);
    const photos = normalizeProgressPhotos(input.photos || []);
    const coach = coachingExplanation(profile, trend, adherence, adjustment, plateau);
    return {
      generatedAt: new Date().toISOString(),
      profile,
      trend,
      adherence,
      plateau,
      adjustment,
      measurements,
      photos,
      coach
    };
  }


  function normalizeHabits(entries = []) {
    const keys = ['water', 'protein', 'calories', 'fiber', 'mealPrep', 'sleep'];
    return (Array.isArray(entries) ? entries : []).map((entry) => {
      const normalized = { date: toDateKey(entry.date || entry.timestamp) };
      keys.forEach((key) => { normalized[key] = Boolean(entry[key]); });
      return normalized;
    }).filter((entry) => entry.date).sort((a, b) => a.date.localeCompare(b.date));
  }

  function habitStreaks(entries = []) {
    const normalized = normalizeHabits(entries);
    const keys = ['water', 'protein', 'calories', 'fiber', 'mealPrep', 'sleep'];
    const streaks = {};
    keys.forEach((key) => {
      let current = 0;
      let best = 0;
      normalized.forEach((entry) => {
        if (entry[key]) {
          current += 1;
          best = Math.max(best, current);
        } else current = 0;
      });
      streaks[key] = { current, best };
    });
    const completion = normalized.length
      ? Math.round(normalized.reduce((sum, entry) => sum + keys.filter((key) => entry[key]).length / keys.length * 100, 0) / normalized.length)
      : 0;
    return { days: normalized.length, completion, streaks };
  }

  function smartAlerts(input = {}) {
    const plan = input.plan || {};
    const log = input.log || {};
    const context = normalizeContext(input.context || {});
    const prep = input.prep || {};
    const recentLogs = normalizeDailyLogs(input.recentLogs || []);
    const alerts = [];
    const proteinRemaining = Math.max(0, (Number(plan.protein) || 0) - (Number(log.protein) || 0));
    const waterRatio = (Number(plan.water) || 0) ? (Number(log.water) || 0) / Number(plan.water) : 1;
    if (proteinRemaining >= 60) alerts.push({ severity: 'high', type: 'protein', title: 'Protein deficit exceeds 60 g', detail: `${round(proteinRemaining, 5)} g protein remains today.` });
    if (waterRatio < 0.5) alerts.push({ severity: 'high', type: 'hydration', title: 'Hydration below 50%', detail: `${Math.round(waterRatio * 100)}% of the water target is complete.` });
    if (prep.tomorrowRequired && !prep.tomorrowComplete) alerts.push({ severity: 'medium', type: 'meal-prep', title: 'Tomorrow meal prep is incomplete', detail: 'Prepare or schedule tomorrow’s primary meals before the day ends.' });
    if (context.eventDay || context.activityType === 'tournament') alerts.push({ severity: 'medium', type: 'event', title: 'Tournament fueling is active', detail: 'Confirm fluids, electrolytes, and portable carbohydrate sources.' });
    const lowCalorieDays = recentLogs.slice(-3).filter((entry) => {
      const target = Number(entry.target.calories || plan.calories) || 0;
      return target > 0 && entry.calories < target * 0.8;
    }).length;
    if (lowCalorieDays >= 3) alerts.push({ severity: 'high', type: 'energy', title: 'Calories too low for three consecutive days', detail: 'Increase intake or reduce the planned deficit to protect recovery and performance.' });
    if (Number(input.recoveryScore) > 0 && Number(input.recoveryScore) < 55) alerts.push({ severity: 'medium', type: 'recovery', title: 'Recovery score is falling', detail: 'Prioritize sleep, hydration, and post-training nutrition.' });
    return alerts.sort((a, b) => ({ high: 3, medium: 2, low: 1 }[b.severity] - { high: 3, medium: 2, low: 1 }[a.severity]));
  }

  function pearsonCorrelation(xs = [], ys = []) {
    const length = Math.min(xs.length, ys.length);
    if (length < 3) return 0;
    const x = xs.slice(0, length).map(Number);
    const y = ys.slice(0, length).map(Number);
    const mx = average(x);
    const my = average(y);
    let numerator = 0;
    let dx = 0;
    let dy = 0;
    for (let i = 0; i < length; i += 1) {
      const a = x[i] - mx;
      const b = y[i] - my;
      numerator += a * b;
      dx += a * a;
      dy += b * b;
    }
    return dx && dy ? numerator / Math.sqrt(dx * dy) : 0;
  }

  function performanceCorrelations(entries = []) {
    const rows = (Array.isArray(entries) ? entries : []).map((entry) => ({
      protein: clamp(entry.proteinAdherence || entry.protein || 0, 0, 100),
      hydration: clamp(entry.hydrationAdherence || entry.hydration || 0, 0, 100),
      calories: clamp(entry.calorieAdherence || entry.calories || 0, 0, 100),
      sleep: clamp(entry.sleepScore || entry.sleep || 0, 0, 100),
      mealTiming: clamp(entry.mealTiming || 0, 0, 100),
      recovery: clamp(entry.recoveryScore || entry.recovery || 0, 0, 100),
      readiness: clamp(entry.readinessScore || entry.readiness || 0, 0, 100),
      performance: clamp(entry.performanceScore || entry.workoutVolume || 0, 0, 100000)
    }));
    const outcomes = ['recovery', 'readiness', 'performance'];
    const habits = ['protein', 'hydration', 'calories', 'sleep', 'mealTiming'];
    const correlations = {};
    habits.forEach((habit) => {
      correlations[habit] = {};
      outcomes.forEach((outcome) => {
        const value = pearsonCorrelation(rows.map((row) => row[habit]), rows.map((row) => row[outcome]));
        correlations[habit][outcome] = round(value, 0.01);
      });
    });
    const strongest = [];
    habits.forEach((habit) => outcomes.forEach((outcome) => strongest.push({ habit, outcome, correlation: correlations[habit][outcome] })));
    strongest.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
    return { sampleSize: rows.length, correlations, strongest: strongest.slice(0, 5), reliable: rows.length >= 8 };
  }

  function bodyCompositionForecast(input = {}) {
    const profile = normalizeProfile(input.profile || {});
    const review = input.review || buildWeeklyNutritionReview(input);
    const adherenceFactor = clamp((review.adherence?.score || 70) / 100, 0.35, 1.05);
    const weeklyChangePct = Number(review.trend?.weeklyChangePct);
    const selectedPct = profile.mode === 'cut' ? -profile.weeklyChangePct : profile.mode === 'gain' ? profile.weeklyChangePct : 0;
    const effectivePct = Number.isFinite(weeklyChangePct) && review.trend?.status !== 'insufficient-data' ? weeklyChangePct : selectedPct * adherenceFactor;
    const startWeight = Number(review.trend?.latestAverage || profile.weightLb);
    const startFatMass = startWeight * profile.bodyFat / 100;
    const startLeanMass = startWeight - startFatMass;
    const horizons = [30, 60, 90].map((days) => {
      const weeks = days / 7;
      const projectedWeight = Math.max(80, startWeight * Math.pow(1 + effectivePct / 100, weeks));
      const change = projectedWeight - startWeight;
      const leanShare = profile.mode === 'gain' ? 0.55 : profile.mode === 'cut' ? 0.15 : 0.35;
      const projectedLeanMass = Math.max(0, startLeanMass + change * leanShare);
      const projectedFatMass = Math.max(0, projectedWeight - projectedLeanMass);
      return {
        days,
        weightLb: round(projectedWeight, 0.1),
        leanMassLb: round(projectedLeanMass, 0.1),
        fatMassLb: round(projectedFatMass, 0.1),
        bodyFatPct: round(projectedFatMass / projectedWeight * 100, 0.1)
      };
    });
    return {
      generatedAt: new Date().toISOString(),
      confidence: review.trend?.weeks?.length >= 4 && review.adherence?.daysLogged >= 7 ? 'high' : review.trend?.weeks?.length >= 2 ? 'medium' : 'low',
      weeklyChangePct: round(effectivePct, 0.01),
      assumptions: 'Projection assumes recent adherence, activity, and weight trend remain similar.',
      horizons
    };
  }

  function adaptiveGoalEngine(input = {}) {
    const profile = normalizeProfile(input.profile || {});
    const review = input.review || buildWeeklyNutritionReview(input);
    const currentWeight = Number(review.trend?.latestAverage || profile.weightLb);
    const goalWeight = profile.targetWeightLb;
    const remaining = goalWeight - currentWeight;
    let weeklyRate = currentWeight * Math.abs(Number(review.trend?.weeklyChangePct || profile.weeklyChangePct)) / 100;
    weeklyRate = Math.max(weeklyRate, 0.1);
    const movingTowardGoal = remaining === 0 || (remaining < 0 && Number(review.trend?.weeklyChangePct || -profile.weeklyChangePct) < 0) || (remaining > 0 && Number(review.trend?.weeklyChangePct || profile.weeklyChangePct) > 0);
    const weeksRemaining = Math.abs(remaining) / weeklyRate;
    const goalDate = new Date(Date.now() + weeksRemaining * 7 * 86400000);
    const adherence = review.adherence?.score || 0;
    const dataScore = Math.min(100, (review.trend?.weeks?.length || 0) * 15 + (review.adherence?.daysLogged || 0) * 3);
    const confidenceScore = Math.round(adherence * 0.65 + dataScore * 0.35);
    return {
      currentWeight: round(currentWeight, 0.1),
      targetWeight: goalWeight,
      poundsRemaining: round(Math.abs(remaining), 0.1),
      currentPaceLbPerWeek: round(weeklyRate, 0.1),
      projectedGoalDate: goalDate.toISOString().slice(0, 10),
      chanceOfSuccess: clamp(Math.round(confidenceScore * (movingTowardGoal ? 1 : 0.55)), 0, 100),
      confidenceScore,
      status: remaining === 0 ? 'complete' : movingTowardGoal ? 'on-course' : 'off-course'
    };
  }

  function gradeFromScore(score = 0) {
    const value = clamp(score, 0, 100);
    return value >= 93 ? 'A' : value >= 85 ? 'B' : value >= 75 ? 'C' : value >= 65 ? 'D' : 'F';
  }

  function buildCoachReport(input = {}) {
    const review = input.review || buildWeeklyNutritionReview(input);
    const trainingScore = clamp(input.trainingScore == null ? 75 : input.trainingScore, 0, 100);
    const recoveryScore = clamp(input.recoveryScore == null ? 70 : input.recoveryScore, 0, 100);
    const hydrationScore = clamp(review.adherence?.hydrationAdherence || 0, 0, 100);
    const nutritionScore = clamp(review.adherence?.score || 0, 0, 100);
    const overallScore = Math.round(nutritionScore * 0.4 + trainingScore * 0.25 + recoveryScore * 0.2 + hydrationScore * 0.15);
    const dimensions = { nutrition: nutritionScore, training: trainingScore, recovery: recoveryScore, hydration: hydrationScore };
    const ordered = Object.entries(dimensions).sort((a, b) => b[1] - a[1]);
    return {
      generatedAt: new Date().toISOString(),
      grades: {
        nutrition: gradeFromScore(nutritionScore),
        training: gradeFromScore(trainingScore),
        recovery: gradeFromScore(recoveryScore),
        hydration: gradeFromScore(hydrationScore),
        overall: gradeFromScore(overallScore)
      },
      scores: { ...dimensions, overall: overallScore },
      topWin: `${ordered[0][0]} was the strongest category at ${Math.round(ordered[0][1])}%.`,
      biggestWeakness: `${ordered[ordered.length - 1][0]} needs the most attention at ${Math.round(ordered[ordered.length - 1][1])}%.`,
      coachNotes: review.coach,
      actionPlan: review.coach?.actions || []
    };
  }

  function buildMissionStatus(input = {}) {
    const plan = input.plan || buildDailyNutritionPlan(input.profile || {}, input.context || {});
    const status = missionNutritionStatus(input.log || {}, plan, input.library || [], input.context || {});
    const alerts = smartAlerts({ ...input, plan });
    return {
      ...status,
      nutritionScore: compliance(input.log || {}, plan),
      fuelReadiness: plan.energyAvailability?.level === 'low' ? 'ready' : 'attention',
      hydrationStatus: status.waterRemaining > 24 ? 'needs-attention' : 'on-course',
      recoveryStatus: plan.recovery?.priority || 'normal',
      tomorrowPrep: input.prep?.tomorrowComplete ? 'complete' : input.prep?.tomorrowRequired ? 'required' : 'not-required',
      alerts
    };
  }

  function buildDashboard(input = {}) {
    const plan = input.plan || buildDailyNutritionPlan(input.profile || {}, input.context || {});
    const review = input.review || buildWeeklyNutritionReview({ ...input, currentPlan: plan });
    const mission = buildMissionStatus({ ...input, plan });
    const forecast = bodyCompositionForecast({ ...input, review });
    const goal = adaptiveGoalEngine({ ...input, review });
    const habits = habitStreaks(input.habits || []);
    return {
      generatedAt: new Date().toISOString(),
      today: { plan, mission, recommendation: recommendation(input.log || {}, plan, input.context || {}) },
      weekly: review,
      forecast,
      goal,
      habits,
      mealPrep: input.prep || {},
      grocery: input.grocery || {},
      alerts: mission.alerts
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
    prepSummary,
    toDateKey,
    normalizeWeighIns,
    weeklyWeightAverages,
    weightTrend,
    normalizeDailyLogs,
    adherenceAnalytics,
    plateauDetection,
    adaptiveCalorieAdjustment,
    normalizeMeasurements,
    measurementTrend,
    normalizeProgressPhotos,
    coachingExplanation,
    buildWeeklyNutritionReview,
    normalizeHabits,
    habitStreaks,
    smartAlerts,
    pearsonCorrelation,
    performanceCorrelations,
    bodyCompositionForecast,
    adaptiveGoalEngine,
    gradeFromScore,
    buildCoachReport,
    buildMissionStatus,
    buildDashboard
  };
});

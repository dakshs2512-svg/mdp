/**
 * Focus Drift — Symbol Definitions for Continuous Performance Task
 * 
 * Predefined target: Blue Circle.
 * Distractors: Purple Circle, Amber Diamond, Cyan Square, Emerald Triangle.
 * Meets explicit task specification:
 * "respond to a blue circle but not a purple circle or other shapes"
 */

export const SYMBOLS = {
  BLUE_CIRCLE: {
    id: "blue_circle",
    label: "Blue Circle",
    isTarget: true,
    shape: "circle",
    primaryColor: "#38BDF8", // Cyan / Electric Blue
    borderColor: "#0284C7",
    fillColor: "#0284C7",
    textColor: "text-sky-400",
    description: "TARGET: Press Spacebar or Click",
  },
  PURPLE_CIRCLE: {
    id: "purple_circle",
    label: "Purple Circle",
    isTarget: false,
    shape: "circle",
    primaryColor: "#A855F7", // Purple / Violet
    borderColor: "#7E22CE",
    fillColor: "#7E22CE",
    textColor: "text-purple-400",
    description: "DISTRACTOR: Do NOT respond",
  },
  AMBER_DIAMOND: {
    id: "amber_diamond",
    label: "Amber Diamond",
    isTarget: false,
    shape: "diamond",
    primaryColor: "#F59E0B",
    borderColor: "#D97706",
    fillColor: "#D97706",
    textColor: "text-amber-400",
    description: "DISTRACTOR: Do NOT respond",
  },
  CYAN_SQUARE: {
    id: "cyan_square",
    label: "Cyan Square",
    isTarget: false,
    shape: "square",
    primaryColor: "#06B6D4",
    borderColor: "#0891B2",
    fillColor: "#0891B2",
    textColor: "text-cyan-400",
    description: "DISTRACTOR: Do NOT respond",
  },
  EMERALD_TRIANGLE: {
    id: "emerald_triangle",
    label: "Emerald Triangle",
    isTarget: false,
    shape: "triangle",
    primaryColor: "#10B981",
    borderColor: "#059669",
    fillColor: "#059669",
    textColor: "text-emerald-400",
    description: "DISTRACTOR: Do NOT respond",
  },
  ROSE_HEXAGON: {
    id: "rose_hexagon",
    label: "Rose Hexagon",
    isTarget: false,
    shape: "hexagon",
    primaryColor: "#F43F5E",
    borderColor: "#E11D48",
    fillColor: "#E11D48",
    textColor: "text-rose-400",
    description: "Symbol 6",
  },
};

export const DISTRACTOR_SYMBOLS = [
  SYMBOLS.PURPLE_CIRCLE,
  SYMBOLS.AMBER_DIAMOND,
  SYMBOLS.CYAN_SQUARE,
  SYMBOLS.EMERALD_TRIANGLE,
  SYMBOLS.ROSE_HEXAGON,
];

export const WORKING_MEMORY_GRID_SYMBOLS = [
  SYMBOLS.BLUE_CIRCLE,
  SYMBOLS.PURPLE_CIRCLE,
  SYMBOLS.AMBER_DIAMOND,
  SYMBOLS.CYAN_SQUARE,
  SYMBOLS.EMERALD_TRIANGLE,
  SYMBOLS.ROSE_HEXAGON,
];

/**
 * Generate a randomized stimulus with 75% target ratio and 25% distractor ratio
 */
export function generateRandomStimulus(targetProbability = 0.75) {
  const isTarget = Math.random() < targetProbability;
  if (isTarget) {
    return SYMBOLS.BLUE_CIRCLE;
  }
  // Pick random distractor
  const randomIndex = Math.floor(Math.random() * DISTRACTOR_SYMBOLS.length);
  return DISTRACTOR_SYMBOLS[randomIndex];
}

/**
 * Practice round sequence (5 predefined trials: 3 targets, 2 distractors)
 */
export const PRACTICE_SEQUENCE = [
  SYMBOLS.BLUE_CIRCLE,     // 1: Target
  SYMBOLS.PURPLE_CIRCLE,   // 2: Distractor (Purple Circle)
  SYMBOLS.BLUE_CIRCLE,     // 3: Target
  SYMBOLS.AMBER_DIAMOND,   // 4: Distractor (Diamond)
  SYMBOLS.BLUE_CIRCLE,     // 5: Target
];

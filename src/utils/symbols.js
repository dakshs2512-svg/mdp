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


// Main-test task targets. The target cue is randomized after each correctly
// completed trial. The current target is excluded so it always changes.
export const TASK_TARGETS = [
  SYMBOLS.BLUE_CIRCLE,
  SYMBOLS.PURPLE_CIRCLE,
  SYMBOLS.AMBER_DIAMOND,
  SYMBOLS.CYAN_SQUARE,
  SYMBOLS.EMERALD_TRIANGLE,
  SYMBOLS.ROSE_HEXAGON,
];

export function getNextTaskTarget(currentTargetId) {
  const candidates = TASK_TARGETS.filter((symbol) => symbol.id !== currentTargetId);
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex] ?? TASK_TARGETS[0];
}

export function generateStimulusForTarget(targetSymbol, targetProbability = 0.75, previousSymbolId = null) {
  const distractors = TASK_TARGETS.filter((symbol) => symbol.id !== targetSymbol.id);
  const wantsTarget = Math.random() < targetProbability;
  let chosen;

  if (wantsTarget && targetSymbol.id !== previousSymbolId) {
    chosen = targetSymbol;
  } else {
    const options = distractors.filter((symbol) => symbol.id !== previousSymbolId);
    const available = options.length ? options : distractors;
    chosen = available[Math.floor(Math.random() * available.length)];
  }

  // isTarget is task-dependent in the main test, not a permanent symbol trait.
  return { ...chosen, isTarget: chosen.id === targetSymbol.id };
}

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
export function generateRandomStimulus(targetProbability = 0.75, previousSymbolId = null) {
  const candidates = [SYMBOLS.BLUE_CIRCLE, ...DISTRACTOR_SYMBOLS].filter(
    (symbol) => symbol.id !== previousSymbolId
  );
  const target = candidates.find((symbol) => symbol.isTarget);
  const distractors = candidates.filter((symbol) => !symbol.isTarget);
  const wantsTarget = Math.random() < targetProbability;
  if (wantsTarget && target) return target;
  if (!wantsTarget && distractors.length > 0) {
    return distractors[Math.floor(Math.random() * distractors.length)];
  }
  if (target) return target;
  return distractors[Math.floor(Math.random() * distractors.length)];
}

/**
 * Practice template: three targets and two distractors. Shuffle each round
 * so the practice does not repeat the same exact sequence on every restart.
 */
const PRACTICE_TRIALS = [
  SYMBOLS.BLUE_CIRCLE,
  SYMBOLS.BLUE_CIRCLE,
  SYMBOLS.BLUE_CIRCLE,
  SYMBOLS.PURPLE_CIRCLE,
  SYMBOLS.AMBER_DIAMOND,
];

export function createPracticeSequence() {
  const sequence = [...PRACTICE_TRIALS];
  for (let i = sequence.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
  }
  // Avoid identical symbols on adjacent practice trials where possible.
  for (let i = 1; i < sequence.length; i += 1) {
    if (sequence[i].id === sequence[i - 1].id) {
      const swapIndex = sequence.findIndex((item, j) => j > i && item.id !== sequence[i - 1].id);
      if (swapIndex !== -1) [sequence[i], sequence[swapIndex]] = [sequence[swapIndex], sequence[i]];
    }
  }
  return sequence;
}

export const PRACTICE_SEQUENCE = createPracticeSequence();

export const MOODS = ["great", "good", "okay", "low", "rough"];
export const MOOD_VALUE = { rough: 1, low: 2, okay: 3, good: 4, great: 5 };

export const INSTRUMENTS = {
  phq9: {
    label: "PHQ-9",
    items: 9,
    max: 27,
    bands: [
      [0, 4, "Minimal"],
      [5, 9, "Mild"],
      [10, 14, "Moderate"],
      [15, 19, "Moderately severe"],
      [20, 27, "Severe"],
    ],
    selfHarmItem: 8,
  },
  gad7: {
    label: "GAD-7",
    items: 7,
    max: 21,
    bands: [
      [0, 4, "Minimal"],
      [5, 9, "Mild"],
      [10, 14, "Moderate"],
      [15, 21, "Severe"],
    ],
    selfHarmItem: -1,
  },
};

export function scoreScreening(type, answers) {
  const inst = INSTRUMENTS[type];
  const score = answers.reduce((sum, a) => sum + a, 0);
  const band = inst.bands.find(([lo, hi]) => score >= lo && score <= hi);
  return {
    label: inst.label,
    score,
    max: inst.max,
    severity: band ? band[2] : "Unknown",
    selfHarmFlag: inst.selfHarmItem >= 0 && answers[inst.selfHarmItem] > 0,
  };
}

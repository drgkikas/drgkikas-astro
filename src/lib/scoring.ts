// ============================================================
// SCORING LIBRARY — All 7 psychometric tests
// ============================================================

export type TestName = 'dass21' | 'phq9' | 'gad7' | 'mdq' | 'asrs' | 'audit' | 'pcl5';

export interface ScoreResult {
  score_json: Record<string, unknown>;
  level: string;
}

// ─────────────────────────────────────────────────────────────
// DASS-21
// ─────────────────────────────────────────────────────────────
// answers: number[21], values 0–3
export function scoreDass21(answers: number[]): ScoreResult {
  const dItems = [2, 4, 9, 12, 15, 16, 20]; // 0-indexed
  const aItems = [1, 3, 6, 8, 14, 18, 19];
  const sItems = [0, 5, 7, 10, 11, 13, 17];

  const d = dItems.reduce((s, i) => s + (answers[i] ?? 0), 0) * 2;
  const a = aItems.reduce((s, i) => s + (answers[i] ?? 0), 0) * 2;
  const s = sItems.reduce((s, i) => s + (answers[i] ?? 0), 0) * 2;

  const dLevel = d <= 9 ? 'normal' : d <= 13 ? 'mild' : d <= 20 ? 'moderate' : d <= 27 ? 'severe' : 'extreme';
  const aLevel = a <= 7 ? 'normal' : a <= 9 ? 'mild' : a <= 14 ? 'moderate' : a <= 19 ? 'severe' : 'extreme';
  const sLevel = s <= 14 ? 'normal' : s <= 18 ? 'mild' : s <= 25 ? 'moderate' : s <= 33 ? 'severe' : 'extreme';

  const levelOrder = ['normal', 'mild', 'moderate', 'severe', 'extreme'];
  const worst = [dLevel, aLevel, sLevel].reduce((a, b) =>
    levelOrder.indexOf(a) >= levelOrder.indexOf(b) ? a : b
  );

  return {
    score_json: {
      depression: d, depression_level: dLevel,
      anxiety: a, anxiety_level: aLevel,
      stress: s, stress_level: sLevel,
      worst_level: worst,
    },
    level: worst,
  };
}

// ─────────────────────────────────────────────────────────────
// PHQ-9
// ─────────────────────────────────────────────────────────────
// answers: number[9], values 0–3
export function scorePhq9(answers: number[]): ScoreResult {
  const total = answers.reduce((s, v) => s + v, 0);
  const q9Flag = (answers[8] ?? 0) >= 1;

  let level: string;
  if (q9Flag) {
    level = 'critical';
  } else if (total <= 4) {
    level = 'minimal';
  } else if (total <= 9) {
    level = 'mild';
  } else if (total <= 14) {
    level = 'moderate';
  } else if (total <= 19) {
    level = 'moderately_severe';
  } else {
    level = 'severe';
  }

  return {
    score_json: { total, level, q9_flag: q9Flag },
    level,
  };
}

// ─────────────────────────────────────────────────────────────
// GAD-7
// ─────────────────────────────────────────────────────────────
// answers: (number | string)[8] — first 7 are 0–3, last is functional string
export function scoreGad7(answers: (number | string)[]): ScoreResult {
  const scores = answers.slice(0, 7) as number[];
  const functional = answers[7] as string;
  const total = scores.reduce((s, v) => s + v, 0);

  const level = total <= 4 ? 'minimal' : total <= 9 ? 'mild' : total <= 14 ? 'moderate' : 'severe';

  return {
    score_json: { total, level, functional_impairment: functional },
    level,
  };
}

// ─────────────────────────────────────────────────────────────
// MDQ
// ─────────────────────────────────────────────────────────────
// answers: { partA: boolean[13], partB: boolean, partC: string }
export function scoreMdq(answers: { partA: boolean[]; partB: boolean; partC: string }): ScoreResult {
  const partAYes = answers.partA.filter(Boolean).length;
  const gate1 = partAYes >= 7;
  const gate2 = answers.partB === true;
  const gate3 = ['moderate', 'serious'].includes(answers.partC);
  const result = gate1 && gate2 && gate3 ? 'positive' : 'negative';

  return {
    score_json: {
      part_a_yes_count: partAYes,
      part_b_same_time: answers.partB,
      part_c_problem: answers.partC,
      gate1, gate2, gate3, result,
    },
    level: result,
  };
}

// ─────────────────────────────────────────────────────────────
// ASRS-v1.1
// ─────────────────────────────────────────────────────────────
// answers: number[18], values 0–4
// Q1-4 (idx 0-3): positive if >= 3
// Q5-6 (idx 4-5): positive if >= 2
export function scoreAsrs(answers: number[]): ScoreResult {
  const posA14 = answers.slice(0, 4).filter(v => v >= 3).length;
  const posA56 = answers.slice(4, 6).filter(v => v >= 2).length;
  const totalPositiveA = posA14 + posA56;
  const partAResult = totalPositiveA >= 4 ? 'positive' : 'negative';
  const partBTotal = answers.slice(6).reduce((s, v) => s + v, 0);

  let subtype = 'mixed';
  if (posA14 >= 3 && posA56 < 2) subtype = 'inattentive';
  if (posA56 >= 2 && posA14 < 3) subtype = 'hyperactive';

  return {
    score_json: {
      part_a_positive: totalPositiveA,
      part_a_result: partAResult,
      part_b_total: partBTotal,
      subtype,
      result: partAResult,
    },
    level: partAResult,
  };
}

// ─────────────────────────────────────────────────────────────
// AUDIT
// ─────────────────────────────────────────────────────────────
// answers: number[10]
// Q1-8: scale 0-4; Q9-10: values 0,2,4
export function scoreAudit(answers: number[]): ScoreResult {
  const total = answers.reduce((s, v) => s + v, 0);
  const consumption = answers.slice(0, 3).reduce((s, v) => s + v, 0);
  const dependence  = answers.slice(3, 6).reduce((s, v) => s + v, 0);
  const harm        = answers.slice(6, 10).reduce((s, v) => s + v, 0);

  const q9Flag  = (answers[8] ?? 0) === 4;
  const q10Flag = (answers[9] ?? 0) === 4;

  let level = total <= 7 ? 'low' : total <= 15 ? 'hazardous' : total <= 19 ? 'harmful' : 'dependent';

  // Q9/Q10 flag escalates hazardous → harmful
  if ((q9Flag || q10Flag) && level === 'hazardous') level = 'harmful';

  return {
    score_json: { total, consumption, dependence, harm, level, q9_flag: q9Flag, q10_flag: q10Flag },
    level,
  };
}

// ─────────────────────────────────────────────────────────────
// PCL-5
// ─────────────────────────────────────────────────────────────
// answers: number[20], values 0–4
export function scorePcl5(answers: number[]): ScoreResult {
  const total      = answers.reduce((s, v) => s + v, 0);
  const clusterB   = answers.slice(0, 5).reduce((s, v) => s + v, 0);
  const clusterC   = answers.slice(5, 7).reduce((s, v) => s + v, 0);
  const clusterD   = answers.slice(7, 14).reduce((s, v) => s + v, 0);
  const clusterE   = answers.slice(14, 20).reduce((s, v) => s + v, 0);

  const level = total <= 32 ? 'minimal' : total <= 49 ? 'moderate' : 'severe';

  // DSM-5 provisional: ≥1 symptom ≥2 in each cluster (B:1+, C:1+, D:2+, E:2+)
  const dsm5Provisional =
    answers.slice(0, 5).filter(v => v >= 2).length >= 1 &&
    answers.slice(5, 7).filter(v => v >= 2).length >= 1 &&
    answers.slice(7, 14).filter(v => v >= 2).length >= 2 &&
    answers.slice(14, 20).filter(v => v >= 2).length >= 2;

  return {
    score_json: {
      total, cluster_b: clusterB, cluster_c: clusterC,
      cluster_d: clusterD, cluster_e: clusterE,
      level, dsm5_provisional: dsm5Provisional,
    },
    level,
  };
}

// ─────────────────────────────────────────────────────────────
// DISPATCHER
// ─────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function calculateScore(testName: TestName, answers: any): ScoreResult {
  switch (testName) {
    case 'dass21': return scoreDass21(answers);
    case 'phq9':   return scorePhq9(answers);
    case 'gad7':   return scoreGad7(answers);
    case 'mdq':    return scoreMdq(answers);
    case 'asrs':   return scoreAsrs(answers);
    case 'audit':  return scoreAudit(answers);
    case 'pcl5':   return scorePcl5(answers);
    default:       throw new Error(`Unknown test: ${testName}`);
  }
}

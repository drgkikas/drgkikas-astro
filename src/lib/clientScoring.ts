// ─── Shared scoring functions (client-side mirror of src/lib/scoring.ts) ───────
// These run instantly in the browser for immediate feedback before the API call.

export type TestName = 'dass21' | 'phq9' | 'gad7' | 'mdq' | 'asrs' | 'audit' | 'pcl5';

export function calcScore(testName: TestName, answers: unknown): { level: string; score_json: Record<string, unknown> } {
  switch (testName) {
    case 'dass21': return scoreDass21(answers as number[]);
    case 'phq9':   return scorePhq9(answers as number[]);
    case 'gad7':   return scoreGad7(answers as (number | string)[]);
    case 'mdq':    return scoreMdq(answers as { partA: boolean[]; partB: boolean; partC: string });
    case 'asrs':   return scoreAsrs(answers as number[]);
    case 'audit':  return scoreAudit(answers as number[]);
    case 'pcl5':   return scorePcl5(answers as number[]);
    default:       throw new Error('Unknown test');
  }
}

function scoreDass21(answers: number[]) {
  const dItems = [2,4,9,12,15,16,20];
  const aItems = [1,3,6,8,14,18,19];
  const sItems = [0,5,7,10,11,13,17];
  const d = dItems.reduce((s,i)=>s+(answers[i]??0),0)*2;
  const a = aItems.reduce((s,i)=>s+(answers[i]??0),0)*2;
  const sv = sItems.reduce((s,i)=>s+(answers[i]??0),0)*2;
  const dL = d<=9?'normal':d<=13?'mild':d<=20?'moderate':d<=27?'severe':'extreme';
  const aL = a<=7?'normal':a<=9?'mild':a<=14?'moderate':a<=19?'severe':'extreme';
  const sL = sv<=14?'normal':sv<=18?'mild':sv<=25?'moderate':sv<=33?'severe':'extreme';
  const order = ['normal','mild','moderate','severe','extreme'];
  const worst = [dL,aL,sL].reduce((a,b)=>order.indexOf(a)>=order.indexOf(b)?a:b);
  return { level: worst, score_json: { depression:d, depression_level:dL, anxiety:a, anxiety_level:aL, stress:sv, stress_level:sL, worst_level:worst } };
}
function scorePhq9(answers: number[]) {
  const total = answers.reduce((s,v)=>s+v,0);
  const q9Flag = (answers[8]??0)>=1;
  let level = q9Flag?'critical':total<=4?'minimal':total<=9?'mild':total<=14?'moderate':total<=19?'moderately_severe':'severe';
  return { level, score_json: { total, level, q9_flag: q9Flag } };
}
function scoreGad7(answers: (number|string)[]) {
  const scores = answers.slice(0,7) as number[];
  const functional = answers[7] as string;
  const total = scores.reduce((s,v)=>s+v,0);
  const level = total<=4?'minimal':total<=9?'mild':total<=14?'moderate':'severe';
  return { level, score_json: { total, level, functional_impairment:functional } };
}
function scoreMdq(answers: { partA:boolean[]; partB:boolean; partC:string }) {
  const partAYes = answers.partA.filter(Boolean).length;
  const gate1 = partAYes>=7, gate2 = answers.partB, gate3 = ['moderate','serious'].includes(answers.partC);
  const result = gate1&&gate2&&gate3?'positive':'negative';
  return { level: result, score_json: { part_a_yes_count:partAYes, part_b_same_time:answers.partB, part_c_problem:answers.partC, gate1, gate2, gate3, result } };
}
function scoreAsrs(answers: number[]) {
  const posA14 = answers.slice(0,4).filter(v=>v>=3).length;
  const posA56 = answers.slice(4,6).filter(v=>v>=2).length;
  const total = posA14+posA56;
  const result = total>=4?'positive':'negative';
  const partBTotal = answers.slice(6).reduce((s,v)=>s+v,0);
  let subtype = 'mixed';
  if(posA14>=3&&posA56<2) subtype='inattentive';
  if(posA56>=2&&posA14<3) subtype='hyperactive';
  return { level: result, score_json: { part_a_positive:total, part_a_result:result, part_b_total:partBTotal, subtype, result } };
}
function scoreAudit(answers: number[]) {
  const total = answers.reduce((s,v)=>s+v,0);
  const q9Flag=(answers[8]??0)===4, q10Flag=(answers[9]??0)===4;
  let level = total<=7?'low':total<=15?'hazardous':total<=19?'harmful':'dependent';
  if((q9Flag||q10Flag)&&level==='hazardous') level='harmful';
  return { level, score_json: { total, level, q9_flag:q9Flag, q10_flag:q10Flag } };
}
function scorePcl5(answers: number[]) {
  const total = answers.reduce((s,v)=>s+v,0);
  const level = total<=32?'minimal':total<=49?'moderate':'severe';
  const dsm5 = answers.slice(0,5).filter(v=>v>=2).length>=1 && answers.slice(5,7).filter(v=>v>=2).length>=1 && answers.slice(7,14).filter(v=>v>=2).length>=2 && answers.slice(14,20).filter(v=>v>=2).length>=2;
  return { level, score_json: { total, level, dsm5_provisional:dsm5 } };
}

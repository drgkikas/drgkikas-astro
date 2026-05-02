---
title: "Motor Threshold"
description: "Motor threshold: calculating stimulation intensity in rTMS. Personalized treatment calibration for optimal results."
order: 30
---

Motor Threshold (MT) is defined as the minimum magnetic stimulation intensity required to produce a visible or measurable motor response in the corresponding muscle in at least 50% of trials. It is the central index for personalizing every rTMS protocol. Without correct MT calibration, treatment cannot be applied safely or effectively.

## Why it matters

Every brain has different excitability due to anatomy, age, medication, and clinical condition. MT corrects for this difference. If two patients receive exactly the same machine output, such as 60% of maximum stimulator output, but have different motor thresholds, the actual cortical stimulation they receive is radically different. Expressing intensity as a percentage of MT ensures that each patient receives a physiologically equivalent dose. This process is critical for rTMS safety.

## Mechanism

- **Target muscle:** usually the abductor pollicis brevis (APB) or first dorsal interosseous (FDI) muscle of the dominant hand.
- **Stimulation:** TMS coil placed over the primary motor cortex (M1), in the hand area.
- **RMT (Resting Motor Threshold):** measured at rest; the minimum intensity needed to produce an [MEP](/en/rtms/pos-leitourgei/mep) of ≥50 μV in 5 out of 10 trials.
- **AMT (Active Motor Threshold):** measured while the muscle maintains slight contraction, around 10% of maximum voluntary contraction; generally 10–15% lower than RMT.
- MT is affected by medication, including benzodiazepines and antiepileptic drugs, as well as age, fatigue, and sleep cycle.
- MT should be remeasured if there are significant medication changes.

## Clinical significance

rTMS protocols always define intensity as a percentage of MT, for example 110% RMT for HF-rTMS or 80% AMT for [iTBS](/en/rtms/core/ti-einai). This expression allows comparison across research centers and physiologically accurate application in clinical practice.

## Explicit relations (Entity Graph)

- Motor Threshold → calibrates → rTMS intensity
- Motor Threshold → measured at → M1, primary motor cortex
- Motor Threshold → generates → MEP
- Motor Threshold → expressed as → % RMT or % AMT
- Motor Threshold → affected by → psychotropic medication
- Motor Threshold → affects → safety and efficacy of rTMS
- RMT → higher than → AMT, by approximately 10–15%

## References

- Rossini PM, Barker AT, Berardelli A, et al. (1994). Non-invasive electrical and magnetic stimulation of the brain, spinal cord and roots: basic principles and procedures for routine clinical application. Electroencephalography and Clinical Neurophysiology.
- Groppa S, Oliviero A, Eisen A, et al. (2012). A practical guide to diagnostic transcranial magnetic stimulation: report of an IFCN committee. Clinical Neurophysiology.

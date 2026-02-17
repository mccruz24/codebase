import { ResearchEntry } from '../types';

export const RESEARCH_DATA: ResearchEntry[] = [
  // --- EXISTING ENTRIES ---
  {
    id: 'bpc-157',
    name: 'BPC-157',
    category: 'Reparative',
    classification: 'Synthetic peptide fragment derived from Body Protection Compound (Gastric)',
    overview:
      'BPC-157 is a pentadecapeptide that is a partial sequence of a body protection compound discovered in human gastric juice. It has been extensively studied in preclinical models for its potential role in tissue organization and healing processes.',
    researchContext: [
      'Tendon and ligament fibroblast models (in vitro)',
      'Gastrointestinal mucosal integrity models (animal)',
      'Skeletal muscle repair models (animal)',
      'Angiogenesis pathways (vascular formation models)',
    ],
    mechanism:
      'Preclinical findings suggest this compound may interact with the nitric oxide system and growth factor pathways (specifically VEGFR2) to modulate cellular migration and vessel formation during tissue repair phases.',
    limitations:
      'The majority of available data derives from rodent models. Robust, large-scale human clinical trials regarding safety and efficacy in healthy populations are currently lacking.',
    regulatoryStatus:
      'This compound is not approved by the FDA or EMA for therapeutic use. It is widely classified as a research chemical.',
    references: [
      'Sikiric P, et al. "Brain-gut Axis and Pentadecapeptide BPC 157." Curr Neuropharmacol. 2016.',
      'Gwyer D, et al. "BPC-157 as a Potential Therapeutic Agent for Tendon Healing." J Orthop. 2019.',
    ],
  },
  {
    id: 'ghk-cu',
    name: 'GHK-Cu',
    category: 'Cosmetic',
    classification: 'Naturally occurring copper-binding tripeptide',
    overview:
      'GHK-Cu is a tripeptide (glycyl-L-histidyl-L-lysine) with a high affinity for copper ions. It is found naturally in human plasma, saliva, and urine, though concentrations decline with age.',
    researchContext: [
      'Dermal fibroblast proliferation models',
      'Collagen and elastin synthesis pathways (in vitro)',
      'Antioxidant enzyme regulation (in vitro)',
      'Wound healing models (animal and limited human)',
    ],
    mechanism:
      'Research indicates GHK-Cu may function as a signaling peptide that modulates the expression of genes involving tissue remodeling, antioxidant defense, and anti-inflammatory responses.',
    limitations:
      'While studied in cosmetic formulations, data regarding systemic administration is primarily preclinical. The bioavailability and systemic safety profile are not fully established in large human cohorts.',
    regulatoryStatus:
      'Used as an ingredient in cosmetic products. Not approved as an injectable drug for systemic therapy.',
    references: [
      'Pickart L, et al. "GHK Peptide as a Natural Modulator of Multiple Cellular Pathways in Skin Regeneration." Biomed Res Int. 2015.',
      'Dou Y, et al. "The potential of GHK-Cu in skin remodeling and anti-aging." J Dermatol Sci. 2018.',
    ],
  },
  {
    id: 'tb-500',
    name: 'Thymosin Beta-4',
    category: 'Reparative',
    classification: 'Synthetic analogue of the naturally occurring protein Thymosin Beta-4',
    overview:
      'Thymosin Beta-4 is a major actin-sequestering protein found in almost all human cells. TB-500 is a synthetic fragment or analogue used in research settings to study cytoskeletal structure and cell motility.',
    researchContext: [
      'Actin polymerization dynamics (in vitro)',
      'Cellular migration and chemotaxis models',
      'Cardiac tissue remodeling models (animal)',
      'Corneal wound healing models',
    ],
    mechanism:
      'The compound is hypothesized to promote cell migration (chemotaxis) and angiogenesis by regulating actin polymerization, a fundamental process in the formation of the cytoskeleton.',
    limitations:
      'Human clinical data is extremely limited, with some trials halted or inconclusive. Long-term proliferative effects on tissues have not been fully characterized.',
    regulatoryStatus: 'Not approved for human therapeutic use. Classified as a research substance.',
    references: [
      'Goldstein AL, et al. "Thymosin beta4: actin-sequestering protein moonlights to repair injured tissues." Trends Mol Med. 2012.',
      'Philp D, et al. "Thymosin beta4 and its degradative peptides: isoform-specific effects in the heart." Curr Pharm Des. 2010.',
    ],
  },
  {
    id: 'semaglutide',
    name: 'Semaglutide',
    category: 'Metabolic',
    classification: 'Glucagon-like peptide-1 (GLP-1) receptor agonist',
    overview:
      'Semaglutide is a modified analogue of human GLP-1, a hormone involved in glucose metabolism and appetite regulation. It has been studied extensively for its role in metabolic function.',
    researchContext: [
      'Glucose-dependent insulin secretion pathways',
      'Gastric emptying rate models',
      'Central nervous system appetite regulation',
      'Cardiovascular outcome trials',
    ],
    mechanism:
      'It acts by selectively binding to and activating the GLP-1 receptor, which enhances insulin secretion, suppresses glucagon secretion, and delays gastric emptying.',
    limitations:
      'Requires careful titration to manage gastrointestinal tolerability. Long-term effects on thyroid C-cells have been noted in rodent models, though relevance to humans is debated.',
    regulatoryStatus:
      'Approved by FDA and EMA for specific indications (Type 2 Diabetes, Weight Management). Status varies by formulation and jurisdiction.',
    references: [
      'Wilding JPH, et al. "Once-Weekly Semaglutide in Adults with Overweight or Obesity." N Engl J Med. 2021.',
      'Dhillon S. "Semaglutide: A Review in Type 2 Diabetes." Drugs. 2018.',
    ],
  },
  {
    id: 'nad',
    name: 'NAD+',
    category: 'Cognitive',
    classification: 'Coenzyme (Nicotinamide Adenine Dinucleotide)',
    overview:
      'NAD+ is a coenzyme found in all living cells. It is essential for metabolic processes, specifically redox reactions and energy production via the electron transport chain.',
    researchContext: [
      'Mitochondrial function assays',
      'Sirtuin (SIRT) activation pathways',
      'DNA repair mechanisms (PARP activity)',
      'Age-related metabolic decline models',
    ],
    mechanism:
      'NAD+ serves as an electron carrier in metabolic reactions and a substrate for enzymes like sirtuins and PARPs, which regulate cellular aging, DNA repair, and circadian rhythm.',
    limitations:
      'Systemic bioavailability via different administration routes is a subject of ongoing debate. Clinical evidence for anti-aging endpoints in humans is preliminary.',
    regulatoryStatus:
      'Available as a supplement component in some jurisdictions; regulatory status of injectable formulations varies significantly.',
    references: [
      'Braidy N, et al. "Role of NAD+ and ADP-ribosylation in DNA repair and longevity." Clin Exp Pharmacol Physiol. 2014.',
      'Verdin E. "NAD⁺ in aging, metabolism, and neurodegeneration." Science. 2015.',
    ],
  },

  // --- METABOLIC ---
  {
    id: 'tirzepatide',
    name: 'Tirzepatide',
    category: 'Metabolic',
    classification: 'Dual GIP/GLP-1 receptor agonist',
    overview:
      'Tirzepatide is a synthetic peptide that acts as a dual agonist for both the glucose-dependent insulinotropic polypeptide (GIP) and glucagon-like peptide-1 (GLP-1) receptors.',
    researchContext: [
      'Glycemic control models',
      'Lipid metabolism pathways',
      'Body weight regulation trials',
      'Hepatosteatosis models',
    ],
    mechanism:
      'By activating both GIP and GLP-1 receptors, it synergistically enhances insulin secretion, delays gastric emptying, and modulates appetite signaling in the hypothalamus.',
    limitations:
      'Gastrointestinal side effects are common. Long-term data on specific receptor downregulation is ongoing.',
    regulatoryStatus:
      'Approved by FDA for specific indications (Type 2 Diabetes, Weight Management).',
    references: [
      'Jastreboff AM, et al. "Tirzepatide Once Weekly for the Treatment of Obesity." N Engl J Med. 2022.',
    ],
  },
  {
    id: 'retatrutide',
    name: 'Retatrutide',
    category: 'Metabolic',
    classification: 'Triple agonist (GLP-1, GIP, Glucagon)',
    overview:
      'Retatrutide is an investigational peptide that targets three receptors: GLP-1, GIP, and Glucagon. It represents the next generation of metabolic modulation in research.',
    researchContext: [
      'Energy expenditure models',
      'Hepatic fat reduction',
      'Combined metabolic signaling pathways',
    ],
    mechanism:
      'In addition to incretin effects, glucagon receptor agonism is hypothesized to increase energy expenditure and lipid catabolism.',
    limitations:
      'Currently in clinical trials. Long-term safety profile regarding cardiovascular outcomes and heart rate is under investigation.',
    regulatoryStatus: 'Investigational compound. Not currently approved for commercial use.',
    references: [
      'Coskun T, et al. "LY3437943, a novel triple GIP, GLP-1, and glucagon receptor agonist." Cell Metab. 2022.',
    ],
  },
  {
    id: 'liraglutide',
    name: 'Liraglutide',
    category: 'Metabolic',
    classification: 'GLP-1 receptor agonist',
    overview:
      'Liraglutide is an acylated human glucagon-like peptide-1 (GLP-1) analogue. It has a long history of study in metabolic health and weight management.',
    researchContext: [
      'Beta-cell function',
      'Appetite regulation',
      'Cardiovascular risk reduction',
      'Neuroprotection models',
    ],
    mechanism:
      'Binds to the GLP-1 receptor to stimulate insulin secretion and reduce glucagon secretion in a glucose-dependent manner.',
    limitations:
      'Requires daily administration compared to newer weekly analogues. Nausea is a frequent adverse event.',
    regulatoryStatus: 'Approved by FDA/EMA for Type 2 Diabetes and Weight Management.',
    references: [
      'Pi-Sunyer X, et al. "A Randomized, Controlled Trial of 3.0 mg of Liraglutide in Weight Management." N Engl J Med. 2015.',
    ],
  },
  {
    id: 'cagrilintide',
    name: 'Cagrilintide',
    category: 'Metabolic',
    classification: 'Long-acting Amylin analogue',
    overview:
      'Cagrilintide is a synthetic analogue of amylin, a peptide hormone co-secreted with insulin. It is investigated for its potential to induce satiety.',
    researchContext: [
      'Satiety signaling pathways',
      'Gastric emptying rates',
      'Combination therapy with GLP-1 agonists',
    ],
    mechanism:
      'Activates amylin receptors in the hindbrain to promote satiety and delay gastric emptying, complementing the effects of GLP-1 agonists.',
    limitations:
      'Investigational status. Primarily studied in combination therapies rather than monotherapy.',
    regulatoryStatus: 'Investigational. Not approved for standalone use.',
    references: [
      'Enebo LB, et al. "Safety, tolerability, pharmacokinetics, and pharmacodynamics of concomitant administration of multiple doses of cagrilintide." Lancet. 2021.',
    ],
  },
  {
    id: 'aod-9604',
    name: 'AOD-9604',
    category: 'Metabolic',
    classification: 'Modified fragment of Human Growth Hormone (C-terminus)',
    overview:
      'AOD-9604 is a modified form of amino acids 177-191 of the Growth Hormone polypeptide. It was developed to isolate the fat-reducing properties of GH without the growth-promoting effects.',
    researchContext: [
      'Lipolysis in adipose tissue (animal/in vitro)',
      'Osteoarthritis and cartilage repair models',
      'Metabolic rate analysis',
    ],
    mechanism:
      'Hypothesized to stimulate lipolysis (fat breakdown) and inhibit lipogenesis (fat accumulation) without activating the IGF-1 pathway significantly.',
    limitations:
      'Human efficacy data for weight loss has been mixed in clinical trials. Safety profile is considered favorable but efficacy is debated.',
    regulatoryStatus:
      'Not approved as a drug for weight loss. Granted GRAS status in some food applications, but injectable status is research-only.',
    references: [
      'Heffernan M, et al. "The effects of human GH and its lipolytic fragment (AOD9604) on lipid metabolism." Int J Obes. 2001.',
    ],
  },
  {
    id: 'mots-c',
    name: 'MOTS-c',
    category: 'Metabolic',
    classification: 'Mitochondrial-derived peptide',
    overview:
      'MOTS-c is a peptide encoded in the mitochondrial genome. It has gained attention in research for its role as a "mitochondrial hormone" regulating metabolic homeostasis.',
    researchContext: [
      'Insulin sensitivity models',
      'Exercise mimetic pathways',
      'Skeletal muscle metabolism',
      'Cellular senescence',
    ],
    mechanism:
      'Proposed to regulate folate metabolism and activate the AMPK pathway, potentially mimicking the metabolic effects of exercise.',
    limitations:
      'Research is primarily preclinical (mice/in vitro). Human pharmacokinetics and optimal dosing intervals are unknown.',
    regulatoryStatus: 'Research chemical. No approved therapeutic indications.',
    references: [
      'Lee C, et al. "The mitochondrial-derived peptide MOTS-c promotes metabolic homeostasis." Cell Metab. 2015.',
    ],
  },
  {
    id: '5-amino-1mq',
    name: '5-Amino-1MQ',
    category: 'Metabolic',
    classification: 'Small molecule NNMT inhibitor (often grouped with peptides)',
    overview:
      'While not a peptide, 5-Amino-1MQ is frequently researched alongside metabolic peptides. It targets the enzyme Nicotinamide N-methyltransferase (NNMT).',
    researchContext: [
      'Adipose tissue metabolism',
      'Muscle satellite cell function',
      'NAD+ salvage pathway',
    ],
    mechanism:
      'By inhibiting NNMT, it prevents the methylation of nicotinamide, potentially increasing intracellular NAD+ and metabolic rate.',
    limitations:
      'Long-term inhibition of NNMT in humans has unknown consequences. Data is largely limited to rodent models.',
    regulatoryStatus: 'Research chemical. Not approved for human use.',
    references: [
      'Neelakantan H, et al. "Small molecule nicotinamide N-methyltransferase inhibitor activates senescent muscle stem cells." Biochem Pharmacol. 2019.',
    ],
  },
  {
    id: 'tesofensine',
    name: 'Tesofensine',
    category: 'Metabolic',
    classification: 'Triple monoamine reuptake inhibitor (Non-peptide)',
    overview:
      'Tesofensine is a serotonin-noradrenaline-dopamine reuptake inhibitor originally developed for neurological conditions, now researched for weight management.',
    researchContext: [
      'Central appetite regulation',
      'Energy expenditure',
      'Dopaminergic reward pathways',
    ],
    mechanism:
      'Modulates neurotransmitters in the brain to suppress appetite and increase resting energy expenditure.',
    limitations:
      'Can increase heart rate and blood pressure. CNS side effects like insomnia or mood changes are potential risks.',
    regulatoryStatus:
      'Investigational. Approved in some specific regions (e.g. Mexico) but not FDA/EMA.',
    references: [
      'Astrup A, et al. "Effect of tesofensine on bodyweight loss, body composition, and quality of life." Lancet. 2008.',
    ],
  },

  // --- HORMONAL / VITALITY (GHS) ---
  {
    id: 'ipamorelin',
    name: 'Ipamorelin',
    category: 'Metabolic',
    classification: 'Selective Growth Hormone Secretagogue (Pentapeptide)',
    overview:
      'Ipamorelin is a pentapeptide that mimics ghrelin to stimulate the release of growth hormone. It is known for its high selectivity.',
    researchContext: [
      'Pulsatile GH secretion models',
      'Bone mineral density',
      'Gastric motility (post-operative ileus)',
    ],
    mechanism:
      'Binds to the Ghrelin/GHS receptor in the pituitary to stimulate GH release without significantly elevating ACTH (cortisol) or prolactin.',
    limitations:
      'Short half-life requires frequent administration in research protocols. Efficacy depends on pituitary function.',
    regulatoryStatus: 'Research chemical. Not approved for general therapeutic use.',
    references: [
      'Raun K, et al. "Ipamorelin, the first selective growth hormone secretagogue." Eur J Endocrinol. 1998.',
    ],
  },
  {
    id: 'cjc-1295',
    name: 'CJC-1295',
    category: 'Metabolic',
    classification: 'Tetrasubstituted GHRH analogue',
    overview:
      'CJC-1295 is a synthetic analogue of Growth Hormone Releasing Hormone (GHRH). It is often researched in two forms: with or without Drug Affinity Complex (DAC).',
    researchContext: ['Sustained GH release', 'IGF-1 elevation profiles', 'Sleep quality metrics'],
    mechanism:
      'Acts on the GHRH receptor to stimulate the pituitary gland to release GH. The DAC modification allows for binding to albumin, extending half-life.',
    limitations:
      'Concern exists regarding "bleed" (non-pulsatile) GH secretion with long-acting versions. Long-term safety is not established.',
    regulatoryStatus: 'Research chemical. Not FDA approved.',
    references: [
      'Teichman SL, et al. "Prolonged stimulation of growth hormone (GH) and insulin-like growth factor I secretion by CJC-1295." J Clin Endocrinol Metab. 2006.',
    ],
  },
  {
    id: 'tesamorelin',
    name: 'Tesamorelin',
    category: 'Metabolic',
    classification: 'Stabilized GHRH analogue',
    overview:
      'Tesamorelin is a synthetic form of GHRH with a trans-3-hexenoic acid modification. It is the most clinically validated GHRH analogue.',
    researchContext: [
      'Visceral adipose tissue reduction',
      'Lipid profiles in HIV-associated lipodystrophy',
      'IGF-1 modulation',
    ],
    mechanism:
      'Stimulates the synthesis and release of endogenous growth hormone, which acts to reduce visceral fat and improve lipid profiles.',
    limitations:
      'Requires daily injection. Antibodies can develop, though usually non-neutralizing.',
    regulatoryStatus:
      'Approved by FDA for HIV-associated lipodystrophy (Egrifta). Off-label use is common.',
    references: [
      'Falutz J, et al. "Long-term safety and effects of tesamorelin." J Acquir Immune Defic Syndr. 2010.',
    ],
  },
  {
    id: 'sermorelin',
    name: 'Sermorelin',
    category: 'Metabolic',
    classification: 'GHRH (1-29) fragment',
    overview:
      'Sermorelin corresponds to the amino-terminal segment of the naturally occurring GHRH. It has been used diagnostically and therapeutically.',
    researchContext: ['Pituitary function testing', 'Age-related GH decline', 'Sleep architecture'],
    mechanism:
      'Directly stimulates the pituitary gene transcription and release of GH. It preserves the negative feedback loop via somatostatin.',
    limitations:
      'Very short half-life (minutes). Requires daily administration. Less potent than newer analogues.',
    regulatoryStatus:
      'Previously FDA approved for diagnostic use (Geref). Currently widely compounded.',
    references: [
      'Walker RF. "Sermorelin: a review of its clinical and experimental status." Clin Interv Aging. 2006.',
    ],
  },
  {
    id: 'mk-677',
    name: 'MK-677 (Ibutamoren)',
    category: 'Metabolic',
    classification: 'Non-peptide Ghrelin agonist (Oral)',
    overview:
      'MK-677 is a non-peptide spiropiperidine that acts as a potent, orally active growth hormone secretagogue.',
    researchContext: [
      'Sarcopenia and muscle wasting',
      'Bone turnover markers',
      'Sleep quality (REM sleep)',
      'Appetite stimulation',
    ],
    mechanism:
      'Mimics the action of ghrelin in the stomach and hypothalamus, stimulating GH and IGF-1 release. Also increases appetite.',
    limitations:
      'Can cause insulin resistance and elevated blood sugar. Water retention is a common side effect.',
    regulatoryStatus: 'Investigational. Not approved for human use.',
    references: [
      'Murphy MG, et al. "MK-677, an orally active growth hormone secretagogue." J Bone Miner Res. 1998.',
    ],
  },
  {
    id: 'ghrp-6',
    name: 'GHRP-6',
    category: 'Metabolic',
    classification: 'Growth Hormone Releasing Hexapeptide',
    overview:
      'GHRP-6 was one of the first synthetic hexapeptides developed to stimulate GH release. It is distinct for its strong appetite-stimulating properties.',
    researchContext: [
      'GH deficiency models',
      'Appetite regulation',
      'Gastric motility',
      'Cytoprotection',
    ],
    mechanism:
      'Activates the Ghrelin receptor. It creates a strong pulse of GH and significantly increases hunger via hypothalamic signaling.',
    limitations:
      'Can significantly elevate cortisol and prolactin. Intense hunger can be counterproductive for some goals.',
    regulatoryStatus: 'Research chemical.',
    references: [
      'Bowers CY. "GH releasing peptides - structure and kinetics." J Pediatr Endocrinol. 1993.',
    ],
  },
  {
    id: 'ghrp-2',
    name: 'GHRP-2',
    category: 'Metabolic',
    classification: 'Growth Hormone Releasing Peptide-2',
    overview:
      'GHRP-2 (Pralmorelin) is a synthetic agonist of the ghrelin receptor, noted for being more potent than GHRP-6 regarding GH release with less appetite stimulation.',
    researchContext: [
      'Catabolic states',
      'Pediatric short stature (diagnostic)',
      'IGF-1 elevation',
    ],
    mechanism:
      'Stimulates pituitary GH secretion. It also raises ACTH and cortisol more than Ipamorelin.',
    limitations: 'Dose-dependent increase in cortisol and prolactin. Short half-life.',
    regulatoryStatus: 'Research chemical. Approved in Japan for diagnostic use.',
    references: [
      'Pihoker C, et al. "Diagnostic studies with GHRP-2 in children." J Clin Endocrinol Metab. 1995.',
    ],
  },
  {
    id: 'hexarelin',
    name: 'Hexarelin',
    category: 'Metabolic',
    classification: 'Synthetic Hexapeptide GHS',
    overview:
      'Hexarelin is a potent growth hormone secretagogue structurally similar to GHRP-6 but with unique cardiovascular receptor activity.',
    researchContext: [
      'Cardioprotection (ischemia-reperfusion)',
      'GH secretion profiles',
      'Lipid metabolism',
    ],
    mechanism:
      'Stimulates GH release and activates CD36 receptors in the heart, suggesting potential direct cardioprotective effects.',
    limitations:
      'Significant desensitization (tachyphylaxis) occurs with chronic use. Elevates cortisol/prolactin.',
    regulatoryStatus: 'Research chemical.',
    references: ['Mao Y, et al. "Hexarelin attenuates cardiac hypertrophy." Endocrinology. 2004.'],
  },
  {
    id: 'igf-1-lr3',
    name: 'IGF-1 LR3',
    category: 'Reparative',
    classification: 'Long R3 Insulin-like Growth Factor-1',
    overview:
      'IGF-1 LR3 is a modified analogue of human IGF-1 comprising the full IGF-1 sequence with a 13-amino acid extension and an arginine substitution.',
    researchContext: [
      'Cellular hyperplasia models',
      'Muscle protein synthesis',
      'Nutrient partitioning',
    ],
    mechanism:
      'The modifications prevent binding to IGF-binding proteins (IGFBPs), significantly increasing its biological potency and half-life compared to native IGF-1.',
    limitations:
      'Potent hypoglycemic effects (low blood sugar). Potential for intestinal growth. Receptor downregulation risk.',
    regulatoryStatus: 'Research chemical.',
    references: ['Tomas FM, et al. "IGF-1 variants and protein metabolism." Biochem J. 1991.'],
  },
  {
    id: 'peg-mgf',
    name: 'Peg-MGF',
    category: 'Reparative',
    classification: 'Pegylated Mechano Growth Factor',
    overview:
      'MGF is a splice variant of the IGF-1 gene expressed in muscle after mechanical load. Peg-MGF is a pegylated form to improve stability.',
    researchContext: [
      'Muscle satellite cell activation',
      'Neuroprotection',
      'Skeletal muscle regeneration',
    ],
    mechanism:
      'Promotes the proliferation of muscle satellite cells (stem cells) to repair damage and induce hypertrophy.',
    limitations:
      'Native MGF has a half-life of minutes. Pegylation extends this, but systematic effects vs local effects are debated.',
    regulatoryStatus: 'Research chemical.',
    references: [
      'Goldspink G. "Research on Mechano Growth Factor: its potential for muscle repair." Br J Sports Med. 2005.',
    ],
  },
  {
    id: 'hgh-frag',
    name: 'HGH Frag 176-191',
    category: 'Metabolic',
    classification: 'Growth Hormone Fragment 176-191',
    overview:
      'This peptide represents the C-terminal amino acid sequence of Human Growth Hormone, isolated to retain lipolytic properties without metabolic or glycemic side effects.',
    researchContext: ['Lipid metabolism', 'Adipose tissue breakdown'],
    mechanism:
      'Mimics the fat-burning domain of GH. It does not bind to the GH receptor to induce IGF-1 release, avoiding water retention and insulin resistance.',
    limitations:
      'Clinical efficacy is controversial and often anecdotal. Bioavailability issues are cited in literature.',
    regulatoryStatus: 'Research chemical.',
    references: [
      'Ng FM, et al. "Metabolic studies of a synthetic lipolytic domain (AOD9604) of human growth hormone." Horm Res. 2000.',
    ],
  },

  // --- REPARATIVE / IMMUNE ---
  {
    id: 'thymosin-alpha-1',
    name: 'Thymosin Alpha-1',
    category: 'Reparative',
    classification: 'Thymic peptide',
    overview:
      'Thymosin Alpha-1 is a 28-amino acid peptide naturally produced by the thymus gland. It plays a critical role in immune system regulation.',
    researchContext: [
      'T-cell maturation',
      'Viral infection models (Hepatitis, Influenza)',
      'Vaccine adjuvant response',
      'Autoimmune modulation',
    ],
    mechanism:
      'Modulates the immune system by enhancing T-cell function and maturation. It helps restore immune balance.',
    limitations: 'Expensive to synthesize. Short half-life.',
    regulatoryStatus:
      'Approved in some countries (Zadaxin) for Hepatitis and as an adjuvant. Orphan drug status in others.',
    references: [
      'King R, et al. "Thymosin alpha 1: a comprehensive review of the literature." Expert Opin Biol Ther. 2003.',
    ],
  },
  {
    id: 'kpv',
    name: 'KPV',
    category: 'Reparative',
    classification: 'C-terminal tripeptide of Alpha-MSH',
    overview:
      'KPV (Lysine-Proline-Valine) is a tripeptide fragment of alpha-melanocyte-stimulating hormone (alpha-MSH) known for its potent anti-inflammatory properties.',
    researchContext: [
      'Inflammatory bowel disease (IBD)',
      'Dermatitis and psoriasis',
      'Antimicrobial activity (C. albicans)',
    ],
    mechanism:
      'Exerts anti-inflammatory effects by inhibiting NF-kappaB pathways in cells, reducing the production of pro-inflammatory cytokines.',
    limitations:
      'Mostly studied in topical or oral formulations for gut health. Systemic injectable data is limited.',
    regulatoryStatus: 'Research chemical.',
    references: [
      'Dalmasso G, et al. "PepT1-mediated tripeptide KPV uptake reduces intestinal inflammation." Gastroenterology. 2008.',
    ],
  },
  {
    id: 'll-37',
    name: 'LL-37',
    category: 'Reparative',
    classification: 'Cathelicidin antimicrobial peptide',
    overview:
      'LL-37 is the only cathelicidin-derived antimicrobial peptide found in humans. It is part of the innate immune response.',
    researchContext: [
      'Bacterial biofilm disruption',
      'Wound healing',
      'Angiogenesis',
      'Immune modulation',
    ],
    mechanism:
      'Disrupts bacterial cell membranes and modulates host immune responses to recruit immune cells to sites of infection.',
    limitations:
      'Can be cytotoxic at high concentrations. Some research suggests it may exacerbate autoimmune conditions like rosacea.',
    regulatoryStatus: 'Research chemical.',
    references: [
      'Dürr UH, et al. "The cathelicidin antimicrobial peptide LL-37: structure, function, and role in human immunity." Biochim Biophys Acta. 2006.',
    ],
  },
  {
    id: 'ara-290',
    name: 'ARA-290 (Cibinetide)',
    category: 'Reparative',
    classification: 'Erythropoietin (EPO) derivative',
    overview:
      'ARA-290 is a non-hematopoietic peptide derived from EPO. It is designed to provide tissue protection without stimulating red blood cell production.',
    researchContext: [
      'Small fiber neuropathy',
      'Neuropathic pain',
      'Sarcoidosis-associated nerve damage',
      'Anti-inflammation',
    ],
    mechanism:
      'Activates the Innate Repair Receptor (IRR) to reduce inflammation and promote tissue repair and nerve healing.',
    limitations: 'Short half-life requiring frequent dosing. Clinical availability is limited.',
    regulatoryStatus: 'Orphan drug designation in US/EU for Sarcoidosis. Research chemical.',
    references: [
      'Brines M, et al. "ARA 290, a nonerythropoietic peptide engineered to reduce neuropathic pain." Pain Med. 2011.',
    ],
  },
  {
    id: 'ss-31',
    name: 'SS-31 (Elamipretide)',
    category: 'Metabolic',
    classification: 'Mitochondrial-targeted tetrapeptide',
    overview:
      'SS-31 is a cell-permeable peptide that targets the inner mitochondrial membrane, specifically interacting with cardiolipin.',
    researchContext: [
      'Mitochondrial dysfunction',
      'Ischemia-reperfusion injury',
      'Heart failure models',
      'Aging models',
    ],
    mechanism:
      'Stabilizes cardiolipin in the mitochondrial membrane, improving electron transport chain efficiency and reducing reactive oxygen species (ROS).',
    limitations: 'Bioavailability issues. Clinical trials for heart failure showed mixed results.',
    regulatoryStatus: 'Investigational drug.',
    references: [
      'Szeto HH. "First-in-class cardiolipin-protective compound as a therapeutic agent to restore mitochondrial bioenergetics." Br J Pharmacol. 2014.',
    ],
  },

  // --- COSMETIC / SEXUAL ---
  {
    id: 'melanotan-2',
    name: 'Melanotan II',
    category: 'Cosmetic',
    classification: 'Synthetic Alpha-MSH analogue',
    overview:
      'Melanotan II is a cyclic lactam analogue of alpha-melanocyte-stimulating hormone. It was originally developed to prevent skin cancer by stimulating tanning.',
    researchContext: [
      'Melanogenesis (tanning)',
      'Erectile dysfunction',
      'Libido enhancement',
      'Appetite suppression',
    ],
    mechanism:
      'Non-selectively binds to melanocortin receptors (MC1R, MC3R, MC4R, MC5R). MC1R activation stimulates melanin; MC4R affects libido and appetite.',
    limitations:
      'Significant side effects including nausea, flushing, and spontaneous erections. Long-term safety on nevi (moles) is a concern.',
    regulatoryStatus: 'Research chemical. Not approved for tanning.',
    references: [
      'Dorr RT, et al. "Evaluation of melanotan-II, a superpotent cyclic melanotropic peptide in a pilot phase-I clinical study." Life Sci. 1996.',
    ],
  },
  {
    id: 'pt-141',
    name: 'PT-141 (Bremelanotide)',
    category: 'Cosmetic',
    classification: 'Active metabolite of Melanotan II',
    overview:
      'PT-141 is a de-aminated derivative of Melanotan II, isolated for its sexual function properties with less impact on pigmentation.',
    researchContext: ['Hypoactive Sexual Desire Disorder (HSDD)', 'Erectile dysfunction'],
    mechanism:
      'Acts on melanocortin receptors (MC4R) in the central nervous system to modulate sexual desire and arousal.',
    limitations: 'Nausea and blood pressure elevation are known side effects.',
    regulatoryStatus: 'Approved by FDA (Vyleesi) for HSDD in premenopausal women.',
    references: [
      'Kingsberg SA, et al. "Bremelanotide for the treatment of hypoactive sexual desire disorder." Expert Opin Pharmacother. 2020.',
    ],
  },
  {
    id: 'kisspeptin-10',
    name: 'Kisspeptin-10',
    category: 'Metabolic',
    classification: 'Kisspeptin fragment',
    overview:
      'Kisspeptin-10 is a fragment of the kisspeptin protein, a key regulator of the reproductive axis.',
    researchContext: [
      'Hypothalamic-pituitary-gonadal axis',
      'Testosterone secretion',
      'Reproductive fertility',
    ],
    mechanism:
      'Stimulates the release of Gonadotropin Releasing Hormone (GnRH), which triggers LH and FSH release.',
    limitations:
      'Short half-life. Tachyphylaxis (desensitization) can occur with continuous exposure.',
    regulatoryStatus: 'Research chemical.',
    references: [
      'Jayasena CN, et al. "The effects of kisspeptin-10 on reproductive hormone secretion." J Clin Endocrinol Metab. 2011.',
    ],
  },
  {
    id: 'adipotide',
    name: 'Adipotide',
    category: 'Metabolic',
    classification: 'Peptidomimetic pro-apoptotic agent',
    overview:
      'Adipotide is an experimental peptidomimetic designed to target the blood supply of white adipose tissue.',
    researchContext: ['Obesity models', 'Vascular targeting', 'Adipose tissue apoptosis'],
    mechanism:
      'Binds to prohibitin receptors in the vasculature of white fat, triggering apoptosis (cell death) of the blood vessels feeding fat cells.',
    limitations:
      'Renal (kidney) toxicity was observed in primate studies, halting clinical progression.',
    regulatoryStatus: 'Abandoned investigational drug. Research use only.',
    references: [
      'Barnhart KF, et al. "A peptidomimetic targeting white fat causes weight loss and improved insulin resistance in obese monkeys." Sci Transl Med. 2011.',
    ],
  },

  // --- COGNITIVE / NOOTROPIC ---
  {
    id: 'semax',
    name: 'Semax',
    category: 'Cognitive',
    classification: 'Heptapeptide analogue of ACTH (4-10)',
    overview:
      'Semax is a synthetic peptide derived from a fragment of Adrenocorticotropic Hormone (ACTH). It is widely studied in Russia for neurological conditions.',
    researchContext: [
      'Ischemic stroke recovery',
      'Cognitive enhancement (memory/attention)',
      'BDNF expression',
      'Optic nerve disease',
    ],
    mechanism:
      'Increases the expression of Brain-Derived Neurotrophic Factor (BDNF) and modulates neurotransmitter levels (dopamine, serotonin).',
    limitations:
      'Most clinical data is published in Russian journals; Western clinical trials are limited.',
    regulatoryStatus: 'Approved in Russia and Ukraine. Research chemical elsewhere.',
    references: [
      'Manchenko DM, et al. "Semax prevents the death of tyrosine hydroxylase-positive neurons in mixed neuroglial cell cultures." Neurosci Lett. 2010.',
    ],
  },
  {
    id: 'selank',
    name: 'Selank',
    category: 'Cognitive',
    classification: 'Tuftsin analogue',
    overview:
      'Selank is a synthetic derivative of the human peptide Tuftsin. It is researched for its anxiolytic (anti-anxiety) and nootropic properties.',
    researchContext: [
      'Generalized Anxiety Disorder',
      'Immune modulation',
      'Learning and memory',
      'Brain inflammation',
    ],
    mechanism:
      'Modulates GABA receptors and influences enkephalin degradation, producing calming effects without sedation.',
    limitations:
      'Like Semax, primary clinical data is Eastern European. Western regulatory recognition is absent.',
    regulatoryStatus: 'Approved in Russia. Research chemical elsewhere.',
    references: [
      'Ushakova VM, et al. "Selank affects the expression of genes involved in GABAergic neurotransmission." Front Pharmacol. 2017.',
    ],
  },
  {
    id: 'cerebrolysin',
    name: 'Cerebrolysin',
    category: 'Cognitive',
    classification: 'Porcine brain-derived peptide preparation',
    overview:
      'Cerebrolysin is a neuropeptide preparation consisting of low molecular weight peptides derived from purified pig brain proteins.',
    researchContext: [
      'Alzheimer’s disease',
      'Vascular dementia',
      'Stroke rehabilitation',
      'Traumatic Brain Injury (TBI)',
    ],
    mechanism:
      'Mimics the action of neurotrophic factors (like NGF, BDNF, CNTF) to support neuron survival, neurogenesis, and neuroplasticity.',
    limitations:
      'Requires intravenous or intramuscular administration of large volumes. Animal-derived origin raises questions of purity (though standardized).',
    regulatoryStatus: 'Approved in over 50 countries. Not FDA approved.',
    references: ['Bornstein NM, et al. "Cerebrolysin for acute ischemic stroke." Stroke. 2013.'],
  },
  {
    id: 'dihexa',
    name: 'Dihexa',
    category: 'Cognitive',
    classification: 'Angiotensin IV analogue',
    overview:
      'Dihexa is a synthetic oligopeptide developed to be a potent neurogenic agent, vastly more powerful than BDNF in preclinical models.',
    researchContext: ['Neurodegenerative diseases', 'Synaptogenesis', 'Cognitive decline'],
    mechanism:
      'Facilitates the formation of new synapses (synaptogenesis) by engaging the HGF/c-Met system.',
    limitations:
      'Limited human safety data. Concern regarding potential oncogenic risk due to HGF pathway activation (theoretical).',
    regulatoryStatus: 'Research chemical.',
    references: [
      'McCoy AT, et al. "Evaluation of metabolically stabilized angiotensin IV analogs as procognitive/antidementia agents." J Pharmacol Exp Ther. 2013.',
    ],
  },
  {
    id: 'epitalon',
    name: 'Epitalon',
    category: 'Cognitive',
    classification: 'Synthetic tetrapeptide (Pineal)',
    overview:
      'Epitalon (Epithalon) is a synthetic peptide based on the natural pineal peptide Epithalamin. It is central to the "Khavinson peptide" bioregulator theory.',
    researchContext: [
      'Telomerase activation',
      'Circadian rhythm regulation',
      'Longevity models',
      'Cancer suppression (animal)',
    ],
    mechanism:
      'Stimulates the pineal gland to produce melatonin and is hypothesized to activate telomerase, potentially elongating telomeres.',
    limitations:
      'Human longevity claims are based on limited, older cohorts. Mechanism is not fully mapped in modern Western literature.',
    regulatoryStatus: 'Research chemical.',
    references: ['Khavinson VH. "Peptides and Ageing." Neuro Endocrinol Lett. 2002.'],
  },
  {
    id: 'pinealon',
    name: 'Pinealon',
    category: 'Cognitive',
    classification: 'Synthetic tripeptide (Bioregulator)',
    overview:
      'Pinealon is a short peptide (Glu-Asp-Arg) designed to regulate brain function and protect against oxidative stress.',
    researchContext: ['Cognitive dysfunction', 'Circadian disorders', 'Hypoxia models'],
    mechanism:
      'Penetrates the blood-brain barrier to interact directly with the pineal gland and cortical structures, modulating gene expression.',
    limitations: 'Limited peer-reviewed English literature outside of specific journals.',
    regulatoryStatus: 'Research chemical / Supplement in some regions.',
    references: [
      'Khavinson VH, et al. "Effect of Pinealon on gene expression in the mouse brain cortex." Neurochem Res. 2011.',
    ],
  },

  // --- OTHER ---
  {
    id: 'oxytocin',
    name: 'Oxytocin',
    category: 'Other',
    classification: 'Neuropeptide hormone',
    overview:
      'Oxytocin is a nine-amino acid peptide hormone produced in the hypothalamus. It is best known for its roles in social bonding and reproduction.',
    researchContext: [
      'Social anxiety',
      'Autism spectrum disorders',
      'Pain modulation',
      'Muscle regeneration',
    ],
    mechanism:
      'Acts as a neurotransmitter in the brain to influence social behavior and bonding. Also plays a systemic role in muscle maintenance.',
    limitations:
      'Short half-life. Difficulty crossing the blood-brain barrier via systemic administration.',
    regulatoryStatus:
      'Approved for labor induction (Pitocin). Off-label use for psychiatric conditions is investigational.',
    references: [
      'MacDonald K, et al. "Oxytocin: a neuropeptide for treatment of diverse psychiatric disorders." CNS Spectr. 2005.',
    ],
  },
  {
    id: 'glutathione',
    name: 'Glutathione',
    category: 'Reparative',
    classification: 'Tripeptide (Antioxidant)',
    overview:
      'Glutathione is the body\'s "master antioxidant," a tripeptide composed of glutamine, cysteine, and glycine.',
    researchContext: [
      'Oxidative stress reduction',
      'Liver health',
      'Skin brightening',
      'Detoxification',
    ],
    mechanism:
      'Neutralizes free radicals and reactive oxygen species. It is crucial for immune function and tissue repair.',
    limitations: 'Poor oral bioavailability led to interest in injectable or liposomal forms.',
    regulatoryStatus: 'Approved as a drug in some countries; supplement/compounded in others.',
    references: ['Pizzorno J. "Glutathione!" Integr Med (Encinitas). 2014.'],
  },
  {
    id: 'dsip',
    name: 'DSIP',
    category: 'Cognitive',
    classification: 'Delta Sleep-Inducing Peptide',
    overview:
      'DSIP is a neuropeptide originally isolated from rabbit brain during sleep. It has been studied for sleep regulation and stress response.',
    researchContext: [
      'Sleep architecture (Delta wave)',
      'Stress hormone reduction (Cortisol/LH)',
      'Chronic pain',
    ],
    mechanism:
      'Precise mechanism is unknown, but it appears to modulate the activity of GABA and other neurotransmitter systems to promote slow-wave sleep.',
    limitations: 'Effects can be inconsistent. Rapid degradation in blood.',
    regulatoryStatus: 'Research chemical.',
    references: [
      'Schoenenberger GA. "Characterization of a delta-electroencephalogram (sleep)-inducing peptide." Proc Natl Acad Sci U S A. 1977.',
    ],
  },
  {
    id: 'humanin',
    name: 'Humanin',
    category: 'Metabolic',
    classification: 'Mitochondrial-derived peptide',
    overview:
      'Humanin is a peptide encoded in the mitochondrial 16S rRNA gene. It is a potent cytoprotective agent.',
    researchContext: [
      'Cytoprotection (Alzheimer’s models)',
      'Insulin sensitivity',
      'Cardioprotection',
      'Longevity',
    ],
    mechanism:
      'Protects cells from apoptosis and oxidative stress. It improves insulin sensitivity and reduces inflammation.',
    limitations: 'Early stage research. Human dosing protocols are not established.',
    regulatoryStatus: 'Research chemical.',
    references: [
      'Hashimoto Y, et al. "A rescue factor abolishing neuronal cell death by a wide spectrum of amyloid beta peptides." Proc Natl Acad Sci U S A. 2001.',
    ],
  },
  {
    id: 'follistatin-344',
    name: 'Follistatin 344',
    category: 'Metabolic',
    classification: 'Myostatin inhibitor',
    overview:
      'Follistatin is a naturally occurring glycoprotein that inhibits myostatin. The 344 isoform is often researched for muscle enhancement.',
    researchContext: ['Muscular dystrophy', 'Muscle hypertrophy', 'Sarcopenia'],
    mechanism:
      'Binds to and inhibits myostatin (GDF-8), a negative regulator of muscle growth, thereby allowing unchecked muscle hypertrophy.',
    limitations:
      'Potential impact on tendon strength relative to muscle mass. Long-term organ safety is unknown.',
    regulatoryStatus: 'Research chemical.',
    references: [
      'Rodino-Klapac LR, et al. "Follistatin gene therapy promotes amelioration of severe pathology in dystrophic muscle." Am J Pathol. 2009.',
    ],
  },
];

export const getResearchEntries = (): ResearchEntry[] => {
  return RESEARCH_DATA.sort((a, b) => a.name.localeCompare(b.name));
};

export const getResearchEntryById = (id: string): ResearchEntry | undefined => {
  return RESEARCH_DATA.find((e) => e.id === id);
};

export const getPeptideList = (): string[] => {
  return RESEARCH_DATA.map((e) => e.name).sort();
};

// Public navigation metadata. Answer keys must never enter browser bundles.
import type {
  YearData as BaseYear,
  ModuleData as BaseModule,
  CategoryData as BaseCategory,
} from "./curriculum";
export type { CoursePdf, QuestionData } from "./curriculum";
export type ModuleData = BaseModule & { availableQuestionCount: number };
export type CategoryData = Omit<BaseCategory, "modules"> & {
  modules: ModuleData[];
};
export type YearData = Omit<BaseYear, "categories"> & {
  categories: CategoryData[];
};
export const CURRICULUM_DATA: YearData[] = [
  {
    number: 1,
    label: "1ère Année Médecine",
    description: "Sciences fondamentales et bases morphologiques",
    categories: [
      {
        id: "y1-anat",
        nameFr: "Anatomie",
        modules: [
          {
            id: "mod-y1-anat-general",
            nameFr: "Anatomie Générale & Ostéologie",
            descriptionFr:
              "Généralités sur le squelette, articulations, plans anatomiques et repères osseux cardinaux.",
            questionCount: 45,
            isFree: true,
            documents: [
              {
                id: "pdf-anat-1",
                moduleId: "mod-y1-anat-general",
                title:
                  "Polycopié Officiel — Ostéologie Générale & Repères Cardinaux",
                professor: "Pr. Benali / Faculté de Médecine",
                fileSize: "4.8 Mo",
                pagesCount: 42,
                uploadDate: "05 Sept. 2026",
                isFree: true,
              },
              {
                id: "pdf-anat-2",
                moduleId: "mod-y1-anat-general",
                title:
                  "Fiche Synthèse — Articulations & Loges du Membre Supérieur",
                professor: "Collège National d'Anatomie",
                fileSize: "2.1 Mo",
                pagesCount: 16,
                uploadDate: "01 Sept. 2026",
                isFree: true,
              },
            ],
            availableQuestionCount: 3,
          },
          {
            id: "mod-y1-anat-thorax",
            nameFr: "Anatomie du Thorax & Médiastin",
            descriptionFr:
              "Cœur, gros vaisseaux, plèvre, poumons et innervation autonome.",
            questionCount: 60,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y1-anat-abdomen",
            nameFr: "Abdomen & Pelvis",
            descriptionFr:
              "Péritoine, tube digestif, loges rétro-péritonéales et périnée.",
            questionCount: 80,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y1-anat-tete-cou",
            nameFr: "Anatomie de la Tête & du Cou",
            descriptionFr:
              "Crâne, face, fosses nasales, larynx, pharynx et nerfs crâniens.",
            questionCount: 70,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y1-anat-membres",
            nameFr: "Anatomie des Membres",
            descriptionFr:
              "Membre supérieur et inférieur : os, muscles, vascularisation et innervation.",
            questionCount: 65,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y1-cyto-histo",
        nameFr: "Cytologie & Histologie",
        modules: [
          {
            id: "mod-y1-cytologie",
            nameFr: "Cytologie (Biologie Cellulaire)",
            descriptionFr:
              "Membrane plasmique, organites cellulaires, noyau, cycle cellulaire et division (mitose/méiose).",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y1-histologie",
            nameFr: "Histologie Générale",
            descriptionFr:
              "Tissus épithéliaux, conjonctifs, musculaires et nerveux. Techniques histologiques.",
            questionCount: 50,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y1-embryo",
        nameFr: "Embryologie",
        modules: [
          {
            id: "mod-y1-embryo-gen",
            nameFr: "Embryologie Générale",
            descriptionFr:
              "Gamétogenèse, fécondation, segmentation, gastrulation et organogenèse précoce.",
            questionCount: 45,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y1-physio",
        nameFr: "Physiologie",
        modules: [
          {
            id: "mod-y1-physio-gen",
            nameFr: "Physiologie Générale",
            descriptionFr:
              "Physiologie membranaire, potentiels de repos et d'action, pompe Na+/K+ et synapses.",
            questionCount: 50,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y1-physio-musculaire",
            nameFr: "Physiologie du Muscle Squelettique",
            descriptionFr:
              "Couplage excitation-contraction, sarcomère et métabolisme énergétique.",
            questionCount: 40,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y1-chimie",
        nameFr: "Chimie & Biochimie",
        modules: [
          {
            id: "mod-y1-chimie-gen",
            nameFr: "Chimie Générale & Organique",
            descriptionFr:
              "Atomistique, liaisons chimiques, thermodynamique, chimie organique et fonctions chimiques.",
            questionCount: 50,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y1-biochimie-struct",
            nameFr: "Biochimie Structurale",
            descriptionFr:
              "Structure des glucides, lipides, protéines et acides nucléiques.",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y1-biophys",
        nameFr: "Physique & Biophysique",
        modules: [
          {
            id: "mod-y1-biophysique",
            nameFr: "Biophysique Médicale",
            descriptionFr:
              "Propriétés des solutions, pH et tampons, radiations ionisantes et non ionisantes, optique médicale.",
            questionCount: 45,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y1-biostats",
        nameFr: "Biostatistiques",
        modules: [
          {
            id: "mod-y1-biostat",
            nameFr: "Biostatistiques & Informatique Médicale",
            descriptionFr:
              "Statistiques descriptives, probabilités, tests d'hypothèse et introduction à l'informatique médicale.",
            questionCount: 35,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y1-ssh",
        nameFr: "Sciences Humaines & Sociales",
        modules: [
          {
            id: "mod-y1-ssh",
            nameFr: "Santé, Société & Humanité",
            descriptionFr:
              "Histoire de la médecine, éthique médicale, déontologie et communication avec le patient.",
            questionCount: 25,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
    ],
  },
  {
    number: 2,
    label: "2ème Année Médecine",
    description: "Physiologie des grands systèmes, génétique et immunologie",
    categories: [
      {
        id: "y2-immuno-genet",
        nameFr: "Immunologie & Génétique",
        modules: [
          {
            id: "mod-y2-immunologie",
            nameFr: "Immunologie Fondamentale",
            descriptionFr:
              "Immunité innée et adaptative, cellules immunitaires, anticorps, CMH et réactions d'hypersensibilité.",
            questionCount: 60,
            isFree: true,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y2-genetique",
            nameFr: "Génétique Médicale",
            descriptionFr:
              "ADN, ARN, expression des gènes, mutations, hérédité mendélienne et chromosomopathies.",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y2-endocrinien-genital",
        nameFr: "Appareil Endocrinien & Génital",
        modules: [
          {
            id: "mod-y2-endocrinien",
            nameFr: "Système Endocrinien",
            descriptionFr:
              "Axe hypothalamo-hypophysaire, thyroïde, surrénales, pancréas endocrine et hormones sexuelles.",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y2-app-genital",
            nameFr: "Appareil Génital",
            descriptionFr:
              "Anatomie et physiologie des appareils génitaux masculin et féminin, cycle menstruel.",
            questionCount: 50,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y2-digestif",
        nameFr: "Appareil Digestif",
        modules: [
          {
            id: "mod-y2-digestif",
            nameFr: "Appareil Digestif",
            descriptionFr:
              "Anatomie, histologie et physiologie du tube digestif, foie, pancréas exocrine et péritoine.",
            questionCount: 65,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y2-urinaire",
        nameFr: "Appareil Urinaire",
        modules: [
          {
            id: "mod-y2-urinaire",
            nameFr: "Appareil Urinaire & Rein",
            descriptionFr:
              "Anatomie rénale, néphron, filtration glomérulaire, équilibre acido-basique et voies urinaires.",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y2-cardio-resp",
        nameFr: "Appareil Cardio-Respiratoire",
        modules: [
          {
            id: "mod-y2-cardio",
            nameFr: "Physiologie Cardiovasculaire",
            descriptionFr:
              "Cycle cardiaque, hémodynamique, courbes de pression, ECG de base et régulation de la PA.",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 1,
          },
          {
            id: "mod-y2-respiratoire",
            nameFr: "Physiologie Respiratoire",
            descriptionFr:
              "Mécanique ventilatoire, échanges gazeux alvéolaires, transport O2/CO2 et régulation.",
            questionCount: 50,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y2-neuro-sensitif",
        nameFr: "Appareil Neuro-Sensitif",
        modules: [
          {
            id: "mod-y2-neuro",
            nameFr: "Système Nerveux Central & Périphérique",
            descriptionFr:
              "Anatomie et physiologie du SNC, moelle épinière, tronc cérébral, cortex et nerfs crâniens.",
            questionCount: 70,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y2-organes-sens",
            nameFr: "Organes des Sens",
            descriptionFr:
              "Œil et vision, oreille et audition, goût, odorat et sensibilité somatique.",
            questionCount: 45,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y2-biochimie-metab",
        nameFr: "Biochimie Métabolique",
        modules: [
          {
            id: "mod-y2-biochimie-metab",
            nameFr: "Biochimie Métabolique",
            descriptionFr:
              "Métabolisme des glucides, lipides, acides aminés, enzymologie et bioénergétique.",
            questionCount: 60,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y2-histo-special",
        nameFr: "Histologie Spéciale",
        modules: [
          {
            id: "mod-y2-histo-special",
            nameFr: "Histologie des Appareils & Organes",
            descriptionFr:
              "Histologie du cœur, poumon, rein, foie, tube digestif, glandes endocrines et gonades.",
            questionCount: 50,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y2-embryo-special",
        nameFr: "Embryologie Spéciale",
        modules: [
          {
            id: "mod-y2-embryo-special",
            nameFr: "Embryologie Spéciale des Appareils",
            descriptionFr:
              "Développement embryonnaire de chaque appareil : cœur, appareil digestif, urogénital, nerveux.",
            questionCount: 45,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
    ],
  },
  {
    number: 3,
    label: "3ème Année Médecine",
    description: "Sémiologie clinique, pharmacologie et sciences pathologiques",
    categories: [
      {
        id: "y3-semio",
        nameFr: "Sémiologie Médicale",
        modules: [
          {
            id: "mod-y3-semio-cardio",
            nameFr: "Sémiologie Cardiovasculaire",
            descriptionFr:
              "Souffles cardiaques, insuffisance cardiaque, signes d'ischémie et œdèmes.",
            questionCount: 75,
            isFree: true,
            availableQuestionCount: 1,
          },
          {
            id: "mod-y3-semio-pneumo",
            nameFr: "Sémiologie Respiratoire",
            descriptionFr:
              "Syndrome de condensation, épanchements pleuraux et râles auscultatoires.",
            questionCount: 70,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y3-semio-digestive",
            nameFr: "Sémiologie Digestive",
            descriptionFr:
              "Examen de l'abdomen, ictère, ascite, hépatomégalie et toucher rectal.",
            questionCount: 65,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y3-semio-nephro",
            nameFr: "Sémiologie Néphro-Urologique",
            descriptionFr:
              "Œdèmes, protéinurie, hématurie, syndromes glomérulaires et insuffisance rénale.",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y3-semio-neuro",
            nameFr: "Sémiologie Neurologique",
            descriptionFr:
              "Examen neurologique, déficits moteurs/sensitifs, réflexes et syndromes neurologiques.",
            questionCount: 70,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y3-semio-endoc",
            nameFr: "Sémiologie Endocrinienne",
            descriptionFr:
              "Goitre, signes de dysthyroïdie, diabète et syndrome de Cushing.",
            questionCount: 45,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y3-pharmaco",
        nameFr: "Pharmacologie",
        modules: [
          {
            id: "mod-y3-pharmaco-gen",
            nameFr: "Pharmacologie Générale",
            descriptionFr:
              "Pharmacocinétique (ADME), pharmacodynamie, interactions médicamenteuses et iatrogénie.",
            questionCount: 60,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y3-pharmaco-spec",
            nameFr: "Pharmacologie Spéciale",
            descriptionFr:
              "Antibiotiques, anti-inflammatoires, antalgiques, antihypertenseurs et psychotropes.",
            questionCount: 65,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y3-microbio",
        nameFr: "Microbiologie",
        modules: [
          {
            id: "mod-y3-bacteriologie",
            nameFr: "Bactériologie Médicale",
            descriptionFr:
              "Classification, pouvoir pathogène, diagnostic bactériologique et antibiogramme.",
            questionCount: 65,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y3-virologie",
            nameFr: "Virologie Médicale",
            descriptionFr:
              "Structure virale, cycles de réplication, diagnostic virologique et principales viroses.",
            questionCount: 50,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y3-mycologie",
            nameFr: "Mycologie & Parasitologie",
            descriptionFr:
              "Champignons pathogènes, parasites protozoaires et helminthes, cycles parasitaires.",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y3-anapath",
        nameFr: "Anatomie Pathologique",
        modules: [
          {
            id: "mod-y3-anapath",
            nameFr: "Anatomie Pathologique Générale",
            descriptionFr:
              "Inflammation, processus tumoral, nécrose, apoptose et pathologie vasculaire.",
            questionCount: 60,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y3-physiopath",
        nameFr: "Physiopathologie",
        modules: [
          {
            id: "mod-y3-physiopath",
            nameFr: "Physiopathologie des Grands Syndromes",
            descriptionFr:
              "Mécanismes physiopathologiques de l'insuffisance cardiaque, respiratoire, rénale et hépatique.",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y3-radio",
        nameFr: "Radiologie & Imagerie",
        modules: [
          {
            id: "mod-y3-radiologie",
            nameFr: "Radiologie & Imagerie Médicale",
            descriptionFr:
              "Principes de la radiologie standard, échographie, scanner, IRM et médecine nucléaire.",
            questionCount: 45,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y3-immuno-clinique",
        nameFr: "Immunologie Clinique",
        modules: [
          {
            id: "mod-y3-immuno-clin",
            nameFr: "Immunologie Clinique & Pathologique",
            descriptionFr:
              "Auto-immunité, déficits immunitaires, transplantation et immunothérapie.",
            questionCount: 45,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
    ],
  },
  {
    number: 4,
    label: "4ème Année Médecine",
    description:
      "Pathologie médicale — Cardiologie, Pneumologie, Gastro, Neurologie, Infectiologie",
    categories: [
      {
        id: "y4-cardio",
        nameFr: "Cardiologie",
        modules: [
          {
            id: "mod-y4-cardio-sca",
            nameFr: "Syndromes Coronariens Aigus (SCA)",
            descriptionFr:
              "SCA ST+ et ST-, prise en charge immédiate, troponine et reperfusion.",
            questionCount: 90,
            isFree: true,
            availableQuestionCount: 1,
          },
          {
            id: "mod-y4-cardio-ic",
            nameFr: "Insuffisance Cardiaque",
            descriptionFr:
              "Critères diagnostiques, classification NYHA, OAP et trithérapie/quadrithérapie.",
            questionCount: 85,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y4-cardio-hta",
            nameFr: "Hypertension Artérielle",
            descriptionFr:
              "HTA essentielle et secondaire, bilan étiologique et stratégies thérapeutiques.",
            questionCount: 60,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y4-cardio-valvulopathies",
            nameFr: "Valvulopathies",
            descriptionFr:
              "Rétrécissement et insuffisance aortique/mitrale, RAA et endocardite infectieuse.",
            questionCount: 70,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y4-cardio-tdr",
            nameFr: "Troubles du Rythme & de la Conduction",
            descriptionFr:
              "Fibrillation atriale, tachycardies, BAV, flutter et traitement antiarythmique.",
            questionCount: 75,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y4-pneumo",
        nameFr: "Pneumo-Phtisiologie",
        modules: [
          {
            id: "mod-y4-pneumo-asthme",
            nameFr: "Asthme & BPCO",
            descriptionFr:
              "Physiopathologie, classification GINA/GOLD, exacerbations et traitement de fond.",
            questionCount: 70,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y4-pneumo-infection",
            nameFr: "Pneumonies & Infections Respiratoires",
            descriptionFr:
              "PAC, pneumonie nosocomiale, abcès pulmonaire et pleurésies purulentes.",
            questionCount: 65,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y4-pneumo-tuberculose",
            nameFr: "Tuberculose Pulmonaire",
            descriptionFr:
              "Primo-infection, tuberculose maladie, BK, IDR et protocoles de traitement (2RHZE/4RH).",
            questionCount: 80,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y4-pneumo-cancer",
            nameFr: "Cancer Broncho-Pulmonaire",
            descriptionFr:
              "Types histologiques, staging TNM, syndrome de Pancoast-Tobias et options thérapeutiques.",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y4-pneumo-pleuresie",
            nameFr: "Épanchements Pleuraux & Pneumothorax",
            descriptionFr:
              "Transsudat vs exsudat, ponction pleurale, drainage et pneumothorax spontané.",
            questionCount: 50,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y4-gastro",
        nameFr: "Hépato-Gastro-Entérologie",
        modules: [
          {
            id: "mod-y4-gastro-ulcere",
            nameFr: "Ulcère Gastro-Duodénal & RGO",
            descriptionFr:
              "Helicobacter pylori, complications hémorragiques, perforation et traitement par IPP.",
            questionCount: 60,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y4-gastro-hepatite",
            nameFr: "Hépatites Virales & Cirrhose",
            descriptionFr:
              "HBV, HCV, cirrhose et ses complications (ascite, HTP, CHC) et transplantation.",
            questionCount: 75,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y4-gastro-mici",
            nameFr: "MICI & Troubles Fonctionnels",
            descriptionFr:
              "Maladie de Crohn, RCH, syndrome de l'intestin irritable et colopathie fonctionnelle.",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y4-gastro-pancreas",
            nameFr: "Pathologie Pancréatique & Biliaire",
            descriptionFr:
              "Pancréatite aiguë et chronique, lithiase biliaire et cholécystite.",
            questionCount: 50,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y4-neuro",
        nameFr: "Neurologie",
        modules: [
          {
            id: "mod-y4-neuro-avc",
            nameFr: "AVC Ischémiques & Hémorragiques",
            descriptionFr:
              "Territoires vasculaires, thrombolyse, thrombectomie et prévention secondaire.",
            questionCount: 80,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y4-neuro-epilepsie",
            nameFr: "Épilepsies & Céphalées",
            descriptionFr:
              "Classification des crises, EEG, état de mal épileptique, migraine et algies faciales.",
            questionCount: 65,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y4-neuro-sep",
            nameFr: "Sclérose en Plaques & Neuropathies",
            descriptionFr:
              "SEP, syndrome de Guillain-Barré, neuropathies périphériques et compression médullaire.",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y4-infectio",
        nameFr: "Maladies Infectieuses",
        modules: [
          {
            id: "mod-y4-infectio-meningite",
            nameFr: "Méningites & Méningo-Encéphalites",
            descriptionFr:
              "Méningites bactériennes, virales, tuberculeuse, PL et antibiothérapie de 1ère intention.",
            questionCount: 70,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y4-infectio-fievre",
            nameFr: "Fièvres & Syndromes Infectieux",
            descriptionFr:
              "Fièvre typhoïde, brucellose, paludisme, leptospirose et fièvre au retour de voyage.",
            questionCount: 65,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y4-infectio-vih",
            nameFr: "VIH/SIDA & Infections Opportunistes",
            descriptionFr:
              "Dépistage, classification OMS/CDC, prophylaxie et trithérapie antirétrovirale.",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y4-hemato",
        nameFr: "Onco-Hématologie",
        modules: [
          {
            id: "mod-y4-hemato-anemie",
            nameFr: "Anémies & Hémoglobinopathies",
            descriptionFr:
              "Anémies ferriprives, mégaloblastiques, hémolytiques, drépanocytose et thalassémie.",
            questionCount: 70,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y4-hemato-leucemie",
            nameFr: "Leucémies & Lymphomes",
            descriptionFr:
              "LAM, LAL, LLC, LMC, lymphome de Hodgkin et non hodgkinien, myélome multiple.",
            questionCount: 65,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y4-hemato-hemostase",
            nameFr: "Hémostase & Thromboses",
            descriptionFr:
              "Coagulation, CIVD, thrombopénies, anticoagulants et thrombophilies.",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
    ],
  },
  {
    number: 5,
    label: "5ème Année Médecine",
    description:
      "Pédiatrie, Gynécologie-Obstétrique, Orthopédie, Urologie, Psychiatrie",
    categories: [
      {
        id: "y5-ped",
        nameFr: "Pédiatrie & Néonatalogie",
        modules: [
          {
            id: "mod-y5-ped-neonat",
            nameFr: "Néonatalogie",
            descriptionFr:
              "Détresse respiratoire du nouveau-né, score de Silverman, prématurité et ictère néonatal.",
            questionCount: 65,
            isFree: true,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y5-ped-croissance",
            nameFr: "Croissance & Développement",
            descriptionFr:
              "Courbes de croissance, retard staturo-pondéral, puberté normale et pathologique.",
            questionCount: 50,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y5-ped-infectio",
            nameFr: "Infections Pédiatriques",
            descriptionFr:
              "Vaccination, rougeole, varicelle, coqueluche, bronchiolite et GEA du nourrisson.",
            questionCount: 70,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y5-ped-nutrition",
            nameFr: "Nutrition & Déshydratation",
            descriptionFr:
              "Malnutrition, déshydratation aiguë du nourrisson, SRO et alimentation du nourrisson.",
            questionCount: 50,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y5-ped-urgences",
            nameFr: "Urgences Pédiatriques",
            descriptionFr:
              "Convulsions fébriles, invagination intestinale, corps étrangers et intoxications.",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y5-gyneco",
        nameFr: "Gynécologie-Obstétrique",
        modules: [
          {
            id: "mod-y5-gyneco-grossesse",
            nameFr: "Grossesse Normale & Pathologique",
            descriptionFr:
              "Suivi de grossesse, HTA gravidique, pré-éclampsie, diabète gestationnel et RCIU.",
            questionCount: 75,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y5-gyneco-accouchement",
            nameFr: "Accouchement & Délivrance",
            descriptionFr:
              "Mécanisme de l'accouchement, partogramme, césarienne et hémorragie du post-partum.",
            questionCount: 60,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y5-gyneco-patho",
            nameFr: "Pathologies Gynécologiques",
            descriptionFr:
              "Fibrome utérin, endométriose, kyste ovarien, cancer du col et du sein.",
            questionCount: 65,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y5-gyneco-contraception",
            nameFr: "Contraception & Infertilité",
            descriptionFr:
              "Méthodes contraceptives, planning familial, bilan d'infertilité et PMA.",
            questionCount: 40,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y5-ortho",
        nameFr: "Orthopédie-Traumatologie",
        modules: [
          {
            id: "mod-y5-ortho-fractures",
            nameFr: "Fractures & Traumatismes",
            descriptionFr:
              "Fractures des membres, du bassin et du rachis, luxations et entorses.",
            questionCount: 70,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y5-ortho-rhumato",
            nameFr: "Rhumatologie",
            descriptionFr:
              "Polyarthrite rhumatoïde, arthrose, spondylarthrites, goutte et lupus.",
            questionCount: 65,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y5-ortho-reeducation",
            nameFr: "Médecine Physique & Rééducation",
            descriptionFr:
              "Principes de rééducation, appareillage, handicap moteur et réadaptation fonctionnelle.",
            questionCount: 35,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y5-uro-nephro",
        nameFr: "Urologie & Néphrologie",
        modules: [
          {
            id: "mod-y5-uro-lithiase",
            nameFr: "Urologie",
            descriptionFr:
              "Lithiase urinaire, HBP, cancer de la prostate, tumeurs rénales et infections urinaires.",
            questionCount: 65,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y5-nephro-ira",
            nameFr: "Néphrologie",
            descriptionFr:
              "IRA, IRC, glomérulonéphrites, syndrome néphrotique, dialyse et transplantation rénale.",
            questionCount: 70,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y5-psy",
        nameFr: "Psychiatrie & Santé Mentale",
        modules: [
          {
            id: "mod-y5-psy-troubles",
            nameFr: "Troubles Psychiatriques Majeurs",
            descriptionFr:
              "Schizophrénie, troubles bipolaires, dépression, troubles anxieux et addictions.",
            questionCount: 65,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y5-psy-urgences",
            nameFr: "Urgences Psychiatriques",
            descriptionFr:
              "Crise suicidaire, agitation aiguë, BDA, confusion mentale et cadre médico-légal.",
            questionCount: 45,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y5-endocrino",
        nameFr: "Endocrinologie & Métabolisme",
        modules: [
          {
            id: "mod-y5-endocrino-diabete",
            nameFr: "Diabète & Complications",
            descriptionFr:
              "DT1, DT2, complications aiguës (acidocétose, hypoglycémie), microangiopathie et macroangiopathie.",
            questionCount: 75,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y5-endocrino-thyroide",
            nameFr: "Pathologies Thyroïdiennes & Surrénaliennes",
            descriptionFr:
              "Hypo/hyperthyroïdie, nodules, cancer thyroïdien, insuffisance surrénale et Cushing.",
            questionCount: 60,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
    ],
  },
  {
    number: 6,
    label: "6ème Année Médecine",
    description:
      "Urgences, Réanimation, Médecine Légale, ORL, Ophtalmo, Dermato",
    categories: [
      {
        id: "y6-urg",
        nameFr: "Urgences & Réanimation",
        modules: [
          {
            id: "mod-y6-urg-choc",
            nameFr: "États de Choc",
            descriptionFr:
              "Choc septique, cardiogénique, hypovolémique et anaphylactique — remplissage et amines.",
            questionCount: 80,
            isFree: true,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y6-urg-coma",
            nameFr: "Comas & Altération de Conscience",
            descriptionFr:
              "Score de Glasgow, étiologies, prise en charge et ventilation mécanique.",
            questionCount: 65,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y6-urg-arret",
            nameFr: "Arrêt Cardiaque & Réanimation Cardio-Pulmonaire",
            descriptionFr:
              "Algorithme de l'ACR, CEE, adrénaline, amiodarone et hypothermie thérapeutique.",
            questionCount: 50,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y6-urg-intox",
            nameFr: "Intoxications Aiguës",
            descriptionFr:
              "Intoxications médicamenteuses, CO, organophosphorés, caustiques et antidotes.",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y6-med-legale",
        nameFr: "Médecine Légale & Déontologie",
        modules: [
          {
            id: "mod-y6-medleg",
            nameFr: "Médecine Légale & Droit Médical",
            descriptionFr:
              "Responsabilité médicale, certificats, thanatologie, blessures et expertise judiciaire.",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y6-deontologie",
            nameFr: "Déontologie & Éthique Médicale",
            descriptionFr:
              "Code de déontologie algérien, secret médical, consentement éclairé et fin de vie.",
            questionCount: 35,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y6-orl",
        nameFr: "ORL & Chirurgie Cervico-Faciale",
        modules: [
          {
            id: "mod-y6-orl",
            nameFr: "ORL Médicale & Chirurgicale",
            descriptionFr:
              "Otites, sinusites, angines, vertiges, surdité, dyspnée laryngée et cancers ORL.",
            questionCount: 60,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y6-ophtalmo",
        nameFr: "Ophtalmologie",
        modules: [
          {
            id: "mod-y6-ophtalmo",
            nameFr: "Ophtalmologie",
            descriptionFr:
              "Glaucome, cataracte, DMLA, rétinopathie diabétique, œil rouge et traumatismes oculaires.",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y6-dermato",
        nameFr: "Dermatologie",
        modules: [
          {
            id: "mod-y6-dermato",
            nameFr: "Dermatologie & Vénérologie",
            descriptionFr:
              "Eczéma, psoriasis, urticaire, toxidermies, infections cutanées et IST.",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y6-psy-med",
        nameFr: "Psychologie Médicale",
        modules: [
          {
            id: "mod-y6-psycho-med",
            nameFr: "Psychologie Médicale",
            descriptionFr:
              "Relation médecin-malade, annonce de mauvaise nouvelle, deuil et stress du soignant.",
            questionCount: 30,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y6-sante-pub",
        nameFr: "Santé Publique & Épidémiologie",
        modules: [
          {
            id: "mod-y6-sante-publique",
            nameFr: "Santé Publique & Système de Santé",
            descriptionFr:
              "Organisation du système de santé algérien, économie de santé, épidémiologie et prévention.",
            questionCount: 45,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y6-chirurgie",
        nameFr: "Chirurgie Générale",
        modules: [
          {
            id: "mod-y6-chir-abdominale",
            nameFr: "Chirurgie Abdominale & Digestive",
            descriptionFr:
              "Appendicite, hernies, occlusion intestinale, péritonite et chirurgie hépatobiliaire.",
            questionCount: 65,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y6-chir-traumato",
            nameFr: "Chirurgie Traumatologique & Orthopédique",
            descriptionFr:
              "Polytraumatisé, fractures ouvertes, ostéosynthèse et complications post-opératoires.",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
    ],
  },
  {
    number: 7,
    label: "7ème Année Médecine",
    description:
      "Stages internés, mise en situation de garde et conduite pratique",
    categories: [
      {
        id: "y7-internat",
        nameFr: "Pratique Clinique & Gestes d'Urgence",
        modules: [
          {
            id: "mod-y7-prescriptions",
            nameFr: "Prescriptions d'Urgence & Antibiothérapie Probabiliste",
            descriptionFr:
              "Protocoles de garde, adaptations rénales, antibiogramme et analgésie de palier 3.",
            questionCount: 60,
            isFree: true,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y7-gestes-techniques",
            nameFr: "Gestes Techniques & Procédures",
            descriptionFr:
              "Pose de VVP, sondage urinaire, ponction pleurale/lombaire/d'ascite et sutures.",
            questionCount: 45,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y7-gardes",
            nameFr: "Conduite à Tenir de Garde",
            descriptionFr:
              "CAT devant une douleur thoracique, abdominale, dyspnée, fièvre et hémorragie.",
            questionCount: 70,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y7-stages",
        nameFr: "Stages Hospitaliers",
        modules: [
          {
            id: "mod-y7-stage-medecine-interne",
            nameFr: "Stage de Médecine Interne",
            descriptionFr:
              "Maladies systémiques, lupus, vascularites, sarcoïdose et amylose.",
            questionCount: 55,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y7-stage-chirurgie",
            nameFr: "Stage de Chirurgie",
            descriptionFr:
              "Pré-opératoire, per-opératoire, post-opératoire et complications chirurgicales.",
            questionCount: 50,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
    ],
  },
  {
    number: 8,
    label: "Concours de Résidanat",
    description: "Banque d'annales classées & QCMs de haute sélectivité",
    badge: "Concours & Spécialités",
    categories: [
      {
        id: "y8-sciences-fond",
        nameFr: "Sciences Fondamentales (Résidanat)",
        modules: [
          {
            id: "mod-y8-anatomie-res",
            nameFr: "Anatomie — Programme Résidanat",
            descriptionFr:
              "Anatomie de tous les appareils : cardiovasculaire, digestif, respiratoire, neurologie, tête & cou.",
            questionCount: 120,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y8-biochimie-res",
            nameFr: "Biochimie — Programme Résidanat",
            descriptionFr:
              "Métabolisme des acides aminés, protéines, glucides, lipides, enzymologie et hormones.",
            questionCount: 80,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y8-physio-res",
            nameFr: "Physiologie — Programme Résidanat",
            descriptionFr:
              "Physiologie de tous les systèmes : cardiovasculaire, respiratoire, rénal, digestif et nerveux.",
            questionCount: 90,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y8-genetique-res",
            nameFr: "Génétique & Cytologie — Programme Résidanat",
            descriptionFr:
              "ADN, ARN, mutations, expression des gènes, chromosomopathies et conseil génétique.",
            questionCount: 60,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y8-clinique",
        nameFr: "Spécialités Cliniques (Résidanat)",
        modules: [
          {
            id: "mod-y8-medecine-interne-res",
            nameFr: "Médecine Interne & Maladies Systémiques",
            descriptionFr:
              "Lupus, vascularites, sarcoïdose, amylose et maladies auto-immunes systémiques.",
            questionCount: 70,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y8-chirurgie-res",
            nameFr: "Chirurgie Générale — Programme Résidanat",
            descriptionFr:
              "Abdomen aigu, chirurgie digestive, cancérologie chirurgicale et chirurgie d'urgence.",
            questionCount: 85,
            isFree: false,
            availableQuestionCount: 0,
          },
          {
            id: "mod-y8-pediatrie-res",
            nameFr: "Pédiatrie — Programme Résidanat",
            descriptionFr:
              "Néonatalogie, pathologies infectieuses, nutritionnelles, urgences pédiatriques.",
            questionCount: 75,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y8-annales",
        nameFr: "Annales Officielles du Résidanat",
        modules: [
          {
            id: "mod-y8-annales-recentes",
            nameFr: "Épreuves Classantes & Cas Cliniques 2020–2026",
            descriptionFr:
              "Sujets corrigés et commentés par les majors de promotion.",
            questionCount: 300,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
      {
        id: "y8-sante-pub-res",
        nameFr: "Santé Publique & Législation (Résidanat)",
        modules: [
          {
            id: "mod-y8-sante-publique-res",
            nameFr: "Santé Publique & Biostatistiques — Programme Résidanat",
            descriptionFr:
              "Organisation du système de santé algérien, économie de la santé, médecine légale et épidémiologie.",
            questionCount: 50,
            isFree: false,
            availableQuestionCount: 0,
          },
        ],
      },
    ],
  },
];
export const getYearData = (number: number) =>
  CURRICULUM_DATA.find((y) => y.number === number);
export function getModuleData(id: string) {
  for (const year of CURRICULUM_DATA)
    for (const category of year.categories) {
      const selected = category.modules.find((m) => m.id === id);
      if (selected) return { module: selected, year, category };
    }
}

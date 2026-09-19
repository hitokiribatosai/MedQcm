export interface OptionData {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionData {
  id: string;
  questionText: string;
  options: OptionData[];
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  source: string;
  isClinicalCase?: boolean;
}

export interface CoursePdf {
  id: string;
  moduleId: string;
  title: string;
  professor?: string;
  fileSize: string;
  pagesCount: number;
  pdfUrl?: string;
  uploadDate: string;
  isFree: boolean;
}

export interface ModuleData {
  id: string;
  nameFr: string;
  descriptionFr: string;
  questionCount: number;
  isFree: boolean;
  questions?: QuestionData[];
  documents?: CoursePdf[];
}

export interface CategoryData {
  id: string;
  nameFr: string;
  modules: ModuleData[];
}

export interface YearData {
  number: number;
  label: string;
  description: string;
  badge?: string;
  categories: CategoryData[];
}

// ──────────────────────────────────────────────────────────────────────────────
// PROGRAMME OFFICIEL DE MÉDECINE — ALGÉRIE (Nouveau Régime)
// Sources : Facultés de Médecine d'Alger, Oran, Constantine, Tlemcen, Sétif, Batna
// ──────────────────────────────────────────────────────────────────────────────

export const CURRICULUM_DATA: YearData[] = [
  // ════════════════════════════════════════════════════════════════════════════
  // 1ÈRE ANNÉE — SCIENCES FONDAMENTALES (Cycle Pré-clinique)
  // ════════════════════════════════════════════════════════════════════════════
  {
    number: 1,
    label: '1ère Année Médecine',
    description: 'Sciences fondamentales et bases morphologiques',
    categories: [
      {
        id: 'y1-anat',
        nameFr: 'Anatomie',
        modules: [
          {
            id: 'mod-y1-anat-general',
            nameFr: 'Anatomie Générale & Ostéologie',
            descriptionFr: 'Généralités sur le squelette, articulations, plans anatomiques et repères osseux cardinaux.',
            questionCount: 45,
            isFree: true,
            questions: [
              {
                id: 'q1',
                questionText: 'Concernant l\'ostéologie du membre supérieur, quelle affirmation est EXACTE ?',
                options: [
                  { id: 'opt1', text: 'La clavicule s\'articule médialement avec l\'acromion.', isCorrect: false },
                  { id: 'opt2', text: 'La gouttière bicipitale (sillon intertuberculaire) se situe à la face antérieure de l\'humérus.', isCorrect: true },
                  { id: 'opt3', text: 'L\'ulna s\'articule directement avec le condyle carpien.', isCorrect: false },
                  { id: 'opt4', text: 'L\'olécrane appartient à l\'extrémité supérieure du radius.', isCorrect: false },
                  { id: 'opt5', text: 'Le scaphoïde est le plus médial des os de la première rangée du carpe.', isCorrect: false },
                ],
                explanation: 'La gouttière bicipitale (ou sillon intertuberculaire) se situe bien entre le tubercule majeur et le tubercule mineur à la face antéro-supérieure de l\'humérus. Elle livre passage au tendon du chef long du biceps brachial.',
                difficulty: 'easy',
                source: 'Faculté de Médecine - Examen Blanc 2023',
              },
              {
                id: 'q2',
                questionText: 'Concernant l\'articulation scapulo-humérale, quelles propositions sont vraies ?',
                options: [
                  { id: 'opt21', text: 'C\'est une énarthrose (articulation sphéroïde) à 3 degrés de liberté.', isCorrect: true },
                  { id: 'opt22', text: 'Le bourrelet glénoïdien (labrum) diminue la congruence articulaire.', isCorrect: false },
                  { id: 'opt23', text: 'Le muscle supra-épineux est le principal initiateur de l\'abduction.', isCorrect: true },
                  { id: 'opt24', text: 'Le nerf axillaire contourne le col chirurgical de l\'humérus.', isCorrect: true },
                  { id: 'opt25', text: 'Le ligament coraco-huméral freine l\'adduction.', isCorrect: false },
                ],
                explanation: 'L\'articulation gléno-humérale est une sphéroïde très mobile. Le bourrelet augmente la congruence (et non la diminue). Le nerf axillaire cravate le col chirurgical, ce qui l\'expose aux fractures de cette région.',
                difficulty: 'medium',
                source: 'Concours de Médecine 2022',
              },
              {
                id: 'q3',
                questionText: 'Parmi les muscles suivants, lequel est innervé par le nerf musculo-cutané ?',
                options: [
                  { id: 'opt31', text: 'Muscle triceps brachial', isCorrect: false },
                  { id: 'opt32', text: 'Muscle brachial antérieur (m. brachialis)', isCorrect: true },
                  { id: 'opt33', text: 'Muscle deltoïde', isCorrect: false },
                  { id: 'opt34', text: 'Muscle rond pronateur', isCorrect: false },
                  { id: 'opt35', text: 'Muscle subscapulaire', isCorrect: false },
                ],
                explanation: 'Le nerf musculo-cutané innerve les trois muscles de la loge antérieure du bras : le coraco-brachial, le biceps brachial et le muscle brachial.',
                difficulty: 'easy',
                source: 'Anatomie - QCM Q/R',
              }
            ],
          },
          {
            id: 'mod-y1-anat-thorax',
            nameFr: 'Anatomie du Thorax & Médiastin',
            descriptionFr: 'Cœur, gros vaisseaux, plèvre, poumons et innervation autonome.',
            questionCount: 60,
            isFree: false,
          },
          {
            id: 'mod-y1-anat-abdomen',
            nameFr: 'Abdomen & Pelvis',
            descriptionFr: 'Péritoine, tube digestif, loges rétro-péritonéales et périnée.',
            questionCount: 80,
            isFree: false,
          },
          {
            id: 'mod-y1-anat-tete-cou',
            nameFr: 'Anatomie de la Tête & du Cou',
            descriptionFr: 'Crâne, face, fosses nasales, larynx, pharynx et nerfs crâniens.',
            questionCount: 70,
            isFree: false,
          },
          {
            id: 'mod-y1-anat-membres',
            nameFr: 'Anatomie des Membres',
            descriptionFr: 'Membre supérieur et inférieur : os, muscles, vascularisation et innervation.',
            questionCount: 65,
            isFree: false,
          }
        ]
      },
      {
        id: 'y1-cyto-histo',
        nameFr: 'Cytologie & Histologie',
        modules: [
          {
            id: 'mod-y1-cytologie',
            nameFr: 'Cytologie (Biologie Cellulaire)',
            descriptionFr: 'Membrane plasmique, organites cellulaires, noyau, cycle cellulaire et division (mitose/méiose).',
            questionCount: 55,
            isFree: false,
          },
          {
            id: 'mod-y1-histologie',
            nameFr: 'Histologie Générale',
            descriptionFr: 'Tissus épithéliaux, conjonctifs, musculaires et nerveux. Techniques histologiques.',
            questionCount: 50,
            isFree: false,
          }
        ]
      },
      {
        id: 'y1-embryo',
        nameFr: 'Embryologie',
        modules: [
          {
            id: 'mod-y1-embryo-gen',
            nameFr: 'Embryologie Générale',
            descriptionFr: 'Gamétogenèse, fécondation, segmentation, gastrulation et organogenèse précoce.',
            questionCount: 45,
            isFree: false,
          }
        ]
      },
      {
        id: 'y1-physio',
        nameFr: 'Physiologie',
        modules: [
          {
            id: 'mod-y1-physio-gen',
            nameFr: 'Physiologie Générale',
            descriptionFr: 'Physiologie membranaire, potentiels de repos et d\'action, pompe Na+/K+ et synapses.',
            questionCount: 50,
            isFree: false,
          },
          {
            id: 'mod-y1-physio-musculaire',
            nameFr: 'Physiologie du Muscle Squelettique',
            descriptionFr: 'Couplage excitation-contraction, sarcomère et métabolisme énergétique.',
            questionCount: 40,
            isFree: false,
          }
        ]
      },
      {
        id: 'y1-chimie',
        nameFr: 'Chimie & Biochimie',
        modules: [
          {
            id: 'mod-y1-chimie-gen',
            nameFr: 'Chimie Générale & Organique',
            descriptionFr: 'Atomistique, liaisons chimiques, thermodynamique, chimie organique et fonctions chimiques.',
            questionCount: 50,
            isFree: false,
          },
          {
            id: 'mod-y1-biochimie-struct',
            nameFr: 'Biochimie Structurale',
            descriptionFr: 'Structure des glucides, lipides, protéines et acides nucléiques.',
            questionCount: 55,
            isFree: false,
          }
        ]
      },
      {
        id: 'y1-biophys',
        nameFr: 'Physique & Biophysique',
        modules: [
          {
            id: 'mod-y1-biophysique',
            nameFr: 'Biophysique Médicale',
            descriptionFr: 'Propriétés des solutions, pH et tampons, radiations ionisantes et non ionisantes, optique médicale.',
            questionCount: 45,
            isFree: false,
          }
        ]
      },
      {
        id: 'y1-biostats',
        nameFr: 'Biostatistiques',
        modules: [
          {
            id: 'mod-y1-biostat',
            nameFr: 'Biostatistiques & Informatique Médicale',
            descriptionFr: 'Statistiques descriptives, probabilités, tests d\'hypothèse et introduction à l\'informatique médicale.',
            questionCount: 35,
            isFree: false,
          }
        ]
      },
      {
        id: 'y1-ssh',
        nameFr: 'Sciences Humaines & Sociales',
        modules: [
          {
            id: 'mod-y1-ssh',
            nameFr: 'Santé, Société & Humanité',
            descriptionFr: 'Histoire de la médecine, éthique médicale, déontologie et communication avec le patient.',
            questionCount: 25,
            isFree: false,
          }
        ]
      }
    ]
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 2ÈME ANNÉE — SYSTÈMES & BIOCHIMIE MÉTABOLIQUE
  // ════════════════════════════════════════════════════════════════════════════
  {
    number: 2,
    label: '2ème Année Médecine',
    description: 'Physiologie des grands systèmes, génétique et immunologie',
    categories: [
      {
        id: 'y2-immuno-genet',
        nameFr: 'Immunologie & Génétique',
        modules: [
          {
            id: 'mod-y2-immunologie',
            nameFr: 'Immunologie Fondamentale',
            descriptionFr: 'Immunité innée et adaptative, cellules immunitaires, anticorps, CMH et réactions d\'hypersensibilité.',
            questionCount: 60,
            isFree: true,
          },
          {
            id: 'mod-y2-genetique',
            nameFr: 'Génétique Médicale',
            descriptionFr: 'ADN, ARN, expression des gènes, mutations, hérédité mendélienne et chromosomopathies.',
            questionCount: 55,
            isFree: false,
          }
        ]
      },
      {
        id: 'y2-endocrinien-genital',
        nameFr: 'Appareil Endocrinien & Génital',
        modules: [
          {
            id: 'mod-y2-endocrinien',
            nameFr: 'Système Endocrinien',
            descriptionFr: 'Axe hypothalamo-hypophysaire, thyroïde, surrénales, pancréas endocrine et hormones sexuelles.',
            questionCount: 55,
            isFree: false,
          },
          {
            id: 'mod-y2-app-genital',
            nameFr: 'Appareil Génital',
            descriptionFr: 'Anatomie et physiologie des appareils génitaux masculin et féminin, cycle menstruel.',
            questionCount: 50,
            isFree: false,
          }
        ]
      },
      {
        id: 'y2-digestif',
        nameFr: 'Appareil Digestif',
        modules: [
          {
            id: 'mod-y2-digestif',
            nameFr: 'Appareil Digestif',
            descriptionFr: 'Anatomie, histologie et physiologie du tube digestif, foie, pancréas exocrine et péritoine.',
            questionCount: 65,
            isFree: false,
          }
        ]
      },
      {
        id: 'y2-urinaire',
        nameFr: 'Appareil Urinaire',
        modules: [
          {
            id: 'mod-y2-urinaire',
            nameFr: 'Appareil Urinaire & Rein',
            descriptionFr: 'Anatomie rénale, néphron, filtration glomérulaire, équilibre acido-basique et voies urinaires.',
            questionCount: 55,
            isFree: false,
          }
        ]
      },
      {
        id: 'y2-cardio-resp',
        nameFr: 'Appareil Cardio-Respiratoire',
        modules: [
          {
            id: 'mod-y2-cardio',
            nameFr: 'Physiologie Cardiovasculaire',
            descriptionFr: 'Cycle cardiaque, hémodynamique, courbes de pression, ECG de base et régulation de la PA.',
            questionCount: 55,
            isFree: false,
            questions: [
              {
                id: 'q2-1',
                questionText: 'Concernant la contraction isovolumétrique ventriculaire, quelle affirmation est VRAIE ?',
                options: [
                  { id: 'o1', text: 'Elle débute à l\'ouverture des valves sigmoïdes.', isCorrect: false },
                  { id: 'o2', text: 'Toutes les valves cardiaques sont fermées pendant cette phase.', isCorrect: true },
                  { id: 'o3', text: 'Le volume ventriculaire diminue rapidement.', isCorrect: false },
                  { id: 'o4', text: 'Elle correspond à l\'onde T sur le tracé ECG.', isCorrect: false },
                  { id: 'o5', text: 'La pression ventriculaire reste inférieure à la pression atriale.', isCorrect: false },
                ],
                explanation: 'Durant la phase de contraction isovolumétrique, les valves atrio-ventriculaires sont fermées (B1) et les valves sigmoïdes ne sont pas encore ouvertes. Le volume de sang intraventriculaire reste donc constant tandis que la pression grimpe en flèche.',
                difficulty: 'medium',
                source: 'Physiologie Médicale - Annales',
              }
            ]
          },
          {
            id: 'mod-y2-respiratoire',
            nameFr: 'Physiologie Respiratoire',
            descriptionFr: 'Mécanique ventilatoire, échanges gazeux alvéolaires, transport O2/CO2 et régulation.',
            questionCount: 50,
            isFree: false,
          }
        ]
      },
      {
        id: 'y2-neuro-sensitif',
        nameFr: 'Appareil Neuro-Sensitif',
        modules: [
          {
            id: 'mod-y2-neuro',
            nameFr: 'Système Nerveux Central & Périphérique',
            descriptionFr: 'Anatomie et physiologie du SNC, moelle épinière, tronc cérébral, cortex et nerfs crâniens.',
            questionCount: 70,
            isFree: false,
          },
          {
            id: 'mod-y2-organes-sens',
            nameFr: 'Organes des Sens',
            descriptionFr: 'Œil et vision, oreille et audition, goût, odorat et sensibilité somatique.',
            questionCount: 45,
            isFree: false,
          }
        ]
      },
      {
        id: 'y2-biochimie-metab',
        nameFr: 'Biochimie Métabolique',
        modules: [
          {
            id: 'mod-y2-biochimie-metab',
            nameFr: 'Biochimie Métabolique',
            descriptionFr: 'Métabolisme des glucides, lipides, acides aminés, enzymologie et bioénergétique.',
            questionCount: 60,
            isFree: false,
          }
        ]
      },
      {
        id: 'y2-histo-special',
        nameFr: 'Histologie Spéciale',
        modules: [
          {
            id: 'mod-y2-histo-special',
            nameFr: 'Histologie des Appareils & Organes',
            descriptionFr: 'Histologie du cœur, poumon, rein, foie, tube digestif, glandes endocrines et gonades.',
            questionCount: 50,
            isFree: false,
          }
        ]
      },
      {
        id: 'y2-embryo-special',
        nameFr: 'Embryologie Spéciale',
        modules: [
          {
            id: 'mod-y2-embryo-special',
            nameFr: 'Embryologie Spéciale des Appareils',
            descriptionFr: 'Développement embryonnaire de chaque appareil : cœur, appareil digestif, urogénital, nerveux.',
            questionCount: 45,
            isFree: false,
          }
        ]
      }
    ]
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 3ÈME ANNÉE — SÉMIOLOGIE, PHARMACOLOGIE & PATHOLOGIE GÉNÉRALE
  // ════════════════════════════════════════════════════════════════════════════
  {
    number: 3,
    label: '3ème Année Médecine',
    description: 'Sémiologie clinique, pharmacologie et sciences pathologiques',
    categories: [
      {
        id: 'y3-semio',
        nameFr: 'Sémiologie Médicale',
        modules: [
          {
            id: 'mod-y3-semio-cardio',
            nameFr: 'Sémiologie Cardiovasculaire',
            descriptionFr: 'Souffles cardiaques, insuffisance cardiaque, signes d\'ischémie et œdèmes.',
            questionCount: 75,
            isFree: true,
            questions: [
              {
                id: 'q3-1',
                questionText: 'Quel souffle cardiaque est typiquement un souffle méso-systolique éjectionnel irradiant aux carotides ?',
                options: [
                  { id: 'os1', text: 'Insuffisance mitrale', isCorrect: false },
                  { id: 'os2', text: 'Rétrécissement aortique (sténose aortique)', isCorrect: true },
                  { id: 'os3', text: 'Insuffisance aortique', isCorrect: false },
                  { id: 'os4', text: 'Rétrécissement mitral (roulement de Duroziez)', isCorrect: false },
                  { id: 'os5', text: 'Persistance du canal artériel', isCorrect: false },
                ],
                explanation: 'Le souffle de rétrécissement aortique est typiquement rude, râpeux, méso-systolique (losangique), maximum au foyer aortique (2e EIC droit) et irradiant vers les vaisseaux du cou (carotides).',
                difficulty: 'easy',
                source: 'Sémiologie Clinique 2024',
              }
            ]
          },
          {
            id: 'mod-y3-semio-pneumo',
            nameFr: 'Sémiologie Respiratoire',
            descriptionFr: 'Syndrome de condensation, épanchements pleuraux et râles auscultatoires.',
            questionCount: 70,
            isFree: false,
          },
          {
            id: 'mod-y3-semio-digestive',
            nameFr: 'Sémiologie Digestive',
            descriptionFr: 'Examen de l\'abdomen, ictère, ascite, hépatomégalie et toucher rectal.',
            questionCount: 65,
            isFree: false,
          },
          {
            id: 'mod-y3-semio-nephro',
            nameFr: 'Sémiologie Néphro-Urologique',
            descriptionFr: 'Œdèmes, protéinurie, hématurie, syndromes glomérulaires et insuffisance rénale.',
            questionCount: 55,
            isFree: false,
          },
          {
            id: 'mod-y3-semio-neuro',
            nameFr: 'Sémiologie Neurologique',
            descriptionFr: 'Examen neurologique, déficits moteurs/sensitifs, réflexes et syndromes neurologiques.',
            questionCount: 70,
            isFree: false,
          },
          {
            id: 'mod-y3-semio-endoc',
            nameFr: 'Sémiologie Endocrinienne',
            descriptionFr: 'Goitre, signes de dysthyroïdie, diabète et syndrome de Cushing.',
            questionCount: 45,
            isFree: false,
          }
        ]
      },
      {
        id: 'y3-pharmaco',
        nameFr: 'Pharmacologie',
        modules: [
          {
            id: 'mod-y3-pharmaco-gen',
            nameFr: 'Pharmacologie Générale',
            descriptionFr: 'Pharmacocinétique (ADME), pharmacodynamie, interactions médicamenteuses et iatrogénie.',
            questionCount: 60,
            isFree: false,
          },
          {
            id: 'mod-y3-pharmaco-spec',
            nameFr: 'Pharmacologie Spéciale',
            descriptionFr: 'Antibiotiques, anti-inflammatoires, antalgiques, antihypertenseurs et psychotropes.',
            questionCount: 65,
            isFree: false,
          }
        ]
      },
      {
        id: 'y3-microbio',
        nameFr: 'Microbiologie',
        modules: [
          {
            id: 'mod-y3-bacteriologie',
            nameFr: 'Bactériologie Médicale',
            descriptionFr: 'Classification, pouvoir pathogène, diagnostic bactériologique et antibiogramme.',
            questionCount: 65,
            isFree: false,
          },
          {
            id: 'mod-y3-virologie',
            nameFr: 'Virologie Médicale',
            descriptionFr: 'Structure virale, cycles de réplication, diagnostic virologique et principales viroses.',
            questionCount: 50,
            isFree: false,
          },
          {
            id: 'mod-y3-mycologie',
            nameFr: 'Mycologie & Parasitologie',
            descriptionFr: 'Champignons pathogènes, parasites protozoaires et helminthes, cycles parasitaires.',
            questionCount: 55,
            isFree: false,
          }
        ]
      },
      {
        id: 'y3-anapath',
        nameFr: 'Anatomie Pathologique',
        modules: [
          {
            id: 'mod-y3-anapath',
            nameFr: 'Anatomie Pathologique Générale',
            descriptionFr: 'Inflammation, processus tumoral, nécrose, apoptose et pathologie vasculaire.',
            questionCount: 60,
            isFree: false,
          }
        ]
      },
      {
        id: 'y3-physiopath',
        nameFr: 'Physiopathologie',
        modules: [
          {
            id: 'mod-y3-physiopath',
            nameFr: 'Physiopathologie des Grands Syndromes',
            descriptionFr: 'Mécanismes physiopathologiques de l\'insuffisance cardiaque, respiratoire, rénale et hépatique.',
            questionCount: 55,
            isFree: false,
          }
        ]
      },
      {
        id: 'y3-radio',
        nameFr: 'Radiologie & Imagerie',
        modules: [
          {
            id: 'mod-y3-radiologie',
            nameFr: 'Radiologie & Imagerie Médicale',
            descriptionFr: 'Principes de la radiologie standard, échographie, scanner, IRM et médecine nucléaire.',
            questionCount: 45,
            isFree: false,
          }
        ]
      },
      {
        id: 'y3-immuno-clinique',
        nameFr: 'Immunologie Clinique',
        modules: [
          {
            id: 'mod-y3-immuno-clin',
            nameFr: 'Immunologie Clinique & Pathologique',
            descriptionFr: 'Auto-immunité, déficits immunitaires, transplantation et immunothérapie.',
            questionCount: 45,
            isFree: false,
          }
        ]
      }
    ]
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 4ÈME ANNÉE — DÉBUT DU CYCLE CLINIQUE (Externat)
  // ════════════════════════════════════════════════════════════════════════════
  {
    number: 4,
    label: '4ème Année Médecine',
    description: 'Pathologie médicale — Cardiologie, Pneumologie, Gastro, Neurologie, Infectiologie',
    categories: [
      {
        id: 'y4-cardio',
        nameFr: 'Cardiologie',
        modules: [
          {
            id: 'mod-y4-cardio-sca',
            nameFr: 'Syndromes Coronariens Aigus (SCA)',
            descriptionFr: 'SCA ST+ et ST-, prise en charge immédiate, troponine et reperfusion.',
            questionCount: 90,
            isFree: true,
            questions: [
              {
                id: 'q4-1',
                questionText: 'Chez un patient de 58 ans présentant une douleur rétrosternale constrictive depuis 45 min avec sus-décalage de ST en DII, DIII, aVF, quel traitement d\'urgence est CONTRE-INDIQUÉ ?',
                options: [
                  { id: 'ot1', text: 'Aspirine par voie intraveineuse', isCorrect: false },
                  { id: 'ot2', text: 'Dérivés nitrés en cas d\'extension au ventricule droit avec hypotension', isCorrect: true },
                  { id: 'ot3', text: 'Héparine non fractionnée ou HBPM', isCorrect: false },
                  { id: 'ot4', text: 'Inhibiteur de P2Y12 (Ticagrélor ou Prasugrel)', isCorrect: false },
                  { id: 'ot5', text: 'Angioplastie coronaire primaire en urgence', isCorrect: false },
                ],
                explanation: 'En cas d\'infarctus du myocarde inférieur avec extension au ventricule droit (V4R+), le débit cardiaque dépend strictement de la précharge ventriculaire droite. Les dérivés nitrés entraînent un effondrement de la précharge et une hypotension sévère réfractaire.',
                difficulty: 'hard',
                source: 'Cardiologie ECN / Résidanat',
                isClinicalCase: true,
              }
            ]
          },
          {
            id: 'mod-y4-cardio-ic',
            nameFr: 'Insuffisance Cardiaque',
            descriptionFr: 'Critères diagnostiques, classification NYHA, OAP et trithérapie/quadrithérapie.',
            questionCount: 85,
            isFree: false,
          },
          {
            id: 'mod-y4-cardio-hta',
            nameFr: 'Hypertension Artérielle',
            descriptionFr: 'HTA essentielle et secondaire, bilan étiologique et stratégies thérapeutiques.',
            questionCount: 60,
            isFree: false,
          },
          {
            id: 'mod-y4-cardio-valvulopathies',
            nameFr: 'Valvulopathies',
            descriptionFr: 'Rétrécissement et insuffisance aortique/mitrale, RAA et endocardite infectieuse.',
            questionCount: 70,
            isFree: false,
          },
          {
            id: 'mod-y4-cardio-tdr',
            nameFr: 'Troubles du Rythme & de la Conduction',
            descriptionFr: 'Fibrillation atriale, tachycardies, BAV, flutter et traitement antiarythmique.',
            questionCount: 75,
            isFree: false,
          }
        ]
      },
      {
        id: 'y4-pneumo',
        nameFr: 'Pneumo-Phtisiologie',
        modules: [
          {
            id: 'mod-y4-pneumo-asthme',
            nameFr: 'Asthme & BPCO',
            descriptionFr: 'Physiopathologie, classification GINA/GOLD, exacerbations et traitement de fond.',
            questionCount: 70,
            isFree: false,
          },
          {
            id: 'mod-y4-pneumo-infection',
            nameFr: 'Pneumonies & Infections Respiratoires',
            descriptionFr: 'PAC, pneumonie nosocomiale, abcès pulmonaire et pleurésies purulentes.',
            questionCount: 65,
            isFree: false,
          },
          {
            id: 'mod-y4-pneumo-tuberculose',
            nameFr: 'Tuberculose Pulmonaire',
            descriptionFr: 'Primo-infection, tuberculose maladie, BK, IDR et protocoles de traitement (2RHZE/4RH).',
            questionCount: 80,
            isFree: false,
          },
          {
            id: 'mod-y4-pneumo-cancer',
            nameFr: 'Cancer Broncho-Pulmonaire',
            descriptionFr: 'Types histologiques, staging TNM, syndrome de Pancoast-Tobias et options thérapeutiques.',
            questionCount: 55,
            isFree: false,
          },
          {
            id: 'mod-y4-pneumo-pleuresie',
            nameFr: 'Épanchements Pleuraux & Pneumothorax',
            descriptionFr: 'Transsudat vs exsudat, ponction pleurale, drainage et pneumothorax spontané.',
            questionCount: 50,
            isFree: false,
          }
        ]
      },
      {
        id: 'y4-gastro',
        nameFr: 'Hépato-Gastro-Entérologie',
        modules: [
          {
            id: 'mod-y4-gastro-ulcere',
            nameFr: 'Ulcère Gastro-Duodénal & RGO',
            descriptionFr: 'Helicobacter pylori, complications hémorragiques, perforation et traitement par IPP.',
            questionCount: 60,
            isFree: false,
          },
          {
            id: 'mod-y4-gastro-hepatite',
            nameFr: 'Hépatites Virales & Cirrhose',
            descriptionFr: 'HBV, HCV, cirrhose et ses complications (ascite, HTP, CHC) et transplantation.',
            questionCount: 75,
            isFree: false,
          },
          {
            id: 'mod-y4-gastro-mici',
            nameFr: 'MICI & Troubles Fonctionnels',
            descriptionFr: 'Maladie de Crohn, RCH, syndrome de l\'intestin irritable et colopathie fonctionnelle.',
            questionCount: 55,
            isFree: false,
          },
          {
            id: 'mod-y4-gastro-pancreas',
            nameFr: 'Pathologie Pancréatique & Biliaire',
            descriptionFr: 'Pancréatite aiguë et chronique, lithiase biliaire et cholécystite.',
            questionCount: 50,
            isFree: false,
          }
        ]
      },
      {
        id: 'y4-neuro',
        nameFr: 'Neurologie',
        modules: [
          {
            id: 'mod-y4-neuro-avc',
            nameFr: 'AVC Ischémiques & Hémorragiques',
            descriptionFr: 'Territoires vasculaires, thrombolyse, thrombectomie et prévention secondaire.',
            questionCount: 80,
            isFree: false,
          },
          {
            id: 'mod-y4-neuro-epilepsie',
            nameFr: 'Épilepsies & Céphalées',
            descriptionFr: 'Classification des crises, EEG, état de mal épileptique, migraine et algies faciales.',
            questionCount: 65,
            isFree: false,
          },
          {
            id: 'mod-y4-neuro-sep',
            nameFr: 'Sclérose en Plaques & Neuropathies',
            descriptionFr: 'SEP, syndrome de Guillain-Barré, neuropathies périphériques et compression médullaire.',
            questionCount: 55,
            isFree: false,
          }
        ]
      },
      {
        id: 'y4-infectio',
        nameFr: 'Maladies Infectieuses',
        modules: [
          {
            id: 'mod-y4-infectio-meningite',
            nameFr: 'Méningites & Méningo-Encéphalites',
            descriptionFr: 'Méningites bactériennes, virales, tuberculeuse, PL et antibiothérapie de 1ère intention.',
            questionCount: 70,
            isFree: false,
          },
          {
            id: 'mod-y4-infectio-fievre',
            nameFr: 'Fièvres & Syndromes Infectieux',
            descriptionFr: 'Fièvre typhoïde, brucellose, paludisme, leptospirose et fièvre au retour de voyage.',
            questionCount: 65,
            isFree: false,
          },
          {
            id: 'mod-y4-infectio-vih',
            nameFr: 'VIH/SIDA & Infections Opportunistes',
            descriptionFr: 'Dépistage, classification OMS/CDC, prophylaxie et trithérapie antirétrovirale.',
            questionCount: 55,
            isFree: false,
          }
        ]
      },
      {
        id: 'y4-hemato',
        nameFr: 'Onco-Hématologie',
        modules: [
          {
            id: 'mod-y4-hemato-anemie',
            nameFr: 'Anémies & Hémoglobinopathies',
            descriptionFr: 'Anémies ferriprives, mégaloblastiques, hémolytiques, drépanocytose et thalassémie.',
            questionCount: 70,
            isFree: false,
          },
          {
            id: 'mod-y4-hemato-leucemie',
            nameFr: 'Leucémies & Lymphomes',
            descriptionFr: 'LAM, LAL, LLC, LMC, lymphome de Hodgkin et non hodgkinien, myélome multiple.',
            questionCount: 65,
            isFree: false,
          },
          {
            id: 'mod-y4-hemato-hemostase',
            nameFr: 'Hémostase & Thromboses',
            descriptionFr: 'Coagulation, CIVD, thrombopénies, anticoagulants et thrombophilies.',
            questionCount: 55,
            isFree: false,
          }
        ]
      }
    ]
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 5ÈME ANNÉE — SPÉCIALITÉS CLINIQUES MAJEURES
  // ════════════════════════════════════════════════════════════════════════════
  {
    number: 5,
    label: '5ème Année Médecine',
    description: 'Pédiatrie, Gynécologie-Obstétrique, Orthopédie, Urologie, Psychiatrie',
    categories: [
      {
        id: 'y5-ped',
        nameFr: 'Pédiatrie & Néonatalogie',
        modules: [
          {
            id: 'mod-y5-ped-neonat',
            nameFr: 'Néonatalogie',
            descriptionFr: 'Détresse respiratoire du nouveau-né, score de Silverman, prématurité et ictère néonatal.',
            questionCount: 65,
            isFree: true,
          },
          {
            id: 'mod-y5-ped-croissance',
            nameFr: 'Croissance & Développement',
            descriptionFr: 'Courbes de croissance, retard staturo-pondéral, puberté normale et pathologique.',
            questionCount: 50,
            isFree: false,
          },
          {
            id: 'mod-y5-ped-infectio',
            nameFr: 'Infections Pédiatriques',
            descriptionFr: 'Vaccination, rougeole, varicelle, coqueluche, bronchiolite et GEA du nourrisson.',
            questionCount: 70,
            isFree: false,
          },
          {
            id: 'mod-y5-ped-nutrition',
            nameFr: 'Nutrition & Déshydratation',
            descriptionFr: 'Malnutrition, déshydratation aiguë du nourrisson, SRO et alimentation du nourrisson.',
            questionCount: 50,
            isFree: false,
          },
          {
            id: 'mod-y5-ped-urgences',
            nameFr: 'Urgences Pédiatriques',
            descriptionFr: 'Convulsions fébriles, invagination intestinale, corps étrangers et intoxications.',
            questionCount: 55,
            isFree: false,
          }
        ]
      },
      {
        id: 'y5-gyneco',
        nameFr: 'Gynécologie-Obstétrique',
        modules: [
          {
            id: 'mod-y5-gyneco-grossesse',
            nameFr: 'Grossesse Normale & Pathologique',
            descriptionFr: 'Suivi de grossesse, HTA gravidique, pré-éclampsie, diabète gestationnel et RCIU.',
            questionCount: 75,
            isFree: false,
          },
          {
            id: 'mod-y5-gyneco-accouchement',
            nameFr: 'Accouchement & Délivrance',
            descriptionFr: 'Mécanisme de l\'accouchement, partogramme, césarienne et hémorragie du post-partum.',
            questionCount: 60,
            isFree: false,
          },
          {
            id: 'mod-y5-gyneco-patho',
            nameFr: 'Pathologies Gynécologiques',
            descriptionFr: 'Fibrome utérin, endométriose, kyste ovarien, cancer du col et du sein.',
            questionCount: 65,
            isFree: false,
          },
          {
            id: 'mod-y5-gyneco-contraception',
            nameFr: 'Contraception & Infertilité',
            descriptionFr: 'Méthodes contraceptives, planning familial, bilan d\'infertilité et PMA.',
            questionCount: 40,
            isFree: false,
          }
        ]
      },
      {
        id: 'y5-ortho',
        nameFr: 'Orthopédie-Traumatologie',
        modules: [
          {
            id: 'mod-y5-ortho-fractures',
            nameFr: 'Fractures & Traumatismes',
            descriptionFr: 'Fractures des membres, du bassin et du rachis, luxations et entorses.',
            questionCount: 70,
            isFree: false,
          },
          {
            id: 'mod-y5-ortho-rhumato',
            nameFr: 'Rhumatologie',
            descriptionFr: 'Polyarthrite rhumatoïde, arthrose, spondylarthrites, goutte et lupus.',
            questionCount: 65,
            isFree: false,
          },
          {
            id: 'mod-y5-ortho-reeducation',
            nameFr: 'Médecine Physique & Rééducation',
            descriptionFr: 'Principes de rééducation, appareillage, handicap moteur et réadaptation fonctionnelle.',
            questionCount: 35,
            isFree: false,
          }
        ]
      },
      {
        id: 'y5-uro-nephro',
        nameFr: 'Urologie & Néphrologie',
        modules: [
          {
            id: 'mod-y5-uro-lithiase',
            nameFr: 'Urologie',
            descriptionFr: 'Lithiase urinaire, HBP, cancer de la prostate, tumeurs rénales et infections urinaires.',
            questionCount: 65,
            isFree: false,
          },
          {
            id: 'mod-y5-nephro-ira',
            nameFr: 'Néphrologie',
            descriptionFr: 'IRA, IRC, glomérulonéphrites, syndrome néphrotique, dialyse et transplantation rénale.',
            questionCount: 70,
            isFree: false,
          }
        ]
      },
      {
        id: 'y5-psy',
        nameFr: 'Psychiatrie & Santé Mentale',
        modules: [
          {
            id: 'mod-y5-psy-troubles',
            nameFr: 'Troubles Psychiatriques Majeurs',
            descriptionFr: 'Schizophrénie, troubles bipolaires, dépression, troubles anxieux et addictions.',
            questionCount: 65,
            isFree: false,
          },
          {
            id: 'mod-y5-psy-urgences',
            nameFr: 'Urgences Psychiatriques',
            descriptionFr: 'Crise suicidaire, agitation aiguë, BDA, confusion mentale et cadre médico-légal.',
            questionCount: 45,
            isFree: false,
          }
        ]
      },
      {
        id: 'y5-endocrino',
        nameFr: 'Endocrinologie & Métabolisme',
        modules: [
          {
            id: 'mod-y5-endocrino-diabete',
            nameFr: 'Diabète & Complications',
            descriptionFr: 'DT1, DT2, complications aiguës (acidocétose, hypoglycémie), microangiopathie et macroangiopathie.',
            questionCount: 75,
            isFree: false,
          },
          {
            id: 'mod-y5-endocrino-thyroide',
            nameFr: 'Pathologies Thyroïdiennes & Surrénaliennes',
            descriptionFr: 'Hypo/hyperthyroïdie, nodules, cancer thyroïdien, insuffisance surrénale et Cushing.',
            questionCount: 60,
            isFree: false,
          }
        ]
      }
    ]
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 6ÈME ANNÉE — URGENCES, MÉDECINE LÉGALE & SYNTHÈSE CLINIQUE
  // ════════════════════════════════════════════════════════════════════════════
  {
    number: 6,
    label: '6ème Année Médecine',
    description: 'Urgences, Réanimation, Médecine Légale, ORL, Ophtalmo, Dermato',
    categories: [
      {
        id: 'y6-urg',
        nameFr: 'Urgences & Réanimation',
        modules: [
          {
            id: 'mod-y6-urg-choc',
            nameFr: 'États de Choc',
            descriptionFr: 'Choc septique, cardiogénique, hypovolémique et anaphylactique — remplissage et amines.',
            questionCount: 80,
            isFree: true,
          },
          {
            id: 'mod-y6-urg-coma',
            nameFr: 'Comas & Altération de Conscience',
            descriptionFr: 'Score de Glasgow, étiologies, prise en charge et ventilation mécanique.',
            questionCount: 65,
            isFree: false,
          },
          {
            id: 'mod-y6-urg-arret',
            nameFr: 'Arrêt Cardiaque & Réanimation Cardio-Pulmonaire',
            descriptionFr: 'Algorithme de l\'ACR, CEE, adrénaline, amiodarone et hypothermie thérapeutique.',
            questionCount: 50,
            isFree: false,
          },
          {
            id: 'mod-y6-urg-intox',
            nameFr: 'Intoxications Aiguës',
            descriptionFr: 'Intoxications médicamenteuses, CO, organophosphorés, caustiques et antidotes.',
            questionCount: 55,
            isFree: false,
          }
        ]
      },
      {
        id: 'y6-med-legale',
        nameFr: 'Médecine Légale & Déontologie',
        modules: [
          {
            id: 'mod-y6-medleg',
            nameFr: 'Médecine Légale & Droit Médical',
            descriptionFr: 'Responsabilité médicale, certificats, thanatologie, blessures et expertise judiciaire.',
            questionCount: 55,
            isFree: false,
          },
          {
            id: 'mod-y6-deontologie',
            nameFr: 'Déontologie & Éthique Médicale',
            descriptionFr: 'Code de déontologie algérien, secret médical, consentement éclairé et fin de vie.',
            questionCount: 35,
            isFree: false,
          }
        ]
      },
      {
        id: 'y6-orl',
        nameFr: 'ORL & Chirurgie Cervico-Faciale',
        modules: [
          {
            id: 'mod-y6-orl',
            nameFr: 'ORL Médicale & Chirurgicale',
            descriptionFr: 'Otites, sinusites, angines, vertiges, surdité, dyspnée laryngée et cancers ORL.',
            questionCount: 60,
            isFree: false,
          }
        ]
      },
      {
        id: 'y6-ophtalmo',
        nameFr: 'Ophtalmologie',
        modules: [
          {
            id: 'mod-y6-ophtalmo',
            nameFr: 'Ophtalmologie',
            descriptionFr: 'Glaucome, cataracte, DMLA, rétinopathie diabétique, œil rouge et traumatismes oculaires.',
            questionCount: 55,
            isFree: false,
          }
        ]
      },
      {
        id: 'y6-dermato',
        nameFr: 'Dermatologie',
        modules: [
          {
            id: 'mod-y6-dermato',
            nameFr: 'Dermatologie & Vénérologie',
            descriptionFr: 'Eczéma, psoriasis, urticaire, toxidermies, infections cutanées et IST.',
            questionCount: 55,
            isFree: false,
          }
        ]
      },
      {
        id: 'y6-psy-med',
        nameFr: 'Psychologie Médicale',
        modules: [
          {
            id: 'mod-y6-psycho-med',
            nameFr: 'Psychologie Médicale',
            descriptionFr: 'Relation médecin-malade, annonce de mauvaise nouvelle, deuil et stress du soignant.',
            questionCount: 30,
            isFree: false,
          }
        ]
      },
      {
        id: 'y6-sante-pub',
        nameFr: 'Santé Publique & Épidémiologie',
        modules: [
          {
            id: 'mod-y6-sante-publique',
            nameFr: 'Santé Publique & Système de Santé',
            descriptionFr: 'Organisation du système de santé algérien, économie de santé, épidémiologie et prévention.',
            questionCount: 45,
            isFree: false,
          }
        ]
      },
      {
        id: 'y6-chirurgie',
        nameFr: 'Chirurgie Générale',
        modules: [
          {
            id: 'mod-y6-chir-abdominale',
            nameFr: 'Chirurgie Abdominale & Digestive',
            descriptionFr: 'Appendicite, hernies, occlusion intestinale, péritonite et chirurgie hépatobiliaire.',
            questionCount: 65,
            isFree: false,
          },
          {
            id: 'mod-y6-chir-traumato',
            nameFr: 'Chirurgie Traumatologique & Orthopédique',
            descriptionFr: 'Polytraumatisé, fractures ouvertes, ostéosynthèse et complications post-opératoires.',
            questionCount: 55,
            isFree: false,
          }
        ]
      }
    ]
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 7ÈME ANNÉE — INTERNAT (Stages intensifs)
  // ════════════════════════════════════════════════════════════════════════════
  {
    number: 7,
    label: '7ème Année Médecine',
    description: 'Stages internés, mise en situation de garde et conduite pratique',
    categories: [
      {
        id: 'y7-internat',
        nameFr: 'Pratique Clinique & Gestes d\'Urgence',
        modules: [
          {
            id: 'mod-y7-prescriptions',
            nameFr: 'Prescriptions d\'Urgence & Antibiothérapie Probabiliste',
            descriptionFr: 'Protocoles de garde, adaptations rénales, antibiogramme et analgésie de palier 3.',
            questionCount: 60,
            isFree: true,
          },
          {
            id: 'mod-y7-gestes-techniques',
            nameFr: 'Gestes Techniques & Procédures',
            descriptionFr: 'Pose de VVP, sondage urinaire, ponction pleurale/lombaire/d\'ascite et sutures.',
            questionCount: 45,
            isFree: false,
          },
          {
            id: 'mod-y7-gardes',
            nameFr: 'Conduite à Tenir de Garde',
            descriptionFr: 'CAT devant une douleur thoracique, abdominale, dyspnée, fièvre et hémorragie.',
            questionCount: 70,
            isFree: false,
          }
        ]
      },
      {
        id: 'y7-stages',
        nameFr: 'Stages Hospitaliers',
        modules: [
          {
            id: 'mod-y7-stage-medecine-interne',
            nameFr: 'Stage de Médecine Interne',
            descriptionFr: 'Maladies systémiques, lupus, vascularites, sarcoïdose et amylose.',
            questionCount: 55,
            isFree: false,
          },
          {
            id: 'mod-y7-stage-chirurgie',
            nameFr: 'Stage de Chirurgie',
            descriptionFr: 'Pré-opératoire, per-opératoire, post-opératoire et complications chirurgicales.',
            questionCount: 50,
            isFree: false,
          }
        ]
      }
    ]
  },

  // ════════════════════════════════════════════════════════════════════════════
  // CONCOURS DE RÉSIDANAT
  // ════════════════════════════════════════════════════════════════════════════
  {
    number: 8,
    label: 'Concours de Résidanat',
    description: 'Banque d\'annales classées & QCMs de haute sélectivité',
    badge: 'Concours & Spécialités',
    categories: [
      {
        id: 'y8-sciences-fond',
        nameFr: 'Sciences Fondamentales (Résidanat)',
        modules: [
          {
            id: 'mod-y8-anatomie-res',
            nameFr: 'Anatomie — Programme Résidanat',
            descriptionFr: 'Anatomie de tous les appareils : cardiovasculaire, digestif, respiratoire, neurologie, tête & cou.',
            questionCount: 120,
            isFree: false,
          },
          {
            id: 'mod-y8-biochimie-res',
            nameFr: 'Biochimie — Programme Résidanat',
            descriptionFr: 'Métabolisme des acides aminés, protéines, glucides, lipides, enzymologie et hormones.',
            questionCount: 80,
            isFree: false,
          },
          {
            id: 'mod-y8-physio-res',
            nameFr: 'Physiologie — Programme Résidanat',
            descriptionFr: 'Physiologie de tous les systèmes : cardiovasculaire, respiratoire, rénal, digestif et nerveux.',
            questionCount: 90,
            isFree: false,
          },
          {
            id: 'mod-y8-genetique-res',
            nameFr: 'Génétique & Cytologie — Programme Résidanat',
            descriptionFr: 'ADN, ARN, mutations, expression des gènes, chromosomopathies et conseil génétique.',
            questionCount: 60,
            isFree: false,
          }
        ]
      },
      {
        id: 'y8-clinique',
        nameFr: 'Spécialités Cliniques (Résidanat)',
        modules: [
          {
            id: 'mod-y8-medecine-interne-res',
            nameFr: 'Médecine Interne & Maladies Systémiques',
            descriptionFr: 'Lupus, vascularites, sarcoïdose, amylose et maladies auto-immunes systémiques.',
            questionCount: 70,
            isFree: false,
          },
          {
            id: 'mod-y8-chirurgie-res',
            nameFr: 'Chirurgie Générale — Programme Résidanat',
            descriptionFr: 'Abdomen aigu, chirurgie digestive, cancérologie chirurgicale et chirurgie d\'urgence.',
            questionCount: 85,
            isFree: false,
          },
          {
            id: 'mod-y8-pediatrie-res',
            nameFr: 'Pédiatrie — Programme Résidanat',
            descriptionFr: 'Néonatalogie, pathologies infectieuses, nutritionnelles, urgences pédiatriques.',
            questionCount: 75,
            isFree: false,
          }
        ]
      },
      {
        id: 'y8-annales',
        nameFr: 'Annales Officielles du Résidanat',
        modules: [
          {
            id: 'mod-y8-annales-recentes',
            nameFr: 'Épreuves Classantes & Cas Cliniques 2020–2026',
            descriptionFr: 'Sujets corrigés et commentés par les majors de promotion.',
            questionCount: 300,
            isFree: false,
          }
        ]
      },
      {
        id: 'y8-sante-pub-res',
        nameFr: 'Santé Publique & Législation (Résidanat)',
        modules: [
          {
            id: 'mod-y8-sante-publique-res',
            nameFr: 'Santé Publique & Biostatistiques — Programme Résidanat',
            descriptionFr: 'Organisation du système de santé algérien, économie de la santé, médecine légale et épidémiologie.',
            questionCount: 50,
            isFree: false,
          }
        ]
      }
    ]
  }
];

export function getYearData(yearNumber: number): YearData | undefined {
  return CURRICULUM_DATA.find((y) => y.number === yearNumber);
}

export function getModuleData(moduleId: string): { module: ModuleData; year: YearData; category: CategoryData } | undefined {
  for (const year of CURRICULUM_DATA) {
    for (const category of year.categories) {
      const found = category.modules.find((m) => m.id === moduleId);
      if (found) {
        return { module: found, year, category };
      }
    }
  }
  return undefined;
}

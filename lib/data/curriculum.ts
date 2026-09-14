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

export const CURRICULUM_DATA: YearData[] = [
  {
    number: 1,
    label: '1ère Année Médecine',
    description: 'Sciences fondamentales et bases morphologiques',
    categories: [
      {
        id: 'y1-anat',
        nameFr: 'Anatomie Humaine',
        modules: [
          {
            id: 'mod-anat-general',
            nameFr: 'Anatomie Générale & Ostéologie',
            descriptionFr: 'Généralités sur le squelette, articulations et repères osseux cardinaux.',
            questionCount: 45,
            isFree: true, // 1st module free!
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
            documents: [
              {
                id: 'pdf-anat-1',
                moduleId: 'mod-anat-general',
                title: 'Polycopié Officiel — Ostéologie Générale & Repères Cardinaux',
                professor: 'Pr. Benali / Faculté de Médecine',
                fileSize: '4.8 Mo',
                pagesCount: 42,
                uploadDate: '05 Sept. 2026',
                isFree: true,
              },
              {
                id: 'pdf-anat-2',
                moduleId: 'mod-anat-general',
                title: 'Fiche Synthèse — Articulations & Loges du Membre Supérieur',
                professor: 'Collège National d\'Anatomie',
                fileSize: '2.1 Mo',
                pagesCount: 16,
                uploadDate: '01 Sept. 2026',
                isFree: true,
              }
            ]
          },
          {
            id: 'mod-anat-thorax',
            nameFr: 'Anatomie du Thorax & Médiastin',
            descriptionFr: 'Cœur, gros vaisseaux, plèvre, poumons et innervation autonome.',
            questionCount: 60,
            isFree: false,
          },
          {
            id: 'mod-anat-abdomen',
            nameFr: 'Abdomen & Pelvis',
            descriptionFr: 'Péritoine, tube digestif, loges rétro-péritonéales et périnée.',
            questionCount: 80,
            isFree: false,
          }
        ]
      },
      {
        id: 'y1-physio',
        nameFr: 'Physiologie Générale',
        modules: [
          {
            id: 'mod-physio-membranaire',
            nameFr: 'Physiologie Membranaire & Potentiel d\'Action',
            descriptionFr: 'Canaux ioniques, équilibre de Nernst, pompe Na+/K+ et synapses.',
            questionCount: 50,
            isFree: false,
          },
          {
            id: 'mod-physio-musculaire',
            nameFr: 'Physiologie du Muscle Squelettique',
            descriptionFr: 'Couplage excitation-contraction, sarcomère et métabolisme énergétique.',
            questionCount: 40,
            isFree: false,
          }
        ]
      }
    ]
  },
  {
    number: 2,
    label: '2ème Année Médecine',
    description: 'Physiologie des grands systèmes et biochimie métabolique',
    categories: [
      {
        id: 'y2-cardio-phys',
        nameFr: 'Physiologie Cardiovasculaire',
        modules: [
          {
            id: 'mod-hemodynamique',
            nameFr: 'Cycle Cardiaque & Hémodynamique',
            descriptionFr: 'Courbes de pression, bruits du cœur, débit cardiaque et résistance vasculaire.',
            questionCount: 55,
            isFree: true, // 1st module free
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
            id: 'mod-ecg-bases',
            nameFr: 'Bases Électrocardiographiques',
            descriptionFr: 'Axes électriques, dépolarisations et repolarisations ventriculaires.',
            questionCount: 65,
            isFree: false,
          }
        ]
      }
    ]
  },
  {
    number: 3,
    label: '3ème Année Médecine',
    description: 'Sémiologie clinique et propédeutique médicale',
    categories: [
      {
        id: 'y3-semio',
        nameFr: 'Sémiologie Médicale',
        modules: [
          {
            id: 'mod-semio-cardio',
            nameFr: 'Sémiologie Cardiovasculaire',
            descriptionFr: 'Souffles cardiaques, insuffisance cardiaque, signes d\'ischémie et œdèmes.',
            questionCount: 75,
            isFree: true, // 1st module free
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
            id: 'mod-semio-pneumo',
            nameFr: 'Sémiologie Respiratoire',
            descriptionFr: 'Syndrome de condensation, épanchements pleuraux et râles auscultatoires.',
            questionCount: 70,
            isFree: false,
          }
        ]
      }
    ]
  },
  {
    number: 4,
    label: '4ème Année Médecine',
    description: 'Pathologie médicale et chirurgicale (Cardiologie, Pneumologie, Néphrologie)',
    categories: [
      {
        id: 'y4-cardio',
        nameFr: 'Cardiologie & Pathologie Vasculaire',
        modules: [
          {
            id: 'mod-syndrome-coronaire',
            nameFr: 'Syndromes Coronariens Aigus (SCA)',
            descriptionFr: 'SCA ST+ et ST-, prise en charge immédiate, troponine et reperfusion.',
            questionCount: 90,
            isFree: true, // 1st module free
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
                explanation: 'En cas d\'infarctus du myocarde inférieur avec extension au ventricule droit (V4R+), le débit cardiaque dépend strictement de la précharge ventriculaire droite. Les dérivés nitrés (veinodilatateurs puissants) entraînent un effondrement de la précharge et une hypotension sévère réfractaire.',
                difficulty: 'hard',
                source: 'Cardiologie ECN / Résidanat',
                isClinicalCase: true,
              }
            ]
          },
          {
            id: 'mod-insuf-cardiaque',
            nameFr: 'Insuffisance Cardiaque Chronique & Aiguë',
            descriptionFr: 'Critères diagnostiques, classification NYHA, OAP et trithérapie/quadrithérapie.',
            questionCount: 85,
            isFree: false,
          }
        ]
      }
    ]
  },
  {
    number: 5,
    label: '5ème Année Médecine',
    description: 'Pédiatrie, Gynécologie-Obstétrique, Psychiatrie',
    categories: [
      {
        id: 'y5-ped',
        nameFr: 'Pédiatrie & Néonatalogie',
        modules: [
          {
            id: 'mod-detresse-resp-nne',
            nameFr: 'Détresse Respiratoire du Nouveau-Né',
            descriptionFr: 'Score de Silverman, maladie des membranes hyalines, inhalation méconiale.',
            questionCount: 65,
            isFree: true,
          },
          {
            id: 'mod-gastro-ped',
            nameFr: 'Déshydratation Aiguë du Nourrisson',
            descriptionFr: 'Signe du pli cutané, solutés de réhydratation orale (SRO) et perfusion d\'urgence.',
            questionCount: 50,
            isFree: false,
          }
        ]
      }
    ]
  },
  {
    number: 6,
    label: '6ème Année Médecine',
    description: 'Urgences, Réanimation, Thérapeutique & Synthèse clinique',
    categories: [
      {
        id: 'y6-urg',
        nameFr: 'Urgences & Réanimation',
        modules: [
          {
            id: 'mod-etats-choc',
            nameFr: 'États de Choc (Septique, Cardiogénique, Anaphylactique)',
            descriptionFr: 'Physiopathologie, remplissage, amines vasoactives et monitorage hémodynamique.',
            questionCount: 80,
            isFree: true,
          },
          {
            id: 'mod-coma-avc',
            nameFr: 'Comas & Accidents Vasculaires Cérébraux',
            descriptionFr: 'Score de Glasgow, thrombolyse, thrombectomie et hématomes sous-duraux.',
            questionCount: 75,
            isFree: false,
          }
        ]
      }
    ]
  },
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
            id: 'mod-prescriptions-critiques',
            nameFr: 'Prescriptions d\'Urgence & Antibiothérapie Probabiliste',
            descriptionFr: 'Protocoles de garde, adaptations rénales, antibiogramme et analgésie de palier 3.',
            questionCount: 60,
            isFree: true,
          }
        ]
      }
    ]
  },
  {
    number: 8,
    label: 'Concours de Résidanat',
    description: 'Banque d\'annales classées & QCMs de haute sélectivité',
    badge: 'Concours & Spécialités',
    categories: [
      {
        id: 'y8-annales',
        nameFr: 'Annales Officielles du Résidanat',
        modules: [
          {
            id: 'mod-annales-recentes',
            nameFr: 'Épreuves Classantes & Cas Cliniques 2020–2024',
            descriptionFr: 'Sujets corrigés et commentés par les majors de promotion.',
            questionCount: 250,
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

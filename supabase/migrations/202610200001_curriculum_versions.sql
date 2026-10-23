-- Additive curriculum and publication model. Existing attempts remain immutable snapshots.
begin;
create table public.curriculum_releases (
 id uuid primary key default gen_random_uuid(), title text not null check(length(title) between 3 and 200),
 faculty text not null default 'Oran — à confirmer', academic_period text not null default 'À confirmer',
 status text not null default 'draft' check(status in ('draft','verified','archived')),
 source_reference text not null default '', verified_by uuid references auth.users, verified_at timestamptz,
 check(status<>'verified' or (length(trim(source_reference))>=3 and verified_by is not null and verified_at is not null))
);
insert into public.curriculum_releases(id,title) values('10000000-0000-4000-8000-000000000001','Programme provisoire Oran');
create table public.curriculum_modules (
 id text primary key check(length(id) between 3 and 100), release_id uuid not null references public.curriculum_releases,
 study_year integer not null check(study_year between 1 and 8), category text not null,
 title text not null check(length(trim(title)) between 3 and 200), description text not null default '',
 active boolean not null default true, requires_subscription boolean not null default false,
 catalog_mode text not null default 'published' check(catalog_mode in ('sample','published'))
);
create table public.curriculum_courses (
 id uuid primary key default gen_random_uuid(), module_id text not null references public.curriculum_modules,
 title text not null check(length(trim(title)) between 3 and 200), active boolean not null default true,
 unique(id,module_id)
);
create table public.content_questions (
 id uuid primary key default gen_random_uuid(), module_id text not null references public.curriculum_modules,
 legacy_key text not null, unique(module_id,legacy_key)
);
create table public.question_versions (
 id uuid primary key default gen_random_uuid(), question_id uuid not null references public.content_questions,
 version integer not null, course_id uuid references public.curriculum_courses,
 payload jsonb not null, rights_reference text not null default '',
 status text not null default 'draft' check(status in ('sample','draft','in_review','approved','rejected','published','superseded','withdrawn')),
 author_id uuid references auth.users, reviewer_id uuid references auth.users, review_note text not null default '',
 reviewed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(question_id,version),
 check(status not in ('approved','published') or (reviewer_id is not null and reviewer_id is distinct from author_id and reviewed_at is not null and length(trim(rights_reference))>=3))
);
create unique index one_published_question_version on public.question_versions(question_id) where status='published';
create unique index one_editable_question_version on public.question_versions(question_id) where status in ('draft','in_review','approved','rejected');
create index question_versions_queue on public.question_versions(status,created_at);
create table public.content_audit (
 id bigint generated always as identity primary key, actor_id uuid references auth.users, action text not null,
 entity_id text not null, detail jsonb not null default '{}', created_at timestamptz not null default now()
);
create table public.content_notices (
 version_id uuid primary key references public.question_versions, reason text not null, created_at timestamptz not null default now()
);
create function public.has_staff_capability(p_cap text) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from auth.users where id=auth.uid() and (
 raw_app_meta_data->>'role'='admin' or
 (p_cap='edit' and raw_app_meta_data->>'role'='content_editor') or
 (p_cap='review' and raw_app_meta_data->>'role'='medical_reviewer') or
 (p_cap='payments' and raw_app_meta_data->>'role'='payment_manager')));
$$;
revoke all on function public.has_staff_capability(text) from public,anon;
grant execute on function public.has_staff_capability(text) to authenticated;
create function medqcm_private.audit(p_action text,p_id text,p_detail jsonb default '{}') returns void
language sql set search_path='' as $$
 insert into public.content_audit(actor_id,action,entity_id,detail) values(auth.uid(),p_action,p_id,p_detail);
$$;
-- No direct client writes or reads of private content. Safe RPCs expose only authorized projections.
do $$declare t text;begin
 foreach t in array array['curriculum_releases','curriculum_modules','curriculum_courses','content_questions','question_versions','content_audit','content_notices'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from public,anon,authenticated',t);
 end loop;
end$$;

-- Preserve draft navigation IDs; this does not validate the programme.
insert into public.curriculum_modules(id,release_id,study_year,category,title,description) values
('mod-y1-anat-general','10000000-0000-4000-8000-000000000001',1,'Anatomie','Anatomie Générale & Ostéologie','Généralités sur le squelette, articulations, plans anatomiques et repères osseux cardinaux.'),
('mod-y1-anat-thorax','10000000-0000-4000-8000-000000000001',1,'Anatomie','Anatomie du Thorax & Médiastin','Cœur, gros vaisseaux, plèvre, poumons et innervation autonome.'),
('mod-y1-anat-abdomen','10000000-0000-4000-8000-000000000001',1,'Anatomie','Abdomen & Pelvis','Péritoine, tube digestif, loges rétro-péritonéales et périnée.'),
('mod-y1-anat-tete-cou','10000000-0000-4000-8000-000000000001',1,'Anatomie','Anatomie de la Tête & du Cou','Crâne, face, fosses nasales, larynx, pharynx et nerfs crâniens.'),
('mod-y1-anat-membres','10000000-0000-4000-8000-000000000001',1,'Anatomie','Anatomie des Membres','Membre supérieur et inférieur : os, muscles, vascularisation et innervation.'),
('mod-y1-cytologie','10000000-0000-4000-8000-000000000001',1,'Cytologie & Histologie','Cytologie (Biologie Cellulaire)','Membrane plasmique, organites cellulaires, noyau, cycle cellulaire et division (mitose/méiose).'),
('mod-y1-histologie','10000000-0000-4000-8000-000000000001',1,'Cytologie & Histologie','Histologie Générale','Tissus épithéliaux, conjonctifs, musculaires et nerveux. Techniques histologiques.'),
('mod-y1-embryo-gen','10000000-0000-4000-8000-000000000001',1,'Embryologie','Embryologie Générale','Gamétogenèse, fécondation, segmentation, gastrulation et organogenèse précoce.'),
('mod-y1-physio-gen','10000000-0000-4000-8000-000000000001',1,'Physiologie','Physiologie Générale','Physiologie membranaire, potentiels de repos et d''action, pompe Na+/K+ et synapses.'),
('mod-y1-physio-musculaire','10000000-0000-4000-8000-000000000001',1,'Physiologie','Physiologie du Muscle Squelettique','Couplage excitation-contraction, sarcomère et métabolisme énergétique.'),
('mod-y1-chimie-gen','10000000-0000-4000-8000-000000000001',1,'Chimie & Biochimie','Chimie Générale & Organique','Atomistique, liaisons chimiques, thermodynamique, chimie organique et fonctions chimiques.'),
('mod-y1-biochimie-struct','10000000-0000-4000-8000-000000000001',1,'Chimie & Biochimie','Biochimie Structurale','Structure des glucides, lipides, protéines et acides nucléiques.'),
('mod-y1-biophysique','10000000-0000-4000-8000-000000000001',1,'Physique & Biophysique','Biophysique Médicale','Propriétés des solutions, pH et tampons, radiations ionisantes et non ionisantes, optique médicale.'),
('mod-y1-biostat','10000000-0000-4000-8000-000000000001',1,'Biostatistiques','Biostatistiques & Informatique Médicale','Statistiques descriptives, probabilités, tests d''hypothèse et introduction à l''informatique médicale.'),
('mod-y1-ssh','10000000-0000-4000-8000-000000000001',1,'Sciences Humaines & Sociales','Santé, Société & Humanité','Histoire de la médecine, éthique médicale, déontologie et communication avec le patient.'),
('mod-y2-immunologie','10000000-0000-4000-8000-000000000001',2,'Immunologie & Génétique','Immunologie Fondamentale','Immunité innée et adaptative, cellules immunitaires, anticorps, CMH et réactions d''hypersensibilité.'),
('mod-y2-genetique','10000000-0000-4000-8000-000000000001',2,'Immunologie & Génétique','Génétique Médicale','ADN, ARN, expression des gènes, mutations, hérédité mendélienne et chromosomopathies.'),
('mod-y2-endocrinien','10000000-0000-4000-8000-000000000001',2,'Appareil Endocrinien & Génital','Système Endocrinien','Axe hypothalamo-hypophysaire, thyroïde, surrénales, pancréas endocrine et hormones sexuelles.'),
('mod-y2-app-genital','10000000-0000-4000-8000-000000000001',2,'Appareil Endocrinien & Génital','Appareil Génital','Anatomie et physiologie des appareils génitaux masculin et féminin, cycle menstruel.'),
('mod-y2-digestif','10000000-0000-4000-8000-000000000001',2,'Appareil Digestif','Appareil Digestif','Anatomie, histologie et physiologie du tube digestif, foie, pancréas exocrine et péritoine.'),
('mod-y2-urinaire','10000000-0000-4000-8000-000000000001',2,'Appareil Urinaire','Appareil Urinaire & Rein','Anatomie rénale, néphron, filtration glomérulaire, équilibre acido-basique et voies urinaires.'),
('mod-y2-cardio','10000000-0000-4000-8000-000000000001',2,'Appareil Cardio-Respiratoire','Physiologie Cardiovasculaire','Cycle cardiaque, hémodynamique, courbes de pression, ECG de base et régulation de la PA.'),
('mod-y2-respiratoire','10000000-0000-4000-8000-000000000001',2,'Appareil Cardio-Respiratoire','Physiologie Respiratoire','Mécanique ventilatoire, échanges gazeux alvéolaires, transport O2/CO2 et régulation.'),
('mod-y2-neuro','10000000-0000-4000-8000-000000000001',2,'Appareil Neuro-Sensitif','Système Nerveux Central & Périphérique','Anatomie et physiologie du SNC, moelle épinière, tronc cérébral, cortex et nerfs crâniens.'),
('mod-y2-organes-sens','10000000-0000-4000-8000-000000000001',2,'Appareil Neuro-Sensitif','Organes des Sens','Œil et vision, oreille et audition, goût, odorat et sensibilité somatique.'),
('mod-y2-biochimie-metab','10000000-0000-4000-8000-000000000001',2,'Biochimie Métabolique','Biochimie Métabolique','Métabolisme des glucides, lipides, acides aminés, enzymologie et bioénergétique.'),
('mod-y2-histo-special','10000000-0000-4000-8000-000000000001',2,'Histologie Spéciale','Histologie des Appareils & Organes','Histologie du cœur, poumon, rein, foie, tube digestif, glandes endocrines et gonades.'),
('mod-y2-embryo-special','10000000-0000-4000-8000-000000000001',2,'Embryologie Spéciale','Embryologie Spéciale des Appareils','Développement embryonnaire de chaque appareil : cœur, appareil digestif, urogénital, nerveux.'),
('mod-y3-semio-cardio','10000000-0000-4000-8000-000000000001',3,'Sémiologie Médicale','Sémiologie Cardiovasculaire','Souffles cardiaques, insuffisance cardiaque, signes d''ischémie et œdèmes.'),
('mod-y3-semio-pneumo','10000000-0000-4000-8000-000000000001',3,'Sémiologie Médicale','Sémiologie Respiratoire','Syndrome de condensation, épanchements pleuraux et râles auscultatoires.'),
('mod-y3-semio-digestive','10000000-0000-4000-8000-000000000001',3,'Sémiologie Médicale','Sémiologie Digestive','Examen de l''abdomen, ictère, ascite, hépatomégalie et toucher rectal.'),
('mod-y3-semio-nephro','10000000-0000-4000-8000-000000000001',3,'Sémiologie Médicale','Sémiologie Néphro-Urologique','Œdèmes, protéinurie, hématurie, syndromes glomérulaires et insuffisance rénale.'),
('mod-y3-semio-neuro','10000000-0000-4000-8000-000000000001',3,'Sémiologie Médicale','Sémiologie Neurologique','Examen neurologique, déficits moteurs/sensitifs, réflexes et syndromes neurologiques.'),
('mod-y3-semio-endoc','10000000-0000-4000-8000-000000000001',3,'Sémiologie Médicale','Sémiologie Endocrinienne','Goitre, signes de dysthyroïdie, diabète et syndrome de Cushing.'),
('mod-y3-pharmaco-gen','10000000-0000-4000-8000-000000000001',3,'Pharmacologie','Pharmacologie Générale','Pharmacocinétique (ADME), pharmacodynamie, interactions médicamenteuses et iatrogénie.'),
('mod-y3-pharmaco-spec','10000000-0000-4000-8000-000000000001',3,'Pharmacologie','Pharmacologie Spéciale','Antibiotiques, anti-inflammatoires, antalgiques, antihypertenseurs et psychotropes.'),
('mod-y3-bacteriologie','10000000-0000-4000-8000-000000000001',3,'Microbiologie','Bactériologie Médicale','Classification, pouvoir pathogène, diagnostic bactériologique et antibiogramme.'),
('mod-y3-virologie','10000000-0000-4000-8000-000000000001',3,'Microbiologie','Virologie Médicale','Structure virale, cycles de réplication, diagnostic virologique et principales viroses.'),
('mod-y3-mycologie','10000000-0000-4000-8000-000000000001',3,'Microbiologie','Mycologie & Parasitologie','Champignons pathogènes, parasites protozoaires et helminthes, cycles parasitaires.'),
('mod-y3-anapath','10000000-0000-4000-8000-000000000001',3,'Anatomie Pathologique','Anatomie Pathologique Générale','Inflammation, processus tumoral, nécrose, apoptose et pathologie vasculaire.'),
('mod-y3-physiopath','10000000-0000-4000-8000-000000000001',3,'Physiopathologie','Physiopathologie des Grands Syndromes','Mécanismes physiopathologiques de l''insuffisance cardiaque, respiratoire, rénale et hépatique.'),
('mod-y3-radiologie','10000000-0000-4000-8000-000000000001',3,'Radiologie & Imagerie','Radiologie & Imagerie Médicale','Principes de la radiologie standard, échographie, scanner, IRM et médecine nucléaire.'),
('mod-y3-immuno-clin','10000000-0000-4000-8000-000000000001',3,'Immunologie Clinique','Immunologie Clinique & Pathologique','Auto-immunité, déficits immunitaires, transplantation et immunothérapie.'),
('mod-y4-cardio-sca','10000000-0000-4000-8000-000000000001',4,'Cardiologie','Syndromes Coronariens Aigus (SCA)','SCA ST+ et ST-, prise en charge immédiate, troponine et reperfusion.'),
('mod-y4-cardio-ic','10000000-0000-4000-8000-000000000001',4,'Cardiologie','Insuffisance Cardiaque','Critères diagnostiques, classification NYHA, OAP et trithérapie/quadrithérapie.'),
('mod-y4-cardio-hta','10000000-0000-4000-8000-000000000001',4,'Cardiologie','Hypertension Artérielle','HTA essentielle et secondaire, bilan étiologique et stratégies thérapeutiques.'),
('mod-y4-cardio-valvulopathies','10000000-0000-4000-8000-000000000001',4,'Cardiologie','Valvulopathies','Rétrécissement et insuffisance aortique/mitrale, RAA et endocardite infectieuse.'),
('mod-y4-cardio-tdr','10000000-0000-4000-8000-000000000001',4,'Cardiologie','Troubles du Rythme & de la Conduction','Fibrillation atriale, tachycardies, BAV, flutter et traitement antiarythmique.'),
('mod-y4-pneumo-asthme','10000000-0000-4000-8000-000000000001',4,'Pneumo-Phtisiologie','Asthme & BPCO','Physiopathologie, classification GINA/GOLD, exacerbations et traitement de fond.'),
('mod-y4-pneumo-infection','10000000-0000-4000-8000-000000000001',4,'Pneumo-Phtisiologie','Pneumonies & Infections Respiratoires','PAC, pneumonie nosocomiale, abcès pulmonaire et pleurésies purulentes.'),
('mod-y4-pneumo-tuberculose','10000000-0000-4000-8000-000000000001',4,'Pneumo-Phtisiologie','Tuberculose Pulmonaire','Primo-infection, tuberculose maladie, BK, IDR et protocoles de traitement (2RHZE/4RH).'),
('mod-y4-pneumo-cancer','10000000-0000-4000-8000-000000000001',4,'Pneumo-Phtisiologie','Cancer Broncho-Pulmonaire','Types histologiques, staging TNM, syndrome de Pancoast-Tobias et options thérapeutiques.'),
('mod-y4-pneumo-pleuresie','10000000-0000-4000-8000-000000000001',4,'Pneumo-Phtisiologie','Épanchements Pleuraux & Pneumothorax','Transsudat vs exsudat, ponction pleurale, drainage et pneumothorax spontané.'),
('mod-y4-gastro-ulcere','10000000-0000-4000-8000-000000000001',4,'Hépato-Gastro-Entérologie','Ulcère Gastro-Duodénal & RGO','Helicobacter pylori, complications hémorragiques, perforation et traitement par IPP.'),
('mod-y4-gastro-hepatite','10000000-0000-4000-8000-000000000001',4,'Hépato-Gastro-Entérologie','Hépatites Virales & Cirrhose','HBV, HCV, cirrhose et ses complications (ascite, HTP, CHC) et transplantation.'),
('mod-y4-gastro-mici','10000000-0000-4000-8000-000000000001',4,'Hépato-Gastro-Entérologie','MICI & Troubles Fonctionnels','Maladie de Crohn, RCH, syndrome de l''intestin irritable et colopathie fonctionnelle.'),
('mod-y4-gastro-pancreas','10000000-0000-4000-8000-000000000001',4,'Hépato-Gastro-Entérologie','Pathologie Pancréatique & Biliaire','Pancréatite aiguë et chronique, lithiase biliaire et cholécystite.'),
('mod-y4-neuro-avc','10000000-0000-4000-8000-000000000001',4,'Neurologie','AVC Ischémiques & Hémorragiques','Territoires vasculaires, thrombolyse, thrombectomie et prévention secondaire.'),
('mod-y4-neuro-epilepsie','10000000-0000-4000-8000-000000000001',4,'Neurologie','Épilepsies & Céphalées','Classification des crises, EEG, état de mal épileptique, migraine et algies faciales.'),
('mod-y4-neuro-sep','10000000-0000-4000-8000-000000000001',4,'Neurologie','Sclérose en Plaques & Neuropathies','SEP, syndrome de Guillain-Barré, neuropathies périphériques et compression médullaire.'),
('mod-y4-infectio-meningite','10000000-0000-4000-8000-000000000001',4,'Maladies Infectieuses','Méningites & Méningo-Encéphalites','Méningites bactériennes, virales, tuberculeuse, PL et antibiothérapie de 1ère intention.'),
('mod-y4-infectio-fievre','10000000-0000-4000-8000-000000000001',4,'Maladies Infectieuses','Fièvres & Syndromes Infectieux','Fièvre typhoïde, brucellose, paludisme, leptospirose et fièvre au retour de voyage.'),
('mod-y4-infectio-vih','10000000-0000-4000-8000-000000000001',4,'Maladies Infectieuses','VIH/SIDA & Infections Opportunistes','Dépistage, classification OMS/CDC, prophylaxie et trithérapie antirétrovirale.'),
('mod-y4-hemato-anemie','10000000-0000-4000-8000-000000000001',4,'Onco-Hématologie','Anémies & Hémoglobinopathies','Anémies ferriprives, mégaloblastiques, hémolytiques, drépanocytose et thalassémie.'),
('mod-y4-hemato-leucemie','10000000-0000-4000-8000-000000000001',4,'Onco-Hématologie','Leucémies & Lymphomes','LAM, LAL, LLC, LMC, lymphome de Hodgkin et non hodgkinien, myélome multiple.'),
('mod-y4-hemato-hemostase','10000000-0000-4000-8000-000000000001',4,'Onco-Hématologie','Hémostase & Thromboses','Coagulation, CIVD, thrombopénies, anticoagulants et thrombophilies.'),
('mod-y5-ped-neonat','10000000-0000-4000-8000-000000000001',5,'Pédiatrie & Néonatalogie','Néonatalogie','Détresse respiratoire du nouveau-né, score de Silverman, prématurité et ictère néonatal.'),
('mod-y5-ped-croissance','10000000-0000-4000-8000-000000000001',5,'Pédiatrie & Néonatalogie','Croissance & Développement','Courbes de croissance, retard staturo-pondéral, puberté normale et pathologique.'),
('mod-y5-ped-infectio','10000000-0000-4000-8000-000000000001',5,'Pédiatrie & Néonatalogie','Infections Pédiatriques','Vaccination, rougeole, varicelle, coqueluche, bronchiolite et GEA du nourrisson.'),
('mod-y5-ped-nutrition','10000000-0000-4000-8000-000000000001',5,'Pédiatrie & Néonatalogie','Nutrition & Déshydratation','Malnutrition, déshydratation aiguë du nourrisson, SRO et alimentation du nourrisson.'),
('mod-y5-ped-urgences','10000000-0000-4000-8000-000000000001',5,'Pédiatrie & Néonatalogie','Urgences Pédiatriques','Convulsions fébriles, invagination intestinale, corps étrangers et intoxications.'),
('mod-y5-gyneco-grossesse','10000000-0000-4000-8000-000000000001',5,'Gynécologie-Obstétrique','Grossesse Normale & Pathologique','Suivi de grossesse, HTA gravidique, pré-éclampsie, diabète gestationnel et RCIU.'),
('mod-y5-gyneco-accouchement','10000000-0000-4000-8000-000000000001',5,'Gynécologie-Obstétrique','Accouchement & Délivrance','Mécanisme de l''accouchement, partogramme, césarienne et hémorragie du post-partum.'),
('mod-y5-gyneco-patho','10000000-0000-4000-8000-000000000001',5,'Gynécologie-Obstétrique','Pathologies Gynécologiques','Fibrome utérin, endométriose, kyste ovarien, cancer du col et du sein.'),
('mod-y5-gyneco-contraception','10000000-0000-4000-8000-000000000001',5,'Gynécologie-Obstétrique','Contraception & Infertilité','Méthodes contraceptives, planning familial, bilan d''infertilité et PMA.'),
('mod-y5-ortho-fractures','10000000-0000-4000-8000-000000000001',5,'Orthopédie-Traumatologie','Fractures & Traumatismes','Fractures des membres, du bassin et du rachis, luxations et entorses.'),
('mod-y5-ortho-rhumato','10000000-0000-4000-8000-000000000001',5,'Orthopédie-Traumatologie','Rhumatologie','Polyarthrite rhumatoïde, arthrose, spondylarthrites, goutte et lupus.'),
('mod-y5-ortho-reeducation','10000000-0000-4000-8000-000000000001',5,'Orthopédie-Traumatologie','Médecine Physique & Rééducation','Principes de rééducation, appareillage, handicap moteur et réadaptation fonctionnelle.'),
('mod-y5-uro-lithiase','10000000-0000-4000-8000-000000000001',5,'Urologie & Néphrologie','Urologie','Lithiase urinaire, HBP, cancer de la prostate, tumeurs rénales et infections urinaires.'),
('mod-y5-nephro-ira','10000000-0000-4000-8000-000000000001',5,'Urologie & Néphrologie','Néphrologie','IRA, IRC, glomérulonéphrites, syndrome néphrotique, dialyse et transplantation rénale.'),
('mod-y5-psy-troubles','10000000-0000-4000-8000-000000000001',5,'Psychiatrie & Santé Mentale','Troubles Psychiatriques Majeurs','Schizophrénie, troubles bipolaires, dépression, troubles anxieux et addictions.'),
('mod-y5-psy-urgences','10000000-0000-4000-8000-000000000001',5,'Psychiatrie & Santé Mentale','Urgences Psychiatriques','Crise suicidaire, agitation aiguë, BDA, confusion mentale et cadre médico-légal.'),
('mod-y5-endocrino-diabete','10000000-0000-4000-8000-000000000001',5,'Endocrinologie & Métabolisme','Diabète & Complications','DT1, DT2, complications aiguës (acidocétose, hypoglycémie), microangiopathie et macroangiopathie.'),
('mod-y5-endocrino-thyroide','10000000-0000-4000-8000-000000000001',5,'Endocrinologie & Métabolisme','Pathologies Thyroïdiennes & Surrénaliennes','Hypo/hyperthyroïdie, nodules, cancer thyroïdien, insuffisance surrénale et Cushing.'),
('mod-y6-urg-choc','10000000-0000-4000-8000-000000000001',6,'Urgences & Réanimation','États de Choc','Choc septique, cardiogénique, hypovolémique et anaphylactique — remplissage et amines.'),
('mod-y6-urg-coma','10000000-0000-4000-8000-000000000001',6,'Urgences & Réanimation','Comas & Altération de Conscience','Score de Glasgow, étiologies, prise en charge et ventilation mécanique.'),
('mod-y6-urg-arret','10000000-0000-4000-8000-000000000001',6,'Urgences & Réanimation','Arrêt Cardiaque & Réanimation Cardio-Pulmonaire','Algorithme de l''ACR, CEE, adrénaline, amiodarone et hypothermie thérapeutique.'),
('mod-y6-urg-intox','10000000-0000-4000-8000-000000000001',6,'Urgences & Réanimation','Intoxications Aiguës','Intoxications médicamenteuses, CO, organophosphorés, caustiques et antidotes.'),
('mod-y6-medleg','10000000-0000-4000-8000-000000000001',6,'Médecine Légale & Déontologie','Médecine Légale & Droit Médical','Responsabilité médicale, certificats, thanatologie, blessures et expertise judiciaire.'),
('mod-y6-deontologie','10000000-0000-4000-8000-000000000001',6,'Médecine Légale & Déontologie','Déontologie & Éthique Médicale','Code de déontologie algérien, secret médical, consentement éclairé et fin de vie.'),
('mod-y6-orl','10000000-0000-4000-8000-000000000001',6,'ORL & Chirurgie Cervico-Faciale','ORL Médicale & Chirurgicale','Otites, sinusites, angines, vertiges, surdité, dyspnée laryngée et cancers ORL.'),
('mod-y6-ophtalmo','10000000-0000-4000-8000-000000000001',6,'Ophtalmologie','Ophtalmologie','Glaucome, cataracte, DMLA, rétinopathie diabétique, œil rouge et traumatismes oculaires.'),
('mod-y6-dermato','10000000-0000-4000-8000-000000000001',6,'Dermatologie','Dermatologie & Vénérologie','Eczéma, psoriasis, urticaire, toxidermies, infections cutanées et IST.'),
('mod-y6-psycho-med','10000000-0000-4000-8000-000000000001',6,'Psychologie Médicale','Psychologie Médicale','Relation médecin-malade, annonce de mauvaise nouvelle, deuil et stress du soignant.'),
('mod-y6-sante-publique','10000000-0000-4000-8000-000000000001',6,'Santé Publique & Épidémiologie','Santé Publique & Système de Santé','Organisation du système de santé algérien, économie de santé, épidémiologie et prévention.'),
('mod-y6-chir-abdominale','10000000-0000-4000-8000-000000000001',6,'Chirurgie Générale','Chirurgie Abdominale & Digestive','Appendicite, hernies, occlusion intestinale, péritonite et chirurgie hépatobiliaire.'),
('mod-y6-chir-traumato','10000000-0000-4000-8000-000000000001',6,'Chirurgie Générale','Chirurgie Traumatologique & Orthopédique','Polytraumatisé, fractures ouvertes, ostéosynthèse et complications post-opératoires.'),
('mod-y7-prescriptions','10000000-0000-4000-8000-000000000001',7,'Pratique Clinique & Gestes d''Urgence','Prescriptions d''Urgence & Antibiothérapie Probabiliste','Protocoles de garde, adaptations rénales, antibiogramme et analgésie de palier 3.'),
('mod-y7-gestes-techniques','10000000-0000-4000-8000-000000000001',7,'Pratique Clinique & Gestes d''Urgence','Gestes Techniques & Procédures','Pose de VVP, sondage urinaire, ponction pleurale/lombaire/d''ascite et sutures.'),
('mod-y7-gardes','10000000-0000-4000-8000-000000000001',7,'Pratique Clinique & Gestes d''Urgence','Conduite à Tenir de Garde','CAT devant une douleur thoracique, abdominale, dyspnée, fièvre et hémorragie.'),
('mod-y7-stage-medecine-interne','10000000-0000-4000-8000-000000000001',7,'Stages Hospitaliers','Stage de Médecine Interne','Maladies systémiques, lupus, vascularites, sarcoïdose et amylose.'),
('mod-y7-stage-chirurgie','10000000-0000-4000-8000-000000000001',7,'Stages Hospitaliers','Stage de Chirurgie','Pré-opératoire, per-opératoire, post-opératoire et complications chirurgicales.'),
('mod-y8-anatomie-res','10000000-0000-4000-8000-000000000001',8,'Sciences Fondamentales (Résidanat)','Anatomie — Programme Résidanat','Anatomie de tous les appareils : cardiovasculaire, digestif, respiratoire, neurologie, tête & cou.'),
('mod-y8-biochimie-res','10000000-0000-4000-8000-000000000001',8,'Sciences Fondamentales (Résidanat)','Biochimie — Programme Résidanat','Métabolisme des acides aminés, protéines, glucides, lipides, enzymologie et hormones.'),
('mod-y8-physio-res','10000000-0000-4000-8000-000000000001',8,'Sciences Fondamentales (Résidanat)','Physiologie — Programme Résidanat','Physiologie de tous les systèmes : cardiovasculaire, respiratoire, rénal, digestif et nerveux.'),
('mod-y8-genetique-res','10000000-0000-4000-8000-000000000001',8,'Sciences Fondamentales (Résidanat)','Génétique & Cytologie — Programme Résidanat','ADN, ARN, mutations, expression des gènes, chromosomopathies et conseil génétique.'),
('mod-y8-medecine-interne-res','10000000-0000-4000-8000-000000000001',8,'Spécialités Cliniques (Résidanat)','Médecine Interne & Maladies Systémiques','Lupus, vascularites, sarcoïdose, amylose et maladies auto-immunes systémiques.'),
('mod-y8-chirurgie-res','10000000-0000-4000-8000-000000000001',8,'Spécialités Cliniques (Résidanat)','Chirurgie Générale — Programme Résidanat','Abdomen aigu, chirurgie digestive, cancérologie chirurgicale et chirurgie d''urgence.'),
('mod-y8-pediatrie-res','10000000-0000-4000-8000-000000000001',8,'Spécialités Cliniques (Résidanat)','Pédiatrie — Programme Résidanat','Néonatalogie, pathologies infectieuses, nutritionnelles, urgences pédiatriques.'),
('mod-y8-annales-recentes','10000000-0000-4000-8000-000000000001',8,'Annales Officielles du Résidanat','Épreuves Classantes & Cas Cliniques 2020–2026','Sujets corrigés et commentés par les majors de promotion.'),
('mod-y8-sante-publique-res','10000000-0000-4000-8000-000000000001',8,'Santé Publique & Législation (Résidanat)','Santé Publique & Biostatistiques — Programme Résidanat','Organisation du système de santé algérien, économie de la santé, médecine légale et épidémiologie.');
-- Preserve any catalog module not in the checked-in navigation as an explicitly unverified mapping.
insert into public.curriculum_modules(id,release_id,study_year,category,title)
 select module_id,'10000000-0000-4000-8000-000000000001',1,'Classement à vérifier',module_name from public.training_catalog
 on conflict(id) do nothing;
update public.curriculum_modules m set catalog_mode='sample',requires_subscription=c.requires_subscription from public.training_catalog c where c.module_id=m.id;
insert into public.content_questions(module_id,legacy_key)
 select c.module_id,q->>'id' from public.training_catalog c cross join lateral jsonb_array_elements(c.questions) q;
insert into public.question_versions(question_id,version,payload,status)
 select e.id,1,q,'sample' from public.training_catalog c cross join lateral jsonb_array_elements(c.questions) q
 join public.content_questions e on e.module_id=c.module_id and e.legacy_key=q->>'id';
-- Existing editor drafts are retained and imported without publishing them.
insert into public.content_questions(module_id,legacy_key)
 select d.module_id,d.id from public.question_drafts d join public.curriculum_modules m on m.id=d.module_id on conflict do nothing;
insert into public.question_versions(question_id,version,payload)
 select q.id,coalesce((select max(version) from public.question_versions v where v.question_id=q.id),0)+1,d.question
 from public.question_drafts d join public.content_questions q on q.module_id=d.module_id and q.legacy_key=d.id;
-- Legacy draft mutation endpoints cannot bypass the new lifecycle.
revoke execute on function public.admin_upsert_question_draft(text,text,jsonb),public.admin_remove_question_draft(text) from authenticated;

create function medqcm_private.validate_question(p jsonb) returns void language plpgsql set search_path='' as $$
begin
 if p is null or jsonb_typeof(p) is distinct from 'object' or length(trim(coalesce(p->>'questionText',''))) not between 10 and 2000
 or length(trim(coalesce(p->>'source',''))) not between 3 and 500 or length(coalesce(p->>'explanation',''))>5000
 or coalesce(p->>'difficulty','') not in ('easy','medium','hard') or jsonb_typeof(p->'options') is distinct from 'array'
 then raise exception 'Invalid question'; end if;
 if jsonb_array_length(p->'options') not between 2 and 8
 or exists(select 1 from jsonb_array_elements(p->'options') o where length(trim(coalesce(o->>'text',''))) not between 1 and 1000
 or length(coalesce(o->>'id','')) not between 2 and 100 or jsonb_typeof(o->'isCorrect') is distinct from 'boolean')
 or (select count(distinct o->>'id') from jsonb_array_elements(p->'options') o)<>jsonb_array_length(p->'options')
 or not exists(select 1 from jsonb_array_elements(p->'options') o where o->>'isCorrect'='true') then raise exception 'Invalid options'; end if;
end; $$;

create function medqcm_private.sync_catalog(p_module text) returns void language plpgsql set search_path='' as $$
declare m public.curriculum_modules; qs jsonb;
begin
 select * into m from public.curriculum_modules where id=p_module for update;
 select coalesce(jsonb_agg(v.payload||jsonb_build_object('id',q.legacy_key,'versionId',v.id,'contentQuestionId',q.id) order by q.id),'[]') into qs
 from public.content_questions q join public.question_versions v on v.question_id=q.id
 where q.module_id=m.id and v.status=case when m.catalog_mode='sample' then 'sample' else 'published' end;
 insert into public.training_catalog(module_id,module_name,questions,requires_subscription)
 values(m.id,m.title,qs,m.requires_subscription)
 on conflict(module_id) do update set module_name=excluded.module_name,questions=excluded.questions,requires_subscription=excluded.requires_subscription;
end; $$;

create function public.curriculum_overview() returns jsonb language sql stable security definer set search_path='' as $$
 select jsonb_build_object('releases',coalesce((select jsonb_agg(to_jsonb(r) order by r.title) from public.curriculum_releases r where r.status<>'archived' or public.has_staff_capability('edit') or public.has_staff_capability('review')),'[]'),
 'modules',coalesce((select jsonb_agg(to_jsonb(m)||jsonb_build_object('question_count',coalesce(jsonb_array_length(c.questions),0),'reviewed',m.catalog_mode='published') order by m.study_year,m.category,m.title)
 from public.curriculum_modules m join public.curriculum_releases r on r.id=m.release_id left join public.training_catalog c on c.module_id=m.id where (m.active and r.status<>'archived') or public.has_staff_capability('edit') or public.has_staff_capability('review')),'[]'),
 'courses',coalesce((select jsonb_agg(to_jsonb(c) order by c.title) from public.curriculum_courses c join public.curriculum_modules m on m.id=c.module_id join public.curriculum_releases r on r.id=m.release_id where (c.active and m.active and r.status<>'archived') or public.has_staff_capability('edit') or public.has_staff_capability('review')),'[]')) where auth.uid() is not null;
$$;

create function public.manage_curriculum(p_action text,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb; mid text; rid uuid;
begin
 if not public.has_staff_capability('edit') and not(p_action='verify_release' and public.has_staff_capability('review')) then raise exception 'Content editor required'; end if;
 if p_action='release' then
 rid:=coalesce(nullif(p_data->>'id','')::uuid,gen_random_uuid());
 insert into public.curriculum_releases(id,title,faculty,academic_period) values(rid,p_data->>'title',p_data->>'faculty',p_data->>'academic_period')
 on conflict(id) do update set title=excluded.title,faculty=excluded.faculty,academic_period=excluded.academic_period,status='draft',verified_by=null,verified_at=null;
 result:=jsonb_build_object('id',rid);
 elsif p_action='verify_release' then
 if not public.has_staff_capability('review') then raise exception 'Reviewer required'; end if;
 update public.curriculum_releases set status='verified',source_reference=p_data->>'source',verified_by=auth.uid(),verified_at=now() where id=(p_data->>'id')::uuid returning to_jsonb(curriculum_releases) into result;
 elsif p_action='module' then
 mid:=coalesce(nullif(p_data->>'id',''),'module-'||gen_random_uuid());
 -- Moving an existing module would silently move purchased access: create a new ID instead.
 if exists(select 1 from public.curriculum_modules where id=mid and (release_id<>(p_data->>'release_id')::uuid or study_year<>(p_data->>'study_year')::integer)) then raise exception 'Create a new module to change its year or programme'; end if;
 insert into public.curriculum_modules(id,release_id,study_year,category,title,description,requires_subscription,active)
 values(mid,(p_data->>'release_id')::uuid,(p_data->>'study_year')::integer,p_data->>'category',p_data->>'title',coalesce(p_data->>'description',''),coalesce((p_data->>'requires_subscription')::boolean,false),coalesce((p_data->>'active')::boolean,true))
 on conflict(id) do update set category=excluded.category,title=excluded.title,description=excluded.description,requires_subscription=excluded.requires_subscription,active=excluded.active;
 perform medqcm_private.sync_catalog(mid); result:=jsonb_build_object('id',mid);
 elsif p_action='course' then
 if exists(select 1 from public.curriculum_courses where id=nullif(p_data->>'id','')::uuid and module_id<>p_data->>'module_id') then raise exception 'Create a new course to change its module'; end if;
 insert into public.curriculum_courses(id,module_id,title,active) values(coalesce(nullif(p_data->>'id','')::uuid,gen_random_uuid()),p_data->>'module_id',p_data->>'title',coalesce((p_data->>'active')::boolean,true))
 on conflict(id) do update set title=excluded.title,active=excluded.active returning to_jsonb(curriculum_courses) into result;
 else raise exception 'Unknown curriculum action'; end if;
 if result is null then raise exception 'Record unavailable'; end if;
 perform medqcm_private.audit('curriculum.'||p_action,coalesce(result->>'id',''),p_data);
 return result;
end; $$;

create function public.manage_question(p_action text,p_data jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare v public.question_versions; q public.content_questions; mid text; vid uuid; qid uuid;
begin
 if not (public.has_staff_capability('edit') or public.has_staff_capability('review')) then raise exception 'Staff required'; end if;
 if p_action='create' then
 if not public.has_staff_capability('edit') then raise exception 'Editor required'; end if;
 mid:=p_data->>'module_id';
 if nullif(p_data->>'question_id','') is not null then
 select * into q from public.content_questions where id=(p_data->>'question_id')::uuid for update;
 if not found or q.module_id<>mid then raise exception 'Question unavailable'; end if;
 else
 insert into public.content_questions(module_id,legacy_key) values(mid,'q-'||gen_random_uuid()) returning * into q;
 end if;
 insert into public.question_versions(question_id,version,payload,author_id)
 values(q.id,(select coalesce(max(version),0)+1 from public.question_versions where question_id=q.id),coalesce((select payload from public.question_versions where question_id=q.id order by version desc limit 1),'{}'),auth.uid()) returning * into v;
 else
 select * into v from public.question_versions where id=(p_data->>'id')::uuid for update;
 if not found then raise exception 'Version unavailable'; end if;
 select * into q from public.content_questions where id=v.question_id for update; mid:=q.module_id;
 if p_action='save' then
 if not public.has_staff_capability('edit') or v.status not in ('draft','rejected') then raise exception 'Version is not editable'; end if;
 perform medqcm_private.validate_question(p_data->'payload');
 if nullif(p_data->>'course_id','') is not null and not exists(select 1 from public.curriculum_courses where id=(p_data->>'course_id')::uuid and module_id=mid and active) then raise exception 'Invalid course'; end if;
 update public.question_versions set payload=(p_data->'payload')||jsonb_build_object('id',q.legacy_key),course_id=nullif(p_data->>'course_id','')::uuid,
 rights_reference=coalesce(p_data->>'rights_reference',''),author_id=auth.uid(),status='draft',reviewer_id=null,reviewed_at=null,updated_at=now() where id=v.id returning * into v;
 elsif p_action='submit' then
 if not public.has_staff_capability('edit') or v.status<>'draft' then raise exception 'Draft required'; end if;
 perform medqcm_private.validate_question(v.payload);
 if length(trim(v.rights_reference))<3 or length(trim(coalesce(v.payload->>'explanation','')))<3 then raise exception 'Source permission and explanation required'; end if;
 update public.question_versions set status='in_review',updated_at=now() where id=v.id returning * into v;
 elsif p_action in ('approve','reject') then
 if not public.has_staff_capability('review') or v.status<>'in_review' or v.author_id=auth.uid() then raise exception 'Independent medical reviewer required'; end if;
 if length(trim(coalesce(p_data->>'note','')))<3 then raise exception 'Review note required'; end if;
 update public.question_versions set status=case when p_action='approve' then 'approved' else 'rejected' end,
 reviewer_id=auth.uid(),reviewed_at=now(),review_note=p_data->>'note',updated_at=now() where id=v.id returning * into v;
 elsif p_action='publish' then
 if not public.has_staff_capability('review') or v.status<>'approved' then raise exception 'Approved version required'; end if;
 if not exists(select 1 from public.curriculum_modules m join public.curriculum_releases r on r.id=m.release_id where m.id=mid and m.active and r.status='verified') then raise exception 'Verify the programme before publishing'; end if;
 update public.question_versions set status='superseded' where question_id=q.id and status='published';
 update public.question_versions set status='published',updated_at=now() where id=v.id returning * into v;
 update public.curriculum_modules set catalog_mode='published' where id=mid;
 perform medqcm_private.sync_catalog(mid);
 elsif p_action='withdraw' then
 if not public.has_staff_capability('review') or v.status not in ('published','superseded') or length(trim(coalesce(p_data->>'note','')))<3 then raise exception 'Withdrawal reason required'; end if;
 update public.question_versions set status='withdrawn',updated_at=now() where id=v.id returning * into v;
 insert into public.content_notices(version_id,reason) values(v.id,p_data->>'note');
 perform medqcm_private.sync_catalog(mid);
 else raise exception 'Unknown question action'; end if;
 end if;
 perform medqcm_private.audit('question.'||p_action,v.id::text,jsonb_build_object('question_id',v.question_id,'note',p_data->>'note'));
 return to_jsonb(v);
end; $$;

create function public.attempt_content_notices(p_id uuid) returns jsonb language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('question',q->>'questionText','reason',n.reason)),'[]')
 from public.training_attempts a cross join lateral jsonb_array_elements(a.questions) q
 join public.content_notices n on n.version_id::text=q->>'versionId'
 where a.id=p_id and a.user_id=auth.uid() and a.completed_at is not null;
$$;
revoke all on function public.curriculum_overview(),public.manage_curriculum(text,jsonb),public.manage_question(text,jsonb),public.attempt_content_notices(uuid) from public,anon;
grant execute on function public.curriculum_overview(),public.manage_curriculum(text,jsonb),public.manage_question(text,jsonb),public.attempt_content_notices(uuid) to authenticated;
commit;

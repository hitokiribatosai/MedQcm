# 🩺 MedQCM — Plateforme Médicale Interactive & Gamifiée (Style Duolingo)

MedQCM est une plateforme web moderne dédiée aux étudiants en médecine algériens (de la 1ère à la 7ème année + Préparation au Concours de Résidanat).

Inspirée par les mécanismes d'apprentissage interactifs de **Duolingo** et les plateformes médicales comme **CramQCM**, elle propose des parcours d'apprentissage sous forme de sentiers, des QCMs multi-sélection, un dépôt de polycopiés de cours PDF, des alertes de signalement d'erreurs et un système d'abonnement BaridiMob / CCP.

---

## 🚀 Fonctionnalités Clés

### 🎓 Côté Étudiant
- **Parcours d'apprentissage Gamifié (Snake Path)** : Nœuds d'entraînement tactiles 3D, coffres à trésor de gemmes, étapes d'évaluation clinique.
- **Moteur de QCM Avancé** :
  - Support des **questions à choix multiples** (cases à cocher multiples).
  - Raccourcis clavier (touches `1` à `5` pour sélectionner, `Entrée` pour valider).
  - Tiroir de célébration animé et **carillons Web Audio API** natifs.
  - Bouton **« Signaler une erreur »** intégré pour notifier directement les administrateurs.
- **Dépôt des Cours (Digital Library)** : Téléchargement direct des polycopiés PDF officiels classés par année et module.
- **HUD Gamification** : Flammes de régularité 🔥, Gemmes médicales 💎, Vies ❤️, Rang de ligue.
- **Profil Utilisateur Complet** : Édition du nom, date de naissance, faculté de médecine (Alger, Oran, Constantine, etc.), année d'étude et personnalisation d'avatar.
- **Abonnement Simple & Transparent** : 1er module gratuit, paiement BaridiMob / CCP avec e-mail de réception `medqcmpay@gmail.com` copiable en 1 clic.

### 🛡️ Côté Administrateur
- **Gestion des Validations de Paiement** : Suivi des transactions BaridiMob avec lien de recherche instantanée sur Gmail.
- **Dépôt des Polycopiés PDF** : Upload de fichiers de cours par année/module + raccourci de génération automatique de QCMs via IA.
- **Modération des Signalements** : File d'attente des erreurs de questions signalées par les étudiants avec actions de correction rapide.
- **Banque de QCMs** : Interface de création, édition et organisation des questions.

---

## 🛠️ Stack Technologique

- **Framework** : [Next.js 16 (App Router)](https://nextjs.org/) + TypeScript
- **Styling** : [Tailwind CSS v4](https://tailwindcss.com/) + Boutons tactiles 3D Duolingo
- **Base de données & Auth** : [Supabase](https://supabase.com/) + [Drizzle ORM](https://orm.drizzle.team/)
- **Internationalisation** : [next-intl](https://next-intl-docs.vercel.app/) (Français / Anglais)
- **Audio** : Web Audio API HTML5 natif (sans dépendance externe)
- **Icônes** : [Lucide React](https://lucide.dev/)

---

## 💻 Démarrage Rapide en Local

```bash
# 1. Cloner le dépôt
git clone https://github.com/YOUR_USERNAME/MedQCM.git
cd MedQCM

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000/fr](http://localhost:3000/fr) dans votre navigateur.

# Registre des décisions (EDR)

Trace des décisions structurantes de Deck-Legacy, pour ne jamais les oublier ni les contredire.

## Règles du registre

1. **On ne supprime jamais une entrée.** Le texte d'une entrée existante n'est plus modifié, sauf sa ligne `Statut`.
2. Une décision qui change donne lieu à une **nouvelle entrée** (nouvel ID) ; l'ancienne passe à `Statut : Dépréciée par EDR-XXX` et la nouvelle porte `Remplace : EDR-YYY`.
3. Les IDs sont séquentiels et jamais réutilisés.
4. Avant toute décision structurante (outil, architecture, process, règle de jeu, positionnement), relire ce registre. Une proposition qui contredit une décision active doit le dire explicitement et passer par une nouvelle entrée validée par l'utilisateur.
5. `⚠ À confirmer` signale une information non vérifiée : on la complète quand l'utilisateur l'a confirmée, sans changer le sens de la décision.

## Index

| ID      | Date       | Titre                                       | Statut                                  |
| ------- | ---------- | ------------------------------------------- | --------------------------------------- |
| EDR-001 | 2026-03-22 | Jeu solo de deck-building médiéval          | Active                                  |
| EDR-002 | 2026-03-22 | Application web React + Vite                | Dépréciée par EDR-020                   |
| EDR-003 | 2026-03-22 | État de jeu par event sourcing              | Active                                  |
| EDR-004 | 2026-03-22 | Cartes décrites en données déclaratives     | Active                                  |
| EDR-005 | 2026-03-22 | TypeScript strict, zéro warning             | Active                                  |
| EDR-006 | 2026-03-24 | Jeu bilingue anglais et français            | Active                                  |
| EDR-007 | 2026-04-02 | Une stratégie par type d'effet              | Active                                  |
| EDR-008 | 2026-04-02 | Tests Vitest, couverture moteur 80 %        | Active                                  |
| EDR-009 | 2026-04-02 | Storybook comme catalogue de composants     | Active                                  |
| EDR-010 | 2026-04-02 | Documentation dédiée aux assistants IA      | Active                                  |
| EDR-011 | 2026-04-02 | Client web hébergé sur GitHub Pages         | Active, en partie remplacée par EDR-039 |
| EDR-012 | 2026-04-05 | Hook pre-commit bloquant (Husky)            | Active                                  |
| EDR-013 | 2026-04-09 | Styles Tailwind CSS v4                      | Dépréciée par EDR-021                   |
| EDR-014 | 2026-04-10 | Couches imposées par dependency-cruiser     | Active                                  |
| EDR-015 | 2026-04-12 | Analyse qualité continue SonarCloud         | Active                                  |
| EDR-016 | 2026-05-01 | Dépendances suivies par Dependabot          | Active                                  |
| EDR-017 | 2026-05-13 | Tutoriel hors du journal d'événements       | Dépréciée par EDR-040                   |
| EDR-018 | 2026-05-17 | Versions bêta en semver                     | Active                                  |
| EDR-019 | 2026-05-19 | Illustrations hébergées dans le dépôt       | Active                                  |
| EDR-020 | 2026-10-10 | Client Expo / React Native multiplateforme  | Active                                  |
| EDR-021 | 2026-10-10 | Styles NativeWind (syntaxe Tailwind v3)     | Active                                  |
| EDR-022 | 2026-10-10 | Monorepo pnpm avec paquets partagés         | Active                                  |
| EDR-023 | 2026-10-10 | Moteur de jeu côté serveur uniquement       | Dépréciée par EDR-024                   |
| EDR-024 | 2026-10-10 | Local-first, serveur valide par rejeu       | Active                                  |
| EDR-025 | 2026-10-10 | Compatibilité ascendante des rejeux         | Active                                  |
| EDR-026 | 2026-10-10 | API NestJS 11 en CommonJS                   | Active                                  |
| EDR-027 | 2026-10-10 | PostgreSQL et Prisma pour la persistance    | Active                                  |
| EDR-028 | 2026-10-10 | Supabase Auth avec invités anonymes         | Active                                  |
| EDR-029 | 2026-10-10 | Synchronisation : dernier écrivain gagne    | En partie remplacée par EDR-038, 041    |
| EDR-030 | 2026-10-10 | Scores issus du rejeu, classement inscrits  | Active                                  |
| EDR-031 | 2026-10-10 | Code et documentation du dépôt en anglais   | Active                                  |
| EDR-032 | 2026-10-10 | Système d'agents spécialisés et contrats    | Active                                  |
| EDR-033 | 2026-10-10 | Projet personnel gratuit, hors stores       | Active                                  |
| EDR-034 | 2026-10-10 | Serveur hébergé sur Supabase                | Dépréciée par EDR-035                   |
| EDR-035 | 2026-10-10 | API sur Cloud Run, données Supabase         | Active                                  |
| EDR-036 | 2026-10-10 | Anciennes règles pour parties commencées    | Active                                  |
| EDR-037 | 2026-10-10 | Fusion soumise à la relecture du mainteneur | Active                                  |
| EDR-038 | 2026-10-10 | Plusieurs royaumes par joueur               | Active                                  |
| EDR-039 | 2026-10-11 | Déploiement déclenché par un tag de version | Active                                  |
| EDR-040 | 2026-10-11 | Tutoriel joué comme une vraie partie        | Active                                  |
| EDR-041 | 2026-10-13 | Synchronisation incrémentale et versionnée  | Active                                  |

---

ID : EDR-001
Date : 2026-03-22
Titre : Jeu solo de deck-building médiéval
Statut : Active

Contexte
Le projet démarre comme un jeu de cartes jouable sur écran. Le README le décrit comme un deck-builder solitaire à thème médiéval, avec progression de type roguelike : chaque manche ajoute des cartes, les cartes évoluent par états (ex. Wild Grass → Plains → Farmlands) et le but est de maximiser la Gloire.

Problème
Quel type de jeu construire et pour combien de joueurs ?

Décision
Deck Legacy est un jeu **solo** de deck-building, sans multijoueur. La compétition entre joueurs passe uniquement par un classement des scores (EDR-030). Les règles de référence sont `apps/client/src/data/locales/rules.*.md` et les textes de carte.

Alternatives rejetées

- Non documentées.

Conséquences

- Aucune logique de tour entre joueurs ni de temps réel : une partie est un journal d'événements d'un seul joueur.
- Origine (confirmé le 2026-10-10) : toutes les cartes sont des adaptations d'un jeu existant ; ce n'est pas une création originale. Le cadre du projet (personnel, gratuit, sans stores) est fixé par EDR-033.

---

ID : EDR-002
Date : 2026-03-22
Titre : Application web React + Vite
Statut : Dépréciée par EDR-020

Contexte
Premier commit : application React 19 en TypeScript, bundlée avec Vite, jouable dans le navigateur, sauvegarde dans le navigateur.

Problème
Sur quelle plateforme et avec quelle stack livrer le jeu ?

Décision
Application web monopage React + Vite, sans serveur.

Alternatives rejetées

- Non documentées.

Conséquences

- Mise en ligne simple sur un hébergement statique (EDR-011).
- Pas d'application mobile native, ni de synchronisation entre appareils.

---

ID : EDR-003
Date : 2026-03-22
Titre : État de jeu par event sourcing
Statut : Active

Contexte
Le jeu a besoin d'un retour arrière (undo) sur n'importe quelle action et de sauvegardes fiables. Un journal d'événements existe dès le premier commit (`EventLog`) ; `GameAggregate` a été nettoyé le 2026-03-29.

Problème
Comment représenter et faire évoluer l'état d'une partie ?

Décision
L'état (`GameState`) est reconstruit en rejouant une liste ordonnée de `GameEvent`. On ne mute jamais l'état : on ajoute un événement. Le hasard (mélanges) est tiré à l'exécution d'une commande et stocké dans l'événement, pour que le rejeu soit déterministe. Le retour arrière retire le dernier événement et rejoue le reste.

Alternatives rejetées

- Non documentées.

Conséquences

- Undo gratuit, sauvegarde = journal d'événements, rejeu possible côté serveur (EDR-024).
- Toute évolution du moteur ou des données doit rester compatible avec les journaux existants (EDR-025).
- Les états intermédiaires (choix en attente, amélioration en cours) vivent en mémoire, hors journal.

---

ID : EDR-004
Date : 2026-03-22
Titre : Cartes décrites en données déclaratives
Statut : Active

Contexte
Le jeu compte plus de 120 cartes, chacune avec plusieurs états, productions, actions, passifs, améliorations et pistes. Coder chaque carte à la main rendrait le moteur ingérable.

Problème
Comment définir le contenu des cartes ?

Décision
Chaque carte est un objet `CardDef` typé (un fichier par carte, aujourd'hui dans `packages/game-data/src/cards/<id>.ts`), interprété par un moteur générique. Les noms et textes affichés viennent des fichiers de traduction, pas de `CardDef.name`. Les ids des cartes, états, actions et effets sont stables (format d'action `<cardId>-<stateId>-<n>`).

Alternatives rejetées

- Non documentées.

Conséquences

- Ajouter une carte ne touche pas au moteur tant que ses mécaniques existent (skill `add-card`).
- Une mécanique nouvelle impose d'abord une évolution du moteur.
- Les ids font partie du format des sauvegardes : on ne les renumérote jamais (EDR-025).

---

ID : EDR-005
Date : 2026-03-22
Titre : TypeScript strict, zéro warning
Statut : Active

Contexte
Projet TypeScript dès le premier commit, avec ESLint et Prettier. Les règles se sont durcies ensuite (typescript-eslint `strict`, sonarjs, `consistent-type-imports`, `eqeqeq`).

Problème
Quel niveau d'exigence appliquer au code ?

Décision
TypeScript en mode strict partout. ESLint avec une politique **zéro warning** (un warning fait échouer la CI), Prettier appliqué comme erreur de lint. `any` toléré seulement pour les conversions JSON (warning), jamais dans la logique du moteur.

Alternatives rejetées

- Non documentées.

Conséquences

- Plusieurs commits « fix lint / fix sonar » : la qualité est rattrapée a posteriori quand on ne lance pas `pnpm verify` avant de committer.
- Toute nouvelle règle passée en warning devient de fait bloquante.

---

ID : EDR-006
Date : 2026-03-24
Titre : Jeu bilingue anglais et français
Statut : Active

Contexte
Les fichiers de traduction anglais et français ont été ajoutés deux jours après le premier commit.

Problème
Dans quelles langues proposer le jeu ?

Décision
Le jeu est en anglais (`en`) et en français (`fr`) avec i18next. Toute chaîne d'interface, tout texte de carte et les règles existent dans les deux langues, avec exactement les mêmes clés. Les erreurs de règle du moteur (`CommandError`) sont des clés de traduction.

Alternatives rejetées

- Non documentées.

Conséquences

- Chaque ajout de carte ou d'écran coûte une double rédaction.
- Les fichiers de traduction ne gardent que les clés réellement utilisées.

---

ID : EDR-007
Date : 2026-04-02
Titre : Une stratégie par type d'effet
Statut : Active

Contexte
Les effets de carte (ajouter des ressources, défausser, découvrir, améliorer, etc.) se multipliaient dans l'agrégat de jeu, dont la complexité cognitive était signalée par Sonar.

Problème
Comment organiser l'exécution des effets de carte ?

Décision
Pattern Strategy : une classe par `ActionEffectType` (`packages/engine/src/application/cardAction/`), enregistrée dans `CardActionContext`. Un nouveau type d'effet = une nouvelle stratégie + son enregistrement + ses tests.

Alternatives rejetées

- Logique centralisée dans `GameAggregate` : abandonnée pour sa complexité (refactor `useCardEffect` du 2026-04-16).

Conséquences

- Chaque effet est isolé et testable seul.
- Le nombre de fichiers augmente (21 stratégies aujourd'hui).

---

ID : EDR-008
Date : 2026-04-02
Titre : Tests Vitest, couverture moteur 80 %
Statut : Active

Contexte
Les règles du jeu sont nombreuses et les régressions fréquentes (beaucoup de correctifs par carte). Les tests des stratégies et des seuils de couverture arrivent le 2026-04-02.

Problème
Comment garantir que les règles restent correctes ?

Décision
Vitest avec couverture v8. Moteur : 80 % lignes, fonctions, branches et instructions ; serveur : 80 % sauf 60 % de branches. Toute nouvelle fonction ou branche du moteur est couverte. Les tests du moteur utilisent des fixtures minimales, jamais les vraies données de jeu.

Alternatives rejetées

- Non documentées.

Conséquences

- Les seuils bloquent la CI ; ils ne doivent pas être abaissés pour faire passer un changement.
- Le client n'a pas de seuil de couverture (exclu de la couverture Sonar).

---

ID : EDR-009
Date : 2026-04-02
Titre : Storybook comme catalogue de composants
Statut : Active

Contexte
L'interface compte de nombreux composants de jeu (cartes, pistes, modales) difficiles à atteindre en jouant.

Problème
Comment développer et vérifier les composants d'interface isolément ?

Décision
Chaque composant visuel a ses stories Storybook. Depuis la migration Expo (EDR-020), Storybook tourne sur l'appareil (`.rnstorybook`) et `GameProvider initialState` affiche un plateau statique sans session.

Alternatives rejetées

- Non documentées.

Conséquences

- Les stories doivent suivre l'évolution des composants (à régénérer avec `storybook:generate`).
- Le déploiement public de Storybook sur GitHub Pages (2026-04-02) n'existe plus dans `deploy.yml`, qui ne publie que le client web.

---

ID : EDR-010
Date : 2026-04-02
Titre : Documentation dédiée aux assistants IA
Statut : Active

Contexte
Le projet est développé avec l'aide d'assistants IA (Claude Code). Une première version de `ARCHITECTURE.md` a été supprimée le 2026-03-29 ; `CLAUDE.md` a été ajouté le 2026-04-02.

Problème
Comment transmettre l'architecture et les conventions aux assistants IA ?

Décision
Un `CLAUDE.md` racine (règles transverses, moteur), plus un `CLAUDE.md` par application (client, serveur), tenus à jour à chaque changement structurant. Les workflows répétitifs deviennent des skills (`.claude/skills/`).

Alternatives rejetées

- `ARCHITECTURE.md` séparé : supprimé le 2026-03-29.

Conséquences

- La documentation fait partie de la définition de « terminé » d'un changement structurant.
- Une doc périmée induit l'assistant en erreur : la skill `add-card` précise déjà de suivre les cartes existantes plutôt que des docs anciennes.

---

ID : EDR-011
Date : 2026-04-02
Titre : Client web hébergé sur GitHub Pages
Statut : Active

Contexte
Le jeu doit être jouable publiquement sans infrastructure à gérer.

Problème
Où héberger la version web ?

Décision
Le client web est exporté en statique et publié sur GitHub Pages (`https://kevcordier.github.io/Deck-Legacy/`) par `deploy.yml` à chaque push sur `main`, après la CI.

Alternatives rejetées

- Non documentées.

Conséquences

- Le chemin de base `/Deck-Legacy/` est imposé, en développement compris.
- La branche de déploiement est `main` ; `master` est une ancienne branche figée.
- L'hébergement du serveur est traité par EDR-034 ; aucun déploiement par la CI pour l'instant.

---

ID : EDR-012
Date : 2026-04-05
Titre : Hook pre-commit bloquant (Husky)
Statut : Active

Contexte
Les erreurs de lint, de types ou de tests étaient découvertes en CI.

Problème
Comment empêcher qu'un commit casse les vérifications ?

Décision
Husky + lint-staged : avant chaque commit, ESLint (auto-fix) et Prettier sur les fichiers indexés, puis `pnpm typecheck`, `pnpm depcruise` et `pnpm test`. On ne contourne jamais le hook (`--no-verify` interdit) ; on lance `pnpm verify` avant de committer.

Alternatives rejetées

- Non documentées.

Conséquences

- Les commits sont plus lents, surtout depuis le monorepo.
- La CI rejoue les mêmes portes et y ajoute la couverture et le build serveur.

---

ID : EDR-013
Date : 2026-04-09
Titre : Styles Tailwind CSS v4
Statut : Dépréciée par EDR-021

Contexte
Le client web utilisait des fichiers CSS par composant (premier commit). Une refonte du style a eu lieu le 2026-04-09.

Problème
Comment styliser l'interface de manière cohérente ?

Décision
Tailwind CSS v4 (plugin Vite) à la place des fichiers CSS par composant, avec tri automatique des classes par `prettier-plugin-tailwindcss`.

Alternatives rejetées

- Fichiers CSS par composant : abandonnés lors de la refonte.

Conséquences

- Design tokens centralisés.
- Incompatible avec React Native : remplacé par NativeWind lors de la migration (EDR-021).

---

ID : EDR-014
Date : 2026-04-10
Titre : Couches imposées par dependency-cruiser
Statut : Active

Contexte
Le moteur doit rester pur et réutilisable. Depuis le monorepo, il tourne à la fois dans le client (React Native) et dans le serveur (Node).

Problème
Comment empêcher le moteur et les applications de se coupler ?

Décision
Règles d'architecture vérifiées par dependency-cruiser (`pnpm depcruise`, bloquant) : le domaine n'importe rien de l'application ; l'application n'importe que le domaine ; les paquets n'importent jamais `apps/` ; client et serveur ne s'importent pas ; `game-data` n'importe que les types et enums du domaine. Aucune API navigateur (DOM, `localStorage`) dans les paquets partagés.

Alternatives rejetées

- Non documentées.

Conséquences

- Toute logique de jeu va dans le moteur, jamais dans un composant React ou un service NestJS.
- Le code partagé entre client et serveur passe par `packages/`.

---

ID : EDR-015
Date : 2026-04-12
Titre : Analyse qualité continue SonarCloud
Statut : Active

Contexte
Besoin d'un indicateur externe de qualité et de couverture, affiché en badge dans le README.

Problème
Comment suivre la dette technique et la couverture dans le temps ?

Décision
SonarCloud (projet `kevcordier_Deck-Legacy`) analyse le moteur, le contrat, le serveur et le client, à partir des rapports de couverture du moteur et du serveur. Le client est exclu de la couverture, le code généré de l'analyse. Côté ESLint, les règles sonarjs `todo-tag` et `no-commented-code` sont désactivées (2026-04-18).

Alternatives rejetées

- Non documentées.

Conséquences

- Une partie du flux de commits sert à corriger des alertes Sonar après coup.
- La configuration (`sonar-project.properties`) doit suivre la structure du monorepo.

---

ID : EDR-016
Date : 2026-05-01
Titre : Dépendances suivies par Dependabot
Statut : Active

Contexte
Le projet dépend de nombreuses bibliothèques à jour (React 19, Storybook 10, TypeScript 6, ESLint 9…).

Problème
Comment garder les dépendances à jour sans veille manuelle ?

Décision
Dependabot, en mode quotidien, sur l'écosystème `npm` à la racine (passé de `pnpm` à `npm` le 2026-05-01).

Alternatives rejetées

- Écosystème `pnpm` dans Dependabot : remplacé par `npm` le 2026-05-01, en préparation de l'évolution vers un monorepo (confirmé le 2026-10-10).

Conséquences

- Flux continu de PR de mise à jour (beaucoup de branches `dependabot/*` ouvertes).
- Les montées de version majeures demandent une validation explicite (voir `dependency-steward`).

---

ID : EDR-017
Date : 2026-05-13
Titre : Tutoriel hors du journal d'événements
Statut : Dépréciée par EDR-040

Contexte
Le tutoriel doit mettre le joueur dans des situations scénarisées que les règles normales ne produisent pas.

Problème
Comment intégrer un tutoriel sans corrompre le modèle par événements ?

Décision
Les parties tutoriel modifient l'état hors événements. Elles ne sont donc **jamais sauvegardées ni synchronisées**. Les étapes sont définies dans `TutorialProvider`, et les zones ciblées sont marquées par `<TutorialTarget id>`.

Alternatives rejetées

- Non documentées.

Conséquences

- Le tutoriel n'est pas rejouable par le serveur et ne compte pour aucun score.
- Avec le tutoriel activé, une sauvegarde existante rouvre le tutoriel.

---

ID : EDR-018
Date : 2026-05-17
Titre : Versions bêta en semver
Statut : Active

Contexte
Le jeu est devenu jouable de bout en bout ; une première version a été posée le 2026-05-17 (`1.0.0-beta.1`).

Problème
Comment numéroter les livraisons ?

Décision
Versionnement sémantique en pré-version bêta (`1.0.0-beta.N`, actuellement `beta.3`), porté par le `package.json` racine et celui du client.

Alternatives rejetées

- Non documentées.

Conséquences

- Critère de sortie de la `1.0.0` (confirmé le 2026-10-10) : toutes les extensions (add-ons) manquantes sont implémentées.
- Ce qui déclenche une nouvelle bêta n'est pas défini.
- Les deux `package.json` doivent rester alignés (la racine porte un préfixe `v`, pas le client).

---

ID : EDR-019
Date : 2026-05-19
Titre : Illustrations hébergées dans le dépôt
Statut : Active

Contexte
Les cartes référençaient des illustrations externes (wiki, Wikimedia), dont la disponibilité n'était pas garantie.

Problème
Où stocker les illustrations des cartes ?

Décision
Les illustrations sont des fichiers locaux `cards/<id>_<stateId>.jpg`, aujourd'hui dans `apps/client/assets/cards/`. Elles sont embarquées dans l'application pour le jeu hors ligne et listées dans `illustrations.ts` (généré).

Alternatives rejetées

- URL externes : remplacées le 2026-05-19.

Conséquences

- Le poids du dépôt et de l'application augmente à chaque carte.
- Droits (confirmé le 2026-10-10) : les illustrations sont générées par IA ou libres de droits. Toute nouvelle illustration doit respecter cette règle.

---

ID : EDR-020
Date : 2026-10-10
Titre : Client Expo / React Native multiplateforme
Statut : Active
Remplace : EDR-002

Contexte
Le jeu doit tourner sur iOS et Android en plus du web, avec une seule base de code. Migration en cours sur la branche `chore/react-native-version`.

Problème
Comment livrer le jeu sur mobile et sur le web ?

Décision
Client React Native 0.86 / Expo SDK 57 pour iOS, Android et le web (react-native-web). Uniquement des primitives React Native (pas d'éléments DOM).

Alternatives rejetées

- Garder l'application web React + Vite (EDR-002) : pas d'application mobile native.
- Aucune autre option étudiée (confirmé le 2026-10-10) : React Native a été choisi pour expérimenter cette technologie ; Expo a été proposé par l'assistant (Claude).

Conséquences

- Réécriture de l'interface et des stories ; le client web est désormais un export statique Expo.
- Contraintes de React Native : pas de cascade des styles de texte, pas de grille CSS ni de `hover:`.

---

ID : EDR-021
Date : 2026-10-10
Titre : Styles NativeWind (syntaxe Tailwind v3)
Statut : Active
Remplace : EDR-013

Contexte
La migration vers React Native (EDR-020) rend Tailwind v4 inutilisable tel quel, alors qu'on veut garder l'approche par classes utilitaires.

Problème
Comment styliser l'interface React Native en gardant Tailwind ?

Décision
NativeWind 4, avec la syntaxe Tailwind **v3**. Les tokens sont dans `tailwind.config.js` et les variables de thème dans `src/styles/global.css`, seul fichier CSS. Les noms de classes sont toujours littéraux complets (jamais de concaténation).

Alternatives rejetées

- Tailwind v4 : non pris en charge par NativeWind 4.

Conséquences

- Les PR Dependabot vers `tailwindcss` 4.x ne s'appliquent pas au client.
- Pour surcharger un style, on expose une prop plutôt que de compter sur l'ordre des classes.

---

ID : EDR-022
Date : 2026-10-10
Titre : Monorepo pnpm avec paquets partagés
Statut : Active

Contexte
L'ajout d'un serveur et d'un client mobile impose de partager le moteur, les données de jeu et le contrat HTTP sans dupliquer de code.

Problème
Comment organiser plusieurs applications qui exécutent le même moteur ?

Décision
Monorepo pnpm : `apps/client`, `apps/server`, `packages/engine`, `packages/game-data`, `packages/api-contract`. Les paquets exposent leurs sources TypeScript (condition `source`) aux outils et du CommonJS compilé (`dist/`) au serveur. Réglages pnpm dans `pnpm-workspace.yaml` (`nodeLinker: hoisted`), Node 20 (`.nvmrc`).

Alternatives rejetées

- Non documentées.

Conséquences

- Après une modification d'un paquet, le serveur doit être reconstruit (`pnpm build:packages`).
- Client et serveur doivent tourner avec la même version du moteur et des données.

---

ID : EDR-023
Date : 2026-10-10
Titre : Moteur de jeu côté serveur uniquement
Statut : Dépréciée par EDR-024

Contexte
Lors de la conception du découpage client/serveur, il fallait décider où s'exécutent les règles du jeu.

Problème
Le serveur doit-il être l'autorité qui exécute chaque commande de jeu ?

Décision
Premier choix : le moteur tourne uniquement sur le serveur, et le client envoie chaque commande.

Alternatives rejetées

- Moteur côté client : écarté dans ce premier choix, puis retenu le jour même (EDR-024).

Conséquences

- Jeu impossible hors ligne. C'est la raison de l'abandon, le jour même.

---

ID : EDR-024
Date : 2026-10-10
Titre : Local-first, serveur valide par rejeu
Statut : Active
Remplace : EDR-023

Contexte
Le jeu doit rester jouable hors ligne (« garde le moteur de jeu côté client pour permettre de jouer hors ligne »), tout en offrant comptes, synchronisation entre appareils et classement.

Problème
Comment concilier jeu hors ligne et serveur de référence ?

Décision
Le client exécute `GameSession` et sauvegarde sur l'appareil ; il n'attend jamais le réseau pour jouer. En ligne, il envoie le journal complet de chaque partie (`PUT /games/:id`). Le serveur le rejoue avec `GameSession.restore()` pour le valider, le stocke et calcule les scores. Le serveur n'exécute jamais de commande de joueur.

Alternatives rejetées

- Moteur côté serveur uniquement (EDR-023) : pas de jeu hors ligne.

Conséquences

- Jouer hors ligne compte plus que l'autorité du serveur : un client modifié peut forger des événements cohérents. Le rejeu prouve la cohérence d'un journal, pas l'honnêteté de la partie.
- Ne pas réintroduire de dépendance au réseau pour jouer ; un besoin anti-triche doit être arbitré explicitement.

---

ID : EDR-025
Date : 2026-10-10
Titre : Compatibilité ascendante des rejeux
Statut : Active

Contexte
Les sauvegardes locales et les journaux stockés sur le serveur sont rejoués avec le code **actuel** du moteur et des données (EDR-003, EDR-024). Un journal qui ne se rejoue plus est refusé (`422 INVALID_GAME`).

Problème
Comment faire évoluer règles et cartes sans casser les parties existantes ?

Décision
Toute modification du moteur, des données de jeu ou du modèle `GameEvent` doit garder les anciens journaux rejouables : pas de renumérotation d'ids, anciens événements toujours gérés, hasard stocké dans les événements. Le serveur est déployé avec le même moteur et les mêmes données que les clients. L'agent `replay-guardian` a un droit de veto ; un changement cassant n'est accepté que sur décision explicite de l'utilisateur.

Alternatives rejetées

- Non documentées.

Conséquences

- Les correctifs de cartes déjà jouées doivent être évalués pour leur effet sur les parties en cours.
- Politique en cas de changement cassant inévitable : voir EDR-036.

---

ID : EDR-026
Date : 2026-10-10
Titre : API NestJS 11 en CommonJS
Statut : Active

Contexte
Le serveur de synchronisation consomme les paquets du monorepo, dont le moteur, qui utilise des imports sans extension.

Problème
Quel framework et quel format de modules pour l'API ?

Décision
NestJS 11 en CommonJS. Le contrat HTTP est défini d'abord dans `@deck-legacy/api-contract` (schémas zod), puis implémenté côté serveur et côté client. Toutes les routes exigent un jeton, sauf celles marquées `@Public()` ; les erreurs ont toujours la forme `ApiErrorBody`.

Alternatives rejetées

- NestJS 12 : uniquement ESM, incompatible avec les imports sans extension du moteur.

Conséquences

- Montée vers NestJS 12 bloquée tant que le moteur n'est pas compatible ESM.

---

ID : EDR-027
Date : 2026-10-10
Titre : PostgreSQL et Prisma pour la persistance
Statut : Active

Contexte
Le serveur stocke les utilisateurs, les parties, leurs journaux d'événements et les scores.

Problème
Quelle base de données et quel ORM utiliser ?

Décision
PostgreSQL (Docker en local) avec Prisma 7 et l'adaptateur `@prisma/adapter-pg`. Les événements sont stockés en `jsonb` par (`gameId`, `seq`) ; le journal n'est réécrit qu'à partir du premier événement qui diffère. Une migration appliquée n'est jamais modifiée.

Alternatives rejetées

- Non documentées.

Conséquences

- `jsonb` réordonne les clés : on compare les événements par contenu, jamais par chaîne sérialisée.
- `prisma generate` est nécessaire après chaque changement de schéma.
- Hébergement de production : voir EDR-034.

---

ID : EDR-028
Date : 2026-10-10
Titre : Supabase Auth avec invités anonymes
Statut : Active

Contexte
On veut synchroniser les parties sans obliger le joueur à créer un compte avant de jouer.

Problème
Comment authentifier les joueurs sans friction ?

Décision
Supabase Auth : une session invitée (anonyme) est ouverte au premier lancement et peut ensuite être rattachée à un e-mail. Le serveur vérifie les jetons (JWKS, ou secret HS256 historique). Sans configuration Supabase, l'application fonctionne hors ligne, sans compte.

Alternatives rejetées

- Non documentées.

Conséquences

- L'authentification ne bloque jamais le jeu (nouvel essai toutes les 30 s hors ligne).
- Les invités synchronisent et ont des scores, mais n'apparaissent pas au classement (EDR-030).

---

ID : EDR-029
Date : 2026-10-10
Titre : Synchronisation : dernier écrivain gagne
Statut : Active ; le point « une seule partie en cours par joueur » est remplacé par EDR-038, le « dernier écrivain gagne » par EDR-041 (sauf pour les anciens clients)

Contexte
Un joueur peut jouer sur plusieurs appareils, hors ligne, puis se reconnecter.

Problème
Comment résoudre les conflits entre sauvegarde locale et sauvegarde serveur ?

Décision
Le dernier écrivain gagne : les modifications locales non synchronisées priment et sont envoyées ; sinon, la partie du serveur est adoptée. Une seule partie en cours par joueur. Les synchronisations d'une même partie sont sérialisées par un verrou en mémoire, ce qui suppose **une seule instance** du serveur.

Alternatives rejetées

- Non documentées.

Conséquences

- Une sauvegarde synchronisée avec un autre compte est remplacée et ses modifications non synchronisées sont perdues.
- Passer à plusieurs instances du serveur imposera un verrou distribué.

---

ID : EDR-030
Date : 2026-10-10
Titre : Scores issus du rejeu, classement inscrits
Statut : Active

Contexte
Le classement doit refléter des parties valides, et le client n'est pas digne de confiance (EDR-024).

Problème
D'où viennent les scores et qui figure au classement ?

Décision
Le score, l'état « terminée » et les scores de campagne viennent du rejeu côté serveur, jamais du client. Le classement n'inclut que les joueurs inscrits (non anonymes). Les parties jouées avec le panneau de triche de développement sont refusées, sauf si le serveur tourne avec `ALLOW_CHEATS=true` (forcé à faux en production).

Alternatives rejetées

- Non documentées.

Conséquences

- Les scores restent falsifiables par un client modifié (limite assumée).
- Les scores sont segmentés par campagne (`base` ou extension).

---

ID : EDR-031
Date : 2026-10-10
Titre : Code et documentation du dépôt en anglais
Statut : Active

Contexte
Les premiers messages de commit mélangent français et anglais ; les échanges avec l'assistant se font en français.

Problème
Dans quelle langue écrire le code, la documentation et les fichiers du dépôt ?

Décision
Code, commentaires, documentation (`CLAUDE.md`, README, agents, contrats) et messages de commit en anglais. Les échanges avec l'assistant restent en français. Exception : ce registre est rédigé en français, à la demande de l'utilisateur.

Alternatives rejetées

- Non documentées.

Conséquences

- Les textes de jeu en français vivent uniquement dans les fichiers de traduction (EDR-006).

---

ID : EDR-032
Date : 2026-10-10
Titre : Système d'agents spécialisés et contrats
Statut : Active

Contexte
Les tâches récurrentes (bugs de carte, évolution du moteur, interface, API, dépendances) touchent des couches différentes, avec un risque transverse : casser le rejeu des parties.

Problème
Comment répartir le travail assisté par IA sans conflits ni régressions ?

Décision
Sept sub-agents Claude Code (`.claude/agents/`) : `rules-engineer`, `card-designer`, `client-developer`, `api-developer`, `dependency-steward`, et deux validateurs en lecture seule avec droit de veto, `replay-guardian` et `quality-gate`. Leurs interactions (propriété des fichiers, autorité, ordre, parallélisme) sont définies dans `.claude/contracts.md`. Les agents qui écrivent ont une mémoire `project`.

Alternatives rejetées

- Agent de diagnostic séparé (`rules-triage`) : fusionné dans `rules-engineer`, car le diagnostic demande l'expertise du moteur.
- Mémoire pour les validateurs : écartée, car elle leur donnerait des droits d'écriture.

Conséquences

- L'utilisateur reste seul décideur pour les commits, les changements cassants, les migrations et les versions majeures.
- Les contrats doivent évoluer avec la structure du dépôt.

---

ID : EDR-033
Date : 2026-10-10
Titre : Projet personnel gratuit, hors stores
Statut : Active

Contexte
Les cartes sont des adaptations d'un jeu existant (EDR-001) et les illustrations sont générées par IA ou libres de droits (EDR-019). Le client cible iOS, Android et le web (EDR-020).

Problème
Quel est le cadre de diffusion du projet ?

Décision
Deck Legacy est un projet **personnel et gratuit**. Aucune publication sur l'App Store ni sur Google Play n'est prévue ; la diffusion publique se fait par la version web (EDR-011).

Alternatives rejetées

- Non documentées.

Conséquences

- Aucune monétisation (achats, publicité, abonnement) : ces sujets sont hors périmètre.
- Les versions iOS et Android servent au développement et à l'usage personnel (Expo), sans processus de revue des stores ni signature de publication.
- Comme les règles sont adaptées d'un jeu existant, toute diffusion commerciale ou sur les stores remettrait en cause cette décision et devrait faire l'objet d'une nouvelle entrée.

---

ID : EDR-034
Date : 2026-10-10
Titre : Serveur hébergé sur Supabase
Statut : Dépréciée par EDR-035

Contexte
Supabase fournit déjà l'authentification (EDR-028). Il restait à choisir où héberger le serveur et la base PostgreSQL de production (EDR-011, EDR-027).

Problème
Où héberger le back-end en production ?

Décision
Le back-end de production est hébergé sur Supabase.

Alternatives rejetées

- Non documentées.

Conséquences

- La base PostgreSQL de production est celle du projet Supabase (`DATABASE_URL`), à côté de l'authentification.
- Limite constatée : Supabase héberge PostgreSQL et des Edge Functions (Deno), mais ne fait pas tourner un serveur NestJS (Node) en continu. Résolu par EDR-035.

---

ID : EDR-035
Date : 2026-10-10
Titre : API sur Cloud Run, données Supabase
Statut : Active
Remplace : EDR-034

Contexte
Supabase ne peut pas exécuter un serveur NestJS (Node) en continu (EDR-034). Le projet est personnel et gratuit (EDR-033) : il faut un hébergement gratuit pour l'API. Le jeu fonctionnant hors ligne (EDR-024), une API qui s'arrête quand elle n'est pas utilisée est acceptable.

Problème
Où exécuter l'API NestJS gratuitement, en gardant la base et l'authentification chez Supabase ?

Décision
L'API NestJS tourne sur **Google Cloud Run**, dans son offre gratuite. La base PostgreSQL de production et l'authentification restent sur **Supabase**. Le service Cloud Run est limité à **une instance** (`max-instances=1`) et peut s'arrêter sans trafic (`min-instances=0`).

Alternatives rejetées

- Render (gratuit sans carte, mais réveil d'environ une minute) : écarté au profit de Cloud Run, plus généreux et plus rapide au réveil.
- Oracle Cloud Always Free : machine virtuelle à administrer soi-même, peu de capacité disponible, machines inactives récupérables.
- Railway, Koyeb, Fly.io, Azure App Service F1 : offre gratuite trop limitée, payante ou instable.
- Edge Functions Supabase, Vercel, Cloudflare Workers, Deno Deploy : imposent de réécrire l'API en fonctions (contredirait EDR-026).

Conséquences

- Une carte bancaire est requise sur le compte Google Cloud ; il faut mettre une alerte de budget pour rester dans l'offre gratuite.
- L'API doit être livrée en image Docker (aucun `Dockerfile` n'existe encore) qui construit les paquets du monorepo et le client Prisma.
- `max-instances=1` est obligatoire tant que le verrou de synchronisation est en mémoire (EDR-029). Le cache des utilisateurs est perdu à chaque redémarrage, ce qui est sans conséquence.
- Démarrage à froid de quelques secondes sur la première synchronisation après une pause, sans effet sur le jeu.
- Connexion à la base par le pooler de connexions Supabase ; migrations appliquées par `prisma:deploy` à chaque déploiement.
- Un projet Supabase gratuit peut être mis en pause après une période sans activité (à vérifier sur les conditions Supabase).
- `CORS_ORIGINS` doit inclure l'URL GitHub Pages du client web (EDR-011).

---

ID : EDR-036
Date : 2026-10-10
Titre : Anciennes règles pour parties commencées
Statut : Active

Contexte
Les parties sont rejouées avec le code actuel (EDR-003, EDR-025). Corriger une carte déjà jouée (coût, effet, déclencheur) ou une règle du moteur peut empêcher le rejeu des parties en cours, ou en changer le résultat. Le serveur les refuse alors (`422 INVALID_GAME`).

Problème
Que faire des parties déjà commencées quand une règle ou une carte change de façon incompatible ?

Décision
Les parties déjà commencées gardent **les règles avec lesquelles elles ont commencé** : le code gère l'ancienne et la nouvelle version. Les nouvelles parties utilisent la nouvelle version.

Alternatives rejetées

- Accepter la perte des parties en cours (le joueur recommence) : rejetée, on ne casse pas une partie commencée.
- Décider au cas par cas : rejetée au profit d'une règle unique et prévisible.
- Migrer les journaux d'événements existants vers les nouvelles règles : non retenue, car une partie migrée ne correspond plus à ce que le joueur a réellement joué.

Conséquences

- Il faut un mécanisme de version des règles et des données, qui **n'existe pas encore** : par exemple, enregistrer une version dans l'événement `GAME_STARTED` et conserver les anciennes définitions de cartes ou les anciens traitements d'événements selon cette version. Il est à concevoir avant le premier changement cassant.
- Les anciennes versions de cartes et de traitements s'accumulent dans le code : plus de complexité et de tests.
- Le serveur doit embarquer toutes les versions encore utilisées par des parties actives.
- `replay-guardian` n'accepte plus de changement cassant sans chemin de compatibilité pour les anciennes parties ; un changement sans ce chemin reste remonté à l'utilisateur.

---

ID : EDR-037
Date : 2026-10-10
Titre : Fusion soumise à la relecture du mainteneur
Statut : Active

Contexte
Le projet s'ouvre à des contributeurs, alors qu'il était jusque-là développé par son auteur seul, assisté par l'IA. Une partie croissante du code est produite par des agents IA (EDR-032). Les règles du jeu et la compatibilité des parties (EDR-036) demandent une connaissance que seul l'auteur a aujourd'hui.

Problème
Qui valide qu'un changement peut entrer dans le projet ?

Décision
Toute demande de fusion vers `main` exige **la relecture et l'accord explicite du mainteneur (@kevcordier)**, en plus d'une CI verte. Personne ne pousse directement sur `main`, qu'il s'agisse d'un humain ou d'un agent. Le travail passe par une branche (`feat/…`, `fix/…`, `chore/…`) et une PR.

Alternatives rejetées

- Pousser directement sur `main` : ne permet aucune relecture, et chaque push déploie le client web.
- Fusion automatique dès que la CI passe : la CI ne vérifie ni les règles du jeu, ni la cohérence avec les cartes d'origine, ni la compatibilité des parties.

Conséquences

- Le mainteneur est le goulot d'étranglement des livraisons : les PR doivent rester petites et ciblées (un sujet par PR, INS-008).
- À appliquer côté GitHub : protéger la branche `main` (relecture obligatoire, CI requise, pas de push direct), par exemple avec un fichier `CODEOWNERS` désignant le mainteneur.
- Les agents IA ne fusionnent jamais et ne poussent jamais : ils préparent des changements que le mainteneur relit.

---

ID : EDR-038
Date : 2026-10-10
Titre : Plusieurs royaumes par joueur
Statut : Active
Remplace : EDR-029 (point « une seule partie en cours par joueur » uniquement)

Contexte
Le client n'avait qu'un emplacement de sauvegarde et le serveur abandonnait les autres parties d'un joueur à chaque nouvelle partie. Le joueur veut mener plusieurs campagnes en parallèle et les retrouver sur une page d'accueil, avec leurs scores par segment (jeu de base, puis chaque extension dans l'ordre où elle a été jouée).

Problème
Comment permettre plusieurs sauvegardes par joueur sans casser le rejeu des parties existantes ni la synchronisation ?

Décision
Une partie devient un **royaume** : un joueur en garde jusqu'à **10** avec un compte enregistré et **1** sans compte (invité ou hors ligne). La limite est appliquée par le client et par le serveur (`409 KINGDOM_LIMIT` à la création ou à la réactivation d'une partie abandonnée).

- Le nom du royaume est une **métadonnée hors du journal d'événements** (`Game.name`, index local des royaumes) : il ne change pas le rejeu.
- L'ordre des segments de campagne est lu dans le journal (`getCampaignSegments`, ordre des `CAMPAIGN_SCORE_SAVED` depuis le dernier `GAME_STARTED`). `campaignScores` est un objet dont l'ordre des clés n'est pas fiable (jsonb, FRC-017). Les colonnes d'extension affichent le score cumulé enregistré à la fin du segment.
- Le serveur ne crée plus d'abandon implicite. `GET /games` liste les royaumes ; `DELETE /games/:id` supprime (abandonne) un royaume.
- Côté client : une clé de sauvegarde par royaume (`deck_legacy_save_<id>`) et un index (`deck_legacy_kingdoms`). L'ancienne sauvegarde unique est migrée en un royaume au démarrage. La navigation passe par expo-router : `/` (accueil) et `/game/{slug}-{id}`. Seul l'id final de l'URL compte.
- Le dernier écrivain gagne toujours, royaume par royaume, et le verrou reste en mémoire (une seule instance).
- L'export et l'import JSON de la sauvegarde sont retirés, ainsi que « Compte », « Données de sauvegarde » et « Réinitialiser la partie » du menu de jeu, qui propose désormais de revenir à l'accueil.

Alternatives rejetées

- Mettre le nom du royaume dans un événement : il modifierait le journal pour une donnée sans effet sur le jeu.
- Naviguer par un état React sans routeur : pas de liens directs vers un royaume sur le web et le mobile.
- Télécharger les royaumes à la demande : le joueur doit pouvoir rouvrir un royaume hors ligne après une synchronisation.

Conséquences

- Les clients antérieurs utilisent encore `GET/DELETE /games/current`, conservés pour la compatibilité.
- Se connecter à un autre compte retire de l'appareil les royaumes synchronisés avec le compte précédent (règle d'EDR-029 inchangée).
- Un bug trouvé en jouant n'est plus exporté par le menu : on le reproduit par un scénario `GameSession` ou à partir du journal stocké sur le serveur (`GET /games/:id/export`).
- GitHub Pages sert `404.html`, copie de `index.html` produite par le build, pour que les liens `/game/…` fonctionnent.

---

ID : EDR-039
Date : 2026-10-11
Titre : Déploiement déclenché par un tag de version
Statut : Active
Remplace : EDR-011 (point « publié à chaque push sur `main` » uniquement)

Contexte
Le client web (EDR-011) et l'API (EDR-035) étaient déployés à chaque fusion sur `main`. Le mainteneur veut choisir le moment d'une mise en production, et livrer ensemble client, API et migrations d'une même version.

Problème
Quand déployer le client web et l'API ?

Décision
`deploy.yml` déploie GitHub Pages et Cloud Run uniquement sur un tag `v*` (format semver d'EDR-018, par exemple `v1.0.0-beta.4`). Un push sur `main` exécute seulement la CI et l'analyse SonarCloud.

Alternatives rejetées

- Déployer à chaque fusion sur `main` : chaque PR part en production, sans choix du moment.
- Déployer sur une GitHub Release : une étape manuelle de plus pour le même résultat.

Conséquences

- Les environnements `github-pages` et `production` doivent autoriser les tags `v*` dans leurs règles de déploiement.
- Le client et l'API d'une même version sont construits depuis le même commit, avec le même moteur et les mêmes données de jeu (EDR-022).

---

ID : EDR-040
Date : 2026-10-11
Titre : Tutoriel joué comme une vraie partie
Statut : Active
Remplace : EDR-017

Contexte
Le tutoriel d'EDR-017 montrait un plateau figé, posé hors événements : le joueur lisait une visite guidée sans jouer, et la partie ne pouvait pas être gardée.

Problème
Comment guider une vraie première manche, puis laisser le joueur garder sa partie ?

Décision
Le tutoriel est une partie normale dont le premier mélange est remplacé par un ordre fixe (`GameSession.start(…, 'tutorial', firstDrawPile)`, ordre dans `TUTORIAL_DRAW_ORDER` côté client). L'ordre est stocké dans `ROUND_STARTED.newDrawPile`, comme un mélange : le journal se rejoue et se valide sans changement. La session reste marquée `tutorial` (ni sauvegarde, ni annulation) jusqu'au choix final : « Continuer » la rejoue en session standard (`GameSession.restore`), qui est alors sauvegardée et synchronisée ; « Recommencer » démarre une partie mélangée. Les étapes avec `done` attendent l'action du joueur et bloquent les autres pressions.

Alternatives rejetées

- Garder le plateau figé hors événements : la partie du tutoriel ne peut pas être gardée.
- Mettre l'ordre du tutoriel dans les données de jeu : seul le script client en dépend.

Conséquences

- Une partie gardée après le tutoriel a une première manche non mélangée ; le serveur ne peut pas distinguer un mélange d'un ordre imposé (c'était déjà le cas, l'ordre vient du client).
- Le script dépend des cartes 1 à 10 de `deck.json` : changer ces cartes impose de revoir les étapes de `TutorialProvider`.

---

ID : EDR-041
Date : 2026-10-13
Titre : Synchronisation incrémentale et versionnée
Statut : Active
Remplace : EDR-029 (en partie : dernier écrivain gagne)

Contexte
Chaque sauvegarde envoyait tout le journal d'événements (jusqu'à 20 000). Un royaume joué sur deux appareils était écrasé sans prévenir par le dernier qui synchronisait, et un appareil ne voyait les parties des autres qu'au démarrage.

Problème
Comment n'envoyer que ce qui change, et suivre un même royaume sur plusieurs appareils sans perdre de coups en silence ?

Décision
`PUT /games/:id` reçoit les événements à partir de `fromSeq` ; le serveur garde les événements stockés avant `fromSeq` et rejoue le journal complet (la validation par rejeu d'EDR-024 ne change pas). Le client mémorise `syncedUpTo` (préfixe connu du serveur, abaissé par une annulation) et `serverVersion`, envoyé comme `baseVersion` : si la version stockée diffère, le serveur répond `409 STALE_VERSION` et le royaume passe en `conflict`. Le joueur choisit alors de garder la version en ligne (ses coups locaux non envoyés sont perdus) ou de l'écraser (envoi complet sans `baseVersion`). Sans modification locale, un appareil en retard télécharge la nouvelle version et l'annonce par un message. `reconcile()` tourne au démarrage, au retour au premier plan et chaque minute.

Alternatives rejetées

- Temps réel (Supabase Realtime, SSE) : infrastructure en plus pour un jeu solo ; une vérification par minute suffit.
- Fusion automatique des deux journaux : deux suites de coups divergentes ne se fusionnent pas sans inventer de règle.
- Garder le dernier écrivain gagne avec un simple avertissement : la perte de coups resterait silencieuse.

Conséquences

- Les anciens clients (sans `baseVersion` ni `fromSeq`) fonctionnent toujours et écrasent comme avant.
- Le téléchargement d'un royaume (`GET /games/:id/export`) reste complet.
- Chaque client connecté appelle `GET /games` chaque minute.

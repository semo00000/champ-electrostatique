# ⚡ Champ Électrostatique — Simulation Interactive GPU

> Simulation interactive haute performance du champ électrostatique et du potentiel électrique, accélérée par GPU (WebGL2), conçue pour l'enseignement de la physique au niveau Bac SM.

![WebGL2](https://img.shields.io/badge/WebGL2-Accelerated-blue) ![Responsive](https://img.shields.io/badge/Mobile-Responsive-green) ![Offline](https://img.shields.io/badge/Offline-Capable-orange)

---

## 🚀 Démarrage Rapide

### Méthode 1 : Double-clic (Recommandé — Aucune installation requise !)
1. **Décompresser** le fichier ZIP
2. **Double-cliquer** sur `Ouvrir.bat` (ou ouvrir `index.html` directement)
3. C'est tout ! La simulation s'ouvre dans votre navigateur

> **Aucun logiciel à installer.** Pas besoin de Node.js, Python, ou serveur. Ça marche directement.

### Méthode 2 : Serveur local (optionnel, pour développeurs)
```bash
python -m http.server 8765
```
Puis ouvrir : **http://localhost:8765**

---

## 🏗️ Architecture

| Fichier | Rôle |
|:---|:---|
| `index.html` | Structure HTML, panneaux UI, overlays (tour, voix, quiz, golf) |
| `simulation.js` | Moteur de simulation complet (~4500 lignes) : physique, rendu, interactions, toutes les fonctionnalités |
| `style.css` | Thèmes sombre/clair, animations, responsive, tour CSS |

**Stack technique :**
- **WebGL2** — Shader GLSL (fragment) pour le rendu GPU des cartes thermiques (5 modes)
- **Canvas 2D** — Lignes de champ, particules, arcs, annotations, paysage 3D
- **Web Speech API** — Contrôle vocal (reconnaissance) + narration TTS (synthèse)
- **KaTeX** — Formules LaTeX intégrées dans les quiz et expériences guidées
- **Web Audio API** — Effets sonores, Theremin synésthétique

---

## 🔬 Fonctionnalités Complètes

### Outils de Physique (Barre latérale gauche)
| # | Outil | Description |
|:--|:------|:------------|
| 1 | **Pointeur** | Sélectionner, déplacer, éditer les charges |
| 2 | **Charge +** | Placer une charge positive (+1 à +10 μC) |
| 3 | **Charge −** | Placer une charge négative (−1 à −10 μC) |
| 4 | **Sonde (Probe)** | Mesurer V, \|E⃗\|, direction en tout point |
| 5 | **Test Charge** | Visualiser la trajectoire d'une particule libre |
| 6 | **Gauss** | Surface de Gauss : flux Φ et charge enclosée Q_enc |
| 7 | **Travail W** | Calculer W = q·ΔV entre deux points A et B |
| 8 | **Charge Libre** | Particule mobile réagissant en temps réel aux forces |

### 9 Modes de Visualisation (Panneau droit)
| Visualisation | Description |
|:---|:---|
| **Lignes de champ** | Lignes dynamiques colorées montrant la direction de E⃗ |
| **Particules animées** | Flux de milliers de particules suivant le champ |
| **Champ vectoriel** | Grille de flèches proportionnelles à \|E⃗\| |
| **Équipotentielles** | Courbes iso-V (lignes de même potentiel) |
| **Arcs électriques** | Arcs de foudre animés entre charges opposées |
| **Effet bloom** | Halo lumineux « néon » autour des charges |
| **Forces Coulomb** | Vecteurs de force entre chaque paire de charges |
| **Paysage 3D** | Visualisation isométrique du potentiel (montagnes/vallées) |
| **Superposition** | Décomposition vectorielle : contribution individuelle de chaque charge |

### 5 Cartes Thermiques GPU (Shader WebGL2)
| Mode | Description |
|:---|:---|
| **Potentiel V** | Gradient bleu (−) → noir (0) → rouge/orange (+) |
| **Magnitude \|E⃗\|** | Violet → magenta → blanc (champ intense) |
| **Direction E⃗** | Roue chromatique HSV (teinte = angle du champ) |
| **Densité d'énergie** | Noir → orange → jaune (u = ½ε₀E²) |
| **Distorsion chromatique** | Aberration RGB séparée le long du champ |

### Préréglages (Presets)
- **Dipôle** — Configuration classique (+/−)
- **Condensateur** — Plaques parallèles (champ uniforme E entre les plaques)
- **Quadripôle** — 4 charges alternées
- **Triangle** — Distribution triangulaire
- **Anneau** — Distribution circulaire
- **Cage de Faraday** — Anneau de charges (E = 0 à l'intérieur)
- **Aléatoire** — Génération procédurale

---

## 🎮 Modes Interactifs

### ⛳ Electric Golf
Mini-jeu pédagogique : guidez une particule chargée d'un point de départ vers un objectif en plaçant des charges.
- **10 niveaux** de difficulté progressive
- Obstacles (charges fixes) et zones de défi
- Compteur de tentatives et score par étoiles (★★★)
- Accès via la Command Palette ou le bouton dédié

### 📝 Quiz Interactif
QCM de physique intégrés avec formules LaTeX (KaTeX) :
- Questions sur la loi de Coulomb, le champ, le potentiel, le flux, l'énergie
- Feedback immédiat avec explications détaillées
- Score final avec animation

### 🧪 Expériences Guidées
Tutoriels pas-à-pas avec instructions contextuelles :
- **Dipôle électrique** — Explorer les lignes de champ et équipotentielles
- **Condensateur plan** — Mesurer le champ uniforme, comprendre C = ε₀A/d
- **Loi de Coulomb** — Vérifier F ∝ 1/r² expérimentalement

### 🎬 Visite Guidée Cinématique (Auto-Tour)
Tour automatique de 18 étapes avec :
- **Narration vocale TTS** en français (sélection automatique de la meilleure voix neurale)
- Spotlight animé sur chaque élément de l'interface
- Transitions fluides avec animations CSS
- Cards explicatives positionnées intelligemment
- Navigation : Suivant / Précédent / Quitter

### 🎤 Contrôle Vocal
Commandes vocales en français via Web Speech API :
- « Ajoute une charge positive / négative »
- « Supprime tout », « Réinitialise »
- « Active les / Désactive les particules »
- « Zoom avant / arrière »
- « Mode présentation »
- Et bien plus…

---

## 🎨 Fonctionnalités Avancées

| Fonctionnalité | Raccourci | Description |
|:---|:---|:---|
| **Mode Présentation** | P | Interface épurée (masque les panneaux) pour projection en classe |
| **Thème Clair/Sombre** | L | Mode clair pour impression, sombre pour projection |
| **Profil V(x)** | — | Tracer une ligne → graphique du potentiel le long du profil |
| **Annotations** | A | Dessiner par-dessus : stylo, flèches, texte, couleurs |
| **Sauvegarde/Chargement** | — | 5 slots localStorage + export/import JSON |
| **Partage QR** | — | Générer un QR Code pour partager la configuration |
| **Cage de Faraday** | — | Rendu spécial avec anneau conducteur et E = 0 à l'intérieur |
| **Flux animé** | — | Animation de l'écoulement du champ le long des lignes |
| **Distorsion chromatique** | — | Aberration RGB basée sur l'intensité du champ (shader GPU) |
| **Theremin synésthétique** | — | Son continu modulé par le champ (fréquence ∝ \|E\|, volume ∝ V) |
| **Effets sonores** | — | Retour audio sur les interactions (placement, suppression) |
| **Plan miroir (terre)** | — | Symétrie de charge par rapport à un plan conducteur |
| **Grille magnétique** | G | Snap-to-grid pour positionner les charges précisément |
| **Capture d'écran** | S | Export PNG haute résolution |
| **Plein écran** | F | Mode plein écran du navigateur |
| **Internationalisation** | — | Interface en français et arabe (i18n) |

---

## ⚡ Système de Performance Adaptatif

### Détection Matérielle Automatique
Au chargement, le système détecte automatiquement :
- **GPU** via `WEBGL_debug_renderer_info` (NVIDIA, AMD, Intel, Apple)
- **CPU** via `navigator.hardwareConcurrency` + `navigator.deviceMemory`
- Classification en GPU discret vs intégré

### 4 Niveaux de Performance

| Tier | Nom | GPU typique | Particules | Bloom | DPR max | Arcs |
|:--:|:---|:---|:--:|:--:|:--:|:--:|
| 0 | **Ultra-Low** | Intel UHD 620, HD 530 | 80 | ✗ | 1.0 | ✗ |
| 1 | **Low-Mid** | Intel Iris Xe, AMD intégré | 150 | ✓ | 1.5 | ✓ |
| 2 | **Mid-High** | RX 580, GTX 1050, Arc A380 | 300 | ✓ | 2.0 | ✓ |
| 3 | **Ultra** | RTX 3060+, RX 6700+, Apple M1+ | 500 | ✓ | 3.0 | ✓ |

### Optimisations par Tier
- **Tier 0** : Bloom, glow, trails et grille mineure désactivés. Mode performance auto-activé.
- **Tier 1** : Flux réduit, mode performance auto-activé.
- **Tier 2** : Tous les effets actifs, paramètres moyens.
- **Tier 3** : Qualité maximale, tous les effets à pleine résolution.

### Auto-Adapt FPS
- Surveillance continue du framerate (toutes les 15 frames)
- Si FPS bas persistant → désactive automatiquement bloom, arcs, réduit les particules
- Objectif : maintenir 30+ FPS sur tous les matériels

### Badge GPU
Le badge « Carte GPU » dans le panneau droit affiche :
- Nom du GPU détecté + tier de performance
- Survol (tooltip) : détails complets (renderer, cores, RAM, vendor)

---

## ⌨️ Raccourcis Clavier Complets

| Touche | Action |
|:---|:---|
| **Clic gauche** | Sélectionner / Placer / Déplacer |
| **Molette / Pinch** | Zoomer / Dézoomer |
| **Clic droit / Drag** | Panoramique |
| **Suppr / Backspace** | Supprimer la charge sélectionnée |
| **Échap** | Désélectionner |
| **Ctrl+Z / Ctrl+Y** | Annuler / Rétablir |
| **1–8** | Sélectionner l'outil correspondant |
| **R** | Réinitialiser la vue |
| **C** | Tout effacer |
| **S** | Capture d'écran PNG |
| **F** | Plein écran |
| **P** | Mode présentation |
| **L** | Thème clair / sombre |
| **A** | Annotations on/off |
| **D** | Superposition vectorielle |
| **G** | Grille magnétique on/off |
| **Shift+Drag** | Snap grille |

---

## 📱 Mobile & Tactile

L'application est entièrement responsive :
- **Touch** pour placer et déplacer les charges
- **Pinch-to-zoom** pour le zoom
- **Barre d'outils mobile** en bas de l'écran
- **Panneau rétractable** accessible via bouton hamburger
- Interface adaptée aux écrans de toutes tailles

---

## 🧮 Physique Implémentée

| Concept | Formule | Implémentation |
|:---|:---|:---|
| Loi de Coulomb | F = k·q₁·q₂/r² | Forces inter-charges + panneau Coulomb |
| Champ électrique | E = k·q/r² | Shader GPU + lignes de champ |
| Potentiel | V = k·q/r | Shader GPU + équipotentielles |
| Densité d'énergie | u = ½·ε₀·E² | Mode heatmap énergie |
| Théorème de Gauss | Φ = Q_enc/ε₀ | Surface de Gauss interactive |
| Travail | W = q·ΔV | Calculateur travail A→B |
| Superposition | E_total = Σ E_i | Décomposition vectorielle |
| Capacité | C = ε₀·A/d | Panneau condensateur |

---

## 🔧 Configuration Requise

- **Navigateur** : Chrome 90+, Edge 90+, Firefox 90+ (WebGL2 requis)
- **GPU** : Tout GPU compatible WebGL2 (détection automatique du tier)
- **RAM** : 2 GB minimum
- **Réseau** : Aucune connexion requise après le premier chargement (sauf KaTeX CDN)

---

## 📄 Licence

Projet éducatif pour l'enseignement de la physique — Bac Sciences Mathématiques.

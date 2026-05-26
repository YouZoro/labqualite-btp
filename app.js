/* ==========================================================================
   LABQUALITÉ BTP - APP.JS (CORE MOTOR, CALCULATORS & OFFLINE DATABASE)
   ========================================================================== */

// --- 1. GLOBAL STATE & CONFIGURATION ---
let currentTab = 'accueil';
let selectedTest = null;
let favorites = [];
let history = [];
let appConfig = {
    labName: 'Laboratoire BTP National',
    technicianName: 'Technicien Supérieur',
    license: 'LAB-2026-X04',
    darkMode: false
};

// --- 2. 44 TESTS FULL DATA DICTIONARY ---
const TESTS_DATABASE = [
    // === CATEGORY 1: SOLS (13 ESSAIS) ===
    {
        id: 'sol_teneur_eau',
        category: 'sol',
        categoryFr: '🌍 Essais Sol',
        name: 'Teneur en eau',
        fullName: 'Détermination de la Teneur en Eau par étuvage',
        norm: 'NM 13.152 (2022)',
        objective: 'Mesurer la quantité d\'eau contenue dans un échantillon de sol, exprimée en pourcentage du poids de sol sec. Indispensable pour tous les essais géotechniques.',
        domain: 'Terrassements, routes, études de fondations, contrôle des remblais.',
        equipments: [
            { icon: '⚖️', name: 'Balance de précision', spec: 'Sensibilité de 0.01g' },
            { icon: '🔥', name: 'Étuve ventilée', spec: 'Régulée à 110 ± 5 °C' },
            { icon: '🪧', name: 'Tares métalliques', spec: 'Identifiées et étanches' },
            { icon: '🧤', name: 'Desiccateur', spec: 'Pour refroidissement rapide sans humidité' }
        ],
        steps: [
            { num: 1, text: 'Peser la tare métallique vide et propre (noter M1).' },
            { num: 2, text: 'Placer l\'échantillon de sol humide dans la tare et peser l\'ensemble (noter M2).' },
            { num: 3, text: 'Placer la tare contenant le sol dans l\'étuve à 110°C pendant au moins 16 à 24 heures.' },
            { num: 4, text: 'Sortir l\'échantillon de l\'étuve, le laisser refroidir dans le dessiccateur.' },
            { num: 5, text: 'Peser la tare avec le sol sec (noter M3).' }
        ],
        hasCalculator: true,
        youtubeQuery: 'essai teneur eau sol laboratoire',
        prompt: 'Create a 10-second educational animation showing soil water content test, oven drying at 110C, laboratory weighing, French laboratory style',
        criteria: `
            <table class="criteria-table">
                <tr><th>Humidité de Sol</th><th>Taux w (%)</th><th>Classification</th></tr>
                <tr><td>Sec</td><td>&lt; 5%</td><td>Sol pulvérulent, nécessite ajout d'eau</td></tr>
                <tr><td>Optimal Moyen</td><td>5% - 15%</td><td>Excellent compactage possible</td></tr>
                <tr><td>Humide / Très saturé</td><td>&gt; 25%</td><td>Risque d'instabilité, nécessite séchage/chaux</td></tr>
            </table>
        `
    },
    {
        id: 'sol_atterberg',
        category: 'sol',
        categoryFr: '🌍 Essais Sol',
        name: 'Limites d\'Atterberg',
        fullName: 'Limites d\'Atterberg (WL/WP) à l\'appareil de Casagrande',
        norm: 'NM 13.1.007 & 13.1.012',
        objective: 'Déterminer les teneurs en eau critiques marquant le passage du sol d\'un état à un autre (liquide, plastique, solide). Permet de caractériser la plasticité des sols fins.',
        domain: 'Classification des sols fins (GTR), risque de retrait-gonflement des argiles.',
        equipments: [
            { icon: '🥣', name: 'Appareil de Casagrande', spec: 'Hauteur de chute réglée à 10mm' },
            { icon: '🔪', name: 'Outil à rainurer', spec: 'Normalisé ASTM / NF' },
            { icon: '⚖️', name: 'Balance de précision 0.01g', spec: 'Pesage des micro-tares' },
            { icon: '🪵', name: 'Plaque de marbre', spec: 'Pour façonner des rouleaux de 3mm' }
        ],
        steps: [
            { num: 1, text: 'Préparer la fraction de sol passant au tamis de 400 µm (fraction fine).' },
            { num: 2, text: 'Mélanger avec de l\'eau pour former une pâte homogène plastique.' },
            { num: 3, text: 'Pour la Limite de Liquidité (WL) : Placer la pâte dans la coupelle de Casagrande, tracer une rainure médiane, faire tourner la manivelle (2 coups/sec) jusqu\'à fermeture de la rainure sur 10-15 mm. Prélever la teneur en eau.' },
            { num: 4, text: 'Pour la Limite de Plasticité (WP) : Façonner des rouleaux de sol sur la plaque de verre jusqu\'à ce qu\'ils se fissurent exactement à un diamètre de 3 mm. Peser pour mesurer la teneur en eau.' }
        ],
        hasCalculator: true,
        youtubeQuery: 'limites atterberg WL WP laboratoire',
        prompt: 'Create a 10-second educational animation showing Atterberg limits laboratory test, cup of Casagrande clicking, clay rolling to 3mm, French laboratory',
        criteria: `
            <table class="criteria-table">
                <tr><th>Indice de Plasticité IP</th><th>Plasticité</th><th>Risques & Portance</th></tr>
                <tr><td>IP &lt; 7</td><td>Non plastique / Limon</td><td>Sensible à l'eau, non argileux</td></tr>
                <tr><td>7 &le; IP &lt; 15</td><td>Faiblement plastique</td><td>Argile limoneuse, sensibilité moyenne</td></tr>
                <tr><td>15 &le; IP &lt; 40</td><td>Plastique</td><td>Argile marquée, risque de gonflement moyen</td></tr>
                <tr><td>IP &ge; 40</td><td>Très plastique</td><td>Argile lourde, fort risque de retrait-gonflement</td></tr>
            </table>
        `
    },
    {
        id: 'sol_granulometrie',
        category: 'sol',
        categoryFr: '🌍 Essais Sol',
        name: 'Analyse granulométrique sol',
        fullName: 'Analyse granulométrique des sols par tamisage',
        norm: 'NM 13.1.006',
        objective: 'Déterminer la distribution pondérale des tailles de grains constituant le sol. Permet de classer le sol selon sa texture.',
        domain: 'Dimensionnement des remblais, couches de chaussées, perméabilité.',
        equipments: [
            { icon: '🪜', name: 'Colonne de tamis', spec: 'Tamis de 0.08mm à 80mm' },
            { icon: '📨', name: 'Tamiseuse électrique', spec: 'Mouvement vibrant 3D' },
            { icon: '🔥', name: 'Étuve à 110°C', spec: 'Séchage complet du matériau' }
        ],
        steps: [
            { num: 1, text: 'Sécher l\'échantillon de sol à l\'étuve.' },
            { num: 2, text: 'Laver le matériau sur le tamis de 0.08 mm (80 µm) pour éliminer les fines.' },
            { num: 3, text: 'Sécher le refus à l\'étuve.' },
            { num: 4, text: 'Verser le refus séché dans la colonne de tamis et tamiser pendant 10-15 min.' },
            { num: 5, text: 'Peser le refus cumulé sur chaque tamis pour calculer les pourcentages de passants.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'analyse granulometrique sol tamisage',
        prompt: 'Educational animation: Sifting soil through industrial sieves, lab grading curve, French soil test',
        criteria: '<span class="status-pill status-conforme">Info</span> Le coefficient de courbure Cc et d\'uniformité Cu permettent de vérifier si la granulométrie est bien graduée.'
    },
    {
        id: 'sol_proctor',
        category: 'sol',
        categoryFr: '🌍 Essais Sol',
        name: 'Essai Proctor Normal/Modifié',
        fullName: 'Essai de compactage Proctor Normal et Modifié',
        norm: 'NM 13.1.094',
        objective: 'Déterminer la teneur en eau optimale (OPM) qui permet d\'obtenir la densité sèche maximale par compactage normalisé.',
        domain: 'Contrôle de compactage des remblais, digues, et assises routières.',
        equipments: [
            { icon: '🪣', name: 'Moule Proctor / CBR', spec: 'Avec embase et hausse' },
            { icon: '🔨', name: 'Dame Proctor normalisée', spec: 'Poids 2.49kg (Normal) / 4.89kg (Modifié)' },
            { icon: '⚖️', name: 'Balance technique', spec: 'Portée 15kg, précision 1g' },
            { icon: '📏', name: 'Règle à araser', spec: 'En acier biseauté' }
        ],
        steps: [
            { num: 1, text: 'Préparer 5 échantillons de sol de 2.5 kg à des teneurs en eau différentes (ex: 4%, 6%, 8%, 10%, 12%).' },
            { num: 2, text: 'Compacter le sol dans le moule en 3 couches (Proctor Normal) ou 5 couches (Proctor Modifié) en appliquant 25 coups de dame par couche.' },
            { num: 3, text: 'Araser le béton excédentaire avec la règle métallique, puis peser le moule rempli pour calculer la masse volumique humide.' },
            { num: 4, text: 'Prélever des carottes de sol pour mesurer précisément la teneur en eau réelle.' },
            { num: 5, text: 'Tracer la courbe Proctor pour en extraire le point culminant (w_opt, d_max).' }
        ],
        hasCalculator: true,
        youtubeQuery: 'essai proctor normal modifie laboratoire',
        prompt: 'Create a 10-second educational animation showing Proctor compaction test, automated hammer hitting soil in mold, laboratory data curve, French laboratory',
        criteria: `
            <table class="criteria-table">
                <tr><th>Type de Proctor</th><th>Énergie de compactage</th><th>Objectif chantier</th></tr>
                <tr><td>Proctor Normal</td><td>0.60 MJ/m³ (faible)</td><td>Remblais ordinaires, terrassement large</td></tr>
                <tr><td>Proctor Modifié</td><td>2.70 MJ/m³ (forte)</td><td>Couches d'assises routières, pistes d'aéroports</td></tr>
            </table>
        `
    },
    {
        id: 'sol_cbr',
        category: 'sol',
        categoryFr: '🌍 Essais Sol',
        name: 'Indice CBR',
        fullName: 'California Bearing Ratio (CBR) - Portance des sols',
        norm: 'NM 13.1.009',
        objective: 'Évaluer la portance et la résistance au poinçonnement d\'un sol compacté, avec ou sans immersion préalable dans l\'eau (gonflement).',
        domain: 'Classification de la portance du sol de fondation de chaussée (S1 à S5).',
        equipments: [
            { icon: '🏗', name: 'Presse d\'essai CBR', spec: 'Vitesse de poinçonnement 1.27 mm/min' },
            { icon: '📐', name: 'Piston de poinçonnement', spec: 'Section de 19.35 cm²' },
            { icon: '⚖️', name: 'Moule CBR avec surcharges', spec: 'Surcharges de 2.3 kg mimant la chaussée' },
            { icon: '💧', name: 'Bac d\'immersion', spec: 'Pour mesure du gonflement sur 4 jours' }
        ],
        steps: [
            { num: 1, text: 'Compacter l\'échantillon au moule CBR à la teneur en eau voulue (OPM).' },
            { num: 2, text: 'Optionnel : Immerger le moule sous l\'eau pendant 96 heures avec un comparateur pour surveiller le gonflement.' },
            { num: 3, text: 'Placer le moule sous la presse de poinçonnement routier.' },
            { num: 4, text: 'Appliquer des surcharges annulaires et démarrer la pénétration.' },
            { num: 5, text: 'Noter les forces de pénétration correspondant aux enfoncements de 2.5 mm et 5.0 mm.' }
        ],
        hasCalculator: true,
        youtubeQuery: 'essai CBR laboratoire geotechnique',
        prompt: 'Create a 10-second educational animation showing California Bearing Ratio CBR test, laboratory piston punching soil in circular metal mold, French laboratory',
        criteria: `
            <table class="criteria-table">
                <tr><th>Classe CBR</th><th>Portance</th><th>Usage Routier</th></tr>
                <tr><td>CBR &lt; 5</td><td>Classe S1</td><td>Mauvais sol, couche de forme requise</td></tr>
                <tr><td>5 - 10</td><td>Classe S2</td><td>Moyen, traitement chaux/ciment conseillé</td></tr>
                <tr><td>10 - 20</td><td>Classe S3</td><td>Acceptable en plateforme directe</td></tr>
                <tr><td>20 - 30</td><td>Classe S4</td><td>Excellent, couche de fondation admise</td></tr>
                <tr><td>&ge; 30</td><td>Classe S5</td><td>Matériau noble stabilisé</td></tr>
            </table>
        `
    },
    {
        id: 'sol_vbs',
        category: 'sol',
        categoryFr: '🌍 Essais Sol',
        name: 'Valeur de Bleu (VBS)',
        fullName: 'Valeur de Bleu de Méthylène d\'un sol',
        norm: 'NM 13.1.178',
        objective: 'Mesurer la quantité de colorant (bleu de méthylène) adsorbée par le sol. Permet de quantifier directement la proportion et la réactivité de l\'argile.',
        domain: 'Classification GTR des sols fins et granulats argileux.',
        equipments: [
            { icon: '🧪', name: 'Burette graduée', spec: 'Solution de bleu à 10 g/L' },
            { icon: '🌪️', name: 'Agitateur à ailettes', spec: 'Rotation stable à 700 tr/min' },
            { icon: '📝', name: 'Papier filtre sans cendres', spec: 'Pour l\'essai à la tache' },
            { icon: '⏱️', name: 'Chronomètre', spec: 'Pour le contrôle de l\'auréole stable (5 min)' }
        ],
        steps: [
            { num: 1, text: 'Peser une masse de sol sec fine Ms (ex: 200g) et mélanger avec de l\'eau distillée.' },
            { num: 2, text: 'Injecter par incréments de 5 mL la solution de bleu de méthylène tout en agitant le mélange.' },
            { num: 3, text: 'Après chaque injection, déposer une goutte de suspension sur le papier filtre.' },
            { num: 4, text: 'L\'essai est positif lorsqu\'une auréole bleu clair persistante apparaît autour de la tache centrale sombre.' },
            { num: 5, text: 'Répéter les prélèvements de goutte toutes les minutes pendant 5 minutes sans ajouter de bleu pour vérifier la saturation de l\'argile.' }
        ],
        hasCalculator: true,
        youtubeQuery: 'valeur bleu methylene sol VBS',
        prompt: 'Create a 10-second educational animation showing methylene blue VBS test, blue drop forming aureole on filter paper, lab stirrer mixing clay, French laboratory',
        criteria: `
            <table class="criteria-table">
                <tr><th>VBS</th><th>Activité Argileuse</th><th>Classification</th></tr>
                <tr><td>VBS &lt; 0.1</td><td>Insensible à l'eau</td><td>Sables très propres</td></tr>
                <tr><td>0.2 - 1.5</td><td>Moyennement sensible</td><td>Sols limoneux sablonneux</td></tr>
                <tr><td>1.5 - 2.5</td><td>Plasticité intermédiaire</td><td>Limon plastique</td></tr>
                <tr><td>2.5 - 6.0</td><td>Argileux fort</td><td>Sols franchement argileux</td></tr>
                <tr><td>&ge; 6.0</td><td>Activité extrême</td><td>Argile gonflante (bentonitique)</td></tr>
            </table>
        `
    },
    {
        id: 'sol_densitometre',
        category: 'sol',
        categoryFr: '🌍 Essais Sol',
        name: 'Densité en place',
        fullName: 'Mesure de masse volumique en place au densitomtre',
        norm: 'NM 13.1.134',
        objective: 'Mesurer in-situ la densité d\'un remblai ou couche compactée pour la comparer à la densité maximale Proctor.',
        domain: 'Vérification du compactage sur chantier (Remblai, couche de forme).',
        equipments: [
            { icon: '🍼', name: 'Densitomètre à membrane', spec: 'Appareil volumétrique à eau' },
            { icon: '🔨', name: 'Trousse de terrassement', spec: 'Massette, burin et plateau de guidage' },
            { icon: '⚖️', name: 'Balance de chantier', spec: 'Précision de 1g' }
        ],
        steps: [
            { num: 1, text: 'Fixer la plaque de base métallique sur le sol arasé.' },
            { num: 2, text: 'Prendre la lecture initiale du volume d\'eau du densitomtre appliqué sur le sol intact.' },
            { num: 3, text: 'Creuser un trou cylindrique régulier à travers la plaque (profondeur env. 15cm) et recueillir soigneusement tout le sol extrait.' },
            { num: 4, text: 'Peser le sol humide extrait. Prélever un échantillon pour teneur en eau.' },
            { num: 5, text: 'Appliquer de nouveau le densitomtre sur le trou. Sous pression, l\'eau gonfle la membrane élastique dans le trou. Lire le volume final pour obtenir le volume exact du trou.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'densitometre a membrane essai en place',
        prompt: 'Educational animation: Geotechnical engineer using water balloon densitometer on highway embankment, French road construction',
        criteria: '<span class="status-pill status-conforme">Normatif</span> Le taux de compactage visé doit être supérieur à 95% de l\'OPM pour les remblais et supérieur à 98% pour les couches de chaussée.'
    },
    {
        id: 'sol_plaque',
        category: 'sol',
        categoryFr: '🌍 Essais Sol',
        name: 'Essai à la Plaque',
        fullName: 'Essai de déformation à la plaque sous charge',
        norm: 'NM 13.1.179',
        objective: 'Déterminer le module de déformation Ev2 sous la plaque rigide et évaluer la qualité du compactage par le ratio Ev2/Ev1.',
        domain: 'Réception des plateformes routières et ferroviaires.',
        equipments: [
            { icon: '💿', name: 'Plaque rigide circulaire', spec: 'Diamètre normalisé de 600 mm (ou 300 mm)' },
            { icon: '🏗', name: 'Dispositif de réaction', spec: 'Camion lesté ou engin lourd (>10 tonnes)' },
            { icon: '📏', name: 'Poutre de mesure articulée', spec: 'Comparateurs mécaniques ou numériques' }
        ],
        steps: [
            { num: 1, text: 'Placer la plaque de 600 mm sur une mince couche de sable propre nivelée.' },
            { num: 2, text: 'Positionner le vérin hydraulique sous le châssis du camion de réaction.' },
            { num: 3, text: 'Réaliser le premier cycle de chargement (Ev1) par paliers successifs de pression.' },
            { num: 4, text: 'Décharger complètement, puis réaliser le second cycle de chargement (Ev2).' },
            { num: 5, text: 'Mesurer les enfoncements de la plaque pour calculer les modules Ev1, Ev2 et le rapport Ev2/Ev1.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'essai a la plaque geotechnique Ev2 Ev1',
        prompt: 'Educational animation: Plate load test, heavy truck reaction force, soil deformation measuring beam, French infrastructure',
        criteria: '<span class="status-pill status-conforme">Normes</span> Ev2 doit être &ge; 50 MPa pour une plateforme classique et &ge; 80 MPa pour une assise rigide. Le ratio de compactage Ev2/Ev1 doit rester inférieur à 2.0.'
    },
    {
        id: 'sol_degradabilite',
        category: 'sol',
        categoryFr: '🌍 Essais Sol',
        name: 'Dégradabilité',
        fullName: 'Essai de Dégradabilité des matériaux rocheux',
        norm: 'NM 13.1.038',
        objective: 'Mesurer la sensibilité aux cycles alternés d\'humidification et de séchage des matériaux rocheux tendres.',
        domain: 'Emploi des roches évolutives en remblai.',
        equipments: [
            { icon: '🧺', name: 'Tambour rotatif grillagé', spec: 'Maille de 10 mm' },
            { icon: '💧', name: 'Auge d\'immersion', spec: 'Remplie d\'eau' },
            { icon: '🔥', name: 'Étuve 110°C', spec: 'Pour phase de séchage' }
        ],
        steps: [
            { num: 1, text: 'Sélectionner des fragments rocheux de poids calibré.' },
            { num: 2, text: 'Soumettre l\'échantillon à 4 cycles complets alternant : Séchage à 110°C et Immersion dans l\'eau.' },
            { num: 3, text: 'Tamisage doux pour évaluer la part de fragments dégradés.' },
            { num: 4, text: 'Calculer l\'indice de dégradabilité Id.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'essai degradabilite sol rocheux',
        prompt: 'Educational animation: Rock slake durability testing, drum rotating in water bath, French geology',
        criteria: '<span class="status-pill status-conforme">Info</span> Id &lt; 5 : Matériau stable. Id &gt; 20 : Matériau très dégradable à proscrire en remblai inondable.'
    },
    {
        id: 'sol_fragmentabilite',
        category: 'sol',
        categoryFr: '🌍 Essais Sol',
        name: 'Fragmentabilité',
        fullName: 'Essai de Fragmentabilité des matériaux rocheux',
        norm: 'NM 13.1.037',
        objective: 'Évaluer la fragilité et la propension à se broyer d\'un matériau rocheux sous l\'action mécanique du compactage.',
        domain: 'Remblais routiers avec roches friables (schistes, grès tendres).',
        equipments: [
            { icon: '🔨', name: 'Moule Proctor normal', spec: 'Pour contenir le matériau' },
            { icon: ' Dame ', name: 'Dame Proctor Modifié', spec: 'Apport énergétique standardisé' },
            { icon: '🪜', name: 'Tamis de contrôle', spec: 'Tamis de 10mm et 1.6mm' }
        ],
        steps: [
            { num: 1, text: 'Préparer un échantillon constitué de gros fragments rocheux calibrés.' },
            { num: 2, text: 'Compacter l\'échantillon dans le moule Proctor avec la dame lourde.' },
            { num: 3, text: 'Tamiser le matériau après compactage sur le tamis de contrôle.' },
            { num: 4, text: 'L\'indice de fragmentabilité IF est déterminé par la variation granulométrique.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'essai fragmentabilite granulats sol',
        prompt: 'Educational animation: Rock fragmentation crushing test under heavy hammer, laboratory sieves, French standards',
        criteria: '<span class="status-pill status-conforme">Info</span> Un IF élevé (&gt; 15) indique un matériau très friable qui va se transformer en argile/limon au compactage sur chantier.'
    },
    {
        id: 'sol_plasticite',
        category: 'sol',
        categoryFr: '🌍 Essais Sol',
        name: 'Plasticité',
        fullName: 'Détermination simplifiée de la plasticité',
        norm: 'NM 13.1.007',
        objective: 'Déterminer rapidement si un sol argileux est plastique ou rigide à sa teneur en eau naturelle.',
        domain: 'Essai rapide de chantier, reconnaissance géotechnique express.',
        equipments: [
            { icon: '⚖️', name: 'Micro-balance', spec: 'Précision 0.1g' },
            { icon: '🥣', name: 'Coupelle en porcelaine', spec: 'Mélangeur' }
        ],
        steps: [
            { num: 1, text: 'Prélever une noisette de sol humide.' },
            { num: 2, text: 'Façonner des rouleaux de faible épaisseur.' },
            { num: 3, text: 'Observer l\'apparition de fissures et le comportement élastique.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'plasticite des sols essai laboratoire',
        prompt: 'Educational animation: Rapid clay plastic index test in field laboratory',
        criteria: '<span class="status-pill status-conforme">Info</span> Permet de trier à la volée les sols cohérents des sols inertes.'
    },
    {
        id: 'sol_liquide_cone',
        category: 'sol',
        categoryFr: '🌍 Essais Sol',
        name: 'Liquidité Cône',
        fullName: 'Détermination de la limite de liquidité au pénétromètre à cône',
        norm: 'NM 13.1.012',
        objective: 'Méthode alternative plus précise que la coupelle de Casagrande pour mesurer la limite de liquidité par enfoncement d\'un cône calibré.',
        domain: 'Recherche universitaire et laboratoires de haute précision.',
        equipments: [
            { icon: '📐', name: 'Pénétromètre à cône', spec: 'Poids total 80g, angle du cône 30°' },
            { icon: '🧁', name: 'Godet métallique cylindrique', spec: 'Contenant la pâte' }
        ],
        steps: [
            { num: 1, text: 'Remplir le godet avec la pâte homogène de sol fine sans laisser de bulles d\'air.' },
            { num: 2, text: 'Araser la surface de la pâte.' },
            { num: 3, text: 'Amener la pointe du cône au contact parfait de la surface du sol.' },
            { num: 4, text: 'Libérer le cône pendant exactement 5 secondes et lire la profondeur d\'enfoncement.' },
            { num: 5, text: 'Déterminer la teneur en eau qui produit un enfoncement exact de 20 mm.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'penetrometre a cone limite liquidite',
        prompt: 'Educational animation: Fall cone test for liquid limit, laboratory geotechnics, French lab',
        criteria: '<span class="status-pill status-conforme">Précision</span> Essai jugé beaucoup plus répétable et moins dépendant du coup de main de l\'opérateur que la coupelle Casagrande.'
    },
    {
        id: 'sol_equivalent_sable',
        category: 'sol',
        categoryFr: '🌍 Essais Sol',
        name: 'Équivalent de sable (Sol)',
        fullName: 'Équivalent de Sable sur la fraction 0/2mm des sols',
        norm: 'NM 10.1.169',
        objective: 'Déterminer la propreté d\'un sable de terrassement en mesurant la proportion de fines argileuses nocives.',
        domain: 'Qualité des sols sableux pour fondations.',
        equipments: [
            { icon: '🧪', name: 'Éprouvettes transparentes', spec: 'Graduées avec trait repère' },
            { icon: '🧪', name: 'Solution lavante', spec: 'À base de glycérine et chlorure de calcium' },
            { icon: '📏', name: 'Piston taré', spec: 'Masse de 135g pour mesure visuelle' }
        ],
        steps: [
            { num: 1, text: 'Remplir l\'éprouvette graduée de solution lavante jusqu\'au premier trait.' },
            { num: 2, text: 'Peser une masse de sable fin et l\'incorporer. Laisser reposer 10 min.' },
            { num: 3, text: 'Agiter énergiquement l\'éprouvette horizontalement pendant 90 coups.' },
            { num: 4, text: 'Laver le sable avec le tube laveur et compléter le niveau avec la solution.' },
            { num: 5, text: 'Laisser décanter 20 min puis lire la hauteur du sable (h2) et la hauteur totale sable+floculat (h1).' }
        ],
        hasCalculator: false,
        youtubeQuery: 'essai equivalent de sable laboratoire',
        prompt: 'Educational animation: Sand equivalent cylinder test, visual sediment measurement, French standard',
        criteria: '<span class="status-pill status-conforme">Info</span> Un ES &lt; 50 indique un sable trop pollué d\'argile. Un ES &gt; 70 indique un matériau très propre.'
    },

    // === CATEGORY 2: GRANULATS (8 ESSAIS) ===
    {
        id: 'granulat_granulometrie',
        category: 'granulat',
        categoryFr: '🪨 Essais Granulats',
        name: 'Analyse granulométrique',
        fullName: 'Analyse granulométrique des granulats par tamisage',
        norm: 'NF EN 933-1',
        objective: 'Mesurer la proportion massique des grains selon leur dimension pour valider la conformité des fuseaux granulaires.',
        domain: 'Formulation des bétons, graves non traitées, enrobés.',
        equipments: [
            { icon: '🪜', name: 'Série de tamis métalliques', spec: 'Diamètres normalisés NF' },
            { icon: '⚖️', name: 'Balance mécanique robuste', spec: 'Pesage des grands refus' }
        ],
        steps: [
            { num: 1, text: 'Sécher les granulats pour éliminer l\'humidité libre.' },
            { num: 2, text: 'Laver sous l\'eau sur le tamis de 0.063 mm.' },
            { num: 3, text: 'Sécher le refus restant à l\'étuve.' },
            { num: 4, text: 'Procéder au tamisage à sec à l\'aide d\'une tamiseuse mécanique.' },
            { num: 5, text: 'Peser les refus cumulés sur chaque maille.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'essai equivalent de sable granulats',
        prompt: 'Educational animation: Sieve shaker grading aggregates, laboratory laboratory rock testing, French standard',
        criteria: '<span class="status-pill status-conforme">Fuseaux</span> Le matériau doit s\'inscrire dans les limites du fuseau spécifié par le marché (ex: Grave 0/20).'
    },
    {
        id: 'granulat_es',
        category: 'granulat',
        categoryFr: '🪨 Essais Granulats',
        name: 'Équivalent de sable',
        fullName: 'Équivalent de Sable des granulats d\'apport',
        norm: 'NM 10.1.169 (2020)',
        objective: 'Évaluer la pureté des sables destinés aux bétons ou enduits de chaussées.',
        domain: 'Sable pour béton de ciment et couches d\'assises routières.',
        equipments: [
            { icon: '🧪', name: 'Éprouvettes normalisées', spec: 'Verre ou plastique transparent' },
            { icon: '📏', name: 'Réglet métallique', spec: 'Lecture rapide au mm' },
            { icon: '⚖️', name: 'Piston de tarage', spec: 'Poids étalonné' }
        ],
        steps: [
            { num: 1, text: 'Peser 120g de sable sec 0/2 mm.' },
            { num: 2, text: 'Introduire la solution floculante, verser le sable, secouer manuellement.' },
            { num: 3, text: 'Remplir l\'éprouvette avec le tube laveur.' },
            { num: 4, text: 'Mesurer la hauteur du sédiment visuel h2 et celle du floculat h1 après 20 min.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'essai equivalent de sable granulats',
        prompt: 'Educational animation: Sand equivalent test with sediment piston, French concrete standards',
        criteria: `
            <table class="criteria-table">
                <tr><th>Application</th><th>ES (Piston) Min</th><th>Statut</th></tr>
                <tr><td>Béton de structure sollicité</td><td>&ge; 75%</td><td>Conforme ✅</td></tr>
                <tr><td>Béton courant peu exposé</td><td>&ge; 70%</td><td>Admis ✅</td></tr>
                <tr><td>Enduits / Maçonnerie</td><td>&ge; 60%</td><td>Toléré ✅</td></tr>
                <tr><td>Tous usages routiers nobles</td><td>&lt; 60%</td><td>Refusé ❌</td></tr>
            </table>
        `
    },
    {
        id: 'granulat_la',
        category: 'granulat',
        categoryFr: '🪨 Essais Granulats',
        name: 'Los Angeles',
        fullName: 'Essai de résistance à la fragmentation Los Angeles',
        norm: 'NM 10.1.020',
        objective: 'Mesurer la résistance à la fragmentation par chocs des gravillons à l\'aide du tambour rotatif contenant des boulets d\'acier.',
        domain: 'Acceptation des gravillons pour enrobés et bétons structurels.',
        equipments: [
            { icon: '🥁', name: 'Machine Los Angeles', spec: 'Tambour tournant à 31 tr/min' },
            { icon: '🥎', name: 'Boulets d\'acier', spec: 'Diamètre 47mm, masse 420-445g chacun' },
            { icon: '🪜', name: 'Tamis de 1.6 mm', spec: 'Pour évaluer l\'usure fine' }
        ],
        steps: [
            { num: 1, text: 'Peser exactement 5000g de gravillons propres calibrés (noter M0).' },
            { num: 2, text: 'Placer l\'échantillon dans le tambour Los Angeles avec le nombre réglementaire de boulets d\'acier (selon la classe granulométrique).' },
            { num: 3, text: 'Faire tourner la machine pendant exactement 500 rotations.' },
            { num: 4, text: 'Retirer les gravillons usés, les laver soigneusement sur le tamis de 1.6 mm.' },
            { num: 5, text: 'Sécher le refus restant à l\'étuve à 110°C, puis le peser (noter M1).' }
        ],
        hasCalculator: true,
        youtubeQuery: 'essai los angeles granulats',
        prompt: 'Create a 10-second educational animation showing Los Angeles test, steel balls inside rotating metal drum crushing gravel, French road materials laboratory',
        criteria: `
            <table class="criteria-table">
                <tr><th>Valeur LA (%)</th><th>Dureté du Granulat</th><th>Usage Autorisé</th></tr>
                <tr><td>LA &le; 15</td><td>Très dur</td><td>Roulement autoroutier, trafic lourd</td></tr>
                <tr><td>15 &lt; LA &le; 25</td><td>Dur standard</td><td>Béton haute résistance, couche de base</td></tr>
                <tr><td>25 &lt; LA &le; 35</td><td>Moyennement dur</td><td>Béton courant, remblai noble</td></tr>
                <tr><td>LA &gt; 35</td><td>Tendre / Médiocre</td><td>Matériau déconseillé pour couche d'usure</td></tr>
            </table>
        `
    },
    {
        id: 'granulat_mde',
        category: 'granulat',
        categoryFr: '🪨 Essais Granulats',
        name: 'Micro-Deval',
        fullName: 'Essai d\'usure Micro-Deval en présence d\'eau',
        norm: 'NM 10.1.138',
        objective: 'Mesurer la résistance des granulats à l\'usure par frottement mutuel en présence d\'eau et de billes d\'acier calibrées.',
        domain: 'Granulats routiers, chemins de fer (ballast).',
        equipments: [
            { icon: ' Cylinder ', name: 'Jarres Micro-Deval cylindriques', spec: 'Arbres rotatifs motorisés' },
            { icon: '🥎', name: 'Charge abrasive', spec: 'Billes d\'acier inox de 10mm' },
            { icon: '💧', name: 'Eau distillée', spec: 'Pour simuler les conditions d\'usure humide' }
        ],
        steps: [
            { num: 1, text: 'Peser 500g de gravillons secs calibrés (noter M0).' },
            { num: 2, text: 'Mettre l\'échantillon dans la jarre cylindrique avec 2.5 L d\'eau et la charge abrasive de billes métalliques.' },
            { num: 3, text: 'Fermer hermétiquement la jarre et la faire tourner à 100 tr/min pendant 2 heures (12 000 rotations).' },
            { num: 4, text: 'Laver le matériau sur le tamis de 1.6 mm, éliminer les fines poussières de roche.' },
            { num: 5, text: 'Sécher à l\'étuve et peser le refus lavé (noter M1).' }
        ],
        hasCalculator: true,
        youtubeQuery: 'essai micro deval granulats',
        prompt: 'Create a 10-second educational animation showing Micro-Deval test, metal cylinders spinning on laboratory rollers, wet wear test of stones, French laboratory',
        criteria: `
            <table class="criteria-table">
                <tr><th>MDE (%)</th><th>Qualité d'Usure</th><th>Applications routières</th></tr>
                <tr><td>MDE &le; 10</td><td>Excellente</td><td>Couches de roulement routières intenses</td></tr>
                <tr><td>10 - 20</td><td>Moyenne standard</td><td>Béton armé usuel, fondations</td></tr>
                <tr><td>&ge; 20</td><td>Sensible à l'eau</td><td>Admis uniquement en remblais secondaires</td></tr>
            </table>
        `
    },
    {
        id: 'granulat_friabilite',
        category: 'granulat',
        categoryFr: '🪨 Essais Granulats',
        name: 'Friabilité des sables',
        fullName: 'Mesure du coefficient de friabilité des sables FS',
        norm: 'NM 10.1.903 (2018)',
        objective: 'Mesurer la sensibilité au broyage des fractions fines de sable sous frottement mécanique répétitif.',
        domain: 'Sables concassés pour mortiers et couches routières.',
        equipments: [
            { icon: '🧪', name: 'Jarre cylindrique Micro-Deval', spec: 'Petite dimension' },
            { icon: '🔩', name: 'Billes inox fines', spec: 'Pour sable uniquement' }
        ],
        steps: [
            { num: 1, text: 'Peser une fraction de sable sèche calibrée.' },
            { num: 2, text: 'Introduire les billes métalliques et agiter pendant 1 heure.' },
            { num: 3, text: 'Tamiser et peser la part de poussière produite.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'essai friabilite des sables BTP',
        prompt: 'Educational animation: Sand friability testing drum rotation, laboratory geology, French standard',
        criteria: '<span class="status-pill status-conforme">Info</span> FS &lt; 20 indique un sable très stable qui ne s\'effrite pas dans le temps.'
    },
    {
        id: 'granulat_fragmentabilite',
        category: 'granulat',
        categoryFr: '🪨 Essais Granulats',
        name: 'Fragmentabilité granulats',
        fullName: 'Coefficient de fragmentabilité des gravillons',
        norm: 'NM 13.1.037 (2022)',
        objective: 'Quantifier l\'évolution de la taille des gravillons sous l\'action d\'un damage standardisé.',
        domain: 'Mise en œuvre des ballasts ferroviaires et routes lourdes.',
        equipments: [
            { icon: ' Dame ', name: 'Dame Proctor', spec: '2.5kg chute libre' },
            { icon: ' Tamis ', name: 'Tamis de coupure', spec: 'Définis par la norme' }
        ],
        steps: [
            { num: 1, text: 'Damage mécanique sur un volume calibré de gravillons.' },
            { num: 2, text: 'Tamisage du matériau cassé.' },
            { num: 3, text: 'Calcul de la différence de refus massique.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'essai fragmentabilite granulats',
        prompt: 'Educational animation: Gravel fragmentation test under heavy hammer, French lab standards',
        criteria: '<span class="status-pill status-conforme">Info</span> Plus le coefficient de fragmentabilité est faible, plus le gravillon est apte à supporter les compacteurs lourds.'
    },
    {
        id: 'granulat_aplatissement',
        category: 'granulat',
        categoryFr: '🪨 Essais Granulats',
        name: 'Aplatissement',
        fullName: 'Détermination du coefficient d\'aplatissement',
        norm: 'NF EN 933-3',
        objective: 'Mesurer le pourcentage de gravillons trop plats ou allongés (aiguilles), qui nuisent à la compacité mécanique et à la stabilité du béton.',
        domain: 'Granulats de concassage pour béton et enduits superficiels.',
        equipments: [
            { icon: '🪜', name: 'Grilles à fentes parallèles', spec: 'Écartements normalisés' },
            { icon: ' Tamis ', name: 'Tamis de tri à mailles carrées', spec: 'Triage préliminaire par classe d/D' }
        ],
        steps: [
            { num: 1, text: 'Sélectionner l\'échantillon et le séparer en classes granulaires unitaires (tamis à mailles carrées).' },
            { num: 2, text: 'Passer chaque fraction sur la grille à fentes correspondante.' },
            { num: 3, text: 'Peser les gravillons qui traversent les fentes (considérés comme plats).' },
            { num: 4, text: 'Calculer le coefficient global d\'aplatissement (A%).' }
        ],
        hasCalculator: false,
        youtubeQuery: 'essai coefficient aplatissement NF EN 933-3',
        prompt: 'Educational animation: Aggregate shape flakiness index test, bar sieve grid sorting, French geology lab',
        criteria: `
            <table class="criteria-table">
                <tr><th>Application</th><th>Coef. Aplatissement Max</th><th>Statut</th></tr>
                <tr><td>Béton de structure noble / PCG</td><td>&le; 15%</td><td>Conforme ✅</td></tr>
                <tr><td>Couche de base routière standard</td><td>&le; 20%</td><td>Conforme ✅</td></tr>
                <tr><td>Grave non traitée ordinaire</td><td>&le; 25%</td><td>Admis ✅</td></tr>
                <tr><td>Matériau trop plat impropre</td><td>&gt; 30%</td><td>Rejeté ❌</td></tr>
            </table>
        `
    },
    {
        id: 'granulat_ecoulement',
        category: 'granulat',
        categoryFr: '🪨 Essais Granulats',
        name: 'Écoulement sable',
        fullName: 'Détermination du temps d\'écoulement des sables',
        norm: 'NF EN 933-6 (2014)',
        objective: 'Mesurer le temps d\'écoulement d\'un sable à travers un entonnoir calibré pour évaluer l\'angularité et la rugosité de ses grains.',
        domain: 'Sables pour chaussées drainantes et bétons performants.',
        equipments: [
            { icon: '🌪️', name: 'Entonnoir d\'écoulement calibré', spec: 'Buse de sortie précise' },
            { icon: '⏱️', name: 'Chronomètre précis', spec: 'Au 1/100e de seconde' }
        ],
        steps: [
            { num: 1, text: 'Peser une masse de sable sec débarrassée de ses fines (0.063mm).' },
            { num: 2, text: 'Verser le sable dans le récipient supérieur en obturant l\'orifice.' },
            { num: 3, text: 'Ouvrir l\'orifice et lancer simultanément le chronomètre.' },
            { num: 4, text: 'Arrêter le chronomètre dès que la dernière particule s\'écoule.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'temps ecoulement des sables laboratoire',
        prompt: 'Educational animation: Sand flowability cone test, laboratory hourglass simulation, French road research',
        criteria: '<span class="status-pill status-conforme">Info</span> Un temps d\'écoulement plus long indique un sable concassé très anguleux, augmentant la friction interne du béton frais.'
    },

    // === CATEGORY 3: BÉTON (10 ESSAIS) ===
    {
        id: 'beton_abrams',
        category: 'beton',
        categoryFr: '🏗️ Essais Béton',
        name: 'Slump Test (Abrams)',
        fullName: 'Essai d\'affaissement au Cône d\'Abrams',
        norm: 'NM 10.1.008',
        objective: 'Mesurer la consistance et l\'ouvrabilité du béton frais sur le chantier avant son coulage.',
        domain: 'Contrôle de conformité de livraison des toupies de béton.',
        equipments: [
            { icon: '📐', name: 'Cône d\'Abrams métallique', spec: 'H=300 mm, D=200 mm, d=100 mm' },
            { icon: '🦯', name: 'Tige de piquage en acier', spec: 'Diamètre 16 mm, bouts arrondis' },
            { icon: '📏', name: 'Portique de mesure avec réglet', spec: 'Précision au mm' }
        ],
        steps: [
            { num: 1, text: 'Humidifier le moule et la plaque de base plate.' },
            { num: 2, text: 'Remplir le cône en 3 couches de hauteur égale, en appliquant 25 coups de tige par couche.' },
            { num: 3, text: 'Araser le béton excédentaire au ras du sommet du cône.' },
            { num: 4, text: 'Soulever verticalement le cône avec précaution, sans choc, en 5 à 10 secondes.' },
            { num: 5, text: 'Mesurer la différence entre la hauteur du cône (300mm) et le point le plus haut du béton affaissé.' }
        ],
        hasCalculator: true,
        youtubeQuery: 'cone abrams beton affaissement',
        prompt: 'Create a 10-second educational animation showing concrete slump test, lifting metal cone, measuring collapsed fresh concrete with steel ruler, French building site',
        criteria: `
            <table class="criteria-table">
                <tr><th>Classe</th><th>Affaissement (mm)</th><th>Consistance & Usage</th></tr>
                <tr><td>S1</td><td>10 - 40 mm</td><td>Ferme - Béton extrudé ou vibré lourd</td></tr>
                <tr><td>S2</td><td>50 - 90 mm</td><td>Plastique - Semelles et dalles classiques</td></tr>
                <tr><td>S3</td><td>100 - 150 mm</td><td>Très plastique - Poutres, poteaux ordinaires</td></tr>
                <tr><td>S4</td><td>160 - 210 mm</td><td>Fluide - Béton pompé, ferraillage dense</td></tr>
                <tr><td>S5</td><td>&ge; 220 mm</td><td>Très fluide - Béton Auto-Plaçant (BAP)</td></tr>
            </table>
        `
    },
    {
        id: 'beton_rc',
        category: 'beton',
        categoryFr: '🏗️ Essais Béton',
        name: 'Résistance compression (Rc)',
        fullName: 'Résistance à la compression des éprouvettes cylindriques',
        norm: 'NM 10.1.026',
        objective: 'Mesurer la contrainte de rupture à la compression axiale du béton durci après cure (généralement à 28 jours) pour valider la classe de calcul structural.',
        domain: 'Validation structurelle obligatoire des ouvrages en béton armé.',
        equipments: [
            { icon: '🏗', name: 'Presse de compression hydraulique', spec: 'Cadence de charge de 0.6 ± 0.2 MPa/s' },
            { icon: '🧊', name: 'Éprouvettes cylindriques de cure', spec: '16 cm x 32 cm (surface 201 cm²) ou cubes' },
            { icon: '📏', name: 'Dispositif de rectification/surfaçage', spec: 'Mortier de soufre ou cales néoprène' }
        ],
        steps: [
            { num: 1, text: 'Sortir l\'éprouvette cylindrique du bac de cure à l\'eau (conservée à 20±2°C).' },
            { num: 2, text: 'Essuyer la surface et vérifier la planéité des faces de contact.' },
            { num: 3, text: 'Placer l\'éprouvette centrée sur les plateaux de la presse de compression.' },
            { num: 4, text: 'Appliquer la charge de manière continue et uniforme jusqu\'à rupture complète du cylindre.' },
            { num: 5, text: 'Noter la force de rupture ultime (F en kN) et analyser le mode de rupture (cône, cisaillement).' }
        ],
        hasCalculator: true,
        youtubeQuery: 'resistance compression beton cylindre',
        prompt: 'Create a 10-second educational animation showing concrete compression test, hydraulic press crushing cylindrical concrete sample, cracks forming, digital force screen, French lab',
        criteria: `
            <table class="criteria-table">
                <tr><th>Classe</th><th>Rc Visée (28 jours)</th><th>Applications</th></tr>
                <tr><td>C20/25</td><td>&ge; 25 MPa</td><td>Béton de structure courant (villa, pavillon)</td></tr>
                <tr><td>C25/30</td><td>&ge; 30 MPa</td><td>Bâtiment standard et dalles sollicitées</td></tr>
                <tr><td>C30/37</td><td>&ge; 37 MPa</td><td>Ouvrages d'art, ponts, poteaux très chargés</td></tr>
                <tr><td>&lt; 20 MPa</td><td>Non conforme</td><td>Non conforme pour structure porteuse</td></tr>
            </table>
        `
    },
    {
        id: 'beton_rt',
        category: 'beton',
        categoryFr: '🏗️ Essais Béton',
        name: 'Résistance traction (Rt)',
        fullName: 'Résistance à la traction par fendage (Essai Brésilien)',
        norm: 'NM 10.1.027',
        objective: 'Déterminer la résistance à la traction du béton durci en écrasant un cylindre horizontalement sous deux génératrices.',
        domain: 'Ouvrages routiers en béton, calcul des risques de fissuration.',
        equipments: [
            { icon: '🏗', name: 'Presse de compression', spec: 'Avec bandes de chargement en contreplaqué' },
            { icon: '🧊', name: 'Cylindre 16x32', spec: 'Standardisé' }
        ],
        steps: [
            { num: 1, text: 'Tracer deux lignes diamétralement opposées sur les génératrices du cylindre.' },
            { num: 2, text: 'Placer le cylindre horizontalement sur la presse en intercalant des bandes de bois.' },
            { num: 3, text: 'Charger uniformément jusqu\'à ce que le cylindre se fende verticalement en deux.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'essai traction par fendage bresilien beton',
        prompt: 'Educational animation: Concrete split tensile test, Brazilian test horizontal cylinder crack, French civil engineering',
        criteria: '<span class="status-pill status-conforme">Info</span> Rt vaut généralement 8 à 10% de la résistance à la compression Rc.'
    },
    {
        id: 'beton_eau_frais',
        category: 'beton',
        categoryFr: '🏗️ Essais Béton',
        name: 'Teneur en eau béton frais',
        fullName: 'Détermination de la teneur en eau du béton frais',
        norm: 'Méthodes physiques de dessiccation',
        objective: 'Mesurer la quantité d\'eau réelle présente dans un béton frais pour vérifier le respect du rapport Eau/Ciment théorique.',
        domain: 'Contrôle qualité sur centrale à béton.',
        equipments: [
            { icon: '🍳', name: 'Plaque chauffante / Poêle', spec: 'Pour évaporer l\'eau' },
            { icon: '⚖️', name: 'Balance étanche de chantier', spec: 'Précision 1g' }
        ],
        steps: [
            { num: 1, text: 'Peser une masse de béton frais homogène (environ 2 kg).' },
            { num: 2, text: 'Chauffer doucement en agitant constamment pour évaporer toute l\'eau sans brûler le ciment.' },
            { num: 3, text: 'Peser le mélange sec refroidi pour calculer l\'eau volatilisée.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'teneur en eau beton frais laboratoire',
        prompt: 'Educational animation: Frying pan test for fresh concrete water content, cement production control, French lab',
        criteria: '<span class="status-pill status-conforme">Ratio E/C</span> Un excès d\'eau chute dramatiquement la résistance finale du béton.'
    },
    {
        id: 'beton_mv',
        category: 'beton',
        categoryFr: '🏗️ Essais Béton',
        name: 'Masse volumique béton frais',
        fullName: 'Masse volumique du béton frais compacté',
        norm: 'NM 10.1.010',
        objective: 'Déterminer la masse volumique du béton frais pour évaluer la compacité et détecter un manque de vibration ou d\'air occlus.',
        domain: 'Suivi de production en préfabrication.',
        equipments: [
            { icon: '🪣', name: 'Récipient étanche rigide calibré', spec: 'Volume connu (ex: 5 Litres)' },
            { icon: '🌪️', name: 'Table vibrante de laboratoire', spec: 'Pour serrage complet' }
        ],
        steps: [
            { num: 1, text: 'Peser le récipient vide calibré.' },
            { num: 2, text: 'Remplir de béton frais en vibrant l\'appareil pour supprimer les vides d\'air.' },
            { num: 3, text: 'Araser à ras du récipient avec précaution.' },
            { num: 4, text: 'Peser le récipient rempli pour en déduire le poids volumique exact.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'masse volumique beton frais NM 10.1.010',
        prompt: 'Educational animation: Fresh concrete density test container, vibrating table, French concrete factory',
        criteria: '<span class="status-pill status-conforme">Normatif</span> Pour un béton standard vibré, la masse volumique doit être comprise entre 2300 et 2450 kg/m³.'
    },
    {
        id: 'beton_air',
        category: 'beton',
        categoryFr: '🏗️ Essais Béton',
        name: 'Teneur en air (aéromètre)',
        fullName: 'Mesure de la teneur en air occlus au vase d\'aéromètre',
        norm: 'NM 10.1.011',
        objective: 'Mesurer le pourcentage de bulles d\'air microscopiques occluses dans le béton frais pour valider la résistance au gel.',
        domain: 'Bétons routiers exposés au gel-dégel ou sels de déverglaçage.',
        equipments: [
            { icon: '🍼', name: 'Aéromètre à béton (Vase pressurisé)', spec: 'Volume de 5 ou 8 Litres, pompe intégrée' },
            { icon: '🎈', name: 'Manomètre à cadran gradué', spec: 'Lecture directe en % d\'air' }
        ],
        steps: [
            { num: 1, text: 'Introduire et compacter le béton dans le vase de l\'aéromètre.' },
            { num: 2, text: 'Fermer le couvercle étanche et injecter de l\'eau pour chasser l\'air de l\'espace libre.' },
            { num: 3, text: 'Pomper de l\'air dans la chambre de pression jusqu\'au trait zéro du cadran.' },
            { num: 4, text: 'Ouvrir la soupape de liaison pour transférer la pression et faire vibrer l\'appareil.' },
            { num: 5, text: 'Lire le pourcentage d\'air occlus indiqué sur le cadran.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'aerometre a beton air occlus',
        prompt: 'Educational animation: Concrete air content pressure test, air-entraining agent checking, French laboratory',
        criteria: `
            <table class="criteria-table">
                <tr><th>Conditions de Service</th><th>Taux d'air occlus recommandé</th><th>Statut</th></tr>
                <tr><td>Exposition sévère gel/sel</td><td>4.5% - 6.5%</td><td>Conforme ✅</td></tr>
                <tr><td>Béton ordinaire non exposé</td><td>&le; 2.0% (air naturel entraîné)</td><td>Admis ✅</td></tr>
                <tr><td>Excès d'air nuisible</td><td>&gt; 7.0% (baisse de résistance Rc)</td><td>Alerte ❌</td></tr>
            </table>
        `
    },
    {
        id: 'beton_dreux',
        category: 'beton',
        categoryFr: '🏗️ Essais Béton',
        name: 'Formulation Béton (Dreux-Gorisse)',
        fullName: 'Formulation de Béton - Méthode Dreux-Gorisse',
        norm: 'Méthode rationnelle Dreux-Gorisse',
        objective: 'Calculer les proportions optimales des constituants du béton (Ciment, Eau, Sable, Graviers) en fonction de la résistance mécanique et de l\'ouvrabilité exigées.',
        domain: 'Bureau d\'études et centrales à béton.',
        equipments: [
            { icon: '🔬', name: 'Logiciel / Calculatrice de formulation', spec: 'Calculs d\'équilibres granulaires' },
            { icon: ' Tamis ', name: 'Courbes de tamisage des granulats', spec: 'Sable et gravillons' }
        ],
        steps: [
            { num: 1, text: 'Fixer la résistance visée fc28 et évaluer le rapport C/E requis.' },
            { num: 2, text: 'Déterminer le dosage en eau E selon la taille maximale des granulats Dmax et la consistance.' },
            { num: 3, text: 'Calculer le dosage en ciment C adéquat.' },
            { num: 4, text: 'Tracer la ligne brisée de référence de Dreux sur les courbes granulométriques.' },
            { num: 5, text: 'Calculer les volumes absolus de sable et graviers nécessaires pour remplir 1 m³.' }
        ],
        hasCalculator: true,
        youtubeQuery: 'formulation de beton methode dreux gorisse',
        prompt: 'Create a 10-second educational animation showing concrete mix design formulation Dreux-Gorisse, showing sand, gravel, water and cement packaging, chemical mixer, French engineering',
        criteria: '<span class="status-pill status-conforme">Calculs</span> Permet de doser rationnellement un béton pour minimiser l\'usage du ciment tout en garantissant la résistance structurale visée.'
    },
    {
        id: 'beton_convenance',
        category: 'beton',
        categoryFr: '🏗️ Essais Béton',
        name: 'Épreuve de convenance',
        fullName: 'Épreuves d\'information, d\'étude et de convenance',
        norm: 'Conformité aux spécifications marchés publics',
        objective: 'Réaliser une gâchée expérimentale sur chantier pour valider en conditions réelles la formulation élaborée en laboratoire avant tout coulage définitif.',
        domain: 'Grands chantiers de génie civil.',
        equipments: [
            { icon: '🚚', name: 'Centrale à béton du chantier', spec: 'Mélangeur de production' },
            { icon: '🧊', name: 'Moulage d\'éprouvettes', spec: 'Suivi de résistance à 7 et 28j' }
        ],
        steps: [
            { num: 1, text: 'Fabriquer une gâchée d\'essai avec les engins réels du chantier.' },
            { num: 2, text: 'Mesurer immédiatement l\'affaissement et la masse volumique.' },
            { num: 3, text: 'Mouler les éprouvettes d\'information.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'epreuve de convenance beton de structure',
        prompt: 'Educational animation: Concrete plant calibration batch test on civil engineering site, French lab',
        criteria: '<span class="status-pill status-conforme">Conformité</span> Valide la conformité de l\'usine de production de béton avec les exigences théoriques.'
    },
    {
        id: 'beton_flexion',
        category: 'beton',
        categoryFr: '🏗️ Essais Béton',
        name: 'Résistance à la flexion',
        fullName: 'Résistance à la flexion sur prismes de béton',
        norm: 'NM 10.1.028',
        objective: 'Mesurer la résistance à la flexion sur des prismes (poutres) de béton sous charge centrale ou aux tiers.',
        domain: 'Chaussées en béton, dalles industrielles.',
        equipments: [
            { icon: '🏗', name: 'Presse de flexion', spec: 'Rouleaux d\'appui articulés' },
            { icon: ' Prisme ', name: 'Prismes de béton durci', spec: 'Poutre 10x10x40cm' }
        ],
        steps: [
            { num: 1, text: 'Placer l\'éprouvette prismatique sur les rouleaux d\'appui.' },
            { num: 2, text: 'Appliquer la force de flexion au milieu jusqu\'à rupture.' },
            { num: 3, text: 'Calculer la contrainte limite de traction par flexion.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'essai flexion prisme beton',
        prompt: 'Educational animation: Concrete flexural strength beam testing, pavement concrete design, French standards',
        criteria: '<span class="status-pill status-conforme">Info</span> Crucial pour le dimensionnement des dalles de routes et plateformes logistiques.'
    },
    {
        id: 'beton_absorption',
        category: 'beton',
        categoryFr: '🏗️ Essais Béton',
        name: 'Absorption d\'eau',
        fullName: 'Mesure de l\'absorption d\'eau du béton durci par immersion',
        norm: 'Normes de durabilité du béton',
        objective: 'Évaluer la porosité accessible à l\'eau du béton durci, indicateur direct de sa durabilité face aux agressions chimiques.',
        domain: 'Ouvrages maritimes ou souterrains.',
        equipments: [
            { icon: '⚖️', name: 'Balance hydrostatique', spec: 'Pesée dans l\'eau et hors-d\'eau' },
            { icon: '🔥', name: 'Étuve', spec: 'Pour dessiccation complète' }
        ],
        steps: [
            { num: 1, text: 'Sécher l\'échantillon de béton durci à l\'étuve.' },
            { num: 2, text: 'Peser sec, puis saturer d\'eau sous vide ou par immersion longue.' },
            { num: 3, text: 'Mesurer le poids saturé pour évaluer le volume des pores.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'absorption eau beton durci porosite',
        prompt: 'Educational animation: Durability water absorption concrete porosity test, French lab',
        criteria: '<span class="status-pill status-conforme">Info</span> Une absorption &lt; 5% caractérise un béton d\'excellente qualité et très imperméable.'
    },

    // === CATEGORY 4: ENROBÉS (8 ESSAIS) ===
    {
        id: 'enrobe_teneur_liant',
        category: 'enrobe',
        categoryFr: '🛣️ Essais Enrobés',
        name: 'Teneur en liant (extraction)',
        fullName: 'Détermination de la teneur en liant par extraction',
        norm: 'NF EN 12697-1',
        objective: 'Séparer le bitume des granulats d\'un enrobé routier par solvant ou calcination pour vérifier le dosage réel de bitume injecté.',
        domain: 'Contrôle qualité des centrales d\'enrobage.',
        equipments: [
            { icon: '🔥', name: 'Four de calcination', spec: 'Température > 500°C' },
            { icon: '🧪', name: 'Extracteur centrifuge à solvant', spec: 'Avec solvant chloré (perchloréthylène)' }
        ],
        steps: [
            { num: 1, text: 'Peser un bloc d\'enrobé tiède.' },
            { num: 2, text: 'Méthode Solvant : Dissoudre le liant à l\'extracteur centrifuge. Ou Méthode Calcination : Brûler le liant dans le four à haute température.' },
            { num: 3, text: 'Peser les granulats propres restants pour calculer la perte de masse correspondant au bitume.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'essai teneur en liant enrobe bitumineux extraction',
        prompt: 'Educational animation: Bitumen binder content extraction centrifuge test, clean aggregates, French asphalt lab',
        criteria: '<span class="status-pill status-conforme">Seuils</span> La teneur en liant (TL%) doit se situer généralement entre 5.0% et 6.5% selon l\'épaisseur de la chaussée.'
    },
    {
        id: 'enrobe_granulometrie',
        category: 'enrobe',
        categoryFr: '🛣️ Essais Enrobés',
        name: 'Analyse granulométrique enrobé',
        fullName: 'Analyse granulométrique sur granulats extraits',
        norm: 'NF EN 12697-2',
        objective: 'Vérifier la granulométrie des cailloux constituant la chaussée après élimination du bitume protecteur.',
        domain: 'Contrôle de conformité de la structure d\'enrobé routier.',
        equipments: [
            { icon: '🪜', name: 'Colonne de tamis de précision', spec: 'Tamisage routier normalisé' }
        ],
        steps: [
            { num: 1, text: 'Récupérer les granulats lavés issus de l\'extraction de liant.' },
            { num: 2, text: 'Procéder au tamisage complet de la même manière qu\'un granulat standard.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'analyse granulometrique enrobe bitumineux',
        prompt: 'Educational animation: Sifting gravel extracted from highway asphalt, French road design',
        criteria: '<span class="status-pill status-conforme">Info</span> La courbe granulométrique doit épouser le fuseau de spécification pour éviter les nids-de-poule.'
    },
    {
        id: 'enrobe_marshall',
        category: 'enrobe',
        categoryFr: '🛣️ Essais Enrobés',
        name: 'Stabilité & Fluage Marshall',
        fullName: 'Essai Marshall - Résistance plastique des mélanges bitumineux',
        norm: 'NF EN 12697-34',
        objective: 'Mesurer la résistance mécanique à chaud (stabilité) et la déformation plastique (fluage) d\'une éprouvette d\'enrobé soumise à compression diamétrale.',
        domain: 'Dimensionnement et formulation des enrobés routiers structurants.',
        equipments: [
            { icon: '🏗', name: 'Presse d\'essai Marshall', spec: 'Vitesse de charge 50 mm/min, mâchoires circulaires' },
            { icon: '💧', name: 'Bain-marie thermo-régulé', spec: 'Maintien à 60 ± 1 °C pendant 40 min' },
            { icon: '🔨', name: 'Compacteur Marshall automatique', spec: 'Poids de dame glissant standardisé' }
        ],
        steps: [
            { num: 1, text: 'Compacter l\'échantillon d\'enrobé chaud dans le moule cylindrique Marshall (50 coups par face).' },
            { num: 2, text: 'Démouler l\'éprouvette refroidie et mesurer ses dimensions.' },
            { num: 3, text: 'Placer l\'éprouvette au bain-marie à 60°C pendant 40 minutes.' },
            { num: 4, text: 'Transférer l\'éprouvette sur les mâchoires de la presse Marshall.' },
            { num: 5, text: 'Lancer l\'écrasement mécanique et enregistrer simultanément l\'effort de rupture (Stabilité) et la déformation (Fluage).' }
        ],
        hasCalculator: true,
        youtubeQuery: 'essai marshall enrobes bitumineux',
        prompt: 'Create a 10-second educational animation showing Marshall asphalt stability test, cylindrical bitumen sample inside circular loading jaws, compression, French laboratory',
        criteria: `
            <table class="criteria-table">
                <tr><th>Critère Routier</th><th>Seuil Exigé (Trafic lourd)</th><th>Statut</th></tr>
                <tr><td>Stabilité Marshall</td><td>&ge; 8.0 kN</td><td>Requis pour trafic lourd ✅</td></tr>
                <tr><td>Fluage Marshall</td><td>2.0 - 4.0 mm</td><td>Garantit la souplesse routière ✅</td></tr>
                <tr><td>Quotient Marshall (S/F)</td><td>2.0 - 5.0 kN/mm</td><td>Équilibre parfait requis ✅</td></tr>
            </table>
        `
    },
    {
        id: 'enrobe_pcg',
        category: 'enrobe',
        categoryFr: '🛣️ Essais Enrobés',
        name: 'Compactage PCG',
        fullName: 'Presse à Cisaillement Giratoire (PCG)',
        norm: 'NF EN 12697-31',
        objective: 'Étudier l\'aptitude au compactage des mélanges bitumineux en simulant le comportement sous rouleau compresseur de chantier.',
        domain: 'Formulation moderne des enrobés routiers performants.',
        equipments: [
            { icon: '🏗', name: 'Presse à cisaillement giratoire PCG', spec: 'Angle de giration de 0.82°' },
            { icon: '📏', name: 'Capteurs d\'épaisseur continus', spec: 'Enregistrement de la hauteur par tour' }
        ],
        steps: [
            { num: 1, text: 'Introduire l\'enrobé chaud dans le moule PCG cylindrique préchauffé.' },
            { num: 2, text: 'Appliquer une pression axiale de 0.6 MPa tout en induisant un mouvement de giration incliné.' },
            { num: 3, text: 'Enregistrer la hauteur de l\'éprouvette à chaque rotation pour en déduire la baisse du pourcentage de vides.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'presse cisaillement giratoire PCG enrobe',
        prompt: 'Educational animation: Gyratory shear compactor PCG machine, highway bitumen sample deformation, French road standards',
        criteria: '<span class="status-pill status-conforme">Info</span> Le taux de vides à un nombre de tours défini (ex: 80 tours) doit respecter la fourchette normative (ex: 4% à 8%).'
    },
    {
        id: 'enrobe_vides',
        category: 'enrobe',
        categoryFr: '🛣️ Essais Enrobés',
        name: 'Teneur en vides',
        fullName: 'Caractérisation des vides des éprouvettes bitumineuses',
        norm: 'NF EN 12697-8',
        objective: 'Calculer le volume de vide d\'un enrobé à partir de ses masses volumiques apparente et maximale réelle.',
        domain: 'Sécurité et perméabilité routières.',
        equipments: [
            { icon: '⚖️', name: 'Balance hydrostatique', spec: 'Pour pesée sous l\'eau' },
            { icon: ' Pycnomètre ', name: 'Pycnomètre à vide', spec: 'Détermination de la densité réelle maximale MVR' }
        ],
        steps: [
            { num: 1, text: 'Mesurer la masse volumique maximale réelle de l\'enrobé sans vide (MVR).' },
            { num: 2, text: 'Mesurer la masse volumique apparente de l\'éprouvette compactée (MVA).' },
            { num: 3, text: 'En déduire le pourcentage de vides volumique.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'teneur en vide enrobe bitumineux',
        prompt: 'Educational animation: Calculating air void content in pavement asphalt core sample, French civil engineering',
        criteria: '<span class="status-pill status-conforme">Seuils</span> Un taux de vides trop faible (&lt; 2%) induit un fluage/orniérage à la chaleur. Trop élevé (&gt; 10%) induit une désagrégation précoce.'
    },
    {
        id: 'enrobe_module',
        category: 'enrobe',
        categoryFr: '🛣️ Essais Enrobés',
        name: 'Module de rigidité',
        fullName: 'Détermination du module de rigidité des mélanges bitumineux',
        norm: 'NF EN 12697-26',
        objective: 'Mesurer les propriétés élastiques de l\'enrobé à différentes températures et fréquences pour les calculs de structure de chaussée.',
        domain: 'Dimensionnement analytique des autoroutes.',
        equipments: [
            { icon: '🏗', name: 'Machine d\'essais dynamiques', spec: 'Bâti de charge cyclique thermo-régulé' },
            { icon: '🔌', name: 'Capteurs de micro-déplacement LVDT', spec: 'Sensibilité extrême' }
        ],
        steps: [
            { num: 1, text: 'Fixer l\'éprouvette d\'enrobé trapézoïdale ou cylindrique dans le bâti d\'essai.' },
            { num: 2, text: 'Soumettre à une force sinusoïdale répétée dans l\'enceinte thermique.' },
            { num: 3, text: 'Mesurer la contrainte et la déformation dynamique de déphasage.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'module rigidite enrobes routiers laboratoire',
        prompt: 'Educational animation: Asphalt stiffness modulus laboratory testing under cyclic load, French high tech lab',
        criteria: '<span class="status-pill status-conforme">Info</span> Le module à 15°C et 10Hz est un paramètre de base de la méthode de dimensionnement française.'
    },
    {
        id: 'enrobe_ornierage',
        category: 'enrobe',
        categoryFr: '🛣️ Essais Enrobés',
        name: 'Orniérage',
        fullName: 'Résistance à la déformation permanente par orniérage',
        norm: 'NF EN 12697-22',
        objective: 'Mesurer la sensibilité de l\'enrobé à créer des ornières sous le passage répété d\'une roue chargée à température élevée (60°C).',
        domain: 'Enrobés autoroutiers et zones à fort trafic poids lourds.',
        equipments: [
            { icon: '🚜', name: 'Orniéreur routier de laboratoire', spec: 'Roue équipée de pneu gonflé à 0.6 MPa' },
            { icon: '🔥', name: 'Enceinte thermique thermo-régulée', spec: 'Chauffée à 60°C' }
        ],
        steps: [
            { num: 1, text: 'Fabriquer une dalle d\'enrobé de 30x30 cm à l\'aide d\'un compacteur de plaque.' },
            { num: 2, text: 'Placer la dalle dans l\'orniéreur à 60°C.' },
            { num: 3, text: 'Faire passer la roue chargée à plusieurs milliers de cycles (ex : 10 000 ou 30 000 passages).' },
            { num: 4, text: 'Mesurer la profondeur de l\'empreinte / ornière créée par le pneu.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'essai ornierage enrobe bitumineux NF EN 12697-22',
        prompt: 'Educational animation: Highway asphalt wheel tracking rutting test, tire running over slab at 60C, French engineering',
        criteria: '<span class="status-pill status-conforme">Info</span> La profondeur d\'ornière après 10 000 cycles ne doit pas dépasser 5% à 10% de l\'épaisseur nominale de la dalle.'
    },
    {
        id: 'enrobe_adhesivite',
        category: 'enrobe',
        categoryFr: '🛣️ Essais Enrobés',
        name: 'Adhésivité liant/granulat',
        fullName: 'Mesure de l\'adhésivité du bitume sur granulats',
        norm: 'NF EN 12697-11',
        objective: 'Évaluer la résistance au désenrobage sous l\'action mécanique de l\'eau pour prévenir l\'effilochage de la chaussée.',
        domain: 'Validation des additifs dope d\'adhésivité.',
        equipments: [
            { icon: '🌪️', name: 'Bouteilles rotatives', spec: 'Mouvement de rotation lent à l\'eau' }
        ],
        steps: [
            { num: 1, text: 'Enrober des gravillons calibrés avec une quantité fixe de bitume chaud.' },
            { num: 2, text: 'Placer les granulats enrobés dans des flacons d\'eau en rotation.' },
            { num: 3, text: 'Observer et estimer visuellement le pourcentage de surface de roche dénudée après agitation.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'essai adhesivite liant granulat enrobe',
        prompt: 'Educational animation: Binder stripping test from stone aggregate surface in water bottle, French road laboratory',
        criteria: '<span class="status-pill status-conforme">Info</span> L\'adhésivité doit être &ge; 80% de couverture résiduelle de liant sur le caillou.'
    },

    // === CATEGORY 5: MATÉRIAUX DIVERS (5 ESSAIS) ===
    {
        id: 'divers_brique',
        category: 'divers',
        categoryFr: '🧱 Essais Matériaux Divers',
        name: 'Brique / Parpaing',
        fullName: 'Résistance à la compression des blocs béton / terre cuite',
        norm: 'NM d\'essais sur blocs de maçonnerie',
        objective: 'Écraser des blocs de béton (parpaings) ou briques à l\'aide d\'une presse industrielle pour valider leur capacité portante murale.',
        domain: 'Réception des matériaux de gros œuvre.',
        equipments: [
            { icon: '🏗', name: 'Presse de compression à grand plateau', spec: 'Cadence de charge stabilisée' },
            { icon: ' Cales ', name: 'Plaques de répartition en fibre de bois', spec: 'Pour compenser les irrégularités' }
        ],
        steps: [
            { num: 1, text: 'Surfacer si nécessaire les faces d\'appui du bloc pour garantir le parallélisme.' },
            { num: 2, text: 'Placer le bloc centré sur le plateau de la grande presse.' },
            { num: 3, text: 'Augmenter la charge hydraulique jusqu\'à éclatement du bloc.' },
            { num: 4, text: 'Calculer la contrainte de rupture en MPa par rapport à la section brute/nette.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'essai compression brique parpaing laboratoire',
        prompt: 'Educational animation: Concrete block brick hydraulic crushing test, French building construction quality control',
        criteria: '<span class="status-pill status-conforme">Info</span> Pour un bloc béton (parpaing B40 porteur), la contrainte de rupture doit dépasser 4 MPa (40 bars).'
    },
    {
        id: 'divers_chaux',
        category: 'divers',
        categoryFr: '🧱 Essais Matériaux Divers',
        name: 'Chaux - Temps de prise',
        fullName: 'Temps de prise de la chaux hydraulique au consistomètre Vicat',
        norm: 'Normes chaux de construction',
        objective: 'Déterminer le début et la fin de prise de la chaux pour garantir sa maniabilité sur chantier.',
        domain: 'Restauration du patrimoine et enduits.',
        equipments: [
            { icon: '針', name: 'Appareil de Vicat avec aiguille 1.13mm', spec: 'Poids plongeur de 300g' }
        ],
        steps: [
            { num: 1, text: 'Mélanger la chaux avec de l\'eau pour former la pâte normale.' },
            { num: 2, text: 'Introduire la pâte dans le moule tronconique.' },
            { num: 3, text: 'Relâcher périodiquement l\'aiguille de Vicat et mesurer l\'enfoncement.' },
            { num: 4, text: 'Noter le temps pour lequel l\'aiguille s\'arrête à 4 mm du fond (début de prise).' }
        ],
        hasCalculator: false,
        youtubeQuery: 'temps de prise chaux aiguille vicat',
        prompt: 'Educational animation: Lime setting time Vicat needle test, French historical renovation materials',
        criteria: '<span class="status-pill status-conforme">Info</span> Le début de prise de la chaux hydraulique doit généralement survenir après 2 à 4 heures.'
    },
    {
        id: 'divers_ciment',
        category: 'divers',
        categoryFr: '🧱 Essais Matériaux Divers',
        name: 'Ciment - Résistance mécanique',
        fullName: 'Essais des ciments - Résistance à la flexion et compression',
        norm: 'NM 10.1.004',
        objective: 'Mesurer sur mortier normalisé la résistance en flexion puis en compression d\'éprouvettes prismatiques 4x4x16 cm.',
        domain: 'Réception obligatoire de conformité des ciments commerciaux.',
        equipments: [
            { icon: ' Prisme ', name: 'Moules métalliques de prismes 4x4x16 cm', spec: 'Garantissant des cotes parfaites' },
            { icon: ' Choc ', name: 'Appareil à choc de compactage', spec: 'Pour serrage uniforme du mortier' },
            { icon: ' Pres ', name: 'Presse d\'essai double', spec: 'Flexion puis compression sur demi-prismes' }
        ],
        steps: [
            { num: 1, text: 'Préparer le mortier normalisé (Ciment, Sable normalisé CEN, Eau distillée).' },
            { num: 2, text: 'Remplir le moule triple 4x4x16 cm et compacter sur la table à chocs.' },
            { num: 3, text: 'Conserver en cure humide étanche pendant 28 jours.' },
            { num: 4, text: 'Tester d\'abord la rupture en flexion centrale, ce qui génère deux demi-prismes.' },
            { num: 5, text: 'Écraser individuellement les demi-prismes sur la presse de compression.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'resistance mecanique ciment prisme 4x4x16',
        prompt: 'Educational animation: Cement mechanical strength mortar prism testing, hydraulic press double compression, French laboratory',
        criteria: '<span class="status-pill status-conforme">Seuils</span> Pour la classe 42.5 R, la résistance à 28 jours doit obligatoirement dépasser 42.5 MPa.'
    },
    {
        id: 'divers_geotextile',
        category: 'divers',
        categoryFr: '🧱 Essais Matériaux Divers',
        name: 'Géotextile - Résistance traction',
        fullName: 'Essai de traction sur bandes larges de géotextile',
        norm: 'Normes géotextiles d\'infrastructures',
        objective: 'Mesurer la charge maximale de rupture par traction et l\'allongement élastique des nappes de géotextiles.',
        domain: 'Ouvrages de soutènement, routes, stabilisation de talus.',
        equipments: [
            { icon: '🏗', name: 'Machine d\'essai de traction universelle', spec: 'Mors larges antidérapants de 200 mm' }
        ],
        steps: [
            { num: 1, text: 'Découper des bandes de géotextiles de 200 mm de largeur.' },
            { num: 2, text: 'Serrer solidement l\'échantillon dans les mors de la machine hydraulique.' },
            { num: 3, text: 'Démarrer la traction à vitesse constante.' },
            { num: 4, text: 'Enregistrer la courbe force-allongement.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'essai traction geotextile laboratoire',
        prompt: 'Educational animation: Geotextile tensile strength test on universal mechanical testing machine, road stabilization, French lab',
        criteria: '<span class="status-pill status-conforme">Seuils</span> Exprimée en kN/m. Indispensable pour s\'assurer que le textile ne se déchire pas sous le poids des cailloux de remblai.'
    },
    {
        id: 'divers_acier',
        category: 'divers',
        categoryFr: '🧱 Essais Matériaux Divers',
        name: 'Acier - Traction / Pliage',
        fullName: 'Essai de traction des ronds à béton et fils d\'armatures',
        norm: 'Normes aciers de béton armé',
        objective: 'Déterminer la limite élastique (Re), la résistance à la traction (Rm) et l\'aptitude au façonnage (pliage) des aciers de béton armé.',
        domain: 'Homologation des aciers d\'armatures de structures.',
        equipments: [
            { icon: '🏗', name: 'Machine universelle de traction lourde', spec: 'Capacité > 100 tonnes, mâchoires hydrauliques' },
            { icon: '📏', name: 'Extensomètre de contact mécanique', spec: 'Mesure de l\'allongement sous charge' }
        ],
        steps: [
            { num: 1, text: 'Marquer l\'entre-axe initial Lo de la barre d\'acier.' },
            { num: 2, text: 'Brider la barre dans les mors hydrauliques de la presse universelle.' },
            { num: 3, text: 'Fixer l\'extensomètre pour capturer la phase élastique linéaire.' },
            { num: 4, text: 'Tracter jusqu\'à striction prononcée et rupture de la barre avec bruit sec.' },
            { num: 5, text: 'Calculer la contrainte élastique (Re), la résistance ultime (Rm) et le pliage à froid sur mandrin.' }
        ],
        hasCalculator: false,
        youtubeQuery: 'essai traction acier rond a beton',
        prompt: 'Educational animation: Steel rebar tensile testing, plastic deformation, snapping under high load, French metallurgical laboratory',
        criteria: `
            <table class="criteria-table">
                <tr><th>Classe Acier</th><th>Limite Élastique Re Min</th><th>Rapport Rm/Re</th><th>Statut</th></tr>
                <tr><td>Fe E500 (standard)</td><td>&ge; 500 MPa</td><td>&ge; 1.05 (ductilité)</td><td>Conforme ✅</td></tr>
                <tr><td>Ductilité supérieure</td><td>&ge; 500 MPa</td><td>&ge; 1.15 (antisismique)</td><td>Excellent ✅</td></tr>
                <tr><td>Rupture fragile</td><td>&lt; 500 MPa</td><td>-</td><td>Rejeté ❌</td></tr>
            </table>
        `
    }
];

// --- 3. INITIALIZATION AND ROUTING SYSTEM ---
document.addEventListener('DOMContentLoaded', () => {
    // Load config from LocalStorage if present
    loadSettings();
    
    // Sync UI elements with config
    applyConfigUI();
    
    // Init favorites and history databases
    initDatabase();
    
    // Populate tests lists & launcher grids
    renderTestsList();
    renderCalculatorsGrid();
    renderQuickCalcGrid();
    
    // Start active clock in status bar
    startStatusBarClock();
    
    // Set default home stats
    updateHomeStatistics();
    
    // Setup general event listeners
    setupEventListeners();
    
    // Switch to initial tab (Accueil)
    switchTab('accueil');
});

function startStatusBarClock() {
    const clockEl = document.getElementById('status-clock');
    const updateClock = () => {
        const now = new Date();
        let hours = now.getHours().toString().padStart(2, '0');
        let mins = now.getMinutes().toString().padStart(2, '0');
        clockEl.innerText = `${hours}:${mins}`;
    };
    updateClock();
    setInterval(updateClock, 1000 * 30);
    
    // Mock local weather date
    const dateEl = document.getElementById('weather-date');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.innerText = new Date().toLocaleDateString('fr-FR', options);
}

// Switch between navigation tabs
function switchTab(tabId, categoryFilter = 'all') {
    // Update bottom nav active classes
    const navItems = document.querySelectorAll('.bottom-navigation .nav-item');
    const tabMapping = ['accueil', 'essais', 'calculatrices', 'rapports', 'parametres'];
    const tabIndex = tabMapping.indexOf(tabId);
    
    navItems.forEach((item, idx) => {
        if (idx === tabIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Hide all panel screens, show the active one
    const panels = document.querySelectorAll('.screen-panel');
    panels.forEach(panel => {
        panel.classList.remove('active');
    });
    
    const targetPanel = document.getElementById(`panel-${tabId}`);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }
    
    currentTab = tabId;
    
    // If we switched to Essais and a category filter is provided
    if (tabId === 'essais' && categoryFilter !== 'all') {
        const chip = document.querySelector(`.filter-chips .chip[onclick*="filterByCategory('${categoryFilter}'"]`);
        if (chip) {
            chip.click();
        } else {
            filterByCategory(categoryFilter);
        }
    }
    
    // Scroll container to top
    document.getElementById('main-content-scroll').scrollTop = 0;
}

// Setup general event listeners
function setupEventListeners() {
    // Global search bar
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            performSearch(e.target.value);
        });
    }
    
    // FAB floating action button click
    const fabBtn = document.getElementById('fab-calculator');
    if (fabBtn) {
        fabBtn.addEventListener('click', () => {
            openQuickCalcDialog();
        });
    }
    
    // Theme toggler buttons
    const themeBtnHeader = document.getElementById('theme-toggle-btn');
    if (themeBtnHeader) {
        themeBtnHeader.addEventListener('click', toggleDarkMode);
    }
    
    const themeCheckbox = document.getElementById('dark-mode-toggle');
    if (themeCheckbox) {
        themeCheckbox.addEventListener('change', (e) => {
            if (e.target.checked !== appConfig.darkMode) {
                toggleDarkMode();
            }
        });
    }
    
    // Settings fields updates
    const labInput = document.getElementById('settings-lab-name');
    if (labInput) {
        labInput.addEventListener('input', (e) => {
            appConfig.labName = e.target.value;
            saveSettings();
            applyConfigUI();
        });
    }
    const techInput = document.getElementById('settings-technician');
    if (techInput) {
        techInput.addEventListener('input', (e) => {
            appConfig.technicianName = e.target.value;
            saveSettings();
            applyConfigUI();
        });
    }
    const licInput = document.getElementById('settings-license');
    if (licInput) {
        licInput.addEventListener('input', (e) => {
            appConfig.license = e.target.value;
            saveSettings();
            applyConfigUI();
        });
    }
    
    // Database JSON import
    const importBtn = document.getElementById('import-trigger-btn');
    const importFile = document.getElementById('import-db-file');
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => {
            importFile.click();
        });
        importFile.addEventListener('change', (e) => {
            handleImportDatabase(e);
        });
    }
    
    // Detail Favorite button click
    const detailFavBtn = document.getElementById('detail-fav-btn');
    if (detailFavBtn) {
        detailFavBtn.addEventListener('click', () => {
            if (selectedTest) {
                toggleFavorite(selectedTest.id);
                updateDetailFavoriteBtnState();
            }
        });
    }
}

// --- 4. THEME & LOCAL SETTINGS MANAGEMENT ---
function toggleDarkMode() {
    appConfig.darkMode = !appConfig.darkMode;
    saveSettings();
    applyConfigUI();
}

function saveSettings() {
    localStorage.setItem('labqualite_config', JSON.stringify(appConfig));
}

function loadSettings() {
    const saved = localStorage.getItem('labqualite_config');
    if (saved) {
        try {
            appConfig = { ...appConfig, ...JSON.parse(saved) };
        } catch (e) {
            console.error('Failed to parse settings', e);
        }
    }
}

function applyConfigUI() {
    // Add/remove dark theme class on body
    if (appConfig.darkMode) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    
    // Sync settings view controls
    const checkbox = document.getElementById('dark-mode-toggle');
    if (checkbox) checkbox.checked = appConfig.darkMode;
    
    const labInput = document.getElementById('settings-lab-name');
    if (labInput && labInput.value !== appConfig.labName) labInput.value = appConfig.labName;
    
    const techInput = document.getElementById('settings-technician');
    if (techInput && techInput.value !== appConfig.technicianName) techInput.value = appConfig.technicianName;
    
    const licInput = document.getElementById('settings-license');
    if (licInput && licInput.value !== appConfig.license) licInput.value = appConfig.license;
    
    // Sync header/home labels
    const homeLabNameEl = document.getElementById('label-nom-labo-home');
    if (homeLabNameEl) homeLabNameEl.innerText = appConfig.labName;
    
    const printLabNameEl = document.getElementById('print-lbl-lab-name');
    if (printLabNameEl) printLabNameEl.innerText = appConfig.labName;
    
    const greetingEl = document.getElementById('home-greeting');
    if (greetingEl) {
        greetingEl.innerText = `Bonjour, ${appConfig.technicianName.split(' ')[0]}`;
    }
}

// --- 5. LOCAL STORAGE OFFLINE DATABASE ---
function initDatabase() {
    // Favorites
    const savedFavs = localStorage.getItem('labqualite_favorites');
    if (savedFavs) {
        try { favorites = JSON.parse(savedFavs); } catch(e) {}
    }
    
    // History
    const savedHistory = localStorage.getItem('labqualite_history');
    if (savedHistory) {
        try { history = JSON.parse(savedHistory); } catch(e) {}
    } else {
        // Pre-populate with a demo calculation for premium aesthetics at first launch
        history = [
            {
                id: 'calc_' + Date.now(),
                testId: 'sol_teneur_eau',
                testName: 'Teneur en eau',
                norm: 'NM 13.152 (2022)',
                category: 'sol',
                date: '2026-05-26T14:30:00Z',
                project: 'Projet Autoroute Fès-Taounate (Section PK12)',
                technician: appConfig.technicianName,
                license: appConfig.license,
                inputs: {
                    M1: 45.20,
                    M2: 248.50,
                    M3: 226.10
                },
                outputs: {
                    w: '12.38 %',
                    classification: 'Sec/Humide Moyen (Humidité optimale pour compactage)'
                },
                isConforme: true
            }
        ];
        saveHistoryToStorage();
    }
}

function saveFavoritesToStorage() {
    localStorage.setItem('labqualite_favorites', JSON.stringify(favorites));
    renderTestsList();
    renderFavoritesCarousel();
}

function saveHistoryToStorage() {
    localStorage.setItem('labqualite_history', JSON.stringify(history));
    renderHistoryLists();
    updateHomeStatistics();
}

function updateHomeStatistics() {
    // Total count of executed calculations
    const recentPanelContainer = document.getElementById('home-recents-list');
    if (recentPanelContainer) {
        renderHistoryLists();
    }
}

function toggleFavorite(testId) {
    const idx = favorites.indexOf(testId);
    if (idx === -1) {
        favorites.push(testId);
    } else {
        favorites.splice(idx, 1);
    }
    saveFavoritesToStorage();
}

function isFavorite(testId) {
    return favorites.includes(testId);
}

// Reset Local database
function resetDatabase() {
    if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique des calculs ? Cette action est irréversible.')) {
        history = [];
        saveHistoryToStorage();
        alert('Base de données réinitialisée avec succès.');
    }
}

// Export database history to JSON file
function exportDatabase() {
    const exportData = {
        appConfig: appConfig,
        favorites: favorites,
        history: history,
        exportedAt: new Date().toISOString()
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `LabQualiteBTP_Backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

// Handle JSON database import
function handleImportDatabase(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const imported = JSON.parse(evt.target.result);
            if (imported.history && Array.isArray(imported.history)) {
                history = imported.history;
                if (imported.favorites && Array.isArray(imported.favorites)) {
                    favorites = imported.favorites;
                }
                if (imported.appConfig) {
                    appConfig = { ...appConfig, ...imported.appConfig };
                }
                saveHistoryToStorage();
                saveFavoritesToStorage();
                saveSettings();
                applyConfigUI();
                alert('Sauvegarde importée avec succès !');
            } else {
                alert('Format de fichier invalide. Impossible de restaurer.');
            }
        } catch(err) {
            alert('Erreur lors de la lecture du fichier JSON.');
        }
    };
    reader.readAsText(file);
}

// --- 6. RENDER DATA VIEWS ---

// Populate 44 Tests panel
function renderTestsList(items = TESTS_DATABASE) {
    const listContainer = document.getElementById('tests-list-container');
    if (!listContainer) return;
    
    if (items.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">Aucun essai trouvé pour cette recherche.</div>';
        return;
    }
    
    listContainer.innerHTML = '';
    items.forEach(test => {
        const isFav = isFavorite(test.id);
        const row = document.createElement('div');
        row.className = 'test-row';
        row.innerHTML = `
            <div class="test-row-main" onclick="openTestDetails('${test.id}')">
                <span class="test-row-cat">${test.categoryFr}</span>
                <span class="test-row-title">${test.name}</span>
                <span class="test-row-norm">${test.norm}</span>
            </div>
            <div class="test-row-actions">
                <span class="fav-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${test.id}')">★</span>
                <span class="arrow-icon" onclick="openTestDetails('${test.id}')">➡️</span>
            </div>
        `;
        listContainer.appendChild(row);
    });
}

// Populate search and chip filters
let currentCategoryFilter = 'all';
function filterByCategory(category, element = null) {
    currentCategoryFilter = category;
    
    // Update active class on chips
    const chips = document.querySelectorAll('.filter-chips .chip');
    chips.forEach(c => c.classList.remove('active'));
    
    if (element) {
        element.classList.add('active');
    } else {
        // Find chip by text or context
        const categoryMap = { 'all': 'Tous', 'sol': '🌍 Sols', 'granulat': '🪨 Granulats', 'beton': '🏗️ Béton', 'enrobe': '🛣️ Enrobés', 'divers': '🧱 Divers' };
        const label = categoryMap[category];
        chips.forEach(c => {
            if (c.innerText === label || c.innerText.includes(categoryMap[category])) {
                c.classList.add('active');
            }
        });
    }
    
    applyFilters();
}

function performSearch(query) {
    applyFilters();
}

function applyFilters() {
    const query = document.getElementById('search-bar').value.toLowerCase().trim();
    let filtered = TESTS_DATABASE;
    
    // Filter by Category
    if (currentCategoryFilter !== 'all') {
        filtered = filtered.filter(t => t.category === currentCategoryFilter);
    }
    
    // Search filter
    if (query !== '') {
        filtered = filtered.filter(t => 
            t.name.toLowerCase().includes(query) || 
            t.fullName.toLowerCase().includes(query) || 
            t.norm.toLowerCase().includes(query) ||
            t.objective.toLowerCase().includes(query)
        );
    }
    
    renderTestsList(filtered);
}

// Populate 11 calculators launcher grid on page 3
function renderCalculatorsGrid() {
    const gridContainer = document.getElementById('calculators-grid-container');
    if (!gridContainer) return;
    
    const calcTests = TESTS_DATABASE.filter(t => t.hasCalculator);
    gridContainer.innerHTML = '';
    
    calcTests.forEach(test => {
        const item = document.createElement('div');
        item.className = 'calculator-launcher';
        item.onclick = () => {
            switchTab('essais');
            openTestDetails(test.id);
            // Scroll down to calculator section
            setTimeout(() => {
                const calcSec = document.getElementById('sec-calculator');
                if (calcSec) {
                    calcSec.scrollIntoView({ behavior: 'smooth' });
                }
            }, 360);
        };
        
        item.innerHTML = `
            <div class="calc-launch-icon">🧮</div>
            <div class="calc-launch-info">
                <span class="calc-launch-name">${test.name}</span>
                <span class="calc-launch-desc">${test.norm}</span>
            </div>
            <span class="arrow-icon">➡️</span>
        `;
        gridContainer.appendChild(item);
    });
}

// Populating quick launcher drawer modal
function renderQuickCalcGrid() {
    const gridContainer = document.getElementById('quick-calc-grid');
    if (!gridContainer) return;
    
    const calcTests = TESTS_DATABASE.filter(t => t.hasCalculator);
    gridContainer.innerHTML = '';
    
    calcTests.forEach(test => {
        const item = document.createElement('div');
        item.className = 'dialog-item';
        item.innerText = test.name;
        item.onclick = () => {
            closeQuickCalcDialog();
            switchTab('essais');
            openTestDetails(test.id);
            setTimeout(() => {
                const calcSec = document.getElementById('sec-calculator');
                if (calcSec) {
                    calcSec.scrollIntoView({ behavior: 'smooth' });
                }
            }, 360);
        };
        gridContainer.appendChild(item);
    });
}

// Populating favorites carousel on main screen
function renderFavoritesCarousel() {
    const carousel = document.getElementById('home-favorites-list');
    if (!carousel) return;
    
    const favTests = TESTS_DATABASE.filter(t => favorites.includes(t.id));
    if (favTests.length === 0) {
        carousel.innerHTML = '<div class="empty-state">Aucun essai favori. Marquez des essais avec ★ pour les retrouver ici.</div>';
        return;
    }
    
    carousel.innerHTML = '';
    favTests.forEach(test => {
        const card = document.createElement('div');
        card.className = 'scroll-card';
        card.onclick = () => {
            switchTab('essais');
            openTestDetails(test.id);
        };
        card.innerHTML = `
            <span class="scroll-card-tag tag-${test.category}">${test.category === 'granulat' ? 'Granulat' : test.category.charAt(0).toUpperCase() + test.category.slice(1)}</span>
            <span class="scroll-card-title">${test.name}</span>
            <span class="scroll-card-norm">${test.norm.split(' ')[0]}</span>
        `;
        carousel.appendChild(card);
    });
}

// Populate Reports panel & Home Recents panel
function renderHistoryLists() {
    // 1. Home Recent List (max 3 items)
    const homeList = document.getElementById('home-recents-list');
    if (homeList) {
        const sortedHistory = [...history].sort((a,b) => new Date(b.date) - new Date(a.date));
        if (sortedHistory.length === 0) {
            homeList.innerHTML = '<div class="empty-state">Aucun calcul effectué récemment.</div>';
        } else {
            homeList.innerHTML = '';
            sortedHistory.slice(0, 3).forEach(item => {
                homeList.appendChild(createReportItemHTML(item, false));
            });
        }
    }
    
    // 2. Reports Page History List
    const reportsList = document.getElementById('reports-list-container');
    if (reportsList) {
        const sortedHistory = [...history].sort((a,b) => new Date(b.date) - new Date(a.date));
        if (sortedHistory.length === 0) {
            reportsList.innerHTML = '<div class="empty-state">Aucun rapport sauvegardé. Réalisez un calcul dans la fiche d\'un essai pour l\'enregistrer.</div>';
        } else {
            reportsList.innerHTML = '';
            sortedHistory.forEach(item => {
                reportsList.appendChild(createReportItemHTML(item, true));
            });
        }
    }
}

function createReportItemHTML(item, showActions = true) {
    const card = document.createElement('div');
    card.className = 'report-item';
    
    const formattedDate = new Date(item.date).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    // Inputs summary markup
    let inputsSummary = '';
    for (const [k, v] of Object.entries(item.inputs)) {
        inputsSummary += `<span><b>${k}</b>: ${v}</span> | `;
    }
    inputsSummary = inputsSummary.slice(0, -3); // remove trailing delimiter
    
    // Outputs summary markup
    let outputsSummary = '';
    for (const [k, v] of Object.entries(item.outputs)) {
        if (k !== 'graphData') {
            outputsSummary += `<div><b>${k}</b>: ${v}</div>`;
        }
    }
    
    card.innerHTML = `
        <div class="report-item-header">
            <div>
                <span class="report-item-title">${item.testName} (${item.norm.split(' ')[0]})</span>
                <div class="report-item-meta">Projet: <b>${item.project}</b> | ${formattedDate}</div>
            </div>
            <span class="status-pill ${item.isConforme ? 'status-conforme' : 'status-nonconforme'}">
                ${item.isConforme ? 'CONFORME ✅' : 'NON CONFORME ❌'}
            </span>
        </div>
        
        <div class="report-item-details">
            <div style="border-bottom:1px solid rgba(0,0,0,0.05); padding-bottom:4px; margin-bottom:4px; font-size:10px; color:var(--md-outline);">
                ENTRÉES: ${inputsSummary}
            </div>
            <div>
                ${outputsSummary}
            </div>
        </div>
        
        ${showActions ? `
            <div class="report-actions">
                <button class="btn-small btn-small-primary" onclick="printReport('${item.id}')">🖨️ PDF</button>
                <button class="btn-small btn-small-share" onclick="shareReport('${item.id}', 'whatsapp')">💬 WhatsApp</button>
                <button class="btn-small btn-small-share" onclick="shareReport('${item.id}', 'email')">📧 Email</button>
                <button class="btn-small btn-small-delete" onclick="deleteReport('${item.id}')" style="margin-left:auto;">🗑️</button>
            </div>
        ` : ''}
    `;
    return card;
}

// --- 7. IMMERSIVE TEST DETAIL VIEWS ---
function openTestDetails(testId) {
    const test = TESTS_DATABASE.find(t => t.id === testId);
    if (!test) return;
    
    selectedTest = test;
    
    // Populate header titles
    document.getElementById('detail-header-title').innerText = test.name;
    document.getElementById('detail-header-norm').innerText = test.norm;
    
    // Favorite icon state
    updateDetailFavoriteBtnState();
    
    // Section 1: Presentation
    document.getElementById('detail-presentation-text').innerHTML = `
        <p style="margin-bottom: 8px;"><b>Objectif :</b> ${test.objective}</p>
        <p><b>Domaine d'application :</b> ${test.domain}</p>
    `;
    
    // Section 2: Equipment
    const eqList = document.getElementById('detail-equipments-list');
    eqList.innerHTML = '';
    test.equipments.forEach(eq => {
        const li = document.createElement('li');
        li.className = 'equipment-item';
        li.innerHTML = `
            <span class="equip-icon">${eq.icon}</span>
            <div class="equip-text">
                <span class="equip-title">${eq.name}</span>
                <span class="equip-desc">${eq.spec}</span>
            </div>
        `;
        eqList.appendChild(li);
    });
    
    // Section 3: Steps
    const stepList = document.getElementById('detail-procedure-list');
    stepList.innerHTML = '';
    test.steps.forEach(st => {
        const div = document.createElement('div');
        div.className = 'step-item';
        div.innerHTML = `
            <div class="step-num">${st.num}</div>
            <div class="step-content">
                <span class="step-desc">${st.text}</span>
                <div class="step-placeholder">
                    <span class="step-placeholder-icon">📸</span>
                    <span class="step-placeholder-text">Schéma - Étape ${st.num}</span>
                </div>
            </div>
        `;
        stepList.appendChild(div);
    });
    
    // Section 4: Integrated Calculator Form
    const formContainer = document.getElementById('detail-calculator-form-container');
    if (test.hasCalculator) {
        document.getElementById('sec-calculator').style.display = 'flex';
        renderCalculatorForm(test.id, formContainer);
    } else {
        document.getElementById('sec-calculator').style.display = 'none';
    }
    
    // Section 5: YouTube links
    const ytBtn = document.getElementById('detail-youtube-btn');
    ytBtn.onclick = () => {
        const query = encodeURIComponent(test.youtubeQuery);
        window.open(`https://youtube.com/results?search_query=${query}`, '_blank');
    };
    
    // Section 6: AI Animation Prompt details
    const aiPromptBox = document.getElementById('detail-ai-prompt');
    const fullPrompt = `Create a 10-second educational animation showing ${test.name} laboratory procedure, professional quality control, clear steps, French laboratory`;
    aiPromptBox.innerText = fullPrompt;
    
    const aiBtn = document.getElementById('detail-ai-btn');
    aiBtn.onclick = () => {
        navigator.clipboard.writeText(fullPrompt);
        alert('Prompt copié ! Ouverture de Google AI Studio (Veo) dans votre navigateur.');
        window.open('https://aistudio.google.com/app/veo', '_blank');
    };
    
    // Section 7: Acceptance Criteria
    document.getElementById('detail-acceptance-container').innerHTML = test.criteria;
    
    // Show sliding pane panel
    const pane = document.getElementById('test-detail-pane');
    pane.classList.add('open');
    
    // Scroll pane to top
    document.getElementById('detail-pane-scroll').scrollTop = 0;
}

function closeTestDetails() {
    const pane = document.getElementById('test-detail-pane');
    pane.classList.remove('open');
    selectedTest = null;
    
    // Sync home components since favorites/history might have updated
    renderFavoritesCarousel();
}

function updateDetailFavoriteBtnState() {
    const detailFavBtn = document.getElementById('detail-fav-btn');
    if (selectedTest && isFavorite(selectedTest.id)) {
        detailFavBtn.classList.add('active');
        detailFavBtn.innerText = '★';
    } else {
        detailFavBtn.classList.remove('active');
        detailFavBtn.innerText = '☆';
    }
}

// Dialog open/close quick launch
function openQuickCalcDialog() {
    document.getElementById('quick-calc-dialog').classList.add('open');
}
function closeQuickCalcDialog() {
    document.getElementById('quick-calc-dialog').classList.remove('open');
}

// --- 8. THE 11 SCIENTIFIC CALCULATORS ENGINES ---

function renderCalculatorForm(testId, container) {
    container.innerHTML = '';
    
    let html = `
        <div class="calc-form" id="calc-form-element">
            <div class="form-group">
                <label for="calc-meta-project">Nom du Projet / Chantier</label>
                <input type="text" class="form-input" id="calc-meta-project" value="Projet Autoroute Fès-Taounate">
            </div>
    `;
    
    if (testId === 'sol_teneur_eau') {
        html += `
            <div class="form-group">
                <label for="in-m1">M1 : Masse de la tare vide (g)</label>
                <div class="input-wrapper">
                    <input type="number" step="0.01" class="form-input form-input-unit" id="in-m1" value="45.20" required>
                    <span class="input-unit">g</span>
                </div>
            </div>
            <div class="form-group">
                <label for="in-m2">M2 : Masse du sol humide + tare (g)</label>
                <div class="input-wrapper">
                    <input type="number" step="0.01" class="form-input form-input-unit" id="in-m2" value="248.50" required>
                    <span class="input-unit">g</span>
                </div>
            </div>
            <div class="form-group">
                <label for="in-m3">M3 : Masse du sol sec + tare (g)</label>
                <div class="input-wrapper">
                    <input type="number" step="0.01" class="form-input form-input-unit" id="in-m3" value="226.10" required>
                    <span class="input-unit">g</span>
                </div>
            </div>
        `;
    } 
    else if (testId === 'sol_atterberg') {
        html += `
            <div class="form-group">
                <label for="in-wl">WL : Limite de liquidité (%)</label>
                <div class="input-wrapper">
                    <input type="number" step="0.1" class="form-input form-input-unit" id="in-wl" value="42.5" required>
                    <span class="input-unit">%</span>
                </div>
            </div>
            <div class="form-group">
                <label for="in-wp">WP : Limite de plasticité (%)</label>
                <div class="input-wrapper">
                    <input type="number" step="0.1" class="form-input form-input-unit" id="in-wp" value="18.2" required>
                    <span class="input-unit">%</span>
                </div>
            </div>
            <div class="form-group">
                <label for="in-w-nat">w : Teneur en eau naturelle (optionnel, %)</label>
                <div class="input-wrapper">
                    <input type="number" step="0.1" class="form-input form-input-unit" id="in-w-nat" value="14.8">
                    <span class="input-unit">%</span>
                </div>
            </div>
        `;
    }
    else if (testId === 'sol_proctor') {
        html += `
            <span style="font-size:10px; color:var(--md-outline);">Saisir 5 points de mesure d'humidité et masse volumique humide :</span>
            <div class="multi-row-inputs">
        `;
        const defaultPoints = [
            { w: 4.2, rh: 1.88 },
            { w: 6.1, rh: 2.05 },
            { w: 8.3, rh: 2.18 },
            { w: 10.2, rh: 2.12 },
            { w: 12.0, rh: 2.01 }
        ];
        for (let i = 1; i <= 5; i++) {
            const def = defaultPoints[i-1];
            html += `
                <div class="calc-row-card">
                    <div class="calc-row-header">POINT DE MESURE N°${i}</div>
                    <div class="calc-row-fields">
                        <div class="form-group">
                            <label>Teneur eau w (%)</label>
                            <input type="number" step="0.1" class="form-input" id="in-pw-${i}" value="${def.w}" required>
                        </div>
                        <div class="form-group">
                            <label>&rho;h humide (g/cm³)</label>
                            <input type="number" step="0.01" class="form-input" id="in-pdh-${i}" value="${def.rh}" required>
                        </div>
                    </div>
                </div>
            `;
        }
        html += `</div>`;
    }
    else if (testId === 'sol_cbr') {
        html += `
            <div class="form-group">
                <label for="in-cbr25">Force à 2.5 mm d'enfoncement (kN)</label>
                <div class="input-wrapper">
                    <input type="number" step="0.01" class="form-input form-input-unit" id="in-cbr25" value="2.85" required>
                    <span class="input-unit">kN</span>
                </div>
            </div>
            <div class="form-group">
                <label for="in-cbr50">Force à 5.0 mm d'enfoncement (kN)</label>
                <div class="input-wrapper">
                    <input type="number" step="0.01" class="form-input form-input-unit" id="in-cbr50" value="4.50" required>
                    <span class="input-unit">kN</span>
                </div>
            </div>
        `;
    }
    else if (testId === 'sol_vbs') {
        html += `
            <div class="form-group">
                <label for="in-vbs-v">Volume V de bleu de méthylène injecté (mL)</label>
                <div class="input-wrapper">
                    <input type="number" step="0.5" class="form-input form-input-unit" id="in-vbs-v" value="12.0" required>
                    <span class="input-unit">mL</span>
                </div>
            </div>
            <div class="form-group">
                <label for="in-vbs-ms">Ms : Masse de sol sec soumise au bleu (g)</label>
                <div class="input-wrapper">
                    <input type="number" step="1" class="form-input form-input-unit" id="in-vbs-ms" value="200" required>
                    <span class="input-unit">g</span>
                </div>
            </div>
        `;
    }
    else if (testId === 'granulat_la') {
        html += `
            <div class="form-group">
                <label for="in-la-m0">M0 : Masse initiale sèche calibrée (g)</label>
                <div class="input-wrapper">
                    <input type="number" step="1" class="form-input form-input-unit" id="in-la-m0" value="5000" required>
                    <span class="input-unit">g</span>
                </div>
            </div>
            <div class="form-group">
                <label for="in-la-m1">M1 : Masse du refus sec lavé à 1.6 mm (g)</label>
                <div class="input-wrapper">
                    <input type="number" step="1" class="form-input form-input-unit" id="in-la-m1" value="3850" required>
                    <span class="input-unit">g</span>
                </div>
            </div>
        `;
    }
    else if (testId === 'granulat_mde') {
        html += `
            <div class="form-group">
                <label for="in-mde-m0">M0 : Masse sèche de granulats introduits (g)</label>
                <div class="input-wrapper">
                    <input type="number" step="1" class="form-input form-input-unit" id="in-mde-m0" value="500" required>
                    <span class="input-unit">g</span>
                </div>
            </div>
            <div class="form-group">
                <label for="in-mde-m1">M1 : Masse du refus lavé sec sur tamis 1.6 mm (g)</label>
                <div class="input-wrapper">
                    <input type="number" step="1" class="form-input form-input-unit" id="in-mde-m1" value="435" required>
                    <span class="input-unit">g</span>
                </div>
            </div>
        `;
    }
    else if (testId === 'beton_abrams') {
        html += `
            <div class="form-group">
                <label for="in-abr-h">Hauteur du béton affaissé h (mm)</label>
                <div class="input-wrapper">
                    <input type="number" step="1" class="form-input form-input-unit" id="in-abr-h" value="220" required>
                    <span class="input-unit">mm</span>
                </div>
            </div>
        `;
    }
    else if (testId === 'beton_rc') {
        html += `
            <div class="form-group">
                <label for="in-rc-f">Force maximale de rupture F (kN)</label>
                <div class="input-wrapper">
                    <input type="number" step="0.1" class="form-input form-input-unit" id="in-rc-f" value="625.4" required>
                    <span class="input-unit">kN</span>
                </div>
            </div>
            <div class="form-group">
                <label for="in-rc-d">Diamètre de l'éprouvette cylindrique d (mm)</label>
                <div class="input-wrapper">
                    <input type="number" step="1" class="form-input form-input-unit" id="in-rc-d" value="160" required>
                    <span class="input-unit">mm</span>
                </div>
            </div>
        `;
    }
    else if (testId === 'enrobe_marshall') {
        html += `
            <div class="form-group">
                <label for="in-mar-s">Stabilité Marshall S (kN)</label>
                <div class="input-wrapper">
                    <input type="number" step="0.1" class="form-input form-input-unit" id="in-mar-s" value="9.4" required>
                    <span class="input-unit">kN</span>
                </div>
            </div>
            <div class="form-group">
                <label for="in-mar-f">Fluage Marshall F (mm)</label>
                <div class="input-wrapper">
                    <input type="number" step="0.1" class="form-input form-input-unit" id="in-mar-f" value="2.8" required>
                    <span class="input-unit">mm</span>
                </div>
            </div>
            <div class="form-group">
                <label for="in-mar-vv">Pourcentage de vides Vv (%)</label>
                <div class="input-wrapper">
                    <input type="number" step="0.1" class="form-input form-input-unit" id="in-mar-vv" value="4.2" required>
                    <span class="input-unit">%</span>
                </div>
            </div>
            <div class="form-group">
                <label for="in-mar-vmb">Masse volumique bulk Vmb (g/cm³)</label>
                <div class="input-wrapper">
                    <input type="number" step="0.01" class="form-input form-input-unit" id="in-mar-vmb" value="2.35" required>
                    <span class="input-unit">g/cm³</span>
                </div>
            </div>
        `;
    }
    else if (testId === 'beton_dreux') {
        html += `
            <div class="form-group">
                <label for="in-dr-fc28">Résistance visée fc28 (MPa)</label>
                <div class="input-wrapper">
                    <input type="number" step="1" class="form-input form-input-unit" id="in-dr-fc28" value="25" required>
                    <span class="input-unit">MPa</span>
                </div>
            </div>
            <div class="form-group">
                <label for="in-dr-cement">Type de Ciment</label>
                <select class="form-input" id="in-dr-cement">
                    <option value="42.5">CEM II / 42.5 (Standard)</option>
                    <option value="52.5">CEM I / 52.5 (Haute Performance)</option>
                    <option value="32.5">CEM III / 32.5 (Basse Hydratation)</option>
                </select>
            </div>
            <div class="form-group">
                <label for="in-dr-dmax">Dimension maximale des granulats Dmax (mm)</label>
                <select class="form-input" id="in-dr-dmax">
                    <option value="20">Dmax = 20 mm (Bâtiment standard)</option>
                    <option value="10">Dmax = 10 mm (Micro-béton)</option>
                    <option value="40">Dmax = 40 mm (Gros ouvrages d'art)</option>
                </select>
            </div>
            <div class="form-group">
                <label for="in-dr-slump">Ouvrabilité / Consistance attendue</label>
                <select class="form-input" id="in-dr-slump">
                    <option value="plastique">Plastique (Abrams 5-9 cm)</option>
                    <option value="ferme">Ferme (Abrams 1-4 cm)</option>
                    <option value="trplastique">Très Plastique (Abrams 10-15 cm)</option>
                    <option value="fluide">Fluide (Abrams &ge; 16 cm)</option>
                </select>
            </div>
        `;
    }
    
    html += `
            <div class="calc-btn-row">
                <button type="button" class="btn-primary" onclick="calculateTest('${testId}')">⚙️ Calculer</button>
            </div>
        </div>
        
        <div class="calc-results" id="calc-results-el">
            <span class="calc-results-title">Interprétation Scientifique</span>
            <div id="calc-results-rows-container">
                <!-- Calculated rows -->
            </div>
            
            <!-- Dynamic Proctor curve section if Proctor -->
            ${testId === 'sol_proctor' ? `
                <div class="canvas-wrapper">
                    <canvas id="proctor-chart-canvas" class="proctor-canvas" width="340" height="180"></canvas>
                </div>
            ` : ''}
            
            <div class="calc-btn-row" style="margin-top:8px;">
                <button type="button" class="btn-primary" onclick="saveCalculationToHistory('${testId}')" style="background-color:var(--md-secondary);">💾 Enregistrer</button>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Temporary calculation container to store computed results before saving
let currentCalculationResult = null;

function calculateTest(testId) {
    const project = document.getElementById('calc-meta-project').value || 'Sans Projet';
    const inputs = {};
    const outputs = {};
    let isConforme = true;
    
    if (testId === 'sol_teneur_eau') {
        const m1 = parseFloat(document.getElementById('in-m1').value);
        const m2 = parseFloat(document.getElementById('in-m2').value);
        const m3 = parseFloat(document.getElementById('in-m3').value);
        
        if (isNaN(m1) || isNaN(m2) || isNaN(m3) || m3 <= m1 || m2 <= m3) {
            alert('Saisie invalide (vérifier les valeurs de masses). M2 doit être supérieur à M3, et M3 supérieur à M1.');
            return;
        }
        
        inputs.M1 = m1.toFixed(2) + ' g';
        inputs.M2 = m2.toFixed(2) + ' g';
        inputs.M3 = m3.toFixed(2) + ' g';
        
        const w = ((m2 - m3) / (m3 - m1)) * 100;
        outputs.w = w.toFixed(2) + ' %';
        
        let classification = 'Sec';
        if (w < 5) classification = 'Très Sec';
        else if (w >= 5 && w < 15) classification = 'Sec/Humide Moyen (Optimal pour terrassement)';
        else if (w >= 15 && w < 28) classification = 'Humide';
        else if (w >= 28) classification = 'Saturé / Fluide';
        
        outputs.classification = classification;
        isConforme = (w >= 0); // basic validate
    } 
    else if (testId === 'sol_atterberg') {
        const wl = parseFloat(document.getElementById('in-wl').value);
        const wp = parseFloat(document.getElementById('in-wp').value);
        const wnat = parseFloat(document.getElementById('in-w-nat').value) || 15.0;
        
        if (isNaN(wl) || isNaN(wp) || wl <= wp) {
            alert('Limite de liquidité WL doit être supérieure à la limite de plasticité WP.');
            return;
        }
        
        inputs.WL = wl.toFixed(1) + ' %';
        inputs.WP = wp.toFixed(1) + ' %';
        inputs.wnat = wnat.toFixed(1) + ' %';
        
        const ip = wl - wp;
        const ic = (wl - wnat) / ip;
        const il = (wnat - wp) / ip;
        
        outputs.IP = ip.toFixed(1) + ' %';
        outputs.IC = ic.toFixed(2);
        outputs.IL = il.toFixed(2);
        
        // Casagrande classification
        let casagrande = 'Sol Non Plastique';
        if (ip > 0) {
            const lineA = 0.73 * (wl - 20);
            if (wl < 50) {
                if (ip < 7) casagrande = (ip < lineA) ? 'ML (Limon peu plastique)' : 'CL-ML (Argile limoneuse)';
                else casagrande = (ip >= lineA) ? 'CL (Argile peu plastique)' : 'ML (Limon)';
            } else {
                casagrande = (ip >= lineA) ? 'CH (Argile très plastique)' : 'MH/OH (Limon/Sol organique)';
            }
        }
        outputs.Classification = casagrande;
        
        let consistance = 'Inconnue';
        if (ic > 1.0) consistance = 'Dure (Sol solide)';
        else if (ic > 0.75) consistance = 'Semi-solide';
        else if (ic > 0.50) consistance = 'Plastique (Risque de fluage)';
        else if (ic > 0.0) consistance = 'Pâteuse (Molle)';
        else consistance = 'Liquide (Instabilité critique)';
        
        outputs.EtatConsistance = consistance;
        isConforme = (ic > 0.50); // Warning flag if mud
    }
    else if (testId === 'sol_proctor') {
        const points = [];
        for (let i = 1; i <= 5; i++) {
            const w = parseFloat(document.getElementById(`in-pw-${i}`).value);
            const rh = parseFloat(document.getElementById(`in-pdh-${i}`).value);
            if (isNaN(w) || isNaN(rh)) {
                alert(`Veuillez remplir toutes les cases du point N°${i}.`);
                return;
            }
            // dry density = rh / (1 + w/100)
            const rd = rh / (1 + w / 100);
            points.push({ w: w, rd: rd, rh: rh });
        }
        
        // Sort points by moisture content to ensure graph prints left-to-right
        points.sort((a,b) => a.w - b.w);
        
        // Mathematical quadratic regression: y = A*x^2 + B*x + C
        // We find A, B, C that minimizes the sum of squared errors
        const regression = calculateQuadraticRegression(points);
        
        // Find vertex representing the OPM peak
        let w_opt = 0;
        let rd_max = 0;
        
        if (regression.a < 0) { // downward opening parabola
            w_opt = -regression.b / (2 * regression.a);
            rd_max = regression.a * w_opt * w_opt + regression.b * w_opt + regression.c;
        } else {
            // Fallback to highest raw point if curve fitting failed or holds positive curvature
            const maxPoint = points.reduce((prev, current) => (prev.rd > current.rd) ? prev : current);
            w_opt = maxPoint.w;
            rd_max = maxPoint.rd;
        }
        
        inputs.Point1 = `w=${points[0].w}%, &rho;d=${points[0].rd.toFixed(2)}`;
        inputs.Point2 = `w=${points[1].w}%, &rho;d=${points[1].rd.toFixed(2)}`;
        inputs.Point3 = `w=${points[2].w}%, &rho;d=${points[2].rd.toFixed(2)}`;
        inputs.Point4 = `w=${points[3].w}%, &rho;d=${points[3].rd.toFixed(2)}`;
        inputs.Point5 = `w=${points[4].w}%, &rho;d=${points[4].rd.toFixed(2)}`;
        
        outputs.wopt = w_opt.toFixed(2) + ' %';
        outputs.dmax = rd_max.toFixed(3) + ' g/cm³';
        outputs.classification = `Matériau compactable optimal à w = ${w_opt.toFixed(1)}%`;
        
        // Store curve parameters for printing / drawing
        outputs.graphData = {
            points: points,
            regression: regression,
            wopt: w_opt,
            dmax: rd_max
        };
        
        isConforme = (rd_max > 1.5);
        
        // Draw proctor graph in Canvas dynamically
        setTimeout(() => {
            drawProctorCurveOnCanvas('proctor-chart-canvas', outputs.graphData);
        }, 100);
    }
    else if (testId === 'sol_cbr') {
        const f25 = parseFloat(document.getElementById('in-cbr25').value);
        const f50 = parseFloat(document.getElementById('in-cbr50').value);
        
        if (isNaN(f25) || isNaN(f50)) {
            alert('Saisie invalide.');
            return;
        }
        
        inputs.Force2_5 = f25.toFixed(2) + ' kN';
        inputs.Force5_0 = f50.toFixed(2) + ' kN';
        
        const cbr25 = (f25 / 13.24) * 100;
        const cbr50 = (f50 / 19.96) * 100;
        const cbr = Math.max(cbr25, cbr50);
        
        outputs.CBR25 = cbr25.toFixed(1) + ' %';
        outputs.CBR50 = cbr50.toFixed(1) + ' %';
        outputs.CBR = cbr.toFixed(1) + ' %';
        
        let portance = 'S1 (Très faible)';
        if (cbr >= 30) portance = 'S5 (Exceptionnelle)';
        else if (cbr >= 20) portance = 'S4 (Excellente)';
        else if (cbr >= 10) portance = 'S3 (Favorable)';
        else if (cbr >= 5) portance = 'S2 (Faible - Traitement chaux requis)';
        
        outputs.ClassePortance = portance;
        isConforme = (cbr >= 10);
    }
    else if (testId === 'sol_vbs') {
        const v = parseFloat(document.getElementById('in-vbs-v').value);
        const ms = parseFloat(document.getElementById('in-vbs-ms').value);
        
        if (isNaN(v) || isNaN(ms) || ms <= 0) {
            alert('Saisie invalide. La masse Ms doit être positive.');
            return;
        }
        
        inputs.VolumeBleu = v.toFixed(1) + ' mL';
        inputs.MasseSolSec = ms.toFixed(1) + ' g';
        
        const vbs = (v * 10) / ms;
        outputs.VBS = vbs.toFixed(2);
        
        let active = 'Sable insensible';
        if (vbs < 0.1) active = 'Sol sableux très propre, insensible à l\'eau';
        else if (vbs >= 0.1 && vbs < 0.2) active = 'Sol sableux propre';
        else if (vbs >= 0.2 && vbs < 1.5) active = 'Sol sablo-limoneux peu sensible';
        else if (vbs >= 1.5 && vbs < 2.5) active = 'Sol limoneux moyennement plastique';
        else if (vbs >= 2.5 && vbs < 6.0) active = 'Sol argileux sensible';
        else active = 'Sol très argileux gonflant';
        
        outputs.ActiviteArgileuse = active;
        isConforme = (vbs < 2.5); // Conforme if not overly active clay
    }
    else if (testId === 'granulat_la') {
        const m0 = parseFloat(document.getElementById('in-la-m0').value);
        const m1 = parseFloat(document.getElementById('in-la-m1').value);
        
        if (isNaN(m0) || isNaN(m1) || m0 <= m1) {
            alert('Masse initiale M0 doit être supérieure à la masse du refus M1.');
            return;
        }
        
        inputs.M0 = m0.toFixed(0) + ' g';
        inputs.M1 = m1.toFixed(0) + ' g';
        
        const la = ((m0 - m1) / m0) * 100;
        outputs.LA = la.toFixed(1) + ' %';
        
        let durete = 'Médiocre';
        if (la <= 15) durete = 'Très dur (Idéal pour couche d\'usure autoroute)';
        else if (la > 15 && la <= 25) durete = 'Dur (Béton haute résistance / route intense)';
        else if (la > 25 && la <= 35) durete = 'Moyen (Béton usuel / Assise routière)';
        
        outputs.ClassificationDurete = durete;
        isConforme = (la <= 30); // standard threshold
    }
    else if (testId === 'granulat_mde') {
        const m0 = parseFloat(document.getElementById('in-mde-m0').value);
        const m1 = parseFloat(document.getElementById('in-mde-m1').value);
        
        if (isNaN(m0) || isNaN(m1) || m0 <= m1) {
            alert('Masse initiale M0 doit être supérieure au refus M1.');
            return;
        }
        
        inputs.M0 = m0.toFixed(0) + ' g';
        inputs.M1 = m1.toFixed(0) + ' g';
        
        const mde = ((m0 - m1) / m0) * 100;
        outputs.MDE = mde.toFixed(1) + ' %';
        
        let usure = 'Très friable';
        if (mde <= 10) usure = 'Excellente résistance à l\'abrasion humide';
        else if (mde > 10 && mde <= 20) usure = 'Résistance routière normale';
        
        outputs.ClassificationUsure = usure;
        isConforme = (mde <= 20);
    }
    else if (testId === 'beton_abrams') {
        const h = parseFloat(document.getElementById('in-abr-h').value);
        if (isNaN(h) || h < 0 || h > 300) {
            alert('Hauteur affaissée h doit être comprise entre 0 et 300 mm.');
            return;
        }
        
        inputs.HauteurInitiale = '300 mm';
        inputs.HauteurBetonAffaisse = h.toFixed(0) + ' mm';
        
        const affaissement = 300 - h;
        outputs.Affaissement = affaissement.toFixed(0) + ' mm';
        
        let classe = 'S1';
        let desc = 'Ferme (Béton extrudé ou routes)';
        if (affaissement >= 220) { classe = 'S5'; desc = 'Très fluide (Béton Auto-Plaçant BAP)'; }
        else if (affaissement >= 160) { classe = 'S4'; desc = 'Fluide (Béton pompé standard)'; }
        else if (affaissement >= 100) { classe = 'S3'; desc = 'Très Plastique (Dalles / Poteaux)'; }
        else if (affaissement >= 50) { classe = 'S2'; desc = 'Plastique (Fondations et voiles)'; }
        
        outputs.ClasseConsistance = `${classe} - ${desc}`;
        isConforme = (affaissement >= 50 && affaissement <= 150); // typical building range
    }
    else if (testId === 'beton_rc') {
        const f = parseFloat(document.getElementById('in-rc-f').value);
        const d = parseFloat(document.getElementById('in-rc-d').value);
        
        if (isNaN(f) || isNaN(d) || d <= 0) {
            alert('Saisie invalide.');
            return;
        }
        
        inputs.ForceRupture = f.toFixed(1) + ' kN';
        inputs.DiametreEprouvette = d.toFixed(0) + ' mm';
        
        const section = (Math.PI * d * d) / 4; // mm2
        const rc = (f * 1000) / section; // MPa
        
        outputs.SectionEprouvette = section.toFixed(1) + ' mm²';
        outputs.Rc = rc.toFixed(2) + ' MPa';
        
        let classe = 'C20/25 (Conforme structure standard)';
        if (rc >= 35) classe = 'C35/45 (Très haute performance)';
        else if (rc >= 30) classe = 'C30/37 (Ponts / Ouvrages d\'art)';
        else if (rc >= 25) classe = 'C25/30 (Bâtiments et dalles sollicitées)';
        else if (rc < 20) classe = 'Non conforme structure porteuse';
        
        outputs.ClasseResistance = classe;
        isConforme = (rc >= 25.0); // Conforme if standard building C25/30 target is met
    }
    else if (testId === 'enrobe_marshall') {
        const s = parseFloat(document.getElementById('in-mar-s').value);
        const f = parseFloat(document.getElementById('in-mar-f').value);
        const vv = parseFloat(document.getElementById('in-mar-vv').value);
        const vmb = parseFloat(document.getElementById('in-mar-vmb').value);
        
        if (isNaN(s) || isNaN(f) || isNaN(vv) || isNaN(vmb) || f <= 0 || vmb <= 0) {
            alert('Saisie de paramètres incorrecte.');
            return;
        }
        
        inputs.StabiliteS = s.toFixed(1) + ' kN';
        inputs.FluageF = f.toFixed(1) + ' mm';
        inputs.PourcentageVidesVv = vv.toFixed(1) + ' %';
        inputs.BulkDensityVmb = vmb.toFixed(2) + ' g/cm³';
        
        const quotient = s / f;
        const vfb = ((vmb - vv) / vmb) * 100;
        
        outputs.QuotientMarshall = quotient.toFixed(2) + ' kN/mm';
        outputs.VidesRemplisBitume = vfb.toFixed(1) + ' %';
        
        isConforme = (s >= 8.0 && f >= 2.0 && f <= 4.0 && vv >= 3.0 && vv <= 6.0);
        outputs.ConformiteRoutiere = isConforme ? 'Conforme aux exigences trafic lourd' : 'Non conforme aux seuils routiers standards';
    }
    else if (testId === 'beton_dreux') {
        const fc28 = parseFloat(document.getElementById('in-dr-fc28').value);
        const cementClass = parseFloat(document.getElementById('in-dr-cement').value);
        const dmax = parseInt(document.getElementById('in-dr-dmax').value);
        const slump = document.getElementById('in-dr-slump').value;
        
        if (isNaN(fc28)) {
            alert('Saisie de résistance fc28 invalide.');
            return;
        }
        
        inputs.Rc28Visee = fc28.toFixed(0) + ' MPa';
        inputs.ClasseCiment = cementClass.toFixed(1) + ' MPa';
        inputs.DmaxGranulats = dmax + ' mm';
        inputs.ConsistanceVoulue = slump.toUpperCase();
        
        // E/C calculation
        // C/E = (fc28 + 8) / (G * cementClass) + 0.5
        const G = dmax === 10 ? 0.55 : (dmax === 20 ? 0.60 : 0.65);
        const CE_ratio = (fc28 + 8) / (G * cementClass) + 0.5;
        const EC_ratio = 1 / CE_ratio;
        
        // Water estimation based on Dmax & slump
        let baseWater = 190;
        if (dmax === 10) baseWater = 205;
        else if (dmax === 40) baseWater = 175;
        
        // Slump adjustment
        let w_corr = 0;
        if (slump === 'ferme') w_corr = -15;
        else if (slump === 'trplastique') w_corr = 10;
        else if (slump === 'fluide') w_corr = 20;
        
        const E = baseWater + w_corr;
        const C = E * CE_ratio;
        
        // Compactness coefficient g
        let g = 0.82;
        if (dmax === 10) g = 0.78;
        else if (dmax === 40) g = 0.85;
        
        if (slump === 'fluide') g -= 0.03;
        else if (slump === 'ferme') g += 0.02;
        
        // Aggregate volumes
        const V_cement = C / 3.1; // 3.1 g/cm3 cement density
        const V_agg = (g * 1000) - V_cement - E;
        const Total_Agg_Mass = V_agg * 2.65; // average density 2.65 g/cm3
        
        // Sand vs Gravel ratio
        const GS_ratio = dmax === 10 ? 1.0 : (dmax === 20 ? 1.5 : 1.8);
        const Sand = Total_Agg_Mass / (1 + GS_ratio);
        const Gravel = Total_Agg_Mass - Sand;
        
        outputs.DosageCiment = Math.round(C) + ' kg/m³';
        outputs.DosageEau = Math.round(E) + ' Litres/m³';
        outputs.DosageSable = Math.round(Sand) + ' kg/m³ (fraction fine)';
        outputs.DosageGraviers = Math.round(Gravel) + ' kg/m³ (fraction grossière)';
        outputs.RatioEC = EC_ratio.toFixed(2);
        
        isConforme = (C >= 280 && C <= 450); // within safety limits
    }
    
    // Set global current computation
    currentCalculationResult = {
        project: project,
        inputs: inputs,
        outputs: outputs,
        isConforme: isConforme
    };
    
    // Display results in UI
    const resultsPanel = document.getElementById('calc-results-el');
    resultsPanel.classList.add('active');
    
    const rowsContainer = document.getElementById('calc-results-rows-container');
    rowsContainer.innerHTML = '';
    
    // Populating UI list
    for (const [k, v] of Object.entries(outputs)) {
        if (k !== 'graphData') {
            const row = document.createElement('div');
            row.className = 'calc-result-row';
            row.innerHTML = `
                <span class="calc-result-label">${formatResultLabel(k)}</span>
                <span class="calc-result-val">${v}</span>
            `;
            rowsContainer.appendChild(row);
        }
    }
    
    // Display conformity status
    const statusRow = document.createElement('div');
    statusRow.className = 'calc-result-row';
    statusRow.style.marginTop = '6px';
    statusRow.innerHTML = `
        <span class="calc-result-label"><b>Verdict Conformité</b></span>
        <span class="status-pill ${isConforme ? 'status-conforme' : 'status-nonconforme'}">
            ${isConforme ? 'CONFORME ✅' : 'NON CONFORME ❌'}
        </span>
    `;
    rowsContainer.appendChild(statusRow);
}

function formatResultLabel(key) {
    const labels = {
        w: 'Teneur en eau (w)',
        classification: 'Classification',
        IP: 'Indice de Plasticité (IP)',
        IC: 'Indice de Consistance (IC)',
        IL: 'Indice de Liquidité (IL)',
        Classification: 'Classification géotechnique',
        EtatConsistance: 'Consistance du sol',
        wopt: 'Humidité optimale (w_opt)',
        dmax: 'Densité sèche maximale (&rho;_dmax)',
        Force2_5: 'Force à 2.5 mm',
        Force5_0: 'Force à 5.0 mm',
        CBR25: 'Indice CBR à 2.5 mm',
        CBR50: 'Indice CBR à 5.0 mm',
        CBR: 'Indice CBR global',
        ClassePortance: 'Classe de portance routière',
        VolumeBleu: 'Volume de bleu de méthylène',
        MasseSolSec: 'Masse du sol sec',
        VBS: 'Valeur de bleu (VBS)',
        ActiviteArgileuse: 'Activité argileuse',
        M0: 'Masse initiale sèche M0',
        M1: 'Masse du refus sec M1',
        LA: 'Coefficient Los Angeles (LA)',
        ClassificationDurete: 'Classification dureté',
        MDE: 'Coefficient Micro-Deval (MDE)',
        ClassificationUsure: 'Résistance d\'usure',
        HauteurInitiale: 'Hauteur initiale cône',
        HauteurBetonAffaisse: 'Hauteur du béton final',
        Affaissement: 'Affaissement mesuré',
        ClasseConsistance: 'Classe de consistance',
        ForceRupture: 'Force de rupture F',
        DiametreEprouvette: 'Diamètre éprouvette d',
        SectionEprouvette: 'Section éprouvette S',
        Rc: 'Résistance Compression (Rc)',
        ClasseResistance: 'Classe de résistance',
        StabiliteS: 'Stabilité Marshall S',
        FluageF: 'Fluage Marshall F',
        PourcentageVidesVv: 'Teneur en vides Vv',
        BulkDensityVmb: 'Masse volumique bulk',
        QuotientMarshall: 'Quotient Marshall (S/F)',
        VidesRemplisBitume: 'Vides remplis bitume (VFB)',
        ConformiteRoutiere: 'Conformité routière',
        Rc28Visee: 'Résistance fc28 visée',
        ClasseCiment: 'Classe du ciment',
        DmaxGranulats: 'Diamètre maximal Dmax',
        ConsistanceVoulue: 'Consistance demandée',
        DosageCiment: 'Dosage CIMENT',
        DosageEau: 'Dosage EAU',
        DosageSable: 'Dosage SABLE (0/4)',
        DosageGraviers: 'Dosage GRAVIERS (4/20)',
        RatioEC: 'Rapport Eau / Ciment (E/C)'
    };
    return labels[key] || key;
}

// Math Utility: Quadratic Regression
// Solves least squares for y = Ax^2 + Bx + C
function calculateQuadraticRegression(points) {
    let n = points.length;
    let sumX = 0, sumY = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0;
    let sumXY = 0, sumX2Y = 0;
    
    for (let i = 0; i < n; i++) {
        let x = points[i].w;
        let y = points[i].rd;
        sumX += x;
        sumY += y;
        sumX2 += x * x;
        sumX3 += x * x * x;
        sumX4 += x * x * x * x;
        sumXY += x * y;
        sumX2Y += x * x * y;
    }
    
    // Matrix system
    // [ sumX4  sumX3  sumX2 ] [ A ]   [ sumX2Y ]
    // [ sumX3  sumX2  sumX  ] [ B ] = [ sumXY  ]
    // [ sumX2  sumX   n     ] [ C ]   [ sumY   ]
    
    // Direct determinant solution (Cramer's rule)
    let det = sumX4 * (sumX2 * n - sumX * sumX) - 
              sumX3 * (sumX3 * n - sumX2 * sumX) + 
              sumX2 * (sumX3 * sumX - sumX2 * sumX2);
              
    if (Math.abs(det) < 1e-5) {
        return { a: 0, b: 0, c: 0 };
    }
    
    let detA = sumX2Y * (sumX2 * n - sumX * sumX) - 
               sumX3 * (sumXY * n - sumY * sumX) + 
               sumX2 * (sumXY * sumX - sumY * sumX2);
               
    let detB = sumX4 * (sumXY * n - sumY * sumX) - 
               sumX2Y * (sumX3 * n - sumX2 * sumX) + 
               sumX2 * (sumX3 * sumY - sumX2 * sumXY);
               
    let detC = sumX4 * (sumX2 * sumY - sumX * sumXY) - 
               sumX3 * (sumX3 * sumY - sumX2 * sumXY) + 
               sumX2Y * (sumX3 * sumX - sumX2 * sumX2);
               
    return {
        a: detA / det,
        b: detB / det,
        c: detC / det
    };
}

// Canvas Drawing Utility for Proctor moisture-density curve
function drawProctorCurveOnCanvas(canvasId, graphData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const w = canvas.width;
    const h = canvas.height;
    
    const padding = 34;
    const graphWidth = w - padding * 2;
    const graphHeight = h - padding * 2;
    
    // Find min and max for scaling
    const pts = graphData.points;
    const wValues = pts.map(p => p.w);
    const rdValues = pts.map(p => p.rd);
    
    // Append fitted optimum to include peak in boundaries
    wValues.push(graphData.wopt);
    rdValues.push(graphData.dmax);
    
    const minW = Math.max(0, Math.min(...wValues) - 2);
    const maxW = Math.max(...wValues) + 2;
    const minRd = Math.min(...rdValues) - 0.1;
    const maxRd = Math.max(...rdValues) + 0.1;
    
    // Helper projection functions
    const getX = (valW) => padding + ((valW - minW) / (maxW - minW)) * graphWidth;
    const getY = (valRd) => h - padding - ((valRd - minRd) / (maxRd - minRd)) * graphHeight;
    
    // 1. Draw coordinate axes and grid lines
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 1;
    
    // X Grid
    for (let val = Math.ceil(minW); val <= Math.floor(maxW); val += 2) {
        ctx.beginPath();
        ctx.moveTo(getX(val), padding);
        ctx.lineTo(getX(val), h - padding);
        ctx.stroke();
        
        ctx.fillStyle = '#666666';
        ctx.font = '9px Roboto';
        ctx.textAlign = 'center';
        ctx.fillText(val + '%', getX(val), h - padding + 12);
    }
    
    // Y Grid
    for (let val = (Math.ceil(minRd * 10) / 10); val <= maxRd; val += 0.05) {
        ctx.beginPath();
        ctx.moveTo(padding, getY(val));
        ctx.lineTo(w - padding, getY(val));
        ctx.stroke();
        
        ctx.fillStyle = '#666666';
        ctx.font = '9px Roboto';
        ctx.textAlign = 'right';
        ctx.fillText(val.toFixed(2), padding - 4, getY(val) + 3);
    }
    
    // Axes border lines
    ctx.strokeStyle = '#888888';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, h - padding);
    ctx.lineTo(w - padding, h - padding);
    ctx.stroke();
    
    // 2. Draw regression fit Parabola Curve
    ctx.strokeStyle = '#1565C0'; // primary color
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    const reg = graphData.regression;
    let first = true;
    for (let stepW = minW; stepW <= maxW; stepW += 0.1) {
        // y = ax^2 + bx + c
        const valRd = reg.a * stepW * stepW + reg.b * stepW + reg.c;
        if (valRd >= minRd && valRd <= maxRd + 0.1) {
            if (first) {
                ctx.moveTo(getX(stepW), getY(valRd));
                first = false;
            } else {
                ctx.lineTo(getX(stepW), getY(valRd));
            }
        }
    }
    ctx.stroke();
    
    // 3. Plot raw points (red dots)
    ctx.fillStyle = '#C62828'; // red
    pts.forEach(p => {
        ctx.beginPath();
        ctx.arc(getX(p.w), getY(p.rd), 4, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // 4. Highlight Peak point (Optimum Proctor Modifié OPM)
    const peakX = getX(graphData.wopt);
    const peakY = getY(graphData.dmax);
    
    // Dotted projection lines
    ctx.strokeStyle = '#FF6F00'; // accent color
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    
    // projection down to x-axis
    ctx.beginPath();
    ctx.moveTo(peakX, peakY);
    ctx.lineTo(peakX, h - padding);
    ctx.stroke();
    
    // projection left to y-axis
    ctx.beginPath();
    ctx.moveTo(peakX, peakY);
    ctx.lineTo(padding, peakY);
    ctx.stroke();
    
    ctx.setLineDash([]); // Reset
    
    // Draw star at optimum
    ctx.fillStyle = '#FF6F00';
    ctx.beginPath();
    ctx.arc(peakX, peakY, 6, 0, Math.PI * 2);
    ctx.fill();
}

// --- 9. HISTORY PERSISTENCE ACTIONS ---

function saveCalculationToHistory(testId) {
    if (!currentCalculationResult) return;
    
    const test = TESTS_DATABASE.find(t => t.id === testId);
    
    const record = {
        id: 'calc_' + Date.now(),
        testId: testId,
        testName: test.name,
        norm: test.norm,
        category: test.category,
        date: new Date().toISOString(),
        project: currentCalculationResult.project,
        technician: appConfig.technicianName,
        license: appConfig.license,
        inputs: currentCalculationResult.inputs,
        outputs: currentCalculationResult.outputs,
        isConforme: currentCalculationResult.isConforme
    };
    
    // Push and save
    history.push(record);
    saveHistoryToStorage();
    
    alert('Calcul enregistré avec succès dans l\'historique des rapports !');
    
    // Clear results UI panel and close details
    const resultsPanel = document.getElementById('calc-results-el');
    if (resultsPanel) resultsPanel.classList.remove('active');
    
    closeTestDetails();
    
    // Switch to Reports tab
    switchTab('rapports');
}

function deleteReport(reportId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rapport de l\'historique ?')) {
        history = history.filter(r => r.id !== reportId);
        saveHistoryToStorage();
    }
}

// --- 10. SYSTEM PRINT & GENERATE PROFESSIONAL REPORT ---
function printReport(reportId) {
    const item = history.find(r => r.id === reportId);
    if (!item) return;
    
    // Populate the hidden printable report container fields
    document.getElementById('print-val-id').innerText = item.id.replace('calc_', 'PV-');
    document.getElementById('print-val-date').innerText = new Date(item.date).toLocaleDateString('fr-FR');
    document.getElementById('print-val-tech').innerText = item.technician;
    document.getElementById('print-val-license').innerText = item.license;
    
    document.getElementById('print-val-test-name').innerText = `${item.testName.toUpperCase()} - NORME : ${item.norm}`;
    document.getElementById('print-val-project').innerText = item.project;
    document.getElementById('print-val-norm').innerText = item.norm;
    document.getElementById('print-val-category').innerText = item.category === 'sol' ? '🌍 Essais Sol' : 
                                                            (item.category === 'granulat' ? '🪨 Essais Granulats' : 
                                                            (item.category === 'beton' ? '🏗️ Essais Béton' : 
                                                            (item.category === 'enrobe' ? '🛣️ Essais Enrobés' : '🧱 Matériaux Divers')));
    
    // Renders input table
    const inputsTable = document.getElementById('print-val-inputs-table');
    inputsTable.innerHTML = '';
    for (const [k, v] of Object.entries(item.inputs)) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <th style="width:40%;">${formatResultLabel(k)}</th>
            <td style="width:60%; font-family:monospace;">${v}</td>
        `;
        inputsTable.appendChild(tr);
    }
    
    // Renders output table
    const outputsTable = document.getElementById('print-val-outputs-table');
    outputsTable.innerHTML = '';
    for (const [k, v] of Object.entries(item.outputs)) {
        if (k !== 'graphData') {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <th style="width:40%;">${formatResultLabel(k)}</th>
                <td style="width:60%; font-weight:700;">${v}</td>
            `;
            outputsTable.appendChild(tr);
        }
    }
    
    // Special graph case
    const canvasSection = document.getElementById('print-proctor-canvas-section');
    if (item.testId === 'sol_proctor' && item.outputs.graphData) {
        canvasSection.style.display = 'block';
        setTimeout(() => {
            drawProctorCurveOnCanvas('print-proctor-canvas', item.outputs.graphData);
        }, 100);
    } else {
        canvasSection.style.display = 'none';
    }
    
    // Conformity box
    const confBox = document.getElementById('print-conformity-box');
    confBox.className = `print-conformity-box ${item.isConforme ? 'print-conf-conforme' : 'print-conf-nonconforme'}`;
    confBox.innerHTML = item.isConforme ? 'CONFORME ✅' : 'NON CONFORME ❌ (Seuils non respectés)';
    
    // Update dates
    const stamps = document.querySelectorAll('.print-date-stamp');
    stamps.forEach(s => s.innerText = new Date().toLocaleDateString('fr-FR'));
    
    // Trigger system print dialogue which utilizes @media print CSS to isolate report
    setTimeout(() => {
        window.print();
    }, 300);
}

// Share reports using dynamic WhatsApp & Mail templates
function shareReport(reportId, channel) {
    const item = history.find(r => r.id === reportId);
    if (!item) return;
    
    const formattedDate = new Date(item.date).toLocaleDateString('fr-FR');
    let text = `*RAPPORT D'ESSAI BTP - ${item.testName.toUpperCase()}*\n`;
    text += `Norme: ${item.norm}\n`;
    text += `Laboratoire: ${appConfig.labName}\n`;
    text += `Date: ${formattedDate}\n`;
    text += `Projet/Chantier: ${item.project}\n`;
    text += `Technicien: ${item.technician}\n`;
    text += `-----------------------------------\n`;
    text += `*RÉSULTATS DE LABORATOIRE* :\n`;
    
    for (const [k, v] of Object.entries(item.outputs)) {
        if (k !== 'graphData') {
            text += `- ${formatResultLabel(k)} : *${v}*\n`;
        }
    }
    text += `-----------------------------------\n`;
    text += `*VERDICT* : ${item.isConforme ? '✅ CONFORME' : '❌ NON CONFORME'}\n`;
    text += `Généré via LabQualité BTP App.`;
    
    if (channel === 'whatsapp') {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    } else if (channel === 'email') {
        const subject = encodeURIComponent(`PV d'essai BTP - ${item.testName} - ${item.project}`);
        const body = encodeURIComponent(text);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    }
}

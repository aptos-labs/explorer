import type {EnglishMessages} from "./en";

export const fr = {
  chrome: {
    skipToContent: "Aller au contenu principal",
    appName: "Aptos Explorer",
    appNameShort: "Explorateur",
    navAriaLabel: "Navigation principale",
    overflowMenuAriaLabel: "Menu de navigation",
    openSettings: "Ouvrir les paramètres",
    openGuide: "Ouvrir le guide utilisateur",
    switchToLight: "Passer en mode clair",
    switchToDark: "Passer en mode sombre",
    nav: {
      transactions: "Transactions",
      transactionsTitle: "Voir toutes les transactions",
      analytics: "Analytique",
      analyticsTitle: "Voir l’analytique du réseau",
      validators: "Validateurs",
      validatorsTitle: "Voir tous les validateurs",
      blocks: "Blocs",
      blocksTitle: "Voir les derniers blocs",
      coins: "Jetons",
      coinsTitle: "Voir les jetons et actifs fongibles",
      releases: "Versions",
      releasesTitle:
        "Voir les déploiements réseau, les AIP et les versions SDK et outils",
      runScript: "Exécuter un script",
      runScriptTitle: "Créer, simuler et exécuter un script Move (avancé)",
      settings: "Paramètres",
      guide: "Guide utilisateur",
    },
  },
  footer: {
    privacy: "Confidentialité",
    terms: "Conditions",
    verification: "Vérification des jetons et adresses",
    guide: "Guide utilisateur",
    clearCache: "Vider le cache",
    cacheCleared: "✓ Vidé",
    clearCacheTitle: "Vider le cache de recherche",
    copyrightOwner: "Aptos Labs",
  },
  search: {
    placeholder: "Rechercher par adresse, txn, bloc, jeton ou nom ANS",
    helper:
      "Adresse ou nom de compte · Hash ou version de txn · Hauteur de bloc · Type de jeton · Nom ANS",
    ariaLabel: "recherche",
    type: {
      account: "Compte",
      address: "Adresse",
      transaction: "Transaction",
      block: "Bloc",
      coin: "Jeton",
      fungibleAsset: "Actif fongible",
      object: "Objet",
      result: "Résultat",
    },
  },
  settings: {
    title: "Paramètres",
    description:
      "Gérez vos préférences de l’explorateur. Les paramètres sont stockés localement dans votre navigateur.",
    language: {
      title: "Langue",
      description:
        "Choisissez comment l’explorateur affiche l’interface, les paramètres et le guide utilisateur. La valeur par défaut du navigateur suit la langue de l’appareil lorsqu’une traduction existe, sinon l’anglais. D’autres langues peuvent être ajoutées sous forme de catalogues sans changer les URL.",
      label: "Langue d’affichage",
      auto: "Valeur par défaut du navigateur",
    },
    decompilation: {
      title: "Décompilation du bytecode Move",
      description:
        "Activez la décompilation côté client du bytecode Move on-chain en source lisible. S’exécute entièrement dans votre navigateur via WebAssembly.",
      ariaLabel: "Activer la décompilation du bytecode Move",
      disclaimerTitle: "Avertissement — À lire avant d’activer",
      disclaimerIntro:
        "La sortie décompilée est générée mécaniquement à partir du bytecode on-chain et **peut ne pas correspondre** au code source d’origine. Les noms de variables, commentaires et certains détails structurels sont perdus à la compilation et ne peuvent pas être récupérés. En activant cette fonction, vous reconnaissez que :",
      bullets: [
        "La sortie décompilée est fournie **telle quelle, à titre informatif uniquement**.",
        "Vous assumez la responsabilité de l’usage que vous faites de la sortie décompilée.",
        "La sortie ne doit pas être considérée comme le code source définitif ou faisant autorité d’un module on-chain.",
      ],
    },
    apiKeys: {
      title: "Remplacement des clés API",
      whyAriaLabel: "Pourquoi utiliser votre propre clé API ?",
      popover:
        "L’explorateur utilise par défaut une clé API geomi.dev partagée. Ajouter la vôtre vous donne une limite de débit dédiée, utile si vous naviguez beaucoup ou recevez des HTTP 429.",
      popoverManage:
        "Créez et gérez des clés sur [geomi.dev](https://geomi.dev).",
      description:
        "Clés API geomi.dev facultatives par réseau. Utilisées uniquement dans votre navigateur. Laissez un réseau vide pour utiliser la clé par défaut de la compilation (le cas échéant). Par défaut, les remplacements sont stockés pour la session du navigateur et effacés à la fin de la session.",
      fieldLabel: "Clé API {network}",
      fieldPlaceholder: "Coller la clé pour {network} (facultatif)",
      showKeys: "Afficher les clés API",
      hideKeys: "Masquer les clés API",
      getKey:
        "Vous n’avez pas de clé ? [Obtenez-en une sur geomi.dev](https://geomi.dev)",
      remember: "Mémoriser les clés API sur cet appareil",
      rememberWarning:
        "Mémoriser les clés les stocke dans le stockage local de ce navigateur. Évitez d’activer ceci sur un appareil partagé ou non fiable.",
      notStored:
        "Les clés ne sont pas stockées par le serveur de l’application explorateur. Votre navigateur les utilise uniquement pour les requêtes API côté client. Pour une meilleure sécurité, utilisez des clés client avec uniquement l’origine `https://explorer.aptoslabs.com` activée et appliquée.",
      refreshNote:
        "Les données existantes se rafraîchiront après l’enregistrement afin que les nouvelles requêtes utilisent immédiatement les clés mises à jour.",
    },
    actions: {
      reset: "Réinitialiser",
      restoreDefaults: "Restaurer les valeurs par défaut",
      save: "Enregistrer",
    },
    metaDescription:
      "Configurez Aptos Explorer, y compris la langue, les clés API, les préférences de décompilation et d’autres options.",
  },
  guide: {
    meta: {
      title: "Guide utilisateur",
      description:
        "Comment utiliser Aptos Explorer : recherche, réseaux, transactions, comptes, modules, paramètres, et comment lire ce que vous voyez.",
      tocLabel: "Sur cette page",
      intro:
        "Ce guide explique comment **utiliser** Aptos Explorer, comment **lire** les pages affichées, et comment le **configurer** dans votre navigateur. Il s’adresse à ceux qui consultent des données on-chain — pas à l’exploitation d’un nœud ni à l’écriture de Move.",
    },
    overview: {
      title: "Qu’est-ce que cet explorateur",
      paragraphs: [
        "Aptos Explorer est l’**explorateur de blocs** officiel de la blockchain Aptos. Il sert à consulter transactions, comptes, blocs, validateurs, jetons, NFT et l’état du réseau. Il lit des données publiques de la chaîne ; il ne conserve pas de fonds et n’est pas un portefeuille.",
        "Chaque page est limitée à un **réseau** (mainnet par défaut). Une transaction ou un compte sur testnet est un objet différent du même identifiant sur mainnet. Le réseau est stocké dans l’URL sous `?network=…` afin que les liens copiés restent sur la même chaîne.",
        "L’explorateur est un site web. Connecter un portefeuille est facultatif et n’est nécessaire que pour des actions comme le staking, l’exécution d’une fonction de module ou l’envoi d’un script Move.",
      ],
    },
    chrome: {
      title: "S’orienter",
      paragraphs: [
        "L’**en-tête** est sur chaque page : logo (accueil), navigation principale, sélecteur de réseau, bouton de partage facultatif, [guide utilisateur](/guide), [paramètres](/settings), thème clair/sombre et connexion du portefeuille. Sur les petits écrans, la navigation, les paramètres, le thème et le portefeuille sont dans le bouton de menu.",
        "Sous l’en-tête, la plupart des pages de détail affichent un contrôle **retour** (si vous avez un historique dans l’app) et un champ de **recherche**. La page d’accueil (`/`) est une surface de recherche plus grande avec les mêmes règles de correspondance.",
        "Le **pied de page** contient Confidentialité, Conditions, [instructions de vérification des jetons](/verification), ce guide et **Vider le cache** (vide le cache des résultats de recherche du navigateur, pas la blockchain).",
      ],
      bullets: [
        "**Transactions** — transactions utilisateur récentes, avec filtres.",
        "**Analytique** — graphiques mainnet uniquement (TPS, utilisateurs actifs, gas, etc.).",
        "**Validateurs** — l’ensemble des validateurs et les pools de délégation.",
        "**Blocs** — derniers blocs par hauteur.",
        "**Jetons** — jetons et actifs fongibles listés.",
        "**Versions** — versions réseau en direct, AIP et versions SDK/CLI.",
        "**Exécuter un script** — outil avancé pour simuler et envoyer un script Move brut.",
      ],
    },
    search: {
      title: "Recherche",
      paragraphs: [
        "Saisissez dans la zone de recherche de la [page d’accueil](/) ou de l’en-tête. Vous n’avez pas à choisir d’abord un type d’entité — l’explorateur détecte ce que vous avez saisi.",
        "Vous pouvez aussi partager une recherche avec `/?search={query}` (par exemple `/?search=0x1`). Si la recherche d’URL a exactement un résultat clair, la recherche de l’en-tête peut vous y emmener immédiatement.",
      ],
      bullets: [
        "**Adresse de compte** (y compris les formes courtes comme `0x1`) — compte, et éventuellement un jeton, des métadonnées d’actif fongible ou un objet Move.",
        "**Nom ANS** se terminant par `.apt` (ou `.petra`) — se résout en un compte.",
        "**Version de transaction** (un nombre) ou **hash de transaction** (`0x` plus 64 caractères hexadécimaux).",
        "**Hauteur de bloc** (un nombre dans la plage de la chaîne).",
        "**Type de jeton Move** tel que `0x1::aptos_coin::AptosCoin`.",
        "**Nom ou symbole de jeton** — correspond à l’ensemble de jetons listés.",
        "**Texte uniquement en emoji** — recherche les marchés emojicoin le cas échéant.",
      ],
    },
    networks: {
      title: "Réseaux",
      paragraphs: [
        "Utilisez le menu déroulant du réseau dans l’en-tête. Les liens internes conservent votre réseau actuel pour que vous ne reveniez pas silencieusement au mainnet.",
        "**Mainnet** est la production. **Testnet** et **devnet** sont pour le développement (devnet est souvent réinitialisé). **Local** parle à un nœud sur votre machine (en général `http://127.0.0.1:8080/v1`). Des réseaux masqués ou de prévisualisation peuvent apparaître lorsque l’explorateur est compilé avec un indicateur de fonctionnalité.",
        "Si vous sélectionnez Local et que le nœud n’est pas en cours d’exécution, une fenêtre explique comment lancer `aptos node run-local-testnet` et propose de revenir au Mainnet.",
        "Certaines fonctions sont réservées au mainnet (analytique, certaines estimations de prix, traces Sentio). Les onglets GraphQL/indexeur peuvent manquer sur les réseaux qui ne publient pas d’indexeur.",
      ],
    },
    transactions: {
      title: "Lire une transaction",
      paragraphs: [
        "Ouvrez une transaction à `/txn/{version}` ou `/txn/{hash}`. **Version** est le numéro de séquence du registre (un entier à partir de 0). **Hash** est le hash de transaction de 32 octets. La version est l’identifiant stable si vous l’avez.",
        "La [liste des transactions](/transactions) montre l’activité récente. **Utilisateur vs Toutes** choisit les transactions soumises par les utilisateurs versus le flux complet (y compris les métadonnées de bloc). Vous pouvez filtrer les transactions utilisateur par fonction d’entrée (`fn_addr`, `fn_module`, `fn_name` dans l’URL).",
        "Sur la page de détail, les onglets dépendent du type de transaction :",
      ],
      bullets: [
        "**Aperçu** — statut, expéditeur, gas, fonction et **Actions** analysées (échanges, transferts, etc.).",
        "**Paiements** — affiché uniquement lorsque l’explorateur identifie un paiement (pair à pair, sauts contrôlés par un partenaire, transferts confidentiels, encapsulations/désencapsulations ou jambes d’échange). Les montants confidentiels restent masqués.",
        "**Changement de solde** — écarts de solde de jetons et d’actifs fongibles, y compris le gas.",
        "**Événements** — journaux émis pendant l’exécution.",
        "**Charge utile** — la charge soumise (fonction d’entrée, script, multisig, etc.).",
        "**Modifications** — changements de ressources du write-set.",
        "**Modules** — lorsque la transaction publie ou met à jour des paquets Move.",
        "**Trace** — trace expérimentale d’appels Move Sentio sur les transactions utilisateur mainnet.",
      ],
      more: [
        "Une transaction échouée existe toujours on-chain ; l’aperçu affiche l’erreur. Les transactions en attente n’ont pas encore été ordonnées dans un bloc.",
        "Si le nœud complet de service a **élagué** l’historique ancien, l’explorateur réessaie un nœud **archive**, puis reconstruit depuis l’**indexeur** si besoin. Les pages uniquement indexeur peuvent omettre arguments de charge, événements ou hashs, et affichent une bannière d’information.",
      ],
    },
    accounts: {
      title: "Comptes, noms et objets",
      paragraphs: [
        "Un **compte** est une adresse de 32 octets. Ouvrez-le à `/account/{address}`. L’hex court (`0x1`) est accepté. [Aptos Names](https://aptosnames.com) (`.apt`) se résout en adresses dans la recherche et l’en-tête du compte.",
        "Un **objet Move** est une entité on-chain de première classe qui peut posséder des ressources. Si vous ouvrez une adresse d’objet comme un compte, l’explorateur redirige vers `/object/{address}` avec un ensemble d’onglets similaire.",
        "Les onglets de compte incluent généralement :",
      ],
      bullets: [
        "**Transactions** — historique de cette adresse, avec pagination et filtre de fonction facultatif.",
        "**Jetons** — soldes de jetons (et vues FA associées le cas échéant).",
        "**Tokens** — NFT et actifs numériques.",
        "**Ressources** — ressources Move stockées sous le compte, en JSON.",
        "**Modules** — paquets publiés et source (voir [Modules](#modules)).",
        "**Multisig** — lorsque le compte est un multisig (l’onboarding Petra Vault peut être proposé).",
        "**Info** — numéro de séquence, clé d’authentification et métadonnées associées.",
      ],
      more: [
        "Les adresses connues peuvent afficher un **libellé et une icône** (échanges, comptes du framework, etc.). Certains projets étiquetés affichent une bannière **defunct** ou de fermeture progressive — traitez-la comme un avertissement, pas un conseil d’investissement.",
        "La **carte de solde** affiche APT. Sur mainnet, elle peut inclure une estimation en USD d’un flux de prix public.",
      ],
    },
    modules: {
      title: "Modules Move et code",
      paragraphs: [
        "L’onglet Modules liste les paquets publiés par un compte ou un objet. Vous pouvez ouvrir les **paquets**, le **code** d’un module, **Exécuter** (fonctions d’entrée, portefeuille requis) et **Voir** (fonctions view en lecture seule).",
        "Les vues de code incluent **Source publiée** (si l’éditeur l’a stockée), **ABI**, et — si vous l’activez dans [Paramètres](/settings) — bytecode **Décompilé** et **Désassemblage**. La décompilation s’exécute dans votre navigateur (WebAssembly). C’est une reconstruction, pas les commentaires et noms d’origine.",
        "Un **sélecteur de version** permet d’inspecter un paquet à une transaction de publication antérieure. La vue de diff compare deux versions. Les liens inter-modules sautent vers d’autres modules du même paquet lorsque les noms se résolvent.",
      ],
    },
    blocks: {
      title: "Blocs",
      paragraphs: [
        "Aptos regroupe les transactions en **blocs** ordonnés par **hauteur**. La [liste des blocs](/blocks) affiche les hauteurs récentes. Une page de bloc (`/block/{height}`) a **Aperçu** (horodatage, proposeur, nombre de transactions, hashs) et **Transactions** de ce bloc.",
        "Les blocs élagués suivent le même repli vers le nœud d’archive que les anciennes transactions. Le tableau des blocs récents reste sur la fenêtre du nœud complet de service.",
      ],
    },
    validators: {
      title: "Validateurs et staking",
      paragraphs: [
        "La page [validateurs](/validators) a **Tous les nœuds** (ensemble actuel de validateurs, pouvoir de vote, localisation si connue) et **Délégation** (pools auxquels vous pouvez staker). Un indicateur d’époque affiche l’époque actuelle.",
        "Ouvrez un pool à `/validator/{address}` pour la commission, le stake, la performance, et — si vous connectez un portefeuille avec des dépôts — **Mes dépôts** avec stake / unstake / restake / retirer. Sur téléphone, ces actions sont sur chaque carte de dépôt, pas seulement dans le tableau bureau.",
        "La délégation est une action de protocole : elle consomme du gas et utilise votre portefeuille. Lisez les montants et le lockup avant de confirmer.",
      ],
    },
    assets: {
      title: "Jetons, actifs fongibles et NFT",
      paragraphs: [
        "Les **Coins** sont les types Move originaux `0x1::coin` (`address::module::Struct`). Les **actifs fongibles (FA)** sont le standard plus récent basé sur les objets. APT existe dans les deux vues ; beaucoup de jetons plus récents sont FA uniquement. La [liste des jetons](/coins) mélange jetons listés et FA.",
        "Une page jeton est `/coin/{type}` (type encodé dans l’URL). Une page FA est `/fungible_asset/{metadataAddress}`. Les onglets incluent souvent **Info**, **Transactions** et **Détenteurs** (les détenteurs nécessitent l’indexeur).",
        "Les NFT et actifs numériques utilisent `/token/{tokenId}` avec **Aperçu** et **Activités**. Les collections interdites ou d’arnaque peuvent être masquées ou signalées.",
        "Les badges de vérification (natif, vérifié Labs, communauté/Panora, reconnu, non vérifié, banni) sont expliqués sur la page [vérification](/verification). Un badge n’est pas une garantie de valeur ou de sécurité.",
      ],
    },
    analytics: {
      title: "Analytique",
      paragraphs: [
        "[Analytique](/analytics) est **mainnet uniquement**. Les autres réseaux affichent un court message au lieu de graphiques. Les graphiques couvrent les transactions utilisateur quotidiennes, le TPS de pointe, les utilisateurs actifs, les nouveaux comptes, les déploiements, le gas et l’écart entre blocs. Vous pouvez basculer 7 jours vs 30 jours.",
        "La bande du haut résume l’offre, le stake, le TPS et le nombre de nœuds. Les données viennent de fichiers de statistiques de chaîne publiés plus des requêtes en direct — elles peuvent légèrement retarder.",
      ],
    },
    releases: {
      title: "Versions, AIP et outils",
      paragraphs: [
        "Le [hub des versions](/releases) a trois onglets : **Réseaux** (époque, hauteur, versions framework/nœud, indicateurs de fonctionnalité sur mainnet, testnet et devnet), **AIP** (propositions d’amélioration Aptos du dépôt AIP public) et **SDK** (CLI, `aptos-node` et versions SDK officielles).",
        "Les anciennes URL `/deployments` et `/aips` redirigent ici.",
      ],
    },
    runScript: {
      title: "Exécuter un script (avancé)",
      paragraphs: [
        "[Exécuter un script](/run-script) crée, **simule** et **exécute** une transaction de **script** Move compilé depuis un portefeuille connecté. Les scripts n’ont pas d’ABI on-chain, vous devez donc déclarer vous-même les types d’arguments. Il n’y a pas de compilateur Move dans le navigateur — collez le bytecode (hex) d’un compilateur de confiance.",
        "Considérez cela comme irréversible une fois exécuté. Lisez toujours la simulation (statut, gas, événements, changements de ressources) avant Exécuter. Préférez l’onglet **Exécuter** des modules du compte pour les fonctions d’entrée publiées.",
      ],
    },
    configure: {
      title: "Configuration",
      paragraphs: [
        "Ouvrez [Paramètres](/settings). Les préférences sont stockées **dans ce navigateur**, pas sur les serveurs d’Aptos Labs.",
      ],
      bullets: [
        "**Langue** — Valeur par défaut du navigateur ou une langue explicite. Contrôle l’interface traduite, le texte des paramètres et ce guide. Les données on-chain (adresses, noms de fonction, événements) restent telles que la chaîne les stocke.",
        "**Décompilation du bytecode Move** — désactivée par défaut. Lisez l’avertissement avant d’activer. Lorsqu’elle est désactivée, les vues Décompilé et Désassemblage sont masquées.",
        "**Remplacement des clés API** — clés [geomi.dev](https://geomi.dev) facultatives par réseau pour que votre navigateur ne reste pas sur la limite de débit anonyme partagée. Les clés sont envoyées en `Authorization: Bearer`. Les clés client Geomi `AG-*` doivent autoriser l’Origin de ce site. Cochez **Mémoriser sur cet appareil** uniquement sur une machine de confiance ; sinon les clés durent la session de l’onglet.",
        "**Thème** — clair ou sombre depuis le contrôle soleil/lune de l’en-tête. Stocké dans un cookie (`color_scheme`) et suit le système si vous n’avez pas choisi.",
        "**Réseau** — sélecteur de l’en-tête ; encodé dans `?network=` plutôt que dans les paramètres.",
      ],
      more: [
        "Enregistrer applique ensemble les clés API et la décompilation (et la langue) : les clients en cache sont abandonnés et les requêtes se rafraîchissent. **Restaurer les valeurs par défaut** efface ces préférences de l’explorateur dans ce navigateur.",
        "Si vous voyez HTTP **429**, le tiroir de limite de débit peut vous envoyer vers Paramètres. Un corps Geomi *Per anonymous IP rate limit exceeded* signifie qu’aucune clé n’a été acceptée ; *Per application per IP rate limit exceeded* signifie que le quota de votre clé a été atteint.",
      ],
    },
    wallet: {
      title: "Portefeuille",
      paragraphs: [
        "Connecter un portefeuille est facultatif. Utilisez-le pour ouvrir rapidement votre compte, staker, exécuter des fonctions d’entrée ou envoyer un script. Petra est listé en premier parmi les portefeuilles installables.",
        "Le réseau du portefeuille doit correspondre à celui de l’explorateur (à une petite exception près pour certaines configurations RPC locales/personnalisées). Des réseaux incompatibles bloquent l’envoi afin que vous ne signiez pas pour la mauvaise chaîne.",
      ],
    },
    verification: {
      title: "Vérification des jetons et adresses",
      paragraphs: [
        "L’explorateur peut afficher des badges de vérification sur les jetons et certaines adresses. Le listage communautaire passe par la [liste de jetons Panora](https://github.com/PanoraExchange/Aptos-Tokens). La vérification Labs est réservée aux actifs natifs et à certains jetons établis.",
        "Les instructions pas à pas pour les équipes de projet sont sur la page [Vérification des jetons et adresses](/verification). Les utilisateurs doivent tout de même vérifier l’adresse de type/métadonnées, pas seulement un nom ou une icône.",
      ],
    },
    urls: {
      title: "URL, partage et agents",
      paragraphs: [
        "Préférez les **onglets basés sur le chemin**, par exemple `/account/0x1/modules` plutôt qu’une requête `?tab=`. Copiez la barre d’adresse pour partager une vue ; conservez `?network=` si vous n’êtes pas sur mainnet.",
        "Les modèles canoniques sont documentés pour les humains ici et pour les logiciels dans [`/llms.txt`](/llms.txt). Les agents dans le navigateur peuvent utiliser des outils WebMCP en lecture seule (recherche, ouverture de transaction/compte/bloc/jeton/versions/guide) lorsque le navigateur les prend en charge.",
        "Lorsque l’explorateur est installé en PWA ou intégré (par exemple Petra Vault), un contrôle **Partager** peut apparaître dans l’en-tête.",
      ],
    },
    glossary: {
      title: "Glossaire",
      bullets: [
        "**Adresse** — identifiant de compte ou d’objet de 32 octets, hex avec `0x`. `0x1` est le Aptos Framework.",
        "**ANS** — Aptos Name Service. Un nom comme `alice.apt` correspond à une adresse.",
        "**Hauteur de bloc** — index d’un bloc, commençant à 0.",
        "**Événement** — journal structuré émis pendant l’exécution d’une transaction.",
        "**Actif fongible (FA)** — standard de jeton fongible basé sur les objets (adresse de l’objet de métadonnées).",
        "**Gas** — frais d’exécution et de stockage, payés en APT (octas en dessous).",
        "**Indexeur** — API GraphQL d’Aptos Labs utilisée pour l’historique, les détenteurs et certains onglets. Tous les réseaux n’en ont pas.",
        "**Module** — code Move publié. Un **paquet** groupe des modules.",
        "**Objet** — entité on-chain avec sa propre adresse qui peut contenir des ressources.",
        "**Octa** — 10⁻⁸ APT. 1 APT = 100 000 000 octas.",
        "**Ressource** — données Move typées stockées sous un compte ou un objet.",
        "**Numéro de séquence** — compteur par compte qui ordonne les transactions de ce compte.",
        "**Version de transaction** — version globale du registre (entier) attribuée lorsqu’une transaction est ordonnée.",
        "**Write-set / modifications** — état écrit par la transaction.",
      ],
    },
    troubleshooting: {
      title: "Dépannage",
      bullets: [
        "**Pages vides ou en chargement infini** — vérifiez le sélecteur de réseau et si vous êtes en Local sans nœud. Essayez un autre réseau ou attendez un 429.",
        "**Transaction introuvable** — confirmez version/hash et réseau. Les très anciennes versions peuvent se charger depuis l’archive/indexeur avec moins de champs.",
        "**La recherche a manqué un hash élagué** — la recherche par hash utilise le nœud complet puis l’archive (sans la clé API de l’explorateur). L’indexeur ne peut pas rechercher par hash.",
        "**Décompilé / Désassemblage manquant** — activez la décompilation dans [Paramètres](/settings) et acceptez l’avertissement.",
        "**Mauvaise chaîne** — regardez `?network=` et le menu déroulant de l’en-tête.",
        "**Résultats de recherche périmés** — **Vider le cache** du pied de page.",
        "**Analytique manquante** — passez au mainnet.",
        "**Le portefeuille n’envoie pas** — faites correspondre le réseau du portefeuille à l’explorateur ; reconnectez après un changement.",
      ],
    },
  },
} as const satisfies EnglishMessages;

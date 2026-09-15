import type {MessageTree} from "../translate";

export const nl = {
  chrome: {
    skipToContent: "Naar hoofdinhoud springen",
    appName: "Aptos Explorer",
    appNameShort: "Explorer",
    navAriaLabel: "Hoofdnavigatie",
    overflowMenuAriaLabel: "Navigatiemenu",
    openSettings: "Instellingen openen",
    openGuide: "Gebruikershandleiding openen",
    switchToLight: "Overschakelen naar lichte modus",
    switchToDark: "Overschakelen naar donkere modus",
    nav: {
      transactions: "Transacties",
      transactionsTitle: "Alle transacties bekijken",
      analytics: "Analytics",
      analyticsTitle: "Netwerkanalytics bekijken",
      validators: "Validators",
      validatorsTitle: "Alle validators bekijken",
      blocks: "Blokken",
      blocksTitle: "Laatste blokken bekijken",
      coins: "Coins",
      coinsTitle: "Coins en fungible assets bekijken",
      releases: "Releases",
      releasesTitle:
        "Netwerkdeployments, AIP's en SDK- & toolreleases bekijken",
      runScript: "Script uitvoeren",
      runScriptTitle:
        "Een Move-script bouwen, simuleren en uitvoeren (geavanceerd)",
      settings: "Instellingen",
      guide: "Gebruikershandleiding",
    },
  },
  footer: {
    privacy: "Privacy",
    terms: "Voorwaarden",
    verification: "Token- & adresverificatie",
    guide: "Gebruikershandleiding",
    clearCache: "Cache wissen",
    cacheCleared: "✓ Gewist",
    clearCacheTitle: "Zoekcache wissen",
    copyrightOwner: "Aptos Labs",
  },
  search: {
    placeholder: "Zoeken op adres, txn, blok, coin of ANS-naam",
    helper:
      "Accountadres of naam · Txn-hash of versie · Blokhoogte · Coin-type · ANS-naam",
    ariaLabel: "zoeken",
    type: {
      account: "Account",
      address: "Adres",
      transaction: "Transactie",
      block: "Blok",
      coin: "Coin",
      fungibleAsset: "Fungible asset",
      object: "Object",
      result: "Resultaat",
    },
  },
  settings: {
    title: "Instellingen",
    description:
      "Beheer uw explorer-voorkeuren. Instellingen worden lokaal in uw browser opgeslagen.",
    language: {
      title: "Taal",
      description:
        "Kies hoe de explorer de interface, instellingen en de gebruikershandleiding weergeeft. Browserstandaard volgt de taal van uw apparaat wanneer er een vertaling beschikbaar is, en gebruikt anders Engels. Extra talen kunnen als catalogi worden toegevoegd zonder pagina-URL's te wijzigen.",
      label: "Weergavetaal",
      auto: "Browserstandaard",
    },
    decompilation: {
      title: "Move-bytecode-decompilatie",
      description:
        "Schakel client-side decompilatie van on-chain Move-bytecode naar leesbare broncode in. Draait volledig in uw browser via WebAssembly.",
      ariaLabel: "Move-bytecode-decompilatie inschakelen",
      disclaimerTitle: "Disclaimer — Lees dit voordat u inschakelt",
      disclaimerIntro:
        "Gedecompileerde output wordt mechanisch gegenereerd uit on-chain bytecode en **komt mogelijk niet overeen** met de oorspronkelijke broncode. Variabelenamen, commentaar en sommige structurele details gaan verloren tijdens compilatie en kunnen niet worden hersteld. Door deze functie in te schakelen erkent u dat:",
      bullets: [
        "De gedecompileerde output **as-is en alleen voor informatieve doeleinden** wordt aangeboden.",
        "U de verantwoordelijkheid aanvaardt voor hoe u de gedecompileerde output gebruikt.",
        "De output niet als de definitieve of gezaghebbende broncode voor een on-chain module moet worden behandeld.",
      ],
    },
    apiKeys: {
      title: "API-sleuteloverschrijvingen",
      whyAriaLabel: "Waarom uw eigen API-sleutel gebruiken?",
      popover:
        "De explorer gebruikt standaard een gedeelde geomi.dev API-sleutel. Met uw eigen sleutel krijgt u een eigen ratelimiet, wat helpt bij intensief browsen of HTTP 429-responses.",
      popoverManage:
        "Sleutels aanmaken en beheren op [geomi.dev](https://geomi.dev).",
      description:
        "Optionele geomi.dev API-sleutels per netwerk. Alleen gebruikt in uw browser. Laat een netwerk leeg om de standaardsleutel uit de build te gebruiken (indien aanwezig). Standaard worden overschrijvingen opgeslagen voor de huidige browsersessie en gewist wanneer de sessie eindigt.",
      fieldLabel: "{network} API-sleutel",
      fieldPlaceholder: "Sleutel voor {network} plakken (optioneel)",
      showKeys: "API-sleutels tonen",
      hideKeys: "API-sleutels verbergen",
      getKey: "Nog geen sleutel? [Haal er een op geomi.dev](https://geomi.dev)",
      remember: "API-sleutels op dit apparaat onthouden",
      rememberWarning:
        "Onthouden slaat sleutels op in de lokale opslag van deze browser. Schakel dit niet in op gedeelde of onbetrouwbare apparaten.",
      notStored:
        "Sleutels worden niet opgeslagen door de explorer-applicatieserver. Uw browser gebruikt ze alleen voor client-side API-verzoeken. Voor de beste beveiliging gebruikt u clientsleutels waarbij alleen de origin `https://explorer.aptoslabs.com` is ingeschakeld en afgedwongen.",
      refreshNote:
        "Bestaande gegevens worden na opslaan ververst, zodat nieuwe verzoeken de bijgewerkte sleutels direct gebruiken.",
    },
    actions: {
      reset: "Resetten",
      restoreDefaults: "Standaardwaarden herstellen",
      save: "Opslaan",
    },
    metaDescription:
      "Configureer Aptos Explorer-instellingen, inclusief taal, API-sleutels, decompilatievoorkeuren en andere opties.",
  },
  guide: {
    meta: {
      title: "Gebruikershandleiding",
      description:
        "Hoe u Aptos Explorer gebruikt: zoeken, netwerken, transacties, accounts, modules, instellingen en hoe u leest wat u ziet.",
      tocLabel: "Op deze pagina",
      intro:
        "Deze handleiding legt uit hoe u Aptos Explorer **gebruikt**, hoe u de getoonde pagina's **leest** en hoe u het in uw browser **configureert**. Het is geschreven voor mensen die on-chain gegevens opzoeken — niet voor het draaien van een node of het schrijven van Move.",
    },
    overview: {
      title: "Wat deze explorer is",
      paragraphs: [
        "Aptos Explorer is de officiële **block explorer** voor de Aptos-blockchain. U gebruikt het om transacties, accounts, blokken, validators, coins, NFT's en netwerkstatus op te zoeken. Het leest openbare ketengegevens; het beheert geen fondsen en is geen wallet.",
        "Elke pagina is beperkt tot een **netwerk** (standaard mainnet). Een transactie of account op testnet is een ander object dan dezelfde identificatie op mainnet. Het netwerk staat in de URL als `?network=…`, zodat links die u kopieert dezelfde keten behouden.",
        "De explorer is een website. Een wallet verbinden is optioneel en alleen nodig voor acties zoals staken, een modulefunctie uitvoeren of een Move-script indienen.",
      ],
    },
    chrome: {
      title: "Uw weg vinden",
      paragraphs: [
        "De **koptekst** staat op elke pagina: logo (home), hoofdnavigatie, netwerkselector, optionele deelknop, [gebruikershandleiding](/guide), [instellingen](/settings), licht/donker thema en wallet verbinden. Op kleinere schermen staan navigatie, instellingen, thema en wallet in de menuknop.",
        "Onder de koptekst tonen de meeste detailpagina's een **terug**-knop (wanneer u in-app geschiedenis hebt) en een **zoekveld**. De startpagina (`/`) is een groter zoekoppervlak met dezelfde matchregels.",
        "De **voettekst** bevat Privacy, Voorwaarden, [instructies voor tokenverificatie](/verification), deze handleiding en **Cache wissen** (wist de zoekresultaatcache van de browser, niet de blockchain).",
      ],
      bullets: [
        "**Transacties** — recente gebruikerstransacties, met filters.",
        "**Analytics** — alleen-mainnet-grafieken (TPS, actieve gebruikers, gas en meer).",
        "**Validators** — de validatorset en delegatiepools.",
        "**Blokken** — laatste blokken op hoogte.",
        "**Coins** — vermelde coins en fungible assets.",
        "**Releases** — live netwerkversies, AIP's en SDK/CLI-releases.",
        "**Script uitvoeren** — geavanceerd hulpmiddel om een ruw Move-script te simuleren en in te dienen.",
      ],
    },
    search: {
      title: "Zoeken",
      paragraphs: [
        "Typ in het zoekveld op de [startpagina](/) of in de koptekst. U hoeft niet eerst een entiteitstype te kiezen — de explorer detecteert wat u hebt ingevoerd.",
        "U kunt een zoekopdracht ook delen met `/?search={query}` (bijvoorbeeld `/?search=0x1`). Als de URL-zoekopdracht precies één duidelijk resultaat heeft, kan de zoekbalk in de koptekst u daar direct naartoe brengen.",
      ],
      bullets: [
        "**Accountadres** (inclusief korte vormen zoals `0x1`) — account, en mogelijk een coin, fungible-asset-metadata of Move-object.",
        "**ANS-naam** eindigend op `.apt` (of `.petra`) — wordt opgelost naar een account.",
        "**Transactieversie** (een getal) of **transactiehash** (`0x` plus 64 hexadecimale tekens).",
        "**Blokhoogte** (een getal binnen het bereik van de keten).",
        "**Move-cointype** zoals `0x1::aptos_coin::AptosCoin`.",
        "**Tokennaam of -symbool** — komt overeen met de vermelde coinset.",
        "**Alleen-emoji-tekst** — zoekt emojicoin-markten wanneer van toepassing.",
      ],
    },
    networks: {
      title: "Netwerken",
      paragraphs: [
        "Gebruik het netwerkdropdown in de koptekst. In-app links behouden uw huidige netwerk, zodat u niet stil terugspringt naar mainnet.",
        "**Mainnet** is productie. **Testnet** en **devnet** zijn voor ontwikkeling (devnet wordt vaak gereset). **Lokaal** praat met een node op uw machine (meestal `http://127.0.0.1:8080/v1`). Verborgen of preview-netwerken kunnen verschijnen wanneer de explorer is gebouwd met een feature flag.",
        "Als u Lokaal selecteert en de node niet draait, legt een modaal uit hoe u `aptos node run-local-testnet` start en biedt een terugschakeling naar Mainnet.",
        "Sommige functies zijn alleen-mainnet (analytics, sommige prijsschattingen, Sentio-traces). GraphQL/indexer-tabs kunnen ontbreken op netwerken die geen indexer publiceren.",
      ],
    },
    transactions: {
      title: "Een transactie lezen",
      paragraphs: [
        "Open een transactie op `/txn/{version}` of `/txn/{hash}`. **Versie** is het ledger-sequentienummer (een geheel getal vanaf 0). **Hash** is de 32-byte transactiehash. Versie is de stabiele identificatie als u die hebt.",
        "De [transactielijst](/transactions) toont recente activiteit. **Gebruiker vs Alle** kiest gebruikersingediende transacties versus de volledige stream (inclusief blokmetadata). U kunt gebruikerstransacties filteren op entry-functie (`fn_addr`, `fn_module`, `fn_name` in de URL).",
        "Op de detailpagina hangen de tabs af van het transactietype:",
      ],
      bullets: [
        "**Overzicht** — status, afzender, gas, functie en geparseerde **Acties** (swaps, transfers en dergelijke).",
        "**Betalingen** — alleen getoond wanneer de explorer een betaling identificeert (peer-to-peer, partnergestuurde hops, vertrouwelijke transfers, wraps/unwraps of exchange-legs). Vertrouwelijke bedragen blijven verborgen.",
        "**Saldowijziging** — coin- en fungible-asset-saldodifferenties, inclusief gas.",
        "**Events** — logs uitgegeven tijdens uitvoering.",
        "**Payload** — de ingediende payload (entry-functie, script, multisig, enzovoort).",
        "**Wijzigingen** — write-set resourcewijzigingen.",
        "**Modules** — wanneer de transactie Move-pakketten publiceert of upgradet.",
        "**Trace** — experimentele Sentio Move-aanroeptrace op mainnet-gebruikerstransacties.",
      ],
      more: [
        "Een mislukte transactie bestaat nog steeds on-chain; het overzicht toont de fout. Hangende transacties zijn nog niet in een blok geordend.",
        "Als de bedienende fullnode oude geschiedenis heeft **gepruned**, probeert de explorer een **archief**-node en reconstrueert indien nodig vanuit de **indexer**. Indexer-only-pagina's kunnen payload-argumenten, events of hashes weglaten en tonen een infobanner.",
      ],
    },
    accounts: {
      title: "Accounts, namen en objecten",
      paragraphs: [
        "Een **account** is een 32-byte adres. Open het op `/account/{address}`. Korte hex (`0x1`) wordt geaccepteerd. [Aptos Names](https://aptosnames.com) (`.apt`) worden opgelost naar adressen in zoeken en in de accountkoptekst.",
        "Een **Move-object** is een first-class on-chain entiteit die resources kan bezitten. Als u een objectadres als account opent, stuurt de explorer door naar `/object/{address}` met een vergelijkbare tabset.",
        "Accounttabs omvatten doorgaans:",
      ],
      bullets: [
        "**Transacties** — geschiedenis voor dit adres, met paginering en optionele functiefilter.",
        "**Coins** — coinsaldi (en gerelateerde FA-weergaven waar van toepassing).",
        "**Tokens** — NFT's en digitale assets.",
        "**Resources** — Move-resources opgeslagen onder het account, als JSON.",
        "**Modules** — gepubliceerde pakketten en broncode (zie [Modules](#modules)).",
        "**Multisig** — wanneer het account een multisig is (Petra Vault-onboarding kan worden aangeboden).",
        "**Info** — sequentienummer, authenticatiesleutel en gerelateerde metadata.",
      ],
      more: [
        "Bekende adressen kunnen een **label en pictogram** tonen (exchanges, framework-accounts, enzovoort). Sommige gelabelde projecten tonen een **defunct**- of afwikkelingsbanner — behandel dat als een waarschuwing, niet als beleggingsadvies.",
        "De **saldo-kaart** toont APT. Op mainnet kan een USD-schatting uit een openbare prijsfeed zijn opgenomen.",
      ],
    },
    modules: {
      title: "Move-modules en code",
      paragraphs: [
        "Het tabblad Modules toont pakketten gepubliceerd door een account of object. U kunt **pakketten**, **code** voor een module, **Uitvoeren** (entry-functies, wallet vereist) en **Bekijken** (alleen-lezen view-functies) openen.",
        "Codeweergaven omvatten **Gepubliceerde broncode** (als de uitgever die heeft opgeslagen), **ABI** en — wanneer u zich aanmeldt onder [Instellingen](/settings) — **Gedecompileerde** bytecode en **Disassembly**. Decompilatie draait in uw browser (WebAssembly). Het is een reconstructie, niet de oorspronkelijke commentaren en namen.",
        "Een **versieselectie** laat u een pakket bij een eerdere publicatietransactie inspecteren. Diff-weergave vergelijkt twee versies. Cross-module links springen naar andere modules in hetzelfde pakket wanneer namen worden opgelost.",
      ],
    },
    blocks: {
      title: "Blokken",
      paragraphs: [
        "Aptos groepeert transacties in **blokken** geordend op **hoogte**. De [blokkenlijst](/blocks) toont recente hoogtes. Een blokpagina (`/block/{height}`) heeft **Overzicht** (tijdstempel, proposer, transactieaantal, hashes) en **Transacties** in dat blok.",
        "Geprunede blokken volgen dezelfde archief-node-fallback als oude transacties. De tabel met recente blokken blijft binnen het venster van de bedienende fullnode.",
      ],
    },
    validators: {
      title: "Validators en staken",
      paragraphs: [
        "De [validators](/validators)-pagina heeft **Alle nodes** (de huidige validatorset, stemkracht, locatie indien bekend) en **Delegatie** (pools waarin u kunt staken). Een epoch-indicator toont de huidige epoch.",
        "Open een pool op `/validator/{address}` voor commissie, stake, prestaties en — als u een wallet verbindt met stortingen — **Mijn stortingen** met staken / unstaken / restaken / opnemen. Op een telefoon staan die acties op elke stortingskaart, niet alleen in de desktoptabel.",
        "Delegatie is een protocolactie: het verbruikt gas en gebruikt uw wallet. Lees bedragen en de lockup voordat u bevestigt.",
      ],
    },
    assets: {
      title: "Coins, fungible assets en NFT's",
      paragraphs: [
        "**Coins** zijn de oorspronkelijke Move `0x1::coin`-types (`address::module::Struct`). **Fungible assets (FA)** zijn de nieuwere objectgebaseerde standaard. APT bestaat in beide weergaven; veel nieuwere tokens zijn alleen FA. De [coinslijst](/coins) mengt vermelde coins en FA's.",
        "Een coinpagina is `/coin/{type}` (URL-gecodeerd type). Een FA-pagina is `/fungible_asset/{metadataAddress}`. Tabs omvatten doorgaans **Info**, **Transacties** en **Houders** (houders hebben indexer-ondersteuning nodig).",
        "NFT's en digitale assets gebruiken `/token/{tokenId}` met **Overzicht** en **Activiteiten**. Verboden of scam-collecties kunnen verborgen of gemarkeerd zijn.",
        "Verificatiebadges (native, Labs geverifieerd, community/Panora, erkend, niet geverifieerd, verbannen) worden uitgelegd op de [verificatie](/verification)-pagina. Een badge is geen garantie voor waarde of veiligheid.",
      ],
    },
    analytics: {
      title: "Analytics",
      paragraphs: [
        "[Analytics](/analytics) is **alleen mainnet**. Andere netwerken tonen een kort bericht in plaats van grafieken. Grafieken dekken dagelijkse gebruikerstransacties, piek-TPS, actieve gebruikers, nieuwe accounts, deployments, gas en blokafstand. U kunt schakelen tussen 7-dagen- en 30-dagenbereiken.",
        "De strook bovenaan vat aanbod, stake, TPS en node-aantallen samen. Gegevens komen uit gepubliceerde chain-stats-bestanden plus live ketenqueries — ze kunnen enigszins achterlopen.",
      ],
    },
    releases: {
      title: "Releases, AIP's en tools",
      paragraphs: [
        "De [releases-hub](/releases) heeft drie tabs: **Netwerken** (epoch, hoogte, framework-/nodeversies, feature flags over mainnet, testnet en devnet), **AIP's** (Aptos Improvement Proposals uit de openbare AIP-repository) en **SDK's** (CLI, `aptos-node` en officiële SDK-releases).",
        "Oudere URL's `/deployments` en `/aips` leiden hierheen.",
      ],
    },
    runScript: {
      title: "Script uitvoeren (geavanceerd)",
      paragraphs: [
        "[Script uitvoeren](/run-script) bouwt, **simuleert** en **voert** een gecompileerde Move-**script**-transactie uit vanaf een verbonden wallet. Scripts hebben geen on-chain ABI, dus u moet argumenttypen zelf declareren. Er is geen Move-compiler in de browser — plak bytecode (hex) van een compiler die u vertrouwt.",
        "Behandel dit als onomkeerbaar zodra het is uitgevoerd. Lees altijd de simulatie (status, gas, events, resourcewijzigingen) voordat u Uitvoeren kiest. Geef de voorkeur aan het tabblad **Uitvoeren** van accountmodules voor gepubliceerde entry-functies.",
      ],
    },
    configure: {
      title: "Configuratie",
      paragraphs: [
        "Open [Instellingen](/settings). Voorkeuren worden **in deze browser** opgeslagen, niet op Aptos Labs-servers.",
      ],
      bullets: [
        "**Taal** — Browserstandaard of een expliciete taal. Dit bepaalt vertaalde interface, instellingsteksten en deze handleiding. On-chain gegevens (adressen, functienamen, events) blijven zoals de keten ze opslaat.",
        "**Move-bytecode-decompilatie** — standaard uit. Lees de disclaimer voordat u inschakelt. Wanneer uit, zijn Gedecompileerd- en Disassembly-weergaven verborgen.",
        "**API-sleuteloverschrijvingen** — optionele [geomi.dev](https://geomi.dev)-sleutels per netwerk, zodat uw browser niet vastzit aan de gedeelde anonieme ratelimiet. Sleutels worden verzonden als `Authorization: Bearer`. Geomi `AG-*`-clientsleutels moeten de Origin van deze site toestaan. Vink **Op dit apparaat onthouden** alleen aan op een apparaat dat u vertrouwt; anders blijven sleutels geldig voor de tabsessie.",
        "**Thema** — licht of donker via de zon/maan-knop in de koptekst. Opgeslagen in een cookie (`color_scheme`) en volgt het systeem als u niets hebt gekozen.",
        "**Netwerk** — selector in de koptekst; gecodeerd in `?network=` in plaats van in instellingen.",
      ],
      more: [
        "Opslaan past API-sleutels en decompilatie (en taal) samen toe: gecachte clients worden verwijderd en queries ververst. **Standaardwaarden herstellen** wist deze explorer-voorkeuren in deze browser.",
        "Als u HTTP **429** ziet, kan het ratelimietpaneel u naar Instellingen sturen. Een Geomi-tekst van *Per anonymous IP rate limit exceeded* betekent dat geen sleutel werd geaccepteerd; *Per application per IP rate limit exceeded* betekent dat het quotum van uw sleutel is bereikt.",
      ],
    },
    wallet: {
      title: "Wallet",
      paragraphs: [
        "Een wallet verbinden is optioneel. Gebruik het om snel uw account te openen, te staken, entry-functies uit te voeren of een script in te dienen. Petra staat bovenaan bij installeerbare wallets.",
        "Het netwerk van de wallet moet overeenkomen met het explorer-netwerk (met een kleine uitzondering voor sommige lokale/aangepaste RPC-setups). Niet-overeenkomende netwerken blokkeren indienen, zodat u niet voor de verkeerde keten tekent.",
      ],
    },
    verification: {
      title: "Token- en adresverificatie",
      paragraphs: [
        "De explorer kan verificatiebadges tonen op tokens en sommige adressen. Community-listing loopt via de [Panora-tokenlijst](https://github.com/PanoraExchange/Aptos-Tokens). Labs-verificatie is voorbehouden aan native assets en geselecteerde gevestigde tokens.",
        "Stap-voor-stap-instructies voor projectteams staan op de pagina [Token- & adresverificatie](/verification). Gebruikers moeten nog steeds het type/metadata-adres controleren, niet alleen een naam of pictogram.",
      ],
    },
    urls: {
      title: "URL's, delen en agents",
      paragraphs: [
        "Geef de voorkeur aan **padgebaseerde tabs**, bijvoorbeeld `/account/0x1/modules` in plaats van een `?tab=`-query. Kopieer de adresbalk om een weergave te delen; behoud `?network=` als u niet op mainnet bent.",
        "Canonische templates zijn gedocumenteerd voor mensen hier en voor software in [`/llms.txt`](/llms.txt). In-browser agents kunnen alleen-lezen WebMCP-tools gebruiken (zoeken, transactie/account/blok/coin/releases/handleiding openen) wanneer de browser ze ondersteunt.",
        "Wanneer de explorer als PWA is geïnstalleerd of is ingebed (bijvoorbeeld Petra Vault), kan een **Delen**-knop in de koptekst verschijnen.",
      ],
    },
    glossary: {
      title: "Woordenlijst",
      bullets: [
        "**Adres** — 32-byte account- of objectidentificatie, hex met `0x`. `0x1` is het Aptos Framework.",
        "**ANS** — Aptos Name Service. Een naam zoals `alice.apt` wijst naar een adres.",
        "**Blokhoogte** — index van een blok, beginnend bij 0.",
        "**Event** — gestructureerde log uitgegeven tijdens een transactie.",
        "**Fungible asset (FA)** — objectgebaseerde fungible tokenstandaard (metadata-objectadres).",
        "**Gas** — vergoeding voor uitvoering en opslag, betaald in APT (octas daaronder).",
        "**Indexer** — Aptos Labs GraphQL API gebruikt voor geschiedenis, houders en sommige tabs. Niet elk netwerk heeft er een.",
        "**Module** — gepubliceerde Move-code. Een **pakket** groepeert modules.",
        "**Object** — on-chain entiteit met eigen adres die resources kan bevatten.",
        "**Octa** — 10⁻⁸ APT. 1 APT = 100.000.000 octas.",
        "**Resource** — getypeerde Move-gegevens opgeslagen onder een account of object.",
        "**Sequentienummer** — teller per account die de transacties van dat account ordent.",
        "**Transactieversie** — globale ledgerversie (geheel getal) toegewezen wanneer een transactie wordt geordend.",
        "**Write-set / wijzigingen** — status die de transactie schreef.",
      ],
    },
    troubleshooting: {
      title: "Probleemoplossing",
      bullets: [
        "**Lege of draaiende pagina's** — controleer de netwerkselector en of u op Lokaal bent zonder node. Probeer een ander netwerk of wacht een 429 af.",
        "**Transactie niet gevonden** — bevestig versie/hash en netwerk. Zeer oude versies kunnen laden vanuit archief/indexer met minder velden.",
        "**Zoekopdracht miste een geprunede hash** — hash-zoekopdracht gebruikt de fullnode en dan archief (zonder de explorer API-sleutel). De indexer kan niet op hash zoeken.",
        "**Gedecompileerd / Disassembly ontbreekt** — schakel decompilatie in onder [Instellingen](/settings) en accepteer de disclaimer.",
        "**Verkeerde keten** — kijk naar `?network=` en het dropdown in de koptekst.",
        "**Verouderde zoekresultaten** — voettekst **Cache wissen**.",
        "**Analytics ontbreekt** — schakel over naar mainnet.",
        "**Wallet wil niet indienen** — pas het wallet-netwerk aan aan de explorer; verbind opnieuw na het wisselen.",
      ],
    },
  },
} as const satisfies MessageTree;

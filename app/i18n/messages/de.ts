import type {EnglishMessages} from "./en";

export const de = {
  chrome: {
    skipToContent: "Zum Hauptinhalt springen",
    appName: "Aptos Explorer",
    appNameShort: "Explorer",
    navAriaLabel: "Hauptnavigation",
    overflowMenuAriaLabel: "Navigationsmenü",
    openSettings: "Einstellungen öffnen",
    openGuide: "Benutzerhandbuch öffnen",
    switchToLight: "Zum hellen Modus wechseln",
    switchToDark: "Zum dunklen Modus wechseln",
    nav: {
      transactions: "Transaktionen",
      transactionsTitle: "Alle Transaktionen anzeigen",
      analytics: "Analytik",
      analyticsTitle: "Netzwerkanalytik anzeigen",
      validators: "Validatoren",
      validatorsTitle: "Alle Validatoren anzeigen",
      blocks: "Blöcke",
      blocksTitle: "Neueste Blöcke anzeigen",
      coins: "Coins",
      coinsTitle: "Coins und fungible Assets anzeigen",
      releases: "Releases",
      releasesTitle:
        "Netzwerk-Deployments, AIPs sowie SDK- und Tool-Releases anzeigen",
      runScript: "Skript ausführen",
      runScriptTitle:
        "Ein Move-Skript erstellen, simulieren und ausführen (fortgeschritten)",
      settings: "Einstellungen",
      guide: "Benutzerhandbuch",
    },
  },
  footer: {
    privacy: "Datenschutz",
    terms: "Nutzungsbedingungen",
    verification: "Token- und Adressverifizierung",
    guide: "Benutzerhandbuch",
    clearCache: "Cache leeren",
    cacheCleared: "✓ Geleert",
    clearCacheTitle: "Suchcache leeren",
    copyrightOwner: "Aptos Labs",
  },
  search: {
    placeholder: "Suche nach Adresse, Txn, Block, Coin oder ANS-Name",
    helper:
      "Kontoadresse oder Name · Txn-Hash oder Version · Blockhöhe · Coin-Typ · ANS-Name",
    ariaLabel: "suche",
    type: {
      account: "Konto",
      address: "Adresse",
      transaction: "Transaktion",
      block: "Block",
      coin: "Coin",
      fungibleAsset: "Fungibles Asset",
      object: "Objekt",
      result: "Ergebnis",
    },
  },
  settings: {
    title: "Einstellungen",
    description:
      "Verwalten Sie Ihre Explorer-Einstellungen. Die Einstellungen werden lokal im Browser gespeichert.",
    language: {
      title: "Sprache",
      description:
        "Legen Sie fest, wie der Explorer Oberfläche, Einstellungen und das Benutzerhandbuch anzeigt. Die Browser-Voreinstellung folgt der Gerätesprache, wenn eine Übersetzung vorhanden ist, andernfalls Englisch. Weitere Sprachen können als Kataloge hinzugefügt werden, ohne Seiten-URLs zu ändern.",
      label: "Anzeigesprache",
      auto: "Browser-Voreinstellung",
    },
    decompilation: {
      title: "Move-Bytecode-Dekompilierung",
      description:
        "Aktivieren Sie die clientseitige Dekompilierung von On-Chain-Move-Bytecode in lesbaren Quelltext. Läuft vollständig im Browser über WebAssembly.",
      ariaLabel: "Move-Bytecode-Dekompilierung aktivieren",
      disclaimerTitle: "Hinweis — Bitte vor dem Aktivieren lesen",
      disclaimerIntro:
        "Die dekompilierte Ausgabe wird mechanisch aus On-Chain-Bytecode erzeugt und **kann vom Originalquellcode abweichen**. Variablennamen, Kommentare und einige Strukturdetails gehen bei der Kompilierung verloren und können nicht wiederhergestellt werden. Mit der Aktivierung bestätigen Sie, dass:",
      bullets: [
        "Die dekompilierte Ausgabe **unverändert und nur zu Informationszwecken** bereitgestellt wird.",
        "Sie die Verantwortung für die Nutzung der dekompilierten Ausgabe übernehmen.",
        "Die Ausgabe nicht als verbindlicher oder maßgeblicher Quellcode eines On-Chain-Moduls gelten sollte.",
      ],
    },
    apiKeys: {
      title: "API-Schlüssel-Überschreibungen",
      whyAriaLabel: "Warum einen eigenen API-Schlüssel verwenden?",
      popover:
        "Der Explorer verwendet standardmäßig einen gemeinsamen geomi.dev-API-Schlüssel. Ein eigener Schlüssel gibt Ihnen ein eigenes Ratenlimit, hilfreich bei intensiver Nutzung oder HTTP 429.",
      popoverManage:
        "Schlüssel unter [geomi.dev](https://geomi.dev) erstellen und verwalten.",
      description:
        "Optionale geomi.dev-API-Schlüssel pro Netzwerk. Nur in Ihrem Browser verwendet. Lassen Sie ein Netzwerk leer, um den Standardschlüssel aus dem Build zu nutzen (falls vorhanden). Standardmäßig gelten Überschreibungen nur für die aktuelle Browsersitzung und werden beim Sitzungsende gelöscht.",
      fieldLabel: "{network}-API-Schlüssel",
      fieldPlaceholder: "Schlüssel für {network} einfügen (optional)",
      showKeys: "API-Schlüssel anzeigen",
      hideKeys: "API-Schlüssel ausblenden",
      getKey:
        "Noch kein Schlüssel? [Einen auf geomi.dev holen](https://geomi.dev)",
      remember: "API-Schlüssel auf diesem Gerät merken",
      rememberWarning:
        "Das Merken speichert Schlüssel im lokalen Speicher dieses Browsers. Aktivieren Sie dies nicht auf geteilten oder unvertrauenswürdigen Geräten.",
      notStored:
        "Schlüssel werden nicht auf dem Anwendungsserver des Explorers gespeichert. Ihr Browser verwendet sie nur für clientseitige API-Anfragen. Für beste Sicherheit nutzen Sie Client-Schlüssel, bei denen nur der Origin `https://explorer.aptoslabs.com` aktiviert und erzwungen ist.",
      refreshNote:
        "Vorhandene Daten werden nach dem Speichern aktualisiert, damit neue Anfragen die neuen Schlüssel sofort verwenden.",
    },
    actions: {
      reset: "Zurücksetzen",
      restoreDefaults: "Standardwerte wiederherstellen",
      save: "Speichern",
    },
    metaDescription:
      "Aptos-Explorer-Einstellungen konfigurieren, einschließlich Sprache, API-Schlüssel, Dekompilierung und weiterer Optionen.",
  },
  guide: {
    meta: {
      title: "Benutzerhandbuch",
      description:
        "So nutzen Sie Aptos Explorer: Suche, Netzwerke, Transaktionen, Konten, Module, Einstellungen und wie Sie das Angezeigte lesen.",
      tocLabel: "Auf dieser Seite",
      intro:
        "Dieses Handbuch erklärt, wie Sie Aptos Explorer **nutzen**, die angezeigten Seiten **lesen** und ihn im Browser **konfigurieren**. Es richtet sich an Personen, die On-Chain-Daten nachschlagen — nicht an den Betrieb eines Knotens oder das Schreiben von Move.",
    },
    overview: {
      title: "Was dieser Explorer ist",
      paragraphs: [
        "Aptos Explorer ist der offizielle **Block-Explorer** für die Aptos-Blockchain. Damit schlagen Sie Transaktionen, Konten, Blöcke, Validatoren, Coins, NFTs und den Netzwerkstatus nach. Er liest öffentliche Ketten-Daten; er verwahrt keine Gelder und ist keine Wallet.",
        "Jede Seite ist auf ein **Netzwerk** beschränkt (standardmäßig Mainnet). Eine Transaktion oder ein Konto auf Testnet ist ein anderes Objekt als dieselbe Kennung auf Mainnet. Das Netzwerk steht in der URL als `?network=…`, sodass kopierte Links dieselbe Kette behalten.",
        "Der Explorer ist eine Website. Eine Wallet zu verbinden ist optional und nur für Aktionen wie Staking, das Ausführen einer Modulfunktion oder das Senden eines Move-Skripts nötig.",
      ],
    },
    chrome: {
      title: "Zurechtfinden",
      paragraphs: [
        "Die **Kopfzeile** ist auf jeder Seite: Logo (Startseite), Hauptnavigation, Netzwerkauswahl, optionaler Teilen-Button, [Benutzerhandbuch](/guide), [Einstellungen](/settings), helles/dunkles Thema und Wallet-Verbindung. Auf kleineren Bildschirmen liegen Navigation, Einstellungen, Thema und Wallet im Menübutton.",
        "Unter der Kopfzeile zeigen die meisten Detailseiten eine **Zurück**-Steuerung (bei In-App-Verlauf) und ein **Suchfeld**. Die Startseite (`/`) ist eine größere Suchoberfläche mit denselben Trefferregeln.",
        "Die **Fußzeile** enthält Datenschutz, Nutzungsbedingungen, [Anleitung zur Token-Verifizierung](/verification), dieses Handbuch und **Cache leeren** (leert den Suchergebnis-Cache des Browsers, nicht die Blockchain).",
      ],
      bullets: [
        "**Transaktionen** — aktuelle Benutzertransaktionen, mit Filtern.",
        "**Analytik** — nur Mainnet-Diagramme (TPS, aktive Nutzer, Gas und mehr).",
        "**Validatoren** — das Validator-Set und Delegationspools.",
        "**Blöcke** — neueste Blöcke nach Höhe.",
        "**Coins** — gelistete Coins und fungible Assets.",
        "**Releases** — Live-Netzwerkversionen, AIPs und SDK/CLI-Releases.",
        "**Skript ausführen** — fortgeschrittenes Werkzeug zum Simulieren und Senden eines rohen Move-Skripts.",
      ],
    },
    search: {
      title: "Suche",
      paragraphs: [
        "Tippen Sie ins Suchfeld auf der [Startseite](/) oder in der Kopfzeile. Sie müssen zuerst keinen Entitätstyp wählen — der Explorer erkennt, was Sie eingegeben haben.",
        "Sie können eine Suche auch mit `/?search={query}` teilen (zum Beispiel `/?search=0x1`). Hat die URL-Suche genau ein klares Ergebnis, kann die Kopfzeilen-Suche Sie sofort dorthin bringen.",
      ],
      bullets: [
        "**Kontoadresse** (einschließlich Kurzformen wie `0x1`) — Konto und möglicherweise ein Coin, Fungible-Asset-Metadaten oder ein Move-Objekt.",
        "**ANS-Name** mit Endung `.apt` (oder `.petra`) — wird zu einem Konto aufgelöst.",
        "**Transaktionsversion** (eine Zahl) oder **Transaktions-Hash** (`0x` plus 64 Hex-Zeichen).",
        "**Blockhöhe** (eine Zahl im Bereich der Kette).",
        "**Move-Coin-Typ** wie `0x1::aptos_coin::AptosCoin`.",
        "**Tokenname oder -symbol** — trifft die gelistete Coin-Menge.",
        "**Nur-Emoji-Text** — sucht gegebenenfalls Emojicoin-Märkte.",
      ],
    },
    networks: {
      title: "Netzwerke",
      paragraphs: [
        "Nutzen Sie das Netzwerk-Dropdown in der Kopfzeile. In-App-Links behalten Ihr aktuelles Netzwerk, damit Sie nicht still zum Mainnet zurückspringen.",
        "**Mainnet** ist Produktion. **Testnet** und **Devnet** dienen der Entwicklung (Devnet wird oft zurückgesetzt). **Lokal** spricht mit einem Knoten auf Ihrem Rechner (typisch `http://127.0.0.1:8080/v1`). Versteckte oder Vorschau-Netzwerke können erscheinen, wenn der Explorer mit einem Feature-Flag gebaut wird.",
        "Wenn Sie Lokal wählen und der Knoten nicht läuft, erklärt ein Modal, wie Sie `aptos node run-local-testnet` starten, und bietet den Wechsel zurück zu Mainnet.",
        "Einige Funktionen sind nur Mainnet (Analytik, einige Preisschätzungen, Sentio-Traces). GraphQL-/Indexer-Tabs können auf Netzwerken fehlen, die keinen Indexer veröffentlichen.",
      ],
    },
    transactions: {
      title: "Eine Transaktion lesen",
      paragraphs: [
        "Öffnen Sie eine Transaktion unter `/txn/{version}` oder `/txn/{hash}`. **Version** ist die Ledger-Sequenznummer (eine ganze Zahl ab 0). **Hash** ist der 32-Byte-Transaktionshash. Die Version ist die stabile Kennung, wenn Sie sie haben.",
        "Die [Transaktionsliste](/transactions) zeigt aktuelle Aktivität. **Benutzer vs Alle** wählt benutzereingereichte Transaktionen gegenüber dem vollständigen Strom (einschließlich Blockmetadaten). Sie können Benutzertransaktionen nach Entry-Funktion filtern (`fn_addr`, `fn_module`, `fn_name` in der URL).",
        "Auf der Detailseite hängen die Tabs vom Transaktionstyp ab:",
      ],
      bullets: [
        "**Übersicht** — Status, Sender, Gas, Funktion und geparste **Aktionen** (Swaps, Transfers und Ähnliches).",
        "**Zahlungen** — nur sichtbar, wenn der Explorer eine Zahlung erkennt (Peer-to-Peer, partnergesteuerte Hops, vertrauliche Transfers, Wraps/Unwraps oder Exchange-Legs). Vertrauliche Beträge bleiben verborgen.",
        "**Saldoänderung** — Coin- und Fungible-Asset-Saldo-Differenzen, einschließlich Gas.",
        "**Ereignisse** — während der Ausführung ausgegebene Logs.",
        "**Payload** — die gesendete Nutzlast (Entry-Funktion, Skript, Multisig usw.).",
        "**Änderungen** — Write-Set-Ressourcenänderungen.",
        "**Module** — wenn die Transaktion Move-Pakete veröffentlicht oder aktualisiert.",
        "**Trace** — experimenteller Sentio-Move-Aufruf-Trace bei Mainnet-Benutzertransaktionen.",
      ],
      more: [
        "Eine fehlgeschlagene Transaktion existiert weiterhin on-chain; die Übersicht zeigt den Fehler. Ausstehende Transaktionen sind noch nicht in einen Block eingeordnet.",
        "Hat der bedienende Fullnode alte Historie **bereinigt**, versucht der Explorer einen **Archiv**-Knoten und rekonstruiert bei Bedarf aus dem **Indexer**. Indexer-only-Seiten können Payload-Argumente, Ereignisse oder Hashes weglassen und zeigen ein Infobanner.",
      ],
    },
    accounts: {
      title: "Konten, Namen und Objekte",
      paragraphs: [
        "Ein **Konto** ist eine 32-Byte-Adresse. Öffnen Sie es unter `/account/{address}`. Kurzes Hex (`0x1`) wird akzeptiert. [Aptos Names](https://aptosnames.com) (`.apt`) werden in Suche und Konto-Kopfzeile zu Adressen aufgelöst.",
        "Ein **Move-Objekt** ist eine erstklassige On-Chain-Entität, die Ressourcen besitzen kann. Öffnen Sie eine Objektadresse als Konto, leitet der Explorer nach `/object/{address}` mit ähnlichem Tab-Satz um.",
        "Konto-Tabs umfassen typischerweise:",
      ],
      bullets: [
        "**Transaktionen** — Verlauf dieser Adresse, mit Paginierung und optionalem Funktionsfilter.",
        "**Coins** — Coin-Salden (und zugehörige FA-Ansichten, falls zutreffend).",
        "**Tokens** — NFTs und digitale Assets.",
        "**Ressourcen** — unter dem Konto gespeicherte Move-Ressourcen als JSON.",
        "**Module** — veröffentlichte Pakete und Quellcode (siehe [Module](#modules)).",
        "**Multisig** — wenn das Konto ein Multisig ist (Petra-Vault-Onboarding kann angeboten werden).",
        "**Info** — Sequenznummer, Authentifizierungsschlüssel und zugehörige Metadaten.",
      ],
      more: [
        "Bekannte Adressen können **Label und Icon** zeigen (Börsen, Framework-Konten usw.). Einige gelabelte Projekte zeigen ein **defunct**- oder Abwicklungsbanner — behandeln Sie das als Warnung, nicht als Anlageberatung.",
        "Die **Saldokarte** zeigt APT. Auf Mainnet kann eine USD-Schätzung aus einem öffentlichen Preisfeed enthalten sein.",
      ],
    },
    modules: {
      title: "Move-Module und Code",
      paragraphs: [
        "Der Module-Tab listet von einem Konto oder Objekt veröffentlichte Pakete. Sie können **Pakete**, **Code** eines Moduls, **Ausführen** (Entry-Funktionen, Wallet erforderlich) und **Anzeigen** (schreibgeschützte View-Funktionen) öffnen.",
        "Code-Ansichten umfassen **Veröffentlichter Quellcode** (falls der Publisher ihn speicherte), **ABI** und — wenn Sie unter [Einstellungen](/settings) zustimmen — **Dekompilierten** Bytecode und **Disassembly**. Die Dekompilierung läuft im Browser (WebAssembly). Es ist eine Rekonstruktion, nicht die originalen Kommentare und Namen.",
        "Ein **Versionswähler** lässt Sie ein Paket bei einer früheren Veröffentlichungs-Transaktion prüfen. Die Diff-Ansicht vergleicht zwei Versionen. Modulübergreifende Links springen zu anderen Modulen im selben Paket, wenn Namen aufgelöst werden.",
      ],
    },
    blocks: {
      title: "Blöcke",
      paragraphs: [
        "Aptos gruppiert Transaktionen in **Blöcke**, geordnet nach **Höhe**. Die [Blockliste](/blocks) zeigt aktuelle Höhen. Eine Blockseite (`/block/{height}`) hat **Übersicht** (Zeitstempel, Proposer, Transaktionsanzahl, Hashes) und **Transaktionen** in diesem Block.",
        "Bereinigte Blöcke folgen demselben Archiv-Knoten-Fallback wie alte Transaktionen. Die Tabelle der letzten Blöcke bleibt im Fenster des bedienenden Fullnodes.",
      ],
    },
    validators: {
      title: "Validatoren und Staking",
      paragraphs: [
        "Die [Validatoren](/validators)-Seite hat **Alle Knoten** (aktuelles Validator-Set, Stimmgewicht, Standort sofern bekannt) und **Delegation** (Pools, in die Sie staken können). Ein Epochenindikator zeigt die aktuelle Epoche.",
        "Öffnen Sie einen Pool unter `/validator/{address}` für Kommission, Stake, Leistung und — wenn Sie eine Wallet mit Einlagen verbinden — **Meine Einlagen** mit Stake / Unstake / Restake / Abheben. Am Telefon liegen diese Aktionen auf jeder Einlagenkarte, nicht nur in der Desktop-Tabelle.",
        "Delegation ist eine Protokollaktion: Sie verbraucht Gas und nutzt Ihre Wallet. Lesen Sie Beträge und Lockup vor der Bestätigung.",
      ],
    },
    assets: {
      title: "Coins, fungible Assets und NFTs",
      paragraphs: [
        "**Coins** sind die ursprünglichen Move-`0x1::coin`-Typen (`address::module::Struct`). **Fungible Assets (FA)** sind der neuere objektbasierte Standard. APT existiert in beiden Sichten; viele neuere Token sind nur FA. Die [Coin-Liste](/coins) mischt gelistete Coins und FAs.",
        "Eine Coin-Seite ist `/coin/{type}` (URL-kodierter Typ). Eine FA-Seite ist `/fungible_asset/{metadataAddress}`. Tabs umfassen häufig **Info**, **Transaktionen** und **Inhaber** (Inhaber brauchen Indexer-Unterstützung).",
        "NFTs und digitale Assets nutzen `/token/{tokenId}` mit **Übersicht** und **Aktivitäten**. Gebannte oder Betrugs-Kollektionen können ausgeblendet oder markiert sein.",
        "Verifizierungsabzeichen (nativ, Labs verifiziert, Community/Panora, erkannt, unverifiziert, gebannt) werden auf der [Verifizierungsseite](/verification) erklärt. Ein Abzeichen ist keine Garantie für Wert oder Sicherheit.",
      ],
    },
    analytics: {
      title: "Analytik",
      paragraphs: [
        "[Analytik](/analytics) ist **nur Mainnet**. Andere Netzwerke zeigen eine kurze Meldung statt Diagrammen. Diagramme decken tägliche Benutzertransaktionen, Peak-TPS, aktive Nutzer, neue Konten, Deployments, Gas und Blocklücken ab. Sie können 7-Tage- vs. 30-Tage-Bereiche wechseln.",
        "Der Streifen oben fasst Angebot, Stake, TPS und Knotenzahlen zusammen. Daten stammen aus veröffentlichten Chain-Stats-Dateien plus Live-Abfragen — sie können leicht hinterherhinken.",
      ],
    },
    releases: {
      title: "Releases, AIPs und Tools",
      paragraphs: [
        "Der [Release-Hub](/releases) hat drei Tabs: **Netzwerke** (Epoche, Höhe, Framework-/Knotenversionen, Feature-Flags über Mainnet, Testnet und Devnet), **AIPs** (Aptos Improvement Proposals aus dem öffentlichen AIP-Repository) und **SDKs** (CLI, `aptos-node` und offizielle SDK-Releases).",
        "Ältere URLs `/deployments` und `/aips` leiten hierher um.",
      ],
    },
    runScript: {
      title: "Skript ausführen (fortgeschritten)",
      paragraphs: [
        "[Skript ausführen](/run-script) erstellt, **simuliert** und **führt** eine kompilierte Move-**Skript**-Transaktion von einer verbundenen Wallet aus. Skripte haben kein On-Chain-ABI, daher müssen Sie Argumenttypen selbst deklarieren. Es gibt keinen Move-Compiler im Browser — fügen Sie Bytecode (Hex) von einem vertrauenswürdigen Compiler ein.",
        "Behandeln Sie dies nach der Ausführung als unumkehrbar. Lesen Sie immer die Simulation (Status, Gas, Ereignisse, Ressourcenänderungen) vor Ausführen. Bevorzugen Sie den **Ausführen**-Tab der Konto-Module für veröffentlichte Entry-Funktionen.",
      ],
    },
    configure: {
      title: "Konfiguration",
      paragraphs: [
        "Öffnen Sie [Einstellungen](/settings). Präferenzen werden **in diesem Browser** gespeichert, nicht auf Aptos-Labs-Servern.",
      ],
      bullets: [
        "**Sprache** — Browser-Voreinstellung oder eine explizite Sprache. Steuert übersetzte Oberfläche, Einstellungstexte und dieses Handbuch. On-Chain-Daten (Adressen, Funktionsnamen, Ereignisse) bleiben so, wie die Kette sie speichert.",
        "**Move-Bytecode-Dekompilierung** — standardmäßig aus. Lesen Sie den Hinweis vor dem Aktivieren. Wenn aus, sind Dekompiliert- und Disassembly-Ansichten ausgeblendet.",
        "**API-Schlüssel-Überschreibungen** — optionale [geomi.dev](https://geomi.dev)-Schlüssel pro Netzwerk, damit Ihr Browser nicht am gemeinsamen anonymen Ratenlimit hängen bleibt. Schlüssel werden als `Authorization: Bearer` gesendet. Geomi-`AG-*`-Client-Schlüssel müssen den Origin dieser Site erlauben. Aktivieren Sie **Auf diesem Gerät merken** nur auf einem vertrauenswürdigen Rechner; sonst gelten Schlüssel für die Tab-Sitzung.",
        "**Thema** — hell oder dunkel über die Sonne/Mond-Steuerung in der Kopfzeile. In einem Cookie (`color_scheme`) gespeichert und folgt dem System, wenn Sie nichts gewählt haben.",
        "**Netzwerk** — Auswahl in der Kopfzeile; in `?network=` kodiert, nicht in den Einstellungen.",
      ],
      more: [
        "Speichern wendet API-Schlüssel und Dekompilierung (und Sprache) gemeinsam an: zwischengespeicherte Clients werden verworfen und Abfragen aktualisiert. **Standardwerte wiederherstellen** löscht diese Explorer-Einstellungen in diesem Browser.",
        "Bei HTTP **429** kann die Ratenlimit-Schublade Sie zu den Einstellungen schicken. Ein Geomi-Text *Per anonymous IP rate limit exceeded* bedeutet, dass kein Schlüssel akzeptiert wurde; *Per application per IP rate limit exceeded* bedeutet, dass das Kontingent Ihres Schlüssels erreicht ist.",
      ],
    },
    wallet: {
      title: "Wallet",
      paragraphs: [
        "Eine Wallet zu verbinden ist optional. Nutzen Sie sie, um Ihr Konto schnell zu öffnen, zu staken, Entry-Funktionen auszuführen oder ein Skript zu senden. Petra steht unter installierbaren Wallets zuerst.",
        "Das Netzwerk der Wallet muss mit dem Explorer-Netzwerk übereinstimmen (mit einer kleinen Ausnahme bei manchen lokalen/benutzerdefinierten RPC-Setups). Nicht übereinstimmende Netzwerke blockieren das Senden, damit Sie nicht für die falsche Kette signieren.",
      ],
    },
    verification: {
      title: "Token- und Adressverifizierung",
      paragraphs: [
        "Der Explorer kann Verifizierungsabzeichen auf Token und einigen Adressen zeigen. Community-Listings laufen über die [Panora-Tokenliste](https://github.com/PanoraExchange/Aptos-Tokens). Labs-Verifizierung ist nativen Assets und ausgewählten etablierten Token vorbehalten.",
        "Schritt-für-Schritt-Anleitungen für Projektteams stehen auf der Seite [Token- und Adressverifizierung](/verification). Nutzer sollten trotzdem die Typ-/Metadatenadresse prüfen, nicht nur Name oder Icon.",
      ],
    },
    urls: {
      title: "URLs, Teilen und Agenten",
      paragraphs: [
        "Bevorzugen Sie **pfadbasierte Tabs**, zum Beispiel `/account/0x1/modules` statt einer `?tab=`-Abfrage. Kopieren Sie die Adressleiste, um eine Ansicht zu teilen; behalten Sie `?network=`, wenn Sie nicht auf Mainnet sind.",
        "Kanonische Vorlagen sind hier für Menschen und in [`/llms.txt`](/llms.txt) für Software dokumentiert. Agenten im Browser können schreibgeschützte WebMCP-Werkzeuge nutzen (Suche, Transaktion/Konto/Block/Coin/Releases/Handbuch öffnen), wenn der Browser sie unterstützt.",
        "Wenn der Explorer als PWA installiert oder eingebettet ist (zum Beispiel Petra Vault), kann in der Kopfzeile eine **Teilen**-Steuerung erscheinen.",
      ],
    },
    glossary: {
      title: "Glossar",
      bullets: [
        "**Adresse** — 32-Byte-Konto- oder Objektkennung, Hex mit `0x`. `0x1` ist das Aptos Framework.",
        "**ANS** — Aptos Name Service. Ein Name wie `alice.apt` zeigt auf eine Adresse.",
        "**Blockhöhe** — Index eines Blocks, beginnend bei 0.",
        "**Ereignis** — strukturiertes Log, das während einer Transaktion ausgegeben wird.",
        "**Fungibles Asset (FA)** — objektbasierter fungibler Token-Standard (Metadaten-Objektadresse).",
        "**Gas** — Gebühr für Ausführung und Speicher, gezahlt in APT (Octas darunter).",
        "**Indexer** — Aptos-Labs-GraphQL-API für Verlauf, Inhaber und einige Tabs. Nicht jedes Netzwerk hat eine.",
        "**Modul** — veröffentlichter Move-Code. Ein **Paket** gruppiert Module.",
        "**Objekt** — On-Chain-Entität mit eigener Adresse, die Ressourcen halten kann.",
        "**Octa** — 10⁻⁸ APT. 1 APT = 100.000.000 Octas.",
        "**Ressource** — typisierte Move-Daten unter einem Konto oder Objekt.",
        "**Sequenznummer** — Zähler pro Konto, der die Transaktionen dieses Kontos ordnet.",
        "**Transaktionsversion** — globale Ledger-Version (Ganzzahl), zugewiesen wenn eine Transaktion eingeordnet wird.",
        "**Write-Set / Änderungen** — Zustand, den die Transaktion schrieb.",
      ],
    },
    troubleshooting: {
      title: "Fehlerbehebung",
      bullets: [
        "**Leere oder drehende Seiten** — prüfen Sie die Netzwerkauswahl und ob Sie auf Lokal ohne Knoten sind. Versuchen Sie ein anderes Netzwerk oder warten Sie ein 429 ab.",
        "**Transaktion nicht gefunden** — Version/Hash und Netzwerk bestätigen. Sehr alte Versionen können aus Archiv/Indexer mit weniger Feldern laden.",
        "**Suche hat einen bereinigten Hash verfehlt** — Hash-Suche nutzt Fullnode, dann Archiv (ohne Explorer-API-Schlüssel). Der Indexer kann nicht nach Hash suchen.",
        "**Dekompiliert / Disassembly fehlt** — Dekompilierung unter [Einstellungen](/settings) aktivieren und den Hinweis akzeptieren.",
        "**Falsche Kette** — `?network=` und das Dropdown in der Kopfzeile prüfen.",
        "**Veraltete Suchtreffer** — Fußzeile **Cache leeren**.",
        "**Analytik fehlt** — zu Mainnet wechseln.",
        "**Wallet sendet nicht** — Wallet-Netzwerk an den Explorer anpassen; nach dem Wechsel neu verbinden.",
      ],
    },
  },
} as const satisfies EnglishMessages;

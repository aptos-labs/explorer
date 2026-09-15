import type {MessageTree} from "../translate";

export const it = {
  chrome: {
    skipToContent: "Vai al contenuto principale",
    appName: "Aptos Explorer",
    appNameShort: "Explorer",
    navAriaLabel: "Navigazione principale",
    overflowMenuAriaLabel: "Menu di navigazione",
    openSettings: "Apri impostazioni",
    openGuide: "Apri guida utente",
    switchToLight: "Passa alla modalità chiara",
    switchToDark: "Passa alla modalità scura",
    nav: {
      transactions: "Transazioni",
      transactionsTitle: "Visualizza tutte le transazioni",
      analytics: "Analisi",
      analyticsTitle: "Visualizza le analisi di rete",
      validators: "Validatori",
      validatorsTitle: "Visualizza tutti i validatori",
      blocks: "Blocchi",
      blocksTitle: "Visualizza gli ultimi blocchi",
      coins: "Monete",
      coinsTitle: "Visualizza monete e asset fungibili",
      releases: "Release",
      releasesTitle:
        "Visualizza deployment di rete, AIP e release di SDK e strumenti",
      runScript: "Esegui script",
      runScriptTitle: "Crea, simula ed esegui uno script Move (avanzato)",
      settings: "Impostazioni",
      guide: "Guida utente",
    },
  },
  footer: {
    privacy: "Privacy",
    terms: "Termini",
    verification: "Verifica token e indirizzi",
    guide: "Guida utente",
    clearCache: "Svuota cache",
    cacheCleared: "✓ Svuotata",
    clearCacheTitle: "Svuota la cache di ricerca",
    copyrightOwner: "Aptos Labs",
  },
  search: {
    placeholder: "Cerca per indirizzo, txn, blocco, moneta o nome ANS",
    helper:
      "Indirizzo o nome account · Hash o versione txn · Altezza blocco · Tipo moneta · Nome ANS",
    ariaLabel: "cerca",
    type: {
      account: "Account",
      address: "Indirizzo",
      transaction: "Transazione",
      block: "Blocco",
      coin: "Moneta",
      fungibleAsset: "Asset fungibile",
      object: "Oggetto",
      result: "Risultato",
    },
  },
  settings: {
    title: "Impostazioni",
    description:
      "Gestisci le preferenze dell'explorer. Le impostazioni sono salvate localmente nel browser.",
    language: {
      title: "Lingua",
      description:
        "Scegli come l'explorer mostra l'interfaccia, le impostazioni e la guida utente. Il valore predefinito del browser segue la lingua del dispositivo quando esiste una traduzione; altrimenti usa l'inglese. È possibile aggiungere altre lingue come cataloghi senza modificare gli URL delle pagine.",
      label: "Lingua di visualizzazione",
      auto: "Predefinita del browser",
    },
    decompilation: {
      title: "Decompilazione bytecode Move",
      description:
        "Abilita la decompilazione lato client del bytecode Move on-chain in codice sorgente leggibile. Viene eseguita interamente nel browser tramite WebAssembly.",
      ariaLabel: "Abilita la decompilazione del bytecode Move",
      disclaimerTitle: "Avviso — Leggere prima di abilitare",
      disclaimerIntro:
        "L'output decompilato è generato meccanicamente dal bytecode on-chain e **potrebbe non corrispondere** al codice sorgente originale. Nomi di variabili, commenti e alcuni dettagli strutturali vengono persi durante la compilazione e non possono essere recuperati. Abilitando questa funzione riconosci che:",
      bullets: [
        "L'output decompilato è fornito **così com'è, solo a scopo informativo**.",
        "Accetti la responsabilità per come usi l'output decompilato.",
        "L'output non deve essere trattato come il codice sorgente definitivo o autorevole di alcun modulo on-chain.",
      ],
    },
    apiKeys: {
      title: "Sostituzione chiavi API",
      whyAriaLabel: "Perché usare la propria chiave API?",
      popover:
        "L'explorer usa per default una chiave API condivisa di geomi.dev. Aggiungere la propria chiave garantisce un limite di frequenza dedicato, utile se navighi molto o ricevi risposte HTTP 429.",
      popoverManage:
        "Crea e gestisci le chiavi su [geomi.dev](https://geomi.dev).",
      description:
        "Chiavi API geomi.dev opzionali per rete. Usate solo nel browser. Lascia una rete vuota per usare la chiave predefinita della build (se presente). Per default, le sostituzioni sono salvate per la sessione corrente del browser e cancellate al termine della sessione.",
      fieldLabel: "Chiave API {network}",
      fieldPlaceholder: "Incolla la chiave per {network} (opzionale)",
      showKeys: "Mostra chiavi API",
      hideKeys: "Nascondi chiavi API",
      getKey:
        "Non hai una chiave? [Ottienine una su geomi.dev](https://geomi.dev)",
      remember: "Ricorda le chiavi API su questo dispositivo",
      rememberWarning:
        "Ricordare le chiavi le salva nella memoria locale di questo browser. Evita di abilitarlo su dispositivi condivisi o non affidabili.",
      notStored:
        "Le chiavi non sono memorizzate dal server dell'applicazione explorer. Il browser le usa solo per le richieste API lato client. Per la massima sicurezza, usa chiavi client con solo l'origine `https://explorer.aptoslabs.com` abilitata e applicata.",
      refreshNote:
        "I dati esistenti verranno aggiornati dopo il salvataggio così le nuove richieste usano subito le chiavi aggiornate.",
    },
    actions: {
      reset: "Reimposta",
      restoreDefaults: "Ripristina impostazioni predefinite",
      save: "Salva",
    },
    metaDescription:
      "Configura le impostazioni di Aptos Explorer, inclusa la lingua, le chiavi API, le preferenze di decompilazione e altre opzioni.",
  },
  guide: {
    meta: {
      title: "Guida utente",
      description:
        "Come usare Aptos Explorer: ricerca, reti, transazioni, account, moduli, impostazioni e come leggere ciò che vedi.",
      tocLabel: "In questa pagina",
      intro:
        "Questa guida spiega come **usare** Aptos Explorer, come **leggere** le pagine che mostra e come **configurarlo** nel browser. È pensata per chi consulta dati on-chain — non per gestire un nodo o scrivere Move.",
    },
    overview: {
      title: "Cos'è questo explorer",
      paragraphs: [
        "Aptos Explorer è l'**explorer di blocchi** ufficiale della blockchain Aptos. Si usa per consultare transazioni, account, blocchi, validatori, monete, NFT e lo stato della rete. Legge dati pubblici della catena; non custodisce fondi e non è un wallet.",
        "Ogni pagina è legata a una **rete** (mainnet per default). Una transazione o un account su testnet è un oggetto diverso dallo stesso identificatore su mainnet. La rete è salvata nell'URL come `?network=…` così i link copiati mantengono la stessa catena.",
        "L'explorer è un sito web. Collegare un wallet è opzionale e serve solo per azioni come staking, esecuzione di una funzione di modulo o invio di uno script Move.",
      ],
    },
    chrome: {
      title: "Orientarsi",
      paragraphs: [
        "L'**intestazione** è su ogni pagina: logo (home), navigazione principale, selettore di rete, pulsante di condivisione opzionale, [guida utente](/guide), [impostazioni](/settings), tema chiaro/scuro e connessione wallet. Su schermi più piccoli, navigazione, impostazioni, tema e wallet sono nel pulsante menu.",
        "Sotto l'intestazione, la maggior parte delle pagine di dettaglio mostra un controllo **indietro** (se hai cronologia nell'app) e un campo di **ricerca**. La home (`/`) è una superficie di ricerca più ampia con le stesse regole di corrispondenza.",
        "Il **piè di pagina** include Privacy, Termini, [istruzioni per la verifica dei token](/verification), questa guida e **Svuota cache** (cancella la cache dei risultati di ricerca del browser, non la blockchain).",
      ],
      bullets: [
        "**Transazioni** — transazioni utente recenti, con filtri.",
        "**Analisi** — grafici solo su mainnet (TPS, utenti attivi, gas e altro).",
        "**Validatori** — il set di validatori e i pool di delega.",
        "**Blocchi** — ultimi blocchi per altezza.",
        "**Monete** — monete e asset fungibili elencati.",
        "**Release** — versioni di rete live, AIP e release di SDK/CLI.",
        "**Esegui script** — strumento avanzato per simulare e inviare uno script Move grezzo.",
      ],
    },
    search: {
      title: "Ricerca",
      paragraphs: [
        "Digita nella casella di ricerca della [home](/) o nell'intestazione. Non devi scegliere prima un tipo di entità — l'explorer rileva cosa hai inserito.",
        "Puoi anche condividere una ricerca con `/?search={query}` (ad esempio `/?search=0x1`). Se la ricerca nell'URL ha esattamente un risultato chiaro, la ricerca nell'intestazione può portarti lì subito.",
      ],
      bullets: [
        "**Indirizzo account** (incluse forme brevi come `0x1`) — account e, possibilmente, una moneta, metadati di asset fungibile o oggetto Move.",
        "**Nome ANS** che termina in `.apt` (o `.petra`) — si risolve in un account.",
        "**Versione transazione** (un numero) o **hash transazione** (`0x` più 64 caratteri esadecimali).",
        "**Altezza blocco** (un numero nell'intervallo della catena).",
        "**Tipo moneta Move** come `0x1::aptos_coin::AptosCoin`.",
        "**Nome o simbolo token** — corrisponde al set di monete elencate.",
        "**Solo emoji** — cerca i mercati emojicoin quando applicabile.",
      ],
    },
    networks: {
      title: "Reti",
      paragraphs: [
        "Usa il menu a tendina della rete nell'intestazione. I link nell'app mantengono la rete corrente così non torni silenziosamente a mainnet.",
        "**Mainnet** è produzione. **Testnet** e **devnet** sono per lo sviluppo (devnet viene resettata spesso). **Local** parla con un nodo sulla tua macchina (tipicamente `http://127.0.0.1:8080/v1`). Reti nascoste o in anteprima possono comparire quando l'explorer è compilato con un feature flag.",
        "Se selezioni Local e il nodo non è in esecuzione, un modale spiega come avviare `aptos node run-local-testnet` e offre il ritorno a Mainnet.",
        "Alcune funzioni sono solo mainnet (analisi, alcune stime di prezzo, tracce Sentio). Le schede GraphQL/indexer possono mancare su reti che non pubblicano un indexer.",
      ],
    },
    transactions: {
      title: "Leggere una transazione",
      paragraphs: [
        "Apri una transazione su `/txn/{version}` o `/txn/{hash}`. **Versione** è il numero di sequenza del ledger (un intero da 0). **Hash** è l'hash della transazione da 32 byte. La versione è l'identificatore stabile se la hai.",
        "L'[elenco transazioni](/transactions) mostra l'attività recente. **Utente vs Tutte** sceglie le transazioni inviate dagli utenti rispetto al flusso completo (inclusi i metadati di blocco). Puoi filtrare le transazioni utente per funzione di ingresso (`fn_addr`, `fn_module`, `fn_name` nell'URL).",
        "Nella pagina di dettaglio, le schede dipendono dal tipo di transazione:",
      ],
      bullets: [
        "**Panoramica** — stato, mittente, gas, funzione e **Azioni** analizzate (swap, trasferimenti e simili).",
        "**Pagamenti** — mostrata solo quando l'explorer identifica un pagamento (peer-to-peer, salti controllati da partner, trasferimenti confidenziali, wrap/unwrap o gambe di exchange). Gli importi confidenziali restano nascosti.",
        "**Variazione saldo** — differenze di saldo di monete e asset fungibili, incluso il gas.",
        "**Eventi** — log emessi durante l'esecuzione.",
        "**Payload** — il payload inviato (funzione di ingresso, script, multisig e così via).",
        "**Modifiche** — modifiche alle risorse del write-set.",
        "**Moduli** — quando la transazione pubblica o aggiorna pacchetti Move.",
        "**Traccia** — traccia sperimentale delle chiamate Move Sentio su transazioni utente mainnet.",
      ],
      more: [
        "Una transazione fallita esiste comunque on-chain; la panoramica mostra l'errore. Le transazioni in sospeso non sono ancora state ordinate in un blocco.",
        "Se il fullnode di servizio ha **eliminato** la cronologia vecchia, l'explorer riprova un nodo di **archivio**, poi ricostruisce dall'**indexer** se necessario. Le pagine solo indexer possono omettere argomenti del payload, eventi o hash, e mostrano un banner informativo.",
      ],
    },
    accounts: {
      title: "Account, nomi e oggetti",
      paragraphs: [
        "Un **account** è un indirizzo da 32 byte. Aprilo su `/account/{address}`. È accettato hex breve (`0x1`). [Aptos Names](https://aptosnames.com) (`.apt`) si risolvono in indirizzi nella ricerca e nell'intestazione dell'account.",
        "Un **oggetto Move** è una entità on-chain di prima classe che può possedere risorse. Se apri l'indirizzo di un oggetto come account, l'explorer reindirizza a `/object/{address}` con un set di schede simile.",
        "Le schede dell'account includono tipicamente:",
      ],
      bullets: [
        "**Transazioni** — cronologia per questo indirizzo, con paginazione e filtro funzione opzionale.",
        "**Monete** — saldi delle monete (e viste FA correlate dove applicabile).",
        "**Token** — NFT e asset digitali.",
        "**Risorse** — risorse Move memorizzate sotto l'account, come JSON.",
        "**Moduli** — pacchetti pubblicati e codice sorgente (vedi [Moduli](#modules)).",
        "**Multisig** — quando l'account è multisig (può essere offerto l'onboarding Petra Vault).",
        "**Info** — numero di sequenza, chiave di autenticazione e metadati correlati.",
      ],
      more: [
        "Gli indirizzi noti possono mostrare una **etichetta e icona** (exchange, account del framework e così via). Alcuni progetti etichettati mostrano un banner **defunct** o di chiusura — trattalo come avviso, non come consiglio di investimento.",
        "La **scheda saldo** mostra APT. Su mainnet può includere una stima in USD da un feed di prezzo pubblico.",
      ],
    },
    modules: {
      title: "Moduli Move e codice",
      paragraphs: [
        "La scheda Moduli elenca i pacchetti pubblicati da un account o oggetto. Puoi aprire **pacchetti**, **codice** di un modulo, **Esegui** (funzioni di ingresso, wallet richiesto) e **Visualizza** (funzioni view in sola lettura).",
        "Le viste codice includono **Codice sorgente pubblicato** (se il publisher lo ha memorizzato), **ABI** e — se lo abiliti in [Impostazioni](/settings) — bytecode **Decompilato** e **Disassembly**. La decompilazione viene eseguita nel browser (WebAssembly). È una ricostruzione, non i commenti e i nomi originali.",
        "Un **selettore di versione** permette di ispezionare un pacchetto in una transazione di pubblicazione precedente. La vista diff confronta due versioni. I link tra moduli saltano ad altri moduli nello stesso pacchetto quando i nomi si risolvono.",
      ],
    },
    blocks: {
      title: "Blocchi",
      paragraphs: [
        "Aptos raggruppa le transazioni in **blocchi** ordinati per **altezza**. L'[elenco blocchi](/blocks) mostra le altezze recenti. Una pagina blocco (`/block/{height}`) ha **Panoramica** (timestamp, proponente, conteggio transazioni, hash) e **Transazioni** in quel blocco.",
        "I blocchi eliminati seguono lo stesso fallback del nodo di archivio delle transazioni vecchie. La tabella dei blocchi recenti resta nella finestra del fullnode di servizio.",
      ],
    },
    validators: {
      title: "Validatori e staking",
      paragraphs: [
        "La pagina [validatori](/validators) ha **Tutti i nodi** (il set corrente di validatori, potere di voto, posizione se conosciuta) e **Delega** (pool su cui puoi fare stake). Un indicatore di epoch mostra l'epoch corrente.",
        "Apri un pool su `/validator/{address}` per commissione, stake, performance e — se colleghi un wallet con depositi — **I miei depositi** con stake / unstake / restake / prelievo. Su telefono, quelle azioni sono su ogni scheda deposito, non solo nella tabella desktop.",
        "La delega è un'azione di protocollo: consuma gas e usa il wallet. Leggi importi e lockup prima di confermare.",
      ],
    },
    assets: {
      title: "Monete, asset fungibili e NFT",
      paragraphs: [
        "Le **monete (Coins)** sono i tipi Move originali `0x1::coin` (`address::module::Struct`). Gli **asset fungibili (FA)** sono lo standard più recente basato su oggetti. APT esiste in entrambe le viste; molti token più recenti sono solo FA. L'[elenco monete](/coins) mescola monete elencate e FA.",
        "Una pagina moneta è `/coin/{type}` (tipo codificato nell'URL). Una pagina FA è `/fungible_asset/{metadataAddress}`. Le schede includono comunemente **Info**, **Transazioni** e **Detentori** (i detentori richiedono supporto indexer).",
        "NFT e asset digitali usano `/token/{tokenId}` con **Panoramica** e **Attività**. Collezioni bannate o truffa possono essere nascoste o segnalate.",
        "I badge di verifica (nativo, verificato da Labs, community/Panora, riconosciuto, non verificato, bannato) sono spiegati nella pagina di [verifica](/verification). Un badge non garantisce valore o sicurezza.",
      ],
    },
    analytics: {
      title: "Analisi",
      paragraphs: [
        "[Analisi](/analytics) è **solo mainnet**. Le altre reti mostrano un breve messaggio invece dei grafici. I grafici coprono transazioni utente giornaliere, TPS di picco, utenti attivi, nuovi account, deployment, gas e gap tra blocchi. Puoi passare tra intervalli di 7 e 30 giorni.",
        "La striscia in alto riassume supply, stake, TPS e conteggi nodi. I dati provengono da file chain-stats pubblicati più query live sulla catena — possono essere leggermente in ritardo.",
      ],
    },
    releases: {
      title: "Release, AIP e strumenti",
      paragraphs: [
        "L'[hub release](/releases) ha tre schede: **Reti** (epoch, altezza, versioni framework/nodo, feature flag su mainnet, testnet e devnet), **AIP** (Aptos Improvement Proposals dal repository pubblico AIP) e **SDK** (CLI, `aptos-node` e release ufficiali degli SDK).",
        "Gli URL più vecchi `/deployments` e `/aips` reindirizzano qui.",
      ],
    },
    runScript: {
      title: "Esegui script (avanzato)",
      paragraphs: [
        "[Esegui script](/run-script) crea, **simula** ed **esegue** una transazione di **script** Move compilato da un wallet connesso. Gli script non hanno ABI on-chain, quindi devi dichiarare tu i tipi degli argomenti. Non c'è un compilatore Move nel browser — incolla bytecode (hex) da un compilatore di cui ti fidi.",
        "Trattalo come irreversibile una volta eseguito. Leggi sempre la simulazione (stato, gas, eventi, modifiche alle risorse) prima di Esegui. Preferisci la scheda **Esegui** dei Moduli dell'account per le funzioni di ingresso pubblicate.",
      ],
    },
    configure: {
      title: "Configurazione",
      paragraphs: [
        "Apri [Impostazioni](/settings). Le preferenze sono salvate **in questo browser**, non sui server Aptos Labs.",
      ],
      bullets: [
        "**Lingua** — Predefinita del browser o una lingua esplicita. Controlla l'interfaccia tradotta, il testo delle impostazioni e questa guida. I dati on-chain (indirizzi, nomi funzione, eventi) restano come li memorizza la catena.",
        "**Decompilazione bytecode Move** — disattivata per default. Leggi l'avviso prima di abilitarla. Se disattivata, le viste Decompilato e Disassembly sono nascoste.",
        "**Sostituzione chiavi API** — chiavi opzionali [geomi.dev](https://geomi.dev) per rete così il browser non resta bloccato sul limite di frequenza anonimo condiviso. Le chiavi sono inviate come `Authorization: Bearer`. Le chiavi client Geomi `AG-*` devono consentire l'Origin di questo sito. Seleziona **Ricorda su questo dispositivo** solo su una macchina di cui ti fidi; altrimenti le chiavi durano la sessione della scheda.",
        "**Tema** — chiaro o scuro dal controllo sole/luna nell'intestazione. Salvato in un cookie (`color_scheme`) e segue il sistema se non hai scelto.",
        "**Rete** — selettore nell'intestazione; codificata in `?network=` anziché nelle impostazioni.",
      ],
      more: [
        "Salva applica insieme chiavi API e decompilazione (e lingua): i client in cache vengono scartati e le query si aggiornano. **Ripristina impostazioni predefinite** cancella queste preferenze dell'explorer in questo browser.",
        "Se vedi HTTP **429**, il pannello del limite di frequenza può portarti alle Impostazioni. Un corpo Geomi *Per anonymous IP rate limit exceeded* significa che nessuna chiave è stata accettata; *Per application per IP rate limit exceeded* significa che la quota della tua chiave è esaurita.",
      ],
    },
    wallet: {
      title: "Wallet",
      paragraphs: [
        "Collegare un wallet è opzionale. Usalo per aprire rapidamente il tuo account, fare stake, eseguire funzioni di ingresso o inviare uno script. Petra è elencato per primo tra i wallet installabili.",
        "La rete del wallet deve corrispondere alla rete dell'explorer (con una piccola eccezione per alcune configurazioni RPC locali/personalizzate). Reti non corrispondenti bloccano l'invio così non firmi per la catena sbagliata.",
      ],
    },
    verification: {
      title: "Verifica token e indirizzi",
      paragraphs: [
        "L'explorer può mostrare badge di verifica su token e alcuni indirizzi. L'elenco community passa attraverso la [lista token Panora](https://github.com/PanoraExchange/Aptos-Tokens). La verifica Labs è riservata ad asset nativi e token consolidati selezionati.",
        "Le istruzioni passo passo per i team di progetto sono nella pagina [Verifica token e indirizzi](/verification). Gli utenti dovrebbero comunque controllare l'indirizzo tipo/metadati, non solo un nome o icona.",
      ],
    },
    urls: {
      title: "URL, condivisione e agenti",
      paragraphs: [
        "Preferisci **schede basate sul percorso**, ad esempio `/account/0x1/modules` invece di una query `?tab=`. Copia la barra degli indirizzi per condividere una vista; mantieni `?network=` se non sei su mainnet.",
        "I modelli canonici sono documentati per gli utenti qui e per il software in [`/llms.txt`](/llms.txt). Gli agenti nel browser possono usare strumenti WebMCP in sola lettura (ricerca, apri transazione/account/blocco/moneta/release/guida) quando il browser li supporta.",
        "Quando l'explorer è installato come PWA o incorporato (ad esempio Petra Vault), un controllo **Condividi** può comparire nell'intestazione.",
      ],
    },
    glossary: {
      title: "Glossario",
      bullets: [
        "**Indirizzo** — identificatore account o oggetto da 32 byte, hex con `0x`. `0x1` è l'Aptos Framework.",
        "**ANS** — Aptos Name Service. Un nome come `alice.apt` corrisponde a un indirizzo.",
        "**Altezza blocco** — indice di un blocco, a partire da 0.",
        "**Evento** — log strutturato emesso durante l'esecuzione di una transazione.",
        "**Asset fungibile (FA)** — standard di token fungibile basato su oggetti (indirizzo oggetto metadati).",
        "**Gas** — commissione per esecuzione e storage, pagata in APT (octas sotto il cofano).",
        "**Indexer** — API GraphQL Aptos Labs usata per cronologia, detentori e alcune schede. Non tutte le reti ne hanno una.",
        "**Modulo** — codice Move pubblicato. Un **pacchetto** raggruppa i moduli.",
        "**Oggetto** — entità on-chain con il proprio indirizzo che può contenere risorse.",
        "**Octa** — 10⁻⁸ APT. 1 APT = 100.000.000 octas.",
        "**Risorsa** — dati Move tipizzati memorizzati sotto un account o oggetto.",
        "**Numero di sequenza** — contatore per account che ordina le transazioni di quell'account.",
        "**Versione transazione** — versione globale del ledger (intero) assegnata quando una transazione viene ordinata.",
        "**Write-set / modifiche** — stato scritto dalla transazione.",
      ],
    },
    troubleshooting: {
      title: "Risoluzione problemi",
      bullets: [
        "**Pagine vuote o in caricamento** — controlla il selettore di rete e se sei su Local senza un nodo. Prova un'altra rete o attendi un 429.",
        "**Transazione non trovata** — conferma versione/hash e rete. Versioni molto vecchie possono caricarsi da archivio/indexer con meno campi.",
        "**Ricerca non ha trovato un hash eliminato** — la ricerca per hash usa il fullnode poi l'archivio (senza la chiave API dell'explorer). L'indexer non può cercare per hash.",
        "**Decompilato / Disassembly mancante** — abilita la decompilazione in [Impostazioni](/settings) e accetta l'avviso.",
        "**Catena sbagliata** — guarda `?network=` e il menu a tendina nell'intestazione.",
        "**Risultati di ricerca obsoleti** — **Svuota cache** nel piè di pagina.",
        "**Analisi mancante** — passa a mainnet.",
        "**Il wallet non invia** — allinea la rete del wallet a quella dell'explorer; riconnetti dopo il cambio.",
      ],
    },
  },
} as const satisfies MessageTree;

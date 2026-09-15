import type {EnglishMessages} from "./en";

export const zu = {
  chrome: {
    skipToContent: "Yeqela uye kokuthile okuyinhloko",
    appName: "Aptos Explorer",
    appNameShort: "Explorer",
    navAriaLabel: "Ukuzulazula okuyinhloko",
    overflowMenuAriaLabel: "Imenyu yokuzulazula",
    openSettings: "Vula izilungiselelo",
    openGuide: "Vula umhlahlandlela womsebenzisi",
    switchToLight: "Shintshela kwimodi yokukhanya",
    switchToDark: "Shintshela kwimodi emnyama",
    nav: {
      transactions: "Ukuthengiselana",
      transactionsTitle: "Buka konke ukuthengiselana",
      analytics: "Ukuhlaziya",
      analyticsTitle: "Buka ukuhlaziya kwenethiwekhi",
      validators: "Abaqinisekisi",
      validatorsTitle: "Buka bonke abaqinisekisi",
      blocks: "Amabhulokhi",
      blocksTitle: "Buka amabhulokhi amasha",
      coins: "Izinhlamvu zemali",
      coinsTitle: "Buka izinhlamvu zemali nezimpahla ezifakwayo",
      releases: "Ukukhishwa",
      releasesTitle:
        "Buka ukusakazwa kwenethiwekhi, ama-AIP, nokukhishwa kwe-SDK nezinsiza",
      runScript: "Qalisa i-Script",
      runScriptTitle:
        "Yakha, Linganisa, futhi Uqalise i-Move Script (Okuthuthukile)",
      settings: "Izilungiselelo",
      guide: "Umhlahlandlela Womsebenzisi",
    },
  },
  footer: {
    privacy: "Ubumfihlo",
    terms: "Imigomo",
    verification: "Ukuqinisekisa Izinhlamvu Zemali Nekheli",
    guide: "Umhlahlandlela Womsebenzisi",
    clearCache: "Sula i-Cache",
    cacheCleared: "✓ Kusuliwe",
    clearCacheTitle: "Sula i-cache yokusesha",
    copyrightOwner: "Aptos Labs",
  },
  search: {
    placeholder:
      "Sesha ngekheli, i-txn, ibhulokhi, inhlamvu yemali, noma igama le-ANS",
    helper:
      "Ikheli le-akhawunti noma igama · I-hash ye-txn noma inguqulo · Ubude bebhulokhi · Uhlobo lwenhlamvu yemali · Igama le-ANS",
    ariaLabel: "sesha",
    type: {
      account: "I-akhawunti",
      address: "Ikheli",
      transaction: "Ukuthengiselana",
      block: "Ibhulokhi",
      coin: "Inhlamvu yemali",
      fungibleAsset: "Impahla Efakwayo",
      object: "Into",
      result: "Umphumela",
    },
  },
  settings: {
    title: "Izilungiselelo",
    description:
      "Phatha izintandokazi zakho ze-explorer. Izilungiselelo zigcinwa endaweni kusiphequluli sakho.",
    language: {
      title: "Ulimi",
      description:
        "Khetha ukuthi i-explorer ibonisa kanjani ingxenye yokusebenza, izilungiselelo, nomhlahlandlela womsebenzisi. Okuzenzakalelayo kwesiphequluli kulandela ulimi lwedivayisi yakho uma kukhona ukuhumusha, futhi uma kungenjalo kusetshenziswa isiNgisi. Izilimi ezengeziwe zingangezwa njengamakhasalo ngaphandle kokushintsha ama-URL ekhhasi.",
      label: "Ulimi lokubonisa",
      auto: "Okuzenzakalelayo kwesiphequluli",
    },
    decompilation: {
      title: "Ukuhumusha i-Move Bytecode",
      description:
        "Nika amandla ukuhumusha kwe-bytecode ye-Move esiqeshini kube umthombo ofundekayo ngabantu. Kwenziwa ngokuphelele kusiphequluli sakho nge-WebAssembly.",
      ariaLabel: "Nika amandla ukuhumusha kwe-bytecode ye-Move",
      disclaimerTitle:
        "Isitatimende — Sicela ufunde ngaphambi kokunika amandla",
      disclaimerIntro:
        "Okukhiphayo okuhumushiwe kukhiqizwa ngokwemishini kusuka ku-bytecode esiqeshini futhi **kungase kungafani** nomthombo wokuqala. Amagama ezinto, amazwana, nezinye izici zesakhiwo zilahleka ngesikhathi sokuhlanganisa futhi azikwazi ukubuyiselwa. Ngokunika amandla lesi sici uyaqinisekisa ukuthi:",
      bullets: [
        "Okukhiphayo okuhumushiwe kunikezwa **njengoba kungukuthi ngezinjongo zolwazi kuphela**.",
        "Uyamukela umthwalo wokusebenzisa okukhiphayo okuhumushiwe.",
        "Okukhiphayo akufanele kubhekwe njengomthombo oqinisekile noma osemthethweni womthombo we-module esiqeshini.",
      ],
    },
    apiKeys: {
      title: "Ukushintsha Okhiye be-API",
      whyAriaLabel: "Kungani usebenzise ukhiye wakho we-API?",
      popover:
        "I-explorer isebenzisa ukhiye we-API ohlwane we-geomi.dev ngokuzenzakalelayo. Ukwengeza ukhiye wakho kukunikeza umkhawulo oqondile, okusiza uma ubhrawuza kakhulu noma uthola izimpendulo ze-HTTP 429.",
      popoverManage:
        "Dala uphathwe amakhiye ku-[geomi.dev](https://geomi.dev).",
      description:
        "Amakhiye e-API e-geomi.dev angokukhetha ngenethiwekhi. Asetshenziswa kuphela kusiphequluli sakho. Shiya inethiwekhi ingenalutho ukuze usebenzise ukhiye ozenzakalelayo osuka ekwakhiweni (uma kukhona). Ngokuzenzakalelayo, ukushintsha kugcinwa iseshini yamanje yesiphequluli futhi kusulwa lapho iseshini iphela.",
      fieldLabel: "Ukhiye we-API we-{network}",
      fieldPlaceholder: "Namathisela ukhiye we-{network} (okukhethwayo)",
      showKeys: "Bonisa amakhiye e-API",
      hideKeys: "Fihla amakhiye e-API",
      getKey: "Awunawo ukhiye? [Thola eyodwa ku-geomi.dev](https://geomi.dev)",
      remember: "Khumbula amakhiye e-API kule divayisi",
      rememberWarning:
        "Ukukhumbula amakhiye kugcina amakhiye endaweni yokugcina yalesi siphequluli. Gwema ukunika amandla lokhu kumadivayisi ahlwane noma angathembekile.",
      notStored:
        "Amakhiye awagcinwa yiseva yohlelo lwe-explorer. Isiphequluli sakho awasebenzisi kuphela ezicelweni ze-API zehlangothini lomsebenzisi. Ukuze uthole ukuphepha okungcono, sebenzisa amakhiye omsebenzisi anokuvumela kuphela i-Origin `https://explorer.aptoslabs.com` futhi aqiniswe.",
      refreshNote:
        "Idatha ekhona izovuselelwa ngemva kokulondoloza ukuze izicelo ezintsha zisebenzise amakhiye avuselelwe ngokushesha.",
    },
    actions: {
      reset: "Setha kabusha",
      restoreDefaults: "Buyisela Okumisiwe",
      save: "Londoloza",
    },
    metaDescription:
      "Lungisa izilungiselelo ze-Aptos Explorer kufaka phakathi ulimi, amakhiye e-API, izintandokazi zokuhumusha, nezinye izinketho.",
  },
  guide: {
    meta: {
      title: "Umhlahlandlela Womsebenzisi",
      description:
        "Indlela yokusebenzisa i-Aptos Explorer: ukusesha, amanethiwekhi, ukuthengiselana, ama-akhawunti, ama-module, izilungiselelo, nokufunda okubonayo.",
      tocLabel: "Kuleli khasi",
      intro:
        "Lo mhlahlandlela uchaza ukuthi **usebenzisa kanjani** i-Aptos Explorer, **ufunda kanjani** amakhasi ayibonisa, futhi **uyilungiselela kanjani** kusiphequluli sakho. Kubhalwe abantu ababheka idatha esiqeshini — hhayi abaphatha i-node noma ababhala i-Move.",
    },
    overview: {
      title: "Yini le explorer",
      paragraphs: [
        "I-Aptos Explorer iyi-**block explorer** esemthethweni ye-Aptos blockchain. Uyisebenzisa ukubheka ukuthengiselana, ama-akhawunti, amabhulokhi, abaqinisekisi, izinhlamvu zemali, ama-NFT, nesimo senethiwekhi. Ifunda idatha yochungechunge oluvulelekile; ayithathi impahla futhi ayisiyona i-wallet.",
        "Ikhasi ngalinye lihlanganiswe ne-**nethiwekhi** (i-mainnet ngokuzenzakalelayo). Ukuthengiselana noma i-akhawunti ku-testnet yinto ehlukile kunaleyo enomhloli ofanayo ku-mainnet. Inethiwekhi igcinwa ku-URL njenge-`?network=…` ukuze izixhumanisi ozikopisha zihlale zisebenzisa uchungechunge olufanayo.",
        "I-explorer iyiwebhusayithi. Ukuxhuma i-wallet kuyokukhetha futhi kudingeka kuphela ezintweni ezifana nokubeka isitoko, ukuqalisa umsebenzi we-module, noma ukuthumela i-Move script.",
      ],
    },
    chrome: {
      title: "Ukuzulazula",
      paragraphs: [
        "I-**header** ikuwo wonke amakhasi: ilogo (ekhaya), ukuzulazula okuyinhloko, isikhethi senethiwekhi, inkinobho yokwabelana engokukhethwayo, [umhlahlandlela womsebenzisi](/guide), [izilungiselelo](/settings), itimu ekhanyayo/emnyama, nokuxhuma i-wallet. Kumasikrini amancane, ukuzulazula, izilungiselelo, itimu, ne-wallet zisesigabeni semenyu.",
        "Ngaphansi kwe-header, amakhasi amaningi okwemininingwane abonisa isilawuli se-**emuva** (uma unomlando wohlelo) kanye nesikhala se-**ukusesha**. Ikhasi lasekhaya (`/`) siyindawo enkulu yokusesha ngemigomo efanayo.",
        "I-**footer** inezigaba ze-Privacy, Terms, [iziqondiso zokuqinisekisa izinhlamvu zemali](/verification), lo mhlahlandlela, kanye ne-**Clear Cache** (isula i-cache yemiphumela yokusesha yesiphequluli, hhayi i-blockchain).",
      ],
      bullets: [
        "**Ukuthengiselana** — ukuthengiselana kwakamuva komsebenzisi, kunezihlungi.",
        "**Ukuhlaziya** — amashadi we-mainnet kuphela (i-TPS, abasebenzisi abasebenzayo, i-gas, nokuningi).",
        "**Abaqinisekisi** — isethi yabaqinisekisi namachibi okubeka isitoko.",
        "**Amabhulokhi** — amabhulokhi amasha ngobude.",
        "**Izinhlamvu zemali** — izinhlamvu zemali ezibhalisiwe nezimpahla ezifakwayo.",
        "**Ukukhishwa** — izinguqulo zanethiwekhi ezibukhoma, ama-AIP, nokukhishwa kwe-SDK/CLI.",
        "**Run Script** — ithuluzi elithuthukile lokulinganisa nokuthumela i-Move script eyi-raw.",
      ],
    },
    search: {
      title: "Ukusesha",
      paragraphs: [
        "Thayipha ebhokisini lokusesha ku-[ikhasi lasekhaya](/) noma ku-header. Akudingeki ukhethe uhlobo lwento kuqala — i-explorer ithola okufakile.",
        "Ungabelana nokusesha nge-`/?search={query}` (isibonelo `/?search=0x1`). Uma ukusesha kwe-URL kunomphumela owodwa ocacile, ukusesha kwe-header kungakuthatha lapho ngokushesha.",
      ],
      bullets: [
        "**Ikheli le-akhawunti** (kufaka nezifinyezo ezifana no-`0x1`) — i-akhawunti, futhi kungenzeka inhlamvu yemali, imethadatha ye-fungible asset, noma into ye-Move.",
        "**Igama le-ANS** eliphela ngo-`.apt` (noma `.petra`) — lixhumanisa ne-akhawunti.",
        "**Inguqulo yokuthengiselana** (inombolo) noma **i-hash yokuthengiselana** (`0x` kanye nezinhlamvu ze-hex eziyi-64).",
        "**Ubude bebhulokhi** (inombolo esigabeni sochungechunge).",
        "**Uhlobo lwenhlamvu yemali ye-Move** olufana no-`0x1::aptos_coin::AptosCoin`.",
        "**Igama noma uphawu lwenhlamvu yemali** — lihambisana nesethi yezinhlamvu zemali ezibhalisiwe.",
        "**Umbhalo one-emoji kuphela** — ubheka izimakethe ze-emojicoin lapho kufanele.",
      ],
    },
    networks: {
      title: "Amanethiwekhi",
      paragraphs: [
        "Sebenzisa i-dropdown yenethiwekhi ku-header. Izixhumanisi zohlelo zigcina inethiwekhi yakho yamanje ukuze ungabuyeli ngokushelela ku-mainnet.",
        "**I-Mainnet** iyimvelo. **I-Testnet** ne-**devnet** zenzelwe ukuthuthukisa (i-devnet ivuselelwa kaningi). **I-Local** ixhumana ne-node kumshini wakho (ngokuvamile `http://127.0.0.1:8080/v1`). Amanethiwekhi afihliwe noma okubukwayo angavela uma i-explorer yakhiwe nge-feature flag.",
        "Uma ukhetha i-Local kanti i-node ayisebenzi, i-modal ichaza indlela yokuqalisa `aptos node run-local-testnet` futhi inikeza ukushintshela ku-Mainnet.",
        "Ezinye izici zingeyi-mainnet kuphela (ukuhlaziya, ezinye izilinganiso zentengo, ama-Sentio traces). Amathebhu e-GraphQL/indexer angase angabi khona kumanethiwekhi angashicileli i-indexer.",
      ],
    },
    transactions: {
      title: "Ukufunda ukuthengiselana",
      paragraphs: [
        "Vula ukuthengiselana ku-`/txn/{version}` noma `/txn/{hash}`. **Inguqulo** inombolo yochungechunge (inombolo ephelele kusukela ku-0). **I-hash** iyi-hash yokuthengiselana yama-byte angu-32. Inguqulo isihlonzi esiqinile uma uyithola.",
        "Uhlu [lokuthengiselana](/transactions) lubonisa umsebenzi wakamuva. **Umsebenzisi vs Konke** kukhetha ukuthengiselana okuthunyelwe umsebenzisi uma kuqhathaniswa nomfulo ophelele (kufaka nemethadatha yebhulokhi). Ungahlunga ukuthengiselana komsebenzisi ngomsebenzi wokungena (`fn_addr`, `fn_module`, `fn_name` ku-URL).",
        "Kukhasi lokwemininingwane, amathebhu avela ngokuya ngohlobo lokuthengiselana:",
      ],
      bullets: [
        "**Uhlolojikelele** — isimo, umthumeli, i-gas, umsebenzi, ne-**Actions** ehlaziyiwe (ukushintshanisa, ukudlulisa, nokunjalo).",
        "**Izinkokhelo** — iboniswa kuphela uma i-explorer ithola inkokhelo (phakathi kwabantu, izinyathelo eziphethwe ngabalingani, ukudlulisa okuyimfihlo, ukufaka/kukhipha, noma izinyathelo zokushintshanisa). Izinkokhelo eziyimfihlo zihlala zifihliwe.",
        "**Ukushintsha Kwebhalansi** — umehluko webhalansi yezinhlamvu zemali nezimpahla ezifakwayo, kufaka ne-gas.",
        "**Imicimbi** — amalogi akhishwe ngesikhathi sokusebenza.",
        "**I-Payload** — i-payload ethunyelwe (umsebenzi wokungena, i-script, i-multisig, njll.).",
        "**Izinguquko** — izinguquko zezinsiza ze-write-set.",
        "**Ama-Module** — uma ukuthengiselana kushicilela noma kuthuthukisa amaphakheji e-Move.",
        "**I-Trace** — i-Sentio Move call trace yokuhlola ku-mainnet ukuthengiselana komsebenzisi.",
      ],
      more: [
        "Ukuthengiselana okuhlulekile kusakhona esiqeshini; uhlolojikelele lubonisa iphutha. Ukuthengiselana okusalindile akukahlelelwa kuyo ibhulokhi.",
        "Uma i-fullnode enikezayo **isihlafuze** umlando omdala, i-explorer iphinda izame i-node ye-**archive**, bese yakha kabusha kusuka ku-**indexer** uma kudingeka. Amakhasi e-indexer kuphela angase angabi nezimpikiswano ze-payload, imicimbi, noma ama-hash, futhi abonisa ibhanela lolwazi.",
      ],
    },
    accounts: {
      title: "Ama-akhawunti, amagama, nezinto",
      paragraphs: [
        "I-**akhawunti** iyi-address yama-byte angu-32. Ivule ku-`/account/{address}`. I-hex esifushane (`0x1`) iyamukelwa. [Aptos Names](https://aptosnames.com) (`.apt`) zixhumanisa nama-address ekusesheni nasenhlokweni ye-akhawunti.",
        "I-**into ye-Move** iyinto esiqeshini eyinhloko engaba nezinsiza. Uma uvula ikheli lento njenge-akhawunti, i-explorer iqondisa ku-`/object/{address}` ngamasethi amathebhu afanayo.",
        "Amathebhu e-akhawunti avame ukufaka:",
      ],
      bullets: [
        "**Ukuthengiselana** — umlando waleli kheli, kune-pagination kanye nohlunga lomsebenzi ongokukhethwayo.",
        "**Izinhlamvu zemali** — izibalansi zezinhlamvu zemali (kanye nezibukwane ze-FA lapho kufanele).",
        "**Ama-Token** — ama-NFT nezimpahla zedijithali.",
        "**Izinsiza** — izinsiza ze-Move ezigcinwe ngaphansi kwe-akhawunti, njenge-JSON.",
        "**Ama-Module** — amaphakheji ashicilelwe nomthombo (bheka [Ama-Module](#modules)).",
        "**I-Multisig** — uma i-akhawunti yi-multisig (ukungena kwe-Petra Vault kungase kunikezwe).",
        "**Ulwazi** — inombolo yochungechunge, ukhiye wokuqinisekisa, nemethadatha ehlobene.",
      ],
      more: [
        "Amakheli aziwayo angabonisa **ilebula ne-icon** (izimakethe zokushintshanisa, ama-akhawunti e-framework, njll.). Eminye imiklamo enelebula ingabonisa ibhanela **defunct** noma yokuyeka — libheke njengesixwayiso, hhayi iseluleko sokutshala imali.",
        "I-**khadi lebhalansi** libonisa i-APT. Ku-mainnet lingafaka isilinganiso se-USD kusuka ekuphakeleni kwentengo yomphakathi.",
      ],
    },
    modules: {
      title: "Ama-module e-Move nokhodi",
      paragraphs: [
        "Ithebhu ye-Modules ibala amaphakheji ashicilelwe yi-akhawunti noma into. Ungavula **amaphakheji**, **ikhodi** ye-module, **Run** (imisebenzi yokungena, kudingeka i-wallet), kanye ne-**View** (imisebenzi yokubuka yokufunda kuphela).",
        "Izibukwane zekhodi zifaka **Published Source** (uma umshicileli uwugcine), **ABI**, futhi — uma ukhetha ngaphansi kwe-[Settings](/settings) — i-bytecode **ehumushiwe** ne-**Disassembly**. Ukuhumusha kwenziwa kusiphequluli sakho (WebAssembly). Kuyakhiwa kabusha, hhayi amazwana namagama wokuqala.",
        "Isikhethi **sezinguqulo** sikuvumela ukubheka iphakheji ekuthengiselaneni kokushicilela kwangaphambilini. Ukubuka okuhlukile kuqhathanisa izinguqulo ezimbili. Izixhumanisi zama-module ziyeqela kuma-module amanye kuphakheji lapho amagama axazulula.",
      ],
    },
    blocks: {
      title: "Amabhulokhi",
      paragraphs: [
        "I-Aptos ihlanganisa ukuthengiselana kuma-**bhulokhi** ahlelwe nge-**ubude**. Uhlu [lamabhulokhi](/blocks) lubonisa ubude bakamuva. Ikhasi lebhulokhi (`/block/{height}`) line-**Overview** (isikhathi, umqambi, inani lokuthengiselana, ama-hash) ne-**Transactions** kulelo bhulokhi.",
        "Amabhulokhi asihlafuziwe alandela ukubuyela kwe-archive node njengokuthengiselana okudala. Itafula lamabhulokhi amasha lihlala kuwindi le-fullnode enikezayo.",
      ],
    },
    validators: {
      title: "Abaqinisekisi nokubeka isitoko",
      paragraphs: [
        "Ikhasi [labaqinisekisi](/validators) line-**All Nodes** (isethi yamanje yabaqinisekisi, amandla okuvota, indawo lapho kaziwa) ne-**Delegation** (amachibi ongabeka kuzo isitoko). Isibonisi se-epoch sibonisa i-epoch yamanje.",
        "Vula ichibi ku-`/validator/{address}` ukuze uthole ikhomishini, isitoko, ukusebenza, futhi — uma uxhuma i-wallet enezimali ezifakiwe — **My Deposits** nokubeka isitoko / ukukhipha isitoko / ukubeka kabusha / ukukhipha. Kufoni, lezo zenzo zikukhasi ngalinye lokufaka, hhayi etafuleni le-desktop kuphela.",
        "Ukubeka isitoko kuyisenzo se-protocol: sichitha i-gas futhi sisebenzisa i-wallet yakho. Funda izinkokhelo nesikhathi sokukhiya ngaphambi kokuqinisekisa.",
      ],
    },
    assets: {
      title: "Izinhlamvu zemali, izimpahla ezifakwayo, nama-NFT",
      paragraphs: [
        "**Izinhlamvu zemali** ziyizinhlobo ze-Move `0x1::coin` (`address::module::Struct`). **Izimpahla ezifakwayo (FA)** yistandatha entsha esekelwe ezintweni. I-APT ikhona kuzo zombili; ama-token amaningi amasha angama-FA kuphela. Uhlu [lwezinhlamvu zemali](/coins) luhlanganisa izinhlamvu zemali ezibhalisiwe nama-FA.",
        "Ikhasi lenhlamvu yemali lingu-`/coin/{type}` (uhlobo olufakwe ku-URL). Ikhasi le-FA lingu-`/fungible_asset/{metadataAddress}`. Amathebhu avame ukufaka **Info**, **Transactions**, ne-**Holders** (ababambi badinga ukwesekwa kwe-indexer).",
        "Ama-NFT nezimpahla zedijithali asebenzisa `/token/{tokenId}` ne-**Overview** ne-**Activities**. Amaqoqo avinjelwe noma okukhwabanisa angase afihlwe noma aphawulwe.",
        "Amabheji okuqinisekisa (okuzalwa, i-Labs iqinisekisiwe, umphakathi/Panora, aziwayo, aqaqambisiwe, avinjelwe) achazwa ekhasini [lokuqinisekisa](/verification). Ibheji aliqinisekisi inani noma ukuphepha.",
      ],
    },
    analytics: {
      title: "Ukuhlaziya",
      paragraphs: [
        "[Ukuhlaziya](/analytics) **kuyi-mainnet kuphela**. Amanye amanethiwekhi abonisa umlayezo omfushane esikhundleni samashadi. Amashadi abhekwa ukuthengiselana komsebenzisi nsuku zonke, i-TPS ephakeme, abasebenzisi abasebenzayo, ama-akhawunti amasha, ukusakazwa, i-gas, kanye nesikhala samabhulokhi. Ungashintsha izikhathi zezinsuku ezingu-7 nezingu-30.",
        "Umqulu phezulu ufingqa ukuphakelwa, isitoko, i-TPS, nenombolo yama-node. Idatha ivela kumafayela we-chain-stats ashicilelwe kanye nezicelo zochungechunge ezibukhoma — ingase ibe neqhaza elincane.",
      ],
    },
    releases: {
      title: "Ukukhishwa, ama-AIP, nezinsiza",
      paragraphs: [
        "Isikhungo [sokukhishwa](/releases) sinezithebhu ezintathu: **Networks** (i-epoch, ubude, izinguqulo ze-framework/node, ama-feature flag ku-mainnet, testnet, ne-devnet), **AIPs** (Aptos Improvement Proposals kusuka kurepository ye-AIP yomphakathi), ne-**SDKs** (i-CLI, `aptos-node`, nokukhishwa kwe-SDK esemthethweni).",
        "Ama-URL amadala `/deployments` ne-`/aips` aqondisa lapha.",
      ],
    },
    runScript: {
      title: "Run Script (okuthuthukile)",
      paragraphs: [
        "[Run Script](/run-script) yakha, **ilinganisa**, futhi **iqalise** ukuthengiselana kwe-Move **script** ehlanganisiwe kusuka kwi-wallet exhunyiwe. Ama-script awanayo i-ABI esiqeshini, ngakho kufanele uzichaze izinhlobo zezimpikiswano. Ayikho i-Move compiler kusiphequluli — namathisela i-bytecode (hex) kusuka kumshini wokuhlanganisa owethembayo.",
        "Libheke njengokungaphethwa ngemva kokusebenza. Funda ngokucophelela ukulinganisa (isimo, i-gas, imicimbi, izinguquko zezinsiza) ngaphambi koku-Execute. Khetha ithebhu ye-Modules **Run** yemisebenzi yokungena eshicilelwe.",
      ],
    },
    configure: {
      title: "Ukulungisa",
      paragraphs: [
        "Vula [Settings](/settings). Izintandokazi zigcinwa **kulesi siphequluli**, hhayi kumaseva e-Aptos Labs.",
      ],
      bullets: [
        "**Ulimi** — Okuzenzakalelayo kwesiphequluli noma ulimi olucacile. Lokhu kulawula ingxenye yokusebenza ehumushiwe, umbhalo wezilungiselelo, kanye nalo mhlahlandlela. Idatha esiqeshini (amakheli, amagama emisebenzi, imicimbi) ihlala njengoba igcinwe ochungechungeni.",
        "**Ukuhumusha kwe-Move bytecode** — kuvaliwe ngokuzenzakalelayo. Funda isitatimende ngaphambi kokunika amandla. Uma kuvaliwe, izibukwane ze-Decompiled ne-Disassembly ziyafihlwa.",
        "**Ukushintsha okhiye be-API** — amakhiye e-[geomi.dev](https://geomi.dev) angokukhethwayo ngenethiwekhi ukuze isiphequluli sakho singasebenzi ngomkhawulo ohlwane ongaziwa. Amakhiye athunyelwa njenge-`Authorization: Bearer`. Amakhiye omsebenzisi e-Geomi `AG-*` kufanele avumele i-Origin yale sayithi. Khetha **Remember on this device** kuphela kumshini owethembayo; uma kungenjalo amakhiye aphila iseshini yethebhu.",
        "**Itimu** — ekhanyayo noma emnyama kusilawuli se-ilanga/inyanga ku-header. Igcinwa ku-cookie (`color_scheme`) futhi ilandela isistimu uma ungakakhethi.",
        "**Inethiwekhi** — isikhethi se-header; ifakwe ku-`?network=` kunokuba kuzilungiselelo.",
      ],
      more: [
        "Londoloza usebenzisa amakhiye e-API nokuhumusha (nolimi) ndawonye: amaklayenti ageqiwe asuswa nezicelo zivuselelwa. **Restore Defaults** isula lezi zintandokazi ze-explorer kulesi siphequluli.",
        "Uma ubona i-HTTP **429**, idrawer yomkhawulo ingakuthumela ku-Settings. Umzimba we-Geomi othi *Per anonymous IP rate limit exceeded* kusho ukuthi akukho ukhiye owamukelwe; *Per application per IP rate limit exceeded* kusho ukuthi umkhawulo wokhiye wakho ufinyelelwe.",
      ],
    },
    wallet: {
      title: "I-Wallet",
      paragraphs: [
        "Ukuxhuma i-wallet kuyokukhetha. Yisebenzise ukuvula i-akhawunti yakho ngokushesha, ukubeka isitoko, ukuqalisa imisebenzi yokungena, noma ukuthumela i-script. I-Petra ibhalwe phambili phakathi kwama-wallet angafakwa.",
        "Inethiwekhi ye-wallet kufanele ihambisane nenethiwekhi ye-explorer (nge-exception encane ezimeni ezithile ze-local/custom RPC). Amanethiwekhi angahambisani avimba ukuthumela ukuze ungavumi ngokuchungechunge olungalungile.",
      ],
    },
    verification: {
      title: "Ukuqinisekisa izinhlamvu zemali namakheli",
      paragraphs: [
        "I-explorer ingabonisa amabheji okuqinisekisa kuma-token namanye amakheli. Ukubhaliswa komphakathi kuya ku-[Panora token list](https://github.com/PanoraExchange/Aptos-Tokens). Ukuqinisekisa kwe-Labs kugodliwe kwezimpahla ezizalwayo nama-token akhethiwe asekhona.",
        "Izinyathelo ezinyakazelwe kumiqembu yemiklamo ziku-[Token & Address Verification](/verification). Abasebenzisi kufanele bahlale babheka uhlobo/ikheli lemethadatha, hhayi igama noma i-icon kuphela.",
      ],
    },
    urls: {
      title: "Ama-URL, ukwabelana, nama-ejenti",
      paragraphs: [
        "Khetha **amathebhu asekelwe endleleni**, isibonelo `/account/0x1/modules` kunokuba u-`?tab=` query. Kopisha ibha yekheli ukuze wabelane ngokubuka; gcina `?network=` uma ungekho ku-mainnet.",
        "Izifanekiso ezisemthethweni zibhalwe abantu lapha futhi isofthiwe ku-[`/llms.txt`](/llms.txt). Ama-ejenti angasebenzisa amathuluzi e-WebMCP okufunda kuphela (ukusesha, vula ukuthengiselana/akhawunti/ibhulokhi/inhlamvu yemali/ukukhishwa/umhlahlandlela) uma isiphequluli sisekela lokho.",
        "Uma i-explorer ifakwe njenge-PWA noma ifakwe ngaphakathi (isibonelo i-Petra Vault), isilawuli se-**Share** singavela ku-header.",
      ],
    },
    glossary: {
      title: "Isichazamazwi",
      bullets: [
        "**Ikheli** — isihlonzi se-akhawunti noma into sama-byte angu-32, i-hex ene-`0x`. `0x1` yi-Aptos Framework.",
        "**ANS** — Aptos Name Service. Igama elifana no-`alice.apt` lihambisana nekheli.",
        "**Ubude bebhulokhi** — inombolo yebhulokhi, iqala ku-0.",
        "**Umcimbi** — ilogi ehlelekile ekhishwa ngesikhathi sokuthengiselana.",
        "**Impahla efakwayo (FA)** — istandatha ye-token efakwayo esekelwe ezintweni (ikheli lento lemethadatha).",
        "**I-Gas** — inkokhelo yokusebenza nokugcina, ikhokhelwa nge-APT (ama-octas ngaphakathi).",
        "**I-Indexer** — i-API ye-GraphQL ye-Aptos Labs esetshenziselwa umlando, ababambi, namanye amathebhu. Akuyona yonke inethiwekhi enayo.",
        "**I-Module** — ikhodi ye-Move eshicilelwe. **Iphakheji** lihlanganisa ama-module.",
        "**Into** — into esiqeshini enekheli layo elingabamba izinsiza.",
        "**I-Octa** — 10⁻⁸ APT. 1 APT = 100,000,000 ama-octas.",
        "**Insiza** — idatha ye-Move enohlobo egcinwe ngaphansi kwe-akhawunti noma into.",
        "**Inombolo yochungechunge** — isibali esisebenza kwe-akhawunti ngayinye esihlela ukuthengiselana kwaleyo akhawunti.",
        "**Inguqulo yokuthengiselana** — inguqulo yochungechunge lomhlaba (inombolo ephelele) enikezwa lapho ukuthengiselana kuhlelwa.",
        "**I-write-set / izinguquko** — isimo okuthengiselana okubhale kuso.",
      ],
    },
    troubleshooting: {
      title: "Ukuxazulula izinkinga",
      bullets: [
        "**Amakhasi angenalutho noma aphendulayo** — hlola isikhethi senethiwekhi nokuthi usebenzisa i-Local ngaphandle kwe-node. Zama enye inethiwekhi noma linda i-429.",
        "**Ukuthengiselana akutholakali** — qinisekisa inguqulo/i-hash nenethiwekhi. Izinguqulo ezindala kakhulu zingalayishwa kusuka ku-archive/indexer ngezinkambu ezimbalwa.",
        "**Ukusesha akutholanga i-hash esihlafuziwe** — ukubheka i-hash kusebenzisa i-fullnode bese i-archive (ngaphandle kwe-API key ye-explorer). I-indexer ayikwazi ukusesha nge-hash.",
        "**I-Decompiled / Disassembly ayikho** — nika amandla ukuhumusha ku-[Settings](/settings) futhi wamukele isitatimende.",
        "**I-chain engalungile** — bheka `?network=` nesikhethi se-header.",
        "**Imiphumela yokusesha esidala** — i-footer **Clear Cache**.",
        "**Ukuhlaziya akukho** — shintshela ku-mainnet.",
        "**I-wallet ayithumeli** — hambisa inethiwekhi ye-wallet ne-explorer; xhuma kabusha ngemva kokushintsha.",
      ],
    },
  },
} as const satisfies EnglishMessages;

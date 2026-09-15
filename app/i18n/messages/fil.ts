import type {MessageTree} from "../translate";

export const fil = {
  chrome: {
    skipToContent: "Lumaktaw sa pangunahing nilalaman",
    appName: "Aptos Explorer",
    appNameShort: "Explorer",
    navAriaLabel: "Pangunahing nabigasyon",
    overflowMenuAriaLabel: "Menu ng nabigasyon",
    openSettings: "Buksan ang mga setting",
    openGuide: "Buksan ang gabay ng user",
    switchToLight: "Lumipat sa light mode",
    switchToDark: "Lumipat sa dark mode",
    nav: {
      transactions: "Mga transaksyon",
      transactionsTitle: "Tingnan ang lahat ng transaksyon",
      analytics: "Analytics",
      analyticsTitle: "Tingnan ang analytics ng network",
      validators: "Mga validator",
      validatorsTitle: "Tingnan ang lahat ng validator",
      blocks: "Mga block",
      blocksTitle: "Tingnan ang pinakabagong mga block",
      coins: "Mga coin",
      coinsTitle: "Tingnan ang mga coin at fungible asset",
      releases: "Mga release",
      releasesTitle:
        "Tingnan ang mga deployment ng network, AIP, at mga release ng SDK at tool",
      runScript: "Patakbuhin ang script",
      runScriptTitle:
        "Bumuo, i-simulate, at isagawa ang isang Move script (advanced)",
      settings: "Mga setting",
      guide: "Gabay ng user",
    },
  },
  footer: {
    privacy: "Privacy",
    terms: "Mga tuntunin",
    verification: "Beripikasyon ng token at address",
    guide: "Gabay ng user",
    clearCache: "I-clear ang cache",
    cacheCleared: "✓ Na-clear",
    clearCacheTitle: "I-clear ang cache ng paghahanap",
    copyrightOwner: "Aptos Labs",
  },
  search: {
    placeholder: "Maghanap ayon sa address, txn, block, coin, o ANS name",
    helper:
      "Address o pangalan ng account · Txn hash o version · Block height · Uri ng coin · ANS name",
    ariaLabel: "paghahanap",
    type: {
      account: "Account",
      address: "Address",
      transaction: "Transaksyon",
      block: "Block",
      coin: "Coin",
      fungibleAsset: "Fungible asset",
      object: "Object",
      result: "Resulta",
    },
  },
  settings: {
    title: "Mga setting",
    description:
      "Pamahalaan ang iyong mga kagustuhan sa explorer. Naka-store ang mga setting sa iyong browser.",
    language: {
      title: "Wika",
      description:
        "Piliin kung paano ipinapakita ng explorer ang chrome, mga setting, at ang gabay ng user. Sinusunod ng default ng browser ang wika ng device kapag may pagsasalin, at gumagamit ng English kung wala. Maaaring magdagdag ng higit pang wika bilang catalog nang hindi binabago ang mga URL ng page.",
      label: "Wika ng display",
      auto: "Default ng browser",
    },
    decompilation: {
      title: "Decompilation ng Move bytecode",
      description:
        "I-enable ang client-side decompilation ng on-chain Move bytecode tungo sa nababasang source. Tumatakbo nang buo sa iyong browser sa pamamagitan ng WebAssembly.",
      ariaLabel: "I-enable ang decompilation ng Move bytecode",
      disclaimerTitle: "Disclaimer — Pakibasa bago i-enable",
      disclaimerIntro:
        "Ang na-decompile na output ay mekanikal na nabubuo mula sa on-chain bytecode at **maaaring hindi tumugma** sa orihinal na source code. Nawawala ang mga pangalan ng variable, komento, at ilang detalye ng istruktura sa compilation at hindi na mababawi. Sa pag-enable ng feature na ito, kinikilala mong:",
      bullets: [
        "Ang na-decompile na output ay ibinibigay **as-is para sa impormasyon lamang**.",
        "Tinatanggap mo ang responsibilidad kung paano mo gagamitin ang na-decompile na output.",
        "Hindi dapat ituring ang output bilang pinal o awtoritatibong source code ng anumang on-chain module.",
      ],
    },
    apiKeys: {
      title: "Mga override ng API key",
      whyAriaLabel: "Bakit gagamit ng sarili mong API key?",
      popover:
        "Gumagamit ang explorer ng shared geomi.dev API key bilang default. Ang pagdagdag ng sarili mong key ay nagbibigay ng dedicated rate limit, na nakakatulong kung madalas kang mag-browse o makatanggap ng HTTP 429.",
      popoverManage:
        "Gumawa at mag-manage ng mga key sa [geomi.dev](https://geomi.dev).",
      description:
        "Opsyonal na geomi.dev API key bawat network. Ginagamit lang sa iyong browser. Iwanang blangko ang isang network para gamitin ang default key mula sa build (kung meron). Bilang default, naka-store ang mga override para sa kasalukuyang session ng browser at naa-clear kapag natapos ang session.",
      fieldLabel: "API key ng {network}",
      fieldPlaceholder: "I-paste ang key para sa {network} (opsyonal)",
      showKeys: "Ipakita ang mga API key",
      hideKeys: "Itago ang mga API key",
      getKey: "Wala pang key? [Kumuha sa geomi.dev](https://geomi.dev)",
      remember: "Tandaan ang mga API key sa device na ito",
      rememberWarning:
        "Ang pag-alala ng mga key ay nag-iimbak nito sa local storage ng browser. Iwasang i-enable ito sa shared o hindi pinagkakatiwalaang device.",
      notStored:
        "Hindi iniimbak ng application server ng explorer ang mga key. Ginagamit lang ng browser ang mga ito para sa client-side API request. Para sa mas magandang seguridad, gumamit ng client key na naka-enable at naka-enforce lang ang origin na `https://explorer.aptoslabs.com`.",
      refreshNote:
        "Magre-refresh ang umiiral na data pagkatapos mag-save para agad magamit ng mga bagong request ang na-update na key.",
    },
    actions: {
      reset: "I-reset",
      restoreDefaults: "Ibalik ang mga default",
      save: "I-save",
    },
    metaDescription:
      "I-configure ang mga setting ng Aptos Explorer kabilang ang wika, API key, kagustuhan sa decompilation, at iba pang opsyon.",
  },
  guide: {
    meta: {
      title: "Gabay ng user",
      description:
        "Paano gamitin ang Aptos Explorer: paghahanap, mga network, transaksyon, account, module, setting, at paano basahin ang nakikita mo.",
      tocLabel: "Sa page na ito",
      intro:
        "Ipinapaliwanag ng gabay na ito kung paano **gamitin** ang Aptos Explorer, kung paano **basahin** ang mga page nito, at kung paano ito **i-configure** sa iyong browser. Para sa mga tumitingin ng on-chain data — hindi para magpatakbo ng node o magsulat ng Move.",
    },
    overview: {
      title: "Ano ang explorer na ito",
      paragraphs: [
        "Ang Aptos Explorer ay ang opisyal na **block explorer** para sa Aptos blockchain. Ginagamit ito para tumingin ng transaksyon, account, block, validator, coin, NFT, at status ng network. Nagbabasa ito ng pampublikong data ng chain; hindi ito nag-iingat ng pondo at hindi ito wallet.",
        "Ang bawat page ay naka-scope sa isang **network** (mainnet bilang default). Ang transaksyon o account sa testnet ay ibang object kaysa sa parehong identifier sa mainnet. Naka-store ang network sa URL bilang `?network=…` para manatili sa parehong chain ang mga link na kokopyahin mo.",
        "Website ang explorer. Opsyon ang pagkonekta ng wallet at kailangan lang para sa mga aksyon gaya ng staking, pagpapatakbo ng module function, o pag-submit ng Move script.",
      ],
    },
    chrome: {
      title: "Paano maglibot",
      paragraphs: [
        "Nasa bawat page ang **header**: logo (home), pangunahing nabigasyon, network selector, opsyonal na share button, [gabay ng user](/guide), [mga setting](/settings), light/dark theme, at wallet connect. Sa mas maliliit na screen, nasa menu button ang nabigasyon, setting, theme, at wallet.",
        "Sa ilalim ng header, karamihan ng detail page ay may **back** control (kapag may in-app history) at **search** field. Ang home page (`/`) ay mas malaking search surface na may parehong matching rules.",
        "Ang **footer** ay may Privacy, Mga tuntunin, [mga tagubilin sa beripikasyon ng token](/verification), ang gabay na ito, at **I-clear ang cache** (nililinis ang cache ng resulta ng paghahanap sa browser, hindi ang blockchain).",
      ],
      bullets: [
        "**Mga transaksyon** — mga kamakailang user transaction, na may filter.",
        "**Analytics** — mga chart sa mainnet lang (TPS, aktibong user, gas, at iba pa).",
        "**Mga validator** — ang validator set at mga delegation pool.",
        "**Mga block** — pinakabagong block ayon sa height.",
        "**Mga coin** — listed na coin at fungible asset.",
        "**Mga release** — live na bersyon ng network, AIP, at SDK/CLI release.",
        "**Patakbuhin ang script** — advanced na tool para i-simulate at i-submit ang raw Move script.",
      ],
    },
    search: {
      title: "Paghahanap",
      paragraphs: [
        "Mag-type sa search box sa [home page](/) o sa header. Hindi mo kailangang pumili muna ng uri ng entity — tinutukoy ng explorer ang iyong inilagay.",
        "Maaari mo ring i-share ang paghahanap gamit ang `/?search={query}` (halimbawa `/?search=0x1`). Kung ang URL search ay may eksaktong isang malinaw na resulta, maaaring dalhin ka agad doon ng header search.",
      ],
      bullets: [
        "**Address ng account** (kabilang ang maikling anyo gaya ng `0x1`) — account, at posibleng coin, fungible-asset metadata, o Move object.",
        "**ANS name** na nagtatapos sa `.apt` (o `.petra`) — niresolba tungo sa account.",
        "**Transaction version** (numero) o **transaction hash** (`0x` plus 64 hex character).",
        "**Block height** (numero sa range ng chain).",
        "**Uri ng Move coin** gaya ng `0x1::aptos_coin::AptosCoin`.",
        "**Pangalan o simbolo ng token** — tumutugma sa listed na set ng coin.",
        "**Text na emoji lang** — tumitingin ng emojicoin market kapag naaangkop.",
      ],
    },
    networks: {
      title: "Mga network",
      paragraphs: [
        "Gamitin ang network dropdown sa header. Pinapanatili ng in-app na link ang iyong kasalukuyang network para hindi ka tahimik na bumalik sa mainnet.",
        "Ang **Mainnet** ay production. Ang **Testnet** at **devnet** ay para sa development (madalas i-reset ang devnet). Nakikipag-usap ang **Local** sa node sa iyong machine (karaniwang `http://127.0.0.1:8080/v1`). Maaaring lumabas ang hidden o preview network kapag naka-build ang explorer na may feature flag.",
        "Kung pipiliin mo ang Local at hindi tumatakbo ang node, ipinapaliwanag ng modal kung paano simulan ang `aptos node run-local-testnet` at nag-aalok na bumalik sa Mainnet.",
        "Ang ilang feature ay mainnet lang (analytics, ilang pagtatantya ng presyo, Sentio traces). Maaaring mawala ang GraphQL/indexer tab sa network na walang indexer.",
      ],
    },
    transactions: {
      title: "Pagbasa ng transaksyon",
      paragraphs: [
        "Buksan ang transaksyon sa `/txn/{version}` o `/txn/{hash}`. Ang **Version** ay ang ledger sequence number (integer mula 0). Ang **Hash** ay ang 32-byte transaction hash. Ang version ang stable identifier kung meron ka nito.",
        "Ipinapakita ng [listahan ng transaksyon](/transactions) ang kamakailang aktibidad. Pinipili ng **User vs All** ang user-submitted na transaksyon laban sa buong stream (kasama ang block metadata). Maaari mong i-filter ang user transaction ayon sa entry function (`fn_addr`, `fn_module`, `fn_name` sa URL).",
        "Sa detail page, nakadepende ang mga tab sa uri ng transaksyon:",
      ],
      bullets: [
        "**Overview** — status, sender, gas, function, at na-parse na **Actions** (swap, transfer, at katulad).",
        "**Payments** — ipinapakita lang kapag may natukoy na bayad ang explorer (peer-to-peer, partner-controlled hops, confidential transfer, wrap/unwrap, o exchange legs). Nakatago ang confidential na amount.",
        "**Balance Change** — pagkakaiba sa coin at fungible-asset balance, kasama ang gas.",
        "**Events** — log na inilabas habang nagsasagawa.",
        "**Payload** — ang isinumiteng payload (entry function, script, multisig, at iba pa).",
        "**Changes** — mga pagbabago sa write-set resource.",
        "**Modules** — kapag nag-publish o nag-upgrade ang transaksyon ng Move package.",
        "**Trace** — experimental Sentio Move call trace sa mainnet user transaction.",
      ],
      more: [
        "Umiiral pa rin sa chain ang nabigong transaksyon; ipinapakita ng overview ang error. Hindi pa naka-order sa block ang pending na transaksyon.",
        "Kung **na-prune** ng serving fullnode ang lumang history, sinusubukan muli ng explorer ang **archive** node, pagkatapos ay muling binubuo mula sa **indexer** kung kailangan. Maaaring tanggalin ng indexer-only na page ang payload argument, event, o hash, at may info banner.",
      ],
    },
    accounts: {
      title: "Mga account, pangalan, at object",
      paragraphs: [
        "Ang **account** ay 32-byte address. Buksan ito sa `/account/{address}`. Tinatanggap ang maikling hex (`0x1`). Niresolba ng [Aptos Names](https://aptosnames.com) (`.apt`) ang mga pangalan tungo sa address sa paghahanap at sa header ng account.",
        "Ang **Move object** ay first-class na on-chain entity na maaaring magmay-ari ng resource. Kung bubuksan mo ang object address bilang account, ireredirect ka ng explorer sa `/object/{address}` na may katulad na set ng tab.",
        "Karaniwang kasama sa mga tab ng account ang:",
      ],
      bullets: [
        "**Mga transaksyon** — history para sa address na ito, may pagination at opsyonal na function filter.",
        "**Mga coin** — coin balance (at kaugnay na FA view kung naaangkop).",
        "**Mga token** — NFT at digital asset.",
        "**Mga resource** — Move resource na naka-store sa ilalim ng account, bilang JSON.",
        "**Mga module** — nai-publish na package at source (tingnan ang [Modules](#modules)).",
        "**Multisig** — kapag multisig ang account (maaaring i-alok ang Petra Vault onboarding).",
        "**Info** — sequence number, authentication key, at kaugnay na metadata.",
      ],
      more: [
        "Maaaring magpakita ang kilalang address ng **label at icon** (exchange, framework account, at iba pa). Ang ilang labeled na proyekto ay may **defunct** o winding-down na banner — ituring itong babala, hindi payo sa pamumuhunan.",
        "Ipinapakita ng **balance card** ang APT. Sa mainnet maaari itong maglaman ng USD estimate mula sa pampublikong price feed.",
      ],
    },
    modules: {
      title: "Mga Move module at code",
      paragraphs: [
        "Inililista ng Modules tab ang mga package na inilathala ng account o object. Maaari mong buksan ang **packages**, **code** para sa module, **Run** (entry function, kailangan ang wallet), at **View** (read-only view function).",
        "Kasama sa code view ang **Published Source** (kung iniimbak ito ng publisher), **ABI**, at — kapag nag-opt in ka sa [Settings](/settings) — **Decompiled** bytecode at **Disassembly**. Tumatakbo ang decompilation sa iyong browser (WebAssembly). Rekonstruksyon ito, hindi ang orihinal na komento at pangalan.",
        "Hinahayaan ka ng **version selector** na suriin ang package sa mas naunang publish transaction. Ikinukumpara ng diff view ang dalawang bersyon. Tumatalon ang cross-module link sa ibang module sa parehong package kapag naresolba ang mga pangalan.",
      ],
    },
    blocks: {
      title: "Mga block",
      paragraphs: [
        "Pinapangkat ng Aptos ang mga transaksyon sa **block** na naka-order ayon sa **height**. Ipinapakita ng [listahan ng block](/blocks) ang mga kamakailang height. Ang block page (`/block/{height}`) ay may **Overview** (timestamp, proposer, bilang ng transaksyon, hash) at **Mga transaksyon** sa block na iyon.",
        "Sinusunod ng pruned block ang parehong archive-node fallback gaya ng lumang transaksyon. Nananatili ang recent-blocks table sa serving fullnode window.",
      ],
    },
    validators: {
      title: "Mga validator at staking",
      paragraphs: [
        "Ang page ng [validators](/validators) ay may **All Nodes** (kasalukuyang validator set, voting power, lokasyon kung kilala) at **Delegation** (mga pool na puwedeng i-stake). Ipinapakita ng epoch indicator ang kasalukuyang epoch.",
        "Buksan ang pool sa `/validator/{address}` para sa commission, stake, performance, at — kung magkokonekta ka ng wallet na may deposito — **My Deposits** na may stake / unstake / restake / withdraw. Sa telepono, nasa bawat deposit card ang mga aksyong iyon, hindi lang sa desktop table.",
        "Protocol action ang delegation: gumagastos ito ng gas at gumagamit ng iyong wallet. Basahin ang mga amount at lockup bago kumpirmahin.",
      ],
    },
    assets: {
      title: "Mga coin, fungible asset, at NFT",
      paragraphs: [
        "Ang **Coins** ay ang orihinal na Move `0x1::coin` na uri (`address::module::Struct`). Ang **Fungible assets (FA)** ay ang mas bagong object-based na standard. Umiiral ang APT sa parehong view; maraming mas bagong token ay FA lang. Hinalo ng [listahan ng coin](/coins) ang listed na coin at FA.",
        "Ang coin page ay `/coin/{type}` (URL-encoded na uri). Ang FA page ay `/fungible_asset/{metadataAddress}`. Karaniwang kasama sa mga tab ang **Info**, **Mga transaksyon**, at **Holders** (kailangan ng indexer support ang holders).",
        "Gumagamit ang NFT at digital asset ng `/token/{tokenId}` na may **Overview** at **Activities**. Maaaring itago o i-flag ang banned o scam collection.",
        "Ipinaliliwanag ang verification badge (native, Labs verified, community/Panora, recognized, unverified, banned) sa page ng [verification](/verification). Hindi garantiya ng halaga o kaligtasan ang badge.",
      ],
    },
    analytics: {
      title: "Analytics",
      paragraphs: [
        "Ang [Analytics](/analytics) ay **mainnet lang**. Ang ibang network ay nagpapakita ng maikling mensahe sa halip na chart. Saklaw ng chart ang pang-araw-araw na user transaction, peak TPS, aktibong user, bagong account, deployment, gas, at block gap. Maaari kang lumipat sa 7-araw vs 30-araw na range.",
        "Binubuod ng strip sa itaas ang supply, stake, TPS, at bilang ng node. Galing ang data sa nai-publish na chain-stats file at live na query sa chain — maaaring bahagyang mahuli.",
      ],
    },
    releases: {
      title: "Mga release, AIP, at tool",
      paragraphs: [
        "Ang [releases hub](/releases) ay may tatlong tab: **Networks** (epoch, height, bersyon ng framework/node, feature flag sa mainnet, testnet, at devnet), **AIPs** (Aptos Improvement Proposals mula sa pampublikong AIP repository), at **SDKs** (CLI, `aptos-node`, at opisyal na SDK release).",
        "Nireredirect dito ang lumang URL na `/deployments` at `/aips`.",
      ],
    },
    runScript: {
      title: "Patakbuhin ang script (advanced)",
      paragraphs: [
        "Bumubuo, **nagsi-simulate**, at **nagsasagawa** ang [Run Script](/run-script) ng compiled Move **script** transaction mula sa nakakonektang wallet. Walang on-chain ABI ang script, kaya kailangan mong ideklara mismo ang mga uri ng argument. Walang in-browser Move compiler — i-paste ang bytecode (hex) mula sa compiler na pinagkakatiwalaan mo.",
        "Ituring itong hindi na mababawi kapag naisagawa. Palaging basahin ang simulation (status, gas, event, resource change) bago i-Execute. Mas gusto ang **Run** tab ng account Modules para sa nai-publish na entry function.",
      ],
    },
    configure: {
      title: "Configuration",
      paragraphs: [
        "Buksan ang [Settings](/settings). Naka-store ang mga kagustuhan **sa browser na ito**, hindi sa server ng Aptos Labs.",
      ],
      bullets: [
        "**Wika** — Default ng browser o tahasang wika. Kinokontrol nito ang isinaling chrome, kopya ng setting, at ang gabay na ito. Nananatili ang on-chain data (address, pangalan ng function, event) ayon sa pagkaka-store sa chain.",
        "**Decompilation ng Move bytecode** — naka-off bilang default. Basahin ang disclaimer bago i-enable. Kapag naka-off, nakatago ang Decompiled at Disassembly view.",
        "**Mga override ng API key** — opsyonal na [geomi.dev](https://geomi.dev) key bawat network para hindi maipit ang browser sa shared anonymous rate limit. Ipinapadala ang key bilang `Authorization: Bearer`. Dapat payagan ng Geomi `AG-*` client key ang Origin ng site na ito. I-check ang **Tandaan sa device na ito** sa makina lang na pinagkakatiwalaan mo; kung hindi, tumatagal ang key sa tab session.",
        "**Theme** — light o dark mula sa sun/moon control sa header. Naka-store sa cookie (`color_scheme`) at sumusunod sa system kung hindi ka pa pumili.",
        "**Network** — selector sa header; naka-encode sa `?network=` sa halip na sa setting.",
      ],
      more: [
        "Inilalapat ng Save ang API key at decompilation (at wika) nang magkasama: ibinabagsak ang cached client at magre-refresh ang query. Nililinis ng **Ibalik ang mga default** ang mga kagustuhan ng explorer sa browser na ito.",
        "Kung makakita ka ng HTTP **429**, maaaring dalhin ka ng rate-limit drawer sa Settings. Ang Geomi body na *Per anonymous IP rate limit exceeded* ay nangangahulugang walang tinanggap na key; *Per application per IP rate limit exceeded* ay nangangahulugang naabot ang quota ng iyong key.",
      ],
    },
    wallet: {
      title: "Wallet",
      paragraphs: [
        "Opsyon ang pagkonekta ng wallet. Gamitin ito para mabilis na buksan ang iyong account, mag-stake, magpatakbo ng entry function, o mag-submit ng script. Nakauna ang Petra sa mga mai-install na wallet.",
        "Dapat tumugma ang network ng wallet sa network ng explorer (may maliit na exception para sa ilang local/custom RPC setup). Hinaharang ng hindi magkatugmang network ang pag-submit para hindi ka pumirma para sa maling chain.",
      ],
    },
    verification: {
      title: "Beripikasyon ng token at address",
      paragraphs: [
        "Maaaring magpakita ang explorer ng verification badge sa token at ilang address. Dumadaan ang community listing sa [Panora token list](https://github.com/PanoraExchange/Aptos-Tokens). Nakalaan ang Labs verification para sa native asset at piling established token.",
        "Nasa page ng [Token & Address Verification](/verification) ang sunud-sunod na tagubilin para sa mga project team. Dapat pa ring suriin ng mga user ang type/metadata address, hindi lang pangalan o icon.",
      ],
    },
    urls: {
      title: "Mga URL, pagbabahagi, at agent",
      paragraphs: [
        "Mas gusto ang **path-based na tab**, halimbawa `/account/0x1/modules` sa halip na `?tab=` query. Kopyahin ang address bar para i-share ang view; panatilihin ang `?network=` kung wala ka sa mainnet.",
        "Naka-dokumento ang canonical template para sa tao dito at para sa software sa [`/llms.txt`](/llms.txt). Maaaring gumamit ang in-browser agent ng read-only WebMCP tool (search, open transaction/account/block/coin/releases/guide) kapag sinusuportahan ito ng browser.",
        "Kapag naka-install ang explorer bilang PWA o naka-embed (halimbawa Petra Vault), maaaring lumabas ang **Share** control sa header.",
      ],
    },
    glossary: {
      title: "Talasalitaan",
      bullets: [
        "**Address** — 32-byte na identifier ng account o object, hex na may `0x`. Ang `0x1` ay ang Aptos Framework.",
        "**ANS** — Aptos Name Service. Ang pangalan gaya ng `alice.apt` ay nagma-map sa address.",
        "**Block height** — index ng block, nagsisimula sa 0.",
        "**Event** — structured log na inilabas habang tumatakbo ang transaksyon.",
        "**Fungible asset (FA)** — object-based na fungible token standard (metadata object address).",
        "**Gas** — bayad para sa execution at storage, binabayaran sa APT (octa sa ilalim).",
        "**Indexer** — GraphQL API ng Aptos Labs na ginagamit para sa history, holders, at ilang tab. Hindi lahat ng network ay mayroon nito.",
        "**Module** — nai-publish na Move code. Ang **package** ay nagpapangkat ng module.",
        "**Object** — on-chain entity na may sariling address na maaaring maghawak ng resource.",
        "**Octa** — 10⁻⁸ APT. 1 APT = 100,000,000 octa.",
        "**Resource** — typed Move data na naka-store sa ilalim ng account o object.",
        "**Sequence number** — counter bawat account na nag-o-order ng transaksyon ng account na iyon.",
        "**Transaction version** — global ledger version (integer) na itinatalaga kapag na-order ang transaksyon.",
        "**Write-set / changes** — estado na isinulat ng transaksyon.",
      ],
    },
    troubleshooting: {
      title: "Pag-troubleshoot",
      bullets: [
        "**Walang laman o umiikot na page** — tingnan ang network selector at kung nasa Local ka nang walang node. Subukan ang ibang network o hintayin ang 429.",
        "**Hindi nahanap ang transaksyon** — kumpirmahin ang version/hash at network. Maaaring mag-load ang napakalumang version mula sa archive/indexer na may mas kaunting field.",
        "**Hindi nahanap ng search ang pruned hash** — gumagamit ang hash lookup ng fullnode tapos archive (nang walang explorer API key). Hindi makakapaghanap ang indexer ayon sa hash.",
        "**Nawawala ang Decompiled / Disassembly** — i-enable ang decompilation sa [Settings](/settings) at tanggapin ang disclaimer.",
        "**Maling chain** — tingnan ang `?network=` at ang dropdown sa header.",
        "**Lumang search hit** — **I-clear ang cache** sa footer.",
        "**Nawawala ang analytics** — lumipat sa mainnet.",
        "**Hindi mag-submit ang wallet** — itugma ang network ng wallet sa explorer; mag-reconnect pagkatapos magpalit.",
      ],
    },
  },
} as const satisfies MessageTree;

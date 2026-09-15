import type {MessageTree} from "../translate";

export const ha = {
  chrome: {
    skipToContent: "Tsallake zuwa babban abun ciki",
    appName: "Aptos Explorer",
    appNameShort: "Bincike",
    navAriaLabel: "Babban kewayawa",
    overflowMenuAriaLabel: "Menu na kewayawa",
    openSettings: "Buɗe saituna",
    openGuide: "Buɗe jagorar mai amfani",
    switchToLight: "Canja zuwa yanayin haske",
    switchToDark: "Canja zuwa yanayin duhu",
    nav: {
      transactions: "Ma'amaloli",
      transactionsTitle: "Duba duk ma'amaloli",
      analytics: "Nazari",
      analyticsTitle: "Duba nazarin hanyar sadarwa",
      validators: "Masu tabbatarwa",
      validatorsTitle: "Duba duk masu tabbatarwa",
      blocks: "Buloli",
      blocksTitle: "Duba sabbin buloli",
      coins: "Tsabar kuɗi",
      coinsTitle: "Duba tsabar kuɗi da kadarorin da za a iya musayawa",
      releases: "Saki",
      releasesTitle:
        "Duba sakon hanyar sadarwa, AIP, da saki na SDK da kayan aiki",
      runScript: "Gudanar da Script",
      runScriptTitle:
        "Gina, yi kwatance, da aiwatar da script na Move (na ci gaba)",
      settings: "Saituna",
      guide: "Jagorar mai amfani",
    },
  },
  footer: {
    privacy: "Keɓancewa",
    terms: "Sharuɗɗi",
    verification: "Tabbatar da token da adireshi",
    guide: "Jagorar mai amfani",
    clearCache: "Share cache",
    cacheCleared: "✓ An share",
    clearCacheTitle: "Share cache na bincike",
    copyrightOwner: "Aptos Labs",
  },
  search: {
    placeholder: "Bincika ta adireshi, txn, bulo, tsabar kuɗi, ko sunan ANS",
    helper:
      "Adireshin asusun ko suna · Hash ko sigar txn · Tsayin bulo · Nau'in tsabar kuɗi · Sunan ANS",
    ariaLabel: "bincike",
    type: {
      account: "Asusun",
      address: "Adireshi",
      transaction: "Ma'amala",
      block: "Bulo",
      coin: "Tsabar kuɗi",
      fungibleAsset: "Kadari mai musayawa",
      object: "Abu",
      result: "Sakamako",
    },
  },
  settings: {
    title: "Saituna",
    description:
      "Sarrafa abubuwan da kuka fi so na bincike. Ana adana saituna a cikin burauzar ku.",
    language: {
      title: "Harshe",
      description:
        "Zaɓi yadda bincike ke nuna fuska, saituna, da jagorar mai amfani. Na asalin burauza yana bin harshen na'urar ku idan akwai fassara, in ba haka ba ana amfani da Turanci. Ana iya ƙara wasu harsuna a matsayin katalogi ba tare da canza URL ɗin shafuka ba.",
      label: "Harshen nuni",
      auto: "Na asalin burauza",
    },
    decompilation: {
      title: "Cire bytecode na Move",
      description:
        "Kunna cire bytecode na Move na kan sarkar zuwa tushen lamba mai karantawa. Yana gudana gaba ɗaya a cikin burauzar ku ta WebAssembly.",
      ariaLabel: "Kunna cire bytecode na Move",
      disclaimerTitle: "Gargadi — Da fatan za a karanta kafin kunna",
      disclaimerIntro:
        "Abin da aka cire ana samar da shi ta atomatik daga bytecode na kan sarkar kuma **zai iya bambanta** da tushen lamba na asali. Sunayen canji, sharhi, da wasu bayanan tsari sun ɓace yayin tarawa kuma ba za a iya dawo da su ba. Ta hanyar kunna wannan fasalin kun yarda cewa:",
      bullets: [
        "Abin da aka cire ana bayar da shi **kamar yadda yake don dalilai na bayanai kawai**.",
        "Kun karɓi alhakin yadda kuke amfani da abin da aka cire.",
        "Ba a kamata a ɗauki abin da aka cire a matsayin tushen lamba na ƙarshe ko na hukuma ga kowane module na kan sarkar.",
      ],
    },
    apiKeys: {
      title: "Canza maɓallin API",
      whyAriaLabel: "Me yasa ku yi amfani da maɓallin API naku?",
      popover:
        "Bincike yana amfani da maɓallin API na geomi.dev da aka raba a tsohuwa. Ƙara maɓallin ku yana ba ku iyakar saurin da aka keɓe, wanda ke taimakawa idan kuna bincike sosai ko kuka ci matsalar HTTP 429.",
      popoverManage:
        "Ƙirƙira kuma sarrafa maɓalli a [geomi.dev](https://geomi.dev).",
      description:
        "Maɓallan API na geomi.dev na zaɓi ga kowace hanyar sadarwa. Ana amfani da su a cikin burauzar ku kawai. Bar hanyar sadarwa babu komai don amfani da maɓallin tsohuwa daga gini (idan akwai). A tsohuwa, ana adana canje-canje don zaman burauza na yanzu kuma ana share su lokacin da zaman ya ƙare.",
      fieldLabel: "Maɓallin API na {network}",
      fieldPlaceholder: "Manna maɓalli don {network} (na zaɓi)",
      showKeys: "Nuna maɓallan API",
      hideKeys: "Ɓoye maɓallan API",
      getKey: "Ba ku da maɓalli? [Samu ɗaya a geomi.dev](https://geomi.dev)",
      remember: "Tuna maɓallan API a wannan na'urar",
      rememberWarning:
        "Tuna maɓalli yana adana su a cikin ajiyar gida na wannan burauza. Guji kunna wannan a kan na'urori da aka raba ko waɗanda ba a amince da su ba.",
      notStored:
        "Bincike ba ya adana maɓalli a uwar garken manhaja. Burauzar ku tana amfani da su don buƙatun API na gefe na abokin ciniki kawai. Don tsaro mafi kyau, yi amfani da maɓallan abokin ciniki tare da asalin `https://explorer.aptoslabs.com` kawai da aka kunna kuma aka tilasta.",
      refreshNote:
        "Bayanan da ke akwai za su sabunta bayan ajiyewa don buƙatun sababbi su yi amfani da sabbin maɓalli nan take.",
    },
    actions: {
      reset: "Sake saita",
      restoreDefaults: "Mayar da tsohuwa",
      save: "Ajiye",
    },
    metaDescription:
      "Sanya saitunan Aptos Explorer ciki har da harshe, maɓallan API, abubuwan da kuka fi so na cire lamba, da sauran zaɓuɓɓuka.",
  },
  guide: {
    meta: {
      title: "Jagorar mai amfani",
      description:
        "Yadda ake amfani da Aptos Explorer: bincike, hanyoyin sadarwa, ma'amaloli, asusuna, module, saituna, da yadda ake karanta abin da kuke gani.",
      tocLabel: "A wannan shafin",
      intro:
        "Wannan jagora yana bayyana yadda ake **amfani** da Aptos Explorer, yadda ake **karanta** shafukan da yake nuna, da yadda ake **saita** shi a cikin burauzar ku. An rubuta shi don mutanen da ke neman bayanan kan sarkar — ba don gudanar da node ko rubuta Move.",
    },
    overview: {
      title: "Menene wannan bincike",
      paragraphs: [
        "Aptos Explorer shi ne **binciken sarkar** na hukuma don blockchain na Aptos. Kuna amfani da shi don neman ma'amaloli, asusuna, buloli, masu tabbatarwa, tsabar kuɗi, NFT, da matsayin hanyar sadarwa. Yana karanta bayanan sarkar na jama'a; baya riƙe kuɗi kuma ba walat ba ne.",
        "Kowane shafi yana da iyaka ga **hanyar sadarwa** (mainnet a tsohuwa). Ma'amala ko asusun a kan testnet abu ne daban daga mai iri ɗaya a kan mainnet. Ana adana hanyar sadarwa a cikin URL a matsayin `?network=…` don hanyoyin haɗi da kuka kwafa su riƙe sarkar iri ɗaya.",
        "Bincike gidan yanar gizo ne. Haɗa walat na zaɓi ne kuma ana buƙata ne kawai don ayyuka kamar staking, gudanar da aikin module, ko ƙaddamar da script na Move.",
      ],
    },
    chrome: {
      title: "Nemo hanyar ku",
      paragraphs: [
        "**Shugaban shafi** yana kan kowane shafi: tambari (gida), babban kewayawa, mai zaɓar hanyar sadarwa, maɓallin raba na zaɓi, [jagorar mai amfani](/guide), [saituna](/settings), jigo mai haske/duhu, da haɗin walat. A kan allon ƙarami, kewayawa, saituna, jigo, da walat suna cikin maɓallin menu.",
        "Ƙarƙashin shugaban shafi, yawancin shafukan cikakken bayani suna nuna maɓallin **komawa** (idan kuna da tarihi a cikin manhaja) da filin **bincike**. Shafin gida (`/`) babban filin bincike ne tare da ƙa'idodin daidaitawa iri ɗaya.",
        "**Ƙasan shafi** yana da Keɓancewa, Sharuɗɗi, [umarnin tabbatar da token](/verification), wannan jagora, da **Share Cache** (yana share cache na sakamakon bincike na burauza, ba sarkar ba).",
      ],
      bullets: [
        "**Ma'amaloli** — sabbin ma'amalolin masu amfani, tare da tacewa.",
        "**Nazari** — zane-zane na mainnet kawai (TPS, masu amfani masu aiki, gas, da sauransu).",
        "**Masu tabbatarwa** — saitin masu tabbatarwa da tafkin delegation.",
        "**Buloli** — sabbin buloli bisa tsayi.",
        "**Tsabar kuɗi** — tsabar kuɗi da kadarorin da za a iya musayawa.",
        "**Saki** — sigogin hanyar sadarwa masu aiki, AIP, da saki na SDK/CLI.",
        "**Gudanar da Script** — kayan aiki na ci gaba don yin kwatance da ƙaddamar da script na Move na asali.",
      ],
    },
    search: {
      title: "Bincike",
      paragraphs: [
        "Rubuta a cikin akwatin bincike a [shafin gida](/) ko a cikin shugaban shafi. Ba ku buƙatar zaɓar nau'in abu da farko ba — bincike yana gano abin da kuka shigar.",
        "Hakanan za ku iya raba bincike tare da `/?search={query}` (misali `/?search=0x1`). Idan binciken URL yana da sakamako ɗaya mai kyau, binciken shugaban shafi na iya kai ku nan take.",
      ],
      bullets: [
        "**Adireshin asusun** (ciki har da gajerun nau'uka kamar `0x1`) — asusun, kuma wataƙila tsabar kuɗi, metadata na kadari mai musayawa, ko abu na Move.",
        "**Sunan ANS** mai ƙarshen `.apt` (ko `.petra`) — yana warware zuwa asusun.",
        "**Sigar ma'amala** (lamba) ko **hash na ma'amala** (`0x` da haruffa 64 na hex).",
        "**Tsayin bulo** (lamba a cikin iyakar sarkar).",
        "**Nau'in tsabar kuɗi na Move** kamar `0x1::aptos_coin::AptosCoin`.",
        "**Sunan ko alamar token** — yana daidaita da saitin tsabar kuɗi da aka jera.",
        "**Rubutu na emoji kawai** — yana neman kasuwannin emojicoin idan ya shafi.",
      ],
    },
    networks: {
      title: "Hanyoyin sadarwa",
      paragraphs: [
        "Yi amfani da jerin zaɓuɓɓukan hanyar sadarwa a cikin shugaban shafi. Hanyoyin haɗi a cikin manhaja suna riƙe hanyar sadarwar ku na yanzu don kada ku tsallake zuwa mainnet ba tare da sanin ba.",
        "**Mainnet** shine samarwa. **Testnet** da **devnet** don ci gaba ne (ana sake saita devnet akai-akai). **Local** yana magana da node a kan na'urar ku (yawanci `http://127.0.0.1:8080/v1`). Hanyoyin sadarwa da aka ɓoye ko na samfoti na iya bayyana lokacin da aka gina bincike tare da alamar fasali.",
        "Idan kun zaɓi Local kuma node ba ya gudana, taga yana bayyana yadda ake fara `aptos node run-local-testnet` kuma yana ba da damar komawa Mainnet.",
        "Wasu fasali suna mainnet kawai (nazari, wasu ƙididdigar farashi, bibiyoyin Sentio). Shafukan GraphQL/indexer na iya ɓacewa a kan hanyoyin sadarwa waɗanda ba sa wallafa indexer.",
      ],
    },
    transactions: {
      title: "Karanta ma'amala",
      paragraphs: [
        "Buɗe ma'amala a `/txn/{version}` ko `/txn/{hash}`. **Siga** shi ne lambar jerin ledger (lamba mai cikakken lamba daga 0). **Hash** shi ne hash na ma'amala na bytes 32. Siga ita ce mai ƙayyade idan kuna da ita.",
        "[Jerin ma'amaloli](/transactions) yana nuna ayyukan kwanan nan. **Mai amfani da Duk** yana zaɓar ma'amalolin da masu amfani suka ƙaddamar da su da cikakken kwararar (ciki har da metadata na bulo). Za ku iya tace ma'amalolin masu amfani ta aikin shigarwa (`fn_addr`, `fn_module`, `fn_name` a cikin URL).",
        "A shafin cikakken bayani, shafuka sun dogara da nau'in ma'amala:",
      ],
      bullets: [
        "**Bayani** — matsayi, mai aikawa, gas, aiki, da **Ayyuka** da aka fassara (musayawa, canja wuri, da makamantan).",
        "**Biyan kuɗi** — ana nuna shi kawai lokacin da bincike ya gano biyan kuɗi (tsakanin mutane, hanyoyin abokin ciniki, canja wurin sirri, wrap/unwrap, ko ƙangaren musayawa). Adadin sirri suna ɓoye.",
        "**Canjin Ma'auni** — bambance-bambancen ma'auni na tsabar kuɗi da kadari mai musayawa, ciki har da gas.",
        "**Abubuwan da suka faru** — rajistan da aka fitar yayin aiwatarwa.",
        "**Payload** — abin da aka ƙaddamar (aikin shigarwa, script, multisig, da sauransu).",
        "**Canje-canje** — canje-canjen albarkatun write-set.",
        "**Module** — lokacin da ma'amala ke wallafa ko haɓaka fakitin Move.",
        "**Bibiya** — kwatancen kiran Move na gwaji na Sentio akan ma'amalolin masu amfani na mainnet.",
      ],
      more: [
        "Ma'amalar da ta gaza har yanzu tana kan sarkar; bayani yana nuna kuskure. Ma'amalolin da ke jiran an jera suna jiran jeri a cikin bulo.",
        "Idan fullnode mai hidima ya **yanke** tsohon tarihi, bincike yana sake gwadawa da node na **ajiya**, sannan ya sake gina daga **indexer** idan ya zama dole. Shafukan indexer kawai na iya barin abubuwan payload, abubuwan da suka faru, ko hash, kuma suna nuna banner na bayanai.",
      ],
    },
    accounts: {
      title: "Asusuna, sunaye, da abubuwa",
      paragraphs: [
        "**Asusun** adireshi ne na bytes 32. Buɗe shi a `/account/{address}`. Ana karɓar hex mai gajarta (`0x1`). [Aptos Names](https://aptosnames.com) (`.apt`) suna warware zuwa adireshi a cikin bincike da a cikin shugaban asusun.",
        "**Abu na Move** abu ne na farko na kan sarkar wanda zai iya mallakar albarkatu. Idan kun buɗe adireshin abu a matsayin asusun, bincike yana tura ku zuwa `/object/{address}` tare da saitin shafuka iri ɗaya.",
        "Shafukan asusun yawanci sun haɗa da:",
      ],
      bullets: [
        "**Ma'amaloli** — tarihi ga wannan adireshi, tare da shafuka da tacewar aiki na zaɓi.",
        "**Tsabar kuɗi** — ma'auni na tsabar kuɗi (da kuma ra'ayoyin FA masu dangantaka idan ya shafi).",
        "**Token** — NFT da kadarorin dijital.",
        "**Albarkatu** — albarkatun Move da aka adana ƙarƙashin asusun, a matsayin JSON.",
        "**Module** — fakitin da aka wallafa da tushen lamba (duba [Module](#modules)).",
        "**Multisig** — lokacin da asusun multisig ne (ana iya ba da shigarwar Petra Vault).",
        "**Bayanai** — lambar jeri, maɓallin tabbatarwa, da metadata masu dangantaka.",
      ],
      more: [
        "Adireshoshin da aka sani na iya nuna **lakabi da tambari** (musayawa, asusun tsari, da sauransu). Wasu ayyukan da aka lakaba suna nuna **banner na kasancewa** ko raguwa — ɗauki hakan a matsayin gargadi, ba shawarar saka hannun jari ba.",
        "**Katin ma'auni** yana nuna APT. A kan mainnet na iya haɗa da ƙididdigar USD daga cibiyar farashi ta jama'a.",
      ],
    },
    modules: {
      title: "Module na Move da lamba",
      paragraphs: [
        "Shafin Module yana jerawa fakitin da asusun ko abu ya wallafa. Za ku iya buɗe **fakiti**, **lamba** don module, **Gudanar** (aikunan shigarwa, ana buƙatar walat), da **Duba** (aikunan dubawa kawai).",
        "Ra'ayoyin lamba sun haɗa da **Tushen Lamba da aka Wallafa** (idan mai wallafawa ya adana shi), **ABI**, da — lokacin da kuka zaɓa a ƙarƙashin [Saituna](/settings) — bytecode da aka **Cire** da **Cire lamba**. Cirewa yana gudana a cikin burauzar ku (WebAssembly). Sake gina ne, ba sharhi da sunayen asali ba ne.",
        "**Mai zaɓar siga** yana ba ku damar bincika fakiti a ma'amalar wallafawa ta baya. Ra'ayin bambance yana kwatanta sigogi biyu. Hanyoyin haɗi tsakanin module suna tsalle zuwa wasu module a cikin fakiti iri ɗaya lokacin da sunaye suka warware.",
      ],
    },
    blocks: {
      title: "Buloli",
      paragraphs: [
        "Aptos yana haɗa ma'amaloli cikin **buloli** da aka jera bisa **tsayi**. [Jerin buloli](/blocks) yana nuna tsayoyi na kwanan nan. Shafin bulo (`/block/{height}`) yana da **Bayani** (lokaci, mai ƙaddamarwa, adadin ma'amaloli, hash) da **Ma'amaloli** a cikin wannan bulo.",
        "Bulolin da aka yanke suna bin dawowar node na ajiya iri ɗaya da tsofaffin ma'amaloli. Teburin bulolin kwanan nan yana kan taga fullnode mai hidima.",
      ],
    },
    validators: {
      title: "Masu tabbatarwa da staking",
      paragraphs: [
        "Shafin [masu tabbatarwa](/validators) yana da **Duk Node** (saitin masu tabbatarwa na yanzu, ƙarfin jefa ƙuri, wuri idan an sani) da **Delegation** (tafkuna da za ku iya saka hannun jari). Mai nuna epoch yana nuna epoch na yanzu.",
        "Buɗe tafki a `/validator/{address}` don kwamishin, saka hannun jari, aiki, da — idan kun haɗa walat da ke da ajiya — **Ajiyoyi Na** tare da saka hannun jari / cire / sake saka / cirewa. A kan waya, waɗannan ayyuka suna kan kowane katin ajiya, ba kawai a cikin teburin desktop ba.",
        "Delegation aikin tsari ne: yana ciyar da gas kuma yana amfani da walat ɗin ku. Karanta adadi da kullewa kafin tabbatarwa.",
      ],
    },
    assets: {
      title: "Tsabar kuɗi, kadarorin da za a iya musayawa, da NFT",
      paragraphs: [
        "**Tsabar kuɗi** nau'ukan Move na asali ne `0x1::coin` (`address::module::Struct`). **Kadarorin da za a iya musayawa (FA)** shine sabon tsarin bisa abu. APT yana akwai a cikin duka ra'ayoyi; yawancin sabbin token FA kawai ne. [Jerin tsabar kuɗi](/coins) yana haɗa tsabar kuɗi da FA da aka jera.",
        "Shafin tsabar kuɗi shine `/coin/{type}` (nau'in da aka encode a URL). Shafin FA shine `/fungible_asset/{metadataAddress}`. Shafuka yawanci sun haɗa da **Bayanai**, **Ma'amaloli**, da **Masu riƙe** (masu riƙe suna buƙatar goyon bayan indexer).",
        "NFT da kadarorin dijital suna amfani da `/token/{tokenId}` tare da **Bayani** da **Ayyuka**. Ana iya ɓoye ko alama waɗansu tarin da aka haramta ko na zamba.",
        "Alamomin tabbatarwa (na asali, da Labs ta tabbarta, al'umma/Panora, da aka sani, da ba a tabbatar ba, da aka haramta) ana bayyana su a shafin [tabbatarwa](/verification). Alamomi ba garantin ƙima ko tsaro ba ne.",
      ],
    },
    analytics: {
      title: "Nazari",
      paragraphs: [
        "[Nazari](/analytics) **mainnet kawai** ne. Wasu hanyoyin sadarwa suna nuna saƙo mai gajarta maimakon zane-zane. Zane-zane sun rufe ma'amalolin masu amfani na yau da kullum, mafi girman TPS, masu amfani masu aiki, sabbin asusuna, wallafawa, gas, da tazarar bulo. Za ku iya canza tsakanin kwanaki 7 da 30.",
        "Tsarin a saman yana taƙaita samarwa, saka hannun jari, TPS, da adadin node. Bayanan suna zuwa daga fayilolin kididdigar sarkar da aka wallafa da tambayoyin sarkar masu aiki — na iya jinkirta kaɗan.",
      ],
    },
    releases: {
      title: "Saki, AIP, da kayan aiki",
      paragraphs: [
        "[Cibiyar saki](/releases) tana da shafuka uku: **Hanyoyin sadarwa** (epoch, tsayi, sigogin tsari/node, alamomin fasali a kan mainnet, testnet, da devnet), **AIP** (Aptos Improvement Proposals daga ma'ajiyar AIP ta jama'a), da **SDK** (saki na CLI, `aptos-node`, da SDK na hukuma).",
        "Tsofaffin URL `/deployments` da `/aips` suna tura zuwa nan.",
      ],
    },
    runScript: {
      title: "Gudanar da Script (na ci gaba)",
      paragraphs: [
        "[Gudanar da Script](/run-script) yana gina, **yin kwatance**, da **aiwatar da** ma'amalar **script** na Move da aka tarawa daga walat da aka haɗa. Script ba su da ABI na kan sarkar, don haka dole ne ku sanar da nau'ukan abubuwan da kuke buƙata. Babu mai tarawa na Move a cikin burauza — manna bytecode (hex) daga mai tarawa da kuka amince da shi.",
        "Ɗauki hakan a matsayin mara juyawa da zarar an aiwatar. Koyaushe karanta kwatancen (matsayi, gas, abubuwan da suka faru, canje-canjen albarkatu) kafin Aiwatar. Fi son shafin **Gudanar** na Module na asusun don aikunan shigarwa da aka wallafa.",
      ],
    },
    configure: {
      title: "Saitawa",
      paragraphs: [
        "Buɗe [Saituna](/settings). Ana adana abubuwan da kuka fi so **a cikin wannan burauza**, ba a uwar garken Aptos Labs ba.",
      ],
      bullets: [
        "**Harshe** — Na asalin burauza ko harshe na musamman. Wannan yana sarrafa fuskar da aka fassara, rubutun saituna, da wannan jagora. Bayanan kan sarkar (adireshi, sunayen aiki, abubuwan da suka faru) suna kasancewa kamar yadda sarkar ke adana su.",
        "**Cire bytecode na Move** — a kashe a tsohuwa. Karanta gargadin kafin kunna. Lokacin da aka kashe, ra'ayoyin da aka Cire da Cire lamba suna ɓoye.",
        "**Canza maɓallin API** — maɓallan [geomi.dev](https://geomi.dev) na zaɓi ga kowace hanyar sadarwa don burauzar ku kada ta tsaya a kan iyakar saurin maras suna da aka raba. Ana aika maɓalli a matsayin `Authorization: Bearer`. Maɓallan abokin ciniki na Geomi `AG-*` dole ne su ƙyale Asalin wannan gidan. Duba **Tuna a wannan na'urar** kawai a kan na'urar da kuka amince da ita; in ba haka ba maɓalli suna ƙarewa da zaman shafin.",
        "**Jigo** — haske ko duhu daga maɓallin rana/wata a cikin shugaban shafi. Ana adana shi a cikin cookie (`color_scheme`) kuma yana bin tsarin idan ba ku zaɓi ba.",
        "**Hanyar sadarwa** — mai zaɓar shugaban shafi; ana encode shi a cikin `?network=` maimakon saituna.",
      ],
      more: [
        "Ajiye yana aiwatar da maɓallan API da cirewa (da harshe) tare: ana zubar da abokan ciniki da aka adana kuma tambayoyi suna sabuntawa. **Mayar da tsohuwa** yana share waɗannan abubuwan da kuka fi so na bincike a cikin wannan burauza.",
        "Idan kuka ga HTTP **429**, akwatin iyakar saurin na iya kai ku zuwa Saituna. Jikin Geomi na *Per anonymous IP rate limit exceeded* yana nufin ba a karɓi maɓalli ba; *Per application per IP rate limit exceeded* yana nufin an cimma iyakar maɓallin ku.",
      ],
    },
    wallet: {
      title: "Walat",
      paragraphs: [
        "Haɗa walat na zaɓi ne. Yi amfani da shi don buɗe asusun ku cikin sauri, saka hannun jari, gudanar da aikunan shigarwa, ko ƙaddamar da script. Ana jera Petra da farko a cikin walat da za a iya shigarwa.",
        "Hanyar sadarwar walat dole ta dace da hanyar sadarwar bincike (tare da ƙaramin banbanci don wasu saitunan RPC na gida/na musamman). Hanyoyin sadarwa da ba su dace ba suna hana ƙaddamarwa don kada ku sa hannu don sarkar da ba dace ba.",
      ],
    },
    verification: {
      title: "Tabbatar da token da adireshi",
      paragraphs: [
        "Bincike na iya nuna alamomin tabbatarwa akan token da wasu adireshi. Jerin al'umma yana zuwa ta [jerin token na Panora](https://github.com/PanoraExchange/Aptos-Tokens). Tabbatar da Labs an keɓe don kadarorin asali da wasu token da aka kafa.",
        "Umarnin mataki-mataki ga ƙungiyoyin ayyuka suna kan shafin [Tabbatar da Token & Adireshi](/verification). Masu amfani har yanzu su duba adireshin nau'i/metadata, ba suna ko tambari kawai.",
      ],
    },
    urls: {
      title: "URL, raba, da wakilai",
      paragraphs: [
        "Fi son **shafuka bisa hanya**, misali `/account/0x1/modules` maimakon tambayar `?tab=`. Kwafi sandar adireshi don raba ra'ayi; riƙe `?network=` idan ba ku kan mainnet ba.",
        "Samfuran hukuma an rubuta su don mutane a nan da don software a cikin [`/llms.txt`](/llms.txt). Wakilai a cikin burauza na iya amfani da kayan aikin WebMCP masu karantawa kawai (bincike, buɗe ma'amala/asusun/bulo/tsabar kuɗi/saki/jagora) lokacin da burauza ke goyon bayansu.",
        "Lokacin da aka shigar da bincike a matsayin PWA ko a cikin (misali Petra Vault), maɓallin **Raba** na iya bayyana a cikin shugaban shafi.",
      ],
    },
    glossary: {
      title: "Kamus",
      bullets: [
        "**Adireshi** — mai ƙayyade asusun ko abu na bytes 32, hex tare da `0x`. `0x1` shi ne Aptos Framework.",
        "**ANS** — Aptos Name Service. Suna kamar `alice.apt` yana nuna adireshi.",
        "**Tsayin bulo** — jerin bulo, farawa daga 0.",
        "**Abu da ya faru** — rajista mai tsari da aka fitar yayin gudanar da ma'amala.",
        "**Kadari mai musayawa (FA)** — tsarin token mai musayawa bisa abu (adireshin abu na metadata).",
        "**Gas** — kuɗin aiwatarwa da ajiya, ana biya a cikin APT (octas a ƙasa).",
        "**Indexer** — API na GraphQL na Aptos Labs da ake amfani da shi don tarihi, masu riƙe, da wasu shafuka. Ba kowace hanyar sadarwa tana da shi.",
        "**Module** — lambar Move da aka wallafa. **Fakiti** yana haɗa module.",
        "**Abu** — abu na kan sarkar da ke da adireshinsa wanda zai iya riƙe albarkatu.",
        "**Octa** — 10⁻⁸ APT. 1 APT = 100,000,000 octas.",
        "**Albarka** — bayanan Move mai nau'i da aka adana ƙarƙashin asusun ko abu.",
        "**Lambar jeri** — ma'auni na asusun da ke tsara ma'amalolin wannan asusun.",
        "**Sigar ma'amala** — sigar ledger ta duniya (lamba mai cikakken lamba) da aka ba lokacin da aka jera ma'amala.",
        "**Write-set / canje-canje** — yanayin da ma'amala ta rubuta.",
      ],
    },
    troubleshooting: {
      title: "Warware matsaloli",
      bullets: [
        "**Shafuka marasa abu ko masu juyawa** — duba mai zaɓar hanyar sadarwa da ko kuna kan Local ba tare da node ba. Gwada wata hanyar sadarwa ko jira 429 ya ƙare.",
        "**Ba a sami ma'amala ba** — tabbatar da siga/hash da hanyar sadarwa. Sigogin da suka tsufa sosai na iya lodawa daga ajiya/indexer tare da filaye masu ƙarancin.",
        "**Bincike ya rasa hash da aka yanke** — neman hash yana amfani da fullnode sannan ajiya (ba tare da maɓallin API na bincike ba). Indexer ba zai iya bincika ta hash ba.",
        "**Cire / Cire lamba ya ɓace** — kunna cirewa a cikin [Saituna](/settings) kuma karɓi gargadin.",
        "**Sarkar da ba dace ba** — duba `?network=` da jerin zaɓuɓɓukan shugaban shafi.",
        "**Sakamakon bincike da ya tsufa** — **Share Cache** a ƙasan shafi.",
        "**Nazari ya ɓace** — canja zuwa mainnet.",
        "**Walat ba zai ƙaddamar ba** — daidaita hanyar sadarwar walat da bincike; sake haɗa bayan canzawa.",
      ],
    },
  },
} as const satisfies MessageTree;

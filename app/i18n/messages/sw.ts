import type {EnglishMessages} from "./en";

export const sw = {
  chrome: {
    skipToContent: "Ruka hadi maudhui kuu",
    appName: "Aptos Explorer",
    appNameShort: "Kichunguzi",
    navAriaLabel: "Urambazaji mkuu",
    overflowMenuAriaLabel: "Menyu ya urambazaji",
    openSettings: "Fungua mipangilio",
    openGuide: "Fungua mwongozo wa mtumiaji",
    switchToLight: "Badilisha hadi hali ya mwanga",
    switchToDark: "Badilisha hadi hali ya giza",
    nav: {
      transactions: "Miamala",
      transactionsTitle: "Tazama miamala yote",
      analytics: "Takwimu",
      analyticsTitle: "Tazama takwimu za mtandao",
      validators: "Wathibitishaji",
      validatorsTitle: "Tazama wathibitishaji wote",
      blocks: "Vitalu",
      blocksTitle: "Tazama vitalu vya hivi karibuni",
      coins: "Sarafu",
      coinsTitle: "Tazama sarafu na mali zinazoweza kubadilishana",
      releases: "Matoleo",
      releasesTitle:
        "Tazama usambazaji wa mtandao, AIP, na matoleo ya SDK na zana",
      runScript: "Endesha Script",
      runScriptTitle: "Unda, simulia, na tekeleza script ya Move (ya juu)",
      settings: "Mipangilio",
      guide: "Mwongozo wa mtumiaji",
    },
  },
  footer: {
    privacy: "Faragha",
    terms: "Masharti",
    verification: "Uthibitishaji wa tokeni na anwani",
    guide: "Mwongozo wa mtumiaji",
    clearCache: "Futa akiba",
    cacheCleared: "✓ Imefutwa",
    clearCacheTitle: "Futa akiba ya utafutaji",
    copyrightOwner: "Aptos Labs",
  },
  search: {
    placeholder: "Tafuta kwa anwani, txn, kizuizi, sarafu, au jina la ANS",
    helper:
      "Anwani au jina la akaunti · Hash au toleo la txn · Urefu wa kizuizi · Aina ya sarafu · Jina la ANS",
    ariaLabel: "tafuta",
    type: {
      account: "Akaunti",
      address: "Anwani",
      transaction: "Muamala",
      block: "Kizuizi",
      coin: "Sarafu",
      fungibleAsset: "Mali inayoweza kubadilishana",
      object: "Kitu",
      result: "Matokeo",
    },
  },
  settings: {
    title: "Mipangilio",
    description:
      "Simamia mapendeleo yako ya kichunguzi. Mipangilio huhifadhiwa ndani ya kivinjari chako.",
    language: {
      title: "Lugha",
      description:
        "Chagua jinsi kichunguzi kinavyoonyesha kiolesura, mipangilio, na mwongozo wa mtumiaji. Chaguomsingi la kivinjari hufuata lugha ya kifaa chako inapopatikana tafsiri, na vinginevyo hutumia Kiingereza. Lugha zaidi zinaweza kuongezwa kama katalogi bila kubadilisha URL za kurasa.",
      label: "Lugha ya kuonyesha",
      auto: "Chaguomsingi la kivinjari",
    },
    decompilation: {
      title: "Uchanganuzi wa bytecode ya Move",
      description:
        "Washa uchanganuzi wa bytecode ya Move iliyoko kwenye mnyororo kuwa msimbo unaosomeka. Hufanyika kabisa kwenye kivinjari chako kupitia WebAssembly.",
      ariaLabel: "Washa uchanganuzi wa bytecode ya Move",
      disclaimerTitle: "Kanusho — Tafadhali soma kabla ya kuwasha",
      disclaimerIntro:
        "Matokeo yaliyochanganuliwa hutengenezwa kiotomatiki kutoka bytecode iliyoko kwenye mnyororo na **yanaweza yasilingane** na msimbo wa asili. Majina ya vigezo, maoni, na baadhi ya maelezo ya muundo hupotea wakati wa ukusanyaji na hayawezi kurejeshwa. Kwa kuwasha kipengele hiki unakubali kwamba:",
      bullets: [
        "Matokeo yaliyochanganuliwa hutolewa **kama yalivyo kwa madhumuni ya taarifa tu**.",
        "Unakubali wajibu wa jinsi unavyotumia matokeo yaliyochanganuliwa.",
        "Matokeo hayapaswi kuchukuliwa kama msimbo wa mwisho au wa mamlaka kwa moduli yoyote iliyoko kwenye mnyororo.",
      ],
    },
    apiKeys: {
      title: "Ubadilishaji wa funguo za API",
      whyAriaLabel: "Kwa nini utumie funguo yako ya API?",
      popover:
        "Kichunguzi hutumia funguo ya API ya geomi.dev iliyoshirikiwa kwa chaguomsingi. Kuongeza funguo yako mwenyewe hukupa kikomo cha kasi maalum, kinachosaidia ukipitia sana au ukifikia majibu ya HTTP 429.",
      popoverManage:
        "Unda na simamia funguo kwenye [geomi.dev](https://geomi.dev).",
      description:
        "Funguo za API za geomi.dev kwa kila mtandao (si lazima). Hutumika tu kwenye kivinjari chako. Acha mtandao wazi ili utumie funguo ya chaguomsingi kutoka ujenzi (ikiwepo). Kwa chaguomsingi, mabadilishiko huhifadhiwa kwa kipindi cha sasa cha kivinjari na hufutwa kipindi kinapokwisha.",
      fieldLabel: "Funguo ya API ya {network}",
      fieldPlaceholder: "Bandika funguo ya {network} (si lazima)",
      showKeys: "Onyesha funguo za API",
      hideKeys: "Ficha funguo za API",
      getKey: "Huna funguo? [Pata moja kwenye geomi.dev](https://geomi.dev)",
      remember: "Kumbuka funguo za API kwenye kifaa hiki",
      rememberWarning:
        "Kukumbuka funguo kunazihifadhi kwenye hifadhi ya ndani ya kivinjari hiki. Epuka kuwasha hili kwenye vifaa vilivyoshirikiwa au visivyoaminika.",
      notStored:
        "Funguo hazihifadhiwi na seva ya programu ya kichunguzi. Kivinjari chako kinazitumia tu kwa maombi ya API ya upande wa mteja. Kwa usalama bora, tumia funguo za mteja zenye asili `https://explorer.aptoslabs.com` pekee iliyowezeshwa na kutekelezwa.",
      refreshNote:
        "Data iliyopo itasasishwa baada ya kuhifadhi ili maombi mapya yatumie funguo zilizosasishwa mara moja.",
    },
    actions: {
      reset: "Weka upya",
      restoreDefaults: "Rejesha chaguomsingi",
      save: "Hifadhi",
    },
    metaDescription:
      "Sanidi mipangilio ya Aptos Explorer ikiwa ni pamoja na lugha, funguo za API, mapendeleo ya uchanganuzi, na chaguo nyingine.",
  },
  guide: {
    meta: {
      title: "Mwongozo wa mtumiaji",
      description:
        "Jinsi ya kutumia Aptos Explorer: utafutaji, mitandao, miamala, akaunti, moduli, mipangilio, na jinsi ya kusoma unachokiona.",
      tocLabel: "Kwenye ukurasa huu",
      intro:
        "Mwongozo huu unaeleza jinsi ya **kutumia** Aptos Explorer, jinsi ya **kusoma** kurasa zinazoonyesha, na jinsi ya **kusanidi** kwenye kivinjari chako. Umeandikwa kwa watu wanaotafuta data iliyoko kwenye mnyororo — si kwa kuendesha nodi au kuandika Move.",
    },
    overview: {
      title: "Kichunguzi hiki ni nini",
      paragraphs: [
        "Aptos Explorer ni **kichunguzi cha vitalu** rasmi cha mnyororo wa Aptos. Unakitumia kutafuta miamala, akaunti, vitalu, wathibitishaji, sarafu, NFT, na hali ya mtandao. Huisoma data ya umma ya mnyororo; haishikili fedha na si pochi.",
        "Kila ukurasa unahusishwa na **mtandao** (mainnet kwa chaguomsingi). Muamala au akaunti kwenye testnet ni kitu tofauti kutoka kwa kitambulisho sawa kwenye mainnet. Mtandao huhifadhiwa kwenye URL kama `?network=…` ili viungo unavyonakili viwe na mnyororo sawa.",
        "Kichunguzi ni tovuti. Kuunganisha pochi si lazima na kinahitajika tu kwa vitendo kama kuweka stake, kuendesha kazi ya moduli, au kuwasilisha script ya Move.",
      ],
    },
    chrome: {
      title: "Kujipanga",
      paragraphs: [
        "**Kichwa** kiko kwenye kila ukurasa: nembo (nyumbani), urambazaji mkuu, kichaguzi cha mtandao, kitufe cha kushiriki (si lazima), [mwongozo wa mtumiaji](/guide), [mipangilio](/settings), mandhari ya mwanga/giza, na kuunganisha pochi. Kwenye skrini ndogo, urambazaji, mipangilio, mandhari, na pochi ziko kwenye kitufe cha menyu.",
        "Chini ya kichwa, kurasa nyingi za maelezo huonyesha kidhibiti cha **kurudi** (unapokuwa na historia ndani ya programu) na sehemu ya **utafutaji**. Ukurasa wa nyumbani (`/`) ni eneo kubwa la utafutaji lenye sheria sawa za kulinganisha.",
        "**Kijachini** kina Faragha, Masharti, [maelekezo ya uthibitishaji wa tokeni](/verification), mwongozo huu, na **Futa akiba** (hufuta akiba ya matokeo ya utafutaji ya kivinjari, si mnyororo).",
      ],
      bullets: [
        "**Miamala** — miamala ya hivi karibuni ya watumiaji, yenye vichujio.",
        "**Takwimu** — chati za mainnet pekee (TPS, watumiaji hai, gesi, na zaidi).",
        "**Wathibitishaji** — seti ya wathibitishaji na mabwawa ya uwekaji.",
        "**Vitalu** — vitalu vya hivi karibuni kwa urefu.",
        "**Sarafu** — sarafu na mali zinazoweza kubadilishana zilizoorodheshwa.",
        "**Matoleo** — matoleo ya mtandao yanayoendeshwa, AIP, na matoleo ya SDK/CLI.",
        "**Endesha Script** — zana ya juu ya kusimulia na kuwasilisha script ya Move mbichi.",
      ],
    },
    search: {
      title: "Utafutaji",
      paragraphs: [
        "Andika kwenye kisanduku cha utafutaji kwenye [ukurasa wa nyumbani](/) au kwenye kichwa. Huhitaji kuchagua aina ya kitu kwanza — kichunguzi hutambua ulichoingiza.",
        "Unaweza pia kushiriki utafutaji kwa `/?search={query}` (kwa mfano `/?search=0x1`). Ikiwa utafutaji wa URL una matokeo moja wazi, utafutaji wa kichwa unaweza kukupeleka huko mara moja.",
      ],
      bullets: [
        "**Anwani ya akaunti** (ikiwa ni pamoja na fomu fupi kama `0x1`) — akaunti, na labda sarafu, metadata ya mali inayoweza kubadilishana, au kitu cha Move.",
        "**Jina la ANS** linalomalizika kwa `.apt` (au `.petra`) — linatatuliwa kuwa akaunti.",
        "**Toleo la muamala** (nambari) au **hash ya muamala** (`0x` pamoja na herufi 64 za heksadesimali).",
        "**Urefu wa kizuizi** (nambari ndani ya masafa ya mnyororo).",
        "**Aina ya sarafu ya Move** kama `0x1::aptos_coin::AptosCoin`.",
        "**Jina au alama ya tokeni** — inalingana na seti ya sarafu zilizoorodheshwa.",
        "**Maandishi ya emoji pekee** — hutafuta masoko ya emojicoin inapofaa.",
      ],
    },
    networks: {
      title: "Mitandao",
      paragraphs: [
        "Tumia menyu ya kushuka ya mtandao kwenye kichwa. Viungo ndani ya programu vinahifadhi mtandao wako wa sasa ili usirudi mainnet kimya kimya.",
        "**Mainnet** ni uzalishaji. **Testnet** na **devnet** ni kwa maendeleo (devnet hufutwa mara kwa mara). **Local** huongea na nodi kwenye mashine yako (kwa kawaida `http://127.0.0.1:8080/v1`). Mitandao iliyofichwa au ya hakikisho inaweza kuonekana wakati kichunguzi kinajengwa na alama ya kipengele.",
        "Ukichagua Local na nodi haifanyi kazi, dirisha linaeleza jinsi ya kuanzisha `aptos node run-local-testnet` na kutoa kubadilisha kurudi Mainnet.",
        "Baadhi ya vipengele ni vya mainnet pekee (takwimu, baadhi ya makadirio ya bei, alama za Sentio). Vichupo vya GraphQL/indexer vinaweza kukosekana kwenye mitandao isiyochapisha indexer.",
      ],
    },
    transactions: {
      title: "Kusoma muamala",
      paragraphs: [
        "Fungua muamala kwenye `/txn/{version}` au `/txn/{hash}`. **Toleo** ni nambari ya mlolongo wa kitabu (nambari kamili kuanzia 0). **Hash** ni hash ya muamala ya baiti 32. Toleo ni kitambulisho thabiti ukikipata.",
        "[Orodha ya miamala](/transactions) inaonyesha shughuli za hivi karibuni. **Mtumiaji dhidi ya Zote** huchagua miamala iliyowasilishwa na watumiaji dhidi ya mtiririko kamili (ikiwa ni pamoja na metadata ya kizuizi). Unaweza kuchuja miamala ya watumiaji kwa kazi ya kuingia (`fn_addr`, `fn_module`, `fn_name` kwenye URL).",
        "Kwenye ukurasa wa maelezo, vichupo vinategemea aina ya muamala:",
      ],
      bullets: [
        "**Muhtasari** — hali, mtumaji, gesi, kazi, na **Vitendo** vilivyochanganuliwa (kubadilishana, uhamisho, na kadhalika).",
        "**Malipo** — huonyeshwa tu wakati kichunguzi kinatambua malipo (mwenzi kwa mwenzi, hatua zinazodhibitiwa na mshirika, uhamisho wa siri, kufunga/kufungua, au hatua za ubadilishaji). Kiasi cha siri hubaki kimefichwa.",
        "**Mabadiliko ya salio** — tofauti za salio la sarafu na mali zinazoweza kubadilishana, ikiwa ni pamoja na gesi.",
        "**Matukio** — kumbukumbu zilizotolewa wakati wa utekelezaji.",
        "**Mzigo** — mzigo uliowasilishwa (kazi ya kuingia, script, multisig, na kadhalika).",
        "**Mabadiliko** — mabadiliko ya rasilimali ya write-set.",
        "**Moduli** — wakati muamala unachapisha au kusasisha vifurushi vya Move.",
        "**Alama** — alama ya majaribio ya Sentio ya wito wa Move kwenye miamala ya watumiaji ya mainnet.",
      ],
      more: [
        "Muamala ulioshindwa bado upo kwenye mnyororo; muhtasari unaonyesha hitilafu. Miamala inayosubiri bado haijaingizwa kwenye kizuizi.",
        "Ikiwa nodi kamili inayohudumia ime **punguza** historia ya zamani, kichunguzi hujaribu tena nodi ya **hifadhi**, kisha kujenga upya kutoka **indexer** ikihitajika. Kurasa za indexer pekee zinaweza kuacha hoja za mzigo, matukio, au hash, na zinaonyesha bango la taarifa.",
      ],
    },
    accounts: {
      title: "Akaunti, majina, na vitu",
      paragraphs: [
        "**Akaunti** ni anwani ya baiti 32. Ifungue kwenye `/account/{address}`. Heksadesimali fupi (`0x1`) inakubaliwa. [Aptos Names](https://aptosnames.com) (`.apt`) hutatuliwa kuwa anwani katika utafutaji na kwenye kichwa cha akaunti.",
        "**Kitu cha Move** ni kitu cha kwanza kwenye mnyororo kinachoweza kumiliki rasilimali. Ukifungua anwani ya kitu kama akaunti, kichunguzi kinaelekeza kwenye `/object/{address}` na seti sawa ya vichupo.",
        "Vichupo vya akaunti kwa kawaida ni pamoja na:",
      ],
      bullets: [
        "**Miamala** — historia ya anwani hii, yenye kurasa na kichujio cha kazi (si lazima).",
        "**Sarafu** — salio la sarafu (na maoni ya FA yanayohusiana inapofaa).",
        "**Tokeni** — NFT na mali za dijitali.",
        "**Rasilimali** — rasilimali za Move zilizohifadhiwa chini ya akaunti, kama JSON.",
        "**Moduli** — vifurushi vilivyochapishwa na msimbo (tazama [Moduli](#modules)).",
        "**Multisig** — wakati akaunti ni multisig (uandikishaji wa Petra Vault unaweza kutolewa).",
        "**Taarifa** — nambari ya mlolongo, funguo ya uthibitishaji, na metadata inayohusiana.",
      ],
      more: [
        "Anwani zinazojulikana zinaweza kuonyesha **lebo na ikoni** (mabadilishano, akaunti za framework, na kadhalika). Baadhi ya miradi iliyowekwa lebo inaonyesha bango la **kufutwa** au kufungwa — ichukulie kama onyo, si ushauri wa uwekezaji.",
        "**Kadi ya salio** inaonyesha APT. Kwenye mainnet inaweza kujumuisha makadirio ya USD kutoka kwa chanzo cha bei cha umma.",
      ],
    },
    modules: {
      title: "Moduli za Move na msimbo",
      paragraphs: [
        "Kichupo cha Moduli kinaorodhesha vifurushi vilivyochapishwa na akaunti au kitu. Unaweza kufungua **vifurushi**, **msimbo** wa moduli, **Endesha** (kazi za kuingia, pochi inahitajika), na **Tazama** (kazi za view za kusoma tu).",
        "Maoni ya msimbo ni pamoja na **Msimbo Uliochapishwa** (ikiwa mchapishaji aliuhifadhi), **ABI**, na — ukichagua chini ya [Mipangilio](/settings) — bytecode **Iliyochanganuliwa** na **Uchanganuzi**. Uchanganuzi hufanyika kwenye kivinjari chako (WebAssembly). Ni ujenzi upya, si maoni na majina ya asili.",
        "**Kichaguzi cha toleo** kinakuwezesha kuchunguza kifurushi kwenye muamala wa uchapishaji wa awali. Muonekano wa tofauti unalinganisha matoleo mawili. Viungo vya moduli huingia kwenye moduli nyingine katika kifurushi sawa majina yanapotatuliwa.",
      ],
    },
    blocks: {
      title: "Vitalu",
      paragraphs: [
        "Aptos huweka miamala katika **vitalu** vilivyopangwa kwa **urefu**. [Orodha ya vitalu](/blocks) inaonyesha urefu wa hivi karibuni. Ukurasa wa kizuizi (`/block/{height}`) una **Muhtasari** (muda, mpendekeza, idadi ya miamala, hash) na **Miamala** katika kizuizi hicho.",
        "Vitalu vilivyopunguzwa hufuata urejeshaji sawa wa nodi ya hifadhi kama miamala ya zamani. Jedwali la vitalu vya hivi karibuni hubaki kwenye dirisha la nodi kamili inayohudumia.",
      ],
    },
    validators: {
      title: "Wathibitishaji na uwekaji",
      paragraphs: [
        "Ukurasa wa [wathibitishaji](/validators) una **Nodi Zote** (seti ya sasa ya wathibitishaji, nguvu ya kura, eneo inapojulikana) na **Uwekaji** (mabwawa unayoweza kuweka stake). Kiashiria cha kipindi kinaonyesha kipindi cha sasa.",
        "Fungua bwawa kwenye `/validator/{address}` kwa kamisheni, stake, utendaji, na — ukiunganisha pochi iliyo na amana — **Amana Zangu** zenye stake / unstake / restake / kutoa. Kwenye simu, vitendo hivyo viko kwenye kadi ya kila amana, si kwenye jedwali la kompyuta pekee.",
        "Uwekaji ni kitendo cha itifaki: hutumia gesi na pochi yako. Soma kiasi na kufungwa kabla ya kuthibitisha.",
      ],
    },
    assets: {
      title: "Sarafu, mali zinazoweza kubadilishana, na NFT",
      paragraphs: [
        "**Sarafu (Coins)** ni aina za asili za Move `0x1::coin` (`address::module::Struct`). **Mali zinazoweza kubadilishana (FA)** ni kiwango kipya kinachotegemea vitu. APT ipo katika maoni yote mawili; tokeni nyingi za hivi karibuni ni FA pekee. [Orodha ya sarafu](/coins) inachanganya sarafu zilizoorodheshwa na FA.",
        "Ukurasa wa sarafu ni `/coin/{type}` (aina iliyosimbwa kwenye URL). Ukurasa wa FA ni `/fungible_asset/{metadataAddress}`. Vichupo kwa kawaida ni pamoja na **Taarifa**, **Miamala**, na **Wamiliki** (wamiliki wanahitaji msaada wa indexer).",
        "NFT na mali za dijitali hutumia `/token/{tokenId}` yenye **Muhtasari** na **Shughuli**. Makusanyo yaliyopigwa marufuku au ya ulaghai yanaweza kufichwa au kuwekwa alama.",
        "Alama za uthibitishaji (asili, zilizothibitishwa na Labs, jamii/Panora, zinazotambulika, zisizothibitishwa, zilizopigwa marufuku) zinaelezwa kwenye ukurasa wa [uthibitishaji](/verification). Alama si dhamana ya thamani au usalama.",
      ],
    },
    analytics: {
      title: "Takwimu",
      paragraphs: [
        "[Takwimu](/analytics) ni **za mainnet pekee**. Mitandao mingine inaonyesha ujumbe mfupi badala ya chati. Chati zinashughulikia miamala ya watumiaji ya kila siku, TPS ya juu, watumiaji hai, akaunti mpya, usambazaji, gesi, na pengo la vitalu. Unaweza kubadilisha masafa ya siku 7 dhidi ya 30.",
        "Utepe wa juu unatoa muhtasari wa usambazaji, stake, TPS, na idadi ya nodi. Data hutoka kwa faili za takwimu za mnyororo zilizochapishwa pamoja na maswali ya moja kwa moja ya mnyororo — inaweza kuchelewa kidogo.",
      ],
    },
    releases: {
      title: "Matoleo, AIP, na zana",
      paragraphs: [
        "[Kitovu cha matoleo](/releases) kina vichupo vitatu: **Mitandao** (kipindi, urefu, matoleo ya framework/nodi, alama za vipengele kwenye mainnet, testnet, na devnet), **AIP** (Mapendekezo ya Uboreshaji wa Aptos kutoka hifadhi ya umma ya AIP), na **SDK** (CLI, `aptos-node`, na matoleo rasmi ya SDK).",
        "URL za zamani `/deployments` na `/aips` huelekeza hapa.",
      ],
    },
    runScript: {
      title: "Endesha Script (ya juu)",
      paragraphs: [
        "[Endesha Script](/run-script) huunda, **husimulia**, na **kutekeleza** muamala wa **script** ya Move iliyokusanywa kutoka pochi iliyounganishwa. Script hazina ABI kwenye mnyororo, kwa hivyo lazima utangaze aina za hoja mwenyewe. Hakuna kikompaili cha Move kwenye kivinjari — bandika bytecode (heksadesimali) kutoka kwa kikompaili unachokiamini.",
        "Ichukulie kuwa haiwezi kutenduliwa mara tu inapotekelezwa. Soma simulizi kila wakati (hali, gesi, matukio, mabadiliko ya rasilimali) kabla ya Tekeleza. Pendelea kichupo cha **Endesha** cha Moduli za akaunti kwa kazi za kuingia zilizochapishwa.",
      ],
    },
    configure: {
      title: "Usanidi",
      paragraphs: [
        "Fungua [Mipangilio](/settings). Mapendeleo huhifadhiwa **kwenye kivinjari hiki**, si kwenye seva za Aptos Labs.",
      ],
      bullets: [
        "**Lugha** — Chaguomsingi la kivinjari au lugha maalum. Huidhibiti kiolesura kilichotafsiriwa, maandishi ya mipangilio, na mwongozo huu. Data iliyoko kwenye mnyororo (anwani, majina ya kazi, matukio) hubaki kama mnyororo unavyohifadhi.",
        "**Uchanganuzi wa bytecode ya Move** — umezimwa kwa chaguomsingi. Soma kanusho kabla ya kuwasha. Ukiwa umezimwa, maoni ya Iliyochanganuliwa na Uchanganuzi hufichwa.",
        "**Ubadilishaji wa funguo za API** — funguo za [geomi.dev](https://geomi.dev) kwa kila mtandao (si lazima) ili kivinjari chako kisikwame kwenye kikomo cha kasi cha pamoja cha wasiojulikana. Funguo hutumwa kama `Authorization: Bearer`. Funguo za mteja za Geomi `AG-*` lazima ziruhusu Origin ya tovuti hii. Weka alama **Kumbuka kwenye kifaa hiki** tu kwenye mashine unayoiamini; vinginevyo funguo hudumu kwa kipindi cha kichupo.",
        "**Mandhari** — mwanga au giza kutoka kidhibiti cha jua/mwezi kwenye kichwa. Huhifadhiwa kwenye kuki (`color_scheme`) na hufuata mfumo ikiwa hujachagua.",
        "**Mtandao** — kichaguzi cha kichwa; husimbwa katika `?network=` badala ya mipangilio.",
      ],
      more: [
        "Hifadhi hutumia funguo za API na uchanganuzi (na lugha) pamoja: wateja walio kwenye akiba hufutwa na maswali husasishwa. **Rejesha chaguomsingi** hufuta mapendeleo haya ya kichunguzi kwenye kivinjari hiki.",
        "Ukiona HTTP **429**, droo ya kikomo cha kasi inaweza kukuelekeza kwenye Mipangilio. Mwili wa Geomi wa *Per anonymous IP rate limit exceeded* unamaanisha hakuna funguo iliyokubaliwa; *Per application per IP rate limit exceeded* unamaanisha kiwango cha funguo yako kimefikiwa.",
      ],
    },
    wallet: {
      title: "Pochi",
      paragraphs: [
        "Kuunganisha pochi si lazima. Itumie kufungua akaunti yako haraka, kuweka stake, kuendesha kazi za kuingia, au kuwasilisha script. Petra imeorodheshwa kwanza kati ya pochi zinazoweza kusakinishwa.",
        "Mtandao wa pochi lazima ulingane na mtandao wa kichunguzi (na ubaguzi mdogo kwa baadhi ya usanidi wa RPC wa ndani/maalum). Mitandao isiyolingana huzuia uwasilishaji ili usisaini kwa mnyororo usio sahihi.",
      ],
    },
    verification: {
      title: "Uthibitishaji wa tokeni na anwani",
      paragraphs: [
        "Kichunguzi kinaweza kuonyesha alama za uthibitishaji kwenye tokeni na baadhi ya anwani. Uorodheshaji wa jamii hupitia [orodha ya tokeni ya Panora](https://github.com/PanoraExchange/Aptos-Tokens). Uthibitishaji wa Labs unahifadhiwa kwa mali asili na tokeni zilizoanzishwa zilizochaguliwa.",
        "Maelekezo ya hatua kwa hatua kwa timu za miradi yako kwenye ukurasa wa [Uthibitishaji wa tokeni na anwani](/verification). Watumiaji bado wanapaswa kuangalia anwani ya aina/metadata, si jina au ikoni pekee.",
      ],
    },
    urls: {
      title: "URL, kushiriki, na mawakala",
      paragraphs: [
        "Pendelea **vichupo vinavyotegemea njia**, kwa mfano `/account/0x1/modules` badala ya hoja `?tab=`. Nakili upau wa anwani ili kushiriki muonekano; weka `?network=` ikiwa hauko kwenye mainnet.",
        "Violezo rasmi vimeandikwa kwa watu hapa na kwa programu katika [`/llms.txt`](/llms.txt). Mawakala ndani ya kivinjari wanaweza kutumia zana za WebMCP za kusoma tu (tafuta, fungua muamala/akaunti/kizuizi/sarafu/matoleo/mwongozo) kivinjari kinapozisaidia.",
        "Kichunguzi kinaposakinishwa kama PWA au kupachikwa (kwa mfano Petra Vault), kidhibiti cha **Shiriki** kinaweza kuonekana kwenye kichwa.",
      ],
    },
    glossary: {
      title: "Kamusi",
      bullets: [
        "**Anwani** — kitambulisho cha akaunti au kitu cha baiti 32, heksadesimali na `0x`. `0x1` ni Aptos Framework.",
        "**ANS** — Aptos Name Service. Jina kama `alice.apt` linalinganishwa na anwani.",
        "**Urefu wa kizuizi** — faharasa ya kizuizi, kuanzia 0.",
        "**Tukio** — kumbukumbu iliyopangwa inayotolewa wakati muamala unapoendeshwa.",
        "**Mali inayoweza kubadilishana (FA)** — kiwango cha tokeni inayoweza kubadilishana kinachotegemea vitu (anwani ya kitu cha metadata).",
        "**Gesi** — ada ya utekelezaji na uhifadhi, inayolipwa kwa APT (octas chini ya uso).",
        "**Indexer** — API ya GraphQL ya Aptos Labs inayotumika kwa historia, wamiliki, na baadhi ya vichupo. Si kila mtandao una indexer.",
        "**Moduli** — msimbo wa Move uliychapishwa. **Kifurushi** huunganisha moduli.",
        "**Kitu** — kitu kwenye mnyororo chenye anwani yake kinachoweza kushikilia rasilimali.",
        "**Octa** — 10⁻⁸ APT. 1 APT = 100,000,000 octas.",
        "**Rasilimali** — data ya Move yenye aina iliyohifadhiwa chini ya akaunti au kitu.",
        "**Nambari ya mlolongo** — kihesabu kwa kila akaunti kinachopanga miamala ya akaunti hiyo.",
        "**Toleo la muamala** — toleo la jumla la kitabu (nambari kamili) linalotolewa muamala unapopangwa.",
        "**Write-set / mabadiliko** — hali muamala uliyoandika.",
      ],
    },
    troubleshooting: {
      title: "Utatuzi wa matatizo",
      bullets: [
        "**Kurasa tupu au zinazozunguka** — angalia kichaguzi cha mtandao na ikiwa uko kwenye Local bila nodi. Jaribu mtandao mwingine au subiri 429.",
        "**Muamala haujapatikana** — thibitisha toleo/hash na mtandao. Matoleo ya zamani sana yanaweza kupakiwa kutoka hifadhi/indexer na sehemu chache.",
        "**Utafutaji haukupata hash iliyopunguzwa** — utafutaji wa hash hutumia nodi kamili kisha hifadhi (bila funguo ya API ya kichunguzi). Indexer haiwezi kutafuta kwa hash.",
        "**Iliyochanganuliwa / Uchanganuzi haipo** — washa uchanganuzi katika [Mipangilio](/settings) na ukubali kanusho.",
        "**Mnyororo usio sahihi** — angalia `?network=` na menyu ya kushuka ya kichwa.",
        "**Matokeo ya utafutaji yaliyopitwa na wakati** — **Futa akiba** kwenye kijachini.",
        "**Takwimu hazipo** — badilisha hadi mainnet.",
        "**Pochi haitumii** — linganisha mtandao wa pochi na wa kichunguzi; unganisha tena baada ya kubadilisha.",
      ],
    },
  },
} as const satisfies EnglishMessages;

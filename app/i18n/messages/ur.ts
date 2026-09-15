import type {MessageTree} from "../translate";

export const ur = {
  chrome: {
    skipToContent: "مرکزی مواد پر جائیں",
    appName: "Aptos Explorer",
    appNameShort: "ایکسپلورر",
    navAriaLabel: "مرکزی نیویگیشن",
    overflowMenuAriaLabel: "نیویگیشن مینو",
    openSettings: "ترتیبات کھولیں",
    openGuide: "صارف گائیڈ کھولیں",
    switchToLight: "لائٹ موڈ میں تبدیل کریں",
    switchToDark: "ڈارک موڈ میں تبدیل کریں",
    nav: {
      transactions: "ٹرانزیکشنز",
      transactionsTitle: "تمام ٹرانزیکشنز دیکھیں",
      analytics: "تجزیات",
      analyticsTitle: "نیٹ ورک تجزیات دیکھیں",
      validators: "ویلیڈیٹرز",
      validatorsTitle: "تمام ویلیڈیٹرز دیکھیں",
      blocks: "بلاکس",
      blocksTitle: "تازہ ترین بلاکس دیکھیں",
      coins: "کوائنز",
      coinsTitle: "کوائنز اور فنگیبل اثاثے دیکھیں",
      releases: "ریلیزز",
      releasesTitle: "نیٹ ورک ڈپلائمنٹس، AIP، اور SDK اور ٹول ریلیزز دیکھیں",
      runScript: "اسکرپٹ چلائیں",
      runScriptTitle: "Move اسکرپٹ بنائیں، سمیولیٹ کریں اور چلائیں (اعلیٰ)",
      settings: "ترتیبات",
      guide: "صارف گائیڈ",
    },
  },
  footer: {
    privacy: "رازداری",
    terms: "شرائط",
    verification: "ٹوکن اور پتے کی تصدیق",
    guide: "صارف گائیڈ",
    clearCache: "کیش صاف کریں",
    cacheCleared: "✓ صاف ہو گیا",
    clearCacheTitle: "تلاش کیش صاف کریں",
    copyrightOwner: "Aptos Labs",
  },
  search: {
    placeholder: "پتے، ٹرانزیکشن، بلاک، کوائن، یا ANS نام سے تلاش کریں",
    helper:
      "اکاؤنٹ پتہ یا نام · ٹرانزیکشن ہیش یا ورژن · بلاک اونچائی · کوائن قسم · ANS نام",
    ariaLabel: "تلاش",
    type: {
      account: "اکاؤنٹ",
      address: "پتہ",
      transaction: "ٹرانزیکشن",
      block: "بلاک",
      coin: "کوائن",
      fungibleAsset: "فنگیبل اثاثہ",
      object: "آبجیکٹ",
      result: "نتیجہ",
    },
  },
  settings: {
    title: "ترتیبات",
    description:
      "اپنے ایکسپلورر کی ترجیحات منظم کریں۔ ترتیبات آپ کے براؤزر میں مقامی طور پر محفوظ ہوتی ہیں۔",
    language: {
      title: "زبان",
      description:
        "منتخب کریں کہ ایکسپلورر کروم، ترتیبات اور صارف گائیڈ کیسے دکھائے۔ براؤزر ڈیفالٹ آپ کے آلے کی زبان استعمال کرتا ہے جب ترجمہ موجود ہو، اور بصورت دیگر انگریزی۔ مزید زبانیں کیٹلاگ کے طور پر شامل کی جا سکتی ہیں بغیر صفحہ URLs تبدیل کیے۔",
      label: "ڈسپلے زبان",
      auto: "براؤزر ڈیفالٹ",
    },
    decompilation: {
      title: "Move بائٹ کوڈ ڈیکمپائلیشن",
      description:
        "آن چین Move بائٹ کوڈ کو انسانی قابلِ مطالعہ سورس میں کلائنٹ سائیڈ ڈیکمپائل کریں۔ یہ WebAssembly کے ذریعے مکمل طور پر آپ کے براؤزر میں چلتا ہے۔",
      ariaLabel: "Move بائٹ کوڈ ڈیکمپائلیشن فعال کریں",
      disclaimerTitle: "دستبرداری — فعال کرنے سے پہلے پڑھیں",
      disclaimerIntro:
        "ڈیکمپائل شدہ نتیجہ آن چین بائٹ کوڈ سے میکانکی طور پر تیار ہوتا ہے اور **اصل سورس کوڈ سے مطابقت نہیں رکھ سکتا**۔ متغیر نام، تبصرے اور کچھ ساختی تفصیلات کمپائل کے دوران ضائع ہو جاتی ہیں اور بحال نہیں ہو سکتی۔ اس فیچر کو فعال کر کے آپ تسلیم کرتے ہیں کہ:",
      bullets: [
        "ڈیکمپائل شدہ نتیجہ **جیسا ہے ویسا صرف معلوماتی مقاصد کے لیے** فراہم کیا جاتا ہے۔",
        "آپ ڈیکمپائل شدہ نتیجے کے استعمال کی ذمہ داری قبول کرتے ہیں۔",
        "نتیجے کو کسی آن چین ماڈیول کے لیے حتمی یا مستند سورس کوڈ نہ سمجھا جائے۔",
      ],
    },
    apiKeys: {
      title: "API کلید اوور رائیڈز",
      whyAriaLabel: "اپنی API کلید کیوں استعمال کریں؟",
      popover:
        "ایکسپلورر ڈیفالٹ طور پر مشترکہ geomi.dev API کلید استعمال کرتا ہے۔ اپنی کلید شامل کرنے سے آپ کو مخصوص ریٹ لمٹ ملتی ہے، جو بھاری براؤزنگ یا HTTP 429 کے جوابات پر مددگار ہے۔",
      popoverManage:
        "کلیدیں [geomi.dev](https://geomi.dev) پر بنائیں اور منظم کریں۔",
      description:
        "ہر نیٹ ورک کے لیے اختیاری geomi.dev API کلیدیں۔ صرف آپ کے براؤزر میں استعمال ہوتی ہیں۔ ڈیفالٹ کلید کے لیے نیٹ ورک خالی چھوڑیں (اگر بلڈ میں موجود ہو)۔ ڈیفالٹ طور پر اوور رائیڈز موجودہ براؤزر سیشن کے لیے محفوظ ہوتے ہیں اور سیشن ختم ہونے پر صاف ہو جاتے ہیں۔",
      fieldLabel: "{network} API کلید",
      fieldPlaceholder: "{network} کے لیے کلید پیسٹ کریں (اختیاری)",
      showKeys: "API کلیدیں دکھائیں",
      hideKeys: "API کلیدیں چھپائیں",
      getKey: "کلید نہیں ہے؟ [geomi.dev سے حاصل کریں](https://geomi.dev)",
      remember: "اس آلے پر API کلیدیں یاد رکھیں",
      rememberWarning:
        "یاد رکھنے سے کلیدیں اس براؤزر کے لوکل اسٹوریج میں محفوظ ہوتی ہیں۔ مشترکہ یا غیر قابلِ اعتماد آلات پر یہ فعال نہ کریں۔",
      notStored:
        "ایکسپلورر ایپلیکیشن سرور کلیدیں محفوظ نہیں کرتا۔ آپ کا براؤزر انہیں صرف کلائنٹ سائیڈ API درخواستوں کے لیے استعمال کرتا ہے۔ بہترین سیکیورٹی کے لیے صرف `https://explorer.aptoslabs.com` Origin فعال اور نافذ کلائنٹ کلیدیں استعمال کریں۔",
      refreshNote:
        "محفوظ کرنے کے بعد موجودہ ڈیٹا ریفریش ہوگا تاکہ نئی درخواستیں فوراً اپ ڈیٹ کلیدیں استعمال کریں۔",
    },
    actions: {
      reset: "ری سیٹ",
      restoreDefaults: "ڈیفالٹ بحال کریں",
      save: "محفوظ کریں",
    },
    metaDescription:
      "Aptos Explorer ترتیبات کنفیگر کریں بشمول زبان، API کلیدیں، ڈیکمپائلیشن ترجیحات اور دیگر اختیارات۔",
  },
  guide: {
    meta: {
      title: "صارف گائیڈ",
      description:
        "Aptos Explorer استعمال کرنے کا طریقہ: تلاش، نیٹ ورکس، ٹرانزیکشنز، اکاؤنٹس، ماڈیولز، ترتیبات، اور جو دیکھتے ہیں اسے پڑھنا۔",
      tocLabel: "اس صفحے پر",
      intro:
        "یہ گائیڈ بتاتی ہے کہ Aptos Explorer کو **کیسے استعمال** کریں، اس کے صفحات کو **کیسے پڑھیں**، اور اپنے براؤزر میں **کیسے کنفیگر** کریں۔ یہ آن چین ڈیٹا تلاش کرنے والوں کے لیے ہے — نوڈ چلانے یا Move لکھنے کے لیے نہیں۔",
    },
    overview: {
      title: "یہ ایکسپلورر کیا ہے",
      paragraphs: [
        "Aptos Explorer Aptos بلاک چین کا سرکاری **بلاک ایکسپلورر** ہے۔ آپ اسے ٹرانزیکشنز، اکاؤنٹس، بلاکس، ویلیڈیٹرز، کوائنز، NFTs اور نیٹ ورک کی حالت تلاش کرنے کے لیے استعمال کرتے ہیں۔ یہ عوامی چین ڈیٹا پڑھتا ہے؛ فنڈز کا تحویل نہیں لیتا اور والیٹ نہیں ہے۔",
        "ہر صفحہ ایک **نیٹ ورک** کے دائرے میں ہے (ڈیفالٹ mainnet)۔ testnet پر ٹرانزیکشن یا اکاؤنٹ mainnet پر اسی شناخت کے مختلف آبجیکٹ ہے۔ نیٹ ورک URL میں `?network=…` کے طور پر محفوظ ہوتا ہے تاکہ کاپی کیے گئے لنکس ایک ہی چین پر رہیں۔",
        "ایکسپلورر ایک ویب سائٹ ہے۔ والیٹ منسلک کرنا اختیاری ہے اور صرف اسٹیکنگ، ماڈیول فنکشن چلانے یا Move اسکرپٹ جمع کرنے جیسے اعمال کے لیے ضروری ہے۔",
      ],
    },
    chrome: {
      title: "نیویگیشن",
      paragraphs: [
        "**ہیڈر** ہر صفحے پر ہے: لوگو (ہوم)، مرکزی نیویگیشن، نیٹ ورک سلیکٹر، اختیاری شیئر بٹن، [صارف گائیڈ](/guide)، [ترتیبات](/settings)، لائٹ/ڈارک تھیم، اور والیٹ کنیکٹ۔ چھوٹی اسکرینوں پر نیویگیشن، ترتیبات، تھیم اور والیٹ مینو بٹن میں ہوتے ہیں۔",
        "ہیڈر کے نیچے زیادہ تر تفصیلی صفحات **واپس** کنٹرول (جب ان ایپ تاریخ موجود ہو) اور **تلاش** فیلڈ دکھاتے ہیں۔ ہوم صفحہ (`/`) وہی میچنگ قواعد کے ساتھ بڑا تلاش سطح ہے۔",
        "**فوٹر** میں رازداری، شرائط، [ٹوکن تصدیق ہدایات](/verification)، یہ گائیڈ، اور **کیش صاف کریں** (براؤزر تلاش نتائج کیش صاف کرتا ہے، بلاک چین نہیں)۔",
      ],
      bullets: [
        "**ٹرانزیکشنز** — حالیہ صارف ٹرانزیکشنز، فلٹرز کے ساتھ۔",
        "**تجزیات** — صرف mainnet چارٹس (TPS، فعال صارفین، گیس، اور مزید)۔",
        "**ویلیڈیٹرز** — ویلیڈیٹر سیٹ اور ڈیلیگیشن پولز۔",
        "**بلاکس** — اونچائی کے حساب سے تازہ ترین بلاکس۔",
        "**کوائنز** — فہرست شدہ کوائنز اور فنگیبل اثاثے۔",
        "**ریلیزز** — لائیو نیٹ ورک ورژنز، AIP، اور SDK/CLI ریلیزز۔",
        "**اسکرپٹ چلائیں** — خام Move اسکرپٹ سمیولیٹ اور جمع کرنے کا اعلیٰ ٹول۔",
      ],
    },
    search: {
      title: "تلاش",
      paragraphs: [
        "[ہوم صفحہ](/) یا ہیڈر میں تلاش باکس میں ٹائپ کریں۔ پہلے entity قسم منتخب کرنا ضروری نہیں — ایکسپلورر آپ کی ان پٹ پہچان لیتا ہے۔",
        "آپ `/?search={query}` کے ذریعے تلاش شیئر بھی کر سکتے ہیں (مثال `/?search=0x1`)۔ اگر URL تلاش کا بالکل ایک واضح نتیجہ ہو تو ہیڈر تلاش فوراً وہاں لے جا سکتی ہے۔",
      ],
      bullets: [
        "**اکاؤنٹ پتہ** (مختصر فارم جیسے `0x1` شامل) — اکاؤنٹ، اور ممکنہ طور پر کوائن، فنگیبل اثاثہ میٹا ڈیٹا، یا Move آبجیکٹ۔",
        "**ANS نام** `.apt` (یا `.petra`) پر ختم — اکاؤنٹ میں resolve ہوتا ہے۔",
        "**ٹرانزیکشن ورژن** (نمبر) یا **ٹرانزیکشن ہیش** (`0x` کے ساتھ 64 hex حروف)۔",
        "**بلاک اونچائی** (چین کی حد میں نمبر)۔",
        "**Move کوائن قسم** جیسے `0x1::aptos_coin::AptosCoin`۔",
        "**ٹوکن نام یا علامت** — فہرست شدہ کوائن سیٹ سے میچ کرتا ہے۔",
        "**صرف emoji متن** — جب لاگو ہو emojicoin مارکیٹس تلاش کرتا ہے۔",
      ],
    },
    networks: {
      title: "نیٹ ورکس",
      paragraphs: [
        "ہیڈر میں نیٹ ورک ڈراپ ڈاؤن استعمال کریں۔ ان ایپ لنکس موجودہ نیٹ ورک برقرار رکھتے ہیں تاکہ خاموشی سے mainnet پر واپس نہ جائیں۔",
        "**Mainnet** پروڈکشن ہے۔ **Testnet** اور **devnet** ترقی کے لیے ہیں (devnet اکثر ری سیٹ ہوتا ہے)۔ **Local** آپ کے مشین پر نوڈ سے بات کرتا ہے (عام طور پر `http://127.0.0.1:8080/v1`)۔ چھپے یا preview نیٹ ورکس feature flag کے ساتھ بلڈ پر نظر آ سکتے ہیں۔",
        "اگر Local منتخب کریں اور نوڈ نہیں چل رہا تو modal `aptos node run-local-testnet` شروع کرنے کا طریقہ بتاتا ہے اور Mainnet پر واپس جانے کا آپشن دیتا ہے۔",
        "کچھ فیچرز صرف mainnet ہیں (تجزیات، کچھ قیمت تخمینے، Sentio traces)۔ GraphQL/indexer ٹیبز ان نیٹ ورکس پر غائب ہو سکتے ہیں جو indexer شائع نہیں کرتے۔",
      ],
    },
    transactions: {
      title: "ٹرانزیکشن پڑھنا",
      paragraphs: [
        "ٹرانزیکشن `/txn/{version}` یا `/txn/{hash}` پر کھولیں۔ **ورژن** ledger sequence نمبر ہے (0 سے integer)۔ **ہیش** 32-byte ٹرانزیکشن ہیش ہے۔ ورژن مستحکم شناخت ہے اگر موجود ہو۔",
        "[ٹرانزیکشنز فہرست](/transactions) حالیہ سرگرمی دکھاتی ہے۔ **User بمقابلہ All** صارف جمع کردہ ٹرانزیکشنز بمقابلہ مکمل stream (بلاک metadata شامل) منتخب کرتا ہے۔ آپ entry function سے صارف ٹرانزیکشنز فلٹر کر سکتے ہیں (URL میں `fn_addr`، `fn_module`، `fn_name`)۔",
        "تفصیلی صفحے پر ٹیبز ٹرانزیکشن قسم پر منحصر ہیں:",
      ],
      bullets: [
        "**جائزہ** — حالت، بھیجنے والا، گیس، فنکشن، اور parsed **Actions** (سوئپس، ٹرانسفرز، وغیرہ)۔",
        "**ادائیگیاں** — صرف جب ایکسپلورر ادائیگی پہچانے (peer-to-peer، پارٹنر کنٹرولڈ hops، confidential transfers، wraps/unwraps، یا exchange legs)۔ خفیہ رقوم چھپی رہتی ہیں۔",
        "**بیلنس تبدیلی** — کوائن اور فنگیبل اثاثہ بیلنس فرق، گیس شامل۔",
        "**ایونٹس** — execution کے دوران logs۔",
        "**Payload** — جمع شدہ payload (entry function، script، multisig، وغیرہ)۔",
        "**تبدیلیاں** — write-set resource تبدیلیاں۔",
        "**ماڈیولز** — جب ٹرانزیکشن Move packages شائع یا upgrade کرے۔",
        "**Trace** — mainnet صارف ٹرانزیکشنز پر تجرباتی Sentio Move call trace۔",
      ],
      more: [
        "ناکام ٹرانزیکشن بھی آن چین موجود رہتی ہے؛ جائزہ خرابی دکھاتا ہے۔ pending ٹرانزیکشنز ابھی بلاک میں ترتیب نہیں پائی۔",
        "اگر serving fullnode پرانے تاریخ **pruned** کر چکا ہو تو ایکسپلورر **archive** نوڈ پر دوبارہ کوشش کرتا ہے، پھر ضرورت پر **indexer** سے reconstruct کرتا ہے۔ indexer-only صفحات payload arguments، events یا hashes چھوڑ سکتے ہیں اور info banner دکھاتے ہیں۔",
      ],
    },
    accounts: {
      title: "اکاؤنٹس، نام، اور آبجیکٹس",
      paragraphs: [
        "**اکاؤنٹ** 32-byte پتہ ہے۔ `/account/{address}` پر کھولیں۔ مختصر hex (`0x1`) قبول ہے۔ [Aptos Names](https://aptosnames.com) (`.apt`) تلاش اور اکاؤنٹ ہیڈر میں پتے resolve کرتے ہیں۔",
        "**Move آبجیکٹ** first-class آن چین entity ہے جو resources رکھ سکتا ہے۔ اگر آپ آبجیکٹ پتہ اکاؤنٹ کے طور پر کھولیں تو ایکسپلورر `/object/{address}` پر redirect کرتا ہے، ملتے جلتے ٹیبز کے ساتھ۔",
        "اکاؤنٹ ٹیبز عام طور پر شامل ہیں:",
      ],
      bullets: [
        "**ٹرانزیکشنز** — اس پتے کی تاریخ، pagination اور اختیاری function فلٹر کے ساتھ۔",
        "**کوائنز** — کوائن بیلنس (اور جہاں لاگو FA views)۔",
        "**ٹوکنز** — NFTs اور ڈیجیٹل اثاثے۔",
        "**Resources** — اکاؤنٹ کے تحت Move resources، JSON میں۔",
        "**ماڈیولز** — شائع packages اور سورس (دیکھیں [ماڈیولز](#modules))۔",
        "**Multisig** — جب اکاؤنٹ multisig ہو (Petra Vault onboarding پیش کیا جا سکتا ہے)۔",
        "**معلومات** — sequence number، authentication key، اور متعلقہ metadata۔",
      ],
      more: [
        "معلوم پتے **لیبل اور آئیکن** دکھا سکتے ہیں (exchanges، framework accounts، وغیرہ)۔ کچھ labeled projects **defunct** یا winding-down banner دکھاتے ہیں — اسے سرمایہ کاری مشورہ نہیں، انتباہ سمجھیں۔",
        "**بیلنس کارڈ** APT دکھاتا ہے۔ mainnet پر عوامی price feed سے USD تخمینہ شامل ہو سکتا ہے۔",
      ],
    },
    modules: {
      title: "Move ماڈیولز اور کوڈ",
      paragraphs: [
        "ماڈیولز ٹیب اکاؤنٹ یا آبجیکٹ کی شائع packages فہرست کرتا ہے۔ آپ **packages**، ماڈیول کے لیے **code**، **Run** (entry functions، والیٹ ضروری)، اور **View** (read-only view functions) کھول سکتے ہیں۔",
        "کوڈ views میں **Published Source** (اگر publisher نے محفوظ کیا)، **ABI**، اور — [ترتیبات](/settings) میں opt in پر — **Decompiled** بائٹ کوڈ اور **Disassembly**۔ ڈیکمپائلیشن آپ کے براؤزر میں چلتی ہے (WebAssembly)۔ یہ reconstruction ہے، اصل تبصرے اور نام نہیں۔",
        "**ورژن سلیکٹر** پہلے publish ٹرانزیکشن پر package دیکھنے دیتا ہے۔ Diff view دو ورژنز کا موازنہ کرتا ہے۔ cross-module لنکس جب نام resolve ہوں تو ایک ہی package میں دوسرے ماڈیولز پر جاتے ہیں۔",
      ],
    },
    blocks: {
      title: "بلاکس",
      paragraphs: [
        "Aptos ٹرانزیکشنز کو **بلاکس** میں **اونچائی** کے حساب سے ترتیب دیتا ہے۔ [بلاکس فہرست](/blocks) حالیہ اونچائیاں دکھاتی ہے۔ بلاک صفحہ (`/block/{height}`) میں **جائزہ** (timestamp، proposer، ٹرانزیکشن count، hashes) اور اس بلاک میں **ٹرانزیکشنز**۔",
        "Pruned بلاکس پرانی ٹرانزیکشنز جیسا archive-node fallback استعمال کرتے ہیں۔ حالیہ بلاکس ٹیبل serving fullnode window میں رہتا ہے۔",
      ],
    },
    validators: {
      title: "ویلیڈیٹرز اور اسٹیکنگ",
      paragraphs: [
        "[ویلیڈیٹرز](/validators) صفحے میں **All Nodes** (موجودہ ویلیڈیٹر سیٹ، voting power، جہاں معلوم location) اور **Delegation** (پولز جن میں stake کر سکتے ہیں)۔ epoch indicator موجودہ epoch دکھاتا ہے۔",
        "پول `/validator/{address}` پر commission، stake، performance، اور — اگر والیٹ منسلک ہو جس میں deposits ہیں — **My Deposits** stake / unstake / restake / withdraw کے ساتھ کھولیں۔ فون پر یہ اعمال ہر deposit کارڈ پر ہیں، صرف desktop table میں نہیں۔",
        "Delegation protocol action ہے: gas خرچ کرتا ہے اور آپ کا والیٹ استعمال کرتا ہے۔ تصدیق سے پہلے رقوم اور lockup پڑھیں۔",
      ],
    },
    assets: {
      title: "کوائنز، فنگیبل اثاثے، اور NFTs",
      paragraphs: [
        "**Coins** اصل Move `0x1::coin` اقسام ہیں (`address::module::Struct`)۔ **فنگیبل اثاثے (FA)** نیا object-based معیار ہیں۔ APT دونوں views میں ہے؛ بہت سے نئے ٹوکنز صرف FA ہیں۔ [کوائنز فہرست](/coins) فہرست شدہ coins اور FAs ملا کرتی ہے۔",
        "کوائن صفحہ `/coin/{type}` (URL-encoded قسم)۔ FA صفحہ `/fungible_asset/{metadataAddress}`۔ ٹیبز عام طور پر **Info**، **Transactions**، اور **Holders** (holders کو indexer support چاہیے)۔",
        "NFTs اور ڈیجیٹل اثاثے `/token/{tokenId}` **Overview** اور **Activities** کے ساتھ۔ banned یا scam collections چھپی یا flagged ہو سکتی ہیں۔",
        "تصدیق badges (native، Labs verified، community/Panora، recognized، unverified، banned) [تصدیق](/verification) صفحے پر وضاحت ہیں۔ badge قیمت یا حفاظت کی ضمانت نہیں۔",
      ],
    },
    analytics: {
      title: "تجزیات",
      paragraphs: [
        "[تجزیات](/analytics) **صرف mainnet**۔ دوسرے نیٹ ورکس چارٹس کی بجائے مختصر پیغام دکھاتے ہیں۔ چارٹس روزانہ صارف ٹرانزیکشنز، peak TPS، فعال صارفین، نئے اکاؤنٹس، deployments، گیس، اور block gap کا احاطہ کرتے ہیں۔ 7-day بمقابلہ 30-day ranges تبدیل کر سکتے ہیں۔",
        "اوپر والی پٹی supply، stake، TPS، اور node counts کا خلاصہ کرتی ہے۔ ڈیٹا شائع chain-stats فائلوں اور live chain queries سے آتا ہے — تھوڑا پیچھے رہ سکتا ہے۔",
      ],
    },
    releases: {
      title: "ریلیزز، AIP، اور ٹولز",
      paragraphs: [
        "[ریلیزز hub](/releases) میں تین ٹیبز: **Networks** (epoch، height، framework/node ورژنز، mainnet، testnet، devnet میں feature flags)، **AIPs** (عوامی AIP repository سے Aptos Improvement Proposals)، **SDKs** (CLI، `aptos-node`، اور سرکاری SDK ریلیزز)۔",
        "پرانے URLs `/deployments` اور `/aips` یہاں redirect کرتے ہیں۔",
      ],
    },
    runScript: {
      title: "اسکرپٹ چلائیں (اعلیٰ)",
      paragraphs: [
        "[اسکرپٹ چلائیں](/run-script) منسلک والیٹ سے compiled Move **script** ٹرانزیکشن بناتا، **سمیولیٹ** اور **execute** کرتا ہے۔ Scripts کا آن چین ABI نہیں، اس لیے argument اقسام خود declare کریں۔ براؤزر میں Move compiler نہیں — قابلِ اعتماد compiler سے bytecode (hex) پیسٹ کریں۔",
        "execute کے بعد ناقابلِ واپسی سمجھیں۔ Execute سے پہلے ہمیشہ simulation (status، gas، events، resource changes) پڑھیں۔ شائع entry functions کے لیے اکاؤنٹ Modules **Run** ٹیب ترجیح دیں۔",
      ],
    },
    configure: {
      title: "کنفیگریشن",
      paragraphs: [
        "[ترتیبات](/settings) کھولیں۔ ترجیحات **اس براؤزر** میں محفوظ ہوتی ہیں، Aptos Labs سرورز پر نہیں۔",
      ],
      bullets: [
        "**زبان** — براؤزر ڈیفالٹ یا واضح زبان۔ یہ ترجمہ شدہ chrome، ترتیبات کا متن، اور یہ گائیڈ کنٹرول کرتی ہے۔ آن چین ڈیٹا (پتے، function نام، events) چین جیسے محفوظ کرتی ہے ویسا رہتا ہے۔",
        "**Move بائٹ کوڈ ڈیکمپائلیشن** — ڈیفالٹ بند۔ فعال کرنے سے پہلے disclaimer پڑھیں۔ بند ہونے پر Decompiled اور Disassembly views چھپے رہتے ہیں۔",
        "**API کلید اوور رائیڈز** — ہر نیٹ ورک کے لیے اختیاری [geomi.dev](https://geomi.dev) کلیدیں تاکہ براؤزر مشترکہ anonymous rate limit پر نہ رہے۔ کلیدیں `Authorization: Bearer` کے طور پر بھیجی جاتی ہیں۔ Geomi `AG-*` کلائنٹ کلیدوں کو اس سائٹ کا Origin allow کرنا چاہیے۔ **اس آلے پر یاد رکھیں** صرف قابلِ اعتماد مشین پر چیک کریں؛ بصورت دیگر کلیدیں tab session تک رہتی ہیں۔",
        "**تھیم** — ہیڈر sun/moon کنٹرول سے لائٹ یا ڈارک۔ cookie (`color_scheme`) میں محفوظ اور اگر منتخب نہیں کیا تو system follow کرتی ہے۔",
        "**نیٹ ورک** — ہیڈر سلیکٹر؛ `?network=` میں encoded، ترتیبات میں نہیں۔",
      ],
      more: [
        "Save API کلیدیں اور ڈیکمپائلیشن (اور زبان) ایک ساتھ لاگو کرتا ہے: cached clients ہٹائے جاتے ہیں اور queries ریفریش ہوتے ہیں۔ **ڈیفالٹ بحال کریں** اس براؤزر میں یہ ایکسپلورر ترجیحات صاف کرتا ہے۔",
        "اگر HTTP **429** دیکھیں تو rate-limit drawer آپ کو ترتیبات بھیج سکتا ہے۔ Geomi body *Per anonymous IP rate limit exceeded* کا مطلب کوئی کلید قبول نہیں ہوئی؛ *Per application per IP rate limit exceeded* کا مطلب آپ کی کلید کی quota ختم ہو گئی۔",
      ],
    },
    wallet: {
      title: "والیٹ",
      paragraphs: [
        "والیٹ منسلک کرنا اختیاری ہے۔ اپنے اکاؤنٹ تیزی سے کھولنے، stake، entry functions چلانے، یا script جمع کرنے کے لیے استعمال کریں۔ Petra قابلِ تنصیب والیٹس میں پہلے فہرست ہے۔",
        "والیٹ کا نیٹ ورک ایکسپلورر نیٹ ورک سے ملنا چاہیے (کچھ local/custom RPC setups کے لیے چھوٹا exception)۔ mismatch networks submission روکتے ہیں تاکہ غلط چین کے لیے sign نہ کریں۔",
      ],
    },
    verification: {
      title: "ٹوکن اور پتے کی تصدیق",
      paragraphs: [
        "ایکسپلورر ٹوکنز اور کچھ پتے پر تصدیق badges دکھا سکتا ہے۔ community listing [Panora token list](https://github.com/PanoraExchange/Aptos-Tokens) سے ہوتی ہے۔ Labs verification native assets اور منتخب established ٹوکنز کے لیے ہے۔",
        "پروجیکٹ ٹیموں کے لیے step-by-step ہدایات [ٹوکن اور پتے کی تصدیق](/verification) صفحے پر ہیں۔ صارفین کو قسم/metadata پتہ بھی چیک کرنا چاہیے، صرف نام یا آئیکن نہیں۔",
      ],
    },
    urls: {
      title: "URLs، شیئرنگ، اور agents",
      paragraphs: [
        "**path-based ٹیبز** ترجیح دیں، مثال `/account/0x1/modules` بجائے `?tab=` query۔ view شیئر کرنے کے لیے address bar کاپی کریں؛ mainnet پر نہیں ہیں تو `?network=` رکھیں۔",
        "canonical templates یہاں humans کے لیے اور [`/llms.txt`](/llms.txt) میں software کے لیے دستاویز ہیں۔ in-browser agents read-only WebMCP tools (تلاش، ٹرانزیکشن/اکاؤنٹ/بلاک/کوائن/ریلیزز/گائیڈ کھولنا) استعمال کر سکتے ہیں جب براؤزر support کرے۔",
        "جب ایکسپلورر PWA کے طور پر انسٹال یا embedded ہو (مثال Petra Vault) تو ہیڈر میں **Share** کنٹرول نظر آ سکتا ہے۔",
      ],
    },
    glossary: {
      title: "فرہنگ",
      bullets: [
        "**پتہ** — 32-byte اکاؤنٹ یا آبجیکٹ شناخت، `0x` کے ساتھ hex۔ `0x1` Aptos Framework ہے۔",
        "**ANS** — Aptos Name Service۔ `alice.apt` جیسا نام پتے سے map ہوتا ہے۔",
        "**بلاک اونچائی** — بلاک کا index، 0 سے شروع۔",
        "**Event** — ٹرانزیکشن چلنے پر structured log۔",
        "**فنگیبل اثاثہ (FA)** — object-based fungible token معیار (metadata object پتہ)۔",
        "**گیس** — execution اور storage کی فیس، APT میں (octas اندر سے)۔",
        "**Indexer** — Aptos Labs GraphQL API تاریخ، holders، اور کچھ ٹیبز کے لیے۔ ہر نیٹ ورک پر نہیں۔",
        "**ماڈیول** — شائع Move کوڈ۔ **Package** ماڈیولز گروپ کرتا ہے۔",
        "**آبجیکٹ** — آن چین entity اپنے پتے کے ساتھ جو resources رکھ سکتی ہے۔",
        "**Octa** — 10⁻⁸ APT۔ 1 APT = 100,000,000 octas۔",
        "**Resource** — typed Move ڈیٹا اکاؤنٹ یا آبجیکٹ کے تحت محفوظ۔",
        "**Sequence number** — فی اکاؤنٹ counter جو اس اکاؤنٹ کی ٹرانزیکشنز ترتیب دیتا ہے۔",
        "**ٹرانزیکشن ورژن** — global ledger ورژن (integer) جب ٹرانزیکشن ترتیب پاتی ہے۔",
        "**Write-set / تبدیلیاں** — state جو ٹرانزیکشن نے لکھی۔",
      ],
    },
    troubleshooting: {
      title: "مسائل کا حل",
      bullets: [
        "**خالی یا گھومتے صفحات** — نیٹ ورک سلیکٹر اور Local بغیر نوڈ چیک کریں۔ دوسرا نیٹ ورک آزمائیں یا 429 کا انتظار کریں۔",
        "**ٹرانزیکشن نہیں ملی** — ورژن/ہیش اور نیٹ ورک تصدیق کریں۔ بہت پرانے ورژنز archive/indexer سے کم fields کے ساتھ لوڈ ہو سکتے ہیں۔",
        "**تلاش pruned ہیش چھوڑ گئی** — ہیش lookup fullnode پھر archive استعمال کرتا ہے (ایکسپلورر API کلید بغیر)۔ Indexer ہیش سے تلاش نہیں کر سکتا۔",
        "**Decompiled / Disassembly غائب** — [ترتیبات](/settings) میں ڈیکمپائلیشن فعال کریں اور disclaimer قبول کریں۔",
        "**غلط چین** — `?network=` اور ہیڈر dropdown دیکھیں۔",
        "**پرانی تلاش hits** — فوٹر **کیش صاف کریں**۔",
        "**تجزیات غائب** — mainnet پر جائیں۔",
        "**والیٹ submit نہیں کرے گا** — والیٹ نیٹ ورک ایکسپلورر سے ملائیں؛ switch کے بعد reconnect کریں۔",
      ],
    },
  },
} as const satisfies MessageTree;

import type {EnglishMessages} from "./en";

export const tr = {
  chrome: {
    skipToContent: "Ana içeriğe geç",
    appName: "Aptos Explorer",
    appNameShort: "Explorer",
    navAriaLabel: "Ana gezinme",
    overflowMenuAriaLabel: "Gezinme menüsü",
    openSettings: "Ayarları aç",
    openGuide: "Kullanıcı kılavuzunu aç",
    switchToLight: "Açık moda geç",
    switchToDark: "Koyu moda geç",
    nav: {
      transactions: "İşlemler",
      transactionsTitle: "Tüm işlemleri görüntüle",
      analytics: "Analitik",
      analyticsTitle: "Ağ analitiğini görüntüle",
      validators: "Doğrulayıcılar",
      validatorsTitle: "Tüm doğrulayıcıları görüntüle",
      blocks: "Bloklar",
      blocksTitle: "En son blokları görüntüle",
      coins: "Coinler",
      coinsTitle: "Coinleri ve fungible varlıkları görüntüle",
      releases: "Sürümler",
      releasesTitle:
        "Ağ dağıtımlarını, AIP'leri ve SDK ile araç sürümlerini görüntüle",
      runScript: "Betik Çalıştır",
      runScriptTitle: "Move betiği oluştur, simüle et ve çalıştır (gelişmiş)",
      settings: "Ayarlar",
      guide: "Kullanıcı Kılavuzu",
    },
  },
  footer: {
    privacy: "Gizlilik",
    terms: "Koşullar",
    verification: "Token ve Adres Doğrulama",
    guide: "Kullanıcı Kılavuzu",
    clearCache: "Önbelleği temizle",
    cacheCleared: "✓ Temizlendi",
    clearCacheTitle: "Arama önbelleğini temizle",
    copyrightOwner: "Aptos Labs",
  },
  search: {
    placeholder: "Adres, txn, blok, coin veya ANS adına göre ara",
    helper:
      "Hesap adresi veya adı · Txn hash veya versiyon · Blok yüksekliği · Coin türü · ANS adı",
    ariaLabel: "ara",
    type: {
      account: "Hesap",
      address: "Adres",
      transaction: "İşlem",
      block: "Blok",
      coin: "Coin",
      fungibleAsset: "Fungible Varlık",
      object: "Nesne",
      result: "Sonuç",
    },
  },
  settings: {
    title: "Ayarlar",
    description:
      "Explorer tercihlerinizi yönetin. Ayarlar tarayıcınızda yerel olarak saklanır.",
    language: {
      title: "Dil",
      description:
        "Explorer'ın arayüzü, ayarları ve kullanıcı kılavuzunu nasıl göstereceğini seçin. Tarayıcı varsayılanı, bir çeviri mevcut olduğunda cihaz dilinizi izler; aksi halde İngilizce kullanılır. Ek diller, sayfa URL'lerini değiştirmeden katalog olarak eklenebilir.",
      label: "Görüntüleme dili",
      auto: "Tarayıcı varsayılanı",
    },
    decompilation: {
      title: "Move Bytecode Dekompilasyonu",
      description:
        "Zincir üzerindeki Move bytecode'un istemci tarafında insan tarafından okunabilir kaynak koda dönüştürülmesini etkinleştirin. Tamamen tarayıcınızda WebAssembly ile çalışır.",
      ariaLabel: "Move bytecode dekompilasyonunu etkinleştir",
      disclaimerTitle: "Sorumluluk reddi — Etkinleştirmeden önce okuyun",
      disclaimerIntro:
        "Dekompile edilmiş çıktı, zincir üzerindeki bytecode'dan mekanik olarak üretilir ve **orijinal kaynak kodla eşleşmeyebilir**. Değişken adları, yorumlar ve bazı yapısal ayrıntılar derleme sırasında kaybolur ve geri kazanılamaz. Bu özelliği etkinleştirdiğinizde şunları kabul ettiğinizi onaylarsınız:",
      bullets: [
        "Dekompile edilmiş çıktı **yalnızca bilgilendirme amaçlı olduğu gibi** sunulur.",
        "Dekompile edilmiş çıktıyı nasıl kullandığınızın sorumluluğunu üstlenirsiniz.",
        "Çıktı, zincir üzerindeki herhangi bir modülün kesin veya yetkili kaynak kodu olarak değerlendirilmemelidir.",
      ],
    },
    apiKeys: {
      title: "API Anahtarı Geçersiz Kılmaları",
      whyAriaLabel: "Neden kendi API anahtarınızı kullanmalısınız?",
      popover:
        "Explorer varsayılan olarak paylaşılan bir geomi.dev API anahtarı kullanır. Kendi anahtarınızı eklemek size ayrılmış bir hız sınırı sağlar; yoğun gezinme yapıyorsanız veya HTTP 429 yanıtları alıyorsanız yardımcı olur.",
      popoverManage:
        "Anahtarları [geomi.dev](https://geomi.dev) adresinde oluşturun ve yönetin.",
      description:
        "Ağ bazında isteğe bağlı geomi.dev API anahtarları. Yalnızca tarayıcınızda kullanılır. Derlemeden gelen varsayılan anahtarı kullanmak için bir ağı boş bırakın (varsa). Varsayılan olarak geçersiz kılmalar geçerli tarayıcı oturumu için saklanır ve oturum sona erdiğinde temizlenir.",
      fieldLabel: "{network} API anahtarı",
      fieldPlaceholder: "{network} için anahtarı yapıştırın (isteğe bağlı)",
      showKeys: "API anahtarlarını göster",
      hideKeys: "API anahtarlarını gizle",
      getKey: "Anahtarınız yok mu? [geomi.dev'den edinin](https://geomi.dev)",
      remember: "API anahtarlarını bu cihazda hatırla",
      rememberWarning:
        "Hatırlama, anahtarları bu tarayıcının yerel depolamasında saklar. Paylaşılan veya güvenilmeyen cihazlarda etkinleştirmeyin.",
      notStored:
        "Anahtarlar explorer uygulama sunucusunda saklanmaz. Tarayıcınız bunları yalnızca istemci tarafı API istekleri için kullanır. En iyi güvenlik için yalnızca `https://explorer.aptoslabs.com` origin'inin etkin ve zorunlu olduğu istemci anahtarları kullanın.",
      refreshNote:
        "Kaydettikten sonra mevcut veriler yenilenir; böylece yeni istekler güncellenmiş anahtarları hemen kullanır.",
    },
    actions: {
      reset: "Sıfırla",
      restoreDefaults: "Varsayılanları Geri Yükle",
      save: "Kaydet",
    },
    metaDescription:
      "Dil, API anahtarları, dekompilasyon tercihleri ve diğer seçenekler dahil Aptos Explorer ayarlarını yapılandırın.",
  },
  guide: {
    meta: {
      title: "Kullanıcı Kılavuzu",
      description:
        "Aptos Explorer nasıl kullanılır: arama, ağlar, işlemler, hesaplar, modüller, ayarlar ve gördüklerinizi nasıl okuyacağınız.",
      tocLabel: "Bu sayfada",
      intro:
        "Bu kılavuz Aptos Explorer'ı nasıl **kullanacağınızı**, gösterdiği sayfaları nasıl **okuyacağınızı** ve tarayıcınızda nasıl **yapılandıracağınızı** açıklar. Zincir üzerindeki verileri arayan kişiler için yazılmıştır — bir düğüm işletmek veya Move yazmak için değil.",
    },
    overview: {
      title: "Bu explorer nedir",
      paragraphs: [
        "Aptos Explorer, Aptos blockchain için resmi **blok gezgini**dir. İşlemleri, hesapları, blokları, doğrulayıcıları, coinleri, NFT'leri ve ağ durumunu aramak için kullanılır. Herkese açık zincir verilerini okur; fonları saklamaz ve bir cüzdan değildir.",
        "Her sayfa bir **ağ** ile kapsamlanır (varsayılan mainnet). Testnetteki bir işlem veya hesap, mainnetteki aynı tanımlayıcıdan farklı bir nesnedir. Ağ, kopyaladığınız bağlantıların aynı zinciri koruyacak şekilde URL'de `?network=…` olarak saklanır.",
        "Explorer bir web sitesidir. Cüzdan bağlamak isteğe bağlıdır ve yalnızca staking, modül fonksiyonu çalıştırma veya Move betiği gönderme gibi işlemler için gerekir.",
      ],
    },
    chrome: {
      title: "Gezinme",
      paragraphs: [
        "**Üst bilgi** her sayfada bulunur: logo (ana sayfa), ana gezinme, ağ seçici, isteğe bağlı paylaş düğmesi, [kullanıcı kılavuzu](/guide), [ayarlar](/settings), açık/koyu tema ve cüzdan bağlantısı. Küçük ekranlarda gezinme, ayarlar, tema ve cüzdan menü düğmesinde yer alır.",
        "Üst bilginin altında çoğu detay sayfasında bir **geri** kontrolü (uygulama içi geçmişiniz varsa) ve bir **arama** alanı görünür. Ana sayfa (`/`) aynı eşleştirme kurallarıyla daha geniş bir arama yüzeyidir.",
        "**Alt bilgi** Gizlilik, Koşullar, [token doğrulama talimatları](/verification), bu kılavuz ve **Önbelleği Temizle** içerir (tarayıcı arama sonucu önbelleğini temizler, blockchain'i değil).",
      ],
      bullets: [
        "**İşlemler** — son kullanıcı işlemleri, filtrelerle.",
        "**Analitik** — yalnızca mainnet grafikleri (TPS, aktif kullanıcılar, gas ve daha fazlası).",
        "**Doğrulayıcılar** — doğrulayıcı seti ve delegasyon havuzları.",
        "**Bloklar** — yüksekliğe göre en son bloklar.",
        "**Coinler** — listelenen coinler ve fungible varlıklar.",
        "**Sürümler** — canlı ağ sürümleri, AIP'ler ve SDK/CLI sürümleri.",
        "**Betik Çalıştır** — ham Move betiğini simüle etmek ve göndermek için gelişmiş araç.",
      ],
    },
    search: {
      title: "Arama",
      paragraphs: [
        "[Ana sayfadaki](/) veya üst bilgideki arama kutusuna yazın. Önce bir varlık türü seçmeniz gerekmez — explorer girdinizi algılar.",
        "Aramayı `/?search={query}` ile de paylaşabilirsiniz (örneğin `/?search=0x1`). URL araması tam olarak tek net sonuç veriyorsa üst bilgi araması sizi doğrudan oraya götürebilir.",
      ],
      bullets: [
        "**Hesap adresi** (`0x1` gibi kısa biçimler dahil) — hesap ve muhtemelen coin, fungible varlık meta verisi veya Move nesnesi.",
        "`.apt` (veya `.petra`) ile biten **ANS adı** — bir hesaba çözümlenir.",
        "**İşlem versiyonu** (bir sayı) veya **işlem hash'i** (`0x` artı 64 onaltılık karakter).",
        "**Blok yüksekliği** (zincirin aralığında bir sayı).",
        "`0x1::aptos_coin::AptosCoin` gibi **Move coin türü**.",
        "**Token adı veya sembolü** — listelenen coin setiyle eşleşir.",
        "**Yalnızca emoji metni** — uygun olduğunda emojicoin pazarlarını arar.",
      ],
    },
    networks: {
      title: "Ağlar",
      paragraphs: [
        "Üst bilgideki ağ açılır menüsünü kullanın. Uygulama içi bağlantılar geçerli ağınızı korur; böylece sessizce mainnet'e geri dönmezsiniz.",
        "**Mainnet** üretim ortamıdır. **Testnet** ve **devnet** geliştirme için kullanılır (devnet sık sık sıfırlanır). **Local**, makinenizdeki bir düğümle konuşur (genellikle `http://127.0.0.1:8080/v1`). Explorer bir özellik bayrağıyla derlendiğinde gizli veya önizleme ağları görünebilir.",
        "Local seçip düğüm çalışmıyorsa bir modal `aptos node run-local-testnet` komutunun nasıl başlatılacağını açıklar ve Mainnet'e geri dönmeyi sunar.",
        "Bazı özellikler yalnızca mainnet'te kullanılabilir (analitik, bazı fiyat tahminleri, Sentio izleri). GraphQL/indexer sekmeleri indexer yayınlamayan ağlarda eksik olabilir.",
      ],
    },
    transactions: {
      title: "İşlem okuma",
      paragraphs: [
        "Bir işlemi `/txn/{version}` veya `/txn/{hash}` adresinde açın. **Versiyon**, defter sıra numarasıdır (0'dan başlayan bir tam sayı). **Hash**, 32 baytlık işlem hash'idir. Elinizde varsa versiyon kararlı tanımlayıcıdır.",
        "[İşlem listesi](/transactions) son etkinliği gösterir. **Kullanıcı ve Tümü**, kullanıcı tarafından gönderilen işlemler ile tam akışı (blok meta verisi dahil) arasında seçim yapar. Kullanıcı işlemlerini giriş fonksiyonuna göre filtreleyebilirsiniz (URL'de `fn_addr`, `fn_module`, `fn_name`).",
        "Detay sayfasında sekmeler işlem türüne bağlıdır:",
      ],
      bullets: [
        "**Genel Bakış** — durum, gönderen, gas, fonksiyon ve ayrıştırılmış **Eylemler** (swap'ler, transferler ve benzerleri).",
        "**Ödemeler** — yalnızca explorer bir ödeme tanıdığında gösterilir (eşler arası, ortak kontrollü atlama, gizli transferler, wrap/unwrap veya borsa bacakları). Gizli tutarlar gizli kalır.",
        "**Bakiye Değişimi** — coin ve fungible varlık bakiye farkları, gas dahil.",
        "**Olaylar** — yürütme sırasında yayınlanan günlükler.",
        "**Payload** — gönderilen payload (giriş fonksiyonu, betik, multisig vb.).",
        "**Değişiklikler** — write-set kaynak değişiklikleri.",
        "**Modüller** — işlem Move paketleri yayınladığında veya yükselttiğinde.",
        "**İz** — mainnet kullanıcı işlemlerinde deneysel Sentio Move çağrı izi.",
      ],
      more: [
        "Başarısız bir işlem yine de zincirde bulunur; genel bakış hatayı gösterir. Bekleyen işlemler henüz bir bloğa sıralanmamıştır.",
        "Hizmet veren fullnode eski geçmişi **budamışsa**, explorer bir **arşiv** düğümünü yeniden dener, gerekirse **indexer**'dan yeniden oluşturur. Yalnızca indexer sayfaları payload argümanlarını, olayları veya hash'leri atlayabilir ve bilgi banner'ı gösterir.",
      ],
    },
    accounts: {
      title: "Hesaplar, adlar ve nesneler",
      paragraphs: [
        "Bir **hesap** 32 baytlık bir adrestir. `/account/{address}` adresinde açın. Kısa hex (`0x1`) kabul edilir. [Aptos Names](https://aptosnames.com) (`.apt`) aramada ve hesap üst bilgisinde adreslere çözümlenir.",
        "Bir **Move nesnesi**, kaynaklara sahip olabilen zincir üzerinde birinci sınıf bir varlıktır. Bir nesne adresini hesap olarak açarsanız explorer benzer sekme setiyle `/object/{address}` adresine yönlendirir.",
        "Hesap sekmeleri genellikle şunları içerir:",
      ],
      bullets: [
        "**İşlemler** — bu adres için geçmiş, sayfalama ve isteğe bağlı fonksiyon filtresiyle.",
        "**Coinler** — coin bakiyeleri (uygun olduğunda ilgili FA görünümleri).",
        "**Tokenlar** — NFT'ler ve dijital varlıklar.",
        "**Kaynaklar** — hesap altında saklanan Move kaynakları, JSON olarak.",
        "**Modüller** — yayınlanan paketler ve kaynak (bkz. [Modüller](#modules)).",
        "**Multisig** — hesap multisig olduğunda (Petra Vault kaydı sunulabilir).",
        "**Bilgi** — sıra numarası, kimlik doğrulama anahtarı ve ilgili meta veriler.",
      ],
      more: [
        "Bilinen adresler **etiket ve simge** gösterebilir (borsalar, framework hesapları vb.). Bazı etiketli projeler **kullanım dışı** veya kapanma banner'ı gösterir — bunu uyarı olarak değerlendirin, yatırım tavsiyesi değil.",
        "**Bakiye kartı** APT gösterir. Mainnet'te kamuya açık bir fiyat kaynağından USD tahmini içerebilir.",
      ],
    },
    modules: {
      title: "Move modülleri ve kod",
      paragraphs: [
        "Modüller sekmesi bir hesap veya nesne tarafından yayınlanan paketleri listeler. **Paketler**, bir modül için **kod**, **Çalıştır** (giriş fonksiyonları, cüzdan gerekir) ve **Görüntüle** (salt okunur view fonksiyonları) açabilirsiniz.",
        "Kod görünümleri **Yayınlanan Kaynak** (yayıncı sakladıysa), **ABI** ve — [Ayarlar](/settings) altında etkinleştirdiğinizde — **Dekompile** bytecode ve **Disassembly** içerir. Dekompilasyon tarayıcınızda (WebAssembly) çalışır. Orijinal yorumlar ve adların yeniden yapılandırmasıdır.",
        "Bir **sürüm seçici**, paketi daha önceki bir yayın işleminde incelemenizi sağlar. Fark görünümü iki sürümü karşılaştırır. Modüller arası bağlantılar adlar çözümlendiğinde aynı paketteki diğer modüllere atlar.",
      ],
    },
    blocks: {
      title: "Bloklar",
      paragraphs: [
        "Aptos işlemleri **yüksekliğe** göre sıralanan **bloklar** halinde gruplar. [Blok listesi](/blocks) son yükseklikleri gösterir. Bir blok sayfası (`/block/{height}`) **Genel Bakış** (zaman damgası, öneren, işlem sayısı, hash'ler) ve o bloktaki **İşlemler** içerir.",
        "Budanan bloklar eski işlemlerle aynı arşiv düğümü yedeklemesini izler. Son bloklar tablosu hizmet veren fullnode penceresinde kalır.",
      ],
    },
    validators: {
      title: "Doğrulayıcılar ve staking",
      paragraphs: [
        "[Doğrulayıcılar](/validators) sayfasında **Tüm Düğümler** (geçerli doğrulayıcı seti, oy gücü, biliniyorsa konum) ve **Delegasyon** (stake yapabileceğiniz havuzlar) bulunur. Bir epoch göstergesi geçerli epoch'u gösterir.",
        "Komisyon, stake, performans ve — yatırımları olan bir cüzdan bağladığınızda — stake / unstake / restake / çekme ile **Yatırımlarım** için `/validator/{address}` adresinde bir havuz açın. Telefonda bu işlemler yalnızca masaüstü tablosunda değil, her yatırım kartında yer alır.",
        "Delegasyon bir protokol işlemidir: gas harcar ve cüzdanınızı kullanır. Onaylamadan önce tutarları ve kilitlemeyi okuyun.",
      ],
    },
    assets: {
      title: "Coinler, fungible varlıklar ve NFT'ler",
      paragraphs: [
        "**Coinler** orijinal Move `0x1::coin` türleridir (`address::module::Struct`). **Fungible varlıklar (FA)** daha yeni nesne tabanlı standarttır. APT her iki görünümde de bulunur; birçok yeni token yalnızca FA'dır. [Coin listesi](/coins) listelenen coinleri ve FA'ları karıştırır.",
        "Bir coin sayfası `/coin/{type}` (URL kodlu tür). Bir FA sayfası `/fungible_asset/{metadataAddress}`. Sekmeler genellikle **Bilgi**, **İşlemler** ve **Sahipler** içerir (sahipler indexer desteği gerektirir).",
        "NFT'ler ve dijital varlıklar **Genel Bakış** ve **Etkinlikler** ile `/token/{tokenId}` kullanır. Yasaklı veya dolandırıcılık koleksiyonları gizlenebilir veya işaretlenebilir.",
        "Doğrulama rozetleri (native, Labs doğrulamalı, topluluk/Panora, tanınmış, doğrulanmamış, yasaklı) [doğrulama](/verification) sayfasında açıklanır. Bir rozet değer veya güvenlik garantisi değildir.",
      ],
    },
    analytics: {
      title: "Analitik",
      paragraphs: [
        "[Analitik](/analytics) **yalnızca mainnet**'tir. Diğer ağlar grafikler yerine kısa bir mesaj gösterir. Grafikler günlük kullanıcı işlemleri, tepe TPS, aktif kullanıcılar, yeni hesaplar, dağıtımlar, gas ve blok aralığını kapsar. 7 günlük ve 30 günlük aralıklar arasında geçiş yapabilirsiniz.",
        "Üstteki şerit arz, stake, TPS ve düğüm sayılarını özetler. Veriler yayınlanan zincir istatistik dosyaları ve canlı zincir sorgularından gelir — biraz gecikmeli olabilir.",
      ],
    },
    releases: {
      title: "Sürümler, AIP'ler ve araçlar",
      paragraphs: [
        "[Sürümler merkezi](/releases) üç sekme içerir: **Ağlar** (epoch, yükseklik, framework/düğüm sürümleri, mainnet, testnet ve devnet genelinde özellik bayrakları), **AIP'ler** (kamuya açık AIP deposundan Aptos İyileştirme Önerileri) ve **SDK'lar** (CLI, `aptos-node` ve resmi SDK sürümleri).",
        "Eski URL'ler `/deployments` ve `/aips` buraya yönlendirir.",
      ],
    },
    runScript: {
      title: "Betik Çalıştır (gelişmiş)",
      paragraphs: [
        "[Betik Çalıştır](/run-script), bağlı bir cüzdandan derlenmiş Move **betik** işlemini oluşturur, **simüle** eder ve **çalıştırır**. Betiklerin zincir üzerinde ABI'si yoktur; argüman türlerini kendiniz bildirmelisiniz. Tarayıcıda Move derleyicisi yoktur — güvendiğiniz bir derleyiciden bytecode (hex) yapıştırın.",
        "Çalıştırıldıktan sonra geri alınamaz olarak değerlendirin. Çalıştır'dan önce her zaman simülasyonu (durum, gas, olaylar, kaynak değişiklikleri) okuyun. Yayınlanmış giriş fonksiyonları için hesap Modüller **Çalıştır** sekmesini tercih edin.",
      ],
    },
    configure: {
      title: "Yapılandırma",
      paragraphs: [
        "[Ayarlar](/settings)'ı açın. Tercihler **bu tarayıcıda** saklanır, Aptos Labs sunucularında değil.",
      ],
      bullets: [
        "**Dil** — Tarayıcı varsayılanı veya açık bir dil. Çevrilmiş arayüzü, ayar metnini ve bu kılavuzu kontrol eder. Zincir üzerindeki veriler (adresler, fonksiyon adları, olaylar) zincirin sakladığı şekilde kalır.",
        "**Move bytecode dekompilasyonu** — varsayılan olarak kapalı. Etkinleştirmeden önce sorumluluk reddini okuyun. Kapalı olduğunda Dekompile ve Disassembly görünümleri gizlenir.",
        "**API anahtarı geçersiz kılmaları** — tarayıcınızın paylaşılan anonim hız sınırında takılı kalmaması için ağ bazında isteğe bağlı [geomi.dev](https://geomi.dev) anahtarları. Anahtarlar `Authorization: Bearer` olarak gönderilir. Geomi `AG-*` istemci anahtarları bu sitenin Origin'ine izin vermelidir. **Bu cihazda hatırla**'yı yalnızca güvendiğiniz bir makinede işaretleyin; aksi halde anahtarlar sekme oturumu süresince geçerlidir.",
        "**Tema** — üst bilgi güneş/ay kontrolünden açık veya koyu. Bir çerezde (`color_scheme`) saklanır ve seçim yapmadıysanız sistemi izler.",
        "**Ağ** — üst bilgi seçici; ayarlarda değil `?network=` ile kodlanır.",
      ],
      more: [
        "Kaydet API anahtarlarını ve dekompilasyonu (ve dil) birlikte uygular: önbelleğe alınmış istemciler atılır ve sorgular yenilenir. **Varsayılanları Geri Yükle** bu explorer tercihlerini bu tarayıcıda temizler.",
        "HTTP **429** görürseniz hız sınırı çekmecesi sizi Ayarlar'a gönderebilir. Geomi gövdesinde *Per anonymous IP rate limit exceeded* hiçbir anahtarın kabul edilmediği anlamına gelir; *Per application per IP rate limit exceeded* anahtarınızın kotasının dolduğu anlamına gelir.",
      ],
    },
    wallet: {
      title: "Cüzdan",
      paragraphs: [
        "Cüzdan bağlamak isteğe bağlıdır. Hesabınızı hızlıca açmak, stake yapmak, giriş fonksiyonları çalıştırmak veya betik göndermek için kullanın. Petra yüklenebilir cüzdanlar arasında ilk sıradadır.",
        "Cüzdanın ağı explorer ağıyla eşleşmelidir (bazı yerel/özel RPC kurulumlarında küçük bir istisna vardır). Eşleşmeyen ağlar gönderimi engeller; böylece yanlış zincir için imza atmazsınız.",
      ],
    },
    verification: {
      title: "Token ve adres doğrulama",
      paragraphs: [
        "Explorer tokenlarda ve bazı adreslerde doğrulama rozetleri gösterebilir. Topluluk listelemesi [Panora token listesi](https://github.com/PanoraExchange/Aptos-Tokens) üzerinden yapılır. Labs doğrulaması native varlıklar ve seçilmiş yerleşik tokenlar için ayrılmıştır.",
        "Proje ekipleri için adım adım talimatlar [Token ve Adres Doğrulama](/verification) sayfasında bulunur. Kullanıcılar yalnızca ad veya simgeye değil, tür/meta veri adresini de kontrol etmelidir.",
      ],
    },
    urls: {
      title: "URL'ler, paylaşım ve aracılar",
      paragraphs: [
        "`?tab=` sorgusu yerine **yol tabanlı sekmeleri** tercih edin, örneğin `/account/0x1/modules`. Bir görünümü paylaşmak için adres çubuğunu kopyalayın; mainnet'te değilseniz `?network=` koruyun.",
        "Kanonical şablonlar burada insanlar için ve [`/llms.txt`](/llms.txt) dosyasında yazılım için belgelenmiştir. Tarayıcı içi aracılar, tarayıcı desteklediğinde salt okunur WebMCP araçlarını (arama, işlem/hesap/blok/coin/sürümler/kılavuz açma) kullanabilir.",
        "Explorer PWA olarak yüklendiğinde veya gömüldüğünde (örneğin Petra Vault) üst bilgide bir **Paylaş** kontrolü görünebilir.",
      ],
    },
    glossary: {
      title: "Sözlük",
      bullets: [
        "**Adres** — `0x` ile hex 32 baytlık hesap veya nesne tanımlayıcısı. `0x1` Aptos Framework'tür.",
        "**ANS** — Aptos Name Service. `alice.apt` gibi bir ad bir adrese karşılık gelir.",
        "**Blok yüksekliği** — 0'dan başlayan bir blok indeksi.",
        "**Olay** — bir işlem çalışırken yayınlanan yapılandırılmış günlük.",
        "**Fungible varlık (FA)** — nesne tabanlı fungible token standardı (meta veri nesne adresi).",
        "**Gas** — yürütme ve depolama ücreti, APT ile ödenir (altta octa).",
        "**Indexer** — geçmiş, sahipler ve bazı sekmeler için kullanılan Aptos Labs GraphQL API'si. Her ağda yoktur.",
        "**Modül** — yayınlanmış Move kodu. Bir **paket** modülleri gruplar.",
        "**Nesne** — kaynak tutabilen kendi adresine sahip zincir üzeri varlık.",
        "**Octa** — 10⁻⁸ APT. 1 APT = 100.000.000 octa.",
        "**Kaynak** — hesap veya nesne altında saklanan tiplenmiş Move verisi.",
        "**Sıra numarası** — o hesabın işlemlerini sıralayan hesap bazlı sayaç.",
        "**İşlem versiyonu** — bir işlem sıralandığında atanan global defter versiyonu (tam sayı).",
        "**Write-set / değişiklikler** — işlemin yazdığı durum.",
      ],
    },
    troubleshooting: {
      title: "Sorun giderme",
      bullets: [
        "**Boş veya dönen sayfalar** — ağ seçicisini ve düğüm olmadan Local'de olup olmadığınızı kontrol edin. Başka bir ağ deneyin veya 429'u bekleyin.",
        "**İşlem bulunamadı** — versiyon/hash ve ağı doğrulayın. Çok eski versiyonlar arşiv/indexer'dan daha az alanla yüklenebilir.",
        "**Arama budanmış hash'i kaçırdı** — hash araması fullnode'u sonra arşivi kullanır (explorer API anahtarı olmadan). Indexer hash ile arama yapamaz.",
        "**Dekompile / Disassembly eksik** — [Ayarlar](/settings)'da dekompilasyonu etkinleştirin ve sorumluluk reddini kabul edin.",
        "**Yanlış zincir** — `?network=` ve üst bilgi açılır menüsüne bakın.",
        "**Eski arama sonuçları** — alt bilgi **Önbelleği Temizle**.",
        "**Analitik eksik** — mainnet'e geçin.",
        "**Cüzdan göndermiyor** — cüzdan ağını explorer ile eşleştirin; geçişten sonra yeniden bağlanın.",
      ],
    },
  },
} as const satisfies EnglishMessages;

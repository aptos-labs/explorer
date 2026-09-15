import type {EnglishMessages} from "./en";

export const ms = {
  chrome: {
    skipToContent: "Langkau ke kandungan utama",
    appName: "Aptos Explorer",
    appNameShort: "Explorer",
    navAriaLabel: "Navigasi utama",
    overflowMenuAriaLabel: "Menu navigasi",
    openSettings: "Buka tetapan",
    openGuide: "Buka panduan pengguna",
    switchToLight: "Tukar ke mod cerah",
    switchToDark: "Tukar ke mod gelap",
    nav: {
      transactions: "Transaksi",
      transactionsTitle: "Lihat Semua Transaksi",
      analytics: "Analitik",
      analyticsTitle: "Lihat Analitik Rangkaian",
      validators: "Validator",
      validatorsTitle: "Lihat Semua Validator",
      blocks: "Blok",
      blocksTitle: "Lihat Blok Terkini",
      coins: "Koin",
      coinsTitle: "Lihat Koin & Aset Fungible",
      releases: "Keluaran",
      releasesTitle:
        "Lihat Pelaksanaan Rangkaian, AIP, dan Keluaran SDK & Alat",
      runScript: "Jalankan Skrip",
      runScriptTitle: "Bina, Simulasikan, dan Laksanakan Skrip Move (Lanjutan)",
      settings: "Tetapan",
      guide: "Panduan Pengguna",
    },
  },
  footer: {
    privacy: "Privasi",
    terms: "Terma",
    verification: "Pengesahan Token & Alamat",
    guide: "Panduan Pengguna",
    clearCache: "Kosongkan Cache",
    cacheCleared: "✓ Dikosongkan",
    clearCacheTitle: "Kosongkan cache carian",
    copyrightOwner: "Aptos Labs",
  },
  search: {
    placeholder: "Cari mengikut alamat, txn, blok, koin, atau nama ANS",
    helper:
      "Alamat atau nama akaun · Hash atau versi txn · Ketinggian blok · Jenis koin · Nama ANS",
    ariaLabel: "cari",
    type: {
      account: "Akaun",
      address: "Alamat",
      transaction: "Transaksi",
      block: "Blok",
      coin: "Koin",
      fungibleAsset: "Aset Fungible",
      object: "Objek",
      result: "Hasil",
    },
  },
  settings: {
    title: "Tetapan",
    description:
      "Urus keutamaan explorer anda. Tetapan disimpan secara tempatan dalam pelayar anda.",
    language: {
      title: "Bahasa",
      description:
        "Pilih cara explorer memaparkan antara muka, tetapan, dan panduan pengguna. Lalai pelayar mengikuti bahasa peranti anda apabila terjemahan wujud; jika tidak, bahasa Inggeris digunakan. Bahasa tambahan boleh ditambah sebagai katalog tanpa menukar URL halaman.",
      label: "Bahasa paparan",
      auto: "Lalai pelayar",
    },
    decompilation: {
      title: "Penyahkompilasian Bytecode Move",
      description:
        "Dayakan penyahkompilasian bytecode Move on-chain di pihak klien kepada kod sumber yang mudah dibaca. Berjalan sepenuhnya dalam pelayar anda melalui WebAssembly.",
      ariaLabel: "Dayakan penyahkompilasian bytecode Move",
      disclaimerTitle: "Penafian — Sila baca sebelum mendayakan",
      disclaimerIntro:
        "Output yang disahkompilasi dijana secara mekanikal daripada bytecode on-chain dan **mungkin tidak sepadan** dengan kod sumber asal. Nama pembolehubah, komen, dan beberapa butiran struktur hilang semasa kompilasi dan tidak boleh dipulihkan. Dengan mendayakan ciri ini, anda mengakui bahawa:",
      bullets: [
        "Output yang disahkompilasi disediakan **seadanya untuk tujuan maklumat sahaja**.",
        "Anda menerima tanggungjawab atas cara anda menggunakan output yang disahkompilasi.",
        "Output tidak boleh dianggap sebagai kod sumber muktamad atau autoritatif untuk sebarang modul on-chain.",
      ],
    },
    apiKeys: {
      title: "Gantian Kunci API",
      whyAriaLabel: "Mengapa menggunakan kunci API sendiri?",
      popover:
        "Explorer menggunakan kunci API geomi.dev kongsi secara lalai. Menambah kunci anda sendiri memberi had kadar khusus, yang membantu jika anda melayari dengan kerap atau menerima respons HTTP 429.",
      popoverManage: "Cipta dan urus kunci di [geomi.dev](https://geomi.dev).",
      description:
        "Kunci API geomi.dev pilihan bagi setiap rangkaian. Digunakan hanya dalam pelayar anda. Biarkan rangkaian kosong untuk menggunakan kunci lalai daripada binaan (jika ada). Secara lalai, gantian disimpan untuk sesi pelayar semasa dan dikosongkan apabila sesi tamat.",
      fieldLabel: "Kunci API {network}",
      fieldPlaceholder: "Tampal kunci untuk {network} (pilihan)",
      showKeys: "Tunjukkan kunci API",
      hideKeys: "Sembunyikan kunci API",
      getKey: "Tiada kunci? [Dapatkan di geomi.dev](https://geomi.dev)",
      remember: "Ingat kunci API pada peranti ini",
      rememberWarning:
        "Mengingati kunci menyimpannya dalam storan tempatan pelayar ini. Elakkan mendayakan ini pada peranti kongsi atau yang tidak dipercayai.",
      notStored:
        "Kunci tidak disimpan oleh pelayan aplikasi explorer. Pelayar anda hanya menggunakannya untuk permintaan API pihak klien. Untuk keselamatan terbaik, gunakan kunci klien dengan hanya origin `https://explorer.aptoslabs.com` didayakan dan dikuatkuasakan.",
      refreshNote:
        "Data sedia ada akan dimuat semula selepas simpan supaya permintaan baharu segera menggunakan kunci yang dikemas kini.",
    },
    actions: {
      reset: "Set Semula",
      restoreDefaults: "Pulihkan Lalai",
      save: "Simpan",
    },
    metaDescription:
      "Konfigurasi tetapan Aptos Explorer termasuk bahasa, kunci API, keutamaan penyahkompilasian, dan pilihan lain.",
  },
  guide: {
    meta: {
      title: "Panduan Pengguna",
      description:
        "Cara menggunakan Aptos Explorer: carian, rangkaian, transaksi, akaun, modul, tetapan, dan cara membaca apa yang anda lihat.",
      tocLabel: "Pada halaman ini",
      intro:
        "Panduan ini menerangkan cara **menggunakan** Aptos Explorer, cara **membaca** halaman yang dipaparkan, dan cara **mengkonfigurasi** dalam pelayar anda. Ditulis untuk orang yang mencari data on-chain — bukan untuk mengendalikan nod atau menulis Move.",
    },
    overview: {
      title: "Apakah explorer ini",
      paragraphs: [
        "Aptos Explorer ialah **block explorer** rasmi untuk blockchain Aptos. Anda menggunakannya untuk mencari transaksi, akaun, blok, validator, koin, NFT, dan status rangkaian. Explorer membaca data rantaian awam; ia tidak mengambil alih dana dan bukan dompet.",
        "Setiap halaman terikat pada **rangkaian** (mainnet secara lalai). Transaksi atau akaun di testnet ialah objek berbeza daripada pengecam yang sama di mainnet. Rangkaian disimpan dalam URL sebagai `?network=…` supaya pautan yang anda salin mengekalkan rantaian yang sama.",
        "Explorer ialah laman web. Menyambung dompet adalah pilihan dan hanya diperlukan untuk tindakan seperti staking, menjalankan fungsi modul, atau menghantar skrip Move.",
      ],
    },
    chrome: {
      title: "Cara menavigasi",
      paragraphs: [
        "**Header** ada pada setiap halaman: logo (laman utama), navigasi utama, pemilih rangkaian, butang kongsi pilihan, [panduan pengguna](/guide), [tetapan](/settings), tema cerah/gelap, dan sambung dompet. Pada skrin kecil, navigasi, tetapan, tema, dan dompet berada dalam butang menu.",
        "Di bawah header, kebanyakan halaman butiran memaparkan kawalan **kembali** (apabila anda ada sejarah dalam aplikasi) dan medan **carian**. Halaman laman utama (`/`) ialah permukaan carian yang lebih besar dengan peraturan padanan yang sama.",
        "**Footer** mengandungi Privasi, Terma, [arahan pengesahan token](/verification), panduan ini, dan **Kosongkan Cache** (mengosongkan cache hasil carian pelayar, bukan blockchain).",
      ],
      bullets: [
        "**Transaksi** — transaksi pengguna terkini, dengan penapis.",
        "**Analitik** — carta mainnet sahaja (TPS, pengguna aktif, gas, dan banyak lagi).",
        "**Validator** — set validator dan kolam delegasi.",
        "**Blok** — blok terkini mengikut ketinggian.",
        "**Koin** — koin dan aset fungible tersenarai.",
        "**Keluaran** — versi rangkaian langsung, AIP, dan keluaran SDK/CLI.",
        "**Jalankan Skrip** — alat lanjutan untuk mensimulasikan dan menghantar skrip Move mentah.",
      ],
    },
    search: {
      title: "Carian",
      paragraphs: [
        "Taip dalam kotak carian di [halaman utama](/) atau dalam header. Anda tidak perlu memilih jenis entiti dahulu — explorer mengesan apa yang anda masukkan.",
        "Anda juga boleh berkongsi carian dengan `/?search={query}` (contohnya `/?search=0x1`). Jika carian URL mempunyai tepat satu hasil yang jelas, carian header mungkin membawa anda ke sana serta-merta.",
      ],
      bullets: [
        "**Alamat akaun** (termasuk bentuk pendek seperti `0x1`) — akaun, dan mungkin koin, metadata aset fungible, atau objek Move.",
        "**Nama ANS** yang berakhiran `.apt` (atau `.petra`) — diselesaikan kepada akaun.",
        "**Versi transaksi** (nombor) atau **hash transaksi** (`0x` ditambah 64 aksara heksadesimal).",
        "**Ketinggian blok** (nombor dalam julat rantaian).",
        "**Jenis koin Move** seperti `0x1::aptos_coin::AptosCoin`.",
        "**Nama atau simbol token** — sepadan dengan set koin tersenarai.",
        "**Teks emoji sahaja** — mencari pasaran emojicoin apabila berkenaan.",
      ],
    },
    networks: {
      title: "Rangkaian",
      paragraphs: [
        "Gunakan dropdown rangkaian dalam header. Pautan dalam aplikasi mengekalkan rangkaian semasa supaya anda tidak secara senyap kembali ke mainnet.",
        "**Mainnet** ialah produksi. **Testnet** dan **devnet** untuk pembangunan (devnet kerap diset semula). **Local** berkomunikasi dengan nod pada mesin anda (biasanya `http://127.0.0.1:8080/v1`). Rangkaian tersembunyi atau pratonton mungkin muncul apabila explorer dibina dengan bendera ciri.",
        "Jika anda memilih Local dan nod tidak berjalan, modal menerangkan cara memulakan `aptos node run-local-testnet` dan menawarkan pertukaran kembali ke Mainnet.",
        "Sesetengah ciri mainnet sahaja (analitik, beberapa anggaran harga, jejak Sentio). Tab GraphQL/indeks mungkin tiada pada rangkaian yang tidak menerbitkan indeks.",
      ],
    },
    transactions: {
      title: "Membaca transaksi",
      paragraphs: [
        "Buka transaksi di `/txn/{version}` atau `/txn/{hash}`. **Versi** ialah nombor urutan lejar (integer bermula dari 0). **Hash** ialah hash transaksi 32 bait. Versi ialah pengecam stabil jika anda memilikinya.",
        "[Senarai transaksi](/transactions) memaparkan aktiviti terkini. **Pengguna vs Semua** memilih transaksi yang dihantar pengguna berbanding aliran penuh (termasuk metadata blok). Anda boleh menapis transaksi pengguna mengikut fungsi entry (`fn_addr`, `fn_module`, `fn_name` dalam URL).",
        "Pada halaman butiran, tab bergantung pada jenis transaksi:",
      ],
      bullets: [
        "**Gambaran Keseluruhan** — status, penghantar, gas, fungsi, dan **Tindakan** yang diuraikan (swap, pemindahan, dan seumpamanya).",
        "**Pembayaran** — dipaparkan hanya apabila explorer mengenal pasti pembayaran (rakan ke rakan, lompatan terkawal rakan kongsi, pemindahan sulit, wrap/unwrap, atau kaki exchange). Jumlah sulit kekal disembunyikan.",
        "**Perubahan Baki** — perbezaan baki koin dan aset fungible, termasuk gas.",
        "**Event** — log yang dipancarkan semasa pelaksanaan.",
        "**Payload** — payload yang dihantar (fungsi entry, skrip, multisig, dan sebagainya).",
        "**Perubahan** — perubahan sumber write-set.",
        "**Modul** — apabila transaksi menerbitkan atau menaik taraf pakej Move.",
        "**Trace** — jejak panggilan Move Sentio eksperimen pada transaksi pengguna mainnet.",
      ],
      more: [
        "Transaksi yang gagal masih wujud on-chain; gambaran keseluruhan memaparkan ralat. Transaksi menunggu belum lagi diaturkan ke dalam blok.",
        "Jika fullnode yang melayani telah **memangkas** sejarah lama, explorer mencuba semula nod **arkib**, kemudian membina semula daripada **indeks** jika perlu. Halaman indeks sahaja mungkin membuang argumen payload, event, atau hash, dan memaparkan banner maklumat.",
      ],
    },
    accounts: {
      title: "Akaun, nama, dan objek",
      paragraphs: [
        "**Akaun** ialah alamat 32 bait. Buka di `/account/{address}`. Hex pendek (`0x1`) diterima. [Aptos Names](https://aptosnames.com) (`.apt`) diselesaikan kepada alamat dalam carian dan header akaun.",
        "**Objek Move** ialah entiti on-chain peringkat pertama yang boleh memiliki sumber. Jika anda membuka alamat objek sebagai akaun, explorer mengalihkan ke `/object/{address}` dengan set tab serupa.",
        "Tab akaun biasanya termasuk:",
      ],
      bullets: [
        "**Transaksi** — sejarah untuk alamat ini, dengan penomboran halaman dan penapis fungsi pilihan.",
        "**Koin** — baki koin (dan paparan FA berkaitan jika berkenaan).",
        "**Token** — NFT dan aset digital.",
        "**Resource** — sumber Move yang disimpan di bawah akaun, sebagai JSON.",
        "**Modul** — pakej diterbitkan dan kod sumber (lihat [Modul](#modules)).",
        "**Multisig** — apabila akaun ialah multisig (onboarding Petra Vault mungkin ditawarkan).",
        "**Info** — nombor urutan, kunci pengesahan, dan metadata berkaitan.",
      ],
      more: [
        "Alamat yang dikenali boleh memaparkan **label dan ikon** (exchange, akaun framework, dan sebagainya). Sesetengah projek berlabel memaparkan banner **defunct** atau penutupan — anggap itu amaran, bukan nasihat pelaburan.",
        "**Kad baki** memaparkan APT. Pada mainnet ia mungkin termasuk anggaran USD daripada suapan harga awam.",
      ],
    },
    modules: {
      title: "Modul Move dan kod",
      paragraphs: [
        "Tab Modul menyenaraikan pakej yang diterbitkan oleh akaun atau objek. Anda boleh membuka **pakej**, **kod** untuk modul, **Jalankan** (fungsi entry, dompet diperlukan), dan **Lihat** (fungsi view baca sahaja).",
        "Paparan kod termasuk **Published Source** (jika penerbit menyimpannya), **ABI**, dan — apabila anda memilih masuk di [Tetapan](/settings) — bytecode **Decompiled** dan **Disassembly**. Penyahkompilasian berjalan dalam pelayar anda (WebAssembly). Ia ialah pembinaan semula, bukan komen dan nama asal.",
        "**Pemilih versi** membolehkan anda memeriksa pakej pada transaksi penerbitan terdahulu. Paparan diff membandingkan dua versi. Pautan merentas modul melompat ke modul lain dalam pakej yang sama apabila nama diselesaikan.",
      ],
    },
    blocks: {
      title: "Blok",
      paragraphs: [
        "Aptos mengelompokkan transaksi ke dalam **blok** yang diaturkan mengikut **ketinggian**. [Senarai blok](/blocks) memaparkan ketinggian terkini. Halaman blok (`/block/{height}`) mempunyai **Gambaran Keseluruhan** (cap masa, proposer, bilangan transaksi, hash) dan **Transaksi** dalam blok tersebut.",
        "Blok yang dipangkas mengikuti fallback nod arkib yang sama seperti transaksi lama. Jadual blok terkini kekal pada tetingkap fullnode yang melayani.",
      ],
    },
    validators: {
      title: "Validator dan staking",
      paragraphs: [
        "Halaman [validator](/validators) mempunyai **Semua Nod** (set validator semasa, kuasa undi, lokasi jika diketahui) dan **Delegasi** (kolam yang boleh anda stake). Penunjuk epoch memaparkan epoch semasa.",
        "Buka kolam di `/validator/{address}` untuk komisen, stake, prestasi, dan — jika anda menyambung dompet yang mempunyai deposit — **Deposit Saya** dengan stake / unstake / restake / withdraw. Pada telefon bimbit, tindakan tersebut ada pada setiap kad deposit, bukan hanya dalam jadual desktop.",
        "Delegasi ialah tindakan protokol: ia menggunakan gas dan dompet anda. Baca jumlah dan lockup sebelum mengesahkan.",
      ],
    },
    assets: {
      title: "Koin, aset fungible, dan NFT",
      paragraphs: [
        "**Koin** ialah jenis Move `0x1::coin` asal (`address::module::Struct`). **Aset fungible (FA)** ialah standard berasaskan objek yang lebih baharu. APT wujud dalam kedua-dua paparan; banyak token baharu FA sahaja. [Senarai koin](/coins) menggabungkan koin tersenarai dan FA.",
        "Halaman koin ialah `/coin/{type}` (jenis di-encode URL). Halaman FA ialah `/fungible_asset/{metadataAddress}`. Tab biasanya termasuk **Info**, **Transaksi**, dan **Pemegang** (pemegang memerlukan sokongan indeks).",
        "NFT dan aset digital menggunakan `/token/{tokenId}` dengan **Gambaran Keseluruhan** dan **Aktiviti**. Koleksi yang dilarang atau scam mungkin disembunyikan atau ditandakan.",
        "Lencana pengesahan (native, Labs verified, community/Panora, recognized, unverified, banned) dijelaskan pada halaman [pengesahan](/verification). Lencana bukan jaminan nilai atau keselamatan.",
      ],
    },
    analytics: {
      title: "Analitik",
      paragraphs: [
        "[Analitik](/analytics) **mainnet sahaja**. Rangkaian lain memaparkan mesej pendek dan bukannya carta. Carta merangkumi transaksi pengguna harian, TPS puncak, pengguna aktif, akaun baharu, pelaksanaan, gas, dan jurang blok. Anda boleh menukar julat 7 hari vs 30 hari.",
        "Jalur di bahagian atas merumuskan bekalan, stake, TPS, dan bilangan nod. Data berasal daripada fail chain-stats diterbitkan ditambah pertanyaan rantaian langsung — ia mungkin sedikit ketinggalan.",
      ],
    },
    releases: {
      title: "Keluaran, AIP, dan alat",
      paragraphs: [
        "[Hab keluaran](/releases) mempunyai tiga tab: **Rangkaian** (epoch, ketinggian, versi framework/nod, bendera ciri merentasi mainnet, testnet, dan devnet), **AIP** (Aptos Improvement Proposals daripada repositori AIP awam), dan **SDK** (CLI, `aptos-node`, dan keluaran SDK rasmi).",
        "URL lama `/deployments` dan `/aips` mengalihkan ke sini.",
      ],
    },
    runScript: {
      title: "Jalankan Skrip (lanjutan)",
      paragraphs: [
        "[Jalankan Skrip](/run-script) membina, **mensimulasikan**, dan **melaksanakan** transaksi **skrip** Move yang dikompilasi daripada dompet yang disambung. Skrip tiada ABI on-chain, jadi anda mesti mengisytiharkan jenis argumen sendiri. Tiada kompiler Move dalam pelayar — tampal bytecode (hex) daripada kompiler yang anda percayai.",
        "Anggap ini tidak boleh dibatalkan setelah dilaksanakan. Sentiasa baca simulasi (status, gas, event, perubahan sumber) sebelum Execute. Lebih baik tab **Jalankan** Modul akaun untuk fungsi entry yang diterbitkan.",
      ],
    },
    configure: {
      title: "Konfigurasi",
      paragraphs: [
        "Buka [Tetapan](/settings). Keutamaan disimpan **dalam pelayar ini**, bukan pada pelayan Aptos Labs.",
      ],
      bullets: [
        "**Bahasa** — Lalai pelayar atau bahasa eksplisit. Ini mengawal antara muka diterjemahkan, teks tetapan, dan panduan ini. Data on-chain (alamat, nama fungsi, event) kekal seperti disimpan rantaian.",
        "**Penyahkompilasian bytecode Move** — dimatikan secara lalai. Baca penafian sebelum mendayakan. Apabila dimatikan, paparan Decompiled dan Disassembly disembunyikan.",
        "**Gantian kunci API** — kunci [geomi.dev](https://geomi.dev) pilihan bagi setiap rangkaian supaya pelayar anda tidak terperangkap pada had kadar anonim kongsi. Kunci dihantar sebagai `Authorization: Bearer`. Kunci klien Geomi `AG-*` mesti membenarkan Origin laman ini. Tanda **Ingat pada peranti ini** hanya pada mesin yang anda percayai; jika tidak, kunci kekal untuk sesi tab.",
        "**Tema** — cerah atau gelap daripada kawalan matahari/bulan dalam header. Disimpan dalam kuki (`color_scheme`) dan mengikuti sistem jika anda belum memilih.",
        "**Rangkaian** — pemilih header; di-encode dalam `?network=` dan bukannya tetapan.",
      ],
      more: [
        "Simpan menggunakan kunci API dan penyahkompilasian (dan bahasa) serentak: klien cache dibuang dan pertanyaan dimuat semula. **Pulihkan Lalai** mengosongkan keutamaan explorer ini dalam pelayar ini.",
        "Jika anda melihat HTTP **429**, laci had kadar boleh menghantar anda ke Tetapan. Badan Geomi *Per anonymous IP rate limit exceeded* bermaksud tiada kunci diterima; *Per application per IP rate limit exceeded* bermaksud kuota kunci anda habis.",
      ],
    },
    wallet: {
      title: "Dompet",
      paragraphs: [
        "Menyambung dompet adalah pilihan. Gunakan untuk membuka akaun anda dengan cepat, stake, menjalankan fungsi entry, atau menghantar skrip. Petra disenaraikan pertama antara dompet yang boleh dipasang.",
        "Rangkaian dompet mesti sepadan dengan rangkaian explorer (dengan pengecualian kecil untuk sesetengah persediaan RPC tempatan/kustom). Rangkaian tidak sepadan menyekat penghantaran supaya anda tidak menandatangani untuk rantaian yang salah.",
      ],
    },
    verification: {
      title: "Pengesahan token dan alamat",
      paragraphs: [
        "Explorer boleh memaparkan lencana pengesahan pada token dan sesetengah alamat. Penyenaraian komuniti melalui [senarai token Panora](https://github.com/PanoraExchange/Aptos-Tokens). Pengesahan Labs diperuntukkan untuk aset native dan token mapan terpilih.",
        "Arahan langkah demi langkah untuk pasukan projek ada pada halaman [Pengesahan Token & Alamat](/verification). Pengguna masih perlu menyemak alamat jenis/metadata, bukan hanya nama atau ikon.",
      ],
    },
    urls: {
      title: "URL, perkongsian, dan ejen",
      paragraphs: [
        "Utamakan **tab berasaskan laluan**, contohnya `/account/0x1/modules` dan bukannya pertanyaan `?tab=`. Salin bar alamat untuk berkongsi paparan; kekalkan `?network=` jika anda bukan di mainnet.",
        "Templat kanonik didokumentasikan untuk manusia di sini dan untuk perisian dalam [`/llms.txt`](/llms.txt). Ejen dalam pelayar boleh menggunakan alat WebMCP baca sahaja (cari, buka transaksi/akaun/blok/koin/keluaran/panduan) apabila pelayar menyokongnya.",
        "Apabila explorer dipasang sebagai PWA atau disematkan (contohnya Petra Vault), kawalan **Kongsi** mungkin muncul dalam header.",
      ],
    },
    glossary: {
      title: "Glosari",
      bullets: [
        "**Alamat** — pengecam akaun atau objek 32 bait, hex dengan `0x`. `0x1` ialah Aptos Framework.",
        "**ANS** — Aptos Name Service. Nama seperti `alice.apt` dipetakan ke alamat.",
        "**Ketinggian blok** — indeks blok, bermula dari 0.",
        "**Event** — log berstruktur yang dipancarkan semasa transaksi berjalan.",
        "**Aset fungible (FA)** — standard token fungible berasaskan objek (alamat objek metadata).",
        "**Gas** — yuran pelaksanaan dan storan, dibayar dalam APT (octas di sebalik tabir).",
        "**Indeks** — API GraphQL Aptos Labs untuk sejarah, pemegang, dan sesetengah tab. Bukan setiap rangkaian memilikinya.",
        "**Modul** — kod Move diterbitkan. **Pakej** mengelompokkan modul.",
        "**Objek** — entiti on-chain dengan alamat sendiri yang boleh menyimpan sumber.",
        "**Octa** — 10⁻⁸ APT. 1 APT = 100,000,000 octas.",
        "**Resource** — data Move bertipe yang disimpan di bawah akaun atau objek.",
        "**Nombor urutan** — pembilang setiap akaun yang mengaturkan transaksi akaun tersebut.",
        "**Versi transaksi** — versi lejar global (integer) ditetapkan apabila transaksi diaturkan.",
        "**Write-set / perubahan** — keadaan yang ditulis transaksi.",
      ],
    },
    troubleshooting: {
      title: "Penyelesaian masalah",
      bullets: [
        "**Halaman kosong atau berputar** — semak pemilih rangkaian dan sama ada anda di Local tanpa nod. Cuba rangkaian lain atau tunggu 429.",
        "**Transaksi tidak dijumpai** — sahkan versi/hash dan rangkaian. Versi sangat lama mungkin dimuatkan daripada arkib/indeks dengan kurang medan.",
        "**Carian terlepas hash yang dipangkas** — carian hash menggunakan fullnode kemudian arkib (tanpa kunci API explorer). Indeks tidak boleh mencari mengikut hash.",
        "**Decompiled / Disassembly tiada** — dayakan penyahkompilasian di [Tetapan](/settings) dan terima penafian.",
        "**Rantaian salah** — lihat `?network=` dan dropdown header.",
        "**Carian lapuk** — **Kosongkan Cache** dalam footer.",
        "**Analitik tiada** — tukar ke mainnet.",
        "**Dompet tidak menghantar** — sepadankan rangkaian dompet dengan explorer; sambung semula selepas menukar.",
      ],
    },
  },
} as const satisfies EnglishMessages;

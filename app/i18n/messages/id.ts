import type {MessageTree} from "../translate";

export const id = {
  chrome: {
    skipToContent: "Lewati ke konten utama",
    appName: "Aptos Explorer",
    appNameShort: "Explorer",
    navAriaLabel: "Navigasi utama",
    overflowMenuAriaLabel: "Menu navigasi",
    openSettings: "Buka pengaturan",
    openGuide: "Buka panduan pengguna",
    switchToLight: "Beralih ke mode terang",
    switchToDark: "Beralih ke mode gelap",
    nav: {
      transactions: "Transaksi",
      transactionsTitle: "Lihat Semua Transaksi",
      analytics: "Analitik",
      analyticsTitle: "Lihat Analitik Jaringan",
      validators: "Validator",
      validatorsTitle: "Lihat Semua Validator",
      blocks: "Blok",
      blocksTitle: "Lihat Blok Terbaru",
      coins: "Koin",
      coinsTitle: "Lihat Koin & Aset Fungible",
      releases: "Rilis",
      releasesTitle: "Lihat Deployment Jaringan, AIP, dan Rilis SDK & Alat",
      runScript: "Jalankan Script",
      runScriptTitle:
        "Bangun, Simulasikan, dan Jalankan Script Move (Lanjutan)",
      settings: "Pengaturan",
      guide: "Panduan Pengguna",
    },
  },
  footer: {
    privacy: "Privasi",
    terms: "Ketentuan",
    verification: "Verifikasi Token & Alamat",
    guide: "Panduan Pengguna",
    clearCache: "Hapus Cache",
    cacheCleared: "✓ Dihapus",
    clearCacheTitle: "Hapus cache pencarian",
    copyrightOwner: "Aptos Labs",
  },
  search: {
    placeholder: "Cari berdasarkan alamat, txn, blok, koin, atau nama ANS",
    helper:
      "Alamat atau nama akun · Hash atau versi txn · Tinggi blok · Tipe koin · Nama ANS",
    ariaLabel: "cari",
    type: {
      account: "Akun",
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
    title: "Pengaturan",
    description:
      "Kelola preferensi explorer Anda. Pengaturan disimpan secara lokal di browser Anda.",
    language: {
      title: "Bahasa",
      description:
        "Pilih cara explorer menampilkan antarmuka, pengaturan, dan panduan pengguna. Default browser mengikuti bahasa perangkat Anda jika terjemahan tersedia; jika tidak, menggunakan bahasa Inggris. Bahasa tambahan dapat ditambahkan sebagai katalog tanpa mengubah URL halaman.",
      label: "Bahasa tampilan",
      auto: "Default browser",
    },
    decompilation: {
      title: "Dekompilasi Bytecode Move",
      description:
        "Aktifkan dekompilasi bytecode Move on-chain di sisi klien menjadi kode sumber yang mudah dibaca. Berjalan sepenuhnya di browser Anda melalui WebAssembly.",
      ariaLabel: "Aktifkan dekompilasi bytecode Move",
      disclaimerTitle: "Penafian — Baca sebelum mengaktifkan",
      disclaimerIntro:
        "Output yang didekompilasi dihasilkan secara mekanis dari bytecode on-chain dan **mungkin tidak cocok** dengan kode sumber asli. Nama variabel, komentar, dan beberapa detail struktural hilang saat kompilasi dan tidak dapat dipulihkan. Dengan mengaktifkan fitur ini, Anda menyatakan bahwa:",
      bullets: [
        "Output yang didekompilasi disediakan **apa adanya hanya untuk tujuan informasi**.",
        "Anda menerima tanggung jawab atas cara Anda menggunakan output yang didekompilasi.",
        "Output tidak boleh diperlakukan sebagai kode sumber definitif atau otoritatif untuk modul on-chain mana pun.",
      ],
    },
    apiKeys: {
      title: "Override Kunci API",
      whyAriaLabel: "Mengapa menggunakan kunci API sendiri?",
      popover:
        "Explorer menggunakan kunci API geomi.dev bersama secara default. Menambahkan kunci Anda sendiri memberi batas laju khusus, yang membantu jika Anda sering menjelajah atau menerima respons HTTP 429.",
      popoverManage: "Buat dan kelola kunci di [geomi.dev](https://geomi.dev).",
      description:
        "Kunci API geomi.dev opsional per jaringan. Hanya digunakan di browser Anda. Biarkan jaringan kosong untuk menggunakan kunci default dari build (jika ada). Secara default, override disimpan untuk sesi browser saat ini dan dihapus saat sesi berakhir.",
      fieldLabel: "Kunci API {network}",
      fieldPlaceholder: "Tempel kunci untuk {network} (opsional)",
      showKeys: "Tampilkan kunci API",
      hideKeys: "Sembunyikan kunci API",
      getKey: "Belum punya kunci? [Dapatkan di geomi.dev](https://geomi.dev)",
      remember: "Ingat kunci API di perangkat ini",
      rememberWarning:
        "Mengingat kunci menyimpannya di local storage browser ini. Hindari mengaktifkannya di perangkat bersama atau yang tidak tepercaya.",
      notStored:
        "Kunci tidak disimpan oleh server aplikasi explorer. Browser Anda hanya menggunakannya untuk permintaan API sisi klien. Untuk keamanan terbaik, gunakan kunci klien dengan hanya origin `https://explorer.aptoslabs.com` yang diaktifkan dan diterapkan.",
      refreshNote:
        "Data yang ada akan diperbarui setelah disimpan agar permintaan baru segera menggunakan kunci yang diperbarui.",
    },
    actions: {
      reset: "Atur Ulang",
      restoreDefaults: "Pulihkan Default",
      save: "Simpan",
    },
    metaDescription:
      "Konfigurasi pengaturan Aptos Explorer termasuk bahasa, kunci API, preferensi dekompilasi, dan opsi lainnya.",
  },
  guide: {
    meta: {
      title: "Panduan Pengguna",
      description:
        "Cara menggunakan Aptos Explorer: pencarian, jaringan, transaksi, akun, modul, pengaturan, dan cara membaca apa yang Anda lihat.",
      tocLabel: "Di halaman ini",
      intro:
        "Panduan ini menjelaskan cara **menggunakan** Aptos Explorer, cara **membaca** halaman yang ditampilkan, dan cara **mengonfigurasi** di browser Anda. Ditulis untuk orang yang mencari data on-chain — bukan untuk mengoperasikan node atau menulis Move.",
    },
    overview: {
      title: "Apa itu explorer ini",
      paragraphs: [
        "Aptos Explorer adalah **block explorer** resmi untuk blockchain Aptos. Anda menggunakannya untuk mencari transaksi, akun, blok, validator, koin, NFT, dan status jaringan. Explorer membaca data rantai publik; tidak mengambil alih dana dan bukan dompet.",
        "Setiap halaman dibatasi pada **jaringan** (mainnet secara default). Transaksi atau akun di testnet adalah objek berbeda dari identifier yang sama di mainnet. Jaringan disimpan di URL sebagai `?network=…` agar tautan yang Anda salin mempertahankan rantai yang sama.",
        "Explorer adalah situs web. Menghubungkan dompet bersifat opsional dan hanya diperlukan untuk tindakan seperti staking, menjalankan fungsi modul, atau mengirim script Move.",
      ],
    },
    chrome: {
      title: "Cara bernavigasi",
      paragraphs: [
        "**Header** ada di setiap halaman: logo (beranda), navigasi utama, pemilih jaringan, tombol bagikan opsional, [panduan pengguna](/guide), [pengaturan](/settings), tema terang/gelap, dan hubungkan dompet. Di layar kecil, navigasi, pengaturan, tema, dan dompet ada di tombol menu.",
        "Di bawah header, sebagian besar halaman detail menampilkan kontrol **kembali** (jika Anda punya riwayat dalam aplikasi) dan kolom **pencarian**. Halaman beranda (`/`) adalah permukaan pencarian yang lebih besar dengan aturan pencocokan yang sama.",
        "**Footer** berisi Privasi, Ketentuan, [instruksi verifikasi token](/verification), panduan ini, dan **Hapus Cache** (menghapus cache hasil pencarian browser, bukan blockchain).",
      ],
      bullets: [
        "**Transaksi** — transaksi pengguna terbaru, dengan filter.",
        "**Analitik** — grafik hanya mainnet (TPS, pengguna aktif, gas, dan lainnya).",
        "**Validator** — kumpulan validator dan pool delegasi.",
        "**Blok** — blok terbaru berdasarkan tinggi.",
        "**Koin** — koin dan aset fungible yang terdaftar.",
        "**Rilis** — versi jaringan live, AIP, dan rilis SDK/CLI.",
        "**Jalankan Script** — alat lanjutan untuk mensimulasikan dan mengirim script Move mentah.",
      ],
    },
    search: {
      title: "Pencarian",
      paragraphs: [
        "Ketik di kotak pencarian di [halaman beranda](/) atau di header. Anda tidak perlu memilih tipe entitas terlebih dahulu — explorer mendeteksi apa yang Anda masukkan.",
        "Anda juga dapat membagikan pencarian dengan `/?search={query}` (misalnya `/?search=0x1`). Jika pencarian URL memiliki tepat satu hasil yang jelas, pencarian header dapat langsung membawa Anda ke sana.",
      ],
      bullets: [
        "**Alamat akun** (termasuk bentuk pendek seperti `0x1`) — akun, dan mungkin koin, metadata aset fungible, atau objek Move.",
        "**Nama ANS** yang berakhiran `.apt` (atau `.petra`) — di-resolve ke akun.",
        "**Versi transaksi** (angka) atau **hash transaksi** (`0x` ditambah 64 karakter heksadesimal).",
        "**Tinggi blok** (angka dalam rentang rantai).",
        "**Tipe koin Move** seperti `0x1::aptos_coin::AptosCoin`.",
        "**Nama atau simbol token** — cocok dengan kumpulan koin yang terdaftar.",
        "**Teks emoji saja** — mencari pasar emojicoin jika berlaku.",
      ],
    },
    networks: {
      title: "Jaringan",
      paragraphs: [
        "Gunakan dropdown jaringan di header. Tautan dalam aplikasi mempertahankan jaringan saat ini agar Anda tidak diam-diam kembali ke mainnet.",
        "**Mainnet** adalah produksi. **Testnet** dan **devnet** untuk pengembangan (devnet sering direset). **Local** berkomunikasi dengan node di mesin Anda (biasanya `http://127.0.0.1:8080/v1`). Jaringan tersembunyi atau pratinjau dapat muncul saat explorer dibangun dengan feature flag.",
        "Jika Anda memilih Local dan node tidak berjalan, modal menjelaskan cara menjalankan `aptos node run-local-testnet` dan menawarkan beralih kembali ke Mainnet.",
        "Beberapa fitur hanya mainnet (analitik, beberapa estimasi harga, trace Sentio). Tab GraphQL/indexer mungkin tidak ada di jaringan yang tidak menerbitkan indexer.",
      ],
    },
    transactions: {
      title: "Membaca transaksi",
      paragraphs: [
        "Buka transaksi di `/txn/{version}` atau `/txn/{hash}`. **Versi** adalah nomor urut ledger (bilangan bulat mulai dari 0). **Hash** adalah hash transaksi 32 byte. Versi adalah identifier stabil jika Anda memilikinya.",
        "[Daftar transaksi](/transactions) menampilkan aktivitas terbaru. **Pengguna vs Semua** memilih transaksi yang dikirim pengguna versus aliran penuh (termasuk metadata blok). Anda dapat memfilter transaksi pengguna berdasarkan fungsi entry (`fn_addr`, `fn_module`, `fn_name` di URL).",
        "Di halaman detail, tab bergantung pada tipe transaksi:",
      ],
      bullets: [
        "**Ringkasan** — status, pengirim, gas, fungsi, dan **Aksi** yang diurai (swap, transfer, dan sejenisnya).",
        "**Pembayaran** — ditampilkan hanya saat explorer mengidentifikasi pembayaran (peer-to-peer, lompatan yang dikontrol mitra, transfer rahasia, wrap/unwrap, atau kaki exchange). Jumlah rahasia tetap disembunyikan.",
        "**Perubahan Saldo** — selisih saldo koin dan aset fungible, termasuk gas.",
        "**Event** — log yang dipancarkan selama eksekusi.",
        "**Payload** — payload yang dikirim (fungsi entry, script, multisig, dan sebagainya).",
        "**Perubahan** — perubahan resource write-set.",
        "**Modul** — saat transaksi menerbitkan atau memperbarui paket Move.",
        "**Trace** — trace panggilan Move Sentio eksperimental pada transaksi pengguna mainnet.",
      ],
      more: [
        "Transaksi yang gagal tetap ada on-chain; ringkasan menampilkan error. Transaksi tertunda belum diurutkan ke dalam blok.",
        "Jika fullnode yang melayani telah **memangkas** riwayat lama, explorer mencoba ulang node **arsip**, lalu merekonstruksi dari **indexer** jika diperlukan. Halaman khusus indexer mungkin menghilangkan argumen payload, event, atau hash, dan menampilkan banner info.",
      ],
    },
    accounts: {
      title: "Akun, nama, dan objek",
      paragraphs: [
        "**Akun** adalah alamat 32 byte. Buka di `/account/{address}`. Hex pendek (`0x1`) diterima. [Aptos Names](https://aptosnames.com) (`.apt`) di-resolve ke alamat dalam pencarian dan header akun.",
        "**Objek Move** adalah entitas on-chain tingkat pertama yang dapat memiliki resource. Jika Anda membuka alamat objek sebagai akun, explorer mengalihkan ke `/object/{address}` dengan kumpulan tab serupa.",
        "Tab akun biasanya meliputi:",
      ],
      bullets: [
        "**Transaksi** — riwayat untuk alamat ini, dengan paginasi dan filter fungsi opsional.",
        "**Koin** — saldo koin (dan tampilan FA terkait jika berlaku).",
        "**Token** — NFT dan aset digital.",
        "**Resource** — resource Move yang disimpan di bawah akun, sebagai JSON.",
        "**Modul** — paket yang diterbitkan dan sumber (lihat [Modul](#modules)).",
        "**Multisig** — saat akun adalah multisig (onboarding Petra Vault mungkin ditawarkan).",
        "**Info** — nomor urut, kunci autentikasi, dan metadata terkait.",
      ],
      more: [
        "Alamat yang dikenal dapat menampilkan **label dan ikon** (exchange, akun framework, dan sebagainya). Beberapa proyek berlabel menampilkan banner **defunct** atau penutupan — anggap itu peringatan, bukan saran investasi.",
        "**Kartu saldo** menampilkan APT. Di mainnet dapat menyertakan estimasi USD dari feed harga publik.",
      ],
    },
    modules: {
      title: "Modul Move dan kode",
      paragraphs: [
        "Tab Modul mencantumkan paket yang diterbitkan oleh akun atau objek. Anda dapat membuka **paket**, **kode** untuk modul, **Jalankan** (fungsi entry, dompet diperlukan), dan **Lihat** (fungsi view hanya-baca).",
        "Tampilan kode meliputi **Published Source** (jika penerbit menyimpannya), **ABI**, dan — jika Anda opt-in di [Pengaturan](/settings) — bytecode **Decompiled** dan **Disassembly**. Dekompilasi berjalan di browser (WebAssembly). Ini rekonstruksi, bukan komentar dan nama asli.",
        "**Pemilih versi** memungkinkan Anda memeriksa paket pada transaksi publikasi sebelumnya. Tampilan diff membandingkan dua versi. Tautan antar-modul melompat ke modul lain dalam paket yang sama saat nama ter-resolve.",
      ],
    },
    blocks: {
      title: "Blok",
      paragraphs: [
        "Aptos mengelompokkan transaksi ke dalam **blok** yang diurutkan berdasarkan **tinggi**. [Daftar blok](/blocks) menampilkan tinggi terbaru. Halaman blok (`/block/{height}`) memiliki **Ringkasan** (stempel waktu, proposer, jumlah transaksi, hash) dan **Transaksi** dalam blok tersebut.",
        "Blok yang dipangkas mengikuti fallback node arsip yang sama seperti transaksi lama. Tabel blok terbaru tetap pada jendela fullnode yang melayani.",
      ],
    },
    validators: {
      title: "Validator dan staking",
      paragraphs: [
        "Halaman [validator](/validators) memiliki **Semua Node** (kumpulan validator saat ini, voting power, lokasi jika diketahui) dan **Delegasi** (pool tempat Anda dapat stake). Indikator epoch menampilkan epoch saat ini.",
        "Buka pool di `/validator/{address}` untuk komisi, stake, kinerja, dan — jika Anda menghubungkan dompet yang memiliki deposit — **Deposit Saya** dengan stake / unstake / restake / withdraw. Di ponsel, tindakan tersebut ada di setiap kartu deposit, bukan hanya di tabel desktop.",
        "Delegasi adalah tindakan protokol: menghabiskan gas dan menggunakan dompet Anda. Baca jumlah dan lockup sebelum mengonfirmasi.",
      ],
    },
    assets: {
      title: "Koin, aset fungible, dan NFT",
      paragraphs: [
        "**Koin** adalah tipe Move `0x1::coin` asli (`address::module::Struct`). **Aset fungible (FA)** adalah standar berbasis objek yang lebih baru. APT ada di kedua tampilan; banyak token baru hanya FA. [Daftar koin](/coins) mencampur koin terdaftar dan FA.",
        "Halaman koin adalah `/coin/{type}` (tipe di-encode URL). Halaman FA adalah `/fungible_asset/{metadataAddress}`. Tab umumnya meliputi **Info**, **Transaksi**, dan **Pemegang** (pemegang memerlukan dukungan indexer).",
        "NFT dan aset digital menggunakan `/token/{tokenId}` dengan **Ringkasan** dan **Aktivitas**. Koleksi yang dilarang atau scam dapat disembunyikan atau ditandai.",
        "Lencana verifikasi (native, Labs verified, community/Panora, recognized, unverified, banned) dijelaskan di halaman [verifikasi](/verification). Lencana bukan jaminan nilai atau keamanan.",
      ],
    },
    analytics: {
      title: "Analitik",
      paragraphs: [
        "[Analitik](/analytics) **hanya mainnet**. Jaringan lain menampilkan pesan singkat alih-alih grafik. Grafik mencakup transaksi pengguna harian, TPS puncak, pengguna aktif, akun baru, deployment, gas, dan gap blok. Anda dapat beralih rentang 7 hari vs 30 hari.",
        "Strip di bagian atas merangkum supply, stake, TPS, dan jumlah node. Data berasal dari file chain-stats yang diterbitkan plus kueri rantai live — dapat sedikit tertinggal.",
      ],
    },
    releases: {
      title: "Rilis, AIP, dan alat",
      paragraphs: [
        "[Hub rilis](/releases) memiliki tiga tab: **Jaringan** (epoch, tinggi, versi framework/node, feature flag di mainnet, testnet, dan devnet), **AIP** (Aptos Improvement Proposals dari repositori AIP publik), dan **SDK** (CLI, `aptos-node`, dan rilis SDK resmi).",
        "URL lama `/deployments` dan `/aips` mengalihkan ke sini.",
      ],
    },
    runScript: {
      title: "Jalankan Script (lanjutan)",
      paragraphs: [
        "[Jalankan Script](/run-script) membangun, **mensimulasikan**, dan **menjalankan** transaksi **script** Move yang dikompilasi dari dompet yang terhubung. Script tidak punya ABI on-chain, jadi Anda harus mendeklarasikan tipe argumen sendiri. Tidak ada kompiler Move di browser — tempel bytecode (hex) dari kompiler yang Anda percaya.",
        "Anggap ini tidak dapat dibatalkan setelah dieksekusi. Selalu baca simulasi (status, gas, event, perubahan resource) sebelum Execute. Lebih baik tab **Jalankan** Modul akun untuk fungsi entry yang diterbitkan.",
      ],
    },
    configure: {
      title: "Konfigurasi",
      paragraphs: [
        "Buka [Pengaturan](/settings). Preferensi disimpan **di browser ini**, bukan di server Aptos Labs.",
      ],
      bullets: [
        "**Bahasa** — Default browser atau bahasa eksplisit. Ini mengontrol antarmuka yang diterjemahkan, teks pengaturan, dan panduan ini. Data on-chain (alamat, nama fungsi, event) tetap seperti disimpan rantai.",
        "**Dekompilasi bytecode Move** — nonaktif secara default. Baca penafian sebelum mengaktifkan. Saat nonaktif, tampilan Decompiled dan Disassembly disembunyikan.",
        "**Override kunci API** — kunci [geomi.dev](https://geomi.dev) opsional per jaringan agar browser Anda tidak terjebak pada batas laju anonim bersama. Kunci dikirim sebagai `Authorization: Bearer`. Kunci klien Geomi `AG-*` harus mengizinkan Origin situs ini. Centang **Ingat di perangkat ini** hanya di mesin yang Anda percaya; jika tidak, kunci bertahan untuk sesi tab.",
        "**Tema** — terang atau gelap dari kontrol matahari/bulan di header. Disimpan di cookie (`color_scheme`) dan mengikuti sistem jika Anda belum memilih.",
        "**Jaringan** — pemilih header; di-encode di `?network=` alih-alih di pengaturan.",
      ],
      more: [
        "Simpan menerapkan kunci API dan dekompilasi (dan bahasa) sekaligus: klien cache dibuang dan kueri diperbarui. **Pulihkan Default** menghapus preferensi explorer ini di browser ini.",
        "Jika Anda melihat HTTP **429**, drawer batas laju dapat mengarahkan Anda ke Pengaturan. Body Geomi *Per anonymous IP rate limit exceeded* berarti tidak ada kunci yang diterima; *Per application per IP rate limit exceeded* berarti kuota kunci Anda habis.",
      ],
    },
    wallet: {
      title: "Dompet",
      paragraphs: [
        "Menghubungkan dompet bersifat opsional. Gunakan untuk membuka akun dengan cepat, stake, menjalankan fungsi entry, atau mengirim script. Petra tercantum pertama di antara dompet yang dapat diinstal.",
        "Jaringan dompet harus cocok dengan jaringan explorer (dengan pengecualian kecil untuk beberapa setup RPC lokal/kustom). Jaringan yang tidak cocok memblokir pengiriman agar Anda tidak menandatangani untuk rantai yang salah.",
      ],
    },
    verification: {
      title: "Verifikasi token dan alamat",
      paragraphs: [
        "Explorer dapat menampilkan lencana verifikasi pada token dan beberapa alamat. Pencatatan komunitas melalui [daftar token Panora](https://github.com/PanoraExchange/Aptos-Tokens). Verifikasi Labs dicadangkan untuk aset native dan token mapan terpilih.",
        "Instruksi langkah demi langkah untuk tim proyek ada di halaman [Verifikasi Token & Alamat](/verification). Pengguna tetap harus memeriksa alamat tipe/metadata, bukan hanya nama atau ikon.",
      ],
    },
    urls: {
      title: "URL, berbagi, dan agen",
      paragraphs: [
        "Utamakan **tab berbasis path**, misalnya `/account/0x1/modules` alih-alih query `?tab=`. Salin bilah alamat untuk membagikan tampilan; pertahankan `?network=` jika Anda tidak di mainnet.",
        "Template kanonik didokumentasikan untuk manusia di sini dan untuk perangkat lunak di [`/llms.txt`](/llms.txt). Agen dalam browser dapat menggunakan alat WebMCP hanya-baca (cari, buka transaksi/akun/blok/koin/rilis/panduan) saat browser mendukungnya.",
        "Saat explorer diinstal sebagai PWA atau disematkan (misalnya Petra Vault), kontrol **Bagikan** dapat muncul di header.",
      ],
    },
    glossary: {
      title: "Glosarium",
      bullets: [
        "**Alamat** — identifier akun atau objek 32 byte, hex dengan `0x`. `0x1` adalah Aptos Framework.",
        "**ANS** — Aptos Name Service. Nama seperti `alice.apt` dipetakan ke alamat.",
        "**Tinggi blok** — indeks blok, mulai dari 0.",
        "**Event** — log terstruktur yang dipancarkan saat transaksi berjalan.",
        "**Aset fungible (FA)** — standar token fungible berbasis objek (alamat objek metadata).",
        "**Gas** — biaya eksekusi dan penyimpanan, dibayar dalam APT (octas di balik layar).",
        "**Indexer** — API GraphQL Aptos Labs untuk riwayat, pemegang, dan beberapa tab. Tidak setiap jaringan memilikinya.",
        "**Modul** — kode Move yang diterbitkan. **Paket** mengelompokkan modul.",
        "**Objek** — entitas on-chain dengan alamat sendiri yang dapat menyimpan resource.",
        "**Octa** — 10⁻⁸ APT. 1 APT = 100.000.000 octas.",
        "**Resource** — data Move bertipe yang disimpan di bawah akun atau objek.",
        "**Nomor urut** — penghitung per akun yang mengurutkan transaksi akun tersebut.",
        "**Versi transaksi** — versi ledger global (bilangan bulat) yang ditetapkan saat transaksi diurutkan.",
        "**Write-set / perubahan** — state yang ditulis transaksi.",
      ],
    },
    troubleshooting: {
      title: "Pemecahan masalah",
      bullets: [
        "**Halaman kosong atau berputar** — periksa pemilih jaringan dan apakah Anda di Local tanpa node. Coba jaringan lain atau tunggu 429.",
        "**Transaksi tidak ditemukan** — konfirmasi versi/hash dan jaringan. Versi sangat lama dapat dimuat dari arsip/indexer dengan lebih sedikit field.",
        "**Pencarian melewatkan hash yang dipangkas** — pencarian hash menggunakan fullnode lalu arsip (tanpa kunci API explorer). Indexer tidak dapat mencari berdasarkan hash.",
        "**Decompiled / Disassembly hilang** — aktifkan dekompilasi di [Pengaturan](/settings) dan terima penafian.",
        "**Rantai salah** — lihat `?network=` dan dropdown header.",
        "**Hasil pencarian basi** — **Hapus Cache** di footer.",
        "**Analitik hilang** — beralih ke mainnet.",
        "**Dompet tidak mengirim** — samakan jaringan dompet dengan explorer; sambungkan ulang setelah beralih.",
      ],
    },
  },
} as const satisfies MessageTree;

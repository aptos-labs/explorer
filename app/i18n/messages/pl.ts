import type {MessageTree} from "../translate";

export const pl = {
  chrome: {
    skipToContent: "Przejdź do głównej treści",
    appName: "Aptos Explorer",
    appNameShort: "Explorer",
    navAriaLabel: "Główna nawigacja",
    overflowMenuAriaLabel: "Menu nawigacji",
    openSettings: "Otwórz ustawienia",
    openGuide: "Otwórz przewodnik użytkownika",
    switchToLight: "Przełącz na jasny motyw",
    switchToDark: "Przełącz na ciemny motyw",
    nav: {
      transactions: "Transakcje",
      transactionsTitle: "Wyświetl wszystkie transakcje",
      analytics: "Analityka",
      analyticsTitle: "Wyświetl analitykę sieci",
      validators: "Walidatorzy",
      validatorsTitle: "Wyświetl wszystkich walidatorów",
      blocks: "Bloki",
      blocksTitle: "Wyświetl najnowsze bloki",
      coins: "Monety",
      coinsTitle: "Wyświetl monety i aktywa zbywalne",
      releases: "Wydania",
      releasesTitle:
        "Wyświetl wdrożenia sieci, AIP oraz wydania SDK i narzędzi",
      runScript: "Uruchom skrypt",
      runScriptTitle: "Buduj, symuluj i wykonuj skrypt Move (zaawansowane)",
      settings: "Ustawienia",
      guide: "Przewodnik użytkownika",
    },
  },
  footer: {
    privacy: "Prywatność",
    terms: "Warunki",
    verification: "Weryfikacja tokenów i adresów",
    guide: "Przewodnik użytkownika",
    clearCache: "Wyczyść pamięć podręczną",
    cacheCleared: "✓ Wyczyszczono",
    clearCacheTitle: "Wyczyść pamięć podręczną wyszukiwania",
    copyrightOwner: "Aptos Labs",
  },
  search: {
    placeholder: "Szukaj po adresie, txn, bloku, monecie lub nazwie ANS",
    helper:
      "Adres konta lub nazwa · Hash txn lub wersja · Wysokość bloku · Typ monety · Nazwa ANS",
    ariaLabel: "szukaj",
    type: {
      account: "Konto",
      address: "Adres",
      transaction: "Transakcja",
      block: "Blok",
      coin: "Moneta",
      fungibleAsset: "Aktywo zbywalne",
      object: "Obiekt",
      result: "Wynik",
    },
  },
  settings: {
    title: "Ustawienia",
    description:
      "Zarządzaj preferencjami eksploratora. Ustawienia są przechowywane lokalnie w przeglądarce.",
    language: {
      title: "Język",
      description:
        "Wybierz, w jaki sposób eksplorator wyświetla interfejs, ustawienia i przewodnik użytkownika. Domyślny język przeglądarki odpowiada językowi urządzenia, gdy dostępne jest tłumaczenie, w przeciwnym razie używany jest angielski. Kolejne języki można dodać jako katalogi bez zmiany adresów URL stron.",
      label: "Język wyświetlania",
      auto: "Domyślny język przeglądarki",
    },
    decompilation: {
      title: "Dekompilacja bajtkodu Move",
      description:
        "Włącz dekompilację bajtkodu Move on-chain po stronie klienta do czytelnego kodu źródłowego. Działa w całości w przeglądarce przez WebAssembly.",
      ariaLabel: "Włącz dekompilację bajtkodu Move",
      disclaimerTitle: "Zastrzeżenie — przeczytaj przed włączeniem",
      disclaimerIntro:
        "Dekompilowany wynik jest generowany mechanicznie z bajtkodu on-chain i **może nie odpowiadać** oryginalnemu kodowi źródłowemu. Nazwy zmiennych, komentarze i niektóre szczegóły strukturalne giną podczas kompilacji i nie da się ich odzyskać. Włączając tę funkcję, potwierdzasz, że:",
      bullets: [
        "Dekompilowany wynik jest udostępniany **w stanie niezmienionym wyłącznie w celach informacyjnych**.",
        "Przyjmujesz odpowiedzialność za sposób wykorzystania dekompilowanego wyniku.",
        "Wynik nie powinien być traktowany jako ostateczny ani autorytatywny kod źródłowy żadnego modułu on-chain.",
      ],
    },
    apiKeys: {
      title: "Nadpisania kluczy API",
      whyAriaLabel: "Dlaczego używać własnego klucza API?",
      popover:
        "Eksplorator domyślnie używa współdzielonego klucza API geomi.dev. Dodanie własnego klucza daje dedykowany limit zapytań, co pomaga przy intensywnym przeglądaniu lub odpowiedziach HTTP 429.",
      popoverManage:
        "Twórz klucze i zarządzaj nimi na [geomi.dev](https://geomi.dev).",
      description:
        "Opcjonalne klucze API geomi.dev dla każdej sieci. Używane tylko w przeglądarce. Pozostaw pole sieci puste, aby użyć domyślnego klucza z buildu (jeśli istnieje). Domyślnie nadpisania są przechowywane przez bieżącą sesję przeglądarki i usuwane po jej zakończeniu.",
      fieldLabel: "Klucz API {network}",
      fieldPlaceholder: "Wklej klucz dla {network} (opcjonalnie)",
      showKeys: "Pokaż klucze API",
      hideKeys: "Ukryj klucze API",
      getKey: "Nie masz klucza? [Pobierz go na geomi.dev](https://geomi.dev)",
      remember: "Zapamiętaj klucze API na tym urządzeniu",
      rememberWarning:
        "Zapamiętywanie kluczy zapisuje je w lokalnej pamięci tej przeglądarki. Nie włączaj tego na współdzielonych lub niezaufanych urządzeniach.",
      notStored:
        "Klucze nie są przechowywane na serwerze aplikacji eksploratora. Przeglądarka używa ich wyłącznie do zapytań API po stronie klienta. Dla najlepszego bezpieczeństwa używaj kluczy klienta z włączonym i wymuszonym originem `https://explorer.aptoslabs.com`.",
      refreshNote:
        "Istniejące dane zostaną odświeżone po zapisaniu, aby nowe zapytania od razu używały zaktualizowanych kluczy.",
    },
    actions: {
      reset: "Resetuj",
      restoreDefaults: "Przywróć domyślne",
      save: "Zapisz",
    },
    metaDescription:
      "Skonfiguruj ustawienia Aptos Explorer, w tym język, klucze API, preferencje dekompilacji i inne opcje.",
  },
  guide: {
    meta: {
      title: "Przewodnik użytkownika",
      description:
        "Jak korzystać z Aptos Explorer: wyszukiwanie, sieci, transakcje, konta, moduły, ustawienia i jak czytać to, co widzisz.",
      tocLabel: "Na tej stronie",
      intro:
        "Ten przewodnik wyjaśnia, jak **korzystać** z Aptos Explorer, jak **czytać** wyświetlane strony i jak go **konfigurować** w przeglądarce. Jest przeznaczony dla osób wyszukujących dane on-chain — nie dla operatorów węzła ani autorów Move.",
    },
    overview: {
      title: "Czym jest ten eksplorator",
      paragraphs: [
        "Aptos Explorer to oficjalny **eksplorator bloków** blockchainu Aptos. Służy do wyszukiwania transakcji, kont, bloków, walidatorów, monet, NFT i statusu sieci. Odczytuje publiczne dane z łańcucha; nie przechowuje środków i nie jest portfelem.",
        "Każda strona dotyczy **sieci** (domyślnie mainnet). Transakcja lub konto w testnecie to inny obiekt niż ten sam identyfikator w mainnecie. Sieć jest zapisana w URL jako `?network=…`, więc kopiowane linki zachowują ten sam łańcuch.",
        "Eksplorator to strona internetowa. Połączenie portfela jest opcjonalne i potrzebne tylko do działań takich jak staking, uruchamianie funkcji modułu lub wysyłanie skryptu Move.",
      ],
    },
    chrome: {
      title: "Orientacja w interfejsie",
      paragraphs: [
        "**Nagłówek** jest na każdej stronie: logo (strona główna), główna nawigacja, wybór sieci, opcjonalny przycisk udostępniania, [przewodnik użytkownika](/guide), [ustawienia](/settings), jasny/ciemny motyw i połączenie portfela. Na mniejszych ekranach nawigacja, ustawienia, motyw i portfel są w przycisku menu.",
        "Pod nagłówkiem większość stron szczegółowych pokazuje sterowanie **wstecz** (gdy masz historię w aplikacji) i pole **wyszukiwania**. Strona główna (`/`) to większa powierzchnia wyszukiwania z tymi samymi regułami dopasowania.",
        "**Stopka** zawiera Prywatność, Warunki, [instrukcje weryfikacji tokenów](/verification), ten przewodnik oraz **Wyczyść pamięć podręczną** (czyści pamięć podręczną wyników wyszukiwania w przeglądarce, nie blockchain).",
      ],
      bullets: [
        "**Transakcje** — ostatnie transakcje użytkowników, z filtrami.",
        "**Analityka** — wykresy tylko dla mainnetu (TPS, aktywni użytkownicy, gas i więcej).",
        "**Walidatorzy** — zestaw walidatorów i pule delegacji.",
        "**Bloki** — najnowsze bloki według wysokości.",
        "**Monety** — wymienione monety i aktywa zbywalne.",
        "**Wydania** — bieżące wersje sieci, AIP oraz wydania SDK/CLI.",
        "**Uruchom skrypt** — zaawansowane narzędzie do symulacji i wysyłania surowego skryptu Move.",
      ],
    },
    search: {
      title: "Wyszukiwanie",
      paragraphs: [
        "Wpisuj w pole wyszukiwania na [stronie głównej](/) lub w nagłówku. Nie musisz najpierw wybierać typu encji — eksplorator rozpoznaje, co wpisałeś.",
        "Możesz też udostępnić wyszukiwanie przez `/?search={query}` (na przykład `/?search=0x1`). Jeśli wyszukiwanie w URL ma dokładnie jeden jasny wynik, wyszukiwanie w nagłówku może od razu Cię tam przenieść.",
      ],
      bullets: [
        "**Adres konta** (w tym skrócone formy jak `0x1`) — konto, a być może moneta, metadane aktywa zbywalnego lub obiekt Move.",
        "**Nazwa ANS** kończąca się na `.apt` (lub `.petra`) — rozwiązywana do konta.",
        "**Wersja transakcji** (liczba) lub **hash transakcji** (`0x` plus 64 znaki szesnastkowe).",
        "**Wysokość bloku** (liczba w zakresie łańcucha).",
        "**Typ monety Move** taki jak `0x1::aptos_coin::AptosCoin`.",
        "**Nazwa lub symbol tokena** — dopasowuje wymieniony zestaw monet.",
        "**Tekst tylko z emoji** — wyszukuje rynki emojicoin, gdy ma to zastosowanie.",
      ],
    },
    networks: {
      title: "Sieci",
      paragraphs: [
        "Użyj listy rozwijanej sieci w nagłówku. Linki w aplikacji zachowują bieżącą sieć, więc nie wrócisz po cichu do mainnetu.",
        "**Mainnet** to produkcja. **Testnet** i **devnet** służą do rozwoju (devnet jest często resetowany). **Lokalna** łączy się z węzłem na Twoim komputerze (zwykle `http://127.0.0.1:8080/v1`). Ukryte lub podglądowe sieci mogą się pojawić, gdy eksplorator jest zbudowany z flagą funkcji.",
        "Jeśli wybierzesz Lokalną, a węzeł nie działa, modal wyjaśni, jak uruchomić `aptos node run-local-testnet` i zaproponuje powrót do Mainnetu.",
        "Niektóre funkcje są tylko dla mainnetu (analityka, część szacunków cen, ślady Sentio). Zakładki GraphQL/indexera mogą być niedostępne w sieciach bez publikowanego indexera.",
      ],
    },
    transactions: {
      title: "Czytanie transakcji",
      paragraphs: [
        "Otwórz transakcję pod `/txn/{version}` lub `/txn/{hash}`. **Wersja** to numer sekwencji ledgera (liczba całkowita od 0). **Hash** to 32-bajtowy hash transakcji. Wersja jest stabilnym identyfikatorem, jeśli ją masz.",
        "[Lista transakcji](/transactions) pokazuje ostatnią aktywność. **Użytkownik vs Wszystkie** wybiera transakcje wysłane przez użytkowników względem pełnego strumienia (w tym metadanych bloków). Możesz filtrować transakcje użytkowników po funkcji wejściowej (`fn_addr`, `fn_module`, `fn_name` w URL).",
        "Na stronie szczegółów zakładki zależą od typu transakcji:",
      ],
      bullets: [
        "**Przegląd** — status, nadawca, gas, funkcja i sparsowane **Akcje** (swapy, transfery i podobne).",
        "**Płatności** — widoczne tylko, gdy eksplorator rozpozna płatność (peer-to-peer, skoki kontrolowane przez partnera, transfery poufne, wrap/unwrap lub nogi wymiany). Poufne kwoty pozostają ukryte.",
        "**Zmiana salda** — różnice sald monet i aktywów zbywalnych, w tym gas.",
        "**Zdarzenia** — logi emitowane podczas wykonania.",
        "**Payload** — wysłany payload (funkcja wejściowa, skrypt, multisig itd.).",
        "**Zmiany** — zmiany zasobów write-set.",
        "**Moduły** — gdy transakcja publikuje lub aktualizuje pakiety Move.",
        "**Trace** — eksperymentalny ślad wywołań Move Sentio dla transakcji użytkowników w mainnecie.",
      ],
      more: [
        "Nieudana transakcja nadal istnieje on-chain; przegląd pokazuje błąd. Transakcje oczekujące nie zostały jeszcze uporządkowane w bloku.",
        "Jeśli obsługujący fullnode **wyczyścił** starą historię, eksplorator ponawia próbę na węźle **archiwalnym**, a następnie rekonstruuje z **indexera**, jeśli trzeba. Strony tylko z indexera mogą pomijać argumenty payloadu, zdarzenia lub hashe i pokazują baner informacyjny.",
      ],
    },
    accounts: {
      title: "Konta, nazwy i obiekty",
      paragraphs: [
        "**Konto** to 32-bajtowy adres. Otwórz je pod `/account/{address}`. Krótki hex (`0x1`) jest akceptowany. [Aptos Names](https://aptosnames.com) (`.apt`) są rozwiązywane do adresów w wyszukiwaniu i w nagłówku konta.",
        "**Obiekt Move** to encja on-chain pierwszej klasy, która może posiadać zasoby. Jeśli otworzysz adres obiektu jako konto, eksplorator przekieruje do `/object/{address}` z podobnym zestawem zakładek.",
        "Zakładki konta zwykle obejmują:",
      ],
      bullets: [
        "**Transakcje** — historia tego adresu, z paginacją i opcjonalnym filtrem funkcji.",
        "**Monety** — salda monet (i powiązane widoki FA, gdy dotyczy).",
        "**Tokeny** — NFT i aktywa cyfrowe.",
        "**Zasoby** — zasoby Move przechowywane pod kontem, jako JSON.",
        "**Moduły** — opublikowane pakiety i kod źródłowy (zobacz [Moduły](#modules)).",
        "**Multisig** — gdy konto jest multisig (może być oferowane wdrożenie Petra Vault).",
        "**Info** — numer sekwencji, klucz uwierzytelniający i powiązane metadane.",
      ],
      more: [
        "Znane adresy mogą pokazywać **etykietę i ikonę** (giełdy, konta frameworka itd.). Niektóre oznaczone projekty pokazują baner **defunct** lub zakończenia działalności — traktuj to jako ostrzeżenie, nie poradę inwestycyjną.",
        "**Karta salda** pokazuje APT. W mainnecie może zawierać szacunek USD z publicznego kanału cen.",
      ],
    },
    modules: {
      title: "Moduły Move i kod",
      paragraphs: [
        "Zakładka Moduły listuje pakiety opublikowane przez konto lub obiekt. Możesz otworzyć **pakiety**, **kod** modułu, **Uruchom** (funkcje wejściowe, wymagany portfel) i **Wyświetl** (funkcje view tylko do odczytu).",
        "Widoki kodu obejmują **Opublikowany kod źródłowy** (jeśli wydawca go zapisał), **ABI** oraz — gdy wyrazisz zgodę w [Ustawieniach](/settings) — **Dekompilowany** bajtkod i **Disassembly**. Dekompilacja działa w przeglądarce (WebAssembly). To rekonstrukcja, nie oryginalne komentarze i nazwy.",
        "**Selektor wersji** pozwala sprawdzić pakiet przy wcześniejszej transakcji publikacji. Widok diff porównuje dwie wersje. Linki między modułami przechodzą do innych modułów w tym samym pakiecie, gdy nazwy się rozwiążą.",
      ],
    },
    blocks: {
      title: "Bloki",
      paragraphs: [
        "Aptos grupuje transakcje w **bloki** uporządkowane według **wysokości**. [Lista bloków](/blocks) pokazuje ostatnie wysokości. Strona bloku (`/block/{height}`) ma **Przegląd** (znacznik czasu, proposer, liczba transakcji, hashe) i **Transakcje** w tym bloku.",
        "Wyczyszczone bloki korzystają z tego samego fallbacku węzła archiwalnego co stare transakcje. Tabela ostatnich bloków pozostaje w oknie obsługującego fullnode.",
      ],
    },
    validators: {
      title: "Walidatorzy i staking",
      paragraphs: [
        "Strona [walidatorów](/validators) ma **Wszystkie węzły** (bieżący zestaw walidatorów, siła głosu, lokalizacja gdy znana) i **Delegacja** (pule, do których możesz stakować). Wskaźnik epoki pokazuje bieżącą epokę.",
        "Otwórz pulę pod `/validator/{address}`, aby zobaczyć prowizję, stake, wydajność oraz — jeśli połączysz portfel z depozytami — **Moje depozyty** ze stake / unstake / restake / wypłatą. Na telefonie te akcje są na każdej karcie depozytu, nie tylko w tabeli na desktopie.",
        "Delegacja to akcja protokołu: zużywa gas i używa portfela. Przeczytaj kwoty i lockup przed potwierdzeniem.",
      ],
    },
    assets: {
      title: "Monety, aktywa zbywalne i NFT",
      paragraphs: [
        "**Monety** to oryginalne typy Move `0x1::coin` (`address::module::Struct`). **Aktywa zbywalne (FA)** to nowszy standard oparty na obiektach. APT istnieje w obu widokach; wiele nowszych tokenów jest tylko FA. [Lista monet](/coins) łączy wymienione monety i FA.",
        "Strona monety to `/coin/{type}` (typ zakodowany w URL). Strona FA to `/fungible_asset/{metadataAddress}`. Zakładki zwykle obejmują **Info**, **Transakcje** i **Posiadacze** (posiadacze wymagają wsparcia indexera).",
        "NFT i aktywa cyfrowe używają `/token/{tokenId}` z **Przeglądem** i **Aktywnościami**. Zbanowane lub oszukańcze kolekcje mogą być ukryte lub oznaczone.",
        "Odznaki weryfikacji (natywna, zweryfikowana przez Labs, społeczność/Panora, rozpoznana, niezweryfikowana, zbanowana) są wyjaśnione na stronie [weryfikacji](/verification). Odznaka nie gwarantuje wartości ani bezpieczeństwa.",
      ],
    },
    analytics: {
      title: "Analityka",
      paragraphs: [
        "[Analityka](/analytics) jest **tylko dla mainnetu**. Inne sieci pokazują krótką wiadomość zamiast wykresów. Wykresy obejmują dzienne transakcje użytkowników, szczytowe TPS, aktywnych użytkowników, nowe konta, wdrożenia, gas i luki między blokami. Możesz przełączać zakresy 7 dni vs 30 dni.",
        "Pasek u góry podsumowuje podaż, stake, TPS i liczbę węzłów. Dane pochodzą z opublikowanych plików statystyk łańcucha plus zapytań na żywo — mogą nieznacznie opóźniać się.",
      ],
    },
    releases: {
      title: "Wydania, AIP i narzędzia",
      paragraphs: [
        "[Centrum wydań](/releases) ma trzy zakładki: **Sieci** (epoka, wysokość, wersje frameworka/węzła, flagi funkcji w mainnecie, testnecie i devnecie), **AIP** (Aptos Improvement Proposals z publicznego repozytorium AIP) oraz **SDK** (CLI, `aptos-node` i oficjalne wydania SDK).",
        "Starsze URL `/deployments` i `/aips` przekierowują tutaj.",
      ],
    },
    runScript: {
      title: "Uruchom skrypt (zaawansowane)",
      paragraphs: [
        "[Uruchom skrypt](/run-script) buduje, **symuluje** i **wykonuje** skompilowaną transakcję **skryptu** Move z połączonego portfela. Skrypty nie mają ABI on-chain, więc musisz sam zadeklarować typy argumentów. Nie ma kompilatora Move w przeglądarce — wklej bajtkod (hex) z kompilatora, któremu ufasz.",
        "Traktuj to jako nieodwracalne po wykonaniu. Zawsze przeczytaj symulację (status, gas, zdarzenia, zmiany zasobów) przed Wykonaj. Preferuj zakładkę **Uruchom** modułów konta dla opublikowanych funkcji wejściowych.",
      ],
    },
    configure: {
      title: "Konfiguracja",
      paragraphs: [
        "Otwórz [Ustawienia](/settings). Preferencje są przechowywane **w tej przeglądarce**, nie na serwerach Aptos Labs.",
      ],
      bullets: [
        "**Język** — domyślny język przeglądarki lub język jawny. Kontroluje przetłumaczony interfejs, teksty ustawień i ten przewodnik. Dane on-chain (adresy, nazwy funkcji, zdarzenia) pozostają tak, jak je przechowuje łańcuch.",
        "**Dekompilacja bajtkodu Move** — domyślnie wyłączona. Przeczytaj zastrzeżenie przed włączeniem. Gdy wyłączona, widoki Dekompilowany i Disassembly są ukryte.",
        "**Nadpisania kluczy API** — opcjonalne klucze [geomi.dev](https://geomi.dev) dla każdej sieci, aby przeglądarka nie utknęła na współdzielonym anonimowym limicie zapytań. Klucze są wysyłane jako `Authorization: Bearer`. Klucze klienta Geomi `AG-*` muszą zezwalać na Origin tej witryny. Zaznacz **Zapamiętaj na tym urządzeniu** tylko na zaufanym komputerze; w przeciwnym razie klucze obowiązują przez sesję karty.",
        "**Motyw** — jasny lub ciemny z kontrolki słońca/księżyca w nagłówku. Przechowywany w ciasteczku (`color_scheme`) i podąża za systemem, jeśli nic nie wybrałeś.",
        "**Sieć** — selektor w nagłówku; zakodowany w `?network=`, a nie w ustawieniach.",
      ],
      more: [
        "Zapis stosuje klucze API i dekompilację (oraz język) razem: buforowani klienci są odrzucani, a zapytania odświeżane. **Przywróć domyślne** czyści te preferencje eksploratora w tej przeglądarce.",
        "Jeśli widzisz HTTP **429**, szuflada limitu zapytań może wysłać Cię do Ustawień. Treść Geomi *Per anonymous IP rate limit exceeded* oznacza, że żaden klucz nie został zaakceptowany; *Per application per IP rate limit exceeded* oznacza, że wyczerpano limit Twojego klucza.",
      ],
    },
    wallet: {
      title: "Portfel",
      paragraphs: [
        "Połączenie portfela jest opcjonalne. Użyj go, aby szybko otworzyć konto, stakować, uruchamiać funkcje wejściowe lub wysłać skrypt. Petra jest wymieniana jako pierwsza wśród instalowalnych portfeli.",
        "Sieć portfela musi odpowiadać sieci eksploratora (z małym wyjątkiem dla niektórych lokalnych/niestandardowych konfiguracji RPC). Niedopasowane sieci blokują wysyłanie, abyś nie podpisywał dla niewłaściwego łańcucha.",
      ],
    },
    verification: {
      title: "Weryfikacja tokenów i adresów",
      paragraphs: [
        "Eksplorator może pokazywać odznaki weryfikacji na tokenach i niektórych adresach. Listowanie społecznościowe odbywa się przez [listę tokenów Panora](https://github.com/PanoraExchange/Aptos-Tokens). Weryfikacja Labs jest zarezerwowana dla aktywów natywnych i wybranych ugruntowanych tokenów.",
        "Instrukcje krok po kroku dla zespołów projektowych są na stronie [Weryfikacja tokenów i adresów](/verification). Użytkownicy powinni nadal sprawdzać adres typu/metadanych, a nie tylko nazwę lub ikonę.",
      ],
    },
    urls: {
      title: "URL, udostępnianie i agenci",
      paragraphs: [
        "Preferuj **zakładki oparte na ścieżce**, na przykład `/account/0x1/modules` zamiast zapytania `?tab=`. Skopiuj pasek adresu, aby udostępnić widok; zachowaj `?network=`, jeśli nie jesteś w mainnecie.",
        "Kanoniczne szablony są udokumentowane dla ludzi tutaj i dla oprogramowania w [`/llms.txt`](/llms.txt). Agenci w przeglądarce mogą używać narzędzi WebMCP tylko do odczytu (wyszukiwanie, otwieranie transakcji/konta/bloku/monety/wydań/przewodnika), gdy przeglądarka je obsługuje.",
        "Gdy eksplorator jest zainstalowany jako PWA lub osadzony (na przykład Petra Vault), w nagłówku może pojawić się sterowanie **Udostępnij**.",
      ],
    },
    glossary: {
      title: "Słownik",
      bullets: [
        "**Adres** — 32-bajtowy identyfikator konta lub obiektu, hex z `0x`. `0x1` to Aptos Framework.",
        "**ANS** — Aptos Name Service. Nazwa jak `alice.apt` mapuje się na adres.",
        "**Wysokość bloku** — indeks bloku, zaczynając od 0.",
        "**Zdarzenie** — ustrukturyzowany log emitowany podczas wykonywania transakcji.",
        "**Aktywo zbywalne (FA)** — standard tokenów zbywalnych oparty na obiektach (adres obiektu metadanych).",
        "**Gas** — opłata za wykonanie i przechowywanie, płatna w APT (octas pod spodem).",
        "**Indexer** — API GraphQL Aptos Labs używane do historii, posiadaczy i niektórych zakładek. Nie każda sieć go ma.",
        "**Moduł** — opublikowany kod Move. **Pakiet** grupuje moduły.",
        "**Obiekt** — encja on-chain z własnym adresem, która może przechowywać zasoby.",
        "**Octa** — 10⁻⁸ APT. 1 APT = 100 000 000 octas.",
        "**Zasób** — typowane dane Move przechowywane pod kontem lub obiektem.",
        "**Numer sekwencji** — licznik na konto, który porządkuje transakcje tego konta.",
        "**Wersja transakcji** — globalna wersja ledgera (liczba całkowita) przypisana, gdy transakcja zostanie uporządkowana.",
        "**Write-set / zmiany** — stan zapisany przez transakcję.",
      ],
    },
    troubleshooting: {
      title: "Rozwiązywanie problemów",
      bullets: [
        "**Puste lub kręcące się strony** — sprawdź wybór sieci i czy jesteś w Lokalnej bez węzła. Spróbuj innej sieci lub poczekaj na zakończenie 429.",
        "**Nie znaleziono transakcji** — potwierdź wersję/hash i sieć. Bardzo stare wersje mogą ładować się z archiwum/indexera z mniejszą liczbą pól.",
        "**Wyszukiwanie nie znalazło wyczyszczonego hasha** — wyszukiwanie po hashu używa fullnode, potem archiwum (bez klucza API eksploratora). Indexer nie może wyszukiwać po hashu.",
        "**Brak Dekompilowany / Disassembly** — włącz dekompilację w [Ustawieniach](/settings) i zaakceptuj zastrzeżenie.",
        "**Niewłaściwy łańcuch** — sprawdź `?network=` i listę rozwijaną w nagłówku.",
        "**Nieaktualne wyniki wyszukiwania** — stopka **Wyczyść pamięć podręczną**.",
        "**Brak analityki** — przełącz na mainnet.",
        "**Portfel nie wysyła** — dopasuj sieć portfela do eksploratora; połącz ponownie po przełączeniu.",
      ],
    },
  },
} as const satisfies MessageTree;

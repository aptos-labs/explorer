import type {EnglishMessages} from "./en";

export const ptPT = {
  chrome: {
    skipToContent: "Saltar para o conteúdo principal",
    appName: "Aptos Explorer",
    appNameShort: "Explorador",
    navAriaLabel: "Navegação principal",
    overflowMenuAriaLabel: "Menu de navegação",
    openSettings: "Abrir definições",
    openGuide: "Abrir guia do utilizador",
    switchToLight: "Mudar para o modo claro",
    switchToDark: "Mudar para o modo escuro",
    nav: {
      transactions: "Transações",
      transactionsTitle: "Ver todas as transações",
      analytics: "Analítica",
      analyticsTitle: "Ver analítica da rede",
      validators: "Validadores",
      validatorsTitle: "Ver todos os validadores",
      blocks: "Blocos",
      blocksTitle: "Ver os blocos mais recentes",
      coins: "Moedas",
      coinsTitle: "Ver moedas e ativos fungíveis",
      releases: "Lançamentos",
      releasesTitle:
        "Ver implementações da rede, AIPs e lançamentos de SDK e ferramentas",
      runScript: "Executar script",
      runScriptTitle: "Criar, simular e executar um script Move (avançado)",
      settings: "Definições",
      guide: "Guia do utilizador",
    },
  },
  footer: {
    privacy: "Privacidade",
    terms: "Termos",
    verification: "Verificação de tokens e endereços",
    guide: "Guia do utilizador",
    clearCache: "Limpar cache",
    cacheCleared: "✓ Limpo",
    clearCacheTitle: "Limpar a cache de pesquisa",
    copyrightOwner: "Aptos Labs",
  },
  search: {
    placeholder: "Pesquisar por endereço, txn, bloco, moeda ou nome ANS",
    helper:
      "Endereço ou nome da conta · Hash ou versão da txn · Altura do bloco · Tipo de moeda · Nome ANS",
    ariaLabel: "pesquisar",
    type: {
      account: "Conta",
      address: "Endereço",
      transaction: "Transação",
      block: "Bloco",
      coin: "Moeda",
      fungibleAsset: "Ativo fungível",
      object: "Objeto",
      result: "Resultado",
    },
  },
  settings: {
    title: "Definições",
    description:
      "Gira as suas preferências do explorador. As definições são guardadas localmente no navegador.",
    language: {
      title: "Idioma",
      description:
        "Escolha como o explorador apresenta a interface, as definições e o guia do utilizador. O predefinido do navegador segue o idioma do dispositivo quando existe tradução; caso contrário, utiliza inglês. Outros idiomas podem ser adicionados como catálogos sem alterar os URLs das páginas.",
      label: "Idioma de apresentação",
      auto: "Predefinido do navegador",
    },
    decompilation: {
      title: "Descompilação de bytecode Move",
      description:
        "Ative a descompilação no cliente do bytecode Move on-chain em código-fonte legível. Executa inteiramente no navegador via WebAssembly.",
      ariaLabel: "Ativar a descompilação de bytecode Move",
      disclaimerTitle: "Aviso — Leia antes de ativar",
      disclaimerIntro:
        "A saída descompilada é gerada mecanicamente a partir do bytecode on-chain e **pode não coincidir** com o código-fonte original. Nomes de variáveis, comentários e alguns detalhes estruturais perdem-se na compilação e não podem ser recuperados. Ao ativar esta funcionalidade, reconhece que:",
      bullets: [
        "A saída descompilada é fornecida **tal como está, apenas para fins informativos**.",
        "Aceita a responsabilidade por como utiliza a saída descompilada.",
        "A saída não deve ser tratada como o código-fonte definitivo ou autoritativo de qualquer módulo on-chain.",
      ],
    },
    apiKeys: {
      title: "Substituição de chaves de API",
      whyAriaLabel: "Porquê usar a sua própria chave de API?",
      popover:
        "O explorador utiliza por predefinição uma chave de API partilhada do geomi.dev. Adicionar a sua concede um limite de taxa dedicado, útil se navega bastante ou recebe HTTP 429.",
      popoverManage:
        "Crie e gira chaves em [geomi.dev](https://geomi.dev).",
      description:
        "Chaves de API geomi.dev opcionais por rede. Utilizadas apenas no seu navegador. Deixe uma rede vazia para utilizar a chave predefinida da compilação (se existir). Por predefinição, as substituições ficam na sessão atual do navegador e são apagadas quando a sessão termina.",
      fieldLabel: "Chave de API de {network}",
      fieldPlaceholder: "Cole a chave de {network} (opcional)",
      showKeys: "Mostrar chaves de API",
      hideKeys: "Ocultar chaves de API",
      getKey:
        "Não tem uma chave? [Obtenha uma em geomi.dev](https://geomi.dev)",
      remember: "Memorizar as chaves de API neste dispositivo",
      rememberWarning:
        "Memorizar as chaves as guarda no armazenamento local deste navegador. Evite ativar isto em dispositivos partilhados ou não fidedignos.",
      notStored:
        "As chaves não são guardadas pelo servidor da aplicação do explorador. O seu navegador as utiliza apenas para pedidos de API no cliente. Para melhor segurança, utilize chaves de cliente com apenas a origem `https://explorer.aptoslabs.com` ativada e aplicada.",
      refreshNote:
        "Os dados existentes serão atualizados após guardar para que novos pedidos utilizem imediatamente as chaves atualizadas.",
    },
    actions: {
      reset: "Repor",
      restoreDefaults: "Repor predefinições",
      save: "Guardar",
    },
    metaDescription:
      "Configure o Aptos Explorer, incluindo idioma, chaves de API, preferências de descompilação e outras opções.",
  },
  guide: {
    meta: {
      title: "Guia do utilizador",
      description:
        "Como utilizar o Aptos Explorer: pesquisa, redes, transações, contas, módulos, definições e como ler o que vê.",
      tocLabel: "Nesta página",
      intro:
        "Este guia explica como **utilizar** o Aptos Explorer, como **ler** as páginas que apresenta e como **configurá-lo** no navegador. É para quem consulta dados on-chain — não para operar um nó ou escrever Move.",
    },
    overview: {
      title: "O que é este explorador",
      paragraphs: [
        "O Aptos Explorer é o **explorador de blocos** oficial da blockchain Aptos. Utiliza-o para consultar transações, contas, blocos, validadores, moedas, NFTs e o estado da rede. Lê dados públicos da cadeia; não detém fundos e não é uma carteira.",
        "Cada página está limitada a uma **rede** (mainnet por predefinição). Uma transação ou conta na testnet é um objeto diferente do mesmo identificador na mainnet. A rede fica no URL como `?network=…` para que as ligações copiadas mantenham a mesma cadeia.",
        "O explorador é um site. Ligar uma carteira é opcional e só é necessário para ações como staking, executar uma função de módulo ou enviar um script Move.",
      ],
    },
    chrome: {
      title: "Como orientar-se",
      paragraphs: [
        "O **cabeçalho** está em todas as páginas: logótipo (início), navegação principal, seletor de rede, botão de partilha opcional, [guia do utilizador](/guide), [definições](/settings), tema claro/escuro e ligação da carteira. Em ecrãs mais pequenos, navegação, definições, tema e carteira ficam no botão de menu.",
        "Abaixo do cabeçalho, a maioria das páginas de detalhe mostra um controlo **voltar** (quando há histórico na aplicação) e um campo de **pesquisa**. A página inicial (`/`) é uma superfície de pesquisa maior com as mesmas regras de correspondência.",
        "O **rodapé** tem Privacidade, Termos, [instruções de verificação de tokens](/verification), este guia e **Limpar cache** (limpa a cache de resultados de pesquisa do navegador, não a blockchain).",
      ],
      bullets: [
        "**Transações** — transações de utilizador recentes, com filtros.",
        "**Analítica** — gráficos apenas na mainnet (TPS, utilizadores ativos, gás e mais).",
        "**Validadores** — o conjunto de validadores e os pools de delegação.",
        "**Blocos** — blocos mais recentes por altura.",
        "**Moedas** — moedas e ativos fungíveis listados.",
        "**Lançamentos** — versões em direto da rede, AIPs e lançamentos de SDK/CLI.",
        "**Executar script** — ferramenta avançada para simular e enviar um script Move em bruto.",
      ],
    },
    search: {
      title: "Pesquisa",
      paragraphs: [
        "Introduza na caixa de pesquisa da [página inicial](/) ou do cabeçalho. Não precisa de escolher primeiro um tipo de entidade — o explorador deteta o que introduziu.",
        "Também pode partilhar uma pesquisa com `/?search={query}` (por exemplo `/?search=0x1`). Se a pesquisa do URL tiver exatamente um resultado claro, a pesquisa do cabeçalho pode levar-lhe até aí imediatamente.",
      ],
      bullets: [
        "**Endereço da conta** (incluindo formas curtas como `0x1`) — conta e, possivelmente, uma moeda, metadados de ativo fungível ou objeto Move.",
        "**Nome ANS** terminado em `.apt` (ou `.petra`) — resolve para uma conta.",
        "**Versão da transação** (um número) ou **hash da transação** (`0x` mais 64 caracteres hexadecimais).",
        "**Altura do bloco** (um número no intervalo da cadeia).",
        "**Tipo de moeda Move** como `0x1::aptos_coin::AptosCoin`.",
        "**Nome ou símbolo do token** — corresponde ao conjunto de moedas listadas.",
        "**Texto só de emoji** — consulta mercados emojicoin quando aplicável.",
      ],
    },
    networks: {
      title: "Redes",
      paragraphs: [
        "Utilize a lista pendente de rede no cabeçalho. As ligações na aplicação mantêm a rede atual para que não volte silenciosamente à mainnet.",
        "**Mainnet** é produção. **Testnet** e **devnet** são para desenvolvimento (a devnet é reposta com frequência). **Local** comunica com um nó na sua máquina (em geral `http://127.0.0.1:8080/v1`). Redes ocultas ou de pré-visualização podem aparecer quando o explorador é compilado com um sinalizador de funcionalidade.",
        "Se selecionar Local e o nó não estiver em execução, um modal explica como iniciar `aptos node run-local-testnet` e oferece voltar à Mainnet.",
        "Algumas funcionalidades são apenas mainnet (analítica, algumas estimativas de preço, rastos Sentio). Separadores GraphQL/indexador podem faltar em redes que não publicam um indexador.",
      ],
    },
    transactions: {
      title: "Ler uma transação",
      paragraphs: [
        "Abra uma transação em `/txn/{version}` ou `/txn/{hash}`. **Versão** é o número de sequência do ledger (um inteiro a partir de 0). **Hash** é o hash da transação de 32 bytes. A versão é o identificador estável se a tiver.",
        "A [lista de transações](/transactions) mostra atividade recente. **Utilizador vs Todas** escolhe transações enviadas por utilizadores versus o fluxo completo (incluindo metadados de bloco). Pode filtrar transações de utilizador por função de entrada (`fn_addr`, `fn_module`, `fn_name` no URL).",
        "Na página de detalhe, os separadores dependem do tipo de transação:",
      ],
      bullets: [
        "**Visão geral** — estado, remetente, gás, função e **Ações** analisadas (swaps, transferências e semelhantes).",
        "**Pagamentos** — mostrado apenas quando o explorador identifica um pagamento (ponto a ponto, saltos controlados por parceiro, transferências confidenciais, wraps/unwraps ou pernas de câmbio). Valores confidenciais permanecem ocultos.",
        "**Alteração de saldo** — diferenças de saldo de moedas e ativos fungíveis, incluindo gás.",
        "**Eventos** — registos emitidos durante a execução.",
        "**Payload** — o payload enviado (função de entrada, script, multifirma e assim por diante).",
        "**Alterações** — alterações de recursos do write-set.",
        "**Módulos** — quando a transação publica ou atualiza pacotes Move.",
        "**Rasto** — rasto experimental de chamadas Move da Sentio em transações de utilizador da mainnet.",
      ],
      more: [
        "Uma transação com falha ainda existe on-chain; a visão geral mostra o erro. Transações pendentes ainda não foram ordenadas num bloco.",
        "Se o fullnode de serviço **podou** histórico antigo, o explorador tenta um nó de **arquivo** e depois reconstrói a partir do **indexador** se necessário. Páginas apenas do indexador podem omitir argumentos do payload, eventos ou hashes e mostram um aviso informativo.",
      ],
    },
    accounts: {
      title: "Contas, nomes e objetos",
      paragraphs: [
        "Uma **conta** é um endereço de 32 bytes. Abra-a em `/account/{address}`. Hex curto (`0x1`) é aceite. [Aptos Names](https://aptosnames.com) (`.apt`) resolvem para endereços na pesquisa e no cabeçalho da conta.",
        "Um **objeto Move** é uma entidade on-chain de primeira classe que pode possuir recursos. Se abrir um endereço de objeto como conta, o explorador redireciona para `/object/{address}` com um conjunto de separadores semelhante.",
        "Os separadores da conta normalmente incluem:",
      ],
      bullets: [
        "**Transações** — histórico deste endereço, com paginação e filtro opcional de função.",
        "**Moedas** — saldos de moedas (e vistas de FA relacionadas quando aplicável).",
        "**Tokens** — NFTs e ativos digitais.",
        "**Recursos** — recursos Move armazenados sob a conta, como JSON.",
        "**Módulos** — pacotes publicados e código-fonte (veja [Módulos](#modules)).",
        "**Multifirma** — quando a conta é multifirma (o onboarding do Petra Vault pode ser oferecido).",
        "**Info** — número de sequência, chave de autenticação e metadados relacionados.",
      ],
      more: [
        "Endereços conhecidos podem mostrar um **rótulo e ícone** (corretoras, contas do framework e assim por diante). Alguns projetos rotulados mostram um banner **defunct** ou de encerramento — trate isso como aviso, não como conselho de investimento.",
        "O **cartão de saldo** mostra APT. Na mainnet pode incluir uma estimativa em USD de um feed de preços público.",
      ],
    },
    modules: {
      title: "Módulos Move e código",
      paragraphs: [
        "O separador Módulos lista pacotes publicados por uma conta ou objeto. Pode abrir **pacotes**, **código** de um módulo, **Executar** (funções de entrada, carteira necessária) e **Ver** (funções view apenas de leitura).",
        "As vistas de código incluem **Código-fonte publicado** (se o publicador o armazenou), **ABI** e — quando ativa em [Definições](/settings) — bytecode **Descompilado** e **Desmontagem**. A descompilação corre no navegador (WebAssembly). É uma reconstrução, não os comentários e nomes originais.",
        "Um **seletor de versão** permite inspecionar um pacote numa transação de publicação anterior. A vista de diff compara duas versões. Ligações entre módulos saltam para outros módulos no mesmo pacote quando os nomes resolvem.",
      ],
    },
    blocks: {
      title: "Blocos",
      paragraphs: [
        "A Aptos agrupa transações em **blocos** ordenados por **altura**. A [lista de blocos](/blocks) mostra alturas recentes. Uma página de bloco (`/block/{height}`) tem **Visão geral** (data e hora, proponente, contagem de transações, hashes) e **Transações** nesse bloco.",
        "Blocos podados seguem o mesmo fallback de nó de arquivo das transações antigas. A tabela de blocos recentes permanece na janela do fullnode de serviço.",
      ],
    },
    validators: {
      title: "Validadores e staking",
      paragraphs: [
        "A página de [validadores](/validators) tem **Todos os nós** (o conjunto atual de validadores, poder de voto, localização quando conhecida) e **Delegação** (pools para os quais pode fazer stake). Um indicador de época mostra a época atual.",
        "Abra um pool em `/validator/{address}` para comissão, stake, desempenho e — se ligar uma carteira com depósitos — **Os meus depósitos** com stake / unstake / restake / levantamento. No telemóvel, essas ações ficam em cada cartão de depósito, não só na tabela para computador.",
        "A delegação é uma ação de protocolo: gasta gás e utiliza a sua carteira. Leia os valores e o lockup antes de confirmar.",
      ],
    },
    assets: {
      title: "Moedas, ativos fungíveis e NFTs",
      paragraphs: [
        "**Moedas (Coins)** são os tipos Move originais `0x1::coin` (`address::module::Struct`). **Ativos fungíveis (FA)** são o padrão mais recente baseado em objetos. APT existe nas duas vistas; muitos tokens mais recentes são apenas FA. A [lista de moedas](/coins) mistura moedas listadas e FAs.",
        "Uma página de moeda é `/coin/{type}` (tipo codificado no URL). Uma página FA é `/fungible_asset/{metadataAddress}`. Os separadores costumam incluir **Info**, **Transações** e **Titulares** (titulares precisam de suporte do indexador).",
        "NFTs e ativos digitais utilizam `/token/{tokenId}` com **Visão geral** e **Atividades**. Coleções banidas ou de fraude podem ser ocultadas ou sinalizadas.",
        "Os selos de verificação (nativo, verificado pela Labs, comunidade/Panora, reconhecido, não verificado, banido) são explicados na página de [verificação](/verification). Um selo não é garantia de valor ou segurança.",
      ],
    },
    analytics: {
      title: "Analítica",
      paragraphs: [
        "[Analítica](/analytics) é **apenas mainnet**. Outras redes mostram uma mensagem curta em vez de gráficos. Os gráficos cobrem transações de utilizador diárias, TPS de pico, utilizadores ativos, novas contas, implementações, gás e intervalo entre blocos. Pode alternar intervalos de 7 dias vs 30 dias.",
        "A faixa no topo resume oferta, stake, TPS e contagens de nós. Os dados vêm de ficheiros de estatísticas da cadeia publicados mais consultas em direto — podem atrasar ligeiramente.",
      ],
    },
    releases: {
      title: "Lançamentos, AIPs e ferramentas",
      paragraphs: [
        "O [hub de lançamentos](/releases) tem três separadores: **Redes** (época, altura, versões de framework/nó, sinalizadores de funcionalidade em mainnet, testnet e devnet), **AIPs** (propostas de melhoria da Aptos do repositório público de AIP) e **SDKs** (CLI, `aptos-node` e lançamentos oficiais de SDK).",
        "URLs antigos `/deployments` e `/aips` redirecionam para aqui.",
      ],
    },
    runScript: {
      title: "Executar script (avançado)",
      paragraphs: [
        "[Executar script](/run-script) cria, **simula** e **executa** uma transação de **script** Move compilado a partir de uma carteira ligada. Scripts não têm ABI on-chain, por isso deve declarar os tipos de argumento. Não há compilador Move no navegador — cole bytecode (hex) de um compilador em que confia.",
        "Trate isto como irreversível depois de executado. Leia sempre a simulação (estado, gás, eventos, alterações de recursos) antes de Executar. Prefira o separador **Executar** dos Módulos da conta para funções de entrada publicadas.",
      ],
    },
    configure: {
      title: "Configuração",
      paragraphs: [
        "Abra [Definições](/settings). As preferências são guardadas **neste navegador**, não nos servidores da Aptos Labs.",
      ],
      bullets: [
        "**Idioma** — Predefinido do navegador ou um idioma explícito. Controla a interface traduzida, o texto das definições e este guia. Dados on-chain (endereços, nomes de função, eventos) permanecem como a cadeia os armazena.",
        "**Descompilação de bytecode Move** — desativada por predefinição. Leia o aviso antes de ativar. Quando desativada, as vistas Descompilado e Desmontagem ficam ocultas.",
        "**Substituição de chaves de API** — chaves opcionais do [geomi.dev](https://geomi.dev) por rede para que o navegador não fique no limite de taxa anónimo partilhado. As chaves são enviadas como `Authorization: Bearer`. Chaves de cliente Geomi `AG-*` devem permitir o Origin deste site. Marque **Memorizar neste dispositivo** apenas numa máquina em que confia; caso contrário, as chaves duram a sessão do separador.",
        "**Tema** — claro ou escuro pelo controlo de sol/lua do cabeçalho. Guardado num cookie (`color_scheme`) e segue o sistema se não escolheu.",
        "**Rede** — seletor do cabeçalho; codificada em `?network=` em vez das definições.",
      ],
      more: [
        "Guardar aplica chaves de API e descompilação (e idioma) em conjunto: clientes em cache são descartados e as consultas são atualizadas. **Repor predefinições** limpa estas preferências do explorador neste navegador.",
        "Se vir HTTP **429**, o painel de limite de taxa pode enviar-lhe para as Definições. Um corpo Geomi *Per anonymous IP rate limit exceeded* significa que nenhuma chave foi aceite; *Per application per IP rate limit exceeded* significa que a quota da sua chave foi atingida.",
      ],
    },
    wallet: {
      title: "Carteira",
      paragraphs: [
        "Ligar uma carteira é opcional. Utilize-a para abrir a sua conta rapidamente, fazer stake, executar funções de entrada ou enviar um script. A Petra é listada primeiro entre as carteiras instaláveis.",
        "A rede da carteira deve coincidir com a do explorador (com uma pequena exceção para algumas configurações de RPC local/personalizado). Redes incompatíveis bloqueiam o envio para que não assine na cadeia errada.",
      ],
    },
    verification: {
      title: "Verificação de tokens e endereços",
      paragraphs: [
        "O explorador pode mostrar selos de verificação em tokens e alguns endereços. A listagem da comunidade passa pela [lista de tokens Panora](https://github.com/PanoraExchange/Aptos-Tokens). A verificação da Labs é reservada a ativos nativos e tokens estabelecidos selecionados.",
        "Instruções passo a passo para equipas de projeto estão na página [Verificação de tokens e endereços](/verification). Os utilizadores ainda devem verificar o endereço de tipo/metadados, não apenas um nome ou ícone.",
      ],
    },
    urls: {
      title: "URLs, partilha e agentes",
      paragraphs: [
        "Prefira **separadores baseados em caminho**, por exemplo `/account/0x1/modules` em vez de uma consulta `?tab=`. Copie a barra de endereços para partilhar uma vista; mantenha `?network=` se não estiver na mainnet.",
        "Modelos canónicos são documentados para pessoas aqui e para software em [`/llms.txt`](/llms.txt). Agentes no navegador podem utilizar ferramentas WebMCP apenas de leitura (pesquisar, abrir transação/conta/bloco/moeda/lançamentos/guia) quando o navegador as suporta.",
        "Quando o explorador está instalado como PWA ou incorporado (por exemplo Petra Vault), um controlo **Partilhar** pode aparecer no cabeçalho.",
      ],
    },
    glossary: {
      title: "Glossário",
      bullets: [
        "**Endereço** — identificador de conta ou objeto de 32 bytes, hex com `0x`. `0x1` é o Aptos Framework.",
        "**ANS** — Aptos Name Service. Um nome como `alice.apt` mapeia para um endereço.",
        "**Altura do bloco** — índice de um bloco, começando em 0.",
        "**Evento** — registo estruturado emitido enquanto uma transação é executada.",
        "**Ativo fungível (FA)** — padrão de token fungível baseado em objetos (endereço do objeto de metadados).",
        "**Gás** — taxa de execução e armazenamento, paga em APT (octas por baixo).",
        "**Indexador** — API GraphQL da Aptos Labs utilizada para histórico, titulares e alguns separadores. Nem todas as redes têm um.",
        "**Módulo** — código Move publicado. Um **pacote** agrupa módulos.",
        "**Objeto** — entidade on-chain com o próprio endereço que pode guardar recursos.",
        "**Octa** — 10⁻⁸ APT. 1 APT = 100.000.000 octas.",
        "**Recurso** — dados Move tipados armazenados sob uma conta ou objeto.",
        "**Número de sequência** — contador por conta que ordena as transações dessa conta.",
        "**Versão da transação** — versão global do ledger (inteiro) atribuída quando uma transação é ordenada.",
        "**Write-set / alterações** — estado que a transação escreveu.",
      ],
    },
    troubleshooting: {
      title: "Resolução de problemas",
      bullets: [
        "**Páginas vazias ou a carregar** — verifique o seletor de rede e se está em Local sem um nó. Tente outra rede ou aguarde um 429.",
        "**Transação não encontrada** — confirme versão/hash e rede. Versões muito antigas podem carregar do arquivo/indexador com menos campos.",
        "**A pesquisa não encontrou um hash podado** — a pesquisa por hash utiliza o fullnode e depois o arquivo (sem a chave de API do explorador). O indexador não pesquisa por hash.",
        "**Descompilado / Desmontagem em falta** — ative a descompilação em [Definições](/settings) e aceite o aviso.",
        "**Cadeia errada** — verifique `?network=` e a lista pendente do cabeçalho.",
        "**Resultados de pesquisa desatualizados** — **Limpar cache** no rodapé.",
        "**Analítica em falta** — mude para a mainnet.",
        "**A carteira não envia** — faça coincidir a rede da carteira com o explorador; volte a ligar após mudar.",
      ],
    },
  },
} as const satisfies EnglishMessages;

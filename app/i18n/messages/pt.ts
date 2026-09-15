import type {EnglishMessages} from "./en";

export const pt = {
  chrome: {
    skipToContent: "Pular para o conteúdo principal",
    appName: "Aptos Explorer",
    appNameShort: "Explorador",
    navAriaLabel: "Navegação principal",
    overflowMenuAriaLabel: "Menu de navegação",
    openSettings: "Abrir configurações",
    openGuide: "Abrir guia do usuário",
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
        "Ver implantações da rede, AIPs e lançamentos de SDK e ferramentas",
      runScript: "Executar script",
      runScriptTitle: "Criar, simular e executar um script Move (avançado)",
      settings: "Configurações",
      guide: "Guia do usuário",
    },
  },
  footer: {
    privacy: "Privacidade",
    terms: "Termos",
    verification: "Verificação de tokens e endereços",
    guide: "Guia do usuário",
    clearCache: "Limpar cache",
    cacheCleared: "✓ Limpo",
    clearCacheTitle: "Limpar o cache de pesquisa",
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
    title: "Configurações",
    description:
      "Gerencie suas preferências do explorador. As configurações são armazenadas localmente no navegador.",
    language: {
      title: "Idioma",
      description:
        "Escolha como o explorador exibe a interface, as configurações e o guia do usuário. O padrão do navegador segue o idioma do dispositivo quando existe tradução; caso contrário, usa o inglês. Outros idiomas podem ser adicionados como catálogos sem alterar as URLs das páginas.",
      label: "Idioma de exibição",
      auto: "Padrão do navegador",
    },
    decompilation: {
      title: "Descompilação de bytecode Move",
      description:
        "Ative a descompilação no cliente do bytecode Move on-chain em código-fonte legível. Executa inteiramente no navegador via WebAssembly.",
      ariaLabel: "Ativar a descompilação de bytecode Move",
      disclaimerTitle: "Aviso — Leia antes de ativar",
      disclaimerIntro:
        "A saída descompilada é gerada mecanicamente a partir do bytecode on-chain e **pode não coincidir** com o código-fonte original. Nomes de variáveis, comentários e alguns detalhes estruturais se perdem na compilação e não podem ser recuperados. Ao ativar este recurso, você reconhece que:",
      bullets: [
        "A saída descompilada é fornecida **como está, apenas para fins informativos**.",
        "Você aceita a responsabilidade por como usa a saída descompilada.",
        "A saída não deve ser tratada como o código-fonte definitivo ou autoritativo de qualquer módulo on-chain.",
      ],
    },
    apiKeys: {
      title: "Substituição de chaves de API",
      whyAriaLabel: "Por que usar sua própria chave de API?",
      popover:
        "O explorador usa por padrão uma chave de API compartilhada do geomi.dev. Adicionar a sua dá um limite de taxa dedicado, útil se você navega bastante ou recebe HTTP 429.",
      popoverManage:
        "Crie e gerencie chaves em [geomi.dev](https://geomi.dev).",
      description:
        "Chaves de API geomi.dev opcionais por rede. Usadas apenas no seu navegador. Deixe uma rede vazia para usar a chave padrão da compilação (se houver). Por padrão, as substituições ficam na sessão atual do navegador e são apagadas quando a sessão termina.",
      fieldLabel: "Chave de API de {network}",
      fieldPlaceholder: "Cole a chave de {network} (opcional)",
      showKeys: "Mostrar chaves de API",
      hideKeys: "Ocultar chaves de API",
      getKey:
        "Não tem uma chave? [Obtenha uma em geomi.dev](https://geomi.dev)",
      remember: "Lembrar as chaves de API neste dispositivo",
      rememberWarning:
        "Lembrar as chaves as armazena no armazenamento local deste navegador. Evite ativar isso em dispositivos compartilhados ou não confiáveis.",
      notStored:
        "As chaves não são armazenadas pelo servidor da aplicação do explorador. Seu navegador as usa apenas para solicitações de API no cliente. Para melhor segurança, use chaves de cliente com apenas a origem `https://explorer.aptoslabs.com` habilitada e aplicada.",
      refreshNote:
        "Os dados existentes serão atualizados após salvar para que novas solicitações usem imediatamente as chaves atualizadas.",
    },
    actions: {
      reset: "Redefinir",
      restoreDefaults: "Restaurar padrões",
      save: "Salvar",
    },
    metaDescription:
      "Configure o Aptos Explorer, incluindo idioma, chaves de API, preferências de descompilação e outras opções.",
  },
  guide: {
    meta: {
      title: "Guia do usuário",
      description:
        "Como usar o Aptos Explorer: pesquisa, redes, transações, contas, módulos, configurações e como ler o que você vê.",
      tocLabel: "Nesta página",
      intro:
        "Este guia explica como **usar** o Aptos Explorer, como **ler** as páginas que ele mostra e como **configurá-lo** no navegador. É para quem consulta dados on-chain — não para operar um nó ou escrever Move.",
    },
    overview: {
      title: "O que é este explorador",
      paragraphs: [
        "O Aptos Explorer é o **explorador de blocos** oficial da blockchain Aptos. Você o usa para consultar transações, contas, blocos, validadores, moedas, NFTs e o status da rede. Ele lê dados públicos da cadeia; não custodia fundos e não é uma carteira.",
        "Cada página está limitada a uma **rede** (mainnet por padrão). Uma transação ou conta na testnet é um objeto diferente do mesmo identificador na mainnet. A rede fica na URL como `?network=…` para que os links copiados mantenham a mesma cadeia.",
        "O explorador é um site. Conectar uma carteira é opcional e só é necessário para ações como staking, executar uma função de módulo ou enviar um script Move.",
      ],
    },
    chrome: {
      title: "Como se orientar",
      paragraphs: [
        "O **cabeçalho** está em todas as páginas: logotipo (início), navegação principal, seletor de rede, botão de compartilhar opcional, [guia do usuário](/guide), [configurações](/settings), tema claro/escuro e conexão da carteira. Em telas menores, navegação, configurações, tema e carteira ficam no botão de menu.",
        "Abaixo do cabeçalho, a maioria das páginas de detalhe mostra um controle **voltar** (quando há histórico no app) e um campo de **pesquisa**. A página inicial (`/`) é uma superfície de pesquisa maior com as mesmas regras de correspondência.",
        "O **rodapé** tem Privacidade, Termos, [instruções de verificação de tokens](/verification), este guia e **Limpar cache** (limpa o cache de resultados de pesquisa do navegador, não a blockchain).",
      ],
      bullets: [
        "**Transações** — transações de usuário recentes, com filtros.",
        "**Analítica** — gráficos somente na mainnet (TPS, usuários ativos, gás e mais).",
        "**Validadores** — o conjunto de validadores e os pools de delegação.",
        "**Blocos** — blocos mais recentes por altura.",
        "**Moedas** — moedas e ativos fungíveis listados.",
        "**Lançamentos** — versões ao vivo da rede, AIPs e lançamentos de SDK/CLI.",
        "**Executar script** — ferramenta avançada para simular e enviar um script Move bruto.",
      ],
    },
    search: {
      title: "Pesquisa",
      paragraphs: [
        "Digite na caixa de pesquisa da [página inicial](/) ou do cabeçalho. Você não precisa escolher primeiro um tipo de entidade — o explorador detecta o que você digitou.",
        "Você também pode compartilhar uma pesquisa com `/?search={query}` (por exemplo `/?search=0x1`). Se a pesquisa da URL tiver exatamente um resultado claro, a pesquisa do cabeçalho pode levá-lo até lá imediatamente.",
      ],
      bullets: [
        "**Endereço da conta** (incluindo formas curtas como `0x1`) — conta e, possivelmente, uma moeda, metadados de ativo fungível ou objeto Move.",
        "**Nome ANS** terminando em `.apt` (ou `.petra`) — resolve para uma conta.",
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
        "Use o menu suspenso de rede no cabeçalho. Os links no app mantêm sua rede atual para que você não volte silenciosamente à mainnet.",
        "**Mainnet** é produção. **Testnet** e **devnet** são para desenvolvimento (a devnet é redefinida com frequência). **Local** fala com um nó na sua máquina (em geral `http://127.0.0.1:8080/v1`). Redes ocultas ou de prévia podem aparecer quando o explorador é compilado com um sinalizador de recurso.",
        "Se você selecionar Local e o nó não estiver em execução, um modal explica como iniciar `aptos node run-local-testnet` e oferece voltar à Mainnet.",
        "Alguns recursos são somente mainnet (analítica, algumas estimativas de preço, rastros Sentio). Abas GraphQL/indexador podem faltar em redes que não publicam um indexador.",
      ],
    },
    transactions: {
      title: "Ler uma transação",
      paragraphs: [
        "Abra uma transação em `/txn/{version}` ou `/txn/{hash}`. **Versão** é o número de sequência do ledger (um inteiro a partir de 0). **Hash** é o hash da transação de 32 bytes. A versão é o identificador estável se você a tiver.",
        "A [lista de transações](/transactions) mostra atividade recente. **Usuário vs Todas** escolhe transações enviadas por usuários versus o fluxo completo (incluindo metadados de bloco). Você pode filtrar transações de usuário por função de entrada (`fn_addr`, `fn_module`, `fn_name` na URL).",
        "Na página de detalhe, as abas dependem do tipo de transação:",
      ],
      bullets: [
        "**Visão geral** — status, remetente, gás, função e **Ações** analisadas (swaps, transferências e semelhantes).",
        "**Pagamentos** — mostrado somente quando o explorador identifica um pagamento (ponto a ponto, saltos controlados por parceiro, transferências confidenciais, wraps/unwraps ou pernas de câmbio). Valores confidenciais permanecem ocultos.",
        "**Mudança de saldo** — diferenças de saldo de moedas e ativos fungíveis, incluindo gás.",
        "**Eventos** — logs emitidos durante a execução.",
        "**Carga útil** — a carga enviada (função de entrada, script, multifirma e assim por diante).",
        "**Alterações** — alterações de recursos do write-set.",
        "**Módulos** — quando a transação publica ou atualiza pacotes Move.",
        "**Rastro** — rastro experimental de chamadas Move da Sentio em transações de usuário da mainnet.",
      ],
      more: [
        "Uma transação com falha ainda existe on-chain; a visão geral mostra o erro. Transações pendentes ainda não foram ordenadas em um bloco.",
        "Se o fullnode de atendimento **podou** histórico antigo, o explorador tenta um nó de **arquivo** e depois reconstrói a partir do **indexador** se necessário. Páginas só do indexador podem omitir argumentos da carga, eventos ou hashes e mostram um banner informativo.",
      ],
    },
    accounts: {
      title: "Contas, nomes e objetos",
      paragraphs: [
        "Uma **conta** é um endereço de 32 bytes. Abra-a em `/account/{address}`. Hex curto (`0x1`) é aceito. [Aptos Names](https://aptosnames.com) (`.apt`) resolvem para endereços na pesquisa e no cabeçalho da conta.",
        "Um **objeto Move** é uma entidade on-chain de primeira classe que pode possuir recursos. Se você abrir um endereço de objeto como conta, o explorador redireciona para `/object/{address}` com um conjunto de abas semelhante.",
        "As abas da conta normalmente incluem:",
      ],
      bullets: [
        "**Transações** — histórico deste endereço, com paginação e filtro opcional de função.",
        "**Moedas** — saldos de moedas (e visões de FA relacionadas quando aplicável).",
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
        "A aba Módulos lista pacotes publicados por uma conta ou objeto. Você pode abrir **pacotes**, **código** de um módulo, **Executar** (funções de entrada, carteira necessária) e **Ver** (funções view somente leitura).",
        "As visões de código incluem **Código-fonte publicado** (se o publicador o armazenou), **ABI** e — quando você ativa em [Configurações](/settings) — bytecode **Descompilado** e **Desmontagem**. A descompilação roda no navegador (WebAssembly). É uma reconstrução, não os comentários e nomes originais.",
        "Um **seletor de versão** permite inspecionar um pacote em uma transação de publicação anterior. A visão de diff compara duas versões. Links entre módulos saltam para outros módulos no mesmo pacote quando os nomes resolvem.",
      ],
    },
    blocks: {
      title: "Blocos",
      paragraphs: [
        "A Aptos agrupa transações em **blocos** ordenados por **altura**. A [lista de blocos](/blocks) mostra alturas recentes. Uma página de bloco (`/block/{height}`) tem **Visão geral** (carimbo de data/hora, proponente, contagem de transações, hashes) e **Transações** naquele bloco.",
        "Blocos podados seguem o mesmo fallback de nó de arquivo das transações antigas. A tabela de blocos recentes permanece na janela do fullnode de atendimento.",
      ],
    },
    validators: {
      title: "Validadores e staking",
      paragraphs: [
        "A página de [validadores](/validators) tem **Todos os nós** (o conjunto atual de validadores, poder de voto, localização quando conhecida) e **Delegação** (pools para os quais você pode fazer stake). Um indicador de época mostra a época atual.",
        "Abra um pool em `/validator/{address}` para comissão, stake, desempenho e — se você conectar uma carteira com depósitos — **Meus depósitos** com stake / unstake / restake / saque. No telefone, essas ações ficam em cada cartão de depósito, não só na tabela para desktop.",
        "A delegação é uma ação de protocolo: gasta gás e usa sua carteira. Leia os valores e o lockup antes de confirmar.",
      ],
    },
    assets: {
      title: "Moedas, ativos fungíveis e NFTs",
      paragraphs: [
        "**Moedas (Coins)** são os tipos Move originais `0x1::coin` (`address::module::Struct`). **Ativos fungíveis (FA)** são o padrão mais novo baseado em objetos. APT existe nas duas visões; muitos tokens mais novos são só FA. A [lista de moedas](/coins) mistura moedas listadas e FAs.",
        "Uma página de moeda é `/coin/{type}` (tipo codificado na URL). Uma página FA é `/fungible_asset/{metadataAddress}`. As abas costumam incluir **Info**, **Transações** e **Detentores** (detentores precisam de suporte do indexador).",
        "NFTs e ativos digitais usam `/token/{tokenId}` com **Visão geral** e **Atividades**. Coleções banidas ou de golpe podem ser ocultadas ou sinalizadas.",
        "Os selos de verificação (nativo, verificado pela Labs, comunidade/Panora, reconhecido, não verificado, banido) são explicados na página de [verificação](/verification). Um selo não é garantia de valor ou segurança.",
      ],
    },
    analytics: {
      title: "Analítica",
      paragraphs: [
        "[Analítica](/analytics) é **somente mainnet**. Outras redes mostram uma mensagem curta em vez de gráficos. Os gráficos cobrem transações de usuário diárias, TPS de pico, usuários ativos, novas contas, implantações, gás e intervalo entre blocos. Você pode alternar intervalos de 7 dias vs 30 dias.",
        "A faixa no topo resume oferta, stake, TPS e contagens de nós. Os dados vêm de arquivos de estatísticas da cadeia publicados mais consultas ao vivo — podem atrasar um pouco.",
      ],
    },
    releases: {
      title: "Lançamentos, AIPs e ferramentas",
      paragraphs: [
        "O [hub de lançamentos](/releases) tem três abas: **Redes** (época, altura, versões de framework/nó, sinalizadores de recurso em mainnet, testnet e devnet), **AIPs** (propostas de melhoria da Aptos do repositório público de AIP) e **SDKs** (CLI, `aptos-node` e lançamentos oficiais de SDK).",
        "URLs antigas `/deployments` e `/aips` redirecionam para cá.",
      ],
    },
    runScript: {
      title: "Executar script (avançado)",
      paragraphs: [
        "[Executar script](/run-script) cria, **simula** e **executa** uma transação de **script** Move compilado a partir de uma carteira conectada. Scripts não têm ABI on-chain, então você deve declarar os tipos de argumento. Não há compilador Move no navegador — cole bytecode (hex) de um compilador em que você confia.",
        "Trate isso como irreversível depois de executado. Sempre leia a simulação (status, gás, eventos, alterações de recursos) antes de Executar. Prefira a aba **Executar** dos Módulos da conta para funções de entrada publicadas.",
      ],
    },
    configure: {
      title: "Configuração",
      paragraphs: [
        "Abra [Configurações](/settings). As preferências são armazenadas **neste navegador**, não nos servidores da Aptos Labs.",
      ],
      bullets: [
        "**Idioma** — Padrão do navegador ou um idioma explícito. Controla a interface traduzida, o texto das configurações e este guia. Dados on-chain (endereços, nomes de função, eventos) permanecem como a cadeia os armazena.",
        "**Descompilação de bytecode Move** — desligada por padrão. Leia o aviso antes de ativar. Quando desligada, as visões Descompilado e Desmontagem ficam ocultas.",
        "**Substituição de chaves de API** — chaves opcionais do [geomi.dev](https://geomi.dev) por rede para que o navegador não fique no limite de taxa anônimo compartilhado. As chaves são enviadas como `Authorization: Bearer`. Chaves de cliente Geomi `AG-*` devem permitir o Origin deste site. Marque **Lembrar neste dispositivo** só em uma máquina em que você confia; caso contrário, as chaves duram a sessão da aba.",
        "**Tema** — claro ou escuro pelo controle de sol/lua do cabeçalho. Armazenado em um cookie (`color_scheme`) e segue o sistema se você não escolheu.",
        "**Rede** — seletor do cabeçalho; codificada em `?network=` em vez das configurações.",
      ],
      more: [
        "Salvar aplica chaves de API e descompilação (e idioma) juntos: clientes em cache são descartados e as consultas são atualizadas. **Restaurar padrões** limpa essas preferências do explorador neste navegador.",
        "Se você ver HTTP **429**, a gaveta de limite de taxa pode enviá-lo às Configurações. Um corpo Geomi *Per anonymous IP rate limit exceeded* significa que nenhuma chave foi aceita; *Per application per IP rate limit exceeded* significa que a cota da sua chave foi atingida.",
      ],
    },
    wallet: {
      title: "Carteira",
      paragraphs: [
        "Conectar uma carteira é opcional. Use-a para abrir sua conta rapidamente, fazer stake, executar funções de entrada ou enviar um script. A Petra é listada primeiro entre as carteiras instaláveis.",
        "A rede da carteira deve coincidir com a do explorador (com uma pequena exceção para algumas configurações de RPC local/personalizado). Redes incompatíveis bloqueiam o envio para que você não assine na cadeia errada.",
      ],
    },
    verification: {
      title: "Verificação de tokens e endereços",
      paragraphs: [
        "O explorador pode mostrar selos de verificação em tokens e alguns endereços. A listagem da comunidade passa pela [lista de tokens Panora](https://github.com/PanoraExchange/Aptos-Tokens). A verificação da Labs é reservada a ativos nativos e tokens estabelecidos selecionados.",
        "Instruções passo a passo para equipes de projeto estão na página [Verificação de tokens e endereços](/verification). Os usuários ainda devem conferir o endereço de tipo/metadados, não só um nome ou ícone.",
      ],
    },
    urls: {
      title: "URLs, compartilhamento e agentes",
      paragraphs: [
        "Prefira **abas baseadas em caminho**, por exemplo `/account/0x1/modules` em vez de uma consulta `?tab=`. Copie a barra de endereços para compartilhar uma visão; mantenha `?network=` se você não estiver na mainnet.",
        "Modelos canônicos são documentados para pessoas aqui e para software em [`/llms.txt`](/llms.txt). Agentes no navegador podem usar ferramentas WebMCP somente leitura (pesquisar, abrir transação/conta/bloco/moeda/lançamentos/guia) quando o navegador as suporta.",
        "Quando o explorador está instalado como PWA ou incorporado (por exemplo Petra Vault), um controle **Compartilhar** pode aparecer no cabeçalho.",
      ],
    },
    glossary: {
      title: "Glossário",
      bullets: [
        "**Endereço** — identificador de conta ou objeto de 32 bytes, hex com `0x`. `0x1` é o Aptos Framework.",
        "**ANS** — Aptos Name Service. Um nome como `alice.apt` mapeia para um endereço.",
        "**Altura do bloco** — índice de um bloco, começando em 0.",
        "**Evento** — log estruturado emitido enquanto uma transação é executada.",
        "**Ativo fungível (FA)** — padrão de token fungível baseado em objetos (endereço do objeto de metadados).",
        "**Gás** — taxa de execução e armazenamento, paga em APT (octas por baixo).",
        "**Indexador** — API GraphQL da Aptos Labs usada para histórico, detentores e algumas abas. Nem toda rede tem uma.",
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
      title: "Solução de problemas",
      bullets: [
        "**Páginas vazias ou girando** — verifique o seletor de rede e se você está em Local sem um nó. Tente outra rede ou aguarde um 429.",
        "**Transação não encontrada** — confirme versão/hash e rede. Versões muito antigas podem carregar do arquivo/indexador com menos campos.",
        "**A pesquisa perdeu um hash podado** — a busca por hash usa o fullnode e depois o arquivo (sem a chave de API do explorador). O indexador não pesquisa por hash.",
        "**Descompilado / Desmontagem ausentes** — ative a descompilação em [Configurações](/settings) e aceite o aviso.",
        "**Cadeia errada** — olhe `?network=` e o menu suspenso do cabeçalho.",
        "**Resultados de pesquisa desatualizados** — **Limpar cache** no rodapé.",
        "**Analítica ausente** — mude para a mainnet.",
        "**A carteira não envia** — faça a rede da carteira coincidir com o explorador; reconecte após mudar.",
      ],
    },
  },
} as const satisfies EnglishMessages;

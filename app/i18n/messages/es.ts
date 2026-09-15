import type {EnglishMessages} from "./en";

export const es = {
  chrome: {
    skipToContent: "Saltar al contenido principal",
    appName: "Aptos Explorer",
    appNameShort: "Explorador",
    navAriaLabel: "Navegación principal",
    overflowMenuAriaLabel: "Menú de navegación",
    openSettings: "Abrir ajustes",
    openGuide: "Abrir guía de usuario",
    switchToLight: "Cambiar a modo claro",
    switchToDark: "Cambiar a modo oscuro",
    nav: {
      transactions: "Transacciones",
      transactionsTitle: "Ver todas las transacciones",
      analytics: "Analítica",
      analyticsTitle: "Ver analítica de la red",
      validators: "Validadores",
      validatorsTitle: "Ver todos los validadores",
      blocks: "Bloques",
      blocksTitle: "Ver los bloques más recientes",
      coins: "Monedas",
      coinsTitle: "Ver monedas y activos fungibles",
      releases: "Lanzamientos",
      releasesTitle:
        "Ver implementaciones de red, AIP y lanzamientos de SDK y herramientas",
      runScript: "Ejecutar script",
      runScriptTitle: "Crear, simular y ejecutar un script Move (avanzado)",
      settings: "Ajustes",
      guide: "Guía de usuario",
    },
  },
  footer: {
    privacy: "Privacidad",
    terms: "Términos",
    verification: "Verificación de tokens y direcciones",
    guide: "Guía de usuario",
    clearCache: "Borrar caché",
    cacheCleared: "✓ Borrada",
    clearCacheTitle: "Borrar la caché de búsqueda",
    copyrightOwner: "Aptos Labs",
  },
  search: {
    placeholder: "Buscar por dirección, txn, bloque, moneda o nombre ANS",
    helper:
      "Dirección o nombre de cuenta · Hash o versión de txn · Altura de bloque · Tipo de moneda · Nombre ANS",
    ariaLabel: "buscar",
    type: {
      account: "Cuenta",
      address: "Dirección",
      transaction: "Transacción",
      block: "Bloque",
      coin: "Moneda",
      fungibleAsset: "Activo fungible",
      object: "Objeto",
      result: "Resultado",
    },
  },
  settings: {
    title: "Ajustes",
    description:
      "Gestiona tus preferencias del explorador. Los ajustes se guardan localmente en el navegador.",
    language: {
      title: "Idioma",
      description:
        "Elige cómo muestra el explorador la interfaz, los ajustes y la guía de usuario. El valor predeterminado del navegador sigue el idioma del dispositivo cuando existe una traducción; si no, usa inglés. Se pueden añadir más idiomas como catálogos sin cambiar las URL.",
      label: "Idioma de visualización",
      auto: "Predeterminado del navegador",
    },
    decompilation: {
      title: "Descompilación de bytecode Move",
      description:
        "Activa la descompilación en el cliente del bytecode Move en cadena a código fuente legible. Se ejecuta por completo en el navegador mediante WebAssembly.",
      ariaLabel: "Activar la descompilación de bytecode Move",
      disclaimerTitle: "Aviso — Léalo antes de activar",
      disclaimerIntro:
        "La salida descompilada se genera mecánicamente a partir del bytecode en cadena y **puede no coincidir** con el código fuente original. Los nombres de variables, comentarios y algunos detalles estructurales se pierden en la compilación y no se pueden recuperar. Al activar esta función reconoces que:",
      bullets: [
        "La salida descompilada se ofrece **tal cual, solo con fines informativos**.",
        "Aceptas la responsabilidad sobre cómo uses la salida descompilada.",
        "La salida no debe tratarse como el código fuente definitivo o autoritativo de ningún módulo en cadena.",
      ],
    },
    apiKeys: {
      title: "Sustitución de claves API",
      whyAriaLabel: "¿Por qué usar tu propia clave API?",
      popover:
        "El explorador usa de forma predeterminada una clave API compartida de geomi.dev. Añadir la tuya te da un límite de velocidad dedicado, útil si navegas mucho o recibes respuestas HTTP 429.",
      popoverManage:
        "Crea y gestiona claves en [geomi.dev](https://geomi.dev).",
      description:
        "Claves API opcionales de geomi.dev por red. Solo se usan en tu navegador. Deja una red vacía para usar la clave predeterminada de la compilación (si existe). Por defecto, las sustituciones se guardan para la sesión actual del navegador y se borran al terminar.",
      fieldLabel: "Clave API de {network}",
      fieldPlaceholder: "Pega la clave de {network} (opcional)",
      showKeys: "Mostrar claves API",
      hideKeys: "Ocultar claves API",
      getKey:
        "¿No tienes clave? [Consigue una en geomi.dev](https://geomi.dev)",
      remember: "Recordar las claves API en este dispositivo",
      rememberWarning:
        "Recordar las claves las guarda en el almacenamiento local de este navegador. Evita activarlo en dispositivos compartidos o no confiables.",
      notStored:
        "Las claves no se almacenan en el servidor de la aplicación del explorador. El navegador las usa solo para solicitudes API del cliente. Para mayor seguridad, usa claves de cliente con solo el origen `https://explorer.aptoslabs.com` habilitado y aplicado.",
      refreshNote:
        "Los datos existentes se actualizarán tras guardar para que las nuevas solicitudes usen de inmediato las claves actualizadas.",
    },
    actions: {
      reset: "Restablecer",
      restoreDefaults: "Restaurar valores predeterminados",
      save: "Guardar",
    },
    metaDescription:
      "Configura Aptos Explorer, incluido el idioma, las claves API, las preferencias de descompilación y otras opciones.",
  },
  guide: {
    meta: {
      title: "Guía de usuario",
      description:
        "Cómo usar Aptos Explorer: búsqueda, redes, transacciones, cuentas, módulos, ajustes y cómo leer lo que ves.",
      tocLabel: "En esta página",
      intro:
        "Esta guía explica cómo **usar** Aptos Explorer, cómo **leer** las páginas que muestra y cómo **configurarlo** en el navegador. Está pensada para quien consulta datos en cadena, no para operar un nodo ni escribir Move.",
    },
    overview: {
      title: "Qué es este explorador",
      paragraphs: [
        "Aptos Explorer es el **explorador de bloques** oficial de la cadena Aptos. Sirve para consultar transacciones, cuentas, bloques, validadores, monedas, NFT y el estado de la red. Lee datos públicos de la cadena; no custodia fondos y no es una cartera.",
        "Cada página está acotada a una **red** (mainnet de forma predeterminada). Una transacción o cuenta en testnet es un objeto distinto del mismo identificador en mainnet. La red se guarda en la URL como `?network=…` para que los enlaces copiados conserven la misma cadena.",
        "El explorador es un sitio web. Conectar una cartera es opcional y solo hace falta para acciones como staking, ejecutar una función de módulo o enviar un script Move.",
      ],
    },
    chrome: {
      title: "Cómo orientarte",
      paragraphs: [
        "El **encabezado** está en todas las páginas: logotipo (inicio), navegación principal, selector de red, botón de compartir opcional, [guía de usuario](/guide), [ajustes](/settings), tema claro/oscuro y conexión de cartera. En pantallas pequeñas, la navegación, los ajustes, el tema y la cartera están en el botón de menú.",
        "Bajo el encabezado, la mayoría de las páginas de detalle muestran un control **atrás** (si hay historial en la app) y un campo de **búsqueda**. La página de inicio (`/`) es una superficie de búsqueda más grande con las mismas reglas de coincidencia.",
        "El **pie** incluye Privacidad, Términos, [instrucciones de verificación de tokens](/verification), esta guía y **Borrar caché** (borra la caché de resultados de búsqueda del navegador, no la cadena).",
      ],
      bullets: [
        "**Transacciones** — transacciones de usuario recientes, con filtros.",
        "**Analítica** — gráficos solo en mainnet (TPS, usuarios activos, gas y más).",
        "**Validadores** — el conjunto de validadores y los fondos de delegación.",
        "**Bloques** — últimos bloques por altura.",
        "**Monedas** — monedas y activos fungibles listados.",
        "**Lanzamientos** — versiones de red en vivo, AIP y lanzamientos de SDK/CLI.",
        "**Ejecutar script** — herramienta avanzada para simular y enviar un script Move en bruto.",
      ],
    },
    search: {
      title: "Búsqueda",
      paragraphs: [
        "Escribe en el cuadro de búsqueda de la [página de inicio](/) o del encabezado. No hace falta elegir primero un tipo de entidad: el explorador detecta lo que introdujiste.",
        "También puedes compartir una búsqueda con `/?search={query}` (por ejemplo `/?search=0x1`). Si la búsqueda de la URL tiene exactamente un resultado claro, la búsqueda del encabezado puede llevarte allí de inmediato.",
      ],
      bullets: [
        "**Dirección de cuenta** (incluidas formas cortas como `0x1`) — cuenta y, posiblemente, una moneda, metadatos de activo fungible u objeto Move.",
        "**Nombre ANS** que termina en `.apt` (o `.petra`) — se resuelve a una cuenta.",
        "**Versión de transacción** (un número) o **hash de transacción** (`0x` más 64 caracteres hexadecimales).",
        "**Altura de bloque** (un número en el rango de la cadena).",
        "**Tipo de moneda Move** como `0x1::aptos_coin::AptosCoin`.",
        "**Nombre o símbolo de token** — coincide con el conjunto de monedas listadas.",
        "**Texto solo de emoji** — busca mercados emojicoin cuando aplique.",
      ],
    },
    networks: {
      title: "Redes",
      paragraphs: [
        "Usa el menú desplegable de red en el encabezado. Los enlaces dentro de la app conservan tu red actual para que no vuelvas a mainnet en silencio.",
        "**Mainnet** es producción. **Testnet** y **devnet** son para desarrollo (devnet se reinicia a menudo). **Local** habla con un nodo en tu máquina (normalmente `http://127.0.0.1:8080/v1`). Pueden aparecer redes ocultas o de vista previa cuando el explorador se compile con un indicador de función.",
        "Si eliges Local y el nodo no está en ejecución, un modal explica cómo iniciar `aptos node run-local-testnet` y ofrece volver a Mainnet.",
        "Algunas funciones son solo de mainnet (analítica, algunas estimaciones de precio, trazas Sentio). Las pestañas GraphQL/indexador pueden faltar en redes que no publican un indexador.",
      ],
    },
    transactions: {
      title: "Leer una transacción",
      paragraphs: [
        "Abre una transacción en `/txn/{version}` o `/txn/{hash}`. **Versión** es el número de secuencia del libro (un entero desde 0). **Hash** es el hash de transacción de 32 bytes. La versión es el identificador estable si la tienes.",
        "La [lista de transacciones](/transactions) muestra actividad reciente. **Usuario vs Todas** elige transacciones enviadas por usuarios frente al flujo completo (incluido el metadato de bloque). Puedes filtrar transacciones de usuario por función de entrada (`fn_addr`, `fn_module`, `fn_name` en la URL).",
        "En la página de detalle, las pestañas dependen del tipo de transacción:",
      ],
      bullets: [
        "**Resumen** — estado, emisor, gas, función y **Acciones** analizadas (intercambios, transferencias y similares).",
        "**Pagos** — se muestra solo cuando el explorador identifica un pago (entre pares, saltos controlados por un socio, transferencias confidenciales, encapsulados/desencapsulados o tramos de intercambio). Los importes confidenciales permanecen ocultos.",
        "**Cambio de saldo** — diferencias de saldo de monedas y activos fungibles, incluido el gas.",
        "**Eventos** — registros emitidos durante la ejecución.",
        "**Carga útil** — la carga enviada (función de entrada, script, multifirma, etc.).",
        "**Cambios** — cambios de recursos del write-set.",
        "**Módulos** — cuando la transacción publica o actualiza paquetes Move.",
        "**Traza** — traza experimental de llamadas Move de Sentio en transacciones de usuario de mainnet.",
      ],
      more: [
        "Una transacción fallida sigue existiendo en cadena; el resumen muestra el error. Las transacciones pendientes aún no se han ordenado en un bloque.",
        "Si el nodo completo de servicio ha **purgado** historial antiguo, el explorador reintenta un nodo de **archivo** y luego reconstruye desde el **indexador** si hace falta. Las páginas solo del indexador pueden omitir argumentos de carga, eventos o hashes, y muestran un aviso informativo.",
      ],
    },
    accounts: {
      title: "Cuentas, nombres y objetos",
      paragraphs: [
        "Una **cuenta** es una dirección de 32 bytes. Ábrela en `/account/{address}`. Se acepta hex corto (`0x1`). [Aptos Names](https://aptosnames.com) (`.apt`) se resuelve a direcciones en la búsqueda y en el encabezado de la cuenta.",
        "Un **objeto Move** es una entidad de primera clase en cadena que puede poseer recursos. Si abres la dirección de un objeto como cuenta, el explorador redirige a `/object/{address}` con un conjunto de pestañas similar.",
        "Las pestañas de cuenta suelen incluir:",
      ],
      bullets: [
        "**Transacciones** — historial de esta dirección, con paginación y filtro opcional de función.",
        "**Monedas** — saldos de monedas (y vistas FA relacionadas cuando aplique).",
        "**Tokens** — NFT y activos digitales.",
        "**Recursos** — recursos Move almacenados bajo la cuenta, como JSON.",
        "**Módulos** — paquetes publicados y código fuente (véase [Módulos](#modules)).",
        "**Multifirma** — cuando la cuenta es multifirma (puede ofrecerse el alta de Petra Vault).",
        "**Info** — número de secuencia, clave de autenticación y metadatos relacionados.",
      ],
      more: [
        "Las direcciones conocidas pueden mostrar una **etiqueta e icono** (intercambios, cuentas del framework, etc.). Algunos proyectos etiquetados muestran un aviso de **defuncto** o de cierre — trátalo como advertencia, no como consejo de inversión.",
        "La **tarjeta de saldo** muestra APT. En mainnet puede incluir una estimación en USD de una fuente de precios pública.",
      ],
    },
    modules: {
      title: "Módulos Move y código",
      paragraphs: [
        "La pestaña Módulos lista los paquetes publicados por una cuenta u objeto. Puedes abrir **paquetes**, **código** de un módulo, **Ejecutar** (funciones de entrada, se requiere cartera) y **Ver** (funciones view de solo lectura).",
        "Las vistas de código incluyen **Código fuente publicado** (si el publicador lo almacenó), **ABI** y — si lo activas en [Ajustes](/settings) — bytecode **Descompilado** y **Desensamblado**. La descompilación se ejecuta en el navegador (WebAssembly). Es una reconstrucción, no los comentarios y nombres originales.",
        "Un **selector de versión** permite inspeccionar un paquete en una transacción de publicación anterior. La vista de diferencias compara dos versiones. Los enlaces entre módulos saltan a otros módulos del mismo paquete cuando se resuelven los nombres.",
      ],
    },
    blocks: {
      title: "Bloques",
      paragraphs: [
        "Aptos agrupa las transacciones en **bloques** ordenados por **altura**. La [lista de bloques](/blocks) muestra alturas recientes. Una página de bloque (`/block/{height}`) tiene **Resumen** (marca de tiempo, proponente, recuento de transacciones, hashes) y **Transacciones** de ese bloque.",
        "Los bloques purgados siguen el mismo respaldo de nodo de archivo que las transacciones antiguas. La tabla de bloques recientes permanece en la ventana del nodo completo de servicio.",
      ],
    },
    validators: {
      title: "Validadores y staking",
      paragraphs: [
        "La página de [validadores](/validators) tiene **Todos los nodos** (el conjunto actual de validadores, poder de voto, ubicación si se conoce) y **Delegación** (fondos a los que puedes hacer stake). Un indicador de época muestra la época actual.",
        "Abre un fondo en `/validator/{address}` para comisión, stake, rendimiento y — si conectas una cartera con depósitos — **Mis depósitos** con stake / unstake / restake / retirar. En un teléfono, esas acciones están en cada tarjeta de depósito, no solo en la tabla de escritorio.",
        "La delegación es una acción de protocolo: gasta gas y usa tu cartera. Lee los importes y el bloqueo antes de confirmar.",
      ],
    },
    assets: {
      title: "Monedas, activos fungibles y NFT",
      paragraphs: [
        "Las **monedas (Coins)** son los tipos originales Move `0x1::coin` (`address::module::Struct`). Los **activos fungibles (FA)** son el estándar más nuevo basado en objetos. APT existe en ambas vistas; muchos tokens más nuevos son solo FA. La [lista de monedas](/coins) mezcla monedas listadas y FA.",
        "Una página de moneda es `/coin/{type}` (tipo codificado en URL). Una página FA es `/fungible_asset/{metadataAddress}`. Las pestañas suelen incluir **Info**, **Transacciones** y **Titulares** (los titulares necesitan soporte del indexador).",
        "Los NFT y activos digitales usan `/token/{tokenId}` con **Resumen** y **Actividades**. Las colecciones prohibidas o de estafa pueden ocultarse o marcarse.",
        "Las insignias de verificación (nativo, verificado por Labs, comunidad/Panora, reconocido, no verificado, prohibido) se explican en la página de [verificación](/verification). Una insignia no garantiza valor ni seguridad.",
      ],
    },
    analytics: {
      title: "Analítica",
      paragraphs: [
        "[Analítica](/analytics) es **solo mainnet**. Otras redes muestran un mensaje breve en lugar de gráficos. Los gráficos cubren transacciones de usuario diarias, TPS máximo, usuarios activos, cuentas nuevas, implementaciones, gas y hueco entre bloques. Puedes cambiar rangos de 7 días frente a 30 días.",
        "La franja superior resume suministro, stake, TPS y recuentos de nodos. Los datos proceden de archivos de estadísticas de cadena publicados más consultas en vivo: pueden ir un poco retrasados.",
      ],
    },
    releases: {
      title: "Lanzamientos, AIP y herramientas",
      paragraphs: [
        "El [centro de lanzamientos](/releases) tiene tres pestañas: **Redes** (época, altura, versiones de framework/nodo, indicadores de función en mainnet, testnet y devnet), **AIP** (propuestas de mejora de Aptos del repositorio público de AIP) y **SDK** (CLI, `aptos-node` y lanzamientos oficiales de SDK).",
        "Las URL antiguas `/deployments` y `/aips` redirigen aquí.",
      ],
    },
    runScript: {
      title: "Ejecutar script (avanzado)",
      paragraphs: [
        "[Ejecutar script](/run-script) crea, **simula** y **ejecuta** una transacción de **script** Move compilado desde una cartera conectada. Los scripts no tienen ABI en cadena, así que debes declarar tú los tipos de argumento. No hay compilador Move en el navegador: pega bytecode (hex) de un compilador en el que confíes.",
        "Trátalo como irreversible una vez ejecutado. Lee siempre la simulación (estado, gas, eventos, cambios de recursos) antes de Ejecutar. Prefiere la pestaña **Ejecutar** de Módulos de la cuenta para funciones de entrada publicadas.",
      ],
    },
    configure: {
      title: "Configuración",
      paragraphs: [
        "Abre [Ajustes](/settings). Las preferencias se guardan **en este navegador**, no en servidores de Aptos Labs.",
      ],
      bullets: [
        "**Idioma** — Predeterminado del navegador o un idioma explícito. Controla la interfaz traducida, el texto de ajustes y esta guía. Los datos en cadena (direcciones, nombres de función, eventos) permanecen como los almacena la cadena.",
        "**Descompilación de bytecode Move** — desactivada de forma predeterminada. Lee el aviso antes de activarla. Si está desactivada, se ocultan las vistas Descompilado y Desensamblado.",
        "**Sustitución de claves API** — claves opcionales de [geomi.dev](https://geomi.dev) por red para que el navegador no quede en el límite de velocidad anónimo compartido. Las claves se envían como `Authorization: Bearer`. Las claves de cliente Geomi `AG-*` deben permitir el Origin de este sitio. Marca **Recordar en este dispositivo** solo en una máquina de confianza; si no, las claves duran la sesión de la pestaña.",
        "**Tema** — claro u oscuro desde el control de sol/luna del encabezado. Se guarda en una cookie (`color_scheme`) y sigue el sistema si no has elegido.",
        "**Red** — selector del encabezado; se codifica en `?network=` en lugar de en ajustes.",
      ],
      more: [
        "Guardar aplica juntas las claves API y la descompilación (y el idioma): se descartan los clientes en caché y se actualizan las consultas. **Restaurar valores predeterminados** borra estas preferencias del explorador en este navegador.",
        "Si ves HTTP **429**, el panel de límite de velocidad puede enviarte a Ajustes. Un cuerpo Geomi de *Per anonymous IP rate limit exceeded* significa que no se aceptó ninguna clave; *Per application per IP rate limit exceeded* significa que se agotó la cuota de tu clave.",
      ],
    },
    wallet: {
      title: "Cartera",
      paragraphs: [
        "Conectar una cartera es opcional. Úsala para abrir tu cuenta con rapidez, hacer stake, ejecutar funciones de entrada o enviar un script. Petra aparece primero entre las carteras instalables.",
        "La red de la cartera debe coincidir con la del explorador (con una pequeña excepción en algunas configuraciones RPC locales/personalizadas). Las redes no coincidentes bloquean el envío para que no firmes en la cadena equivocada.",
      ],
    },
    verification: {
      title: "Verificación de tokens y direcciones",
      paragraphs: [
        "El explorador puede mostrar insignias de verificación en tokens y algunas direcciones. El listado comunitario pasa por la [lista de tokens Panora](https://github.com/PanoraExchange/Aptos-Tokens). La verificación de Labs se reserva a activos nativos y tokens establecidos seleccionados.",
        "Las instrucciones paso a paso para equipos de proyecto están en la página [Verificación de tokens y direcciones](/verification). Los usuarios deben comprobar igualmente la dirección de tipo/metadatos, no solo un nombre o icono.",
      ],
    },
    urls: {
      title: "URL, compartir y agentes",
      paragraphs: [
        "Prefiere **pestañas basadas en la ruta**, por ejemplo `/account/0x1/modules` en lugar de una consulta `?tab=`. Copia la barra de direcciones para compartir una vista; conserva `?network=` si no estás en mainnet.",
        "Las plantillas canónicas se documentan para personas aquí y para software en [`/llms.txt`](/llms.txt). Los agentes en el navegador pueden usar herramientas WebMCP de solo lectura (buscar, abrir transacción/cuenta/bloque/moneda/lanzamientos/guía) cuando el navegador las admite.",
        "Cuando el explorador está instalado como PWA o incrustado (por ejemplo Petra Vault), puede aparecer un control **Compartir** en el encabezado.",
      ],
    },
    glossary: {
      title: "Glosario",
      bullets: [
        "**Dirección** — identificador de cuenta u objeto de 32 bytes, hex con `0x`. `0x1` es el Aptos Framework.",
        "**ANS** — Aptos Name Service. Un nombre como `alice.apt` se asigna a una dirección.",
        "**Altura de bloque** — índice de un bloque, empezando en 0.",
        "**Evento** — registro estructurado emitido mientras se ejecuta una transacción.",
        "**Activo fungible (FA)** — estándar de token fungible basado en objetos (dirección del objeto de metadatos).",
        "**Gas** — tarifa de ejecución y almacenamiento, pagada en APT (octas por debajo).",
        "**Indexador** — API GraphQL de Aptos Labs usada para historial, titulares y algunas pestañas. No todas las redes tienen una.",
        "**Módulo** — código Move publicado. Un **paquete** agrupa módulos.",
        "**Objeto** — entidad en cadena con su propia dirección que puede contener recursos.",
        "**Octa** — 10⁻⁸ APT. 1 APT = 100.000.000 octas.",
        "**Recurso** — datos Move tipados almacenados bajo una cuenta u objeto.",
        "**Número de secuencia** — contador por cuenta que ordena las transacciones de esa cuenta.",
        "**Versión de transacción** — versión global del libro (entero) asignada cuando se ordena una transacción.",
        "**Write-set / cambios** — estado que escribió la transacción.",
      ],
    },
    troubleshooting: {
      title: "Solución de problemas",
      bullets: [
        "**Páginas vacías o en carga infinita** — comprueba el selector de red y si estás en Local sin un nodo. Prueba otra red o espera un 429.",
        "**Transacción no encontrada** — confirma versión/hash y red. Versiones muy antiguas pueden cargar desde archivo/indexador con menos campos.",
        "**La búsqueda no encontró un hash purgado** — la búsqueda por hash usa el nodo completo y luego el archivo (sin la clave API del explorador). El indexador no puede buscar por hash.",
        "**Falta Descompilado / Desensamblado** — activa la descompilación en [Ajustes](/settings) y acepta el aviso.",
        "**Cadena incorrecta** — mira `?network=` y el menú desplegable del encabezado.",
        "**Resultados de búsqueda obsoletos** — **Borrar caché** en el pie.",
        "**Falta la analítica** — cambia a mainnet.",
        "**La cartera no envía** — haz coincidir la red de la cartera con el explorador; vuelve a conectar tras cambiar.",
      ],
    },
  },
} as const satisfies EnglishMessages;

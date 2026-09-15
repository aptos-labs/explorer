import type {EnglishMessages} from "./en";

export const vi = {
  chrome: {
    skipToContent: "Chuyển đến nội dung chính",
    appName: "Aptos Explorer",
    appNameShort: "Explorer",
    navAriaLabel: "Điều hướng chính",
    overflowMenuAriaLabel: "Menu điều hướng",
    openSettings: "Mở cài đặt",
    openGuide: "Mở hướng dẫn sử dụng",
    switchToLight: "Chuyển sang chế độ sáng",
    switchToDark: "Chuyển sang chế độ tối",
    nav: {
      transactions: "Giao dịch",
      transactionsTitle: "Xem tất cả giao dịch",
      analytics: "Phân tích",
      analyticsTitle: "Xem phân tích mạng",
      validators: "Validator",
      validatorsTitle: "Xem tất cả validator",
      blocks: "Khối",
      blocksTitle: "Xem các khối mới nhất",
      coins: "Coin",
      coinsTitle: "Xem coin và tài sản fungible",
      releases: "Phát hành",
      releasesTitle: "Xem triển khai mạng, AIP và phát hành SDK & công cụ",
      runScript: "Chạy script",
      runScriptTitle: "Tạo, mô phỏng và thực thi script Move (nâng cao)",
      settings: "Cài đặt",
      guide: "Hướng dẫn sử dụng",
    },
  },
  footer: {
    privacy: "Quyền riêng tư",
    terms: "Điều khoản",
    verification: "Xác minh token & địa chỉ",
    guide: "Hướng dẫn sử dụng",
    clearCache: "Xóa bộ nhớ đệm",
    cacheCleared: "✓ Đã xóa",
    clearCacheTitle: "Xóa bộ nhớ đệm tìm kiếm",
    copyrightOwner: "Aptos Labs",
  },
  search: {
    placeholder: "Tìm theo địa chỉ, txn, khối, coin hoặc tên ANS",
    helper:
      "Địa chỉ hoặc tên tài khoản · Hash hoặc phiên bản txn · Chiều cao khối · Loại coin · Tên ANS",
    ariaLabel: "tìm kiếm",
    type: {
      account: "Tài khoản",
      address: "Địa chỉ",
      transaction: "Giao dịch",
      block: "Khối",
      coin: "Coin",
      fungibleAsset: "Tài sản fungible",
      object: "Đối tượng",
      result: "Kết quả",
    },
  },
  settings: {
    title: "Cài đặt",
    description:
      "Quản lý tùy chọn trình khám phá. Cài đặt được lưu cục bộ trong trình duyệt của bạn.",
    language: {
      title: "Ngôn ngữ",
      description:
        "Chọn cách trình khám phá hiển thị giao diện, cài đặt và hướng dẫn sử dụng. Mặc định trình duyệt theo ngôn ngữ thiết bị khi có bản dịch, nếu không sẽ dùng tiếng Anh. Có thể thêm ngôn ngữ khác dưới dạng catalog mà không thay đổi URL trang.",
      label: "Ngôn ngữ hiển thị",
      auto: "Mặc định trình duyệt",
    },
    decompilation: {
      title: "Giải mã bytecode Move",
      description:
        "Bật giải mã bytecode Move trên chuỗi thành mã nguồn dễ đọc ở phía client. Chạy hoàn toàn trong trình duyệt qua WebAssembly.",
      ariaLabel: "Bật giải mã bytecode Move",
      disclaimerTitle: "Tuyên bố miễn trừ — Vui lòng đọc trước khi bật",
      disclaimerIntro:
        "Kết quả giải mã được tạo tự động từ bytecode trên chuỗi và **có thể không khớp** với mã nguồn gốc. Tên biến, chú thích và một số chi tiết cấu trúc bị mất khi biên dịch và không thể khôi phục. Khi bật tính năng này, bạn xác nhận rằng:",
      bullets: [
        "Kết quả giải mã được cung cấp **nguyên trạng chỉ nhằm mục đích thông tin**.",
        "Bạn chấp nhận trách nhiệm về cách sử dụng kết quả giải mã.",
        "Kết quả không nên được coi là mã nguồn chính thống hoặc có thẩm quyền của bất kỳ module trên chuỗi nào.",
      ],
    },
    apiKeys: {
      title: "Ghi đè khóa API",
      whyAriaLabel: "Tại sao dùng khóa API riêng?",
      popover:
        "Trình khám phá mặc định dùng khóa API geomi.dev dùng chung. Thêm khóa riêng cho bạn giới hạn tốc độ riêng, hữu ích khi duyệt nhiều hoặc gặp phản hồi HTTP 429.",
      popoverManage: "Tạo và quản lý khóa tại [geomi.dev](https://geomi.dev).",
      description:
        "Khóa API geomi.dev tùy chọn theo từng mạng. Chỉ dùng trong trình duyệt của bạn. Để trống một mạng để dùng khóa mặc định từ bản build (nếu có). Mặc định, ghi đè được lưu cho phiên trình duyệt hiện tại và xóa khi phiên kết thúc.",
      fieldLabel: "Khóa API {network}",
      fieldPlaceholder: "Dán khóa cho {network} (tùy chọn)",
      showKeys: "Hiện khóa API",
      hideKeys: "Ẩn khóa API",
      getKey: "Chưa có khóa? [Lấy tại geomi.dev](https://geomi.dev)",
      remember: "Ghi nhớ khóa API trên thiết bị này",
      rememberWarning:
        "Ghi nhớ khóa sẽ lưu chúng trong local storage của trình duyệt này. Tránh bật trên thiết bị dùng chung hoặc không tin cậy.",
      notStored:
        "Khóa không được lưu trên máy chủ ứng dụng trình khám phá. Trình duyệt chỉ dùng chúng cho yêu cầu API phía client. Để bảo mật tốt nhất, dùng khóa client chỉ bật và bắt buộc origin `https://explorer.aptoslabs.com`.",
      refreshNote:
        "Dữ liệu hiện có sẽ được làm mới sau khi lưu để các yêu cầu mới dùng khóa đã cập nhật ngay lập tức.",
    },
    actions: {
      reset: "Đặt lại",
      restoreDefaults: "Khôi phục mặc định",
      save: "Lưu",
    },
    metaDescription:
      "Cấu hình Aptos Explorer bao gồm ngôn ngữ, khóa API, tùy chọn giải mã và các tùy chọn khác.",
  },
  guide: {
    meta: {
      title: "Hướng dẫn sử dụng",
      description:
        "Cách dùng Aptos Explorer: tìm kiếm, mạng, giao dịch, tài khoản, module, cài đặt và cách đọc nội dung hiển thị.",
      tocLabel: "Trên trang này",
      intro:
        "Hướng dẫn này giải thích cách **sử dụng** Aptos Explorer, cách **đọc** các trang hiển thị và cách **cấu hình** trong trình duyệt. Dành cho người tra cứu dữ liệu trên chuỗi — không phải vận hành node hay viết Move.",
    },
    overview: {
      title: "Trình khám phá này là gì",
      paragraphs: [
        "Aptos Explorer là **block explorer** chính thức của blockchain Aptos. Bạn dùng nó để tra cứu giao dịch, tài khoản, khối, validator, coin, NFT và trạng thái mạng. Nó đọc dữ liệu công khai trên chuỗi; không giữ tiền và không phải ví.",
        "Mỗi trang gắn với một **mạng** (mainnet mặc định). Giao dịch hoặc tài khoản trên testnet là đối tượng khác so với cùng định danh trên mainnet. Mạng được lưu trong URL dưới dạng `?network=…` để liên kết bạn sao chép giữ cùng chuỗi.",
        "Trình khám phá là một website. Kết nối ví là tùy chọn và chỉ cần cho các thao tác như staking, chạy hàm module hoặc gửi script Move.",
      ],
    },
    chrome: {
      title: "Định hướng",
      paragraphs: [
        "**Header** có trên mọi trang: logo (trang chủ), điều hướng chính, chọn mạng, nút chia sẻ tùy chọn, [hướng dẫn sử dụng](/guide), [cài đặt](/settings), chủ đề sáng/tối và kết nối ví. Trên màn hình nhỏ, điều hướng, cài đặt, chủ đề và ví nằm trong nút menu.",
        "Dưới header, hầu hết trang chi tiết có nút **quay lại** (khi có lịch sử trong app) và ô **tìm kiếm**. Trang chủ (`/`) là khu vực tìm kiếm lớn hơn với cùng quy tắc khớp.",
        "**Footer** có Quyền riêng tư, Điều khoản, [hướng dẫn xác minh token](/verification), hướng dẫn này và **Xóa bộ nhớ đệm** (xóa bộ nhớ đệm kết quả tìm kiếm của trình duyệt, không phải blockchain).",
      ],
      bullets: [
        "**Giao dịch** — giao dịch người dùng gần đây, có bộ lọc.",
        "**Phân tích** — biểu đồ chỉ trên mainnet (TPS, người dùng hoạt động, gas và hơn thế).",
        "**Validator** — tập validator hiện tại và pool ủy quyền.",
        "**Khối** — khối mới nhất theo chiều cao.",
        "**Coin** — coin và tài sản fungible được liệt kê.",
        "**Phát hành** — phiên bản mạng trực tiếp, AIP và phát hành SDK/CLI.",
        "**Chạy script** — công cụ nâng cao để mô phỏng và gửi script Move thô.",
      ],
    },
    search: {
      title: "Tìm kiếm",
      paragraphs: [
        "Gõ trong ô tìm kiếm trên [trang chủ](/) hoặc trong header. Bạn không cần chọn loại thực thể trước — trình khám phá tự nhận diện nội dung nhập.",
        "Bạn cũng có thể chia sẻ tìm kiếm với `/?search={query}` (ví dụ `/?search=0x1`). Nếu tìm kiếm trong URL có đúng một kết quả rõ ràng, tìm kiếm header có thể đưa bạn đến đó ngay.",
      ],
      bullets: [
        "**Địa chỉ tài khoản** (kể cả dạng ngắn như `0x1`) — tài khoản, và có thể là coin, metadata tài sản fungible hoặc đối tượng Move.",
        "**Tên ANS** kết thúc bằng `.apt` (hoặc `.petra`) — phân giải thành tài khoản.",
        "**Phiên bản giao dịch** (số) hoặc **hash giao dịch** (`0x` cộng 64 ký tự hex).",
        "**Chiều cao khối** (số trong phạm vi chuỗi).",
        "**Loại coin Move** như `0x1::aptos_coin::AptosCoin`.",
        "**Tên hoặc ký hiệu token** — khớp với tập coin được liệt kê.",
        "**Chỉ emoji** — tra cứu thị trường emojicoin khi áp dụng.",
      ],
    },
    networks: {
      title: "Mạng",
      paragraphs: [
        "Dùng menu thả xuống mạng trong header. Liên kết trong app giữ mạng hiện tại để bạn không lặng lẽ quay về mainnet.",
        "**Mainnet** là môi trường production. **Testnet** và **devnet** dùng cho phát triển (devnet thường được reset). **Local** kết nối node trên máy bạn (thường `http://127.0.0.1:8080/v1`). Mạng ẩn hoặc xem trước có thể xuất hiện khi trình khám phá được build với feature flag.",
        "Nếu chọn Local và node không chạy, hộp thoại giải thích cách khởi động `aptos node run-local-testnet` và đề xuất chuyển về Mainnet.",
        "Một số tính năng chỉ có trên mainnet (phân tích, một số ước tính giá, trace Sentio). Tab GraphQL/indexer có thể thiếu trên mạng không công bố indexer.",
      ],
    },
    transactions: {
      title: "Đọc giao dịch",
      paragraphs: [
        "Mở giao dịch tại `/txn/{version}` hoặc `/txn/{hash}`. **Phiên bản** là số thứ tự sổ cái (số nguyên từ 0). **Hash** là hash giao dịch 32 byte. Phiên bản là định danh ổn định nếu bạn có.",
        "[Danh sách giao dịch](/transactions) hiển thị hoạt động gần đây. **Người dùng vs Tất cả** chọn giao dịch người dùng gửi so với luồng đầy đủ (kể cả metadata khối). Bạn có thể lọc giao dịch người dùng theo hàm entry (`fn_addr`, `fn_module`, `fn_name` trong URL).",
        "Trên trang chi tiết, tab phụ thuộc loại giao dịch:",
      ],
      bullets: [
        "**Tổng quan** — trạng thái, người gửi, gas, hàm và **Hành động** đã phân tích (swap, chuyển và tương tự).",
        "**Thanh toán** — chỉ hiện khi trình khám phá nhận diện thanh toán (peer-to-peer, bước trung gian đối tác, chuyển bí mật, wrap/unwrap hoặc chân sàn giao dịch). Số tiền bí mật vẫn ẩn.",
        "**Thay đổi số dư** — chênh lệch số dư coin và tài sản fungible, kể cả gas.",
        "**Sự kiện** — log phát ra khi thực thi.",
        "**Payload** — payload đã gửi (hàm entry, script, multisig, v.v.).",
        "**Thay đổi** — thay đổi tài nguyên write-set.",
        "**Module** — khi giao dịch publish hoặc nâng cấp gói Move.",
        "**Trace** — trace gọi Move thử nghiệm của Sentio trên giao dịch người dùng mainnet.",
      ],
      more: [
        "Giao dịch thất bại vẫn tồn tại trên chuỗi; tổng quan hiển thị lỗi. Giao dịch đang chờ chưa được sắp xếp vào khối.",
        "Nếu fullnode phục vụ đã **prune** lịch sử cũ, trình khám phá thử lại node **archive**, sau đó tái tạo từ **indexer** nếu cần. Trang chỉ indexer có thể bỏ tham số payload, sự kiện hoặc hash, và hiển thị banner thông tin.",
      ],
    },
    accounts: {
      title: "Tài khoản, tên và đối tượng",
      paragraphs: [
        "**Tài khoản** là địa chỉ 32 byte. Mở tại `/account/{address}`. Hex ngắn (`0x1`) được chấp nhận. [Aptos Names](https://aptosnames.com) (`.apt`) phân giải thành địa chỉ trong tìm kiếm và header tài khoản.",
        "**Đối tượng Move** là thực thể trên chuỗi có thể sở hữu tài nguyên. Nếu mở địa chỉ đối tượng như tài khoản, trình khám phá chuyển hướng đến `/object/{address}` với bộ tab tương tự.",
        "Tab tài khoản thường gồm:",
      ],
      bullets: [
        "**Giao dịch** — lịch sử địa chỉ này, có phân trang và lọc hàm tùy chọn.",
        "**Coin** — số dư coin (và view FA liên quan khi áp dụng).",
        "**Token** — NFT và tài sản số.",
        "**Tài nguyên** — tài nguyên Move lưu dưới tài khoản, dạng JSON.",
        "**Module** — gói đã publish và mã nguồn (xem [Module](#modules)).",
        "**Multisig** — khi tài khoản là multisig (có thể đề xuất onboarding Petra Vault).",
        "**Thông tin** — số thứ tự, khóa xác thực và metadata liên quan.",
      ],
      more: [
        "Địa chỉ đã biết có thể hiển thị **nhãn và biểu tượng** (sàn giao dịch, tài khoản framework, v.v.). Một số dự án có nhãn hiển thị banner **ngừng hoạt động** hoặc đang thu hẹp — coi là cảnh báo, không phải tư vấn đầu tư.",
        "**Thẻ số dư** hiển thị APT. Trên mainnet có thể có ước tính USD từ nguồn giá công khai.",
      ],
    },
    modules: {
      title: "Module Move và mã",
      paragraphs: [
        "Tab Module liệt kê gói do tài khoản hoặc đối tượng publish. Bạn có thể mở **gói**, **mã** module, **Chạy** (hàm entry, cần ví) và **Xem** (hàm view chỉ đọc).",
        "View mã gồm **Mã nguồn đã publish** (nếu publisher lưu), **ABI** và — khi bật trong [Cài đặt](/settings) — bytecode **Giải mã** và **Disassembly**. Giải mã chạy trong trình duyệt (WebAssembly). Đây là tái tạo, không phải chú thích và tên gốc.",
        "**Bộ chọn phiên bản** cho phép xem gói ở giao dịch publish trước đó. View diff so sánh hai phiên bản. Liên kết giữa module nhảy sang module khác trong cùng gói khi tên được phân giải.",
      ],
    },
    blocks: {
      title: "Khối",
      paragraphs: [
        "Aptos nhóm giao dịch thành **khối** sắp theo **chiều cao**. [Danh sách khối](/blocks) hiển thị chiều cao gần đây. Trang khối (`/block/{height}`) có **Tổng quan** (thời gian, proposer, số giao dịch, hash) và **Giao dịch** trong khối đó.",
        "Khối đã prune dùng cùng fallback node archive như giao dịch cũ. Bảng khối gần đây giữ trong cửa sổ fullnode phục vụ.",
      ],
    },
    validators: {
      title: "Validator và staking",
      paragraphs: [
        "Trang [validator](/validators) có **Tất cả node** (tập validator hiện tại, voting power, vị trí nếu biết) và **Ủy quyền** (pool có thể stake). Chỉ báo epoch hiển thị epoch hiện tại.",
        "Mở pool tại `/validator/{address}` để xem hoa hồng, stake, hiệu suất và — nếu kết nối ví có ký gửi — **Ký gửi của tôi** với stake / unstake / restake / rút. Trên điện thoại, các thao tác này ở mỗi thẻ ký gửi, không chỉ trong bảng desktop.",
        "Ủy quyền là thao tác giao thức: tốn gas và dùng ví. Đọc số tiền và thời gian khóa trước khi xác nhận.",
      ],
    },
    assets: {
      title: "Coin, tài sản fungible và NFT",
      paragraphs: [
        "**Coin** là loại Move `0x1::coin` gốc (`address::module::Struct`). **Tài sản fungible (FA)** là chuẩn mới dựa trên đối tượng. APT có trong cả hai view; nhiều token mới chỉ là FA. [Danh sách coin](/coins) trộn coin và FA được liệt kê.",
        "Trang coin là `/coin/{type}` (loại được mã hóa URL). Trang FA là `/fungible_asset/{metadataAddress}`. Tab thường gồm **Thông tin**, **Giao dịch** và **Người nắm giữ** (người nắm giữ cần hỗ trợ indexer).",
        "NFT và tài sản số dùng `/token/{tokenId}` với **Tổng quan** và **Hoạt động**. Bộ sưu tập bị cấm hoặc lừa đảo có thể ẩn hoặc gắn cờ.",
        "Huy hiệu xác minh (native, Labs verified, cộng đồng/Panora, recognized, unverified, banned) được giải thích trên trang [xác minh](/verification). Huy hiệu không đảm bảo giá trị hay an toàn.",
      ],
    },
    analytics: {
      title: "Phân tích",
      paragraphs: [
        "[Phân tích](/analytics) **chỉ trên mainnet**. Mạng khác hiển thị thông báo ngắn thay vì biểu đồ. Biểu đồ gồm giao dịch người dùng hàng ngày, TPS đỉnh, người dùng hoạt động, tài khoản mới, triển khai, gas và khoảng cách khối. Bạn có thể chuyển khoảng 7 ngày vs 30 ngày.",
        "Dải trên cùng tóm tắt supply, stake, TPS và số node. Dữ liệu từ file chain-stats công bố cộng truy vấn chuỗi trực tiếp — có thể trễ nhẹ.",
      ],
    },
    releases: {
      title: "Phát hành, AIP và công cụ",
      paragraphs: [
        "[Trung tâm phát hành](/releases) có ba tab: **Mạng** (epoch, chiều cao, phiên bản framework/node, feature flag trên mainnet, testnet và devnet), **AIP** (Aptos Improvement Proposals từ kho AIP công khai) và **SDK** (CLI, `aptos-node` và phát hành SDK chính thức).",
        "URL cũ `/deployments` và `/aips` chuyển hướng đến đây.",
      ],
    },
    runScript: {
      title: "Chạy script (nâng cao)",
      paragraphs: [
        "[Chạy script](/run-script) tạo, **mô phỏng** và **thực thi** giao dịch **script** Move đã biên dịch từ ví đã kết nối. Script không có ABI trên chuỗi, nên bạn phải khai báo kiểu tham số. Không có trình biên dịch Move trong trình duyệt — dán bytecode (hex) từ trình biên dịch bạn tin cậy.",
        "Coi như không thể hoàn tác sau khi thực thi. Luôn đọc mô phỏng (trạng thái, gas, sự kiện, thay đổi tài nguyên) trước khi Thực thi. Ưu tiên tab **Chạy** trong Module tài khoản cho hàm entry đã publish.",
      ],
    },
    configure: {
      title: "Cấu hình",
      paragraphs: [
        "Mở [Cài đặt](/settings). Tùy chọn được lưu **trong trình duyệt này**, không trên máy chủ Aptos Labs.",
      ],
      bullets: [
        "**Ngôn ngữ** — Mặc định trình duyệt hoặc ngôn ngữ cụ thể. Điều khiển giao diện dịch, nội dung cài đặt và hướng dẫn này. Dữ liệu trên chuỗi (địa chỉ, tên hàm, sự kiện) giữ như chuỗi lưu.",
        "**Giải mã bytecode Move** — tắt mặc định. Đọc tuyên bố miễn trừ trước khi bật. Khi tắt, view Giải mã và Disassembly bị ẩn.",
        "**Ghi đè khóa API** — khóa [geomi.dev](https://geomi.dev) tùy chọn theo mạng để trình duyệt không kẹt ở giới hạn tốc độ ẩn danh dùng chung. Khóa gửi dưới dạng `Authorization: Bearer`. Khóa client Geomi `AG-*` phải cho phép Origin của site này. Chỉ chọn **Ghi nhớ trên thiết bị này** trên máy bạn tin cậy; nếu không, khóa chỉ tồn tại trong phiên tab.",
        "**Chủ đề** — sáng hoặc tối từ nút mặt trời/mặt trăng trong header. Lưu trong cookie (`color_scheme`) và theo hệ thống nếu bạn chưa chọn.",
        "**Mạng** — chọn trong header; mã hóa trong `?network=` thay vì cài đặt.",
      ],
      more: [
        "Lưu áp dụng khóa API và giải mã (cùng ngôn ngữ): client cache bị loại bỏ và truy vấn được làm mới. **Khôi phục mặc định** xóa các tùy chọn trình khám phá này trong trình duyệt.",
        "Nếu thấy HTTP **429**, ngăn giới hạn tốc độ có thể đưa bạn đến Cài đặt. Nội dung Geomi *Per anonymous IP rate limit exceeded* nghĩa là không có khóa được chấp nhận; *Per application per IP rate limit exceeded* nghĩa là hạn mức khóa của bạn đã hết.",
      ],
    },
    wallet: {
      title: "Ví",
      paragraphs: [
        "Kết nối ví là tùy chọn. Dùng để mở tài khoản nhanh, stake, chạy hàm entry hoặc gửi script. Petra được liệt kê đầu tiên trong các ví có thể cài.",
        "Mạng của ví phải khớp mạng trình khám phá (có ngoại lệ nhỏ cho một số thiết lập RPC local/tùy chỉnh). Mạng không khớp chặn gửi để bạn không ký cho chuỗi sai.",
      ],
    },
    verification: {
      title: "Xác minh token và địa chỉ",
      paragraphs: [
        "Trình khám phá có thể hiển thị huy hiệu xác minh trên token và một số địa chỉ. Liệt kê cộng đồng qua [danh sách token Panora](https://github.com/PanoraExchange/Aptos-Tokens). Xác minh Labs dành cho tài sản native và token thiết lập được chọn.",
        "Hướng dẫn từng bước cho đội dự án ở trang [Xác minh token & địa chỉ](/verification). Người dùng vẫn nên kiểm tra địa chỉ loại/metadata, không chỉ tên hoặc biểu tượng.",
      ],
    },
    urls: {
      title: "URL, chia sẻ và agent",
      paragraphs: [
        "Ưu tiên **tab theo đường dẫn**, ví dụ `/account/0x1/modules` thay vì truy vấn `?tab=`. Sao chép thanh địa chỉ để chia sẻ view; giữ `?network=` nếu không ở mainnet.",
        "Mẫu canonical được ghi cho người dùng ở đây và cho phần mềm trong [`/llms.txt`](/llms.txt). Agent trong trình duyệt có thể dùng công cụ WebMCP chỉ đọc (tìm kiếm, mở giao dịch/tài khoản/khối/coin/phát hành/hướng dẫn) khi trình duyệt hỗ trợ.",
        "Khi trình khám phá được cài như PWA hoặc nhúng (ví dụ Petra Vault), nút **Chia sẻ** có thể xuất hiện trong header.",
      ],
    },
    glossary: {
      title: "Thuật ngữ",
      bullets: [
        "**Địa chỉ** — định danh tài khoản hoặc đối tượng 32 byte, hex với `0x`. `0x1` là Aptos Framework.",
        "**ANS** — Aptos Name Service. Tên như `alice.apt` ánh xạ đến địa chỉ.",
        "**Chiều cao khối** — chỉ số khối, bắt đầu từ 0.",
        "**Sự kiện** — log có cấu trúc phát ra khi giao dịch chạy.",
        "**Tài sản fungible (FA)** — chuẩn token fungible dựa trên đối tượng (địa chỉ đối tượng metadata).",
        "**Gas** — phí thực thi và lưu trữ, trả bằng APT (octa bên trong).",
        "**Indexer** — API GraphQL Aptos Labs dùng cho lịch sử, người nắm giữ và một số tab. Không phải mọi mạng đều có.",
        "**Module** — mã Move đã publish. **Gói** nhóm các module.",
        "**Đối tượng** — thực thể trên chuỗi có địa chỉ riêng có thể giữ tài nguyên.",
        "**Octa** — 10⁻⁸ APT. 1 APT = 100.000.000 octa.",
        "**Tài nguyên** — dữ liệu Move có kiểu lưu dưới tài khoản hoặc đối tượng.",
        "**Số thứ tự** — bộ đếm theo tài khoản sắp xếp giao dịch của tài khoản đó.",
        "**Phiên bản giao dịch** — phiên bản sổ cái toàn cục (số nguyên) gán khi giao dịch được sắp xếp.",
        "**Write-set / thay đổi** — trạng thái giao dịch đã ghi.",
      ],
    },
    troubleshooting: {
      title: "Khắc phục sự cố",
      bullets: [
        "**Trang trống hoặc quay vòng** — kiểm tra chọn mạng và bạn có đang ở Local không có node. Thử mạng khác hoặc chờ 429.",
        "**Không tìm thấy giao dịch** — xác nhận phiên bản/hash và mạng. Phiên bản rất cũ có thể tải từ archive/indexer với ít trường hơn.",
        "**Tìm kiếm bỏ sót hash đã prune** — tra hash dùng fullnode rồi archive (không dùng khóa API trình khám phá). Indexer không thể tìm theo hash.",
        "**Thiếu Giải mã / Disassembly** — bật giải mã trong [Cài đặt](/settings) và chấp nhận tuyên bố miễn trừ.",
        "**Sai chuỗi** — xem `?network=` và menu thả xuống header.",
        "**Kết quả tìm kiếm cũ** — **Xóa bộ nhớ đệm** ở footer.",
        "**Thiếu phân tích** — chuyển sang mainnet.",
        "**Ví không gửi** — khớp mạng ví với trình khám phá; kết nối lại sau khi chuyển.",
      ],
    },
  },
} as const satisfies EnglishMessages;

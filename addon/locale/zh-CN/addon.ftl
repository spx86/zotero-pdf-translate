service-huoshanweb=火山网页翻译
service-tencenttransmart=腾讯TranSmart
service-huoshan=火山翻译
service-googleapi=Google(API)
service-google=Google
service-cnki=CNKI
service-youdao=有道
service-youdaozhiyun=有道智云
service-youdaozhiyunllm=有道子曰
service-niutranspro=小牛
service-microsoft=微软
service-caiyun=彩云
service-libretranslate=LibreTranslate
service-mtranserver=MTranServer
service-deeplfree=DeepL(免费订阅)
service-deeplpro=DeepL(Pro订阅)
service-deeplcustom=DeepLX(API)
service-deeplx=DeepLX
service-baidu=百度
service-baidufield=百度垂直领域
service-openl=OpenL
service-tencent=腾讯
service-aliyun=阿里
service-xftrans=讯飞
service-chatgpt=ChatGPT
service-customgpt1=自定义GPT1
service-customgpt2=自定义GPT2
service-customgpt3=自定义GPT3
service-customllm=自定义大模型（DeepSeek / OpenCode）
service-azuregpt=AzureGPT
service-gemini=Gemini
service-qwenmt=Qwen-MT
service-claude=Claude
service-haici=海词
service-iciba=金山词霸
service-bing=必应
service-pot=Pot
service-nllb=NLLB
service-mymemory=MyMemory
service-bingdict=必应词典(en→zh)🔊
service-cambridgedict=剑桥词典(en→other)🔊
service-haicidict=海词词典(en→zh)🔊
service-collinsdict=科林斯词典(en→zh)🔊
service-youdaodict=有道词典(en→zh)🔊
service-freedictionaryapi=FreeDictionaryAPI(en→en)
service-webliodict=Weblio Dict(en→ja)
service-gramotadict=Gramota.ru(ru)
service-errorPrefix=[请求错误]
    此翻译服务不可用，可能是密钥错误，也可能是请求过快。
    可以尝试其他翻译服务，或者来此查看相关回答：
    https://zotero.yuque.com/staff-gkhviy/pdf-trans/age09f
    
    请注意，这些错误与 Zotero 和本翻译插件无关，由该翻译服务引起：

service-niutranspro-error-insufficient-balance=
    当前小牛翻译积分不足，无法完成翻译请求。
    请前往小牛翻译充值中心购买积分后重试。

    小牛翻译充值中心：https://niutrans.com/price

    错误代码：{ $code } { $message }

service-dialog-config=配置
service-dialog-title={ $service } 配置
service-dialog-save=保存
service-dialog-close=关闭
service-dialog-help=帮助
service-dialog-custom-request-description=参考服务提供商的API文档，添加自定义参数。这些参数将与标准参数合并。
service-dialog-custom-request-title=自定义请求参数
service-dialog-custom-request-add-param=添加参数
service-dialog-custom-request-parameter-name=参数名称
service-dialog-custom-request-parameter-value=参数值
service-dialog-custom-request-parameter-name-placeholder=参数名称
service-dialog-custom-request-parameter-value-placeholder=参数值（JSON 格式）
service-dialog-custom-request-validation-title=无法保存自定义参数
service-dialog-custom-request-validation-summary=有些参数值不是有效的 JSON，请修改后重试。
service-dialog-custom-request-validation-errors-head=请检查以下项目：
service-dialog-custom-request-validation-error-invalid=- { $key }：格式无效（{ $detail }）
service-dialog-custom-request-validation-error-empty=- { $key }：值为空
service-dialog-custom-request-validation-error-duplicate=- { $key }：参数名重复
service-dialog-custom-request-validation-examples-head=“参数值”填写示例：
service-dialog-custom-request-validation-example-boolean=- 布尔值：false
service-dialog-custom-request-validation-example-number=- 数字：123
service-dialog-custom-request-validation-example-string=- 文本："text"
service-dialog-custom-request-validation-example-object=- 对象：{ $example }

service-niutranspro-dialog-endpoint=接口
service-niutranspro-dialog-username=用户名
service-niutranspro-dialog-password=密码
service-niutranspro-dialog-signup=注册
service-niutranspro-dialog-forget=忘记密码
service-niutranspro-dialog-dictLib=术语词典
service-niutranspro-dialog-memoryLib=翻译记忆
service-niutranspro-dialog-tip0=请到
service-niutranspro-dialog-tip1=小牛翻译云平台
service-niutranspro-dialog-tip2=进行添加术语词典库
service-niutranspro-dialog-signin=登录
service-niutranspro-dialog-refresh=刷新
service-niutranspro-dialog-signout=退出登录

service-deeplcustom-dialog-endPoint=接口
service-deeplx-dialog-endPoint=接口

service-chatgpt-dialog-endPoint=接口
service-chatgpt-dialog-model=模型
service-chatgpt-dialog-temperature=温度
service-chatgpt-dialog-prompt=提示词
service-gpt-dialog-prompt-hint=可用变量：{ $variables }。翻译正文必须使用 { $required }。
service-gpt-dialog-prompt-required=请加入 { $placeholder }，否则选中的文字不会发送给翻译服务。
service-chatgpt-dialog-stream=流式输出
service-chatgpt-dialog-custom-request=自定义请求

service-azuregpt-dialog-endPoint=接口
service-azuregpt-dialog-model=部署名
service-azuregpt-dialog-temperature=温度
service-azuregpt-dialog-stream=流式输出
service-azuregpt-dialog-apiVersion=版本
service-azuregpt-dialog-prompt=提示词
service-azuregpt-dialog-custom-request=自定义请求

service-xftrans-dialog-engine=翻译引擎

service-customllm-dialog-provider=服务商预设
service-customllm-provider-custom=自定义 / 其他 OpenAI 兼容接口
service-customllm-provider-deepseek=DeepSeek
service-customllm-provider-opencode=OpenCode Zen
service-customllm-provider-opencode-go=OpenCode Go
service-customllm-dialog-baseUrl=Base URL
service-customllm-dialog-baseUrl-hint=OpenAI 兼容接口的 Base URL，请求地址会自动拼接。示例：https://api.deepseek.com/v1 - https://opencode.ai/zen/v1 - https://opencode.ai/zen/v1/responses（Responses API，用于 GPT/Claude 系列模型）。
service-customllm-dialog-resolvedUrl=实际请求地址
service-customllm-dialog-resolvedUrl-empty=填写 Base URL 后显示实际请求地址
service-customllm-dialog-model=模型 ID
service-customllm-dialog-model-hint=请填写服务商提供的准确模型 ID，例如 deepseek-flash、deepseek-v4-pro（DeepSeek），glm-5.3-flash、kimi-k2.6（OpenCode）。可用模型会随时间变化。
service-customllm-dialog-thinking-hint=提示：DeepSeek 及部分 OpenCode 模型会先思考再作答，用于翻译会很慢。在「自定义请求」中新增名为 thinking、值为 {"type": "disabled"} 的字段即可关闭。
service-customllm-dialog-apiKey=API Key
service-customllm-dialog-apiKey-placeholder=在此粘贴 API Key
service-customllm-dialog-apiKey-hint=由 Zotero 统一保存在密钥库中，与其他翻译服务的密钥放在一起。不修改此输入框则保留原有密钥。
service-customllm-dialog-contextWindow=上下文长度（token）
service-customllm-dialog-contextWindow-hint=用于切分超长文本，保证单次请求不超过模型的上下文窗口。分段结果会按顺序翻译并自动拼接。
service-customllm-dialog-concurrency=并行分段数
service-customllm-dialog-concurrency-hint=超长文本同时翻译的分段数量，仅在文本超过上下文窗口时生效。接口越快可以调得越大，遇到限流则调小。
service-customllm-dialog-maxTokens=最大输出长度
service-customllm-dialog-maxTokens-hint=0 表示由服务商决定。
service-customllm-dialog-temperature=温度
service-customllm-dialog-prompt=提示词
service-customllm-dialog-stream=流式输出
service-customllm-dialog-custom-request=自定义请求
service-customllm-dialog-custom-request-description=合并到请求体中的额外 JSON 字段，例如 top_p 或服务商特有的思考开关。每个值都必须是合法的 JSON。
service-customllm-dialog-sessionId=会话 ID 请求头
service-customllm-dialog-sessionId-hint=作为 x-opencode-session 请求头发送。OpenCode Go / Zen 网关要求提供稳定的会话 ID 用于路由和提示词缓存；其他服务商会忽略它。清空该输入框即不再发送。
service-customllm-dialog-custom-headers=自定义请求头
service-customllm-dialog-custom-headers-description=随每次请求发送的额外 HTTP 请求头，JSON 对象格式，例如 API 版本号或网关特有的路由头。值必须是字符串。
service-dialog-custom-headers-title=自定义请求头
service-dialog-custom-headers-description=随每次请求发送的额外 HTTP 请求头。填写请求头名称与取值，取值会按文本保存。
service-customllm-error-header-charset=请求头 { $header } 中包含无法放入 HTTP 请求头的字符（第 { $index } 个字符，{ $code }）。请在服务设置的自定义请求头中删除该字符。
service-customllm-dialog-test=测试连接
service-customllm-test-running=正在测试…
service-customllm-test-ok=连接成功 — { $model } 在 { $ms } 毫秒内返回结果
service-customllm-test-ok-empty=连接成功 — { $model } 在 { $ms } 毫秒内响应，但只返回了思考内容（{ $tokens } 个 reasoning token，finish_reason: { $reason }）。说明 Base URL、API Key 和模型 ID 都正确。该模型会先思考再作答：在「自定义请求」中关闭思考模式可大幅提速。
service-customllm-test-ok-empty=连接成功 — { $model } 在 { $ms } 毫秒内响应，但只返回了思考内容（{ $tokens } 个 reasoning token，finish_reason: { $reason }）。说明 Base URL、API Key 和模型 ID 都正确。该模型会先思考再作答：在「自定义请求」中关闭思考模式可大幅提速。
service-customllm-test-fail=连接失败
service-customllm-progress=正在翻译第 { $index } / { $total } 段…
service-customllm-secret-empty=尚未设置 API Key。
service-customllm-secret-set=点击按钮可检查连通性。
service-customllm-error-baseUrl=尚未设置 Base URL。请打开服务设置，填写大模型接口的 Base URL。
service-customllm-error-model=尚未设置模型 ID。请打开服务设置，填写模型 ID。
service-customllm-error-apiKey=尚未设置 API Key。请在翻译服务旁的密钥输入框中粘贴，或在服务设置对话框中填写。
service-customllm-error-apiKey-charset=API Key 中包含无法放入 HTTP 请求头的字符（第 { $index } 个字符，{ $code }）。当前保存的内容长度为 { $length } 个字符，看起来并不是一个 API Key。请在「设置 → 服务」的密钥框中，或用「管理密钥」清空后重新粘贴。
service-customllm-error-hint-401=API Key 被拒绝。请检查密钥是否有效、是否属于该 Base URL。
service-customllm-error-hint-404=接口不存在。请检查 Base URL 与模型 ID。
service-customllm-error-hint-429=请求过于频繁或额度不足。请稍后重试。
service-customllm-error-hint-5xx=服务商返回服务器错误。请稍后重试。
service-customllm-error-empty=模型返回了空内容。请检查模型 ID 与最大输出长度设置。
service-customllm-error-empty-reasoning=模型把输出长度全部用在了思考上（{ $tokens } 个 reasoning token，finish_reason: { $reason }），没有产生译文。请在「自定义请求」中关闭思考模式——DeepSeek 填 thinking 对象并把 type 设为 disabled——或调大最大输出长度。
service-customllm-error-empty-truncated=输出在产生任何译文前就被截断了（finish_reason: length）。请调大最大输出长度。
service-customllm-error-empty-reasoning=模型把输出长度全部用在了思考上（{ $tokens } 个 reasoning token，finish_reason: { $reason }），没有产生译文。请在「自定义请求」中关闭思考模式——DeepSeek 填 {"thinking": {"type": "disabled"}}——或调大最大输出长度。
service-customllm-error-empty-truncated=输出在产生任何译文前就被截断了（finish_reason: length）。请调大最大输出长度。
service-customllm-error-hint-network=无法连接接口。请检查 Base URL 与网络连接。

service-gemini-dialog-endPoint=接口
service-gemini-dialog-prompt=提示词
service-gemini-dialog-stream=流式输出

service-qwenmt-dialog-endPoint=API地址
service-qwenmt-dialog-model=模型
service-qwenmt-dialog-domains=领域提示词

service-claude-dialog-endPoint=接口
service-claude-dialog-model=模型
service-claude-dialog-temperature=温度
service-claude-dialog-prompt=提示词
service-claude-dialog-stream=流式输出
service-claude-dialog-maxTokens=最大输出长度

service-cnki-settings=设置
service-cnki-dialog-regex=CNKI广告移除正则表达式
service-cnki-dialog-split=超过800字符自动拆分翻译

service-mymemory-dialog-userEmail=输入邮箱每IP每天可享5000字符

service-aliyun-dialog-action=版本
service-aliyun-dialog-scene=场景

service-tencent-dialog-secretid=密钥ID
service-tencent-dialog-secretkey=密钥Key
service-tencent-dialog-region=地域
service-tencent-dialog-projectid=项目ID
service-tencent-dialog-termrepoid=术语库IDs (可选)
service-tencent-dialog-sentrepoid=例句库IDs (可选)

service-youdaozhiyun-dialog-domain=领域
service-youdaozhiyunllm-dialog-model=模型
service-youdaozhiyunllm-dialog-pro=有道智云子曰大模型Pro-14B
service-youdaozhiyunllm-dialog-lite=有道智云子曰大模型Lite-1.5B
service-youdaozhiyunllm-dialog-prompt=提示词
service-youdaozhiyunllm-dialog-stream=流式输出

readerpopup-translate-label=翻译
readerpopup-addToNote-label=添加翻译至笔记

pref-title=翻译

field-titleTranslation=标题翻译
field-abstractTranslation=摘要翻译

status-translating=正在翻译...
sideBarIcon-title=翻译注释

service-manageKeys-title=管理翻译服务密钥
service-manageKeys-head=管理所有翻译服务密钥，直接编辑 JSON 文件并点击保存。
service-manageKeys-save=保存
service-manageKeys-close=关闭

service-renameServices-title=重命名自定义GPT服务
service-renameServices-head=输入新的服务名称并点击保存。
service-renameServices-hint=所做更改将在插件或Zotero重启后生效
service-renameServices-save=保存
service-renameServices-close=关闭

service-libretranslate-dialog-endPoint=API 地址

service-mtranserver-dialog-endPoint=接口
service-mtranserver-dialog-versionlabel=使用MTranServer v3.0.0+

service-pot-dialog-port=端口

service-nllb-dialog-model=nllb 模型
service-nllb-dialog-apiendpoint=nllb-api 接口
service-nllb-dialog-apistream=nllb-api 流式输出
service-nllb-dialog-serveendpoint=nllb-serve 接口
service-nllb-dialog-apilabel=nllb-api 文档
service-nllb-dialog-servelabel=nllb-serve 文档

service-huoshanweb=Volcengine Web
service-tencenttransmart=Tencent Transmart
service-huoshan=Huoshan
service-googleapi=Google(API)
service-google=Google
service-cnki=CNKI
service-youdao=Youdao
service-youdaozhiyun=Youdao Zhiyun
service-youdaozhiyunllm=Youdao LLM
service-niutranspro=Niu Trans
service-microsoft=Microsoft
service-caiyun=Caiyun
service-libretranslate=LibreTranslate
service-mtranserver=MTranServer
service-deeplfree=DeepL(Free Plan)
service-deeplpro=DeepL(Pro Plan)
service-deeplcustom=DeepLX(API)
service-deeplx=DeepLX
service-baidu=Baidu
service-baidufield=Baidu Field
service-openl=OpenL
service-tencent=Tencent
service-aliyun=Aliyun
service-xftrans=Xftrans
service-chatgpt=ChatGPT
service-customgpt1=Custom GPT 1
service-customgpt2=Custom GPT 2
service-customgpt3=Custom GPT 3
service-customllm=Custom LLM (DeepSeek / OpenCode)
service-azuregpt=AzureGPT
service-gemini=Gemini
service-qwenmt=Qwen-MT
service-claude=Claude
service-haici=Haici
service-iciba=iCIBA
service-bing=Bing
service-pot=Pot
service-nllb=NLLB
service-mymemory=MyMemory
service-bingdict=Bing Dict(en→zh)🔊
service-cambridgedict=Cambridge Dict(en→other)🔊
service-haicidict=Haici Dict(en→zh)🔊
service-collinsdict=Collins Dict(en→zh)🔊
service-youdaodict=Youdao Dict(en→zh)🔊
service-freedictionaryapi=FreeDictionaryAPI(en→en)
service-webliodict=Weblio Dict(en→ja)
service-gramotadict=Gramota.ru(ru)
service-errorPrefix=[Request Error]
    Service not available, invalid secret, or request too fast.
    Use another translation service or post the issue here: 
    https://github.com/windingwind/zotero-pdf-translate/issues
    
    The message below is not Zotero or the Translate plugin, but from

service-niutranspro-error-insufficient-balance=
    The current NiuTrans points balance is insufficient, so the translation request cannot be completed.
    Please purchase points from the NiuTrans recharge center and try again.

    NiuTrans recharge center: https://niutrans.com/price

    Error code: { $code } { $message }

service-dialog-config=Config
service-dialog-title={ $service } Config
service-dialog-save=Save
service-dialog-close=Close
service-dialog-help=Help
service-dialog-custom-request-description=Refer to API documentation of service provider, add custom parameters. These will be merged with the standard parameters (model, messages, temperature, stream).
service-dialog-custom-request-title=Custom Request Parameters
service-dialog-custom-request-add-param=Add Parameter
service-dialog-custom-request-parameter-name=Parameter Name
service-dialog-custom-request-parameter-value=Parameter Value
service-dialog-custom-request-parameter-name-placeholder=Parameter name
service-dialog-custom-request-parameter-value-placeholder=Parameter value (JSON format)
service-dialog-custom-request-validation-title=Can't Save Custom Parameters
service-dialog-custom-request-validation-summary=Some parameter values are not valid JSON. Please fix them and try again.
service-dialog-custom-request-validation-errors-head=Please check:
service-dialog-custom-request-validation-error-invalid=- { $key }: invalid format ({ $detail })
service-dialog-custom-request-validation-error-empty=- { $key }: value is empty
service-dialog-custom-request-validation-error-duplicate=- { $key }: duplicate parameter name
service-dialog-custom-request-validation-examples-head=Examples for the value field:
service-dialog-custom-request-validation-example-boolean=- Boolean: false
service-dialog-custom-request-validation-example-number=- Number: 123
service-dialog-custom-request-validation-example-string=- Text: "text"
service-dialog-custom-request-validation-example-object=- Object: { $example }

service-niutranspro-dialog-endpoint=Endpoint
service-niutranspro-dialog-username=Username
service-niutranspro-dialog-password=Password
service-niutranspro-dialog-signup=Sign up
service-niutranspro-dialog-forget=Forget
service-niutranspro-dialog-dictLib=Dict Lib
service-niutranspro-dialog-memoryLib=Memory Lib
service-niutranspro-dialog-tip0=Please go to the
service-niutranspro-dialog-tip1=Niutrans Cloud Platform
service-niutranspro-dialog-tip2=to add the term dictionary library
service-niutranspro-dialog-signin=Sign In
service-niutranspro-dialog-refresh=Refresh
service-niutranspro-dialog-signout=Sign Out

service-deeplcustom-dialog-endPoint=EndPoint
service-deeplx-dialog-endPoint=EndPoint

service-chatgpt-dialog-endPoint=API
service-chatgpt-dialog-model=Model
service-chatgpt-dialog-temperature=Temp
service-chatgpt-dialog-prompt=Prompt
service-gpt-dialog-prompt-hint=Available variables: { $variables }. { $required } is required.
service-gpt-dialog-prompt-required=Please add { $placeholder } so the selected text can be sent for translation.
service-chatgpt-dialog-stream=Stream
service-chatgpt-dialog-custom-request=Custom Request

service-azuregpt-dialog-endPoint=EndPoint
service-azuregpt-dialog-model=Name
service-azuregpt-dialog-temperature=Temp
service-azuregpt-dialog-apiVersion=Version
service-azuregpt-dialog-prompt=Prompt
service-azuregpt-dialog-stream=Stream
service-azuregpt-dialog-custom-request=Custom Request

service-xftrans-dialog-engine=API Engine

service-customllm-dialog-provider=Provider preset
service-customllm-provider-custom=Custom / other OpenAI-compatible
service-customllm-provider-deepseek=DeepSeek
service-customllm-provider-opencode=OpenCode Zen
service-customllm-provider-opencode-go=OpenCode Go
service-customllm-dialog-baseUrl=Base URL
service-customllm-dialog-baseUrl-hint=Base URL of the OpenAI-compatible API. The request URL is built automatically. Examples: https://api.deepseek.com/v1 - https://opencode.ai/zen/v1 - https://opencode.ai/zen/v1/responses (Responses API, for GPT/Claude style models).
service-customllm-dialog-resolvedUrl=Request URL
service-customllm-dialog-resolvedUrl-empty=Set a Base URL to see the request URL
service-customllm-dialog-model=Model ID
service-customllm-dialog-model-hint=Use the exact model ID of your provider, for example deepseek-chat or deepseek-reasoner (DeepSeek), deepseek-v4-flash or glm-5.3-flash (OpenCode Zen). Available IDs change over time.
service-customllm-dialog-apiKey=API Key
service-customllm-dialog-apiKey-placeholder=Paste the API key here
service-customllm-dialog-apiKey-hint=Stored by Zotero in the shared key store, together with the other services. Leave the field untouched to keep the current key.
service-customllm-dialog-contextWindow=Context window (tokens)
service-customllm-dialog-contextWindow-hint=Used to split very long text so that a single request never exceeds the model's context window. The parts are translated in order and joined automatically.
service-customllm-dialog-concurrency=Parallel parts
service-customllm-dialog-concurrency-hint=How many parts of a long text are translated at the same time. Only used when the text is longer than the context window. Raise it for a faster provider, lower it if you hit rate limits.
service-customllm-dialog-maxTokens=Max output tokens
service-customllm-dialog-maxTokens-hint=0 lets the provider decide.
service-customllm-dialog-temperature=Temp
service-customllm-dialog-prompt=Prompt
service-customllm-dialog-stream=Stream
service-customllm-dialog-custom-request=Custom Request
service-customllm-dialog-custom-request-description=Extra JSON fields merged into the request body, for example top_p or a provider specific thinking option. Each value must be valid JSON.
service-customllm-dialog-sessionId=Session ID header
service-customllm-dialog-sessionId-hint=Sent as the x-opencode-session header. The OpenCode Go and Zen gateways require a stable session id for routing and prompt caching; other providers ignore it. Clear the field to stop sending it.
service-customllm-dialog-custom-headers=Custom Headers
service-customllm-dialog-custom-headers-description=Extra HTTP headers sent with every request, as a JSON object, for example an API version or a gateway specific routing header. Values must be strings.
service-dialog-custom-headers-title=Custom Headers
service-dialog-custom-headers-description=Extra HTTP headers sent with every request. Enter a header name and its value; the value is stored as text.
service-customllm-error-header-charset=The { $header } header contains a character that cannot be sent in an HTTP header (character { $index }, { $code }). Remove it from the custom headers in the service settings.
service-customllm-dialog-test=Test connection
service-customllm-test-running=Testing...
service-customllm-test-ok=OK - { $model } replied in { $ms } ms
service-customllm-test-fail=Failed
service-customllm-progress=Translating part { $index } of { $total }...
service-customllm-secret-empty=The API key is not set.
service-customllm-secret-set=Click the button to check connectivity.
service-customllm-error-baseUrl=Base URL is not set. Open the service settings and set the Base URL of your LLM API.
service-customllm-error-model=Model ID is not set. Open the service settings and set the model ID.
service-customllm-error-apiKey=API key is not set. Paste it into the key field next to the translation service, or into the service settings dialog.
service-customllm-error-apiKey-charset=The API key contains a character that cannot be sent in an HTTP header (character { $index }, { $code }). The stored value is { $length } characters long, so it does not look like an API key. Clear the key field (Settings > Service, or Manage Keys) and paste the key again.
service-customllm-error-hint-401=The API key was rejected. Check that the key is valid and belongs to this Base URL.
service-customllm-error-hint-404=Endpoint not found. Check the Base URL and the model ID.
service-customllm-error-hint-429=Rate limit or quota exceeded. Wait a moment and retry.
service-customllm-error-hint-5xx=The provider reported a server error. Retry later.
service-customllm-error-empty=The model returned an empty answer. Check the model ID and the max output tokens.
service-customllm-error-hint-network=Could not reach the API. Check the Base URL and your network connection.

service-gemini-dialog-endPoint=EndPoint
service-gemini-dialog-prompt=Prompt
service-gemini-dialog-stream=Stream

service-qwenmt-dialog-endPoint=EndPoint
service-qwenmt-dialog-model=Model
service-qwenmt-dialog-domains=Domains

service-claude-dialog-endPoint=EndPoint
service-claude-dialog-model=Model
service-claude-dialog-temperature=Temp
service-claude-dialog-prompt=Prompt
service-claude-dialog-stream=Stream
service-claude-dialog-maxTokens=Max Tokens

service-cnki-settings=Settings
service-cnki-dialog-regex=CNKI Addvertisements Regex
service-cnki-dialog-split=Automatically split translation for more than 800 characters

service-mymemory-dialog-userEmail=Free upgrade: enter email for 5K chars/day per IP

service-aliyun-dialog-action=Action
service-aliyun-dialog-scene=Scene

service-tencent-dialog-secretid=Secret ID
service-tencent-dialog-secretkey=Secret Key
service-tencent-dialog-region=Region
service-tencent-dialog-projectid=Project ID
service-tencent-dialog-termrepoid=Term Repo IDs (optional)
service-tencent-dialog-sentrepoid=Sent Repo IDs (optional)

service-youdaozhiyun-dialog-domain=Domain
service-youdaozhiyunllm-dialog-model=Model
service-youdaozhiyunllm-dialog-pro=Youdao LLM Pro-14B
service-youdaozhiyunllm-dialog-lite=Youdao LLM Lite-1.5B
service-youdaozhiyunllm-dialog-prompt=Prompt
service-youdaozhiyunllm-dialog-stream=Stream

readerpopup-translate-label=Translate
readerpopup-addToNote-label=Add Translation to Note

pref-title=Translate

field-titleTranslation=Title Translation
field-abstractTranslation=Abstract Translation

status-translating=Translating...
sideBarIcon-title=Translate annotation

service-manageKeys-title=Manage Translation Service Keys
service-manageKeys-head=Manage all translation service keys. Edit the JSON directly and click Save.
service-manageKeys-save=Save
service-manageKeys-close=Close

service-renameServices-title=Rename Custom GPT Services
service-renameServices-head=Input the new name and click Save.
service-renameServices-hint=Changes take effect after restarting the plugin or Zotero
service-renameServices-save=Save
service-renameServices-close=Close

service-libretranslate-dialog-endPoint=API Endpoint

service-mtranserver-dialog-endPoint=EndPoint
service-mtranserver-dialog-versionlabel=Use MTranServer v3.0.0+

service-pot-dialog-port=Port

service-nllb-dialog-model=nllb Model
service-nllb-dialog-apiendpoint=nllb-api EndPoint
service-nllb-dialog-apistream=nllb-api Stream
service-nllb-dialog-serveendpoint=nllb-serve EndPoint
service-nllb-dialog-apilabel=nllb-api Docs
service-nllb-dialog-servelabel=nllb-serve Docs

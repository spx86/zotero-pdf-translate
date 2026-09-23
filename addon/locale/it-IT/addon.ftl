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
service-deeplx=DeepLx
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
service-customllm=LLM personalizzato (DeepSeek / OpenCode)
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
service-errorPrefix=[Errore nella richiesta]
    Servizio di traduzione non disponibile, segreto non valido, o richiesta troppo rapida.
    Si prega di usare un altro servizio di traduzione o di segnalare il problema qui: 
    https://github.com/windingwind/zotero-pdf-translate/issues
    
    Il messaggio seguente non è di Zotero o dell'estensione Translate ma proviene da

service-niutranspro-error-insufficient-balance=
    Il saldo punti NiuTrans non è sufficiente per completare la richiesta di traduzione.
    Acquista punti nel centro ricariche NiuTrans e riprova.

    Centro ricariche NiuTrans: https://niutrans.com/price

    Codice errore: { $code } { $message }

service-dialog-config=Config
service-dialog-title={ $service } Config
service-dialog-save=Save
service-dialog-close=Close
service-dialog-help=Help
service-dialog-custom-request-description=Refer to API documentation of service provider, add custom parameters. These will be merged with the standard parameters (model, messages, temperature, stream).
service-dialog-custom-request-title=Custom Request Parameters
service-dialog-custom-request-add-param=Add Parameter
service-dialog-custom-request-parameter-name=Nome parametro
service-dialog-custom-request-parameter-value=Valore parametro
service-dialog-custom-request-parameter-name-placeholder=Nome parametro
service-dialog-custom-request-parameter-value-placeholder=Valore parametro (formato JSON)
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
service-niutranspro-dialog-username=Nome utente
service-niutranspro-dialog-password=Password
service-niutranspro-dialog-signup=Registrati
service-niutranspro-dialog-forget=Dimentica
service-niutranspro-dialog-dictLib=Lib. Diz.
service-niutranspro-dialog-memoryLib=Lib. Mem.
service-niutranspro-dialog-tip0=Si prega di collegarsi a
service-niutranspro-dialog-tip1=Niutrans Cloud Platform
service-niutranspro-dialog-tip2=per aggiungere il vocabolo alla libreria dei dizionari
service-niutranspro-dialog-signin=Autenticati
service-niutranspro-dialog-refresh=Aggiorna
service-niutranspro-dialog-signout=Esci

service-deeplcustom-dialog-endPoint=EndPoint
service-deeplx-dialog-endPoint=API

service-chatgpt-dialog-endPoint=API
service-chatgpt-dialog-model=Modello
service-chatgpt-dialog-temperature=Temperatura
service-chatgpt-dialog-prompt=Prompt
service-gpt-dialog-prompt-hint=Variabili disponibili: { $variables }. { $required } è obbligatorio.
service-gpt-dialog-prompt-required=Aggiungi { $placeholder } per inviare il testo selezionato al servizio di traduzione.
service-chatgpt-dialog-stream=Stream
service-chatgpt-dialog-custom-request=Custom Request

service-azuregpt-dialog-endPoint=EndPoint
service-azuregpt-dialog-model=Nome
service-azuregpt-dialog-temperature=Temperatura
service-azuregpt-dialog-apiVersion=Versione
service-azuregpt-dialog-prompt=Prompt
service-azuregpt-dialog-stream=Stream
service-azuregpt-dialog-custom-request=Custom Request

service-xftrans-dialog-engine=API Engine

service-customllm-dialog-provider=Preset del provider
service-customllm-provider-custom=Personalizzato / altro compatibile OpenAI
service-customllm-provider-deepseek=DeepSeek
service-customllm-provider-opencode=OpenCode Zen
service-customllm-provider-opencode-go=OpenCode Go
service-customllm-dialog-baseUrl=Base URL
service-customllm-dialog-baseUrl-hint=Base URL dell'API compatibile con OpenAI. L'URL della richiesta viene composto automaticamente. Esempi: https://api.deepseek.com/v1 - https://opencode.ai/zen/v1 - https://opencode.ai/zen/v1/responses (Responses API, per modelli in stile GPT/Claude).
service-customllm-dialog-resolvedUrl=URL della richiesta
service-customllm-dialog-resolvedUrl-empty=Imposta un Base URL per vedere l'URL della richiesta
service-customllm-dialog-model=ID del modello
service-customllm-dialog-model-hint=Usa l'ID esatto fornito dal tuo provider, ad esempio deepseek-flash o deepseek-v4-pro (DeepSeek), glm-5.3-flash o kimi-k2.6 (OpenCode). Gli ID disponibili cambiano nel tempo.
service-customllm-dialog-thinking-hint=Suggerimento: DeepSeek e diversi modelli OpenCode ragionano prima di rispondere, il che e lento per la traduzione. In Richiesta personalizzata aggiungi un campo thinking con valore {"type": "disabled"} per disattivarlo.
service-customllm-dialog-apiKey=Chiave API
service-customllm-dialog-apiKey-placeholder=Incolla qui la chiave API
service-customllm-dialog-apiKey-hint=Salvata da Zotero nell'archivio delle chiavi condiviso, insieme agli altri servizi. Lascia il campo invariato per mantenere la chiave attuale.
service-customllm-dialog-contextWindow=Finestra di contesto (token)
service-customllm-dialog-contextWindow-hint=Usata per suddividere testi molto lunghi, così una singola richiesta non supera la finestra di contesto del modello. Le parti vengono tradotte in ordine e unite automaticamente.
service-customllm-dialog-concurrency=Parti in parallelo
service-customllm-dialog-concurrency-hint=Quante parti di un testo lungo vengono tradotte contemporaneamente. Usato solo quando il testo supera la finestra di contesto. Aumentalo con un provider veloce, riducilo se ricevi errori di limite di richieste.
service-customllm-dialog-maxTokens=Token massimi in output
service-customllm-dialog-maxTokens-hint=0 lascia decidere al provider.
service-customllm-dialog-temperature=Temp
service-customllm-dialog-prompt=Prompt
service-customllm-dialog-stream=Stream
service-customllm-dialog-custom-request=Richiesta personalizzata
service-customllm-dialog-custom-request-description=Campi JSON aggiuntivi uniti al corpo della richiesta, ad esempio top_p o un'opzione di ragionamento specifica del provider. Ogni valore deve essere JSON valido.
service-customllm-dialog-sessionId=Intestazione ID sessione
service-customllm-dialog-sessionId-hint=Inviata come intestazione x-opencode-session. I gateway OpenCode Go e Zen richiedono un ID sessione stabile per l'instradamento e la cache dei prompt; gli altri provider la ignorano. Svuota il campo per non inviarla.
service-customllm-dialog-custom-headers=Intestazioni personalizzate
service-customllm-dialog-custom-headers-description=Intestazioni HTTP aggiuntive inviate con ogni richiesta, come oggetto JSON, ad esempio una versione API o un'intestazione di instradamento specifica del gateway. I valori devono essere stringhe.
service-dialog-custom-headers-title=Intestazioni personalizzate
service-dialog-custom-headers-description=Intestazioni HTTP aggiuntive inviate con ogni richiesta. Inserisci il nome dell'intestazione e il suo valore; il valore viene salvato come testo.
service-customllm-error-header-charset=L'intestazione { $header } contiene un carattere che non può essere inviato in un'intestazione HTTP (carattere { $index }, { $code }). Rimuovilo dalle intestazioni personalizzate nelle impostazioni del servizio.
service-customllm-dialog-test=Verifica connessione
service-customllm-test-running=Verifica in corso...
service-customllm-test-ok=OK - { $model } ha risposto in { $ms } ms
service-customllm-test-ok-empty=OK - { $model } ha risposto in { $ms } ms, ma ha inviato solo il testo di ragionamento ({ $tokens } token di ragionamento, finish reason: { $reason }). Il Base URL, la chiave API e l'ID del modello sono corretti. Questo modello ragiona prima di rispondere: disattiva la modalita di ragionamento in Richiesta personalizzata per velocizzare molto la traduzione.
service-customllm-test-ok-empty=OK - { $model } ha risposto in { $ms } ms, ma ha inviato solo il testo di ragionamento ({ $tokens } token di ragionamento, finish reason: { $reason }). Il Base URL, la chiave API e il modello sono corretti. Questo modello ragiona prima di rispondere: disattiva la modalita di ragionamento in Richiesta personalizzata per velocizzare molto la traduzione.
service-customllm-test-fail=Non riuscito
service-customllm-progress=Traduzione della parte { $index } di { $total }...
service-customllm-secret-empty=La chiave API non è impostata.
service-customllm-secret-set=Fai clic sul pulsante per verificare la connessione.
service-customllm-error-baseUrl=Base URL non impostato. Apri le impostazioni del servizio e inserisci il Base URL della tua API LLM.
service-customllm-error-model=ID del modello non impostato. Apri le impostazioni del servizio e inserisci l'ID del modello.
service-customllm-error-apiKey=Chiave API non impostata. Incollala nel campo accanto al servizio di traduzione oppure nella finestra delle impostazioni del servizio.
service-customllm-error-apiKey-charset=La chiave API contiene un carattere che non può essere inviato in un'intestazione HTTP (carattere { $index }, { $code }). Il valore salvato è lungo { $length } caratteri, quindi non sembra una chiave API. Svuota il campo della chiave (Impostazioni > Servizio, oppure Gestisci chiavi) e incolla di nuovo la chiave.
service-customllm-error-hint-401=Chiave API rifiutata. Verifica che sia valida e che appartenga a questo Base URL.
service-customllm-error-hint-404=Endpoint non trovato. Controlla il Base URL e l'ID del modello.
service-customllm-error-hint-429=Limite di richieste o quota superati. Attendi qualche istante e riprova.
service-customllm-error-hint-5xx=Il provider ha segnalato un errore del server. Riprova più tardi.
service-customllm-error-empty=Il modello ha restituito una risposta vuota. Controlla l'ID del modello e i token massimi in output.
service-customllm-error-empty-reasoning=Il modello ha usato tutto il budget di output per il ragionamento ({ $tokens } token di ragionamento, finish reason: { $reason }) senza produrre alcuna traduzione. Disattiva la modalita di ragionamento in Richiesta personalizzata - per DeepSeek aggiungi un oggetto thinking con type disabled - oppure aumenta i token massimi in output.
service-customllm-error-empty-truncated=La risposta si e interrotta prima di produrre testo (finish reason: length). Aumenta i token massimi in output.
service-customllm-error-empty-reasoning=Il modello ha usato tutto il budget di output per il ragionamento ({ $tokens } token di ragionamento, finish reason: { $reason }) senza produrre alcuna traduzione. Disattiva la modalita di ragionamento in Richiesta personalizzata - per DeepSeek aggiungi {"thinking": {"type": "disabled"}} - oppure aumenta i token massimi in output.
service-customllm-error-empty-truncated=La risposta e stata troncata prima di produrre testo (finish reason: length). Aumenta i token massimi in output.
service-customllm-error-hint-network=Impossibile raggiungere l'API. Controlla il Base URL e la connessione di rete.

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

service-cnki-settings=Impostazioni
service-cnki-dialog-regex=Regex per gli annunci CNKI
service-cnki-dialog-split=Dividi automaticamente la traduzione per più di 800 caratteri

service-mymemory-dialog-userEmail=Free upgrade: enter email for 5K chars/day per IP

service-aliyun-dialog-action=Azione
service-aliyun-dialog-scene=Scena

service-tencent-dialog-secretid=Segreto ID
service-tencent-dialog-secretkey=Segreto Key
service-tencent-dialog-region=Regione
service-tencent-dialog-projectid=Progetto ID
service-tencent-dialog-termrepoid=Term Repo IDs (opzionale)
service-tencent-dialog-sentrepoid=Sent Repo IDs (opzionale)

service-youdaozhiyun-dialog-domain=Settore
service-youdaozhiyunllm-dialog-model=Modello
service-youdaozhiyunllm-dialog-pro=Youdao LLM Pro-14B
service-youdaozhiyunllm-dialog-lite=Youdao LLM Lite-1.5B
service-youdaozhiyunllm-dialog-prompt=Prompt
service-youdaozhiyunllm-dialog-stream=Stream

readerpopup-translate-label=Traduci
readerpopup-addToNote-label=Aggiungi traduzione alla nota

pref-title=Translate

field-titleTranslation=Traduzione del titolo
field-abstractTranslation=Traduzione dell'Abstract

status-translating=Traduzione in corso...
sideBarIcon-title=Translate annotation

service-manageKeys-title=Gestione delle chiavi dei segreto di traduzione
service-manageKeys-head=Gestisci tutte le dei segreto di traduzione. Modifica direttamente il file JSON e clicca su Salva.
service-manageKeys-save=Salva
service-manageKeys-close=Chiudi

service-renameServices-title=Rinominare i servizi Custom GPT
service-renameServices-head=Inserisci il nuovo nome e clicca su Salva.
service-renameServices-hint=Le modifiche avranno effetto dopo il riavvio del plugin o di Zotero
service-renameServices-save=Salva
service-renameServices-close=Chiudi

service-libretranslate-dialog-endPoint=API Endpoint

service-mtranserver-dialog-endPoint=EndPoint
service-mtranserver-dialog-versionlabel=Use MTranServer v3.0.0+

service-pot-dialog-port=Port

service-nllb-dialog-model=nllb Modello
service-nllb-dialog-apiendpoint=nllb-api EndPoint
service-nllb-dialog-apistream=nllb-api Stream
service-nllb-dialog-serveendpoint=nllb-serve EndPoint
service-nllb-dialog-apilabel=nllb-api Docs
service-nllb-dialog-servelabel=nllb-serve Docs

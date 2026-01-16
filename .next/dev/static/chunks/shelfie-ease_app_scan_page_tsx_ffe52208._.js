(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/shelfie-ease/app/scan/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ScanPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shelfie-ease/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shelfie-ease/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shelfie-ease/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shelfie-ease/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$script$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/shelfie-ease/node_modules/next/script.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function ScanPage() {
    _s();
    const [isScanning, setIsScanning] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [manualIsbn, setManualIsbn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [scannedBook, setScannedBook] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [debugLogs, setDebugLogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [showDebug, setShowDebug] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [quaggaLoaded, setQuaggaLoaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [quagga2Loaded, setQuagga2Loaded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [usingQuagga2, setUsingQuagga2] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const isProcessingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Veilige serialisatie functie die omgaat met circulaire referenties en React/DOM elementen
    const safeStringify = (obj, depth = 0)=>{
        if (depth > 10) return '[Max depth reached]';
        // Handle primitives
        if (obj === null) return 'null';
        if (obj === undefined) return 'undefined';
        if (typeof obj === 'string') return `"${obj}"`;
        if (typeof obj !== 'object') return String(obj);
        // Handle special objects
        if (obj instanceof Error) return `Error: ${obj.message}`;
        if (obj instanceof Date) return obj.toISOString();
        if (obj instanceof HTMLElement) return `[HTMLElement: ${obj.tagName}]`;
        if (obj instanceof Element) return `[Element: ${obj.tagName || 'Unknown'}]`;
        // Check for React elements
        if (obj.$$typeof) return '[React Element]';
        if (obj._owner) return '[React Component]';
        if (obj.__reactFiber) return '[React Fiber]';
        // Handle arrays
        if (Array.isArray(obj)) {
            const items = obj.slice(0, 5).map((item)=>safeStringify(item, depth + 1));
            const more = obj.length > 5 ? `... (+${obj.length - 5} more)` : '';
            return `[${items.join(', ')}${more}]`;
        }
        // Handle objects - gebruik Map om circulaire referenties te detecteren
        const seen = new Map();
        let refCounter = 0;
        const stringifyValue = (val, currentDepth)=>{
            if (currentDepth > 5) return '[Max depth]';
            if (val === null || val === undefined) return String(val);
            if (typeof val !== 'object') return String(val);
            // Check for circular reference
            if (seen.has(val)) {
                const refId = seen.get(val) || `#${++refCounter}`;
                if (!seen.has(val)) seen.set(val, refId);
                return `[Circular ${refId}]`;
            }
            // Check for React/DOM elements
            if (val instanceof HTMLElement) return `[HTMLElement: ${val.tagName}]`;
            if (val instanceof Element) return `[Element]`;
            if (val.$$typeof) return '[React Element]';
            if (val._owner) return '[React Component]';
            if (val.__reactFiber) return '[React Fiber]';
            seen.set(val, `#${++refCounter}`);
            if (Array.isArray(val)) {
                return `[Array(${val.length})]`;
            }
            try {
                const keys = Object.keys(val).slice(0, 10);
                const pairs = keys.map((key)=>{
                    try {
                        return `"${key}": ${stringifyValue(val[key], currentDepth + 1)}`;
                    } catch  {
                        return `"${key}": [Error serializing]`;
                    }
                });
                return `{${pairs.join(', ')}}`;
            } catch  {
                return '[Object]';
            }
        };
        try {
            const keys = Object.keys(obj).slice(0, 10);
            const pairs = keys.map((key)=>{
                try {
                    return `"${key}": ${stringifyValue(obj[key], depth + 1)}`;
                } catch  {
                    return `"${key}": [Error]`;
                }
            });
            return `{${pairs.join(', ')}}`;
        } catch  {
            return '[Object]';
        }
    };
    // Debug logging functie die ook naar het scherm schrijft
    const debugLog = (message, data)=>{
        const timestamp = new Date().toLocaleTimeString();
        let logMessage;
        if (data !== undefined) {
            try {
                const serialized = safeStringify(data);
                logMessage = `[${timestamp}] ${message}: ${serialized}`;
            } catch (e) {
                logMessage = `[${timestamp}] ${message}: [Error serializing data]`;
            }
        } else {
            logMessage = `[${timestamp}] ${message}`;
        }
        // Log naar console (voor desktop debugging) - gebruik console.log direct voor objecten
        if (data !== undefined) {
            console.log(`[${timestamp}] ${message}`, data);
        } else {
            console.log(logMessage);
        }
        // Voeg toe aan debug logs (voor mobiel) - gebruik veilige string versie
        setDebugLogs((prev)=>{
            const newLogs = [
                ...prev,
                logMessage
            ];
            // Houd alleen laatste 50 logs
            return newLogs.slice(-50);
        });
    };
    // Cleanup bij unmount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ScanPage.useEffect": ()=>{
            return ({
                "ScanPage.useEffect": ()=>{
                    stopCamera();
                }
            })["ScanPage.useEffect"];
        }
    }["ScanPage.useEffect"], []);
    /**
   * Callback functie voor barcode scanning - verwerkt gedetecteerde barcodes
   * QuaggaJS result heeft een codeResult object met code en format
   */ const handleBarcodeResult = (result)=>{
        try {
            // QuaggaJS codeResult structuur: { code: string, format: string }
            const code = result.code ? result.code.trim() : String(result).trim();
            const format = result.format || 'unknown';
            debugLog('🔍 BARCODE DETECTED!', {
                code: code,
                length: code.length,
                format: format,
                resultType: typeof result
            });
            // Maak code schoon (verwijder niet-numerieke tekens behalve X voor ISBN-10)
            const cleanCode = code.replace(/[^0-9X]/gi, '');
            debugLog('🧹 Cleaned code', {
                cleaned: cleanCode,
                length: cleanCode.length
            });
            // Valideer ISBN: 10 cijfers (mogelijk met X) of 13 cijfers
            const isISBN10 = /^\d{9}[\dX]$/i.test(cleanCode);
            const isISBN13 = /^\d{13}$/.test(cleanCode);
            debugLog('📊 Validation', {
                isISBN10: isISBN10,
                isISBN13: isISBN13,
                test10: /^\d{9}[\dX]$/i.test(cleanCode),
                test13: /^\d{13}$/.test(cleanCode)
            });
            if (isISBN10 || isISBN13) {
                debugLog(`✅ VALID ISBN DETECTED! ${cleanCode} (${isISBN10 ? 'ISBN-10' : 'ISBN-13'})`);
                // Set flag IMMEDIATELY and synchronously
                isProcessingRef.current = true;
                // Stop scanner FIRST - alleen bij geldige ISBN
                const scanner = window.Quagga2 || window.Quagga;
                try {
                    scanner.stop();
                    debugLog('🛑 Scanner stopped after valid ISBN detection');
                } catch (e) {
                    debugLog('⚠️ Error stopping scanner', {
                        error: String(e)
                    });
                }
                // Vibratie feedback op mobiel
                if (navigator.vibrate) {
                    navigator.vibrate(200);
                }
                // Start lookup
                lookupIsbn(cleanCode);
            } else {
                debugLog('⚠️ Barcode detected but not a valid ISBN', {
                    original: code,
                    cleaned: cleanCode,
                    length: cleanCode.length,
                    isISBN10: isISBN10,
                    isISBN13: isISBN13
                });
            // Continue scanning - geen stop, geen flag reset nodig
            }
        } catch (e) {
            debugLog('❌ Error processing barcode result', {
                error: String(e)
            });
            console.error('❌ Error processing barcode result:', e, result);
            // Reset processing flag bij error
            isProcessingRef.current = false;
        }
    };
    /**
   * Start de barcode scanning met QuaggaJS. Deze functie wordt aangeroepen wanneer de
   * gebruiker op de "Start scan" button klikt. Het vraagt camera toegang aan
   * en begint met decoderen. Als de browser toestemming weigert (bijv. omdat
   * de site niet over HTTPS wordt geserveerd), wordt een foutmelding getoond.
   */ const startCamera = async ()=>{
        // Reset processing flag bij het starten van de camera - EERST
        isProcessingRef.current = false;
        if (isScanning) return; // Al aan het scannen
        // Detecteer platform VOORDAT we scanner kiezen
        const userAgent = navigator.userAgent;
        const isAndroid = /Android/i.test(userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || window.innerWidth <= 768;
        debugLog('Platform detectie', {
            isAndroid,
            isIOS,
            isMobile,
            userAgent: userAgent.substring(0, 100) // Eerste 100 chars voor privacy
        });
        // Strategie: Android gebruikt QuaggaJS (bewezen werkend), andere platforms Quagga2
        let scanner;
        let scannerName;
        let isQuagga2;
        // Android: gebruik QuaggaJS (bewezen werkend in SeniorEase)
        // iOS/Desktop: gebruik Quagga2 (onderhouden versie)
        if (isAndroid) {
            // Android: QuaggaJS (bewezen werkend)
            if (window.Quagga) {
                scanner = window.Quagga;
                scannerName = 'QuaggaJS';
                isQuagga2 = false;
                debugLog('📱 Android: Gebruik QuaggaJS (bewezen werkend in SeniorEase)');
            } else {
                setError('QuaggaJS niet beschikbaar. Wacht even en probeer opnieuw.');
                return;
            }
        } else {
            // iOS/Desktop: Quagga2 (onderhouden versie)
            const hasQuagga2 = window.Quagga2 || window.Quagga && window.Quagga.ImageDebug;
            if (hasQuagga2) {
                scanner = window.Quagga2 || window.Quagga;
                scannerName = 'Quagga2';
                isQuagga2 = true;
                debugLog('📦 Gebruik Quagga2 (onderhouden versie met debug overlay)', {
                    platform: isIOS ? 'iOS' : 'Desktop',
                    hasQuagga2: !!window.Quagga2,
                    hasImageDebug: !!(window.Quagga && window.Quagga.ImageDebug)
                });
            } else if (window.Quagga) {
                scanner = window.Quagga;
                scannerName = 'QuaggaJS';
                isQuagga2 = false;
                debugLog('📦 Gebruik QuaggaJS (backup)');
            } else {
                setError('Geen scanner beschikbaar. Wacht even en probeer opnieuw.');
                return;
            }
        }
        setUsingQuagga2(isQuagga2);
        setError('');
        setScannedBook(null);
        setIsScanning(true); // Zet state eerst zodat container div wordt gerenderd
        // Wacht tot React de DOM heeft geüpdatet en de container div bestaat
        await new Promise((resolve)=>setTimeout(resolve, 100));
        // Check nu of container div bestaat
        const container = document.getElementById('quagga-container');
        if (!container) {
            setError('Scanner container niet gevonden. Probeer het opnieuw.');
            setIsScanning(false);
            return;
        }
        try {
            debugLog(`📷 Starting ${scannerName} barcode scanner...`);
            debugLog('Container check', {
                exists: !!container
            });
            debugLog('Scanner check', {
                quagga2: !!window.Quagga2,
                quagga: !!window.Quagga,
                using: scannerName,
                isMobile: isMobile
            });
            // Configuratie - EXACT zoals SeniorEase (bewezen werkend op Android)
            // SeniorEase gebruikt deze exacte configuratie en werkt razendsnel
            const config = {
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: container,
                    constraints: {
                        video: {
                            facingMode: {
                                exact: "environment"
                            } // Force achtercamera (zoals SeniorEase)
                        },
                        width: 640,
                        height: 480
                    }
                },
                decoder: {
                    readers: [
                        "ean_reader",
                        "code_128_reader",
                        "code_39_reader"
                    ] // Exact zoals SeniorEase
                },
                locate: true,
                locator: {
                    patchSize: "medium",
                    halfSample: true // Exact zoals SeniorEase
                }
            };
            // Alleen Quagga2 krijgt extra instellingen (niet voor Android/QuaggaJS)
            if (isQuagga2) {
                config.numOfWorkers = 0; // 0 nodig voor debug overlay
                config.frequency = isIOS ? 8 : 5;
                config.decoder = {
                    ...config.decoder,
                    debug: {
                        drawBoundingBox: true,
                        showFrequency: false,
                        drawScanline: true,
                        showPattern: false
                    }
                };
            }
            debugLog('Configuratie (EXACT SeniorEase)', {
                platform: isAndroid ? 'Android' : isIOS ? 'iOS' : 'Desktop',
                scanner: scannerName,
                config: JSON.stringify({
                    constraints: config.inputStream.constraints,
                    decoder: config.decoder,
                    locator: config.locator
                }, null, 2)
            });
            // Log config veilig - verwijder DOM elementen
            const safeConfig = {
                inputStream: {
                    name: config.inputStream.name,
                    type: config.inputStream.type,
                    constraints: config.inputStream.constraints
                },
                decoder: config.decoder,
                locate: config.locate,
                locator: config.locator
            };
            debugLog('Scanner configuratie (EXACT SeniorEase)', {
                isMobile,
                scanner: scannerName,
                config: JSON.stringify(safeConfig, null, 2)
            });
            // Initialiseer scanner (Quagga2 of QuaggaJS) - scanner is al gedeclareerd boven
            let initSuccess = false;
            try {
                await new Promise((resolve, reject)=>{
                    scanner.init(config, (err)=>{
                        if (err) {
                            debugLog(`❌ ${scannerName} init error (eerste poging)`, {
                                error: String(err),
                                errorName: err?.name
                            });
                            // Fallback voor mobiel: probeer met vereenvoudigde constraints
                            if (isMobile) {
                                debugLog('🔄 Probeer fallback configuratie voor mobiel...');
                                const fallbackConfig = {
                                    ...config,
                                    inputStream: {
                                        ...config.inputStream,
                                        constraints: {
                                            video: {
                                                facingMode: "environment" // Geen exact, laat browser kiezen
                                            }
                                        }
                                    },
                                    locator: {
                                        ...config.locator,
                                        patchSize: "medium",
                                        halfSample: true
                                    }
                                };
                                scanner.init(fallbackConfig, (fallbackErr)=>{
                                    if (fallbackErr) {
                                        debugLog(`❌ ${scannerName} fallback init ook gefaald`, {
                                            error: String(fallbackErr)
                                        });
                                        reject(fallbackErr);
                                        return;
                                    }
                                    debugLog(`✅ ${scannerName} initialized successfully (fallback)`);
                                    initSuccess = true;
                                    resolve();
                                });
                            } else {
                                reject(err);
                            }
                            return;
                        }
                        debugLog(`✅ ${scannerName} initialized successfully`);
                        initSuccess = true;
                        // Setup callbacks VOOR start() (zoals SeniorEase)
                        // Listen for frame processing (debugging) - simpel zoals SeniorEase
                        scanner.onProcessed((result)=>{
                            if (result) {
                                // Quagga2: teken debug overlay
                                if (isQuagga2 && scanner.canvas?.ctx?.overlay && scanner.canvas?.dom?.overlay) {
                                    try {
                                        const ctx = scanner.canvas.ctx.overlay;
                                        const canvas = scanner.canvas.dom.overlay;
                                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                                        // Teken boxes (blauw)
                                        if (result.boxes) {
                                            result.boxes.filter((box)=>box !== result.box).forEach((box)=>{
                                                if (scanner.ImageDebug?.drawPath) {
                                                    scanner.ImageDebug.drawPath(box, {
                                                        x: 0,
                                                        y: 1
                                                    }, ctx, {
                                                        color: '#00F',
                                                        lineWidth: 2
                                                    });
                                                }
                                            });
                                        }
                                        // Teken hoofdbox (groen)
                                        if (result.box && scanner.ImageDebug?.drawPath) {
                                            scanner.ImageDebug.drawPath(result.box, {
                                                x: 0,
                                                y: 1
                                            }, ctx, {
                                                color: '#0F0',
                                                lineWidth: 3
                                            });
                                        }
                                        // Teken scanline (rood/oranje)
                                        if (result.line && scanner.ImageDebug?.drawPath) {
                                            const lineColor = result.codeResult?.code ? 'red' : 'orange';
                                            scanner.ImageDebug.drawPath(result.line, {
                                                x: 'x',
                                                y: 'y'
                                            }, ctx, {
                                                color: lineColor,
                                                lineWidth: result.codeResult?.code ? 4 : 3
                                            });
                                        }
                                    } catch (e) {
                                    // Ignore errors
                                    }
                                }
                                // Simpel logging zoals SeniorEase
                                if (result.codeResult) {
                                    debugLog('📦 Code gevonden in frame', {
                                        code: result.codeResult.code,
                                        format: result.codeResult.format
                                    });
                                }
                            }
                        });
                        // Listen for successful barcode detection - EXACT zoals SeniorEase
                        scanner.onDetected((result)=>{
                            debugLog('🎯 Barcode gevonden!', {
                                code: result?.codeResult?.code,
                                format: result?.codeResult?.format
                            });
                            // Check processing flag FIRST
                            if (isProcessingRef.current) {
                                debugLog('⏸️ Scan already processing, ignoring callback');
                                return;
                            }
                            if (result && result.codeResult) {
                                const code = result.codeResult.code;
                                debugLog('✅ Processing detected code', {
                                    code
                                });
                                // Direct stoppen zoals SeniorEase
                                try {
                                    scanner.stop();
                                    debugLog('🛑 Scanner stopped after detection');
                                } catch (e) {
                                    debugLog('⚠️ Error stopping scanner', {
                                        error: String(e)
                                    });
                                }
                                // Process result
                                handleBarcodeResult(result.codeResult);
                            } else {
                                debugLog('⚠️ onDetected called but no codeResult in result');
                            }
                        });
                        // Start scanning NA callbacks (zoals SeniorEase)
                        scanner.start();
                        debugLog(`✅ ${scannerName} scanner started`);
                        // Platform-specifieke video attributen instellen (iOS vereist playsinline en muted)
                        setTimeout(()=>{
                            const video = container.querySelector('video');
                            if (video) {
                                if (isIOS) {
                                    video.setAttribute('playsinline', 'true');
                                    video.setAttribute('webkit-playsinline', 'true');
                                    video.setAttribute('muted', 'true');
                                    video.muted = true;
                                    debugLog('🍎 iOS video attributen ingesteld', {
                                        playsinline: video.hasAttribute('playsinline'),
                                        muted: video.muted
                                    });
                                } else if (isAndroid) {
                                    video.setAttribute('playsinline', 'true');
                                    video.setAttribute('webkit-playsinline', 'true');
                                    debugLog('📱 Android video attributen ingesteld');
                                }
                            }
                        }, 200);
                        resolve();
                    });
                });
            } catch (initError) {
                debugLog(`❌ ${scannerName} init gefaald`, {
                    error: String(initError)
                });
                throw initError;
            }
        } catch (e) {
            console.error('Camera error:', e);
            setIsScanning(false);
            // Veilige error extractie - alleen primitieve waarden
            let errorName = '';
            let errorMessage = '';
            let errorStack = '';
            if (e instanceof Error) {
                errorName = e.name || '';
                errorMessage = e.message || '';
                errorStack = e.stack || '';
            } else {
                try {
                    errorMessage = String(e);
                } catch  {
                    errorMessage = 'Unknown error';
                }
            }
            // Log alleen veilige primitieve waarden
            debugLog('❌ Camera error details', {
                error: errorMessage,
                name: errorName,
                hasStack: !!errorStack
            });
            if (e instanceof Error) {
                if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
                    setError('Camera toegang geweigerd. Geef toestemming in je browser instellingen.');
                } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
                    setError('Geen camera gevonden op dit apparaat.');
                } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
                    setError('Camera wordt al gebruikt door een andere app.');
                } else if (errorMessage?.includes('getUserMedia')) {
                    setError('Camera toegang mislukt. Controleer je browser instellingen en zorg dat je HTTPS gebruikt.');
                } else if (errorMessage?.includes('circular') || errorMessage?.includes('JSON')) {
                    setError('Camera initialisatie fout. Probeer de pagina te verversen.');
                } else {
                    setError(`Camera fout: ${errorMessage || 'Onbekende fout'}`);
                }
            } else {
                setError(`Camera initialisatie mislukt: ${errorMessage}`);
            }
        }
    };
    const stopCamera = ()=>{
        debugLog('🛑 Stopping camera...');
        // Stop scanner - dit stopt ook automatisch de video stream
        const scanner = window.Quagga2 || window.Quagga;
        if (scanner) {
            try {
                scanner.offDetected?.(); // Remove detection callback (Quagga2 heeft dit)
                scanner.stop();
                debugLog('✅ Scanner stopped');
            } catch (err) {
                debugLog('⚠️ Error stopping scanner', {
                    error: String(err)
                });
                console.log('Error stopping scanner:', err);
            }
        }
        setIsScanning(false);
    };
    // Try OpenLibrary ISBN API - verbeterd met timeout en betere error handling
    const tryOpenLibrary = async (isbn)=>{
        try {
            debugLog('🔍 Trying OpenLibrary API', {
                isbn
            });
            const url = `https://openlibrary.org/isbn/${isbn}.json`;
            // Timeout na 5 seconden
            const controller = new AbortController();
            const timeout = setTimeout(()=>controller.abort(), 5000);
            try {
                const response = await fetch(url, {
                    signal: controller.signal
                });
                clearTimeout(timeout);
                if (!response.ok) {
                    debugLog('⚠️ OpenLibrary response not OK', {
                        status: response.status
                    });
                    return null;
                }
                const edition = await response.json();
                if (!edition.title) {
                    debugLog('⚠️ OpenLibrary: no title found');
                    return null;
                }
                // Build basic book object
                const data = {
                    title: edition.title,
                    publishYear: edition.publish_date || null,
                    pages: edition.number_of_pages || null,
                    isbn: isbn
                };
                // Verbeterde auteur-ophaling: haal voor elke author key de naam op
                if (Array.isArray(edition.authors) && edition.authors.length > 0) {
                    try {
                        const authorNames = await Promise.all(edition.authors.map(async (a)=>{
                            if (a?.key) {
                                try {
                                    const authorRes = await fetch(`https://openlibrary.org${a.key}.json`, {
                                        signal: controller.signal
                                    });
                                    if (authorRes.ok) {
                                        const authorData = await authorRes.json();
                                        return authorData?.name;
                                    }
                                } catch (e) {
                                    debugLog('⚠️ Error fetching author', {
                                        error: String(e)
                                    });
                                }
                            }
                            return '';
                        }));
                        const names = authorNames.filter((n)=>n && n.trim().length > 0);
                        if (names.length > 0) {
                            data.author = names.join(', ');
                        }
                    } catch (e) {
                        debugLog('⚠️ Author lookup failed', {
                            error: String(e)
                        });
                    }
                }
                // Attach cover image if available
                if (Array.isArray(edition.covers) && edition.covers.length > 0) {
                    data.cover = `https://covers.openlibrary.org/b/id/${edition.covers[0]}-M.jpg`;
                } else {
                    data.cover = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
                }
                // Als de edition een work referentie heeft, haal extra metadata op
                if (Array.isArray(edition.works) && edition.works.length > 0) {
                    try {
                        const workKey = edition.works[0].key;
                        const workRes = await fetch(`https://openlibrary.org${workKey}.json`, {
                            signal: controller.signal
                        });
                        if (workRes.ok) {
                            const work = await workRes.json();
                            data.title = data.title || work.title;
                            if (work.description) {
                                data.description = typeof work.description === 'string' ? work.description : work.description?.value;
                            }
                            if (work.subjects) {
                                data.subjects = work.subjects.slice(0, 5);
                            }
                        }
                    } catch (e) {
                        debugLog('⚠️ Could not fetch work details', {
                            error: String(e)
                        });
                    }
                }
                if (!data.author) {
                    data.author = 'Onbekende auteur';
                }
                debugLog('✅ OpenLibrary success', {
                    title: data.title,
                    author: data.author
                });
                return data;
            } catch (fetchError) {
                clearTimeout(timeout);
                throw fetchError;
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                debugLog('⏱️ OpenLibrary timeout');
            } else {
                debugLog('❌ OpenLibrary failed', {
                    error: String(err)
                });
            }
        }
        return null;
    };
    // Try Google Books API - verbeterd met timeout en betere data parsing
    const tryGoogleBooks = async (isbn)=>{
        try {
            debugLog('🔍 Trying Google Books API', {
                isbn
            });
            const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
            // Timeout na 5 seconden
            const controller = new AbortController();
            const timeout = setTimeout(()=>controller.abort(), 5000);
            try {
                const response = await fetch(url, {
                    signal: controller.signal
                });
                clearTimeout(timeout);
                if (!response.ok) {
                    debugLog('⚠️ Google Books response not OK', {
                        status: response.status
                    });
                    return null;
                }
                const data = await response.json();
                if (!data.items || data.items.length === 0) {
                    debugLog('⚠️ Google Books: no items found');
                    return null;
                }
                const book = data.items[0].volumeInfo;
                // Parse authors - kan array zijn of undefined
                let author = 'Onbekende auteur';
                if (Array.isArray(book.authors) && book.authors.length > 0) {
                    author = book.authors.join(', ');
                }
                // Parse cover image - probeer beste kwaliteit
                let cover = null;
                if (book.imageLinks) {
                    cover = book.imageLinks.large || book.imageLinks.medium || book.imageLinks.thumbnail || book.imageLinks.smallThumbnail || null;
                    // Upgrade naar https als http wordt gebruikt
                    if (cover && cover.startsWith('http:')) {
                        cover = cover.replace('http:', 'https:');
                    }
                }
                const result = {
                    title: book.title || 'Onbekende titel',
                    author: author,
                    cover: cover,
                    isbn: isbn,
                    publishYear: book.publishedDate?.split('-')[0] || null,
                    pages: book.pageCount || null,
                    description: book.description || null,
                    subjects: book.categories || []
                };
                debugLog('✅ Google Books success', {
                    title: result.title,
                    author: result.author
                });
                return result;
            } catch (fetchError) {
                clearTimeout(timeout);
                throw fetchError;
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                debugLog('⏱️ Google Books timeout');
            } else {
                debugLog('❌ Google Books failed', {
                    error: String(err)
                });
            }
        }
        return null;
    };
    // Try UPCitemdb API - universal product database, gebruikt in Biblitoheek Android app
    const tryUPCitemdb = async (isbn)=>{
        try {
            debugLog('🔍 Trying UPCitemdb API', {
                isbn
            });
            const url = `https://api.upcitemdb.com/prod/trial/lookup?upc=${isbn}`;
            // Timeout na 5 seconden
            const controller = new AbortController();
            const timeout = setTimeout(()=>controller.abort(), 5000);
            try {
                const response = await fetch(url, {
                    signal: controller.signal
                });
                clearTimeout(timeout);
                if (!response.ok) {
                    debugLog('⚠️ UPCitemdb response not OK', {
                        status: response.status
                    });
                    return null;
                }
                const data = await response.json();
                if (!data.items || data.items.length === 0) {
                    debugLog('⚠️ UPCitemdb: no items found');
                    return null;
                }
                const item = data.items[0];
                // Parse title - UPCitemdb returned vaak "Title - Author" format
                let title = item.title || 'Onbekende titel';
                let author = item.brand || 'Onbekende auteur';
                // Probeer te splitsen op common patterns
                if (title.includes(' - ')) {
                    const parts = title.split(' - ', 2);
                    if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
                        author = parts[0].trim();
                        title = parts[1].trim();
                    }
                } else if (title.includes(' / ')) {
                    const parts = title.split(' / ', 2);
                    if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
                        author = parts[0].trim();
                        title = parts[1].trim();
                    }
                } else if (title.toLowerCase().includes(' by ')) {
                    const parts = title.split(/\s+by\s+/i, 2);
                    if (parts.length === 2 && parts[0].trim() && parts[1].trim()) {
                        title = parts[0].trim();
                        author = parts[1].trim();
                    }
                }
                const result = {
                    title: title,
                    author: author,
                    cover: item.images?.[0] || `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`,
                    isbn: isbn,
                    publishYear: null,
                    pages: null,
                    description: item.description || null,
                    subjects: []
                };
                debugLog('✅ UPCitemdb success', {
                    title: result.title,
                    author: result.author
                });
                return result;
            } catch (fetchError) {
                clearTimeout(timeout);
                throw fetchError;
            }
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                debugLog('⏱️ UPCitemdb timeout');
            } else {
                debugLog('❌ UPCitemdb failed', {
                    error: String(err)
                });
            }
        }
        return null;
    };
    // Try OpenLibrary Works API (alternative endpoint via works)
    const tryOpenLibraryWorks = async (isbn)=>{
        try {
            const url = `https://openlibrary.org/isbn/${isbn}.json`;
            console.log('Trying OpenLibrary Works:', url);
            const response = await fetch(url);
            if (!response.ok) return null;
            const workData = await response.json();
            // Als er works zijn, haal work details op
            if (workData.works && workData.works.length > 0) {
                const workKey = workData.works[0].key;
                const workUrl = `https://openlibrary.org${workKey}.json`;
                const workResponse = await fetch(workUrl);
                if (workResponse.ok) {
                    const work = await workResponse.json();
                    // Haal auteurs op
                    let authors = [];
                    if (work.authors && work.authors.length > 0) {
                        const authorPromises = work.authors.slice(0, 3).map(async (author)=>{
                            if (author.author?.key) {
                                try {
                                    const authorRes = await fetch(`https://openlibrary.org${author.author.key}.json`);
                                    if (authorRes.ok) {
                                        const authorData = await authorRes.json();
                                        return authorData.name || '';
                                    }
                                } catch (e) {
                                    console.error('Error fetching author:', e);
                                }
                            }
                            return '';
                        });
                        authors = (await Promise.all(authorPromises)).filter((a)=>a);
                    }
                    // Haal beschrijving en onderwerpen op
                    let description = null;
                    let subjects = [];
                    if (work.description) {
                        if (typeof work.description === 'string') {
                            description = work.description;
                        } else if (work.description.value) {
                            description = work.description.value;
                        }
                    }
                    if (work.subjects) {
                        subjects = work.subjects.slice(0, 5);
                    }
                    return {
                        title: work.title || workData.title || 'Onbekende titel',
                        author: authors.join(', ') || 'Onbekende auteur',
                        cover: `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`,
                        isbn: isbn,
                        publishYear: work.first_publish_date || workData.publish_date || null,
                        pages: workData.number_of_pages || null,
                        description: description,
                        subjects: subjects
                    };
                }
            }
        } catch (err) {
            console.log('OpenLibrary Works failed:', err);
        }
        return null;
    };
    const lookupIsbn = async (isbn)=>{
        setIsLoading(true);
        setError('');
        setScannedBook(null);
        // isProcessingRef is al gezet in handleBarcodeResult
        try {
            const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
            debugLog('📚 Looking up ISBN', {
                isbn: cleanIsbn
            });
            // Validate ISBN length (ISBN-10: 10 digits, ISBN-13: 13 digits)
            if (cleanIsbn.length < 10 || cleanIsbn.length > 13) {
                const errorMsg = 'Ongeldig ISBN nummer. ISBN moet 10 of 13 cijfers bevatten.';
                debugLog('❌ Invalid ISBN', {
                    length: cleanIsbn.length
                });
                setError(errorMsg);
                setIsLoading(false);
                return;
            }
            // Try multiple APIs in sequence - verbeterde fallback strategie uit Biblitoheek
            debugLog('🔄 Starting API fallback chain...');
            let book = null;
            // 1. Probeer OpenLibrary (snelste en meest complete)
            book = await tryOpenLibrary(cleanIsbn);
            // 2. Probeer Google Books (goede fallback)
            if (!book) {
                debugLog('📖 OpenLibrary failed, trying Google Books...');
                book = await tryGoogleBooks(cleanIsbn);
            }
            // 3. Probeer UPCitemdb (universal product database - gebruikt in Biblitoheek Android)
            if (!book) {
                debugLog('📦 Google Books failed, trying UPCitemdb...');
                book = await tryUPCitemdb(cleanIsbn);
            }
            // 4. Probeer OpenLibrary Works (alternatieve endpoint)
            if (!book) {
                debugLog('🔍 UPCitemdb failed, trying OpenLibrary Works...');
                book = await tryOpenLibraryWorks(cleanIsbn);
            }
            if (book) {
                debugLog('✅ Book found!', {
                    title: book.title,
                    author: book.author,
                    hasCover: !!book.cover
                });
                setScannedBook(book);
            } else {
                debugLog('❌ Book not found in any API');
                setError(`Boek met ISBN ${cleanIsbn} niet gevonden in online databases. Controleer het ISBN nummer en probeer het opnieuw.`);
            }
        } catch (err) {
            debugLog('❌ Error in lookupIsbn', {
                error: String(err)
            });
            console.error('Error in lookupIsbn:', err);
            if (err instanceof Error) {
                // Check for network errors
                if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
                    setError('Geen internetverbinding. Controleer je verbinding en probeer het opnieuw.');
                } else {
                    setError(`Er ging iets mis: ${err.message}`);
                }
            } else {
                setError('Er ging iets mis bij het ophalen van boekgegevens. Probeer het later opnieuw.');
            }
        } finally{
            setIsLoading(false);
            // Reset processing flag na het voltooien van de lookup
            isProcessingRef.current = false;
        }
    };
    const handleManualSubmit = (e)=>{
        e.preventDefault();
        if (manualIsbn.trim()) lookupIsbn(manualIsbn);
    };
    const saveBook = (status)=>{
        const savedBooks = JSON.parse(localStorage.getItem('shelfie-books') || '[]');
        savedBooks.push({
            ...scannedBook,
            status,
            id: Date.now()
        });
        localStorage.setItem('shelfie-books', JSON.stringify(savedBooks));
        setScannedBook(null);
        setManualIsbn('');
        window.location.href = '/library';
    };
    // Handle Quagga2 script load (primair)
    const handleQuagga2Load = ()=>{
        debugLog('✅ Quagga2 script loaded');
        setQuagga2Loaded(true);
        // Quagga2 exposeert zichzelf als window.Quagga2 of window.Quagga
        if (window.Quagga2) {
            debugLog('✅ Quagga2 available as window.Quagga2');
        } else if (window.Quagga) {
            debugLog('✅ Quagga2 available as window.Quagga');
        }
    };
    // Handle QuaggaJS script load (fallback)
    const handleQuaggaLoad = ()=>{
        debugLog('✅ QuaggaJS script loaded');
        setQuaggaLoaded(true);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-surface-dark",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$script$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                src: "https://unpkg.com/@ericblade/quagga2/dist/quagga.min.js",
                onLoad: handleQuagga2Load,
                onError: ()=>{
                    debugLog('⚠️ Quagga2 niet geladen, gebruik QuaggaJS');
                },
                strategy: "lazyOnload",
                id: "quagga2-script"
            }, void 0, false, {
                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                lineNumber: 1070,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$script$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                src: "https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js",
                onLoad: handleQuaggaLoad,
                onError: ()=>{
                    debugLog('❌ Failed to load QuaggaJS');
                    if (!quagga2Loaded) {
                        setError('Kon scanner niet laden. Controleer je internetverbinding.');
                    }
                },
                strategy: "lazyOnload",
                id: "quagga-script"
            }, void 0, false, {
                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                lineNumber: 1080,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 overflow-hidden pointer-events-none",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]"
                    }, void 0, false, {
                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                        lineNumber: 1093,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[150px]"
                    }, void 0, false, {
                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                        lineNumber: 1094,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                lineNumber: 1092,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "sticky top-0 z-20 bg-surface-dark/80 backdrop-blur-lg border-b border-white/10",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "container mx-auto px-4 py-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/library",
                                        className: "flex items-center gap-2 text-neutral-400 hover:text-white",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-5 h-5",
                                                fill: "none",
                                                stroke: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    strokeWidth: 2,
                                                    d: "M15 19l-7-7 7-7"
                                                }, void 0, false, {
                                                    fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                    lineNumber: 1100,
                                                    columnNumber: 186
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1100,
                                                columnNumber: 107
                                            }, this),
                                            "Back"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                        lineNumber: 1100,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "font-display font-bold text-lg text-white",
                                        children: "Add Book"
                                    }, void 0, false, {
                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                        lineNumber: 1101,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowDebug(!showDebug),
                                        className: "px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20",
                                        children: showDebug ? '🔴 Debug ON' : '⚪ Debug'
                                    }, void 0, false, {
                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                        lineNumber: 1102,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                lineNumber: 1099,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                            lineNumber: 1098,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                        lineNumber: 1097,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "container mx-auto px-4 py-8",
                        children: [
                            scannedBook ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "animate-scale-in",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "glass-card p-6 mb-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-6 mb-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-shrink-0",
                                                        children: scannedBook.cover ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                            src: scannedBook.cover,
                                                            alt: scannedBook.title,
                                                            className: "w-28 h-40 rounded-xl object-cover shadow-lg"
                                                        }, void 0, false, {
                                                            fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                            lineNumber: 1117,
                                                            columnNumber: 42
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-28 h-40 rounded-xl bg-surface-light flex items-center justify-center",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-4xl",
                                                                children: "📚"
                                                            }, void 0, false, {
                                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                                lineNumber: 1117,
                                                                columnNumber: 244
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                            lineNumber: 1117,
                                                            columnNumber: 156
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                        lineNumber: 1116,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                                className: "text-white font-bold text-xl mb-1",
                                                                children: scannedBook.title
                                                            }, void 0, false, {
                                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                                lineNumber: 1120,
                                                                columnNumber: 21
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-neutral-400 mb-2",
                                                                children: scannedBook.author
                                                            }, void 0, false, {
                                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                                lineNumber: 1121,
                                                                columnNumber: 21
                                                            }, this),
                                                            scannedBook.publishYear && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-neutral-500 text-sm mb-1",
                                                                children: [
                                                                    "📅 ",
                                                                    scannedBook.publishYear
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                                lineNumber: 1122,
                                                                columnNumber: 49
                                                            }, this),
                                                            scannedBook.pages && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-neutral-500 text-sm mb-1",
                                                                children: [
                                                                    "📄 ",
                                                                    scannedBook.pages,
                                                                    " paginas"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                                lineNumber: 1123,
                                                                columnNumber: 43
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-neutral-600 text-xs mt-2",
                                                                children: [
                                                                    "ISBN: ",
                                                                    scannedBook.isbn
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                                lineNumber: 1124,
                                                                columnNumber: 21
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                        lineNumber: 1119,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1115,
                                                columnNumber: 17
                                            }, this),
                                            scannedBook.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-white font-semibold text-sm mb-2",
                                                        children: "Beschrijving"
                                                    }, void 0, false, {
                                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                        lineNumber: 1131,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-neutral-300 text-sm leading-relaxed line-clamp-4",
                                                        children: scannedBook.description.length > 300 ? scannedBook.description.substring(0, 300) + '...' : scannedBook.description
                                                    }, void 0, false, {
                                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                        lineNumber: 1132,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1130,
                                                columnNumber: 19
                                            }, this),
                                            scannedBook.subjects && scannedBook.subjects.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-white font-semibold text-sm mb-2",
                                                        children: "Onderwerpen"
                                                    }, void 0, false, {
                                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                        lineNumber: 1143,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-wrap gap-2",
                                                        children: scannedBook.subjects.map((subject, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "px-3 py-1 rounded-full bg-primary/20 text-primary-light text-xs",
                                                                children: subject
                                                            }, index, false, {
                                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                                lineNumber: 1146,
                                                                columnNumber: 25
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                        lineNumber: 1144,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1142,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                        lineNumber: 1114,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-neutral-400 text-center mb-4",
                                                children: "Add to shelf as:"
                                            }, void 0, false, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1155,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>saveBook('reading'),
                                                className: "w-full glass-card-hover p-4 flex items-center gap-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-2xl",
                                                            children: "📖"
                                                        }, void 0, false, {
                                                            fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                            lineNumber: 1156,
                                                            columnNumber: 210
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                        lineNumber: 1156,
                                                        columnNumber: 125
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-left",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-white font-semibold",
                                                                children: "Currently Reading"
                                                            }, void 0, false, {
                                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                                lineNumber: 1156,
                                                                columnNumber: 279
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-neutral-400 text-sm",
                                                                children: "I am reading this now"
                                                            }, void 0, false, {
                                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                                lineNumber: 1156,
                                                                columnNumber: 340
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                        lineNumber: 1156,
                                                        columnNumber: 252
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1156,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>saveBook('tbr'),
                                                className: "w-full glass-card-hover p-4 flex items-center gap-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-2xl",
                                                            children: "📚"
                                                        }, void 0, false, {
                                                            fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                            lineNumber: 1157,
                                                            columnNumber: 208
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                        lineNumber: 1157,
                                                        columnNumber: 121
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-left",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-white font-semibold",
                                                                children: "To Be Read (TBR)"
                                                            }, void 0, false, {
                                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                                lineNumber: 1157,
                                                                columnNumber: 277
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-neutral-400 text-sm",
                                                                children: "On my reading list"
                                                            }, void 0, false, {
                                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                                lineNumber: 1157,
                                                                columnNumber: 337
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                        lineNumber: 1157,
                                                        columnNumber: 250
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1157,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>saveBook('finished'),
                                                className: "w-full glass-card-hover p-4 flex items-center gap-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-2xl",
                                                            children: "✅"
                                                        }, void 0, false, {
                                                            fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                            lineNumber: 1158,
                                                            columnNumber: 210
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                        lineNumber: 1158,
                                                        columnNumber: 126
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-left",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-white font-semibold",
                                                                children: "Finished"
                                                            }, void 0, false, {
                                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                                lineNumber: 1158,
                                                                columnNumber: 278
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-neutral-400 text-sm",
                                                                children: "Already read this one"
                                                            }, void 0, false, {
                                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                                lineNumber: 1158,
                                                                columnNumber: 330
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                        lineNumber: 1158,
                                                        columnNumber: 251
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1158,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                        lineNumber: 1154,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setScannedBook(null),
                                        className: "w-full mt-6 text-neutral-400 hover:text-white py-3",
                                        children: "Scan another book"
                                    }, void 0, false, {
                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                        lineNumber: 1160,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                lineNumber: 1113,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "glass-card p-6 mb-6",
                                        children: isScanning ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7a8fd52b118a0f7e" + " " + "relative pb-24",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    id: "quagga-container",
                                                    style: {
                                                        transform: 'scaleX(1)'
                                                    },
                                                    className: "jsx-7a8fd52b118a0f7e" + " " + "w-full h-64 md:h-96 rounded-xl overflow-hidden bg-black relative"
                                                }, void 0, false, {
                                                    fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                    lineNumber: 1168,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                    id: "7a8fd52b118a0f7e",
                                                    children: "#quagga-container{position:relative!important}#quagga-container video{z-index:1!important;object-fit:cover!important;width:100%!important;height:100%!important;position:relative!important}#quagga-container canvas.drawingBuffer{z-index:3!important;pointer-events:none!important;width:100%!important;height:100%!important;display:block!important;position:absolute!important;top:0!important;left:0!important}#quagga-container canvas{z-index:3!important;position:absolute!important;top:0!important;left:0!important}"
                                                }, void 0, false, void 0, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-7a8fd52b118a0f7e" + " " + "absolute inset-0 flex items-center justify-center pointer-events-none z-[2]",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-7a8fd52b118a0f7e" + " " + "w-64 h-40 md:w-80 md:h-48 border-2 border-primary rounded-lg relative shadow-lg",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-7a8fd52b118a0f7e" + " " + "absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"
                                                            }, void 0, false, {
                                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                                lineNumber: 1207,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-7a8fd52b118a0f7e" + " " + "absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"
                                                            }, void 0, false, {
                                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                                lineNumber: 1208,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-7a8fd52b118a0f7e" + " " + "absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"
                                                            }, void 0, false, {
                                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                                lineNumber: 1209,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-7a8fd52b118a0f7e" + " " + "absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"
                                                            }, void 0, false, {
                                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                                lineNumber: 1210,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    top: '50%',
                                                                    boxShadow: '0 0 10px rgba(168, 85, 247, 0.8)'
                                                                },
                                                                className: "jsx-7a8fd52b118a0f7e" + " " + "absolute left-2 right-2 h-1 bg-primary animate-pulse shadow-lg"
                                                            }, void 0, false, {
                                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                                lineNumber: 1212,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                        lineNumber: 1205,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                    lineNumber: 1204,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: stopCamera,
                                                    "aria-label": "Stop camera",
                                                    className: "jsx-7a8fd52b118a0f7e" + " " + "absolute top-4 right-4 bg-black/70 hover:bg-black/90 backdrop-blur-sm p-3 rounded-full text-white transition-all z-20",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        viewBox: "0 0 24 24",
                                                        className: "jsx-7a8fd52b118a0f7e" + " " + "w-6 h-6",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                            strokeLinecap: "round",
                                                            strokeLinejoin: "round",
                                                            strokeWidth: 2,
                                                            d: "M6 18L18 6M6 6l12 12",
                                                            className: "jsx-7a8fd52b118a0f7e"
                                                        }, void 0, false, {
                                                            fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                            lineNumber: 1222,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                        lineNumber: 1221,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                    lineNumber: 1216,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-7a8fd52b118a0f7e" + " " + "absolute -bottom-16 left-0 right-0 px-4 z-20",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "jsx-7a8fd52b118a0f7e" + " " + "text-center text-white text-sm font-medium mb-1 bg-black/70 backdrop-blur-sm rounded-full py-2 px-4 inline-block",
                                                            children: "📷 Richt de camera op de barcode"
                                                        }, void 0, false, {
                                                            fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                            lineNumber: 1227,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "jsx-7a8fd52b118a0f7e" + " " + "text-center text-neutral-300 text-xs mt-2",
                                                            children: "Zorg dat de barcode goed verlicht is"
                                                        }, void 0, false, {
                                                            fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                            lineNumber: 1230,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setShowDebug(!showDebug),
                                                            className: "jsx-7a8fd52b118a0f7e" + " " + "mt-3 mx-auto block px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20",
                                                            children: showDebug ? '🔴 Debug OFF' : '⚪ Debug ON'
                                                        }, void 0, false, {
                                                            fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                            lineNumber: 1234,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                    lineNumber: 1226,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                            lineNumber: 1166,
                                            columnNumber: 19
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: startCamera,
                                            className: "w-full h-48 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-white/5 transition-all",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                        className: "w-8 h-8 text-white",
                                                        fill: "none",
                                                        stroke: "currentColor",
                                                        viewBox: "0 0 24 24",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                strokeLinecap: "round",
                                                                strokeLinejoin: "round",
                                                                strokeWidth: 2,
                                                                d: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                                            }, void 0, false, {
                                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                                lineNumber: 1244,
                                                                columnNumber: 227
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                strokeLinecap: "round",
                                                                strokeLinejoin: "round",
                                                                strokeWidth: 2,
                                                                d: "M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                                            }, void 0, false, {
                                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                                lineNumber: 1244,
                                                                columnNumber: 461
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                        lineNumber: 1244,
                                                        columnNumber: 137
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                    lineNumber: 1244,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-center",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-white font-semibold",
                                                            children: "Scan ISBN Barcode"
                                                        }, void 0, false, {
                                                            fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                            lineNumber: 1245,
                                                            columnNumber: 50
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-neutral-400 text-sm",
                                                            children: "Tap to open camera"
                                                        }, void 0, false, {
                                                            fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                            lineNumber: 1245,
                                                            columnNumber: 111
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                    lineNumber: 1245,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                            lineNumber: 1243,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                        lineNumber: 1164,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-4 my-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 h-px bg-white/10"
                                            }, void 0, false, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1249,
                                                columnNumber: 61
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-neutral-500 text-sm",
                                                children: "or enter manually"
                                            }, void 0, false, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1249,
                                                columnNumber: 104
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 h-px bg-white/10"
                                            }, void 0, false, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1249,
                                                columnNumber: 171
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                        lineNumber: 1249,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                        onSubmit: handleManualSubmit,
                                        className: "space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        htmlFor: "isbn",
                                                        className: "block text-sm text-neutral-400 mb-2",
                                                        children: "ISBN Number"
                                                    }, void 0, false, {
                                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                        lineNumber: 1251,
                                                        columnNumber: 22
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        id: "isbn",
                                                        value: manualIsbn,
                                                        onChange: (e)=>setManualIsbn(e.target.value),
                                                        placeholder: "Voer ISBN in (bijv. 9789401609236)",
                                                        className: "input-modern"
                                                    }, void 0, false, {
                                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                        lineNumber: 1251,
                                                        columnNumber: 111
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1251,
                                                columnNumber: 17
                                            }, this),
                                            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm",
                                                children: error
                                            }, void 0, false, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1252,
                                                columnNumber: 27
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "submit",
                                                disabled: isLoading || !manualIsbn.trim(),
                                                className: "w-full btn-gradient py-4 disabled:opacity-50",
                                                children: isLoading ? 'Searching...' : 'Look up book'
                                            }, void 0, false, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1253,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                        lineNumber: 1250,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-8 glass-card p-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-neutral-500 text-sm mb-3",
                                                children: "Try these popular BookTok reads:"
                                            }, void 0, false, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1256,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-2",
                                                children: [
                                                    {
                                                        isbn: '9780062060624',
                                                        title: 'Song of Achilles'
                                                    },
                                                    {
                                                        isbn: '9781649374042',
                                                        title: 'Fourth Wing'
                                                    },
                                                    {
                                                        isbn: '9780316769174',
                                                        title: 'Catcher in the Rye'
                                                    }
                                                ].map((book)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            console.log('Button clicked for:', book.title, 'ISBN:', book.isbn);
                                                            setManualIsbn(book.isbn);
                                                            lookupIsbn(book.isbn);
                                                        },
                                                        className: "px-3 py-1.5 rounded-full bg-white/5 text-neutral-400 text-sm hover:bg-primary/20 hover:text-primary-light",
                                                        children: book.title
                                                    }, book.isbn, false, {
                                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                        lineNumber: 1259,
                                                        columnNumber: 21
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1257,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                        lineNumber: 1255,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true),
                            showDebug && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "fixed bottom-16 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 z-50 max-h-[50vh] overflow-hidden flex flex-col",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between items-center p-3 border-b border-white/10",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-white font-semibold text-sm",
                                                children: "Debug Logs"
                                            }, void 0, false, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1274,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setDebugLogs([]),
                                                        className: "text-neutral-400 hover:text-white text-xs px-2 py-1",
                                                        children: "Clear"
                                                    }, void 0, false, {
                                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                        lineNumber: 1276,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setShowDebug(false),
                                                        className: "text-neutral-400 hover:text-white text-xs px-2 py-1",
                                                        children: "✕"
                                                    }, void 0, false, {
                                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                        lineNumber: 1282,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1275,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                        lineNumber: 1273,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "overflow-y-auto p-3 space-y-1",
                                        children: debugLogs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-neutral-500 text-xs",
                                            children: "Geen logs nog..."
                                        }, void 0, false, {
                                            fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                            lineNumber: 1292,
                                            columnNumber: 19
                                        }, this) : debugLogs.map((log, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs font-mono text-neutral-300 break-words",
                                                children: log
                                            }, index, false, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1295,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                        lineNumber: 1290,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                lineNumber: 1272,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                        lineNumber: 1111,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        className: "fixed bottom-0 left-0 right-0 bg-surface-dark/90 backdrop-blur-lg border-t border-white/10",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "container mx-auto px-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-around py-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/library",
                                        className: "nav-item",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-6 h-6",
                                                fill: "none",
                                                stroke: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    strokeWidth: 2,
                                                    d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                                }, void 0, false, {
                                                    fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                    lineNumber: 1306,
                                                    columnNumber: 135
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1306,
                                                columnNumber: 56
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs",
                                                children: "Library"
                                            }, void 0, false, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1306,
                                                columnNumber: 457
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                        lineNumber: 1306,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/scan",
                                        className: "nav-item active",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-6 h-6",
                                                fill: "none",
                                                stroke: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    strokeWidth: 2,
                                                    d: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m14 0h2M6 20h2m-4-8h2m14 0h2"
                                                }, void 0, false, {
                                                    fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                    lineNumber: 1307,
                                                    columnNumber: 139
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1307,
                                                columnNumber: 60
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs",
                                                children: "Scan"
                                            }, void 0, false, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1307,
                                                columnNumber: 312
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                        lineNumber: 1307,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/stats",
                                        className: "nav-item",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-6 h-6",
                                                fill: "none",
                                                stroke: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    strokeWidth: 2,
                                                    d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                                }, void 0, false, {
                                                    fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                    lineNumber: 1308,
                                                    columnNumber: 133
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1308,
                                                columnNumber: 54
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs",
                                                children: "Stats"
                                            }, void 0, false, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1308,
                                                columnNumber: 409
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                        lineNumber: 1308,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        href: "/profile",
                                        className: "nav-item",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-6 h-6",
                                                fill: "none",
                                                stroke: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    strokeWidth: 2,
                                                    d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                }, void 0, false, {
                                                    fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                    lineNumber: 1309,
                                                    columnNumber: 135
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1309,
                                                columnNumber: 56
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$shelfie$2d$ease$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs",
                                                children: "Profile"
                                            }, void 0, false, {
                                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                                lineNumber: 1309,
                                                columnNumber: 282
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                        lineNumber: 1309,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                                lineNumber: 1305,
                                columnNumber: 51
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                            lineNumber: 1305,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                        lineNumber: 1304,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/shelfie-ease/app/scan/page.tsx",
                lineNumber: 1096,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/shelfie-ease/app/scan/page.tsx",
        lineNumber: 1068,
        columnNumber: 5
    }, this);
}
_s(ScanPage, "jj08qETxQ9xT7oxrkmqNLwhlGE0=");
_c = ScanPage;
var _c;
__turbopack_context__.k.register(_c, "ScanPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=shelfie-ease_app_scan_page_tsx_ffe52208._.js.map
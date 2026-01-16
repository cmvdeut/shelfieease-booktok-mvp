'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';

// QuaggaJS / Quagga2 types
declare global {
  interface Window {
    Quagga: any;
    Quagga2?: any; // Quagga2 als alternatief
  }
}

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [manualIsbn, setManualIsbn] = useState('');
  const [scannedBook, setScannedBook] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [quaggaLoaded, setQuaggaLoaded] = useState(false);
  const [quagga2Loaded, setQuagga2Loaded] = useState(false);
  const [usingQuagga2, setUsingQuagga2] = useState(false);
  const isProcessingRef = useRef<boolean>(false);

  // Veilige serialisatie functie die omgaat met circulaire referenties en React/DOM elementen
  const safeStringify = (obj: any, depth = 0): string => {
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
      const items = obj.slice(0, 5).map(item => safeStringify(item, depth + 1));
      const more = obj.length > 5 ? `... (+${obj.length - 5} more)` : '';
      return `[${items.join(', ')}${more}]`;
    }
    
    // Handle objects - gebruik Map om circulaire referenties te detecteren
    const seen = new Map();
    let refCounter = 0;
    
    const stringifyValue = (val: any, currentDepth: number): string => {
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
        const pairs = keys.map(key => {
          try {
            return `"${key}": ${stringifyValue(val[key], currentDepth + 1)}`;
          } catch {
            return `"${key}": [Error serializing]`;
          }
        });
        return `{${pairs.join(', ')}}`;
      } catch {
        return '[Object]';
      }
    };
    
    try {
      const keys = Object.keys(obj).slice(0, 10);
      const pairs = keys.map(key => {
        try {
          return `"${key}": ${stringifyValue(obj[key], depth + 1)}`;
        } catch {
          return `"${key}": [Error]`;
        }
      });
      return `{${pairs.join(', ')}}`;
    } catch {
      return '[Object]';
    }
  };

  // Debug logging functie die ook naar het scherm schrijft
  const debugLog = (message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    let logMessage: string;
    
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
    setDebugLogs(prev => {
      const newLogs = [...prev, logMessage];
      // Houd alleen laatste 50 logs
      return newLogs.slice(-50);
    });
  };

  // Cleanup bij unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  /**
   * Callback functie voor barcode scanning - verwerkt gedetecteerde barcodes
   * QuaggaJS result heeft een codeResult object met code en format
   */
  const handleBarcodeResult = (result: any) => {
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
      debugLog('🧹 Cleaned code', { cleaned: cleanCode, length: cleanCode.length });
      
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
        // (Scanner is al gestopt in onDetected callback)
        isProcessingRef.current = true;
        
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
      debugLog('❌ Error processing barcode result', { error: String(e) });
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
   */
  const startCamera = async () => {
    // Reset processing flag bij het starten van de camera - EERST
    isProcessingRef.current = false;
    
    if (isScanning) return; // Al aan het scannen
    
    // Detecteer platform VOORDAT we scanner kiezen
    const userAgent = navigator.userAgent;
    const isAndroid = /Android/i.test(userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || 
                     (window.innerWidth <= 768);
    
    debugLog('Platform detectie', {
      isAndroid,
      isIOS,
      isMobile,
      userAgent: userAgent.substring(0, 100) // Eerste 100 chars voor privacy
    });
    
    // Strategie: Android gebruikt QuaggaJS (bewezen werkend), andere platforms Quagga2
    let scanner: any;
    let scannerName: string;
    let isQuagga2: boolean;
    
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
      const hasQuagga2 = window.Quagga2 || (window.Quagga && (window.Quagga as any).ImageDebug);
      
      if (hasQuagga2) {
        scanner = window.Quagga2 || window.Quagga;
        scannerName = 'Quagga2';
        isQuagga2 = true;
        debugLog('📦 Gebruik Quagga2 (onderhouden versie met debug overlay)', {
          platform: isIOS ? 'iOS' : 'Desktop',
          hasQuagga2: !!window.Quagga2,
          hasImageDebug: !!(window.Quagga && (window.Quagga as any).ImageDebug)
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
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check nu of container div bestaat
    const container = document.getElementById('quagga-container');
    if (!container) {
      setError('Scanner container niet gevonden. Probeer het opnieuw.');
      setIsScanning(false);
      return;
    }
    
    try {
      
      debugLog(`📷 Starting ${scannerName} barcode scanner...`);
      debugLog('Container check', { exists: !!container });
      debugLog('Scanner check', { 
        quagga2: !!window.Quagga2, 
        quagga: !!window.Quagga,
        using: scannerName,
        isMobile: isMobile
      });

      // Configuratie - EXACT zoals SeniorEase (bewezen werkend op Android)
      // SeniorEase gebruikt deze exacte configuratie en werkt razendsnel
      const config: any = {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: container,
          constraints: {
            video: {
              facingMode: { exact: "environment" } // Force achtercamera (zoals SeniorEase)
            },
            width: 640,
            height: 480
          }
        },
        decoder: {
          readers: ["ean_reader", "code_128_reader", "code_39_reader"] // Exact zoals SeniorEase
        },
        locate: true,
        locator: {
          patchSize: "medium", // Exact zoals SeniorEase
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
        platform: isAndroid ? 'Android' : (isIOS ? 'iOS' : 'Desktop'),
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
        await new Promise<void>((resolve, reject) => {
          scanner.init(config, (err: any) => {
            if (err) {
              debugLog(`❌ ${scannerName} init error (eerste poging)`, { error: String(err), errorName: err?.name });
              
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
                        // Geen width/height constraints - maximale flexibiliteit
                      }
                    }
                  },
                  locator: {
                    ...config.locator,
                    patchSize: "medium", // Grotere patches als fallback
                    halfSample: true
                  }
                };
                
                scanner.init(fallbackConfig, (fallbackErr: any) => {
                  if (fallbackErr) {
                    debugLog(`❌ ${scannerName} fallback init ook gefaald`, { error: String(fallbackErr) });
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
            scanner.onProcessed((result: any) => {
              if (result) {
                // Quagga2: teken debug overlay
                if (isQuagga2 && scanner.canvas?.ctx?.overlay && scanner.canvas?.dom?.overlay) {
                  try {
                    const ctx = scanner.canvas.ctx.overlay;
                    const canvas = scanner.canvas.dom.overlay;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // Teken boxes (blauw)
                    if (result.boxes) {
                      result.boxes
                        .filter((box: any) => box !== result.box)
                        .forEach((box: any) => {
                          if (scanner.ImageDebug?.drawPath) {
                            scanner.ImageDebug.drawPath(box, { x: 0, y: 1 }, ctx, {
                              color: '#00F',
                              lineWidth: 2
                            });
                          }
                        });
                    }
                    
                    // Teken hoofdbox (groen)
                    if (result.box && scanner.ImageDebug?.drawPath) {
                      scanner.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, ctx, {
                        color: '#0F0',
                        lineWidth: 3
                      });
                    }
                    
                    // Teken scanline (rood/oranje)
                    if (result.line && scanner.ImageDebug?.drawPath) {
                      const lineColor = result.codeResult?.code ? 'red' : 'orange';
                      scanner.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, ctx, {
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
            scanner.onDetected((result: any) => {
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
                debugLog('✅ Processing detected code', { code });
                
                // Direct stoppen zoals SeniorEase
                try {
                  scanner.stop();
                  debugLog('🛑 Scanner stopped after detection');
                } catch (e) {
                  debugLog('⚠️ Error stopping scanner', { error: String(e) });
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
            setTimeout(() => {
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
      } catch (initError: any) {
        debugLog(`❌ ${scannerName} init gefaald`, { error: String(initError) });
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
        } catch {
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

  const stopCamera = () => {
    debugLog('🛑 Stopping camera...');
    
    // Stop scanner - dit stopt ook automatisch de video stream
    const scanner = window.Quagga2 || window.Quagga;
    if (scanner) {
      try {
        // Remove all callbacks
        scanner.offDetected?.(); // Quagga2
        scanner.offProcessed?.(); // Quagga2
        // QuaggaJS gebruikt onDetected/onProcessed zonder off, maar stop() stopt alles
        scanner.stop();
        debugLog('✅ Scanner stopped');
      } catch (err) {
        debugLog('⚠️ Error stopping scanner', { error: String(err) });
        console.log('Error stopping scanner:', err);
      }
    }
    
    // Reset processing flag
    isProcessingRef.current = false;
    setIsScanning(false);
  };

  // Try OpenLibrary ISBN API - verbeterd met timeout en betere error handling
  const tryOpenLibrary = async (isbn: string) => {
    try {
      debugLog('🔍 Trying OpenLibrary API', { isbn });
      const url = `https://openlibrary.org/isbn/${isbn}.json`;
      
      // Timeout na 5 seconden
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        
        if (!response.ok) {
          debugLog('⚠️ OpenLibrary response not OK', { status: response.status });
          return null;
        }
        
        const edition = await response.json();
        
        if (!edition.title) {
          debugLog('⚠️ OpenLibrary: no title found');
          return null;
        }
        
        // Build basic book object
        const data: any = {
          title: edition.title,
          publishYear: edition.publish_date || null,
          pages: edition.number_of_pages || null,
          isbn: isbn
        };
        
        // Verbeterde auteur-ophaling: haal voor elke author key de naam op
        if (Array.isArray(edition.authors) && edition.authors.length > 0) {
          try {
            const authorNames = await Promise.all(
              edition.authors.map(async (a: any) => {
                if (a?.key) {
                  try {
                    const authorRes = await fetch(`https://openlibrary.org${a.key}.json`, {
                      signal: controller.signal
                    });
                    if (authorRes.ok) {
                      const authorData = await authorRes.json();
                      return authorData?.name as string;
                    }
                  } catch (e) {
                    debugLog('⚠️ Error fetching author', { error: String(e) });
                  }
                }
                return '';
              })
            );
            const names = authorNames.filter((n) => n && n.trim().length > 0);
            if (names.length > 0) {
              data.author = names.join(', ');
            }
          } catch (e) {
            debugLog('⚠️ Author lookup failed', { error: String(e) });
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
                data.description = typeof work.description === 'string'
                  ? work.description
                  : work.description?.value;
              }
              if (work.subjects) {
                data.subjects = work.subjects.slice(0, 5);
              }
            }
          } catch (e) {
            debugLog('⚠️ Could not fetch work details', { error: String(e) });
          }
        }
        
        if (!data.author) {
          data.author = 'Onbekende auteur';
        }
        
        debugLog('✅ OpenLibrary success', { title: data.title, author: data.author });
        return data;
      } catch (fetchError) {
        clearTimeout(timeout);
        throw fetchError;
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        debugLog('⏱️ OpenLibrary timeout');
      } else {
        debugLog('❌ OpenLibrary failed', { error: String(err) });
      }
    }
    return null;
  };

  // Try Google Books API - verbeterd met timeout en betere data parsing
  const tryGoogleBooks = async (isbn: string) => {
    try {
      debugLog('🔍 Trying Google Books API', { isbn });
      const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
      
      // Timeout na 5 seconden
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        
        if (!response.ok) {
          debugLog('⚠️ Google Books response not OK', { status: response.status });
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
          cover = book.imageLinks.large ||
                  book.imageLinks.medium ||
                  book.imageLinks.thumbnail ||
                  book.imageLinks.smallThumbnail ||
                  null;
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
        
        debugLog('✅ Google Books success', { title: result.title, author: result.author });
        return result;
      } catch (fetchError) {
        clearTimeout(timeout);
        throw fetchError;
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        debugLog('⏱️ Google Books timeout');
      } else {
        debugLog('❌ Google Books failed', { error: String(err) });
      }
    }
    return null;
  };

  // Try UPCitemdb API - universal product database, gebruikt in Biblitoheek Android app
  const tryUPCitemdb = async (isbn: string) => {
    try {
      debugLog('🔍 Trying UPCitemdb API', { isbn });
      const url = `https://api.upcitemdb.com/prod/trial/lookup?upc=${isbn}`;
      
      // Timeout na 5 seconden
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        
        if (!response.ok) {
          debugLog('⚠️ UPCitemdb response not OK', { status: response.status });
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
        
        debugLog('✅ UPCitemdb success', { title: result.title, author: result.author });
        return result;
      } catch (fetchError) {
        clearTimeout(timeout);
        throw fetchError;
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        debugLog('⏱️ UPCitemdb timeout');
      } else {
        debugLog('❌ UPCitemdb failed', { error: String(err) });
      }
    }
    return null;
  };

  // Try OpenLibrary Works API (alternative endpoint via works)
  const tryOpenLibraryWorks = async (isbn: string) => {
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
          let authors: string[] = [];
          if (work.authors && work.authors.length > 0) {
            const authorPromises = work.authors.slice(0, 3).map(async (author: any) => {
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
            authors = (await Promise.all(authorPromises)).filter(a => a);
          }
          
          // Haal beschrijving en onderwerpen op
          let description: string | null = null;
          let subjects: string[] = [];
          
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

  const lookupIsbn = async (isbn: string) => {
    setIsLoading(true); 
    setError(''); 
    setScannedBook(null);
    // isProcessingRef is al gezet in handleBarcodeResult
    try {
      const cleanIsbn = isbn.replace(/[^0-9X]/gi, '');
      debugLog('📚 Looking up ISBN', { isbn: cleanIsbn });
      
      // Validate ISBN length (ISBN-10: 10 digits, ISBN-13: 13 digits)
      if (cleanIsbn.length < 10 || cleanIsbn.length > 13) {
        const errorMsg = 'Ongeldig ISBN nummer. ISBN moet 10 of 13 cijfers bevatten.';
        debugLog('❌ Invalid ISBN', { length: cleanIsbn.length });
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
      debugLog('❌ Error in lookupIsbn', { error: String(err) });
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
    } finally {
      setIsLoading(false);
      // Reset processing flag na het voltooien van de lookup
      isProcessingRef.current = false;
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => { e.preventDefault(); if (manualIsbn.trim()) lookupIsbn(manualIsbn); };

  const saveBook = (status: 'reading' | 'tbr' | 'finished') => {
    const savedBooks = JSON.parse(localStorage.getItem('shelfie-books') || '[]');
    savedBooks.push({ ...scannedBook, status, id: Date.now() });
    localStorage.setItem('shelfie-books', JSON.stringify(savedBooks));
    setScannedBook(null); setManualIsbn('');
    window.location.href = '/library';
  };

  // Handle Quagga2 script load (primair)
  const handleQuagga2Load = () => {
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
  const handleQuaggaLoad = () => {
    debugLog('✅ QuaggaJS script loaded');
    setQuaggaLoaded(true);
  };

  return (
    <main className="min-h-screen bg-surface-dark">
      {/* Load Quagga2 EERST (onderhouden versie met debug overlay) */}
      <Script
        src="https://unpkg.com/@ericblade/quagga2/dist/quagga.min.js"
        onLoad={handleQuagga2Load}
        onError={() => {
          debugLog('⚠️ Quagga2 niet geladen, gebruik QuaggaJS');
        }}
        strategy="lazyOnload"
        id="quagga2-script"
      />
      {/* QuaggaJS als backup */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/quagga/0.12.1/quagga.min.js"
        onLoad={handleQuaggaLoad}
        onError={() => {
          debugLog('❌ Failed to load QuaggaJS');
          if (!quagga2Loaded) {
            setError('Kon scanner niet laden. Controleer je internetverbinding.');
          }
        }}
        strategy="lazyOnload"
        id="quagga-script"
      />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[150px]" />
      </div>
      <div className="relative z-10">
        <header className="sticky top-0 z-20 bg-surface-dark/80 backdrop-blur-lg border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link href="/library" className="flex items-center gap-2 text-neutral-400 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>Back</Link>
              <h1 className="font-display font-bold text-lg text-white">Add Book</h1>
              <button 
                onClick={() => setShowDebug(!showDebug)} 
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20"
              >
                {showDebug ? '🔴 Debug ON' : '⚪ Debug'}
              </button>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          {scannedBook ? (
            <div className="animate-scale-in">
              <div className="glass-card p-6 mb-6">
                <div className="flex gap-6 mb-4">
                  <div className="flex-shrink-0">
                    {scannedBook.cover ? <img src={scannedBook.cover} alt={scannedBook.title} className="w-28 h-40 rounded-xl object-cover shadow-lg" /> : <div className="w-28 h-40 rounded-xl bg-surface-light flex items-center justify-center"><span className="text-4xl">📚</span></div>}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-white font-bold text-xl mb-1">{scannedBook.title}</h2>
                    <p className="text-neutral-400 mb-2">{scannedBook.author}</p>
                    {scannedBook.publishYear && <p className="text-neutral-500 text-sm mb-1">📅 {scannedBook.publishYear}</p>}
                    {scannedBook.pages && <p className="text-neutral-500 text-sm mb-1">📄 {scannedBook.pages} paginas</p>}
                    <p className="text-neutral-600 text-xs mt-2">ISBN: {scannedBook.isbn}</p>
                  </div>
                </div>
                
                {/* Beschrijving */}
                {scannedBook.description && (
                  <div className="mb-4">
                    <h3 className="text-white font-semibold text-sm mb-2">Beschrijving</h3>
                    <p className="text-neutral-300 text-sm leading-relaxed line-clamp-4">
                      {scannedBook.description.length > 300 
                        ? scannedBook.description.substring(0, 300) + '...' 
                        : scannedBook.description}
                    </p>
                  </div>
                )}
                
                {/* Onderwerpen */}
                {scannedBook.subjects && scannedBook.subjects.length > 0 && (
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-2">Onderwerpen</h3>
                    <div className="flex flex-wrap gap-2">
                      {scannedBook.subjects.map((subject: string, index: number) => (
                        <span key={index} className="px-3 py-1 rounded-full bg-primary/20 text-primary-light text-xs">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-neutral-400 text-center mb-4">Add to shelf as:</p>
                <button onClick={() => saveBook('reading')} className="w-full glass-card-hover p-4 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center"><span className="text-2xl">📖</span></div><div className="text-left"><p className="text-white font-semibold">Currently Reading</p><p className="text-neutral-400 text-sm">I am reading this now</p></div></button>
                <button onClick={() => saveBook('tbr')} className="w-full glass-card-hover p-4 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center"><span className="text-2xl">📚</span></div><div className="text-left"><p className="text-white font-semibold">To Be Read (TBR)</p><p className="text-neutral-400 text-sm">On my reading list</p></div></button>
                <button onClick={() => saveBook('finished')} className="w-full glass-card-hover p-4 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center"><span className="text-2xl">✅</span></div><div className="text-left"><p className="text-white font-semibold">Finished</p><p className="text-neutral-400 text-sm">Already read this one</p></div></button>
              </div>
              <button onClick={() => setScannedBook(null)} className="w-full mt-6 text-neutral-400 hover:text-white py-3">Scan another book</button>
            </div>
          ) : (
            <>
              <div className="glass-card p-6 mb-6">
                {isScanning ? (
                  <div className="relative pb-24">
                    {/* Quagga container - Quagga zal hier automatisch een video element in plaatsen */}
                    <div 
                      id="quagga-container" 
                      className="w-full h-64 md:h-96 rounded-xl overflow-hidden bg-black relative"
                      style={{ transform: 'scaleX(1)' }}
                    />
                    {/* CSS voor overlay canvas - moet BOVENOP alles liggen (zoals SeniorEase) */}
                    <style jsx global>{`
                      #quagga-container {
                        position: relative !important;
                      }
                      #quagga-container video {
                        position: relative !important;
                        z-index: 1 !important;
                        width: 100% !important;
                        height: 100% !important;
                        object-fit: cover !important;
                      }
                      #quagga-container canvas.drawingBuffer {
                        display: block !important;
                        position: absolute !important;
                        z-index: 3 !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        pointer-events: none !important;
                      }
                      /* Alle andere canvas elementen ook bovenop */
                      #quagga-container canvas {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        z-index: 3 !important;
                      }
                    `}</style>
                    {/* Scanning frame overlay - onder canvas maar boven video */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[2]">
                      <div className="w-64 h-40 md:w-80 md:h-48 border-2 border-primary rounded-lg relative shadow-lg">
                        {/* Corner markers */}
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
                        {/* Scanning line */}
                        <div className="absolute left-2 right-2 h-1 bg-primary animate-pulse shadow-lg" style={{ top: '50%', boxShadow: '0 0 10px rgba(168, 85, 247, 0.8)' }} />
                      </div>
                    </div>
                    {/* Close button */}
                    <button 
                      onClick={stopCamera} 
                      className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 backdrop-blur-sm p-3 rounded-full text-white transition-all z-20"
                      aria-label="Stop camera"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    {/* Instructions - buiten de video container */}
                    <div className="absolute -bottom-16 left-0 right-0 px-4 z-20">
                      <p className="text-center text-white text-sm font-medium mb-1 bg-black/70 backdrop-blur-sm rounded-full py-2 px-4 inline-block">
                        📷 Richt de camera op de barcode
                      </p>
                      <p className="text-center text-neutral-300 text-xs mt-2">
                        Zorg dat de barcode goed verlicht is
                      </p>
                      {/* Debug toggle tijdens scanning */}
                      <button 
                        onClick={() => setShowDebug(!showDebug)} 
                        className="mt-3 mx-auto block px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20"
                      >
                        {showDebug ? '🔴 Debug OFF' : '⚪ Debug ON'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={startCamera} className="w-full h-48 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-white/5 transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center"><svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                    <div className="text-center"><p className="text-white font-semibold">Scan ISBN Barcode</p><p className="text-neutral-400 text-sm">Tap to open camera</p></div>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4 my-6"><div className="flex-1 h-px bg-white/10" /><span className="text-neutral-500 text-sm">or enter manually</span><div className="flex-1 h-px bg-white/10" /></div>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div><label htmlFor="isbn" className="block text-sm text-neutral-400 mb-2">ISBN Number</label><input type="text" id="isbn" value={manualIsbn} onChange={(e) => setManualIsbn(e.target.value)} placeholder="Voer ISBN in (bijv. 9789401609236)" className="input-modern" /></div>
                {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
                <button type="submit" disabled={isLoading || !manualIsbn.trim()} className="w-full btn-gradient py-4 disabled:opacity-50">{isLoading ? 'Searching...' : 'Look up book'}</button>
              </form>
              <div className="mt-8 glass-card p-4">
                <p className="text-neutral-500 text-sm mb-3">Try these popular BookTok reads:</p>
                <div className="flex flex-wrap gap-2">
                  {[{ isbn: '9780062060624', title: 'Song of Achilles' }, { isbn: '9781649374042', title: 'Fourth Wing' }, { isbn: '9780316769174', title: 'Catcher in the Rye' }].map((book) => (
                    <button key={book.isbn} onClick={() => { 
                      console.log('Button clicked for:', book.title, 'ISBN:', book.isbn);
                      setManualIsbn(book.isbn); 
                      lookupIsbn(book.isbn); 
                    }} className="px-3 py-1.5 rounded-full bg-white/5 text-neutral-400 text-sm hover:bg-primary/20 hover:text-primary-light">{book.title}</button>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {/* Debug Panel */}
          {showDebug && (
            <div className="fixed bottom-16 left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 z-50 max-h-[50vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-3 border-b border-white/10">
                <h3 className="text-white font-semibold text-sm">Debug Logs</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setDebugLogs([])} 
                    className="text-neutral-400 hover:text-white text-xs px-2 py-1"
                  >
                    Clear
                  </button>
                  <button 
                    onClick={() => setShowDebug(false)} 
                    className="text-neutral-400 hover:text-white text-xs px-2 py-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto p-3 space-y-1">
                {debugLogs.length === 0 ? (
                  <p className="text-neutral-500 text-xs">Geen logs nog...</p>
                ) : (
                  debugLogs.map((log, index) => (
                    <div key={index} className="text-xs font-mono text-neutral-300 break-words">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <nav className="fixed bottom-0 left-0 right-0 bg-surface-dark/90 backdrop-blur-lg border-t border-white/10">
          <div className="container mx-auto px-4"><div className="flex justify-around py-2">
            <Link href="/library" className="nav-item"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg><span className="text-xs">Library</span></Link>
            <Link href="/scan" className="nav-item active"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m14 0h2M6 20h2m-4-8h2m14 0h2" /></svg><span className="text-xs">Scan</span></Link>
            <Link href="/stats" className="nav-item"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg><span className="text-xs">Stats</span></Link>
            <Link href="/profile" className="nav-item"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><span className="text-xs">Profile</span></Link>
          </div></div>
        </nav>
      </div>
    </main>
  );
}


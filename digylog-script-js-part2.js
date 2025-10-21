<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>DIGYLOG Scanner Mobile</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script src="https://unpkg.com/@zxing/library@0.19.1/umd/index.min.js"></script>
    <style>
        body {
            overscroll-behavior: none;
            -webkit-overflow-scrolling: touch;
        }
        .animate-bounce-slow {
            animation: bounce 2s infinite;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95) translateY(-20px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeOut {
            from { opacity: 1; transform: scale(1) translateY(0); }
            to { opacity: 0; transform: scale(0.95) translateY(-20px); }
        }
        .fade-in {
            animation: fadeIn 0.3s ease-out;
        }
        @keyframes scanLine {
            0%, 100% { top: 0; }
            50% { top: 100%; }
        }
        .scan-line {
            animation: scanLine 2s ease-in-out infinite;
        }
        video {
            object-fit: cover;
        }
        .viewfinder {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            max-width: 400px;
            aspect-ratio: 3/2;
            border: 3px solid #22c55e;
            border-radius: 12px;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
        }
        .corner {
            position: absolute;
            width: 30px;
            height: 30px;
            border: 4px solid #22c55e;
        }
        .corner-tl { top: -2px; left: -2px; border-right: none; border-bottom: none; }
        .corner-tr { top: -2px; right: -2px; border-left: none; border-bottom: none; }
        .corner-bl { bottom: -2px; left: -2px; border-right: none; border-top: none; }
        .corner-br { bottom: -2px; right: -2px; border-left: none; border-top: none; }
    </style>
</head>
<body class="bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 min-h-screen">
    <div id="app"></div>

    <script>
        // Configuration PDF.js
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        // État de l'application
        let state = {
            referenceOrders: [],
            scannedOrders: new Set(),
            unknownCodes: [],
            uploadedFiles: [],
            currentView: 'import',
            scanMode: 'keyboard',
            scanInput: '',
            lastScanned: '',
            isProcessing: false,
            dragActive: false,
            isCameraActive: false,
            isStartingCamera: false,
            cameraStream: null,
            codeReader: null,
            scanBuffer: '',
            lastKeyTime: 0,
            continuousScan: true,
            douchetteMode: true,
            storeGroups: {},
            scanQueue: []
        };

        // ===================================
        // SONS MAGNIFIQUES PROFESSIONNELS ✨
        // ===================================
        
        function playSound(type) {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const masterGain = audioContext.createGain();
                masterGain.connect(audioContext.destination);
                masterGain.gain.value = 0.8;

                if (type === 'success') {
                    // ✅ SON DE SUCCÈS MAGNIFIQUE : Mélodie Do-Mi-Sol harmonieuse
                    const osc1 = audioContext.createOscillator();
                    const gain1 = audioContext.createGain();
                    osc1.connect(gain1);
                    gain1.connect(masterGain);
                    osc1.frequency.value = 523;
                    osc1.type = 'sine';
                    gain1.gain.setValueAtTime(0, audioContext.currentTime);
                    gain1.gain.linearRampToValueAtTime(0.6, audioContext.currentTime + 0.02);
                    gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                    osc1.start(audioContext.currentTime);
                    osc1.stop(audioContext.currentTime + 0.15);
                    
                    const osc2 = audioContext.createOscillator();
                    const gain2 = audioContext.createGain();
                    osc2.connect(gain2);
                    gain2.connect(masterGain);
                    osc2.frequency.value = 659;
                    osc2.type = 'sine';
                    gain2.gain.setValueAtTime(0, audioContext.currentTime + 0.05);
                    gain2.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.07);
                    gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    osc2.start(audioContext.currentTime + 0.05);
                    osc2.stop(audioContext.currentTime + 0.2);
                    
                    const osc3 = audioContext.createOscillator();
                    const gain3 = audioContext.createGain();
                    osc3.connect(gain3);
                    gain3.connect(masterGain);
                    osc3.frequency.value = 784;
                    osc3.type = 'sine';
                    gain3.gain.setValueAtTime(0, audioContext.currentTime + 0.1);
                    gain3.gain.linearRampToValueAtTime(0.7, audioContext.currentTime + 0.12);
                    gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
                    osc3.start(audioContext.currentTime + 0.1);
                    osc3.stop(audioContext.currentTime + 0.35);
                    
                    const osc4 = audioContext.createOscillator();
                    const gain4 = audioContext.createGain();
                    osc4.connect(gain4);
                    gain4.connect(masterGain);
                    osc4.frequency.value = 1046;
                    osc4.type = 'triangle';
                    gain4.gain.setValueAtTime(0, audioContext.currentTime + 0.1);
                    gain4.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.12);
                    gain4.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
                    osc4.start(audioContext.currentTime + 0.1);
                    osc4.stop(audioContext.currentTime + 0.35);
                    
                } else if (type === 'duplicate') {
                    // ⚠️ SON DOUBLON : Double tonalité douce (La-Fa)
                    const osc1 = audioContext.createOscillator();
                    const gain1 = audioContext.createGain();
                    osc1.connect(gain1);
                    gain1.connect(masterGain);
                    osc1.frequency.value = 440;
                    osc1.type = 'sine';
                    gain1.gain.setValueAtTime(0, audioContext.currentTime);
                    gain1.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.02);
                    gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.12);
                    osc1.start(audioContext.currentTime);
                    osc1.stop(audioContext.currentTime + 0.12);
                    
                    const osc2 = audioContext.createOscillator();
                    const gain2 = audioContext.createGain();
                    osc2.connect(gain2);
                    gain2.connect(masterGain);
                    osc2.frequency.value = 349;
                    osc2.type = 'sine';
                    gain2.gain.setValueAtTime(0, audioContext.currentTime + 0.15);
                    gain2.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.17);
                    gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.28);
                    osc2.start(audioContext.currentTime + 0.15);
                    osc2.stop(audioContext.currentTime + 0.28);
                    
                } else if (type === 'error') {
                    // ❌ SON ERREUR : Tonalité descendante Mi-Ré-Do
                    const osc1 = audioContext.createOscillator();
                    const gain1 = audioContext.createGain();
                    osc1.connect(gain1);
                    gain1.connect(masterGain);
                    osc1.frequency.value = 329;
                    osc1.type = 'sine';
                    gain1.gain.setValueAtTime(0, audioContext.currentTime);
                    gain1.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.03);
                    gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                    osc1.start(audioContext.currentTime);
                    osc1.stop(audioContext.currentTime + 0.15);
                    
                    const osc2 = audioContext.createOscillator();
                    const gain2 = audioContext.createGain();
                    osc2.connect(gain2);
                    gain2.connect(masterGain);
                    osc2.frequency.value = 293;
                    osc2.type = 'sine';
                    gain2.gain.setValueAtTime(0, audioContext.currentTime + 0.08);
                    gain2.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
                    gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.22);
                    osc2.start(audioContext.currentTime + 0.08);
                    osc2.stop(audioContext.currentTime + 0.22);
                    
                    const osc3 = audioContext.createOscillator();
                    const gain3 = audioContext.createGain();
                    osc3.connect(gain3);
                    gain3.connect(masterGain);
                    osc3.frequency.value = 261;
                    osc3.type = 'sine';
                    gain3.gain.setValueAtTime(0, audioContext.currentTime + 0.16);
                    gain3.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.18);
                    gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
                    osc3.start(audioContext.currentTime + 0.16);
                    osc3.stop(audioContext.currentTime + 0.35);
                }
            } catch (error) {
                console.log('Audio not available');
            }
        }

        function playBeep(frequency = 800, duration = 0.1) {
            if (frequency === 800) playSound('success');
            else if (frequency === 600) playSound('duplicate');
            else playSound('error');
        }

        function showNotification(message, type) {
            const oldNotif = document.querySelector('.scan-notification');
            if (oldNotif) {
                oldNotif.remove();
            }

            const notifDiv = document.createElement('div');
            notifDiv.className = `scan-notification fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl text-white font-bold text-lg ${
                type === 'success' ? 'bg-green-500' :
                type === 'warning' ? 'bg-orange-500' :
                'bg-red-500'
            }`;
            notifDiv.style.animation = 'fadeIn 0.3s ease-out';
            notifDiv.textContent = message;
            document.body.appendChild(notifDiv);
            
            setTimeout(() => {
                notifDiv.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    if (notifDiv.parentNode) {
                        notifDiv.remove();
                    }
                }, 300);
            }, 1500);
        }

        async function extractTextFromPDF(arrayBuffer) {
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }

            return fullText;
        }

        function detectExpeditorFromTop(text) {
            const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            
            console.log('🔍 Recherche expéditeur dans les 30 premières lignes:');
            
            for (let i = 0; i < Math.min(lines.length, 30); i++) {
                const line = lines[i];
                console.log(`Ligne ${i}: "${line}"`);
                
                if (line.toLowerCase().includes('expéditeur') || line.toLowerCase().includes('expediteur')) {
                    const afterColon = line.split(':')[1];
                    if (afterColon) {
                        let expeditor = afterColon.trim()
                            .replace(/\[\d+\]/g, '')
                            .replace(/[-–]/g, '')
                            .replace(/\s+/g, ' ')
                            .trim();
                        
                        if (expeditor && expeditor.length > 2 && expeditor.length < 50) {
                            console.log(`✅ TROUVÉ (après ":"): "${expeditor}"`);
                            return expeditor;
                        }
                    }
                    
                    const nextLine = lines[i + 1];
                    if (nextLine) {
                        let expeditor = nextLine
                            .replace(/\[\d+\]/g, '')
                            .replace(/[-–]/g, '')
                            .replace(/\s+/g, ' ')
                            .trim();
                        
                        if (expeditor && expeditor.length > 2 && expeditor.length < 50 && /^[A-Za-z]/.test(expeditor)) {
                            console.log(`✅ TROUVÉ (ligne suivante): "${expeditor}"`);
                            return expeditor;
                        }
                    }
                }
                
                const match = line.match(/\[?\d+\]?\s*[-–]?\s*([A-Za-z][A-Za-z0-9\s]+)/);
                if (match && !line.toLowerCase().includes('tel') && !line.toLowerCase().includes('code')) {
                    let expeditor = match[1].trim().split(/\s{2,}/)[0];
                    if (expeditor.length > 2 && expeditor.length < 50) {
                        console.log(`✅ TROUVÉ (pattern code): "${expeditor}"`);
                        return expeditor;
                    }
                }
                
                if (line.toLowerCase().startsWith('de:') || line.toLowerCase().startsWith('from:')) {
                    let expeditor = line.split(':')[1].trim()
                        .replace(/\[\d+\]/g, '')
                        .replace(/[-–]/g, '')
                        .trim();
                    
                    if (expeditor && expeditor.length > 2) {
                        console.log(`✅ TROUVÉ (De:/From:): "${expeditor}"`);
                        return expeditor;
                    }
                }
            }
            
            console.log('❌ AUCUN expéditeur trouvé dans les 30 premières lignes');
            return "";
        }

        function extractTicketInfo(text) {
            const info = {
                store_name: "",
                store_full: "",
                quantity: "",
                product_name: "",
                price: "",
                destination_city: "",
                receiver_name: ""
            };

            const lines = text.split('\n').map(line => line.trim());

            for (let line of lines) {
                const expediteurMatch = line.match(/Expéditeur\s*:\s*(.+?)(?:\s*\[|$)/i);
                if (expediteurMatch) {
                    const fullStore = expediteurMatch[1].trim();
                    info.store_full = fullStore;
                    
                    const cleanMatch = fullStore.match(/(?:\[\d+\]\s*[-–]?\s*)?(.+?)(?:\s*\[|$)/);
                    if (cleanMatch) {
                        info.store_name = cleanMatch[1].trim().replace(/^[-–]\s*/, '').replace(/\[\d+\]$/, '');
                    } else {
                        info.store_name = fullStore.replace(/\[\d+\]/g, '').replace(/[-–]/g, '').trim();
                    }
                    break;
                }
            }

            for (let line of lines) {
                const quantityMatch = line.match(/(\d+)\s*x\s*(.+?)(?:\s+\d+\s*DH|$)/i);
                if (quantityMatch) {
                    info.quantity = quantityMatch[1];
                    info.product_name = quantityMatch[2].trim();
                    break;
                }
            }

            for (let line of lines) {
                const priceMatch = line.match(/(\d+(?:[.,]\d{2})?)\s*DH/i);
                if (priceMatch) {
                    info.price = priceMatch[1] + ' DH';
                    break;
                }
            }

            const moroccanCities = [
                'Casablanca', 'Casa', 'Rabat', 'Marrakech', 'Fes', 'Fès', 'Tanger', 'Tangier',
                'Agadir', 'Meknès', 'Meknes', 'Oujda', 'Kenitra', 'Tétouan', 'Tetouan',
                'Safi', 'Mohammedia', 'Khouribga', 'Beni Mellal', 'El Jadida', 'Nador',
                'Settat', 'Larache', 'Khemisset', 'Guelmim', 'Berrechid', 'Errachidia',
                'Ksar El Kebir', 'Sale', 'Salé', 'Taza', 'Essaouira', 'Ouarzazate'
            ];

            for (let line of lines) {
                for (let city of moroccanCities) {
                    if (line.toLowerCase().includes(city.toLowerCase())) {
                        info.destination_city = city;
                        break;
                    }
                }
                if (info.destination_city) break;
            }

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                const receiverMatch = line.match(/(?:Destinataire|Client)\s*:\s*(.+)/i);
                if (receiverMatch) {
                    info.receiver_name = receiverMatch[1].trim().split(/\s+/).slice(0, 2).join(' ');
                    break;
                }
                
                const nameMatch = line.match(/^([A-Z][a-zàâäéèêëïîôùûü]+(?:\s+[A-Z][a-zàâäéèêëïîôùûü]+){1,2})$/);
                if (nameMatch && line.length > 3 && line.length < 40) {
                    if (!moroccanCities.some(city => line.toLowerCase().includes(city.toLowerCase()))) {
                        info.receiver_name = nameMatch[1];
                    }
                }
            }

            return info;
        }

        function extractTrackingCodes(text) {
            const pattern = /[A-Z]\d{7}[A-Z]{2}/g;
            const matches = text.match(pattern);
            return matches ? [...new Set(matches)] : [];
        }

        function extractOrdersWithDetails(text) {
            const orders = [];
            const seenCodes = new Set();
            
            const globalExpeditor = detectExpeditorFromTop(text);
            console.log(`📋 Expéditeur global du document: "${globalExpeditor}"`);
            
            const sections = text.split(/(?=[A-Z]\d{7}[A-Z]{2})/);
            
            for (let section of sections) {
                const codeMatch = section.match(/[A-Z]\d{7}[A-Z]{2}/);
                if (codeMatch) {
                    const code = codeMatch[0];
                    
                    if (seenCodes.has(code)) {
                        console.log(`⚠️ Code dupliqué ignoré: ${code}`);
                        continue;
                    }
                    
                    seenCodes.add(code);
                    const ticketInfo = extractTicketInfo(section);
                    
                    const finalStoreName = ticketInfo.store_name || globalExpeditor || "Non identifié";
                    const finalStoreFull = ticketInfo.store_full || globalExpeditor || "Non identifié";
                    
                    orders.push({
                        tracking: code,
                        barcode: code,
                        store_name: finalStoreName,
                        store_full: finalStoreFull,
                        quantity: ticketInfo.quantity,
                        product_name: ticketInfo.product_name,
                        price: ticketInfo.price,
                        destination_city: ticketInfo.destination_city,
                        receiver_name: ticketInfo.receiver_name,
                        scanned: false,
                        id: Date.now() + Math.random()
                    });
                }
            }

            console.log(`✅ ${orders.length} commandes extraites avec expéditeur: ${globalExpeditor || 'Non détecté'}`);
            return orders;
        }

        async function handleFiles(files) {
            if (!files || files.length === 0) return;

            state.isProcessing = true;
            render();

            const allOrders = [];
            const allCodes = new Set();
            const processedFiles = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                try {
                    let orders = [];
                    let fileExpeditor = "";
                    
                    if (file.type === 'application/pdf') {
                        const arrayBuffer = await file.arrayBuffer();
                        const text = await extractTextFromPDF(arrayBuffer);
                        orders = extractOrdersWithDetails(text);
                        
                        if (orders.length > 0 && orders[0].store_name) {
                            fileExpeditor = orders[0].store_name;
                        }
                        
                        console.log(`📄 Fichier ${file.name}:`, {
                            total: orders.length,
                            expediteur: fileExpeditor,
                            premiers: orders.slice(0, 3).map(o => ({
                                code: o.tracking,
                                store_name: o.store_name,
                                store_full: o.store_full
                            }))
                        });
                    } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                        const text = await file.text();
                        const codes = text.split(/[\n,]/).map(code => code.trim()).filter(code => /[A-Z]\d{7}[A-Z]{2}/.test(code));
                        const uniqueCodes = [...new Set(codes)];
                        orders = uniqueCodes.map(code => ({
                            tracking: code,
                            barcode: code,
                            store_name: "Import CSV",
                            store_full: "Import CSV",
                            quantity: "",
                            product_name: "",
                            price: "",
                            destination_city: "",
                            receiver_name: "",
                            scanned: false,
                            id: Date.now() + Math.random()
                        }));
                        fileExpeditor = "Import CSV";
                    } else if (file.type === 'text/plain') {
                        const text = await file.text();
                        const codes = text.split(/[\n,\s]/).map(code => code.trim()).filter(code => /[A-Z]\d{7}[A-Z]{2}/.test(code));
                        const uniqueCodes = [...new Set(codes)];
                        orders = uniqueCodes.map(code => ({
                            tracking: code,
                            barcode: code,
                            store_name: "Import TXT",
                            store_full: "Import TXT",
                            quantity: "",
                            product_name: "",
                            price: "",
                            destination_city: "",
                            receiver_name: "",
                            scanned: false,
                            id: Date.now() + Math.random()
                        }));
                        fileExpeditor = "Import TXT";
                    }

                    const newOrders = orders.filter(order => {
                        if (allCodes.has(order.tracking)) {
                            console.log(`⚠️ Code dupliqué entre fichiers ignoré: ${order.tracking}`);
                            return false;
                        }
                        allCodes.add(order.tracking);
                        return true;
                    });

                    allOrders.push(...newOrders);
                    processedFiles.push({ 
                        name: file.name, 
                        count: newOrders.length,
                        expeditor: fileExpeditor || "Non détecté"
                    });
                } catch (error) {
                    console.error(`Erreur avec ${file.name}:`, error);
                }
            }

            const storeGroups = {};
            const ordersMap = {};
            
            allOrders.forEach(order => {
                const storeName = order.store_name || order.store_full || 'Non identifié';
                
                if (!storeGroups[storeName]) {
                    storeGroups[storeName] = [];
                }
                storeGroups[storeName].push(order);
                ordersMap[order.tracking] = order;
            });

            state.storeGroups = storeGroups;
            state.ordersMap = ordersMap;
            state.referenceOrders = allOrders.map(o => o.tracking);
            state.uploadedFiles = processedFiles;
            state.isProcessing = false;
            
            const totalCodes = allOrders.length;
            const storeCount = Object.keys(storeGroups).length;
            
            console.log('✅ Import terminé:', {
                total: totalCodes,
                fichiers: processedFiles,
                groupes: Object.entries(storeGroups).map(([name, orders]) => ({
                    expediteur: name,
                    count: orders.length
                }))
            });
            
            showNotification(`✅ ${totalCodes} commandes de ${storeCount} expéditeur(s)`, 'success');
            render();
        }

        function loadSampleData() {
            const sampleOrders = [
                { tracking: 'S4906834EA', barcode: 'S4906834EA', store_name: 'idealshop', store_full: '[20849]-idealshop', quantity: '1', product_name: 'Sécateur Télescopique', price: '349 DH', destination_city: 'Fes', receiver_name: 'Senhaji', scanned: false, id: 1 },
                { tracking: 'T3847562FR', barcode: 'T3847562FR', store_name: 'techstore', store_full: '[15623]-techstore', quantity: '2', product_name: 'Câble HDMI', price: '89 DH', destination_city: 'Casablanca', receiver_name: 'Alami', scanned: false, id: 2 },
                { tracking: 'R2938475MC', barcode: 'R2938475MC', store_name: 'idealshop', store_full: '[20849]-idealshop', quantity: '1', product_name: 'Kit Jardinage', price: '199 DH', destination_city: 'Rabat', receiver_name: 'Bennani', scanned: false, id: 3 },
                { tracking: 'P5629384TA', barcode: 'P5629384TA', store_name: 'fashionshop', store_full: '[33421]-fashionshop', quantity: '3', product_name: 'T-Shirt Coton', price: '150 DH', destination_city: 'Marrakech', receiver_name: 'Tazi', scanned: false, id: 4 },
                { tracking: 'Q7483920AG', barcode: 'Q7483920AG', store_name: 'techstore', store_full: '[15623]-techstore', quantity: '1', product_name: 'Souris Sans Fil', price: '79 DH', destination_city: 'Tanger', receiver_name: 'Idrissi', scanned: false, id: 5 }
            ];

            const storeGroups = {};
            const ordersMap = {};
            
            sampleOrders.forEach(order => {
                const store = order.store_name;
                if (!storeGroups[store]) {
                    storeGroups[store] = [];
                }
                storeGroups[store].push(order);
                ordersMap[order.tracking] = order;
            });

            state.referenceOrders = sampleOrders.map(o => o.tracking);
            state.scannedOrders = new Set();
            state.storeGroups = storeGroups;
            state.ordersMap = ordersMap;
            state.uploadedFiles = [
                { name: 'Exemple_idealshop.pdf', count: 2, expeditor: 'idealshop' },
                { name: 'Exemple_techstore.pdf', count: 2, expeditor: 'techstore' },
                { name: 'Exemple_fashionshop.pdf', count: 1, expeditor: 'fashionshop' }
            ];
            
            showNotification(`✅ ${sampleOrders.length} commandes d'exemple chargées`, 'success');
            console.log('📦 Exemple de données:', { orders: sampleOrders, stores: storeGroups });
            render();
        }

        function handleScan(code) {
            const cleanCode = code.trim().toUpperCase();
            
            if (!cleanCode || !/[A-Z]\d{7}[A-Z]{2}/.test(cleanCode)) {
                return;
            }

            const isCameraMode = state.scanMode === 'camera' && state.isCameraActive;

            if (state.scannedOrders.has(cleanCode)) {
                const orderInfo = state.ordersMap[cleanCode];
                const expediteur = orderInfo ? (orderInfo.store_name || 'Inconnu') : 'Inconnu';
                showNotification(`⚠️ Déjà scanné | ${expediteur}`, 'warning');
                state.lastScanned = cleanCode;
                playSound('duplicate');
                
                if (!isCameraMode) {
                    updateCountersOnly();
                } else {
                    updateCountersDirectly();
                }
                return;
            }

            if (!state.referenceOrders.includes(cleanCode)) {
                if (!state.unknownCodes.some(item => item.code === cleanCode)) {
                    state.unknownCodes.push({
                        code: cleanCode,
                        time: new Date().toLocaleTimeString('fr-FR'),
                        date: new Date().toLocaleDateString('fr-FR')
                    });
                }
                
                showNotification('❌ Non trouvé', 'error');
                playSound('error');
                
                if (!isCameraMode) {
                    render();
                }
                return;
            }

            state.scannedOrders.add(cleanCode);
            state.lastScanned = cleanCode;
            
            const orderInfo = state.ordersMap[cleanCode];
            const expediteur = orderInfo ? (orderInfo.store_name || 'Inconnu') : 'Inconnu';
            
            showNotification(`✅ Scanné | ${expediteur}`, 'success');
            playSound('success');
            
            if (!isCameraMode) {
                updateCountersOnly();
            } else {
                updateCountersDirectly();
            }
        }

        function updateCountersDirectly() {
            const totalOrders = state.referenceOrders.length;
            const totalScanned = state.scannedOrders.size;
            const totalRemaining = totalOrders - totalScanned;
            const progressPercent = totalOrders > 0 ? Math.round((totalScanned / totalOrders) * 100) : 0;

            try {
                const totalEl = document.querySelector('.from-blue-500 .text-3xl, .from-blue-500 .text-5xl, .from-blue-500 .font-black');
                if (totalEl) totalEl.textContent = totalOrders;
                
                const scannedEl = document.querySelector('.from-green-500 .text-3xl, .from-green-500 .text-5xl, .from-green-500 .font-black');
                if (scannedEl) scannedEl.textContent = totalScanned;
                
                const remainingEl = document.querySelector('.from-orange-500 .text-3xl, .from-orange-500 .text-5xl, .from-orange-500 .font-black');
                if (remainingEl) remainingEl.textContent = totalRemaining;

                const progressBar = document.querySelector('.from-green-400');
                if (progressBar) {
                    progressBar.style.width = `${progressPercent}%`;
                    progressBar.textContent = `${progressPercent}%`;
                }

                console.log(`📊 Direct: ${totalScanned}/${totalOrders} (${progressPercent}%)`);
            } catch (e) {
                console.log('Erreur mise à jour directe:', e);
            }
        }

        function updateCountersOnly() {
            const totalOrders = state.referenceOrders.length;
            const totalScanned = state.scannedOrders.size;
            const totalRemaining = totalOrders - totalScanned;
            const progressPercent = totalOrders > 0 ? Math.round((totalScanned / totalOrders) * 100) : 0;

            setTimeout(() => {
                try {
                    const totalElement = document.querySelector('.from-blue-500 .text-3xl');
                    if (totalElement && totalElement.textContent !== totalOrders.toString()) {
                        totalElement.textContent = totalOrders;
                    }
                    
                    const scannedElement = document.querySelector('.from-green-500 .text-3xl');
                    if (scannedElement && scannedElement.textContent !== totalScanned.toString()) {
                        scannedElement.textContent = totalScanned;
                    }
                    
                    const remainingElement = document.querySelector('.from-orange-500 .text-3xl');
                    if (remainingElement && remainingElement.textContent !== totalRemaining.toString()) {
                        remainingElement.textContent = totalRemaining;
                    }

                    const progressBar = document.querySelector('.from-green-400');
                    if (progressBar) {
                        progressBar.style.width = `${progressPercent}%`;
                        progressBar.textContent = `${progressPercent}%`;
                    }

                    console.log(`📊 ${totalScanned}/${totalOrders} (${progressPercent}%)`);
                } catch (e) {
                    console.log('Mise à jour compteurs:', e);
                }
            }, 50);
        }

        function initBarcodeScanner() {
            let buffer = '';
            let timeout = null;

            document.addEventListener('keypress', function(e) {
                if (state.currentView !== 'scan' || state.scanMode !== 'keyboard') {
                    return;
                }

                const currentTime = new Date().getTime();
                
                if (currentTime - state.lastKeyTime < 50) {
                    if (e.key === 'Enter') {
                        if (buffer.length >= 10) {
                            console.log('📦 Scanner détecté, code complet:', buffer);
                            handleScan(buffer);
                            
                            const input = document.getElementById('scanInput');
                            if (input) {
                                input.value = buffer;
                            }
                        }
                        buffer = '';
                    } else {
                        buffer += e.key;
                    }
                } else {
                    buffer = e.key;
                }
                
                state.lastKeyTime = currentTime;

                if (timeout) clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if (buffer.length >= 10) {
                        console.log('📦 Code détecté (timeout):', buffer);
                        handleScan(buffer);
                        
                        const input = document.getElementById('scanInput');
                        if (input) {
                            input.value = buffer;
                        }
                    }
                    buffer = '';
                }, 200);
            });
        }

        function handleScanInput(value) {
            state.scanInput = value;
            render();
        }

        function handleScanKeyPress(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                const code = state.scanInput.trim().toUpperCase();
                
                if (code) {
                    console.log('📝 Saisie manuelle:', code);
                    handleScan(code);
                    state.scanInput = '';
                    render();
                    setTimeout(() => {
                        const input = document.getElementById('scanInput');
                        if (input) {
                            input.value = '';
                            input.focus();
                        }
                    }, 100);
                }
            }
        }

        async function startCamera() {
            try {
                if (state.isCameraActive || state.isStartingCamera) {
                    console.log('📹 Caméra déjà active ou en cours de démarrage');
                    return;
                }

                state.isStartingCamera = true;

                const video = document.getElementById('cameraVideo');
                if (!video) {
                    console.log('⏳ Vidéo non prête, nouvelle tentative...');
                    state.isStartingCamera = false;
                    setTimeout(startCamera, 300);
                    return;
                }

                console.log('🎬 Démarrage de la caméra...');

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { 
                        facingMode: { ideal: 'environment' },
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                });

                video.srcObject = stream;
                state.cameraStream = stream;

                await new Promise((resolve) => {
                    video.onloadedmetadata = async () => {
                        await video.play();
                        resolve();
                    };
                });

                state.isCameraActive = true;
                state.isStartingCamera = false;

                const loadingDiv = document.querySelector('.bg-black.bg-opacity-75');
                if (loadingDiv) {
                    loadingDiv.style.display = 'none';
                }

                console.log('✅ Caméra active');

                const codeReader = new ZXing.BrowserMultiFormatReader();
                state.codeReader = codeReader;

                let lastCode = '';
                let lastTime = 0;
                let isProcessing = false;

                codeReader.decodeFromVideoDevice(null, 'cameraVideo', (result, err) => {
                    if (result && !isProcessing) {
                        const code = result.text.trim().toUpperCase();
                        const now = Date.now();
                        
                        if (code !== lastCode || now - lastTime > 1000) {
                            console.log('📦 Détecté:', code);
                            
                            isProcessing = true;
                            
                            const display = document.getElementById('detectedCode');
                            if (display) {
                                display.textContent = `Détecté: ${code}`;
                                display.className = 'bg-blue-500 text-white border-2 border-blue-700 rounded-lg p-3 text-center font-bold mb-2 shadow-lg';
                                
                                setTimeout(() => {
                                    if (display) {
                                        display.className = 'hidden';
                                    }
                                }, 2000);
                            }
                            
                            if (/[A-Z]\d{7}[A-Z]{2}/.test(code)) {
                                handleScan(code);
                                lastCode = code;
                                lastTime = now;
                            }
                            
                            setTimeout(() => {
                                isProcessing = false;
                            }, 500);
                        }
                    }
                });

            } catch (error) {
                state.isStartingCamera = false;
                console.error('❌ Erreur caméra:', error.name, error.message);
                
                if (error.name === 'NotAllowedError') {
                    showNotification('❌ Accès caméra refusé - Autorisez dans les paramètres', 'error');
                } else if (error.name === 'NotFoundError') {
                    showNotification('❌ Aucune caméra détectée', 'error');
                } else {
                    showNotification('❌ Erreur caméra : ' + error.name, 'error');
                }
                
                setTimeout(() => {
                    state.scanMode = 'keyboard';
                    render();
                }, 2000);
            }
        }

        function stopCamera() {
            if (state.cameraStream) {
                state.cameraStream.getTracks().forEach(track => track.stop());
                state.cameraStream = null;
            }
            
            if (state.codeReader) {
                try {
                    state.codeReader.reset();
                } catch (e) {
                }
                state.codeReader = null;
            }

            const video = document.getElementById('cameraVideo');
            if (video) {
                video.srcObject = null;
            }

            state.isCameraActive = false;
        }

        function changeScanMode(mode) {
            if (state.scanMode === mode) return;
            
            const previousMode = state.scanMode;
            
            if (previousMode === 'camera' && mode !== 'camera') {
                stopCamera();
            }
            
            state.scanMode = mode;
            render();

            if (mode === 'camera' && previousMode !== 'camera') {
                setTimeout(() => {
                    startCamera();
                }, 400);
            }
        }

        function resetAll() {
            if (confirm('Voulez-vous vraiment réinitialiser ?')) {
                stopCamera();
                
                state = {
                    referenceOrders: [],
                    scannedOrders: new Set(),
                    unknownCodes: [],
                    ordersMap: {},
                    uploadedFiles: [],
                    currentView: 'import',
                    scanMode: 'keyboard',
                    scanInput: '',
                    lastScanned: '',
                    isProcessing: false,
                    dragActive: false,
                    isCameraActive: false,
                    isStartingCamera: false,
                    cameraStream: null,
                    codeReader: null,
                    scanBuffer: '',
                    lastKeyTime: 0,
                    continuousScan: true,
                    douchetteMode: true,
                    storeGroups: {},
                    scanQueue: []
                };
                showNotification('✅ Réinitialisé', 'success');
                render();
            }
        }

        function exportCSV() {
            const headers = ['Code Suivi', 'Statut', 'Type'];
            const rows = [];
            
            state.referenceOrders.forEach(code => {
                rows.push([
                    code,
                    state.scannedOrders.has(code) ? 'Scanné' : 'À scanner',
                    'Commande valide'
                ]);
            });
            
            state.unknownCodes.forEach(item => {
                rows.push([
                    item.code,
                    'Non trouvé',
                    'Code inconnu - ' + item.date + ' ' + item.time
                ]);
            });
            
            const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `commandes_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        }

        function render() {
            const totalOrders = state.referenceOrders.length;
            const totalScanned = state.scannedOrders.size;
            const totalRemaining = totalOrders - totalScanned;
            const progressPercent = totalOrders > 0 ? Math.round((totalScanned / totalOrders) * 100) : 0;
            const remainingOrders = state.referenceOrders.filter(code => !state.scannedOrders.has(code));

            const app = document.getElementById('app');
            app.innerHTML = `
                <div class="max-w-7xl mx-auto p-4">
                    <div class="bg-white rounded-3xl shadow-2xl p-6 mb-4 fade-in">
                        <h1 class="text-3xl font-black text-gray-800 mb-4 text-center">
                            🚀 DIGYLOG SCANNER
                        </h1>

                        ${state.referenceOrders.length > 0 ? `
                            <div class="flex gap-2 justify-center mb-6">
                                <button onclick="changeView('import')" class="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                                    state.currentView === 'import' 
                                        ? 'bg-purple-600 text-white scale-105' 
                                        : 'bg-gray-200 text-gray-700'
                                }">
                                    📁 Import
                                </button>
                                <button onclick="changeView('scan')" class="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                                    state.currentView === 'scan' 
                                        ? 'bg-blue-600 text-white scale-105' 
                                        : 'bg-gray-200 text-gray-700'
                                }">
                                    📸 Scanner
                                </button>
                            </div>

                            <div class="grid grid-cols-3 gap-3 mb-4">
                                <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white">
                                    <p class="text-xs font-medium mb-1">Total</p>
                                    <p class="text-3xl font-black">${totalOrders}</p>
                                </div>
                                <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 text-white">
                                    <p class="text-xs font-medium mb-1">Scannées</p>
                                    <p class="text-3xl font-black">${totalScanned}</p>
                                </div>
                                <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white">
                                    <p class="text-xs font-medium mb-1">Restantes</p>
                                    <p class="text-3xl font-black">${totalRemaining}</p>
                                </div>
                            </div>

                            <div class="bg-gray-200 rounded-full h-6 overflow-hidden mb-4">
                                <div class="bg-gradient-to-r from-green-400 to-green-600 h-full flex items-center justify-center text-white font-bold text-sm transition-all duration-500" style="width: ${progressPercent}%">
                                    ${progressPercent}%
                                </div>
                            </div>

                            <div class="flex gap-2 justify-center">
                                <button onclick="exportCSV()" class="px-4 py-2 bg-green-600 text-white rounded-xl font-bold">
                                    📥 Exporter
                                </button>
                                <button onclick="resetAll()" class="px-4 py-2 bg-red-600 text-white rounded-xl font-bold">
                                    🗑️ Réinitialiser
                                </button>
                            </div>
                        ` : ''}
                    </div>

                    ${state.currentView === 'import' ? `
                        <div class="bg-white rounded-3xl shadow-2xl p-6 fade-in">
                            <h2 class="text-2xl font-black text-gray-800 mb-4 text-center">
                                📁 IMPORT DE FICHIERS
                            </h2>

                            <div class="border-4 border-dashed border-gray-300 rounded-2xl p-8 text-center mb-4" 
                                 onclick="document.getElementById('fileInput').click()">
                                <div class="text-6xl mb-4">📤</div>
                                <p class="text-xl font-bold text-gray-700 mb-2">
                                    ${state.isProcessing ? 'Traitement...' : 'Cliquez pour importer'}
                                </p>
                                <p class="text-sm text-gray-500">PDF, CSV ou TXT</p>
                            </div>

                            <input type="file" id="fileInput" multiple accept=".pdf,.csv,.txt" class="hidden" 
                                   onchange="handleFileInput(event)">

                            <button onclick="loadSampleData()" 
                                    class="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg">
                                📦 Charger Exemple
                            </button>

                            ${state.uploadedFiles.length > 0 ? `
                                <div class="mt-6">
                                    <h3 class="text-lg font-bold text-gray-800 mb-3">
                                        📦 Fichiers importés (${state.uploadedFiles.length})
                                    </h3>
                                    ${state.uploadedFiles.map(file => `
                                        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4 mb-3 shadow-sm">
                                            <div class="flex items-start justify-between mb-2">
                                                <div class="flex-1">
                                                    <p class="font-semibold text-gray-800 text-sm mb-1 flex items-center gap-2">
                                                        <span class="text-blue-600">📄</span>
                                                        ${file.name}
                                                    </p>
                                                    <p class="text-xs text-gray-600">${file.count} commandes détectées</p>
                                                </div>
                                                <span class="text-green-600 text-2xl">✓</span>
                                            </div>
                                            ${file.expeditor && file.expeditor !== 'Non détecté' ? `
                                                <div class="mt-2 pt-2 border-t border-blue-200">
                                                    <p class="text-sm font-bold text-blue-800 flex items-center gap-2">
                                                        <span class="bg-blue-200 text-blue-900 px-3 py-1 rounded-full text-xs font-bold">
                                                            📮 Expéditeur
                                                        </span>
                                                        <span class="text-blue-900">${file.expeditor}</span>
                                                    </p>
                                                </div>
                                            ` : ''}
                                        </div>
                                    `).join('')}
                                    
                                    ${Object.keys(state.storeGroups).length > 0 ? `
                                        <div class="mt-4 bg-purple-50 border-2 border-purple-300 rounded-xl p-4">
                                            <p class="font-bold text-purple-800 mb-3 flex items-center gap-2">
                                                <span class="text-2xl">📊</span>
                                                Répartition par expéditeur
                                            </p>
                                            <div class="space-y-2">
                                                ${Object.entries(state.storeGroups)
                                                    .sort((a, b) => b[1].length - a[1].length)
                                                    .map(([store, orders]) => {
                                                        const scanned = orders.filter(o => state.scannedOrders.has(o.tracking)).length;
                                                        const remaining = orders.length - scanned;
                                                        const percent = Math.round((scanned / orders.length) * 100);
                                                        
                                                        return `
                                                            <div class="bg-white rounded-lg p-3 border-2 border-purple-200">
                                                                <div class="flex justify-between items-center mb-2">
                                                                    <span class="text-purple-900 font-bold text-base flex items-center gap-2">
                                                                        <span class="bg-purple-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-black">
                                                                            ${orders.length}
                                                                        </span>
                                                                        ${store}
                                                                    </span>
                                                                    <span class="text-purple-700 text-sm font-semibold">
                                                                        ${scanned}/${orders.length}
                                                                    </span>
                                                                </div>
                                                                <div class="bg-gray-200 rounded-full h-2 overflow-hidden">
                                                                    <div class="bg-gradient-to-r from-purple-400 to-purple-600 h-full transition-all duration-500" style="width: ${percent}%"></div>
                                                                </div>
                                                                <div class="flex justify-between text-xs text-purple-600 mt-1">
                                                                    <span>✅ ${scanned} scannés</span>
                                                                    <span>⏳ ${remaining} restants</span>
                                                                </div>
                                                            </div>
                                                        `;
                                                    }).join('')}
                                            </div>
                                            <div class="mt-3 pt-3 border-t-2 border-purple-300">
                                                <div class="flex justify-between items-center">
                                                    <span class="text-purple-900 font-bold">Total général</span>
                                                    <span class="bg-purple-500 text-white px-4 py-2 rounded-full font-black">
                                                        ${state.referenceOrders.length} tickets
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ` : ''}
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}

                    ${state.currentView === 'scan' && state.referenceOrders.length > 0 ? `
                        <div class="bg-white rounded-3xl shadow-2xl p-6 mb-4 fade-in">
                            <h2 class="text-2xl font-black text-gray-800 mb-6 text-center">
                                📸 ZONE DE SCAN
                            </h2>

                            <div class="flex gap-2 justify-center mb-6">
                                <button onclick="changeScanMode('keyboard')" class="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                                    state.scanMode === 'keyboard' 
                                        ? 'bg-blue-600 text-white scale-105' 
                                        : 'bg-gray-200 text-gray-700'
                                }">
                                    ⌨️ Clavier
                                </button>
                                <button onclick="changeScanMode('camera')" class="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                                    state.scanMode === 'camera' 
                                        ? 'bg-blue-600 text-white scale-105' 
                                        : 'bg-gray-200 text-gray-700'
                                }">
                                    📷 Caméra
                                </button>
                            </div>

                            ${state.scanMode === 'keyboard' ? `
                                ${state.douchetteMode ? `
                                    <div class="bg-green-50 border-2 border-green-500 rounded-xl p-4 mb-4">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center gap-3">
                                                <div class="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl">
                                                    🔌
                                                </div>
                                                <div>
                                                    <p class="font-bold text-green-800">Mode douchette activé</p>
                                                    <p class="text-sm text-green-700">Scan automatique - Android optimisé</p>
                                                </div>
                                            </div>
                                            <button onclick="toggleDouchetteMode()" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-bold text-sm">
                                                Désactiver
                                            </button>
                                        </div>
                                    </div>
                                ` : `
                                    <div class="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 mb-4">
                                        <p class="text-center text-blue-800 mb-2">
                                            💡 <strong>Conseil :</strong> Activez le mode douchette pour des scans en chaîne plus rapides
                                        </p>
                                        <button onclick="toggleDouchetteMode()" class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">
                                            Activer le mode douchette
                                        </button>
                                    </div>
                                `}

                                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border-4 border-blue-500 rounded-2xl p-8 mb-4">
                                    <div class="flex items-center justify-center gap-3 mb-4">
                                        <div class="text-6xl">📦</div>
                                        <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    </div>
                                    <p class="text-xl font-bold text-gray-700 mb-2 text-center">
                                        ${state.douchetteMode ? '🔌 Douchette prête' : 'Scannez directement !'}
                                    </p>
                                    <p class="text-sm text-gray-600 mb-4 text-center">
                                        Le code s'affichera ici automatiquement
                                    </p>
                                    <input 
                                        type="text" 
                                        id="scanInput"
                                        value="${state.scanInput}"
                                        placeholder="${state.douchetteMode ? '🎯 Scan ultra-rapide...' : 'Prêt à scanner...'}"
                                        class="w-full px-6 py-4 text-2xl font-mono font-bold text-center border-4 border-blue-400 rounded-xl focus:border-blue-600 focus:outline-none bg-white"
                                        autocomplete="off"
                                        readonly
                                    >
                                    <div class="mt-6 bg-green-100 border-2 border-green-500 rounded-lg p-4">
                                        <p class="text-green-800 font-bold text-center">
                                            ✅ Détection ${state.douchetteMode ? 'ultra-rapide' : ''} activée
                                        </p>
                                        <p class="text-green-700 text-sm text-center mt-2">
                                            ${state.douchetteMode 
                                                ? '🚀 Mode optimisé Android - Scannez en continu' 
                                                : 'Scannez n\'importe où - Détection automatique'}
                                        </p>
                                    </div>
                                    <div class="mt-4 bg-purple-50 border-2 border-purple-300 rounded-lg p-3">
                                        <p class="text-purple-800 text-sm text-center font-bold">
                                            🎵 SONS MAGNIFIQUES ACTIVÉS ✨
                                        </p>
                                        <p class="text-purple-700 text-xs text-center mt-1">
                                            Succès: Do-Mi-Sol | Doublon: La-Fa | Erreur: Mi-Ré-Do
                                        </p>
                                    </div>
                                </div>
                            ` : ''}

                            ${state.scanMode === 'camera' ? `
                                <div class="bg-purple-50 border-2 border-purple-500 rounded-xl p-4 mb-4">
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-3">
                                            <div class="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl">
                                                📹
                                            </div>
                                            <div>
                                                <p class="font-bold text-purple-800">Scan continu ${state.continuousScan ? 'activé' : 'désactivé'}</p>
                                                <p class="text-sm text-purple-700">Détection automatique sans rechargement</p>
                                            </div>
                                        </div>
                                        <button onclick="toggleContinuousScan()" class="px-4 py-2 ${state.continuousScan ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg font-bold text-sm">
                                            ${state.continuousScan ? 'Désactiver' : 'Activer'}
                                        </button>
                                    </div>
                                </div>

                                <div class="relative bg-black rounded-2xl overflow-hidden mb-4" style="aspect-ratio: 4/3;">
                                    <video 
                                        id="cameraVideo" 
                                        autoplay 
                                        playsinline 
                                        class="w-full h-full"
                                    ></video>
                                    <div class="viewfinder">
                                        <div class="corner corner-tl"></div>
                                        <div class="corner corner-tr"></div>
                                        <div class="corner corner-bl"></div>
                                        <div class="corner corner-br"></div>
                                        <div class="absolute w-full h-1 bg-green-500 opacity-75 scan-line"></div>
                                    </div>
                                    <div class="absolute top-4 left-4 right-4">
                                        <div id="detectedCode" class="hidden"></div>
                                    </div>
                                    ${!state.isCameraActive ? `
                                        <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
                                            <div class="text-white text-center">
                                                <div class="text-6xl mb-4 animate-pulse">📷</div>
                                                <p class="text-xl font-bold">Activation de la caméra...</p>
                                                <p class="text-sm mt-2">Autorisez l'accès si demandé</p>
                                            </div>
                                        </div>
                                    ` : `
                                        <div class="absolute bottom-4 left-0 right-0 text-center">
                                            <div class="bg-green-500 text-white px-4 py-2 rounded-full inline-block font-bold text-sm">
                                                🎥 Scan continu actif - Mode ultra-rapide
                                            </div>
                                        </div>
                                    `}
                                </div>
                                <div class="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 mb-4 text-center">
                                    <p class="text-sm text-blue-800">
                                        💡 <strong>Aide :</strong> Positionnez le code-barres dans le cadre vert pour une détection optimale
                                    </p>
                                </div>
                            ` : ''}

                            ${state.lastScanned ? `
                                <div class="bg-green-100 border-2 border-green-500 rounded-xl p-4 text-center fade-in">
                                    <p class="text-green-800 font-bold text-lg">
                                        Dernier: <span class="font-mono">${state.lastScanned}</span>
                                    </p>
                                </div>
                            ` : ''}
                        </div>

                        ${remainingOrders.length > 0 ? `
                            <div class="bg-white rounded-3xl shadow-2xl p-6 fade-in">
                                <h2 class="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                                    ⚠️ Restantes (${remainingOrders.length})
                                </h2>
                                <div class="grid grid-cols-2 gap-2">
                                    ${remainingOrders.map(code => `
                                        <div class="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-3 text-center">
                                            <p class="font-mono font-bold text-base">${code}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : `
                            <div class="bg-gradient-to-br from-green-400 to-green-500 rounded-3xl shadow-2xl p-12 text-center text-white fade-in">
                                <div class="text-8xl mb-4">🎉</div>
                                <h2 class="text-4xl font-black mb-2">TERMINÉ !</h2>
                                <p class="text-xl font-bold">Toutes les commandes scannées</p>
                            </div>
                        `}

                        ${state.unknownCodes.length > 0 ? `
                            <div class="bg-white rounded-3xl shadow-2xl p-6 mt-4 fade-in border-4 border-red-500">
                                <div class="flex items-center justify-between mb-4">
                                    <h2 class="text-xl font-black text-red-800 flex items-center gap-2">
                                        ❌ Codes Non Trouvés (${state.unknownCodes.length})
                                    </h2>
                                    <button onclick="clearUnknownCodes()" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm">
                                        Effacer tout
                                    </button>
                                </div>
                                <p class="text-sm text-red-700 mb-4">
                                    Ces codes ont été scannés mais ne figurent pas dans votre liste importée
                                </p>
                                <div class="space-y-2">
                                    ${state.unknownCodes.map((item, index) => `
                                        <div class="bg-red-50 border-2 border-red-300 rounded-xl p-4 flex items-center justify-between">
                                            <div class="flex items-center gap-4">
                                                <div class="bg-red-200 text-red-900 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                                                    ${index + 1}
                                                </div>
                                                <div>
                                                    <p class="font-mono font-bold text-lg text-red-900">${item.code}</p>
                                                    <p class="text-xs text-red-700">Scanné le ${item.date} à ${item.time}</p>
                                                </div>
                                            </div>
                                            <button onclick="removeUnknownCode('${item.code}')" class="text-red-600 hover:text-red-800 font-bold">
                                                ✕
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    ` : ''}
                </div>
            `;

            if (state.currentView === 'scan' && state.scanMode === 'keyboard') {
                setTimeout(() => {
                    const input = document.getElementById('scanInput');
                    if (input) input.focus();
                }, 100);
            }
        }

        function removeUnknownCode(code) {
            state.unknownCodes = state.unknownCodes.filter(item => item.code !== code);
            showNotification('✅ Code supprimé', 'success');
            render();
        }

        function clearUnknownCodes() {
            if (confirm('Effacer tous les codes non trouvés ?')) {
                state.unknownCodes = [];
                showNotification('✅ Liste effacée', 'success');
                render();
            }
        }

        function toggleDouchetteMode() {
            state.douchetteMode = !state.douchetteMode;
            if (state.douchetteMode) {
                showNotification('✅ Mode douchette activé - Débit maximal', 'success');
            } else {
                showNotification('ℹ️ Mode douchette désactivé', 'warning');
            }
            render();
        }

        function toggleContinuousScan() {
            state.continuousScan = !state.continuousScan;
            if (state.continuousScan) {
                showNotification('✅ Scan continu activé - La caméra reste active', 'success');
            } else {
                showNotification('⏸️ Scan continu désactivé - Scan manuel uniquement', 'warning');
            }
            render();
        }

        function changeView(view) {
            if (view !== state.currentView) {
                const wasCameraActive = state.scanMode === 'camera' && state.isCameraActive;
                
                if (wasCameraActive) {
                    stopCamera();
                }
            }
            state.currentView = view;
            render();
        }

        function handleFileInput(event) {
            handleFiles(event.target.files);
        }

        window.addEventListener('load', () => {
            initBarcodeScanner();
            render();
        });

        window.addEventListener('beforeunload', () => {
            stopCamera();
        });
    </script>
</body>
</html>

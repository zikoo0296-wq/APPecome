// ===================================
// Gestion des fichiers importés
// ===================================

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
            
            if (file.type === 'application/pdf') {
                const arrayBuffer = await file.arrayBuffer();
                const text = await extractTextFromPDF(arrayBuffer);
                orders = extractOrdersWithDetails(text);
            } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                const text = await file.text();
                const codes = text.split(/[\n,]/).map(code => code.trim()).filter(code => /[A-Z]\d{7}[A-Z]{2}/.test(code));
                const uniqueCodes = [...new Set(codes)];
                orders = uniqueCodes.map(code => ({
                    tracking: code,
                    barcode: code,
                    store_name: "",
                    store_full: "",
                    quantity: "",
                    product_name: "",
                    price: "",
                    destination_city: "",
                    receiver_name: "",
                    scanned: false,
                    id: Date.now() + Math.random()
                }));
            } else if (file.type === 'text/plain') {
                const text = await file.text();
                const codes = text.split(/[\n,\s]/).map(code => code.trim()).filter(code => /[A-Z]\d{7}[A-Z]{2}/.test(code));
                const uniqueCodes = [...new Set(codes)];
                orders = uniqueCodes.map(code => ({
                    tracking: code,
                    barcode: code,
                    store_name: "",
                    store_full: "",
                    quantity: "",
                    product_name: "",
                    price: "",
                    destination_city: "",
                    receiver_name: "",
                    scanned: false,
                    id: Date.now() + Math.random()
                }));
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
            processedFiles.push({ name: file.name, count: newOrders.length });
        } catch (error) {
            console.error(`Erreur avec ${file.name}:`, error);
        }
    }

    const storeGroups = {};
    const ordersMap = {};
    
    allOrders.forEach(order => {
        const store = order.store_full || order.store_name || 'Non identifié';
        if (!storeGroups[store]) {
            storeGroups[store] = [];
        }
        storeGroups[store].push(order);
        ordersMap[order.tracking] = order;
    });

    state.storeGroups = storeGroups;
    state.ordersMap = ordersMap;
    state.referenceOrders = allOrders.map(o => o.tracking);
    state.uploadedFiles = processedFiles;
    state.isProcessing = false;
    
    const totalCodes = allOrders.length;
    const storeCount = Object.keys(storeGroups).length;
    showNotification(`✅ ${totalCodes} commandes uniques importées de ${storeCount} expéditeur(s)`, 'success');
    
    console.log('📦 Données extraites:', { total: allOrders.length, orders: allOrders, stores: storeGroups });
    render();
}

// ===================================
// Gestion du scan
// ===================================

function handleScan(code) {
    const cleanCode = code.trim().toUpperCase();
    
    if (!cleanCode || !/[A-Z]\d{7}[A-Z]{2}/.test(cleanCode)) {
        return;
    }

    if (state.scannedOrders.has(cleanCode)) {
        const orderInfo = state.ordersMap[cleanCode];
        const expediteur = orderInfo ? (orderInfo.store_full || orderInfo.store_name || 'Inconnu') : 'Inconnu';
        showNotification(`⚠️ Déjà scanné | Expéditeur: ${expediteur}`, 'warning');
        state.lastScanned = cleanCode;
        playSound('duplicate');
        updateCountersOnly();
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
        
        showNotification('❌ Identifiant non trouvé - Ajouté aux codes inconnus', 'error');
        playSound('error');
        render();
        return;
    }

    state.scannedOrders.add(cleanCode);
    state.lastScanned = cleanCode;
    
    const orderInfo = state.ordersMap[cleanCode];
    const expediteur = orderInfo ? (orderInfo.store_full || orderInfo.store_name || 'Inconnu') : 'Inconnu';
    
    showNotification(`✅ Scanné | Expéditeur: ${expediteur}`, 'success');
    playSound('success');
    
    updateCountersOnly();
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

// ===================================
// Scanner de codes-barres
// ===================================

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
                    if (input) input.value = buffer;
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
                handleScan(buffer);
                const input = document.getElementById('scanInput');
                if (input) input.value = buffer;
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

// Suite: Caméra, Render, Event handlers...
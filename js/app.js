document.addEventListener('DOMContentLoaded', () => {
    // State
    let participants = [];
    let exclusions = []; // Array of { giver: "Name", receiver: "Name" }
    let generatedPairs = [];
    let currentPassIndex = 0;
    // Pagination state for participants list
    let currentPage = 1;
    let pageSize = 50;

    // DOM Elements
    const sections = {
        hero: document.getElementById('hero-section'),
        setup: document.getElementById('setup-section'),
        result: document.getElementById('result-section')
    };

    const buttons = {
        start: document.getElementById('start-btn'),
        add: document.getElementById('add-btn'),
        draw: document.getElementById('draw-btn'),
        reset: document.getElementById('reset-btn'),
        viewList: document.getElementById('view-list-btn'),
        viewPass: document.getElementById('view-pass-btn'),
        reveal: document.getElementById('reveal-btn'),
        nextPerson: document.getElementById('next-person-btn'),
        toggleImport: document.getElementById('toggle-import-btn'),
        import: document.getElementById('import-btn'),
        toggleExclusions: document.getElementById('toggle-exclusions-btn'),
        addExclusion: document.getElementById('add-exclusion-btn')
    };

    const inputs = {
        name: document.getElementById('participant-name'),
        importText: document.getElementById('import-text'),
        exclusionGiver: document.getElementById('exclusion-giver'),
        exclusionReceiver: document.getElementById('exclusion-receiver')
    };

    const lists = {
        participants: document.getElementById('participants-list'),
        resultsGrid: document.getElementById('results-grid'),
        exclusions: document.getElementById('exclusions-list')
    };

    const areas = {
        import: document.getElementById('import-area'),
        exclusions: document.getElementById('exclusions-area')
    };

    const views = {
        list: document.getElementById('results-list-container'),
        pass: document.getElementById('pass-device-container')
    };

    const passElements = {
        card: document.getElementById('pass-card'),
        step1: document.querySelector('.step-1'),
        step2: document.querySelector('.step-2'),
        step3: document.querySelector('.step-3'),
        currentPlayer: document.getElementById('current-player-name'),
        targetName: document.getElementById('target-name')
    };

    // --- Initialization ---
    loadData();

    // --- Navigation ---
    function switchSection(from, to) {
        from.classList.remove('active-section');
        from.classList.add('hidden-section');

        setTimeout(() => {
            from.style.display = 'none';
            to.style.display = 'block';
            void to.offsetWidth;
            to.classList.remove('hidden-section');
            to.classList.add('active-section');
        }, 500);
    }

    // --- Event Listeners ---
    if (buttons.start) {
        buttons.start.addEventListener('click', () => {
            switchSection(sections.hero, sections.setup);
        });
    }

    if (buttons.add) {
        buttons.add.addEventListener('click', addParticipant);
    }

    if (inputs.name) {
        inputs.name.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addParticipant();
        });
    }

    // Import Toggles
    if (buttons.toggleImport) {
        buttons.toggleImport.addEventListener('click', () => {
            areas.import.classList.toggle('visible');
        });
    }

    if (buttons.import) {
        buttons.import.addEventListener('click', importParticipants);
    }

    // Exclusion Toggles
    if (buttons.toggleExclusions) {
        buttons.toggleExclusions.addEventListener('click', () => {
            areas.exclusions.classList.toggle('visible');
        });
    }

    if (buttons.addExclusion) {
        buttons.addExclusion.addEventListener('click', addExclusion);
    }

    if (buttons.draw) {
        buttons.draw.addEventListener('click', () => {
            if (participants.length < 3) {
                alert('You need at least 3 participants for a Secret Santa!');
                return;
            }

            try {
                generatedPairs = generatePairs([...participants], exclusions);
                displayResultsList(generatedPairs);
                resetPassMode();
                switchSection(sections.setup, sections.result);
            } catch (e) {
                alert(e.message);
            }
        });
    }

    // Export handlers
    const exportJSONBtn = document.getElementById('export-json-btn');
    const exportCSVBtn = document.getElementById('export-csv-btn');

    function downloadBlob(filename, content, type){
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    function exportJSON(){
        if (!generatedPairs || generatedPairs.length === 0) { alert('No results to export.'); return; }
        const content = JSON.stringify(generatedPairs, null, 2);
        downloadBlob('secret-santa-results.json', content, 'application/json');
    }

    function exportCSV(){
        if (!generatedPairs || generatedPairs.length === 0) { alert('No results to export.'); return; }
        const header = 'Giver,Receiver\n';
        const rows = generatedPairs.map(p => `"${p.giver.replace(/"/g, '""')}","${p.receiver.replace(/"/g, '""') }"`).join('\n');
        downloadBlob('secret-santa-results.csv', header + rows, 'text/csv');
    }

    exportJSONBtn && exportJSONBtn.addEventListener('click', exportJSON);
    exportCSVBtn && exportCSVBtn.addEventListener('click', exportCSV);

    if (buttons.reset) {
        buttons.reset.addEventListener('click', () => {
            // Force reset of display properties to ensure Hero is visible
            sections.result.classList.remove('active-section');
            sections.result.classList.add('hidden-section');

            setTimeout(() => {
                sections.result.style.display = 'none';
                sections.setup.style.display = 'none';
                sections.hero.style.display = 'block';

                void sections.hero.offsetWidth;

                sections.hero.classList.remove('hidden-section');
                sections.hero.classList.add('active-section');

                // Reset internal state if needed
                participants = [];
                exclusions = [];
                generatedPairs = [];
                renderParticipants();
                renderExclusions();
                updateDrawButton();
            }, 500);
        });
    }

    // View Toggles
    if (buttons.viewList) {
        buttons.viewList.addEventListener('click', () => {
            buttons.viewList.classList.add('active');
            buttons.viewPass.classList.remove('active');
            views.list.classList.add('active-view');
            views.list.classList.remove('hidden-view');
            views.pass.classList.remove('active-view');
            views.pass.classList.add('hidden-view');
        });
    }

    if (buttons.viewPass) {
        buttons.viewPass.addEventListener('click', () => {
            buttons.viewPass.classList.add('active');
            buttons.viewList.classList.remove('active');
            views.pass.classList.add('active-view');
            views.pass.classList.remove('hidden-view');
            views.list.classList.remove('active-view');
            views.list.classList.add('hidden-view');
            startPassMode();
        });
    }

    // Keyboard shortcuts for pass-device mode: Enter to reveal, Space to move next
    document.addEventListener('keydown', (e) => {
        const activeInput = document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA' || document.activeElement.isContentEditable);
        if (activeInput) return; // avoid interfering while typing

        if (views.pass.classList.contains('active-view')){
            if (e.key === 'Enter') {
                // Reveal
                if (!passElements.step2.classList.contains('hidden-step')) return;
                buttons.reveal && buttons.reveal.click();
            }
            if (e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                // Next person
                if (buttons.nextPerson) buttons.nextPerson.click();
            }
        }
    });

    // Pass Mode Controls
    if (buttons.reveal) {
        buttons.reveal.addEventListener('click', () => {
            passElements.step1.classList.add('hidden-step');
            passElements.step2.classList.remove('hidden-step');
        });
    }

    if (buttons.nextPerson) {
        buttons.nextPerson.addEventListener('click', () => {
            currentPassIndex++;
            if (currentPassIndex < generatedPairs.length) {
                showPassStep1();
            } else {
                showPassFinished();
            }
        });
    }

    // --- Logic ---

    // Persistence
    function loadData() {
        const storedParticipants = localStorage.getItem('secret_santa_participants');
        if (storedParticipants) {
            participants = JSON.parse(storedParticipants);
            currentPage = 1;
            renderParticipants();
            updateDrawButton();
            updateExclusionDropdowns();
        }

        const storedExclusions = localStorage.getItem('secret_santa_exclusions');
        if (storedExclusions) {
            exclusions = JSON.parse(storedExclusions);
            renderExclusions();
        }
    }

    function saveData() {
        localStorage.setItem('secret_santa_participants', JSON.stringify(participants));
        localStorage.setItem('secret_santa_exclusions', JSON.stringify(exclusions));
    }

    function addParticipant() {
        const name = inputs.name.value.trim();
        if (!name) return;

        // Case-insensitive duplicate check
        const exists = participants.some(p => p.toLowerCase() === name.toLowerCase());
        if (exists) {
            alert('Name already exists!');
            return;
        }

        participants.push(name);
        inputs.name.value = '';
        saveData();
        renderParticipants();
        updateDrawButton();
        updateExclusionDropdowns();
    }

    function importParticipants() {
        const text = inputs.importText.value;
        const names = text.split('\n').map(n => n.trim()).filter(n => n.length > 0);

        let addedCount = 0;
        names.forEach(name => {
            // case-insensitive check
            const exists = participants.some(p => p.toLowerCase() === name.toLowerCase());
            if (!exists) {
                participants.push(name);
                addedCount++;
            }
        });

        if (addedCount > 0) {
            inputs.importText.value = '';
            saveData();
            renderParticipants();
            updateDrawButton();
            updateExclusionDropdowns();
            alert(`Added ${addedCount} participants.`);
            areas.import.classList.remove('visible');
        } else {
            alert('No new names found.');
        }
    }

    function removeParticipant(index) {
        const name = participants[index];
        participants.splice(index, 1);

        // Remove related exclusions
        exclusions = exclusions.filter(ex => ex.giver !== name && ex.receiver !== name);

        saveData();
        renderParticipants();
        renderExclusions();
        updateDrawButton();
        updateExclusionDropdowns();
    }

    function renderParticipants() {
        lists.participants.innerHTML = '';
        // Pagination
        const total = participants.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;
        const start = (currentPage - 1) * pageSize;
        const end = Math.min(total, start + pageSize);
        const displayStart = total === 0 ? 0 : start + 1;
        const displayEnd = total === 0 ? 0 : end;

        for (let i = start; i < end; i++){
            const name = participants[i];
            const li = document.createElement('li');
            li.className = 'list-item';
            // store absolute index
            li.innerHTML = `
                <span>${name}</span>
                <button class="delete-btn" data-index="${i}">&times;</button>
            `;
            lists.participants.appendChild(li);
        }

        // Update pagination info
        const info = document.getElementById('pagination-info');
        if (info) info.textContent = `Showing ${displayStart}-${displayEnd} of ${total}`;

        // Update prev/next disabled state
        const prev = document.getElementById('page-prev');
        const next = document.getElementById('page-next');
        if (prev) prev.disabled = currentPage <= 1;
        if (next) next.disabled = currentPage >= totalPages;

        document.querySelectorAll('#participants-list .delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                removeParticipant(idx);
            });
        });
    }

    // Pagination controls
    const pagePrevBtn = document.getElementById('page-prev');
    const pageNextBtn = document.getElementById('page-next');
    const pageSizeSelect = document.getElementById('page-size');
    if (pagePrevBtn) pagePrevBtn.addEventListener('click', () => { if (currentPage>1){ currentPage--; renderParticipants(); }});
    if (pageNextBtn) pageNextBtn.addEventListener('click', () => { currentPage++; renderParticipants(); });
    if (pageSizeSelect) pageSizeSelect.addEventListener('change', (e) => { pageSize = parseInt(e.target.value,10); currentPage = 1; renderParticipants(); });

    function updateExclusionDropdowns() {
        const populate = (select) => {
            select.innerHTML = '';
            participants.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p;
                opt.textContent = p;
                select.appendChild(opt);
            });
        };
        populate(inputs.exclusionGiver);
        populate(inputs.exclusionReceiver);
    }

    function addExclusion() {
        const giver = inputs.exclusionGiver.value;
        const receiver = inputs.exclusionReceiver.value;

        if (!giver || !receiver) return;
        if (giver === receiver) {
            alert("A person cannot be excluded from themselves (that's automatic).");
            return;
        }

        const exists = exclusions.some(ex => ex.giver === giver && ex.receiver === receiver);
        if (exists) return;

        exclusions.push({ giver, receiver });
        saveData();
        renderExclusions();
    }

    function removeExclusion(index) {
        exclusions.splice(index, 1);
        saveData();
        renderExclusions();
    }

    function renderExclusions() {
        lists.exclusions.innerHTML = '';
        exclusions.forEach((ex, index) => {
            const li = document.createElement('li');
            li.className = 'list-item';
            li.innerHTML = `
                <span>${ex.giver} ↛ ${ex.receiver}</span>
                <button class="delete-btn" data-index="${index}">&times;</button>
            `;
            lists.exclusions.appendChild(li);
        });

        document.querySelectorAll('#exclusions-list .delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.dataset.index);
                removeExclusion(idx);
            });
        });
    }

    function updateDrawButton() {
        buttons.draw.disabled = participants.length < 3;
    }

    // Use the deterministic backtracking pairer provided in js/pairing.js (exposed as generatePairs)
    // pairing.js will throw an Error with guidance when no valid matching exists.

    // Results Display
    function displayResultsList(pairs) {
        lists.resultsGrid.innerHTML = '';
        pairs.forEach(pair => {
            const card = document.createElement('div');
            card.className = 'result-card fade-in';
            card.innerHTML = `
                <button class="copy-btn" title="Copy result">Copy</button>
                <span class="giver">${pair.giver} is buying for</span>
                <span class="receiver">${pair.receiver}</span>
            `;

            // Share Logic
            const copyBtn = card.querySelector('.copy-btn');
            copyBtn.addEventListener('click', () => {
                const text = `Hi ${pair.giver}! You are the Secret Santa for ${pair.receiver} 🤫`;
                navigator.clipboard.writeText(text).then(() => {
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => copyBtn.textContent = 'Copy', 2000);
                });
            });

            lists.resultsGrid.appendChild(card);
        });
        // Store for exports
        generatedPairs = pairs;
    }

    // Pass Mode Logic
    function resetPassMode() {
        currentPassIndex = 0;
        passElements.step1.classList.remove('hidden-step');
        passElements.step2.classList.add('hidden-step');
        passElements.step3.classList.add('hidden-step');
    }

    function startPassMode() {
        if (currentPassIndex >= generatedPairs.length) {
            showPassFinished();
        } else {
            showPassStep1();
        }
    }

    function showPassStep1() {
        const pair = generatedPairs[currentPassIndex];
        passElements.currentPlayer.textContent = pair.giver;
        passElements.targetName.textContent = pair.receiver;

        passElements.step1.classList.remove('hidden-step');
        passElements.step2.classList.add('hidden-step');
        passElements.step3.classList.add('hidden-step');
    }

    function showPassFinished() {
        passElements.step1.classList.add('hidden-step');
        passElements.step2.classList.add('hidden-step');
        passElements.step3.classList.remove('hidden-step');
    }
});

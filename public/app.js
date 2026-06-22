document.addEventListener('DOMContentLoaded', () => {

    // --- 1. THEME TOGGLE (Dark Mode) ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlEl = document.documentElement;

    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlEl.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        htmlEl.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.classList.remove('ph-moon');
            themeIcon.classList.add('ph-sun');
        } else {
            themeIcon.classList.remove('ph-sun');
            themeIcon.classList.add('ph-moon');
        }
    }

    // --- 2. SCROLL SPY & TAB NAVIGATION ---
    const sections = document.querySelectorAll('main#beranda, section#tools-section');
    const navLinks = document.querySelectorAll('.nav-links a');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Scroll Spy for main sections
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // Tab Switching Logic
    function switchTab(tabId) {
        // Update Buttons
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabId) btn.classList.add('active');
        });

        // Update Content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) content.classList.add('active');
        });
    }

    // Event listener for tab buttons
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Event listener for navbar links pointing to specific tabs
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetTab = link.dataset.targetTab;
            if (targetTab) {
                switchTab(targetTab);
            }
        });
    });

    // --- 3. COMMON GRADE DATA ---
    const gradePoints = {
        'A': 4.00, 'A-': 3.50, 'B+': 3.25, 'B': 3.00,
        'B-': 2.75, 'C+': 2.50, 'C': 2.00, 'D': 1.00, 'E': 0.00
    };

    const getGradeOptions = (includeUnknown = false) => {
        let options = '<option value="" disabled selected>Pilih Nilai</option>';
        if (includeUnknown) {
            options += '<option value="unknown">Belum Keluar</option>';
        }
        for (const [grade, point] of Object.entries(gradePoints)) {
            options += `<option value="${point}">${grade}</option>`;
        }
        return options;
    };

    const getSksOptions = () => {
        let options = '<option value="" disabled selected>SKS</option>';
        for (let i = 1; i <= 6; i++) {
            options += `<option value="${i}">${i} SKS</option>`;
        }
        return options;
    };

    // --- 4. KALKULATOR IPS LOGIC ---
    const courseList = document.getElementById('course-list');

    const addCourseRow = () => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" placeholder="Contoh: Algoritma & Pemrograman" class="course-name"></td>
            <td><select class="course-sks">${getSksOptions()}</select></td>
            <td><select class="course-grade">${getGradeOptions()}</select></td>
            <td><button class="btn-icon delete-row-btn" aria-label="Hapus"><i class="ph ph-trash"></i></button></td>
        `;
        courseList.appendChild(tr);
        tr.querySelector('.delete-row-btn').addEventListener('click', () => tr.remove());
    };

    for (let i = 0; i < 3; i++) addCourseRow();
    document.getElementById('add-course-btn').addEventListener('click', addCourseRow);

    document.getElementById('calculate-btn').addEventListener('click', () => {
        const rows = courseList.querySelectorAll('tr');
        let totalSks = 0; let totalBobot = 0;
        rows.forEach(row => {
            const sks = parseInt(row.querySelector('.course-sks').value);
            const grade = parseFloat(row.querySelector('.course-grade').value);
            if (!isNaN(sks) && !isNaN(grade)) {
                totalSks += sks;
                totalBobot += (sks * grade);
            }
        });
        const ips = totalSks > 0 ? (totalBobot / totalSks) : 0;
        document.getElementById('total-sks-result').textContent = totalSks;
        document.getElementById('ips-result').textContent = ips.toFixed(2);
    });

    // --- 5. SIMULASI NILAI LOGIC ---
    const simCourseList = document.getElementById('sim-course-list');

    const addSimCourseRow = () => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="text" placeholder="Mata Kuliah" class="sim-course-name"></td>
            <td><select class="sim-course-sks">${getSksOptions()}</select></td>
            <td><select class="sim-course-grade">${getGradeOptions(true)}</select></td>
            <td><button class="btn-icon delete-row-btn"><i class="ph ph-trash"></i></button></td>
        `;
        simCourseList.appendChild(tr);
        tr.querySelector('.delete-row-btn').addEventListener('click', () => {
            tr.remove();
            calculateSimulasi(); // Auto recalc
        });
        // Auto recalc on change
        tr.querySelectorAll('select').forEach(el => el.addEventListener('change', calculateSimulasi));
    };

    for (let i = 0; i < 3; i++) addSimCourseRow();
    document.getElementById('sim-add-course-btn').addEventListener('click', addSimCourseRow);

    function calculateSimulasi() {
        const rows = simCourseList.querySelectorAll('tr');
        let knownSks = 0;
        let knownBobot = 0;
        let unknownSks = 0;

        rows.forEach(row => {
            const sks = parseInt(row.querySelector('.sim-course-sks').value);
            const gradeVal = row.querySelector('.sim-course-grade').value;

            if (!isNaN(sks)) {
                if (gradeVal === 'unknown') {
                    unknownSks += sks;
                } else if (gradeVal !== "") {
                    const gradePoint = parseFloat(gradeVal);
                    knownSks += sks;
                    knownBobot += (sks * gradePoint);
                }
            }
        });

        const resultsContainer = document.getElementById('scenario-results');

        if (unknownSks === 0 && knownSks === 0) {
            resultsContainer.innerHTML = '<div class="scenario-box">Isi data di atas untuk melihat skenario.</div>';
            return;
        }

        if (unknownSks === 0 && knownSks > 0) {
            const ips = knownBobot / knownSks;
            resultsContainer.innerHTML = `
                <div class="scenario-box" style="grid-column: 1 / -1;">
                    <span class="sc-ips">Semua nilai sudah diketahui. IPS Anda: <strong style="color:var(--primary);">${ips.toFixed(2)}</strong></span>
                </div>`;
            return;
        }

        // Hitung skenario
        let html = '';
        const gradesToSimulate = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D'];

        gradesToSimulate.forEach(grade => {
            const point = gradePoints[grade];
            const totalSksAll = knownSks + unknownSks;
            const totalBobotAll = knownBobot + (unknownSks * point);
            const scenarioIps = totalBobotAll / totalSksAll;

            html += `
                <div class="scenario-box">
                    <span class="sc-grade">${grade}</span>
                    <span class="sc-ips">IPS: ${scenarioIps.toFixed(2)}</span>
                </div>
            `;
        });

        resultsContainer.innerHTML = html;
    }

    // --- 6. PREDIKSI IPK LOGIC ---
    document.getElementById('btn-prediksi').addEventListener('click', () => {
        const ipkLama = parseFloat(document.getElementById('pred-ipk-lama').value);
        const sksLama = parseInt(document.getElementById('pred-sks-lama').value);
        const ipsBaru = parseFloat(document.getElementById('pred-ips-baru').value);
        const sksBaru = parseInt(document.getElementById('pred-sks-baru').value);

        if (isNaN(ipkLama) || isNaN(sksLama) || isNaN(ipsBaru) || isNaN(sksBaru)) {
            alert('Harap isi semua kolom Prediksi IPK dengan angka yang valid.');
            return;
        }

        const bobotLama = ipkLama * sksLama;
        const bobotBaru = ipsBaru * sksBaru;
        const totalSks = sksLama + sksBaru;
        const ipkBaru = (bobotLama + bobotBaru) / totalSks;

        const diff = ipkBaru - ipkLama;

        document.getElementById('pred-result-box').style.display = 'block';
        document.getElementById('res-ipk-lama').textContent = ipkLama.toFixed(2);
        document.getElementById('res-ipk-baru').textContent = ipkBaru.toFixed(2);

        const diffCard = document.getElementById('res-ipk-diff-card');
        const diffText = document.getElementById('res-ipk-diff');
        const statusBox = document.getElementById('pred-status');

        diffCard.className = 'pred-card';
        if (diff > 0) {
            diffCard.classList.add('up');
            diffText.textContent = '+' + diff.toFixed(2);
            statusBox.className = 'prediksi-status positive';
            statusBox.innerHTML = '<i class="ph ph-trend-up"></i> Pertahankan kerjamu! IPK-mu diprediksi akan naik.';
        } else if (diff < 0) {
            diffCard.classList.add('down');
            diffText.textContent = diff.toFixed(2);
            statusBox.className = 'prediksi-status negative';
            statusBox.innerHTML = '<i class="ph ph-trend-down"></i> Hati-hati! IPK-mu diprediksi akan turun.';
        } else {
            diffText.textContent = '0.00';
            statusBox.className = 'prediksi-status';
            statusBox.innerHTML = '<i class="ph ph-minus"></i> IPK-mu diprediksi stabil.';
        }
    });

    // --- 7. TARGET IPK LOGIC ---
    document.getElementById('btn-target').addEventListener('click', () => {
        const ipkLama = parseFloat(document.getElementById('tgt-ipk-lama').value);
        const sksLama = parseInt(document.getElementById('tgt-sks-lama').value);
        const sisaSmt = parseInt(document.getElementById('tgt-sisa-smt').value);
        const sksPerSmt = parseInt(document.getElementById('tgt-sks-per-smt').value);
        const targetIpk = parseFloat(document.getElementById('tgt-ipk-target').value);

        if (isNaN(ipkLama) || isNaN(sksLama) || isNaN(sisaSmt) || isNaN(sksPerSmt) || isNaN(targetIpk)) {
            alert('Harap isi semua kolom Target IPK dengan angka yang valid.');
            return;
        }

        const totalSksTarget = sksLama + (sisaSmt * sksPerSmt);
        const totalBobotTarget = targetIpk * totalSksTarget;
        const bobotLama = ipkLama * sksLama;

        const bobotDibutuhkan = totalBobotTarget - bobotLama;
        const sksDibutuhkan = sisaSmt * sksPerSmt;
        const ipsDibutuhkan = bobotDibutuhkan / sksDibutuhkan;

        document.getElementById('tgt-result-box').style.display = 'block';
        document.getElementById('res-tgt-ips').textContent = ipsDibutuhkan.toFixed(2);

        const diffBadge = document.getElementById('res-tgt-diff');
        let diffClass = '';
        let diffText = '';

        if (ipsDibutuhkan <= 0) {
            diffClass = 'diff-easy';
            diffText = 'Sangat Aman';
        } else if (ipsDibutuhkan <= 3.00) {
            diffClass = 'diff-easy';
            diffText = 'Sangat Mudah';
        } else if (ipsDibutuhkan <= 3.50) {
            diffClass = 'diff-medium';
            diffText = 'Realistis';
        } else if (ipsDibutuhkan <= 3.85) {
            diffClass = 'diff-hard';
            diffText = 'Sulit';
        } else if (ipsDibutuhkan <= 4.00) {
            diffClass = 'diff-impossible';
            diffText = 'Sangat Sulit';
        } else {
            diffClass = 'diff-impossible';
            diffText = 'Mustahil (> 4.00)';
        }

        diffBadge.className = `tgt-difficulty ${diffClass}`;
        diffBadge.textContent = diffText;

        // Render semester breakdown
        const breakdownContainer = document.getElementById('tgt-breakdown');
        let breakdownHtml = '<h4>Simulasi Rincian Semester:</h4><div class="breakdown-grid">';

        for (let i = 1; i <= sisaSmt; i++) {
            breakdownHtml += `
                <div class="breakdown-item">
                    <span>Semester Ke-${i}</span>
                    <strong>IPS ${ipsDibutuhkan > 4 ? 'X' : ipsDibutuhkan.toFixed(2)}</strong>
                </div>
            `;
        }
        breakdownHtml += '</div>';
        breakdownContainer.innerHTML = breakdownHtml;
    });

});

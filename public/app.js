document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. THEME TOGGLE (Dark Mode) ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlEl = document.documentElement;
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlEl.setAttribute('data-theme', savedTheme);
    if (themeIcon) {
        updateThemeIcon(savedTheme);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlEl.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            htmlEl.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (!themeIcon) return;
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

    // Function to update active navbar links based on scroll and active tab
    function updateNavLinks() {
        if (sections.length === 0 || navLinks.length === 0) return;
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 250)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (current === 'tools-section') {
                const activeTabBtn = document.querySelector('.tab-btn.active');
                const activeTab = activeTabBtn ? activeTabBtn.dataset.tab : 'tab-kalkulator';
                if (link.dataset.targetTab === activeTab) {
                    link.classList.add('active');
                }
            } else {
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            }
        });
    }

    // Scroll Spy for main sections
    if (sections.length > 0) {
        window.addEventListener('scroll', updateNavLinks);
    }

    // Tab Switching Logic
    function switchTab(tabId) {
        // Update Buttons
        tabBtns.forEach(btn => {
            btn.classList.remove('active');
            if(btn.dataset.tab === tabId) btn.classList.add('active');
        });
        
        // Update Content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if(content.id === tabId) content.classList.add('active');
        });

        // Sync Nav Links active state
        updateNavLinks();
    }

    // Event listener for tab buttons
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Event listener for navbar links pointing to specific tabs
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetTab = link.dataset.targetTab;
            if(targetTab) {
                switchTab(targetTab);
            }
        });
    });

    // Handle URL parameters for tab selection on load
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
        const targetTabEl = document.getElementById(tabParam);
        if (targetTabEl) {
            switchTab(tabParam);
        }
    }

    // --- 3. COMMON GRADE DATA ---
    const gradePoints = {
        'A': 4.00, 'A-': 3.50, 'B+': 3.25, 'B': 3.00, 
        'B-': 2.75, 'C+': 2.50, 'C': 2.00, 'D': 1.00, 'E': 0.00
    };

    const getGradeOptions = () => {
        let options = '<option value="" disabled selected>Pilih Nilai</option>';
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
    const addCourseBtn = document.getElementById('add-course-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    
    if (courseList) {
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
        
        if (addCourseBtn) {
            addCourseBtn.addEventListener('click', addCourseRow);
        }

        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => {
                const rows = courseList.querySelectorAll('tr');
                let totalSks = 0; let totalBobot = 0;
                rows.forEach(row => {
                    const sksSelect = row.querySelector('.course-sks');
                    const gradeSelect = row.querySelector('.course-grade');
                    if (sksSelect && gradeSelect) {
                        const sks = parseInt(sksSelect.value);
                        const grade = parseFloat(gradeSelect.value);
                        if (!isNaN(sks) && !isNaN(grade)) {
                            totalSks += sks;
                            totalBobot += (sks * grade);
                        }
                    }
                });
                const ips = totalSks > 0 ? (totalBobot / totalSks) : 0;
                const totalSksResult = document.getElementById('total-sks-result');
                const ipsResult = document.getElementById('ips-result');
                if (totalSksResult) totalSksResult.textContent = totalSks;
                if (ipsResult) ipsResult.textContent = ips.toFixed(2);
            });
        }
    }

    // --- 5. PREDIKSI IPK LOGIC ---
    const btnPrediksi = document.getElementById('btn-prediksi');
    if (btnPrediksi) {
        btnPrediksi.addEventListener('click', () => {
            const predIpkLama = document.getElementById('pred-ipk-lama');
            const predSksLama = document.getElementById('pred-sks-lama');
            const predIpsBaru = document.getElementById('pred-ips-baru');
            const predSksBaru = document.getElementById('pred-sks-baru');
            
            if (!predIpkLama || !predSksLama || !predIpsBaru || !predSksBaru) return;

            const ipkLama = parseFloat(predIpkLama.value);
            const sksLama = parseInt(predSksLama.value);
            const ipsBaru = parseFloat(predIpsBaru.value);
            const sksBaru = parseInt(predSksBaru.value);

            if(isNaN(ipkLama) || isNaN(sksLama) || isNaN(ipsBaru) || isNaN(sksBaru)) {
                alert('Harap isi semua kolom Prediksi IPK dengan angka yang valid.');
                return;
            }

            const bobotLama = ipkLama * sksLama;
            const bobotBaru = ipsBaru * sksBaru;
            const totalSks = sksLama + sksBaru;
            const ipkBaru = (bobotLama + bobotBaru) / totalSks;
            
            const diff = ipkBaru - ipkLama;

            const predResultBox = document.getElementById('pred-result-box');
            if (predResultBox) predResultBox.style.display = 'block';
            
            const resIpkLama = document.getElementById('res-ipk-lama');
            const resIpkBaru = document.getElementById('res-ipk-baru');
            if (resIpkLama) resIpkLama.textContent = ipkLama.toFixed(2);
            if (resIpkBaru) resIpkBaru.textContent = ipkBaru.toFixed(2);
            
            const diffCard = document.getElementById('res-ipk-diff-card');
            const diffText = document.getElementById('res-ipk-diff');
            const statusBox = document.getElementById('pred-status');

            if (diffCard) {
                diffCard.className = 'pred-card';
                if (diff > 0) {
                    diffCard.classList.add('up');
                    if (diffText) diffText.textContent = '+' + diff.toFixed(2);
                    if (statusBox) {
                        statusBox.className = 'prediksi-status positive';
                        statusBox.innerHTML = '<i class="ph ph-trend-up"></i> Pertahankan kerjamu! IPK-mu diprediksi akan naik.';
                    }
                } else if (diff < 0) {
                    diffCard.classList.add('down');
                    if (diffText) diffText.textContent = diff.toFixed(2);
                    if (statusBox) {
                        statusBox.className = 'prediksi-status negative';
                        statusBox.innerHTML = '<i class="ph ph-trend-down"></i> Hati-hati! IPK-mu diprediksi akan turun.';
                    }
                } else {
                    if (diffText) diffText.textContent = '0.00';
                    if (statusBox) {
                        statusBox.className = 'prediksi-status';
                        statusBox.innerHTML = '<i class="ph ph-minus"></i> IPK-mu diprediksi stabil.';
                    }
                }
            }
        });
    }

    // --- 6. TARGET IPK LULUS LOGIC ---
    const btnTarget = document.getElementById('btn-target');
    if (btnTarget) {
        btnTarget.addEventListener('click', () => {
            const tgtIpkLama = document.getElementById('tgt-ipk-lama');
            const tgtSksLama = document.getElementById('tgt-sks-lama');
            const tgtSksTotal = document.getElementById('tgt-sks-total');
            const tgtIpkTarget = document.getElementById('tgt-ipk-target');

            if (!tgtIpkLama || !tgtSksLama || !tgtSksTotal || !tgtIpkTarget) return;

            const ipkLama = parseFloat(tgtIpkLama.value);
            const sksLama = parseInt(tgtSksLama.value);
            const sksTotal = parseInt(tgtSksTotal.value);
            const targetIpk = parseFloat(tgtIpkTarget.value);

            // Validations
            if(isNaN(ipkLama) || isNaN(sksLama) || isNaN(sksTotal) || isNaN(targetIpk)) {
                alert('Harap isi semua kolom dengan angka yang valid.');
                return;
            }
            if (ipkLama < 0 || sksLama < 0 || sksTotal < 0 || targetIpk < 0) {
                alert('Nilai tidak boleh negatif.');
                return;
            }
            if (targetIpk > 4.00) {
                alert('Target IPK tidak boleh lebih dari 4.00.');
                return;
            }
            if (sksLama >= sksTotal) {
                alert('Total SKS yang sudah ditempuh tidak boleh sama atau lebih besar dari total SKS lulus.');
                return;
            }

            const totalMutuSaatIni = ipkLama * sksLama;
            const targetMutu = targetIpk * sksTotal;
            const mutuTambahan = targetMutu - totalMutuSaatIni;
            const sisaSKS = sksTotal - sksLama;
            const ipsDibutuhkan = mutuTambahan / sisaSKS;

            // Display results block
            const tgtResultBox = document.getElementById('tgt-result-box');
            if (tgtResultBox) tgtResultBox.style.display = 'block';
            
            // Update Grid values
            const resTgtTarget = document.getElementById('res-tgt-target');
            const resTgtCurrent = document.getElementById('res-tgt-current');
            const resTgtSksDone = document.getElementById('res-tgt-sks-done');
            const resTgtSksLeft = document.getElementById('res-tgt-sks-left');
            const resTgtIps = document.getElementById('res-tgt-ips');

            if (resTgtTarget) resTgtTarget.textContent = targetIpk.toFixed(2);
            if (resTgtCurrent) resTgtCurrent.textContent = ipkLama.toFixed(2);
            if (resTgtSksDone) resTgtSksDone.textContent = sksLama;
            if (resTgtSksLeft) resTgtSksLeft.textContent = sisaSKS;
            if (resTgtIps) resTgtIps.textContent = ipsDibutuhkan.toFixed(2);

            // Evaluate Status
            const statusBox = document.getElementById('res-tgt-status-box');
            const diffText = document.getElementById('res-tgt-diff');
            const reasonText = document.getElementById('res-tgt-reason');

            let diffClass = '';
            let status = '';
            let reason = '';

            if (ipsDibutuhkan <= 3.00) {
                diffClass = 'status-very-easy';
                status = '✅ Sangat Realistis';
                reason = 'Target sangat wajar dan cukup mudah untuk dicapai di sisa semester.';
            } else if (ipsDibutuhkan <= 3.30) {
                diffClass = 'status-easy';
                status = '✅ Realistis';
                reason = 'Target ini masih wajar dan bisa dicapai dengan usaha normal yang konsisten.';
            } else if (ipsDibutuhkan <= 3.60) {
                diffClass = 'status-medium'; 
                status = '⚠️ Menantang';
                reason = 'Membutuhkan fokus dan usaha ekstra keras untuk mencapai rata-rata IPS ini.';
            } else if (ipsDibutuhkan <= 4.00) {
                diffClass = 'status-hard'; 
                status = '🔥 Sangat Sulit';
                reason = 'Mendekati nilai sempurna. Anda hampir tidak boleh melakukan kesalahan di sisa studi.';
            } else {
                diffClass = 'status-impossible'; 
                status = '❌ Tidak Mungkin Dicapai';
                reason = `Karena IPS rata-rata yang dibutuhkan (${ipsDibutuhkan.toFixed(2)}) melebihi batas maksimum 4.00.`;
            }

            if (statusBox) statusBox.className = `tgt-status-box ${diffClass}`;
            if (diffText) diffText.textContent = status;
            if (reasonText) reasonText.textContent = reason;
        });
    }

});

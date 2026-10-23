/* KampusKita Demo: seluruh data lokal dan sintetis. Kerentanan hanya disimulasikan di browser. */
(() => {
  const $ = (s) => document.querySelector(s);
  const users = [
    { username: 'mahasiswa', password: 'mhs123', name: 'Nadia Putri', role: 'mahasiswa', id: '2411001', program: 'Manajemen Informatika' },
    { username: 'dosen', password: 'dsn123', name: 'Bapak Arif Pratama', role: 'dosen', id: 'DSN-014', program: 'Manajemen Informatika' },
    { username: 'admin', password: 'adm123', name: 'Admin KampusKita', role: 'admin', id: 'ADM-001', program: 'Administrasi Sistem' }
  ];
  const initialGrades = [
    { id: '2411001', student: 'Nadia Putri', course: 'Basis Data', lecturer: 'Arif Pratama', grade: 'A', score: 88 },
    { id: '2411001', student: 'Nadia Putri', course: 'Pemrograman Web', lecturer: 'Dewi Anggraini', grade: 'A-', score: 84 },
    { id: '2411002', student: 'Raka Saputra', course: 'Basis Data', lecturer: 'Arif Pratama', grade: 'B+', score: 79 },
    { id: '2411003', student: 'Salsa Maharani', course: 'Basis Data', lecturer: 'Arif Pratama', grade: 'B', score: 75 },
    { id: '2411002', student: 'Raka Saputra', course: 'Pemrograman Web', lecturer: 'Dewi Anggraini', grade: 'A-', score: 83 },
    { id: '2411003', student: 'Salsa Maharani', course: 'Pemrograman Web', lecturer: 'Dewi Anggraini', grade: 'B+', score: 78 }
  ];
  let grades = initialGrades.map(x => ({...x}));
  let currentUser = null;
  let failedAttempts = 0;
  let lockedUntil = 0;
  let submissions = [];
  let discussions = [
    { author: 'Arif Pratama', role: 'Dosen', text: 'Selamat datang di ruang diskusi Basis Data. Silakan gunakan ruang ini untuk bertanya tentang materi minggu ini.', time: 'Hari ini · 08.15' },
    { author: 'Nadia Putri', role: 'Mahasiswa', text: 'Pak, apakah tugas latihan JOIN dikumpulkan dalam format PDF atau SQL?', time: 'Hari ini · 09.20' }
  ];
  const secureToggle = $('#secureToggle');
  const isSecure = () => secureToggle.checked;
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const nowText = () => new Date().toLocaleTimeString('id-ID', {hour:'2-digit',minute:'2-digit'});
  $('#todayDate').textContent = new Date().toLocaleDateString('id-ID', {day:'numeric',month:'short',year:'numeric'});

  function updateMode() {
    const secure = isSecure();
    $('#modeDescription').textContent = secure ? 'Pemeriksaan akun dan pembatasan percobaan aktif.' : 'Validasi rentan aktif untuk demonstrasi.';
    $('#modeTag').textContent = secure ? 'MODE AMAN · PERLINDUNGAN AKTIF' : 'MODE RENTAN · DEMO';
    $('#modeTag').className = 'mode-tag ' + (secure ? 'secure' : 'vulnerable');
    $('#lockNotice').classList.toggle('hidden', !(secure && Date.now() < lockedUntil));
    if (currentUser) renderPage($('#breadcrumb').textContent.toLowerCase().replaceAll(' ','_'));
  }
  secureToggle.addEventListener('change', updateMode);
  $('#showPassword').addEventListener('click', () => { const p = $('#password'); p.type = p.type === 'password' ? 'text' : 'password'; });
  document.querySelectorAll('.account-row').forEach(btn => btn.addEventListener('click', () => { $('#username').value = btn.dataset.user; $('#password').value = btn.dataset.pass; $('#username').focus(); }));

  function showMessage(text, type='error') { const el = $('#loginMessage'); el.textContent = text; el.className = 'message ' + type; }
  function loginAttempt(username, password) {
    const injection = /('|%27)\s*(or|and)\s*('|\d|true)|--|\/\*/i.test(username) || /('|%27)\s*(or|and)\s*('|\d|true)|--|\/\*/i.test(password);
    // SIMULASI RENTAN: input mirip SQLi membuat kondisi autentikasi dianggap selalu benar.
    if (!isSecure() && injection) return { ...users[0], demoInjection: true };
    return users.find(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password) || null;
  }
  $('#loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const username = $('#username').value;
    const password = $('#password').value;
    if (isSecure() && Date.now() < lockedUntil) { showMessage('Terlalu banyak percobaan. Tunggu sebentar sebelum mencoba lagi.'); $('#lockNotice').textContent = 'Login sementara dikunci karena 5 percobaan gagal.'; $('#lockNotice').classList.remove('hidden'); return; }
    const user = loginAttempt(username, password);
    if (user) {
      currentUser = user; failedAttempts = 0; lockedUntil = 0;
      showApp();
      if (user.demoInjection) toast('Login berhasil karena input SQL Injection simulasi diterima dalam mode rentan.', true);
      return;
    }
    failedAttempts++;
    if (isSecure() && failedAttempts >= 5) {
      lockedUntil = Date.now() + 30000;
      $('#lockNotice').textContent = 'Login sementara dikunci selama 30 detik setelah 5 percobaan gagal.';
      $('#lockNotice').classList.remove('hidden');
      showMessage('Batas percobaan tercapai. Coba kembali setelah 30 detik.');
    } else {
      showMessage(isSecure() ? `Nama pengguna atau kata sandi salah. Percobaan ${failedAttempts}/5.` : 'Nama pengguna atau kata sandi salah. Mode rentan tidak membatasi percobaan login.');
    }
  });
  function showApp() {
    $('#loginView').classList.add('hidden'); $('#appView').classList.remove('hidden'); $('#logoutBtn').classList.remove('hidden');
    $('#userName').textContent = currentUser.name; $('#userRole').textContent = capitalize(currentUser.role); $('#userAvatar').textContent = currentUser.role[0].toUpperCase();
    $('#userAvatar').className = 'avatar ' + (currentUser.role === 'admin' ? 'orange' : currentUser.role === 'dosen' ? 'violet' : 'blue');
    document.querySelector('[data-page="manage"]').classList.toggle('hidden', currentUser.role !== 'admin');
    document.querySelector('[data-page="grades"]').classList.toggle('hidden', currentUser.role === 'admin');
    document.querySelector('[data-page="assignments"]').classList.toggle('hidden', currentUser.role === 'admin');
    document.querySelector('[data-page="discussion"]').classList.toggle('hidden', currentUser.role === 'admin');
    renderPage('overview');
    window.scrollTo({top:0,behavior:'smooth'});
  }
  $('#logoutBtn').addEventListener('click', () => { currentUser = null; $('#appView').classList.add('hidden'); $('#loginView').classList.remove('hidden'); $('#logoutBtn').classList.add('hidden'); $('#password').value=''; $('#loginMessage').classList.add('hidden'); window.scrollTo({top:0,behavior:'smooth'}); });
  document.querySelectorAll('.nav-item').forEach(btn => btn.addEventListener('click', () => renderPage(btn.dataset.page)));
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function toast(text, warning=false) { let el = $('#pageToast'); if (!el) { el=document.createElement('div'); el.id='pageToast'; el.className='message'; $('#pageContent').prepend(el); } el.textContent=text; el.className='message ' + (warning?'error':'success'); }
  function pageHeader(title, subtitle, key) { $('#pageTitle').textContent=title; $('#pageSubtitle').textContent=subtitle; $('#breadcrumb').textContent=key.replaceAll('_',' ').toUpperCase(); document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.page===key)); }
  function myGrades() { return currentUser.role === 'mahasiswa' ? grades.filter(g=>g.id===currentUser.id) : grades; }
  function gradeRows(list) { if (!list.length) return '<tr><td colspan="5" class="empty-state">Tidak ada data yang cocok.</td></tr>'; return list.map(g=>`<tr><td>${esc(g.course)}</td><td>${esc(g.student)}</td><td>${esc(g.lecturer)}</td><td><b>${esc(g.score)}</b></td><td><span class="grade-badge">${esc(g.grade)}</span></td></tr>`).join(''); }
  function renderPage(key) {
    if (!currentUser) return;
    const titles={overview:['Ringkasan','Ringkasan aktivitas akademikmu.'],grades:['Nilai akademik','Lihat dan telusuri nilai pada data latihan.'],assignments:['Tugas','Unggah berkas tugas simulasi.'],discussion:['Diskusi kelas','Berbagi pertanyaan dan informasi seputar perkuliahan.'],manage:['Kelola akun','Daftar akun sintetis untuk demonstrasi admin.']};
    if (!titles[key] || (key==='manage' && currentUser.role!=='admin')) key='overview';
    pageHeader(titles[key][0],titles[key][1],key);
    const root=$('#pageContent'); root.innerHTML='';
    if (key==='overview') root.innerHTML=renderOverview();
    if (key==='grades') root.innerHTML=renderGrades();
    if (key==='assignments') root.innerHTML=renderAssignments();
    if (key==='discussion') root.innerHTML=renderDiscussion();
    if (key==='manage') root.innerHTML=renderManage();
    if (key==='grades') {
      $('#gradeSearch').addEventListener('submit', e=>{e.preventDefault(); runGradeSearch($('#gradeQuery').value);});
    }
    if (key==='assignments') {
      $('#assignmentForm').addEventListener('submit', e=>{e.preventDefault(); const f=$('#assignmentFile').files[0]; const course=$('#assignmentCourse').value; if(!f){$('#assignmentMsg').textContent='Pilih berkas simulasi terlebih dahulu.';return;} submissions.unshift({owner:currentUser.name,course,file:f.name,time:nowText()}); $('#assignmentMsg').textContent=`Berkas “${f.name}” dicatat sebagai simulasi. File tidak dikirim ke server.`; $('#assignmentList').innerHTML=renderSubmissionRows(); $('#assignmentForm').reset();});
    }
    if (key==='discussion') {
      $('#discussionForm').addEventListener('submit',e=>{e.preventDefault(); const text=$('#discussionText').value.trim();if(!text)return;discussions.push({author:currentUser.name,role:capitalize(currentUser.role),text,time:'Hari ini · '+nowText()});renderPage('discussion');});
    }
    if (key==='manage') {
      $('#addAccountForm').addEventListener('submit',e=>{e.preventDefault();const name=$('#newName').value.trim();const username=$('#newUsername').value.trim();const role=$('#newRole').value;if(!name||!username)return;if(users.some(u=>u.username===username)){ $('#accountMsg').textContent='Nama pengguna sudah ada dalam demo.';return;}users.push({username,password:'demo123',name,role,id:'DEMO-'+String(users.length+1).padStart(3,'0'),program:'Program Sintetis'});renderPage('manage');});
    }
  }
  function renderOverview() {
    const mg=myGrades(); const avg=mg.length?Math.round(mg.reduce((a,g)=>a+g.score,0)/mg.length):0;
    return `<div class="stats-grid"><div class="stat-card"><div class="stat-top">${currentUser.role==='mahasiswa'?'Mata kuliah dinilai':'Rekap nilai'}<span class="stat-icon">▤</span></div><div class="stat-number">${mg.length}</div><div class="stat-note">Data sintetis</div></div><div class="stat-card"><div class="stat-top">Rata-rata nilai<span class="stat-icon">↗</span></div><div class="stat-number">${avg||'—'}</div><div class="stat-note">Dari data yang ditampilkan</div></div><div class="stat-card"><div class="stat-top">Tugas tercatat<span class="stat-icon">↥</span></div><div class="stat-number">${submissions.filter(s=>currentUser.role!=='mahasiswa'||s.owner===currentUser.name).length}</div><div class="stat-note">Unggahan simulasi</div></div></div><div class="dashboard-grid"><div class="panel"><div class="panel-heading"><h3>${currentUser.role==='mahasiswa'?'Nilai terbaru':'Data nilai terbaru'}</h3><span>DATA DEMO</span></div><table class="grade-table"><thead><tr><th>Mata kuliah</th><th>Mahasiswa</th><th>Nilai</th></tr></thead><tbody>${mg.slice(0,4).map(g=>`<tr><td>${esc(g.course)}</td><td>${esc(g.student)}</td><td><span class="grade-badge">${esc(g.grade)}</span></td></tr>`).join('')}</tbody></table><div class="form-actions"><button class="small-button" data-goto="grades">Lihat semua nilai →</button></div></div><div class="panel"><div class="panel-heading"><h3>Aktivitas terbaru</h3><span>HARI INI</span></div><div class="activity-row"><span class="task-icon">◌</span><span><b>Diskusi kelas tersedia</b><small>Ruang diskusi Basis Data</small></span></div><div class="activity-row"><span class="task-icon">↥</span><span><b>Pengumpulan tugas</b><small>Unggah file hanya disimulasikan</small></span></div><div class="activity-row"><span class="task-icon">▤</span><span><b>Nilai akademik</b><small>Gunakan menu Nilai akademik</small></span></div></div></div><div class="panel"><div class="panel-heading"><h3>Catatan lingkungan latihan</h3><span class="role-pill">${capitalize(currentUser.role)}</span></div><p class="section-intro" style="margin:0">Portal ini memakai data sintetis. File tugas tidak dikirim ke server, posting diskusi tersimpan di memori halaman, dan hasil SQL Injection merupakan simulasi sisi browser. Muat ulang halaman untuk mengatur ulang data latihan.</p></div>`;
  }
  function renderGrades() {
    const list=myGrades();
    return `<div class="panel"><div class="panel-heading"><h3>Daftar nilai</h3><span>${list.length} baris data</span></div><form class="search-row" id="gradeSearch"><input id="gradeQuery" placeholder="Cari mata kuliah, nama mahasiswa, atau ID..." aria-label="Cari nilai"><button class="button button-primary" type="submit">Cari</button></form><div class="tiny-label" id="searchFeedback" style="margin-bottom:10px">MENAMPILKAN DATA YANG DIIZINKAN UNTUK AKUN INI</div><div style="overflow-x:auto"><table class="grade-table"><thead><tr><th>Mata kuliah</th><th>Mahasiswa</th><th>Dosen</th><th>Skor</th><th>Huruf</th></tr></thead><tbody id="gradeRows">${gradeRows(list)}</tbody></table></div></div>${currentUser.role==='dosen'?`<div class="panel"><div class="panel-heading"><h3>Input nilai simulasi</h3><span>DOSEN</span></div><form id="gradeEditForm"><div class="form-grid"><div><label class="field-label" for="gradeStudent">ID mahasiswa</label><input class="text-input" id="gradeStudent" placeholder="Contoh: 2411002" required></div><div><label class="field-label" for="gradeCourse">Mata kuliah</label><input class="text-input" id="gradeCourse" placeholder="Nama mata kuliah" required></div><div><label class="field-label" for="gradeScore">Skor (0–100)</label><input class="text-input" id="gradeScore" type="number" min="0" max="100" required></div></div><div class="form-actions"><button class="button button-primary" type="submit">Simpan nilai demo</button></div><div id="gradeEditMsg" class="inline-message"></div></form></div>`:''}`;
  }
  function runGradeSearch(q) {
    const injection= /('|%27)\s*or\s*('|\d|true)/i.test(q) || /--|\/\*/.test(q);
    let list=myGrades();
    if (!isSecure() && injection) {
      // SIMULASI RENTAN: kondisi OR benar mengabaikan filter dan batas data milik mahasiswa.
      list=grades;
      $('#searchFeedback').textContent='SIMULASI SQLI: KONDISI PENCARIAN DIUBAH — SELURUH NILAI SINTETIS DITAMPILKAN';
      $('#searchFeedback').className='tiny-label danger-text';
    } else {
      const needle=q.trim().toLowerCase();
      if(needle) list=list.filter(g=>[g.id,g.student,g.course,g.lecturer,g.grade,String(g.score)].some(v=>String(v).toLowerCase().includes(needle)));
      $('#searchFeedback').textContent=isSecure()?'MODE AMAN: input diperlakukan sebagai teks; akses tetap dibatasi.':'MODE RENTAN: pencarian biasa pada data demo.';
      $('#searchFeedback').className='tiny-label';
    }
    $('#gradeRows').innerHTML=gradeRows(list);
  }
  function renderAssignments() {
    const mine=submissions.filter(s=>currentUser.role==='dosen'||s.owner===currentUser.name);
    return `<div class="panel"><div class="panel-heading"><h3>Unggah tugas</h3><span>SIMULASI</span></div><p class="section-intro">Pilih file untuk mencatat nama berkas pada halaman ini. File tidak diunggah atau disimpan ke server.</p><form id="assignmentForm"><label class="field-label" for="assignmentCourse">Mata kuliah</label><select class="select-input" id="assignmentCourse"><option>Basis Data</option><option>Pemrograman Web</option><option>Keamanan Aplikasi</option></select><div class="upload-zone" style="margin-top:15px"><div style="font-size:24px;color:#315de8">↥</div><strong>Pilih berkas tugas</strong><p>PDF, DOCX, ZIP atau file latihan lain</p><input id="assignmentFile" type="file" required></div><div class="form-actions"><button class="button button-primary" type="submit">Catat pengumpulan</button></div><div id="assignmentMsg" class="inline-message"></div></form></div><div class="panel"><div class="panel-heading"><h3>Riwayat pengumpulan</h3><span>${mine.length} item</span></div><div id="assignmentList">${renderSubmissionRows()}</div></div>`;
  }
  function renderSubmissionRows() { const mine=submissions.filter(s=>currentUser.role==='dosen'||s.owner===currentUser.name); if(!mine.length)return '<div class="empty-state">Belum ada tugas yang dicatat.</div>'; return mine.map(s=>`<div class="task-row"><span class="task-icon">▤</span><span><b>${esc(s.course)} — ${esc(s.file)}</b><small>${esc(s.owner)} · Hari ini ${esc(s.time)}</small></span><span class="task-status">Tercatat</span></div>`).join(''); }
  function renderDiscussion() { return `<div class="panel"><div class="panel-heading"><h3>Ruang diskusi Basis Data</h3><span>${discussions.length} pesan</span></div><p class="section-intro">Diskusi bersifat sementara dan hanya tersimpan di memori halaman.</p><form id="discussionForm"><label class="field-label" for="discussionText">Tulis pesan atau pertanyaan</label><textarea id="discussionText" class="text-area" placeholder="Tulis pesan dengan sopan..." required maxlength="500"></textarea><div class="form-actions"><button class="button button-primary" type="submit">Kirim pesan</button></div></form></div><div class="panel"><div class="panel-heading"><h3>Pesan diskusi</h3><span>TERBARU</span></div>${[...discussions].reverse().map(p=>`<div class="post"><div class="post-head"><div class="avatar ${p.role==='Dosen'?'violet':'blue'}">${esc(p.author.charAt(0))}</div><div><b>${esc(p.author)}</b><small>${esc(p.role)} · ${esc(p.time)}</small></div></div><p>${esc(p.text)}</p></div>`).join('')}</div>`; }
  function renderManage() { return `<div class="panel"><div class="panel-heading"><h3>Daftar akun sintetis</h3><span>${users.length} akun</span></div><p class="section-intro">Akun tambahan hanya berada di memori halaman dan menggunakan kata sandi demo sementara: <code>demo123</code>.</p><div style="overflow-x:auto"><table class="grade-table"><thead><tr><th>Nama pengguna</th><th>Nama tampilan</th><th>Peran</th><th>ID demo</th></tr></thead><tbody>${users.map(u=>`<tr><td><b>${esc(u.username)}</b></td><td>${esc(u.name)}</td><td>${esc(capitalize(u.role))}</td><td>${esc(u.id)}</td></tr>`).join('')}</tbody></table></div></div><div class="panel"><div class="panel-heading"><h3>Tambah akun demo</h3><span>ADMIN</span></div><form id="addAccountForm"><div class="form-grid"><div><label class="field-label" for="newName">Nama tampilan</label><input class="text-input" id="newName" required placeholder="Nama sintetis"></div><div><label class="field-label" for="newUsername">Nama pengguna</label><input class="text-input" id="newUsername" required placeholder="username-demo"></div><div><label class="field-label" for="newRole">Peran</label><select class="select-input" id="newRole"><option value="mahasiswa">Mahasiswa</option><option value="dosen">Dosen</option><option value="admin">Admin</option></select></div></div><div class="form-actions"><button class="button button-primary" type="submit">Tambah akun</button></div><div id="accountMsg" class="inline-message"></div></form></div>`; }
  // Handler nilai dosen didelegasikan agar aman setelah render ulang konten.
  document.addEventListener('submit', e => {
    if(e.target.id!=='gradeEditForm') return;
    e.preventDefault();
    const id=$('#gradeStudent').value.trim(); const course=$('#gradeCourse').value.trim(); const score=Number($('#gradeScore').value);
    if(!/^241100[1-3]$/.test(id)||!course||!Number.isFinite(score)||score<0||score>100){$('#gradeEditMsg').textContent='Gunakan ID sintetis 2411001–2411003 dan skor 0–100.';return;}
    const student=({'2411001':'Nadia Putri','2411002':'Raka Saputra','2411003':'Salsa Maharani'})[id];
    const letter=score>=85?'A':score>=80?'A-':score>=75?'B+':score>=70?'B':score>=65?'C+':'C';
    grades.push({id,student,course,lecturer:currentUser.name,score,grade:letter}); renderPage('grades'); toast('Nilai sintetis berhasil ditambahkan.');
  });
  document.addEventListener('click', e => { const b=e.target.closest('[data-goto]'); if(b)renderPage(b.dataset.goto); });
})();

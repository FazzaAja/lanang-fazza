// --- 0. ANIMASI LOADING (PRELOADER) ---
(function () {
  const preloader = document.getElementById("preloader");
  const nameEl = document.getElementById("preloader-name");
  const barFill = document.getElementById("preloader-bar-fill");
  const MIN_DURATION = 1800; // Tampil minimal 1,8 detik agar animasi terlihat
  const MAX_DURATION = 10000; // Batas aman agar website tetap terbuka jika koneksi sangat lambat
  const startTime = Date.now();

  // Pecah nama jadi per huruf agar muncul satu per satu
  nameEl.innerHTML = nameEl.textContent
    .split("")
    .map(
      (char, i) =>
        `<span style="animation-delay:${0.3 + i * 0.06}s">${
          char === " " ? "&nbsp;" : char
        }</span>`,
    )
    .join("");

  // Daftar hal yang harus siap sebelum website ditampilkan
  const tasks = [];

  // Semua gambar, termasuk gambar lazy di tab yang belum dibuka,
  // diunduh dan di-decode dulu agar tidak muncul kosong saat ganti tab
  const imageSources = new Set(
    [...document.images].map((img) => img.getAttribute("src")).filter(Boolean),
  );
  imageSources.forEach((src) => {
    tasks.push(
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () =>
          (img.decode ? img.decode() : Promise.resolve()).then(resolve, resolve);
        img.onerror = resolve; // Gambar gagal tetap dihitung agar loading tidak macet
        img.src = src;
      }),
    );
  });

  // Font teks dan ikon, termasuk ketebalan yang hanya dipakai di tab lain
  if (document.fonts) {
    [
      "400 1em 'Plus Jakarta Sans'",
      "500 1em 'Plus Jakarta Sans'",
      "600 1em 'Plus Jakarta Sans'",
      "400 1em 'Space Grotesk'",
      "600 1em 'Space Grotesk'",
      "700 1em 'Space Grotesk'",
      "900 1em 'Font Awesome 6 Free'",
      "400 1em 'Font Awesome 6 Brands'",
    ].forEach((font) => tasks.push(document.fonts.load(font).catch(() => {})));
  }

  // Seluruh halaman (CSS, script, dan gambar non-lazy) selesai dimuat
  tasks.push(
    new Promise((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", resolve, { once: true });
    }),
  );

  // Progress bar mengikuti jumlah aset yang benar-benar sudah siap
  let doneCount = 0;
  barFill.style.width = "5%";
  tasks.forEach((task) =>
    task.then(() => {
      doneCount++;
      barFill.style.width = 5 + (doneCount / tasks.length) * 95 + "%";
    }),
  );

  let finished = false;
  function finishLoading() {
    if (finished) return;
    finished = true;
    barFill.style.width = "100%";

    setTimeout(() => {
      preloader.classList.add("done");
      document.body.classList.remove("is-loading");
      document.body.classList.add("page-enter");
    }, 350);

    // Hapus preloader dari halaman setelah tirai terbuka
    setTimeout(() => preloader.remove(), 1700);
  }

  // Tutup preloader hanya setelah semua aset siap (dan animasi sempat terlihat)
  Promise.all(tasks).then(() => {
    const elapsed = Date.now() - startTime;
    setTimeout(finishLoading, Math.max(0, MIN_DURATION - elapsed));
  });
  setTimeout(finishLoading, MAX_DURATION);
})();

// --- 1. FITUR GANTI TAB (Menu) ---
function switchTab(tabId, clickedButton) {
  // Sembunyikan semua konten dan hapus status aktif di tombol
  document
    .querySelectorAll(".content-section")
    .forEach((sec) => sec.classList.remove("active"));
  document
    .querySelectorAll(".nav-btn")
    .forEach((btn) => btn.classList.remove("active"));

  // Tampilkan konten yang dipilih
  document.getElementById(tabId).classList.add("active");
  clickedButton.classList.add("active");

  // Auto scroll ke konten jika di layar HP
  if (window.innerWidth <= 1024) {
    document
      .querySelector(".main-content")
      .scrollIntoView({ behavior: "smooth" });
  }
}

// --- 2. FITUR TEMA GELAP / TERANG ---
function toggleTheme() {
  const body = document.body;
  const icon = document.querySelector("#theme-btn i");

  body.classList.toggle("dark-theme");

  // Ubah icon berdasarkan tema
  if (body.classList.contains("dark-theme")) {
    icon.className = "fa-solid fa-sun";
  } else {
    icon.className = "fa-solid fa-moon";
  }
}

// --- 3. FITUR EFEK MENGETIK PADA SIDEBAR ---
let typeWords = [
  "Mahasiswa Informatika",
  "Pengembang Web",
  "Asisten Praktikum",
  "Programmer Lepas",
];
let wordIndex = 0,
  charIndex = 0;
const typingEl = document.querySelector(".typing-text");

function typeEffect() {
  if (charIndex < typeWords[wordIndex].length) {
    typingEl.textContent += typeWords[wordIndex].charAt(charIndex);
    charIndex++;
    setTimeout(typeEffect, 100); // Kecepatan ngetik
  } else {
    setTimeout(eraseEffect, 2000); // Jeda sebelum menghapus
  }
}

function eraseEffect() {
  if (charIndex > 0) {
    typingEl.textContent = typeWords[wordIndex].substring(
      0,
      charIndex - 1,
    );
    charIndex--;
    setTimeout(eraseEffect, 50); // Kecepatan hapus
  } else {
    wordIndex = (wordIndex + 1) % typeWords.length; // Lanjut ke kata berikutnya
    setTimeout(typeEffect, 500);
  }
}

// Mulai efek ngetik setelah 1 detik
setTimeout(typeEffect, 1000);

// --- 3b. FITUR DUA BAHASA (INDONESIA / INGGRIS) ---
const translations = {
  id: {
    loc: "Lokasi",
    download: "Unduh CV",
    copyright: "dibuat sambil santai",
    about_title: "Tentang Saya",
    about_desc:
      "Mahasiswa Informatika Universitas Ahmad Dahlan yang berminat pada pengembangan perangkat lunak. Berpengalaman dengan Python, PHP, dan JavaScript, serta merancang dan mengoptimalkan database menggunakan SQL dan API. Percaya bahwa kolaborasi tim dan semangat belajar adalah kunci keberhasilan.",
    whatido: "Yang Saya Kerjakan",
    svc1_t: "Pengembangan Web",
    svc1_d:
      "Membangun situs web, aplikasi web, dan PWA dengan Laravel, Django, dan WordPress, lengkap dengan database hingga dipasang di server.",
    svc2_t: "Analisis Data",
    svc2_d:
      "Mengolah data dengan Excel, Python, dan SQL menjadi informasi yang rapi dan mudah dipahami, seperti rekap nilai praktikum.",
    svc3_t: "Mengajar",
    svc3_d:
      "Asisten Praktikum di Universitas Ahmad Dahlan sejak 2024, membimbing mahasiswa memahami materi praktikum setiap semester.",
    svc4_t: "Acara &amp; Organisasi",
    svc4_d:
      "Aktif berorganisasi serta merencanakan dan mengelola acara, mulai dari koordinasi tim hingga pelaksanaan di lapangan.",
    skills: "Keahlian",
    hard: "Keterampilan Teknis",
    soft: "Keterampilan Non-Teknis",
    sk_uiux: "Desain UI/UX",
    sk_lead: "Kepemimpinan",
    sk_team: "Kerja Sama Tim",
    sk_ps: "Pemecahan Masalah",
    sk_pub: "Berbicara di Depan Umum",
    sk_anal: "Berpikir Analitis",
    sk_comm: "Komunikasi",
    resume_title: "Riwayat",
    resume_desc:
      "Ringkasan perjalanan akademik, pengalaman kerja, organisasi, dan prestasi.",
    h_edu: "Pendidikan",
    h_exp: "Pengalaman",
    h_org: "Organisasi",
    h_ach: "Prestasi",
    edu1_date: "2023 - Sekarang",
    edu1_t: "S1 Informatika - FTI",
    edu2_t: "Rekayasa Perangkat Lunak",
    exp1_t: "Staff Bantu Bidang Program",
    onsite: "· Di Lokasi",
    onsite2: "· Di Lokasi",
    exp1_date: "Feb 2026 — Sekarang",
    exp1_p1: "Membantu administrasi program Bidang Program Lazismu DIY.",
    exp1_p2:
      "Membantu proses pendistribusian bantuan kepada penerima manfaat.",
    exp1_p3:
      "Menyiapkan kebutuhan dan perlengkapan program untuk pelaksanaan di lapangan.",
    exp2_t: "Asisten Praktikum",
    exp2_date: "Nov 2024 — Sekarang",
    exp2_p1: "Menjelaskan materi praktikum kepada mahasiswa.",
    exp2_p2: "Mengolah data nilai praktikum menggunakan Excel.",
    exp3_date: "Agu 2022 — Jan 2023",
    exp3_p1: "Membuat toko online menggunakan WordPress CMS.",
    exp3_p2: "Membangun aplikasi web gudang menggunakan Python/Django.",
    exp3_p3:
      "Mengimplementasikan sistem untuk karyawan menggunakan PHP/Laravel.",
    exp3_p4:
      "Mengiklankan produk di Shopee dan Lazada, serta siaran langsung produk di TikTok.",
    exp4_t: "Programmer Lepas",
    exp4_co: "Mandiri",
    remote: "Jarak Jauh",
    exp4_date: "Jan 2022 — Sekarang",
    exp4_p1:
      "Menyesuaikan bahasa pemrograman, perangkat, dan database dengan kebutuhan klien.",
    exp4_p2: "Membuat PWA, aplikasi web, dan situs web.",
    exp4_p3: "Memasang proyek ke server.",
    org1_t: "Staff Kementerian Pendidikan",
    org1_d: "Badan Eksekutif Mahasiswa Universitas Ahmad Dahlan",
    org2_t: "Staff Bidang RPK",
    org3_t: "Koordinator Media",
    org3_d: "Tim PPK Ormawa IMM FKM UAD",
    org4_t: "Staff Departemen IPTEK",
    org4_d: "Himpunan Mahasiswa Informatika Universitas Ahmad Dahlan.",
    org5_t: "Ketua IT Club",
    ach1_t: "Juara 1 Lomba UI/UX",
    ach2_t: "Finalis Lomba Pemrograman Web",
    ach3_t: "Lolos Pendanaan PPK Ormawa",
    ach3_d: "Program Penguatan Kapasitas Organisasi Kemahasiswaan",
    works_title: "Karya",
    works_desc:
      "Eksplorasi proyek pengembangan aplikasi. Klik kartu untuk melihat detail.",
    w1_sub: "Website Klinik",
    w2_sub: "Website Profil Program",
    w3_title: "Sistem Sortir Double Antarestar",
    w3_sub: "Sistem Sortir Gudang",
    w4_sub: "Kartu Nama Digital",
    w5_title: "Sistem Izin SMKN 4 TSM",
    w5_sub: "Sistem Perizinan Sekolah",
    w6_title: "Portofolio Pribadi",
    w6_sub: "Website Portofolio",
    nav_about: "Tentang",
    source: "Kode Sumber",
    live: "Lihat Website",
    w1_desc:
      "Website resmi klinik gigi Kusuma Dental Care di Yogyakarta yang menampilkan layanan, tim dokter, dan informasi klinik. Responsif di desktop maupun ponsel. Berperan sebagai Manajer Proyek.",
    w1_tools: "Manajemen Proyek, Pengembangan Web, Desain Responsif",
    w2_desc:
      "Website profil program kerja Tim PPK Ormawa IMM FKM 2025 untuk mempublikasikan kegiatan, informasi, dan hasil program kepada masyarakat.",
    w3_desc:
      "Sistem sortir untuk tim gudang Antarestar yang mencatat setiap input sebagai sukses atau terdeteksi ganda (duplikat), lengkap dengan penghitung per petugas dan jam waktu nyata. Dilengkapi pengelolaan pemasok, pesanan awal, dan persetujuan pesanan.",
    w4_desc:
      "Kartu profil digital untuk karyawan Antarestar. Admin/HRD dapat menambahkan data staf sebanyak yang dibutuhkan, dan setiap karyawan memiliki halaman profil dengan tombol telepon, simpan kontak (vCard), email, serta tautan media sosial.",
    w5_desc:
      "Sistem izin keluar-masuk siswa SMK Negeri 4 Tasikmalaya. Mencatat data murid, alasan izin, dan guru piket, dengan tampilan detail murid di ponsel serta ekspor data ke PDF dan Excel.",
    w6_desc:
      "Website portofolio pribadi ini: menampilkan profil, riwayat pendidikan dan pengalaman, serta karya. Dilengkapi mode gelap/terang, dua bahasa (Indonesia/Inggris), animasi pembuka, dan tampilan responsif di desktop maupun ponsel.",
  },
  en: {
    loc: "Location",
    download: "Download CV",
    copyright: "created while vibing",
    about_title: "About Me",
    about_desc:
      "Informatics student at Universitas Ahmad Dahlan with an interest in software development. Experienced with Python, PHP, and JavaScript, as well as designing and optimizing databases using SQL and APIs. Believes that teamwork and a learning spirit are the keys to success.",
    whatido: "What I Do",
    svc1_t: "Web Development",
    svc1_d:
      "Building websites, web apps, and PWAs with Laravel, Django, and WordPress, complete with databases and server deployment.",
    svc2_t: "Data Analyst",
    svc2_d:
      "Processing data with Excel, Python, and SQL into clear, easy-to-understand information, such as practicum grade recaps.",
    svc3_t: "Teaching",
    svc3_d:
      "Practicum Assistant at Universitas Ahmad Dahlan since 2024, guiding students through practicum material every semester.",
    svc4_t: "Event &amp; Organization",
    svc4_d:
      "Actively involved in organizations, planning and managing events from team coordination to on-site execution.",
    skills: "Skills",
    hard: "Hard Skills",
    soft: "Soft Skills",
    sk_uiux: "UI/UX Design",
    sk_lead: "Leadership",
    sk_team: "Teamwork",
    sk_ps: "Problem Solving",
    sk_pub: "Public Speaking",
    sk_anal: "Analytical Thinking",
    sk_comm: "Communication",
    resume_title: "Resume",
    resume_desc:
      "A summary of my academic journey, work experience, organizations, and achievements.",
    h_edu: "Education",
    h_exp: "Experience",
    h_org: "Organization",
    h_ach: "Achievements",
    edu1_date: "2023 - Present",
    edu1_t: "Bachelor of Informatics - FTI",
    edu2_t: "Software Engineering",
    exp1_t: "Program Division Assistant Staff",
    onsite: "· On-site",
    onsite2: "· On-site",
    exp1_date: "Feb 2026 — Present",
    exp1_p1:
      "Assisted with program administration for the Lazismu DIY Program Division.",
    exp1_p2: "Assisted in distributing aid to beneficiaries.",
    exp1_p3:
      "Prepared program needs and equipment for field implementation.",
    exp2_t: "Practicum Assistant",
    exp2_date: "Nov 2024 — Present",
    exp2_p1: "Explained practicum material to students.",
    exp2_p2: "Processed practicum grade data using Excel.",
    exp3_date: "Aug 2022 — Jan 2023",
    exp3_p1: "Built an e-commerce site using WordPress CMS.",
    exp3_p2: "Developed a warehouse web app using Python/Django.",
    exp3_p3: "Implemented an employee system using PHP/Laravel.",
    exp3_p4:
      "Advertised products on Shopee and Lazada, and livestreamed products on TikTok.",
    exp4_t: "Freelance Programmer",
    exp4_co: "Self-employed",
    remote: "Remote",
    exp4_date: "Jan 2022 — Present",
    exp4_p1:
      "Tailored programming languages, tools, and databases to client needs.",
    exp4_p2: "Built PWAs, web apps, and websites.",
    exp4_p3: "Deployed projects to servers.",
    org1_t: "Staff, Ministry of Education",
    org1_d: "Student Executive Board, Universitas Ahmad Dahlan",
    org2_t: "Staff, RPK Division",
    org3_t: "Media Coordinator",
    org3_d: "PPK Ormawa Team, IMM FKM UAD",
    org4_t: "Staff, Science &amp; Technology Department",
    org4_d: "Informatics Student Association, Universitas Ahmad Dahlan.",
    org5_t: "Head of IT Club",
    ach1_t: "1st Place, UI/UX Competition",
    ach2_t: "Finalist, Web Programming Competition",
    ach3_t: "PPK Ormawa Grant Recipient",
    ach3_d: "Student Organization Capacity Building Program",
    works_title: "Works",
    works_desc:
      "A showcase of application development projects. Click a card to see details.",
    w1_sub: "Clinic Website",
    w2_sub: "Program Profile Website",
    w3_title: "Antarestar Double Sorting System",
    w3_sub: "Warehouse Sorting System",
    w4_sub: "Digital Business Card",
    w5_title: "SMKN 4 TSM Permit System",
    w5_sub: "School Permit System",
    w6_title: "Personal Portfolio",
    w6_sub: "Portfolio Website",
    nav_about: "About",
    source: "Source",
    live: "Live Preview",
    w1_desc:
      "Official website of Kusuma Dental Care, a dental clinic in Yogyakarta, showcasing its services, doctors, and clinic information. Responsive on desktop and mobile. Role: Project Manager.",
    w1_tools: "Project Management, Web Development, Responsive Design",
    w2_desc:
      "Work program profile website for the PPK Ormawa IMM FKM 2025 team, publishing activities, information, and program results to the public.",
    w3_desc:
      "A sorting system for the Antarestar warehouse team that records each input as successful or a detected double (duplicate), with per-staff counters and a real-time clock. Also includes supplier, pre-order, and order approval management.",
    w4_desc:
      "Digital profile cards for Antarestar employees. Admin/HR can add as many staff as needed, and each employee gets a profile page with call, save contact (vCard), email, and social media buttons.",
    w5_desc:
      "Student exit/entry permit system for SMK Negeri 4 Tasikmalaya. Records student data, permit reasons, and duty teachers, with a mobile student detail view and PDF/Excel data export.",
    w6_desc:
      "This personal portfolio website: showcases my profile, education and experience history, and works. Features dark/light mode, two languages (Indonesian/English), an intro animation, and a responsive layout on desktop and mobile.",
  },
};

const typingWords = {
  id: [
    "Mahasiswa Informatika",
    "Pengembang Web",
    "Asisten Praktikum",
    "Programmer Lepas",
  ],
  en: [
    "Informatics Student",
    "Web Developer",
    "Practicum Assistant",
    "Freelance Programmer",
  ],
};

let currentLang = "id";

function applyLanguage(lang) {
  const dict = translations[lang];
  currentLang = lang;
  document.documentElement.lang = lang;

  // Ganti semua teks yang punya penanda data-i18n
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const text = dict[el.getAttribute("data-i18n")];
    if (text !== undefined) el.innerHTML = text;
  });

  // Ganti data popup di kartu Works
  document.querySelectorAll("[data-i18n-card]").forEach((card) => {
    const id = card.getAttribute("data-i18n-card");
    ["title", "desc", "tools"].forEach((field) => {
      const text = dict[id + "_" + field];
      if (text !== undefined) {
        card.setAttribute("data-" + field, text.replace(/&amp;/g, "&"));
      }
    });
  });

  // Ganti kata pada efek mengetik, mulai ulang dari kata baru
  typeWords = typingWords[lang];
  wordIndex = wordIndex % typeWords.length;
  charIndex = 0;
  typingEl.textContent = "";

  // Tombol menampilkan bahasa yang sedang aktif
  document.getElementById("lang-btn").textContent = lang.toUpperCase();

  try {
    localStorage.setItem("lang", lang);
  } catch (e) {}
}

function toggleLanguage() {
  applyLanguage(currentLang === "id" ? "en" : "id");
}

// Pakai bahasa yang terakhir dipilih pengunjung (default: Indonesia)
let savedLang = "id";
try {
  savedLang = localStorage.getItem("lang") || "id";
} catch (e) {}
if (savedLang !== "id") applyLanguage(savedLang);

// --- 4. FITUR SCROLL KE ATAS ---
const bttBtn = document.getElementById("btt-btn");
window.addEventListener("scroll", () => {
  // Munculkan tombol jika di-scroll lebih dari 300px
  if (window.scrollY > 300) bttBtn.classList.add("show");
  else bttBtn.classList.remove("show");
});

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// --- 5. FITUR MODAL POPUP PORTFOLIO ---
function openModal(cardElement) {
  // Mengambil data dari elemen HTML yang diklik
  const title = cardElement.getAttribute("data-title");
  const desc = cardElement.getAttribute("data-desc");
  const tools = cardElement.getAttribute("data-tools").split(",");
  const github = cardElement.getAttribute("data-github");
  const link = cardElement.getAttribute("data-link");
  const imgSrc = cardElement.querySelector(".portfolio-img").src;

  // Memasukkan data ke dalam modal
  document.getElementById("modal-img").src = imgSrc;
  document.getElementById("modal-img").alt = title;
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-desc").textContent = desc;

  // Membuat badge "Tools / Teknologi"
  const badgesContainer = document.getElementById("modal-badges");
  badgesContainer.innerHTML = ""; // Kosongkan dulu
  tools.forEach((tool) => {
    const span = document.createElement("span");
    span.className = "badge";
    span.textContent = tool.trim();
    badgesContainer.appendChild(span);
  });

  // Mengatur visibilitas tombol link (Sembunyikan jika URL = '#')
  const btnGithub = document.getElementById("modal-github");
  btnGithub.href = github;
  btnGithub.style.display = github === "#" || !github ? "none" : "block";

  const btnLive = document.getElementById("modal-link");
  btnLive.href = link;
  btnLive.style.display = link === "#" || !link ? "none" : "block";

  // Tampilkan modal
  document.getElementById("portfolio-modal").classList.add("active");
  document.body.style.overflow = "hidden"; // Kunci scroll di belakang modal
}

function closeModal() {
  document.getElementById("portfolio-modal").classList.remove("active");
  document.body.style.overflow = "auto"; // Buka kembali scroll
}

// Tutup modal jika user klik area hitam di luar modal
window.onclick = function (event) {
  const modal = document.getElementById("portfolio-modal");
  if (event.target == modal) {
    closeModal();
  }
};

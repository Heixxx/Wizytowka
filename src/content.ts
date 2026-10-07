import type { Profile, Project, Settings, Thesis } from './types.ts'

export const settings: Settings = {
  screenshotService: (url) =>
    `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&screenshot.fullPage=true&meta=false&embed=screenshot.url`,
}

const location = 'Rzeszów, praca zdalna lub hybrydowa'

export const profile: Profile = {
  name: 'Adrian Lidwin',
  role: 'Fullstack Developer',
  headline: 'Projektuję, analizuję, tworzę szkolenia, programuję, optymalizuję oraz szukam nowych rozwiązań.',
  tagline: 'Tworzenie ciekawych rozwiązań :)',
  email: 'adrian3981x[]gmail.com',
  phone: '+48 669 364 122',
  location,
  website: 'Wkrótce :)',
  github: 'https://github.com/Heixxx/',
  about: [
    'Najlepiej czuję się na styku projektowania i programowania, gdzie dopracowany detal ma realny wpływ na odbiór produktu. W końcu 1% postępu każdego dnia z czasem daje ogromny efekt.',
    'Na co dzień czytam książki, testuję nowe technologie oraz uczę się kolejnych, nowych rzeczy.',
  ],
  details: [
    { label: 'Lokalizacja', value: location },
    { label: 'Doświadczenie', value: '2 lata' },
    { label: 'Specjalizacja', value: 'frontend, backend (Django od 2026), Linux (od 2026)' },
    { label: 'Języki', value: 'polski, angielski, (w wolnych chwilach) japoński' },
  ],
  stack: ['React', 'TypeScript', 'Django', 'Unity', 'Tailwind CSS', 'PostgreSQL', 'Linux', 'Raspberry Pi'],
}

export const projects: Project[] = [
  {
    title: 'CDN 24',
    year: '2026',
    status: 'done',
    description:
      'Strona internetowa pokazująca najnowsze informacje związane z cyberbezpieczeństwem, podatnościami CVE oraz innymi tematami. Obecnie projekt jest wyłączony.',
    tags: ['React', 'TypeScript', 'AI ACT', 'SCSS', 'Vite'],
    view: 'gallery',
    images: ['cdn24'],
    pageUrl: '',
    pageImage: '',
    // demo: 'https://example.com',
    // repo: 'https://github.com/',
    featured: true,
  },
  {
    title: 'Firma transportowo-usługowa – strona-wizytówka',
    year: '2024',
    status: 'done',
    description:
      'Strona-wizytówka z aktualnymi harmonogramami kursów.',
    tags: ['React', 'TypeScript', 'SCSS', 'Vite'],
    view: 'gallery',
    images: ['bodek'],
    pageUrl: '',
    // pageImage: 'strony/rezerwacje.svg',
    // demo: 'https://bodek.pl',
    // repo: 'https://github.com/',
  },
  {
    title: 'Aplikacje do handlu na giełdzie',
    year: '2026',
    status: 'in-progress',
    description:
      'Aplikacje do testowania różnych strategii handlu na giełdzie. Mam również własną bazę danych na serwerze Mikrus, do której co sekundę trafia ok. 80 parametrów wykorzystywanych w backtestach.',
    tags: ['Python', 'Linux', 'AI', 'PostgreSQL'],
    view: 'gallery',
    images: ['krypto'],
    pageUrl: '',
    // pageImage: 'strony/rezerwacje.svg',
    // demo: 'https://bodek.pl',
    // repo: 'https://github.com/',
  },
  {
    title: 'Strona-wizytówka o implantach',
    year: '2026',
    status: 'done',
    description:
      'Prosta strona-wizytówka z informacjami o implantach, ich rodzajach oraz możliwością kontaktu.',
    tags: ['React', 'TypeScript', 'SCSS', 'Vite'],
    view: 'gallery',
    images: ['dental-implant'],
    pageUrl: '',
    // pageImage: 'strony/rezerwacje.svg',
    demo: 'https://dentalimplantacademy.pl',
    // repo: 'https://github.com/',
  },
  {
    title: 'Nazwa robocza: BetterAsana',
    year: '2026',
    status: 'in-progress',
    progress: 80,
    description:
      'Wewnętrzna aplikacja koła naukowego na uczelni do zarządzania zadaniami, projektami oraz ich harmonogramem. Ma zaawansowane zabezpieczenia oparte na długich kluczach i konfigurowalne uprawnienia. Zmiany wprowadzane przez innych użytkowników widać od razu, a kafelki można zaznaczać i łączyć w dowolne kombinacje. Wygląd wzorowany jest na tablicy detektywistycznej z dowodami. Aplikacja ma ułatwiać organizację pracy i dawać satysfakcję z wykonanych zadań.',
    tags: ['React', 'Job satisfaction', 'Supabase'],
    view: 'gallery',
    images: ['betterasana'],
    pageUrl: '',
    pageImage: '',
    demo: '',
    // repo: 'https://github.com/',
  },
  {
    title: 'Nazwa robocza: Protokół/Protocol',
    year: '2026',
    status: 'in-progress',
    progress: 25,
    description:
      'Narzędzie odpowiadające za organizację spotkań, zebranie najważniejszych informacji oraz tworzenie notatek.',
    tags: ['React'],
    view: 'gallery',
    images: ['protocol'],
    pageUrl: '',
    pageImage: '',
    demo: '',
    // repo: 'https://github.com/',
  },
  {
    title: 'Nazwa robocza: Pixio',
    year: '2026',
    status: 'in-progress',
    progress: 65,
    description:
      'Mój przyszły flagowiec. Strona zmniejszająca wagę zdjęć o ok. 30–80% i pozwalająca ukrywać informacje wewnątrz zdjęcia. Dzięki temu zdjęciami można zarządzać naprawdę wygodnie :).',
    tags: ['React'],
    view: 'gallery',
    images: ['pixio'],
    pageUrl: '',
    pageImage: '',
    demo: '',
    // repo: 'https://github.com/',
  },
  {
    title: 'Szkolenia',
    year: '2026',
    status: 'done',
    // progress: 0,
    description:
      'Szkolenia z SQL, SQLi i XSS oraz pokaz podatności CVE-2025-8088 (podatność w programie WinRAR).',
    tags: ['SQL', 'SQLi', 'XSS', 'CVE-2025-8088'],
    view: 'gallery',
    images: ['szkolenia'],
    pageUrl: '',
    pageImage: '',
    demo: '',
    // repo: 'https://github.com/',
  },
  {
    title: 'Inne',
    year: '2026',
    status: 'in-progress',
    // progress: 0,
    description:
      'Projekty, które nie zostały jeszcze opisane. M.in. system do ewidencji czasu pracy, którego nie da się oszukać w stylu „odbij kartę za mnie”. Kolejny to urządzenie z AI i LIDAR-em. Wszystko czeka, aż nauczę się elektroniki :)',
    tags: ['React', 'Linux', 'Django', 'AI'],
    view: 'gallery',
    images: ['inne'],
    pageUrl: '',
    pageImage: '',
    demo: '',
    // repo: 'https://github.com/',
  },

]

export const theses: Thesis[] = [
    {
    degree: 'Praca inżynierska',
    level: 'engineer',
    title: 'Paranormal VR Detective w Unity',
    university: 'Państwowa Akademia Nauk Stosowanych w Krośnie',
    field: 'Informatyka',
    specialization: 'Bazy danych',
    year: '2020–2024',
    // supervisor: 'dr inż. ',
    grade: '4,5',
    abstract:
      'Aplikacja w Unity na gogle VR. Celem pracy było stworzenie prototypu aplikacji, która pozwala na interakcję z obiektami i jak najpełniej wykorzystuje wrażenia, jakie dają gogle VR.',
    keywords: ['C#', 'Unity', 'VR'],
    images: ['praca-inzynierska'],
    pdf: '',
    // repo: 'https://github.com/',
  },
  {
    degree: 'Praca magisterska',
    level: 'master',
    title: 'Zastosowanie uczenia maszynowego w analizie sentymentu recenzji w języku angielskim',
    university: 'Wyższa Szkoła Informatyki i Zarządzania w Rzeszowie',
    field: 'Informatyka',
    specialization: 'Cyberbezpieczeństwo',
    year: '2024–2025',
    // supervisor: 'dr hab. inż. Anna Nowak',
    grade: '4,5',
    abstract:
      'Porównanie modeli z rodziny BERT z klasycznymi modelami uczenia maszynowego w ocenie sentymentu recenzji w języku angielskim.',
    keywords: ['Machine Learning', 'NLP', 'BERT', 'Sentiment Analysis'],
    images: ['praca-magisterska'],
    pdf: '',
    // repo: 'https://github.com/',
  },
  {
    degree: 'Praca magisterska',
    level: 'master',
    upcoming: true,
    title: 'Wkrótce',
    university: 'Uniwersytet Komisji Edukacji Narodowej w Krakowie',
  },
  {
    degree: 'Doktorat',
    level: 'doctorate',
    upcoming: true,
    title: 'Wkrótce',
  },
]

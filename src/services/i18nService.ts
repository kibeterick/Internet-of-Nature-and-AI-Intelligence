// Internationalization and localization
export type Language = "en" | "es" | "fr" | "de" | "zh" | "ar" | "pt" | "sw";

export interface Translation {
  [key: string]: string | Translation;
}

const translations: Record<Language, Translation> = {
  en: {
    common: {
      welcome: "Welcome to Internet of Nature",
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      search: "Search",
      filter: "Filter",
      export: "Export",
      import: "Import",
    },
    nav: {
      home: "Home",
      dashboard: "Dashboard",
      map: "Map",
      species: "Species",
      analytics: "Analytics",
      reports: "Reports",
      settings: "Settings",
    },
    dashboard: {
      title: "Dashboard",
      overview: "Overview",
      recentActivity: "Recent Activity",
      statistics: "Statistics",
      alerts: "Alerts",
    },
    species: {
      identify: "Identify Species",
      catalog: "Species Catalog",
      observations: "Observations",
      endangered: "Endangered Species",
    },
  },
  es: {
    common: {
      welcome: "Bienvenido a Internet de la Naturaleza",
      loading: "Cargando...",
      save: "Guardar",
      cancel: "Cancelar",
      delete: "Eliminar",
      edit: "Editar",
      search: "Buscar",
      filter: "Filtrar",
      export: "Exportar",
      import: "Importar",
    },
    nav: {
      home: "Inicio",
      dashboard: "Panel",
      map: "Mapa",
      species: "Especies",
      analytics: "Análisis",
      reports: "Informes",
      settings: "Configuración",
    },
    dashboard: {
      title: "Panel de Control",
      overview: "Resumen",
      recentActivity: "Actividad Reciente",
      statistics: "Estadísticas",
      alerts: "Alertas",
    },
    species: {
      identify: "Identificar Especies",
      catalog: "Catálogo de Especies",
      observations: "Observaciones",
      endangered: "Especies en Peligro",
    },
  },
  fr: {
    common: {
      welcome: "Bienvenue sur Internet de la Nature",
      loading: "Chargement...",
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      edit: "Modifier",
      search: "Rechercher",
      filter: "Filtrer",
      export: "Exporter",
      import: "Importer",
    },
    nav: {
      home: "Accueil",
      dashboard: "Tableau de bord",
      map: "Carte",
      species: "Espèces",
      analytics: "Analytique",
      reports: "Rapports",
      settings: "Paramètres",
    },
    dashboard: {
      title: "Tableau de Bord",
      overview: "Aperçu",
      recentActivity: "Activité Récente",
      statistics: "Statistiques",
      alerts: "Alertes",
    },
    species: {
      identify: "Identifier les Espèces",
      catalog: "Catalogue des Espèces",
      observations: "Observations",
      endangered: "Espèces Menacées",
    },
  },
  de: {
    common: {
      welcome: "Willkommen beim Internet der Natur",
      loading: "Laden...",
      save: "Speichern",
      cancel: "Abbrechen",
      delete: "Löschen",
      edit: "Bearbeiten",
      search: "Suchen",
      filter: "Filtern",
      export: "Exportieren",
      import: "Importieren",
    },
    nav: {
      home: "Startseite",
      dashboard: "Dashboard",
      map: "Karte",
      species: "Arten",
      analytics: "Analytik",
      reports: "Berichte",
      settings: "Einstellungen",
    },
    dashboard: {
      title: "Dashboard",
      overview: "Übersicht",
      recentActivity: "Letzte Aktivität",
      statistics: "Statistiken",
      alerts: "Warnungen",
    },
    species: {
      identify: "Arten Identifizieren",
      catalog: "Artenkatalog",
      observations: "Beobachtungen",
      endangered: "Gefährdete Arten",
    },
  },
  zh: {
    common: {
      welcome: "欢迎来到自然互联网",
      loading: "加载中...",
      save: "保存",
      cancel: "取消",
      delete: "删除",
      edit: "编辑",
      search: "搜索",
      filter: "筛选",
      export: "导出",
      import: "导入",
    },
    nav: {
      home: "首页",
      dashboard: "仪表板",
      map: "地图",
      species: "物种",
      analytics: "分析",
      reports: "报告",
      settings: "设置",
    },
    dashboard: {
      title: "仪表板",
      overview: "概览",
      recentActivity: "最近活动",
      statistics: "统计",
      alerts: "警报",
    },
    species: {
      identify: "识别物种",
      catalog: "物种目录",
      observations: "观察记录",
      endangered: "濒危物种",
    },
  },
  ar: {
    common: {
      welcome: "مرحبا بك في إنترنت الطبيعة",
      loading: "جاري التحميل...",
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      edit: "تعديل",
      search: "بحث",
      filter: "تصفية",
      export: "تصدير",
      import: "استيراد",
    },
    nav: {
      home: "الرئيسية",
      dashboard: "لوحة التحكم",
      map: "الخريطة",
      species: "الأنواع",
      analytics: "التحليلات",
      reports: "التقارير",
      settings: "الإعدادات",
    },
    dashboard: {
      title: "لوحة التحكم",
      overview: "نظرة عامة",
      recentActivity: "النشاط الأخير",
      statistics: "الإحصائيات",
      alerts: "التنبيهات",
    },
    species: {
      identify: "تحديد الأنواع",
      catalog: "كتالوج الأنواع",
      observations: "الملاحظات",
      endangered: "الأنواع المهددة",
    },
  },
  pt: {
    common: {
      welcome: "Bem-vindo à Internet da Natureza",
      loading: "Carregando...",
      save: "Salvar",
      cancel: "Cancelar",
      delete: "Excluir",
      edit: "Editar",
      search: "Pesquisar",
      filter: "Filtrar",
      export: "Exportar",
      import: "Importar",
    },
    nav: {
      home: "Início",
      dashboard: "Painel",
      map: "Mapa",
      species: "Espécies",
      analytics: "Análises",
      reports: "Relatórios",
      settings: "Configurações",
    },
    dashboard: {
      title: "Painel de Controle",
      overview: "Visão Geral",
      recentActivity: "Atividade Recente",
      statistics: "Estatísticas",
      alerts: "Alertas",
    },
    species: {
      identify: "Identificar Espécies",
      catalog: "Catálogo de Espécies",
      observations: "Observações",
      endangered: "Espécies Ameaçadas",
    },
  },
  sw: {
    common: {
      welcome: "Karibu kwenye Mtandao wa Asili",
      loading: "Inapakia...",
      save: "Hifadhi",
      cancel: "Ghairi",
      delete: "Futa",
      edit: "Hariri",
      search: "Tafuta",
      filter: "Chuja",
      export: "Hamisha",
      import: "Leta",
    },
    nav: {
      home: "Nyumbani",
      dashboard: "Dashibodi",
      map: "Ramani",
      species: "Aina",
      analytics: "Uchambuzi",
      reports: "Ripoti",
      settings: "Mipangilio",
    },
    dashboard: {
      title: "Dashibodi",
      overview: "Muhtasari",
      recentActivity: "Shughuli za Hivi Karibuni",
      statistics: "Takwimu",
      alerts: "Tahadhari",
    },
    species: {
      identify: "Tambua Aina",
      catalog: "Katalogi ya Aina",
      observations: "Uchunguzi",
      endangered: "Aina Zilizo Hatarini",
    },
  },
};

let currentLanguage: Language = "en";

// Get current language
export function getCurrentLanguage(): Language {
  return currentLanguage;
}

// Set language
export function setLanguage(lang: Language): void {
  currentLanguage = lang;
  localStorage.setItem("ion_language", lang);

  // Update HTML lang attribute
  document.documentElement.lang = lang;

  // Update direction for RTL languages
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

// Initialize language from storage or browser
export function initializeLanguage(): Language {
  const stored = localStorage.getItem("ion_language") as Language;
  if (stored && translations[stored]) {
    setLanguage(stored);
    return stored;
  }

  // Detect browser language
  const browserLang = navigator.language.split("-")[0] as Language;
  if (translations[browserLang]) {
    setLanguage(browserLang);
    return browserLang;
  }

  return "en";
}

// Get translation
export function t(key: string, params?: Record<string, string>): string {
  const keys = key.split(".");
  let value: any = translations[currentLanguage];

  for (const k of keys) {
    if (value && typeof value === "object") {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  if (typeof value !== "string") {
    return key;
  }

  // Replace parameters
  if (params) {
    Object.keys(params).forEach((param) => {
      value = value.replace(`{${param}}`, params[param]);
    });
  }

  return value;
}

// Get all available languages
export function getAvailableLanguages(): Array<{
  code: Language;
  name: string;
  nativeName: string;
}> {
  return [
    { code: "en", name: "English", nativeName: "English" },
    { code: "es", name: "Spanish", nativeName: "Español" },
    { code: "fr", name: "French", nativeName: "Français" },
    { code: "de", name: "German", nativeName: "Deutsch" },
    { code: "zh", name: "Chinese", nativeName: "中文" },
    { code: "ar", name: "Arabic", nativeName: "العربية" },
    { code: "pt", name: "Portuguese", nativeName: "Português" },
    { code: "sw", name: "Swahili", nativeName: "Kiswahili" },
  ];
}

// Format number based on locale
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat(currentLanguage, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

// Format date based on locale
export function formatDate(
  date: Date,
  format: "short" | "long" | "full" = "short",
): string {
  const options: Intl.DateTimeFormatOptions =
    format === "short"
      ? { year: "numeric", month: "numeric", day: "numeric" }
      : format === "long"
        ? { year: "numeric", month: "long", day: "numeric" }
        : { weekday: "long", year: "numeric", month: "long", day: "numeric" };

  return new Intl.DateTimeFormat(currentLanguage, options).format(date);
}

// Format currency
export function formatCurrency(
  amount: number,
  currency: string = "USD",
): string {
  return new Intl.NumberFormat(currentLanguage, {
    style: "currency",
    currency,
  }).format(amount);
}

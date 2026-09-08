import { cookies } from "next/headers";
import { getSettings } from "@/lib/data";

export type Locale = "es" | "en" | "pt";
export const LOCALES: { code: Locale; label: string }[] = [
  { code: "es", label: "ES" },
  { code: "en", label: "EN" },
  { code: "pt", label: "PT" },
];
export const LOCALE_COOKIE = "NEXT_LOCALE";

type Dict = typeof dictionaries.es;

export const dictionaries = {
  es: {
    nav: {
      home: "Inicio", calendar: "Calendario", standings: "Posiciones", drivers: "Pilotos",
      teams: "Escuderías", results: "Resultados", penalties: "Penalizaciones",
      regulation: "Reglamento", registration: "Inscripciones", contact: "Contacto",
    },
    common: {
      watchStream: "Ver transmisión", viewChampionship: "Ver campeonato",
      seeCalendar: "Ver calendario completo", seeAll: "Ver todas", seeFull: "Ver completo",
      loading: "Cargando…", back: "Volver", round: "Ronda", sprint: "Sprint",
      points: "Pts", wins: "Vict.", podiums: "Podios", poles: "Poles", fl: "VR",
      pos: "Pos", driver: "Piloto", team: "Equipo", time: "Tiempo / Gap",
      nationality: "Nacionalidad", all: "Todas", titular: "Titular", reserve: "Reserva",
      inPit: "¡En pista!", days: "Días", hours: "Horas", min: "Min", sec: "Seg",
    },
    home: {
      nextRace: "Próxima fecha", currentChampionship: "Campeonato actual",
      latestNews: "Últimas noticias", drivers: "Pilotos", constructors: "Constructores",
      join: "Sumate", registration: "Inscripciones", open: "Abiertas", closed: "Cerradas por ahora",
      register: "Inscribirme", noResults: "Sin resultados cargados todavía.",
      noNextDate: "Todavía no hay una próxima fecha cargada.", category: "Categoría",
      timeTbd: "Horario a confirmar",
    },
    status: { upcoming: "Próxima", finished: "Finalizada", cancelled: "Cancelada" },
    pages: {
      calendarTitle: "Calendario",
      calendarSub: "Todas las rondas de la temporada. Las fechas finalizadas enlazan a sus resultados.",
      calendarEmpty: "No hay fechas cargadas todavía.",
      standingsTitle: "Posiciones",
      standingsSub: "Clasificación de pilotos y constructores.",
      driversTitle: "Pilotos", driversSub: "La parrilla actual con nacionalidad, número y escudería.",
      driversEmpty: "No hay pilotos cargados todavía.",
      teamsTitle: "Escuderías", teamsSub: "Los constructores de la temporada, con sus colores y pilotos.",
      teamsEmpty: "No hay escuderías cargadas todavía.",
      resultsTitle: "Resultados", resultsSub: "Qualy y carrera de cada ronda disputada.",
      resultsEmpty: "Todavía no hay rondas finalizadas.", seeResults: "Ver resultados",
      qualifying: "Clasificación", race: "Carrera",
      penaltiesTitle: "Penalizaciones", penaltiesSub: "Sanciones aplicadas por los comisarios durante la temporada.",
      penaltiesEmpty: "No hay sanciones cargadas.",
      regulationTitle: "Reglamento oficial", regulationSub: "Normativa deportiva y de conducta de la liga.",
      regulationEmpty: "El reglamento todavía no fue publicado.",
      registrationTitle: "Inscripciones",
      registrationSub: "Completá el formulario para pedir tu lugar en la parrilla.",
      contactTitle: "Contacto", contactSub: "Escribinos por los canales oficiales o directamente a la organización.",
      contactOrg: "Organización", contactChannels: "Canales", contactEmpty: "Todavía no se cargaron los contactos.",
      newsTitle: "Noticias", newsEmpty: "No hay noticias publicadas.",
      notFoundTitle: "Página no encontrada", backHome: "Volver al inicio",
      maintenanceTitle: "Sitio en mantenimiento",
      maintenanceMsg: "Estamos actualizando el sitio. Volvé en un rato.",
      sponsors: "Sponsors",
    },
    footer: { panel: "Panel" },
  },

  en: {
    nav: {
      home: "Home", calendar: "Calendar", standings: "Standings", drivers: "Drivers",
      teams: "Teams", results: "Results", penalties: "Penalties",
      regulation: "Rules", registration: "Sign up", contact: "Contact",
    },
    common: {
      watchStream: "Watch stream", viewChampionship: "View championship",
      seeCalendar: "See full calendar", seeAll: "See all", seeFull: "See full",
      loading: "Loading…", back: "Back", round: "Round", sprint: "Sprint",
      points: "Pts", wins: "Wins", podiums: "Podiums", poles: "Poles", fl: "FL",
      pos: "Pos", driver: "Driver", team: "Team", time: "Time / Gap",
      nationality: "Nationality", all: "All", titular: "Race seat", reserve: "Reserve",
      inPit: "Live now!", days: "Days", hours: "Hours", min: "Min", sec: "Sec",
    },
    home: {
      nextRace: "Next race", currentChampionship: "Current championship",
      latestNews: "Latest news", drivers: "Drivers", constructors: "Constructors",
      join: "Join", registration: "Sign up", open: "Open", closed: "Closed for now",
      register: "Sign up", noResults: "No results loaded yet.",
      noNextDate: "No upcoming race scheduled yet.", category: "Category",
      timeTbd: "Time TBC",
    },
    status: { upcoming: "Upcoming", finished: "Finished", cancelled: "Cancelled" },
    pages: {
      calendarTitle: "Calendar",
      calendarSub: "Every round of the season. Finished rounds link to their results.",
      calendarEmpty: "No rounds loaded yet.",
      standingsTitle: "Standings",
      standingsSub: "Driver and constructor standings.",
      driversTitle: "Drivers", driversSub: "The current grid with nationality, number and team.",
      driversEmpty: "No drivers loaded yet.",
      teamsTitle: "Teams", teamsSub: "This season's constructors, with their colours and drivers.",
      teamsEmpty: "No teams loaded yet.",
      resultsTitle: "Results", resultsSub: "Qualifying and race for every completed round.",
      resultsEmpty: "No finished rounds yet.", seeResults: "See results",
      qualifying: "Qualifying", race: "Race",
      penaltiesTitle: "Penalties", penaltiesSub: "Sanctions issued by the stewards during the season.",
      penaltiesEmpty: "No sanctions loaded.",
      regulationTitle: "Official rules", regulationSub: "Sporting and conduct regulations of the league.",
      regulationEmpty: "The rules haven't been published yet.",
      registrationTitle: "Sign up",
      registrationSub: "Fill in the form to request your spot on the grid.",
      contactTitle: "Contact", contactSub: "Reach us through the official channels or directly to the organisers.",
      contactOrg: "Organisers", contactChannels: "Channels", contactEmpty: "No contacts loaded yet.",
      newsTitle: "News", newsEmpty: "No news published yet.",
      notFoundTitle: "Page not found", backHome: "Back to home",
      maintenanceTitle: "Site under maintenance",
      maintenanceMsg: "We're updating the site. Check back soon.",
      sponsors: "Sponsors",
    },
    footer: { panel: "Admin" },
  },

  pt: {
    nav: {
      home: "Início", calendar: "Calendário", standings: "Classificação", drivers: "Pilotos",
      teams: "Equipes", results: "Resultados", penalties: "Punições",
      regulation: "Regulamento", registration: "Inscrições", contact: "Contato",
    },
    common: {
      watchStream: "Ver transmissão", viewChampionship: "Ver campeonato",
      seeCalendar: "Ver calendário completo", seeAll: "Ver tudo", seeFull: "Ver completo",
      loading: "Carregando…", back: "Voltar", round: "Rodada", sprint: "Sprint",
      points: "Pts", wins: "Vit.", podiums: "Pódios", poles: "Poles", fl: "VR",
      pos: "Pos", driver: "Piloto", team: "Equipe", time: "Tempo / Gap",
      nationality: "Nacionalidade", all: "Todas", titular: "Titular", reserve: "Reserva",
      inPit: "Ao vivo!", days: "Dias", hours: "Horas", min: "Min", sec: "Seg",
    },
    home: {
      nextRace: "Próxima corrida", currentChampionship: "Campeonato atual",
      latestNews: "Últimas notícias", drivers: "Pilotos", constructors: "Construtores",
      join: "Participe", registration: "Inscrições", open: "Abertas", closed: "Fechadas por enquanto",
      register: "Quero me inscrever", noResults: "Sem resultados carregados ainda.",
      noNextDate: "Ainda não há próxima corrida agendada.", category: "Categoria",
      timeTbd: "Horário a confirmar",
    },
    status: { upcoming: "Próxima", finished: "Finalizada", cancelled: "Cancelada" },
    pages: {
      calendarTitle: "Calendário",
      calendarSub: "Todas as rodadas da temporada. As finalizadas levam aos resultados.",
      calendarEmpty: "Nenhuma rodada carregada ainda.",
      standingsTitle: "Classificação",
      standingsSub: "Classificação de pilotos e construtores.",
      driversTitle: "Pilotos", driversSub: "O grid atual com nacionalidade, número e equipe.",
      driversEmpty: "Nenhum piloto carregado ainda.",
      teamsTitle: "Equipes", teamsSub: "Os construtores da temporada, com suas cores e pilotos.",
      teamsEmpty: "Nenhuma equipe carregada ainda.",
      resultsTitle: "Resultados", resultsSub: "Classificação e corrida de cada rodada disputada.",
      resultsEmpty: "Ainda não há rodadas finalizadas.", seeResults: "Ver resultados",
      qualifying: "Classificação", race: "Corrida",
      penaltiesTitle: "Punições", penaltiesSub: "Sanções aplicadas pelos comissários durante a temporada.",
      penaltiesEmpty: "Nenhuma sanção carregada.",
      regulationTitle: "Regulamento oficial", regulationSub: "Normas esportivas e de conduta da liga.",
      regulationEmpty: "O regulamento ainda não foi publicado.",
      registrationTitle: "Inscrições",
      registrationSub: "Preencha o formulário para pedir sua vaga no grid.",
      contactTitle: "Contato", contactSub: "Fale com a gente pelos canais oficiais ou direto com a organização.",
      contactOrg: "Organização", contactChannels: "Canais", contactEmpty: "Contatos ainda não carregados.",
      newsTitle: "Notícias", newsEmpty: "Nenhuma notícia publicada ainda.",
      notFoundTitle: "Página não encontrada", backHome: "Voltar ao início",
      maintenanceTitle: "Site em manutenção",
      maintenanceMsg: "Estamos atualizando o site. Volte em breve.",
      sponsors: "Patrocinadores",
    },
    footer: { panel: "Painel" },
  },
} as const;

export function isLocale(v: unknown): v is Locale {
  return v === "es" || v === "en" || v === "pt";
}

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const fromCookie = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;
  try {
    const s = await getSettings();
    if (isLocale(s.default_locale)) return s.default_locale;
  } catch {
    /* noop */
  }
  return "es";
}

export async function getDict(): Promise<Dict> {
  const locale = await getLocale();
  return dictionaries[locale];
}

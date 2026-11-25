// Real ShrimpPub event posters data (active events first, then passed archive events)
const rawEventsData = [
  {
    id: 'evt-newyear',
    status: 'active',
    title: 'Работаем в Новогоднюю Ночь',
    dateLabel: '1 Января с 18:00',
    image: 'event_newyear.webp',
    width: 896,
    height: 1280,
    alt: 'Афиша ShrimpPub: Впервые в истории креветки! Работаем в Новогоднюю Ночь — 1 Января часиков с 18.00',
  },
  {
    id: 'evt-mashaloveen',
    status: 'passed',
    title: 'MashaLoveeen: Из Halloween в Днюху',
    dateLabel: '31 октября — 1 ноября',
    image: 'event_halloween.webp',
    width: 906,
    height: 1280,
    alt: 'Афиша ShrimpPub: MashaLoveeen — 31 октября старт в 20.00, 1 ноября Днюха Машули',
  },
  {
    id: 'evt-anniversary-6',
    status: 'passed',
    title: 'Креветочке 6 лет!',
    dateLabel: '20–21 февраля',
    image: 'event_anniversary_6.webp',
    width: 947,
    height: 1280,
    alt: 'Афиша шестилетия Shrimp Pub: «Флэш Рояль» 20 февраля и «Дважды не Мы» 21 февраля',
  },
  {
    id: 'evt-mashuli-birthday',
    status: 'passed',
    title: 'Широкое празднование днюхи Машули',
    dateLabel: '1 ноября в 20:00',
    image: 'event_mashuli_birthday.webp',
    width: 895,
    height: 1280,
    alt: 'Афиша дня рождения Машули: 1 ноября в 20:00, концерт «Дважды не Мы»',
  },
  {
    id: 'evt-helloozzyn',
    status: 'passed',
    title: 'HelloOzzyn',
    dateLabel: '31 октября в 20:00',
    image: 'event_helloozzyn.webp',
    width: 906,
    height: 1280,
    alt: 'Афиша HelloOzzyn: 31 октября в 20:00, «Приходи в ОбрOZZy»',
  },
  {
    id: 'evt-dimka-45',
    status: 'passed',
    title: 'Димка ягодка опять',
    image: 'event_dimka_45.webp',
    width: 905,
    height: 1280,
    alt: 'Афиша «Димка ягодка опять»: 45-летие и герой в костюме клубники',
  },
  {
    id: 'evt-beer-exodus',
    status: 'passed',
    title: 'День великого пивного исхода и святого Баллантайна',
    image: 'event_beer_exodus.webp',
    width: 1280,
    height: 1280,
    alt: 'Афиша Shrimp Pub «День великого пивного исхода и святого Баллантайна»',
  },
  {
    id: 'evt-february-concert',
    status: 'passed',
    title: 'Долгожданный концерт прекрасных ребят',
    dateLabel: '14 февраля в 21:00',
    image: 'event_february_concert.webp',
    width: 928,
    height: 1280,
    alt: 'Афиша концерта к шестилетию Shrimp Pub: 14 февраля в 21:00',
  },
];

export const activeEvents = rawEventsData.filter((evt) => evt.status === 'active');
export const passedEvents = rawEventsData.filter((evt) => evt.status === 'passed');

// Backward-compatible export sorted with active events first, followed by passed events
export const eventsPostersData = [...activeEvents, ...passedEvents];

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
];

export const activeEvents = rawEventsData.filter((evt) => evt.status === 'active');
export const passedEvents = rawEventsData.filter((evt) => evt.status === 'passed');

// Backward-compatible export sorted with active events first, followed by passed events
export const eventsPostersData = [...activeEvents, ...passedEvents];

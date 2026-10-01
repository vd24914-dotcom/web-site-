// Реестр всего редактируемого контента сайта: тексты и картинки.
// Каждое поле — ключ в таблице SiteSettings. Если в админке поле пустое,
// на сайте показывается значение `def` отсюда. Админка («Контент сайта»)
// строится по этому списку автоматически: добавили поле здесь — оно появилось там.

export type FieldType = 'text' | 'textarea' | 'image' | 'url' | 'datetime' | 'toggle' | 'emoji' | 'icon'

export interface ContentField {
  key: string
  label: string
  def?: string
  type?: FieldType
  hint?: string
  /** Подблок внутри раздела: поля с одинаковым section показываются вместе (иконка + её тексты) */
  section?: string
}

export interface ContentGroup {
  id: string
  title: string
  description?: string
  fields: ContentField[]
}

const tx = (key: string, label: string, def = '', hint?: string): ContentField => ({ key, label, def, hint })
const ta = (key: string, label: string, def = '', hint?: string): ContentField => ({ key, label, def, hint, type: 'textarea' })
const img = (key: string, label: string, hint?: string): ContentField => ({ key, label, type: 'image', hint })
/** Иконка: пусто — стандартная иконка сайта, можно загрузить свою картинку */
const ico = (key: string, label = 'Иконка', hint?: string): ContentField => ({ key, label, type: 'icon', hint })
/** Подблок раздела: иконка и тексты одного элемента рядом */
const sec = (section: string, fields: ContentField[]): ContentField[] => fields.map((f) => ({ ...f, section }))

export const CONTENT: ContentGroup[] = [
  {
    id: 'general', title: 'Общее', description: 'Название, логотип и картинка для соцсетей',
    fields: [
      tx('site_name', 'Название сайта', 'Fimush.kin'),
      img('logo_image', 'Логотип', 'PNG с прозрачным фоном. Показывается в шапке и подвале'),
      { key: 'logo_emoji', label: 'Эмодзи вместо логотипа (если картинки нет)', def: '🧶', type: 'emoji' },
      { key: 'logo_show_text', label: 'Показывать название рядом с логотипом', def: '1', type: 'toggle' },
      img('og_image', 'Картинка для ссылок в соцсетях', '1200×630, показывается при отправке ссылки в Telegram, WhatsApp'),
    ],
  },
  {
    id: 'header', title: 'Шапка и меню', description: 'Пункты меню на внутренних страницах и кнопки шапки',
    fields: [
      tx('nav_catalog', 'Меню: каталог', 'Каталог'),
      tx('nav_sale', 'Меню: скидки', 'Скидки'),
      tx('nav_news', 'Меню: новости', 'Новости'),
      tx('nav_about', 'Меню: о нас', 'О нас'),
      tx('nav_contacts', 'Меню: контакты', 'Контакты'),
      tx('header_order_btn', 'Кнопка в шапке', 'Заказать'),
      tx('search_btn', 'Кнопка поиска', 'Поиск'),
      ico('icon_cart', 'Иконка корзины', 'В шапке и в заголовке корзины'),
    ],
  },
  {
    id: 'hero', title: 'Первый экран', description: 'Заголовок главной, кнопка, меню и карточки категорий',
    fields: [
      ta('hero_title', 'Заголовок (две строки)', 'Тепло, которое чувствуется\nв каждой петельке', 'Enter — перенос. Первая строка тёмная, вторая розовая'),
      ta('hero_subtitle', 'Подзаголовок', 'Вязаные изделия ручной работы — свитеры, шапки, пледы и игрушки. Каждое изделие создаётся с любовью специально для вас.'),
      tx('hero_cta', 'Кнопка — текст', 'Заказать'),
      { key: 'hero_cta_href', label: 'Кнопка — ссылка', def: '/catalog', type: 'url' },
    ],
  },
  {
    id: 'benefits', title: 'Преимущества', description: 'Четыре плашки под первым экраном',
    fields: [
      ...sec('Плашка 1', [ico('benefit1_icon'), tx('benefit1_title', 'Заголовок', 'С любовью'), ta('benefit1_desc', 'Текст', 'Каждое изделие вяжется вручную с особой заботой')]),
      ...sec('Плашка 2', [ico('benefit2_icon'), tx('benefit2_title', 'Заголовок', 'Под заказ'), ta('benefit2_desc', 'Текст', 'Выбирайте цвет, размер и узор — сделаем именно для вас')]),
      ...sec('Плашка 3', [ico('benefit3_icon'), tx('benefit3_title', 'Заголовок', 'Качество'), ta('benefit3_desc', 'Текст', 'Только натуральные нити премиального качества')]),
      ...sec('Плашка 4', [ico('benefit4_icon'), tx('benefit4_title', 'Заголовок', 'Доставка'), ta('benefit4_desc', 'Текст', 'Доставляем по всему Узбекистану')]),
    ],
  },
  {
    id: 'featured', title: 'Популярные изделия', description: 'Блок на главной с отмеченными товарами',
    fields: [
      tx('featured_title', 'Заголовок', 'Популярные изделия'),
      tx('featured_subtitle', 'Подзаголовок', 'Самые востребованные работы'),
      tx('featured_btn', 'Кнопка', 'Смотреть ещё'),
    ],
  },
  {
    id: 'sale', title: 'Акции', description: 'Блок «Товары на акции», баннер с таймером и страница скидок',
    fields: [
      tx('sale_block_badge', 'Блок на главной — метка', 'Акция'),
      tx('sale_block_title', 'Блок на главной — заголовок', 'Товары на акции'),
      tx('sale_block_subtitle', 'Блок на главной — подзаголовок', 'Успейте заказать по выгодной цене, пока действует скидка'),
      tx('sale_block_btn', 'Блок на главной — кнопка', 'Смотреть ещё'),
      tx('sale_title', 'Баннер вверху — текст', 'Акция! Успейте'),
      { key: 'sale_end', label: 'Баннер вверху — акция до', type: 'datetime', hint: 'Пусто — баннера нет. Когда время выйдет, он исчезнет сам' },
      tx('sale_page_badge', 'Страница скидок — метка', 'Акция'),
      tx('sale_page_title', 'Страница скидок — заголовок', 'Скидки'),
      tx('sale_page_subtitle', 'Страница скидок — подзаголовок', 'Изделия ручной работы по выгодной цене'),
      tx('sale_page_empty', 'Страница скидок — если пусто', 'Сейчас нет товаров со скидкой. Загляните позже!'),
      tx('sale_page_empty_btn', 'Страница скидок — кнопка', 'Перейти в каталог'),
    ],
  },
  {
    id: 'reels', title: 'Рилсы', description: 'Подписи блока и сами видео из Instagram',
    fields: [
      tx('reels_badge', 'Метка', 'Instagram'),
      tx('reels_title', 'Заголовок', 'Рилсы из мастерской'),
      tx('reels_subtitle', 'Подзаголовок', 'Процесс, новинки и немного уюта — подписывайтесь в Instagram'),
      tx('reels_btn', 'Кнопка', 'Смотреть в Instagram'),
    ],
  },
  {
    id: 'about', title: 'О мастере', description: 'Блок с фото и рассказом',
    fields: [
      img('about_image', 'Фото мастера', 'Вертикальное или квадратное фото'),
      { key: 'about_icon', label: 'Эмодзи, если фото нет', def: '👩‍🎨', type: 'emoji' },
      tx('about_badge', 'Метка', 'О мастере'),
      tx('about_title', 'Заголовок', 'Создаю тепло своими руками'),
      ta('about_text', 'Текст', 'Вязанием занимаюсь уже более 10 лет. Каждое изделие — это не просто вещь, это частичка души, вложенная в каждую петельку. Работаю с натуральными нитями: мериносовая шерсть, хлопок, альпака.'),
    ],
  },
  {
    id: 'cta', title: 'Блок «Заказать»', description: 'Розовая полоса внизу главной',
    fields: [
      tx('cta_title', 'Заголовок', 'Хотите заказать?'),
      ta('cta_text', 'Текст', 'Оставьте заявку — я свяжусь с вами и обсудим все детали вашего заказа'),
      tx('cta_btn', 'Кнопка', 'Оставить заявку'),
    ],
  },
  {
    id: 'footer', title: 'Подвал и контакты', description: 'Низ всех страниц, контакты и кнопки соцсетей (они же в розовом блоке «Заказать»). Пустое поле контакта — кнопка не показывается',
    fields: [
      ...sec('Подвал', [
        ta('footer_text', 'Текст под логотипом', 'Вязаные изделия ручной работы с любовью'),
        tx('footer_catalog_title', 'Заголовок колонки каталога', 'Каталог'),
        tx('footer_all_products', 'Ссылка на весь каталог', 'Все товары'),
        tx('footer_contacts_title', 'Заголовок колонки контактов', 'Контакты'),
      ]),
      ...sec('Телефон', [ico('icon_phone'), tx('contact_phone', 'Номер', '+998 90 000-00-00')]),
      ...sec('Telegram', [ico('icon_telegram'), tx('contact_telegram', '@имя или ссылка', '@uyutnit')]),
      ...sec('Instagram', [ico('icon_instagram'), tx('social_instagram', '@имя или ссылка')]),
      ...sec('WhatsApp', [ico('icon_whatsapp'), tx('social_whatsapp', 'Номер с кодом страны')]),
      ...sec('Facebook', [ico('icon_facebook'), { key: 'social_facebook', label: 'Ссылка', type: 'url' }]),
      ...sec('YouTube', [ico('icon_youtube'), { key: 'social_youtube', label: 'Ссылка', type: 'url' }]),
      ...sec('Email', [ico('icon_email'), tx('contact_email', 'Адрес почты')]),
      ...sec('Адрес', [ico('icon_address'), tx('contact_address', 'Адрес', 'Ташкент, Узбекистан')]),
    ],
  },
  {
    id: 'card', title: 'Карточка товара', description: 'Надписи на карточках в каталоге и на главной',
    fields: [
      tx('card_new', 'Метка «новинка»', 'Новинка'),
      tx('card_in_stock', 'Есть в наличии', 'В наличии'),
      tx('card_preorder', 'Нет в наличии', 'Под заказ'),
      ...sec('Кнопка «В корзину»', [
        ico('icon_add', 'Иконка', 'Та же иконка на странице товара'),
        tx('card_add', 'Текст', 'В корзину'),
        ico('icon_added', 'Иконка после добавления'),
        tx('card_added', 'После добавления', 'Добавлено'),
        tx('card_in_cart', 'Когда остаток уже в корзине', 'Уже в корзине'),
      ]),
      ...sec('Кнопка «В 1 клик»', [
        ico('icon_oneclick', 'Иконка', 'Та же иконка на странице товара'),
        tx('card_oneclick', 'Текст', 'В 1 клик'),
      ]),
    ],
  },
  {
    id: 'product', title: 'Страница товара', description: 'Подписи на странице отдельного товара',
    fields: [
      tx('pp_home', 'Крошки: главная', 'Главная'),
      tx('pp_catalog', 'Крошки: каталог', 'Каталог'),
      tx('pp_sku', 'Артикул', 'Артикул'),
      tx('pp_category', 'Строка «категория»', 'Категория'),
      tx('pp_stock', 'Строка «наличие»', 'Наличие'),
      tx('pp_stock_left', 'Остаток', 'осталось {n} шт', '{n} заменится на число'),
      tx('pp_preorder', 'Нет в наличии', 'Под заказ · 7–14 дней'),
      tx('pp_colors', 'Строка «цвета»', 'Цвета'),
      tx('pp_sizes', 'Строка «размеры»', 'Размеры'),
      tx('pp_made', 'Строка «изготовление»', 'Изготовление'),
      tx('pp_made_value', 'Изготовление — значение', 'Ручная работа, натуральные нити'),
      tx('pp_color', 'Выбор цвета', 'Цвет'),
      tx('pp_size', 'Выбор размера', 'Размер'),
      tx('pp_add', 'Кнопка корзины', 'В корзину'),
      tx('pp_oneclick', 'Кнопка быстрого заказа', 'Купить в 1 клик'),
      tx('pp_stock_note', 'Подпись об остатке', 'В наличии {n} шт', '{n} заменится на число'),
      tx('pp_in_cart_note', 'Сколько уже в корзине', ', в корзине уже {n}'),
      tx('pp_go_cart', 'Ссылка в корзину', 'Перейти в корзину →'),
      ...sec('Кнопка видео', [ico('icon_video'), tx('pp_video', 'Текст', 'Смотреть видео')]),
      ta('pp_hint', 'Подсказка под кнопками', 'После заявки свяжемся с вами и обсудим детали: цвет, размер, сроки и доставку.'),
      tx('pp_desc_title', 'Заголовок описания', 'Описание'),
    ],
  },
  {
    id: 'catalog', title: 'Каталог', description: 'Страница каталога, фильтры и поиск',
    fields: [
      tx('catalog_title', 'Заголовок', 'Каталог'),
      tx('catalog_count', 'Счётчик товаров', 'в наличии', 'Пишется после числа: «38 товаров в наличии»'),
      tx('catalog_show', 'Подпись фильтра', 'Показать:'),
      tx('catalog_all', 'Кнопка «все категории»', 'Все'),
      tx('filter_picks', 'Фильтр 1', 'Популярные и акции'),
      ta('filter_picks_sub', 'Фильтр 1 — описание', 'Изделия, которые мы отметили как популярные или поставили на акцию'),
      tx('filter_popular', 'Фильтр 2', 'Только популярные'),
      tx('filter_popular_title', 'Фильтр 2 — заголовок страницы', 'Популярные изделия'),
      tx('filter_popular_sub', 'Фильтр 2 — описание', 'Самые востребованные работы'),
      tx('filter_sale', 'Фильтр 3', 'Только акции'),
      tx('filter_sale_title', 'Фильтр 3 — заголовок страницы', 'Товары на акции'),
      tx('filter_sale_sub', 'Фильтр 3 — описание', 'Успейте заказать по выгодной цене'),
      tx('filter_all', 'Фильтр 4', 'Весь каталог'),
      tx('catalog_search_placeholder', 'Поиск — подсказка в поле', 'Найти изделие…'),
      tx('catalog_search_btn', 'Поиск — кнопка', 'Найти'),
      tx('catalog_search_title', 'Заголовок при поиске', 'Поиск'),
      tx('catalog_nothing', 'Ничего не найдено', 'Ничего не найдено'),
      ...sec('Пустой каталог', [
        ico('icon_empty_catalog'),
        tx('catalog_empty_title', 'Заголовок', 'Скоро здесь появятся товары'),
        tx('catalog_empty_text', 'Текст', 'Напишите нам, если хотите что-то заказать'),
      ]),
      ...sec('Пустой фильтр', [
        ico('icon_empty_picks', 'Иконка «популярные»'),
        tx('catalog_empty_picks', 'Ничего не отмечено', 'Пока ничего не отмечено'),
        ico('icon_empty_sale', 'Иконка «акции»', 'Та же иконка на пустой странице скидок'),
        tx('catalog_empty_sale', 'Нет товаров на акции', 'Сейчас нет товаров на акции'),
        tx('catalog_empty_filter_text', 'Текст', 'Загляните в полный каталог — там всё, что есть в наличии'),
      ]),
      ...sec('Поиск без результатов', [
        ico('icon_notfound', 'Иконка', 'Та же иконка в поиске в шапке'),
        tx('catalog_notfound_title', 'Заголовок', 'По запросу «{q}» ничего не нашлось'),
        ta('catalog_notfound_text', 'Текст', 'Попробуйте другое слово. А если нужно что-то особенное — напишите нам, свяжем под заказ'),
        tx('catalog_search_all', 'Кнопка «искать везде»', 'Искать по всему каталогу'),
      ]),
      tx('catalog_order_btn', 'Кнопка заявки', 'Оставить заявку'),
    ],
  },
  {
    id: 'search', title: 'Поиск в шапке', description: 'Окно быстрого поиска',
    fields: [
      tx('search_placeholder', 'Подсказка в поле', 'Что ищете? Например: шапка, плед, зайка…'),
      tx('search_hint', 'Текст до ввода', 'Начните вводить название изделия, цвет или категорию'),
      tx('search_chips', 'Быстрые слова (через запятую)', 'шапка, свитер, плед, игрушка, носки, подарок'),
      tx('search_empty', 'Ничего не нашлось', 'По запросу «{q}» ничего не нашлось'),
      tx('search_empty_text', 'Ничего не нашлось — подсказка', 'Попробуйте другое слово или посмотрите весь каталог'),
      tx('search_open_catalog', 'Кнопка каталога', 'Открыть каталог'),
      tx('search_open_in_catalog', 'Все результаты', 'Открыть в каталоге'),
    ],
  },
  {
    id: 'news', title: 'Новости', description: 'Страница новостей',
    fields: [
      tx('news_badge', 'Метка', 'Лента'),
      tx('news_title', 'Заголовок', 'Новости'),
      tx('news_subtitle', 'Подзаголовок', 'Новинки, акции и обновления мастерской'),
      ...sec('Если новостей нет', [ico('icon_empty_news'), tx('news_empty', 'Текст', 'Новостей пока нет. Загляните позже!')]),
    ],
  },
  {
    id: 'cart', title: 'Корзина', description: 'Боковая панель корзины и оформление заказа',
    fields: [
      tx('cart_title', 'Заголовок', 'Корзина'),
      ...sec('Пустая корзина', [ico('icon_cart_empty'), tx('cart_empty_title', 'Заголовок', 'Пока пусто')]),
      ta('cart_empty_text', 'Пустая — текст', 'Добавьте изделия из каталога — они появятся здесь, и можно будет отправить один заказ на всё сразу.'),
      tx('cart_empty_btn', 'Пустая — кнопка', 'В каталог'),
      tx('cart_total', 'Итого', 'Итого'),
      ta('cart_note', 'Подпись под итогом', 'Оплата и доставка обсуждаются после заявки — мы свяжемся с вами.'),
      tx('cart_checkout', 'Кнопка оформления', 'Оформить заказ'),
      tx('cart_clear', 'Очистить', 'Очистить корзину'),
      tx('cart_no_more', 'Больше нет в наличии', 'Больше нет в наличии'),
      tx('cart_wishes_placeholder', 'Пожелания — подсказка', 'Цвет, размер, сроки, доставка…'),
      ...sec('Кнопка отправки', [ico('icon_send', 'Иконка', 'Та же иконка в форме заявки'), tx('cart_send', 'Текст', 'Отправить заказ')]),
      tx('cart_back', 'Назад к списку', '← Назад к списку'),
      ...sec('Заказ отправлен', [ico('icon_done', 'Иконка', 'Та же иконка в форме заявки'), tx('cart_done_title', 'Заголовок', 'Заявка отправлена!')]),
      ta('cart_done_text', 'Отправлено — текст', 'Свяжемся с вами в ближайшее время и подтвердим заказ. Спасибо!'),
      tx('cart_done_btn', 'Отправлено — кнопка', 'Продолжить покупки'),
    ],
  },
  {
    id: 'order', title: 'Форма заявки', description: 'Окно «Оставить заявку» и «Купить в 1 клик»',
    fields: [
      tx('order_title', 'Заголовок', 'Оставить заявку'),
      tx('order_subtitle', 'Подзаголовок (общая заявка)', 'Обсудим все детали вашего заказа'),
      tx('order_name_label', 'Поле «имя»', 'Ваше имя'),
      tx('order_name_placeholder', 'Имя — подсказка', 'Как вас зовут?'),
      tx('order_phone_label', 'Поле «телефон»', 'Телефон'),
      tx('order_phone_error', 'Ошибка телефона', 'Введите номер полностью: +998 XX XXX XX XX'),
      tx('order_tg_label', 'Поле «Telegram»', 'Telegram'),
      tx('order_tg_hint', 'Telegram — пояснение', '(по желанию, чтобы написать вам)'),
      tx('order_message_label', 'Поле «пожелания»', 'Пожелания'),
      tx('order_message_placeholder', 'Пожелания — подсказка', 'Цвет, размер, особые пожелания...'),
      tx('order_btn', 'Кнопка отправки', 'Отправить заявку'),
      tx('order_sending', 'Во время отправки', 'Отправляем...'),
      tx('order_error', 'Ошибка отправки', 'Ошибка отправки. Попробуйте ещё раз.'),
      tx('order_success_title', 'Успех — заголовок', 'Заявка принята!'),
      ta('order_success_text', 'Успех — текст', 'Свяжемся с вами в ближайшее время. Спасибо!'),
      tx('order_close', 'Кнопка «закрыть»', 'Закрыть'),
    ],
  },
  {
    id: 'timers', title: 'Таймеры', description: 'Обратный отсчёт акции и поступления',
    fields: [
      tx('timer_sale_title', 'Акция — заголовок', 'До конца акции осталось:'),
      tx('timer_restock_title', 'Поступление — заголовок', 'Будет в наличии через:'),
      tx('timer_restock_soon', 'Поступление — на карточке', 'Скоро'),
      ...sec('Снова в наличии', [ico('icon_back_in_stock'), tx('timer_back_in_stock', 'Текст', 'Снова в наличии')]),
      tx('timer_days', 'Подпись «дней»', 'дней'),
      tx('timer_hours', 'Подпись «часов»', 'часов'),
      tx('timer_minutes', 'Подпись «минут»', 'минут'),
      tx('timer_seconds', 'Подпись «секунд»', 'секунд'),
    ],
  },
]

/** Все значения по умолчанию: ключ → текст */
export const DEFAULTS: Record<string, string> = Object.fromEntries(
  CONTENT.flatMap((g) => g.fields.filter((f) => f.def != null).map((f) => [f.key, f.def as string])),
)

/** Подстановка {n}, {q} и т.п. */
export const fill = (s: string, vars?: Record<string, string | number>) =>
  vars ? s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m)) : s

/** Функция перевода по настройкам: значение из базы или по умолчанию */
export const makeT = (settings: Record<string, string>) =>
  (key: string, vars?: Record<string, string | number>) => fill(settings[key] || DEFAULTS[key] || '', vars)

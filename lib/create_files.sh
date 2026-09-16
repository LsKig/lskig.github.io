#!/usr/bin/env zshzsh create_missing_pages.sh
BASE="/Users/dmitryradionov/MyProjects/gikls_wiki/docs/nri/gorod_tumana/personaji_gorod_tumana"

create_file() {
  local file="$1"
  if [ ! -f "$file" ]; then
    mkdir -p "$(dirname "$file")"
    cat > "$file"
  fi
}

create_file "$BASE/igroki/yaroslava_romanchik.md" <<'MD'
title: Ярослава Евгеньевна Романчек
layout: default
nav_order: 101
parent: Персонажи игроков
{{ page.title }}
{% include creatures_card_module.html creature_key="yaroslava_romanchik" layout="right" %}
Художница-граффитистка. Привязана к бабушке, Аксинье Агафовой. Встречается с Владом Морозовым.
MD

create_file "$BASE/igroki/lyudmila_kharitonova.md" <<'MD'
title: Людмила Ярославовна Харитонова
layout: default
nav_order: 102
parent: Персонажи игроков
{{ page.title }}
{% include creatures_card_module.html creature_key="lyudmila_kharitonova" layout="right" %}
Офис-менеджер в СОГАЗ. Находится под опекой Марии Михайловны.
MD

create_file "$BASE/igroki/maria_tkachenko.md" <<'MD'
title: Мария Михайловна Ткаченко
layout: default
nav_order: 103
parent: Персонажи игроков
{{ page.title }}
{% include creatures_card_module.html creature_key="maria_tkachenko" layout="right" %}
Системный аналитик, технический директор компании «СОГАЗ», агент Бюро. Дочь Алёна, 15 лет.
MD

create_file "$BASE/igroki/gleb_norkin.md" <<'MD'
title: Глеб Норкин
layout: default
nav_order: 104
parent: Персонажи игроков
{{ page.title }}
{% include creatures_card_module.html creature_key="gleb_norkin" layout="right" %}
Независимый журналист. Был силой завербован Бюро, затем запечатан. После освобождения попал к «ASGARD», сбежал от них и покинул Москву вместе с дочерью, Ольгой Логиновой.
MD

create_file "$BASE/igroki/vladimir_sidorenko.md" <<'MD'
title: Владимир Иванович Сидоренко
layout: default
nav_order: 105
parent: Персонажи игроков
{{ page.title }}
{% include creatures_card_module.html creature_key="vladimir_sidorenko" layout="right" %}
Оперативник, глава Отдела расследований Бюро.
MD

create_file "$BASE/igroki/alisa_sokolova.md" <<'MD'
title: Алиса Соколова
layout: default
nav_order: 106
parent: Персонажи игроков
{{ page.title }}
{% include creatures_card_module.html creature_key="alisa_sokolova" layout="right" %}
Хакер в «Owl Search».
MD

create_file "$BASE/igroki/sofa_cherepanova.md" <<'MD'
title: Софа Павловна Черепанова
layout: default
nav_order: 107
parent: Персонажи игроков
{{ page.title }}
{% include creatures_card_module.html creature_key="sofa_cherepanova" layout="right" %}
PR-директор в «All Imp. Corporation».
MD

create_file "$BASE/igroki/veronika_sidorenko.md" <<'MD'
title: Вероника Васильевна Сидоренко
layout: default
nav_order: 108
parent: Персонажи игроков
{{ page.title }}
{% include creatures_card_module.html creature_key="veronika_sidorenko" layout="right" %}
Барменша-неформал. Завербована Бюро.
MD

create_file "$BASE/igroki/pyos_druzhok.md" <<'MD'
title: Пёс Дружок
layout: default
nav_order: 109
parent: Персонажи игроков
{{ page.title }}
{% include creatures_card_module.html creature_key="pyos_druzhok" layout="right" %}
Пёс Дружок. Завербован Бюро.
MD

create_file "$BASE/igroki/svetlana_novikova.md" <<'MD'
title: Светлана Аркадьевна Новикова
layout: default
nav_order: 110
parent: Персонажи игроков
{{ page.title }}
{% include creatures_card_module.html creature_key="svetlana_novikova" layout="right" %}
Учительница биологии. Завербована Бюро.
MD

create_file "$BASE/igroki/iuda_strogov.md" <<'MD'
title: Иуда Родионович Строгов
layout: default
nav_order: 111
parent: Персонажи игроков
{{ page.title }}
{% include creatures_card_module.html creature_key="iuda_strogov" layout="right" %}
Рэпер «$trogOff». Завербован Бюро.
MD

create_file "$BASE/igroki/vasiliy_lyskov.md" <<'MD'
title: Василий Георгиевич Лысков
layout: default
nav_order: 112
parent: Персонажи игроков
{{ page.title }}
{% include creatures_card_module.html creature_key="vasiliy_lyskov" layout="right" %}
Стартапер. Завербован Бюро.
MD

create_file "$BASE/npc/karl_morozov.md" <<'MD'
title: Карл Форньет-Морозов
layout: default
nav_order: 201
parent: НПС
{{ page.title }}
{% include creatures_card_module.html creature_key="karl_morozov" layout="right" %}
Отец Влада, владелец торгового центра «Небо».
MD

create_file "$BASE/npc/kharik.md" <<'MD'
title: Харик
layout: default
nav_order: 202
parent: НПС
{{ page.title }}
{% include creatures_card_module.html creature_key="kharik" layout="right" %}
Водитель маршрутки. Неприятной внешности армянин, улыбчив и обманчиво простодушен.
MD

create_file "$BASE/npc/prokopiy_nagorniy.md" <<'MD'
title: Прокопий Петрович Нагорный
layout: default
nav_order: 203
parent: НПС
{{ page.title }}
{% include creatures_card_module.html creature_key="prokopiy_nagorniy" layout="right" %}
Владелец автосервиса «Орел». Трудолюбивый, суровый, убежденный трезвенник.
MD

create_file "$BASE/npc/velemir_zverev.md" <<'MD'
title: Велемир «Зверь» Зверев
layout: default
nav_order: 204
parent: НПС
{{ page.title }}
{% include creatures_card_module.html creature_key="velemir_zverev" layout="right" %}
Лидер байкерской банды «Адские псы». Панковский стиль, кожанка, ярко-красный байк, расписанный рунами.
MD

create_file "$BASE/npc/olga_shestiperova.md" <<'MD'
title: Ольга Шестиперова
layout: default
nav_order: 205
parent: НПС
{{ page.title }}
{% include creatures_card_module.html creature_key="olga_shestiperova" layout="right" %}
«Девочка» Майры. Светло-русая, в серебристом платье.
MD

create_file "$BASE/npc/viktorija_pozdnyakova.md" <<'MD'
title: Виктория Позднякова
layout: default
nav_order: 206
parent: НПС
{{ page.title }}
{% include creatures_card_module.html creature_key="viktorija_pozdnyakova" layout="right" %}
«Девочка» Майры. Рыжая, в персиковой блузке и юбке с плащом поверх.
MD

create_file "$BASE/npc/david_gutnik.md" <<'MD'
title: Давид ибн Гассан Гутник
layout: default
nav_order: 207
parent: НПС
{{ page.title }}
{% include creatures_card_module.html creature_key="david_gutnik" layout="right" %}
Владелец магазина «1000 и 1 мелочь». Магазин был сожжен Славой и его бандой в 2012 году.
MD

create_file "$BASE/npc/egor_sladkov.md" <<'MD'
title: Егор Сладков
layout: default
nav_order: 208
parent: НПС
{{ page.title }}
{% include creatures_card_module.html creature_key="egor_sladkov" layout="right" %}
Охранник на хлебозаводе Коломенском.
MD

create_file "$BASE/npc/glafira_sladkova.md" <<'MD'
title: Глафира Сладкова
layout: default
nav_order: 209
parent: НПС
{{ page.title }}
{% include creatures_card_module.html creature_key="glafira_sladkova" layout="right" %}
Кассирша в магазине «Времена года».
MD

create_file "$BASE/npc/elena_nekrasova.md" <<'MD'
title: Елена Анатольевна Некрасова
layout: default
nav_order: 210
parent: НПС
{{ page.title }}
{% include creatures_card_module.html creature_key="elena_nekrasova" layout="right" %}
Привратница, директор Бюро Контроля. Расчетливая, исполнительная, беспрекословно подчиняется Совету.
MD

create_file "$BASE/npc/andrei_cherepanov.md" <<'MD'
title: Андрей Черепанов
layout: default
nav_order: 211
parent: НПС
{{ page.title }}
{% include creatures_card_module.html creature_key="andrei_cherepanov" layout="right" %}
Учредитель реабилитационного центра «Элизиум». Партнер «All Imp. Corporation».
MD

create_file "$BASE/npc/mihail_bogolyubov.md" <<'MD'
title: Михаил Боголюбов
layout: default
nav_order: 212
parent: НПС
{{ page.title }}
{% include creatures_card_module.html creature_key="mihail_bogolyubov" layout="right" %}
Член президиума Верховного суда РФ. Известный общественный деятель нулевых годов.
MD

create_file "$BASE/npc/rodion_kotov.md" <<'MD'
title: Родион Котов
layout: default
nav_order: 213
parent: НПС
{{ page.title }}
{% include creatures_card_module.html creature_key="rodion_kotov" layout="right" %}
Ведущий программы «Уроки словесности» на телеканале Культура. Автор бестселлера «Скажи сказке Да!».
MD

create_file "$BASE/npc/elena_kotova.md" <<'MD'
title: Елена Котова (Кукушкина)
layout: default
nav_order: 214
parent: НПС
{{ page.title }}
{% include creatures_card_module.html creature_key="elena_kotova" layout="right" %}
Супруга Родиона. Красива, но неряшлива. Очень разговорчивая.
MD

create_file "$BASE/npc/valentin_mlanchik.md" <<'MD'
title: Валентин Максимович Младенчик
layout: default
nav_order: 215
parent: НПС
{{ page.title }}
{% include creatures_card_module.html creature_key="valentin_mlanchik" layout="right" %}
Радиоведущий. Парень 19 лет, бывший блогер, завербован Бюро после экстремального пробуждения.
MD

create_file "$BASE/npc/olga_loginova.md" <<'MD'
title: Ольга Логинова
layout: default
nav_order: 216
parent: НПС
{{ page.title }}
{% include creatures_card_module.html creature_key="olga_loginova" layout="right" %}
Солистка группы «Затмение». Полноватая, волосы окрашены в черный. Выступала на разогреве у Сироткина.
MD

create_file "$BASE/npc/arina_sluchainaya.md" <<'MD'
title: Арина Случайная
layout: default
nav_order: 217
parent: НПС
{{ page.title }}
{% include creatures_card_module.html creature_key="arina_sluchainaya" layout="right" %}
Доцент кафедры математического анализа. Темно-русые пышные волосы, витилиго, азиатские черты лица, 30 лет. Бежевый тренч, черно-белая майка, серая джинсовая юбка поверх чулок.
MD

create_file "$BASE/npc/aleksey_volchinskiy.md" <<'MD'
title: Алексей Волчинский
layout: default
nav_order: 218
parent: НПС
{{ page.title }}
{% include creatures_card_module.html creature_key="aleksey_volchinskiy" layout="right" %}
Гонщик. Давний знакомый Арины, на вид ему 20 лет. Голубые глаза, фиолетовая куртка, джинсы, брендовые кроссовки.
MD

create_file "$BASE/allimp/leontiy_zolotarev.md" <<'MD'
title: Леонтий Золотарев
layout: default
nav_order: 301
parent: All Imp. Corporation
{{ page.title }}
{% include creatures_card_module.html creature_key="leontiy_zolotarev" layout="right" %}
Член совета директоров. Владелец модельного агентства и сети соляриев «Седьмой луч».
MD

create_file "$BASE/allimp/aleksandra_strelnikova.md" <<'MD'
title: Александра Стрельникова
layout: default
nav_order: 302
parent: All Imp. Corporation
{{ page.title }}
{% include creatures_card_module.html creature_key="aleksandra_strelnikova" layout="right" %}
Член совета директоров. Владелица женских фитнес-центров «Амазонка».
MD

create_file "$BASE/allimp/diana_tsvetaeva.md" <<'MD'
title: Диана Цветаева
layout: default
nav_order: 303
parent: All Imp. Corporation
{{ page.title }}
{% include creatures_card_module.html creature_key="diana_tsvetaeva" layout="right" %}
Член совета директоров. Владелица сети элитных магазинов продуктов «Времена года».
MD

create_file "$BASE/allimp/artemiy_myasnikov.md" <<'MD'
title: Артемий Мясников
layout: default
nav_order: 304
parent: All Imp. Corporation
{{ page.title }}
{% include creatures_card_module.html creature_key="artemiy_myasnikov" layout="right" %}
Член совета директоров. Владелец ЧОП «Спарта».
MD

create_file "$BASE/allimp/potap_morev.md" <<'MD'
title: Потап Морев
layout: default
nav_order: 305
parent: All Imp. Corporation
{{ page.title }}
{% include creatures_card_module.html creature_key="potap_morev" layout="right" %}
Член совета директоров. Владелец фирмы логистики и судоперевозок «Транс Экспресс Трирема».
MD

create_file "$BASE/allimp/georgiy_kuznetsov.md" <<'MD'
title: Георгий Кузнецов
layout: default
nav_order: 306
parent: All Imp. Corporation
{{ page.title }}
{% include creatures_card_module.html creature_key="georgiy_kuznetsov" layout="right" %}
Член совета директоров. Владелец сети автосалонов «Etna Motors».
MD

create_file "$BASE/allimp/gelasij_beglov.md" <<'MD'
title: Геласий Беглов
layout: default
nav_order: 307
parent: All Imp. Corporation
{{ page.title }}
{% include creatures_card_module.html creature_key="gelasij_beglov" layout="right" %}
Член совета директоров. Владелец курьерской службы «Быстрее ветра». Мужчина 40 лет, в спортивных очках и брендовом спортивном костюме.
MD

create_file "$BASE/allimp/gestiya_domashneva.md" <<'MD'
title: Гестия Домашнева
layout: default
nav_order: 308
parent: All Imp. Corporation
{{ page.title }}
{% include creatures_card_module.html creature_key="gestiya_domashneva" layout="right" %}
HR-директор. Светло-рыжие волосы, челка набок, желтая блузка.
MD

create_file "$BASE/internat/kosmonavt.md" <<'MD'
title: «Космонавт»
layout: default
nav_order: 401
parent: Интернат
{{ page.title }}
{% include creatures_card_module.html creature_key="kosmonavt" layout="right" %}
Шестиклассник, в инвалидном кресле. Ноги прикованы к креслу, чтобы не давать взлететь, носит футболку «NASA». Уехал в «Элизиум».
MD

create_file "$BASE/internat/dylda.md" <<'MD'
title: «Дылда»
layout: default
nav_order: 402
parent: Интернат
{{ page.title }}
{% include creatures_card_module.html creature_key="dylda" layout="right" %}
Семиклассница, высокая спортсменка. Рыжие волосы в косичке, вытянутое лицо, голубые глаза. Осталась под присмотром Майры.
MD

create_file "$BASE/asgard/odrik_ejnansson.md" <<'MD'
title: Одрик Эйнарссон
layout: default
nav_order: 501
parent: ASGARD
{{ page.title }}
{% include creatures_card_module.html creature_key="odrik_ejnansson" layout="right" %}
Глава международной НКО ASGARD. Нет правого глаза, шерстяное пальто, подтяжки с воронами. Трость с синим соколом, несколько колец с камнями. Спектрометр — Гунгнир.
MD

create_file "$BASE/asgard/frida_ejnansson.md" <<'MD'
title: Фрида Эйнарссон (Снегирёва)
layout: default
nav_order: 502
parent: ASGARD
{{ page.title }}
{% include creatures_card_module.html creature_key="frida_ejnansson" layout="right" %}
Супруга Одрика, родом из России. Шпилька с китайским фениксом, подвеска с Бастет.
MD

create_file "$BASE/asgard/terje_dunar.md" <<'MD'
title: Терье Дунар
layout: default
nav_order: 503
parent: ASGARD
{{ page.title }}
{% include creatures_card_module.html creature_key="terje_dunar" layout="right" %}
Племянник и ассистент Одрика. Коренастый мужчина, темно-рыжие волосы, борода, носит несколько колец.
MD

create_file "$BASE/oog/daniil_gavrilov.md" <<'MD'
title: Даниил Гаврилов
layout: default
nav_order: 601
parent: Выбывшие
{{ page.title }}
{% include creatures_card_module.html creature_key="daniil_gavrilov" layout="right" %}
Сотрудник страхового агентства.
MD

create_file "$BASE/oog/svetlana_kupriyanova.md" <<'MD'
title: Светлана Куприянова
layout: default
nav_order: 602
parent: Выбывшие
{{ page.title }}
{% include creatures_card_module.html creature_key="svetlana_kupriyanova" layout="right" %}
Первая солистка группы «Затмение».
MD

create_file "$BASE/oog/dmitriy_solopov.md" <<'MD'
title: Дмитрий Солопов
layout: default
nav_order: 603
parent: Выбывшие
{{ page.title }}
{% include creatures_card_module.html creature_key="dmitriy_solopov" layout="right" %}
Лейтенант полиции, связной с Бюро Контроля.
MD

create_file "$BASE/oog/veronika_solopova.md" <<'MD'
title: Вероника Солопова
layout: default
nav_order: 604
parent: Выбывшие
{{ page.title }}
{% include creatures_card_module.html creature_key="veronika_solopova" layout="right" %}
Супруга Дмитрия.
MD

create_file "$BASE/oog/otec_ieremiy.md" <<'MD'
title: Отец Иеремий
layout: default
nav_order: 605
parent: Выбывшие
{{ page.title }}
{% include creatures_card_module.html creature_key="otec_ieremiy" layout="right" %}
Батюшка. В прошлом врач. Забрал мифосы Даниила и Светланы.
MD

create_file "$BASE/oog/boris_rasputin.md" <<'MD'
title: Борис Распутин
layout: default
nav_order: 606
parent: Выбывшие
{{ page.title }}
{% include creatures_card_module.html creature_key="boris_rasputin" layout="right" %}
Бизнесмен, владелец сети крупнейших ликеро-водочных заводов. Яхта «Ku’oko’a».
MD

create_file "$BASE/oog/grigoriy_sichev.md" <<'MD'
title: Григорий Сычёв
layout: default
nav_order: 607
parent: Выбывшие
{{ page.title }}
{% include creatures_card_module.html creature_key="grigoriy_sichev" layout="right" %}
Председатель СНТ. Парень 19 лет, астматик, геймер, по условиям контракта получил пост председателя СНТ после смерти отца, Николая Сычёва.
MD

create_file "$BASE/oog/anita_retunskih.md" <<'MD'
title: Анита Ретюнских
layout: default
nav_order: 608
parent: Выбывшие
{{ page.title }}
{% include creatures_card_module.html creature_key="anita_retunskih" layout="right" %}
Сестра-сплетница, сельская интеллигенция. Синее платье.
MD

create_file "$BASE/oog/renata_retunskih.md" <<'MD'
title: Рената Ретюнских
layout: default
nav_order: 609
parent: Выбывшие
{{ page.title }}
{% include creatures_card_module.html creature_key="renata_retunskih" layout="right" %}
Сестра-сплетница, сельская интеллигенция. Бежевое платье.
MD

create_file "$BASE/oog/polina_strastnova.md" <<'MD'
title: Полина Страстнова
layout: default
nav_order: 610
parent: Выбывшие
{{ page.title }}
{% include creatures_card_module.html creature_key="polina_strastnova" layout="right" %}
Работница склада.
MD

create_file "$BASE/oog/pavel_borets.md" <<'MD'
title: Павел «Грозный» Борец
layout: default
nav_order: 611
parent: Выбывшие
{{ page.title }}
{% include creatures_card_module.html creature_key="pavel_borets" layout="right" %}
Наемный убийца. Устранен Олимпийцами в 2009 году, так как угрожал Аресу. Хранил реликвию Кощея. У него был свой стрелковый клуб, теперь там «Теремок».
MD

create_file "$BASE/oog/brandt_ejnansson.md" <<'MD'
title: Брандт Эйнарссон
layout: default
nav_order: 612
parent: Выбывшие
{{ page.title }}
{% include creatures_card_module.html creature_key="brandt_ejnansson" layout="right" %}
Эколог, сын Одрика. Умер и был похоронен вместе с родственниками матери.
MD
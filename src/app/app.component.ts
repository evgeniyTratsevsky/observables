import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  AsyncSubject,
  BehaviorSubject,
  combineLatest,
  delay,
  filter,
  fromEvent,
  interval,
  map,
  Observable,
  of,
  ReplaySubject,
  Subject,
  take,
  takeUntil,
  throwError,
  timer,
  tap,
  switchMap,
  mergeMap,
  concatMap,
  exhaustMap,
  debounceTime,
  throttleTime,
  distinctUntilChanged,
  catchError,
  retry,
  scan,
  reduce,
  startWith,
  shareReplay,
  merge,
  concat,
  zip,
  finalize,
  takeWhile,
  skip,
  first,
  last,
  defaultIfEmpty,
  every,
  find,
} from 'rxjs';
import { ajax } from 'rxjs/ajax';

interface LogEntry {
  category: string;
  message: string;
  timestamp: number;
}

interface OperatorDescription {
  title: string;
  description: string;
  useCase: string;
  input?: string;
  output?: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
})
export class AppComponent implements OnInit, OnDestroy {
  logs: LogEntry[] = [];
  private destroy$ = new Subject<void>();
  activeExample = '';
  currentDescription: OperatorDescription | null = null;
  test$: Observable<any> = new Observable();

  operatorDescriptions: { [key: string]: OperatorDescription } = {
    observable: {
      title: 'Observable',
      description:
        'Основа RxJS. Представляет поток данных, который может испускать значения со временем.',
      useCase:
        'Используется для создания асинхронных потоков данных: события, HTTP-запросы, таймеры.',
    },
    observer: {
      title: 'Observer',
      description:
        'Объект с методами next, error и complete для обработки значений из Observable.',
      useCase:
        'Позволяет явно определить логику обработки данных, ошибок и завершения потока.',
    },
    subject: {
      title: 'Subject',
      description:
        'Гибрид Observable и Observer. Может одновременно испускать и подписываться на значения.',
      useCase:
        'Многоадресная рассылка - один источник данных для нескольких подписчиков (как EventEmitter).',
    },
    behaviorSubject: {
      title: 'BehaviorSubject',
      description:
        'Subject с начальным значением. Хранит последнее испущенное значение.',
      useCase:
        'Идеален для хранения состояния: текущий пользователь, настройки, выбранный элемент.',
    },
    replaySubject: {
      title: 'ReplaySubject',
      description:
        'Subject, который запоминает N последних значений и отправляет их новым подписчикам.',
      useCase:
        'Когда новые подписчики должны получить историю событий (логи, уведомления).',
    },
    asyncSubject: {
      title: 'AsyncSubject',
      description:
        'Subject, который испускает только последнее значение и только после complete().',
      useCase:
        'Редко используется. Подходит для операций, где важен только финальный результат.',
    },
    map: {
      title: 'map',
      description: 'Преобразует каждое значение потока применяя функцию.',
      useCase:
        'Трансформация данных: умножение чисел, форматирование строк, извлечение полей объекта.',
      input: '1, 2, 3, 4, 5',
      output: '2, 4, 6, 8, 10 (× 2)',
    },
    filter: {
      title: 'filter',
      description:
        'Пропускает только те значения, которые удовлетворяют условию.',
      useCase:
        'Фильтрация данных: только чётные числа, только валидные email, только активные пользователи.',
      input: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10',
      output: '2, 4, 6, 8, 10 (только чётные)',
    },
    tap: {
      title: 'tap',
      description:
        'Выполняет побочные эффекты не изменяя поток (логирование, отладка).',
      useCase:
        'Отладка потоков, логирование, аналитика. Не изменяет данные, только наблюдает.',
      input: '1, 2, 3',
      output: '10, 20, 30 (без изменений, только side-effect)',
    },
    scan: {
      title: 'scan',
      description:
        'Накапливает значения как reduce, но испускает промежуточные результаты.',
      useCase:
        'Подсчёт суммы в реальном времени, аккумулирование событий, построение истории.',
      input: '1, 2, 3, 4, 5',
      output: '1, 3, 6, 10, 15 (нарастающая сумма)',
    },
    reduce: {
      title: 'reduce',
      description:
        'Накапливает все значения и испускает только финальный результат после complete.',
      useCase:
        'Финальные вычисления: сумма массива, объединение данных, итоговая статистика.',
      input: '1, 2, 3, 4, 5',
      output: '15 (только финальная сумма)',
    },
    switchMap: {
      title: 'switchMap',
      description:
        'Переключается на новый внутренний Observable, отменяя предыдущий.',
      useCase:
        'Поиск с автодополнением, навигация - отменяет предыдущий запрос при новом вводе.',
      input: 'A, B, C',
      output: 'C0, C1, C2 (только последний)',
    },
    mergeMap: {
      title: 'mergeMap (flatMap)',
      description:
        'Объединяет все внутренние Observable одновременно, не отменяя предыдущие.',
      useCase:
        'Параллельные запросы, когда важны все результаты: загрузка файлов, множественные API.',
      input: 'A, B, C',
      output: 'A0, B0, A1, C0, B1, C1 (все параллельно)',
    },
    concatMap: {
      title: 'concatMap',
      description:
        'Обрабатывает внутренние Observable последовательно, дожидаясь завершения каждого.',
      useCase:
        'Последовательные операции: очередь задач, пошаговая обработка, гарантия порядка.',
      input: 'A, B, C',
      output: 'Processed: A, Processed: B, Processed: C',
    },
    exhaustMap: {
      title: 'exhaustMap',
      description:
        'Игнорирует новые значения пока обрабатывается текущий внутренний Observable.',
      useCase:
        'Защита от множественных кликов на кнопку, предотвращение дублирования запросов.',
      input: '0, 1, 2, 3, 4 (быстро)',
      output: 'Processed: 0, Processed: 2 (игнорирует пока занят)',
    },
    debounceTime: {
      title: 'debounceTime',
      description:
        'Испускает значение только после паузы в N миллисекунд без новых значений.',
      useCase:
        'Поиск по мере ввода, автосохранение - ждёт когда пользователь закончит печатать.',
      input: '0, 1, 2, 3, 4, 5, 6, 7, 8, 9 (каждые 200мс)',
      output: '9 (после 500мс паузы)',
    },
    throttleTime: {
      title: 'throttleTime',
      description:
        'Испускает значение, затем игнорирует все последующие N миллисекунд.',
      useCase: 'Ограничение частоты: скролл, resize, защита от спама кликов.',
      input: '0, 1, 2, 3, ... 19 (каждые 100мс)',
      output: '0, 5, 10, 15 (каждые 500мс)',
    },
    distinctUntilChanged: {
      title: 'distinctUntilChanged',
      description:
        'Испускает значение только если оно отличается от предыдущего.',
      useCase:
        'Оптимизация: избегать лишних обновлений UI при одинаковых значениях.',
      input: '1, 1, 2, 2, 3, 3, 3, 4, 4, 5',
      output: '1, 2, 3, 4, 5 (без дубликатов)',
    },
    takeUntil: {
      title: 'takeUntil',
      description:
        'Принимает значения до тех пор, пока другой Observable не испустит значение.',
      useCase:
        'Отписка при уничтожении компонента, остановка по внешнему сигналу.',
      input: '0, 1, 2, 3, 4, 5... (каждые 300мс)',
      output: '0, 1, 2, 3, 4 (остановлено через 1.5с)',
    },
    takeWhile: {
      title: 'takeWhile',
      description: 'Принимает значения пока условие истинно.',
      useCase:
        'Остановка по условию: пока счётчик < 10, пока пользователь активен.',
      input: '0, 1, 2, 3, 4, 5, 6...',
      output: '0, 1, 2, 3, 4 (пока < 5)',
    },
    skip: {
      title: 'skip',
      description: 'Пропускает первые N значений потока.',
      useCase:
        'Игнорирование начальных значений: пропустить начальное состояние формы.',
      input: '1, 2, 3, 4, 5, 6, 7, 8',
      output: '4, 5, 6, 7, 8 (пропустили 3)',
    },
    first: {
      title: 'first',
      description: 'Берёт только первое значение и завершает поток.',
      useCase:
        'Когда нужно только первое событие: первый клик, первый ответ от API.',
      input: '10, 20, 30, 40, 50',
      output: '10 (только первое)',
    },
    last: {
      title: 'last',
      description: 'Берёт только последнее значение после завершения потока.',
      useCase: 'Финальное значение после серии событий.',
      input: '10, 20, 30, 40, 50',
      output: '50 (только последнее)',
    },
    catchError: {
      title: 'catchError',
      description: 'Перехватывает ошибки и возвращает резервный Observable.',
      useCase:
        'Обработка ошибок: показать сообщение, вернуть запасные данные, retry альтернативного API.',
      input: 'Error: Something went wrong!',
      output: 'Fallback value (запасное значение)',
    },
    retry: {
      title: 'retry',
      description: 'Автоматически повторяет Observable при ошибке N раз.',
      useCase:
        'Ненадёжные соединения: повтор HTTP-запросов, переподключение к WebSocket.',
      input: 'Attempt 1: Failed → Attempt 2: Failed',
      output: 'Attempt 3: Success!',
    },
    combineLatest: {
      title: 'combineLatest',
      description:
        'Комбинирует последние значения из нескольких Observable при изменении любого из них.',
      useCase:
        'Реактивные формы: валидация зависимых полей, комбинирование данных из разных источников.',
      input: 'Users API, Posts API, Todos API',
      output: '[users[], posts[], todos[]] (все вместе)',
    },
    merge: {
      title: 'merge',
      description:
        'Объединяет несколько Observable в один, испуская все значения по мере поступления.',
      useCase: 'Слияние событий из разных источников: клики + нажатия клавиш.',
      input: 'Stream1: Num 0, 1, 2 | Stream2: Letter A, B, C',
      output: 'Num 0, Letter A, Num 1, Letter B... (вперемешку)',
    },
    concat: {
      title: 'concat',
      description:
        'Последовательно подписывается на Observable один за другим.',
      useCase:
        'Последовательная загрузка: сначала конфиг, потом данные, потом UI.',
      input: 'Stream1: A, B, C | Stream2: 1, 2, 3',
      output: 'A, B, C, 1, 2, 3 (сначала первый, потом второй)',
    },
    zip: {
      title: 'zip',
      description: 'Комбинирует значения из Observable попарно по индексу.',
      useCase:
        'Синхронизация потоков: объединение параллельных результатов в пары.',
      input: 'Numbers: 1, 2, 3, 4 | Letters: A, B, C',
      output: '1A, 2B, 3C (попарно по индексу)',
    },
    startWith: {
      title: 'startWith',
      description: 'Начинает поток с указанного значения перед первым эмитом.',
      useCase:
        'Начальное состояние: показать загрузку перед данными, дефолтное значение.',
      input: '2, 3, 4',
      output: '1, 2, 3, 4 (добавили 1 в начало)',
    },
    shareReplay: {
      title: 'shareReplay',
      description:
        'Делает Observable многоадресным и кэширует N последних значений.',
      useCase:
        'Оптимизация: один HTTP-запрос для всех подписчиков, кэширование результатов.',
      input: '0, 1, 2, 3 (один источник)',
      output: 'Sub1: 0,1,2,3 | Sub2: 3,... (кэш последнего)',
    },
    every: {
      title: 'every',
      description: 'Проверяет, все ли значения удовлетворяют условию.',
      useCase: 'Валидация: все поля заполнены, все чекбоксы отмечены.',
      input: '2, 4, 6, 8 (все чётные?)',
      output: 'true | Input: 2, 4, 5, 8 → false',
    },
    find: {
      title: 'find',
      description: 'Возвращает первое значение, удовлетворяющее условию.',
      useCase: 'Поиск элемента: найти пользователя по ID, первое число > 5.',
      input: '1, 3, 5, 7, 9, 11',
      output: '7 (первое > 5)',
    },
  };

  constructor() {}

  ngOnInit(): void {
    // Auto-run first example
    this.test$ = of([1, 2, 3, 4, 5]);
    this.runExample('observable');
    // this.testMethod();
  }

  // testMethod() {
  //   console.log('testMethod');
  //   this.test$.pipe(
  //     map(data >= {
  //       return data*2;
  //     })
  //   );
  // }

  ngOnDestroy(): void {
    // this.destroy$.next();
    this.destroy$.complete();
  }

  clearLogs(): void {
    this.logs = [];
  }

  addLog(category: string, message: string): void {
    this.logs.push({
      category,
      message,
      timestamp: Date.now(),
    });
  }

  runExample(example: string): void {
    console.log('runExample');
    this.test$.subscribe((data) => {
      console.log(data);
    });

    this.clearLogs();
    this.activeExample = example;
    this.currentDescription = this.operatorDescriptions[example] || null;

    switch (example) {
      case 'observable':
        this.observableExampleVisual();
        break;
      case 'observer':
        this.observerExampleVisual();
        break;
      case 'subject':
        this.subjectExampleVisual();
        break;
      case 'behaviorSubject':
        this.behaviourSubjectExampleVisual();
        break;
      case 'replaySubject':
        this.replySubjectExampleVisual();
        break;
      case 'asyncSubject':
        this.asyncSubjectExampleVisual();
        break;
      case 'map':
        this.mapExample();
        break;
      case 'filter':
        this.filterExample();
        break;
      case 'tap':
        this.tapExample();
        break;
      case 'switchMap':
        this.switchMapExample();
        break;
      case 'mergeMap':
        this.mergeMapExample();
        break;
      case 'concatMap':
        this.concatMapExample();
        break;
      case 'exhaustMap':
        this.exhaustMapExample();
        break;
      case 'debounceTime':
        this.debounceTimeExample();
        break;
      case 'throttleTime':
        this.throttleTimeExample();
        break;
      case 'distinctUntilChanged':
        this.distinctUntilChangedExample();
        break;
      case 'catchError':
        this.catchErrorExample();
        break;
      case 'retry':
        this.retryExample();
        break;
      case 'scan':
        this.scanExample();
        break;
      case 'reduce':
        this.reduceExample();
        break;
      case 'combineLatest':
        this.combineLatestExample();
        break;
      case 'merge':
        this.mergeExample();
        break;
      case 'concat':
        this.concatExample();
        break;
      case 'zip':
        this.zipExample();
        break;
      case 'startWith':
        this.startWithExample();
        break;
      case 'shareReplay':
        this.shareReplayExample();
        break;
      case 'takeUntil':
        this.takeUntilExample();
        break;
      case 'takeWhile':
        this.takeWhileExample();
        break;
      case 'skip':
        this.skipExample();
        break;
      case 'first':
        this.firstExample();
        break;
      case 'last':
        this.lastExample();
        break;
      case 'every':
        this.everyExample();
        break;
      case 'find':
        this.findExample();
        break;
    }
  }

  observableExample() {
    // const test = of(1,2,3);
    // test.subscribe(data=>{
    //   console.log(data);
    // })
    // const observable = new Observable<string>((subscriber) => {
    //   subscriber.next('Data 1');
    //   subscriber.next('Data 2');
    //   setTimeout(() => {
    //     subscriber.next('Async Data');
    //     subscriber.complete();
    //   }, 3000);
    // });
    // observable.subscribe({
    //   next: (data) => console.log('Received:', data),
    //   complete: () => console.log('Completed'),
    //   error: () => console.log('Completed'),
    // });
  }

  observerExample() {
    // Создаем Observable
    const observable = new Observable((subscriber) => {
      subscriber.next('First value');
      subscriber.next('Second value');
      // setTimeout(() => {
      //   subscriber.next('Async value');
      //   subscriber.complete();
      // }, 1000);
    });

    // Определяем Observer
    const observer = {
      next: (value: any) => console.log('Received:', value),
      complete: () => console.log('Completed'),
      error: (err: any) => console.error('Error:', err),
    };
    // Подписываемся на Observable с использованием Observer
    observable.subscribe(observer);
  }

  // Eevent Emitter
  subjectExample() {
    // Создаем Subject
    const subject = new Subject();
    const subject2 = new Subject();

    // Подписываем нескольких наблюдателей на Subject
    subject.subscribe({
      next: (value) => console.log('Observer 1:', value),
    });

    subject.subscribe({
      next: (value) => console.log('Observer 2:', value),
    });

    // Async
    setTimeout(() => {
      subject.next('Timer');
    }, 3000);
    // Отправляем данные в Subject
    subject.next('Hello');
    subject.next('World');
  }

  behaviourSubjectExample() {
    // Удобно для отслеживания текущего значений объекта в данный момент
    // Практически не отдичается от Subject
    const behaviorSubject = new BehaviorSubject('Initial'); // начальное значение

    behaviorSubject.subscribe((value) => console.log('Subscriber 1:', value));
    // behaviorSubject.subscribe((value) => console.log('Subscriber 2:', value));

    behaviorSubject.next('Hello'); // отправляем новое значение
    behaviorSubject.next('World'); // отправляем новое значение

    behaviorSubject.subscribe((value) => console.log('Subscriber 2:', value));
  }

  replySubjectExample() {
    // Редко используется
    // ReplaySubject(1) = BehaviorSubject()
    const replaySubject = new ReplaySubject(2); // Сохраняем последние 2 значения

    replaySubject.subscribe((value) => console.log('Subscriber 1:', value));
    // replaySubject.subscribe((value) => console.log('Subscriber 2:', value));

    replaySubject.next('First');
    replaySubject.next('Second');
    replaySubject.next('Third');
    replaySubject.next('Fourth');

    replaySubject.subscribe((value) => console.log('Subscriber 2:', value));
  }

  asyncSubjectExample() {
    const asyncSubject = new AsyncSubject();

    asyncSubject.subscribe((value) => console.log('Subscriber 1:', value));

    asyncSubject.next('First');
    asyncSubject.next('Second');
    asyncSubject.next('Third');

    asyncSubject.subscribe((value) => console.log('Subscriber 2:', value));

    asyncSubject.next('Fourth');
    asyncSubject.complete(); // завершение потока
  }

  // ========== VISUAL METHODS FOR UI ==========

  observableExampleVisual() {
    this.addLog('Observable', 'Creating observable...');
    const observable = new Observable<string>((subscriber) => {
      subscriber.next('Data 1');
      subscriber.next('Data 2');
      setTimeout(() => {
        subscriber.next('Async Data');
        subscriber.complete();
      }, 1000);
    });

    observable.pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => this.addLog('Observable', `Received: ${data}`),
      complete: () => this.addLog('Observable', 'Completed ✓'),
      error: (err) => this.addLog('Observable', `Error: ${err}`),
    });
  }

  observerExampleVisual() {
    this.addLog('Observer', 'Creating observable with custom observer...');
    const observable = new Observable((subscriber) => {
      subscriber.next('First value');
      subscriber.next('Second value');
      setTimeout(() => {
        subscriber.next('Async value');
        subscriber.complete();
      }, 1000);
    });

    const observer = {
      next: (value: any) => this.addLog('Observer', `Received: ${value}`),
      complete: () => this.addLog('Observer', 'Completed ✓'),
      error: (err: any) => this.addLog('Observer', `Error: ${err}`),
    };

    observable.pipe(takeUntil(this.destroy$)).subscribe(observer);
  }

  subjectExampleVisual() {
    this.addLog('Subject', 'Creating subject with multiple subscribers...');
    const subject = new Subject();
    subject.unsubscribe();

    subject.pipe(takeUntil(this.destroy$)).subscribe({
      next: (value) => this.addLog('Subject', `Observer 1: ${value}`),
    });

    subject.pipe(takeUntil(this.destroy$)).subscribe({
      next: (value) => this.addLog('Subject', `Observer 2: ${value}`),
    });

    setTimeout(() => {
      subject.next('Timer triggered');
    }, 1500);

    subject.next('Hello');
    subject.next('World');
  }

  behaviourSubjectExampleVisual() {
    this.addLog(
      'BehaviorSubject',
      'Creating BehaviorSubject with initial value...'
    );
    const behaviorSubject = new BehaviorSubject('Initial');

    behaviorSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) =>
        this.addLog('BehaviorSubject', `Subscriber 1: ${value}`)
      );

    behaviorSubject.next('Hello');
    behaviorSubject.next('World');

    this.addLog('BehaviorSubject', 'New subscriber joining...');
    behaviorSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) =>
        this.addLog('BehaviorSubject', `Subscriber 2: ${value} (latest)`)
      );
  }

  replySubjectExampleVisual() {
    this.addLog('ReplaySubject', 'Creating ReplaySubject (buffer: 2)...');
    const replaySubject = new ReplaySubject(2);

    replaySubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) =>
        this.addLog('ReplaySubject', `Subscriber 1: ${value}`)
      );

    replaySubject.next('First');
    replaySubject.next('Second');
    replaySubject.next('Third');
    replaySubject.next('Fourth');

    this.addLog(
      'ReplaySubject',
      'New subscriber joining (gets last 2 values)...'
    );
    replaySubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) =>
        this.addLog('ReplaySubject', `Subscriber 2: ${value} (replay)`)
      );
  }

  asyncSubjectExampleVisual() {
    this.addLog(
      'AsyncSubject',
      'Creating AsyncSubject (emits only last value)...'
    );
    const asyncSubject = new AsyncSubject();

    asyncSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) =>
        this.addLog('AsyncSubject', `Subscriber 1: ${value}`)
      );

    asyncSubject.next('First');
    asyncSubject.next('Second');
    asyncSubject.next('Third');

    asyncSubject
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) =>
        this.addLog('AsyncSubject', `Subscriber 2: ${value}`)
      );

    asyncSubject.next('Fourth (last)');
    asyncSubject.complete();
  }

  // ========== TRANSFORMATION OPERATORS ==========
  mapExample() {
    this.addLog('map', 'Transform values by multiplying by 2...');
    of(1, 2, 3, 4, 5)
      .pipe(
        map((value) => value * 2),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => this.addLog('map', `Output: ${value}`));
  }

  filterExample() {
    this.addLog('filter', 'Filter only even numbers...');
    of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
      .pipe(
        filter((value) => value % 2 === 0),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => this.addLog('filter', `Output: ${value}`));
  }

  tapExample() {
    this.addLog('tap', 'Perform side effects without modifying values...');
    of(1, 2, 3)
      .pipe(
        tap((value) => this.addLog('tap', `Side effect: Processing ${value}`)),
        map((value) => value * 10),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => this.addLog('tap', `Final: ${value}`));
  }

  scanExample() {
    this.addLog(
      'scan',
      'Accumulate values (like reduce but emits each step)...'
    );
    of(1, 2, 3, 4, 5)
      .pipe(
        scan((acc, value) => acc + value, 0),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => this.addLog('scan', `Accumulator: ${value}`));
  }

  reduceExample() {
    this.addLog('reduce', 'Sum all values (emits only final result)...');
    of(1, 2, 3, 4, 5)
      .pipe(
        reduce((acc, value) => acc + value, 0),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => this.addLog('reduce', `Final sum: ${value}`));
  }

  // Flattening Operators
  switchMapExample() {
    this.addLog(
      'switchMap',
      'Switch to new inner observable (cancels previous)...'
    );
    of('A', 'B', 'C')
      .pipe(
        switchMap((letter) =>
          interval(300).pipe(
            map((i) => `${letter}${i}`),
            take(3)
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => this.addLog('switchMap', `Output: ${value}`));
  }

  mergeMapExample() {
    this.addLog('mergeMap', 'Merge all inner observables concurrently...');
    of('A', 'B', 'C')
      .pipe(
        mergeMap((letter) =>
          interval(300).pipe(
            map((i) => `${letter}${i}`),
            take(2)
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => this.addLog('mergeMap', `Output: ${value}`));
  }

  concatMapExample() {
    this.addLog('concatMap', 'Process inner observables sequentially...');
    of('A', 'B', 'C')
      .pipe(
        concatMap((letter) =>
          timer(300).pipe(map(() => `Processed: ${letter}`))
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => this.addLog('concatMap', value));
  }

  exhaustMapExample() {
    this.addLog('exhaustMap', 'Ignore new values while processing...');
    interval(300)
      .pipe(
        take(5),
        exhaustMap((value) =>
          timer(500).pipe(map(() => `Processed: ${value}`))
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => this.addLog('exhaustMap', value));
  }

  // Filtering Operators
  debounceTimeExample() {
    this.addLog('debounceTime', 'Emit after 500ms of silence...');
    interval(200)
      .pipe(take(10), debounceTime(500), takeUntil(this.destroy$))
      .subscribe((value) => this.addLog('debounceTime', `Output: ${value}`));
  }

  throttleTimeExample() {
    this.addLog('throttleTime', 'Emit first value, then ignore for 500ms...');
    interval(100)
      .pipe(take(20), throttleTime(500), takeUntil(this.destroy$))
      .subscribe((value) => this.addLog('throttleTime', `Output: ${value}`));
  }

  distinctUntilChangedExample() {
    this.addLog('distinctUntilChanged', 'Emit only when value changes...');
    of(1, 1, 2, 2, 3, 3, 3, 4, 4, 5)
      .pipe(distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((value) =>
        this.addLog('distinctUntilChanged', `Output: ${value}`)
      );
  }

  takeUntilExample() {
    this.addLog('takeUntil', 'Emit until notifier emits...');
    const notifier = timer(1500);
    interval(300)
      .pipe(takeUntil(notifier))
      .subscribe({
        next: (value) => this.addLog('takeUntil', `Value: ${value}`),
        complete: () => this.addLog('takeUntil', 'Stopped by notifier ✓'),
      });
  }

  takeWhileExample() {
    this.addLog('takeWhile', 'Take while value < 5...');
    interval(300)
      .pipe(takeWhile((value) => value < 5))
      .subscribe({
        next: (value) => this.addLog('takeWhile', `Value: ${value}`),
        complete: () =>
          this.addLog('takeWhile', 'Condition failed, completed ✓'),
      });
  }

  skipExample() {
    this.addLog('skip', 'Skip first 3 values...');
    of(1, 2, 3, 4, 5, 6, 7, 8)
      .pipe(skip(3), takeUntil(this.destroy$))
      .subscribe((value) => this.addLog('skip', `Output: ${value}`));
  }

  firstExample() {
    this.addLog('first', 'Take only the first value...');
    of(10, 20, 30, 40, 50)
      .pipe(first())
      .subscribe((value) => this.addLog('first', `Output: ${value}`));
  }

  lastExample() {
    this.addLog('last', 'Take only the last value...');
    of(10, 20, 30, 40, 50)
      .pipe(last())
      .subscribe((value) => this.addLog('last', `Output: ${value}`));
  }

  // Error Handling
  catchErrorExample() {
    this.addLog('catchError', 'Handle error and continue with fallback...');
    throwError(() => new Error('Something went wrong!'))
      .pipe(
        catchError((error) => {
          this.addLog('catchError', `Error caught: ${error.message}`);
          return of('Fallback value');
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => this.addLog('catchError', `Output: ${value}`));
  }

  retryExample() {
    this.addLog('retry', 'Retry failed observable 2 times...');
    let attempt = 0;
    new Observable((subscriber) => {
      attempt++;
      this.addLog('retry', `Attempt ${attempt}`);
      if (attempt < 3) {
        subscriber.error('Failed!');
      } else {
        subscriber.next('Success!');
        subscriber.complete();
      }
    })
      .pipe(retry(2), takeUntil(this.destroy$))
      .subscribe({
        next: (value) => this.addLog('retry', `Output: ${value}`),
        error: (err) => this.addLog('retry', `Final error: ${err}`),
      });
  }

  // Combination Operators
  combineLatestExample() {
    this.addLog('combineLatest', '🌐 Комбинирование данных из реальных API...');

    // Получаем данные из JSONPlaceholder API
    const users$ = ajax
      .getJSON<any[]>('https://jsonplaceholder.typicode.com/users')
      .pipe(
        map((users) => users.slice(0, 3)), // Берём первых 3 пользователей
        tap(() => this.addLog('combineLatest', '✓ Пользователи загружены'))
      );

    const posts$ = ajax
      .getJSON<any[]>('https://jsonplaceholder.typicode.com/posts')
      .pipe(
        map((posts) => posts.slice(0, 3)), // Берём первые 3 поста
        tap(() => this.addLog('combineLatest', '✓ Посты загружены'))
      );

    const todos$ = ajax
      .getJSON<any[]>('https://jsonplaceholder.typicode.com/todos')
      .pipe(
        map((todos) => todos.slice(0, 2)), // Берём первые 2 todo
        tap(() => this.addLog('combineLatest', '✓ Задачи загружены'))
      );

    // combineLatest дождётся загрузки всех трёх источников
    combineLatest([users$, posts$, todos$])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([users, posts, todos]) => {
          this.addLog('combineLatest', '━━━━━━━━━━━━━━━━━━━━');
          this.addLog('combineLatest', `👥 Пользователей: ${users.length}`);
          users.forEach((u: any) =>
            this.addLog('combineLatest', `  • ${u.name} (${u.email})`)
          );

          this.addLog('combineLatest', `📝 Постов: ${posts.length}`);
          posts.forEach((p: any) =>
            this.addLog('combineLatest', `  • ${p.title.substring(0, 40)}...`)
          );

          this.addLog('combineLatest', `✅ Задач: ${todos.length}`);
          todos.forEach((t: any) =>
            this.addLog(
              'combineLatest',
              `  • ${t.title} [${t.completed ? '✓' : '✗'}]`
            )
          );

          this.addLog('combineLatest', '━━━━━━━━━━━━━━━━━━━━');
        },
        error: (err) =>
          this.addLog('combineLatest', `❌ Ошибка: ${err.message}`),
      });
  }

  mergeExample() {
    this.addLog('merge', 'Merge multiple observables into one...');
    const numbers$ = interval(400).pipe(
      take(3),
      map((i) => `Num: ${i}`)
    );
    const letters$ = interval(600).pipe(
      take(3),
      map((i) => `Letter: ${String.fromCharCode(65 + i)}`)
    );

    merge(numbers$, letters$)
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => this.addLog('merge', value));
  }

  concatExample() {
    this.addLog('concat', 'Concatenate observables sequentially...');
    const first$ = of('A', 'B', 'C').pipe(delay(300));
    const second$ = of(1, 2, 3).pipe(delay(300));

    concat(first$, second$)
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => this.addLog('concat', `Output: ${value}`));
  }

  zipExample() {
    this.addLog('zip', 'Zip values from multiple observables...');
    const numbers$ = of(1, 2, 3, 4);
    const letters$ = of('A', 'B', 'C');

    zip(numbers$, letters$)
      .pipe(
        map(([num, letter]) => `${num}${letter}`),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => this.addLog('zip', `Output: ${value}`));
  }

  // Utility Operators
  startWithExample() {
    this.addLog('startWith', 'Start stream with initial value...');
    of(2, 3, 4)
      .pipe(startWith(1), takeUntil(this.destroy$))
      .subscribe((value) => this.addLog('startWith', `Output: ${value}`));
  }

  shareReplayExample() {
    this.addLog(
      'shareReplay',
      'Share and replay last value for late subscribers...'
    );
    const shared$ = interval(300).pipe(
      take(4),
      shareReplay(1),
      takeUntil(this.destroy$)
    );

    shared$.subscribe((value) => this.addLog('shareReplay', `Sub 1: ${value}`));

    setTimeout(() => {
      this.addLog('shareReplay', 'Late subscriber joining...');
      shared$.subscribe((value) =>
        this.addLog('shareReplay', `Sub 2: ${value} (shared)`)
      );
    }, 1000);
  }

  everyExample() {
    this.addLog('every', 'Check if all values satisfy condition...');
    of(2, 4, 6, 8)
      .pipe(every((value) => value % 2 === 0))
      .subscribe((result) => this.addLog('every', `All even? ${result}`));

    of(2, 4, 5, 8)
      .pipe(every((value) => value % 2 === 0))
      .subscribe((result) => this.addLog('every', `All even? ${result}`));
  }

  findExample() {
    this.addLog('find', 'Find first value > 5...');
    of(1, 3, 5, 7, 9, 11)
      .pipe(find((value) => value > 5))
      .subscribe((value) => this.addLog('find', `Found: ${value}`));
  }

  // ========== ORIGINAL METHODS ==========

  throwError() {
    const errorWithTimestamp$ = throwError(() => {
      const error: any = new Error('This is an error');
      error.timestamp = Date.now();
      return error;
    });
    errorWithTimestamp$.subscribe({
      error: (err) => console.error(err.timestamp, err.message),
    });
  }

  examples() {
    // Создание Observable из массива данных:
    {
      const numbers$ = of([1, 2, 3, 4, 5]);
      // const numbers$ = new Observable((subscriber) => {
      //   numbers.forEach((number) => subscriber.next(number));
      //   // subscriber.complete();
      // });
      numbers$.subscribe((number) => console.log(number));
    }

    // {
    //   // Создание Observable из события DOM:
    //   const button = document.querySelector('button') as HTMLButtonElement;
    //   const buttonClick$ = fromEvent(button, 'click');

    //   buttonClick$.subscribe((event) => console.log('Button clicked!'));
    // }

    // {
    //   // Создание Observable из таймера(аналогично setTimout):

    //   delay(3000);
    //   console.log('delay finished');

    //   const timer$ = timer(2000);
    //   timer$.subscribe(() => console.log('2 seconds have passed!'));
    // }

    // Комбинирование нескольких Observable:
    // {
    //   const numbers$ = new Observable<number>((subscriber) => {
    //     subscriber.next(1);
    //     subscriber.next(2);
    //     subscriber.next(3);
    //     subscriber.complete();
    //   });

    //   const button = document.querySelector('button') as HTMLButtonElement;
    //   const buttonClick$ = fromEvent(button, 'click');

    //   const combined$ = numbers$.pipe(
    //     // filter((number) => number >= 2),
    //     map((number: any) => number * 2),
    //     map((number) => `Result: ${number}`)
    //   );

    //   buttonClick$.subscribe(() => {
    //     combined$.subscribe((result) => console.log(result));
    //   });
    // }

    // {
    //   // Отслеживание изменений в форме:
    //   const input = document.querySelector('input') as HTMLInputElement;
    //   const input$ = fromEvent(input, 'input').pipe(
    //     filter((event) => !!event.target),
    //     map((event: any) => event.target?.value)
    //   );

    //   input$
    //     // .pipe(take(10))
    //     // .pipe(takeUntil(input$))
    //     .subscribe((value) => console.log(value));
    // }

    // {
    //   // Запрос данных с сервера(пример сервиса):
    //   const url = 'https://jsonplaceholder.typicode.com/users';
    //   const users$ = ajax.getJSON(url);

    //   users$.subscribe((users) => console.log(users));
    // }

    // {
    //   // Отслеживание кликов на кнопке:
    //   const button = document.querySelector('button') as HTMLButtonElement;
    //   const buttonClick$ = fromEvent(button, 'click');

    //   buttonClick$.subscribe(() => console.log('Button clicked!'));
    // }

    // {
    //   // Отслеживание нажатия клавиш:
    //   const input = document.querySelector('input') as HTMLInputElement;
    //   const input$ = fromEvent(input, 'keydown').pipe(
    //     filter((event: any) => event?.key === 'Enter' || event?.key === 'Backspace')
    //   );
    //   input$.subscribe(() => console.log('Enter/Backspace key pressed!'));
    // }

    // delay(2000);
    // console.log('Test delay');
    // {
    //   // Отложенная отправка запроса:
    //   const delay$ = new Observable((subscriber) => {
    //     setTimeout(() => {
    //       subscriber.next('Data after delay!');
    //       subscriber.complete();
    //     }, 3000);
    //   });

    //   delay$.subscribe((data) => console.log(data));

    //   const testObservable$ = of(['First', 'Sceond', 'Third']);
    //   testObservable$
    //     .pipe(
    //       delay(5000),
    //       map((el) => console.log('el: ' + el))
    //     )
    //     .subscribe();
    // }

    // {
    //   // Создание потока счетчика:
    //   const counter$ = interval(1000);
    //   counter$.subscribe((count) => console.log(count));
    // }

    // {
    //   // Объединение нескольких потоков данных:
    //   const letters$ = new Observable<string>((subscriber) => {
    //     subscriber.next('A');
    //     setTimeout(() => subscriber.next('B'), 2000);
    //     setTimeout(() => subscriber.next('C'), 4000);
    //   });

    //   const numbers$ = new Observable<number>((subscriber) => {
    //     subscriber.next(1);
    //     setTimeout(() => subscriber.next(2), 1000);
    //     setTimeout(() => subscriber.next(3), 3000);
    //   });

    //   combineLatest([letters$, numbers$]).subscribe((data) =>
    //     console.log(data)
    //   );
    // }

    // {
    //   // Фильтрация потока данных:
    //   const numbers$ = new Observable((subscriber) => {
    //     subscriber.next(1);
    //     subscriber.next(2);
    //     subscriber.next(3);
    //     subscriber.next(4);
    //     subscriber.next(5);
    //   });

    //   const evenNumbers$ = numbers$.pipe(
    //     filter((number: any) => number % 2 === 0)
    //   );

    //   evenNumbers$.subscribe((number) => console.log(number));
    // }

    // {
    //   // Преобразование данных в потоке:
    //   const numbers$ = new Observable((subscriber) => {
    //     subscriber.next(1);
    //     subscriber.next(2);
    //     subscriber.next(3);
    //     subscriber.next(4);
    //     subscriber.next(5);
    //   });

    //   // numbers$.pipe()
    // }
  }
}

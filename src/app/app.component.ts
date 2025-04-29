import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
} from 'rxjs';
import { ajax } from 'rxjs/ajax';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    // this.observableExample();
    // this.observerExample();
    // this.subjectExample();
    // this.behaviourSubjectExample();
    // this.replySubjectExample();
    // this.asyncSubjectExample();
    // this.throwError();
    this.examples();
  }

  observableExample() {
    const observable = new Observable<string>((subscriber) => {
      subscriber.next('Data 1');
      subscriber.next('Data 2');
      setTimeout(() => {
        subscriber.next('Async Data');
        subscriber.complete();
      }, 3000);
    });

    observable.subscribe({
      next: (data) => console.log('Received:', data),
      complete: () => console.log('Completed'),
      error: () => console.log('Completed'),
    });
  }

  observerExample() {
    // Создаем Observable
    const observable = new Observable((subscriber) => {
      subscriber.next('First value');
      subscriber.next('Second value');
      setTimeout(() => {
        subscriber.next('Async value');
        subscriber.complete();
      }, 1000);
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

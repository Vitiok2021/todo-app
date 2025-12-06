import { computed, Injectable, signal, effect } from '@angular/core';
import { ToDo } from '../interfaces/to-do';

@Injectable({
  providedIn: 'root',
})
export class ToDosService {
  constructor() {
    const localSaved = localStorage.getItem('todos');
    if (localSaved) {
      this._state.set(JSON.parse(localSaved));
    }
  }

  private readonly _state = signal<ToDo[]>([]);
  state = this._state.asReadonly();

  private setState(reducer: (state: ToDo[]) => ToDo[]) {
    this._state.update(reducer);
  }

  // to-Do: filters will be added tomorrow
  private readonly _filter = signal<'all' | 'active' | 'completed'>('all');
  filter = this._filter.asReadonly();

  setFilter(filter: 'all' | 'active' | 'completed') {
    this._filter.set(filter);
  }

  filteredTodos = computed(() => {
    const filter = this._filter();
    let todos = [...this._state()];

    if (filter === 'completed') {
      return todos.filter((item) => item.completed);
    } else if (filter === 'active') {
      return todos.filter((item) => !item.completed);
    }

    if (this._sortCompletedLast?.()) {
      todos.sort((a, b) => Number(a.completed) - Number(b.completed));
    }

    return todos;
  });

  addTodo(title: string) {
    const autoincrId =
      this._state().length === 0
        ? 1
        : Math.max(...this._state().map((item) => item.id)) + 1;
    this.setState((list) => [
      ...list,
      { id: autoincrId, title: title, completed: false },
    ]);
  }
  toggleCompleted(id: number) {
    this.setState((list) => {
      return list.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
    });
  }
  updateTodo(id: number, newTitle: string) {
    this.setState((list) => {
      return list.map((item) =>
        item.id === id ? { ...item, title: newTitle } : item
      );
    });
  }
  removeTodo(id: number) {
    this.setState((list) => {
      return list.filter((item) => item.id !== id);
    });
  }

  completedCount = computed(
    () => this._state().filter((counter) => counter.completed).length
  );
  notCompletedCount = computed(
    () => this._state().filter((counter) => !counter.completed).length
  );

  private readonly _persistEffect = effect(() => {
    const todos = this._state();
    localStorage.setItem('todos', JSON.stringify(todos));
  });
  clearCompleted() {
    this.setState((list) => list.filter((item) => !item.completed));
  }
  setNewOrder(newList: ToDo[]) {
    this._state.set(newList);
  }

  private readonly _sortCompletedLast = signal(false);
  sortCompletedLast = this._sortCompletedLast.asReadonly();

  toggleSortCompletedLast() {
    this._sortCompletedLast.update((item) => !item);
  }
}

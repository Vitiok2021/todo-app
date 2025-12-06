import { Component, inject, ViewChild } from '@angular/core';
import { ToDosService } from '../../services/to-dos.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { EditDialogComponent } from '../../edit-dialog/edit-dialog.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-to-do',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonToggleModule,
    DragDropModule,
  ],
  templateUrl: './to-do.component.html',
  styleUrl: './to-do.component.scss',
})
export class ToDoComponent {
  @ViewChild('todoInput') todoInput!: any;

  constructor(private snackBar: MatSnackBar, private dialog: MatDialog) {}
  drop(event: CdkDragDrop<any[]>) {
    const todos = [...this.filteredTodos2()];
    const moved = todos.splice(event.previousIndex, 1)[0];
    todos.splice(event.currentIndex, 0, moved);

    this.toDoService.setNewOrder(todos);
  }
  openEditDialog(item: any) {
    const dialogRef = this.dialog.open(EditDialogComponent, {
      data: { ...item },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.toDoService.updateTodo(result.id, result.title);
      }
    });
  }
  toDoService = inject(ToDosService);
  sortCompletedLast = this.toDoService.sortCompletedLast;
  state = this.toDoService.state;
  completedCount = this.toDoService.completedCount;
  notCompletedCount = this.toDoService.notCompletedCount;
  newTitle = '';

  selectedFilter: 'all' | 'active' | 'completed' = 'all';

  filteredTodos2 = this.toDoService.filteredTodos;

  addToDo(title: string) {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }

    this.toDoService.addTodo(title);
    setTimeout(() => {
      const list = document.querySelectorAll('.todo-item');
      const last = list[list.length - 1];
      last?.classList.add('new');
      setTimeout(() => {
        last?.classList.remove('new');
      }, 300);
    });
    this.newTitle = '';
    this.todoInput.nativeElement.focus();
    this.snackBar.open('Task added!', 'Close', {
      duration: 2000,
    });
  }
  toggle(id: number) {
    this.toDoService.toggleCompleted(id);
  }
  remove(id: number) {
    this.toDoService.removeTodo(id);
  }
  applyFilter(filter: 'all' | 'active' | 'completed') {
    this.selectedFilter = filter;
    this.toDoService.setFilter(filter);
  }

  clearCompl() {
    this.toDoService.clearCompleted();
  }
  toggleSortCompletedLast() {
    this.toDoService.toggleSortCompletedLast();
  }
}

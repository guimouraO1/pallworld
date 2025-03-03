import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Palls } from '../../models/pall-list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { PallService } from '../../services/pall.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { of } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  FormElement = new FormControl('');
  elementOptions: string[] = [
    'Fire',
    'Water',
    'Neutral',
    'Dark',
    'Dragon',
    'Electric',
    'Grass',
    'Ground',
    'Ice',
  ];
  private urlApi = `${environment.urlApi}`;
  myPalls: any;
  searchTerm: string = '';
  searchElements: string[] = [];
  elementList: string[] = [];

  constructor(private _pallService: PallService, private http: HttpClient) {}
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  Palls = Palls;
  totalItems: number = Palls.length;
  pageSize: number = 10;
  currentPage: number = 0;

  ngOnInit() {
    this.Palls = Palls;
    this.getPalls();
    this.paginator.pageSize = this.pageSize;
    this.paginator._intl.itemsPerPageLabel = 'Palls per Page';
  }

  // Método para obter a página atual
  get currentPageData() {
    const startIndex = this.currentPage * this.pageSize;
    return of(this.Palls.slice(startIndex, startIndex + this.pageSize));
  }

  // Método chamado quando a página é alterada
  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.scrollToTop();
  }
  scrollToTop() {
    const pallListElement = document.querySelector('.pall-list');
    if (pallListElement) {
      pallListElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  isPallInMyPalls(pallId: any): boolean {
    return this.myPalls.some((myPall: { id: any }) => myPall.id === pallId);
  }

  async getPalls() {
    this._pallService.getPalls().subscribe({
      next: (_palls: any) => {
        this.myPalls = _palls;
      },
      error: (error: any) => {
        // console.error('Erro ao obter usuário:', error);
      },
    });
  }

  addToPalldex(pallId: string) {
    const authToken = localStorage.getItem('token');
    const headers = new HttpHeaders().set('authorization', `${authToken}`);

    this.http
      .post(`${this.urlApi}/user/palls`, { pallId }, { headers })
      .subscribe({
        next: (res: any) => {
          this.ngOnInit();
        },
        error: (e: any) => {},
      });
  }

  searchBy() {
    // Resetar a página para a primeira
    this.currentPage = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    if (this.searchElements.length > 0 || this.searchTerm.trim() !== '') {
      if (this.searchElements.length > 0 && this.searchTerm.trim() !== '') {
        this.Palls = Palls.filter(
          (pall) =>
            this.searchElements.every((element) =>
              pall.elements.includes(element)
            ) && pall.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      } else if (this.searchElements.length > 0) {
        this.Palls = Palls.filter((pall) =>
          this.searchElements.every((element) =>
            pall.elements.includes(element)
          )
        );
      } else if (this.searchTerm.trim() !== '') {
        this.Palls = Palls.filter((pall) =>
          pall.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
      }
    } else {
      this.Palls = Palls;
    }
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.searchBy();
    }
  }
  // if (this.searchElement.trim() !== '') {
  //   this.Palls = Palls.filter(pall => pall.elements.includes(this.searchElement));
  // } else {
  //   this.Palls = Palls;
  // }

  // if (this.searchTerm.trim() !== '') {
  //   this.Palls = Palls.filter(pall => pall.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
  // } else {
  //   this.Palls = Palls;
  // }
}

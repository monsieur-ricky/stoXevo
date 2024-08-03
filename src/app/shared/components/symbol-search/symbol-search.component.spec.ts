import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SymbolSearchComponent } from './symbol-search.component';

describe('SearchFieldComponent', () => {
  let component: SymbolSearchComponent;
  let fixture: ComponentFixture<SymbolSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SymbolSearchComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SymbolSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

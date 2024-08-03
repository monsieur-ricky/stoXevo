import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationPinComponent } from './application-pin.component';

describe('ApplicationPinComponent', () => {
  let component: ApplicationPinComponent;
  let fixture: ComponentFixture<ApplicationPinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplicationPinComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationPinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

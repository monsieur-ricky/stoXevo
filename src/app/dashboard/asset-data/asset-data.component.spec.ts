import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetDataComponent } from './asset-data.component';

describe('AssetDataComponent', () => {
  let component: AssetDataComponent;
  let fixture: ComponentFixture<AssetDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

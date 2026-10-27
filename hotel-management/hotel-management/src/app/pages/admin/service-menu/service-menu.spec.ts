import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceMenu } from './service-menu';

describe('ServiceMenu', () => {
  let component: ServiceMenu;
  let fixture: ComponentFixture<ServiceMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

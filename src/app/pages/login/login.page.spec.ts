import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginPage } from './login.page';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

describe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginPage],
      imports: [IonicModule.forRoot(), FormsModule],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with splash screen visible', () => {
    expect(component.showSplash).toBeTrue();
  });

  it('should navigate to login form on goToLoginForm', () => {
    component.goToLoginForm();
    expect(component.showSplash).toBeFalse();
  });

  it('should login and route to tabs/home with valid credentials', () => {
    component.username = 'admin';
    component.password = 'admin';
    component.login();
    
    expect(component.errorMessage).toBe('');
    expect(localStorage.getItem('stamp-me-demo-session')).toBe('active');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/tabs/home']);
  });

  it('should set error message with invalid credentials', () => {
    component.username = 'wrong';
    component.password = 'pass';
    component.login();
    
    expect(component.errorMessage).toBe('Use admin / admin para entrar na demonstração.');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should reset state on ionViewWillEnter', () => {
    component.showSplash = false;
    component.username = 'test';
    component.password = 'test';
    component.errorMessage = 'error';
    
    component.ionViewWillEnter();
    
    expect(component.showSplash).toBeTrue();
    expect(component.username).toBe('');
    expect(component.password).toBe('');
    expect(component.errorMessage).toBe('');
  });
});

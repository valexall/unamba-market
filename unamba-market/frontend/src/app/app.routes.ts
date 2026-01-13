import { Routes } from '@angular/router';
import { Landing } from './page/landing/landing';
import { Home } from './page/home/home';
import { Login } from './page/login/login';
import { ProductInsert } from './page/product-insert/product-insert';
import { ProductDetail } from './page/product-detail/product-detail/product-detail';
import { Chat } from './page/chat/chat';
import { Register } from './page/register/register';
import { Inventory } from './page/inventory/inventory';
import { ProfileComponent } from './page/profile/profile';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', component: Landing },
    { path: 'home', component: Home },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { 
        path: 'product/create', 
        component: ProductInsert,
        canActivate: [authGuard]
    },
    { 
        path: 'product/edit/:id', 
        component: ProductInsert,
        canActivate: [authGuard]
    },
    { path: 'product/detail/:id', component: ProductDetail },
    { 
        path: 'chat', 
        component: Chat,
        canActivate: [authGuard]
    },
    { 
        path: 'inventory', 
        component: Inventory,
        canActivate: [authGuard]
    },
    { 
        path: 'profile', 
        component: ProfileComponent,
        canActivate: [authGuard]
    },
    { path: '**', redirectTo: '' },
];
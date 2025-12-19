import { Routes } from '@angular/router';
import { Landing } from './page/landing/landing';
import { Home } from './page/home/home';
import { Login } from './page/login/login';
import { ProductInsert } from './page/product-insert/product-insert';
import { ProductDetail } from './page/product-detail/product-detail/product-detail';
import { Chat } from './page/chat/chat';
import { Register } from './page/register/register';

export const routes: Routes = [
    { path: '', component: Landing }, 
    { path: 'home', component: Home },
    { path: 'login', component: Login },
    { path: 'product/create', component: ProductInsert },
    { path: 'product/detail/:id', component: ProductDetail },
    { path: 'chat', component: Chat },
    { path: 'register', component: Register },
    { path: '**', redirectTo: '' } 
];
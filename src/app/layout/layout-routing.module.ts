import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from '../auth/profile/profile.component';
import { CategoriaComponent } from './categoria/categoria.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LayoutComponent } from './layout.component';
import { ProductoComponent } from './producto/producto.component';
import { ProveedorComponent } from './proveedor/proveedor.component';
import { UserComponent } from './user/user.component';

const routes: Routes = [
  {
    path:'',
    component:LayoutComponent,
    children:[
      {path:'dashboard',component:DashboardComponent},
      {path:'categorias',component:CategoriaComponent},
      {path:'productos',component:ProductoComponent},
      {path:'users',component:UserComponent},
      {path:'proveedor',component:ProveedorComponent},
      {path:'profile',component:ProfileComponent}
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }

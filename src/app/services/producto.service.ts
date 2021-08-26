import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry } from 'rxjs/operators';
import {Producto} from '../layout/producto/producto.models';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(private http: HttpClient) { }
  
  listarProductos():Observable<any>{
    const url = environment.domain_url + '/api/productos/listarProductos';
    return this.http.get<any>(url).pipe( retry(2) );
  }

  insertarProducto(pro:Producto):Observable<any>{
    const url = environment.domain_url + '/api/productos/insertar';
    const datos = {
      PRO_NOMBRE: pro.PRO_NOMBRE,
      PRO_CODIGO: pro.PRO_CODIGO,
      PRO_PRECIO_VENTA: pro.PRO_PRECIO_VENTA,
      PRO_PRECIO_COMPRA: pro.PRO_PRECIO_COMPRA,
      PRO_STOCK: pro.PRO_STOCK,
      PRO_TAMANIO_TALLA: pro.PRO_TAMANIO_TALLA,
      CAT_ID: pro.CAT_ID,
    }
    return this.http.post<any>(url,datos).pipe( retry(2) );
  }

}

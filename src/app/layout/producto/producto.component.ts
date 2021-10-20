import { Component,  ElementRef, OnInit, ViewChild } from '@angular/core';
import {Categoria} from '../categoria/categoria.model';
import {Producto} from '../producto/producto.models';
import {CategoriaService} from '../categoria/categoria.service';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {ProductoService} from '../../services/producto.service';
import {ProveedorService} from '../../services/proveedor.service';
import { Proveedor } from '../proveedor/proveedor.models';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {


  categorias: Categoria[] = [];
  proveedores: Proveedor[] = [];
  productos:any[]=[];
  productoSeleccionado:Producto;
  constructor(private categoriaService:CategoriaService,
    private formBuilder: FormBuilder,
    public modal: NgbModal,
    configModal: NgbModalConfig,
    private productoService:ProductoService,
    private proveedorService:ProveedorService) 
    { 
      configModal.backdrop = 'static';
      configModal.keyboard = false;
    }


  nombreCategoria:string;
  nombreProveedor:string;
  precioAnterior:number; 
  fechaAnterior:Date;

// Paginación
  currentPage = 1;
  itemsPerPage = 10;

  
  productoForm: FormGroup;
  productoInsertar = new Producto();
  
  
  //Variables de cargando y error
  cargando = false;
  modalIn = false;
  mensaje_alerta: string;
  mostrar_alerta: boolean = false;
  tipo_alerta :string;
  

  //modal para editar un Producto
  @ViewChild('editarProducto') editarPro: ElementRef;
  //modal para crear una categoria
  @ViewChild('crearProducto') crearPro: ElementRef;
  //modal para ver más de algún producto verProducto
  @ViewChild('verProducto') verMasPro: ElementRef;


  ngOnInit(): void {
    this.listarProductos();
  }

  listarProveedores(){
    this.cargando = false;
    this.modalIn = true;
    this.proveedorService.listarProveedores().subscribe(
      (data)=>{
        this.proveedores = data['resultado'];
        this.cargando = false;
        this.modalIn = true;
      },
      (error) =>{
        this.cargando = false;
        this.mostrar_alerta = true;
        this.tipo_alerta='danger';
        this.modalIn = true;
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_deBD') {
            this.mensaje_alerta = 'Hubo un error al intentar ejecutar su solicitud. Por favor, actualice la página.';
          }
        }
        else{
          this.mensaje_alerta = 'Hubo un error al mostrar la información de esta página. Por favor, actualice la página.';
        }
      }
    );
  }
  abrirVerMasProducto(producto:any){
    this.productoSeleccionado = producto;
    this.nombreCategoria = producto.CAT_NOMBRE;
    this.nombreProveedor = producto.PROV_EMPRESA_PROVEEDORA;
    this.precioAnterior = producto.PRO_PRECIO_ANTERIOR;
    this.fechaAnterior = producto.PRO_FECHA_CAMBIO_PRECIO;
    console.log(this.nombreCategoria);
    this.modal.open(this.verMasPro, {size: 'lg'});
  }
  abrirEditarProducto(producto:Producto) {
    this.listarProveedores();
    this.listarCategorias();
    this.inicializarFormulario();
    this.productoSeleccionado = producto;
    this.nombreProducto.setValue(this.productoSeleccionado.PRO_NOMBRE);
    this.pVentaProducto.setValue(this.productoSeleccionado.PRO_PRECIO_VENTA);
    this.pCompraProducto.setValue(this.productoSeleccionado.PRO_PRECIO_COMPRA);
    this.tamnioTallaProducto.setValue(this.productoSeleccionado.PRO_TAMANIO_TALLA);
    this.categoria.setValue(this.productoSeleccionado.CAT_ID);
    this.proveedor.setValue(this.productoSeleccionado.PROV_ID);
    this.modal.open(this.editarPro, {size: 'lg'});
  }


  inicializarFormulario(){
    this.productoForm = this.formBuilder.group({
      nombreProducto:['',[Validators.required, Validators.maxLength(60)]],
      pVentaProducto:['',[Validators.required, Validators.maxLength(60)]],
      pCompraProducto:['',[Validators.required, Validators.maxLength(60)]],
      tamnioTallaProducto:['',[Validators.required, Validators.maxLength(60)]],
      categoria:['',[Validators.required]],
      proveedor:['',[Validators.required]],
    });

  }
  get categoria() {
    return this.productoForm.get('categoria');
  }
  get proveedor() {
    return this.productoForm.get('proveedor');
  }
  get tamnioTallaProducto() {
    return this.productoForm.get('tamnioTallaProducto');
  }
  get stockProducto() {
    return this.productoForm.get('stockProducto');
  }
  get pCompraProducto() {
    return this.productoForm.get('pCompraProducto');
  }
  get pVentaProducto() {
    return this.productoForm.get('pVentaProducto');
  }
  get codigoProducto() {
    return this.productoForm.get('codigoProducto');
  }
  get nombreProducto() {
    return this.productoForm.get('nombreProducto');
  }

  resetForm(){
    this.productoForm.reset();
  }

  editarProductoFunc(){
    this.cargando = true;
    this.modalIn = true;
    this.productoInsertar.PRO_ID = this.productoSeleccionado.PRO_ID;
    this.productoInsertar.PRO_CODIGO = "";
    this.productoInsertar.PRO_STOCK = +"0"; 
    this.productoInsertar.PRO_TAMANIO_TALLA =  this.tamnioTallaProducto.value;
    this.productoInsertar.PRO_NOMBRE = this.nombreProducto.value;
    this.productoInsertar.PRO_PRECIO_VENTA = (+this.pVentaProducto.value * 1.00);
    this.productoInsertar.PRO_PRECIO_COMPRA = (+this.pCompraProducto.value * 1.00);
    this.productoInsertar.CAT_ID = +this.categoria.value;
    this.productoInsertar.PROV_ID = +this.proveedor.value;

    this.productoService.editarProductoSeleccionado(this.productoInsertar).subscribe(
      (data)=>{
        this.productoInsertar = null;
        this.productoSeleccionado= null;
        this.productos.length = 0;
        this.cargando = false;
        this.modalIn = false;
        this.productoForm.reset();
        this.listarProductos();
        this.modal.dismissAll();
      },
      (error)=>{
        this.cargando = false;
        this.modalIn = true;

      }
    );
  }

  listarProductos(){
    this.cargando = true;
    this.modalIn = false;
    this.productoService.listarProductos().subscribe(
      (data)=>{
        this.productos = data['resultado']; 
        this.cargando = false; 
      },
      (error) =>{
        this.cargando = false;
        this.mostrar_alerta = true;
        this.tipo_alerta='danger';
        this.modalIn = false;
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_deBD') {
            this.mensaje_alerta = 'Hubo un error al intentar ejecutar su solicitud. Por favor, actualice la página.';
          }
        }
        else{
          this.mensaje_alerta = 'Hubo un error al mostrar la información de esta página. Por favor, actualice la página.';
        }
      }
    ); 
  }
  listarCategorias(){
    this.cargando = true;
    this.modalIn = true;
    this.categoriaService.listarCategorias().subscribe(
      (data)=>{
        this.categorias = data['resultado']; 
        this.cargando = false;
        this.modalIn = true;
      },
      (error) =>{
        this.cargando = false;
        this.mostrar_alerta = true;
        this.tipo_alerta='danger';
        this.modalIn = true;
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_deBD') {
            this.mensaje_alerta = 'Hubo un error al intentar ejecutar su solicitud. Por favor, actualice la página.';
          }
        }
        else{
          this.mensaje_alerta = 'Hubo un error al mostrar la información de esta página. Por favor, actualice la página.';
        }
      }
    );
  }

  closeModal(): any {
    this.productoInsertar = null; 
    this.productoSeleccionado = null;
    this.productoForm.reset();
    this.modal.dismissAll();
  } 
  insertarProducto(producto:any){
    this.cargando = true;
    this.modalIn = true;
    this.productoInsertar.PRO_CODIGO = "";
    this.productoInsertar.PRO_STOCK = +"0"; 
    this.productoInsertar.PRO_TAMANIO_TALLA =  this.tamnioTallaProducto.value;
    this.productoInsertar.PRO_NOMBRE = this.nombreProducto.value;
    this.productoInsertar.PRO_PRECIO_VENTA = (+this.pVentaProducto.value * 1.00);
    this.productoInsertar.PRO_PRECIO_COMPRA = (+this.pCompraProducto.value * 1.00);
    this.productoInsertar.CAT_ID = +this.categoria.value;
    this.productoInsertar.PROV_ID = +this.proveedor.value;
    this.crearNuevoProducto();
  }

  habilitarInhabilitarProducto(PRO_ID:number,PRO_ESTADO:number){

    if(PRO_ESTADO == 1){
      PRO_ESTADO = 2; 
    }else{
      PRO_ESTADO =  1; 
    }
    this.productoService.habilitarDeshabilitarProducto(PRO_ID,PRO_ESTADO).subscribe(
      (data)=>{
        
        this.listarProductos(); 
      },(error)=>{

      });
  } 


  crearNuevoProducto(){
    this.cargando = true;
    this.modalIn = true;
    this.productoService.insertarProducto(this.productoInsertar).subscribe(
      data=>{
        this.mensaje_alerta = 'Producto creado de forma exitosa.';
        this.tipo_alerta = 'success';
        this.cargando = false;
        this.modalIn = false;
        this.listarProductos();
        this.closeModal();
      },error=>{
        this.cargando = false;
        this.mostrar_alerta = true;
        this.modalIn = true;
        this.tipo_alerta='danger';
        if (error.error.error !== undefined) {
          if (error.error.error === 'error_deBD') {
            this.mensaje_alerta = 'Hubo un error al intentar ejecutar su solicitud. Problemas con el servidor, vuelva a intentarlo.';
          } else if(error.error.error === 'error_deCampo'){
            this.mensaje_alerta = 'Los datos ingresados son invalidos. Por favor, vuelva a intentarlo.';
          }else if(error.error.error === 'error_ejecucionQuery'){
            this.mensaje_alerta = 'Hubo un error al registrar el producto. Por favor, actualice la página o inténtelo más tarde.';
          }else if(error.error.error === 'error_exitenciaProveedorId'){
            this.mensaje_alerta = 'Hubo un error al registrar el producto (Hubo problemas al validar el proveedor). Por favor, actualice la página o inténtelo más tarde.';
          }else if(error.error.error === 'error_exitenciaCategoriaId'){
            this.mensaje_alerta = 'Hubo un error al registrar el producto (Hubo problemas al validar la categoría). Por favor, actualice la página o inténtelo más tarde.';
          }
        }
        else{
          this.mensaje_alerta = 'Hubo un error en el servidor al registrar el producto. Por favor, actualice la página.';
        }
        
      }
      
    );
  }
  

  abrirCrearProducto() {
    this.listarProveedores();
    this.listarCategorias();
    this.inicializarFormulario();
    this.modal.open(this.crearPro, {size: 'lg'});
  }

}

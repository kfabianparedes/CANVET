import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Servicio } from 'src/app/models/servicio';
import { TipoServicio } from 'src/app/models/tipo-servicio';
import { MascotaService } from 'src/app/services/mascota.service';
import { TipoServicioService } from 'src/app/services/tipoServicio.service';
import { compare, SorteableDirective } from 'src/app/shared/directives/sorteable.directive';
import { ServicioService } from 'src/app/services/servicio.service';
import { MetodoPagoService } from 'src/app/services/metodoPago.service';
import { MetodoPago } from 'src/app/models/metodo-pago';
import { StorageService } from 'src/app/services/storage.service';
import { ComprobanteService } from 'src/app/services/comprobante.service';
import { Comprobante } from 'src/app/models/comprobante.model';

@Component({
  selector: 'app-servicio',
  templateUrl: './servicio.component.html',
  styleUrls: ['./servicio.component.css']
})
export class ServicioComponent implements OnInit {
  //Variables de cargando y error
  cargando = false;
  modalIn = false;
  mensaje_alerta: string;
  mostrar_alerta: boolean = false;
  tipo_alerta: string;

  //variable de fecha
  opacarFecha: boolean = true;
  
  
  constructor(
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private mascotaService:MascotaService,
    private servicioService:ServicioService,
    private tipoServicioService:TipoServicioService,
    private modal: NgbModal,
    private configModal: NgbModalConfig,
    private storageService:StorageService,
    private comprobanteService:ComprobanteService,
    private metodoPago:MetodoPagoService,
  ) {
    this.configModal.backdrop = 'static';
    this.configModal.keyboard = false;
  }

  ngOnInit(): void {
    this.listarMascotas();
    this.listarServicios();
    this.listarMetodoPago();
    this.listarComprobantes();
    this.inicializarServicioFormulario();
  }

  //******************INGRESAR DATOS REGISTRO SERVICIO ********************/
  servicioForm : FormGroup;
  inicializarServicioFormulario(){
    this.servicioForm = this.formBuilder.group({
      servicio:['',[Validators.required]],
      modalidad:['',[Validators.required]],
      descripcion:['',[Validators.maxLength(200),Validators.pattern('^[a-zñáéíóú#°/,. A-ZÑÁÉÍÓÚ  0-9]+$')]],
      precio:['',[Validators.required, Validators.pattern('[0-9]+[.]?[0-9]*')]],
      adelanto:[0.00,[Validators.pattern('[0-9]+[.]?[0-9]*')]],
      forma_pago:['',[Validators.required]],
      tipo_comprobante:['',[Validators.required]],
      hora:['',[Validators.required]],
      fecha:['',[Validators.required]]
    });
  }

  //getters & setters
  get servicio() {
    return this.servicioForm.get('servicio');
  }
  get modalidad() {
    return this.servicioForm.get('modalidad');
  }
  get descripcion() {
    return this.servicioForm.get('descripcion');
  }
  get precio(){
    return this.servicioForm.get('precio');
  }
  get adelanto(){
    return this.servicioForm.get('adelanto');
  }
  get forma_pago(){
    return this.servicioForm.get('forma_pago');
  }
  get tipo_comprobante(){
    return this.servicioForm.get('tipo_comprobante');
  }
  get hora() {
    return this.servicioForm.get('hora');
  }
  get fecha() {
    return this.servicioForm.get('fecha');
  }
  cambiarDeStyleDate() {
    this.opacarFecha = false;
  }
  getTodayFecha(): string {
    const fechaActual = this.datePipe.transform(new Date().toLocaleString("en-US", {timeZone: "America/Lima"}), "yyyy-MM-dd");
    return fechaActual;
  }

  /*************************** LISTAR MASCOTAS ****************************/
  mascotas: any[] = [];

  listarMascotas(){
    this.mostrar_alerta = false;
    this.cargando = true;
    this.modalIn = false;
    this.mascotaService.listarMascotasActivas().subscribe(
      (data)=>{
        this.mascotas_iniciales = data['resultado'];
        this.mascotas_iniciales =
        this.mascotas = this.mascotas_iniciales.slice();
        this.cargando = false;
        console.log(data);
      },
      (error)=>{
        this.cargando = false;
        this.mostrar_alerta = true;
        this.tipo_alerta='danger';
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_deBD') {
            this.mensaje_alerta = 'Hubo un error al intentar ejecutar su solicitud. Por favor, actualice la página.';
          }
        }
        else{
          this.mensaje_alerta = 'Hubo un error al mostrar la información de esta página. Por favor, actualice la página.';
        }
      }
    )
  }

  /************************** LISTAR TIPO SERVICIOS **********************************/
  tiposServicios: TipoServicio[] = [];
  listarServicios(){
    this.mostrar_alerta = false;
    this.cargando = true;
    this.modalIn = false;
    this.tipoServicioService.listarTipoServicio().subscribe(
      (data)=>{
        this.tiposServicios = data['resultado'];
        this.cargando = false;
        console.log(this.tiposServicios);
      },
      (error)=>{
        this.cargando = false;
        this.mostrar_alerta = true;
        this.tipo_alerta='danger';
        if (error['error']['error'] !== undefined) {
          if (error['error']['error'] === 'error_deBD') {
            this.mensaje_alerta = 'Hubo un error al intentar ejecutar su solicitud. Por favor, actualice la página.';
          }
        }
        else{
          this.mensaje_alerta = 'Hubo un error al mostrar la información de esta página. Por favor, actualice la página.';
        }
      }
    )
  }

  /*************************** BUSCAR MASCOTA *************************/
  @ViewChild('buscarMascotaModal') buscarMascotaModal: ElementRef;
  //Variables de cliente
  mascotas_iniciales: any[] = [];
  mascota_seleccionada: any;
  nombre_mascota_seleccionada:string = '';
  //Paginacion de tabla
  currentPage = 1;
  itemsPerPage = 5;

  tipo_cliente : number = -1;
  abrirBusqueda(){
    this.mascota_seleccionada = null;
    this.nombre_mascota_seleccionada = '';

    if(this.tipo_comprobante.value!=1 && this.tipo_comprobante.value!=2){
      this.mostrar_alerta = true;
      this.tipo_alerta='danger';
      this.modalIn = false;
      this.mensaje_alerta = 'Debe de seleccionar el tipo de comprobante. Por favor, vuelva a intentarlo.';
    }else{
      //TIPO DE COMPROBANTE 1 (FACTURA) ES PARA CLIENTE JURIDICO (TIPO CLIENTE => 1)
      //TIPO DE COMPROBANTE 2 (BOLETA) ES PARA CLIENTE NATURAL (TIPO CLIENTE => 0)
      if(this.tipo_comprobante.value == 1){ //FACTURA TIENE QUE SE JURIDICO
        this.tipo_cliente = 1; //Juridico
      }else{
        this.tipo_cliente = 0; // natural
      }
      this.modal.open(this.buscarMascotaModal,{size:'xl'});
    }
    
  }
  mascota_id_seleccionada: number = 0;
  agregarMascota(mascota:any){
    if((mascota.TIPO_CLIENTE == 1 && this.tipo_comprobante.value == 1) || (mascota.TIPO_CLIENTE == 0 && this.tipo_comprobante.value == 2) ){
      this.mascota_seleccionada = mascota;
      this.mascota_id_seleccionada = mascota.MAS_ID;
      this.nombre_mascota_seleccionada = this.mascota_seleccionada.MAS_NOMBRE;
      console.log(mascota.MAS_ID);
      console.log(this.mascota_seleccionada); 
    }else{
      this.mensaje_alerta = 'El cliente no puede emitir ese tipo de comprobante.'
      this.mostrar_alerta = true;
      this.tipo_alerta = 'danger';
      this.modalIn = false;
    }
  }
  /************************** REGISTRAR SERVICIO ****************************/
  //variable servicio
  servicioInsertar = new Servicio();
  registrarServicio(){
    this.mostrar_alerta = false;
    this.cargando = true;
    this.modalIn = true;
    if(this.storageService.hasKey('OPEN_CODE') && this.storageService.hasKey('OPEN_ID')){
      this.servicioService.registrarServicio(this.servicioInsertar).subscribe(
        (data)=>{
          console.log(data);
          this.cargando = false;
          this.mostrar_alerta = true;
          this.modalIn = false;
          this.tipo_alerta='success';
          this.mensaje_alerta = 'El servicio fue registrado exitosamente';
          this.limpiar();
          this.closeModal();
        },
        (error)=>{
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
              this.mensaje_alerta = 'Hubo un error al registrar el servicio, Por favor, actualice la página o inténtelo más tarde.';
            }else if(error.error.error === 'error_NoExistenciaDeTipoServicio'){
              this.mensaje_alerta = 'Hubo un error al identificar el servicio registrado, Por favor, actualice la página o inténtelo más tarde.';
            }else if(error.error.error === 'error_NoExistenciaDeMascota'){
              this.mensaje_alerta = 'Hubo un error al identificar a la mascota, Por favor, actualice la página o inténtelo más tarde.';
            }else if(error.error.error === 'error_conflictoHorarios'){
              this.mensaje_alerta = 'Hay conflicto de horarios al intentar registrar el servicio.';
            }else if(error.error.error === 'error_NoExistenciaDeUsuario'){
              this.mensaje_alerta = 'Hubo un error al identificar al trabajador. Por favor, actualice la página o inténtelo más tarde.';
            }else if(error.error.error === 'error_ComprobanteTipoCliente'){
              this.mensaje_alerta = 'Hubo un error al crear el servicio, el tipo de comprobante depende del tipo de cliente. Por favor, vuelva a intentarlo. ';
            }else if(error.error.error === 'error_NoCajaAbierta'){
              this.mensaje_alerta = 'Hubo un error al intentar ejecutar su solicitud. Tiene que abrir la caja para poder realizar un servicio.';
            }
          }
          else{
            this.mensaje_alerta = 'Hubo un error al registrar la información del servicio. Por favor, vuelva a intentarlo.';
          }
        }
      );
    }else{

      this.limpiar();
      this.closeModal();
      this.cargando = false;
      this.mostrar_alerta = true;
      this.modalIn = false;
      this.tipo_alerta = 'warning';
      this.mensaje_alerta = 'Tiene que abrir una caja para registrar un servicio.';
      
    }
  }

  /********************** ORDENAMIENTO DE TABLA MASCOTAS ***********************/
  @ViewChildren(SorteableDirective) headers: QueryList<SorteableDirective>;
  closeModal(): any {
    this.modal.dismissAll();
    this.busquedaMascota = '';
    this.busquedaCliente = '';
    this.mascotas = this.mascotas_iniciales.slice(); 
  }
  limpiar(){
    this.servicioForm.reset();
    this.adelanto.setValue(0);
    this.nombre_mascota_seleccionada = '';
    this.mascota_seleccionada = null;
  }
  onSort({column, direction}: any) {
    // resetting other headers
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    // sorting countries
    if (direction === '' || column === '') {
      this.mascotas = this.mascotas_iniciales.slice();
    } else {
      this.mascotas = this.mascotas_iniciales.slice().sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc' ? res : -res;
      });
    }
  }

  /****************** CREAR CITAS ******************/
  HORA_SERVICIO: string = '';

  //getters & setters
  

  seconds: boolean = true; // Es para habilitar la casilla de los segundos
  meridian: boolean = true; // Es para activar el boton AM o PM

  convertirFormt24AFormat12(){
    let AMPM = ' AM';
    let hora =  this.hora.value.hour;
    let horaF = this.hora.value.hour;
    let minuto = this.hora.value.minute; 
    let segundo = this.hora.value.second;

    
    if (hora >= 13) {
      hora = hora - 12;
      if(hora<= 9){
        hora = '0' + hora;
      }
      AMPM = ' PM';
    } else if (hora < 10  ) {
      hora = '0' + hora;
    } else if (hora == 12){
      AMPM = ' PM';
    }
    
    horaF = horaF < 10 ? "0" + horaF : horaF;
    minuto = minuto < 10 ? "0" + minuto : minuto;
    segundo = segundo < 10 ? "0" + segundo : segundo;
    
    this.HORA_SERVICIO = horaF + ":" + minuto + ":" + segundo;
  }


  /********************** LISTAR METODOS DE PAGO ***********************/
  metodos_pago: MetodoPago[]=[];
  
  listarMetodoPago(){
    this.cargando = true;
    this.modalIn = false;
    this.metodoPago.listarMetodosDePago().subscribe(
      (data)=>{
        this.metodos_pago = data['resultado'];
        this.cargando = false;
      },(error)=>{
        this.cargando = false;
        this.mostrar_alerta = true;
        this.tipo_alerta='danger';
        if (error.error.error !== undefined) {
          if (error.error.error === 'error_deBD') {
            this.mensaje_alerta = 'Hubo un error al intentar ejecutar su solicitud. Por favor, actualice la página.';
          }
        }
        else{
          this.mensaje_alerta = 'Hubo un error al mostrar la información de esta página. Por favor, actualice la página.';
        }
      }
    )
  }

  /*************************** FILTRAR TABLA**************************************/
  busquedaMascota: string = '';
  busquedaCliente: string = '';
  primeraBusqueda: boolean = true;

  filtrarMascotaPorNombre(){
    this.currentPage = 1;
    this.mascotas = this.mascotas_iniciales.slice(); 
    if(this.busquedaCliente.length == 0){
      this.mascotas = this.mascotas_iniciales.slice(); 
      this.mascotas = this.mascotas.filter(mascota =>mascota.MAS_NOMBRE.toLowerCase().indexOf(this.busquedaMascota.toLowerCase()) > -1);
    }else if(this.busquedaCliente.length > 0){
      if(this.busquedaMascota.length == 0){
        this.filtrarMascotaPorCliente(); 
      }else if(this.busquedaMascota.length > 0){
        this.mascotas = this.mascotas.filter(mascota =>mascota.MAS_NOMBRE.toLowerCase().indexOf(this.busquedaMascota.toLowerCase()) > -1);
        this.mascotas = this.mascotas.filter(mascota =>mascota.CLIENTE_NOMBRES.toLowerCase().indexOf(this.busquedaCliente.toLowerCase()) > -1);
      }
    }
  }
  filtrarMascotaPorCliente(){
    this.currentPage = 1;
    if(this.primeraBusqueda){
      this.primeraBusqueda = false;
      if(this.busquedaCliente.length == 0){
        this.filtrarMascotaPorNombre();
      }else{
        if(this.busquedaMascota.length == 0){
          this.mascotas = this.mascotas_iniciales.slice(); 
          this.mascotas = this.mascotas.filter(mascota =>mascota.CLIENTE_NOMBRES.toLowerCase().indexOf(this.busquedaCliente.toLowerCase()) > -1);
        }else{
          this.mascotas = this.mascotas.filter(mascota =>mascota.CLIENTE_NOMBRES.toLowerCase().indexOf(this.busquedaCliente.toLowerCase()) > -1);
        }
      }
    }else if(!this.primeraBusqueda){
      if(this.busquedaCliente.length==0){
        this.filtrarMascotaPorNombre();
      }else{
        this.mascotas = this.mascotas_iniciales.slice(); 
        this.mascotas = this.mascotas.filter(mascota =>mascota.MAS_NOMBRE.toLowerCase().indexOf(this.busquedaMascota.toLowerCase()) > -1);
        this.mascotas = this.mascotas.filter(mascota =>mascota.CLIENTE_NOMBRES.toLowerCase().indexOf(this.busquedaCliente.toLowerCase()) > -1);
      }
    }
    
  }

  /*********************************LISTAR DATOS NECESARIOS **********************/
  comprobantes: Comprobante[] = [];
  listarComprobantes(){
    this.cargando = true;
    this.modalIn = false;
    this.comprobanteService.listarComprobantes().subscribe(
      (data)=>{
        this.comprobantes = data['resultado'];
        this.cargando = false;
      },
      (error)=>{
        this.cargando = false;
        this.mostrar_alerta = true;
        this.tipo_alerta='danger';
        if (error.error.error !== undefined) {
          if (error.error.error === 'error_deBD') {
            this.mensaje_alerta = 'Hubo un error al intentar ejecutar su solicitud. Por favor, actualice la página.';
          }
        }
        else{
          this.mensaje_alerta = 'Hubo un error al mostrar la información de esta página. Por favor, actualice la página.';
        }
      }
    )
  }

  buscarMascota: boolean = false;
  obtenerTipoDocumento(){
    console.log(this.tipo_comprobante.value);
    if(this.tipo_comprobante.value==1){
      this.buscarMascota = true;
    }else if(this.tipo_comprobante.value == 2){
      this.buscarMascota = true;
    }
  }

  /**********************CONFIRMAR SERVICIO Y ACEPTAR *****************/
  @ViewChild('confirmarServicioModal') confirmarServicioModal: ElementRef;

  confirmarServicio(){
    this.convertirFormt24AFormat12();
    this.servicioInsertar.MASCOTA_ID = +this.mascota_seleccionada.MAS_ID;
    this.servicioInsertar.TIPO_SERVICIO_ID = +this.servicio.value; 
    if(this.descripcion.value == null || this.descripcion.value == undefined){
      this.servicioInsertar.SERVICIO_DESCRIPCION = '';
    }else if(this.descripcion.value.length>0){
      this.servicioInsertar.SERVICIO_DESCRIPCION = this.descripcion.value;
    }
    this.servicioInsertar.SERVICIO_PRECIO = this.precio.value; 
    this.servicioInsertar.HORA_SERVICIO = this.HORA_SERVICIO;
    this.servicioInsertar.SERVICIO_FECHA_HORA = this.fecha.value; 
    this.servicioInsertar.SERVICIO_TIPO = +this.modalidad.value;
    this.servicioInsertar.COMPROBANTE_ID = +this.tipo_comprobante.value;
    if(this.adelanto.value == 0 || this.adelanto.value == undefined || this.adelanto.value == null){
      this.servicioInsertar.SERVICIO_ADELANTO = this.precio.value;
    }else{
      this.servicioInsertar.SERVICIO_ADELANTO = this.adelanto.value;
    }
    this.servicioInsertar.MDP_ID = this.forma_pago.value;
    this.servicioInsertar.USU_ID = +this.storageService.getString('USE_ID');
    console.log(this.servicioInsertar);
    
    this.modal.open(this.confirmarServicioModal,{size:'lg'});
  }




  

  /***************** ADELANTAR SERVICIO **********/
  adelantoError: boolean = false;
  monto_adelantado: number = 0; 
  adelantarDinero(adelanto:any){
    console.log(adelanto);
    this.monto_adelantado = +adelanto;
    if(+adelanto>+this.precio.value){
      this.mensaje_alerta = 'El adelanto no puede ser mayor que el precio del servicio';
      this.tipo_alerta = 'danger';
      this.mostrar_alerta = true;
      this.modalIn = false;
      this.adelantoError = true;
    }else{
      this.mostrar_alerta = false;
      this.adelantoError = false;
    }
    
    
  }
}

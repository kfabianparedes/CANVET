export class Proveedor {
    
    PROV_ID?: number  ;
    PROV_RUC?: string ;
    PROV_EMPRESA_PROVEEDORA?: string ; 
    PROV_NUMERO_CONTACTO?: string ;
    
    constructor(PROV_ID?: number, PROV_RUC?: string,PROV_EMPRESA_PROVEEDORA?: string,PROV_NUMERO_CONTACTO?: string) {
        if(PROV_ID)this.PROV_ID = PROV_ID;
        if(PROV_RUC)this.PROV_RUC = PROV_RUC;
        if(PROV_EMPRESA_PROVEEDORA)this.PROV_EMPRESA_PROVEEDORA = PROV_EMPRESA_PROVEEDORA;
        if(PROV_NUMERO_CONTACTO)this.PROV_NUMERO_CONTACTO = PROV_NUMERO_CONTACTO;
    }
}
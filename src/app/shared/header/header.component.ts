import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit{
  
  @HostListener('window:resize', ['$event'])
  getScreen(event?: any){
    this.width = window.innerWidth;
  }
  status: boolean = false;
  toggled: string = '';
  width!: number;
  
  USE_USUARIO:string;
  USU_ID:string;
  hash:string;
  constructor(private router:Router ,private storageService:StorageService){

  }
  ngOnInit(): void {
    this.width = window.innerWidth;
    this.USE_USUARIO = this.storageService.getString('USE_NAMES');
    this.USU_ID = this.storageService.getString('USU_ID');
  }
  clickEvent(){
    this.status = !this.status; 
    if(this.toggled === 'toggled'){
      this.toggled ='';
    }else{
      this.toggled = 'toggled'; 
    }
  }

  cerrarSesion(){
    this.router.navigate(["/"]);
    this.storageService.clear();
    
  }

}

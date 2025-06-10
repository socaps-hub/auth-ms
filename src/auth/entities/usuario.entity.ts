import { Sucursal } from "./sucursal.entity"

export class Usuario {

  R12Id: string
  
  R12Ni: string
  
  R12Nom: string
  
  R12Password: string
  
  R12Suc_id: string
  
  R12Rol: string
  
  R12Activ: boolean
  
  R12Creado_en: Date

  R12Coop_id: string

  sucursal: Sucursal
}

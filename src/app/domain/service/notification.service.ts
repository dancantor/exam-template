import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { exhaustMap, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private toastController: ToastController) { }

  public displayMessage(header: string, message: string) {
    from(this.toastController.create({
      header: header,
      message: message,
      duration: 3000,
      position: 'top',
      cssClass: 'toast'
    })).pipe(exhaustMap((toast) => from(toast.present()))).subscribe();
  }
}

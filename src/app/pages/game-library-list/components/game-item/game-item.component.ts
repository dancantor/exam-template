import { Activity } from './../../../../domain/model/activity';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-game-item',
  templateUrl: './game-item.component.html',
  styleUrls: ['./game-item.component.scss'],
})
export class GameItemComponent implements OnInit {
  @Input() activity!: Activity;
  @Output() deleteGameEmitter = new EventEmitter<string>();
  @Output() updateGameEmitter = new EventEmitter<string>();
  constructor(private router: Router, private alertController: AlertController) { }

  ngOnInit() {
  }

  async onDeleteItem() {
    const deleteConfirmation = await this.alertController.create({
      header: 'Deleting Game',
      message: `Are you sure you want to delete ${this.activity.name}`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.deleteGameEmitter.emit(this.activity.activityId);
          },
        },
      ],
    });
    await deleteConfirmation.present();
  }
}

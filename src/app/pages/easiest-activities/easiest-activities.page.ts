import { NotificationService } from './../../domain/service/notification.service';
import { ActivityService } from 'src/app/domain/service/activity.service';
import { Component, OnInit } from '@angular/core';
import { Activity } from 'src/app/domain/model/activity';
import { first, Observable } from 'rxjs';
import { Location } from '@angular/common';

@Component({
  selector: 'app-easiest-activities',
  templateUrl: './easiest-activities.page.html',
  styleUrls: ['./easiest-activities.page.scss'],
})
export class EasiestActivitiesPage implements OnInit {
  easiestActivities$: Observable<Activity[]>;
  constructor(private activityService: ActivityService, private location: Location, private notificationService: NotificationService) { }

  ngOnInit() {
    this.easiestActivities$ = this.activityService.getEasiestActivities();
  }

  navigateBack(): void {
    this.location.back();
  }

  updateIntensity(intensityAndActivityId: {activityId: string; newIntensity: string}) {
    this.activityService.updateIntensityAPI(intensityAndActivityId).subscribe(() =>{
      this.notificationService.displayMessage('Success', 'The intensity was updated!')
      this.easiestActivities$ = this.activityService.getEasiestActivities();
    });
  }
}

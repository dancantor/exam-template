import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Activity } from 'src/app/domain/model/activity';
import { ActivityService } from 'src/app/domain/service/activity.service';
import { LoadingService } from './../../domain/service/loading.service';
import { NotificationService } from './../../domain/service/notification.service';

@Component({
  selector: 'app-easiest-activities',
  templateUrl: './easiest-activities.page.html',
  styleUrls: ['./easiest-activities.page.scss'],
})
export class EasiestActivitiesPage implements OnInit {
  easiestActivities$: Observable<Activity[]>;
  loading$ = this.loadingService.loading$;
  constructor(
    private activityService: ActivityService,
    private location: Location,
    private notificationService: NotificationService,
    private loadingService: LoadingService) { }

  ngOnInit() {
    this.easiestActivities$ = this.activityService.getEasiestActivities();
  }

  navigateBack(): void {
    this.location.back();
  }

  updateIntensity(intensityAndActivityId: {activityId: string; newIntensity: string}) {
    this.activityService.updateIntensityAPI(intensityAndActivityId).subscribe(() =>{
      this.notificationService.displayToastMessage('Success', 'The intensity was updated!')
      this.easiestActivities$ = this.activityService.getEasiestActivities();
    });
  }
}

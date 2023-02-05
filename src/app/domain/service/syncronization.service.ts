import { mapDtoToModel } from './../../api/dtos/activity-dto';
import { ActivityDto } from 'src/app/api/dtos/activity-dto';
import { Category, ActivityDocument, mapActivityToDocument } from './../model/activity';
import { combineLatest, tap } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivityApiService } from './../../api/services/activity-api.service';
import { ActivityRepository } from './../repository/activity.repo';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root'
})
export class SyncronizationService {

  constructor(
    private activityRepo: ActivityRepository,
    private activityApiService: ActivityApiService,
    private loadingService: LoadingService
  ) { }

  public updateLocalFromServerCategories() {
    combineLatest([this.activityRepo.getAllCategories(), this.activityApiService.getCategories()]).pipe(
      tap(([locatCategories, serverCategories]) => {
        serverCategories.forEach((categoryServer: Category) => {
          if (!locatCategories.some((categoryLocal: Category) => categoryLocal.name === categoryServer.name)) {
            this.activityRepo.insertCategory(categoryServer).subscribe();
          }
        })
      })
    ).subscribe(() => {
    });
    // const allActivitiesByCategory = this.activityApiService.getCategories().pipe(
    //   exhaustMap(categories => {
    //     const activitiesArray: Observable<ActivityDto[]>[] = []
    //     categories.forEach(category => {
    //       activitiesArray.push(this.activityApiService.getActivitiesByCategory(category.name));
    //     })
    //     return combineLatest(activitiesArray).pipe(map(result => flat(result)));
    //   })
    // )
    // combineLatest([this.activityRepo.getAll(), allActivitiesByCategory]).pipe(
    //   tap(([localActivities, serverActivities]) => {
    //     serverActivities.forEach((activity: ActivityDto) => {
    //       if (!localActivities.some((activityDb: ActivityDocument) => +activityDb.activityId === activity.id)) {
    //         this.activityRepo.insert(mapActivityToDocument(mapDtoToModel(activity))).pipe(first()).subscribe();
    //       }
    //     })
    //   }),
    //   first()
    // ).subscribe();
  }

  public updateLocalFromServerActivitiesbyCategories(category: string) {
    combineLatest([this.activityRepo.getAllByCategory(category), this.activityApiService.getActivitiesByCategory(category)]).pipe(
      tap(([locatActivities, serverActivities]) => {
        serverActivities.forEach((activityServer: ActivityDto) => {
          if (!locatActivities.some((activityLocal: ActivityDocument) => activityServer.id === +activityLocal.activityId)) {
            this.activityRepo.insert(mapActivityToDocument(mapDtoToModel(activityServer))).subscribe();
          }
        })
      })
    ).subscribe(() => {
    });
  }
}

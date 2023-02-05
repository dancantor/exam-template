import { LoadingService } from './loading.service';
import { SyncronizationService } from './syncronization.service';
import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';
import { unique } from 'radash';
import { catchError, EMPTY, exhaustMap, finalize, first, from, map, Observable, of, shareReplay, tap, throwError } from 'rxjs';
import { Activity, Category } from '../model/activity';
import { ActivityRepository } from '../repository/activity.repo';
import { ActivityDto, mapDtoToModel, mapModelToDto } from './../../api/dtos/activity-dto';
import { ActivityApiService } from './../../api/services/activity-api.service';
import { compareActivitiesByIntensity, mapActivityToDocument, mapDocumentToActivity } from './../model/activity';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  constructor(
    private repo: ActivityRepository,
    private notificationService: NotificationService,
    private activityApiService: ActivityApiService,
    private syncronizationService: SyncronizationService,
    private loadingService: LoadingService
  ) { }

  public getAll(): Observable<Activity[]> {
    console.log('getAll() entered');
    return this.repo.getAll().pipe(
      map(activityDocuments => activityDocuments.map(activityDocument => mapDocumentToActivity(activityDocument))),
      catchError(() => {
        this.notificationService.displayToastMessage('Error', 'Error on fetching activities');
        console.log('getAll() error');
        return of([])
      }),
      finalize( () => {
        console.log('getAll() exited');
      }),
    );
  }

  public getById(id: string): Observable<Activity> {
    console.log(`getById() entered id=${id}`);
    return this.repo.getById(id).pipe(
      map(activityDocument => mapDocumentToActivity(activityDocument)),
      catchError(() => {
        this.notificationService.displayToastMessage('Error', 'Error on fetching activities');
        console.log('getById() error');
        return EMPTY;
      }),
      finalize( () => {
        console.log('getById() exited');
      }),
    );
  }

  public getAllByCategory(category: string): Observable<Activity[]> {
    console.log(`getAllByCategory() entered, category: ${category}`);
    return from(Network.getStatus()).pipe(
      first(),
      exhaustMap(networkStatus => {
        if (networkStatus.connected) {
          this.syncronizationService.updateLocalFromServerActivitiesbyCategories(category);
        }
        return this.getAllByCategoryDb(category);
      })
    );

  }

  private getAllByCategoryDb(category: string): Observable<Activity[]> {
    console.log(`getAllByCategoryDb() entered, category: ${category}`);
    return this.repo.getAllByCategory(category).pipe(
      map(activityDocuments => activityDocuments.map(activityDocument => mapDocumentToActivity(activityDocument))),
      catchError(() => {
        this.notificationService.displayToastMessage('Error', 'Error on fetching activities by category');
        console.log('getAllByCategoryDb() error');
        return of([]);
      }),
      finalize(() => {
        console.log('getAllByCategoryDb() exited');
      })
    );
  }

  public getAllCategories(): Observable<Category[]> {
    console.log(`getAllCategories() entered`);
    return from(Network.getStatus()).pipe(
      exhaustMap(networkStaus => {
        if (networkStaus.connected) {
          this.syncronizationService.updateLocalFromServerCategories();
        }
        return this.getAllCategoriesDb();
      })
    )
  }

  private getAllCategoriesDb(): Observable<Category[]> {
    console.log(`getAllCategoriesDb() entered`);
    return this.repo.getAllCategories().pipe(
      catchError(() => {
        this.notificationService.displayToastMessage('Error', 'Error on fetching categories');
        console.log('getAllCategoriesDb() error');
        return of([]);
      }),
      finalize(() => {
        console.log('getAllCategoriesDb() exited');
      })
    );
  }

  public insert(activity: Activity): void {
    from(Network.getStatus()).pipe(
      tap(networkStaus => {
        if (networkStaus.connected) {
          this.activityApiService.insert(mapModelToDto(activity)).pipe(first()).subscribe((activity: ActivityDto) => {
            this.insertDb(mapDtoToModel(activity));
          });
        }
        else {
          this.notificationService.displayToastMessage('Error', 'Inserting a new activity is not available offline');
        }
      })
    ).subscribe();
  }

  private insertDb(activity: Activity) {
    console.log(`insert() entered, activity: ${activity}`);
    this.repo.insert(mapActivityToDocument(activity)).pipe(
      catchError((er) => { console.error(er); return throwError(() => activity); })
    )
      .subscribe({
        next: (activity) => { this.notificationService.displayToastMessage('Success', `The activity ${activity.name} was added successfully`); },
        error: (err) => { this.notificationService.displayToastMessage('Error', `Error on adding ${err.name}`); },
        complete: () => { console.log(`insert() exited`); }
      });
    this.repo.insertCategory({name: activity.category}).pipe(first()).subscribe()
  }

  public remove(activityId: string): void {
    from(Network.getStatus()).pipe(
      tap(networkStaus => {
        if (networkStaus.connected) {
          this.activityApiService.delete(+activityId).pipe(first()).subscribe((activity: ActivityDto) => {
            this.removeDb(activity.id.toString());
          });
        }
        else {
          this.notificationService.displayToastMessage('Error', 'Deleting a new activity is not available offline');
        }
      })
    ).subscribe();
  }

  private removeDb(activityId: string) {
    console.log(`remove() entered, activityId: ${activityId}`);
    this.repo.remove(activityId).pipe(
      catchError(() => throwError(() => activityId))
    )
      .subscribe({
        next: () => { this.notificationService.displayToastMessage('Success', `The activity was removed successfully`); },
        error: () => this.notificationService.displayToastMessage('Error', `Error on removing activity`),
        complete: () => { console.log(`remove() exited`); }
      });
  }

  public update(activity: Activity): void {
    console.log(`update() entered, activity: ${activity}`);
    this.repo.update(mapActivityToDocument(activity)).pipe(
      catchError(() => throwError(() => activity)),
    )
    .subscribe({
      next: () => {this.notificationService.displayToastMessage('Success', `The activity ${activity.name} was updated successfully`)},
      error: () => this.notificationService.displayToastMessage('Error', `Error on updating activity ${activity.name}`),
      complete: () => {console.log(`update() exited`)}

    })
  }

  public getEasiestActivities(): Observable<Activity[]> {
    console.log('getEasiest() api call started');
    return this.activityApiService.getEasiest().pipe(
      map(activities => activities.map(activity => mapDtoToModel(activity))),
      map(activities => activities.sort(compareActivitiesByIntensity)),
      map(activities => activities.slice(0, 10)),
      catchError((er) => {
        this.notificationService.displayToastMessage('Error', 'Error on fetching easiest activities');
        console.log('getEasiest() api call error');
        return of(er);
      }),
      finalize(() => console.log('getEasiest() api call finished'))
    );
  }

  public updateIntensityAPI(intensityAndId: {activityId: string; newIntensity: string}): Observable<void> {
    console.log(`updateIntensityAPI() api call started, intensityAndId=${intensityAndId}`);
    return this.activityApiService.updateIntensity({id: +intensityAndId.activityId, intensity: intensityAndId.newIntensity}).pipe(
      catchError((er) => {
        console.log('updateIntensityAPI() api call error');
        return of(er);
      }),
      finalize(() => console.log('updateIntensityAPI() api call finished'))
    )

  }

  public subscribeToWebsocket(): void {
    this.activityApiService.subscribeToWebSocket().subscribe({
      next: (activity: ActivityDto) => {
        this.repo.getById(activity.id.toString()).pipe(
          first(),
        ).subscribe((result) => {
          if (result === null) {
            this.notificationService.displayActivityModal(mapDtoToModel(activity));
          }
        });
      },
      error: () => {},
      complete: () => {}
    })
  }

}

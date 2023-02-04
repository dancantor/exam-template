import { Category } from './../model/activity';
import { RxDocument } from 'rxdb';
import { DatabaseService } from '../db/rxdb.service';
/* eslint-disable max-len */
import { Injectable } from '@angular/core';
import { catchError, EMPTY, first, from, mergeMap, Observable, of } from 'rxjs';
import { Activity, ActivityDocument } from '../model/activity';

@Injectable({
  providedIn: 'root'
}
)
export class ActivityRepository {

  constructor(private databaseService: DatabaseService) {}


  getAllByCategory(category: string) {
    return from(this.databaseService.get()).pipe(
      mergeMap(dbInstance => dbInstance['activities'].find().where('category').eq(category).$)
      )
    }

    public getAll(): Observable<ActivityDocument[]> {
      return from(this.databaseService.get()).pipe(
        mergeMap(dbInstance => dbInstance['activities'].find().$)
        )
    }

    public getAllCategories(): Observable<Category[]> {
      return from(this.databaseService.get()).pipe(
        mergeMap(dbInstance => dbInstance['categories'].find().$)
        )
    }

    public insertCategory(category: Category): Observable<Category> {
      return from(this.databaseService.get()).pipe(
        mergeMap(dbInstance => dbInstance['categories'].insert(category)),
        first()
      )
    }

    public getById(id: string): Observable<ActivityDocument> {
        return from(this.databaseService.get()).pipe(
          mergeMap(dbInstance => dbInstance['activities'].findOne().where('activityId').eq(id).$)
        )
      }

  public insert(activity: ActivityDocument): Observable<ActivityDocument> {
    return from(this.databaseService.get()).pipe(
      mergeMap(dbInstance => dbInstance['activities'].insert(activity)),
      first()
    )
  }

  public remove(activityId: string): Observable<boolean> {
    return from(this.databaseService.get()).pipe(
      mergeMap(dbInstance => from(dbInstance['activities'].findByIds([activityId]))),
      mergeMap((activities: Map<string, RxDocument<ActivityDocument>>) => {
        const activityToRemove: RxDocument<ActivityDocument> | undefined = activities.get(activityId);
        if (activityToRemove !== undefined) {
          return activityToRemove.remove()
        }
        return of(false);
      }),
      first()
    )
  }

  public update(activity: ActivityDocument): Observable<ActivityDocument> {
    return from(this.databaseService.get()).pipe(
      mergeMap(dbInstance => from(dbInstance['activities'].findByIds([activity.activityId]))),
      mergeMap((activities: Map<string, RxDocument<ActivityDocument>>) => {
        const activityToUpdate: RxDocument<ActivityDocument> | undefined = activities.get(activity.activityId);
        if (activityToUpdate !== undefined) {
          return activityToUpdate.update({
            $set: {
              name: activity.name,
              description: activity.description,
              category: activity.category,
              date: activity
            }
          })
        }
        return of(false);
      }),
      first()
    )
  }
}

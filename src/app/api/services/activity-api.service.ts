import { Category } from './../../domain/model/activity';
import { IntensityBodyDto } from './../dtos/activity-dto';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, finalize, map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ActivityDto } from '../dtos/activity-dto';

@Injectable({
  providedIn: 'root'
})
export class ActivityApiService {
  private apiEndpoint = environment.apiUrl;
  constructor(private httpClient: HttpClient) { }

  public getCategories(): Observable<Category[]> {
    return this.httpClient.get<string[]>(this.apiEndpoint + 'categories').pipe(
      map(categories => categories.map(category => ({name: category} as Category)))
    );
  }

  public getActivitiesByCategory(category: string): Observable<ActivityDto[]> {
    return this.httpClient.get<ActivityDto[]>(`${this.apiEndpoint}activities/${category}`)
  }

  public getEasiest(): Observable<ActivityDto[]> {
    return this.httpClient.get<ActivityDto[]>(this.apiEndpoint + 'easiest');
  }

  public updateIntensity(body: IntensityBodyDto): Observable<void> {
    return this.httpClient.post<void>(this.apiEndpoint + 'intensity', body);
  }
}

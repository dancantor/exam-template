import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import { ActivityDto } from '../dtos/activity-dto';
import { Category } from './../../domain/model/activity';
import { IntensityBodyDto } from './../dtos/activity-dto';

@Injectable({
  providedIn: 'root'
})
export class ActivityApiService {
  private apiEndpoint = environment.apiUrl;
  webSocketSubject: WebSocketSubject<ActivityDto> = webSocket(environment.ws);
  constructor(private httpClient: HttpClient) { }

  public getCategories(): Observable<Category[]> {
    return this.httpClient.get<string[]>(this.apiEndpoint + 'categories').pipe(
      map(categories => categories.map(category => ({name: category} as Category)))
    );
  }

  public getActivitiesByCategory(category: string): Observable<ActivityDto[]> {
    return this.httpClient.get<ActivityDto[]>(`${this.apiEndpoint}activities/${category}`)
  }

  public insert(activityDto: ActivityDto): Observable<ActivityDto> {
    return this.httpClient.post<ActivityDto>(`${this.apiEndpoint}activity`, activityDto);
  }

  public delete(activityId: number): Observable<ActivityDto> {
    return this.httpClient.delete<ActivityDto>(`${this.apiEndpoint}activity/${activityId}`);
  }

  public getEasiest(): Observable<ActivityDto[]> {
    return this.httpClient.get<ActivityDto[]>(this.apiEndpoint + 'easiest');
  }

  public updateIntensity(body: IntensityBodyDto): Observable<void> {
    return this.httpClient.post<void>(this.apiEndpoint + 'intensity', body);
  }

  public subscribeToWebSocket(): WebSocketSubject<ActivityDto>  {
    return this.webSocketSubject;
  }
}

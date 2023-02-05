import { LoadingService } from './../../domain/service/loading.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { first, Observable } from 'rxjs';
import { Activity, Category } from 'src/app/domain/model/activity';
import { ActivityService } from 'src/app/domain/service/activity.service';

@Component({
  selector: 'app-game-library-list',
  templateUrl: './game-library-list.page.html',
  styleUrls: ['./game-library-list.page.scss'],
})
export class GameLibraryListPage implements OnInit {
  loading$ = this.loadingService.loading$;
  categoriesList$: Observable<Category[]> = this.activityService.getAllCategories();
  shouldDisplayActivities: Map<string, boolean> = new Map<string, boolean>();
  currentlyExpanded: string = '';
  activitiesByCategory$: Observable<Activity[]>;
  constructor(private router: Router, private activityService: ActivityService, private loadingService: LoadingService) { }

  ngOnInit() {
    this.categoriesList$.pipe(first()).subscribe(categories =>
      categories.forEach(category => this.shouldDisplayActivities.set(category.name, false)));
  }

  public expandCategory(category: string) {
    if (this.currentlyExpanded != undefined) {
      this.shouldDisplayActivities.set(this.currentlyExpanded, false);
    }
    if (category === this.currentlyExpanded) {
      this.currentlyExpanded = '';
      return;
    }
    this.currentlyExpanded = category;
    this.activitiesByCategory$ = this.activityService.getAllByCategory(this.currentlyExpanded)
    this.shouldDisplayActivities.set(category, true);
  }

  public navigateToAddActivity() {
    this.router.navigate(['add-activity']);
  }

  public navigateToEasiestActivities() {
    this.router.navigate(['easiest-activities']);
  }

  public onDeleteActivity(activityId: string) {
    this.activityService.remove(activityId);
  }
}

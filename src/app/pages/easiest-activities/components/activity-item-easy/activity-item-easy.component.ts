import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Activity } from 'src/app/domain/model/activity';

@Component({
  selector: 'app-activity-item-easy',
  templateUrl: './activity-item-easy.component.html',
  styleUrls: ['./activity-item-easy.component.scss'],
})
export class ActivityItemEasyComponent implements OnInit {
  @Input() activity: Activity;
  @Output() updateActivityEmitter = new EventEmitter<{activityId: string; newIntensity: string}>();
  intensityValue = '';
  shouldDisplayEdit = false;
  constructor() { }

  ngOnInit() {}

  onItemClick() {
    this.shouldDisplayEdit = !this.shouldDisplayEdit;
  }

  isIntensityValid(): boolean {
    return this.intensityValue === 'easy' || this.intensityValue === 'medium' || this.intensityValue === 'hard';
  }

  stopPropagation(event: any) {
    event.stopPropagation();
  }

  updateIntensity() {
    this.updateActivityEmitter.emit({activityId: this.activity.activityId, newIntensity: this.intensityValue});
  }
}

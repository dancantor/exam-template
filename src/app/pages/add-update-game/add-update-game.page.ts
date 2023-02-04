import { ActivityService } from 'src/app/domain/service/activity.service';
/* eslint-disable @typescript-eslint/member-ordering */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { format } from 'date-fns';
import { formatDate, LocationStrategy } from '@angular/common';
import { Activity } from 'src/app/domain/model/activity';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';

class PickDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
      return format(date, 'dd/MM/yyyy');
  }
}

@Component({
  selector: 'app-add-update-game',
  templateUrl: './add-update-game.page.html',
  styleUrls: ['./add-update-game.page.scss'],
  providers: [
    {provide: DateAdapter, useClass: PickDateAdapter}
  ]
})
export class AddUpdateGamePage implements OnInit {
  activityForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private activityService: ActivityService,
    private location: LocationStrategy
  ) {}

  ngOnInit() {
    this.createFormGroup();
  }

  private createFormGroup() {
    this.activityForm = this.formBuilder.group({
      name: ['', { validators: [Validators.required] }],
      description: ['', { validators: [Validators.required] }],
      category: ['', { validators: [Validators.required] }],
      date: ['', { validators: [Validators.required] }],
      time: [0, { validators: [Validators.required, Validators.pattern('^[1-9][0-9]*$')] }],
      intensity: ['', { validators: [Validators.required, Validators.pattern('^(easy|medium|hard)$')] }],
    });
  }
  dateRegex(): string | RegExp {
    return '^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$';
  }
  navigateBack(): void {
    this.location.back();
  }

  public getErrorMessage(fieldName: string): string {
    const field = this.activityForm.get(fieldName);
    if (field === null) {
      return '';
    }
    if (field.hasError('required')) {
      return 'This field is required';
    }
    if (field.hasError('pattern')) {
      return 'The input does not respect the required format';
    }
    return '';
  }

  public insertActivity(): void {
    this.activityService.insert(this.convertFormToActivity(this.activityForm.value));
    this.location.back();
  }

  private convertFormToActivity(formValue: any): Activity {
    return {
      name: formValue.name,
      description: formValue.description,
      category: formValue.category,
      date: formValue.date,
      time: formValue.time,
      intensity: formValue.intensity
    } as Activity;
  }
}

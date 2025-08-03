

import { Component, HostListener } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { DragDropModule } from '@angular/cdk/drag-drop';

interface FormField {
  type:
    | 'text'
    | 'checkbox'
    | 'select'
    | 'textarea'
    | 'date'
    | 'number'
    | 'radio'
    | 'input'
    | 'spacer';
  label: string;
  placeholder?: string;
  fontSize?: string;
  options?: string[];
  appearance?: 'fill' | 'outline' | 'standard' | 'legacy';
  colSpan: number;
  [key: string]: any;
}

interface Row {
  fields: FormField[];
}

interface Section {
  title: string;
  rows: Row[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    MatFormFieldModule,
    MatRadioModule,
    DragDropModule,
  ],
  template: `
    <div class="container-fluid main-container">
      <div
        class="panel left"
        cdkDropList
        id="availableFields"
        [cdkDropListData]="availableFields"
        [cdkDropListConnectedTo]="rowDropListIds"
        [cdkDropListEnterPredicate]="preventDropToAvailable"
      >
        <h5 class="mb-4">Available Fields</h5>
        <div *ngFor="let field of availableFields" cdkDrag class="field-item">
          {{ field.label }}
        </div>
      </div>

      <div class="panel center" cdkDropList id="formBuilder" [cdkDropListData]="formSections" (cdkDropListDropped)="dropSection($event)">
        <h3>Form Builder</h3>
        <div *ngFor="let section of formSections; let sectionIndex = index" cdkDragHandle class="section" cdkDrag (click)="selectSection(sectionIndex)" [class.selected]="selectedSection == sectionIndex || (selectedField?.sectionIndex === sectionIndex)" [cdkDropListConnectedTo]="allDropListIds" [cdkDropListData]="section.rows" (cdkDropListDropped)="dropField($event, sectionIndex, 0)">
        <div *ngIf="selectedSection === sectionIndex" class="delete-button" (click)="deleteSection($event)">X</div>  
        <div class="drag-handle" [style.fontSize]="globalFontSize"> {{ section.title }}</div>
          <div *ngFor="let row of section.rows; let rowIndex = index" class="row" cdkDropList [id]="'row-' + sectionIndex + '-' + rowIndex" [cdkDropListData]="row.fields" [cdkDropListConnectedTo]="allDropListIds" (cdkDropListDropped)="dropField($event, sectionIndex, rowIndex)">
            <div *ngIf="row.fields.length === 0" class="empty-row">Drag fields here</div>
            <div *ngFor="let field of row.fields; let fieldIndex = index" cdkDrag (click)="selectField(sectionIndex, rowIndex, fieldIndex);$event.preventDefault()" class="col-{{field.colSpan}} form-preview " [class.selected]="selectedField?.sectionIndex === sectionIndex && selectedField?.rowIndex === rowIndex && selectedField?.fieldIndex === fieldIndex">
              <mat-form-field *ngIf="field.type === 'input'" [appearance]="field.appearance" [style.fontSize]="field.fontSize">
                <mat-label>{{ field.label }}</mat-label>
                <input matInput [placeholder]="field.placeholder" />
              </mat-form-field>
              <mat-form-field *ngIf="field.type === 'textarea'" [appearance]="field.appearance" [style.fontSize]="field.fontSize">
                <mat-label>{{ field.label }}</mat-label>
                <textarea matInput [placeholder]="field.placeholder"></textarea>
              </mat-form-field>
              <mat-form-field *ngIf="field.type === 'number'" [appearance]="field.appearance" [style.fontSize]="field.fontSize">
                <mat-label>{{ field.label }}</mat-label>
                <input matInput type="number" [placeholder]="field.placeholder" />
              </mat-form-field>
              <mat-form-field *ngIf="field.type === 'date'" [appearance]="field.appearance" [style.fontSize]="field.fontSize">
                <mat-label>{{ field.label }}</mat-label>
                <input matInput type="date" />
              </mat-form-field>
              <mat-checkbox *ngIf="field.type === 'checkbox'" [style.fontSize]="field.fontSize">
                {{ field.label }}
              </mat-checkbox>
              <mat-radio-group *ngIf="field.type === 'radio'" [style.fontSize]="field.fontSize">
                <label>{{ field.label }}</label><br />
                <mat-radio-button *ngFor="let opt of field.options">{{ opt }}</mat-radio-button>
              </mat-radio-group>
              <mat-form-field *ngIf="field.type === 'select'" [appearance]="field.appearance" [style.fontSize]="field.fontSize">
                <mat-label>{{ field.label }}</mat-label>
                <mat-select>
                  <mat-option *ngFor="let opt of field.options" [value]="opt">{{ opt }}</mat-option>
                </mat-select>
              </mat-form-field>
              <p *ngIf="field.type === 'text'" [style.fontSize]="field.fontSize">{{ field.label }}</p>
              <div *ngIf="field.type === 'spacer'" class="spacer"></div>
              <div *ngIf="selectedField?.sectionIndex === sectionIndex && selectedField?.rowIndex === rowIndex && selectedField?.fieldIndex === fieldIndex" class="delete-button" (click)="deleteField($event)">X</div>
            </div>
          </div>
          <!-- <button (click)="addRow(sectionIndex)">Add Row to Section</button> -->
        </div>
        <!-- <button (click)="addSection()">Add Section</button> -->
      </div>

      <div class="panel right">
        
        <div *ngIf="selectedSection == null">
          <h5>Global Settings</h5>
          <label>Global Font Size</label>
          <input [(ngModel)]="globalFontSize" (change)="applyGlobalFontSize()" />
        </div>
        <div *ngIf="selectedSection!=null">
          <h5>Section Settings</h5>
          <label>Section Title</label>
          <input [(ngModel)]="formSections[selectedSection].title" (change)="applyGlobalFontSize()" />
        </div>

        <div *ngIf="selectedField">
        <h5>Field Settings</h5>
          <div *ngIf="formSections[selectedField.sectionIndex].rows[selectedField.rowIndex].fields[selectedField.fieldIndex].type !== 'spacer'">

          <h6>Content</h6>
          <label>Label</label>
          <input [(ngModel)]="formSections[selectedField.sectionIndex].rows[selectedField.rowIndex].fields[selectedField.fieldIndex].label" />
          <label *ngIf="formSections[selectedField.sectionIndex].rows[selectedField.rowIndex].fields[selectedField.fieldIndex].placeholder">Placeholder</label>
          <input *ngIf="formSections[selectedField.sectionIndex].rows[selectedField.rowIndex].fields[selectedField.fieldIndex].placeholder" [(ngModel)]="formSections[selectedField.sectionIndex].rows[selectedField.rowIndex].fields[selectedField.fieldIndex].placeholder" />
          <h6>Styling</h6>
            <label>Font Size</label>
            <input [(ngModel)]="formSections[selectedField.sectionIndex].rows[selectedField.rowIndex].fields[selectedField.fieldIndex].fontSize" />
            <label *ngIf="formSections[selectedField.sectionIndex].rows[selectedField.rowIndex].fields[selectedField.fieldIndex].appearance">Appearance</label>
            <select *ngIf="formSections[selectedField.sectionIndex].rows[selectedField.rowIndex].fields[selectedField.fieldIndex].appearance" [(ngModel)]="formSections[selectedField.sectionIndex].rows[selectedField.rowIndex].fields[selectedField.fieldIndex].appearance">
              <option value="fill">Fill</option>
              <option value="outline">Outline</option>
              <option value="standard">Standard</option>
              <option value="legacy">Legacy</option>
            </select>
            <div *ngIf="formSections[selectedField.sectionIndex].rows[selectedField.rowIndex].fields[selectedField.fieldIndex].options">
              <label>Options</label>
              <div *ngFor="let opt of formSections[selectedField.sectionIndex].rows[selectedField.rowIndex].fields[selectedField.fieldIndex].options; let j = index">
                <input [(ngModel)]="formSections[selectedField.sectionIndex].rows[selectedField.rowIndex].fields[selectedField.fieldIndex].options[j]" />
              </div>
              <button (click)="addOption()">Add Option</button>
            </div>
          </div>
          <label>Col Span</label>
          <input type="number" [(ngModel)]="formSections[selectedField.sectionIndex].rows[selectedField.rowIndex].fields[selectedField.fieldIndex].colSpan" min="1" max="12" (change)="validateColSpan(selectedField.sectionIndex, selectedField.rowIndex)" />
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .main-container {
        display: flex;
        flex-direction: row;
        gap: 20px;
        padding: 20px;
        // background: url('/assets/bg.jpg');
        min-height: 100vh;
      }
      .panel {
        flex: 1;
        border: 1px solid #d0d7de;
        border-radius: 12px;
        padding: 20px;
        min-height: 500px;
        background: #ffffff;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        overflow-y: auto;
        max-height: 100%;
      }
      .left, .right {
        max-width: 250px;
      }
      .panel h3 {
        margin-top: 0;
        font-weight: 600;
        color: #2c3e50;
      }
      .field-item {
        padding: 10px;
        margin-bottom: 10px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        cursor: grab;
        transition: all 0.3s ease;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);

        &:hover {
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 0 12px rgba(0, 255, 255, 0.3),
                      0 0 24px rgba(255, 0, 255, 0.2),
                      0 0 36px rgba(0, 255, 127, 0.25);
          animation: pulseGlow 1.5s ease-in-out infinite;
        }
      }
      @keyframes pulseGlow {
          0% {
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.2),
                        0 0 20px rgba(255, 0, 255, 0.15),
                        0 0 30px rgba(0, 255, 127, 0.1);
          }
          50% {
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.5),
                        0 0 30px rgba(255, 0, 255, 0.4),
                        0 0 40px rgba(0, 255, 127, 0.35);
          }
          100% {
            box-shadow: 0 0 10px rgba(0, 255, 255, 0.2),
                        0 0 20px rgba(255, 0, 255, 0.15),
                        0 0 30px rgba(0, 255, 127, 0.1);
          }
        }
      .section {
        margin-bottom: 20px;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        position: relative;

        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        cursor: grab;
        transition: all 0.3s ease;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
      }
      .drag-handle {
        cursor: move;
        border-radius: 4px;
        margin-bottom: 10px;
      }
      .form-preview {
        position: relative;
        display: flex;
        @media (max-width: 768px) {
            min-width: 100%;
            flex: 1;
        }
        
      }
      .empty-row {
        padding: 20px;
        text-align: center;
        color: #666;
        border: 1px dashed #ccc;
        width: calc(100% - 20px);
        margin: 0 auto;
        border-radius: 4px;
      }
      .spacer {
        min-height: 20px;
      }
      .delete-button {
        position: absolute;
        top: 5px;
        right: 5px;
        cursor: pointer;
        color: red;
        font-weight: bold;
        width: fit-content !important;
      }
      .right input,
      .right select {
        width: 100%;
        margin-bottom: 10px;
        padding: 6px;
        border-radius: 4px;
        border: 1px solid #ccc;
      }
      .right button {
        margin-top: 10px;
        background-color: #007bff;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
      }
      .right button:hover {
        background-color: #0056b3;
      }
      .form-preview > * {
        display: flex;
        align-items: center;
        width: 100%;
      }
      .selected {
        // &.form-preview {
          // };
          
          &.section {
            border: 1px solid rgba(255, 255, 255, 0.4);
            box-shadow: 0 0 12px rgba(0, 255, 255, 0.3),
            0 0 24px rgba(255, 0, 255, 0.2),
            0 0 36px rgba(0, 255, 127, 0.25);
          }
          border: 2px dotted #007bff;
          border-radius: 12px;
          margin-bottom: 10px
                      
      }
    `,
  ],
})
export class AppComponent {
  availableFields: FormField[] = [
    { type: 'text', label: 'Static Text', fontSize: '16px', appearance: 'outline', colSpan: 1 },
    { type: 'input', label: 'Input Field', placeholder: 'Enter text', fontSize: '16px', appearance: 'outline', colSpan: 1 },
    { type: 'textarea', label: 'Text Area', placeholder: 'Enter more...', fontSize: '16px', appearance: 'outline', colSpan: 1 },
    { type: 'number', label: 'Number Field', placeholder: '0', fontSize: '16px', appearance: 'outline', colSpan: 1 },
    { type: 'date', label: 'Date Picker', fontSize: '16px', appearance: 'outline', colSpan: 1 },
    { type: 'checkbox', label: 'Check Option', fontSize: '16px', colSpan: 1 },
    { type: 'select', label: 'Select Option', options: ['Option 1', 'Option 2'], fontSize: '16px', appearance: 'outline', colSpan: 1 },
    { type: 'radio', label: 'Choose One', options: ['Yes', 'No'], fontSize: '16px', colSpan: 1 },
    { type: 'spacer', label: 'Spacer', colSpan: 1 },
  ];

  formSections: Section[] = [
    // { title: 'Hello', rows: [{ fields: [{ type: 'text', label: 'Revising Drag and Drop', colSpan: 12 }] }] },
  ];

  selectedField: { sectionIndex: number; rowIndex: number; fieldIndex: number } | null = null;
  globalFontSize: string = '16px';
  selectedSection: number | null = null;

  // get click outside section
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.section') && !target.closest('.panel.right')) {
      this.selectedSection = null;
      this.selectedField = null;
    }
  }

  get rowDropListIds(): string[] {
    return this.formSections.flatMap((section, sectionIndex) =>
      section.rows.map((_, rowIndex) => 'row-' + sectionIndex + '-' + rowIndex)
    );
  }

  get allDropListIds(): string[] {
    return ['availableFields', ...this.rowDropListIds];
  }

  ngOnInit() {
    this.addSection();
    this.addRow(0);
  }

  preventDropToAvailable(): boolean {
    return false;
  }

  dropSection(event: CdkDragDrop<Section[]>) {
    moveItemInArray(this.formSections, event.previousIndex, event.currentIndex);
  }

  dropField(event: CdkDragDrop<FormField[]>, sectionIndex: number, rowIndex: number) {
    this.selectedSection = sectionIndex;
    const row = this.formSections[sectionIndex].rows[rowIndex];
    if (event.previousContainer === event.container) {
      moveItemInArray(row.fields, event.previousIndex, event.currentIndex);
      this.adjustColSpans(row);
    } else if (event.previousContainer.id === 'availableFields') {
      // agr tumne apni left se b change kr k idhr show rakhna hai to yeh line use na krna ye new reference create krti hy
      const newField = { ...JSON.parse(JSON.stringify(event.previousContainer.data[event.previousIndex])), colSpan: 1, fontSize: this.globalFontSize };
      if (row.fields.length >= 12) {
        alert('Cannot add field: row would exceed 12 columns');
      } else {
        row.fields.splice(event.currentIndex, 0, newField);
        this.adjustColSpans(row);
      }
    } else {
      const previousRowId = event.previousContainer.id.split('-');
      const previousSectionIndex = parseInt(previousRowId[1]);
      const previousRowIndex = parseInt(previousRowId[2]);
      const previousRow = this.formSections[previousSectionIndex].rows[previousRowIndex];
      const field = previousRow.fields[event.previousIndex];
      if (row.fields.length >= 12) {
        alert('Cannot transfer field: row would exceed 12 columns');
      } else {
        transferArrayItem(
          previousRow.fields,
          row.fields,
          event.previousIndex,
          event.currentIndex
        );
        this.adjustColSpans(row);
        this.adjustColSpans(previousRow);
      }
    }

    // agr section me har row me at least 1 field hy to new row add kr degi ta k manually na add krni pare
    if (this.formSections[sectionIndex].rows.every((row) => row.fields.length)) {
      this.addRow(sectionIndex);
    }

    // agr section me har row me at least 1 field hy to new section add kr degi
    if (this.formSections.every((section) => section.rows.some((row) => row.fields.length))) {
      this.addSection();
      this.addRow(this.formSections.length - 1);
    }
       
  }

  selectField(sectionIndex: number, rowIndex: number, fieldIndex: number) {
    this.selectedField = { sectionIndex, rowIndex, fieldIndex };
  }

  selectSection(sectionIndex) {
    this.selectedSection = sectionIndex;
  }

  addSection() {
    this.formSections.push({ title: 'Section' + (this.formSections.length - 1) , rows: [] });
  }

  addRow(sectionIndex: number) {
    this.formSections[sectionIndex].rows.push({ fields: [] });
  }

  deleteField(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (this.selectedField) {
      const { sectionIndex, rowIndex, fieldIndex } = this.selectedField;
      const row = this.formSections[sectionIndex].rows[rowIndex];
      row.fields.splice(fieldIndex, 1);
      if (row.fields.length === 0) {
        this.formSections[sectionIndex].rows.splice(rowIndex, 1);
      } else {
        this.adjustColSpans(row);
      }
      this.selectedField = null;
    }
  }

  deleteSection(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    if (this.selectedField) {
      const { sectionIndex } = this.selectedField;
      this.formSections.splice(sectionIndex, 1);
      this.selectedField = null;
      if (this.formSections.length === 0) {
        this.addSection();
        this.addRow(0);
      }
    }
  }


  getTotalColSpan(row: Row): number {
    return row.fields.reduce((sum, field) => sum + (field.colSpan || 1), 0);
  }

  validateColSpan(sectionIndex: number, rowIndex: number) {
    const row = this.formSections[sectionIndex].rows[rowIndex];
    const total = this.getTotalColSpan(row);
    if (total > 12) {
      alert('Total column span exceeds 12. Adjusting...');
      this.adjustColSpans(row);
    }
  }

  adjustColSpans(row: Row) {
    const totalFields = row.fields.length;
    if (totalFields === 0) return;
    const colSpan = Math.floor(12 / totalFields);
    const remainder = 12 % totalFields;
    row.fields.forEach((field, index) => {
      field.colSpan = colSpan + (index < remainder ? 1 : 0);
    });
  }

  applyGlobalFontSize() {
    this.formSections.forEach(section => {
      section.rows.forEach(row => {
        row.fields.forEach(field => {
          field.fontSize = this.globalFontSize;
        });
      });
    });
  }

  addOption() {
    if (this.selectedField) {
      const field = this.formSections[this.selectedField.sectionIndex].rows[this.selectedField.rowIndex].fields[this.selectedField.fieldIndex];
      if (!field.options) {
        field.options = [];
      }
      field.options.push('New Option');
    }
  }
}



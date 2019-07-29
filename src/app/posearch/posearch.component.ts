import { Component, OnInit ,ViewChild,Input} from '@angular/core';
import { BookingService } from '../services/booking.service';
import { ResultList,Result,AuditList } from '../model/resultobj';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatPaginator, MatTableDataSource, MatSort,MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition} from '@angular/material';
import {FormControl,FormGroup,FormBuilder} from '@angular/forms';
import{ProcessRequest, ProcessData} from '../model/processrequest';
//import { CustomDateAdapter, APP_DATE_FORMATS} from '../model/customdate-adapter';
//import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from "@angular/material";
//import { LIFECYCLE_HOOKS_VALUES } from '@angular/compiler/src/lifecycle_reflector';
import { CdkDetailRowDirective } from '../directive/cdk-detail-row.directive';
declare var $: any;
@Component({
  selector: 'app-posearch',
  templateUrl: './posearch.component.html',
  styleUrls: ['./posearch.component.scss'],
 /*  providers: [
    {
        provide: DateAdapter, useClass: CustomDateAdapter
    },
    {
        provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
    ], */
    animations: [
      trigger('detailExpand', [
        state('void', style({height: '0px', minHeight: '0', visibility: 'hidden'})),
        state('*', style({height: '*', visibility: 'visible'})),
        transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      ]
  
  ),
  ]
})
export class PosearchComponent implements OnInit {

  message: string = 'Snack Bar opened.';
  actionButtonLabel: string = 'Retry';
  action: boolean = true;
  setAutoHide: boolean = true;
  autoHide: number = 3000;
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  addExtraClass: boolean = false;
  processForm: FormGroup;
  processData: FormGroup;
  resultList: ResultList[];
  auditList: AuditList[];
  result:Result
  columnRows = ['Po Number', 'DC Number', 'Delivery Date', 'Vendor No','Forecast Qty','Status','Delivery Dock','Delivery Time'];
  columnsToDisplay=['poNo','dcNo','deliveryDate','vendorNo','fcastQty','status','deliveryDock','deliveryTime'];
  displayedColumns = ['oldDeliveryDate', 'oldDeliveryTime', 'changedBy','changedOn','reasonCode'];
  expandedElement: AuditList[]; 
  isExpansionDetailRow = (index, row) => row.hasOwnProperty('detailRow');
  private openedRow: CdkDetailRowDirective
  
  @Input() singleChildRowDetail: boolean;

  onToggleChange(cdkDetailRow: CdkDetailRowDirective) : void {
    if (this.openedRow && this.openedRow.expended) {
      this.openedRow.toggle();      
    }
    this.openedRow = cdkDetailRow.expended ? cdkDetailRow : undefined;
  }

  showAudit: boolean = false;
  showAuditData: boolean = false;
  showSearch: boolean = false;
  private paginator: MatPaginator;
  private paginator1: MatPaginator;
  private aSort: MatSort;
  dataSource = new MatTableDataSource;
  dataSource1 = new MatTableDataSource; 
  arr: any[];
  
  /* @ViewChild('paginator',{static: false}) paginator: MatPaginator; */

  @ViewChild('paginator',{static: false}) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  @ViewChild('paginator1',{static: false}) set matPaginator1(mp1: MatPaginator) {
    this.paginator1 = mp1;
    this.setDataSourceAttributes1();
  }



  @ViewChild('aSort',{static: false}) set matSort(ms: MatSort){
    this.aSort = ms;
    this.setDataSourceAttributes1();
  };




  @ViewChild(MatSort,{static: false}) sort: MatSort;
  
  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
 
  setDataSourceAttributes1() {
    this.dataSource1.paginator = this.paginator1;
    this.dataSource1.sort = this.aSort;
  }
 


 /* @ViewChild(MatPaginator,{static: false}) paginator1: MatPaginator; */
  
  /**
   * Set the paginator after the view init since this component will
   * be able to query its view for the initialized paginator.
   */
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource1.paginator = this.paginator1;
    this.dataSource1.sort = this.aSort;
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  applyFilter1(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource1.filter = filterValue;
  }
 
  showNotification(){
    const type = ['','info','success','warning','danger'];

    const color = Math.floor((Math.random() * 4) + 1);

    $.notify({
        icon: "notifications",
        message: "No PO data Available"

    },{
        type: 'danger',
        timer: 2000,
        placement: {
            from: 'bottom',
            align: 'center'
        },
        template: '<div data-notify="container" class="col-xl-4 col-lg-4 col-11 col-sm-4 col-md-4 alert alert-{0} alert-with-icon" role="alert">' +
          '<button mat-button  type="button" aria-hidden="true" class="close mat-button" data-notify="dismiss">  <i class="material-icons">close</i></button>' +
          '<i class="material-icons" data-notify="icon">notifications</i> ' +
          '<span data-notify="title">{1}</span> ' +
          '<span data-notify="message">{2}</span>' +
          '<div class="progress" data-notify="progressbar">' +
            '<div class="progress-bar progress-bar-{0}" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"></div>' +
          '</div>' +
          '<a href="{3}" target="{4}" data-notify="url"></a>' +
        '</div>'
    });
}
 

  ngOnInit() {

    /* this.dataSource.paginator = this.paginator; */
  }
  constructor(public booking: BookingService ,public snackBar: MatSnackBar) { 
    this.processForm = this.createFormGroup();
  }
  

  createFormGroup() {
    return new FormGroup({
      processData: new FormGroup({
        poNo: new FormControl(),
        dcNo: new FormControl(),
        orderDate: new FormControl(),
        deliveryDate: new FormControl(),
        vendorNo: new FormControl(),
        fcastQty: new FormControl()
      })
    });
  }

  createFormGroupWithBuilderAndModel(formBuilder: FormBuilder) {
    return formBuilder.group({
      processData: formBuilder.group(new ProcessData())    
    });
  }
  
  get poNo () {
    return this.processForm.get('processData').get('poNo');
  }

  get dcNo () {
    return this.processForm.get('processData').get('dcNo');
  }
  
  get orderDate1 () {
    return this.processForm.get('processData').get('orderDate');
  }
  
  get deliveryDate1 () {
    return this.processForm.get('processData').get('deliveryDate');
  }
  
    
  get vendorNo () {
    return this.processForm.get('processData').get('vendorNo');
  }
  

  get fcastQty() {
    return this.processForm.get('processData').get('fcastQty');
  }
  
  searchPO() {

    // Make sure to create a deep copy of the form-model
    const searchCriteria: ProcessRequest = Object.assign({}, this.processForm.value);
    searchCriteria.processData = Object.assign({}, searchCriteria.processData);
    
  if(searchCriteria.processData.deliveryDate != null){
    searchCriteria.processData.deliveryDate = this.dateParse(searchCriteria.processData.deliveryDate);
  }
  if(searchCriteria.processData.orderDate != null){
    searchCriteria.processData.orderDate = this.dateParse(searchCriteria.processData.orderDate);
  }
    console.log('search criteria'+ searchCriteria.processData.poNo + searchCriteria.processData.dcNo+searchCriteria.processData.deliveryDate + 
    searchCriteria.processData.orderDate);
    this.showAudit = false;
    this.booking.getPO(JSON.stringify(searchCriteria.processData)).subscribe(data => {
     
    this.result= data;
    this.resultList=this.result.resultList;
    if(this.resultList!= null ){
    this.auditList = this.result.resultList[0].auditList;
    this.dataSource = new MatTableDataSource(this.resultList);
    this.dataSource.paginator = this.paginator;
    
        if(this.resultList != null){
          this.showSearch = true;
        }else{
          this.showSearch = false;
        }
        console.log("AuditListObj"+ this.auditList);
        console.log("AuditList"+ this.auditList[0].oldDeliveryDate);
        console.log("datasource"+ this.dataSource);
    
    }
  else{
    this.showSearch = false;
    //this.showNotification();
    console.log("Snack bar");
    this.message = 'No PO data Available for the selected search criteria'
    let config = new MatSnackBarConfig();
    config.verticalPosition = this.verticalPosition;
    config.horizontalPosition = this.horizontalPosition;
    config.duration = this.setAutoHide ? this.autoHide : 0;
    config.panelClass = ['custom-class'];
    this.snackBar.open(this.message, this.action ? this.actionButtonLabel : undefined,config);
    }
  }
  
  );

  }

clearForm(){
    this.processForm.reset();
    this.showSearch = false;
  }

clearFormValue(val){
  this.processForm.get('processData').get(val).reset();
  
}


 searchAudit(poNo){
  console.log("poNumber" + poNo);

  for (let i of this.resultList) {
   
    if(i.poNo == poNo){
      console.log("poNo" + poNo + i.poNo);
      if(i.auditList != null){
      this.dataSource1 = new MatTableDataSource(i.auditList);
      this.dataSource1.paginator = this.paginator1;
      this.dataSource1.sort = this.aSort;
      this.showAuditData = true;
    }else {
      this.dataSource1 = new MatTableDataSource();
      this.showAuditData = false;
    }
    }
}
 }

  dateParse(dateVal){
    dateVal = JSON.stringify(dateVal);
    dateVal = dateVal.slice(1,11)
    return dateVal;
  }

  display(){
  if(this.showAudit){
    this.showAudit = false;
  }else {
    this.showAudit = true;
  }
   
  }

}

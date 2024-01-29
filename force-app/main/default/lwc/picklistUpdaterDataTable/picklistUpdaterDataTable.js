import { LightningElement, wire, track} from 'lwc';
import getPicklistUpdaters from '@salesforce/apex/getPicklistUpdaterRecords.getPicklistUpdaters';

const columns = [{   
    label: 'View',
    initialWidth: 120,
    fieldName: 'nameUrl',
    type: 'button',
    sortable: true,
    typeAttributes: {
        label: 'View',
        name: 'View',
        title: 'View',
        disabled: false,
        value: 'view',
        iconPosition: 'left',
        iconName:'utility:preview',
        variant:'Brand'
    }
},
{
    label: 'Name',
    fieldName: 'nameUrl',
    type: 'url',
    sortable: true,
    typeAttributes: {
        label: {fieldName: 'Name'}, 
        tooltip:'Go to detail page', 
        target: '_blank'
    }
},{
    label: 'Action',
    fieldName: 'Action__c',
    type: 'text',
    sortable: true
},
{
    label: 'Primary Value',
    fieldName: 'Primary_Value__c',
    type: 'text',
    sortable: true
},
{
    label: 'Secondary Value',
    fieldName: 'Secondary_Values__c',
    type: 'text',
    sortable: true
},
{
    label: 'Status',
    fieldName: 'Status__c',
    type: 'textarea',
    sortable: true
}
];


export default class PicklistUpdaterDataTable extends LightningElement {

    error;
    columns = columns;
    allRecords; //All records available for data table    
    showTable = false; //Used to render table after we get the data from apex controller    
    recordsToDisplay = []; //Records to be displayed on the page
    rowNumberOffset; //Row number
    preSelected = [];
    selectedRows;

    @wire(getPicklistUpdaters)
    getPicklistUpdaters({
        error,
        data
    }) {
        if (data) {

            const sortByName = (a, b) => {
                let nameA = a.Name ? a.Name.toUpperCase() : ''; // to handle null/undefined
                let nameB = b.Name ? b.Name.toUpperCase() : ''; // to handle null/undefined
    
                if (nameA < nameB) {
                    return this.sortDirection === 'dsc' ? -1 : 1;
                } else if (nameA > nameB) {
                    return this.sortDirection === 'dsc' ? 1 : -1;
                }
                return 0;
            };

            // Sort the data
            let sortedData = [...data].sort(sortByName);

            let records = [];
            for(let i=0; i<sortedData.length; i++){
                let record = {};
                record.rowNumber = ''+(i+1);
                record.nameUrl = '/'+sortedData[i].Id;                
                record = Object.assign(record, sortedData[i]);               
                records.push(record);
            }

            this.allRecords = records;
            this.showTable = true;
        } else if (error) {
            this.error = error;
        }
    }

    //Capture the event fired from the paginator component
    handlePaginatorChange(event){
        this.recordsToDisplay = event.detail.recordsToDisplay;
        this.preSelected = event.detail.preSelected;
        if(this.recordsToDisplay && this.recordsToDisplay > 0){
            this.rowNumberOffset = this.recordsToDisplay[0].rowNumber-1;
        }else{
            this.rowNumberOffset = 0;
        } 
    }
    
    getSelectedRows(event) {
        const selectedRows = event.detail.selectedRows;
        let selectedRecordIds = [];
        // Display that fieldName of the selected rows
        for (let i = 0; i < selectedRows.length; i++){
            console.log(selectedRows[i].Id);
            selectedRecordIds.push(selectedRows[i].Id);
        }     
        this.template.querySelector('c-lwc-datatable-utility').handelRowsSelected(selectedRecordIds);        
    }

    handleAllSelectedRows(event) {
        this.selectedRows = [];
        const selectedItems = event.detail;          
        let items = [];
        selectedItems.forEach((item) => {
            this.showActionButton = true;
            console.log(item);
            items.push(item);
        });
        this.selectedRows = items;  
        console.log(this.selectedRows);        
    } 

    changeStyle() {
        //Generate Dynamic Values
        let mdata = [];
        this.allRecords.forEach(ele => {
            if(ele['Priority']){
                ele.priorityModified = ele.Priority === 'High' ? 'slds-text-color_error':'slds-text-color_success';            
            }  
            
            if(ele['Status']){
                ele.statusModified = ele.Status === 'Closed' ? `slds-is-edited`:``;            
            }              
            mdata.push(ele);
        });       
        this.allRecords = mdata;
        this.template.querySelector('c-lwc-datatable-utility').setRecordsOnPage(); 
    }      


}
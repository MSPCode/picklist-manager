import { LightningElement, track, api } from 'lwc';
import { createRecord } from "lightning/uiRecordApi";
import updatePicklist from '@salesforce/apex/mainPicklistHandler.updatePicklist';
import getResults from '@salesforce/apex/lwcCustomLookupController.getResults';
import { updateRecord } from 'lightning/uiRecordApi';
import ID_FIELD from '@salesforce/schema/Picklist_Updater__c.Id'
import STATUS_FIELD from '@salesforce/schema/Picklist_Updater__c.Status__c'


export default class picklistUpdater extends LightningElement {
    @track selectedValue;
    @track actionName;
    @track objectName;
    @track primaryField
    @track primaryValue;
    @track secondaryField
    @track secondaryValue;
    @track recordId;
    @track objectNameGetter;
    primaryFieldName;
    @track getObjectName = false;


    get options() {
        return [
            { label: 'Add Primary', value: 'Add Primary', checked: false },
            { label: 'Add Secondary', value: 'Add Secondary', checked: false },
            { label: 'Add Primary & Secondary', value: 'Add Primary & Secondary', checked: false },
            { label: 'Deactivate Primary', value: 'Deactivate Primary', checked: false },
            { label: 'Deactivate Secondary', value: 'Deactivate Secondary', checked: false },
        ];
    }

    handleChange(event) {
        this.selectedValue = event.target.value;
        this.updateCheckedOptions();
    }

    updateCheckedOptions() {
        this.options = this.options.map(option => ({
            label: option.label,
            value: option.value,
            checked: option.value === this.selectedValue
        }));
    }
    
    updaterActionName(event){
        this.actionName = event.target.value;
    }

    updaterObjectName(event){
        this.objectName = event.detail.mainField;
        this.objectNameGetter = event.detail.mainField;
        console.log(this.objectName);
        
    }

    updaterPrimaryValue(event){
        this.primaryValue = event.target.value;
    }

    updaterSecondaryValue(event){
        this.secondaryValue = event.target.value;
    }

    handlePrimaryFieldName(event){
        this.primaryFieldName = event.detail;
        console.log(this.primaryFieldName.mainField);
    }

    handleApexResponse(apexResponse) {
     
        for(let i =0; i <apexResponse.length; i++){
            console.log(apexResponse[i])
        }
    }



    createPicklist(){
        const fields = {'Action__c' : this.actionName, 'Object_Name__c' : this.objectName, 'Primary_Value__c': this.primaryValue, 'Secondary_Values__c': this.secondaryValue};
        const recordInput = {apiName : 'Picklist_Updater__c', fields};

        createRecord(recordInput).then(response => {
            console.log('Picklist Updater has been created : ', response.id);    
            this.recordId = response.id; // Store the record ID     

            return updatePicklist({
                objectName: this.objectName,
                picklistFieldName: this.primaryField,
                valuesToUpdate: this.primaryValue // Convert primaryValue to a list
            });
            
        })
        .then(apexResponse => {
            console.log('Response from mainPicklistHandler: ', apexResponse);
        
            const fieldToUpdate = {}
            fieldToUpdate[ID_FIELD.fieldApiName] = this.recordId;
            fieldToUpdate[STATUS_FIELD.fieldApiName] = 'SUCCESS!';
            const updateRecordInput = { fields: fieldToUpdate };
            return updateRecord(updateRecordInput);
        })
        .catch(error => {
            console.log('Error: ', error.body.message);
            //let errorMessage = error.body && error.body.message ? error.body.message : 'Unknown error occurred';
            // Update Status__c field with the error message
            //const updateFields = { Id: recordId, Status__c: 'Error: ' + errorMessage };
            const fieldToUpdate = {}
            fieldToUpdate[ID_FIELD.fieldApiName] = this.recordId;
            fieldToUpdate[STATUS_FIELD.fieldApiName] = error.body.message;

            const updateRecordInput = { fields: fieldToUpdate };
            return updateRecord(updateRecordInput);
        })
        .catch(error => {
            console.error('Error creating record: ', error);
            let errorMessage = error.body && error.body.message ? error.body.message : 'Unknown error occurred';
            // Handle the error appropriately
        });
    }
}

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
    @api FieldDefinationObject = 'FieldDefinition';
    @api fieldName = 'EntityDefinition.QualifiedApiName';
    @api selectRecordId = '';
    @api selectRecordName;
    @api Label;
    @api PrimarysearchRecords = [];
    @api SeondarysearchRecords = [];
    @api required = false;
    @api iconName = 'action:new_account'
    @api LoadingText = false;
    @track txtclassname = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
    @track messageFlag = false;
    @track iconFlag =  true;
    @track clearIconFlag = false;
    @track inputReadOnly = false;
    parentAccountSelectedRecord;

    handleValueSelectedOnAccount(event) {
        this.parentAccountSelectedRecord = event.detail;
    }
    handleValueSelectedFieldDefination(event) {
        this.parentAccountSelectedRecord = event.detail;
    }

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
        this.objectName = event.target.value;
    }

    updaterPrimaryValue(event){
        this.primaryValue = event.target.value;
    }

    updaterSecondaryValue(event){
        this.secondaryValue = event.target.value;
    }

    handleApexResponse(apexResponse) {
     
        for(let i =0; i <apexResponse.length; i++){
            console.log(apexResponse[i])
        }
    }

    searchPrimaryField(event) {
        var currentText = event.target.value;
        this.LoadingText = true;
        
        getResults({ ObjectName: this.FieldDefinationObject, ObjectToSearch: this.objectName, fieldName: this.fieldName, value: currentText  })
        .then(result => {
            console.log(result);
            this.PrimarysearchRecords= result;
            this.LoadingText = false;
            
            this.txtclassname =  result.length > 0 ? 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open' : 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
            if(currentText.length > 0 && result.length == 0) {
                this.messageFlag = true;
            }
            else {
                this.messageFlag = false;
            }

            if(this.selectRecordId != null && this.selectRecordId.length > 0) {
                this.iconFlag = false;
                this.clearIconFlag = true;
            }
            else {
                this.iconFlag = true;
                this.clearIconFlag = false;
            }
        })
        .catch(error => {
            console.log('-------error-------------'+error);
            console.log(error);
        });
        
    }

    setPrimaryFieldRecord(event) {
        var currentRecId = event.currentTarget.dataset.id;
        var selectName = event.currentTarget.dataset.name;
        this.primaryField = selectName;
        this.txtclassname =  'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
        this.iconFlag = false;
        this.clearIconFlag = true;
        this.selectRecordName = event.currentTarget.dataset.name;
        this.selectRecordId = currentRecId;
        this.inputReadOnly = true;
        const selectedEvent = new CustomEvent('selected', { detail: {selectName, currentRecId}, });
        // Dispatches the event.
        this.dispatchEvent(selectedEvent);
    }

    resetData(event) {
        this.selectRecordName = "";
        this.selectRecordId = "";
        this.inputReadOnly = false;
        this.iconFlag = true;
        this.clearIconFlag = false;
       
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

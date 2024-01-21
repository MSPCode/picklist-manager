import { LightningElement, track, api } from 'lwc';
import { createRecord } from "lightning/uiRecordApi";
import updatePicklist from '@salesforce/apex/mainPicklistHandler.updatePicklist';
import { updateRecord } from 'lightning/uiRecordApi';
import ID_FIELD from '@salesforce/schema/Picklist_Updater__c.Id'
import STATUS_FIELD from '@salesforce/schema/Picklist_Updater__c.Status__c'


export default class picklistUpdater extends LightningElement {
    @track selectedValue;
    @track actionName;
    @track objectName;
    @track primaryFieldName;
    @track primaryValue;
    @track secondaryFieldName
    @track secondaryValue;
    @track recordId;
    @track objectNameGetter;
    @track statusMessage;
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

    handleObjectName(event){
        this.objectName = event.detail.mainField;
        this.objectNameGetter = event.detail.mainField;
        console.log(this.objectName);
        
    }

    handlePrimaryFieldName(event){
        this.primaryFieldName = event.detail.mainField;
        console.log(this.primaryFieldName);
    }

    handleSecondaryFieldName(event){
        this.secondaryFieldName = event.detail.mainField;
        console.log(this.secondaryFieldName);
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

    createPicklist(){
        const fields = {'Action__c' : this.actionName, 'Object_Name__c' : this.objectName, 'Primary_Value__c': this.primaryValue, 'Secondary_Values__c': this.secondaryValue};
        const recordInput = {apiName : 'Picklist_Updater__c', fields};

        createRecord(recordInput).then(response => {
            console.log('Picklist Updater has been created : ', response.id);    
            this.recordId = response.id; // Store the record ID

            return updatePicklist({
                objectName: this.objectName,
                primaryFieldName: this.primaryFieldName,
                secondaryFieldName: this.secondaryFieldName,
                primaryFieldValues: this.primaryValue, // Convert primaryValue to a list
                secondaryFieldValue: this.secondaryValue // Convert SecondaryValue to a list

            });
            
        })
        .then(apexResponse => {

            this.statusMessage = apexResponse.length === 0 ? 'Both Fields are updated successfully' : '';

            console.log(`length of apexResponse: ${apexResponse.length}`);
            
            apexResponse.forEach(result =>{
                if (result.errorMessage) {
                    console.log(`Type of errorMessage: ${typeof result.errorMessage}`);
                    console.log(`Length of errorMessage: ${result.errorMessage.length}`)

                    console.log(result.errorMessage);
                    this.statusMessage += `${result.errorMessage}\n`;
                }

            })

            if (apexResponse.length === 1) {
                this.statusMessage = 'Partial Operation May be Completed. ' + this.statusMessage;
            }
        
            const fieldToUpdate = {}
            fieldToUpdate[ID_FIELD.fieldApiName] = this.recordId;
            fieldToUpdate[STATUS_FIELD.fieldApiName] = this.statusMessage;
            const updateRecordInput = { fields: fieldToUpdate };
            return updateRecord(updateRecordInput);
        })
        .catch(error => {
            console.log('Error: ', error.body.message);

            const fieldToUpdate = {}
            fieldToUpdate[ID_FIELD.fieldApiName] = this.recordId;
            fieldToUpdate[STATUS_FIELD.fieldApiName] = error.body.message;

            const updateRecordInput = { fields: fieldToUpdate };
            return updateRecord(updateRecordInput);
        })
        .catch(error => {
            console.error('Error creating record: ', error.body.message);
        });
    }
}

import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord } from "lightning/uiRecordApi";
import updatePicklist from '@salesforce/apex/mainPicklistHandler.updatePicklist';
import { updateRecord } from 'lightning/uiRecordApi';
import ID_FIELD from '@salesforce/schema/Picklist_Updater__c.Id'
import STATUS_FIELD from '@salesforce/schema/Picklist_Updater__c.Status__c'


export default class picklistUpdater extends LightningElement {
    @track selectedValue;
    @track actionName = '';
    @track objectName = '';
    @track primaryFieldName = '';
    @track primaryValue = '';
    @track secondaryFieldName = '';
    @track secondaryValue='';
    @track recordId;
    @track objectNameGetter;
    @track statusMessage;
    @track getObjectName = false;


    get options() {
        return [
            { label: 'Add Single Value', value: 'Add Single Value', checked: false },
            { label: 'Add Primary & Dependent Field Values', value: 'Add Primary & Dependent Field Values', checked: false },
            { label: 'Deactivate Value', value: 'Deactivate Value', checked: false },
            { label: 'Update Dependency Only (existing values)', value: 'Update Dependency Only (existing values)', checked: false },
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

    get showSecondaryFields() {
        // Adjust these conditions as per your requirement
        return ['Add Primary & Dependent Field Values', 'Update Dependency Only (existing values)'].includes(this.actionName);
    }
    
    updaterActionName(event){
        this.actionName = event.target.value;
    }

    handleObjectName(event){
        this.objectName = event.detail.mainField;
        this.objectNameGetter = event.detail.mainField;
        
    }

    handlePrimaryFieldName(event){
        this.primaryFieldName = event.detail.mainField;
    }

    handleSecondaryFieldName(event){
        this.secondaryFieldName = event.detail.mainField;
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

     //this function not working. Need work.
    stringTolist(inpt){
       
        if(inpt.includes(';')){
            return inpt.split(';');
        } else {
            return [inpt];
        }
    }

    apexClassInput(){
    return {
        actionName: this.actionName,
        objectName: this.objectName,
        primaryField: this.primaryFieldName,
        secondaryField: this.secondaryFieldName,
        primaryValues: this.stringTolist(this.primaryValue), // Convert primaryValue to a list
        secondaryValues: this.stringTolist(this.secondaryValue) // Convert SecondaryValue to a list
        };

    }

    resetErrorStates() {

        // Reset standard combobox fields
        this.template.querySelectorAll('lightning-combobox.error').forEach(el => {
            el.classList.remove('error');
        });
    
                
        // Reset standard input fields
        this.template.querySelectorAll('lightning-input.error').forEach(el => {
            el.classList.remove('error');
        });
    
        // Reset c-reusable-lookup components
        this.template.querySelectorAll('c-reusable-lookup').forEach(lookup => {
            lookup.setErrorState(false); // Assuming setErrorState is a method in c-reusable-lookup
        });
    }
    

    validateFields() {
        let isValid = true;
        const action = this.actionName;

        // Resetting previous error states
        this.resetErrorStates();

        // Function to mark standard combobox fields as invalid
        const markActionInvalid = () => {
            const actionField = this.template.querySelector(`lightning-combobox[data-id="actionMenu"]`);
            if(actionField) {
                actionField.classList.add('error');
            }
            isValid = false;
        };
    
        // Function to mark reusable lookup fields as invalid
        const markLookupFieldInvalid = (fieldName) => {
            const field = this.template.querySelector(`c-reusable-lookup[data-id="${fieldName}"]`);
            if(field) {
                field.setErrorState(true);
            }
            isValid = false;
        };

        // Function to mark standard input fields as invalid
        const markInputFieldInvalid = (fieldName) => {
            const field = this.template.querySelector(`lightning-input[data-id="${fieldName}"]`);
            if(field) {
                field.classList.add('error');
            }
            isValid = false;

        }

        if (!this.actionName) {
            markActionInvalid(); // Mark the action combobox as invalid if it's empty
        }
    
        // Validate based on action
        switch(action) {
            case 'Add Single Value':
                if (!this.objectName) markLookupFieldInvalid('objectName');
                if (!this.primaryFieldName) markLookupFieldInvalid('primaryField');
                if (!this.primaryValue) markInputFieldInvalid('primaryValue');
                break;
            case 'Add Primary & Dependent Field Values':
                if (!this.objectName) markLookupFieldInvalid('objectName');
                if (!this.primaryFieldName) markLookupFieldInvalid('primaryField');
                if (!this.primaryValue) markInputFieldInvalid('primaryValue');
                if (!this.secondaryFieldName) markLookupFieldInvalid('secondaryField');
                if (!this.secondaryValue) markInputFieldInvalid('secondaryValue');
                break;
            case 'Deactivate Value':
                if (!this.objectName) markLookupFieldInvalid('objectName');
                if (!this.primaryFieldName) markLookupFieldInvalid('primaryField');
                if (!this.primaryValue) markInputFieldInvalid('primaryValue');
                break;

            case 'Update Dependency Only (existing values)':
                if (!this.objectName) markLookupFieldInvalid('objectName');
                if (!this.primaryFieldName) markLookupFieldInvalid('primaryField');
                if (!this.primaryValue) markInputFieldInvalid('primaryValue');
                if (!this.secondaryFieldName) markLookupFieldInvalid('secondaryField');
                if (!this.secondaryValue) markInputFieldInvalid('secondaryValue');
                break;
        }
    
        return isValid;
    }
    

    

    // Method to show a toast message
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(evt);
    }
    


    resetForm() {
        this.actionName = '';
        this.objectName = '';
        this.primaryFieldName = '';
        this.primaryValue = '';
        this.secondaryFieldName = '';
        this.secondaryValue = '';
        // Reset any other tracked properties as needed
    }

    refreshComponent() {
        // Refresh the component
        // Method 1: Reload the entire page
        location.reload();

        // Method 2: Refresh only the component data
        // You may need to emit an event or call a method to re-fetch data
    }

    createPicklist(){

        if (!this.validateFields()) {
            this.showToast('Error', 'Please fill out required fields', 'error');
            return
        }
        
        const fields = {'Action__c' : this.actionName, 'Object_Name__c' : this.objectName,'Primary_Field_Name__c':this.primaryFieldName, 'Primary_Value__c': this.primaryValue,'Dependent_Field_Name__c': this.secondaryFieldName, 'Secondary_Values__c': this.secondaryValue};
        const recordInput = {apiName : 'Picklist_Updater__c', fields};

        createRecord(recordInput).then(response => {
            console.log('Picklist Updater has been created : ', response.id);    
            this.recordId = response.id; // Store the record ID

            return updatePicklist({
                input:this.apexClassInput()

                
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
            this.resetForm();
            this.refreshComponent();
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

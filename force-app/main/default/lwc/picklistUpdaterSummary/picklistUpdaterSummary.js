import { LightningElement, wire, track } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import {subscribe, unsubscribe, MessageContext} from 'lightning/messageService';
import RECORD_SELECTED_CHANNEL from '@salesforce/messageChannel/Record_Selected__c';


import NAME_FIELD from '@salesforce/schema/Picklist_Updater__c.Name';
import ACTION_FIELD from '@salesforce/schema/Picklist_Updater__c.Action__c';
import PRIMARY_VALUE_FIELD from '@salesforce/schema/Picklist_Updater__c.Primary_Value__c';
import SECONDARY_VALUE_FIELD from '@salesforce/schema/Picklist_Updater__c.Secondary_Values__c';
import STATUS_FIELD from '@salesforce/schema/Picklist_Updater__c.Status__c';

export default class picklistUpdaterSummary extends NavigationMixin(LightningElement) {
    @track recordId;
    picklistUpdaterFields = [NAME_FIELD, ACTION_FIELD, PRIMARY_VALUE_FIELD, SECONDARY_VALUE_FIELD, STATUS_FIELD];
    subscription = null;

    @wire(MessageContext)
    messageContext;

    
    subcribeToMessageChannel() {
        this.subscription = subscribe(
            this.messageContext,
            RECORD_SELECTED_CHANNEL,
            (message) => this.handlePropertySelected(message)
        
        );
    }

    handlePropertySelected(message) {
        this.recordId = message.recordId;
        console.log('getting from promise',this.recordId);
    }

    connectedCallback() {
        this.subcribeToMessageChannel();
    }

    @wire(getRecord, {
        recordId: '$recordId',
        fields: [NAME_FIELD, ACTION_FIELD]
    })
    picklistUpdater;
   

    set recordId(recordId) {
        this.recordId = recordId;
    }

    get hasNoRecordId() {
        return this.recordId === undefined;
    }

    get nameField() {
        return getFieldValue(this.picklistUpdater.data, NAME_FIELD)
    }

    get actionField() {
        return getFieldValue(this.picklistUpdater.data, ACTION_FIELD);
    }


    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    handleNavigateToRecord() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                objectApiName: 'Picklist_Updater__c',
                actionName: 'view'
            }
        });
    }
}

public with sharing class MyRecordController {
    @AuraEnabled(cacheable=true)
    public static List<Picklist_Updater__c> getRecords(Id recordId) {
        // Query to fetch records based on the recordId
        // Replace MyObject__c with your actual object name and include necessary fields
        return [SELECT Action__c, Object_Name__c, Secondary_Values__c FROM Picklist_Updater__c WHERE Id = :recordId];
    }
}
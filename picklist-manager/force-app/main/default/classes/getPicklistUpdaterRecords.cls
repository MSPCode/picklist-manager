public with sharing class getPicklistUpdaterRecords {
        @AuraEnabled(cacheable=true)
        public static List<Picklist_Updater__c> getPicklistUpdaters() {
            return [SELECT ID, Name, Action__c, Primary_Value__c,Secondary_Values__c, Status__c  FROM Picklist_Updater__c];
        }

    }
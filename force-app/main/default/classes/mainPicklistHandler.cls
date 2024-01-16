public with sharing class mainPicklistHandler {

    @AuraEnabled(cacheable=false)
    public static MetadataService.SaveResult[] updatePicklist(String objectName, String picklistFieldName, List<String> valuesToUpdate) {

        try {
            PicklistFieldUpdater primaryUpdater = new PicklistFieldUpdater(objectName, picklistFieldName);
            return primaryUpdater.updatePicklistField(valuesToUpdate);

        }
        catch(System.NullPointerException e){
            System.debug('NullPointerException encountered in updatePicklist: ' + e.getMessage());
            throw new AuraHandledException('Error updating picklist: ' + e.getMessage());

        }

    }
}


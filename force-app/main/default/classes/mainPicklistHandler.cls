public with sharing class mainPicklistHandler {

    @AuraEnabled(cacheable=false)
    public static MetadataService.SaveResult[] updatePicklist(String objectName, String primaryFieldName, List<String> valuesToUpdate) {

        try {
            PicklistFieldUpdater updater = new PicklistFieldUpdater(objectName);
            return updater.updatePicklistField(primaryFieldName , valuesToUpdate);

        }
        catch(System.NullPointerException e){
            System.debug('NullPointerException encountered in updatePicklist: ' + e.getMessage());
            throw new AuraHandledException('Error updating picklist: ' + e.getMessage());

        }

    }
}


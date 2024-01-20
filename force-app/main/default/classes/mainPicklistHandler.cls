public with sharing class mainPicklistHandler {

    @AuraEnabled(cacheable=false)
    public static MetadataService.SaveResult[] updatePicklist(String objectName, String primaryFieldName, String secondaryFieldName, List<String> primaryFieldValues, List<String> secondaryFieldValue) {
        
        PicklistFieldUpdater updater = new PicklistFieldUpdater(objectName);
        List<MetadataService.SaveResult> combinedResults = new List<MetadataService.SaveResult>();

        try {
            combinedResults.addAll(updater.updatePicklistField(primaryFieldName, primaryFieldValues));
        }
        catch(System.NullPointerException e){
            System.debug('NullPointerException encountered in updatePicklist: ' + e.getMessage());
            // Log the exception but do not throw, to continue execution
        }

        try {

            string primaryControllingValue = primaryFieldValues[0];

            combinedResults.addAll(updater.updatePicklistField(secondaryFieldName, secondaryFieldValue));
            // Assuming update.updateDependency returns a list of SaveResult
            combinedResults.addAll(updater.updateDependency(secondaryFieldName, primaryFieldName, primaryControllingValue, secondaryFieldValue));
        }
        catch(System.NullPointerException e){
            // Handle exception for secondary field updates
            System.debug('NullPointerException encountered in secondary field updates: ' + e.getMessage());
            // You may want to handle this exception differently
        }

        // Directly assign the list to an array
        MetadataService.SaveResult[] resultsArray = combinedResults;
        return resultsArray;
    }
}

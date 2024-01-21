public with sharing class mainPicklistHandler {

    @AuraEnabled(cacheable=false)
    public static List<ResultWrapper> updatePicklist(String objectName, String primaryFieldName, String secondaryFieldName, List<String> primaryFieldValues, List<String> secondaryFieldValue) {
        
        PicklistFieldUpdater updater = new PicklistFieldUpdater(objectName);
        List<ResultWrapper> results = new List<ResultWrapper>();
        List<MetadataService.SaveResult> primayFieldUpdate;
        List<MetadataService.SaveResult> dependentFieldUpdate;
        List<MetadataService.SaveResult> dependecyUpdate;

        try {
            primayFieldUpdate = updater.updatePicklistField(primaryFieldName, primaryFieldValues);
            results.addAll(processSaveResults(primayFieldUpdate, primaryFieldName));
        }
        catch(System.NullPointerException e){
            System.debug('NullPointerException encountered in updatePicklist: ' + e.getMessage());
            results.add(new ResultWrapper(primaryFieldName, e.getMessage()));
        }
        
        try {
            dependentFieldUpdate = updater.updatePicklistField(secondaryFieldName, secondaryFieldValue);
            results.addAll(processSaveResults(dependentFieldUpdate, secondaryFieldName));
        }
        catch(System.NullPointerException e){
            System.debug('NullPointerException encountered in dependent field update: ' + e.getMessage());
            results.add(new ResultWrapper(secondaryFieldName, e.getMessage()));
        }

        try {
            String primaryControllingValue = primaryFieldValues[0];
            dependecyUpdate = updater.updateDependency(secondaryFieldName, primaryFieldName, primaryControllingValue, secondaryFieldValue);
            results.addAll(processSaveResults(dependecyUpdate, secondaryFieldName + ' dependency'));
        }
        catch(System.NullPointerException e){
            System.debug('NullPointerException encountered in dependency update: ' + e.getMessage());
            results.add(new ResultWrapper(secondaryFieldName + ' dependency', e.getMessage()));
        }

        return results;
    }

    private static List<ResultWrapper> processSaveResults(List<MetadataService.SaveResult> saveResults, String fieldName) {
        
        List<ResultWrapper> resultWrappers = new List<ResultWrapper>();
        for (MetadataService.SaveResult result : saveResults) {
            if (!result.success) {
                String errorMessage = 'Error updating field: ' + fieldName + '; ';
                if (result.errors != null) {
                    for (MetadataService.Error error : result.errors) {
                        errorMessage += error.message + '; ';
                        System.debug('******************ERROR MESSAGE*************************: '+ errorMessage);
                    }
                }
                resultWrappers.add(new ResultWrapper(fieldName, errorMessage));
            }
        }
        return resultWrappers;
    }

    public class ResultWrapper {
        @AuraEnabled public String fieldName {get; private set;}
        @AuraEnabled public String errorMessage {get; private set;}

        public ResultWrapper(String fieldName, String errorMessage) {
            this.fieldName = fieldName;
            this.errorMessage = errorMessage;
        }
    }
}

public with sharing class mainPicklistHandler {

    @AuraEnabled(cacheable=false)
    public static List<ResultWrapper> updatePicklist(InputWrap input) {
        
        PicklistFieldUpdater updater = new PicklistFieldUpdater(input.objectName);
        List<ResultWrapper> results = new List<ResultWrapper>();
        List<MetadataService.SaveResult> primaryFieldUpdate;
        List<MetadataService.SaveResult> dependentFieldUpdate;
        List<MetadataService.SaveResult> dependencyUpdate;
        
                try {
            if (input.actionName == 'Add Single Value' && input.primaryField != null && !input.primaryValues.isEmpty()) {
                primaryFieldUpdate = updater.updatePicklistField(input.primaryField, input.primaryValues);
                results.addAll(processSaveResults(primaryFieldUpdate, input.primaryField));
                
            } else if (input.actionName == 'Add Primary & Dependent Field Values' && input.primaryField != null && !input.primaryValues.isEmpty() && input.secondaryField != null && !input.secondaryValues.isEmpty()) {
                primaryFieldUpdate = updater.updatePicklistField(input.primaryField, input.primaryValues);
                results.addAll(processSaveResults(primaryFieldUpdate, input.primaryField));

                dependentFieldUpdate = updater.updatePicklistField(input.secondaryField, input.secondaryValues);
                results.addAll(processSaveResults(dependentFieldUpdate, input.secondaryField));

                String primaryControllingValue = input.primaryValues[0];
                dependencyUpdate = updater.updateDependency(input.secondaryField, input.primaryField, primaryControllingValue, input.secondaryValues);
                results.addAll(processSaveResults(dependencyUpdate, input.secondaryField + ' dependency'));
                
            } else if (input.actionName == 'Update Dependency Only (existing values)' && input.primaryField != null && !input.primaryValues.isEmpty() && input.secondaryField != null && !input.secondaryValues.isEmpty()) {
                String primaryControllingValue = input.primaryValues[0];
                dependencyUpdate = updater.updateDependency(input.secondaryField, input.primaryField, primaryControllingValue, input.secondaryValues);
                results.addAll(processSaveResults(dependencyUpdate, input.secondaryField + ' dependency'));
            }

            // Placeholder for 'Deactivate Value' logic
            if (input.actionName == 'Deactivate Value') {
                primaryFieldUpdate = updater.deactivatePicklistValues(input.primaryField, input.primaryValues);
                results.addAll(processSaveResults(primaryFieldUpdate, input.primaryField));
            }
        }
        catch(System.NullPointerException e){
            System.debug('NullPointerException encountered: ' + e.getMessage());
            results.add(new ResultWrapper(input.primaryField, e.getMessage())); // This might need refinement based on where the exception is thrown
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
    public class InputWrap {
        @AuraEnabled public String actionName { get; set; }
        @AuraEnabled public String objectName { get; set; }
        @AuraEnabled public String primaryField { get; set; }
        @AuraEnabled public List<String> primaryValues { get; set; }
        @AuraEnabled public String secondaryField { get; set; }
        @AuraEnabled public List<String> secondaryValues { get; set; }
    }
    
}
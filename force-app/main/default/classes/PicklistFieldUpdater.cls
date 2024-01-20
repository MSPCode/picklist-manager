public class PicklistFieldUpdater {

    private String objectName;
    private MetadataService.MetadataPort service;

    /**
     * Constructor to initialize the PicklistFieldUpdater.
     *
     * @param objectName        the API name of the Salesforce object
     */
    public PicklistFieldUpdater(String objectName) {
        this.objectName = objectName;

        //unnecessary code but needed for session token referesh
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:ApexMDAPI/services/data/v22.0/query/?q=SELECT+id+from+contact+LIMIT+1');
        req.setMethod('GET');
        HttpResponse res = h.send(req);

        // Initialize the Metadata service
        this.service = new MetadataService.MetadataPort();
        this.service.SessionHeader = new MetadataService.SessionHeader_element();
        //this.service.SessionHeader.sessionId = UserInfo.getSessionId();
        this.service.SessionHeader.sessionId = '{!$Credential.OAuthToken}';

    }

    /**
     * Method to update the picklist field with new values.
     */
    public MetadataService.SaveResult[] updatePicklistField(String fieldName, List<String> newCustomValues) {
        // Retrieve the existing field
        MetadataService.CustomField existingField = retrieveExistingField(fieldName);

        // Add new custom values to the existing values
        List<MetadataService.CustomValue> allValues = new List<MetadataService.CustomValue>();
        if (existingField.valueSet.valueSetDefinition != null) {
            allValues.addAll(existingField.valueSet.valueSetDefinition.value);
        }
        
        for (String valueLabel : newCustomValues) {
            MetadataService.CustomValue cv = new MetadataService.CustomValue();
            cv.label = valueLabel;
            cv.fullName = valueLabel;
            cv.isActive = true;
            cv.default_x = false;
            allValues.add(cv);
        }

        // Update the field with new value set
        updateFieldWithNewValues(existingField, allValues);

        // Perform the update operation
        return performUpdateOperation(existingField);
    }
    
    private MetadataService.CustomField retrieveExistingField(String fieldName) {
    // Construct the full name of the picklist field using the global variables
    String fieldFullName = this.objectName + '.' + fieldName;

    // Use the constructed full name to retrieve the existing field
    MetadataService.CustomField existingField = 
        (MetadataService.CustomField) service.readMetadata('CustomField', new String[] {fieldFullName}).getRecords()[0];

    return existingField;
    }
    
    private void updateFieldWithNewValues(MetadataService.CustomField field, List<MetadataService.CustomValue> values) {
    // Check if the custom field and values are not null
    if (field == null || values == null || values.isEmpty()) {
        throw new IllegalArgumentException('Field and values must not be null or empty');
    }

    // Create a new Value Set Definition
    MetadataService.ValueSetValuesDefinition valueSetDefinition = new MetadataService.ValueSetValuesDefinition();
    valueSetDefinition.sorted = true;  // Set to true if you want the picklist values to be sorted alphabetically
    valueSetDefinition.value = values; // Assign the list of values to the Value Set Definition

    // Create a new Value Set and assign the Value Set Definition to it
    MetadataService.ValueSet valueSet = new MetadataService.ValueSet();
    valueSet.valueSetDefinition = valueSetDefinition;

    // Assign the Value Set to the custom field
    field.valueSet = valueSet;
    }


    private MetadataService.SaveResult[] performUpdateOperation(MetadataService.CustomField field) {
        // Check if the custom field is not null
        if (field == null) {
            throw new IllegalArgumentException('Field must not be null');
        }
        
        MetadataService.SaveResult[] results;
    
        // Perform the update operation
        try {
            results = service.updateMetadata(new MetadataService.Metadata[] { field });
    
            // Check for and handle any errors in the response
            for (MetadataService.SaveResult result : results) {
                if (!result.success) {
                    String errorMessage = 'Error updating field: ';
                    if (result.errors != null) {
                        for (MetadataService.Error error : result.errors) {
                            errorMessage += error.message + '; ';
                        }
                    }
                    throw new IllegalArgumentException(errorMessage);
                }
            }
    
            // Optionally, log the success
            System.debug('Field update successful.');
        } catch (Exception e) {
            // Handle any exceptions during the update operation
            System.debug('Exception in updating field: ' + e.getMessage());
            // Re-throw the exception if you want it to be handled by the caller
            throw e;
        }
        return results;
    }
    
    /**
     * Method to deactivate a list of specified values in the picklist field.
     *
     * @param valuesToDeactivate the list of values to deactivate in the picklist
     */
    public MetadataService.SaveResult[] deactivatePicklistValues(String fieldName, List<String> valuesToDeactivate) {
        // Retrieve the existing field
        MetadataService.CustomField existingField = retrieveExistingField(fieldName);
    
        // Check if the value set definition exists
        if (existingField.valueSet.valueSetDefinition != null) {
            // Iterate over the existing values
            for (MetadataService.CustomValue value : existingField.valueSet.valueSetDefinition.value) {
                // Check if the current value is in the list of values to deactivate
                if (valuesToDeactivate.contains(value.fullName)) {
                    value.isActive = false; // Deactivate the value
                }
            }
        }
    
        // Perform the update operation
        return performUpdateOperation(existingField);
    }

}
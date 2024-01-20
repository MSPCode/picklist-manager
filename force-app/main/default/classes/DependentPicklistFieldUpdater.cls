public class DependentPicklistFieldUpdater {
    private String objectName;
    private String fieldName;
    private String controllingField;
    private MetadataService.MetadataPort service;
    private MetadataService.CustomField existingField;

    public DependentPicklistFieldUpdater (String objectName, String fieldName, String controllingField) {
        
        //unnecessary code but needed for session token referesh
        Http h = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:ApexMDAPI/services/data/v22.0/query/?q=SELECT+id+from+contact+LIMIT+1');
        req.setMethod('GET');
        HttpResponse res = h.send(req);


        this.objectName = objectName;
        this.fieldName = fieldName;
        this.controllingField = controllingField;
        this.service = new MetadataService.MetadataPort();
        service.SessionHeader = new MetadataService.SessionHeader_element();
        //service.SessionHeader.sessionId = UserInfo.getSessionId();
        service.SessionHeader.sessionId = '{!$Credential.OAuthToken}';

        // Retrieve the existing custom field metadata
        this.existingField = (MetadataService.CustomField) 
            service.readMetadata('CustomField', new String[] {objectName + '.' + fieldName}).getRecords()[0];
    }

    public void updatePicklistField(List<String> newValues) {
        List<MetadataService.CustomValue> allValues = new List<MetadataService.CustomValue>();
        if (existingField.valueSet.valueSetDefinition != null) {
            allValues.addAll(existingField.valueSet.valueSetDefinition.value);
        }

        for (String newValue : newValues) {
            MetadataService.CustomValue cv = new MetadataService.CustomValue();
            cv.label = newValue;
            cv.fullName = newValue;
            cv.isActive = true;
            cv.default_x = false;
            allValues.add(cv);
        }

        MetadataService.ValueSetValuesDefinition vd = new MetadataService.ValueSetValuesDefinition();
        vd.value = allValues;
        vd.sorted = true;

        if (existingField.valueSet == null) {
            existingField.valueSet = new MetadataService.ValueSet();
        }
        existingField.valueSet.valueSetDefinition = vd;
    }

    public void updateDependency(String controllingFieldValue, List<String> valueNames) {
        List<MetadataService.ValueSettings> allValueSettings = new List<MetadataService.ValueSettings>();
        if (existingField.valueSet.valueSettings != null) {
            allValueSettings.addAll(existingField.valueSet.valueSettings);
        }

        for (String valueName : valueNames) {
            MetadataService.ValueSettings vs = new MetadataService.ValueSettings();
            vs.controllingFieldValue = new List<String>{controllingFieldValue};
            vs.valueName = valueName;
            allValueSettings.add(vs);
        }

        if (existingField.valueSet == null) {
            existingField.valueSet = new MetadataService.ValueSet();
        }
        existingField.valueSet.controllingField = controllingField;
        existingField.valueSet.valueSettings = allValueSettings;
    }

    public MetadataService.SaveResult[] performUpdateOperation(MetadataService.CustomField field) {

        // Check if the custom field is not null
        if (field == null) {
            throw new IllegalArgumentException('Field must not be null');
        }
        try {
        results = service.updateMetadata(new MetadataService.Metadata[] { existingField });

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
    return results;}
}
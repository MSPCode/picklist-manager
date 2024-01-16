public with sharing class lwcCustomLookupController {
    public lwcCustomLookupController() {

    }

    @AuraEnabled(cacheable=true)
    public static List<SObJectResult> getResults(String ObjectName, String ObjectToSearch, String value) {
        List<SObJectResult> sObjectResultList = new List<SObJectResult>();
        system.debug('-------------'+ObjectName+'---++----------'+value);
        if(String.isNotEmpty(value))
            for(sObject so : Database.Query('SELECT Id, QualifiedApiName FROM ' + ObjectName + ' WHERE EntityDefinition.QualifiedApiName' + ' = \'' + ObjectToSearch + '\'' + ' AND QualifiedApiName LIKE \'%' + value + '%\'')) {
                String fieldvalue = (String)so.get('QualifiedApiName');
                sObjectResultList.add(new SObjectResult(fieldvalue, so.Id));
            }
        
        return sObjectResultList;
    }
    
    public class SObJectResult {
        @AuraEnabled
        public String recName;
        @AuraEnabled
        public Id recId;
        
        public SObJectResult(String recNameTemp, Id recIdTemp) {
            recName = recNameTemp;
            recId = recIdTemp;
        }
    }
}
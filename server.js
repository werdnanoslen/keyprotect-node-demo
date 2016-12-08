// http://keyprotectpoc.mybluemix.net

var request = require('request');

// Constants
var api = 'https://ibm-key-protect.edge.bluemix.net/api/v2/secrets'
var headers = {
    'Bluemix-Space': '', //replace with output from 'cf space myspace --guid'
    'Bluemix-Org': '',   //replace with output from 'cf org myorg --guid'
    'Authorization': ''  //replace with output from 'cf oauth-token'
};

// Add secret //////////////////////////////////////////////////////////////////
request.post({
    'url': api,
    'headers': headers,
    'json': {
        'metadata': {
      		'collectionType': 'application/vnd.ibm.kms.secret+json',
      		'collectionTotal': 1
      	},
      	'resources': [{
      		'type': 'application/vnd.ibm.kms.secret+json',
      		'name': 'demoKey',
      		'algorithmType': 'aes',
      		'payload': 'ThisIsMySecretKey' + Date.now()
        }]
    }
}, function(error, response, body) {
    var keyId = body.resources[0].id;
    console.log('ADDED ID:', keyId);

    // Get all secrets /////////////////////////////////////////////////////////
    request.get({
        'url': api,
        'headers': headers
    }, function(error, response, body) {
        var parsed = JSON.parse(body);
        var count = parsed.metadata.collectionTotal;
        console.log('TOTAL KEY COUNT:', count);

        // Get secret //////////////////////////////////////////////////////////
        request.get({
            'url': api + '/' + keyId,
            'headers': headers
        }, function(error, response, body) {
            var parsed = JSON.parse(body);
            var key = parsed.resources[0].payload;
            console.log('GET ADDED KEY:', key);

            // Delete secret ///////////////////////////////////////////////////
            request.delete({
                'url': api + '/' + keyId,
                'headers': headers
            }, function(error, response, body) {
                var deleted = response.statusCode == 204 ? 'SUCCESS' : 'ERROR';
                console.log('DELETE ADDED KEY:', deleted);

                // Get all secrets /////////////////////////////////////////////
                request.get({
                    'url': api,
                    'headers': headers
                }, function(error, response, body) {
                    var parsed = JSON.parse(body);
                    var count = parsed.metadata.collectionTotal;
                    console.log('TOTAL KEY COUNT:', count);
                });
            });
        });
    });
});

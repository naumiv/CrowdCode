var assertionResults = new Array();
var details = { 'failed' : 0 };


// this functions is for avoiding to have 
// Infinity, Nan or undefined values 
// they all becomes null values
function normalizeGlobalValues ( dirtyValue ){
	if( dirtyValue === Infinity || dirtyValue === undefined || (typeof dirtyValue == 'number' && isNaN(dirtyValue) ) ){
		return dirtyValue + '';
	} else{
		return JSON.stringify(dirtyValue);
	}
}


function equal(actual, expected, message){
	var succeeded = deepCompare(actual, expected);

	actual   = normalizeGlobalValues(actual);
	expected = normalizeGlobalValues(expected);
	getResults(actual,expected,message,succeeded);
}

function deepEqual(actual, expected, message){

	var succeeded = ( actual === expected );
	getResults(actual,expected,message,succeeded);
}

function notEqual(actual, expected, message){

	var succeeded = !deepCompare(actual, expected)
	getResults(actual,expected,message,succeeded);
}

function notDeepEqual(actual, expected, message){

	var succeeded = (actual !== expected);
	getResults(actual,expected,message,succeeded);
}

// report the actual as error, expected as error and message as thrown error
// in order for this method to work we must take actual as a string and evaluate
// it inside throws 
function throwsException(actual,expect,message)
{
	var succeeded = false;
	// if does not throw an error will not succeed 
	try
	{
		eval(actual)
	}
	catch(err)
	{
		// succeed if expected error message is same
		succeeded = err.message.indexOf(expect) > -1;
		actual = "";
		if(succeeded)
		{
			message = "Error Messages match";
		}
	}
	if(!succeeded)
	{
		actual = "no error was thrown";
	}
	getResults(actual,expect,message,succeeded);
}

function getResults(actual,expected,message,succeeded)
{	
	assertionResults.push({ 'expected': expected, 'actual': actual, 'message': message, 'result':  succeeded});
	
	if (!succeeded)
		details.failed++;
}

function resetAssertions()
{
	assertionResults = new Array();
	details.failed = 0;
}

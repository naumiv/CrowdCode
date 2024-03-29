
// directive for json field validation
clienRequestApp.directive('jsonValidator', function()  {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {
            // instantiate a new JSONValidator
            var validator = new JSONValidator();

            ctrl.$parsers.unshift(function (viewValue) {

            	nameToADT=[];

            	angular.forEach(scope.ADTs, function(value,key){
            		nameToADT[value.name]=value;
            	});
                 // initialize JSONValidator and execute errorCheck
                validator.initialize(nameToADT,viewValue,attrs.jsonValidator);
                validator.errorCheck();
                if (!validator.isValid()) {
                   ctrl.$setValidity('json', false);
                    ctrl.$error.json = validator.getErrors();
                    return viewValue;
                } else {
                     ctrl.$setValidity('json', true);
                    return viewValue;
                }
            });
        }
    };
});




//<div function-validator ng-model="somevar"></div>
clienRequestApp.directive('adtValidator',function() {


    var errors = [];
    var valid;

    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {

            ctrl.$parsers.unshift(function (viewValue) {

            	typeNames=["Boolean", "String", "Number"];
            	angular.forEach(scope.ADTs, function(value,key){
            		console.log(value);
            		typeNames.push(value.name);
            	});
            	console.log("adt");
            		console.log(scope.ADTs);

            	var valid=isValidTypeName(viewValue, typeNames)||viewValue==="";
            	// Returns true if name is a valid type name and false otherwise.


                if(!valid){
                    ctrl.$setValidity('adt', false);
                    ctrl.$error.adt =  "Is not a valid type name. Valid type names are 'String, Number, Boolean, a data structure name, and arrays of any of these (e.g., String[]).";
                    return viewValue;
                } else {
                    ctrl.$setValidity('adt', true);
                    return viewValue;
                }

            });

        }
    };
});



function isValidTypeName(name,typeNames)
{

	var simpleName;
	// Check if there is any array characters at the end. If so, split off that portion of the string.
	var arrayIndex = name.indexOf('[]');
	if (arrayIndex != -1)
		simpleName = name.substring(0, arrayIndex);
	else
		simpleName = name;

	if (typeNames.indexOf(simpleName) == -1)
		return false;
	else if (arrayIndex != -1)
	{
		// Check that the array suffix contains only matched brackets..
		var suffix = name.substring(arrayIndex);
		if (suffix != '[]' && suffix != '[][]' && suffix != '[][][]' && suffix != '[][][][]')
			return false;
	}

	return true;
}


clienRequestApp.directive('pressEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.pressEnter);
                });

                event.preventDefault();
            }
        });
    };
});

clienRequestApp.directive('syncFocusWith', function($timeout, $rootScope) {
    return {
        restrict: 'A',
        scope: {
            focusValue: "=syncFocusWith"
        },
        link: function($scope, $element, attrs) {
            $scope.$watch("focusValue", function(currentValue, previousValue) {
                if (currentValue === true && !previousValue) {
                    $element[0].focus();
                } else if (currentValue === false && previousValue) {
                    $element[0].blur();
                }
            });
        }
    };
});

//<div function-validator ng-model="somevar"></div>
clienRequestApp.directive('maxLength',function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {

            ctrl.$parsers.push(function (viewValue) {
                var maxLength=attrs.maxLength || 70 ;
                var splittedDescription= viewValue.split('\n');
                var regex = '.{1,'+maxLength+'}(\\s|$)|\\S+?(\\s|$)';

                for(var i=0;i<splittedDescription.length;i++ )
                {
                    if(splittedDescription[i].length>maxLength)
                    {
                        splittedDescription[i]=splittedDescription[i].match(RegExp(regex, 'g')).join('\n');
                    }
                }

                return splittedDescription.join('\n')+'\n';
           });
            ctrl.$formatters.push(function (viewValue) {
                 return  viewValue.substring(2,viewValue.length-1).replace(/\n  /g,'\n');
            });


        }
    };
});


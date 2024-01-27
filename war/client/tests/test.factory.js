


angular
    .module('crowdCode')
    .factory('Test', [ function() {

	function Test(rec, functionName){
		if( rec === undefined || rec === null )
			return false;


		if(rec.isSimple)
			rec.code = 'expect(' + functionName + '(' + rec.inputs.join(',') + ')).to.deep.equal(' + rec.output + ');';

		angular.extend(this,rec);

		this.inputs = [];
		for( var key in rec.inputs ){
			this.inputs.push(rec.inputs[key]);
		}
	}

	Test.prototype = {
		getInputsKey: function(){
			return this.inputs.join(',');
		}
	};

	return Test;
}]);
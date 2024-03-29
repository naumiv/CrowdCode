function Debugger(){}

Debugger.init = function(data){
    Debugger.functions = {};
    Debugger.onTrace = data.onTrace ? data.onTrace : [];
    Debugger.setFunctions( data.functions ? data.functions : {} );
    Debugger.resetLogs();
};


Debugger.resetLogs = function(){
    Debugger.logs = {
        values: {},
        calls: {}
    };
};

Debugger.runTest = function(testCode) {
    Debugger.resetLogs();
    var functCode = '';
    for( var functionName in Debugger.functions ){
        functCode += Debugger.functions[functionName].compiled + '\n';
        if( functionName == 'loggingFunction')
            console.log(Debugger.functions[functionName].compiled );
    }

    var evalCode = functCode + '\n' 
                 + testCode;

    
    try {
        eval( evalCode );
    } catch( e ){
        console.log(e);
    }
    return evalCode;
};


Debugger.setFunctions = function(functions){
    Debugger.functions = {};
    Debugger.functionsName = [];
    // parse all the functions 
    for( var functionName in functions ){
        Debugger.setFunction(functionName, functions[functionName]);
    }
}

Debugger.setFunction = function(functName, functObj) {
    Debugger.functions[functName] = functObj;
    Debugger.functionsName.push(functName);

    // create the abstract syntax tree
    var bodyNode = esprima.parse( functObj.code, {loc:true} ).body[0];

    // if it's not a function declaration throw exception
    if( bodyNode.type !== 'FunctionDeclaration' ) 
        throw new Error('This is not a function declaration!');

    // if the function has to be traced
    // keep the body in the array of the 
    if( Debugger.onTrace.indexOf( functName ) > -1 ) {
        bodyNode = Debugger.instrumentFunction( bodyNode, functName );
    }

    // if not, replace the function body with a mocked version
    // that returns the stubbed value if found or executes the 
    // function in the real implementation 
    functObj.compiled = Debugger.mockFunction( bodyNode );
}

Debugger.instrumentFunction = function(fNode){
    // initialize scope
    var scope  = new Scope(fNode.id.name);

    // insert the parameters in the scope
    fNode.params.map(function(param){
        scope.variables.push( param.name );
    });

    estraverse.replace( fNode.body, {
        enter: function(node,parent){

            

            // console.log(node.type,escodegen.generate(node));
            if (node.type === 'UpdateExpression') {
                node = Debugger.instrumentTreeNode(node,scope);
                this.skip();
            }
            else if( parent.type === 'AssignmentExpression' ){
                
                if( node === parent.left )
                    this.skip();
            }
            else if( ['WhileStatement','ForStatement'].indexOf( node.type ) > -1 ){

                scope.loop ++ ;
            } 
            else if( ['WhileStatement','ForStatement'].indexOf( parent.type ) > -1 && node.type !== 'BlockStatement'){
                this.skip();
            }
            else if( node.type === 'FunctionExpression' ) {
                this.skip();
            } 

            return node;
        },
        leave: function(node,parent){
            
            // in case of a variable declaration we should add 
            // the variable name to the current scope
            if( node.type === 'VariableDeclarator' ){
                scope.declare( node.id.name );
            } 
            
            if( node.type === 'BinaryExpression'){
                node = Debugger.instrumentTreeNode(node,scope);
            }
            else if( node.type === 'Identifier' && scope.variables.indexOf(node.name) > -1 ){

                console.log('ide', escodegen.generate(node), escodegen.generate(parent) , node, parent);
                if( parent.type !== 'AssignmentExpression' && parent.type !== 'VariableDeclarator' ) {
                    node = Debugger.instrumentTreeNode(node,scope);
                }
                else if ( node === parent.right ) {
                    node = Debugger.instrumentTreeNode(node,scope); 
                }
                
                
                // if( parent.type !== 'Property' && node !== parent.key ){
                //     console.log(2);
                //     node = Debugger.instrumentTreeNode(node,scope);
                // }
            } 
            else if( node.type === 'ObjectExpression' ){
                node = Debugger.instrumentTreeNode(node,scope);8
            }
            else if( node.type === 'Identifier' && parent.type === 'AssignmentExpression' && scope.isDeclared(node.name) > -1 ){
                node = Debugger.instrumentTreeNode(node,scope);
            }
            else if( ['WhileStatement','ForStatement'].indexOf( node.type ) > -1 ){
                scope.loop -- ;
            }
            else if( node.type === 'CallExpression' && !( node.callee.type === 'MemberExpression' && node.callee.object.name === 'Debugger' ) ) {
                node = Debugger.instrumentTreeNode(node,scope);
            }
            

            return node;
        }
    });
    return fNode;
};

Debugger.mockFunction = function(fNode){
    var name = fNode.id.name;
    
    var cutFrom = Debugger.mockBody.toString().search('{');
    var mockBody = Debugger.mockBody.toString().substr(cutFrom);

    var mockBody = 'function '+name+'('
                 + fNode.params.map(function(param){ return param.name; }).join(',')
                 + ')'
                 + mockBody
                   .replace(/'%functionName%'/g, name )
                   .replace(/'%functionNameStr%'/g, "'" + name + "'")
                   .replace(/'%functionMockName%'/g, name + 'Implementation');

    var callBody = 'function '+name+'Implementation('
                 + fNode.params.map(function(param){ return param.name; })
                   .join(',')
                 + ')'
                 + escodegen.generate(fNode.body);

    return mockBody + callBody ;
};



Debugger.instrumentTreeNode = function(node,scope){
    var logObject = {
        type : node.type,
        start: { row: node.loc.start.line-1, col: node.loc.start.column },
        end: { row: node.loc.end.line-1, col: node.loc.end.column },
    };

    var isCallee = '';
    if( node.type === 'CallExpression' && node.callee.type !== 'MemberExpression' && Debugger.functionsName.indexOf(node.callee.name) > -1 ){
        logObject.callee = node.callee.name; 
    }

    var innerCode = escodegen.generate(node,{indent:false});
    var outerCode = 'Debugger.logValue('+innerCode+','+JSON.stringify(logObject)+',\''+scope.context+'\');';
    var newNode = esprima.parse(outerCode);
    return newNode.body[0].expression;
};

Debugger.logValue = function(value,logObject,context,isCallee){

    if( logObject.callee ){
        logObject.inputs = value.inputs;
        value  = value.output;
    }

    logObject.value = value;

    // add the log object to the logs of the current context
    if( !Debugger.logs.values[context] )
        Debugger.logs.values[context] = [];
    
    Debugger.logs.values[context].push( logObject );

    return value;
};

Debugger.getStub = function(name,inputs) {
    if( !this.functions[name].stubs )
        this.functions[name].stubs = {};

    var inputsKey = JSON.stringify(inputs);
    if( this.functions[name].stubs.hasOwnProperty(inputsKey) ){

        console.log('stub trovata!');
        return this.functions[name].stubs[inputsKey];
    }

        console.log('stub non trovata!');
    return -1;
}

Debugger.logCall = function(name,inputs,output){
    var logObject = {
        inputs : inputs,
        output : output,
        time : Date.now()
    };
    if( !Debugger.logs.calls[name] )
        Debugger.logs.calls[name] = {};

    var stubKey = JSON.stringify(inputs);
    console.log('logging call of ',name,inputs,output);
    Debugger.functions[name].stubs[stubKey] = {
        output: output
    };

    Debugger.logs.calls[name][stubKey] = logObject;
};

Debugger.mockBody = function(){
    var inputs  =  arguments;
    var output  = null;


    var stub    = Debugger.getStub( '%functionNameStr%', inputs );
    if( stub != -1 ){
        output = stub.output;
    } else {
        // try {
            output = '%functionMockName%'.apply( null, arguments );
        // } catch(e) {
        //     Debugger.log(-1,'There was an exception in the callee \'' + '%functionNameStr%' + '\': '+e.message);
        //     Debugger.log(-1,"Use the CALLEE STUBS panel to stub this function.");
        // }
    }

    // if( calleeNames.search( '%functionNameStr%' ) > -1 ){
        console.log(inputs);
        Debugger.logCall( '%functionNameStr%', inputs, output ) ;
    // }

    return { inputs: inputs, output: output };
}

function Scope(context,parent){
    this.context   = context;
    this.variables = [];
    this.parent    = parent || null;
    this.loop      = 0;
}

Scope.prototype = {
    isDeclared : function(varName){
        var scope = this;
        while( scope !== null ){
            if( scope.variables.indexOf(varName) > -1 )
                return true;
            scope = scope.parent;
        }
        return false;
    },
    declare: function(varName){
        this.variables.push(varName);
    }
};
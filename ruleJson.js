const allRule = [
    {
        "ruleDescription": "All Microtask commands must be handled by Command subclasses",
        "detail": "IF a method is a static method on Command\nTHEN it should implement its behavior by constructing a new Command subclass instance.\nThe Command class contains a number of static methods. Each method creates a specific type of Command by invoking the constructor of the corresponding subclass.",
        "tags": [
            "Microtask",
            "Command",
            "Sharding"
        ],
        "ruleType": {
            "constraint": "FOLDER",
            "checkFor": [
                "src/com/crowdcoding/commands"
            ],
            "type": "WITHIN"
        },
        "index": 1,
        "conditioned": {
            "detail": "Functions in \"Command\" classes (other than execute) must call a subclass constructor.",
            "command": "//src:unit/src:class/src:block/src:function[src:specifier/text()=\"public\" and src:name/text()!=\"execute\" and src:block/src:return/src:expr[src:operator/text()=\"new\" and src:call/src:name/text()=ancestor::src:class/src:block/src:class/src:name/text()]]"
        },
        "quantifier": {
            "detail": "Functions in \"Command\" classes (other than execute).",
            "command": "//src:unit/src:class/src:block/src:function[src:specifier/text()=\"public\" and src:name/text()!=\"execute\"]"
        }
    },
    {
        "ruleDescription": "Commands must implement execute",
        "detail": "IF a class is a subclass of Command\nTHEN it must implement execute.\nCommands represent an action that will be taken on an Artifact. In order for this action to be invoked, each subclass of Command must implement an execute method. This method should not be directly invoked by clients, but should be used by the Command execution engine.",
        "tags": [
            "Microtask",
            "Command",
            "Sharding"
        ],
        "ruleType": {
            "constraint": "FOLDER",
            "checkFor": [
                "src/com/crowdcoding/commands"
            ],
            "type": "WITHIN"
        },
        "index": 2,
        "conditioned": {
            "detail": "Subclasses in \"Command\" classes must have one \"execute\" function.",
            "command": "//src:unit/src:class/src:block/src:class[src:block/src:function[src:name/text()=\"execute\"]]"
        },
        "quantifier": {
            "detail": "Subclasses in \"Command\" classes.",
            "command": "//src:unit/src:class/src:block/src:class"
        }
    },
    {
        "ruleDescription": "Artifacts should be marked as a data region with an @Entity annotation",
        "detail": "IF an object is an artifact subclass\nTHEN it needs to be an entity.\nTo signal that instances of a class constitute a separate data region, the class should have the @Entity annotation. All Artifact subclasses should be marked as a data region.",
        "tags": [
            "Entity",
            "Sharding",
            "Persistence"
        ],
        "ruleType": {
            "constraint": "FOLDER",
            "checkFor": [
                "src/com/crowdcoding/entities/artifacts"
            ],
            "type": "WITHIN"
        },
        "index": 3,
        "conditioned": {
            "detail": "Subclasses of Artifacts that extends Artifact and has \"Subclass\" annotation",
            "command": "//src:unit/src:class[src:annotation[src:name/text()=\"Subclass\" and src:argument_list/src:argument/src:expr[src:name/text()=\"index\" and */text()=\"true\"]] and src:super/src:extends/src:name/text()=\"Artifact\"]"
        },
        "quantifier": {
            "detail": "Entity classes.",
            "command": "//src:unit/src:class[src:super/src:extends/src:name/text()=\"Artifact\"]"
        }
    },
    {
        "ruleDescription": "Microtasks must have a reference to the Artifact that it belongs to",
        "detail": "IF a class is a subclass of Microtask \nTHEN it needs a field representing the reference to the associated entity.\nEach Microtask represents work to be done on an Artifact. As such, it needs to be connected back to its owning artifact through a reference to the Artifact. Without the reference, they need to have an ID of the artifact and for submitting they need to load the data beforehand.",
        "tags": [
            "Entity", "Microtask", "Objectify", "Persistence"
        ],
        "ruleType": {
            "constraint": "FOLDER",
            "checkFor": [
                "src/com/crowdcoding/entities/microtasks"
            ],
            "type": "WITHIN"
        },
        "index": 4,
        "conditioned": {
            "detail": "Microtask classes that has a reference to a corresponding entity",
            "command": "//src:unit/src:class[count(src:block/src:decl_stmt)>0 and src:block/src:decl_stmt/src:decl[src:type/src:name/src:name/text()=\"Ref\" and src:annotation/src:name/text()=\"Parent\" and src:annotation/src:name/text()=\"Load\"]]"
        },
        "quantifier": {
            "detail": "Microtask classes.",
            "command": "//src:unit/src:class[src:name/text()!=\"Microtask\"]"
        }
    },
    {
        "ruleDescription": "Communication between artifacts should be indirected through a Command",
        "detail": "IF an Artifact needs to communicate with another artifact\nTHEN it should create a Command describing the desired action to be performed.\nEach Artifact exists in a separate shard, which may execute in parallel on a separate server. An artifact may communicate with another artifact by creating a Command which describes the action that it wishes the receiving Artifact to perform.",
        "tags": [
            "Sharding",
            "Command",
            "Entity",
            "Persistence"
        ],
        "ruleType": {
            "constraint": "FOLDER",
            "checkFor": [
                "src/com/crowdcoding/commands", "src/com/crowdcoding/entities"
            ],
            "type": "MIXED"
        },
        "index": 6,
        "conditioned": {
            "type": "RETURN_TO_BASE",
            "detail": "Calling constructors of allowed entity objects",
            "command1": "//src:unit/src:class/src:block/src:function_decl[src:name/text()=\"execute\"]/src:parameter_list/src:parameter/src:decl/src:type/src:name[not(text()=\"String\")]/text()",
            "command2": "//src:unit/src:class[src:name/text()=\"<TEMP>\" or (src:super/src:extends/src:name/text()=\"<TEMP>\")]/src:name/text()",
            "command3": "//src:unit/src:class[src:super/src:extends/src:name/text()=\"Command\"]/src:block/src:class/src:block/descendant-or-self::src:decl_stmt/src:decl[src:init/src:expr/src:call/src:name/text()=\"<TEMP>\"]"
        },
        "quantifier": {
            "type": "FIND_FROM_TEXT",
            "detail": "Calling constructors of all entity objects",
            "command1": "//src:unit/src:class[(src:annotation/src:name[text()=\"Entity\"] or src:annotation/src:name[text()=\"Subclass\"])]/src:name/text()",
            "command2": "//src:unit/src:class[src:super/src:extends/src:name/text()=\"Command\"]/src:block/src:class/src:block/descendant-or-self::src:decl_stmt/src:decl[src:init/src:expr/src:call/src:name/text()=\"<TEMP>\"]"
        }
    },
    {
        "ruleDescription": "Creating an Artifact should be indirected through a Command",
        "detail": "IF a new Artifact is to be created\nTHEN its constructor should be invoked only by its corresponding Command class.\nArtifacts constitute a separate data region, which should not directly communicate between each other. Instead, all communication should be indirected through a Command. A command represents a request for an action to be taken on an Artifact. To create a new instance of an Artifact, a Create command for the Artifact should be used.\nThere is one exception for this rule: 'DescribeFunctionBehavior'. Violations for this object can be ignored.",
        "tags": [
            "Sharding",
            "Command",
            "Entity"
        ],
        "ruleType": {
            "constraint": "FOLDER",
            "checkFor": [
                "src/com/crowdcoding"
            ],
            "type": "MIXED"
        },
        "index": 7,
        "conditioned": {
            "type": "FIND_FROM_TEXT",
            "detail": "Instantiating of entity objects in \"Command\" classes",
            "command1": "//src:unit/src:class[(src:annotation/src:name[text()=\"Entity\"] or src:annotation/src:name[text()=\"Subclass\"])]/src:name/text()",
            "command2": "//src:unit/src:class[src:super/src:extends/src:name/text()=\"Command\"]/src:block/descendant-or-self::src:decl_stmt/src:decl[src:init/src:expr/src:call/src:name/text()=\"<TEMP>\"]"
        },
        "quantifier": {
            "type": "FIND_FROM_TEXT",
            "detail": "Instantiating of all entity objects",
            "command1": "//src:unit/src:class[(src:annotation/src:name[text()=\"Entity\"] or src:annotation/src:name[text()=\"Subclass\"])]/src:name/text()",
            "command2": "//src:unit/src:class/src:block/descendant-or-self::src:decl_stmt/src:decl[src:init/src:expr/src:call/src:name/text()=\"<TEMP>\"]"
        }
    },
    {
        "ruleDescription": "Objects to be sent to an external service should have a corresponding DTO that needs to be transferred has a DTO, i.e. ObjectMapper should not be in Entity.",
        "detail": "IF an object is to be serialized to JSON for transfer to an external service \nTHEN this should only be done for its corresponding DTO.\nData should never be directly serialized to JSON. Instead, a DTO should be created for the data to be sent to the external service, which will then be serialized to JSON.",
        "tags": [
            "Serialization", "Entity", "Data Transfer Objects"
        ],
        "ruleType": {
            "constraint": "FOLDER",
            "checkFor": [
                "src/com/crowdcoding"
            ],
            "type": "WITHIN"
        },
        "index": 8,
        "conditioned": {
            "detail": "ObjectMapper calls not in Entity classes.",
            "command": "//src:unit/src:class[not(src:annotation/src:name[text()=\"Entity\"] or src:annotation/src:name[text()=\"Subclass\"])]/src:block/descendant-or-self::src:decl_stmt/src:decl[src:type/src:name/text()=\"ObjectMapper\"]"
        },
        "quantifier": {
            "detail": "ObjectMapper calls.",
            "command": "//src:unit/src:class/src:block/descendant-or-self::src:decl_stmt/src:decl[src:type/src:name/text()=\"ObjectMapper\"]"
        }
    },
    {
        "ruleDescription": "DTOs must have a zero-argument constructor",
        "detail": "IF a class is a DTO object \nTHEN it needs to have a zero-argument constructor with an empty body.\nThe Jackson JSON library automatically constructs an instance of DTO objects, using reflection. To do so, it requires there to be a no-arg constructor that does nothing.",
        "tags": [
            "Serialization", "Data Transfer Objects"
        ],
        "ruleType": {
            "constraint": "FOLDER",
            "checkFor": [
                "src/com/crowdcoding/dto"
            ],
            "type": "WITHIN"
        },
        "index": 9,
        "conditioned": {
            "detail": "DTO classes with no-arg constructor",
            "command": "//src:unit/src:class[src:super/src:extends/src:name/text()=\"DTO\" and src:block/src:constructor[count(src:parameter_list/src:parameter)=0]]"
        },
        "quantifier": {
            "detail": "DTO classes.",
            "command": "//src:unit/src:class[src:super/src:extends/src:name/text()=\"DTO\"]"
        }
    },
    {
        "ruleDescription": "Save() calls should always be committed immediately",
        "detail": "IF the save method is called \nTHEN the now() method must be followed immediately.\nInvoking the save() method marks an entity to storage to the datastore by Objectify. However, this data is not yet committed and any subsequent calls to load() will still receive a stale pre-save version of the data. In order to ensure that all loads() receive the newest version of the data, every call to save() should be immediately followed by a call to now(), which commits the new version to the datastore immediately.",
        "tags": [
            "Objectify", "Persistence"
        ],
        "ruleType": {
            "constraint": "FOLDER",
            "checkFor": [
                "src/com/crowdcoding/entities"
            ],
            "type": "WITHIN"
        },
        "index": 10,
        "conditioned": {
            "detail": "ofy().save().now() calls",
            "command": "//src:unit/src:class/src:block/descendant-or-self::src:expr_stmt/src:expr[src:call[src:name/text()=\"ofy\"] and src:call[src:name/text()=\"save\"] and src:call[src:name/text()=\"now\"]]"
        },
        "quantifier": {
            "detail": "ofy().save() calls",
            "command": "//src:unit/src:class/src:block/descendant-or-self::src:expr_stmt/src:expr[src:call[src:name/text()=\"ofy\"] and src:call[src:name/text()=\"save\"]]"
        }
    },
    {
        "ruleDescription": "@Entity classes must be registered in the CrowdServlet class",
        "detail": "IF a class is an Entity class or subclass \nTHEN it must be registered in 'CrowdServlet' class by ObjectifyService.\nAll entities needs to be registered with Objectify, so that Objectify knows to persist them. The registration must be done in 'CrowdServlet.java'",
        "tags": [
            "Entity", "Objectify", "Persistence"
        ],
        "ruleType": {
            "constraint": "FOLDER",
            "checkFor": [
                "src/com/crowdcoding/entities",
                "src/com/crowdcoding/servlets"
            ],
            "type": "MIXED"
        },
        "index": 11,
        "conditioned": {
            "type": "FIND_FROM_TEXT",
            "detail": "Registered classes",
            "command1": "//src:unit/src:class[src:name/text()=\"CrowdServlet\"]//src:expr_stmt/src:expr/src:call[src:name/src:name/text()=\"ObjectifyService\" and src:name/src:name/text()=\"register\"]/src:argument_list/src:argument/src:expr/src:name/src:name[1]/text()",
            "command2": "//src:unit/src:class[src:name/text()=\"<TEMP>\"]"
        },
        "quantifier": {
            "detail": "Entity classes",
            "command": "//src:unit/src:class[(src:annotation/src:name[text()=\"Entity\"] or src:annotation/src:name[text()=\"Subclass\"])]"
        }
    },
    {
        "ruleDescription": "@Entity classes must have an @id field",
        "detail": "IF a class has an @Entity annotation \nTHEN it must have a field annotated with @Id. \nIn order for Objectify to differentiate instances of a class, it must have a primary key. This key is indicated by a field with the @id annotation.",
        "tags": [
            "Entity", "Objectify", "Persistence"
        ],
        "ruleType": {
            "constraint": "FOLDER",
            "checkFor": [
                "src/com/crowdcoding/entities"
            ],
            "type": "WITHIN"
        },
        "index": 12,
        "conditioned": {
            "detail": "Entity classes with @Id",
            "command": "//src:unit/src:class[src:annotation[src:name/text()=\"Entity\"] and src:block/src:decl_stmt/src:decl[src:annotation/src:name/text()=\"Id\"]]"
        },
        "quantifier": {
            "detail": "Entity classes",
            "command": "//src:unit/src:class[src:annotation[src:name/text()=\"Entity\"]]"
        }
    },
    {
        "ruleDescription": "Subclasses of @Entity classes must be indexed",
        "detail": "IF a class is a subclass of an @Entity class \nTHEN it needs to be indexed ('index=true').\nTo enable fast queries when loading elements from the datastore, all subclasses of @Entity classes must be indexed.",
        "tags": [
            "Entity", "Objectify", "Persistence"
        ],
        "ruleType": {
            "constraint": "FOLDER",
            "checkFor": [
                "src/com/crowdcoding/entities"
            ],
            "type": "WITHIN"
        },
        "index": 13,
        "conditioned": {
            "detail": "indexed Entity classes",
            "command": "//src:unit/src:class[src:annotation[src:name/text()=\"Subclass\" and src:argument_list/src:argument/src:expr[src:name/text()=\"index\" and */text()=\"true\"]]]"
        },
        "quantifier": {
            "detail": "Entity subclasses",
            "command": "//src:unit/src:class[src:annotation[src:name/text()=\"Subclass\"]]"
        }
    },
    {
        "ruleDescription": "@Entity classes must have a zero-argument constructor",
        "detail": "IF a class is an entity \nTHEN it needs to have a zero-argument constructor.\n@Entity classes are loaded and deserialized from their saved data in the datastore by Objectify. In order for Objectify to successfully do this, it expects that @Entity classes will have a no-arg constructor.",
        "tags": [
            "Entity", "Persistence"
        ],
        "ruleType": {
            "constraint": "FOLDER",
            "checkFor": [
                "src/com/crowdcoding/entities"
            ],
            "type": "WITHIN"
        },
        "index": 14,
        "conditioned": {
            "detail": "Entity classes with zero-arg constructors",
            "command": "//src:unit/src:class[(src:annotation[src:name/text()=\"Entity\"] or src:annotation[src:name/text()=\"Subclass\"]) and src:block/src:constructor[count(src:parameter_list/src:parameter)=0]]"
        },
        "quantifier": {
            "detail": "Entity classes and subclasses",
            "command": "//src:unit/src:class[(src:annotation[src:name/text()=\"Entity\"] or src:annotation[src:name/text()=\"Subclass\"])]"
        }
    },
    {
        "ruleDescription": "Commands should not be publicly visible",
        "detail": "IF a class is a subclass of Command\nTHEN it should not be public.\nThe Command class acts as factory, containing static methods that instantiate individual Command subclasses. External clients should interact with the Command class rather than the Command subclasses.\n",
        "tags": [
            "Command", "Sharding"
        ],
        "ruleType": {
            "constraint": "FOLDER",
            "checkFor": [
                "src/com/crowdcoding/commands"
            ],
            "type": "WITHIN"
        },
        "index": 16,
        "conditioned": {
            "detail": "command subclasses that are not public",
            "command": "//src:unit/src:class[src:super/src:extends/src:name/text()=\"Command\"]/src:block/src:class[src:specifier/text()!=\"public\"]"
        },
        "quantifier": {
            "detail": "command subclasses",
            "command": "//src:unit/src:class[src:super/src:extends/src:name/text()=\"Command\"]/src:block/src:class"
        }
    },
    {
        "ruleDescription": "Commands should persist all data they are given",
        "detail": "IF a constructor is for a subclass of Command\nTHEN it should store each parameter given.\nCommands record some future action to perform. To do so, their constructor takes various parameters that will eventually be used when the Command is executed. To record this data, all parameters should be stored as fields.\n",
        "tags": [
            "Command", "Sharding"
        ],
        "ruleType": {
            "constraint": "FOLDER",
            "checkFor": [
                "src/com/crowdcoding/commands"
            ],
            "type": "WITHIN"
        },
        "index": 17,
        "conditioned": {
            "detail": "command subclasses fields",
            "command": "//src:unit/src:class[src:super/src:extends/src:name/text()=\"Command\"]/src:block/src:class[src:block/src:constructor/src:parameter_list[count(src:parameter)=0 or src:parameter/src:decl/src:name[text()=ancestor::src:constructor/src:block/src:expr_stmt/src:expr/src:call[src:name/text()=\"super\"]/src:argument_list/src:argument/src:expr/descendant-or-self::src:name/text() or text()=ancestor::src:class/src:block/src:decl_stmt/src:decl/src:name/text()]]]"
        },
        "quantifier": {
            "detail": "command subclasses constructor parameters",
            "command": "//src:unit/src:class[src:super/src:extends/src:name/text()=\"Command\"]/src:block/src:class[src:block/src:constructor/src:parameter_list[count(src:parameter)=0 or src:parameter/src:decl/src:name[text()=ancestor::src:constructor/src:block/src:expr_stmt/src:expr/src:call[src:name/text()=\"super\"]/src:argument_list/src:argument/src:expr/descendant-or-self::src:name/text() or text()=ancestor::src:constructor/src:block/descendant-or-self::src:expr_stmt/src:expr/src:name/text()]]]"
        }
    }
];

const tagJson = [
    {
        "detail": "rules about Microtasks",
        "tagName": "Microtask"
    },
    {
        "detail": "rules about \"Command\" classes and their subclasses, methods and method calls.",
        "tagName": "Command"
    },
    {
        "tagName": "Sharding",
        "detail": "All non-transient application state is sharded. Sharding is the process of decomposing application state into data groups, which may each be distributed to different servers. By ensuring that each server only accesses data in a single shard, each shard may support computation on different servers in parallel. Shards are indicated by an @Entity annotation, which designates that an instance of the class (and all objects referenced by its member fields) are a shard."
    },
    {
        "detail": "rules about entity classes and subclasses, i.e. those classes annotated with \"Entity\" and \"Subclass\". Entity objects are persisted by \"Objectify\" \nAn Artifact represents an element that users are creating. \nrules about artifact classes. These classes are entities and are persisted by \"Objectify\"",
        "tagName": "Entity"
    },
    {
        "detail": "rules about Objectify and Objectify method calls which are needed for persisting data",
        "tagName": "Objectify"
    },
    {
        "detail": "rules about serialization required for persisting data\nrules about Data Transfer Object\nWe need some subset of the state of the class that is important and needed to be persisted. \nSome other parts of the state is a volatile state or not important and can be reconstructed. \nWhen part of a class is persisted (in Firebase) or transferred to a client.",
        "tagName": "Serialization"
    },
    {
        "tagName": "Persistence",
        "detail": "All in-memory data is discarded at the end of every http request. As a result, for application state to be non-transient, it must be persisted. This persistence is done using the Objectify framework, which wraps the underlying calls to store the data using the Google AppEngine Datastore."
    },
    {
        "tagName": "Data Transfer Objects",
        "detail": "A Data Transfer Object (DTO) is an object designed to send data to an external service. As such, it is not intended to have mutable state or operations on this state and simply exists to record the state in the format that the external service expects. DTOs are used to send data to and from the client and to send data to the Firebase service. Serialization is handled through the Jackson JSON library."
    }
];
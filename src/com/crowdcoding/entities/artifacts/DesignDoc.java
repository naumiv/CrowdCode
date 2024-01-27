package com.crowdcoding.entities.artifacts;

import com.crowdcoding.history.ArtifactCreated;
import com.crowdcoding.history.HistoryLog;
import com.crowdcoding.history.PropertyChange;
import com.crowdcoding.util.FirebaseService;
import com.googlecode.objectify.Ref;
import com.googlecode.objectify.annotation.Subclass;

import com.crowdcoding.dto.firebase.artifacts.DesignDocInFirebase;

import static com.googlecode.objectify.ObjectifyService.ofy;

@Subclass(index=true)
public class DesignDoc extends Artifact {

    private String title;
    private String description;


    /******************************************************************************************
     * Constructor
     *****************************************************************************************/

    // Constructor for deserialization
    protected DesignDoc()
    {
    }

    public DesignDoc(String title, String description, boolean isApiArtifact, boolean isReadOnly,String projectId)
    {
        super(isApiArtifact, isReadOnly, projectId);
        this.title		 = title;
        this.description = description;

        ofy().save().entity(this);

        storeToFirebase();

        HistoryLog.Init(projectId).addEvent(new ArtifactCreated( this ));
    }

    /******************************************************************************************
     * Accessors
     *****************************************************************************************/

    public String getName() {
        return title;
    }

    public String getDescription() {
        return description;
    }


    /******************************************************************************************
     * Firebase methods
     *****************************************************************************************/

    public void storeToFirebase()
    {
        int firebaseVersion = version + 1;

        FirebaseService.writeDesignDoc(new DesignDocInFirebase(
                        this.id,
                        firebaseVersion,
                        title,
                        description,
                        isReadOnly,
                        isAPIArtifact,
                        isDeleted),
                this.id,
                firebaseVersion,
                projectId);

        incrementVersion();
    }

    /******************************************************************************************
     * Objectify Datastore methods
     *****************************************************************************************/

    // Given a ref to a function that has not been loaded from the datastore,
    // load it and get the object
    public static DesignDoc load(Ref<DesignDoc> ref)
    {
        return ofy().load().ref(ref).now();
    }

    // Given an id for a test, finds the corresponding test. Returns null if no such test exists.
    public static DesignDoc find(long id)
    {
        return (DesignDoc) ofy().load().key(Artifact.getKey(id)).now();
    }
}
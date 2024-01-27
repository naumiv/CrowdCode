package com.crowdcoding.dto.firebase.artifacts;

import com.crowdcoding.dto.DTO;

public class DesignDocInFirebase extends DTO {

    public String messageType = "DesignDocInFirebase";
    public long id;
    public int version;
    public String title;
    public String description;
    public boolean isReadOnly;
    public boolean isApiArtifact;
    public boolean isDeleted;


    // Default constructor
    public DesignDocInFirebase()
    {
    }
    public DesignDocInFirebase(long id, int version, String title, String description,
                               boolean isReadOnly, boolean isApiArtifact, boolean isDeleted )
    {
        this.id			  = id ;
        this.title 		  = title;
        this.description  = description;

        this.version	   = version;
        this.isReadOnly    = isReadOnly;
        this.isApiArtifact = isApiArtifact;
        this.isDeleted	   = isDeleted;

    }
}
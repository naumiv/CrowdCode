package com.crowdcoding.dto.firebase.notification;

public class ChallengeNotificationInFirebase extends NotificationInFirebase
{
	public String microtaskId;
	public String microtaskType;
	public String artifactName;

	// Default constructor (required by Jackson JSON library)
	public ChallengeNotificationInFirebase()
	{
	}

	public ChallengeNotificationInFirebase(String type, String microtaskId, String microtaskType, String artifactName)
	{
		super(type);
		this.microtaskId 	= microtaskId;
		this.microtaskType	= microtaskType;
		this.artifactName 	= artifactName;
	}
}

package com.crowdcoding.dto.firebase.notification;


import com.crowdcoding.dto.DTO;

public class NotificationInFirebase extends DTO
{
	public String type;
	public long time;

	// Default constructor (required by Jackson JSON library)
	public NotificationInFirebase()
	{
	}

	public NotificationInFirebase(String type)

	{
		this.type			= type;
		this.time 			= System.currentTimeMillis();
	}
}

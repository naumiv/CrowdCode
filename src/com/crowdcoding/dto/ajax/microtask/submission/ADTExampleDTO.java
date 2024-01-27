package com.crowdcoding.dto.ajax.microtask.submission;


import com.crowdcoding.dto.DTO;

public class ADTExampleDTO extends DTO
{
	public String name;
	public String value;

	// Default constructor
	public ADTExampleDTO()
	{
	}
	public ADTExampleDTO( String name, String value){
		this.name = name;
		this.value = value;
	}

}

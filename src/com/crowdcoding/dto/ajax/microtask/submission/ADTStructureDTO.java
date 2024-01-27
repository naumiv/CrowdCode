package com.crowdcoding.dto.ajax.microtask.submission;


import com.crowdcoding.dto.DTO;


public class ADTStructureDTO extends DTO
{
	public String name;
	public String type;

	// Default constructor
	public ADTStructureDTO()
	{
	}
	public ADTStructureDTO( String name, String type){
		this.name = name;
		this.type = type;
	}

}

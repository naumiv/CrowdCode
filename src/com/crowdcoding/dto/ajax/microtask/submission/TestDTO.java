package com.crowdcoding.dto.ajax.microtask.submission;

import java.util.ArrayList;
import java.util.List;

import com.crowdcoding.dto.DTO;


public class TestDTO extends DTO
{
	public long id;				// id of the corresponding test. Only valid if added is false.
	public String description;
	public boolean deleted;
	public boolean added;
	public boolean edited;
	public boolean isSimple; 
	public String code;
	public List<String> inputs = new ArrayList<String>();
	public String output;

	// Default constructor
	public TestDTO()
	{
	}

}

package com.crowdcoding.dto.ajax.questions;

import com.crowdcoding.dto.DTO;

public class AnswerDTO extends DTO
{
	public String messageType = "AnswerDTO";
	public long questionId;
	public String text;

	// Default constructor (required by Jackson JSON library)
	public AnswerDTO()
	{
	}
}

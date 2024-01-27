package com.crowdcoding.dto.ajax.questions;

import com.crowdcoding.dto.DTO;

public class CommentDTO extends DTO
{
	public String messageType = "CommentDTO";
	public long questionId;
	public long answerId;
	public String text;

	// Default constructor (required by Jackson JSON library)
	public CommentDTO()
	{
	}
}

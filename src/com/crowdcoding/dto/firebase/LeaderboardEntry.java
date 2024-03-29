package com.crowdcoding.dto.firebase;

import com.crowdcoding.dto.DTO;
import com.fasterxml.jackson.annotation.JsonProperty;


/*
 * Represents a single worker's score on the leaderboard in a format appropriate for Firebase.
 */
public class LeaderboardEntry extends DTO
{
	public int score;
	public String name;
	@JsonProperty(".priority") public double priority;  // Special Firebase property establishing order

	// Default constructor for derserialization
	@SuppressWarnings("unused")
	private LeaderboardEntry()
	{
	}

	// Initialization constructor
	public LeaderboardEntry(int score, String name)
	{
		this.score = score;
		this.name = name;
		// Store the priority as the negative of score, so that scores are ordered from highest to lowest
		// in Firebase.
		this.priority = (-1.0) * score;
	}
}

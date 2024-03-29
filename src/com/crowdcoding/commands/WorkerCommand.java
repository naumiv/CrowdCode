package com.crowdcoding.commands;

import static com.googlecode.objectify.ObjectifyService.ofy;

import com.crowdcoding.entities.Achievement;
import com.crowdcoding.entities.Project;
import com.crowdcoding.entities.Worker;
import com.crowdcoding.servlets.ThreadContext;

public abstract class WorkerCommand extends Command
{
	protected String workerID;

	
	public static WorkerCommand awardPoints(String workerID, int points)
	{ return new AwardPoints(workerID, points); }
	
	public static WorkerCommand addAchievement(Achievement achievement, String workerID)
	{ return new AddAchievement(achievement, workerID); }
	

	public static WorkerCommand increaseStat(String workerID,String label, int increaseAmount)
	{ return new IncreaseStat(workerID, label, increaseAmount); }


	private WorkerCommand(String workerID)
	{
		this.workerID = workerID;
		queueCommand(this);
	}

	// All constructors for WorkerCommand MUST call queueCommand by calling the super constructor
	private static void queueCommand(Command command)
	{
		ThreadContext threadContext = ThreadContext.get();
        threadContext.addCommand(command);
		// CommandContext.ctx.addCommand(command);
	}
	public void execute(String projectId)
	{
		final Project project = Project.Create(projectId);
		final Worker worker = find(workerID, project);
	       	if (worker == null)
	    			System.out.println("errore Cannot execute WorkerCommand. Could not find the worker for WorkerID "
	    						+ workerID+" ("+this.getClass()+")");
	    		else
	    		{
	    			execute(worker, project);
	    		}
	}

	public abstract void execute(Worker worker, Project project);

	// Finds the specified worker. Returns null if no such worker exists.
	// Preconditions:
	//                userid != null
	protected Worker find(String userid, Project project)
	{
		return ofy().load().key(Worker.getKey(project.getKey(), userid)).now();
	}

	protected static class AwardPoints extends WorkerCommand
	{
		private int points;

		public AwardPoints(String workerID, int points)
		{
			super(workerID);
			this.points = points;
		}

		public void execute(Worker worker, Project project)
		{

			worker.awardPoints(points, project.getID());
		}

	}

	protected static class IncreaseStat extends WorkerCommand
	{
		private String label;
		private int increaseAmount;

		public IncreaseStat(String workerID, String label,int increaseAmount)
		{
			super(workerID);
			this.label = label;
			this.increaseAmount = increaseAmount;
		}

		public void execute(Worker worker, Project project)
		{

			worker.increaseStat(label,increaseAmount, project.getID());
			//AchievementManager.getInstance().checkNewAchievement(worker.getUserid(), project.getID(), worker.getHistory());
		}

	}
	
	protected static class AddAchievement extends WorkerCommand
	{
		private Achievement _achievement;

		public AddAchievement(Achievement achievement, String workerID)
		{
			super(workerID);
			this._achievement = achievement;
		}

		public void execute(Worker worker, Project project)
		{

			worker.addAchievement(_achievement, project.getID());
		}

	}
}

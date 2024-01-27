package com.crowdcoding.util;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.NoSuchElementException;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.locks.ReentrantReadWriteLock.WriteLock;
import java.util.logging.Logger;

import com.crowdcoding.commands.Command;
import com.crowdcoding.dto.ajax.microtask.submission.ReviewDTO;
import com.crowdcoding.dto.firebase.*;
import com.crowdcoding.dto.firebase.artifacts.*;
import com.crowdcoding.dto.firebase.microtasks.*;
import com.crowdcoding.dto.firebase.notification.NotificationInFirebase;
import com.crowdcoding.dto.firebase.questions.*;
import com.crowdcoding.history.HistoryEvent;
import com.crowdcoding.servlets.ThreadContext;
import com.google.appengine.api.urlfetch.HTTPMethod;
import com.google.appengine.api.urlfetch.HTTPRequest;
import com.google.appengine.api.urlfetch.HTTPResponse;
import com.google.appengine.api.urlfetch.URLFetchService;
import com.google.appengine.api.urlfetch.URLFetchServiceFactory;
import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;


/* Wrapper service that handles all interactions with Firebase, providing an API
 * for interacting with Firebase that hides all its implementation details.
 */
public class FirebaseService
{

	// Writes the specified data using the URL, relative to the BaseURL.
	// Operation specifies the type of http request to make (e.g., PUT, POST, DELETE)
	private static void writeData(String data, String relativeURL, HTTPMethod operation, String projectId)
	{
		writeDataAbsolute(data, getBaseURL(projectId) + relativeURL, operation);
	}

	// Writes the specified data using specified absolute URL asyncrhonously (does not block waiting on write).
	// Operation specifies the type of http request to make (e.g., PUT, POST, DELETE)
	private static void writeDataAbsolute(String data, String absoluteURL, HTTPMethod operation)
	{
		try
		{
			URLFetchService fetchService = URLFetchServiceFactory.getURLFetchService();
			HTTPRequest     request      = new HTTPRequest(new URL(absoluteURL), operation);
			request.setPayload(data.getBytes());
//			Future<HTTPResponse> fetchAsync = fetchService.fetchAsync(request);
			HTTPResponse    response     = fetchService.fetch(request);

			if( response.getResponseCode() != 200){
				Logger.getLogger("LOGGER").severe("FIREBASE WRITE FAILED: "+response.getResponseCode()+" - "+absoluteURL+" - "+data);
			}
		}
		catch (MalformedURLException e) {
			System.out.println("Malformed url: "+e);
		} catch (IOException e) {
			System.out.println("IOException url: "+e);
		}
	}

	// Reads a JSON string from the specified absolute URL synchronously (blocks waiting on read to return).
	// Uses the GET operation to read the data.
	public static String readDataAbsolute(String absoluteURL) // change to public
	{
		try
		{
			URLFetchService fetchService = URLFetchServiceFactory.getURLFetchService();
			HTTPRequest request = new HTTPRequest(new URL(absoluteURL), HTTPMethod.GET);
			HTTPResponse response = fetchService.fetch(request);
			byte[] payload = response.getContent();
			if (payload != null)
				return new String(payload);
		}
		catch (MalformedURLException e) {
			// ...
		}
		catch (IOException e) {
			// ...
		}

		return "";
	}

	// Gets the base URL for the current deployment project
	private static String getBaseURL(String projectId)
	{
		return "https://crowdcode2.firebaseio.com/projects/" + projectId;
	}



	public static void enqueueWrite(String data, String relativeURL, HTTPMethod operation, String projectId){

		ThreadContext threadContext = ThreadContext.get();
		threadContext.addfirebaseWrite(new FirebaseWrite(data,relativeURL,operation,projectId));
	}

	public static void publish(){

		ConcurrentLinkedQueue<FirebaseWrite> firebaseWriteList = ThreadContext.get().getFirebaseWritesList();
		Iterator<FirebaseWrite> writeIterator = firebaseWriteList.iterator();
		while(writeIterator.hasNext()) {
			FirebaseWrite write = writeIterator.next();

			if( write != null ){
				write.publish();
				writeIterator.remove();
			}
		}
	}

	public static class FirebaseWrite
	{
		private String     data;
		private String     relativeURL;
		private HTTPMethod operation;
		private String     projectId;

		public FirebaseWrite(String data, String relativeURL, HTTPMethod operation, String projectId){
			this.data = data;
			this.relativeURL = relativeURL;
			this.operation = operation;
			this.projectId = projectId;
		}

		public void publish(){
			FirebaseService.writeData(data, relativeURL, operation, projectId);
		}
	}



	// Writes the specified microtask to firebase
	public static void writeMicrotaskCreated(MicrotaskInFirebase dto, String microtaskKey, String projectId)
	{
		enqueueWrite(dto.json(), "/microtasks/" + microtaskKey + ".json", HTTPMethod.PATCH, projectId);

	}
	// Writes the specified microtask to firebase
	public static void writeMicrotaskSubmission(String submissionDto, String microtaskKey, String projectId)
	{
		enqueueWrite("{\"submission\": " + submissionDto + "}", "/microtasks/" + microtaskKey + ".json", HTTPMethod.PATCH, projectId);

	}

	// Writes information about microtask assignment to Firebase
	public static void writeMicrotaskAssigned( String microtaskKey,
											   String workerId, String projectId, boolean assigned)
	{
		enqueueWrite("{\"assigned\": "+Boolean.toString(assigned)+", \"workerId\": \"" + workerId + "\"}", "/microtasks/" + microtaskKey + ".json", HTTPMethod.PATCH, projectId);
	}


	// Writes information about excluded workers to Firebase
	public static void writeMicrotaskExcludedWorkers( String microtaskKey,
													  String projectId, String workerIDs)
	{
		enqueueWrite("{\"excluded\": \"" +workerIDs+ "\"}", "/microtasks/" + microtaskKey + ".json", HTTPMethod.PATCH, projectId);
	}



	// Show if microtask is waiting for review
	public static void writeMicrotaskWaitingReview( String microtaskKey,
													String workerId, String projectId, boolean waiting)
	{
		enqueueWrite("{\"waitingReview\": " + waiting + "}", "/microtasks/" + microtaskKey + "/.json", HTTPMethod.PATCH, projectId);
	}


	// Writes information about microtask completition to Firebase
	public static void writeMicrotaskCompleted( String microtaskKey, String workerID, String projectId, boolean completed){
		enqueueWrite("{\"completed\": " + completed + "}", "/microtasks/" + microtaskKey + "/.json", HTTPMethod.PATCH, projectId);
		writeMicrotaskWaitingReview(microtaskKey,workerID, projectId, false);
	}
	// Writes information about microtask completition to Firebase
	public static void writeMicrotaskDeleted( String microtaskKey, String projectId){
		enqueueWrite("{\"deleted\": \"true\"}", "/microtasks/" + microtaskKey + "/.json", HTTPMethod.PATCH, projectId);
	}

	// Writes information about an old microtask to retrieve the information to Firebase
	public static void writeMicrotaskReissuedFrom( String microtaskKey, ReissueInFirebase reiussueInFirebase, String reissuedSubmission, String projectId)
	{

		enqueueWrite("{\"reissuedSubmission\": " + reissuedSubmission + "}", "/microtasks/" + microtaskKey+ ".json", HTTPMethod.PATCH, projectId);
		enqueueWrite(reiussueInFirebase.json(), "/microtasks/" + microtaskKey+ ".json", HTTPMethod.PATCH, projectId);
	}

	public static void writeMicrotaskCanceled( String microtaskKey, boolean canceled, String projectId)
	{
		enqueueWrite( "{\"canceled\": \"" + canceled + "\"}", "/microtasks/" + microtaskKey + ".json", HTTPMethod.PATCH, projectId);
	}

	public static void writeTestJobQueue(long functionID, int functionVersion, int testSuiteVersion, String projectId)
	{
		System.out.println("ASKING FOR TEST RUN for function "+functionID);
		enqueueWrite("{\"functionId\": " + functionID + ", \"functionVersion\" : \"" +functionVersion +"\", \"testSuiteVersion\" : \"" +testSuiteVersion +"\", \"bounceCounter\" : \"0\"}", "/status/testJobQueue/"+functionID+".json", HTTPMethod.PUT, projectId);
	}


	public static String getAllCode(String projectId)
	{
		String absoluteUrl = getBaseURL( projectId ) + "/code.json";
		String result = readDataAbsolute( absoluteUrl );

		// check if exist the reference on firebase, if not returns false
		if ( result == null || result.equals("null") )
			return "";
		else{
			result= result.substring(1, result.length()-1);
			result= result.replaceAll("\\\\\"", "\"");
			result= result.replaceAll("debug\\.log", "console.log");
			result= result.replaceAll("\\\\n", "\n");
			result= result.replaceAll("\\\\t", "\t");
			return result;
		}
	}
	public static boolean isWorkerLoggedIn(String workerID,String projectId){
		String absoluteUrl = getBaseURL(projectId) + "/status/loggedInWorkers/" + workerID + ".json";
		String result = readDataAbsolute( absoluteUrl );
		// check if exist the reference on firebase, if not returns false
		if ( result == null || result.equals("null") )
			return false;

		//try to convert the object into json format
		try {
			JSONObject user  = new JSONObject(result);
			long lastUpdateLogin = user.getLong("time");
			// the user on client side will update the login time every 30 seconds,
			// so if has passed more than 30 seconds since the last update means that the user is logged out
			if( ( System.currentTimeMillis() - lastUpdateLogin ) < 30*1000)
				return true;
			else
				return false;

		} catch (JSONException e) {

			e.printStackTrace();
		}

		return false;
	}


	public static void writeWorkerLoggedIn(String workerID, String workerDisplayName, String projectId){
		enqueueWrite("{\"workerHandle\": \"" + workerDisplayName + "\"}", "/status/loggedInWorkers/" + workerID + ".json", HTTPMethod.PUT, projectId);
	}

	public static void writeWorkerLoggedOut(String workerID, String projectId){
		enqueueWrite("", "/status/loggedInWorkers/" + workerID + ".json", HTTPMethod.DELETE, projectId);
	}

	public static void writeMicrotaskQueue(QueueInFirebase dto, String projectId){
		enqueueWrite(dto.json(), "/status/microtaskQueue.json", HTTPMethod.PUT, projectId);
	}

	public static void writeReviewQueue(QueueInFirebase dto, String projectId){
		enqueueWrite(dto.json(), "/status/reviewQueue.json", HTTPMethod.PUT, projectId);
	}

	public static void incrementTestSuiteVersion(long functionID, int testSuiteVersion, String projectId){
		enqueueWrite("{\"testSuiteVersion\" : \"" + testSuiteVersion +"\"}" , "/artifacts/functions/" + functionID + ".json", HTTPMethod.PATCH, projectId);
	}

	// Stores the specified function to Firebase
	public static void writeFunction(FunctionInFirebase dto, long functionID, int version, String projectId){
		enqueueWrite(dto.json(), "/artifacts/functions/" + functionID + ".json", HTTPMethod.PATCH, projectId);
		enqueueWrite(dto.json(), "/history/artifacts/functions/" + functionID + "/" + version + ".json", HTTPMethod.PUT, projectId);
	}


	// Stores the specified test to Firebase
	public static void writeAdvancedTest(AdvancedTestInFirebase dto, long functionId, long testID, int version, String projectId){
		enqueueWrite(dto.json(), "/artifacts/functions/"+functionId+"/tests/" + testID + ".json", HTTPMethod.PUT, projectId);
		enqueueWrite(dto.json(), "/history/artifacts/tests/" + testID + "/" + version + ".json", HTTPMethod.PUT, projectId);
	}

	// Stores the specified Stub to Firebase
	public static void writeSimpleTest(SimpleTestInFirebase dto, long functionId, long stubId, int version, String projectId){
		enqueueWrite(dto.json(), "/artifacts/functions/" + functionId + "/tests/" + stubId + ".json", HTTPMethod.PUT, projectId);
		enqueueWrite(dto.json(), "/history/artifacts/tests/" + stubId + "/" + version + ".json", HTTPMethod.PUT, projectId);
	}

	// Stores the specified adt to Firebase
	public static void writeADT(ADTInFirebase dto, long ADTId, int version, String projectId){
		enqueueWrite(dto.json(), "/artifacts/ADTs/" + ADTId + ".json", HTTPMethod.PUT, projectId);
		enqueueWrite("{ \".priority\": \""+System.currentTimeMillis()+"\" }", "/artifacts/ADTs/" + ADTId + ".json", HTTPMethod.PATCH, projectId);
		enqueueWrite(dto.json(), "/history/artifacts/ADTs/" + ADTId + "/" + version + ".json", HTTPMethod.PUT, projectId);
	}


	// Deletes the specified test in Firebase
	public static void deleteTest(long testID, String projectId){
		enqueueWrite("", "/artifacts/tests/" + testID + ".json", HTTPMethod.DELETE, projectId);
	}


	//stores worker information
	public static void writeWorker(WorkerInFirebase dto,
								   String userid, String projectId) {
		enqueueWrite(dto.json(), "/workers/" + userid + ".json", HTTPMethod.PATCH, projectId);
	}

	// Stores the specified review to firebase
	public static void writeReview(ReviewSubmissionInFirebase reviewSubmission, String microtaskKey , String projectId){
		System.out.println(reviewSubmission.json());
		enqueueWrite(reviewSubmission.json(), "/microtasks/" + microtaskKey + "/review.json", HTTPMethod.PUT, projectId);
	}

	public static void writeSetting(String name, String value, String projectId){
		enqueueWrite(value, "/status/settings/"+name+".json", HTTPMethod.PUT, projectId);
	}

	// Reads the ADTs for the specified project. If there are no ADTs, returns an empty string.
	public static String readADTs(String projectId){
		String result = readDataAbsolute("https://crowdcode.firebaseio.com/clientRequests/" + projectId + "/ADTs.json");
		if (result == null || result.equals("null"))
			result = "";
		return result;
	}


	public static void writeDesignDoc(DesignDocInFirebase dto, long DesignDocId, int version, String projectId){
		enqueueWrite(dto.json(), "/artifacts/DesignDoc/" + DesignDocId + ".json", HTTPMethod.PUT, projectId);
		enqueueWrite("{ \".priority\": \""+System.currentTimeMillis()+"\" }", "/artifacts/DesignDoc/" + DesignDocId + ".json", HTTPMethod.PATCH, projectId);
		enqueueWrite(dto.json(), "/history/artifacts/DesignDoc/" + DesignDocId + "/" + version + ".json", HTTPMethod.PUT, projectId);
	}

	// Copies the specified ADTs from the client request into the project
	public static void copyADTs(String projectId){
		String adts = readDataAbsolute("https://crowdcode.firebaseio.com/clientRequests/" + projectId + "/ADTs.json");
		if (adts == null || adts.equals("null"))
			adts = "";
		else
			enqueueWrite(adts, "/ADTs.json", HTTPMethod.PUT, projectId);
	}

	// Reads the functions for the specified project. If there are no functions, returns an empty string.
	public static String readClientRequest(String projectId){
		String result = readDataAbsolute("https://crowdcode2.firebaseio.com/clientRequests/" + projectId + ".json");
		if (result == null || result.equals("null"))
			result = "";
		System.out.println(result);
		return result;
	}

	public static void setPoints(String workerID, String workerDisplayName, int points, String projectId){
		System.out.println("SETTING POINTS TO WORKER " + workerDisplayName);
		enqueueWrite(Integer.toString(points), "/workers/" + workerID + "/score.json", HTTPMethod.PUT, projectId);
		LeaderboardEntry leader = new LeaderboardEntry(points, workerDisplayName);
		enqueueWrite(leader.json(), "/leaderboard/leaders/" + workerID + ".json", HTTPMethod.PUT, projectId);
	}

	public static void writeWorkerNotification(NotificationInFirebase notification, String workerID, String projectId){
		enqueueWrite(notification.json(), "/notifications/" + workerID + ".json", HTTPMethod.POST, projectId);
	}

	public static void writeLevelUpNotification(NotificationInFirebase notification, String workerID, String projectId){
		enqueueWrite(notification.json(), "/notifications/" + workerID + ".json", HTTPMethod.POST, projectId);
	}

	public static void writeAchievementNotification(NotificationInFirebase notification, String workerID, String projectId){
		enqueueWrite(notification.json(), "/notifications/" + workerID + ".json", HTTPMethod.POST, projectId);
	}

	public static void microtaskAssigned(String workerID, String projectId) {
		enqueueWrite("{\"fetchTime\" : \"" +System.currentTimeMillis() +"\"}", "/workers/" + workerID + ".json", HTTPMethod.PATCH, projectId);
	}


	// Writes information about microtask assignment to Firebase
	public static void writeMicrotaskPoints( String microtaskKey, int points, String projectId){
		enqueueWrite("{\"points\": " + points + "}", "/microtasks/" + microtaskKey + ".json", HTTPMethod.PATCH, projectId);
	}

	// Posts the specified JSON message to the specified workers newsfeed
	public static void postToNewsfeed(String workerID, String message, String microtaskKey, String projectId){
		enqueueWrite(message, "/workers/" + workerID + "/newsfeed/"+ microtaskKey +".json", HTTPMethod.PATCH, projectId);
	}
	// change the status of a challenge to the specified workers newsfeed
	public static void updateNewsfeed(String workerID, String data, String microtaskKey, String projectId){
		enqueueWrite(data, "/workers/" + workerID + "/newsfeed/"+ microtaskKey +".json", HTTPMethod.PATCH, projectId);
	}

	// Writes the specified question to firebase
	public static void writeQuestion(QuestionInFirebase dto, String projectId){
		enqueueWrite(dto.json(), "/questions/"+dto.id+".json", HTTPMethod.PATCH, projectId);
	}

	public static void writeQuestionVersion(QuestionInFirebase dto, String projectId){
		enqueueWrite(dto.json(), "/history/questions/" + dto.id + "/" + dto.version + ".json", HTTPMethod.PUT, projectId);
	}

	// Writes the specified question to firebase
	public static void writeAnswerCreated(AnswerInFirebase dto, String path, String projectId){
		enqueueWrite(dto.json(), path +".json", HTTPMethod.PATCH, projectId);
	}

	// Writes the specified question to firebase
	public static void writeCommentCreated(CommentInFirebase dto, String path, String projectId){
		enqueueWrite(dto.json(), path +".json", HTTPMethod.PATCH, projectId);
	}


	public static void updateQuestioningVoters(VotersIdInFirebase votersId, String path, String projectId)	{
		enqueueWrite(votersId.json(), path +".json", HTTPMethod.PATCH, projectId);
	}

	public static void updateQuestioningReporters(ReportersIdInFirebase reportersId, String path, String projectId){
		enqueueWrite(reportersId.json(), path +".json", HTTPMethod.PATCH, projectId);
	}

	public static void updateQuestioningScore(int score, String path, String projectId){
		enqueueWrite("{\"score\": " + score + "}", path +".json", HTTPMethod.PATCH, projectId);
	}

	public static void updateQuestioningSubscribers(SubscribersInFirebase subscribersId, String path, String projectId){
		enqueueWrite(subscribersId.json(), path +".json", HTTPMethod.PATCH, projectId);
	}

	public static void updateQuestioningLinkedArtifacts(ArtifactsIdInFirebase artifactsId, String path, String projectId){
		enqueueWrite(artifactsId.json(), path +".json", HTTPMethod.PATCH, projectId);
	}

	public static void updateQuestioningClosed(boolean closed, String path, String projectId){
		enqueueWrite("{ \"closed\": "+closed+" }", path +".json", HTTPMethod.PATCH, projectId);
	}

	public static void writeHistoryEvent(HistoryEvent event, String projectId){
		enqueueWrite( event.json() , "/history/events/"+event.generateID()+".json", HTTPMethod.PATCH, projectId);
	}

	// Clears all data in the current project, reseting it to an empty, initial state
	public static void clear(String projectID){
		writeDataAbsolute("{ \"" + projectID + "\" : null }","https://crowdcode2.firebaseio.com/projects/" + projectID + ".json", HTTPMethod.PUT);
	}

	// check if a project exists in firebase
	public static boolean existsProject(String projectID){
		String payload = readDataAbsolute("https://crowdcode2.firebaseio.com/clientRequests/" + projectID + ".json");
		return !payload.equals("null");
	}

	// check if the client request for a given projectId exists in firebase
	public static boolean existsClientRequest(String projectID){
		String payload = readDataAbsolute("https://crowdcode2.firebaseio.com/clientRequests/" + projectID + ".json");
		return !payload.equals("null");
	}






}
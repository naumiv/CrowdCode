package com.crowdcoding.commands;

import com.crowdcoding.entities.artifacts.DesignDoc;
import com.crowdcoding.servlets.ThreadContext;


public abstract class DesignDocCommand extends Command {
    protected long DesignDocId;

    // This function is called when a new DesignDoc must be created.
    public static DesignDocCommand create(String title, String description, boolean isApiArtifact, boolean isReadOnly) {
        return null;
    }

    private DesignDocCommand(Long DesignDocId) {
        this.DesignDocId = DesignDocId;
        queueCommand(this);
    }

    // All constructors for DesignDocCommand MUST call queueCommand and the end of
    // the constructor to add the
    // command to the queue.
    private static void queueCommand(Command command) {
        ThreadContext threadContext = ThreadContext.get();
        threadContext.addCommand(command);
    }

    public void execute(final String projectId) {
        if (DesignDocId != 0) {
            DesignDoc designDoc = DesignDoc.find(DesignDocId);

            if (designDoc == null)
                System.out
                        .println("error Cannot execute DesignDocCommand. Could not find DesignDoc for DesignDocID "
                                + DesignDocId);
            else {
                execute(designDoc, projectId);
            }
        } else
            execute(null, projectId);

    }

    public abstract void execute(DesignDoc DesignDoc, String projectId);


}
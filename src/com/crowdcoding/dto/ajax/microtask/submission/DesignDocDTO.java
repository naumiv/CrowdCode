package com.crowdcoding.dto.ajax.microtask.submission;

import com.crowdcoding.dto.DTO;


public class DesignDocDTO extends DTO {

    public String title;
    public String description;
    public boolean isReadOnly = false;

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public boolean isReadOnly() {
        return isReadOnly;
    }

}
package org.c4sg.constant;

import java.util.Optional;
public enum Status {

    ACTIVE("A"), PENDING("P"), DELETED("D");

    private String value;

    Status(String value) {
        this.value = value;
    }

    public String getValue() {
    	return value;
    }

    public static String getStatus(String status) {
		for (Status e : Status.values()) {
			if (e.getValue() == status.toUpperCase())
			{
				return e.name();
			}	
		}
		return PENDING.name();
    }
}

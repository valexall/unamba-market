package com.irissoft.app.generic;

import java.util.ArrayList;
import java.util.List;

public abstract class ResponseGeneric {
	private String type;
	public List<String> listMessage;
	
	public ResponseGeneric() {
		this.type = "error";
		this.listMessage = new ArrayList<>();
	}
	
	public String getType() {
		return this.type;
	}
	
	public void success() {
		this.type = "success";
	}
	
	public void warning() {
		this.type = "warning";
	}
	
	public void error() {
		this.type = "error";
	}
	
	public void exception() {
		this.type = "exception";
	}
}
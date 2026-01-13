package com.irissoft.app.controller.reqresp;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RequestUserProfileUpdate {
	private String firstName;
	private String lastName;
	private String phone;
	private String address;
	private String bio;
}

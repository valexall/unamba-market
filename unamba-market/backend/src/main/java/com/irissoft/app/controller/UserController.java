package com.irissoft.app.controller;

import java.security.Principal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.irissoft.app.business.UserBusiness;
import com.irissoft.app.controller.reqresp.RequestUserProfileUpdate;
import com.irissoft.app.dto.DtoUserProfile;
import com.irissoft.app.generic.ResponseGeneric;

@RestController
@RequestMapping("/user")
public class UserController {

	@Autowired
	private UserBusiness userBusiness;

	@GetMapping("/profile")
	public ResponseEntity<ResponseUserProfile> getProfile(Principal principal) {
		ResponseUserProfile response = new ResponseUserProfile();
		try {
			response.setProfile(this.userBusiness.getProfile(principal.getName()));
			response.success();
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			response.error();
			response.listMessage.add(e.getMessage());
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
		}
	}

	@PutMapping(value = "/profile", consumes = "multipart/form-data")
	public ResponseEntity<ResponseGeneric> updateProfile(
			@ModelAttribute RequestUserProfileUpdate request,
			@RequestParam(value = "avatar", required = false) MultipartFile avatar,
			Principal principal) {
		ResponseGeneric response = new ResponseGeneric() {};
		try {
			this.userBusiness.updateProfile(
					principal.getName(),
					request.getFirstName(),
					request.getLastName(),
					request.getPhone(),
					request.getAddress(),
					request.getBio(),
					avatar);
			response.success();
			response.listMessage.add("Perfil actualizado correctamente");
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			response.error();
			response.listMessage.add(e.getMessage());
			return ResponseEntity.badRequest().body(response);
		}
	}

	// Response classes
	public static class ResponseUserProfile extends ResponseGeneric {
		private DtoUserProfile profile;

		public DtoUserProfile getProfile() {
			return profile;
		}

		public void setProfile(DtoUserProfile profile) {
			this.profile = profile;
		}
	}
}

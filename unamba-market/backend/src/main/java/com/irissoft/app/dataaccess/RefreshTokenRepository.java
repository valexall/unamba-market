package com.irissoft.app.dataaccess;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.irissoft.app.entity.RefreshToken;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {
	
	Optional<RefreshToken> findByToken(String token);
	
	@Modifying
	@Query("DELETE FROM RefreshToken rt WHERE rt.user.idUser = :userId")
	void deleteByUserId(String userId);
	
	@Modifying
	@Query("UPDATE RefreshToken rt SET rt.revoked = true WHERE rt.user.idUser = :userId")
	void revokeAllByUserId(String userId);
}

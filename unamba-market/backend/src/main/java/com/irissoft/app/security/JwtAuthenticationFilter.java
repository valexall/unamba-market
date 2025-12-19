package com.irissoft.app.security;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.irissoft.app.dataaccess.UserRepository;
import com.irissoft.app.entity.User;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtService jwtService;
	private final UserRepository userRepository;

	@Override
	protected void doFilterInternal(
			@NonNull HttpServletRequest request,
			@NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain
	) throws ServletException, IOException {

		final String authHeader = request.getHeader("Authorization");
		final String jwt;
		final String userEmail;

		if (authHeader == null || !authHeader.startsWith("Bearer ")) {
			filterChain.doFilter(request, response);
			return;
		}

		jwt = authHeader.substring(7);
		try {
			userEmail = jwtService.extractUsername(jwt);

			if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
				Optional<User> userOptional = userRepository.findByEmail(userEmail);

				if (userOptional.isPresent()) {
					User user = userOptional.get();

					if (jwtService.isTokenValid(jwt, user.getEmail())) {
						List<SimpleGrantedAuthority> authorities = new ArrayList<>();
						authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole()));

						UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
								user.getEmail(), null, authorities);

						authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
						SecurityContextHolder.getContext().setAuthentication(authToken);
					}
				}
			}
		} catch (Exception e) {
			System.out.println("Error en token JWT: " + e.getMessage());
		}

		filterChain.doFilter(request, response);
	}
}
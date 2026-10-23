
package no.oskar.taskflow.service;

import no.oskar.taskflow.AppUser;
import no.oskar.taskflow.repository.AppUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AppUser register(String email, String password) {
        String normalizedEmail = email.trim().toLowerCase();

        if (appUserRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "E-postadressen er allerede registrert."
            );
        }

        AppUser user = new AppUser(
                normalizedEmail,
                passwordEncoder.encode(password)
        );

        return appUserRepository.save(user);
    }


    public String login(String email, String password) {

        String normalizedEmail = email.trim().toLowerCase();

        var optionalUser = appUserRepository.findByEmail(normalizedEmail);

        if (optionalUser.isEmpty()) {
            throw new IllegalArgumentException(
                    "Ugyldig e-post eller passord."
            );
        }

        AppUser user = optionalUser.get();
        boolean passwordMatches =
                passwordEncoder.matches(password, user.getPassword());

        if (!passwordMatches) {
            throw new IllegalArgumentException(
                    "Ugyldig e-post eller passord."
            );
        }
        return jwtService.generateToken(user.getEmail());
    }

}

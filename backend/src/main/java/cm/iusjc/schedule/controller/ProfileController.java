package cm.iusjc.schedule.controller;

import cm.iusjc.schedule.model.dto.response.ApiResponse;
import cm.iusjc.schedule.model.dto.UserProfileResponse;
import cm.iusjc.schedule.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
public class ProfileController {
    
    private final ProfileService profileService;
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserProfileResponse>>> searchProfiles(
            @RequestParam String query) {
        try {
            List<UserProfileResponse> profiles = profileService.searchProfiles(query);
            return ResponseEntity.ok(ApiResponse.success(profiles));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @PathVariable UUID userId) {
        try {
            UserProfileResponse profile = profileService.getProfile(userId);
            return ResponseEntity.ok(ApiResponse.success(profile));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}

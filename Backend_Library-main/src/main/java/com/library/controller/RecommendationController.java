package com.library.controller;

import com.library.dto.BookDTO;
import com.library.service.UserService;
import com.library.service.impl.RecommendationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/recommend")
public class RecommendationController {

    private final RecommendationService service;
    private final UserService userService;

    public RecommendationController(RecommendationService service, UserService userService) {
        this.service = service;
        this.userService = userService;
    }

    @GetMapping("/{userId}")
    public List<BookDTO> recommend(@PathVariable int userId) {
        List<Integer> ids = service.getRecommendations(userId);
        return ids.stream()
                .map(id -> {
                    try { return userService.getBookById(id); }
                    catch (Exception e) { return null; }
                })
                .filter(java.util.Objects::nonNull)
                .toList();
    }
}

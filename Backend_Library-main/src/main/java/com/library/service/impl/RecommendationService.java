package com.library.service.impl;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.List;

@Service
public class RecommendationService {

    private final WebClient webClient = WebClient.create("http://localhost:8000");

    public static class PyResponse {
        public int user_id;
        public List<Integer> recommended_book_ids;
    }

    public List<Integer> getRecommendations(int userId) {
        try {
            PyResponse res = webClient.get()
                    .uri("/recommend/user/{id}", userId)
                    .retrieve()
                    .bodyToMono(PyResponse.class)
                    .block();
            return res != null && res.recommended_book_ids != null ? res.recommended_book_ids : List.of();
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }
}

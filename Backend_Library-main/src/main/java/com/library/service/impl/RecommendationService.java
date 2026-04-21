package com.library.service.impl;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class RecommendationService {

    private final WebClient webClient = WebClient.create("http://localhost:8000");

    public String getRecommendations(int userId) {
        return webClient.get()
                .uri("/recommend/user/{id}", userId)
                .retrieve()
                .bodyToMono(String.class)
                .block(); // blocking for simplicity
    }
}

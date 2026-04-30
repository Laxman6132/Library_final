package com.library.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Expose the "uploads/qr" directory so that it can be accessed via HTTP.
        Path qrUploadDir = Paths.get("uploads/qr");
        String qrUploadPath = qrUploadDir.toFile().getAbsolutePath();
        
        registry.addResourceHandler("/qr/**")
                .addResourceLocations("file:/" + qrUploadPath + "/");
    }
}

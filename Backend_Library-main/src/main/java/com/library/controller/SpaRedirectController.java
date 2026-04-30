package com.library.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaRedirectController {

    // Match all GET requests that don't match an API endpoint or static resource
    // This allows React Router to handle the routing on the client side
    @RequestMapping(value = {
        "/",
        "/login",
        "/register",
        "/dashboard",
        "/issued",
        "/favourites",
        "/waiting-list",
        "/librarian/**",
        "/admin/**",
        "/books/**",
        "/home"
    })
    public String redirect() {
        // Forward to the static index.html
        return "forward:/index.html";
    }
}

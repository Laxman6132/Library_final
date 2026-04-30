package com.library.controller;

import com.library.entity.FineRule;
import com.library.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
@CrossOrigin(origins = "http://localhost:5173")

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // ================= BOOK MANAGEMENT =================

    @DeleteMapping("/book/{bookId}")
    public ResponseEntity<String> deleteBookById(@PathVariable int bookId) {
        adminService.deleteBookById(bookId);
        return ResponseEntity.ok("Book and all related data deleted successfully");
    }

    @DeleteMapping("/books")
    public ResponseEntity<String> deleteAllBooks() {
        adminService.deleteAllBooks();
        return ResponseEntity.ok("All books deleted successfully");
    }

    // ================= ROLE MANAGEMENT =================

    @PutMapping("/role/librarian/{userId}")
    public ResponseEntity<String> makeLibrarian(@PathVariable int userId) {
        adminService.changeLibrarian(userId);
        return ResponseEntity.ok("User promoted to LIBRARIAN");
    }

    @PutMapping("/role/admin/{userId}")
    public ResponseEntity<String> makeAdmin(@PathVariable int userId) {
        adminService.changeAdmin(userId);
        return ResponseEntity.ok("User promoted to ADMIN");
    }

    // ================= FINE RULE MANAGEMENT =================

    @PutMapping("/fine-rule/{ruleId}")
    public ResponseEntity<String> updateFineRule(
            @PathVariable int ruleId,
            @RequestBody FineRule rule
    ) {
        adminService.changeFineRule(ruleId, rule);
        return ResponseEntity.ok("Fine rule updated successfully");
    }

    @PostMapping("/RegenerateQR/{userId}")
    public String qrRegenerate(@PathVariable int userId){
        adminService.qrRegeneration(userId);
        return "QRRegeneration was succesfull.";
    }
    @PostMapping("/GenerateForAllBooks")
    public String qrForAllBook(){
        adminService.generateQrForAllBook();
        return "success";
    }
    @PostMapping("/GenerateForAllUsers")
    public String qrForAllUser(){
        adminService.generateQRForAllUser();
        return "success";
    }
}
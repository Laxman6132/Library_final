package com.library.service;

import com.library.entity.FineRule;

public interface AdminService {

    //   Book Functions

    void deleteBookById(int bookId);
    void deleteAllBooks();

    //   Role Functions

    void changeLibrarian(int userId);
    void changeAdmin(int userId);

    //   Fine Functions

    void changeFineRule(int ruleId, FineRule rule);
    void qrRegeneration(int userId);
    void generateQrForAllBook();
    void generateQRForAllUser();
}

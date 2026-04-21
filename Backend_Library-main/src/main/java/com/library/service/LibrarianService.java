package com.library.service;

import com.library.entity.Book;
import com.library.entity.User;

import java.util.List;

public interface LibrarianService {

    //   Book Function

    void addBook(Book book);
    void updateBook(int bookId, Book book);
    boolean issueBook(int userId,int bookId);
    void returnBook(int issuedBookId);

    //   User Function

    User getUserById(int userId);
    List<User> getAllUser();

}

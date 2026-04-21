package com.library.service.impl;

import com.library.entity.*;
import com.library.repository.*;
import com.library.service.LibrarianService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.library.util.QRGenerator;


import java.time.LocalDateTime;
import java.util.List;

@Service
public class LibrarianServiceImpl implements LibrarianService {
    @Autowired
    BookRepository bookRepo;
    @Autowired
    UserRepository userRepo;
    @Autowired
    IssuedBookRepository issuedBookRepo;
    @Autowired
    WaitingListRepository wlRepo;
    @Autowired
    FavouriteRepository favourRepo;
    @Autowired
    ReviewRepository reviewRepo;
    @Autowired
    FineRuleRepository fineRepo;
    @Autowired
    QRGenerator qrGenerator;
    @Override
    public void addBook(Book book) {
        bookRepo.save(book);
        String qrPath = qrGenerator.generateBookQR(book.getBookId(), book.getIsbn());
        book.setQrCode(qrPath);
        bookRepo.save(book);
    }

    @Override
    public void updateBook(int bookId, Book book) {
        Book book1 = bookRepo.findById(bookId).get();
        book1.setTitle(book.getTitle());
        book1.setDescription(book.getDescription());
        book1.setAuthor(book.getAuthor());
        book1.setGenre(book.getGenre());
        book1.setIsbn(book.getIsbn());
        book1.setAvailableCopies(book.getAvailableCopies());
        book1.setTotalCopies(book.getTotalCopies());
        bookRepo.save(book1);
    }

    @Override
    public boolean issueBook(int userId, int bookId) {

        User user = userRepo.findById(userId).get();
        Book book = bookRepo.findById(bookId).get();

//        if (user.getFine() > 0 || book.getAvailableCopies()<=0) {
//            return false;
//        }
//        List<IssuedBook> issuedList = issuedBookRepo.findByUserUserId(userId);
//        for (IssuedBook ib : issuedList) {
//            if (!ib.isReturned() && ib.getBook().getBookId() == bookId) {
//                return false;
//            }
//        }
        FineRule fine = fineRepo.findAll().get(0);
        IssuedBook issuedBook = new IssuedBook();
        issuedBook.setBook(book);
        issuedBook.setUser(user);
        issuedBook.setIssueDate(LocalDateTime.now());
        issuedBook.setDueDate(LocalDateTime.now().plusDays(fine.getOverdueDays()));
        issuedBook.setReturned(false);
        issuedBook.setReturnDate(null);
        issuedBookRepo.save(issuedBook);
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepo.save(book);

        return true;
    }

    @Override
    public void returnBook(int issuedBookId) {

        IssuedBook issuedBook = issuedBookRepo.findById(issuedBookId).get();

        Book book = issuedBook.getBook();
        issuedBook.setReturned(true);
        issuedBook.setReturnDate(LocalDateTime.now());

        issuedBookRepo.save(issuedBook);

        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepo.save(book);

        List<WaitingList> list = wlRepo.findByBookBookId(book.getBookId());

        if (list.size() > 0) {

            WaitingList first = list.get(0);

            User user = first.getUser();

            FineRule fine = fineRepo.findAll().get(0);

            IssuedBook newIssue = new IssuedBook();
            newIssue.setBook(book);
            newIssue.setUser(user);
            newIssue.setIssueDate(LocalDateTime.now());
            newIssue.setDueDate(LocalDateTime.now().plusDays(fine.getOverdueDays()));
            newIssue.setReturned(false);

            issuedBookRepo.save(newIssue);

            book.setAvailableCopies(book.getAvailableCopies() - 1);
            bookRepo.save(book);

            wlRepo.deleteById(first.getWaitingListId());

            List<WaitingList> remaining = wlRepo.findByBookBookId(book.getBookId());

            int pos = 1;
            for (WaitingList w : remaining) {
                w.setPosition(pos);
                wlRepo.save(w);
                pos++;
            }
        }
    }

    @Override
    public User getUserById(int userId) {
        return userRepo.findById(userId).get();
    }

    @Override
    public List<User> getAllUser() {
        return userRepo.findAll();
    }
}

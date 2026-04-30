package com.library.service.impl;

import com.library.entity.*;
import com.library.repository.*;
import com.library.service.AdminService;
import com.library.util.QRGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {
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
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void deleteBookById(int bookId) {
        Book book = bookRepo.findById(bookId).get();
        List<WaitingList> wl = wlRepo.findByBookBookId(bookId);
        for(WaitingList a: wl){
            wlRepo.deleteById(a.getWaitingListId());
        }
        List<Favourite> list = favourRepo.findByBookBookId(bookId);
        for (Favourite b: list){
            favourRepo.deleteById(b.getFavouriteId());
        }
        List<Review> reviews = reviewRepo.findByBookBookId(bookId);
        for(Review d: reviews){
            reviewRepo.deleteById(d.getReviewId());
        }
        bookRepo.deleteById(bookId);
    }

    @Override
    public void deleteAllBooks() {
        bookRepo.deleteAll();
    }

    @Override
    public void changeLibrarian(int userId) {
        User user = userRepo.findById(userId).get();
        user.setRole("LIBRARIAN");
        userRepo.save(user);
    }

    @Override
    public void changeAdmin(int userId) {
        User user = userRepo.findById(userId).get();
        user.setRole("ADMIN");
        userRepo.save(user);
    }

    @Override
    public void changeFineRule(int ruleId, FineRule rule) {
        FineRule fine = fineRepo.findById(ruleId).get();
        fine.setFineAmountPerDay(rule.getFineAmountPerDay());
        fine.setOverdueDays(rule.getOverdueDays());
        fineRepo.save(fine);
    }

    @Override
    public void qrRegeneration(int userId) {
        User user = userRepo.findById(userId).get();
        String token = qrGenerator.generateToken();
        String qrPath = qrGenerator.generateUserQR(user.getUserId(),token);
        user.setQrToken(token);
        user.setQrCode(qrPath);
        userRepo.save(user);
    }

    @Override
    public void generateQrForAllBook() {
        List<Book> books = bookRepo.findAll();
        for(Book b: books){
            String qrPath = qrGenerator.generateBookQR(b.getBookId(), b.getIsbn());
            b.setQrCode(qrPath);
            bookRepo.save(b);
        }
    }

    @Override
    public void generateQRForAllUser() {
        List<User> list = userRepo.findAll();
        for(User user: list){
            String token = QRGenerator.generateToken();
            user.setQrToken(token);

            User saved = userRepo.save(user);

            String qr = QRGenerator.generateUserQR(saved.getUserId(), token);
            saved.setQrCode(qr);

            userRepo.save(saved);
        }
    }



}

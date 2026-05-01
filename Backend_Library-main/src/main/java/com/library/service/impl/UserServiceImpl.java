package com.library.service.impl;

import com.library.dto.*;
import com.library.entity.*;
import com.library.repository.*;
import com.library.service.UserService;
import com.library.util.QRGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired private BookRepository bookRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private IssuedBookRepository issuedBookRepo;
    @Autowired private WaitingListRepository wlRepo;
    @Autowired private FavouriteRepository favourRepo;
    @Autowired private ReviewRepository reviewRepo;
    @Autowired private FineRuleRepository fineRepo;
    @Autowired private PasswordEncoder passwordEncoder;

    // ================= BOOK =================
    @Override
    public void bcrpt(){
        List<User> list = userRepo.findAll();
        for(User user: list){
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            userRepo.save(user);
        }
    }
    @Override
    public List<BookDTO> getAllBook() {
        return bookRepo.findAll().stream().map(this::mapBook).toList();
    }

    @Override
    public Page<BookDTO> getBooksPaginated(Pageable pageable) {
        return bookRepo.findAll(pageable).map(this::mapBook);
    }

    @Override
    public BookDTO getBookById(int bookId) {
        return mapBook(bookRepo.findById(bookId).get());
    }

    @Override
    public List<BookDTO> getBooksByGenre(String genre) {
        return bookRepo.findByGenre(genre).stream().map(this::mapBook).toList();
    }

    @Override
    public List<BookDTO> getBooksByPrefix(String search) {
        return bookRepo.findByTitleStartingWithIgnoreCase(search)
                .stream().map(this::mapBook).toList();
    }

    // ================= ISSUED =================

    @Override
    public List<IssuedBookDTO> getIssuedBookById(int userId) {
        return issuedBookRepo.findByUserUserId(userId)
                .stream().map(this::mapIssued).toList();
    }

    // ================= WAITING LIST =================

    @Override
    public boolean addWL(int userId, int bookId) {
        User user = userRepo.findById(userId).get();
        Book book = bookRepo.findById(bookId).get();

        List<WaitingList> list = wlRepo.findByBookBookId(bookId);

        for (WaitingList wl : list) {
            if (wl.getUser().getUserId() == userId) return false;
        }

        WaitingList wl = new WaitingList();
        wl.setUser(user);
        wl.setBook(book);
        wl.setRequestDate(LocalDateTime.now());
        wl.setPosition(list.size() + 1);

        wlRepo.save(wl);
        return true;
    }

    @Override
    public void deleteWL(int wlId) {
        wlRepo.deleteById(wlId);
    }

    @Override
    public List<WaitingListDTO> getWaitingListById(int userId) {
        return wlRepo.findByUserUserId(userId)
                .stream().map(this::mapWaiting).toList();
    }

    // ================= FAVOURITE =================

    @Override
    public void addFavourite(int userId, int bookId) {
        Favourite fav = new Favourite();
        fav.setUser(userRepo.findById(userId).get());
        fav.setBook(bookRepo.findById(bookId).get());
        fav.setAddedDate(LocalDateTime.now());
        favourRepo.save(fav);
    }

    @Override
    public void deleteFavourite(int favouriteId) {
        favourRepo.deleteById(favouriteId);
    }

    @Override
    public List<FavouriteDTO> getFavouritesById(int userId) {
        return favourRepo.findByUserUserId(userId)
                .stream().map(this::mapFavourite).toList();
    }

    // ================= REVIEW =================

    @Override
    public void addReview(int rating, String comment, int userId, int bookId) {
        Review r = new Review();
        r.setRating(rating);
        r.setComment(comment);
        r.setUser(userRepo.findById(userId).get());
        r.setBook(bookRepo.findById(bookId).get());
        r.setTime(LocalDateTime.now());

        reviewRepo.save(r);
    }

    @Override
    public void updateReview(int reviewId, ReviewDTO dto) {
        Review r = reviewRepo.findById(reviewId).get();

        r.setRating(dto.getRating());
        r.setComment(dto.getComment());
        r.setTime(dto.getTime());

        reviewRepo.save(r);
    }

    @Override
    public void deleteReview(int reviewId) {
        reviewRepo.deleteById(reviewId);
    }

    // ================= USER =================

    @Override
    public void addUser(UserDTO dto) {
        User user = new User();

        user.setUserName(dto.getUserName());
        user.setEmailId(dto.getEmailId());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        List<User> list = userRepo.findAll();
        if(list.size()==0) {
            user.setRole("Admin");
        } else {
            user.setRole("User");
        }
        user.setGender(dto.getGender());
        user.setAddress(dto.getAddress());
        user.setPhNo(dto.getPhNo() != null ? dto.getPhNo() : 0L);

        String token = QRGenerator.generateToken();
        user.setQrToken(token);

        User saved = userRepo.save(user);

        String qr = QRGenerator.generateUserQR(saved.getUserId(), token);
        saved.setQrCode(qr);

        userRepo.save(saved);
    }

    @Override
    public void updateUser(int userId, UserDTO dto) {
        User user = userRepo.findById(userId).get();

        user.setUserName(dto.getUserName());
        user.setEmailId(dto.getEmailId());
        user.setGender(dto.getGender());
        user.setAddress(dto.getAddress());
        user.setPhNo(dto.getPhNo() != null ? dto.getPhNo() : 0L);

        userRepo.save(user);
    }

    @Override
    public void deleteUser(int userId) {
        List<User> list = userRepo.findByRole("Admin");
        if(list.size()<=1) return;
        userRepo.deleteById(userId);
    }

    @Override
    public UserDTO getUserById(int userId) {
        User user = userRepo.findById(userId).get();
        return mapUser(user);
    }

    @Override
    public List<UserDTO> getAllUsers() {

        return userRepo.findAll().stream().map(this::mapUser).toList();
    }

    // ================= FINE =================

    @Override
    public void payFine(int userId) {
        User user = userRepo.findById(userId).get();
        user.setFine(0);
        userRepo.save(user);
    }

    @Override
    public float calculateFine(int userId) {
        FineRule fine = fineRepo.findAll().get(0);

        return (float) issuedBookRepo.findByUserUserId(userId).stream()
                .filter(i -> !i.isReturned() && LocalDateTime.now().isAfter(i.getDueDate()))
                .mapToLong(i -> java.time.temporal.ChronoUnit.DAYS.between(
                        i.getDueDate().toLocalDate(), LocalDate.now()))
                .sum() * fine.getFineAmountPerDay();
    }

    @Override
    public float calculateFinePerBook(int issueBookId) {
        IssuedBook ib = issuedBookRepo.findById(issueBookId).get();
        FineRule fine = fineRepo.findAll().get(0);

        if (LocalDateTime.now().isAfter(ib.getDueDate())) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(
                    ib.getDueDate().toLocalDate(), LocalDate.now());
            return days * fine.getFineAmountPerDay();
        }
        return 0;
    }

    // ================ Filters =================

    @Override
    public List<BookDTO> popularBooks() {
        return bookRepo.findAll().stream()
                .sorted((b1, b2) -> Double.compare(b2.getRating(), b1.getRating()))
                .limit(10)
                .map(this::mapBook)
                .toList();
    }

    @Override
    public List<BookDTO> latestBooks() {
        return bookRepo.findAll().stream()
                .sorted((b1, b2) -> Integer.compare(b2.getBookId(), b1.getBookId()))
                .limit(10)
                .map(this::mapBook)
                .toList();
    }

    @Override
    public List<BookDTO> recentBooks() {
        // Uses a derived query — no findAll(), only fetches top 30 rows from DB
        return bookRepo.findTop30ByOrderByBookIdDesc()
                .stream().map(this::mapBook).toList();
    }

    @Override
    public List<BookDTO> filterBooks(String title, String author, String genre, Double minRating, Integer minPages, Integer maxPages, Integer availableCopies) {
        List<Book> books;
        
        if (author != null && !author.isEmpty() && minRating != null) {
            books = bookRepo.findByAuthorContainingIgnoreCaseAndRatingGreaterThanEqual(author, minRating);
        } else if (genre != null && !genre.isEmpty() && availableCopies != null) {
            books = bookRepo.findByGenres_NameIgnoreCaseAndAvailableCopiesGreaterThan(genre, availableCopies);
        } else if (title != null && !title.isEmpty()) {
            books = bookRepo.findByTitleContainingIgnoreCase(title);
        } else if (author != null && !author.isEmpty()) {
            books = bookRepo.findByAuthorContainingIgnoreCase(author);
        } else if (genre != null && !genre.isEmpty()) {
            books = bookRepo.findByGenres_NameIgnoreCase(genre);
        } else if (minRating != null) {
            books = bookRepo.findByRatingGreaterThanEqual(minRating);
        } else if (minPages != null && maxPages != null) {
            books = bookRepo.findByPagesBetween(minPages, maxPages);
        } else if (availableCopies != null) {
            books = bookRepo.findByAvailableCopiesGreaterThan(availableCopies);
        } else {
            books = bookRepo.findAll();
        }

        return books.stream()
                .filter(b -> title == null || title.isEmpty() || (b.getTitle() != null && b.getTitle().toLowerCase().contains(title.toLowerCase())))
                .filter(b -> author == null || author.isEmpty() || (b.getAuthor() != null && b.getAuthor().toLowerCase().contains(author.toLowerCase())))
                .filter(b -> genre == null || genre.isEmpty() || (b.getGenre() != null && b.getGenre().stream().anyMatch(g -> g.getName().equalsIgnoreCase(genre))))
                .filter(b -> minRating == null || b.getRating() >= minRating)
                .filter(b -> minPages == null || b.getPages() >= minPages)
                .filter(b -> maxPages == null || b.getPages() <= maxPages)
                .filter(b -> availableCopies == null || b.getAvailableCopies() > availableCopies)
                .map(this::mapBook)
                .toList();
    }

    // ================= MAPPERS =================

    private BookDTO mapBook(Book b) {
        BookDTO dto = new BookDTO();
        dto.setBookId(b.getBookId());
        dto.setTitle(b.getTitle());
        dto.setDescription(b.getDescription());
        dto.setGenre(b.getGenre());
        dto.setAvailableCopies(b.getAvailableCopies());
        dto.setTotalCopies(b.getTotalCopies());
        dto.setIsbn(b.getIsbn());
        dto.setQrCode(b.getQrCode());
        dto.setAuthor(b.getAuthor());
        dto.setPages(b.getPages());
        dto.setImage(b.getImage());

        dto.setFavourites(b.getFavourites() == null ? List.of() :
                b.getFavourites().stream().map(this::mapFavourite).toList());

        dto.setReviews(b.getReviews() == null ? List.of() :
                b.getReviews().stream().map(this::mapReview).toList());

        return dto;
    }

    private FavouriteDTO mapFavourite(Favourite f) {
        FavouriteDTO dto = new FavouriteDTO();
        dto.setFavouriteId(f.getFavouriteId());
        dto.setUserId(f.getUser().getUserId());
        dto.setBookId(f.getBook().getBookId());
        dto.setAddedDate(f.getAddedDate());
        return dto;
    }

    private ReviewDTO mapReview(Review r) {
        ReviewDTO dto = new ReviewDTO();
        dto.setReviewId(r.getReviewId());
        dto.setRating(r.getRating());
        dto.setComment(r.getComment());
        dto.setTime(r.getTime());
        dto.setUserId(r.getUser().getUserId());
        dto.setUserName(r.getUser().getUserName());
        return dto;
    }

    private IssuedBookDTO mapIssued(IssuedBook i) {
        IssuedBookDTO dto = new IssuedBookDTO();
        dto.setIssueId(i.getIssueId());
        dto.setUserId(i.getUser().getUserId());
        dto.setBookId(i.getBook().getBookId());
        dto.setIssueDate(i.getIssueDate());
        dto.setDueDate(i.getDueDate());
        dto.setReturnDate(i.getReturnDate());
        dto.setReturned(i.isReturned());
        return dto;
    }

    private WaitingListDTO mapWaiting(WaitingList w) {
        WaitingListDTO dto = new WaitingListDTO();
        dto.setWaitingListId(w.getWaitingListId());
        dto.setUserId(w.getUser().getUserId());
        dto.setBookId(w.getBook().getBookId());
        dto.setRequestDate(w.getRequestDate());
        dto.setPosition(w.getPosition());
        return dto;
    }

    private UserDTO mapUser(User u) {
        UserDTO dto = new UserDTO();
        dto.setUserId(u.getUserId());
        dto.setUserName(u.getUserName());
        dto.setEmailId(u.getEmailId());
        dto.setRole(u.getRole());
        dto.setGender(u.getGender());
        dto.setAddress(u.getAddress());
        dto.setPhNo(u.getPhNo());
        dto.setFine(u.getFine());
        dto.setQrCode(u.getQrCode());
        return dto;
    }
}
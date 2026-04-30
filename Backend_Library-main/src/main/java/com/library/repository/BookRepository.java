package com.library.repository;

import com.library.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book,Integer> {
    @Query("SELECT b FROM Book b JOIN b.genres g WHERE g.name = :genre")
    List<Book> findByGenre(@Param("genre") String genre);
    List<Book> findByAuthorIgnoreCase(String author);
    List<Book> findByTitleStartingWithIgnoreCase(String search);
    // search by title
    List<Book> findByTitleContainingIgnoreCase(String title);

    // search by author
    List<Book> findByAuthorContainingIgnoreCase(String author);

    // search by genre name (ManyToMany)
    List<Book> findByGenres_NameIgnoreCase(String name);

    // filter by rating
    List<Book> findByRatingGreaterThanEqual(double rating);

    // filter by pages range
    List<Book> findByPagesBetween(int min, int max);

    // available books only
    List<Book> findByAvailableCopiesGreaterThan(int count);

    // combine simple filters
    List<Book> findByAuthorContainingIgnoreCaseAndRatingGreaterThanEqual(
            String author, double rating);

    List<Book> findByGenres_NameIgnoreCaseAndAvailableCopiesGreaterThan(
            String genre, int count);

    // find by ISBN
    Optional<Book> findByIsbn(String isbn);

    // recent 30 books only — used by admin/librarian dashboards to avoid loading 5000+ books
    List<Book> findTop30ByOrderByBookIdDesc();
}

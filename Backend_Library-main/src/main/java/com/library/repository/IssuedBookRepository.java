package com.library.repository;

import com.library.entity.IssuedBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IssuedBookRepository extends JpaRepository<IssuedBook,Integer> {
    List<IssuedBook> findByUserUserId(int userId);
}
